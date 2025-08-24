from fastapi import APIRouter, HTTPException
from datetime import datetime
from ..hardware import get_sensor, HARDWARE_AVAILABLE
from ..logger import logger

router = APIRouter()

@router.get("/temp")
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

@router.get("/sensor-debug")
def debug_sensor():
    """Debug endpoint to see raw sensor data"""
    logger.info("Sensor debug requested")
    try:
        sensor = get_sensor()
        
        # Read raw registers
        config = sensor._read_register(0x00)
        rtd_msb = sensor._read_register(0x01)
        rtd_lsb = sensor._read_register(0x02)
        rtd_mid = sensor._read_register(0x03)
        fault = sensor._read_register(0x07)
        
        # Calculate raw RTD value
        rtd_raw = (rtd_msb << 16) | (rtd_mid << 8) | rtd_lsb
        fault_bit = rtd_raw & 0x01  # Check if fault bit is set
        rtd_raw_shifted = rtd_raw >> 1  # Remove fault bit
        
        # Calculate resistance
        rtd_resistance = rtd_raw_shifted * sensor.ref_resistor / 32768.0
        
        # Diagnose the issue
        diagnosis = {}
        if rtd_resistance > 10000:
            diagnosis["issue"] = "Open circuit or wiring problem"
            diagnosis["expected"] = "~100 Ω (PT100 at room temperature)"
            diagnosis["actual"] = f"{rtd_resistance:.1f} Ω"
            diagnosis["suggestion"] = "Check wiring connections to RTD sensor"
        elif rtd_resistance < 10:
            diagnosis["issue"] = "Short circuit"
            diagnosis["expected"] = "~100 Ω (PT100 at room temperature)"
            diagnosis["actual"] = f"{rtd_resistance:.1f} Ω"
            diagnosis["suggestion"] = "Check for shorted wires"
        elif 50 < rtd_resistance < 150:
            diagnosis["issue"] = "Normal reading"
            diagnosis["expected"] = "~100 Ω (PT100 at room temperature)"
            diagnosis["actual"] = f"{rtd_resistance:.1f} Ω"
            diagnosis["suggestion"] = "Sensor working correctly"
        else:
            diagnosis["issue"] = "Unexpected resistance"
            diagnosis["expected"] = "~100 Ω (PT100 at room temperature)"
            diagnosis["actual"] = f"{rtd_resistance:.1f} Ω"
            diagnosis["suggestion"] = "Check sensor type and wiring"
        
        return {
            "timestamp": datetime.now().isoformat(),
            "registers": {
                "config": f"0x{config:02X}",
                "rtd_msb": f"0x{rtd_msb:02X}",
                "rtd_mid": f"0x{rtd_mid:02X}", 
                "rtd_lsb": f"0x{rtd_lsb:02X}",
                "fault": f"0x{fault:02X}"
            },
            "raw_values": {
                "rtd_raw": rtd_raw,
                "rtd_raw_shifted": rtd_raw_shifted,
                "fault_bit_set": bool(fault_bit),
                "rtd_resistance_ohms": rtd_resistance,
                "ref_resistor": sensor.ref_resistor,
                "rtd_nominal": sensor.rtd_nominal,
                "wires": sensor.wires
            },
            "config_bits": {
                "bias_voltage": bool(config & 0x80),
                "conversion": bool(config & 0x20),
                "3_wire": bool(config & 0x10),
                "fault_cycle": bool(config & 0x08),
                "fault_status": bool(config & 0x04),
                "filter_50hz": bool(config & 0x01)
            },
            "diagnosis": diagnosis
        }
    except Exception as e:
        logger.error(f"Failed to debug sensor: {e}")
        raise HTTPException(status_code=500, detail=str(e))
