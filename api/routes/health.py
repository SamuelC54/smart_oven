from fastapi import APIRouter
from hardware import HARDWARE_AVAILABLE, get_sensor
from logger import logger

router = APIRouter()

@router.get("/health")
def health():
    logger.info("Health check requested")
    try:
        sensor = get_sensor()
        sensor_initialized = sensor is not None
    except:
        sensor_initialized = False
    
    return {
        "status": "ok",
        "hardware_available": HARDWARE_AVAILABLE,
        "sensor_initialized": sensor_initialized
    }
