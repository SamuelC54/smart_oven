import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from logger import logger
from helpers.set_gpio_pin import set_gpio_pin

router = APIRouter()

# Get GPIO pin from environment variable
OVEN_GPIO_PIN = int(os.getenv("OVEN_GPIO_PIN", "18"))

# Global oven state
oven_state = {"is_on": False}

class OvenControlRequest(BaseModel):
    is_on: bool

@router.post("/oven/control")
def set_oven_control(request: OvenControlRequest):
    """Turn oven on or off via GPIO pin"""
    try:
        global oven_state
        
        # Set GPIO pin state
        set_gpio_pin(OVEN_GPIO_PIN, request.is_on)
        
        # Update state
        oven_state["is_on"] = request.is_on
        
        logger.info(f"Oven turned {'on' if request.is_on else 'off'} via GPIO pin {OVEN_GPIO_PIN}")
        
        return {
            "success": True,
            "message": f"Oven turned {'on' if request.is_on else 'off'}",
            "gpio_pin": OVEN_GPIO_PIN,
            "state": oven_state
        }
    except Exception as e:
        logger.error(f"Failed to control oven: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to control oven: {str(e)}")

@router.get("/oven/status")
def get_oven_status():
    """Get current oven status"""
    try:
        logger.info("Getting oven status")
        return {
            "success": True,
            "gpio_pin": OVEN_GPIO_PIN,
            "state": oven_state
        }
    except Exception as e:
        logger.error(f"Failed to get oven status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get oven status: {str(e)}")
