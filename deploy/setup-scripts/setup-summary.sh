#!/bin/bash

echo "=============================================================="
echo "Setup completed successfully!"
echo ""
if [ "${{ steps.check-reboot.outputs.needs-reboot }}" = "true" ]; then
  echo "REBOOT REQUIRED: Hardware interfaces need to be activated"
  echo "The Pi will reboot automatically in the next step."
else
  echo "No reboot needed - everything is working!"
fi
echo ""
echo "After setup, verify everything is working:"
echo "  ls -la /dev/spidev*"
echo "  lsmod | grep spi"
echo "  docker --version"
echo "  # Display should be in portrait mode after reboot"
echo "  # Touchscreen should be aligned with portrait orientation"
echo "  # Test touchscreen: libinput list-devices (to see device name)"
echo "  # Check Wayfire config: cat ~/.config/wayfire.ini"
echo "  # Check hwdb config: cat /etc/udev/hwdb.d/99-touchscreen-rotation.hwdb"
echo "=============================================================="
