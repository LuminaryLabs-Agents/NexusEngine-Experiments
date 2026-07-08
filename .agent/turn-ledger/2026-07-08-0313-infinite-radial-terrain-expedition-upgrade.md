# Infinite Radial Terrain expedition readability upgrade

Timestamp: 2026-07-08 03:13 America/New_York

## Chosen experiment

`experiments/infinite-radial-terrain/`

## Why it was chosen

The latest upgraded experiment was `experiments/vr-platformer-board/`, so this pass avoided it. `infinite-radial-terrain` still had one of the weakest gameplay loops because it was mostly open-ended camera flight over good terrain descriptors. The missing value was expedition readability: the player could fly, but had no explicit survey transects, altitude corridor, pass beacon, hazard basin, sample bookmark, or route task intent exposed as atomic renderer-neutral descriptors.

## Last upgraded experiment

`experiments/vr-platformer-board/` from the latest visible ledger and commit sequence.

## Experiment inventory

| Experiment | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller/camera diagnostic arena. | Short diagnostic loop. | WASD, spring arm camera, debug metrics. | No direct old CDN found in changed audit. | Yes, through arena-fractal wrapper. |
| `experiments/peer-scene-transition/` | HTML scene puzzle/transition route. | Short scene chain. | Scene gates, clues, inventory, chronicle/consequence descriptors. | No direct old CDN in changed runtime. | Yes. |
| `apps/the-cavalry-of-rome/` | Campaign command map experiment. | Medium campaign slice. | World actions, march/supply/cohesion/morale descriptors. | Legacy compatibility surface still noted outside active handoff. | Yes, in campaign-fractal handoff. |
| `experiments/vr-platformer-board/` | Flat Canvas XR-board platformer route. | Short arcade route. | A/D movement, Space jump, R reset, drag-head offset, coins, hazards, exit, traversal descriptors. | Old ProtoKits CDN import removed from changed route; no old NexusRealtime runtime CDN. | Yes. |
| `experiments/next-ledge/` | Cinematic grapple-climb route. | Short ascent. | Grapple, swing, route progress, cargo/pressure descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/infinite-radial-terrain/` | Infinite/radial terrain visualization route upgraded into survey flight. | Open-ended exploration. | Camera flight, radial terrain rings, biome/hydrology descriptors, survey transects, altitude corridors, hazard basins, ridge pass beacons, route task bands. | No old runtime CDN in changed audit. | Yes. |
| `experiments/high-fidelity-meadow/` | Meadow scene/visual fidelity route. | Ambient exploration. | Grass, flowers, sheep, depth/pattern descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/fogline-relay/` | First-person fog-forest relay route. | Short objective route. | Move, look, scan relays, avoid wraiths, open gate. | No old runtime CDN in changed audit. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer kit showcase. | Medium objective sandbox. | Harvest, build mast, pressure wave, resource/objective descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/sora-the-infinite/` | Authored compatibility gateway into The Open Above. | Short launch handoff. | Alias preservation, launch vector, route preview, wind/altitude/waypoint handoff descriptors. | No old runtime CDN in changed runtime. | Yes. |
| `experiments/zombie-orchard/` | Survival orchard route. | Short wave survival. | Move, collect apples, scavenge gear, fight monsters, survive/advance rounds. | No old runtime CDN in changed audit. | Yes. |
| `experiments/tropical-island-scene/` | WebGL tropical island/lagoons route. | Ambient scene. | Orbit camera, water/reef/current/wake descriptors. | Old local import-map compatibility preserved for island/water stack. | Yes. |
| `games/signal-bastion/` | Strategic tower-defense route. | 30-wave defense loop. | Build towers, enemies, economy, command/readability descriptors. | No old runtime CDN in changed audit. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Action-defense/extraction route. | Short-to-medium wave survival. | Realm portals, harvesting, inventory, build, core defense. | No direct old CDN found in changed audit. | Yes. |

## Domain ASCII tree

```txt
terrain-expedition-readability-domain
├─ survey-planning
│  ├─ transect-domain
│  │  └─ terrain-survey-transect-kit
│  └─ sample-bookmark-domain
│     └─ terrain-sample-bookmark-kit
├─ flight-safety
│  ├─ altitude-corridor-domain
│  │  └─ terrain-altitude-corridor-kit
│  └─ hazard-basin-domain
│     └─ terrain-hazard-basin-kit
├─ route-intent
│  ├─ ridge-pass-domain
│  │  └─ terrain-ridge-pass-beacon-kit
│  └─ task-band-domain
│     └─ terrain-route-task-band-kit
└─ renderer-handoff
   └─ terrain-expedition-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added in `experiments/_kits/infinite-radial-terrain/terrain-expedition-readability-kits.js`:

- `TERRAIN_EXPEDITION_READABILITY_DOMAIN_TREE`
- `terrain-survey-transect-kit`
- `terrain-altitude-corridor-kit`
- `terrain-ridge-pass-beacon-kit`
- `terrain-hazard-basin-kit`
- `terrain-sample-bookmark-kit`
- `terrain-route-task-band-kit`
- `terrain-expedition-renderer-handoff-kit`
- `terrain-expedition-readability-domain-kit`

Changed:

- `experiments/infinite-radial-terrain/infinite-radial-terrain.js` now imports the expedition readability domain kit.
- The renderer now consumes descriptor buckets for survey transects, altitude corridors, ridge pass beacons, hazard basins, sample bookmarks, and route task bands.
- `GameHost` now exposes `getExpeditionReadability()` and `getRendererHandoff()`.
- `experiments/infinite-radial-terrain/index.html` now cache-busts the expedition route module and advertises expedition descriptors in the HUD.
- `experiments/domain-kit-cutover-manifest.json` now records the expedition readability pass.

## Files changed

- `experiments/_kits/infinite-radial-terrain/terrain-expedition-readability-kits.js`
- `experiments/infinite-radial-terrain/infinite-radial-terrain.js`
- `experiments/infinite-radial-terrain/index.html`
- `tests/infinite-radial-terrain-expedition-readability-kits-smoke.mjs`
- `tests/infinite-radial-terrain-expedition-cdn-state-input-smoke.mjs`
- `tests/infinite-radial-terrain-playwright-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0313-infinite-radial-terrain-expedition-upgrade.md`

## Tests added

- `tests/infinite-radial-terrain-expedition-readability-kits-smoke.mjs`
  - 10 intake cases.
  - Checks survey transects, altitude corridors, ridge pass beacons, hazard basins, sample bookmarks, route task bands, renderer handoff, and composite domain output.
  - Checks serializable descriptor output and renderer-neutral ownership boundaries.

- `tests/infinite-radial-terrain-expedition-cdn-state-input-smoke.mjs`
  - 10 state/input cases.
  - Validates NexusEngine main CDN usage, old NexusRealtime runtime CDN absence, route cache busting, `GameHost.getExpeditionReadability()`, `GameHost.getRendererHandoff()`, and descriptor ownership boundaries.

Changed:

- `tests/infinite-radial-terrain-playwright-state-input-smoke.mjs` now also checks expedition readability import, state shape, GameHost methods, and handoff buckets.

## Validation results

Static connector validation completed by refetching the changed route, route shell, new kit file, new tests, updated existing state smoke, manifest, and check wiring after writing them.

Runtime shell validation was not executed in this connector-only run. The wired commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/infinite-radial-terrain/infinite-radial-terrain.js` imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- The changed route does not import `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js`.
- The new expedition readability kits do not import NexusRealtime, NexusEngine, DOM, browser input, renderer code, Three.js, WebGL, audio, assets, or frame-loop code.

## Cleanup pass

- Kept reusable expedition logic in pure descriptor kits.
- Kept browser input, Three.js rendering, WebGL ownership, and frame-loop timing in the route host.
- Preserved existing terrain generation, erosion sampling, hydrology, biome, geology, LOD ring, and sky haze behavior.
- No route was deleted, renamed, or destructively removed.

## Non-game route handling

`infinite-radial-terrain` is an open-ended terrain visualization rather than a small objective game. The proof it was trying to provide is camera-relative radial terrain tessellation with earth-system descriptors. The lesson from this pass is that even terrain tech demos need playable intent: survey lines, flight corridors, hazards, samples, and route tasks make the scene legible without turning renderer overlays into simulation truth.

## Next safe ledge

Add a deterministic expedition replay fixture for `infinite-radial-terrain` that runs launch → climb corridor → survey ridge → cross wet basin → bookmark sample → follow route task band while snapshot-hashing visual and expedition renderer-handoff counts without browser timing.
