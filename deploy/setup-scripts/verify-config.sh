#!/bin/bash

echo "=== Configuration Verification ==="
echo "Current /boot/config.txt SPI and I2C settings:"
grep -E "(spi|i2c)" /boot/config.txt || echo "No SPI/I2C settings found"
echo ""
echo "Current /boot/config.txt display settings:"
grep -E "(display_rotate|vc4-kms-v3d)" /boot/config.txt || echo "No display settings found"
echo ""
echo "Current /boot/cmdline.txt framebuffer settings:"
grep -E "(fbcon=rotate)" /boot/cmdline.txt || echo "No framebuffer rotation found"
echo ""
echo "Full config.txt (last 20 lines):"
tail -20 /boot/config.txt

echo "=== Current Hardware Status ==="
echo "GPIO chips available:"
ls -la /sys/class/gpio/ 2>/dev/null || echo "GPIO sysfs not accessible"
echo ""
echo "SPI devices:"
ls -la /dev/spidev* 2>/dev/null || echo "No SPI devices found (normal before reboot)"
echo ""
echo "I2C devices:"
ls -la /dev/i2c* 2>/dev/null || echo "No I2C devices found (normal before reboot)"
