# The Cavalry of Rome

A NexusRealtime visual experiment for a Roman campaign-map cinematic route.

This slice intentionally drops campaign/combat business logic. It is a **DSK-composed high-fidelity visual proof**: a WebGPU-first painterly 3D terrain scene with large pannable highlighted regions, a cinematic dive, and a primitive-built battlefield tableau where two armies prepare for war.

## Current slice

- WebGPU-first terrain renderer with Canvas fallback.
- Larger campaign terrain surface with pannable region selection.
- Painterly terrain layers: warm glaze colors, brush-stroke overlays, river ribbons, and contour accents.
- Large highlighted land regions instead of point nodes.
- Pointer hover selects visual affordance regions.
- Drag/WASD pans the main region-selection map; wheel zooms the map.
- Clicking a region triggers a cinematic world-map-to-battlefield zoom.
- Battlefield reveal shows fuller primitive-built soldiers: legs, boots, torso, cuirass, arms, head, helmet, crest, shield, spear, capes, banners, and shadows.
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
Drag empty terrain to pan the map
WASD / arrow keys pan the map
Mouse wheel zooms the map
R resets to the world-map scan
```

## Fidelity focus

The current fidelity push is visual, not systemic:

```txt
painted campaign terrain
large readable regions
pannable terrain inspection
primitive full-bodied soldiers
atmospheric battlefield reveal
```

No combat, troop stats, campaign economy, AI, or encounter resolution should be added until the visual proof is stable.

## Design boundary

This route should stay clear of board-game-specific expression. Do not import or mirror card systems, hex counts, dice faces, named scenarios, board layouts, copied rules text, or unit-stat tables from any existing tabletop game.

The near-term target is cinematic visual quality, not strategy rules. Keep combat, troop stats, economy, movement graphs, and encounter resolution out until the visual route has a stable DSK-backed boundary.

## Custom logic that could become reusable later

```txt
campaign-terrain-visual-kit
painterly-terrain-material-kit
terrain-region-highlight-kit
pannable-campaign-camera-kit
map-to-scene-camera-transition-kit
low-poly-formation-tableau-kit
primitive-soldier-construction-kit
webgpu-visual-scene-adapter-kit
battlefield-atmosphere-descriptor-kit
```

## Next ledge

Add a browser-backed route smoke that opens the live endpoint, pans the map, selects a large region, waits for the battlefield tableau, and verifies `GameHost.getSnapshot()` exposes painterly terrain, panning, DSK state, and full-body primitive soldier fidelity metadata.
