#!/bin/bash

echo "=== Configuring Display Rotation for FKMS Mode (Freenove Display) ==="

# Configuration
ROTATION_DEGREES="${1:-90}"  # Default to 90° clockwise (portrait)
DISPLAY_MODE="${2:-fkms}"    # Default to FKMS mode

echo "Rotation: ${ROTATION_DEGREES}°"
echo "Display mode: $DISPLAY_MODE"

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

# Check current display mode
if grep -q "dtoverlay=vc4-kms-v3d" "$CONFIG_FILE"; then
    CURRENT_MODE="kms"
    echo ""
    echo "⚠️  Detected KMS mode (dtoverlay=vc4-kms-v3d)"
    echo "   KMS mode requires different configuration"
elif grep -q "dtoverlay=vc4-fkms-v3d" "$CONFIG_FILE"; then
    CURRENT_MODE="fkms"
    echo ""
    echo "✅ Detected FKMS mode (dtoverlay=vc4-fkms-v3d)"
    echo "   FKMS mode is the default for Raspberry Pi 4B/5"
else
    CURRENT_MODE="traditional"
    echo ""
    echo "⚠️  No KMS/FKMS overlay detected - using traditional graphics mode"
fi

echo ""
echo "=== FKMS Mode Configuration ==="
echo "According to Freenove documentation:"
echo "  - FKMS mode can only be rotated through menu options"
echo "  - Command line and config file methods don't work in FKMS mode"
echo "  - You need to use: Preferences > Screen Configuration"
echo ""

if [ "$DISPLAY_MODE" = "traditional" ]; then
    echo "=== Switching to Traditional Graphics Mode ==="
    echo "This will disable FKMS/KMS and use traditional graphics mode"
    echo "Traditional mode allows config file rotation but may have performance impact"
    echo ""
    
    # Comment out KMS/FKMS overlays
    sudo sed -i 's/^dtoverlay=vc4-kms-v3d/#dtoverlay=vc4-kms-v3d/' "$CONFIG_FILE"
    sudo sed -i 's/^dtoverlay=vc4-fkms-v3d/#dtoverlay=vc4-fkms-v3d/' "$CONFIG_FILE"
    
    # Add traditional graphics mode overlay
    if ! grep -q "dtoverlay=vc4-fkms-v3d" "$CONFIG_FILE"; then
        echo "dtoverlay=vc4-fkms-v3d" | sudo tee -a "$CONFIG_FILE"
    fi
    
    # Add display rotation parameters
    case $ROTATION_DEGREES in
        0)   ROTATE_VALUE="0" ;;
        90)  ROTATE_VALUE="1" ;;
        180) ROTATE_VALUE="2" ;;
        270) ROTATE_VALUE="3" ;;
    esac
    
    # Remove existing rotation settings
    sudo sed -i '/^display_lcd_rotate=/d' "$CONFIG_FILE"
    sudo sed -i '/^display_rotate=/d' "$CONFIG_FILE"
    sudo sed -i '/^lcd_rotate=/d' "$CONFIG_FILE"
    
    # Add new rotation settings
    echo "display_lcd_rotate=${ROTATE_VALUE}" | sudo tee -a "$CONFIG_FILE"
    echo "display_rotate=${ROTATE_VALUE}" | sudo tee -a "$CONFIG_FILE"
    echo "lcd_rotate=${ROTATE_VALUE}" | sudo tee -a "$CONFIG_FILE"
    
    echo ""
    echo "✅ Traditional graphics mode configured"
    echo "   Rotation: ${ROTATION_DEGREES}° (value: ${ROTATE_VALUE})"
    
else
    echo "=== FKMS Mode - Manual Configuration Required ==="
    echo ""
    echo "❌ FKMS mode cannot be configured via command line"
    echo ""
    echo "📋 Manual steps required:"
    echo "1. Boot into desktop environment"
    echo "2. Go to: Preferences > Screen Configuration"
    echo "3. Right-click on the display rectangle"
    echo "4. Select 'Orientation'"
    echo "5. Choose: ${ROTATION_DEGREES}° rotation"
    echo ""
    echo "🔧 Alternative: Switch to traditional graphics mode"
    echo "   Run this script with: ./configure-display-fkms.sh ${ROTATION_DEGREES} traditional"
    echo ""
    echo "📖 Reference: Freenove FAQ - FKMS mode can only be rotated by menu options"
    echo ""
    echo "⚠️  No changes made to config.txt (FKMS mode requires manual configuration)"
    echo "display_configured=false" >> $GITHUB_OUTPUT
    echo "Display configuration requires manual setup in FKMS mode"
    exit 0
fi

# Show updated config.txt content
echo ""
echo "Updated config.txt content:"
cat "$CONFIG_FILE"

# Verify the changes
if [ "$DISPLAY_MODE" = "traditional" ]; then
    if grep -q "display_lcd_rotate=${ROTATE_VALUE}" "$CONFIG_FILE"; then
        echo ""
        echo "✅ Successfully configured display rotation in traditional mode"
        echo "   Rotation: ${ROTATION_DEGREES}°"
        echo "   Mode: Traditional graphics"
        echo "   File: $CONFIG_FILE"
        echo "   Backup: $BACKUP_FILE"
        echo "   This will take effect after reboot"
        echo ""
        echo "📋 Next steps:"
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
fi

echo "Display configuration complete!"
