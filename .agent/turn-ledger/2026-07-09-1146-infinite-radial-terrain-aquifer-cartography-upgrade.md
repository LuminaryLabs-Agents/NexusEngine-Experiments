# 2026-07-09 11:46 - Infinite Radial Terrain Aquifer Cartography Upgrade

## Chosen experiment

`experiments/infinite-radial-terrain/`

## Why it was chosen

Infinite Radial Terrain is a small experience-driven web game route, but it is still primarily a camera-relative terrain technology proof. Compared with the tower-defense, survival, flood-rescue, first-person, and action routes, its loop has the least authored objective variability: fly, inspect terrain, and read descriptor overlays. This made it the best safe candidate after the latest Fogline upgrade because a water-finding cartography layer could add concrete route purpose without changing the renderer, terrain engine, browser input, Three.js ownership, or frame loop.

## Last upgraded experiment

Latest completed ledger/commit before this run: `experiments/fogline-relay/` signal courier evacuation (`2c61baf695317021d36064b85853d73f36fa6a7d`, `Log Fogline signal courier upgrade`).

This run intentionally chose `experiments/infinite-radial-terrain/` instead.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | HTML story-scene host with puzzle tokens and bell archive evacuation descriptors. | 3-6 min | Scene navigation, route unlocks, token checks, evacuation descriptors | No old runtime observed in current gallery metadata | Yes, descriptor entries |
| `experiments/vr-platformer-board/` | Board-scale platformer with skyline medevac overlay. | 2-4 min | Left/right movement, jumping, coins, hazards, medevac objectives | No old runtime observed | Yes, skyline medevac entry |
| `experiments/infinite-radial-terrain/` | Camera-relative radial terrain tessellation with expedition, route-planning, shelter, and aquifer cartography overlays. | 4-8 min | WASD flight, origin snapping, terrain LOD, descriptor route planning, water-source cartography | No old runtime observed in changed route shell | Yes, main route and new aquifer entry |
| `experiments/high-fidelity-meadow/` | Procedural meadow with ecology, creek, and soil mycelium descriptors. | 3-6 min | Free camera/scene inspection, procedural vegetation descriptors | No old runtime observed | Yes, restoration entry |
| `experiments/tiny-diffusion-lab/` | Browser tiny diffusion training/sampling workshop with curation overlays. | 5-12 min | Prepare, train, generate, checkpoint, curation | No old runtime observed | Yes, lab entries and Nexus diffusion module |
| `experiments/living-agent-lab/` | Market-agent lab with civic festival mediation descriptors. | 4-7 min | Inspect state, agent/fallback choices, mediation readiness | No old runtime observed | Yes, civic festival entry |
| `experiments/fogline-relay/` | First-person fog survey/rescue loop with signal courier evacuation. | 4-8 min | WASD movement, mouse look, scan, timed pressure, rescue overlays | Old route-shell loader removed in latest Fogline run | Yes, signal courier and readiness entries |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island slice with hospital and desalination readiness. | 5-9 min | Scan, harvest, build, pressure gates, signal descriptors | No old runtime observed | Yes, storm/desalination entries |
| `apps/the-cavalry-of-rome/` | Painterly tactical Roman campaign map with army/logistics overlays. | 3-7 min | Pan map, hover regions, cinematic dives, strategic readiness | No old runtime observed | Yes, campaign readiness entries |
| `games/signal-bastion/` | Tower defense with field hospital and supply convoy descriptors. | 5-10 min | Tower placement, waves, cards, range rings, logistics | No old runtime observed | Yes, supply convoy entry |
| `games/stonewake-depths/` | Flooded cavern rescue game with drainage and archive descriptors. | 5-9 min | Block carry, valves, rune gates, survivor pings, drainage | No old runtime observed | Yes, drainage entries |
| `experiments/next-ledge/` | Grapple-climb validation with rescue/weather/drone relay overlays. | 2-5 min | Grapple, action input, ledges, swing pressure | No old runtime observed | Yes, drone/weather entries |
| `experiments/sora-the-infinite/` | Open aerial traversal route preview into The Open Above. | 2-5 min | Route priming, launch rehearsal, microflight descriptors | No old runtime observed | Yes, visual domain entries |
| `experiments/zombie-orchard/` | Survival slice with horde pressure, pickups, weapons, and rescue readiness. | 4-8 min | Rounds, pickups, weapons, barricade/rescue descriptors | No old runtime observed | Yes, rescue readiness entries |
| `games/rogue-lite-hellscape-siege/` | Harvest/build/wave-defense route with ember well purification. | 6-12 min | Movement, harvesting, building, waves, water recovery | No old runtime observed | Yes, ember well entry |
| `experiments/onnx-agent-lab/` | ONNX/fallback workshop with signal calibration route. | 4-8 min | Model handshake, fallback rail, tool bench, scene-open gate | No old runtime observed | Yes, signal calibration entry |

## Domain ASCII tree

```txt
terrain-aquifer-cartography-readiness-domain
├─ groundwater-source-domain
│  ├─ spring-seep-domain
│  │  └─ terrain-spring-seep-marker-kit
│  └─ moraine-well-domain
│     └─ terrain-moraine-well-probe-kit
├─ flow-mapping-domain
│  ├─ aquifer-thread-domain
│  │  └─ dowsing-line-domain
│  │     └─ terrain-aquifer-thread-line-kit
│  └─ cistern-basin-domain
│     └─ terrain-cistern-basin-catchment-kit
├─ expedition-water-safety-domain
│  ├─ dye-marker-domain
│  │  └─ terrain-dye-marker-beacon-kit
│  └─ water-ledger-domain
│     └─ terrain-dawn-water-ledger-kit
└─ renderer-handoff
   └─ terrain-aquifer-cartography-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `experiments/_kits/infinite-radial-terrain/terrain-aquifer-cartography-readiness-kits.js`:

- `createTerrainSpringSeepMarkerKit()`
- `createTerrainMoraineWellProbeKit()`
- `createTerrainAquiferThreadLineKit()`
- `createTerrainCisternBasinCatchmentKit()`
- `createTerrainDyeMarkerBeaconKit()`
- `createTerrainDawnWaterLedgerKit()`
- `createTerrainAquiferCartographyRendererHandoffKit()`
- `createTerrainAquiferCartographyReadinessDomainKit()`

Added `experiments/infinite-radial-terrain/terrain-aquifer-cartography-readiness-entry.js`:

- Imports NexusEngine main CDN.
- Builds procedural aquifer samples around the camera from current terrain state.
- Installs `GameHost.getAquiferCartographyReadiness()`.
- Installs `GameHost.getInfiniteRadialTerrainAquiferCartographyReadiness()`.
- Installs `GameHost.getAquiferCartographyReadinessTree()`.
- Composes `GameHost.getRendererHandoff()` instead of replacing previous handoffs.
- Draws a presentation-only aquifer cartography overlay from descriptors.

## Files changed

- `experiments/_kits/infinite-radial-terrain/terrain-aquifer-cartography-readiness-kits.js`
- `experiments/infinite-radial-terrain/terrain-aquifer-cartography-readiness-entry.js`
- `experiments/infinite-radial-terrain/index.html`
- `experiments/_shared/nexus-gallery-data.js`
- `tests/terrain-aquifer-cartography-readiness-kits-smoke.mjs`
- `tests/terrain-aquifer-cartography-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1146-infinite-radial-terrain-aquifer-cartography-upgrade.md`

## Tests added

- `tests/terrain-aquifer-cartography-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Validates all six atomic descriptor families.
  - Validates readiness bounds, scarcity bounds, mission-state enum, descriptor counts, serializability, and renderer/frame-loop ownership exclusions.

- `tests/terrain-aquifer-cartography-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Validates route marker, entry script, NexusEngine main CDN import, old NexusRealtime runtime absence in the changed entry, `GameHost` accessor exposure, renderer handoff composition, reusable-kit isolation, descriptor population, and state/input stability.

## Validation results

Passed in scratch workspace:

```txt
node --check experiments/_kits/infinite-radial-terrain/terrain-aquifer-cartography-readiness-kits.js
node --check experiments/infinite-radial-terrain/terrain-aquifer-cartography-readiness-entry.js
node --check tests/terrain-aquifer-cartography-readiness-kits-smoke.mjs
node --check tests/terrain-aquifer-cartography-cdn-state-input-smoke.mjs
node tests/terrain-aquifer-cartography-readiness-kits-smoke.mjs
node tests/terrain-aquifer-cartography-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Infinite radial terrain aquifer cartography readiness kits smoke passed 10 intake cases.
Infinite radial terrain aquifer cartography CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full repo `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full cloned workspace in this connector-driven run.

## NexusRealtime import audit

- Root `.agent/README.md` still references older NexusRealtime repo names as historical durable memory.
- `package.json` still has the legacy dev dependency name `nexusrealtime` pointed at `LuminaryLabs-Dev/NexusEngine#main`; this run did not change package installation scope.
- The changed Infinite Radial Terrain route and new aquifer entry use the required NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The new changed entry does not import `NexusRealtime@`.
- The new reusable kit file does not import NexusRealtime, NexusEngine, DOM, renderer, browser input, Three.js, WebGL, audio, asset loading, storage, or frame-loop APIs.

## Cleanup pass

- Kept all existing terrain route functionality and overlays intact.
- Composed the new aquifer handoff after existing handoffs instead of deleting or replacing prior descriptor families.
- Updated route metadata, HUD copy, hidden pass markers, and gallery card text so the new purpose is visible.
- No destructive files were removed.

## Non-game handling

Infinite Radial Terrain is a small experience-driven web game route, so no delete/refactor/rename action was required.

## Next safe ledge

Move the Infinite Radial Terrain overlay stack into one shared descriptor-overlay adapter so expedition, wayfinding, shelter, and aquifer overlays can share layout slots while the domain kits stay renderer-neutral.
