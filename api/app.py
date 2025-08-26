import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import RTD_NOMINAL, REF_RESISTOR, WIRES, CS_NAME
from logger import logger
from hardware import HARDWARE_AVAILABLE

# Import individual route files
from routes import (
    root,
    health,
    cors_test,
    temperature_get,
    sensor_debug,
    gpio_set,
    gpio_test,
    gpio_status,
    spi_test,
    logs,
    debug_max31865
)

app = FastAPI(title="Pi Sensor/GPIO API (Docker)")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",  # Allow all origins for development (remove in production)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Log startup configuration
logger.info(f"Starting Smart Oven API with config: RTD={RTD_NOMINAL}, REF={REF_RESISTOR}, WIRES={WIRES}, CS={CS_NAME}")

# Include individual route routers
app.include_router(root.router, tags=["health"])
app.include_router(health.router, tags=["health"])
app.include_router(cors_test.router, tags=["health"])
app.include_router(temperature_get.router, tags=["temperature"])
app.include_router(sensor_debug.router, tags=["temperature"])
app.include_router(gpio_set.router, tags=["gpio"])
app.include_router(gpio_test.router, tags=["gpio"])
app.include_router(gpio_status.router, tags=["gpio"])
app.include_router(spi_test.router, tags=["debug"])
app.include_router(logs.router, tags=["debug"])
app.include_router(debug_max31865.router, tags=["debug"])

@app.on_event("startup")
async def startup_event():
    logger.info("Smart Oven API starting up...")
    logger.info(f"Hardware available: {HARDWARE_AVAILABLE}")
