# 📷 Smart Oven Camera Quick Start

Simple guide to add camera streaming to your Smart Oven.

## ✅ What Was Added

- **Backend**: Camera streaming endpoints (`/camera/stream`, `/camera/info`, `/camera/snapshot`)
- **Frontend**: Camera component in the oven dashboard with live streaming
- **Docker**: Camera device access in containers
- **Setup**: Automated camera enablement in deployment workflows

## 🚀 Setup Steps

### 1. Enable Camera (One-time setup)

```bash
# Run the setup workflow to enable camera
# This configures /boot/config.txt and installs dependencies
```

### 2. Deploy with Camera Support

```bash
# Your existing deployment will now include camera support
# The Docker container automatically gets camera access
```

### 3. View Camera Stream

- Open your Smart Oven dashboard
- Camera stream appears between temperature display and controls
- Adjust quality, take snapshots, or toggle on/off

## 🔧 Files Changed

### Backend

- `api/requirements.txt` - Added camera dependencies
- `api/camera.py` - Camera hardware management
- `api/routes/camera.py` - Camera API endpoints
- `api/app.py` - Added camera routes
- `api/Dockerfile` - Added camera system dependencies
- `api/docker-compose.yml` - Added camera device mapping

### Frontend

- `frontend/src/components/CameraStream.tsx` - Camera component
- `frontend/src/services/api/useOvenApi.ts` - Camera API hooks
- `frontend/src/components/OvenDashboard.tsx` - Integrated camera

### Deployment

- `.github/workflows/deploy-pi.yml` - Camera setup and testing
- `.github/workflows/setup-pi.yml` - Camera enablement
- `deploy/setup-scripts/enable-camera.sh` - Camera setup script

## 🎯 Camera Endpoints

- **Stream**: `http://your-pi-ip:8081/camera/stream` - Live MJPEG video
- **Snapshot**: `http://your-pi-ip:8081/camera/snapshot` - Single JPEG image
- **Info**: `http://your-pi-ip:8081/camera/info` - Camera status
- **Diagnostics**: `http://your-pi-ip:8081/camera/diagnose` - Troubleshooting

## 🛠️ Troubleshooting

### No Camera Stream

```bash
# Check camera is connected and enabled
libcamera-hello --list-cameras

# Check Docker container has camera access
docker exec smart-oven-api ls -la /dev/video*

# Check API logs
docker logs smart-oven-api
```

### Camera Not Detected

```bash
# Enable camera interface
sudo raspi-config nonint do_camera 0
sudo reboot

# Or run the setup workflow
```

That's it! Your Smart Oven now has live camera streaming. 🎉
