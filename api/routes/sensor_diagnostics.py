from fastapi import APIRouter, HTTPException
from hardware import get_sensor
from logger import logger

# Create router for sensor diagnostics
router = APIRouter()

@router.get('/sensor/status')
def get_sensor_status():
    """Get comprehensive sensor status including faults and configuration"""
    try:
        sensor = get_sensor()
        status = sensor.get_sensor_status()
        
        return {
            "success": True,
            "sensor_status": status
        }
    except Exception as e:
        logger.error(f"Error getting sensor status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/sensor/clear-faults')
def clear_sensor_faults():
    """Clear sensor faults"""
    try:
        sensor = get_sensor()
        success = sensor.clear_faults()
        
        if success:
            return {
                "success": True,
                "message": "Sensor faults cleared successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to clear sensor faults")
            
    except Exception as e:
        logger.error(f"Error clearing sensor faults: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/sensor/diagnose')
def diagnose_sensor():
    """Perform comprehensive sensor diagnostics"""
    try:
        sensor = get_sensor()
        
        # Get current status
        status = sensor.get_sensor_status()
        
        # Try to read temperature
        try:
            temp = sensor.temperature()
            temperature_ok = -200 <= temp <= 850
        except Exception as e:
            temp = None
            temperature_ok = False
            logger.error(f"Temperature read failed: {e}")
        
        # Check for faults
        faults_present = status.get("faults") and any(status["faults"])
        
        # Determine overall health
        health_status = "healthy"
        if faults_present:
            health_status = "faulty"
        elif not temperature_ok:
            health_status = "degraded"
        
        diagnostics = {
            "overall_health": health_status,
            "temperature_reading": temp,
            "temperature_valid": temperature_ok,
            "faults_present": faults_present,
            "sensor_status": status,
            "recommendations": []
        }
        
        # Add recommendations based on status
        if faults_present:
            diagnostics["recommendations"].extend([
                "Check RTD sensor wiring connections",
                "Verify sensor is not damaged or disconnected", 
                "Confirm reference resistor value matches configuration",
                "Check power supply voltage (3.3V or 5V)",
                "Try clearing faults and re-testing"
            ])
        
        if not temperature_ok and temp is not None:
            diagnostics["recommendations"].append("Temperature reading is outside valid range - check sensor calibration")
        
        if health_status == "healthy":
            diagnostics["recommendations"].append("Sensor appears to be functioning normally")
        
        return {
            "success": True,
            "diagnostics": diagnostics
        }
        
    except Exception as e:
        logger.error(f"Error performing sensor diagnostics: {e}")
        raise HTTPException(status_code=500, detail=str(e))
