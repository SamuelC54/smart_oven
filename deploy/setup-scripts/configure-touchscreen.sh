#!/bin/bash

echo "=== Configuring Touchscreen Input for Portrait Mode (Wayland) ==="

# Create udev hwdb configuration for persistent touchscreen rotation
HWDB_FILE="/etc/udev/hwdb.d/99-touchscreen-rotation.hwdb"

echo "Creating udev hwdb configuration for touchscreen rotation..."
sudo mkdir -p "$(dirname "$HWDB_FILE")"

# Create the hwdb file with common touchscreen names
echo "# Touchscreen rotation for portrait mode (90° clockwise)" | sudo tee "$HWDB_FILE"
echo "# Common Raspberry Pi touchscreen names - adjust if needed" | sudo tee -a "$HWDB_FILE"
echo "" | sudo tee -a "$HWDB_FILE"
echo "# FT5406 touchscreen (common on Pi displays)" | sudo tee -a "$HWDB_FILE"
echo "evdev:name:FT5406*" | sudo tee -a "$HWDB_FILE"
echo " LIBINPUT_CALIBRATION_MATRIX=0 1 0 -1 0 1 0 0 1" | sudo tee -a "$HWDB_FILE"
echo "" | sudo tee -a "$HWDB_FILE"
echo "# Alternative touchscreen names (uncomment and adjust as needed)" | sudo tee -a "$HWDB_FILE"
echo "# evdev:name:ADS7846*" | sudo tee -a "$HWDB_FILE"
echo "#  LIBINPUT_CALIBRATION_MATRIX=0 1 0 -1 0 1 0 0 1" | sudo tee -a "$HWDB_FILE"
echo "" | sudo tee -a "$HWDB_FILE"
echo "# evdev:name:Goodix*" | sudo tee -a "$HWDB_FILE"
echo "#  LIBINPUT_CALIBRATION_MATRIX=0 1 0 -1 0 1 0 0 1" | sudo tee -a "$HWDB_FILE"
echo "" | sudo tee -a "$HWDB_FILE"
echo "# evdev:name:FT5*" | sudo tee -a "$HWDB_FILE"
echo "#  LIBINPUT_CALIBRATION_MATRIX=0 1 0 -1 0 1 0 0 1" | sudo tee -a "$HWDB_FILE"

# Update hwdb and trigger udev
echo "Updating hardware database..."
sudo systemd-hwdb update

echo "Triggering udev for input devices..."
sudo udevadm trigger /dev/input/event*

echo "Touchscreen configuration summary:"
echo "  - udev hwdb file created: $HWDB_FILE"
echo "  - Transformation matrix: [0 1 0 -1 0 1 0 0 1] (90° clockwise)"
echo "  - Configuration is persistent and survives reboots"
echo "  - No scripts needed - uses native udev system"
echo "  - Touch input will be aligned with portrait display orientation"
echo ""
echo "Note: If touchscreen name differs, check with: libinput list-devices"
echo "Then update the hwdb file with the correct device name"
echo "touchscreen_configured=true" >> $GITHUB_OUTPUT
