# Sora Sky Negotiation Readiness Upgrade

## Summary

- Chosen experiment: `experiments/sora-the-infinite/`
- Upgrade: added renderer-neutral sky negotiation readiness kits for jetstream braids, storm shelves, thermal ladder choices, glide safe pockets, handoff confidence rails, and return vow threads.
- Last upgraded experiment avoided: `games/rogue-lite-hellscape-siege/`
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main`

## Why this experiment was chosen

The latest completed upgrade on `main` before this run was `.agent/turn-ledger/2026-07-08-0945-hellscape-siegecraft-readiness-upgrade.md`, which chose `games/rogue-lite-hellscape-siege/`. This run picked a different route. `experiments/sora-the-infinite/` is still one of the smallest and least variable routes in the repository: it is a route-preview / launch gateway rather than a full world, so the most meaningful next improvement was to make the preflight decision layer more playable. The new sky negotiation pass adds a second tactical layer after flightplan readability: read wind braids, storm shelves, safe lift ladders, glide pockets, handoff confidence, and return continuity before committing to The Open Above.

## Last upgraded experiment

```txt
games/rogue-lite-hellscape-siege/
```

Latest prior ledger marker:

```txt
.agent/turn-ledger/2026-07-08-0945-hellscape-siegecraft-readiness-upgrade.md
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
| `experiments/sora-the-infinite/` | Route-preview and launch gateway upgraded with launch rehearsal, flightplan readability, and sky negotiation readiness. | Short planning loop. | Preview, preflight, route continuity, thermal choice, energy budget, storm shelves, jetstream braids, glide pockets, launch handoff. | No changed-runtime old CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival/foraging loop. | Short wave loop. | Move, collect, gear, boss omen, safe harvest. | No changed-runtime old CDN. | Yes. |
| `experiments/tropical-island-scene/` | Tropical island lagoon scene upgraded with weather shelter readability. | Passive/short orbit exploration. | Orbit, fish, coconuts, beachcomber cues, lagoon navigation, storm fronts, shelter canopies, tide escape, wave warnings, supply caches, dusk return. | Legacy local ProtoKit import-map remains for old stack. | Yes for new overlays. |
| `games/signal-bastion/` | 2.5D tower-defense game upgraded with command, wave choreography, and frontline tactics readability. | 30-wave game. | Place/upgrade/sell towers, start waves, defend vital, read command choices, wave cadence, frontline build/intercept/salvage decisions. | No changed-runtime old CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Rogue-lite survival siege upgraded with siegecraft readiness. | Medium survival/extraction loop. | Harvest, craft, build, defend, extract, read build footprints, crossfire, resource burn, build priority, breach countdowns, and extraction risk. | No changed-runtime old CDN. | Yes. |

## Domain ASCII tree

```txt
sora-sky-negotiation-readiness-domain
├─ weather-negotiation-domain
│  ├─ jetstream-braid-domain
│  │  └─ sora-jetstream-braid-kit
│  └─ storm-shelf-domain
│     └─ sora-storm-shelf-warning-kit
├─ glide-pacing-domain
│  ├─ thermal-ladder-domain
│  │  └─ sora-thermal-ladder-choice-kit
│  └─ glide-pocket-domain
│     └─ sora-glide-safe-pocket-kit
├─ continuity-assurance-domain
│  ├─ handoff-confidence-domain
│  │  └─ sora-handoff-confidence-rail-kit
│  └─ return-vow-domain
│     └─ sora-return-vow-thread-kit
└─ renderer-handoff
   └─ sora-sky-negotiation-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
sora-jetstream-braid-kit
sora-storm-shelf-warning-kit
sora-thermal-ladder-choice-kit
sora-glide-safe-pocket-kit
sora-handoff-confidence-rail-kit
sora-return-vow-thread-kit
sora-sky-negotiation-renderer-handoff-kit
sora-sky-negotiation-readiness-domain-kit
```

Changed:

```txt
Sora gateway runtime composition
Sora route shell copy/cache busting
Sora descriptor presentation styles
Sora flightplan smoke routing
canonical domain-kit manifest
```

The new kits accept plain route-preview, launch-rehearsal, flightplan, readiness, and input snapshots and emit serializable descriptor groups. They do not import NexusEngine, NexusRealtime, DOM, browser input, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.

## Files changed

```txt
experiments/_kits/sora-the-infinite/sora-sky-negotiation-readiness-domain-kits.js
experiments/sora-the-infinite/sora-compatibility-gateway.js
experiments/sora-the-infinite/index.html
experiments/sora-the-infinite/sora-sky-negotiation-style.css
tests/sora-sky-negotiation-readiness-domain-kits-smoke.mjs
tests/sora-sky-negotiation-readiness-cdn-state-input-smoke.mjs
tests/sora-flightplan-readability-cdn-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1000-sora-sky-negotiation-readiness-upgrade.md
```

## Tests added

```txt
tests/sora-sky-negotiation-readiness-domain-kits-smoke.mjs
tests/sora-sky-negotiation-readiness-cdn-state-input-smoke.mjs
```

The kit smoke contains 10 intake cases and checks:

```txt
jetstream braid descriptors
storm shelf warning descriptors
thermal ladder choice descriptors
glide safe pocket descriptors
handoff confidence rail descriptors
return vow thread descriptors
renderer handoff counts
serializable descriptor boundaries
renderer ownership boundaries
composite summary stability
```

The CDN/state/input smoke contains 10 simulated state cases and checks:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in the changed runtime
sky negotiation route shell cache busting
GameHost.getSkyNegotiationReadiness exposure
GameHost renderer handoff composition
sky negotiation descriptor styling
existing Sora full/deploy smoke routing
renderer-neutral kit ownership
10 state/input descriptor outcomes
```

## Validation results

- Added 10-case kit smoke coverage for the Sora sky negotiation readiness domain.
- Added 10-case CDN/state/input coverage for the NexusEngine CDN runtime, route shell, GameHost facade, descriptor handoff, and presentation hooks.
- Routed the new smoke tests through `tests/sora-flightplan-readability-cdn-state-input-smoke.mjs`, which is already present in full and deploy validation.
- Connector-only run did not execute a local shell test runner. The intended validation commands remain:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/sora-the-infinite/sora-compatibility-gateway.js` imports NexusEngine main via:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The changed runtime and new sky negotiation domain kit do not import:

```txt
LuminaryLabs-Dev/NexusRealtime@main/src/index.js
```

- The reusable sky negotiation kit file does not import NexusRealtime, NexusEngine, DOM, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.

## Cleanup pass

- Avoided creating a versioned Sora route.
- Kept sky negotiation descriptor generation in `sora-sky-negotiation-readiness-domain-kits.js`.
- Kept DOM/CSS rendering inside the Sora gateway route as presentation-only descriptor consumption.
- Patched GameHost through additive accessors: `getSkyNegotiationReadiness()` and composed `getRendererHandoff()`.
- Updated the route shell to cache-bust the canonical base runtime and styles.
- Routed new tests through the existing Sora flightplan smoke instead of expanding `scripts/run-checks.mjs` further.
- Updated the canonical manifest instead of adding parallel metadata.

## Non-game handling

`experiments/sora-the-infinite/` is a small experience-driven web gateway, not a full game. It was not deleted, renamed, or destructively refactored. The route is trying to prove alias continuity and handoff readiness into The Open Above; this pass preserved that proof and added a richer sky-route decision layer.

## Next safe ledge

Fold route preview, launch rehearsal, flightplan readability, and sky negotiation readiness into a single `sora-airmanship-readiness-domain-kit` facade that delegates to the existing subdomains while preserving their atomic boundaries and descriptor-only renderer handoff.
