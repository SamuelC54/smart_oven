from logger import logger
from hardware import HARDWARE_AVAILABLE

def set_gpio_pin(pin: int, state: bool):
    """Set GPIO pin state - requires hardware to be available"""
    if not HARDWARE_AVAILABLE:
        raise RuntimeError("GPIO hardware not available")
    
    try:
        import RPi.GPIO as GPIO
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(pin, GPIO.OUT)
        GPIO.output(pin, GPIO.HIGH if state else GPIO.LOW)
        logger.info(f"GPIO pin {pin} set to {'HIGH' if state else 'LOW'}")
    except Exception as e:
        logger.error(f"Failed to set GPIO pin {pin}: {e}")
        raise
