#!/bin/bash

echo "=== Configuring Wayland/Wayfire Display for Portrait Mode ==="

# For Raspberry Pi 5 with DSI, we need to use different configuration
# Check if display rotation is already configured
if grep -q "display_rotate=" /boot/config.txt; then
  echo "Display rotation already configured:"
  grep "display_rotate=" /boot/config.txt
  echo "display_already_configured=true" >> $GITHUB_OUTPUT
else
  echo "Configuring DSI display for portrait mode..."
  # Try multiple rotation methods for better compatibility
  
  # Method 1: Standard display_rotate
  echo "display_rotate=1" | sudo tee -a /boot/config.txt
  
  # Method 2: Alternative rotation values to try
  echo "# Alternative rotation methods (uncomment if needed):" | sudo tee -a /boot/config.txt
  echo "# display_rotate=2  # 180 degrees" | sudo tee -a /boot/config.txt
  echo "# display_rotate=3  # 270 degrees (90° counter-clockwise)" | sudo tee -a /boot/config.txt
  
  # Method 3: Try using lcd_rotate instead
  echo "lcd_rotate=1" | sudo tee -a /boot/config.txt
  
  echo "DSI display configured for portrait mode (90° rotation)"
  echo "display_configured=true" >> $GITHUB_OUTPUT
fi

# Configure DSI-specific settings for better compatibility
if ! grep -q "dtoverlay=vc4-kms-v3d" /boot/config.txt; then
  echo "Enabling KMS driver for DSI display..."
  echo "dtoverlay=vc4-kms-v3d" | sudo tee -a /boot/config.txt
fi

# Also configure framebuffer rotation for console
if grep -q "fbcon=rotate:" /boot/cmdline.txt; then
  echo "Framebuffer rotation already configured:"
  grep "fbcon=rotate:" /boot/cmdline.txt
else
  echo "Configuring framebuffer rotation for console..."
  # Add framebuffer rotation to cmdline.txt
  sudo sed -i 's/$/ fbcon=rotate:1/' /boot/cmdline.txt
  echo "Framebuffer rotation configured for portrait mode"
fi

# Configure Wayfire display rotation (Wayland)
echo "Configuring Wayfire display rotation..."
WAYFIRE_CONFIG="$HOME/.config/wayfire.ini"

# Create wayfire config directory if it doesn't exist
sudo mkdir -p "$(dirname "$WAYFIRE_CONFIG")"

# Check if wayfire config already has output section
if [ -f "$WAYFIRE_CONFIG" ] && grep -q "\[output:DSI-1\]" "$WAYFIRE_CONFIG"; then
  echo "Wayfire config already has DSI-1 output section, updating transform..."
  # Update existing transform
  sudo sed -i '/\[output:DSI-1\]/,/^\[/ s/^transform = .*/transform = 90/' "$WAYFIRE_CONFIG"
else
  echo "Adding DSI-1 output section to wayfire config..."
  # Add new output section
  echo "" | sudo tee -a "$WAYFIRE_CONFIG"
  echo "[output:DSI-1]" | sudo tee -a "$WAYFIRE_CONFIG"
  echo "transform = 90" | sudo tee -a "$WAYFIRE_CONFIG"
fi

echo "Wayland/Wayfire Display configuration summary:"
echo "  - display_rotate=1 (90° clockwise rotation)"
echo "  - dtoverlay=vc4-kms-v3d (KMS driver for DSI)"
echo "  - fbcon=rotate=1 (console rotation)"
echo "  - Wayfire transform=90 (Wayland display rotation)"
echo "  - This will make the DSI screen display in portrait mode"
