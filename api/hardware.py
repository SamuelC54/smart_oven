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
import time

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
        
        # Initialize CS pin - GPIO 16 is RESERVED for this purpose
        self.cs = digitalio.DigitalInOut(board.D16)  # GPIO 16 - RESERVED for SPI CS
        
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

def get_available_gpios():
    """Get list of available GPIO numbers from GPIO_MAP"""
    return list(GPIO_MAP.keys())

def get_gpio_info():
    """Get detailed information about available GPIOs"""
    return {
        "available_gpios": get_available_gpios(),
        "gpio_map": GPIO_MAP,
        "hardware_available": HARDWARE_AVAILABLE
    }

def validate_gpio(gpio_num: int):
    """Validate GPIO number and return the corresponding board object
    
    Args:
        gpio_num: GPIO number to validate
        
    Returns:
        board object corresponding to the GPIO number
        
    Raises:
        ValueError: If GPIO number is not supported
    """
    if gpio_num not in GPIO_MAP:
        available_gpios = get_available_gpios()
        raise ValueError(f"Unsupported GPIO number: {gpio_num}. Available GPIOs: {available_gpios}")
    
    return GPIO_MAP[gpio_num]

def set_gpio(gpio_num: int, state: bool):
    """Set GPIO to specified state
    
    Args:
        gpio_num: GPIO number to control
        state: True for HIGH, False for LOW
        
    Returns:
        bool: True if successful
        
    Raises:
        Exception: If hardware not available or GPIO operation fails
    """
    if not HARDWARE_AVAILABLE:
        raise Exception("Hardware libraries not available")
    
    try:
        # Validate GPIO number and get board object
        board_gpio = validate_gpio(gpio_num)
        
        # Create GPIO object with proper cleanup
        gpio_obj = digitalio.DigitalInOut(board_gpio)
        gpio_obj.direction = digitalio.Direction.OUTPUT
        gpio_obj.value = state
        
        # Clean up the GPIO object to avoid "busy" errors
        gpio_obj.deinit()
        
        logger.info(f"GPIO {gpio_num} set to {state}")
        return True
        
    except ValueError as e:
        # GPIO validation error - already has proper message
        logger.error(str(e))
        raise Exception(str(e))
    except PermissionError as e:
        error_msg = f"Permission denied accessing GPIO {gpio_num}. Check if running with proper privileges or if GPIO device is accessible."
        logger.error(error_msg)
        raise Exception(error_msg)
    except OSError as e:
        if "busy" in str(e).lower():
            available_gpios = get_available_gpios()
            error_msg = f"GPIO {gpio_num} is busy or already in use. Try a different GPIO from available options: {available_gpios}"
        elif "no such file or directory" in str(e).lower():
            error_msg = f"GPIO {gpio_num} device not found. Check if GPIO hardware is available and properly configured."
        else:
            error_msg = f"OS error accessing GPIO {gpio_num}: {e}"
        logger.error(error_msg)
        raise Exception(error_msg)
    except Exception as e:
        logger.error(f"Failed to set GPIO {gpio_num}: {e}")
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
        import board, digitalio
        diagnostics["tests"]["imports"] = "SUCCESS"
    except Exception as e:
        diagnostics["tests"]["imports"] = f"FAILED: {e}"
        return diagnostics
    
    # Test board access
    try:
        available_pins = [attr for attr in dir(board) if attr.startswith('D')]
        available_pins.sort()
        diagnostics["available_pins"] = available_pins
        diagnostics["tests"]["board_access"] = "SUCCESS"
    except Exception as e:
        diagnostics["tests"]["board_access"] = f"FAILED: {e}"
    
    # Test GPIO creation (without setting values) for all available GPIOs
    available_gpios = get_available_gpios()
    for gpio_num in available_gpios:
        try:
            board_gpio = validate_gpio(gpio_num)
            
            gpio_obj = digitalio.DigitalInOut(board_gpio)
            gpio_obj.deinit()  # Clean up immediately
            diagnostics["tests"][f"gpio_{gpio_num}_access"] = "SUCCESS"
        except Exception as e:
            diagnostics["tests"][f"gpio_{gpio_num}_access"] = f"FAILED: {e}"
    
    # Test GPIO toggle functionality for all available GPIOs
    diagnostics["tests"]["gpio_toggle"] = {}
    for gpio_num in available_gpios:
        try:
            board_gpio = validate_gpio(gpio_num)
            
            # Create GPIO object and set as output
            gpio_obj = digitalio.DigitalInOut(board_gpio)
            gpio_obj.direction = digitalio.Direction.OUTPUT
            
            # Toggle ON
            gpio_obj.value = True
            logger.info(f"GPIO {gpio_num} toggled ON")
            time.sleep(0.2)  # 200ms wait
            
            # Toggle OFF
            gpio_obj.value = False
            logger.info(f"GPIO {gpio_num} toggled OFF")
            time.sleep(0.2)  # 200ms wait
            
            # Clean up
            gpio_obj.deinit()
            
            diagnostics["tests"]["gpio_toggle"][f"gpio_{gpio_num}"] = "SUCCESS"
            
        except Exception as e:
            diagnostics["tests"]["gpio_toggle"][f"gpio_{gpio_num}"] = f"FAILED: {e}"
            logger.error(f"GPIO {gpio_num} toggle test failed: {e}")
    
    return diagnostics

    


# GPIO_MAP = {
#     23: board.D16, # Pin 16 - GPIO 23
#     24: board.D18, # Pin 18 - GPIO 24    
#     25: board.D22 # Pin 22 - GPIO 25
# }

GPIO_MAP = {
    1: board.D1,
    2: board.D2,
    3: board.D3,
    4: board.D4,
    5: board.D5,
    6: board.D6,
    7: board.D7,
    # 8: board.D8,   # RESERVED for SPI0_CE0 - Standard SPI Chip Enable
    # 9: board.D9,   # RESERVED for SPI0_MISO - Standard SPI MISO
    # 10: board.D10, # RESERVED for SPI0_MOSI - Standard SPI MOSI  
    # 11: board.D11, # RESERVED for SPI0_SCLK - Standard SPI Clock
    12: board.D12,
    13: board.D13,
    14: board.D14,
    15: board.D15,
    # 16: board.D16,  # RESERVED for MAX31865 CS pin - DO NOT USE for GPIO operations
    17: board.D17,
    18: board.D18,
    19: board.D19,
    20: board.D20,
    21: board.D21,
    22: board.D22,
    23: board.D23,
    24: board.D24,
    25: board.D25,
    26: board.D26,
    27: board.D27,
}