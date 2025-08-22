import os
import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

import board, busio, digitalio
import adafruit_max31865

app = FastAPI(title="Pi Sensor/GPIO API (Docker)")

# --- Config via env ---
RTD_NOMINAL = float(os.getenv("SENSOR_RTD_NOMINAL", "100"))     # 100 for PT100, 1000 for PT1000
REF_RESISTOR = float(os.getenv("SENSOR_REF_RESISTOR", "430"))   # Common: 430Ω (Adafruit breakout)
WIRES = int(os.getenv("SENSOR_WIRES", "2"))                     # 2, 3, or 4
CS_NAME = os.getenv("SENSOR_CS", "CE0").upper()                 # "CE0" or "CE1"

# --- Lazy sensor init to avoid crash if bus is slow to appear ---
_sensor = None
def get_sensor():
    global _sensor
    if _sensor is None:
        spi = busio.SPI(board.SCLK, board.MOSI, board.MISO)
        cs_pin = board.CE0 if CS_NAME == "CE0" else board.CE1
        cs = digitalio.DigitalInOut(cs_pin)
        _sensor = adafruit_max31865.MAX31865(
            spi, cs,
            rtd_nominal=RTD_NOMINAL,
            ref_resistor=REF_RESISTOR,
            wires=WIRES,
        )
    return _sensor

def set_gpio(bcm_pin: int, value: bool):
    # Use BCM number with Blinka mapping (board.D17 == GPIO17)
    try:
        pin = getattr(board, f"D{bcm_pin}")
    except AttributeError:
        raise ValueError(f"GPIO{bcm_pin} is not available on this board")
    io = digitalio.DigitalInOut(pin)
    try:
        io.direction = digitalio.Direction.OUTPUT
        io.value = value
    finally:
        io.deinit()

class GpioBody(BaseModel):
    value: bool  # true=HIGH, false=LOW

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/temp")
def temp():
    try:
        s = get_sensor()
        return {"celsius": s.temperature, "ohms": s.resistance}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/gpio/{bcm_pin}")
async def gpio(bcm_pin: int, body: GpioBody):
    try:
        await asyncio.sleep(0)
        set_gpio(bcm_pin, body.value)
        return {"pin": bcm_pin, "set": body.value}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
