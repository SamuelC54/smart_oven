# Smart Oven API

A FastAPI-based REST API for controlling and monitoring a smart oven with temperature sensors and GPIO control.

## Overview

This API provides endpoints for:

- **Temperature monitoring and control** - Read temperature from MAX31865 sensor
- **GPIO pin control** - Control oven components via GPIO pins
- **System health and status monitoring** - Check hardware availability and sensor status
- **Debug and diagnostic information** - Troubleshoot hardware issues

## Quick Start

### Prerequisites

- Raspberry Pi with GPIO access
- MAX31865 temperature sensor
- Python 3.8+
- FastAPI and required dependencies

### Installation

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run the API:

```bash
uvicorn app:app --host 0.0.0.0 --port 8081
```

Or using Docker:

```bash
docker-compose up
```

### API Documentation

Once running, access the interactive API documentation at:

- **Swagger UI**: http://localhost:8081/docs
- **ReDoc**: http://localhost:8081/redoc

## API Endpoints

### Health & Status

| Method | Endpoint  | Description                       |
| ------ | --------- | --------------------------------- |
| GET    | `/`       | Root endpoint - API status        |
| GET    | `/health` | Health check with hardware status |

### Temperature

| Method | Endpoint        | Description                       |
| ------ | --------------- | --------------------------------- |
| GET    | `/temperature`  | Get current temperature reading   |
| GET    | `/sensor-debug` | Detailed sensor debug information |

### GPIO Control

| Method | Endpoint       | Description                 |
| ------ | -------------- | --------------------------- |
| POST   | `/gpio`        | Set GPIO pin state          |
| GET    | `/gpio-test`   | Test GPIO access            |
| GET    | `/gpio-status` | Get GPIO status information |

### Debug & Diagnostics

| Method | Endpoint          | Description           |
| ------ | ----------------- | --------------------- |
| GET    | `/spi-test`       | Test SPI access       |
| GET    | `/logs`           | Get application logs  |
| GET    | `/debug/max31865` | Debug MAX31865 sensor |

## Configuration

The API uses configuration from `config.py`:

```python
RTD_NOMINAL = 100.0      # Nominal RTD resistance (ohms)
REF_RESISTOR = 430.0     # Reference resistor value (ohms)
WIRES = 3                # Number of wires (2, 3, or 4)
CS_NAME = "CE1"          # Chip select pin name
```

## Hardware Requirements

- **Temperature Sensor**: MAX31865 RTD-to-Digital Converter
- **GPIO Access**: Raspberry Pi GPIO pins
- **SPI Interface**: For MAX31865 communication

## CORS Configuration

The API includes CORS middleware configured for development:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Note**: For production, replace `"*"` with specific allowed origins.

## Error Handling

All endpoints return consistent error responses:

```json
{
  "detail": "Error message description"
}
```

## OpenAPI Specification

The API automatically generates comprehensive OpenAPI 3.1 specifications using FastAPI:

- **OpenAPI JSON**: `http://localhost:8081/openapi.json`
- **Swagger UI**: `http://localhost:8081/docs`
- **ReDoc**: `http://localhost:8081/redoc`

These can be used with:

- Interactive API documentation and testing
- Code generation tools
- API testing tools
- Client SDK generation

### Project Structure

```
api/
├── app.py              # Main FastAPI application
├── config.py           # Configuration settings
├── hardware.py         # Hardware interface
├── logger.py           # Logging configuration
├── requirements.txt    # Python dependencies
├── README.md           # This file
└── routes/
    ├── __init__.py
    ├── root.py         # Root endpoint (/)
    ├── health.py       # Health check endpoint (/health)
    ├── temperature_get.py  # Get temperature endpoint (/temperature)
    ├── sensor_debug.py # Sensor debug endpoint (/sensor-debug)
    ├── gpio_set.py     # Set GPIO endpoint (POST /gpio)
    ├── gpio_test.py    # GPIO test endpoint (/gpio-test)
    ├── gpio_status.py  # GPIO status endpoint (/gpio-status)
    ├── spi_test.py     # SPI test endpoint (/spi-test)
    ├── logs.py         # Logs endpoint (/logs)
    └── debug_max31865.py # MAX31865 debug endpoint (/debug/max31865)
```

### Adding New Endpoints

1. Create a new route file in `routes/` with a descriptive name (e.g., `my_endpoint.py`)
2. Define your endpoint using FastAPI decorators in the new file
3. Import and include the router in `app.py`
4. Update the OpenAPI specification if needed

Example new endpoint file (`routes/my_endpoint.py`):

```python
from fastapi import APIRouter

router = APIRouter()

@router.get("/my-endpoint")
def my_endpoint():
    """Description of what this endpoint does"""
    return {"message": "Hello from my endpoint"}
```

Then add to `app.py`:

```python
from routes import my_endpoint
app.include_router(my_endpoint.router, tags=["my-tag"])
```

### Testing

Test the API using curl:

```bash
# Health check
curl http://localhost:8081/health

# Get temperature
curl http://localhost:8081/temperature

# Set GPIO pin
curl -X POST http://localhost:8081/gpio \
  -H "Content-Type: application/json" \
  -d '{"pin": 18, "state": true}'
```

## Troubleshooting

### Common Issues

1. **GPIO Access Denied**: Ensure the application has GPIO permissions
2. **SPI Not Available**: Check if SPI is enabled in Raspberry Pi configuration
3. **Sensor Not Found**: Verify MAX31865 wiring and configuration
4. **CORS Errors**: Check CORS configuration for your frontend origin

### Debug Endpoints

Use the debug endpoints to troubleshoot hardware issues:

- `/gpio-test` - Test GPIO access
- `/spi-test` - Test SPI communication
- `/sensor-debug` - Detailed sensor diagnostics
- `/logs` - Application logs

## License

MIT License - see LICENSE file for details.
