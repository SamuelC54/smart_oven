from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse
from logger import logger
from camera import get_camera, get_camera_info, diagnose_camera, CAMERA_AVAILABLE
import asyncio
from typing import Optional

router = APIRouter()

@router.get("/camera/info")
async def camera_info():
    """Get camera information and status"""
    try:
        info = get_camera_info()
        logger.info("Camera info requested")
        return {
            "status": "success",
            "data": info
        }
    except Exception as e:
        logger.error(f"Error getting camera info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/camera/diagnose")
async def camera_diagnose():
    """Diagnose camera functionality"""
    try:
        diagnostics = diagnose_camera()
        logger.info("Camera diagnostics requested")
        return {
            "status": "success",
            "data": diagnostics
        }
    except Exception as e:
        logger.error(f"Error running camera diagnostics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/camera/snapshot")
async def camera_snapshot():
    """Capture a single frame as JPEG"""
    if not CAMERA_AVAILABLE:
        raise HTTPException(status_code=503, detail="Camera not available")
    
    try:
        camera = get_camera()
        
        # Start camera if not already started
        if not camera.is_streaming:
            camera.start()
        
        # Capture JPEG frame
        jpeg_data = camera.capture_jpeg(quality=90)
        
        if jpeg_data is None:
            raise HTTPException(status_code=500, detail="Failed to capture frame")
        
        logger.info("Camera snapshot captured")
        return Response(
            content=jpeg_data,
            media_type="image/jpeg",
            headers={"Cache-Control": "no-cache"}
        )
        
    except Exception as e:
        logger.error(f"Error capturing snapshot: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/camera/stream")
async def camera_stream(quality: Optional[int] = 85):
    """Stream camera feed as MJPEG"""
    if not CAMERA_AVAILABLE:
        raise HTTPException(status_code=503, detail="Camera not available")
    
    # Validate quality parameter
    if quality < 1 or quality > 100:
        raise HTTPException(status_code=400, detail="Quality must be between 1 and 100")
    
    try:
        camera = get_camera()
        logger.info(f"Camera stream started with quality {quality}")
        
        return StreamingResponse(
            camera.get_mjpeg_stream(quality=quality),
            media_type="multipart/x-mixed-replace; boundary=frame",
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
                "Connection": "close"
            }
        )
        
    except Exception as e:
        logger.error(f"Error starting camera stream: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/camera/start")
async def camera_start():
    """Start the camera"""
    if not CAMERA_AVAILABLE:
        raise HTTPException(status_code=503, detail="Camera not available")
    
    try:
        camera = get_camera()
        if not camera.is_streaming:
            camera.start()
            logger.info("Camera started via API")
        
        return {
            "status": "success",
            "message": "Camera started",
            "data": get_camera_info()
        }
        
    except Exception as e:
        logger.error(f"Error starting camera: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/camera/stop")
async def camera_stop():
    """Stop the camera"""
    if not CAMERA_AVAILABLE:
        raise HTTPException(status_code=503, detail="Camera not available")
    
    try:
        camera = get_camera()
        if camera.is_streaming:
            camera.stop()
            logger.info("Camera stopped via API")
        
        return {
            "status": "success",
            "message": "Camera stopped",
            "data": get_camera_info()
        }
        
    except Exception as e:
        logger.error(f"Error stopping camera: {e}")
        raise HTTPException(status_code=500, detail=str(e))
