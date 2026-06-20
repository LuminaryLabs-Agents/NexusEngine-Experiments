# Spatial Authoring Native OpenXR APK

Generic native Android/OpenXR shell for headset validation.

This replaces the earlier SeedSpatial-specific naming with a reusable Spatial Authoring target.

## Current milestone

This is now beyond a bare OpenXR color-clear shell.

It includes a lightweight native DSK bridge that owns:

```txt
plain spatial object state
scene graph-like object list
selection state
transform-style scale/move methods
widget creation method
snapshot counter
native render descriptors
```

The OpenXR renderer reads that bridge state and draws panel-like colored objects into the stereo swapchains.

## Included

- Android Gradle project
- NativeActivity manifest
- OpenXR loader + OpenGL ES CMake build
- OpenXR Android loader init
- OpenXR instance, system, session, local reference space
- stereo swapchains
- frame wait/begin/end loop
- native DSK bridge state
- bridge-state OpenGL ES overlay rendering
- staged `spatial-authoring-runtime-contract.json`
- build script
- PICO ADB-over-TCP install script
- GitHub Actions APK build workflow

## Deferred

- native hand-joint gesture routing into the bridge
- full world-space panel mesh rendering
- embedded JavaScript engine for NexusRealtime JS execution
- native persistence backend
- release signing

## Build locally

Install Android Studio or Android SDK command-line tools, including:

```txt
Android SDK Platform 35
Android Build Tools 35.0.0
Android NDK 27.2.12479018
CMake 3.22.1+
Gradle 8.10.2+
```

Then:

```bash
cd native/spatial-authoring-openxr-apk
chmod +x build-openxr-apk.sh
./build-openxr-apk.sh
```

Output:

```txt
native/spatial-authoring-openxr-apk/app/build/outputs/apk/debug/app-debug.apk
```

## Build with GitHub Actions

Run:

```txt
Build Spatial Authoring OpenXR APK
```

Artifact:

```txt
spatial-authoring-openxr-debug-apk
```

## Push/install to PICO over TCP after USB identification

1. Enable Developer Mode / USB debugging on the headset.
2. Connect the headset by USB.
3. Accept the RSA debugging prompt inside the headset.
4. Make sure headset and workstation are on the same Wi-Fi network.
5. Build the APK.
6. Run:

```bash
cd native/spatial-authoring-openxr-apk
chmod +x push-openxr-pico-tcp.sh
./push-openxr-pico-tcp.sh
```

The script does this:

```txt
adb devices
adb shell ip route
adb tcpip 5555
adb connect <device-ip>:5555
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell monkey -p dev.luminarylabs.spatialauthoring.openxr -c android.intent.category.LAUNCHER 1
```

## Debug logs

```bash
adb devices
adb -s <device-ip>:5555 logcat | grep SpatialAuthoringOpenXR
```

## Next milestone

Route native OpenXR hand joints into the native bridge:

```txt
XR_EXT_hand_tracking
→ openxr-hand-adapter-dsk equivalent
→ hand gesture classifier
→ selection / transform / widget / interaction bridge commands
→ OpenXR-rendered spatial object state
```
