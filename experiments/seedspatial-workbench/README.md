# SeedSpatial Workbench

Hands-only PICO/WebXR spatial authoring demo built from the NexusRealtime hand-authoring DSK stack.

## What this is

This is a headset-facing WebXR experiment, not a native APK yet.

It composes NexusRealtime runtime with the v2 ProtoKit DSKs:

- `webxr-hand-adapter-dsk`
- `openxr-hand-adapter-dsk`
- `hand-gesture-dsk`
- `spatial-scene-graph-dsk`
- `selection-dsk`
- `transform-dsk`
- `widget-dsk`
- `interaction-dsk`
- `persistence-dsk`

## UX loop

```txt
show hands
point at panel
pinch to select
pinch-hold and move hand to drag
two-hand pinch apart/together to resize
pinch + Note / Timer buttons to create widgets
pinch Save to capture a persistence snapshot
```

## Architecture rule

The renderer does not own authoring state.

```txt
WebXR hand tracking
→ webxr-hand-adapter-dsk
→ hand-gesture-dsk
→ selection / transform / widget / interaction / persistence DSKs
→ spatial-scene-graph-dsk patches
→ renderer draws state
```

Raw XR runtime objects stay in the host/adapter boundary. DSK resources only store plain serializable state.

## Run locally

Serve the repository root with a static server and open:

```txt
/experiments/seedspatial-workbench/
```

For headset WebXR, use HTTPS or GitHub Pages.

## PICO TCP launch

From a machine with Android Platform Tools installed:

```bash
cd experiments/seedspatial-workbench
chmod +x pico-tcp-deploy.sh
./pico-tcp-deploy.sh https://luminarylabs-agents.github.io/NexusRealtime-Experiments/experiments/seedspatial-workbench/
```

The script:

```txt
finds an authorized USB device
reads the headset Wi-Fi IP
switches adb to tcpip 5555
connects over TCP
launches the hosted WebXR URL
```

## Current limitations

- Requires browser WebXR hand-tracking support on the target headset.
- This is not yet a native OpenXR APK.
- Voice, publishing, AI patch proposals, and persistent spatial anchors are intentionally deferred.
- If PICO browser hand tracking is unavailable, the next milestone is a native OpenXR shell using the same DSK stack.
