#!/bin/bash

echo "=== Display Configuration Analysis (AFTER Changes) ==="
echo "This script will analyze the configuration AFTER you made manual changes"
echo ""

# Find the most recent analysis directory
ANALYSIS_DIR=$(ls -td /tmp/display-analysis-* 2>/dev/null | head -1)

if [ -z "$ANALYSIS_DIR" ] || [ ! -d "$ANALYSIS_DIR" ]; then
    echo "❌ No previous analysis directory found!"
    echo "   Please run: ./analyze-display-config.sh first"
    exit 1
fi

echo "Found previous analysis directory: $ANALYSIS_DIR"
echo ""

# Function to save file content with metadata
save_file_content() {
    local file_path="$1"
    local description="$2"
    
    if [ -f "$file_path" ]; then
        echo "=== $description ===" > "$ANALYSIS_DIR/$(basename "$file_path").after"
        echo "File: $file_path" >> "$ANALYSIS_DIR/$(basename "$file_path").after"
        echo "Timestamp: $(date)" >> "$ANALYSIS_DIR/$(basename "$file_path").after"
        echo "Permissions: $(ls -la "$file_path")" >> "$ANALYSIS_DIR/$(basename "$file_path").after"
        echo "Content:" >> "$ANALYSIS_DIR/$(basename "$file_path").after"
        cat "$file_path" >> "$ANALYSIS_DIR/$(basename "$file_path").after"
        echo "✅ Saved: $file_path"
    else
        echo "❌ Not found: $file_path"
    fi
}

# Function to get system information
get_system_info() {
    echo "=== System Information (AFTER) ===" > "$ANALYSIS_DIR/system-info.after"
    echo "Timestamp: $(date)" >> "$ANALYSIS_DIR/system-info.after"
    echo "Device Model: $(cat /proc/device-tree/model 2>/dev/null || echo 'Unknown')" >> "$ANALYSIS_DIR/system-info.after"
    echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)" >> "$ANALYSIS_DIR/system-info.after"
    echo "Architecture: $(uname -m)" >> "$ANALYSIS_DIR/system-info.after"
    echo "Kernel: $(uname -r)" >> "$ANALYSIS_DIR/system-info.after"
    echo "Uptime: $(uptime)" >> "$ANALYSIS_DIR/system-info.after"
    echo "✅ Saved: System information (after)"
}

# Function to get display status
get_display_status() {
    echo "=== Current Display Status (AFTER) ===" > "$ANALYSIS_DIR/display-status.after"
    echo "Timestamp: $(date)" >> "$ANALYSIS_DIR/display-status.after"
    
    # X11 display info
    if command -v xrandr > /dev/null; then
        echo "X11 Display Information:" >> "$ANALYSIS_DIR/display-status.after"
        xrandr --query >> "$ANALYSIS_DIR/display-status.after" 2>&1
    else
        echo "xrandr not available" >> "$ANALYSIS_DIR/display-status.after"
    fi
    
    # Framebuffer info
    echo "" >> "$ANALYSIS_DIR/display-status.after"
    echo "Framebuffer Information:" >> "$ANALYSIS_DIR/display-status.after"
    if [ -f "/proc/fb" ]; then
        cat /proc/fb >> "$ANALYSIS_DIR/display-status.after"
    else
        echo "No framebuffer information available" >> "$ANALYSIS_DIR/display-status.after"
    fi
    
    echo "✅ Saved: Display status (after)"
}

# Function to get environment info
get_environment_info() {
    echo "=== Environment Information (AFTER) ===" > "$ANALYSIS_DIR/environment.after"
    echo "Timestamp: $(date)" >> "$ANALYSIS_DIR/environment.after"
    
    # Display environment
    echo "DISPLAY: $DISPLAY" >> "$ANALYSIS_DIR/environment.after"
    echo "WAYLAND_DISPLAY: $WAYLAND_DISPLAY" >> "$ANALYSIS_DIR/environment.after"
    echo "XDG_CURRENT_DESKTOP: $XDG_CURRENT_DESKTOP" >> "$ANALYSIS_DIR/environment.after"
    echo "XDG_SESSION_TYPE: $XDG_SESSION_TYPE" >> "$ANALYSIS_DIR/environment.after"
    
    echo "✅ Saved: Environment information (after)"
}

# Main analysis
echo "Starting AFTER analysis..."
echo ""

# Get system information
get_system_info

# Get display status
get_display_status

# Get environment information
get_environment_info

# Save all configuration files
echo ""
echo "Saving configuration files (after changes)..."
save_file_content "/boot/firmware/config.txt" "Boot Configuration (Firmware) - AFTER"
save_file_content "/boot/config.txt" "Boot Configuration (Legacy) - AFTER"
save_file_content "/boot/firmware/cmdline.txt" "Kernel Command Line (Firmware) - AFTER"
save_file_content "/boot/cmdline.txt" "Kernel Command Line (Legacy) - AFTER"
save_file_content "/usr/share/X11/xorg.conf.d/40-libinput.conf" "X11 Libinput Configuration - AFTER"
save_file_content "/etc/X11/xorg.conf" "X11 Main Configuration - AFTER"

# Check for any other relevant files
echo ""
echo "Checking for additional display-related files..."

# Check for udev rules
if [ -f "/etc/udev/rules.d/99-touchscreen-rotation.rules" ]; then
    save_file_content "/etc/udev/rules.d/99-touchscreen-rotation.rules" "Udev Touchscreen Rules - AFTER"
fi

# Check for systemd services
if [ -f "/etc/systemd/system/touchscreen-rotation.service" ]; then
    save_file_content "/etc/systemd/system/touchscreen-rotation.service" "Touchscreen Rotation Service - AFTER"
fi

# Check for any .conf files in xorg.conf.d
if [ -d "/usr/share/X11/xorg.conf.d" ]; then
    for conf_file in /usr/share/X11/xorg.conf.d/*.conf; do
        if [ -f "$conf_file" ]; then
            save_file_content "$conf_file" "X11 Configuration: $(basename "$conf_file") - AFTER"
        fi
    done
fi

# Create comparison report
echo ""
echo "=== Creating Comparison Report ==="
echo ""

COMPARISON_REPORT="$ANALYSIS_DIR/comparison-report.txt"
echo "=== Display Configuration Comparison Report ===" > "$COMPARISON_REPORT"
echo "Generated: $(date)" >> "$COMPARISON_REPORT"
echo "Analysis Directory: $ANALYSIS_DIR" >> "$COMPARISON_REPORT"
echo "" >> "$COMPARISON_REPORT"

# Compare config.txt files
echo "=== CONFIG.TXT COMPARISON ===" >> "$COMPARISON_REPORT"
if [ -f "$ANALYSIS_DIR/config.txt.before" ] && [ -f "$ANALYSIS_DIR/config.txt.after" ]; then
    echo "Changes in /boot/firmware/config.txt:" >> "$COMPARISON_REPORT"
    diff "$ANALYSIS_DIR/config.txt.before" "$ANALYSIS_DIR/config.txt.after" >> "$COMPARISON_REPORT" 2>&1
    echo "" >> "$COMPARISON_REPORT"
else
    echo "Config.txt files not found for comparison" >> "$COMPARISON_REPORT"
    echo "" >> "$COMPARISON_REPORT"
fi

# Compare cmdline.txt files
echo "=== CMDLINE.TXT COMPARISON ===" >> "$COMPARISON_REPORT"
if [ -f "$ANALYSIS_DIR/cmdline.txt.before" ] && [ -f "$ANALYSIS_DIR/cmdline.txt.after" ]; then
    echo "Changes in /boot/firmware/cmdline.txt:" >> "$COMPARISON_REPORT"
    diff "$ANALYSIS_DIR/cmdline.txt.before" "$ANALYSIS_DIR/cmdline.txt.after" >> "$COMPARISON_REPORT" 2>&1
    echo "" >> "$COMPARISON_REPORT"
else
    echo "Cmdline.txt files not found for comparison" >> "$COMPARISON_REPORT"
    echo "" >> "$COMPARISON_REPORT"
fi

# Compare X11 libinput config
echo "=== X11 LIBINPUT CONFIG COMPARISON ===" >> "$COMPARISON_REPORT"
if [ -f "$ANALYSIS_DIR/40-libinput.conf.before" ] && [ -f "$ANALYSIS_DIR/40-libinput.conf.after" ]; then
    echo "Changes in /usr/share/X11/xorg.conf.d/40-libinput.conf:" >> "$COMPARISON_REPORT"
    diff "$ANALYSIS_DIR/40-libinput.conf.before" "$ANALYSIS_DIR/40-libinput.conf.after" >> "$COMPARISON_REPORT" 2>&1
    echo "" >> "$COMPARISON_REPORT"
else
    echo "X11 libinput config files not found for comparison" >> "$COMPARISON_REPORT"
    echo "" >> "$COMPARISON_REPORT"
fi

# Summary of what changed
echo "=== SUMMARY OF CHANGES ===" >> "$COMPARISON_REPORT"
echo "Files that were modified:" >> "$COMPARISON_REPORT"

for file in config.txt cmdline.txt 40-libinput.conf; do
    if [ -f "$ANALYSIS_DIR/${file}.before" ] && [ -f "$ANALYSIS_DIR/${file}.after" ]; then
        if ! diff -q "$ANALYSIS_DIR/${file}.before" "$ANALYSIS_DIR/${file}.after" > /dev/null; then
            echo "✅ $file - MODIFIED" >> "$COMPARISON_REPORT"
        else
            echo "⏭️  $file - NO CHANGES" >> "$COMPARISON_REPORT"
        fi
    else
        echo "❌ $file - NOT FOUND" >> "$COMPARISON_REPORT"
    fi
done

echo ""
echo "=== Analysis Complete ==="
echo ""
echo "📁 All files saved to: $ANALYSIS_DIR"
echo "📋 Comparison report: $COMPARISON_REPORT"
echo ""
echo "🔍 To view the comparison report:"
echo "   cat $COMPARISON_REPORT"
echo ""
echo "🔍 To view specific file differences:"
echo "   diff $ANALYSIS_DIR/config.txt.before $ANALYSIS_DIR/config.txt.after"
echo "   diff $ANALYSIS_DIR/cmdline.txt.before $ANALYSIS_DIR/cmdline.txt.after"
echo ""
echo "💡 Now you can see exactly what changes made the display rotation work!"
echo "   Share the comparison report with me to create an automated script."
echo ""

# Create a marker file to indicate this is the "after" analysis
echo "AFTER_ANALYSIS" > "$ANALYSIS_DIR/analysis_type"
echo "Timestamp: $(date)" >> "$ANALYSIS_DIR/analysis_type"

echo "✅ After analysis complete! Check the comparison report."
