from fastapi import APIRouter, HTTPException
from datetime import datetime
from ..hardware import HARDWARE_AVAILABLE
from ..logger import logger, get_logs

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
