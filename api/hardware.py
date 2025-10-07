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
from config import RTD_NOMINAL, REF_RESISTOR, WIRES

# --- Global sensor instance ---
_sensor = None

# --- Global GPIO object tracking ---
_gpio_objects = {}
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

def set_output(gpio_num: int, state: bool):
    """Set GPIO output to specified state using persistent GPIO object
    
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
        
        global _gpio_objects
        
        # Get or create GPIO object
        if gpio_num not in _gpio_objects:
            gpio_obj = digitalio.DigitalInOut(board_gpio)
            gpio_obj.direction = digitalio.Direction.OUTPUT
            _gpio_objects[gpio_num] = gpio_obj
            logger.info(f"Created new GPIO object for GPIO {gpio_num}")
        else:
            gpio_obj = _gpio_objects[gpio_num]
            # Ensure it's set as output
            gpio_obj.direction = digitalio.Direction.OUTPUT
        
        # Set the value
        gpio_obj.value = state
        
        logger.info(f"GPIO {gpio_num} output set to {state}")
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
        logger.error(f"Failed to set GPIO {gpio_num} output: {e}")
        raise Exception(f"GPIO operation failed: {e}")

def get_output(gpio_num: int):
    """Get the current output value from the persistent GPIO object
    
    Args:
        gpio_num: GPIO number to check
        
    Returns:
        bool: The current output value, or False if GPIO not configured as output
        
    Raises:
        Exception: If GPIO number is not supported or not configured
    """
    try:
        # Validate GPIO number
        validate_gpio(gpio_num)
        
        global _gpio_objects
        
        if gpio_num not in _gpio_objects:
            logger.warning(f"GPIO {gpio_num} not configured, returning False")
            return False
        
        gpio_obj = _gpio_objects[gpio_num]
        
        # Check if it's configured as output
        if gpio_obj.direction != digitalio.Direction.OUTPUT:
            logger.warning(f"GPIO {gpio_num} not configured as output, returning False")
            return False
        
        output_state = gpio_obj.value
        logger.info(f"GPIO {gpio_num} current output value: {output_state}")
        return output_state
        
    except ValueError as e:
        # GPIO validation error - already has proper message
        logger.error(str(e))
        raise Exception(str(e))
    except Exception as e:
        logger.error(f"Failed to get GPIO {gpio_num} output state: {e}")
        raise Exception(f"GPIO operation failed: {e}")

def read_input(gpio_num: int):
    """Read GPIO input state using persistent GPIO object
    
    Args:
        gpio_num: GPIO number to read
        
    Returns:
        bool: True for HIGH, False for LOW
        
    Raises:
        Exception: If hardware not available or GPIO operation fails
    """
    if not HARDWARE_AVAILABLE:
        raise Exception("Hardware libraries not available")
    
    try:
        # Validate GPIO number and get board object
        board_gpio = validate_gpio(gpio_num)
        
        global _gpio_objects
        
        # Get or create GPIO object
        if gpio_num not in _gpio_objects:
            gpio_obj = digitalio.DigitalInOut(board_gpio)
            gpio_obj.direction = digitalio.Direction.INPUT
            _gpio_objects[gpio_num] = gpio_obj
            logger.info(f"Created new GPIO object for GPIO {gpio_num} as input")
        else:
            gpio_obj = _gpio_objects[gpio_num]
            # Set as input for reading
            gpio_obj.direction = digitalio.Direction.INPUT
        
        # Read the current state
        state = gpio_obj.value
        
        logger.info(f"GPIO {gpio_num} input read as {state}")
        return state
        
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
        logger.error(f"Failed to read GPIO {gpio_num} input: {e}")
        raise Exception(f"GPIO operation failed: {e}")

def get_gpio_object(gpio_num: int, direction=digitalio.Direction.OUTPUT):
    """Get or create a persistent GPIO object for direct manipulation
    
    Args:
        gpio_num: GPIO number to get/create
        direction: Direction for the GPIO (OUTPUT or INPUT)
        
    Returns:
        digitalio.DigitalInOut: The GPIO object for direct manipulation
        
    Raises:
        Exception: If hardware not available or GPIO operation fails
    """
    if not HARDWARE_AVAILABLE:
        raise Exception("Hardware libraries not available")
    
    try:
        # Validate GPIO number and get board object
        board_gpio = validate_gpio(gpio_num)
        
        global _gpio_objects
        
        # Get or create GPIO object
        if gpio_num not in _gpio_objects:
            gpio_obj = digitalio.DigitalInOut(board_gpio)
            gpio_obj.direction = direction
            _gpio_objects[gpio_num] = gpio_obj
            logger.info(f"Created new GPIO object for GPIO {gpio_num} as {direction}")
        else:
            gpio_obj = _gpio_objects[gpio_num]
            # Update direction if needed
            if gpio_obj.direction != direction:
                gpio_obj.direction = direction
                logger.info(f"Updated GPIO {gpio_num} direction to {direction}")
        
        return gpio_obj
        
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
        logger.error(f"Failed to get GPIO {gpio_num} object: {e}")
        raise Exception(f"GPIO operation failed: {e}")

def cleanup_gpio(gpio_num: int):
    """Clean up and remove a GPIO object from the map
    
    Args:
        gpio_num: GPIO number to clean up
        
    Returns:
        bool: True if successful
    """
    global _gpio_objects
    
    if gpio_num in _gpio_objects:
        try:
            gpio_obj = _gpio_objects[gpio_num]
            gpio_obj.deinit()
            del _gpio_objects[gpio_num]
            logger.info(f"Cleaned up GPIO {gpio_num}")
            return True
        except Exception as e:
            logger.error(f"Failed to cleanup GPIO {gpio_num}: {e}")
            return False
    else:
        logger.warning(f"GPIO {gpio_num} not found in object map")
        return False

def cleanup_all_gpios():
    """Clean up all GPIO objects in the map"""
    global _gpio_objects
    
    for gpio_num in list(_gpio_objects.keys()):
        cleanup_gpio(gpio_num)
    
    logger.info("Cleaned up all GPIO objects")

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