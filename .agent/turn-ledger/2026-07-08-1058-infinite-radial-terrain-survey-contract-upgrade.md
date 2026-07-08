# Infinite Radial Terrain Survey Contract Readiness Upgrade

## Summary

- Chosen experiment: `experiments/infinite-radial-terrain/`
- Upgrade: added renderer-neutral survey contract readiness kits for mission steps, waypoint tempo, risk/reward forks, altitude pledge bands, sample-chain ghosts, and return confidence.
- Last upgraded experiment avoided: `experiments/the-open-above/`
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main`

## Why this experiment was chosen

The latest completed upgrade on `main` before this run was `.agent/turn-ledger/2026-07-08-1043-open-above-flight-route-readability-upgrade.md`, which chose `experiments/the-open-above/`. This run picked a different route. `experiments/infinite-radial-terrain/` already had visual, expedition, and wayfinding descriptors, but it was still mostly continuous free-flight. The least-variable part left was the missing mission contract layer: what sample should be completed next, when to commit, when to branch, whether altitude is safe, and whether the return thread is still readable.

## Last upgraded experiment

```txt
experiments/the-open-above/
```

Latest prior ledger marker:

```txt
.agent/turn-ledger/2026-07-08-1043-open-above-flight-route-readability-upgrade.md
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller and camera diagnostic sandbox upgraded with arena, locomotion, and camera composition readability. | Short sandbox, continuous. | WASD, spring camera, jump/backpedal/yaw, landing patches, focus ribbons, shoulder wedges, occlusion veils, comfort meters. | No changed-runtime old CDN. | Yes. |
| `experiments/peer-scene-transition/` | Scene transition and puzzle decision demo upgraded with oracle route forecasting. | Short puzzle loop. | Scene actions, exits, inventory, gates, local decision cues, future route forecast, pressure clocks, resource maps, ending readiness. | No changed-runtime old CDN in changed overlay. | Yes. |
| `apps/the-cavalry-of-rome/` | Strategy/campaign map prototype upgraded with logistics readiness. | Medium campaign loop. | World actions, scouting, reinforcement, objective pressure, supply depots, forage corridors, road strain, siege readiness, courier pulses, winter attrition. | No changed-runtime old CDN in new overlay. | Yes. |
| `experiments/vr-platformer-board/` | Flat board platformer with visual, traversal, and objective readability. | Short platformer loop. | A/D move, Space jump, reset, coins, hazards, exit, jump arcs, landing zones, route risk. | No changed-runtime old CDN. | Yes. |
| `experiments/next-ledge/` | Grapple/swing traversal experiment. | Short traversal loop. | Grapple, swing, cargo, fall pressure, traversal readability, anchor timing. | Legacy base `session.js` still imports old NexusRealtime-named local bridge; changed wrapper imports NexusEngine main CDN. | Yes for changed wrapper. |
| `experiments/infinite-radial-terrain/` | Radial terrain flight and survey route now upgraded with a survey contract layer. | Continuous flight sandbox. | WASD flight, terrain LOD, expedition descriptors, wayfinding, contract steps, tempo rings, fork scoring, altitude pledge, return compass. | No changed-runtime old CDN. | Yes. |
| `experiments/the-open-above/` | Bird-flight terrain streaming sandbox upgraded with route readability. | Continuous flight sandbox. | Pitch/bank/boost, flock, terrain streaming, updraft routing, ridge hazards, landing ghosts, draft wakes, altitude reserve, homeward bearing. | Migrated changed runtime config from old NexusRealtime CDN to NexusEngine main CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow scene upgraded into a pasture route planning micro experience. | Passive/short exploration, continuous. | Grass, flowers, sheep, ecology cues, grazing routes, forage priorities, comfort arcs, water threads, gate return, shelter bands. | No changed-runtime old CDN. | Yes. |
| `experiments/fogline-relay/` | Fogline relay scan loop upgraded with signal cartography and operator rhythm readability. | Short relay loop. | Move, scan, relays, wraith pressure, retreat, route drift, scanner cadence, relay repair beats, extraction commitment. | No changed-runtime old CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person survival/build signal-island prototype upgraded with expedition readiness. | Medium objective loop. | Move, scan, harvest, build, survive, unlock, carry cargo, activate beacon, read expedition runways. | No changed-runtime old CDN. | Yes. |
| `experiments/sora-the-infinite/` | Route-preview and launch gateway upgraded with launch rehearsal, flightplan readability, sky negotiation, and preflight challenge readiness. | Short planning loop. | Preview, preflight, route continuity, thermal choice, storm shelves, landing oath, launch handoff. | No changed-runtime old CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival and foraging loop now upgraded with horde pathing readiness. | Short wave loop. | Move, collect apples, scavenge gear, survive waves, read survival/foraging/horde approach descriptors. | New overlay and runtime stack use NexusEngine main CDN; old repo-local loader name remains only as compatibility wrapper naming. | Yes. |
| `experiments/tropical-island-scene/` | Tropical island lagoon scene upgraded with weather shelter readability. | Passive/short orbit exploration. | Orbit, fish, coconuts, beachcomber cues, lagoon navigation, storm fronts, shelter canopies, tide escape, wave warnings, supply caches, dusk return. | Legacy local ProtoKit import-map remains for old stack. | Yes for new overlays. |
| `games/signal-bastion/` | 2.5D tower-defense game upgraded with command, wave choreography, and frontline tactics readability. | 30-wave game. | Place/upgrade/sell towers, start waves, defend vital, read command choices, wave cadence, frontline build/intercept/salvage decisions. | No changed-runtime old CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Rogue-lite survival siege upgraded with siegecraft readiness. | Medium survival/extraction loop. | Harvest, craft, build, defend, extract, read build footprints, crossfire, resource burn, build priority, breach countdowns, and extraction risk. | No changed-runtime old CDN. | Yes. |

## Domain ASCII tree

```txt
terrain-survey-contract-readiness-domain
├─ mission-contract-domain
│  ├─ survey-step-domain
│  │  └─ terrain-survey-contract-step-kit
│  └─ sample-chain-domain
│     └─ terrain-sample-chain-ghost-kit
├─ pacing-and-choice-domain
│  ├─ waypoint-tempo-domain
│  │  └─ terrain-waypoint-tempo-ring-kit
│  └─ risk-reward-fork-domain
│     └─ terrain-risk-reward-fork-kit
├─ safety-return-domain
│  ├─ altitude-pledge-domain
│  │  └─ terrain-altitude-pledge-band-kit
│  └─ return-confidence-domain
│     └─ terrain-return-confidence-compass-kit
└─ renderer-handoff
   └─ terrain-survey-contract-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
terrain-survey-contract-step-kit
terrain-waypoint-tempo-ring-kit
terrain-risk-reward-fork-kit
terrain-altitude-pledge-band-kit
terrain-sample-chain-ghost-kit
terrain-return-confidence-compass-kit
terrain-survey-contract-renderer-handoff-kit
terrain-survey-contract-readiness-domain-kit
```

Changed:

```txt
Infinite Radial Terrain route shell
Infinite Radial Terrain Playwright/state smoke routing
canonical domain-kit manifest
```

The new kits accept plain terrain/camera/sample snapshots and emit serializable descriptor groups. They do not import NexusEngine, NexusRealtime, DOM, browser input, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.

## Files changed

```txt
experiments/_kits/infinite-radial-terrain/terrain-survey-contract-readiness-kits.js
experiments/infinite-radial-terrain/terrain-survey-contract-readiness-entry.js
experiments/infinite-radial-terrain/index.html
tests/infinite-radial-terrain-survey-contract-readiness-kits-smoke.mjs
tests/infinite-radial-terrain-survey-contract-cdn-state-input-smoke.mjs
tests/infinite-radial-terrain-playwright-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1058-infinite-radial-terrain-survey-contract-upgrade.md
```

## Tests added

```txt
tests/infinite-radial-terrain-survey-contract-readiness-kits-smoke.mjs
tests/infinite-radial-terrain-survey-contract-cdn-state-input-smoke.mjs
```

The kit smoke contains 10 intake cases and checks:

```txt
survey contract step descriptors
waypoint tempo ring descriptors
risk/reward fork descriptors
altitude pledge band descriptors
sample-chain ghost descriptors
return confidence compass descriptor
renderer handoff counts
serializable descriptor boundaries
renderer ownership boundaries
altitude/return danger escalation
```

The CDN/state/input smoke contains 10 simulated state cases and checks:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in changed overlay
route shell cache busting
GameHost.getSurveyContractReadiness exposure
GameHost.getInfiniteRadialTerrainSurveyContractReadiness exposure
GameHost renderer handoff composition
renderer-consumes descriptors-only overlay marker
existing Infinite Radial Terrain Playwright smoke routing
renderer-neutral kit ownership
manifest route registration
10 state/input descriptor outcomes
```

## Validation results

- Added 10-case kit smoke coverage for the Infinite Radial Terrain survey contract readiness domain.
- Added 10-case CDN/state/input coverage for the NexusEngine CDN overlay, route shell, GameHost facade, descriptor handoff, and presentation marker.
- Routed the new smoke tests through `tests/infinite-radial-terrain-playwright-state-input-smoke.mjs`, which is already present in full and deploy validation.
- Updated `experiments/domain-kit-cutover-manifest.json` to register `terrain-survey-contract-readiness-domain-kit`.
- Connector-only run did not execute a local shell test runner. The intended validation commands remain:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/infinite-radial-terrain/infinite-radial-terrain.js` already imports NexusEngine main via:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- `experiments/infinite-radial-terrain/terrain-survey-contract-readiness-entry.js` imports NexusEngine main via the same CDN and does not import:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js
```

- The reusable survey contract kit file does not import NexusRealtime, NexusEngine, DOM, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.
- No old NexusRealtime import was added.

## Cleanup pass

- Avoided creating a versioned Infinite Radial Terrain route.
- Kept route scoring and descriptor generation in `terrain-survey-contract-readiness-kits.js`.
- Kept DOM rendering inside `terrain-survey-contract-readiness-entry.js` as presentation-only descriptor consumption.
- Patched GameHost through additive accessors: `getSurveyContractReadiness()` and `getInfiniteRadialTerrainSurveyContractReadiness()`.
- Preserved the existing visual, expedition, and wayfinding layers.
- Routed new tests through the existing Infinite Radial Terrain Playwright smoke instead of expanding `scripts/run-checks.mjs` further.
- Updated the canonical manifest to register the new domain kit.

## Non-game handling

`experiments/infinite-radial-terrain/` is a small experience-driven web flight/survey sandbox. It was not deleted, renamed, or destructively refactored. The route is trying to prove a composable terrain-streaming and route-planning stack; this pass preserved that proof and added an explicit mission contract layer.

## Next safe ledge

Fold expedition, wayfinding, and survey contract readiness into one `terrain-route-director-domain-kit` facade that delegates to the existing subdomains while preserving their atomic boundaries and descriptor-only renderer handoff.
