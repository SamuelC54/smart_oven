from config import RTD_NOMINAL, REF_RESISTOR, WIRES, CS_NAME

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
    logger.info("spidev library imported successfully")
else:
    logger.error("Failed to import spidev")

if CIRCUITPYTHON_AVAILABLE:
    logger.info("CircuitPython libraries also available")
else:
    logger.info("CircuitPython libraries not available")



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
        self.spi = board.SPI()
        
        # Initialize CS pin based on configuration
        if CS_NAME == "CE0":
            self.cs = digitalio.DigitalInOut(board.D24)
        elif CS_NAME == "CE1":
            self.cs = digitalio.DigitalInOut(board.D26)
        else:
            raise ValueError(f"Invalid CS name: {CS_NAME}")
        
        # Initialize the MAX31865 sensor
        self.sensor = adafruit_max31865.MAX31865(
            self.spi, 
            self.cs, 
            rtd_nominal=rtd_nominal, 
            ref_resistor=ref_resistor, 
            wires=wires
        )
        
        logger.info(f"MAX31865 initialized with CS={CS_NAME}, wires={wires}")
        logger.info(f"RTD nominal: {rtd_nominal}Ω, Ref resistor: {ref_resistor}Ω")
        
        # Log configuration for debugging
        if rtd_nominal == 100:
            logger.info("Configured for PT100 sensor")
        elif rtd_nominal == 1000:
            logger.info("Configured for PT1000 sensor")
        else:
            logger.warning(f"Unknown RTD nominal value: {rtd_nominal}Ω")
    
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
            raise ValueError(f"Unsupported GPIO pin: {pin}")
        
        pin_obj = digitalio.DigitalInOut(gpio_pin)
        pin_obj.direction = digitalio.Direction.OUTPUT
        pin_obj.value = state
        logger.info(f"GPIO {pin} set to {state}")
    except Exception as e:
        logger.error(f"Failed to set GPIO {pin}: {e}")
        raise
