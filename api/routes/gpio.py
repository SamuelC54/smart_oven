from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from hardware import set_gpio, HARDWARE_AVAILABLE, get_sensor
from logger import logger
from config import CS_NAME, RTD_NOMINAL, REF_RESISTOR, WIRES
from datetime import datetime

router = APIRouter()

class GPIORequest(BaseModel):
    pin: int
    state: bool

@router.post("/gpio")
def set_gpio_endpoint(request: GPIORequest):
    logger.info(f"GPIO control requested: pin {request.pin} -> {request.state}")
    try:
        set_gpio(request.pin, request.state)
        return {"message": f"GPIO {request.pin} set to {request.state}"}
    except Exception as e:
        logger.error(f"Failed to set GPIO {request.pin}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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

@router.get("/gpio-status")
def get_gpio_status():
    """Get current GPIO status and usage information"""
    logger.info("GPIO status requested")
    
    try:
        import subprocess
        # Get SPI device status
        spi_devices = []
        try:
            spi_result = subprocess.run(['ls', '-la', '/dev/spidev*'], capture_output=True, text=True, timeout=10)
            if spi_result.returncode == 0:
                spi_devices = spi_result.stdout.strip().split('\n')
        except:
            spi_devices = ["Failed to check SPI devices"]
        
        # Get GPIO sysfs information
        gpio_info = {}
        try:
            # Check GPIO sysfs
            gpio_result = subprocess.run(['ls', '-la', '/sys/class/gpio/'], capture_output=True, text=True, timeout=10)
            if gpio_result.returncode == 0:
                gpio_info['sysfs_gpio'] = gpio_result.stdout
            else:
                gpio_info['sysfs_gpio'] = "Failed to access GPIO sysfs"
        except:
            gpio_info['sysfs_gpio'] = "GPIO sysfs not accessible"
        
        # Check if specific GPIO pins are exported
        try:
            for pin in [7, 8, 9, 10, 11]:  # SPI pins (added GPIO 7 for CE1)
                pin_result = subprocess.run(['ls', f'/sys/class/gpio/gpio{pin}'], capture_output=True, text=True, timeout=5)
                gpio_info[f'gpio{pin}_exported'] = pin_result.returncode == 0
        except:
            gpio_info['pin_check'] = "Failed to check GPIO pins"
        
                 # Get current sensor configuration
         try:
             sensor = get_sensor()
             sensor_initialized = sensor is not None
         except:
             sensor_initialized = False
         
         sensor_config = {
             "rtd_nominal": RTD_NOMINAL,
             "ref_resistor": REF_RESISTOR,
             "wires": WIRES,
             "cs_name": CS_NAME,
             "sensor_initialized": sensor_initialized
         }
        
        # Try to get basic system info
        system_info = {}
        try:
            # Check if we're running in a container
            container_result = subprocess.run(['cat', '/proc/1/cgroup'], capture_output=True, text=True, timeout=5)
            if container_result.returncode == 0:
                system_info['container'] = 'docker' in container_result.stdout.lower()
            else:
                system_info['container'] = "Unknown"
        except:
            system_info['container'] = "Unknown"
        
        # Check if gpiomem device exists and is accessible
        try:
            gpiomem_result = subprocess.run(['ls', '-la', '/dev/gpiomem'], capture_output=True, text=True, timeout=5)
            if gpiomem_result.returncode == 0:
                system_info['gpiomem_accessible'] = True
                system_info['gpiomem_info'] = gpiomem_result.stdout.strip()
            else:
                system_info['gpiomem_accessible'] = False
        except:
            system_info['gpiomem_accessible'] = False
        
        return {
            "timestamp": datetime.now().isoformat(),
            "gpio_info": gpio_info,
            "spi_devices": spi_devices,
            "sensor_config": sensor_config,
            "system_info": system_info,
            "hardware_available": HARDWARE_AVAILABLE
        }
        
    except subprocess.TimeoutExpired:
        logger.error("Timeout getting GPIO status.")
        raise HTTPException(status_code=500, detail="Timeout getting GPIO status")
    except Exception as e:
        logger.error(f"Failed to get GPIO status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get GPIO status: {e}")
