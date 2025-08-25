#!/bin/bash

echo "=== Enabling SPI Interface ==="

# Check if SPI is already enabled
if grep -q "dtparam=spi=on" /boot/config.txt; then
  echo "SPI is already enabled in config.txt"
  echo "spi_already_enabled=true" >> $GITHUB_OUTPUT
else
  echo "Enabling SPI interface..."
  # Add SPI enable line to config.txt
  echo "dtparam=spi=on" | sudo tee -a /boot/config.txt
  echo "SPI interface enabled in config.txt"
  echo "spi_enabled=true" >> $GITHUB_OUTPUT
fi

# Also check for any existing SPI overlays
echo "Current SPI-related config:"
grep -i spi /boot/config.txt || echo "No SPI config found"
