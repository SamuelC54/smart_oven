import os
import asyncio
import logging
import io
import subprocess
from datetime import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Set up logging with memory handler and timestamp format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Create a memory handler to capture logs
log_buffer = io.StringIO()
memory_handler = logging.StreamHandler(log_buffer)
memory_handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
memory_handler.setFormatter(formatter)
logger.addHandler(memory_handler)

app = FastAPI(title="Pi Sensor/GPIO API (Docker)")

# --- Config via env ---
RTD_NOMINAL = float(os.getenv("SENSOR_RTD_NOMINAL", "100"))           # PT100 = 100, PT1000 = 1000
REF_RESISTOR = float(os.getenv("SENSOR_REF_RESISTOR", "430"))         # 430 for MAX31865 breakout
WIRES = int(os.getenv("SENSOR_WIRES", "2"))                     # 2, 3, or 4
CS_NAME = os.getenv("SENSOR_CS", "CE0")                         # CE0 or CE1

logger.info(f"Starting Smart Oven API with config: RTD={RTD_NOMINAL}, REF={REF_RESISTOR}, WIRES={WIRES}, CS={CS_NAME}")

# --- Hardware imports with error handling ---
try:
    import board, busio, digitalio
    import adafruit_max31865
    logger.info("Hardware libraries imported successfully")
    HARDWARE_AVAILABLE = True
except ImportError as e:
    logger.error(f"Failed to import hardware libraries: {e}")
    HARDWARE_AVAILABLE = False
except Exception as e:
    logger.error(f"Unexpected error importing hardware libraries: {e}")
    HARDWARE_AVAILABLE = False

# --- Global sensor instance ---
_sensor = None

def get_sensor():
    global _sensor
    if not HARDWARE_AVAILABLE:
        raise Exception("Hardware libraries not available")
    
    if _sensor is None:
        logger.info("Initializing SPI and sensor...")
        try:
            # Map CS name to actual pin
            if CS_NAME == "CE0":
                cs = digitalio.DigitalInOut(board.CE0)
            elif CS_NAME == "CE1":
                cs = digitalio.DigitalInOut(board.CE1)
            else:
                raise ValueError(f"Invalid CS name: {CS_NAME}")
            
            spi = busio.SPI(board.SCLK, MOSI=board.MOSI, MISO=board.MISO)
            _sensor = adafruit_max31865.MAX31865(spi, cs, rtd_nominal=RTD_NOMINAL, ref_resistor=REF_RESISTOR, wires=WIRES)
            logger.info("Sensor initialized successfully")
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

@app.on_event("startup")
async def startup_event():
    logger.info("Smart Oven API starting up...")
    logger.info(f"Hardware available: {HARDWARE_AVAILABLE}")

@app.get("/")
def root():
    """Simple test endpoint that doesn't require hardware"""
    logger.info("Root endpoint accessed")
    return {"message": "Smart Oven API is running", "hardware_available": HARDWARE_AVAILABLE}

@app.get("/logs")
def get_logs():
    """Get recent application logs for debugging"""
    log_buffer.seek(0)
    logs = log_buffer.read()
    log_lines = logs.strip().split('\n')
    formatted_logs = []
    for line in log_lines:
        if line.strip():
            formatted_logs.append(line)

    return {
        "logs": formatted_logs,
        "raw_logs": logs,
        "log_count": len(formatted_logs),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
def health():
    logger.info("Health check requested")
    return {
        "status": "ok",
        "hardware_available": HARDWARE_AVAILABLE,
        "sensor_initialized": _sensor is not None
    }

@app.get("/gpio-status")
def get_gpio_status():
    """Get current GPIO status and usage information"""
    logger.info("GPIO status requested")
    
    try:
        # Get GPIO pin states using raspi-gpio
        result = subprocess.run(['raspi-gpio', 'get'], capture_output=True, text=True, timeout=10)
        gpio_states = result.stdout if result.returncode == 0 else "Failed to get GPIO states"
        
        # Get processes using gpiomem
        gpiomem_result = subprocess.run(['lsof', '/dev/gpiomem'], capture_output=True, text=True, timeout=10)
        gpiomem_usage = gpiomem_result.stdout if gpiomem_result.returncode == 0 else "No processes using gpiomem"
        
        # Get SPI device status
        spi_devices = []
        try:
            spi_result = subprocess.run(['ls', '-la', '/dev/spidev*'], capture_output=True, text=True, timeout=10)
            if spi_result.returncode == 0:
                spi_devices = spi_result.stdout.strip().split('\n')
        except:
            spi_devices = ["Failed to check SPI devices"]
        
        # Get current sensor configuration
        sensor_config = {
            "rtd_nominal": RTD_NOMINAL,
            "ref_resistor": REF_RESISTOR,
            "wires": WIRES,
            "cs_name": CS_NAME,
            "sensor_initialized": _sensor is not None
        }
        
        return {
            "timestamp": datetime.now().isoformat(),
            "gpio_states": gpio_states,
            "gpiomem_usage": gpiomem_usage,
            "spi_devices": spi_devices,
            "sensor_config": sensor_config,
            "hardware_available": HARDWARE_AVAILABLE
        }
        
    except subprocess.TimeoutExpired:
        logger.error("Timeout getting GPIO status")
        raise HTTPException(status_code=500, detail="Timeout getting GPIO status")
    except Exception as e:
        logger.error(f"Failed to get GPIO status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get GPIO status: {e}")

@app.get("/temp")
def get_temp():
    logger.info("Temperature reading requested")
    try:
        sensor = get_sensor()
        temp = sensor.temperature
        logger.info(f"Temperature: {temp}°C")
        return {"temperature": temp, "unit": "celsius"}
    except Exception as e:
        logger.error(f"Failed to read temperature: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class GPIORequest(BaseModel):
    pin: int
    state: bool

@app.post("/gpio")
def set_gpio_endpoint(request: GPIORequest):
    logger.info(f"GPIO control requested: pin {request.pin} -> {request.state}")
    try:
        set_gpio(request.pin, request.state)
        return {"message": f"GPIO {request.pin} set to {request.state}"}
    except Exception as e:
        logger.error(f"Failed to set GPIO {request.pin}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
