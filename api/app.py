import os
import asyncio
import logging
import io
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
# Use the same format for memory handler
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
memory_handler.setFormatter(formatter)
logger.addHandler(memory_handler)

app = FastAPI(title="Pi Sensor/GPIO API (Docker)")

# --- Config via env ---
RTD_NOMINAL = float(os.getenv("SENSOR_RTD_NOMINAL", "100"))     # 100 for PT100, 1000 for PT1000
REF_RESISTOR = float(os.getenv("SENSOR_REF_RESISTOR", "430"))   # Common: 430Ω (Adafruit breakout)
WIRES = int(os.getenv("SENSOR_WIRES", "2"))                     # 2, 3, or 4
CS_NAME = os.getenv("SENSOR_CS", "CE0").upper()                 # "CE0" or "CE1"

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

# --- Lazy sensor init to avoid crash if bus is slow to appear ---
_sensor = None
def get_sensor():
    global _sensor
    if not HARDWARE_AVAILABLE:
        logger.error("Hardware not available, cannot initialize sensor")
        raise Exception("Hardware libraries not available")
    
    if _sensor is None:
        try:
            logger.info("Initializing SPI and sensor...")
            spi = busio.SPI(board.SCLK, board.MOSI, board.MISO)
            cs_pin = board.CE0 if CS_NAME == "CE0" else board.CE1
            cs = digitalio.DigitalInOut(cs_pin)
            _sensor = adafruit_max31865.MAX31865(
                spi, cs,
                rtd_nominal=RTD_NOMINAL,
                ref_resistor=REF_RESISTOR,
                wires=WIRES,
            )
            logger.info("Sensor initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize sensor: {e}")
            raise
    return _sensor

def set_gpio(bcm_pin: int, value: bool):
    if not HARDWARE_AVAILABLE:
        logger.error("Hardware not available, cannot set GPIO")
        raise Exception("Hardware libraries not available")
    
    try:
        logger.info(f"Setting GPIO{bcm_pin} to {'HIGH' if value else 'LOW'}")
        # Use BCM number with Blinka mapping (board.D17 == GPIO17)
        pin = getattr(board, f"D{bcm_pin}")
        io = digitalio.DigitalInOut(pin)
        io.direction = digitalio.Direction.OUTPUT
        io.value = value
        logger.info(f"GPIO{bcm_pin} set successfully")
    except AttributeError:
        logger.error(f"GPIO{bcm_pin} is not available on this board")
        raise ValueError(f"GPIO{bcm_pin} is not available on this board")
    except Exception as e:
        logger.error(f"Failed to set GPIO{bcm_pin}: {e}")
        raise
    finally:
        try:
            io.deinit()
        except:
            pass

class GpioBody(BaseModel):
    value: bool  # true=HIGH, false=LOW

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
    # Split logs into lines and format them nicely
    log_lines = logs.strip().split('\n')
    formatted_logs = []
    for line in log_lines:
        if line.strip():  # Skip empty lines
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

@app.get("/temp")
def temp():
    logger.info("Temperature reading requested")
    try:
        s = get_sensor()
        temp_c = s.temperature
        resistance = s.resistance
        logger.info(f"Temperature: {temp_c}°C, Resistance: {resistance}Ω")
        return {"celsius": temp_c, "ohms": resistance}
    except Exception as e:
        logger.error(f"Failed to read temperature: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/gpio/{bcm_pin}")
async def gpio(bcm_pin: int, body: GpioBody):
    logger.info(f"GPIO{bcm_pin} control requested: {body.value}")
    try:
        await asyncio.sleep(0)
        set_gpio(bcm_pin, body.value)
        logger.info(f"GPIO{bcm_pin} set to {body.value} successfully")
        return {"pin": bcm_pin, "set": body.value}
    except ValueError as ve:
        logger.error(f"GPIO{bcm_pin} error: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"GPIO{bcm_pin} unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
