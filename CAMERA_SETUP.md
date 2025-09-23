# Smart Oven Camera Setup Guide

This guide explains how to set up camera streaming from your Raspberry Pi to the Smart Oven frontend.

## 🎥 What's Been Added

### Backend (API)

- **Camera module** (`api/camera.py`) - Handles camera initialization and streaming using picamera2
- **Camera routes** (`api/routes/camera.py`) - REST API endpoints for camera control
- **New dependencies** - Added `picamera2`, `opencv-python`, and `numpy` to requirements.txt

### Frontend

- **Camera component** (`frontend/src/components/CameraStream.tsx`) - React component for displaying camera stream
- **API client updates** - Added camera endpoints to the API service
- **Dashboard integration** - Camera stream now appears in the main oven dashboard

## 📋 Prerequisites

1. **Raspberry Pi Camera Module** - Connected and enabled
2. **Python packages** - The new dependencies in requirements.txt
3. **Camera permissions** - Proper access to the camera device

## 🚀 Installation Steps

### 1. Enable Camera on Raspberry Pi

```bash
# Enable camera interface
sudo raspi-config
# Navigate to: Interface Options > Camera > Enable

# Or enable via command line
sudo raspi-config nonint do_camera 0
```

### 2. Install Python Dependencies

```bash
cd api/
pip install -r requirements.txt
```

### 3. Test Camera Access

```bash
# Test if camera is detected
libcamera-hello --list-cameras

# Test basic camera functionality
libcamera-still -o test.jpg
```

### 4. Start the API Server

#### Using Docker (Recommended)

```bash
cd api/
docker compose up -d --build
```

#### Using Systemd (Production)

```bash
sudo systemctl start smart-oven-api.service
```

#### Manual Testing (Development)

```bash
cd api/
python -m uvicorn app:app --host 0.0.0.0 --port 8081
```

### 5. Start the Frontend

```bash
cd frontend/
npm run dev
```

## 🔧 API Endpoints

The following camera endpoints are now available:

- **GET** `/camera/info` - Get camera status and configuration
- **GET** `/camera/diagnose` - Run camera diagnostics
- **GET** `/camera/stream` - Live MJPEG video stream
- **GET** `/camera/snapshot` - Capture single frame as JPEG
- **POST** `/camera/start` - Start camera streaming
- **POST** `/camera/stop` - Stop camera streaming

## 🎛️ Frontend Features

### Camera Stream Component

- **Live streaming** - Real-time MJPEG stream from the camera
- **Quality control** - Adjustable stream quality (10-100%)
- **Snapshot capture** - Download individual frames
- **Auto-start** - Automatically starts when camera is available
- **Error handling** - Graceful handling of camera errors

### Dashboard Integration

- Appears between the main temperature display and cooking controls
- Shows/hides controls based on cooking status
- Responsive design that fits the existing UI

## 🛠️ Configuration

### Camera Settings

You can modify camera settings in `api/camera.py`:

```python
# Default resolution and framerate
resolution=(640, 480)
framerate=30

# Stream quality (affects bandwidth)
quality=85  # 1-100, higher = better quality but more bandwidth
```

### Frontend Settings

The camera component accepts these props:

```tsx
<CameraStream
  className="mb-3" // CSS classes
  showControls={true} // Show/hide controls
  quality={75} // Initial quality setting
  onQualityChange={callback} // Quality change handler
/>
```

## 🔍 Troubleshooting

### Camera Not Detected

```bash
# Check if camera is connected
vcgencmd get_camera

# Should return: supported=1 detected=1
```

### Permission Errors

```bash
# Add user to video group
sudo usermod -a -G video $USER

# Restart session or reboot
```

### Stream Not Loading

1. Check API server is running on port 8081
2. Verify camera endpoints return data: `curl http://localhost:8081/camera/info`
3. Check browser console for CORS or network errors
4. Try the diagnostics endpoint: `curl http://localhost:8081/camera/diagnose`

### Low Performance

- Reduce stream quality in the frontend controls
- Lower camera resolution in `camera.py`
- Check network bandwidth between Pi and client

### Docker Issues

```bash
# Check if camera devices are available
ls -la /dev/video*

# Check Docker container logs
docker logs smart-oven-api

# Rebuild container with camera support
cd api/
docker compose down
docker compose up -d --build

# Check if camera devices are mounted in container
docker exec smart-oven-api ls -la /dev/video*
```

### Systemd Service Issues

```bash
# Check service status
sudo systemctl status smart-oven-api.service

# View service logs
sudo journalctl -u smart-oven-api.service -f

# Restart service
sudo systemctl restart smart-oven-api.service
```

## 🔧 Development

### Testing Camera Functionality

Use the diagnostics endpoint to test camera functionality:

```bash
curl http://localhost:8081/camera/diagnose
```

### Manual Camera Control

```bash
# Start camera
curl -X POST http://localhost:8081/camera/start

# Get stream (save to file)
curl http://localhost:8081/camera/stream > stream.mjpeg

# Capture snapshot
curl http://localhost:8081/camera/snapshot > snapshot.jpg

# Stop camera
curl -X POST http://localhost:8081/camera/stop
```

## 📱 Usage

1. **Open the Smart Oven Dashboard** - Camera stream appears automatically
2. **Adjust Quality** - Click the settings button to change stream quality
3. **Capture Snapshots** - Use the download button to save individual frames
4. **Monitor Cooking** - Watch your food cook in real-time!

## 🔄 Integration Notes

- The camera automatically starts when available
- Controls are hidden during active cooking sessions
- Stream quality can be adjusted in real-time
- Component gracefully handles camera unavailability
- Error states provide helpful troubleshooting information

## 🎯 Next Steps

Consider these enhancements:

- **Recording** - Save cooking sessions as video files
- **Time-lapse** - Create time-lapse videos of cooking processes
- **Motion Detection** - Alert when food is ready based on visual changes
- **Multiple Cameras** - Support for multiple camera angles
- **Mobile Optimization** - Better mobile viewing experience
