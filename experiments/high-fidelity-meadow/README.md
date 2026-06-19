# High Fidelity Meadow

A WebGL-only NexusRealtime experiment built from procedural rendering stack ProtoKits.

- No preloaded textures, meshes, models, or sprites.
- Terrain, grass, cottage, sheep, wool shells, particles, fog, and shader descriptors are generated from kits.
- The golden-hour target pass consumes `createMeadowVisualTargetKit()` from `NexusRealtime-ProtoKits` for renderer-agnostic path, player-silhouette, camera-framing, and tree-line descriptors.
- The HTML host owns Three/WebGL compilation and presentation only.
- The reusable target-composition proof lives in `NexusRealtime-ProtoKits/protokits/high-fidelity-meadow-kits/index.js`; older CDN-pinned rendering stack imports still provide the current WebGL meadow descriptors.

Controls:

- Drag: orbit camera
- Wheel: dolly camera
- Space: change cinematic camera beat
- R: regenerate wind-phase timing
