#!/bin/bash

echo "=== Configuring Touchscreen Input via Device Tree Overlay (7-inch Display) ==="

# Configuration
DISPLAY_SIZE="${1:-7inch}"  # Default to 7-inch, can be overridden
SWAPXY="${2:-true}"         # Default to swapxy for portrait mode
INVX="${3:-false}"          # Default to no X inversion
INVY="${4:-false}"          # Default to no Y inversion
SIZEX="${5:-720}"           # Default touch horizontal resolution
SIZEY="${6:-1280}"          # Default touch vertical resolution

echo "Display size: $DISPLAY_SIZE"
echo "Swap XY: $SWAPXY"
echo "Invert X: $INVX"
echo "Invert Y: $INVY"
echo "Touch resolution: ${SIZEX}x${SIZEY}"

# Validate display size
case $DISPLAY_SIZE in
    5inch|7inch)
        echo "✅ Valid display size: $DISPLAY_SIZE"
        ;;
    *)
        echo "❌ Invalid display size: $DISPLAY_SIZE"
        echo "   Valid values are: 5inch, 7inch"
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

# Determine the overlay name based on display size
OVERLAY_NAME="vc4-kms-dsi-ili9881-${DISPLAY_SIZE}"

# Build the overlay parameters
OVERLAY_PARAMS="$OVERLAY_NAME"

# Add swapxy parameter if needed
if [ "$SWAPXY" = "true" ]; then
    OVERLAY_PARAMS="${OVERLAY_PARAMS},swapxy"
fi

# Add invx parameter if needed
if [ "$INVX" = "true" ]; then
    OVERLAY_PARAMS="${OVERLAY_PARAMS},invx"
fi

# Add invy parameter if needed
if [ "$INVY" = "true" ]; then
    OVERLAY_PARAMS="${OVERLAY_PARAMS},invy"
fi

# Add size parameters
OVERLAY_PARAMS="${OVERLAY_PARAMS},sizex=${SIZEX},sizey=${SIZEY}"

echo ""
echo "Overlay configuration: dtoverlay=${OVERLAY_PARAMS}"

# Check if overlay already exists
if grep -q "dtoverlay=vc4-kms-dsi-ili9881-${DISPLAY_SIZE}" "$CONFIG_FILE"; then
    echo ""
    echo "⚠️  Touchscreen overlay already exists in config.txt"
    echo "   Current overlay configuration:"
    grep "dtoverlay=vc4-kms-dsi-ili9881-${DISPLAY_SIZE}" "$CONFIG_FILE"
    
    # Update existing overlay
    echo "   Updating existing overlay configuration..."
    sudo sed -i "s/dtoverlay=vc4-kms-dsi-ili9881-${DISPLAY_SIZE}[^[:space:]]*/dtoverlay=${OVERLAY_PARAMS}/g" "$CONFIG_FILE"
else
    echo ""
    echo "Adding touchscreen overlay to config.txt..."
    
    # Add overlay line to config.txt
    echo "dtoverlay=${OVERLAY_PARAMS}" | sudo tee -a "$CONFIG_FILE"
fi

# Show updated config.txt content
echo ""
echo "Updated config.txt content:"
cat "$CONFIG_FILE"

# Verify the change
if grep -q "dtoverlay=${OVERLAY_PARAMS}" "$CONFIG_FILE"; then
    echo ""
    echo "✅ Successfully configured touchscreen overlay in config.txt"
    echo "   Overlay: dtoverlay=${OVERLAY_PARAMS}"
    echo ""
    echo "Configuration summary:"
    echo "  - Display size: $DISPLAY_SIZE"
    echo "  - Swap XY: $SWAPXY (rotates touch 90° logically)"
    echo "  - Invert X: $INVX"
    echo "  - Invert Y: $INVY"
    echo "  - Touch resolution: ${SIZEX}x${SIZEY}"
    echo "  - File: $CONFIG_FILE"
    echo "  - Backup: $BACKUP_FILE"
    echo "  - This will take effect after reboot"
    echo ""
    echo "Device Tree overlay options:"
    echo "  - swapxy: Swaps X and Y axes (rotate 90° logically)"
    echo "  - invx: Inverts the touch X-axis (left/right)"
    echo "  - invy: Inverts the touch Y-axis (up/down)"
    echo "  - sizex: Sets touch horizontal resolution"
    echo "  - sizey: Sets touch vertical resolution"
    echo "  - disable_touch: Disables touchscreen (add =0 to enable)"
    
    echo "touchscreen_configured=true" >> $GITHUB_OUTPUT
else
    echo "❌ Failed to configure touchscreen overlay in config.txt"
    echo "   Restoring backup..."
    sudo cp "$BACKUP_FILE" "$CONFIG_FILE"
    exit 1
fi

echo "Touchscreen configuration complete!"
