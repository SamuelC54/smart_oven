import os

# --- Config via env ---
RTD_NOMINAL = float(os.getenv("SENSOR_RTD_NOMINAL", "100"))           # PT100 = 100, PT1000 = 1000
REF_RESISTOR = float(os.getenv("SENSOR_REF_RESISTOR", "430"))         # 430 for MAX31865 breakout
WIRES = int(os.getenv("SENSOR_WIRES", "2"))                     # 2, 3, or 4
CS_NAME = os.getenv("SENSOR_CS", "CE0")                         # CE0 or CE1

# --- Heater Control Constants ---
# Fixed PID controller parameters - these cannot be changed via API
HEATER_PID_KP = 1.0          # Proportional gain
HEATER_PID_KI = 0.1          # Integral gain  
HEATER_PID_KD = 0.05         # Derivative gain
HEATER_PID_SAMPLE_TIME = 1.0 # Sample time in seconds
HEATER_PID_OUTPUT_LIMITS = (0, 1)  # Output limits (0-1 for heater on/off)
HEATER_PID_THRESHOLD = 0.5   # Threshold for determining if heater should be on