#!/bin/bash

echo "=== Checking if reboot is needed ==="

# Check if any hardware interfaces were enabled
SPI_ENABLED="${{ steps.enable-spi.outputs.spi_enabled }}"
I2C_ENABLED="${{ steps.enable-i2c.outputs.i2c_enabled }}"
DISPLAY_ENABLED="${{ steps.configure-display.outputs.display_configured }}"
TOUCHSCREEN_ENABLED="${{ steps.configure-touchscreen.outputs.touchscreen_configured }}"

# Check if SPI devices are missing (indicates need for reboot)
SPI_DEVICES_MISSING=false
if [ ! -e "/dev/spidev0.0" ] && [ ! -e "/dev/spidev0.1" ]; then
  SPI_DEVICES_MISSING=true
fi

# Check if I2C devices are missing
I2C_DEVICES_MISSING=false
if [ ! -e "/dev/i2c-1" ]; then
  I2C_DEVICES_MISSING=true
fi

# Determine if reboot is needed
NEEDS_REBOOT=false
REBOOT_REASONS=()

if [ "$SPI_ENABLED" = "true" ]; then
  NEEDS_REBOOT=true
  REBOOT_REASONS+=("SPI was enabled")
fi

if [ "$I2C_ENABLED" = "true" ]; then
  NEEDS_REBOOT=true
  REBOOT_REASONS+=("I2C was enabled")
fi

if [ "$DISPLAY_ENABLED" = "true" ]; then
  NEEDS_REBOOT=true
  REBOOT_REASONS+=("Display rotation was configured")
fi

if [ "$TOUCHSCREEN_ENABLED" = "true" ]; then
  NEEDS_REBOOT=true
  REBOOT_REASONS+=("Touchscreen configuration was added")
fi

if [ "$SPI_DEVICES_MISSING" = "true" ] && grep -q "dtparam=spi=on" /boot/config.txt; then
  NEEDS_REBOOT=true
  REBOOT_REASONS+=("SPI devices missing")
fi

if [ "$I2C_DEVICES_MISSING" = "true" ] && grep -q "dtparam=i2c_arm=on" /boot/config.txt; then
  NEEDS_REBOOT=true
  REBOOT_REASONS+=("I2C devices missing")
fi

# Set output
if [ "$NEEDS_REBOOT" = "true" ]; then
  echo "needs-reboot=true" >> $GITHUB_OUTPUT
  echo "Reboot needed for: ${REBOOT_REASONS[*]}"
else
  echo "needs-reboot=false" >> $GITHUB_OUTPUT
  echo "No reboot needed - all hardware interfaces are working"
fi
