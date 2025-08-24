import os

# --- Config via env ---
RTD_NOMINAL = float(os.getenv("SENSOR_RTD_NOMINAL", "100"))           # PT100 = 100, PT1000 = 1000
REF_RESISTOR = float(os.getenv("SENSOR_REF_RESISTOR", "430"))         # 430 for MAX31865 breakout
WIRES = int(os.getenv("SENSOR_WIRES", "2"))                     # 2, 3, or 4
CS_NAME = os.getenv("SENSOR_CS", "CE0")                         # CE0 or CE1
