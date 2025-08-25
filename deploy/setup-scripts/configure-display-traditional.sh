#!/bin/bash

echo "=== Configuring Display Rotation (Traditional Graphics Mode) ==="

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

# Determine the config.txt file location
CONFIG_FILE="/boot/firmware/config.txt"
if [ ! -f "$CONFIG_FILE" ]; then
    CONFIG_FILE="/boot/config.txt"
fi

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Could not find config.txt file"
    echo "   Checked: /boot/firmware/config.txt and /boot/config.txt"
    exit 1
fi

echo "Using config.txt file: $CONFIG_FILE"

# Backup the original file
BACKUP_FILE="${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo "Creating backup: $BACKUP_FILE"
sudo cp "$CONFIG_FILE" "$BACKUP_FILE"

# Show current config.txt content
echo ""
echo "Current config.txt content:"
cat "$CONFIG_FILE"

# Determine rotation value based on Freenove documentation
case $ROTATION_DEGREES in
    0)   ROTATE_VALUE="0" ;;
    90)  ROTATE_VALUE="1" ;;
    180) ROTATE_VALUE="2" ;;
    270) ROTATE_VALUE="3" ;;
esac

echo ""
echo "=== Traditional Graphics Mode Configuration ==="
echo "Following Freenove documentation for traditional graphics mode"
echo ""

# Step 1: Comment out KMS/FKMS overlays (as per Freenove docs)
echo "Step 1: Commenting out KMS/FKMS overlays..."
sudo sed -i 's/^dtoverlay=vc4-kms-v3d/#dtoverlay=vc4-kms-v3d/' "$CONFIG_FILE"
sudo sed -i 's/^dtoverlay=vc4-fkms-v3d/#dtoverlay=vc4-fkms-v3d/' "$CONFIG_FILE"

# Step 2: Remove existing rotation settings
echo "Step 2: Removing existing rotation settings..."
sudo sed -i '/^display_lcd_rotate=/d' "$CONFIG_FILE"
sudo sed -i '/^display_rotate=/d' "$CONFIG_FILE"
sudo sed -i '/^lcd_rotate=/d' "$CONFIG_FILE"

# Step 3: Add rotation settings at the end of the file (as per Freenove docs)
echo "Step 3: Adding rotation settings..."
echo "" | sudo tee -a "$CONFIG_FILE"
echo "# Display rotation settings (Traditional graphics mode)" | sudo tee -a "$CONFIG_FILE"
echo "display_lcd_rotate=${ROTATE_VALUE}" | sudo tee -a "$CONFIG_FILE"
echo "display_rotate=${ROTATE_VALUE}" | sudo tee -a "$CONFIG_FILE"
echo "lcd_rotate=${ROTATE_VALUE}" | sudo tee -a "$CONFIG_FILE"

echo ""
echo "✅ Traditional graphics mode configured"
echo "   Rotation: ${ROTATION_DEGREES}° (value: ${ROTATE_VALUE})"

# Show updated config.txt content
echo ""
echo "Updated config.txt content:"
cat "$CONFIG_FILE"

# Verify the changes
if grep -q "display_lcd_rotate=${ROTATE_VALUE}" "$CONFIG_FILE"; then
    echo ""
    echo "✅ Successfully configured display rotation in traditional mode"
    echo "   Rotation: ${ROTATION_DEGREES}°"
    echo "   Mode: Traditional graphics"
    echo "   File: $CONFIG_FILE"
    echo "   Backup: $BACKUP_FILE"
    echo "   This will take effect after reboot"
    echo ""
    echo "📋 Configuration summary:"
    echo "  - KMS/FKMS overlays: Commented out"
    echo "  - display_lcd_rotate=${ROTATE_VALUE}"
    echo "  - display_rotate=${ROTATE_VALUE}"
    echo "  - lcd_rotate=${ROTATE_VALUE}"
    echo ""
    echo "🔄 Next steps:"
    echo "1. Reboot the Raspberry Pi"
    echo "2. Display should be rotated to ${ROTATION_DEGREES}°"
    echo "3. Configure touchscreen input to match display orientation"
    echo ""
    echo "display_configured=true" >> $GITHUB_OUTPUT
else
    echo "❌ Failed to configure display rotation"
    echo "   Restoring backup..."
    sudo cp "$BACKUP_FILE" "$CONFIG_FILE"
    exit 1
fi

echo "Display configuration complete!"
