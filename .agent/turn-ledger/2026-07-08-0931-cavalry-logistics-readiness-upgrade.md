# Cavalry of Rome Logistics Readiness Upgrade

## Summary

- Chosen experiment: `apps/the-cavalry-of-rome/`
- Upgrade: added renderer-neutral logistics readiness kits and a NexusEngine CDN overlay for sustainment, forage, road strain, siege readiness, courier orders, and winter attrition.
- Last upgraded experiment avoided: `experiments/fogline-relay/`
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main`

## Why this experiment was chosen

The latest completed upgrade on `main` before this run was `.agent/turn-ledger/2026-07-08-0914-fogline-operator-rhythm-upgrade.md`, which chose `experiments/fogline-relay/`. This run picked a different route. `apps/the-cavalry-of-rome/` already had campaign-fractal and battlefield-orders readability, but its strategic layer still did not show the upkeep questions that make a campaign map feel alive: where supply holds, where forage is worth sending cavalry, which friendly roads are strained, which enemy frontier is siege-ready, how many courier orders remain, and which winter positions will bleed troops.

## Last upgraded experiment

```txt
experiments/fogline-relay/
```

Latest prior ledger marker:

```txt
.agent/turn-ledger/2026-07-08-0914-fogline-operator-rhythm-upgrade.md
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller and camera diagnostic sandbox upgraded with arena, locomotion, and camera composition readability. | Short sandbox, continuous. | WASD, spring camera, jump/backpedal/yaw, landing patches, focus ribbons, shoulder wedges, occlusion veils, comfort meters. | No changed-runtime old CDN. | Yes. |
| `experiments/peer-scene-transition/` | Scene transition and puzzle decision demo upgraded with oracle route forecasting. | Short puzzle loop. | Scene actions, exits, inventory, gates, local decision cues, future route forecast, pressure clocks, resource maps, ending readiness. | No changed-runtime old CDN in changed overlay. | Yes. |
| `apps/the-cavalry-of-rome/` | Strategy/campaign map prototype now upgraded with logistics readiness. | Medium campaign loop. | World actions, scouting, reinforcement, objective pressure, supply depots, forage corridors, road strain, siege readiness, courier pulses, winter attrition. | No changed-runtime old CDN in new overlay. | Yes. |
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
| `games/rogue-lite-hellscape-siege/` | Rogue-lite survival siege. | Medium survival/extraction loop. | Harvest, craft, build, defend, extract. | No changed-runtime old CDN. | Yes. |

## Domain ASCII tree

```txt
cavalry-logistics-readiness-domain
├─ sustainment-domain
│  ├─ depot-radius-domain
│  │  └─ cavalry-supply-depot-radius-kit
│  └─ forage-corridor-domain
│     └─ cavalry-forage-corridor-kit
├─ campaign-route-domain
│  ├─ road-strain-domain
│  │  └─ cavalry-road-strain-thread-kit
│  └─ courier-order-domain
│     └─ cavalry-courier-order-pulse-kit
├─ seasonal-siege-domain
│  ├─ siege-readiness-domain
│  │  └─ cavalry-siege-readiness-signal-kit
│  └─ winter-attrition-domain
│     └─ cavalry-winter-attrition-warning-kit
└─ renderer-handoff
   └─ cavalry-logistics-readiness-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
cavalry-supply-depot-radius-kit
cavalry-forage-corridor-kit
cavalry-road-strain-thread-kit
cavalry-siege-readiness-signal-kit
cavalry-courier-order-pulse-kit
cavalry-winter-attrition-warning-kit
cavalry-logistics-readiness-renderer-handoff-kit
cavalry-logistics-readiness-domain-kit
```

Changed:

```txt
Cavalry live route shell
Cavalry experiment route shell
Cavalry existing domain smoke route
Cavalry existing CDN/state smoke route
canonical domain-kit manifest
```

The new kits accept plain campaign snapshots and emit serializable descriptor groups. They do not import NexusEngine, NexusRealtime, DOM, browser input, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.

## Files changed

```txt
experiments/The Cavalry of Rome/src/cavalry-logistics-readiness-domain-kit.js
experiments/The Cavalry of Rome/src/cavalry-logistics-readiness-pass.js
apps/the-cavalry-of-rome/index.html
experiments/The Cavalry of Rome/index.html
tests/cavalry-logistics-readiness-domain-kits-smoke.mjs
tests/cavalry-logistics-readiness-cdn-state-input-smoke.mjs
tests/cavalry-battlefield-orders-domain-kits-smoke.mjs
tests/cavalry-battlefield-orders-cdn-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-0931-cavalry-logistics-readiness-upgrade.md
```

## Tests added

```txt
tests/cavalry-logistics-readiness-domain-kits-smoke.mjs
tests/cavalry-logistics-readiness-cdn-state-input-smoke.mjs
```

The kit smoke contains 10 intake cases and checks:

```txt
supply depot radii
forage corridors
road strain threads
siege readiness signals
courier order pulses
winter attrition warnings
renderer handoff counts
serializable descriptor boundaries
renderer ownership boundaries
```

The CDN/state/input smoke contains 10 simulated state cases and checks:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in the new overlay
logistics domain import wiring
GameHost.getCavalryLogisticsReadiness exposure
GameHost renderer handoff composition
route shell cache bust
manifest status
existing wired Cavalry smoke imports
renderer-neutral kit ownership
10 state/input descriptor outcomes
```

## Validation results

- Added 10-case kit smoke coverage for the Cavalry logistics readiness domain.
- Added 10-case CDN/state/input coverage for the new NexusEngine CDN overlay, live route shell, experiment route shell, GameHost patch, and descriptor handoff.
- Wired the new tests through existing Cavalry smoke suites that are already included in full and deploy validation.
- Connector-only run did not execute a local shell test runner. The intended validation commands remain:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/The Cavalry of Rome/src/cavalry-logistics-readiness-pass.js` imports NexusEngine main via:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The changed logistics overlay and logistics domain kit do not import:

```txt
LuminaryLabs-Dev/NexusRealtime@main/src/index.js
```

- The new reusable logistics kit file does not import NexusRealtime, NexusEngine, DOM, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.
- Existing older Cavalry modules remain intact; this pass adds a new NexusEngine CDN bridge instead of destructively rewriting the older campaign renderer stack.

## Cleanup pass

- Avoided creating a versioned Cavalry route.
- Kept logistics descriptor generation in `cavalry-logistics-readiness-domain-kit.js`.
- Kept overlay rendering in `cavalry-logistics-readiness-pass.js` as presentation-only Canvas consumption.
- Patched GameHost through an additive facade: `getCavalryLogisticsReadiness()`, `getLogisticsReadiness()`, and composed `getRendererHandoff()`.
- Updated both the live app shell and the experiment shell to load the cache-busted logistics pass.
- Routed the new smoke tests through existing Cavalry smoke suites rather than bloating `scripts/run-checks.mjs` further.
- Updated the canonical manifest instead of adding parallel metadata.

## Non-game handling

`apps/the-cavalry-of-rome/` is a small-to-medium experience-driven strategy prototype and was not deleted, renamed, or destructively refactored. The route is trying to prove a campaign-scale cavalry map with tactical world actions; this pass preserved that proof and added the missing sustainment/readiness layer.

## Next safe ledge

Fold campaign fractal, battlefield orders, and logistics readiness into a single `cavalry-campaign-command-readability-domain-kit` facade that delegates to the three existing domains while preserving their atomic boundaries and descriptor-only renderer handoff.
