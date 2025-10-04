# Import logger first to avoid circular imports
from logger import logger
import time
import threading
import io
from typing import Optional, Generator

# --- Camera imports with error handling ---
try:
    import cv2
    import numpy as np
    CAMERA_AVAILABLE = True
    logger.info("OpenCV camera libraries imported successfully")
except ImportError as e:
    CAMERA_AVAILABLE = False
    # Create dummy numpy for type hints
    class np:
        ndarray = object
    logger.info("OpenCV libraries not available in container environment (this is expected)")
except Exception as e:
    CAMERA_AVAILABLE = False
    # Create dummy numpy for type hints
    class np:
        ndarray = object
    logger.info("OpenCV libraries not available in container environment (this is expected)")

# Now log the camera status
if CAMERA_AVAILABLE:
    logger.info("Camera libraries imported successfully")
else:
    logger.info("Camera libraries not available in container environment (this is expected)")

# --- Global camera instance ---
_camera = None
_camera_lock = threading.Lock()

class CameraManager:
    """Camera management using OpenCV"""
    
    def __init__(self, resolution=(1024, 576), framerate=30):
        """Initialize camera with specified resolution and framerate"""
        self.resolution = resolution
        self.framerate = framerate
        self.camera = None
        self.is_streaming = False
        
        if not CAMERA_AVAILABLE:
            raise Exception("OpenCV not available")
        
        try:
            # Simple OpenCV initialization
            self.camera = cv2.VideoCapture(0)
            
            if self.camera.isOpened():
                # Set camera properties
                self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, resolution[0])
                self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, resolution[1])
                self.camera.set(cv2.CAP_PROP_FPS, framerate)
                
                # Allow camera to initialize
                time.sleep(0.1)
                
                logger.info(f"OpenCV camera initialized with resolution {resolution} at {framerate}fps")
            else:
                self.camera = None
                raise Exception("Could not open camera with OpenCV")
                
        except Exception as e:
            logger.error(f"Failed to initialize camera: {e}")
            raise
    
    def start(self):
        """Start the camera"""
        if not self.camera:
            raise Exception("Camera not initialized")
        
        # OpenCV camera is ready when opened
        self.is_streaming = True
        logger.info("OpenCV camera ready for streaming")
    
    def stop(self):
        """Stop the camera"""
        if self.camera and self.is_streaming:
            self.is_streaming = False
            logger.info("OpenCV camera stopped")
    
    def capture_frame(self) -> Optional[np.ndarray]:
        """Capture a single frame from the camera"""
        if not self.camera or not self.is_streaming:
            return None
        
        try:
            ret, frame = self.camera.read()
            if ret and frame is not None:
                return frame
            else:
                return None
        except Exception as e:
            logger.error(f"Error capturing frame: {e}")
            return None
    
    def capture_jpeg(self, quality: int = 85) -> Optional[bytes]:
        """Capture a frame and encode as JPEG"""
        frame = self.capture_frame()
        if frame is None:
            return None
        
        try:
            # OpenCV frame is already in BGR format
            encode_params = [cv2.IMWRITE_JPEG_QUALITY, quality]
            success, encoded_img = cv2.imencode('.jpg', frame, encode_params)
            
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
                self.camera.release()
                logger.info("Camera closed successfully")
            except Exception as e:
                logger.error(f"Error closing camera: {e}")

def get_camera() -> CameraManager:
    """Get global camera instance"""
    global _camera
    
    if not CAMERA_AVAILABLE:
        raise Exception("OpenCV not available in container environment")
    
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
    
    # Test OpenCV camera access with simple approach
    if CAMERA_AVAILABLE:
        working_devices = []
        
        # Test simple VideoCapture(0) approach
        try:
            import time
            
            # Initialize video capture - simple approach
            test_camera = cv2.VideoCapture(0)
            
            if test_camera.isOpened():
                # Set properties like your example
                test_camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1024)
                test_camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 576)
                test_camera.set(cv2.CAP_PROP_FPS, 30)
                
                # Allow camera to initialize
                time.sleep(0.1)
                
                # Try multiple frame reads (sometimes first few fail)
                success_count = 0
                last_frame = None
                for attempt in range(5):
                    ret, frame = test_camera.read()
                    if ret and frame is not None and frame.size > 0:
                        success_count += 1
                        last_frame = frame
                    time.sleep(0.05)  # Small delay between attempts
                
                if success_count > 0:
                    # Get actual camera properties
                    actual_width = int(test_camera.get(cv2.CAP_PROP_FRAME_WIDTH))
                    actual_height = int(test_camera.get(cv2.CAP_PROP_FRAME_HEIGHT))
                    actual_fps = test_camera.get(cv2.CAP_PROP_FPS)
                    
                    working_devices.append({
                        "device": "/dev/video0",
                        "index": 0,
                        "frame_shape": last_frame.shape,
                        "actual_resolution": f"{actual_width}x{actual_height}",
                        "actual_fps": actual_fps,
                        "success_rate": f"{success_count}/5",
                        "status": "SUCCESS"
                    })
                    diagnostics["tests"]["opencv_simple"] = f"SUCCESS - {last_frame.shape} ({success_count}/5 frames)"
                else:
                    diagnostics["tests"]["opencv_simple"] = "FAILED: Could not capture frames (0/5 attempts)"
                    
                test_camera.release()
            else:
                diagnostics["tests"]["opencv_simple"] = "FAILED: Could not open VideoCapture(0)"
                
        except Exception as e:
            diagnostics["tests"]["opencv_simple"] = f"FAILED: {e}"
        
        diagnostics["working_opencv_devices"] = working_devices
        
        # Overall result
        if working_devices:
            diagnostics["tests"]["opencv_capture"] = f"SUCCESS: Simple VideoCapture(0) works!"
            diagnostics["recommended_device"] = working_devices[0]
        else:
            diagnostics["tests"]["opencv_capture"] = "FAILED: VideoCapture(0) not working"
    
    return diagnostics
