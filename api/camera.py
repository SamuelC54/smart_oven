# --- Camera imports with error handling ---
try:
    from picamera2 import Picamera2
    import cv2
    import numpy as np
    CAMERA_AVAILABLE = True
except ImportError as e:
    CAMERA_AVAILABLE = False
except Exception as e:
    CAMERA_AVAILABLE = False

# Import logger after hardware imports to avoid circular imports
from logger import logger
import time
import threading
import io
from typing import Optional, Generator

# Now log the camera status
if CAMERA_AVAILABLE:
    logger.info("Camera libraries imported successfully")
else:
    logger.error("Failed to import camera libraries - picamera2 and opencv-python required")

# --- Global camera instance ---
_camera = None
_camera_lock = threading.Lock()

class CameraManager:
    """Camera management using picamera2"""
    
    def __init__(self, resolution=(640, 480), framerate=30):
        """Initialize camera with specified resolution and framerate"""
        self.resolution = resolution
        self.framerate = framerate
        self.camera = None
        self.is_streaming = False
        
        if not CAMERA_AVAILABLE:
            raise Exception("Camera libraries not available")
        
        try:
            # Initialize picamera2
            self.camera = Picamera2()
            
            # Configure camera
            config = self.camera.create_video_configuration(
                main={"size": self.resolution, "format": "RGB888"}
            )
            self.camera.configure(config)
            
            logger.info(f"Camera initialized with resolution {self.resolution} at {self.framerate}fps")
            
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
            logger.info("Camera started successfully")
        except Exception as e:
            logger.error(f"Failed to start camera: {e}")
            raise
    
    def stop(self):
        """Stop the camera"""
        if self.camera and self.is_streaming:
            try:
                self.camera.stop()
                self.is_streaming = False
                logger.info("Camera stopped successfully")
            except Exception as e:
                logger.error(f"Error stopping camera: {e}")
    
    def capture_frame(self) -> Optional[np.ndarray]:
        """Capture a single frame from the camera"""
        if not self.camera or not self.is_streaming:
            return None
        
        try:
            # Capture array directly from picamera2
            frame = self.camera.capture_array()
            return frame
        except Exception as e:
            logger.error(f"Error capturing frame: {e}")
            return None
    
    def capture_jpeg(self, quality: int = 85) -> Optional[bytes]:
        """Capture a frame and encode as JPEG"""
        frame = self.capture_frame()
        if frame is None:
            return None
        
        try:
            # Convert RGB to BGR for OpenCV
            frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
            
            # Encode as JPEG
            encode_params = [cv2.IMWRITE_JPEG_QUALITY, quality]
            success, encoded_img = cv2.imencode('.jpg', frame_bgr, encode_params)
            
            if success:
                return encoded_img.tobytes()
            else:
                logger.error("Failed to encode frame as JPEG")
                return None
                
        except Exception as e:
            logger.error(f"Error encoding frame: {e}")
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
        raise Exception("Camera libraries not available")
    
    with _camera_lock:
        if _camera is None:
            logger.info("Initializing camera...")
            try:
                _camera = CameraManager(resolution=(640, 480), framerate=30)
                logger.info("Camera initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize camera: {e}")
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

def diagnose_camera():
    """Diagnose camera access and return detailed information"""
    diagnostics = {
        "camera_available": CAMERA_AVAILABLE,
        "tests": {}
    }
    
    if not CAMERA_AVAILABLE:
        diagnostics["error"] = "Camera libraries not available - install picamera2 and opencv-python"
        return diagnostics
    
    # Test camera initialization
    try:
        test_camera = Picamera2()
        diagnostics["tests"]["camera_init"] = "SUCCESS"
        
        # Test camera configuration
        config = test_camera.create_video_configuration(
            main={"size": (640, 480), "format": "RGB888"}
        )
        test_camera.configure(config)
        diagnostics["tests"]["camera_config"] = "SUCCESS"
        
        # Test camera start/stop
        test_camera.start()
        diagnostics["tests"]["camera_start"] = "SUCCESS"
        
        # Capture a test frame
        frame = test_camera.capture_array()
        if frame is not None:
            diagnostics["tests"]["frame_capture"] = "SUCCESS"
            diagnostics["frame_shape"] = frame.shape
        else:
            diagnostics["tests"]["frame_capture"] = "FAILED: No frame data"
        
        test_camera.stop()
        test_camera.close()
        diagnostics["tests"]["camera_cleanup"] = "SUCCESS"
        
    except Exception as e:
        diagnostics["tests"]["camera_test"] = f"FAILED: {e}"
    
    return diagnostics
