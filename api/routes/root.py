from fastapi import APIRouter
from hardware import HARDWARE_AVAILABLE
from logger import logger

router = APIRouter()

@router.get("/")
def root():
    """Simple test endpoint that doesn't require hardware"""
    logger.info("Root endpoint accessed")
    return {"message": "Smart Oven API is running", "hardware_available": HARDWARE_AVAILABLE}
