from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from enum import Enum
from hardware import set_output, get_output
from logger import logger

router = APIRouter()

class HeaterMode(str, Enum):
    OFF = "off"
    BACK = "back"
    FRONT = "front"
    BOTH = "both"

class HeaterRequest(BaseModel):
    mode: HeaterMode

@router.post("/heater")
def heater_control_endpoint(request: HeaterRequest):
    """Control heater elements using GPIO 23 (back) and GPIO 24 (front)"""
    logger.info(f"Heater control requested: {request.mode}")
    
    # GPIO mapping: 23 = back heater, 24 = front heater
    BACK_HEATER_GPIO = 23
    FRONT_HEATER_GPIO = 24
    
    try:
        if request.mode == HeaterMode.OFF:
            # Turn off both heaters
            set_output(BACK_HEATER_GPIO, False)
            set_output(FRONT_HEATER_GPIO, False)
            message = "Both heaters turned off"
            
        elif request.mode == HeaterMode.BACK:
            # Turn on back heater only
            set_output(BACK_HEATER_GPIO, True)
            set_output(FRONT_HEATER_GPIO, False)
            message = "Back heater turned on, front heater turned off"
            
        elif request.mode == HeaterMode.FRONT:
            # Turn on front heater only
            set_output(BACK_HEATER_GPIO, False)
            set_output(FRONT_HEATER_GPIO, True)
            message = "Front heater turned on, back heater turned off"
            
        elif request.mode == HeaterMode.BOTH:
            # Turn on both heaters
            set_output(BACK_HEATER_GPIO, True)
            set_output(FRONT_HEATER_GPIO, True)
            message = "Both heaters turned on"
        
        logger.info(f"Heater control successful: {message}")
        return {
            "status": "success",
            "mode": request.mode,
            "message": message,
            "gpio_states": {
                "back_heater_gpio_23": True if request.mode in [HeaterMode.BACK, HeaterMode.BOTH] else False,
                "front_heater_gpio_24": True if request.mode in [HeaterMode.FRONT, HeaterMode.BOTH] else False
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to control heater: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/heater/status")
def get_heater_status():
    """Get current heater status by reading GPIO 23 and 24"""
    logger.info("Heater status requested")
    
    BACK_HEATER_GPIO = 23
    FRONT_HEATER_GPIO = 24
    
    try:
        back_state = get_output(BACK_HEATER_GPIO)
        front_state = get_output(FRONT_HEATER_GPIO)
        
        # Determine current mode
        if back_state and front_state:
            current_mode = "both"
        elif back_state:
            current_mode = "back"
        elif front_state:
            current_mode = "front"
        else:
            current_mode = "off"
        
        return {
            "status": "success",
            "current_mode": current_mode,
            "gpio_states": {
                "back_heater_gpio_23": back_state,
                "front_heater_gpio_24": front_state
            },
            "message": f"Current heater mode: {current_mode}"
        }
        
    except Exception as e:
        logger.error(f"Failed to get heater status: {e}")
        raise HTTPException(status_code=500, detail=str(e))
