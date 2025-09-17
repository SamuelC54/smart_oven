from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from hardware import set_gpio
from logger import logger

router = APIRouter()

class GPIORequest(BaseModel):
    gpio_num: int
    state: bool

@router.post("/gpio")
def set_gpio_endpoint(request: GPIORequest):
    logger.info(f"GPIO control requested: GPIO {request.gpio_num} -> {request.state}")
    try:
        set_gpio(request.gpio_num, request.state)
        return {"message": f"GPIO {request.gpio_num} set to {request.state}"}
    except Exception as e:
        logger.error(f"Failed to set GPIO {request.gpio_num}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
