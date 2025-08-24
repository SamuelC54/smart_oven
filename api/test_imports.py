#!/usr/bin/env python3

# Test script to check if all imports work correctly
print("Testing imports...")

try:
    from config import RTD_NOMINAL, REF_RESISTOR, WIRES, CS_NAME
    print("✓ Config imports work")
except Exception as e:
    print(f"✗ Config imports failed: {e}")

try:
    from logger import logger, get_logs
    print("✓ Logger imports work")
except Exception as e:
    print(f"✗ Logger imports failed: {e}")

try:
    from hardware import HARDWARE_AVAILABLE, get_sensor, set_gpio
    print("✓ Hardware imports work")
except Exception as e:
    print(f"✗ Hardware imports failed: {e}")

try:
    from routes import health, temperature, gpio, debug
    print("✓ Routes imports work")
except Exception as e:
    print(f"✗ Routes imports failed: {e}")

try:
    from app import app
    print("✓ App imports work")
    print("✓ FastAPI app created successfully")
except Exception as e:
    print(f"✗ App imports failed: {e}")

print("Import test completed!")
