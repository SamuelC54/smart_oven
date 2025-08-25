import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import RTD_NOMINAL, REF_RESISTOR, WIRES, CS_NAME
from logger import logger
from hardware import HARDWARE_AVAILABLE
from routes import health, temperature, gpio, debug

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

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(temperature.router, tags=["temperature"])
app.include_router(gpio.router, tags=["gpio"])
app.include_router(debug.router, tags=["debug"])

@app.on_event("startup")
async def startup_event():
    logger.info("Smart Oven API starting up...")
    logger.info(f"Hardware available: {HARDWARE_AVAILABLE}")
