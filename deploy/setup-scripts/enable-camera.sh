#!/bin/bash
# Enable camera interface on Raspberry Pi

set -e

echo "=== Enabling Camera Interface ==="

CONFIG_FILE="/boot/config.txt"
FIRMWARE_CONFIG_FILE="/boot/firmware/config.txt"

# Determine which config file exists
if [ -f "$FIRMWARE_CONFIG_FILE" ]; then
    CONFIG_FILE="$FIRMWARE_CONFIG_FILE"
    echo "Using firmware config file: $CONFIG_FILE"
elif [ -f "$CONFIG_FILE" ]; then
    echo "Using legacy config file: $CONFIG_FILE"
else
    echo "Error: Neither /boot/config.txt nor /boot/firmware/config.txt found"
    exit 1
fi

# Function to enable camera in config
enable_camera_config() {
    local config_file="$1"
    local changed=false
    
    echo "Checking camera configuration in $config_file..."
    
    # Check if camera is already enabled
    if grep -q "^start_x=1" "$config_file"; then
        echo "Camera is already enabled in config"
    else
        # Enable camera
        if grep -q "^start_x=" "$config_file"; then
            # Replace existing start_x line
            sudo sed -i 's/^start_x=.*/start_x=1/' "$config_file"
        else
            # Add start_x line
            echo "start_x=1" | sudo tee -a "$config_file" > /dev/null
        fi
        echo "Added start_x=1 to $config_file"
        changed=true
    fi
    
    # Ensure GPU memory is sufficient for camera
    if grep -q "^gpu_mem=" "$config_file"; then
        # Get current GPU memory value
        current_gpu_mem=$(grep "^gpu_mem=" "$config_file" | cut -d'=' -f2)
        if [ "$current_gpu_mem" -lt 128 ]; then
            sudo sed -i 's/^gpu_mem=.*/gpu_mem=128/' "$config_file"
            echo "Increased GPU memory to 128MB for camera support"
            changed=true
        else
            echo "GPU memory is already sufficient ($current_gpu_mem MB)"
        fi
    else
        # Add GPU memory setting
        echo "gpu_mem=128" | sudo tee -a "$config_file" > /dev/null
        echo "Set GPU memory to 128MB for camera support"
        changed=true
    fi
    
    if [ "$changed" = true ]; then
        return 0
    else
        return 1
    fi
}

# Enable camera using raspi-config if available
if command -v raspi-config >/dev/null 2>&1; then
    echo "Enabling camera using raspi-config..."
    sudo raspi-config nonint do_camera 0
    CAMERA_ENABLED_BY_RASPI_CONFIG=true
else
    echo "raspi-config not available, configuring manually..."
    CAMERA_ENABLED_BY_RASPI_CONFIG=false
fi

# Also configure manually to ensure settings are correct
if enable_camera_config "$CONFIG_FILE"; then
    NEEDS_REBOOT=true
else
    NEEDS_REBOOT=false
fi

# Create camera group if it doesn't exist
if ! getent group video >/dev/null; then
    sudo groupadd video
    echo "Created video group"
fi

# Add samuel user to video group
if getent passwd samuel >/dev/null; then
    if ! groups samuel | grep -q video; then
        sudo usermod -a -G video samuel
        echo "Added user 'samuel' to video group"
        NEEDS_REBOOT=true
    else
        echo "User 'samuel' already in video group"
    fi
else
    echo "User 'samuel' not found - camera permissions may need manual setup"
fi

# Check if camera module is loaded
if ! lsmod | grep -q bcm2835_v4l2; then
    echo "Camera module not currently loaded (this is normal before reboot)"
fi

# Install camera utilities if not present
if ! command -v libcamera-hello >/dev/null 2>&1; then
    echo "Installing libcamera utilities..."
    sudo apt-get update -qq
    sudo apt-get install -y libcamera-apps libcamera-tools
    echo "Installed libcamera utilities"
else
    echo "libcamera utilities already installed"
fi

echo "=== Camera Configuration Complete ==="
echo "Camera interface: ENABLED"
echo "GPU Memory: $(grep "^gpu_mem=" "$CONFIG_FILE" | cut -d'=' -f2 || echo "default")MB"
if getent passwd samuel >/dev/null; then
    echo "User groups: $(groups samuel)"
else
    echo "User 'samuel' not found"
fi

if [ "$NEEDS_REBOOT" = true ]; then
    echo "REBOOT REQUIRED to activate camera changes"
    echo "needs-reboot=true" >> $GITHUB_OUTPUT
else
    echo "No reboot required for camera setup"
    echo "needs-reboot=false" >> $GITHUB_OUTPUT
fi

echo "After reboot, test camera with: libcamera-hello --list-cameras"
