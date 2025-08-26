from fastapi import APIRouter, HTTPException
from hardware import get_sensor
from logger import logger

router = APIRouter()

@router.get("/temperature")
def get_temp():
    logger.info("Temperature reading requested")
    try:
        sensor = get_sensor()
        temp = sensor.temperature()
        logger.info(f"Temperature: {temp}°C")
        return {"temperature": temp, "unit": "celsius"}
    except Exception as e:
        logger.error(f"Failed to read temperature: {e}")
        raise HTTPException(status_code=500, detail=str(e))
