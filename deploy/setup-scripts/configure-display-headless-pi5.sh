#!/bin/bash

echo "=== Configuring Display Rotation for Headless Raspberry Pi 5 ==="

# Configuration
ROTATION_DEGREES="${1:-90}"  # Default to 90° clockwise (portrait)

echo "Rotation: ${ROTATION_DEGREES}°"
echo "Target: Headless Raspberry Pi 5"

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

# Determine rotation value
case $ROTATION_DEGREES in
    0)   ROTATE_VALUE="0" ;;
    90)  ROTATE_VALUE="1" ;;
    180) ROTATE_VALUE="2" ;;
    270) ROTATE_VALUE="3" ;;
esac

echo ""
echo "=== Headless Raspberry Pi 5 Configuration ==="
echo "Using framebuffer rotation for headless operation"
echo ""

# Step 1: Enable KMS driver for Raspberry Pi 5
echo "Step 1: Enabling KMS driver for Raspberry Pi 5..."
# Remove commented KMS overlay
sudo sed -i '/^#dtoverlay=vc4-kms-v3d/d' "$CONFIG_FILE"
# Add KMS overlay
if ! grep -q "dtoverlay=vc4-kms-v3d" "$CONFIG_FILE"; then
    echo "dtoverlay=vc4-kms-v3d" | sudo tee -a "$CONFIG_FILE"
fi

# Step 2: Remove existing rotation settings
echo "Step 2: Removing existing rotation settings..."
sudo sed -i '/^display_lcd_rotate=/d' "$CONFIG_FILE"
sudo sed -i '/^display_rotate=/d' "$CONFIG_FILE"
sudo sed -i '/^lcd_rotate=/d' "$CONFIG_FILE"
sudo sed -i '/^fbcon=rotate=/d' "$CONFIG_FILE"

# Step 3: Add framebuffer rotation for headless operation
echo "Step 3: Adding framebuffer rotation for headless mode..."
echo "" | sudo tee -a "$CONFIG_FILE"
echo "# Display rotation for headless Raspberry Pi 5" | sudo tee -a "$CONFIG_FILE"
echo "display_lcd_rotate=${ROTATE_VALUE}" | sudo tee -a "$CONFIG_FILE"
echo "display_rotate=${ROTATE_VALUE}" | sudo tee -a "$CONFIG_FILE"
echo "lcd_rotate=${ROTATE_VALUE}" | sudo tee -a "$CONFIG_FILE"

# Step 4: Configure cmdline.txt for framebuffer rotation
echo "Step 4: Configuring cmdline.txt for framebuffer rotation..."
CMDLINE_FILE="/boot/firmware/cmdline.txt"
if [ ! -f "$CMDLINE_FILE" ]; then
    CMDLINE_FILE="/boot/cmdline.txt"
fi

if [ -f "$CMDLINE_FILE" ]; then
    echo "Using cmdline.txt file: $CMDLINE_FILE"
    CMDLINE_BACKUP="${CMDLINE_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    sudo cp "$CMDLINE_FILE" "$CMDLINE_BACKUP"
    
    # Remove existing fbcon rotation
    sudo sed -i 's/fbcon=rotate=[0-9]*//g' "$CMDLINE_FILE"
    
    # Add fbcon rotation to cmdline
    CMDLINE_CONTENT=$(cat "$CMDLINE_FILE")
    echo "${CMDLINE_CONTENT} fbcon=rotate:${ROTATE_VALUE}" | sudo tee "$CMDLINE_FILE" > /dev/null
    
    echo "Updated cmdline.txt content:"
    cat "$CMDLINE_FILE"
else
    echo "⚠️  cmdline.txt not found, skipping framebuffer configuration"
fi

echo ""
echo "✅ Headless Raspberry Pi 5 display configuration"
echo "   Rotation: ${ROTATION_DEGREES}° (value: ${ROTATE_VALUE})"
echo "   Mode: Headless with KMS driver"

# Show updated config.txt content
echo ""
echo "Updated config.txt content:"
cat "$CONFIG_FILE"

# Verify the changes
if grep -q "display_lcd_rotate=${ROTATE_VALUE}" "$CONFIG_FILE"; then
    echo ""
    echo "✅ Successfully configured display rotation for headless Pi 5"
    echo "   Rotation: ${ROTATION_DEGREES}°"
    echo "   Mode: Headless with KMS driver"
    echo "   File: $CONFIG_FILE"
    echo "   Backup: $BACKUP_FILE"
    echo "   This will take effect after reboot"
    echo ""
    echo "📋 Configuration summary:"
    echo "  - KMS driver: Enabled (dtoverlay=vc4-kms-v3d)"
    echo "  - display_lcd_rotate=${ROTATE_VALUE}"
    echo "  - display_rotate=${ROTATE_VALUE}"
    echo "  - lcd_rotate=${ROTATE_VALUE}"
    if [ -f "$CMDLINE_FILE" ]; then
        echo "  - fbcon=rotate:${ROTATE_VALUE} (in cmdline.txt)"
    fi
    echo ""
    echo "🔄 Next steps:"
    echo "1. Reboot the Raspberry Pi"
    echo "2. Display should be rotated to ${ROTATION_DEGREES}°"
    echo "3. This works for headless operation (no desktop required)"
    echo ""
    echo "💡 Note: This configuration is specifically for headless Raspberry Pi 5"
    echo "   It uses KMS driver with framebuffer rotation"
    echo ""
    echo "display_configured=true" >> $GITHUB_OUTPUT
else
    echo "❌ Failed to configure display rotation"
    echo "   Restoring backup..."
    sudo cp "$BACKUP_FILE" "$CONFIG_FILE"
    if [ -f "$CMDLINE_BACKUP" ]; then
        sudo cp "$CMDLINE_BACKUP" "$CMDLINE_FILE"
    fi
    exit 1
fi

echo "Display configuration complete!"
