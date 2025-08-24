from fastapi import APIRouter, HTTPException
from datetime import datetime
from hardware import HARDWARE_AVAILABLE, get_sensor
from logger import logger, get_logs

router = APIRouter()

@router.get("/spi-test")
def test_spi_direct():
    """Test SPI access directly using spidev library"""
    logger.info("Direct SPI test requested")
    
    test_results = {}
    
    try:
        # Test importing spidev
        try:
            import spidev
            test_results["spidev_import"] = "SUCCESS"
            logger.info("spidev library imported successfully")
        except ImportError as e:
            test_results["spidev_import"] = f"FAILED: {e}"
            logger.error(f"Failed to import spidev: {e}")
            return {
                "timestamp": datetime.now().isoformat(),
                "test_results": test_results,
                "error": "spidev library not available"
            }
        
        # Test opening SPI device 0.1 (CE1)
        try:
            spi = spidev.SpiDev()
            spi.open(0, 1)  # Bus 0, Device 1 (CE1)
            test_results["spi_open_0_1"] = "SUCCESS"
            logger.info("Successfully opened SPI device 0.1")
            
            # Test basic SPI communication
            try:
                # Try to read some bytes (this might fail if no device is connected)
                response = spi.xfer([0x00, 0x00, 0x00, 0x00])
                test_results["spi_communication"] = f"SUCCESS: Response {response}"
                logger.info(f"SPI communication successful: {response}")
            except Exception as e:
                test_results["spi_communication"] = f"FAILED: {e}"
                logger.warning(f"SPI communication failed (might be normal if no device): {e}")
            
            spi.close()
        except Exception as e:
            test_results["spi_open_0_1"] = f"FAILED: {e}"
            logger.error(f"Failed to open SPI device 0.1: {e}")
        
        # Test opening SPI device 0.0 (CE0)
        try:
            spi = spidev.SpiDev()
            spi.open(0, 0)  # Bus 0, Device 0 (CE0)
            test_results["spi_open_0_0"] = "SUCCESS"
            logger.info("Successfully opened SPI device 0.0")
            spi.close()
        except Exception as e:
            test_results["spi_open_0_0"] = f"FAILED: {e}"
            logger.error(f"Failed to open SPI device 0.0: {e}")
        
        # Test SPI device 10.0 (if available)
        try:
            spi = spidev.SpiDev()
            spi.open(10, 0)  # Bus 10, Device 0
            test_results["spi_open_10_0"] = "SUCCESS"
            logger.info("Successfully opened SPI device 10.0")
            spi.close()
        except Exception as e:
            test_results["spi_open_10_0"] = f"FAILED: {e}"
            logger.error(f"Failed to open SPI device 10.0: {e}")
        
        return {
            "timestamp": datetime.now().isoformat(),
            "test_results": test_results,
            "summary": {
                "spidev_available": test_results.get("spidev_import") == "SUCCESS",
                "spi_devices_accessible": any("SUCCESS" in str(v) for v in test_results.values() if "spi_open" in str(v))
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to test SPI directly: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to test SPI directly: {e}")

@router.get("/logs")
def get_logs_endpoint():
    """Get recent application logs for debugging"""
    logs_data = get_logs()
    logs_data["timestamp"] = datetime.now().isoformat()
    return logs_data

@router.get("/debug/max31865")
def debug_max31865():
    """Debug MAX31865 sensor state and diagnostics"""
    logger.info("MAX31865 debug requested")
    
    if not HARDWARE_AVAILABLE:
        raise HTTPException(status_code=500, detail="Hardware libraries not available")
    
    try:
        sensor = get_sensor()
        
        # Get basic sensor info
        debug_info = {
            "timestamp": datetime.now().isoformat(),
            "sensor_type": "MAX31865",
            "hardware_available": HARDWARE_AVAILABLE
        }
        
        # Get temperature reading
        try:
            temp = sensor.sensor.temperature
            debug_info["temperature_celsius"] = temp
            debug_info["temperature_valid"] = -200 <= temp <= 850
        except Exception as e:
            debug_info["temperature_error"] = str(e)
            debug_info["temperature_celsius"] = None
            debug_info["temperature_valid"] = False
        
        # Get resistance reading
        try:
            resistance = sensor.sensor.resistance
            debug_info["resistance_ohms"] = resistance
        except Exception as e:
            debug_info["resistance_error"] = str(e)
            debug_info["resistance_ohms"] = None
        
        # Get raw RTD reading
        try:
            rtd_raw = sensor.sensor.read_rtd()
            debug_info["rtd_raw_value"] = rtd_raw
        except Exception as e:
            debug_info["rtd_raw_error"] = str(e)
            debug_info["rtd_raw_value"] = None
        
        # Get fault status
        try:
            fault = sensor.sensor.fault
            if fault:
                debug_info["fault_detected"] = True
                debug_info["fault_details"] = {
                    "HIGHTHRESH": fault[0],  # RTD resistance above high threshold
                    "LOWTHRESH": fault[1],   # RTD resistance below low threshold
                    "REFINLOW": fault[2],    # REFIN- < 0.85 × VBIAS
                    "REFINHIGH": fault[3],   # REFIN- > 0.85 × VBIAS
                    "RTDINLOW": fault[4],    # RTDIN- < 0.85 × VBIAS
                    "OVUV": fault[5]         # Overvoltage/undervoltage
                }
                
                # Clear faults after reading
                sensor.sensor.clear_faults()
                debug_info["faults_cleared"] = True
            else:
                debug_info["fault_detected"] = False
                debug_info["fault_details"] = None
        except Exception as e:
            debug_info["fault_error"] = str(e)
            debug_info["fault_detected"] = None
        
        # Get sensor configuration
        try:
            debug_info["sensor_config"] = {
                "auto_convert": sensor.sensor.auto_convert,
                "bias": sensor.sensor.bias,
                "rtd_nominal": sensor.sensor._rtd_nominal,
                "ref_resistor": sensor.sensor._ref_resistor,
                "wires": sensor.sensor._wires
            }
        except Exception as e:
            debug_info["config_error"] = str(e)
        
        # Add diagnostic recommendations
        debug_info["diagnostics"] = []
        
        if debug_info.get("temperature_celsius") is not None:
            temp = debug_info["temperature_celsius"]
            if temp < -200:
                debug_info["diagnostics"].append("Temperature below -200°C: Check sensor wiring and connections")
            elif temp > 850:
                debug_info["diagnostics"].append("Temperature above 850°C: Check sensor type configuration (PT100 vs PT1000)")
        
        if debug_info.get("fault_detected"):
            debug_info["diagnostics"].append("Sensor fault detected: Check wiring and sensor connections")
        
        if debug_info.get("resistance_ohms") is not None:
            resistance = debug_info["resistance_ohms"]
            if resistance < 50:
                debug_info["diagnostics"].append("Resistance too low: Check for short circuit or wrong sensor type")
            elif resistance > 10000:
                debug_info["diagnostics"].append("Resistance too high: Check for open circuit or loose connections")
        
        logger.info(f"MAX31865 debug completed: {debug_info}")
        return debug_info
        
    except Exception as e:
        logger.error(f"Failed to get MAX31865 debug info: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get debug info: {e}")

@router.get("/debug/max31865/clear-faults")
def clear_max31865_faults():
    """Clear MAX31865 fault state"""
    logger.info("MAX31865 clear faults requested")
    
    if not HARDWARE_AVAILABLE:
        raise HTTPException(status_code=500, detail="Hardware libraries not available")
    
    try:
        sensor = get_sensor()
        sensor.sensor.clear_faults()
        logger.info("MAX31865 faults cleared")
        return {"message": "Faults cleared successfully", "timestamp": datetime.now().isoformat()}
    except Exception as e:
        logger.error(f"Failed to clear MAX31865 faults: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to clear faults: {e}")
