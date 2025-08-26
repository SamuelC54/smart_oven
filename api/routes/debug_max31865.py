from fastapi import APIRouter, HTTPException
from datetime import datetime
from hardware import HARDWARE_AVAILABLE, get_sensor
from logger import logger

router = APIRouter()

@router.get("/debug/max31865")
def debug_max31865():
    """Debug MAX31865 sensor state and diagnostics"""
    logger.info("MAX31865 debug requested")
    
    if not HARDWARE_AVAILABLE:
        raise HTTPException(status_code=500, detail="Hardware libraries not available")
    
    try:
        sensor = get_sensor()
        if sensor is None:
            raise HTTPException(status_code=500, detail="Sensor not initialized")
        
        # Get sensor configuration
        sensor_info = {
            "rtd_nominal": sensor.rtd_nominal,
            "ref_resistor": sensor.ref_resistor,
            "wires": sensor.wires,
            "cs_name": "CE1"  # Assuming CE1 based on config
        }
        
        # Read raw register data
        try:
            config_register = sensor._read_register(0x00)
            rtd_msb = sensor._read_register(0x01)
            rtd_mid = sensor._read_register(0x02)
            rtd_lsb = sensor._read_register(0x03)
            fault_register = sensor._read_register(0x07)
            
            rtd_register = (rtd_msb << 16) | (rtd_mid << 8) | rtd_lsb
            
            raw_data = {
                "config_register": f"0x{config_register:02X}",
                "rtd_register": f"0x{rtd_register:06X}",
                "fault_register": f"0x{fault_register:02X}"
            }
        except Exception as e:
            raw_data = {"error": f"Failed to read registers: {e}"}
        
        # Calculate diagnostics
        try:
            temp = sensor.temperature()
            resistance = sensor.resistance
            
            diagnostics = {
                "fault_detected": False,  # Would need to check fault register
                "fault_type": "None",
                "temperature_valid": temp is not None and not isinstance(temp, Exception),
                "resistance_ohms": resistance
            }
        except Exception as e:
            diagnostics = {
                "fault_detected": True,
                "fault_type": "Temperature reading failed",
                "temperature_valid": False,
                "resistance_ohms": None,
                "error": str(e)
            }
        
        return {
            "timestamp": datetime.now().isoformat(),
            "sensor_info": sensor_info,
            "raw_data": raw_data,
            "diagnostics": diagnostics
        }
        
    except Exception as e:
        logger.error(f"Failed to debug MAX31865: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to debug MAX31865: {e}")
