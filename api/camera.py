# Import logger first to avoid circular imports
from logger import logger
import time
import threading
import io
from typing import Optional, Generator
import numpy as np

# --- Camera imports with error handling ---
try:
    from picamera2 import Picamera2
    CAMERA_AVAILABLE = True
    logger.info("Picamera2 imported successfully")
except ImportError as e:
    CAMERA_AVAILABLE = False
    logger.info("Picamera2 not available in container environment (import error):" + str(e))
except Exception as e:
    CAMERA_AVAILABLE = False
    logger.info("Picamera2 not available in container environment (general error):" + str(e))

# --- Global camera instance ---
_camera = None
_camera_lock = threading.Lock()
class CameraManager:
    """Camera management using simple Picamera2"""
    
    def __init__(self, resolution=(1024, 576), framerate=30):
        """Initialize camera with specified resolution and framerate"""
        self.resolution = resolution
        self.framerate = framerate
        self.camera = None
        self.is_streaming = False
        
        if not CAMERA_AVAILABLE:
            raise Exception("Picamera2 not available")
        
        try:
            # Simple Picamera2 initialization
            self.camera = Picamera2()
            logger.info(f"Picamera2 initialized with resolution {resolution} at {framerate}fps")
                
        except Exception as e:
            logger.error(f"Failed to initialize camera: {e}")
            raise
    
    def start(self):
        """Start the camera"""
        if not self.camera:
            raise Exception("Camera not initialized")
        
        try:
            self.camera.start()
            self.is_streaming = True
            logger.info("Picamera2 started successfully")
        except Exception as e:
            logger.error(f"Failed to start camera: {e}")
            raise
    
    def stop(self):
        """Stop the camera"""
        if self.camera and self.is_streaming:
            try:
                self.camera.stop()
                self.is_streaming = False
                logger.info("Picamera2 stopped successfully")
            except Exception as e:
                logger.error(f"Error stopping camera: {e}")
    
    def capture_frame(self) -> Optional[np.ndarray]:
        """Capture a single frame from the camera"""
        if not self.camera or not self.is_streaming:
            return None
        
        try:
            frame = self.camera.capture_array()
            return frame
        except Exception as e:
            logger.error(f"Error capturing frame: {e}")
            return None
    
    def capture_jpeg(self, quality: int = 85) -> Optional[bytes]:
        """Capture a frame and encode as JPEG"""
        if not self.camera or not self.is_streaming:
            return None
        
        try:
            # Use Picamera2's built-in JPEG capture
            buffer = io.BytesIO()
            self.camera.capture_file(buffer, format='jpeg')
            return buffer.getvalue()
        except Exception as e:
            logger.error(f"Error capturing JPEG: {e}")
            return None
    
    def get_mjpeg_stream(self, quality: int = 85) -> Generator[bytes, None, None]:
        """Generate MJPEG stream for video streaming"""
        if not self.is_streaming:
            self.start()
        
        while self.is_streaming:
            try:
                jpeg_data = self.capture_jpeg(quality)
                if jpeg_data:
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + jpeg_data + b'\r\n')
                else:
                    # If capture fails, wait a bit before trying again
                    time.sleep(0.1)
                    
            except Exception as e:
                logger.error(f"Error in MJPEG stream: {e}")
                break
    
    def close(self):
        """Clean up camera resources"""
        self.stop()
        if self.camera:
            try:
                self.camera.close()
                logger.info("Camera closed successfully")
            except Exception as e:
                logger.error(f"Error closing camera: {e}")

def get_camera() -> CameraManager:
    """Get global camera instance"""
    global _camera
    
    if not CAMERA_AVAILABLE:
        raise Exception("Picamera2 not available in container environment")
    
    with _camera_lock:
        if _camera is None:
            logger.info("Initializing camera...")
            try:
                _camera = CameraManager(resolution=(1024, 576), framerate=30)
                logger.info("Camera initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize camera hardware: {e}")
                raise
    
    return _camera

def get_camera_info():
    """Get camera availability and status information"""
    return {
        "camera_available": CAMERA_AVAILABLE,
        "is_streaming": _camera.is_streaming if _camera else False,
        "resolution": _camera.resolution if _camera else None,
        "framerate": _camera.framerate if _camera else None
    }

def diagnose_camera(max_devices: int = 20):
    """Diagnose camera access and return detailed information"""
    diagnostics = {
        "camera_available": CAMERA_AVAILABLE,
        "tests": {}
    }
    
    # Test video device access FIRST (regardless of library availability)
    import os
    import glob
    
    # Method 1: Check using glob pattern (more comprehensive)
    video_devices_glob = glob.glob('/dev/video*')
    video_devices_glob.sort()
    
    # Method 2: Check specific range with configurable limit
    video_devices_range = []
    for i in range(max_devices):  # Check /dev/video0 through /dev/video{max_devices-1}
        device_path = f"/dev/video{i}"
        if os.path.exists(device_path):
            video_devices_range.append(device_path)
    
    # Use glob results as primary, range as backup verification
    video_devices = video_devices_glob if video_devices_glob else video_devices_range
    
    diagnostics["video_devices"] = video_devices
    diagnostics["video_devices_count"] = len(video_devices)
    
    # Also show device permissions and info
    device_info = {}
    for device in video_devices:
        try:
            stat = os.stat(device)
            device_info[device] = {
                "exists": True,
                "readable": os.access(device, os.R_OK),
                "writable": os.access(device, os.W_OK),
                "mode": oct(stat.st_mode)[-3:]
            }
        except Exception as e:
            device_info[device] = {"exists": True, "error": str(e)}
    
    diagnostics["device_info"] = device_info
    
    if not video_devices:
        diagnostics["tests"]["device_check"] = "FAILED: No video devices found"
    else:
        diagnostics["tests"]["device_check"] = f"SUCCESS: Found {len(video_devices)} video devices"
    
    # If no camera libraries available, return early BUT with device info
    if not CAMERA_AVAILABLE:
        diagnostics["error"] = "Camera libraries not available in container environment. This is expected - camera will work when hardware is connected."
        return diagnostics
    
    # Test simple Picamera2 approach
    if CAMERA_AVAILABLE:
        working_devices = []
        
        # Test simple Picamera2 initialization
        try:
            # Simple initialization like your example
            test_camera = Picamera2()
            test_camera.start()
            
            # Allow camera to initialize
            time.sleep(0.1)
            
            # Try to capture a frame
            try:
                frame = test_camera.capture_array()
                if frame is not None and frame.size > 0:
                    working_devices.append({
                        "device": "picamera2",
                        "frame_shape": frame.shape,
                        "status": "SUCCESS"
                    })
                    diagnostics["tests"]["picamera2_simple"] = f"SUCCESS - Frame shape {frame.shape}"
                else:
                    diagnostics["tests"]["picamera2_simple"] = "FAILED: Could not capture frame"
            except Exception as e:
                diagnostics["tests"]["picamera2_simple"] = f"FAILED: Frame capture error - {e}"
                
            test_camera.stop()
            test_camera.close()
                
        except Exception as e:
            diagnostics["tests"]["picamera2_simple"] = f"FAILED: {e}"
        
        diagnostics["working_devices"] = working_devices
        
        # Overall result
        if working_devices:
            diagnostics["tests"]["camera_capture"] = f"SUCCESS: Simple Picamera2 works!"
            diagnostics["recommended_device"] = working_devices[0]
        else:
            diagnostics["tests"]["camera_capture"] = "FAILED: Picamera2 not working"
    
    return diagnostics
