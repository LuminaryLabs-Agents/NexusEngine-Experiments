# Next Ledge Conversion Plan

## Goal

Convert the uploaded single-file **Next Ledge — Playable Cinematic Engine** into a NexusRealtime-shaped playable experiment with most reusable behavior offloaded into `NexusRealtime-ProtoKits/protokits/next-ledge-kit/`.

## Source Diagnosis

The source prototype mixed these concerns in one HTML document:

```txt
HTML shell
HUD styling
Three.js renderer
input listeners
mobile controls
Web Audio synth
procedural ledge generation
stamina rules
swing physics
grapple launch / retract / latch
reeling and lock-on
fall/death/win rules
sector progression
camera follow
trajectory prediction
rope rendering state
spark/trail effects
```

The conversion separates these by NexusRealtime responsibility.

## Final Architecture

```txt
NexusRealtime Runtime
  createRealtimeGame, ticks, resources, events, systems

NexusRealtime ProtoKit
  protokits/next-ledge-kit/cinematic-ascent-kit.js
    procedural route generation
    climb/grapple FSM
    swing, falling, launched, retracting, reeling, dead, won modes
    stamina and restore units
    sector progression
    deterministic wind/camera/trajectory/rope descriptors
    public engine.nextLedge API

Experiment Host
  experiments/next-ledge/index.html
  experiments/next-ledge/src/*.js
    semantic HTML
    input adapter
    Three.js renderer
    tiny HUD
    Web Audio synth
    runtime loop
    debug host
```

## ProtoKit Boundary

Moved into `next-ledge-kit`:

```txt
route generation
sector summit height
ledge/rest/summit metadata
stamina max/drain/restore
wind scaling by sector
state machine transitions
release / fire / retract / reel / swing lock
probe and player physics
cable sweep collision checks
wall bounce/fail rules
summit completion
camera follow state
trajectory prediction
rope node descriptors
enabled target ids
recent gameplay event log
public engine.nextLedge API
```

Kept in the Experiment host:

```txt
DOM nodes
CSS
Three.js scene/mesh/material construction
pointer and keyboard listeners
mobile pad buttons
screen-to-world projection
AudioContext and tones
requestAnimationFrame
small HUD binding
error panel
window.GameHost debug surface
```

## File Set

### ProtoKit repo

```txt
protokits/next-ledge-kit/cinematic-ascent-kit.js
protokits/next-ledge-kit/CINEMATIC_ASCENT.md
```

### Experiments repo

```txt
experiments/next-ledge/index.html
experiments/next-ledge/README.md
experiments/next-ledge/PLAN.md
experiments/next-ledge/src/main.js
experiments/next-ledge/src/session.js
experiments/next-ledge/src/input.js
experiments/next-ledge/src/runtime-loop.js
experiments/next-ledge/src/renderer-three.js
experiments/next-ledge/src/hud.js
experiments/next-ledge/src/synth.js
```

## Public API Contract

```js
engine.nextLedge.action();
engine.nextLedge.choose(targetId);
engine.nextLedge.setAimVector(dx, dy);
engine.nextLedge.setAimWorld(x, y);
engine.nextLedge.swingAxis(axis);
engine.nextLedge.hover(targetId);
engine.nextLedge.restart();
engine.nextLedge.advanceSector();
engine.nextLedge.pause(paused);
engine.nextLedge.getState();
engine.nextLedge.getSnapshot();
engine.nextLedge.getEnabledTargets();
```

## Runtime State Contract

The renderer reads only `engine.nextLedge.getSnapshot()`.

Snapshot includes:

```txt
sector, mode, status
stamina, maxHeight
route.ledges, route.chunks
player, probe
rope.nodes
trajectory
reach circle
camera
enabledTargetIds
recentEvents
stats
```

## Input Plan

Input does not mutate gameplay state directly.

```txt
pointer move -> renderer.screenToWorld -> engine.nextLedge.setAimWorld
click/tap/space -> engine.nextLedge.action
A/D or arrows -> engine.nextLedge.swingAxis
R -> engine.nextLedge.restart
N -> engine.nextLedge.advanceSector
```

The kit decides whether each command is valid for the current mode.

## Sequence Plan

The current conversion exposes sequence-friendly events but does not yet install a full authored sequence runtime layer.

Available event hooks:

```txt
nextLedge.grappleFired
nextLedge.grappleLatched
nextLedge.restored
nextLedge.failed
nextLedge.summitReached
nextLedge.sectorAdvanced
```

Next pass should add authored sequences for:

```txt
first release tutorial
first grapple-fire tutorial
first latch success prompt
first stamina low warning
first restore unit hint
first fall recovery
summit completion
sector transition
```

## Test Plan

Headless tests should cover:

```txt
initial state starts swinging from base anchor
swingAxis is ignored outside swinging mode
action releases from swinging into falling
action fires grapple while falling
probe latches reachable anchors
rest nodes restore stamina
summit sets mode won/completed
fall below camera sets mode dead
restart preserves sector unless requested
advanceSector regenerates route deterministically by seed/sector
same seed + input stream produces same state digest
```

## Promotion Plan

Do not promote `createNextLedgeKit` under the branded name. After validation, split into generic stable kits:

```txt
createProceduralLedgeRouteKit
createMomentumSwingKit
createGrappleTraversalKit
createStaminaKit
createVerticalSectorProgressionKit
createClimbRecoveryFailStateKit
createClimbCameraStateKit
```

## Gate Result

```txt
G4 Layer Gate: PASS
  Runtime is generic; kit owns gameplay; renderer is host-only.

G7 ProtoKit Scope Gate: PASS WITH WATCH
  Prototype API is kit-shaped, but should be split before promotion.

G10 Host Gate: PASS
  Host renders state only and exposes errors/debug host.

G11 Input Gate: PASS
  Input calls public kit APIs and is mode-validated inside the kit.

G18 Renderer Gate: PASS WITH WATCH
  Renderer builds visual scaffolding/meshes but does not decide gameplay.
```
