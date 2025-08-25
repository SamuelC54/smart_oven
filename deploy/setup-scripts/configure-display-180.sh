#!/bin/bash

echo "=== Configuring Display Rotation (180° Method - Freenove Recommended) ==="

# Configuration - Using 180° rotation as mentioned in Freenove docs
ROTATION_DEGREES="180"  # Fixed to 180° as per Freenove recommendation
ROTATE_VALUE="2"        # 180° = value 2

echo "Rotation: ${ROTATION_DEGREES}° (Freenove recommended method)"
echo "Note: This rotates display and touch simultaneously"

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

echo ""
echo "=== 180° Rotation Method (Freenove Recommended) ==="
echo "Following Freenove documentation for 180° rotation"
echo "This method rotates both display and touch simultaneously"
echo ""

# Step 1: Comment out KMS/FKMS overlays (as per Freenove docs)
echo "Step 1: Commenting out KMS/FKMS overlays..."
sudo sed -i 's/^dtoverlay=vc4-kms-v3d/#dtoverlay=vc4-kms-v3d/' "$CONFIG_FILE"
sudo sed -i 's/^dtoverlay=vc4-fkms-v3d/#dtoverlay=vc4-fkms-v3d/' "$CONFIG_FILE"

# Step 2: Add FKMS overlay (as per Freenove docs for 180° method)
echo "Step 2: Adding FKMS overlay for 180° method..."
# Remove existing FKMS overlay lines first
sudo sed -i '/^dtoverlay=vc4-fkms-v3d/d' "$CONFIG_FILE"
# Add FKMS overlay
echo "dtoverlay=vc4-fkms-v3d" | sudo tee -a "$CONFIG_FILE"

# Step 3: Remove existing rotation settings
echo "Step 3: Removing existing rotation settings..."
sudo sed -i '/^display_lcd_rotate=/d' "$CONFIG_FILE"
sudo sed -i '/^display_rotate=/d' "$CONFIG_FILE"
sudo sed -i '/^lcd_rotate=/d' "$CONFIG_FILE"

# Step 4: Add rotation settings (as per Freenove docs)
echo "Step 4: Adding 180° rotation settings..."
echo "" | sudo tee -a "$CONFIG_FILE"
echo "# Display rotation settings (180° method - Freenove recommended)" | sudo tee -a "$CONFIG_FILE"
echo "display_lcd_rotate=${ROTATE_VALUE}" | sudo tee -a "$CONFIG_FILE"
echo "display_rotate=${ROTATE_VALUE}" | sudo tee -a "$CONFIG_FILE"
echo "lcd_rotate=${ROTATE_VALUE}" | sudo tee -a "$CONFIG_FILE"

echo ""
echo "✅ 180° rotation method configured"
echo "   Rotation: ${ROTATION_DEGREES}° (value: ${ROTATE_VALUE})"
echo "   Method: Freenove recommended 180° rotation"

# Show updated config.txt content
echo ""
echo "Updated config.txt content:"
cat "$CONFIG_FILE"

# Verify the changes
if grep -q "display_lcd_rotate=${ROTATE_VALUE}" "$CONFIG_FILE"; then
    echo ""
    echo "✅ Successfully configured 180° display rotation"
    echo "   Rotation: ${ROTATION_DEGREES}°"
    echo "   Method: Freenove recommended 180° method"
    echo "   File: $CONFIG_FILE"
    echo "   Backup: $BACKUP_FILE"
    echo "   This will take effect after reboot"
    echo ""
    echo "📋 Configuration summary:"
    echo "  - KMS overlays: Commented out"
    echo "  - FKMS overlay: Enabled"
    echo "  - display_lcd_rotate=${ROTATE_VALUE}"
    echo "  - display_rotate=${ROTATE_VALUE}"
    echo "  - lcd_rotate=${ROTATE_VALUE}"
    echo ""
    echo "🔄 Next steps:"
    echo "1. Reboot the Raspberry Pi"
    echo "2. Display should be rotated 180° (upside down)"
    echo "3. Touch input should be automatically aligned"
    echo ""
    echo "💡 Note: 180° rotation is the most reliable method according to Freenove"
    echo "   If this works, you can then try 90° rotation"
    echo ""
    echo "display_configured=true" >> $GITHUB_OUTPUT
else
    echo "❌ Failed to configure display rotation"
    echo "   Restoring backup..."
    sudo cp "$BACKUP_FILE" "$CONFIG_FILE"
    exit 1
fi

echo "Display configuration complete!"
