# VR Platformer Board Skill Rhythm Readiness Upgrade

## Summary

- Chosen experiment: `experiments/vr-platformer-board/`
- Upgrade: added renderer-neutral skill rhythm readiness kits for jump timing gates, air-control vectors, coin-combo lanes, hazard hesitation fields, checkpoint save echoes, and exit commitment crests.
- Last upgraded experiment avoided: `experiments/infinite-radial-terrain/`
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main`

## Why this experiment was chosen

The latest completed upgrade on `main` before this run was `.agent/turn-ledger/2026-07-08-1058-infinite-radial-terrain-survey-contract-upgrade.md`, which chose `experiments/infinite-radial-terrain/`. This run picked a different route. `experiments/vr-platformer-board/` was still one of the smallest game loops: move, jump, collect coins, avoid hazards, reach the exit. It already had visual, traversal, and objective readability, but it still lacked an explicit skill-rhythm layer for when to jump, how to steer in air, how to keep a coin combo, when to hesitate near hazards, which checkpoint is actually safe, and when to commit to the exit.

## Last upgraded experiment

```txt
experiments/infinite-radial-terrain/
```

Latest prior ledger marker:

```txt
.agent/turn-ledger/2026-07-08-1058-infinite-radial-terrain-survey-contract-upgrade.md
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller and camera diagnostic sandbox upgraded with arena, locomotion, and camera composition readability. | Short sandbox, continuous. | WASD, spring camera, jump/backpedal/yaw, landing patches, focus ribbons, shoulder wedges, occlusion veils, comfort meters. | No changed-runtime old CDN. | Yes. |
| `experiments/peer-scene-transition/` | Scene transition and puzzle decision demo upgraded with oracle route forecasting. | Short puzzle loop. | Scene actions, exits, inventory, gates, local decision cues, future route forecast, pressure clocks, resource maps, ending readiness. | No changed-runtime old CDN in changed overlay. | Yes. |
| `apps/the-cavalry-of-rome/` | Strategy/campaign map prototype upgraded with logistics readiness. | Medium campaign loop. | World actions, scouting, reinforcement, objective pressure, supply depots, forage corridors, road strain, siege readiness, courier pulses, winter attrition. | No changed-runtime old CDN in overlay. | Yes. |
| `experiments/vr-platformer-board/` | Flat board platformer upgraded with skill rhythm readiness. | Short platformer loop. | A/D move, Space jump, reset, coins, hazards, exit, jump gates, air vectors, combo lanes, hazard hesitation, checkpoint echoes, exit commitment. | No changed-runtime old CDN. | Yes. |
| `experiments/next-ledge/` | Grapple/swing traversal experiment. | Short traversal loop. | Grapple, swing, cargo, fall pressure, traversal readability, anchor timing. | Legacy local bridge name remains in base stack; changed wrapper imports NexusEngine main CDN. | Yes for changed wrapper. |
| `experiments/infinite-radial-terrain/` | Radial terrain flight and survey route upgraded with survey contract readiness. | Continuous flight sandbox. | WASD flight, terrain LOD, expedition descriptors, wayfinding, contract steps, tempo rings, fork scoring, altitude pledge, return compass. | No changed-runtime old CDN. | Yes. |
| `experiments/the-open-above/` | Bird-flight terrain streaming sandbox upgraded with route readability. | Continuous flight sandbox. | Pitch/bank/boost, flock, terrain streaming, updraft routing, ridge hazards, landing ghosts, draft wakes, altitude reserve, homeward bearing. | Changed runtime config migrated to NexusEngine main CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow scene upgraded into a pasture route planning micro experience. | Passive/short exploration, continuous. | Grass, flowers, sheep, ecology cues, grazing routes, forage priorities, comfort arcs, water threads, gate return, shelter bands. | No changed-runtime old CDN. | Yes. |
| `experiments/fogline-relay/` | Fogline relay scan loop upgraded with signal cartography and operator rhythm readability. | Short relay loop. | Move, scan, relays, wraith pressure, retreat, route drift, scanner cadence, relay repair beats, extraction commitment. | No changed-runtime old CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person survival/build signal-island prototype upgraded with expedition readiness. | Medium objective loop. | Move, scan, harvest, build, survive, unlock, carry cargo, activate beacon, read expedition runways. | No changed-runtime old CDN. | Yes. |
| `experiments/sora-the-infinite/` | Route-preview and launch gateway upgraded with launch rehearsal, flightplan readability, sky negotiation, and preflight challenge readiness. | Short planning loop. | Preview, preflight, route continuity, thermal choice, storm shelves, landing oath, launch handoff. | No changed-runtime old CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival and foraging loop upgraded with horde pathing readiness. | Short wave loop. | Move, collect apples, scavenge gear, survive waves, read survival/foraging/horde approach descriptors. | New overlay and runtime stack use NexusEngine main CDN; local compatibility naming remains. | Yes. |
| `experiments/tropical-island-scene/` | Tropical island lagoon scene upgraded with weather shelter readability. | Passive/short orbit exploration. | Orbit, fish, coconuts, beachcomber cues, lagoon navigation, storm fronts, shelter canopies, tide escape, wave warnings, supply caches, dusk return. | Legacy local ProtoKit import-map remains for old stack. | Yes for new overlays. |
| `games/signal-bastion/` | 2.5D tower-defense game upgraded with command, wave choreography, and frontline tactics readability. | 30-wave game. | Place/upgrade/sell towers, start waves, defend vital, read command choices, wave cadence, frontline build/intercept/salvage decisions. | No changed-runtime old CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Rogue-lite survival siege upgraded with siegecraft readiness. | Medium survival/extraction loop. | Harvest, craft, build, defend, extract, read build footprints, crossfire, resource burn, build priority, breach countdowns, extraction risk. | No changed-runtime old CDN. | Yes. |

## Domain ASCII tree

```txt
vr-board-skill-rhythm-readiness-domain
├─ cadence-control-domain
│  ├─ jump-timing-gate-domain
│  │  └─ vr-board-jump-timing-gate-kit
│  └─ air-control-vector-domain
│     └─ vr-board-air-control-vector-kit
├─ combo-route-domain
│  ├─ coin-combo-lane-domain
│  │  └─ vr-board-coin-combo-lane-kit
│  └─ checkpoint-save-echo-domain
│     └─ vr-board-checkpoint-save-echo-kit
├─ commitment-risk-domain
│  ├─ hazard-hesitation-field-domain
│  │  └─ vr-board-hazard-hesitation-field-kit
│  └─ exit-commitment-crest-domain
│     └─ vr-board-exit-commitment-crest-kit
└─ renderer-handoff
   └─ vr-board-skill-rhythm-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

Integrated traversal tree:

```txt
vr-board-traversal-readability-domain
├─ jump-readability
├─ route-memory
├─ cadence-and-coaching
├─ objective-readability
├─ skill-rhythm-readiness
└─ renderer-handoff
   └─ renderer consumes folded traversal, objective, and skill rhythm descriptors only
```

## Kits added or changed

Added:

```txt
vr-board-jump-timing-gate-kit
vr-board-air-control-vector-kit
vr-board-coin-combo-lane-kit
vr-board-hazard-hesitation-field-kit
vr-board-checkpoint-save-echo-kit
vr-board-exit-commitment-crest-kit
vr-board-skill-rhythm-renderer-handoff-kit
vr-board-skill-rhythm-readiness-domain-kit
```

Changed:

```txt
vr-board-traversal-readability-domain-kit
vr-board-traversal-renderer-handoff-kit
canonical domain-kit manifest
VR board Playwright/state smoke routing
```

The new kits accept plain board/platformer snapshots and emit serializable descriptor groups. They do not import NexusEngine, NexusRealtime, DOM, browser input, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.

## Files changed

```txt
experiments/_kits/vr-platformer-board/vr-board-skill-rhythm-readiness-kits.js
experiments/_kits/vr-platformer-board/vr-board-traversal-readability-kits.js
tests/vr-board-skill-rhythm-readiness-kits-smoke.mjs
tests/vr-board-skill-rhythm-readiness-cdn-state-input-smoke.mjs
tests/vr-platformer-board-playwright-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1115-vr-board-skill-rhythm-upgrade.md
```

## Tests added

```txt
tests/vr-board-skill-rhythm-readiness-kits-smoke.mjs
tests/vr-board-skill-rhythm-readiness-cdn-state-input-smoke.mjs
```

The kit smoke contains 10 intake cases and checks:

```txt
jump timing gate descriptors
air-control vector descriptors
coin-combo lane descriptors
hazard hesitation field descriptors
checkpoint save echo descriptors
exit commitment crest descriptors
renderer handoff counts
serializable descriptor boundaries
renderer ownership boundaries
integration through traversal readability
```

The CDN/state/input smoke contains 10 simulated state cases and checks:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in VR Board route
traversal import of skill rhythm readiness kits
GameHost renderer handoff preservation
skill rhythm descriptor exposure through traversal readability
existing Playwright/state smoke routing
renderer-neutral kit ownership
manifest route registration
10 state/input descriptor outcomes
```

## Validation results

- Added 10-case kit smoke coverage for the VR Board skill rhythm readiness domain.
- Added 10-case CDN/state/input coverage for NexusEngine CDN usage, route shell, traversal integration, GameHost renderer handoff preservation, and manifest registration.
- Routed both new smoke tests through `tests/vr-platformer-board-playwright-state-input-smoke.mjs`, which is already present in full and deploy validation.
- Updated `experiments/domain-kit-cutover-manifest.json` to register `vr-board-skill-rhythm-readiness-domain-kit`.
- Connector-only run did not execute a local shell test runner. The intended validation commands remain:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/vr-platformer-board/index.html` already imports NexusEngine main via:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The route does not import:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js
```

- `experiments/_kits/vr-platformer-board/vr-board-skill-rhythm-readiness-kits.js` does not import NexusRealtime, NexusEngine, DOM, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.
- No old NexusRealtime import was added.

## Cleanup pass

- Avoided creating a versioned VR Board route.
- Kept reusable scoring and descriptor generation in `vr-board-skill-rhythm-readiness-kits.js`.
- Folded skill rhythm descriptors into the already-rendered traversal buckets: checkpoint thread, fail recovery beacons, and tempo pulse bands.
- Preserved the existing Canvas renderer and `GameHost.getRendererHandoff()` shape.
- Preserved existing objective-readability and traversal-readability APIs.
- Routed new tests through the existing VR Board Playwright/state smoke instead of expanding `scripts/run-checks.mjs` further.
- Updated the canonical manifest to register the new domain kit.

## Non-game handling

`experiments/vr-platformer-board/` is a small experience-driven web game. It was not deleted, renamed, or destructively refactored. The route is trying to prove a flat XR-style platformer board with renderer-neutral visual, traversal, objective, and skill-readiness descriptor layers; this pass preserved that proof and added the missing skill-rhythm decision layer.

## Next safe ledge

Promote `vr-board-skill-rhythm-readiness-domain-kit` into a reusable `platformer-skill-contract-domain-kit` facade that can also serve `next-ledge` and other traversal routes without making the renderer own timing, combo, or safety truth.
