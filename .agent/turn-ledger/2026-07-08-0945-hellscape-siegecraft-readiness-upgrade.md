# Rogue-Lite Hellscape Siegecraft Readiness Upgrade

## Summary

- Chosen experiment: `games/rogue-lite-hellscape-siege/`
- Upgrade: added renderer-neutral siegecraft readiness kits for barricade footprint planning, turret crossfire, resource burn, build priority, core breach timing, and extraction risk.
- Last upgraded experiment avoided: `apps/the-cavalry-of-rome/`
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main`

## Why this experiment was chosen

The latest completed upgrade on `main` before this run was `.agent/turn-ledger/2026-07-08-0931-cavalry-logistics-readiness-upgrade.md`, which chose `apps/the-cavalry-of-rome/`. This run picked a different route. `games/rogue-lite-hellscape-siege/` had realm portals, harvesting, builds, expedition readability, and visual pressure cues, but its most important tactical build decisions were still implicit: where a wall should go, whether turrets overlap, which build will burn scarce resources, which option should be placed next, how soon the core is breached, and whether an exit path is still safe.

## Last upgraded experiment

```txt
apps/the-cavalry-of-rome/
```

Latest prior ledger marker:

```txt
.agent/turn-ledger/2026-07-08-0931-cavalry-logistics-readiness-upgrade.md
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller and camera diagnostic sandbox upgraded with arena, locomotion, and camera composition readability. | Short sandbox, continuous. | WASD, spring camera, jump/backpedal/yaw, landing patches, focus ribbons, shoulder wedges, occlusion veils, comfort meters. | No changed-runtime old CDN. | Yes. |
| `experiments/peer-scene-transition/` | Scene transition and puzzle decision demo upgraded with oracle route forecasting. | Short puzzle loop. | Scene actions, exits, inventory, gates, local decision cues, future route forecast, pressure clocks, resource maps, ending readiness. | No changed-runtime old CDN in changed overlay. | Yes. |
| `apps/the-cavalry-of-rome/` | Strategy/campaign map prototype upgraded with logistics readiness. | Medium campaign loop. | World actions, scouting, reinforcement, objective pressure, supply depots, forage corridors, road strain, siege readiness, courier pulses, winter attrition. | No changed-runtime old CDN in new overlay. | Yes. |
| `experiments/vr-platformer-board/` | Flat board platformer with VR-style comfort constraints. | Short platformer loop. | Move, jump, coins, hazards, exit, route risk. | No changed-runtime old CDN. | Yes. |
| `experiments/next-ledge/` | Grapple/swing traversal experiment. | Short traversal loop. | Grapple, swing, cargo, fall pressure, traversal readability, anchor timing. | Legacy base `session.js` still imports old NexusRealtime; changed wrapper imports NexusEngine main CDN. | Yes for changed wrapper. |
| `experiments/infinite-radial-terrain/` | Radial terrain flight and survey route. | Continuous flight sandbox. | WASD flight, terrain LOD, survey, altitude, route tasks, wayfinding. | No changed-runtime old CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow scene upgraded into a light pasture route planning micro experience. | Passive/short exploration, continuous. | Grass, flowers, sheep, ecology cues, grazing route scores, forage priorities, comfort arcs, water threads, gate return, shelter bands. | No changed-runtime old CDN. | Yes. |
| `experiments/fogline-relay/` | Fogline relay scan loop upgraded with signal cartography and operator rhythm readability. | Short relay loop. | Move, scan, relays, wraith pressure, retreat, route drift, scanner cadence, relay repair beats, extraction commitment. | No changed-runtime old CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person survival/build signal-island prototype upgraded with expedition readiness. | Medium objective loop. | Move, scan, harvest, build, survive, unlock, carry cargo, activate beacon, read expedition runways. | No changed-runtime old CDN. | Yes. |
| `experiments/sora-the-infinite/` | Route-preview and launch/flightplan gateway. | Short planning loop. | Preview, preflight, flightplan, launch cues. | No changed-runtime old CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival/foraging loop. | Short wave loop. | Move, collect, gear, boss omen, safe harvest. | No changed-runtime old CDN. | Yes. |
| `experiments/tropical-island-scene/` | Tropical island lagoon scene upgraded with weather shelter readability. | Passive/short orbit exploration. | Orbit, fish, coconuts, beachcomber cues, lagoon navigation, storm fronts, shelter canopies, tide escape, wave warnings, supply caches, dusk return. | Legacy local ProtoKit import-map remains for old stack. | Yes for new overlays. |
| `games/signal-bastion/` | 2.5D tower-defense game upgraded with command, wave choreography, and frontline tactics readability. | 30-wave game. | Place/upgrade/sell towers, start waves, defend vital, read command choices, wave cadence, frontline build/intercept/salvage decisions. | No changed-runtime old CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Rogue-lite survival siege upgraded with siegecraft readiness. | Medium survival/extraction loop. | Harvest, craft, build, defend, extract, read build footprints, crossfire, resource burn, build priority, breach countdowns, and extraction risk. | No changed-runtime old CDN. | Yes. |

## Domain ASCII tree

```txt
hellscape-siegecraft-readiness-domain
├─ build-footprint-domain
│  ├─ barricade-footprint-domain
│  │  └─ hellscape-barricade-footprint-grid-kit
│  └─ build-priority-domain
│     └─ hellscape-build-priority-queue-kit
├─ defensive-coverage-domain
│  ├─ turret-crossfire-domain
│  │  └─ hellscape-turret-crossfire-lattice-kit
│  └─ core-breach-domain
│     └─ hellscape-core-breach-countdown-kit
├─ economy-exit-domain
│  ├─ resource-burn-domain
│  │  └─ hellscape-resource-burn-forecast-kit
│  └─ extraction-risk-domain
│     └─ hellscape-extraction-risk-ribbon-kit
└─ renderer-handoff
   └─ hellscape-siegecraft-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
hellscape-barricade-footprint-grid-kit
hellscape-turret-crossfire-lattice-kit
hellscape-resource-burn-forecast-kit
hellscape-build-priority-queue-kit
hellscape-core-breach-countdown-kit
hellscape-extraction-risk-ribbon-kit
hellscape-siegecraft-renderer-handoff-kit
hellscape-siegecraft-readiness-domain-kit
```

Changed:

```txt
Hellscape runtime composition
Hellscape Canvas descriptor presentation
Hellscape route shell
Hellscape expedition smoke routing
canonical domain-kit manifest
```

The new kits accept plain game snapshots and emit serializable descriptor groups. They do not import NexusEngine, NexusRealtime, DOM, browser input, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.

## Files changed

```txt
games/rogue-lite-hellscape-siege/src/hellscape-siegecraft-readiness-domain-kit.js
games/rogue-lite-hellscape-siege/src/main.js
games/rogue-lite-hellscape-siege/src/renderer/canvas-renderer.js
games/rogue-lite-hellscape-siege/index.html
tests/hellscape-siegecraft-readiness-domain-kits-smoke.mjs
tests/hellscape-siegecraft-readiness-cdn-state-input-smoke.mjs
tests/hellscape-expedition-readability-domain-kits-smoke.mjs
tests/hellscape-expedition-readability-cdn-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-0945-hellscape-siegecraft-readiness-upgrade.md
```

## Tests added

```txt
tests/hellscape-siegecraft-readiness-domain-kits-smoke.mjs
tests/hellscape-siegecraft-readiness-cdn-state-input-smoke.mjs
```

The kit smoke contains 10 intake cases and checks:

```txt
barricade footprint grid cells
turret crossfire lattice lines
resource burn forecasts
build priority queue ranking
core breach countdowns
extraction risk ribbons
renderer handoff counts
serializable descriptor boundaries
renderer ownership boundaries
```

The CDN/state/input smoke contains 10 simulated state cases and checks:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in the changed runtime
siegecraft domain import wiring
GameHost.getSiegecraftReadiness exposure
GameHost renderer handoff composition
route shell cache bust
existing full/deploy Hellscape smoke routing
renderer-neutral kit ownership
10 state/input descriptor outcomes
```

## Validation results

- Added 10-case kit smoke coverage for the Hellscape siegecraft readiness domain.
- Added 10-case CDN/state/input coverage for the NexusEngine CDN runtime, route shell, GameHost facade, descriptor handoff, and renderer consumption hooks.
- Routed the new smoke tests through the existing Hellscape expedition smoke suites, which are already included in full and deploy validation.
- Connector-only run did not execute a local shell test runner. The intended validation commands remain:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `games/rogue-lite-hellscape-siege/src/main.js` imports NexusEngine main via:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The changed runtime and new siegecraft domain kit do not import:

```txt
LuminaryLabs-Dev/NexusRealtime@main/src/index.js
```

- The reusable siegecraft kit file does not import NexusRealtime, NexusEngine, DOM, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.
- Existing local ProtoKit runtime modules remain intact; this pass adds another NexusEngine CDN-composed descriptor domain rather than destructively replacing the game runtime.

## Cleanup pass

- Avoided creating a versioned Hellscape route.
- Kept siegecraft descriptor generation in `hellscape-siegecraft-readiness-domain-kit.js`.
- Kept Canvas drawing inside `canvas-renderer.js` as presentation-only descriptor consumption.
- Patched GameHost through additive accessors: `getSiegecraftReadiness()` and composed `getRendererHandoff()`.
- Updated the route shell to cache-bust the canonical base runtime.
- Routed new tests through existing Hellscape smoke entries instead of expanding `scripts/run-checks.mjs` further.
- Updated the canonical manifest instead of adding parallel metadata.

## Non-game handling

`games/rogue-lite-hellscape-siege/` is a small-to-medium experience-driven web game and was not deleted, renamed, or destructively refactored. The route is trying to prove a rogue-lite harvest/build/defend/extract loop; this pass preserved that proof and added the missing siegecraft decision layer.

## Next safe ledge

Fold siege fractal, expedition readability, and siegecraft readiness into a single `hellscape-command-readability-domain-kit` facade that delegates to the three existing domains while preserving their atomic boundaries and descriptor-only renderer handoff.
