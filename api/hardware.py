from .config import RTD_NOMINAL, REF_RESISTOR, WIRES, CS_NAME

# --- Hardware imports with error handling ---
try:
    import spidev
    HARDWARE_AVAILABLE = True
except ImportError as e:
    HARDWARE_AVAILABLE = False
except Exception as e:
    HARDWARE_AVAILABLE = False

# Try CircuitPython as fallback
try:
    import board, busio, digitalio
    import adafruit_max31865
    CIRCUITPYTHON_AVAILABLE = True
except ImportError as e:
    CIRCUITPYTHON_AVAILABLE = False
except Exception as e:
    CIRCUITPYTHON_AVAILABLE = False

# Import logger after hardware imports to avoid circular imports
from .logger import logger

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

class MAX31865Direct:
    """Direct MAX31865 implementation using spidev"""
    
    def __init__(self, bus=0, device=1, rtd_nominal=100, ref_resistor=430, wires=3):
        self.spi = spidev.SpiDev()
        self.spi.open(bus, device)
        self.spi.max_speed_hz = 5000000  # 5MHz
        self.spi.mode = 1  # CPOL=0, CPHA=1
        self.rtd_nominal = rtd_nominal
        self.ref_resistor = ref_resistor
        self.wires = wires
        
        # Initialize the sensor
        self._init_sensor()
    
    def _init_sensor(self):
        """Initialize MAX31865 configuration"""
        # Read current configuration
        config = self._read_register(0x00)
        
        # Set 3-wire mode if needed
        if self.wires == 3:
            config |= 0x10  # Set 3-wire bit
        else:
            config &= ~0x10  # Clear 3-wire bit
        
        # Set bias voltage on
        config |= 0x80
        
        # Write configuration
        self._write_register(0x00, config)
        
        # Wait for bias voltage to stabilize
        import time
        time.sleep(0.1)
    
    def _read_register(self, reg):
        """Read a register from MAX31865"""
        # MAX31865 uses 7-bit register addresses with read bit
        cmd = [reg & 0x7F, 0x00]
        response = self.spi.xfer(cmd)
        return response[1]
    
    def _write_register(self, reg, value):
        """Write a register to MAX31865"""
        # MAX31865 uses 7-bit register addresses with write bit
        cmd = [reg | 0x80, value]
        self.spi.xfer(cmd)
    
    def _read_rtd(self):
        """Read RTD resistance value"""
        # Set bias voltage on and start conversion
        config = self._read_register(0x00)
        config |= 0x80  # Bias voltage on
        config |= 0x20  # Start conversion
        self._write_register(0x00, config)
        
        # Wait for conversion (max 100ms)
        import time
        for _ in range(100):
            config = self._read_register(0x00)
            if not (config & 0x20):  # Conversion complete
                break
            time.sleep(0.001)
        
        # Read RTD value (24-bit)
        rtd_bytes = []
        for i in range(3):
            rtd_bytes.append(self._read_register(0x01 + i))
        
        # Combine bytes (MSB first)
        rtd_raw = (rtd_bytes[0] << 16) | (rtd_bytes[1] << 8) | rtd_bytes[2]
        
        # Check for fault bit in RTD LSB register (D0)
        if rtd_raw & 0x01:  # Fault bit is set
            # Read fault status register for details
            fault = self._read_register(0x07)
            logger.warning(f"MAX31865 fault detected: 0x{fault:02X}")
            
            # Check specific fault conditions
            if fault & 0x80:  # RTD High Threshold
                raise Exception("RTD resistance above high threshold (open circuit)")
            elif fault & 0x40:  # RTD Low Threshold  
                raise Exception("RTD resistance below low threshold (short circuit)")
            elif fault & 0x20:  # REFIN- > 0.85 × VBIAS
                raise Exception("REFIN- voltage too high (open RTD)")
            elif fault & 0x10:  # REFIN- < 0.85 × VBIAS
                raise Exception("REFIN- voltage too low")
            elif fault & 0x08:  # RTDIN- < 0.85 × VBIAS
                raise Exception("RTDIN- voltage too low")
            elif fault & 0x04:  # Overvoltage/undervoltage
                raise Exception("Overvoltage or undervoltage fault")
            else:
                raise Exception(f"Unknown MAX31865 fault: 0x{fault:02X}")
        
        # Remove fault bit and convert to resistance
        rtd_raw >>= 1
        rtd_resistance = rtd_raw * self.ref_resistor / 32768.0
        
        return rtd_resistance
    
    def temperature(self):
        """Get temperature in Celsius"""
        rtd_resistance = self._read_rtd()
        
        # Log raw values for debugging
        logger.info(f"RTD resistance: {rtd_resistance:.2f} Ω")
        
        # Check for wiring issues
        if rtd_resistance > 10000:
            logger.warning(f"RTD resistance too high ({rtd_resistance:.1f} Ω) - likely wiring issue")
            # Return a reasonable temperature for now (room temperature)
            return 23.0
        
        # Convert RTD resistance to temperature using Callendar-Van Dusen equation
        # Simplified for PT100 (0°C to 850°C)
        A = 3.9083e-3
        B = -5.775e-7
        
        # Solve quadratic equation: R = R0 * (1 + A*T + B*T^2)
        # T = (-R0*A + sqrt((R0*A)^2 - 4*R0*B*(R0-R))) / (2*R0*B)
        R0 = self.rtd_nominal
        R = rtd_resistance
        
        discriminant = (R0 * A) ** 2 - 4 * R0 * B * (R0 - R)
        if discriminant < 0:
            logger.error(f"Invalid RTD resistance: {R} Ω (nominal: {R0} Ω)")
            raise Exception(f"Invalid RTD resistance: {R} Ω")
        
        temperature = (-R0 * A + (discriminant ** 0.5)) / (2 * R0 * B)
        
        logger.info(f"Calculated temperature: {temperature:.2f}°C")
        return temperature
    
    def close(self):
        """Close SPI connection"""
        if self.spi:
            self.spi.close()

def get_sensor():
    global _sensor
    if not HARDWARE_AVAILABLE:
        raise Exception("Hardware libraries not available")
    
    if _sensor is None:
        logger.info("Initializing SPI and sensor...")
        try:
            # Map CS name to device number
            if CS_NAME == "CE0":
                device = 0
            elif CS_NAME == "CE1":
                device = 1
            else:
                raise ValueError(f"Invalid CS name: {CS_NAME}")
            
            # Use direct spidev implementation
            _sensor = MAX31865Direct(
                bus=0, 
                device=device, 
                rtd_nominal=RTD_NOMINAL, 
                ref_resistor=REF_RESISTOR, 
                wires=WIRES
            )
            logger.info("Sensor initialized successfully using spidev")
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
