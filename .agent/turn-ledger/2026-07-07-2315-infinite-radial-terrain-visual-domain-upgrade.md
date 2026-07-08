# Infinite Radial Terrain Visual Domain Upgrade

Timestamp: 2026-07-07 23:15 America/New_York
Repo: LuminaryLabs-Agents/NexusEngine-Experiments
Branch policy: pushed directly to main; no branch created.

## Goal

Make one meaningful upgrade to a different experiment than the last upgraded route by fractalizing `infinite-radial-terrain` into small renderer-neutral visual/domain descriptor kits, then integrate those descriptors into the route without moving browser, renderer, DOM, Three.js, WebGL, audio, asset loading, or frame-loop ownership into reusable kit logic.

## Files read first

- `.agent/START_HERE.md`
- `.agent/cycle-state.md`
- `.agent/route-canonicalization.md`
- `.agent/turn-ledger/2026-07-07-2301-vr-platformer-board-visual-fractal-upgrade.md`
- `experiments/domain-kit-cutover-manifest.json`
- `experiments/_shared/nexus-gallery-data.js`
- `experiments/infinite-radial-terrain/index.html`
- `experiments/infinite-radial-terrain/infinite-radial-terrain.js`
- `experiments/infinite-radial-terrain/hifi-radial-domain.js`
- `experiments/infinite-radial-terrain/terrain-world-stack.js`
- `scripts/run-checks.mjs`
- `LuminaryLabs-Dev/NexusEngine/src/index.js`

## Chosen experiment

`experiments/infinite-radial-terrain/`

## Why it was chosen

The latest completed upgrade sequence was `vr-platformer-board`, so this turn avoided that experiment.

`infinite-radial-terrain` had strong terrain math but the thinnest play loop among the gallery experiments: mostly WASD/vertical flight, origin snapping, and terrain sampling with no additional objective, pressure, or readable descriptor handoff. It was a good target for visual/procedural variability because terrain samples already contained geology, hydrology, climate, lithology, material, and landform signals, but the renderer mostly consumed them as vertex color only.

## Last upgraded experiment

`experiments/vr-platformer-board/`, based on the latest visible commit sequence and the latest ledger entry:

- `Log VR board visual domain upgrade`
- `.agent/turn-ledger/2026-07-07-2301-vr-platformer-board-visual-fractal-upgrade.md`

## Experiment inventory

| id | description | gameplay length | gameplay mechanics | old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| peer-scene-transition | Story-scene orchestration proof with HTML scene hosts, exits, inventory, and transition ledgers. | Short puzzle chain. | Click actions, scene exits, inventory tokens, puzzle unlocks. | no in current route description | yes |
| vr-platformer-board | Floating XR board platformer validation. | Short micro-platformer board. | A/D move, Space jump, R reset, drag head pose, stereo and comfort state. | migrated by last run | yes |
| infinite-radial-terrain | Camera-driven radial terrain tessellation demo. | Open-ended terrain flight demo. | WASD fly, Space/Shift vertical, arrow look, origin snapping, terrain sampling. | no old runtime CDN in changed route | yes after this run |
| high-fidelity-meadow | Procedural meadow scene composed from terrain, wind, vegetation, creature, fur, sky, VFX, and visual-target domains. | Open-ended scene. | Camera/exploration presentation and procedural environment viewing. | not audited deeply this run | not changed this run |
| fogline-relay | First-person survey loop for scan targets, fog zones, timed pressure, hazard state, and visual buckets. | Short objective loop. | WASD/mouse look, scan, relay objectives, wraith pressure. | previously migrated | yes |
| nexus-frontier-signal-isles | Field-engineer systems showcase. | Medium objective loop. | Scan, harvest, build, pressure wave, gate unlock, cargo/beacon flow. | not audited deeply this run | not changed this run |
| the-cavalry-of-rome | Painterly Roman terrain map visual proof. | Open-ended map experience. | Pan, hover regions, cinematic map dive, army reveal. | not audited deeply this run | not changed this run |
| signal-bastion | 2.5D cel-style tower-defense game. | Full game route. | Tower placement, waves, upgrades, bosses, endless mode. | not changed this run | not changed this run |
| next-ledge | Grapple-climb validation route. | Short sector climb. | Grapple, swing, rest anchors, summit, sector advance. | mixed historical naming; not changed this run | visual wrapper already uses main CDN |
| sora-the-infinite | Open aerial route that redirects into The Open Above. | Open-ended aerial traversal. | Flight, boost, terrain stream, visual domains. | route is redirect | indirect through Open Above |
| zombie-orchard | Survival slice for horde pressure, pickups, weapons, orchard content, and runtime state. | Wave survival loop. | Move, sprint, dodge, collect, gear use, waves. | previously migrated | yes |
| rogue-lite-hellscape-siege | Base route for action defense extraction. | Medium/full game route. | Portals, inventory, harvest, build, wave/core defense, FX. | not changed this run | not changed this run |

## Domain ASCII tree

```txt
infinite-radial-terrain-domain
├─ earth-systems
│  ├─ geology-province
│  │  └─ terrain-geology-province-kit
│  ├─ hydrology
│  │  └─ channel-thread
│  │     └─ terrain-hydrology-thread-kit
│  └─ ecology
│     └─ biome-mosaic
│        └─ terrain-biome-mosaic-kit
├─ navigation-readability
│  ├─ lod-ring-telemetry
│  │  └─ terrain-lod-ring-telemetry-kit
│  └─ travel-forecast
│     └─ terrain-travel-forecast-kit
└─ atmospheric-handoff
   ├─ sky-haze-gradient
   │  └─ terrain-sky-haze-gradient-kit
   └─ renderer-handoff
      └─ terrain-renderer-handoff-kit
         └─ renderer consumes descriptors only
```

## Kits added or changed

Added under `experiments/_kits/infinite-radial-terrain/`:

- `INFINITE_RADIAL_TERRAIN_DOMAIN_TREE`
- `terrain-geology-province-kit`
- `terrain-hydrology-thread-kit`
- `terrain-biome-mosaic-kit`
- `terrain-lod-ring-telemetry-kit`
- `terrain-travel-forecast-kit`
- `terrain-sky-haze-gradient-kit`
- `terrain-renderer-handoff-kit`
- `infinite-radial-terrain-visual-domain-kit`

All new kits accept plain sample/terrain/camera/time intake data and produce serializable descriptors. They do not import renderer APIs or own the frame loop.

## Files changed

- `experiments/_kits/infinite-radial-terrain/infinite-radial-terrain-kits.js`
- `experiments/infinite-radial-terrain/infinite-radial-terrain.js`
- `experiments/infinite-radial-terrain/index.html`
- `tests/infinite-radial-terrain-visual-domain-kits-smoke.mjs`
- `tests/infinite-radial-terrain-playwright-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `.agent/turn-ledger/2026-07-07-2315-infinite-radial-terrain-visual-domain-upgrade.md`

## Integration notes

- The route now attempts to import NexusEngine main through `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js` and records a runtime descriptor in `GameHost.getState()`.
- The route creates `createInfiniteRadialTerrainVisualDomainKit()` and feeds it sampled terrain points around the camera.
- The renderer consumes only descriptor output to draw LOD rings, hydrology threads, biome discs, geology province markers, and atmospheric haze.
- The reusable kit file contains no route frame-loop, input, DOM, Three.js, WebGL, audio, or asset loading ownership.

## Tests added

- `tests/infinite-radial-terrain-visual-domain-kits-smoke.mjs`
  - 10 intake cases.
  - Covers geology province, hydrology thread, biome mosaic, LOD telemetry, travel forecast, sky haze, renderer handoff, and composite visual domain behavior.
  - Checks renderer-neutral descriptor shape and ownership exclusions.

- `tests/infinite-radial-terrain-playwright-state-input-smoke.mjs`
  - 10 state/input intake cases.
  - Checks NexusEngine main CDN import, old NexusRealtime runtime CDN absence, visual-domain creation, sampled descriptor state export, and key/camera intake constraints.

Both tests are wired into `npm run check` and `npm run check:deploy` through `scripts/run-checks.mjs`.

## Validation results

Static validation completed through GitHub file writes plus targeted refetch of the changed files after the writes.

Runtime shell validation was not executed in this connector-only run. The validation commands are wired for:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed runtime file:

- `experiments/infinite-radial-terrain/infinite-radial-terrain.js`
  - Added NexusEngine main CDN import attempt.
  - No old `LuminaryLabs-Dev/NexusRealtime@main/src/index.js` runtime CDN import remains in the changed route.

Unchanged context:

- `terrain-world-stack.js` still references `LuminaryLabs-Agents/NexusRealtime-ProtoKits` for the terrain erosion ProtoKit repository. This is a ProtoKits repository/package naming issue, not an old Core runtime CDN import, and was not changed because this run only touched the selected experiment.

## Cleanup pass

- Kept the new kit logic idempotent and renderer-neutral.
- Kept Three.js geometry/material creation inside the route renderer.
- Kept DOM and keyboard input inside the route host.
- Kept frame timing inside the route host.
- Avoided destructive route pruning.
- Avoided manifest promotion because adding `infinite-radial-terrain` to the canonical manifest would also require coordinated pruning-map lane updates, and the safer change for this turn was route-local hardening plus tests.
- Did not create a branch.
- Did not touch any other repo.

## Next safe ledge

Run `npm run check` and `npm run check:deploy` in a shell runner. If green, add a fixed-tick replay fixture that asserts camera movement, origin snapping, sampled visual-descriptor counts, sky haze changes, and hydrology-thread descriptor stability across deterministic camera paths.

## What not to do next

Do not promote `infinite-radial-terrain` into the canonical manifest until the pruning map, scenario lane, and replay expectations are updated together. Do not move Three.js renderable construction into the new visual domain kits.
