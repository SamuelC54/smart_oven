# --- Hardware imports with error handling ---
try:
    import board
    import busio
    import digitalio
    import adafruit_max31865
    HARDWARE_AVAILABLE = True
    CIRCUITPYTHON_AVAILABLE = True
except ImportError as e:
    HARDWARE_AVAILABLE = False
    CIRCUITPYTHON_AVAILABLE = False
except Exception as e:
    HARDWARE_AVAILABLE = False
    CIRCUITPYTHON_AVAILABLE = False

# Import logger after hardware imports to avoid circular imports
from logger import logger

# Now log the hardware status
if HARDWARE_AVAILABLE:
    logger.info("CircuitPython libraries imported successfully")
else:
    logger.error("Failed to import CircuitPython libraries")

if CIRCUITPYTHON_AVAILABLE:
    logger.info("CircuitPython libraries available")
else:
    logger.info("CircuitPython libraries not available")

# Import config after hardware imports
from config import RTD_NOMINAL, REF_RESISTOR, WIRES, CS_NAME

# --- Global sensor instance ---
_sensor = None
class MAX31865Adafruit:
    """MAX31865 implementation using Adafruit CircuitPython library"""
    
    def __init__(self, rtd_nominal=100, ref_resistor=430, wires=3):
        # Store configuration parameters
        self.rtd_nominal = rtd_nominal
        self.ref_resistor = ref_resistor
        self.wires = wires
        
        # Create sensor object, communicating over the board's default SPI bus
        self.spi = busio.SPI(board.SCLK, MOSI=board.MOSI, MISO=board.MISO)
        
        # Initialize CS pin
        self.cs = digitalio.DigitalInOut(board.D16)  # GPIO 16
        
        # Initialize the MAX31865 sensor
        self.sensor = adafruit_max31865.MAX31865(
            self.spi, 
            self.cs, 
            rtd_nominal=self.rtd_nominal, 
            ref_resistor=self.ref_resistor, 
            wires=self.wires
        )
        
        logger.info(f"MAX31865 initialized with CS=GPIO16, wires={self.wires}")
        logger.info(f"RTD nominal: {self.rtd_nominal}Ω, Ref resistor: {self.ref_resistor}Ω")
        
        # Log configuration for debugging
        if self.rtd_nominal == 100:
            logger.info("Configured for PT100 sensor")
        elif self.rtd_nominal == 1000:
            logger.info("Configured for PT1000 sensor")
        else:
            logger.warning(f"Unknown RTD nominal value: {self.rtd_nominal}Ω")
    
    def temperature(self):
        """Get temperature in Celsius"""
        try:
            # Read temperature
            temp = self.sensor.temperature
            logger.info(f"Temperature: {temp:.3f}°C")
            
            # Check for invalid readings and log sensor state
            if temp < -200 or temp > 850:
                logger.warning(f"Invalid temperature reading: {temp:.3f}°C")
                try:
                    # Try to get sensor fault status
                    fault = self.sensor.fault
                    if fault:
                        logger.error(f"MAX31865 fault detected: {fault}")
                except:
                    pass
                logger.warning("Check wiring and sensor configuration")
            
            return temp
        except Exception as e:
            logger.error(f"Error reading temperature: {e}")
            raise
    
    def close(self):
        """Clean up resources"""
        if hasattr(self, 'cs'):
            self.cs.deinit()

def get_sensor():
    global _sensor
    if not HARDWARE_AVAILABLE:
        raise Exception("Hardware libraries not available")
    
    if _sensor is None:
        logger.info("Initializing SPI and sensor...")
        try:
            # Use Adafruit CircuitPython implementation
            _sensor = MAX31865Adafruit(
                rtd_nominal=RTD_NOMINAL, 
                ref_resistor=REF_RESISTOR, 
                wires=WIRES
            )
            logger.info("Sensor initialized successfully using Adafruit CircuitPython")
        except Exception as e:
            logger.error(f"Failed to initialize sensor: {e}")
            raise
    
    return _sensor

def set_gpio(pin: int, state: bool):
    if not HARDWARE_AVAILABLE:
        raise Exception("Hardware libraries not available")
    
    try:
        # Map pin number to board pin
        if pin == 18:
            gpio_pin = board.D18
        elif pin == 23:
            gpio_pin = board.D23
        elif pin == 24:
            gpio_pin = board.D24
        elif pin == 25:
            gpio_pin = board.D25
        else:
            raise ValueError(f"Unsupported GPIO pin: {pin}. Supported pins: 18, 23, 24, 25")
        
        # Create GPIO object with proper cleanup
        pin_obj = digitalio.DigitalInOut(gpio_pin)
        pin_obj.direction = digitalio.Direction.OUTPUT
        pin_obj.value = state
        
        # Clean up the pin object to avoid "busy" errors
        pin_obj.deinit()
        
        logger.info(f"GPIO {pin} set to {state}")
        return True
        
    except PermissionError as e:
        error_msg = f"Permission denied accessing GPIO {pin}. Check if running with proper privileges or if GPIO device is accessible."
        logger.error(error_msg)
        raise Exception(error_msg)
    except OSError as e:
        if "busy" in str(e).lower():
            error_msg = f"GPIO {pin} is busy or already in use. Try a different pin or check for conflicting processes."
        elif "no such file or directory" in str(e).lower():
            error_msg = f"GPIO {pin} device not found. Check if GPIO hardware is available and properly configured."
        else:
            error_msg = f"OS error accessing GPIO {pin}: {e}"
        logger.error(error_msg)
        raise Exception(error_msg)
    except Exception as e:
        logger.error(f"Failed to set GPIO {pin}: {e}")
        raise Exception(f"GPIO operation failed: {e}")

def diagnose_gpio_access():
    """Diagnose GPIO access issues and return detailed information"""
    diagnostics = {
        "hardware_available": HARDWARE_AVAILABLE,
        "circuitpython_available": CIRCUITPYTHON_AVAILABLE,
        "tests": {}
    }
    
    if not HARDWARE_AVAILABLE:
        diagnostics["error"] = "Hardware libraries not available"
        return diagnostics
    
    # Test basic imports
    try:
        import board, digitalio, busio
        diagnostics["tests"]["imports"] = "SUCCESS"
    except Exception as e:
        diagnostics["tests"]["imports"] = f"FAILED: {e}"
        return diagnostics
    
    # Test board access
    try:
        available_pins = [attr for attr in dir(board) if attr.startswith('D')]
        diagnostics["available_pins"] = available_pins[:10]  # Show first 10
        diagnostics["tests"]["board_access"] = "SUCCESS"
    except Exception as e:
        diagnostics["tests"]["board_access"] = f"FAILED: {e}"
    
    # Test GPIO pin creation (without setting values)
    test_pins = [18, 23, 24, 25]
    for pin in test_pins:
        try:
            if pin == 18:
                gpio_pin = board.D18
            elif pin == 23:
                gpio_pin = board.D23
            elif pin == 24:
                gpio_pin = board.D24
            elif pin == 25:
                gpio_pin = board.D25
            
            pin_obj = digitalio.DigitalInOut(gpio_pin)
            pin_obj.deinit()  # Clean up immediately
            diagnostics["tests"][f"pin_{pin}_access"] = "SUCCESS"
        except Exception as e:
            diagnostics["tests"][f"pin_{pin}_access"] = f"FAILED: {e}"
    
    return diagnostics
