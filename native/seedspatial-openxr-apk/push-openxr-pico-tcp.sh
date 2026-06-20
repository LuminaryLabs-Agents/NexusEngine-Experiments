#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APK="${1:-${ROOT_DIR}/app/build/outputs/apk/debug/app-debug.apk}"
ADB_BIN="${ADB_BIN:-adb}"
PORT="${PORT:-5555}"
PACKAGE="dev.luminarylabs.seedspatial.openxr"
ACTIVITY="android.app.NativeActivity"

if [[ ! -f "${APK}" ]]; then
  echo "APK not found: ${APK}"
  echo "Run ./build-openxr-apk.sh first."
  exit 1
fi

echo "[SeedSpatial OpenXR] Starting adb server..."
"${ADB_BIN}" start-server >/dev/null

echo "[SeedSpatial OpenXR] Looking for authorized USB headset..."
USB_DEVICE=$("${ADB_BIN}" devices | awk 'NR > 1 && $2 == "device" && $1 !~ /:/ { print $1; exit }')
if [[ -z "${USB_DEVICE}" ]]; then
  echo "No authorized USB device found. Enable USB debugging and accept the RSA prompt in the headset."
  exit 1
fi

echo "[SeedSpatial OpenXR] USB device: ${USB_DEVICE}"
DEVICE_IP=$("${ADB_BIN}" -s "${USB_DEVICE}" shell ip route 2>/dev/null | awk '/wlan|scope/ { for (i=1;i<=NF;i++) if ($i=="src") { print $(i+1); exit } }')
if [[ -z "${DEVICE_IP}" ]]; then
  DEVICE_IP=$("${ADB_BIN}" -s "${USB_DEVICE}" shell ip addr show wlan0 2>/dev/null | awk '/inet / { split($2,a,"/"); print a[1]; exit }')
fi
if [[ -z "${DEVICE_IP}" ]]; then
  echo "Could not detect headset Wi-Fi IP. Confirm headset and workstation are on the same network."
  exit 1
fi

echo "[SeedSpatial OpenXR] Headset IP: ${DEVICE_IP}"
echo "[SeedSpatial OpenXR] Enabling adb over TCP:${PORT}..."
"${ADB_BIN}" -s "${USB_DEVICE}" tcpip "${PORT}" >/dev/null
sleep 2

echo "[SeedSpatial OpenXR] Connecting over TCP..."
"${ADB_BIN}" connect "${DEVICE_IP}:${PORT}"
TCP_DEVICE="${DEVICE_IP}:${PORT}"

echo "[SeedSpatial OpenXR] Installing APK over TCP..."
"${ADB_BIN}" -s "${TCP_DEVICE}" install -r "${APK}"

echo "[SeedSpatial OpenXR] Launching native OpenXR activity..."
"${ADB_BIN}" -s "${TCP_DEVICE}" shell monkey -p "${PACKAGE}" -c android.intent.category.LAUNCHER 1

echo "[SeedSpatial OpenXR] Done. Stream logs with: ${ADB_BIN} -s ${TCP_DEVICE} logcat | grep SeedSpatialOpenXR"
