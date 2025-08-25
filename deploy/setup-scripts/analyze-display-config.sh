#!/bin/bash

echo "=== Display Configuration Analysis Script ==="
echo "This script will analyze all display-related configuration files"
echo "Run this BEFORE making manual changes, then AFTER making changes"
echo "to see what actually works."
echo ""

# Create timestamp for comparison
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ANALYSIS_DIR="/tmp/display-analysis-${TIMESTAMP}"
mkdir -p "$ANALYSIS_DIR"

echo "Analysis timestamp: $TIMESTAMP"
echo "Analysis directory: $ANALYSIS_DIR"
echo ""

# Function to save file content with metadata
save_file_content() {
    local file_path="$1"
    local description="$2"
    
    if [ -f "$file_path" ]; then
        echo "=== $description ===" > "$ANALYSIS_DIR/$(basename "$file_path").before"
        echo "File: $file_path" >> "$ANALYSIS_DIR/$(basename "$file_path").before"
        echo "Timestamp: $(date)" >> "$ANALYSIS_DIR/$(basename "$file_path").before"
        echo "Permissions: $(ls -la "$file_path")" >> "$ANALYSIS_DIR/$(basename "$file_path").before"
        echo "Content:" >> "$ANALYSIS_DIR/$(basename "$file_path").before"
        cat "$file_path" >> "$ANALYSIS_DIR/$(basename "$file_path").before"
        echo "✅ Saved: $file_path"
    else
        echo "❌ Not found: $file_path"
    fi
}

# Function to get system information
get_system_info() {
    echo "=== System Information ===" > "$ANALYSIS_DIR/system-info.before"
    echo "Timestamp: $(date)" >> "$ANALYSIS_DIR/system-info.before"
    echo "Device Model: $(cat /proc/device-tree/model 2>/dev/null || echo 'Unknown')" >> "$ANALYSIS_DIR/system-info.before"
    echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)" >> "$ANALYSIS_DIR/system-info.before"
    echo "Architecture: $(uname -m)" >> "$ANALYSIS_DIR/system-info.before"
    echo "Kernel: $(uname -r)" >> "$ANALYSIS_DIR/system-info.before"
    echo "Uptime: $(uptime)" >> "$ANALYSIS_DIR/system-info.before"
    echo "✅ Saved: System information"
}

# Function to get display hardware info
get_display_hardware() {
    echo "=== Display Hardware Information ===" > "$ANALYSIS_DIR/display-hardware.before"
    echo "Timestamp: $(date)" >> "$ANALYSIS_DIR/display-hardware.before"
    
    # DRM devices
    echo "DRM Devices:" >> "$ANALYSIS_DIR/display-hardware.before"
    if [ -d "/sys/class/drm" ]; then
        ls -la /sys/class/drm/ >> "$ANALYSIS_DIR/display-hardware.before" 2>&1
    else
        echo "No DRM devices found" >> "$ANALYSIS_DIR/display-hardware.before"
    fi
    
    # Graphics devices
    echo "" >> "$ANALYSIS_DIR/display-hardware.before"
    echo "Graphics Devices:" >> "$ANALYSIS_DIR/display-hardware.before"
    if [ -d "/sys/class/graphics" ]; then
        ls -la /sys/class/graphics/ >> "$ANALYSIS_DIR/display-hardware.before" 2>&1
    else
        echo "No graphics devices found" >> "$ANALYSIS_DIR/display-hardware.before"
    fi
    
    # Loaded modules
    echo "" >> "$ANALYSIS_DIR/display-hardware.before"
    echo "Display-related Kernel Modules:" >> "$ANALYSIS_DIR/display-hardware.before"
    lsmod | grep -E "(vc4|drm|fb|panel|backlight)" >> "$ANALYSIS_DIR/display-hardware.before" 2>&1
    
    echo "✅ Saved: Display hardware information"
}

# Function to get current display status
get_display_status() {
    echo "=== Current Display Status ===" > "$ANALYSIS_DIR/display-status.before"
    echo "Timestamp: $(date)" >> "$ANALYSIS_DIR/display-status.before"
    
    # X11 display info
    if command -v xrandr > /dev/null; then
        echo "X11 Display Information:" >> "$ANALYSIS_DIR/display-status.before"
        xrandr --query >> "$ANALYSIS_DIR/display-status.before" 2>&1
    else
        echo "xrandr not available" >> "$ANALYSIS_DIR/display-status.before"
    fi
    
    # Framebuffer info
    echo "" >> "$ANALYSIS_DIR/display-status.before"
    echo "Framebuffer Information:" >> "$ANALYSIS_DIR/display-status.before"
    if [ -f "/proc/fb" ]; then
        cat /proc/fb >> "$ANALYSIS_DIR/display-status.before"
    else
        echo "No framebuffer information available" >> "$ANALYSIS_DIR/display-status.before"
    fi
    
    # Console info
    echo "" >> "$ANALYSIS_DIR/display-status.before"
    echo "Console Information:" >> "$ANALYSIS_DIR/display-status.before"
    cat /proc/consoles >> "$ANALYSIS_DIR/display-status.before" 2>&1
    
    echo "✅ Saved: Display status information"
}

# Function to get environment info
get_environment_info() {
    echo "=== Environment Information ===" > "$ANALYSIS_DIR/environment.before"
    echo "Timestamp: $(date)" >> "$ANALYSIS_DIR/environment.before"
    
    # Display environment
    echo "DISPLAY: $DISPLAY" >> "$ANALYSIS_DIR/environment.before"
    echo "WAYLAND_DISPLAY: $WAYLAND_DISPLAY" >> "$ANALYSIS_DIR/environment.before"
    echo "XDG_CURRENT_DESKTOP: $XDG_CURRENT_DESKTOP" >> "$ANALYSIS_DIR/environment.before"
    echo "XDG_SESSION_TYPE: $XDG_SESSION_TYPE" >> "$ANALYSIS_DIR/environment.before"
    
    # User info
    echo "USER: $USER" >> "$ANALYSIS_DIR/environment.before"
    echo "HOME: $HOME" >> "$ANALYSIS_DIR/environment.before"
    
    echo "✅ Saved: Environment information"
}

# Function to get boot logs
get_boot_logs() {
    echo "=== Boot Logs (Display Related) ===" > "$ANALYSIS_DIR/boot-logs.before"
    echo "Timestamp: $(date)" >> "$ANALYSIS_DIR/boot-logs.before"
    
    # Recent boot logs with display keywords
    journalctl -b --no-pager | grep -i -E "(display|rotate|lcd|kms|fkms|vc4|drm|panel|backlight)" >> "$ANALYSIS_DIR/boot-logs.before" 2>&1
    
    echo "✅ Saved: Boot logs"
}

# Function to get all relevant config files
get_config_files() {
    echo "=== Configuration Files Analysis ===" > "$ANALYSIS_DIR/config-summary.before"
    echo "Timestamp: $(date)" >> "$ANALYSIS_DIR/config-summary.before"
    
    # List all config files
    echo "Configuration files found:" >> "$ANALYSIS_DIR/config-summary.before"
    for config_file in "/boot/firmware/config.txt" "/boot/config.txt" "/boot/firmware/cmdline.txt" "/boot/cmdline.txt"; do
        if [ -f "$config_file" ]; then
            echo "✅ $config_file" >> "$ANALYSIS_DIR/config-summary.before"
        else
            echo "❌ $config_file (not found)" >> "$ANALYSIS_DIR/config-summary.before"
        fi
    done
    
    # Check for X11 config files
    echo "" >> "$ANALYSIS_DIR/config-summary.before"
    echo "X11 Configuration files:" >> "$ANALYSIS_DIR/config-summary.before"
    for x11_file in "/usr/share/X11/xorg.conf.d/40-libinput.conf" "/etc/X11/xorg.conf" "/etc/X11/xorg.conf.d/"; do
        if [ -f "$x11_file" ] || [ -d "$x11_file" ]; then
            echo "✅ $x11_file" >> "$ANALYSIS_DIR/config-summary.before"
        else
            echo "❌ $x11_file (not found)" >> "$ANALYSIS_DIR/config-summary.before"
        fi
    done
    
    echo "✅ Saved: Configuration summary"
}

# Main analysis
echo "Starting comprehensive display configuration analysis..."
echo ""

# Get system information
get_system_info

# Get display hardware information
get_display_hardware

# Get current display status
get_display_status

# Get environment information
get_environment_info

# Get boot logs
get_boot_logs

# Get configuration summary
get_config_files

# Save all configuration files
echo ""
echo "Saving configuration files..."
save_file_content "/boot/firmware/config.txt" "Boot Configuration (Firmware)"
save_file_content "/boot/config.txt" "Boot Configuration (Legacy)"
save_file_content "/boot/firmware/cmdline.txt" "Kernel Command Line (Firmware)"
save_file_content "/boot/cmdline.txt" "Kernel Command Line (Legacy)"
save_file_content "/usr/share/X11/xorg.conf.d/40-libinput.conf" "X11 Libinput Configuration"
save_file_content "/etc/X11/xorg.conf" "X11 Main Configuration"

# Check for any other relevant files
echo ""
echo "Checking for additional display-related files..."

# Check for udev rules
if [ -f "/etc/udev/rules.d/99-touchscreen-rotation.rules" ]; then
    save_file_content "/etc/udev/rules.d/99-touchscreen-rotation.rules" "Udev Touchscreen Rules"
fi

# Check for systemd services
if [ -f "/etc/systemd/system/touchscreen-rotation.service" ]; then
    save_file_content "/etc/systemd/system/touchscreen-rotation.service" "Touchscreen Rotation Service"
fi

# Check for any .conf files in xorg.conf.d
if [ -d "/usr/share/X11/xorg.conf.d" ]; then
    for conf_file in /usr/share/X11/xorg.conf.d/*.conf; do
        if [ -f "$conf_file" ]; then
            save_file_content "$conf_file" "X11 Configuration: $(basename "$conf_file")"
        fi
    done
fi

echo ""
echo "=== Analysis Complete ==="
echo ""
echo "📁 All files saved to: $ANALYSIS_DIR"
echo ""
echo "📋 Next steps:"
echo "1. Make your manual display rotation changes"
echo "2. Run this script again with: ./analyze-display-config.sh after"
echo "3. Compare the 'before' and 'after' files to see what changed"
echo ""
echo "🔍 To compare files after making changes:"
echo "   diff $ANALYSIS_DIR/config.txt.before $ANALYSIS_DIR/config.txt.after"
echo "   diff $ANALYSIS_DIR/cmdline.txt.before $ANALYSIS_DIR/cmdline.txt.after"
echo ""
echo "💡 Tip: After making manual changes, run:"
echo "   ./analyze-display-config.sh after"
echo "   This will create 'after' versions for comparison"
echo ""

# Create a marker file to indicate this is the "before" analysis
echo "BEFORE_ANALYSIS" > "$ANALYSIS_DIR/analysis_type"
echo "Timestamp: $TIMESTAMP" >> "$ANALYSIS_DIR/analysis_type"

echo "✅ Analysis complete! Make your manual changes and run this script again."
