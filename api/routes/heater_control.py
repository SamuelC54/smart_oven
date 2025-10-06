from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from simple_pid import PID
from hardware import get_sensor
from logger import logger
import time

router = APIRouter()

# Global PID controller instance
_pid_controller = None
_last_update_time = None

class HeaterControlRequest(BaseModel):
    target_temperature: float
    kp: float = 1.0  # Proportional gain
    ki: float = 0.1  # Integral gain  
    kd: float = 0.05  # Derivative gain
    sample_time: float = 1.0  # Sample time in seconds
    output_limits: tuple = (0, 1)  # Output limits (0-1 for heater on/off)

class HeaterControlResponse(BaseModel):
    heater_should_be_on: bool
    current_temperature: float
    target_temperature: float
    pid_output: float
    error: float
    pid_parameters: dict

def get_pid_controller(target_temp: float, kp: float = 1.0, ki: float = 0.1, kd: float = 0.05, 
                      sample_time: float = 1.0, output_limits: tuple = (0, 1)):
    """Get or create PID controller with specified parameters"""
    global _pid_controller, _last_update_time
    
    # Create new controller if parameters changed or controller doesn't exist
    if (_pid_controller is None or 
        _pid_controller.setpoint != target_temp or
        _pid_controller.tunings != (kp, ki, kd) or
        _pid_controller.sample_time != sample_time or
        _pid_controller.output_limits != output_limits):
        
        _pid_controller = PID(kp, ki, kd, setpoint=target_temp)
        _pid_controller.sample_time = sample_time
        _pid_controller.output_limits = output_limits
        _last_update_time = time.time()
        
        logger.info(f"Created new PID controller: target={target_temp}°C, Kp={kp}, Ki={ki}, Kd={kd}")
    
    return _pid_controller

@router.post("/heater/control", response_model=HeaterControlResponse)
def control_heater(request: HeaterControlRequest):
    """
    Determine if heater should be on based on current temperature and target temperature using PID control.
    
    Args:
        request: HeaterControlRequest containing target temperature and PID parameters
        
    Returns:
        HeaterControlResponse with heater status and control information
    """
    logger.info(f"Heater control requested: target={request.target_temperature}°C")
    
    try:
        # Get current temperature from sensor
        sensor = get_sensor()
        current_temp = sensor.temperature()
        
        # Get PID controller
        pid = get_pid_controller(
            target_temp=request.target_temperature,
            kp=request.kp,
            ki=request.ki,
            kd=request.kd,
            sample_time=request.sample_time,
            output_limits=request.output_limits
        )
        
        # Calculate PID output
        pid_output = pid(current_temp)
        
        # Determine if heater should be on (output > 0.5 threshold)
        heater_should_be_on = pid_output > 0.5
        
        # Calculate error
        error = request.target_temperature - current_temp
        
        response = HeaterControlResponse(
            heater_should_be_on=heater_should_be_on,
            current_temperature=current_temp,
            target_temperature=request.target_temperature,
            pid_output=pid_output,
            error=error,
            pid_parameters={
                "kp": request.kp,
                "ki": request.ki,
                "kd": request.kd,
                "sample_time": request.sample_time,
                "output_limits": request.output_limits
            }
        )
        
        logger.info(f"Heater control: current={current_temp:.2f}°C, target={request.target_temperature}°C, "
                   f"output={pid_output:.3f}, heater_on={heater_should_be_on}")
        
        return response
        
    except Exception as e:
        logger.error(f"Failed to control heater: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/heater/control", response_model=HeaterControlResponse)
def control_heater_get(
    target_temperature: float = Query(..., description="Target temperature in Celsius"),
    kp: float = Query(1.0, description="Proportional gain"),
    ki: float = Query(0.1, description="Integral gain"),
    kd: float = Query(0.05, description="Derivative gain"),
    sample_time: float = Query(1.0, description="Sample time in seconds"),
    output_limits_min: float = Query(0.0, description="Minimum output limit"),
    output_limits_max: float = Query(1.0, description="Maximum output limit")
):
    """
    GET version of heater control endpoint for simple queries.
    
    Args:
        target_temperature: Target temperature in Celsius
        kp: Proportional gain (default: 1.0)
        ki: Integral gain (default: 0.1)
        kd: Derivative gain (default: 0.05)
        sample_time: Sample time in seconds (default: 1.0)
        output_limits_min: Minimum output limit (default: 0.0)
        output_limits_max: Maximum output limit (default: 1.0)
        
    Returns:
        HeaterControlResponse with heater status and control information
    """
    request = HeaterControlRequest(
        target_temperature=target_temperature,
        kp=kp,
        ki=ki,
        kd=kd,
        sample_time=sample_time,
        output_limits=(output_limits_min, output_limits_max)
    )
    
    return control_heater(request)

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
