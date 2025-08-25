#!/bin/bash

echo "=== Enabling I2C Interface ==="

# Check if I2C is already enabled
if grep -q "dtparam=i2c_arm=on" /boot/config.txt; then
  echo "I2C is already enabled in config.txt"
  echo "i2c_already_enabled=true" >> $GITHUB_OUTPUT
else
  echo "Enabling I2C interface..."
  # Add I2C enable line to config.txt
  echo "dtparam=i2c_arm=on" | sudo tee -a /boot/config.txt
  echo "I2C interface enabled in config.txt"
  echo "i2c_enabled=true" >> $GITHUB_OUTPUT
fi
