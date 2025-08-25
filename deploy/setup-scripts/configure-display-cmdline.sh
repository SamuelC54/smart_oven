#!/bin/bash

echo "=== Configuring Display Rotation via cmdline.txt (Headless Method) ==="

# Configuration
ROTATION_DEGREES="${1:-90}"  # Default to 90° clockwise, can be overridden
RESOLUTION="${2:-720x1280}"  # Default resolution for portrait mode

echo "Rotation: ${ROTATION_DEGREES}°"
echo "Resolution: ${RESOLUTION}"

# Validate rotation value
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

# Determine the cmdline.txt file location
CMDLINE_FILE="/boot/firmware/cmdline.txt"
if [ ! -f "$CMDLINE_FILE" ]; then
    CMDLINE_FILE="/boot/cmdline.txt"
fi

if [ ! -f "$CMDLINE_FILE" ]; then
    echo "❌ Could not find cmdline.txt file"
    echo "   Checked: /boot/firmware/cmdline.txt and /boot/cmdline.txt"
    exit 1
fi

echo "Using cmdline.txt file: $CMDLINE_FILE"

# Backup the original file
BACKUP_FILE="${CMDLINE_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo "Creating backup: $BACKUP_FILE"
sudo cp "$CMDLINE_FILE" "$BACKUP_FILE"

# Show current cmdline.txt content
echo ""
echo "Current cmdline.txt content:"
cat "$CMDLINE_FILE"

# Check if video parameter already exists
if grep -q "video=DSI-1:" "$CMDLINE_FILE"; then
    echo ""
    echo "⚠️  Video parameter already exists in cmdline.txt"
    echo "   Current video parameter:"
    grep "video=DSI-1:" "$CMDLINE_FILE"
    
    # Update existing video parameter
    echo "   Updating existing video parameter..."
    sudo sed -i "s/video=DSI-1:[^[:space:]]*/video=DSI-1:${RESOLUTION}@60,rotate=${ROTATION_DEGREES}/g" "$CMDLINE_FILE"
else
    echo ""
    echo "Adding video parameter to cmdline.txt..."
    
    # Add video parameter to the end of cmdline.txt
    VIDEO_PARAM="video=DSI-1:${RESOLUTION}@60,rotate=${ROTATION_DEGREES}"
    echo "$VIDEO_PARAM" | sudo tee -a "$CMDLINE_FILE"
fi

# Show updated cmdline.txt content
echo ""
echo "Updated cmdline.txt content:"
cat "$CMDLINE_FILE"

# Verify the change
if grep -q "video=DSI-1:${RESOLUTION}@60,rotate=${ROTATION_DEGREES}" "$CMDLINE_FILE"; then
    echo ""
    echo "✅ Successfully configured display rotation in cmdline.txt"
    echo "   Video parameter: video=DSI-1:${RESOLUTION}@60,rotate=${ROTATION_DEGREES}"
    echo ""
    echo "Configuration summary:"
    echo "  - Rotation: ${ROTATION_DEGREES}°"
    echo "  - Resolution: ${RESOLUTION}"
    echo "  - File: $CMDLINE_FILE"
    echo "  - Backup: $BACKUP_FILE"
    echo "  - This will take effect after reboot"
    echo ""
    echo "Note: This rotation applies to both DSI and HDMI displays simultaneously"
    echo "      If you have both connected, they will share the same rotation"
    
    echo "display_configured=true" >> $GITHUB_OUTPUT
else
    echo "❌ Failed to configure display rotation in cmdline.txt"
    echo "   Restoring backup..."
    sudo cp "$BACKUP_FILE" "$CMDLINE_FILE"
    exit 1
fi

echo "Display rotation configuration complete!"
