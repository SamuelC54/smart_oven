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
    OPENCV_AVAILABLE = True
    logger.info("OpenCV camera libraries imported successfully")
except ImportError as e:
    CAMERA_AVAILABLE = False
    OPENCV_AVAILABLE = False
    # Create dummy numpy for type hints
    class np:
        ndarray = object
    logger.info("OpenCV libraries not available in container environment (this is expected)")
except Exception as e:
    CAMERA_AVAILABLE = False
    OPENCV_AVAILABLE = False
    # Create dummy numpy for type hints
    class np:
        ndarray = object
    logger.info("OpenCV libraries not available in container environment (this is expected)")

# Try to import picamera2 as fallback
try:
    from picamera2 import Picamera2
    PICAMERA2_AVAILABLE = True
    if not CAMERA_AVAILABLE:
        CAMERA_AVAILABLE = True
        logger.info("Picamera2 libraries imported successfully")
except ImportError:
    PICAMERA2_AVAILABLE = False
except Exception:
    PICAMERA2_AVAILABLE = False

# Now log the camera status
if CAMERA_AVAILABLE:
    logger.info("Camera libraries imported successfully")
else:
    logger.info("Camera libraries not available in container environment (this is expected)")

# --- Global camera instance ---
_camera = None
_camera_lock = threading.Lock()

class CameraManager:
    """Camera management using OpenCV (primary) or picamera2 (fallback)"""
    
    def __init__(self, resolution=(640, 480), framerate=30):
        """Initialize camera with specified resolution and framerate"""
        self.resolution = resolution
        self.framerate = framerate
        self.camera = None
        self.is_streaming = False
        self.use_opencv = False
        
        if not CAMERA_AVAILABLE:
            raise Exception("Camera libraries not available")
        
        # Try OpenCV first (works better in containers)
        if OPENCV_AVAILABLE:
            try:
                self.camera = cv2.VideoCapture(0)  # Try /dev/video0
                if self.camera.isOpened():
                    # Set camera properties
                    self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, resolution[0])
                    self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, resolution[1])
                    self.camera.set(cv2.CAP_PROP_FPS, framerate)
                    self.use_opencv = True
                    logger.info(f"OpenCV camera initialized with resolution {resolution} at {framerate}fps")
                else:
                    self.camera.release()
                    self.camera = None
                    raise Exception("Could not open camera with OpenCV")
            except Exception as e:
                logger.warning(f"OpenCV camera initialization failed: {e}")
                self.camera = None
        
        # Fallback to picamera2 if OpenCV failed
        if not self.use_opencv and PICAMERA2_AVAILABLE:
            try:
                self.camera = Picamera2()
                config = self.camera.create_video_configuration(
                    main={"size": self.resolution, "format": "RGB888"}
                )
                self.camera.configure(config)
                self.use_opencv = False
                logger.info(f"Picamera2 initialized with resolution {resolution} at {framerate}fps")
            except Exception as e:
                logger.error(f"Picamera2 initialization failed: {e}")
                raise
        
        if self.camera is None:
            raise Exception("Could not initialize camera with any available method")
    
    def start(self):
        """Start the camera"""
        if not self.camera:
            raise Exception("Camera not initialized")
        
        try:
            if self.use_opencv:
                # OpenCV camera is already "started" when opened
                self.is_streaming = True
                logger.info("OpenCV camera ready for streaming")
            else:
                # Picamera2 needs explicit start
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
                if self.use_opencv:
                    # OpenCV doesn't need explicit stop, just mark as not streaming
                    self.is_streaming = False
                    logger.info("OpenCV camera stopped")
                else:
                    # Picamera2 needs explicit stop
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
            if self.use_opencv:
                ret, frame = self.camera.read()
                if ret:
                    return frame
                else:
                    return None
            else:
                # Picamera2 method
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
            if self.use_opencv:
                # OpenCV frame is already in BGR format
                frame_bgr = frame
            else:
                # Picamera2 frame is in RGB format, convert to BGR for OpenCV
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
        raise Exception("Camera libraries not available in container environment. Camera hardware access requires physical Pi connection.")
    
    with _camera_lock:
        if _camera is None:
            logger.info("Initializing camera...")
            try:
                _camera = CameraManager(resolution=(640, 480), framerate=30)
                logger.info("Camera initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize camera hardware: {e}")
                logger.info("This is expected in Docker containers without camera hardware access")
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
        "opencv_available": OPENCV_AVAILABLE,
        "picamera2_available": PICAMERA2_AVAILABLE,
        "max_devices_checked": max_devices,
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
    
    # Test OpenCV camera access with robust configuration
    if OPENCV_AVAILABLE:
        # Test multiple video devices to find working ones
        working_devices = []
        # Test more devices since we have 25 available
        test_indices = [0, 1, 2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 19, 20, 21, 22, 23, 24, 25]
        
        for i in test_indices:
            device_path = f"/dev/video{i}"
            if device_path in video_devices:
                try:
                    # Try different OpenCV backends with robust configuration
                    backends_to_try = [
                        (cv2.CAP_V4L2, "V4L2"),
                        (cv2.CAP_ANY, "ANY"),
                        (cv2.CAP_GSTREAMER, "GSTREAMER")
                    ]
                    
                    device_results = []
                    for backend, backend_name in backends_to_try:
                        try:
                            # Initialize video capture with explicit backend
                            test_camera = cv2.VideoCapture(i, backend)
                            
                            if test_camera.isOpened():
                                # Set properties like your example
                                test_camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1024)
                                test_camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 576)
                                test_camera.set(cv2.CAP_PROP_FPS, 30)
                                
                                # Allow camera to initialize
                                import time
                                time.sleep(0.1)
                                
                                # Try multiple frame reads (sometimes first few fail)
                                success_count = 0
                                for attempt in range(5):
                                    ret, frame = test_camera.read()
                                    if ret and frame is not None and frame.size > 0:
                                        success_count += 1
                                    time.sleep(0.05)  # Small delay between attempts
                                
                                if success_count > 0:
                                    # Get actual camera properties
                                    actual_width = int(test_camera.get(cv2.CAP_PROP_FRAME_WIDTH))
                                    actual_height = int(test_camera.get(cv2.CAP_PROP_FRAME_HEIGHT))
                                    actual_fps = test_camera.get(cv2.CAP_PROP_FPS)
                                    
                                    working_devices.append({
                                        "device": f"/dev/video{i}",
                                        "index": i,
                                        "backend": backend_name,
                                        "frame_shape": frame.shape,
                                        "actual_resolution": f"{actual_width}x{actual_height}",
                                        "actual_fps": actual_fps,
                                        "success_rate": f"{success_count}/5",
                                        "status": "SUCCESS"
                                    })
                                    device_results.append(f"{backend_name}: SUCCESS - {frame.shape} ({success_count}/5 frames)")
                                    test_camera.release()
                                    break  # Found working backend, no need to test others
                                else:
                                    device_results.append(f"{backend_name}: Frame capture failed (0/5 frames)")
                                    
                                test_camera.release()
                            else:
                                device_results.append(f"{backend_name}: Could not open")
                                
                        except Exception as e:
                            device_results.append(f"{backend_name}: Error - {str(e)[:50]}")
                    
                    diagnostics["tests"][f"opencv_device_{i}"] = " | ".join(device_results)
                    
                except Exception as e:
                    diagnostics["tests"][f"opencv_device_{i}"] = f"FAILED: {e}"
        
        diagnostics["working_opencv_devices"] = working_devices
        diagnostics["tested_device_count"] = len(test_indices)
        
        # Overall OpenCV test result
        if working_devices:
            diagnostics["tests"]["opencv_capture"] = f"SUCCESS: {len(working_devices)} working devices found"
            # Show the best device found
            best_device = max(working_devices, key=lambda x: int(x["success_rate"].split("/")[0]))
            diagnostics["recommended_device"] = best_device
        else:
            diagnostics["tests"]["opencv_capture"] = "FAILED: No working camera devices found"
            
        # Legacy single device test for backwards compatibility
        try:
            test_camera = cv2.VideoCapture(0)
            if test_camera.isOpened():
                diagnostics["tests"]["opencv_open"] = "SUCCESS"
                ret, frame = test_camera.read()
                if ret and frame is not None:
                    diagnostics["tests"]["opencv_single"] = "SUCCESS"
                else:
                    diagnostics["tests"]["opencv_single"] = "FAILED: Could not capture frame from /dev/video0"
                test_camera.release()
            else:
                diagnostics["tests"]["opencv_open"] = "FAILED: Could not open camera"
        except Exception as e:
            diagnostics["tests"]["opencv_test"] = f"FAILED: {e}"
    
    # Test picamera2 if OpenCV failed
    if PICAMERA2_AVAILABLE and diagnostics["tests"].get("opencv_capture") != "SUCCESS":
        try:
            test_camera = Picamera2()
            diagnostics["tests"]["picamera2_init"] = "SUCCESS"
            
            # Test camera configuration
            config = test_camera.create_video_configuration(
                main={"size": (640, 480), "format": "RGB888"}
            )
            test_camera.configure(config)
            diagnostics["tests"]["picamera2_config"] = "SUCCESS"
            
            # Test camera start/stop
            test_camera.start()
            diagnostics["tests"]["picamera2_start"] = "SUCCESS"
            
            # Capture a test frame
            frame = test_camera.capture_array()
            if frame is not None:
                diagnostics["tests"]["picamera2_capture"] = "SUCCESS"
                diagnostics["frame_shape"] = frame.shape
            else:
                diagnostics["tests"]["picamera2_capture"] = "FAILED: No frame data"
            
            test_camera.stop()
            test_camera.close()
            diagnostics["tests"]["picamera2_cleanup"] = "SUCCESS"
            
        except Exception as e:
            diagnostics["tests"]["picamera2_test"] = f"FAILED: {e}"
    
    return diagnostics
