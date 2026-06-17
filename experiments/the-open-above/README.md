# The Open Above

A NexusRealtime experiment that composes generic ProtoKit DSKs into a high-fidelity bird simulator over streamed terrain.

## What this experiment proves

- `NexusRealtime.createRealtimeGame()` can compose generic flight, terrain, patch, scatter, actor, lighting, and render descriptor kits into a playable browser slice.
- The Open Above app owns app-specific data in `open-above.config.js`; ProtoKits stay generic.
- The renderer host owns Three.js rendering, keyboard input, HUD, `requestAnimationFrame`, and the `window.GameHost` debug/control surface.
- The Open Above intentionally does not use wind/updraft gameplay, checkpoint rings, ring challenges, or terrain ring objectives.

## Run

Open `index.html` in a browser, or serve the repository with any static file server.

```bash
python -m http.server 8080
```

Then visit:

```txt
http://localhost:8080/experiments/the-open-above/
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
window.GameHost.getValidationState()
window.GameHost.setInput({ pitchUp: true })
window.GameHost.tick(1 / 60)
window.GameHost.render()
```

## Architecture

```txt
NexusRealtime runtime
  deterministic tick, resources, events, scheduler phases

Generic aerial ProtoKits
  flight motion, terrain sampling, world patches, scatter placement,
  actor render descriptors, flock agents, sky, lighting, materials,
  and instanced render descriptors

The Open Above host
  app config, Three.js rendering, keyboard input adapter, HUD,
  high-resolution terrain mesh generation, error panel, debug host
```

The game-specific name and tuning live in this experiment. The reusable mechanics remain generic.
