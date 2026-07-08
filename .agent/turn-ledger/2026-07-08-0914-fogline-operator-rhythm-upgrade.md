# Fogline Relay Operator Rhythm Readability Upgrade

## Summary

- Chosen experiment: `experiments/fogline-relay/`
- Upgrade: added renderer-neutral operator rhythm readability kits and integrated them beside visual fractal and signal cartography descriptors.
- Last upgraded experiment avoided: `games/signal-bastion/`
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main`

## Why this experiment was chosen

The latest completed upgrade on `main` before this run was `.agent/turn-ledger/2026-07-08-0858-signal-bastion-frontline-tactics-upgrade.md`, which chose `games/signal-bastion/`. This run picked a different route. `experiments/fogline-relay/` already had route readability and signal cartography, but the actual player cadence was still implicit: when to pulse the scanner, which relay is nearly repaired, how loud nearby wraith pressure is, where to breathe safely, how far the player drifted from the route, and when the extraction gate is committed enough to sprint.

## Last upgraded experiment

```txt
games/signal-bastion/
```

Latest prior ledger marker:

```txt
.agent/turn-ledger/2026-07-08-0858-signal-bastion-frontline-tactics-upgrade.md
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller and camera diagnostic sandbox upgraded with arena, locomotion, and camera composition readability. | Short sandbox, continuous. | WASD, spring camera, jump/backpedal/yaw, landing patches, focus ribbons, shoulder wedges, occlusion veils, comfort meters. | No changed-runtime old CDN. | Yes. |
| `experiments/peer-scene-transition/` | Scene transition and puzzle decision demo upgraded with oracle route forecasting. | Short puzzle loop. | Scene actions, exits, inventory, gates, local decision cues, future route forecast, pressure clocks, resource maps, ending readiness. | No changed-runtime old CDN in changed overlay. | Yes. |
| `apps/the-cavalry-of-rome/` | Strategy/campaign map prototype. | Medium campaign loop. | World actions, scouting, reinforcement, objectives. | No changed-runtime old CDN. | Yes. |
| `experiments/vr-platformer-board/` | Flat board platformer with VR-style comfort constraints. | Short platformer loop. | Move, jump, coins, hazards, exit, route risk. | No changed-runtime old CDN. | Yes. |
| `experiments/next-ledge/` | Grapple/swing traversal experiment. | Short traversal loop. | Grapple, swing, cargo, fall pressure, traversal readability, anchor timing. | Legacy base `session.js` still imports old NexusRealtime; changed wrapper imports NexusEngine main CDN. | Yes for changed wrapper. |
| `experiments/infinite-radial-terrain/` | Radial terrain flight and survey route. | Continuous flight sandbox. | WASD flight, terrain LOD, survey, altitude, route tasks, wayfinding. | No changed-runtime old CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow scene upgraded into a light pasture route planning micro experience. | Passive/short exploration, continuous. | Grass, flowers, sheep, ecology cues, grazing route scores, forage priorities, comfort arcs, water threads, gate return, shelter bands. | No changed-runtime old CDN. | Yes. |
| `experiments/fogline-relay/` | Fogline relay scan loop upgraded with signal cartography and operator rhythm readability. | Short relay loop. | Move, scan, relays, wraith pressure, retreat, route drift, scanner cadence, relay repair beats, extraction commitment. | No changed-runtime old CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person survival/build signal-island prototype upgraded with expedition readiness. | Medium objective loop. | Move, scan, harvest, build, survive, unlock, carry cargo, activate beacon, read expedition runways. | No changed-runtime old CDN. | Yes. |
| `experiments/sora-the-infinite/` | Route-preview and launch/flightplan gateway. | Short planning loop. | Preview, preflight, flightplan, launch cues. | No changed-runtime old CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival/foraging loop. | Short wave loop. | Move, collect, gear, boss omen, safe harvest. | No changed-runtime old CDN. | Yes. |
| `experiments/tropical-island-scene/` | Tropical island lagoon scene upgraded with weather shelter readability. | Passive/short orbit exploration. | Orbit, fish, coconuts, beachcomber cues, lagoon navigation, storm fronts, shelter canopies, tide escape, wave warnings, supply caches, dusk return. | Legacy local ProtoKit import-map remains for old stack. | Yes for new overlays. |
| `games/signal-bastion/` | 2.5D tower-defense game upgraded with command, wave choreography, and frontline tactics readability. | 30-wave game. | Place/upgrade/sell towers, start waves, defend the vital, read command choices, wave cadence, and frontline build/intercept/salvage decisions. | No changed-runtime old CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Rogue-lite survival siege. | Medium survival/extraction loop. | Harvest, craft, build, defend, extract. | No changed-runtime old CDN. | Yes. |

## Domain ASCII tree

```txt
fogline-operator-rhythm-domain
├─ scan-tempo-domain
│  ├─ scan-pulse-domain
│  │  └─ fogline-scan-pulse-cadence-kit
│  └─ relay-repair-domain
│     └─ fogline-relay-repair-beat-kit
├─ threat-breath-domain
│  ├─ wraith-noise-domain
│  │  └─ fogline-wraith-noise-shadow-kit
│  └─ lantern-breath-domain
│     └─ fogline-lantern-breath-pocket-kit
├─ route-commitment-domain
│  ├─ route-drift-domain
│  │  └─ fogline-route-drift-correction-kit
│  └─ extraction-commitment-domain
│     └─ fogline-extraction-commitment-beacon-kit
└─ renderer-handoff
   └─ fogline-operator-rhythm-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
fogline-scan-pulse-cadence-kit
fogline-relay-repair-beat-kit
fogline-wraith-noise-shadow-kit
fogline-lantern-breath-pocket-kit
fogline-route-drift-correction-kit
fogline-extraction-commitment-beacon-kit
fogline-operator-rhythm-renderer-handoff-kit
fogline-operator-rhythm-domain-kit
```

Changed:

```txt
fogline session composition
fogline GameHost facade
fogline route shell cache bust
run-checks suite wiring
manifest status and feature parity
```

The new kits accept plain Fogline level/game snapshots and emit serializable descriptor groups. They do not import NexusEngine, NexusRealtime, DOM, browser input, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.

## Files changed

```txt
experiments/fogline-relay/src/fogline-operator-rhythm-kits.js
experiments/fogline-relay/src/session.js
experiments/fogline-relay/src/main.js
experiments/fogline-relay/index.html
tests/fogline-operator-rhythm-domain-kits-smoke.mjs
tests/fogline-operator-rhythm-cdn-state-input-smoke.mjs
scripts/run-checks.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-0914-fogline-operator-rhythm-upgrade.md
```

## Tests added

```txt
tests/fogline-operator-rhythm-domain-kits-smoke.mjs
tests/fogline-operator-rhythm-cdn-state-input-smoke.mjs
```

The kit smoke contains 10 intake cases and checks:

```txt
scan pulse cadence rings
relay repair beats
wraith noise shadows
lantern breath pockets
route drift correction threads
extraction commitment beacons
renderer handoff counts
serializable descriptor boundaries
renderer ownership boundaries
```

The CDN/state/input smoke contains 10 simulated state cases and checks:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence
operator rhythm import wiring
operator rhythm snapshot exposure
GameHost.getOperatorRhythm exposure
GameHost renderer handoff composition
route shell cache bust
run-checks wiring
renderer-neutral kit ownership
existing renderer bucket compatibility
```

## Validation results

- Added 10-case kit smoke coverage for the Fogline operator rhythm readability domain.
- Added 10-case CDN/state/input coverage for the changed session, route shell, GameHost patch, and descriptor handoff.
- Wired both new smoke files into `scripts/run-checks.mjs` for full and deploy validation.
- Connector-only run did not execute a local shell test runner. The intended validation commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/fogline-relay/src/urls.js` imports NexusEngine main via:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The changed Fogline runtime files do not import:

```txt
LuminaryLabs-Dev/NexusRealtime@main/src/index.js
```

- Existing ProtoKit URLs still reference `NexusRealtime-ProtoKits`, which is a kit source compatibility dependency and not the old core runtime import.
- The reusable operator rhythm kit file does not import NexusRealtime, NexusEngine, DOM, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.

## Cleanup pass

- Avoided creating a versioned `fogline-relay-v2` route.
- Kept operator rhythm descriptor generation in `fogline-operator-rhythm-kits.js`.
- Reused the existing renderer buckets: `scanCones`, `relayAuras`, `pressureVignettes`, `safePockets`, `routeThreads`, `objectiveNeedles`, and `gateSigils`.
- Kept renderer code presentation-only; no renderer mutation or simulation ownership was added.
- Updated the canonical manifest instead of adding parallel metadata.
- Kept visual fractal and signal cartography intact, then composed operator rhythm beside them.

## Non-game handling

`experiments/fogline-relay/` is a small experience-driven web game and was not deleted, renamed, or destructively refactored. The route is trying to prove a foggy first-person scan/relay loop with pressure and objective readability; this pass preserved that proof and added a clearer operator timing layer.

## Next safe ledge

Fold route readability, signal cartography, and operator rhythm into a single `fogline-relay-field-readability-domain-kit` facade that delegates to the three existing domains while preserving their atomic internal boundaries and descriptor-only renderer handoff.
