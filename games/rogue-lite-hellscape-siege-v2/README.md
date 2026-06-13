# Rogue-Lite Hellscape Siege V2

V2 keeps V1 intact and adds a separate kit-shaped experiment folder.

## Play

```txt
/games/rogue-lite-hellscape-siege-v2/
```

## V2 goals

```txt
Better input routing
Reusable inventory behavior
Reusable realm/portal behavior
Reusable harvesting and pickup behavior
Reusable build blueprint behavior
Reusable wave/core defense behavior
Renderer reads state only
GameHost exposes inspectable state
```

## Controls

```txt
WASD / Arrow Keys: move
E: interact with portals, base beacon, or core
Hold Space: harvest or strike current target
B: toggle build mode in lobby
Q / R: cycle build blueprint
F / Enter: place selected blueprint
I / Tab: inventory
```

## Local ProtoKit-shaped files

```txt
src/protokits/runtime.js
src/protokits/hellscape-kits.js
src/renderer/canvas-renderer.js
src/main.js
```

These are local experiment ProtoKits first. The next step is to promote the generic parts into NexusRealtime-ProtoKits:

```txt
generic-inventory-kit
generic-realm-graph-kit
generic-harvestable-resource-kit
generic-pickup-magnet-kit
generic-build-blueprint-kit
generic-wave-director-kit
generic-structure-defense-kit
```
