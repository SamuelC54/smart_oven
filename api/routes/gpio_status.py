from fastapi import APIRouter, HTTPException
from hardware import HARDWARE_AVAILABLE, get_sensor
from logger import logger
from config import CS_NAME, RTD_NOMINAL, REF_RESISTOR, WIRES
from datetime import datetime

router = APIRouter()

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
