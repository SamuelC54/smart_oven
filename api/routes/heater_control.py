from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from simple_pid import PID
from hardware import get_sensor
from logger import logger
from config import (
    HEATER_PID_KP, HEATER_PID_KI, HEATER_PID_KD, 
    HEATER_PID_SAMPLE_TIME, HEATER_PID_OUTPUT_LIMITS, HEATER_PID_THRESHOLD
)
import time

router = APIRouter()

# Global PID controller instance
_pid_controller = None
_last_update_time = None

class HeaterControlRequest(BaseModel):
    target_temperature: float

class HeaterControlResponse(BaseModel):
    heater_should_be_on: bool
    current_temperature: float
    target_temperature: float
    pid_output: float
    error: float
    pid_parameters: dict

def get_pid_controller(target_temp: float):
    """Get or create PID controller with constant parameters from config"""
    global _pid_controller, _last_update_time
    
    # Create new controller if target temperature changed or controller doesn't exist
    if (_pid_controller is None or _pid_controller.setpoint != target_temp):
        
        _pid_controller = PID(HEATER_PID_KP, HEATER_PID_KI, HEATER_PID_KD, setpoint=target_temp)
        _pid_controller.sample_time = HEATER_PID_SAMPLE_TIME
        _pid_controller.output_limits = HEATER_PID_OUTPUT_LIMITS
        _last_update_time = time.time()
        
        logger.info(f"Created new PID controller: target={target_temp}°C, Kp={HEATER_PID_KP}, Ki={HEATER_PID_KI}, Kd={HEATER_PID_KD}")
    
    return _pid_controller

@router.post("/heater/control", response_model=HeaterControlResponse)
def control_heater(request: HeaterControlRequest):
    """
    Determine if heater should be on based on current temperature and target temperature using PID control.
    Uses constant PID parameters defined in config.py.
    
    Args:
        request: HeaterControlRequest containing target temperature only
        
    Returns:
        HeaterControlResponse with heater status and control information
    """
    logger.info(f"Heater control requested: target={request.target_temperature}°C")
    
    try:
        # Get current temperature from sensor
        sensor = get_sensor()
        current_temp = sensor.temperature()
        
        # Get PID controller with constant parameters
        pid = get_pid_controller(target_temp=request.target_temperature)
        
        # Calculate PID output
        pid_output = pid(current_temp)
        
        # Determine if heater should be on using constant threshold
        heater_should_be_on = pid_output > HEATER_PID_THRESHOLD
        
        # Calculate error
        error = request.target_temperature - current_temp
        
        response = HeaterControlResponse(
            heater_should_be_on=heater_should_be_on,
            current_temperature=current_temp,
            target_temperature=request.target_temperature,
            pid_output=pid_output,
            error=error,
            pid_parameters={
                "kp": HEATER_PID_KP,
                "ki": HEATER_PID_KI,
                "kd": HEATER_PID_KD,
                "sample_time": HEATER_PID_SAMPLE_TIME,
                "output_limits": HEATER_PID_OUTPUT_LIMITS,
                "threshold": HEATER_PID_THRESHOLD
            }
        )
        
        logger.info(f"Heater control: current={current_temp:.2f}°C, target={request.target_temperature}°C, "
                   f"output={pid_output:.3f}, heater_on={heater_should_be_on}")
        
        return response
        
    except Exception as e:
        logger.error(f"Failed to control heater: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/heater/status")
def get_heater_status():
    """
    Get current heater control status and PID controller information.
    
    Returns:
        Dictionary with current status information
    """
    global _pid_controller, _last_update_time
    
    try:
        # Get current temperature
        sensor = get_sensor()
        current_temp = sensor.temperature()
        
        status = {
            "current_temperature": current_temp,
            "pid_controller_active": _pid_controller is not None,
            "last_update_time": _last_update_time
        }
        
        if _pid_controller is not None:
            status.update({
                "target_temperature": _pid_controller.setpoint,
                "pid_tunings": _pid_controller.tunings,
                "sample_time": _pid_controller.sample_time,
                "output_limits": _pid_controller.output_limits,
                "last_output": getattr(_pid_controller, '_last_output', None)
            })
        
        # Add constant PID parameters for reference
        status.update({
            "constant_pid_parameters": {
                "kp": HEATER_PID_KP,
                "ki": HEATER_PID_KI,
                "kd": HEATER_PID_KD,
                "sample_time": HEATER_PID_SAMPLE_TIME,
                "output_limits": HEATER_PID_OUTPUT_LIMITS,
                "threshold": HEATER_PID_THRESHOLD
            }
        })
        
        return status
        
    except Exception as e:
        logger.error(f"Failed to get heater status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/heater/reset")
def reset_heater_controller():
    """
    Reset the PID controller to clear any accumulated integral error.
    
    Returns:
        Success message
    """
    global _pid_controller, _last_update_time
    
    if _pid_controller is not None:
        _pid_controller.reset()
        _last_update_time = time.time()
        logger.info("PID controller reset")
        return {"message": "PID controller reset successfully"}
    else:
        return {"message": "No PID controller to reset"}
