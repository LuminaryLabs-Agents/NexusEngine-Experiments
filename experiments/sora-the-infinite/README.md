# Sora The Infinite

A NexusRealtime experiment that validates the generic aerial flight ProtoKit stack through a branded open-world bird-gliding demo.

## What this experiment proves

- `NexusRealtime.createRealtimeGame()` can compose the aerial ProtoKits into a playable browser slice.
- The renderer host owns only platform concerns: Three.js setup, keyboard input, HUD, audio adapter, and `requestAnimationFrame`.
- The reusable gameplay remains in `NexusRealtime-ProtoKits/protokits/aerial-flight-kits/`.
- The host reads `engine.genericAerialRenderDescriptor.getState()` and renders the resulting state.

## Run

Open `index.html` in a browser, or serve the repository with any static file server.

```bash
python -m http.server 8080
```

Then visit:

```txt
http://localhost:8080/experiments/sora-the-infinite/
```

## Controls

```txt
W / ArrowUp      pitch up
S / ArrowDown    pitch down
A / ArrowLeft    bank left
D / ArrowRight   bank right
Space            boost
`                debug state in console
```

## Debug

The host exposes:

```js
window.GameHost.engine
window.GameHost.getState()
window.GameHost.getRawState()
```

## Architecture

```txt
NexusRealtime runtime
  deterministic tick, resources, events, scheduler phases

Generic aerial ProtoKits
  flight input, body, glide physics, boost, terrain, world patches,
  checkpoint volumes, lift volumes, flock agents, challenge, camera,
  VFX, audio, and render descriptors

Sora The Infinite host
  Three.js rendering, keyboard input adapter, HUD, error panel, debug host
```

The game-specific name and tuning live in this experiment. The reusable mechanics remain generic.
