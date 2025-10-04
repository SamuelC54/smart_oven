FROM python:3.11-slim

# System dependencies for Python builds + OpenCV + extra dev packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Core
    ca-certificates build-essential cmake git pkg-config \
    # Capabilities
    libcap-dev \
    # X11 and rendering
    libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1 \
    # GStreamer
    libgstreamer1.0-0 libgstreamer-plugins-base1.0-0 \
    # OpenCV extra (video/image codecs, GUI)
    libgtk-3-dev libavcodec-dev libavformat-dev libswscale-dev \
 && rm -rf /var/lib/apt/lists/*

# App setup
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose API port
ENV PORT=8081
EXPOSE 8081

# Uvicorn entrypoint (no reload in container)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8081"]
