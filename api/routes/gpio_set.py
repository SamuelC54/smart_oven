from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from hardware import set_gpio
from logger import logger

router = APIRouter()

class GPIORequest(BaseModel):
    pin: int
    state: bool

@router.post("/gpio")
def set_gpio_endpoint(request: GPIORequest):
    logger.info(f"GPIO control requested: pin {request.pin} -> {request.state}")
    try:
        set_gpio(request.pin, request.state)
        return {"message": f"GPIO {request.pin} set to {request.state}"}
    except Exception as e:
        logger.error(f"Failed to set GPIO {request.pin}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
