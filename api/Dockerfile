FROM debian:bookworm

RUN apt update && apt install -y --no-install-recommends gnupg

RUN echo "deb http://archive.raspberrypi.org/debian/ bookworm main" > /etc/apt/sources.list.d/raspi.list \
  && apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 82B129927FA3303E
  
RUN apt update && apt install -y --no-install-recommends \
  python3-pip \
  python3-picamera2 \
  build-essential \
  gcc \
  python3-dev \
&& apt-get clean \
&& apt-get autoremove \
&& rm -rf /var/cache/apt/archives/* \
&& rm -rf /var/lib/apt/lists/*

# App setup
WORKDIR /app

COPY requirements.txt .

RUN pip install --break-system-packages --no-cache-dir -r requirements.txt

COPY . .

# Expose API port
ENV PORT=8081
EXPOSE 8081

# Uvicorn entrypoint (no reload in container)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8081"]
