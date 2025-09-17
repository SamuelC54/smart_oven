from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from hardware import set_gpio, diagnose_gpio_access
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

@router.get("/gpio/debug/diagnose")
def diagnose_gpio_endpoint():
    """Debug endpoint to diagnose GPIO access issues"""
    logger.info("GPIO diagnostic requested")
    try:
        diagnostics = diagnose_gpio_access()
        logger.info("GPIO diagnostics completed successfully")
        return {
            "status": "success",
            "diagnostics": diagnostics,
            "message": "GPIO diagnostics completed"
        }
    except Exception as e:
        logger.error(f"Failed to run GPIO diagnostics: {e}")
        raise HTTPException(status_code=500, detail=f"Diagnostics failed: {str(e)}")
