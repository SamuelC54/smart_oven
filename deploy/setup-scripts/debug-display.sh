#!/bin/bash

echo "=== Display Rotation Debug Information ==="

# System information
echo "=== System Information ==="
echo "Device Model: $(cat /proc/device-tree/model 2>/dev/null || echo 'Unknown')"
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "Architecture: $(uname -m)"
echo "Kernel: $(uname -r)"
echo ""

# Check config.txt files
echo "=== Config.txt Files ==="
for config_file in "/boot/firmware/config.txt" "/boot/config.txt"; do
    if [ -f "$config_file" ]; then
        echo "Found config file: $config_file"
        echo "Content:"
        cat "$config_file"
        echo ""
    else
        echo "Config file not found: $config_file"
    fi
done

# Check cmdline.txt files
echo "=== Cmdline.txt Files ==="
for cmdline_file in "/boot/firmware/cmdline.txt" "/boot/cmdline.txt"; do
    if [ -f "$cmdline_file" ]; then
        echo "Found cmdline file: $cmdline_file"
        echo "Content:"
        cat "$cmdline_file"
        echo ""
    else
        echo "Cmdline file not found: $cmdline_file"
    fi
done

# Check display-related settings
echo "=== Display Settings Analysis ==="
CONFIG_FILE="/boot/firmware/config.txt"
if [ ! -f "$CONFIG_FILE" ]; then
    CONFIG_FILE="/boot/config.txt"
fi

if [ -f "$CONFIG_FILE" ]; then
    echo "Analyzing: $CONFIG_FILE"
    echo ""
    
    # Check for KMS/FKMS overlays
    echo "KMS/FKMS Overlays:"
    grep -E "(vc4-kms-v3d|vc4-fkms-v3d)" "$CONFIG_FILE" || echo "No KMS/FKMS overlays found"
    echo ""
    
    # Check for rotation settings
    echo "Rotation Settings:"
    grep -E "(display_lcd_rotate|display_rotate|lcd_rotate)" "$CONFIG_FILE" || echo "No rotation settings found"
    echo ""
    
    # Check for commented overlays
    echo "Commented Overlays:"
    grep -E "#.*vc4-(kms|fkms)-v3d" "$CONFIG_FILE" || echo "No commented overlays found"
    echo ""
    
    # Check for any display-related settings
    echo "All Display-Related Settings:"
    grep -i -E "(display|rotate|lcd|kms|fkms)" "$CONFIG_FILE" || echo "No display-related settings found"
    echo ""
fi

# Check current display status
echo "=== Current Display Status ==="
if command -v xrandr > /dev/null; then
    echo "X11 Display Information:"
    xrandr --query 2>/dev/null || echo "xrandr failed or no X11 display"
    echo ""
else
    echo "xrandr not available"
fi

# Check framebuffer
echo "=== Framebuffer Information ==="
if [ -d "/sys/class/graphics" ]; then
    echo "Graphics devices:"
    ls -la /sys/class/graphics/ 2>/dev/null || echo "No graphics devices found"
    echo ""
fi

# Check for any display devices
echo "=== Display Devices ==="
if [ -d "/sys/class/drm" ]; then
    echo "DRM devices:"
    ls -la /sys/class/drm/ 2>/dev/null || echo "No DRM devices found"
    echo ""
fi

# Check loaded modules
echo "=== Loaded Kernel Modules ==="
echo "Display-related modules:"
lsmod | grep -E "(vc4|drm|fb)" || echo "No display-related modules found"
echo ""

# Check boot logs for display information
echo "=== Boot Log Display Information ==="
echo "Recent boot logs (last 50 lines):"
journalctl -b --no-pager -n 50 | grep -i -E "(display|rotate|lcd|kms|fkms|vc4)" || echo "No display-related boot logs found"
echo ""

# Check if we're in a desktop environment
echo "=== Desktop Environment ==="
if [ -n "$DISPLAY" ]; then
    echo "X11 Display: $DISPLAY"
    echo "Desktop: $XDG_CURRENT_DESKTOP"
    echo "Session: $XDG_SESSION_TYPE"
else
    echo "No X11 display detected"
fi
echo ""

# Check for Wayland
if [ -n "$WAYLAND_DISPLAY" ]; then
    echo "Wayland Display: $WAYLAND_DISPLAY"
fi

echo "=== Debug Complete ==="
