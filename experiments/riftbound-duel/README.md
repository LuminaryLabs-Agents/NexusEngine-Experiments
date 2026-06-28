# Riftbound Duel

Third-person point-and-click magic duel prototype for NexusRealtime Experiments.

## Current slice

```txt
single-player bot mode
third-person soft target camera
camera-relative WASD movement
mouse aim
left click magic bolts
Shift dash
Q guard
Space parry window
red mountain arena
AI bot duel pressure
victory / defeat / restart
```

## Route

```txt
experiments/riftbound-duel/
```

The old `experiments/domain-arcane-duel/` route was removed so this game can own its own code instead of staying as a shared-composer demo.

## Kit stack

```txt
experiments/_kits/riftbound/riftbound-shared-kits.js
```

The shared file currently exports the experiment-proved kit boundaries for:

```txt
input-intent-kit
camera-relative-movement-kit
quaternion-facing-kit
aim-ray-kit
control-debug-overlay-kit
soft-target-follow-camera-kit
game-state-kit
kit-activation-kit
red-mountain-backdrop-kit
rift-arena-kit
magic-projectile-kit
duel-bot-kit
combat-hud-kit
```

These stay in Experiments first because they touch Three.js, DOM input, Canvas, and browser rendering. Pure math pieces can be promoted later after the control lab proves them.

## Controls

```txt
WASD          move relative to camera
Mouse         aim
Left click    cast magic bolt
Shift         dash
Q             guard
Space         parry window
R             restart
F2            debug vectors
```

## Completion gate

This route is intentionally focused on the full start-to-restart loop:

```txt
move -> aim -> shoot -> hit -> take damage -> win/lose -> restart
```

No multiplayer or two-room PeerJS layer is enabled yet. That should be added only after this local loop is stable.
