#!/bin/bash

echo "=== System Information ==="
echo "Device Model: $(cat /proc/device-tree/model 2>/dev/null || echo 'Unknown')"
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "Architecture: $(uname -m)"
echo "Kernel: $(uname -r)"
echo ""

echo "=== Current SPI Status ==="
echo "SPI devices:"
ls -la /dev/spidev* 2>/dev/null || echo "No SPI devices found"
echo ""
echo "SPI kernel modules:"
lsmod | grep spi || echo "No SPI modules loaded"
echo ""
echo "SPI config in /boot/config.txt:"
grep -i spi /boot/config.txt 2>/dev/null || echo "No SPI config found"
echo ""
