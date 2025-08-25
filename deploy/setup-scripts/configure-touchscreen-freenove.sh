#!/bin/bash

echo "=== Configuring Touchscreen Input for Freenove Display ==="

# Configuration
ROTATION_DEGREES="${1:-90}"  # Default to 90° clockwise (portrait)

echo "Rotation: ${ROTATION_DEGREES}°"

# Validate rotation
case $ROTATION_DEGREES in
    0|90|180|270)
        echo "✅ Valid rotation value: ${ROTATION_DEGREES}°"
        ;;
    *)
        echo "❌ Invalid rotation value: ${ROTATION_DEGREES}°"
        echo "   Valid values are: 0, 90, 180, 270"
        exit 1
        ;;
esac

# Determine calibration matrix based on rotation
case $ROTATION_DEGREES in
    0)   CALIBRATION_MATRIX="1 0 0 0 1 0 0 0 1" ;;
    90)  CALIBRATION_MATRIX="0 1 0 -1 0 1 0 0 1" ;;
    180) CALIBRATION_MATRIX="-1 0 1 0 -1 1 0 0 1" ;;
    270) CALIBRATION_MATRIX="0 -1 1 1 0 0 0 0 1" ;;
esac

echo "Calibration matrix: $CALIBRATION_MATRIX"

# Create X11 libinput configuration directory
X11_CONF_DIR="/usr/share/X11/xorg.conf.d"
if [ ! -d "$X11_CONF_DIR" ]; then
    echo "Creating X11 configuration directory: $X11_CONF_DIR"
    sudo mkdir -p "$X11_CONF_DIR"
fi

# Backup existing configuration
LIBINPUT_CONF_FILE="$X11_CONF_DIR/40-libinput.conf"
if [ -f "$LIBINPUT_CONF_FILE" ]; then
    BACKUP_FILE="${LIBINPUT_CONF_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "Creating backup: $BACKUP_FILE"
    sudo cp "$LIBINPUT_CONF_FILE" "$BACKUP_FILE"
fi

# Create or update libinput configuration
echo "Creating X11 libinput configuration..."
sudo tee "$LIBINPUT_CONF_FILE" > /dev/null << EOF
# Touchscreen calibration for Freenove display
# Rotation: ${ROTATION_DEGREES}°
# Calibration matrix: ${CALIBRATION_MATRIX}

Section "InputClass"
    Identifier "libinput touchscreen catchall"
    MatchIsTouchscreen "on"
    MatchDevicePath "/dev/input/event*"
    Driver "libinput"
    Option "CalibrationMatrix" "${CALIBRATION_MATRIX}"
EndSection

Section "InputClass"
    Identifier "libinput touchscreen catchall"
    MatchIsTouchscreen "on"
    MatchDevicePath "/dev/input/event*"
    Driver "libinput"
    Option "CalibrationMatrix" "${CALIBRATION_MATRIX}"
EndSection
EOF

echo "✅ Created X11 libinput configuration: $LIBINPUT_CONF_FILE"

# Show the configuration
echo ""
echo "Configuration content:"
cat "$LIBINPUT_CONF_FILE"

# Create systemd service for touchscreen rotation (as backup method)
SERVICE_FILE="/etc/systemd/system/touchscreen-rotation.service"
echo "Creating systemd service for touchscreen rotation..."
sudo tee "$SERVICE_FILE" > /dev/null << EOF
[Unit]
Description=Touchscreen Rotation Service
After=graphical-session.target
Wants=graphical-session.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/bin/bash -c '
    sleep 5
    if command -v xinput > /dev/null; then
        TOUCH_DEVICE=\$(xinput list | grep -i "touch" | grep -o "id=[0-9]*" | head -1 | cut -d= -f2)
        if [ -n "\$TOUCH_DEVICE" ]; then
            echo "Found touchscreen device ID: \$TOUCH_DEVICE"
            xinput set-prop "\$TOUCH_DEVICE" "Coordinate Transformation Matrix" ${CALIBRATION_MATRIX}
            echo "Touchscreen rotation applied for device ID: \$TOUCH_DEVICE"
        else
            echo "No touchscreen device found"
        fi
    else
        echo "xinput not available"
    fi
'
User=pi
Group=pi

[Install]
WantedBy=graphical-session.target
EOF

echo "✅ Created systemd service: $SERVICE_FILE"

# Enable the service
sudo systemctl enable touchscreen-rotation.service
echo "✅ Enabled touchscreen-rotation.service"

# Create udev rule as another backup method
UDEV_RULE_FILE="/etc/udev/rules.d/99-touchscreen-rotation.rules"
echo "Creating udev rule for touchscreen rotation..."
sudo tee "$UDEV_RULE_FILE" > /dev/null << EOF
# Touchscreen rotation for Freenove display
# Rotation: ${ROTATION_DEGREES}°
# Calibration matrix: ${CALIBRATION_MATRIX}

# Apply to all touchscreen devices
SUBSYSTEM=="input", KERNEL=="event*", ATTRS{name}=="*touch*", ENV{LIBINPUT_CALIBRATION_MATRIX}="${CALIBRATION_MATRIX}"
SUBSYSTEM=="input", KERNEL=="event*", ATTRS{name}=="*Touch*", ENV{LIBINPUT_CALIBRATION_MATRIX}="${CALIBRATION_MATRIX}"
SUBSYSTEM=="input", KERNEL=="event*", ATTRS{name}=="*TOUCH*", ENV{LIBINPUT_CALIBRATION_MATRIX}="${CALIBRATION_MATRIX}"

# Common touchscreen device names
SUBSYSTEM=="input", KERNEL=="event*", ATTRS{name}=="FT5406*", ENV{LIBINPUT_CALIBRATION_MATRIX}="${CALIBRATION_MATRIX}"
SUBSYSTEM=="input", KERNEL=="event*", ATTRS{name}=="ADS7846*", ENV{LIBINPUT_CALIBRATION_MATRIX}="${CALIBRATION_MATRIX}"
SUBSYSTEM=="input", KERNEL=="event*", ATTRS{name}=="Goodix*", ENV{LIBINPUT_CALIBRATION_MATRIX}="${CALIBRATION_MATRIX}"
SUBSYSTEM=="input", KERNEL=="event*", ATTRS{name}=="FT5*", ENV{LIBINPUT_CALIBRATION_MATRIX}="${CALIBRATION_MATRIX}"
EOF

echo "✅ Created udev rule: $UDEV_RULE_FILE"

# Reload udev rules
echo "Reloading udev rules..."
sudo udevadm control --reload-rules
sudo udevadm trigger

echo ""
echo "=== Touchscreen Configuration Summary ==="
echo "Rotation: ${ROTATION_DEGREES}°"
echo "Calibration matrix: ${CALIBRATION_MATRIX}"
echo ""
echo "Configuration files created:"
echo "  - X11 libinput: $LIBINPUT_CONF_FILE"
echo "  - Systemd service: $SERVICE_FILE"
echo "  - Udev rule: $UDEV_RULE_FILE"
echo ""
echo "📋 Calibration matrix reference:"
echo "  - 0° (normal):    1 0 0 0 1 0 0 0 1"
echo "  - 90° (right):    0 1 0 -1 0 1 0 0 1"
echo "  - 180° (inverted): -1 0 1 0 -1 1 0 0 1"
echo "  - 270° (left):    0 -1 1 1 0 0 0 0 1"
echo ""
echo "🔄 Multiple methods configured for reliability:"
echo "  1. X11 libinput configuration (primary)"
echo "  2. Systemd service (backup)"
echo "  3. Udev rules (backup)"
echo ""
echo "✅ Touchscreen configuration complete!"
echo "touchscreen_configured=true" >> $GITHUB_OUTPUT
