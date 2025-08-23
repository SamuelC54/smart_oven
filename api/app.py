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

@app.get("/gpio-test")
def test_gpio_access():
    """Test direct GPIO access to debug busy issues"""
    logger.info("GPIO test requested")
    
    if not HARDWARE_AVAILABLE:
        return {"error": "Hardware libraries not available"}
    
    test_results = {}
    
    try:
        # Test basic GPIO access
        logger.info("Testing basic GPIO access...")
        test_pin = digitalio.DigitalInOut(board.D18)
        test_pin.direction = digitalio.Direction.OUTPUT
        test_pin.value = True
        test_pin.value = False
        test_pin.deinit()
        test_results["basic_gpio"] = "SUCCESS"
        logger.info("Basic GPIO test passed")
    except Exception as e:
        test_results["basic_gpio"] = f"FAILED: {e}"
        logger.error(f"Basic GPIO test failed: {e}")
    
    try:
        # Test SPI access
        logger.info("Testing SPI access...")
        spi = busio.SPI(board.SCLK, MOSI=board.MOSI, MISO=board.MISO)
        test_results["spi"] = "SUCCESS"
        logger.info("SPI test passed")
    except Exception as e:
        test_results["spi"] = f"FAILED: {e}"
        logger.error(f"SPI test failed: {e}")
    
    try:
        # Test CS pin access
        logger.info(f"Testing CS pin {CS_NAME}...")
        if CS_NAME == "CE0":
            cs = digitalio.DigitalInOut(board.CE0)
        elif CS_NAME == "CE1":
            cs = digitalio.DigitalInOut(board.CE1)
        else:
            raise ValueError(f"Invalid CS name: {CS_NAME}")
        
        test_results["cs_pin"] = "SUCCESS"
        logger.info(f"CS pin {CS_NAME} test passed")
    except Exception as e:
        test_results["cs_pin"] = f"FAILED: {e}"
        logger.error(f"CS pin test failed: {e}")
    
    try:
        # Test sensor initialization
        logger.info("Testing sensor initialization...")
        if test_results.get("spi") == "SUCCESS" and test_results.get("cs_pin") == "SUCCESS":
            spi = busio.SPI(board.SCLK, MOSI=board.MOSI, MISO=board.MISO)
            if CS_NAME == "CE0":
                cs = digitalio.DigitalInOut(board.CE0)
            elif CS_NAME == "CE1":
                cs = digitalio.DigitalInOut(board.CE1)
            
            sensor = adafruit_max31865.MAX31865(spi, cs, rtd_nominal=RTD_NOMINAL, ref_resistor=REF_RESISTOR, wires=WIRES)
            temp = sensor.temperature
            test_results["sensor"] = f"SUCCESS: {temp}°C"
            logger.info(f"Sensor test passed: {temp}°C")
        else:
            test_results["sensor"] = "SKIPPED: SPI or CS pin failed"
    except Exception as e:
        test_results["sensor"] = f"FAILED: {e}"
        logger.error(f"Sensor test failed: {e}")
    
    return {
        "timestamp": datetime.now().isoformat(),
        "test_results": test_results,
        "config": {
            "wires": WIRES,
            "cs_name": CS_NAME,
            "rtd_nominal": RTD_NOMINAL,
            "ref_resistor": REF_RESISTOR
        }
    }

@app.get("/gpio-status")
def get_gpio_status():
    """Get current GPIO status and usage information"""
    logger.info("GPIO status requested")
    
    try:
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
        
        # Get GPIO sysfs information
        gpio_info = {}
        try:
            # Check GPIO sysfs
            gpio_result = subprocess.run(['ls', '-la', '/sys/class/gpio/'], capture_output=True, text=True, timeout=10)
            if gpio_result.returncode == 0:
                gpio_info['sysfs_gpio'] = gpio_result.stdout
            else:
                gpio_info['sysfs_gpio'] = "Failed to access GPIO sysfs"
        except:
            gpio_info['sysfs_gpio'] = "GPIO sysfs not accessible"
        
        # Check if specific GPIO pins are exported
        try:
            for pin in [8, 9, 10, 11]:  # SPI pins
                pin_result = subprocess.run(['ls', f'/sys/class/gpio/gpio{pin}'], capture_output=True, text=True, timeout=5)
                gpio_info[f'gpio{pin}_exported'] = pin_result.returncode == 0
        except:
            gpio_info['pin_check'] = "Failed to check GPIO pins"
        
        # Get current sensor configuration
        sensor_config = {
            "rtd_nominal": RTD_NOMINAL,
            "ref_resistor": REF_RESISTOR,
            "wires": WIRES,
            "cs_name": CS_NAME,
            "sensor_initialized": _sensor is not None
        }
        
        # Try to get basic system info
        system_info = {}
        try:
            # Check if we're running in a container
            container_result = subprocess.run(['cat', '/proc/1/cgroup'], capture_output=True, text=True, timeout=5)
            if container_result.returncode == 0:
                system_info['container'] = 'docker' in container_result.stdout.lower()
            else:
                system_info['container'] = "Unknown"
        except:
            system_info['container'] = "Unknown"
        
        return {
            "timestamp": datetime.now().isoformat(),
            "gpio_info": gpio_info,
            "gpiomem_usage": gpiomem_usage,
            "spi_devices": spi_devices,
            "sensor_config": sensor_config,
            "system_info": system_info,
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
