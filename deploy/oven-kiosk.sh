#!/bin/bash
/usr/bin/chromium-browser \
  --user-data-dir=/tmp/kiosk-profile \
  --kiosk \
  --incognito \
  --start-fullscreen \
  --noerrdialogs \
  --disable-restore-session-state \
  --ozone-platform-hint=auto \
  http://localhost:3000