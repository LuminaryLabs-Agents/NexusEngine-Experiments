# The Cavalry of Rome

A NexusRealtime visual experiment for a Roman campaign-map cinematic route.

This slice intentionally drops campaign/combat business logic. It is a **DSK-composed visual proof**: a WebGPU-first 3D terrain scene with highlighted regions, a scanning camera, a cinematic dive, and a low-poly battlefield tableau where two armies prepare for war.

## Current slice

- WebGPU-first terrain renderer with Canvas fallback.
- Large highlighted land regions instead of point nodes.
- Pointer hover selects visual affordance regions.
- Clicking a region triggers a cinematic world-map-to-battlefield zoom.
- Battlefield reveal shows low-poly soldier formations, banners, and field atmosphere.
- Existing DSKs provide route progress, input, affordance descriptors, zone fields, camera descriptors, visual fidelity proof, scenario QA, and GameHost contract state.

## Existing DSKs used

```txt
gamehost-standard-kit
action-input-kit
generic-affordance-descriptor-kit
generic-route-progress-kit
zone-field-kit
camera-cinematic-maker-kit
visual-fidelity-maker-kit
scenario-qa-harness
```

The renderer remains presentation-only. DSKs own descriptors, proof state, route phase, region affordances, and validation surfaces; the local route owns Roman art direction and WebGPU scene composition.

## Controls

```txt
Move pointer over a highlighted terrain region
Click a region to start the cinematic dive
R resets to the world-map scan
```

## Design boundary

This route should stay clear of board-game-specific expression. Do not import or mirror card systems, hex counts, dice faces, named scenarios, board layouts, copied rules text, or unit-stat tables from any existing tabletop game.

The near-term target is cinematic visual quality, not strategy rules. Keep combat, troop stats, economy, movement graphs, and encounter resolution out until the visual route has a stable DSK-backed boundary.

## Custom logic that could become reusable later

```txt
campaign-terrain-visual-kit
terrain-region-highlight-kit
map-to-scene-camera-transition-kit
low-poly-formation-tableau-kit
webgpu-visual-scene-adapter-kit
battlefield-atmosphere-descriptor-kit
```

## Next ledge

Add a small route smoke that asserts the live app endpoint references the Cavalry module, the route imports the DSK stack above, and `GameHost.getSnapshot()` exposes DSK-backed visual state after browser boot.
