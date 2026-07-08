# The Open Above Flight Route Readability Upgrade

## Summary

- Chosen experiment: `experiments/the-open-above/`
- Upgrade: added renderer-neutral flight route readability kits for updraft corridors, ridge hazard shelves, landing meadow ghosts, flock draft wakes, altitude reserve meters, and homeward bearing threads.
- Last upgraded experiment avoided: `experiments/zombie-orchard/`
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main`

## Why this experiment was chosen

The latest completed upgrade on `main` before this run was `.agent/turn-ledger/2026-07-08-1016-zombie-orchard-horde-pathing-upgrade.md`, which chose `experiments/zombie-orchard/`. This run picked a different route. `experiments/the-open-above/` was still an attractive but low-objective flight sandbox: it had terrain streaming, flock agents, and visual atmosphere descriptors, but the route decisions were implicit. The most meaningful upgrade was to make the flying readable as a micro-route loop: choose lift, avoid ridge shelves, preserve altitude reserve, line up landing meadows, use flock draft wakes, and keep a homeward bearing.

## Last upgraded experiment

```txt
experiments/zombie-orchard/
```

Latest prior ledger marker:

```txt
.agent/turn-ledger/2026-07-08-1016-zombie-orchard-horde-pathing-upgrade.md
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller and camera diagnostic sandbox upgraded with arena, locomotion, and camera composition readability. | Short sandbox, continuous. | WASD, spring camera, jump/backpedal/yaw, landing patches, focus ribbons, shoulder wedges, occlusion veils, comfort meters. | No changed-runtime old CDN. | Yes. |
| `experiments/peer-scene-transition/` | Scene transition and puzzle decision demo upgraded with oracle route forecasting. | Short puzzle loop. | Scene actions, exits, inventory, gates, local decision cues, future route forecast, pressure clocks, resource maps, ending readiness. | No changed-runtime old CDN in changed overlay. | Yes. |
| `apps/the-cavalry-of-rome/` | Strategy/campaign map prototype upgraded with logistics readiness. | Medium campaign loop. | World actions, scouting, reinforcement, objective pressure, supply depots, forage corridors, road strain, siege readiness, courier pulses, winter attrition. | No changed-runtime old CDN in new overlay. | Yes. |
| `experiments/vr-platformer-board/` | Flat board platformer with VR-style comfort constraints. | Short platformer loop. | Move, jump, coins, hazards, exit, traversal and objective readability. | No changed-runtime old CDN. | Yes. |
| `experiments/next-ledge/` | Grapple/swing traversal experiment. | Short traversal loop. | Grapple, swing, cargo, fall pressure, traversal readability, anchor timing. | Legacy base `session.js` still imports old NexusRealtime-named local bridge; changed wrapper imports NexusEngine main CDN. | Yes for changed wrapper. |
| `experiments/infinite-radial-terrain/` | Radial terrain flight and survey route. | Continuous flight sandbox. | WASD flight, terrain LOD, survey, altitude, route tasks, wayfinding. | No changed-runtime old CDN. | Yes. |
| `experiments/the-open-above/` | Bird-flight terrain streaming sandbox now upgraded with route readability. | Continuous flight sandbox. | Pitch/bank/boost, flock, terrain streaming, visual atmosphere, updraft routing, ridge hazard shelves, landing ghosts, draft wakes, altitude reserve, homeward bearing. | Migrated changed runtime config from old NexusRealtime CDN to NexusEngine main CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow scene upgraded into a light pasture route planning micro experience. | Passive/short exploration, continuous. | Grass, flowers, sheep, ecology cues, grazing route scores, forage priorities, comfort arcs, water threads, gate return, shelter bands. | No changed-runtime old CDN. | Yes. |
| `experiments/fogline-relay/` | Fogline relay scan loop upgraded with signal cartography and operator rhythm readability. | Short relay loop. | Move, scan, relays, wraith pressure, retreat, route drift, scanner cadence, relay repair beats, extraction commitment. | No changed-runtime old CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person survival/build signal-island prototype upgraded with expedition readiness. | Medium objective loop. | Move, scan, harvest, build, survive, unlock, carry cargo, activate beacon, read expedition runways. | No changed-runtime old CDN. | Yes. |
| `experiments/sora-the-infinite/` | Route-preview and launch gateway upgraded with launch rehearsal, flightplan readability, sky negotiation, and preflight challenge readiness. | Short planning loop. | Preview, preflight, route continuity, thermal choice, storm shelves, landing oath, launch handoff. | No changed-runtime old CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival and foraging loop now upgraded with horde pathing readiness. | Short wave loop. | Move, collect apples, scavenge gear, survive waves, read survival/foraging/horde approach descriptors. | New overlay and runtime stack use NexusEngine main CDN; old repo-local loader name remains only as compatibility wrapper naming. | Yes. |
| `experiments/tropical-island-scene/` | Tropical island lagoon scene upgraded with weather shelter readability. | Passive/short orbit exploration. | Orbit, fish, coconuts, beachcomber cues, lagoon navigation, storm fronts, shelter canopies, tide escape, wave warnings, supply caches, dusk return. | Legacy local ProtoKit import-map remains for old stack. | Yes for new overlays. |
| `games/signal-bastion/` | 2.5D tower-defense game upgraded with command, wave choreography, and frontline tactics readability. | 30-wave game. | Place/upgrade/sell towers, start waves, defend vital, read command choices, wave cadence, frontline build/intercept/salvage decisions. | No changed-runtime old CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Rogue-lite survival siege upgraded with siegecraft readiness. | Medium survival/extraction loop. | Harvest, craft, build, defend, extract, read build footprints, crossfire, resource burn, build priority, breach countdowns, and extraction risk. | No changed-runtime old CDN. | Yes. |

## Domain ASCII tree

```txt
open-above-flight-route-readability-domain
├─ lift-route-domain
│  ├─ updraft-corridor-domain
│  │  └─ open-above-updraft-corridor-kit
│  └─ flock-draft-domain
│     └─ open-above-flock-draft-wake-kit
├─ terrain-safety-domain
│  ├─ ridge-hazard-domain
│  │  └─ open-above-ridge-hazard-shelf-kit
│  └─ landing-meadow-domain
│     └─ open-above-landing-meadow-ghost-kit
├─ endurance-return-domain
│  ├─ altitude-reserve-domain
│  │  └─ open-above-altitude-reserve-meter-kit
│  └─ homeward-bearing-domain
│     └─ open-above-homeward-bearing-thread-kit
└─ renderer-handoff
   └─ open-above-flight-route-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
open-above-updraft-corridor-kit
open-above-ridge-hazard-shelf-kit
open-above-landing-meadow-ghost-kit
open-above-flock-draft-wake-kit
open-above-altitude-reserve-meter-kit
open-above-homeward-bearing-thread-kit
open-above-flight-route-renderer-handoff-kit
open-above-flight-route-readability-domain-kit
```

Changed:

```txt
The Open Above runtime config
The Open Above route shell
The Open Above Playwright smoke routing
The Open Above static smoke coverage
The Open Above visual static smoke coverage
canonical domain-kit manifest
```

The new kits accept plain flight snapshots and emit serializable descriptor groups. They do not import NexusEngine, NexusRealtime, DOM, browser input, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.

## Files changed

```txt
experiments/the-open-above/open-above-flight-route-readability-kits.js
experiments/the-open-above/open-above-flight-route-readability-entry.js
experiments/the-open-above/open-above.config.js
experiments/the-open-above/index.html
tests/open-above-flight-route-readability-kits-smoke.mjs
tests/open-above-flight-route-readability-cdn-state-input-smoke.mjs
tests/open-above-playwright-cdn-state-input-smoke.mjs
tests/open-above-static-smoke.mjs
tests/open-above-visual-static-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1043-open-above-flight-route-readability-upgrade.md
```

## Tests added

```txt
tests/open-above-flight-route-readability-kits-smoke.mjs
tests/open-above-flight-route-readability-cdn-state-input-smoke.mjs
```

The kit smoke contains 10 intake cases and checks:

```txt
updraft corridor descriptors
ridge hazard shelf descriptors
landing meadow ghost descriptors
flock draft wake descriptors
altitude reserve meter descriptors
homeward bearing thread descriptors
renderer handoff counts
serializable descriptor boundaries
renderer ownership boundaries
low-clearance danger escalation
```

The CDN/state/input smoke contains 10 simulated state cases and checks:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in changed runtime config and overlay
route shell cache busting
GameHost.getFlightRouteReadability exposure
GameHost renderer handoff composition
descriptor-only overlay marker
existing Open Above Playwright smoke routing
renderer-neutral kit ownership
manifest route registration
10 state/input descriptor outcomes
```

## Validation results

- Added 10-case kit smoke coverage for the Open Above flight route readability domain.
- Added 10-case CDN/state/input coverage for the NexusEngine CDN runtime config, route shell, GameHost facade, descriptor handoff, and presentation overlay.
- Routed the new smoke tests through `tests/open-above-playwright-cdn-state-input-smoke.mjs`, which is already present in full and deploy validation.
- Refreshed static Open Above smoke tests so the route shell cache-busting and NexusEngine CDN migration are expected.
- Connector-only run did not execute a local shell test runner. The intended validation commands remain:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/the-open-above/open-above.config.js` now imports NexusEngine main via:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- `experiments/the-open-above/open-above-flight-route-readability-entry.js` imports NexusEngine main via the same CDN and does not import:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js
```

- The reusable flight route kit file does not import NexusRealtime, NexusEngine, DOM, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.
- The old `nexus-realtime-page-loader.js` naming remains in the HTML as a local compatibility loader name only; it is not the changed runtime CDN path.
- The legacy ProtoKits base URL remains `NexusRealtime-ProtoKits@0.0.1` because those kit packages are still published under that repository path.

## Cleanup pass

- Avoided creating a versioned Open Above route.
- Kept route scoring and descriptor generation in `open-above-flight-route-readability-kits.js`.
- Kept DOM rendering inside `open-above-flight-route-readability-entry.js` as presentation-only descriptor consumption.
- Patched GameHost through additive accessors: `getFlightRouteReadability()` and `getOpenAboveFlightRouteReadability()`.
- Preserved the existing visual fractal layer.
- Routed new tests through the existing Open Above Playwright smoke instead of expanding `scripts/run-checks.mjs` further.
- Updated the canonical manifest to register The Open Above as a canonical cutover route.

## Non-game handling

`experiments/the-open-above/` is a small experience-driven web game / flight sandbox. It was not deleted, renamed, or destructively refactored. The route is trying to prove a composable flight, terrain-streaming, and sky-atmosphere stack; this pass preserved that proof and added a readable route-choice layer.

## Next safe ledge

Fold visual fractal and flight route readability into a single `open-above-flight-director-domain-kit` facade that delegates to the existing subdomains while preserving their atomic boundaries and descriptor-only renderer handoff.
