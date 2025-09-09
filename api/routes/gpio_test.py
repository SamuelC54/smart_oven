from fastapi import APIRouter
from hardware import HARDWARE_AVAILABLE, get_sensor
from logger import logger
from config import CS_NAME, RTD_NOMINAL, REF_RESISTOR, WIRES
from datetime import datetime

router = APIRouter()

@router.get("/gpio-test")
def test_gpio_access():
    """Test direct GPIO access to debug busy issues"""
    logger.info("GPIO test requested")
    
    if not HARDWARE_AVAILABLE:
        return {"error": "Hardware libraries not available"}
    
    test_results = {}
    
    try:
        # Test basic GPIO access
        logger.info("Testing basic GPIO access...")
        import digitalio, board
        test_pin = digitalio.DigitalInOut(board.D18)
        test_pin.direction = digitalio.Direction.OUTPUT
        test_pin.value = True
        test_pin.value = False
        test_pin.deinit()
        test_results["basic_gpio"] = "SUCCESS"
        logger.info("Basic GPIO test passed")
    except Exception as e:
        test_results["basic_gpio"] = f"FAILED: {e}"
        logger.error(f"Basic GPIO test failed: {e}")
    
    try:
        # Test SPI access
        logger.info("Testing SPI access...")
        import busio, board
        spi = busio.SPI(board.SCLK, MOSI=board.MOSI, MISO=board.MISO)
        test_results["spi"] = "SUCCESS"
        logger.info("SPI test passed")
    except Exception as e:
        test_results["spi"] = f"FAILED: {e}"
        logger.error(f"SPI test failed: {e}")
    
    try:
        # Test CS pin access
        logger.info(f"Testing CS pin {CS_NAME}...")
        import digitalio, board
        if CS_NAME == "CE0":
            cs = digitalio.DigitalInOut(board.CE0)
        elif CS_NAME == "CE1":
            cs = digitalio.DigitalInOut(board.CE1)
        else:
            raise ValueError(f"Invalid CS name: {CS_NAME}")
        
        test_results["cs_pin"] = "SUCCESS"
        logger.info(f"CS pin {CS_NAME} test passed")
    except Exception as e:
        test_results["cs_pin"] = f"FAILED: {e}"
        logger.error(f"CS pin test failed: {e}")
    
    try:
        # Test sensor initialization
        logger.info("Testing sensor initialization...")
        if test_results.get("spi") == "SUCCESS" and test_results.get("cs_pin") == "SUCCESS":
            import busio, digitalio, board, adafruit_max31865
            spi = busio.SPI(board.SCLK, MOSI=board.MOSI, MISO=board.MISO)
            if CS_NAME == "CE0":
                cs = digitalio.DigitalInOut(board.CE0)
            elif CS_NAME == "CE1":
                cs = digitalio.DigitalInOut(board.CE1)
            
            sensor = adafruit_max31865.MAX31865(spi, cs, rtd_nominal=RTD_NOMINAL, ref_resistor=REF_RESISTOR, wires=WIRES)
            temp = sensor.temperature
            test_results["sensor"] = f"SUCCESS: {temp}°C"
            logger.info(f"Sensor test passed: {temp}°C")
        else:
            test_results["sensor"] = "SKIPPED: SPI or CS pin failed"
    except Exception as e:
        test_results["sensor"] = f"FAILED: {e}"
        logger.error(f"Sensor test failed: {e}")
    
    return {
        "timestamp": datetime.now().isoformat(),
        "test_results": test_results,
        "config": {
            "wires": WIRES,
            "cs_name": CS_NAME,
            "rtd_nominal": RTD_NOMINAL,
            "ref_resistor": REF_RESISTOR
        }
    }
