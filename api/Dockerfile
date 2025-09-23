FROM python:3.11-slim

# System deps (minimal for Python package builds)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates build-essential \
    libcap-dev pkg-config \
 && rm -rf /var/lib/apt/lists/*

# App
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose API port
ENV PORT=8081
EXPOSE 8081

# Uvicorn (no reload in container)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8081"]
