# Tropical Weather Shelter Readability Upgrade

## Summary

- Chosen experiment: `experiments/tropical-island-scene/`
- Upgrade: added renderer-neutral weather shelter readability kits and integrated an overlay that makes storm fronts, shelter palms, tide escape windows, wave warnings, supply cache glints, and dusk return beacons explicit.
- Last upgraded experiment avoided: `experiments/peer-scene-transition/`
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main`

## Why this experiment was chosen

The latest completed upgrade on `main` before this run was `.agent/turn-ledger/2026-07-08-0828-peer-scene-oracle-readability-upgrade.md`, which chose `experiments/peer-scene-transition/`. This run picked a different route. `tropical-island-scene` remained one of the least game-like routes in the inventory because it was still mostly a passive orbitable scene. Lagoon navigation helped the water read better, but the player still had no storm, shelter, return, or emergency-pickup layer. This pass makes the island feel more like a small weather-readiness micro experience without moving gameplay truth into the renderer.

## Last upgraded experiment

```txt
experiments/peer-scene-transition/
```

Latest prior ledger marker:

```txt
.agent/turn-ledger/2026-07-08-0828-peer-scene-oracle-readability-upgrade.md
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
| `experiments/fogline-relay/` | Fogline relay scan loop. | Short relay loop. | Move, scan, relays, wraith pressure, retreat. | No changed-runtime old CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person survival/build signal-island prototype upgraded with expedition readiness. | Medium objective loop. | Move, scan, harvest, build, survive, unlock, carry cargo, activate beacon, read expedition runways. | No changed-runtime old CDN. | Yes. |
| `experiments/sora-the-infinite/` | Route-preview and launch/flightplan gateway. | Short planning loop. | Preview, preflight, flightplan, launch cues. | No changed-runtime old CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival/foraging loop. | Short wave loop. | Move, collect, gear, boss omen, safe harvest. | No changed-runtime old CDN. | Yes. |
| `experiments/tropical-island-scene/` | Tropical island lagoon scene upgraded with weather shelter readability. | Passive/short orbit exploration. | Orbit, fish, coconuts, beachcomber cues, lagoon navigation, storm fronts, shelter canopies, tide escape, wave warnings, supply caches, dusk return. | Legacy local ProtoKit import-map remains for old stack. | Yes for new overlays. |
| `games/signal-bastion/` | Tower-defense wave game. | 30-wave game. | Place/upgrade towers, waves, leak risk, reserves. | No changed-runtime old CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Rogue-lite survival siege. | Medium survival/extraction loop. | Harvest, craft, build, defend, extract. | No changed-runtime old CDN. | Yes. |

## Domain ASCII tree

```txt
tropical-weather-shelter-readability-domain
├─ weather-forecast-domain
│  ├─ storm-front-domain
│  │  └─ tropical-storm-front-sweep-kit
│  └─ wave-break-domain
│     └─ tropical-wave-break-warning-kit
├─ shelter-routing-domain
│  ├─ palm-canopy-domain
│  │  └─ tropical-shelter-palm-canopy-kit
│  └─ tide-escape-domain
│     └─ tropical-tide-escape-window-kit
├─ return-resource-domain
│  ├─ supply-cache-domain
│  │  └─ tropical-supply-cache-glint-kit
│  └─ dusk-return-domain
│     └─ tropical-dusk-return-beacon-kit
└─ renderer-handoff
   └─ tropical-weather-shelter-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
tropical-storm-front-sweep-kit
tropical-shelter-palm-canopy-kit
tropical-tide-escape-window-kit
tropical-wave-break-warning-kit
tropical-supply-cache-glint-kit
tropical-dusk-return-beacon-kit
tropical-weather-shelter-renderer-handoff-kit
tropical-weather-shelter-readability-domain-kit
```

The new kits accept plain island state snapshots and produce serializable descriptors. They do not import NexusEngine, NexusRealtime, Three.js, WebGL implementation classes, DOM, browser input, audio, assets, or frame-loop ownership.

## Files changed

```txt
experiments/tropical-island-scene/src/tropical-weather-shelter-readability-domain-kit.js
experiments/tropical-island-scene/src/weather-shelter-readability-entry.js
experiments/tropical-island-scene/index.html
tests/tropical-weather-shelter-readability-kits-smoke.mjs
tests/tropical-weather-shelter-cdn-state-input-smoke.mjs
scripts/run-checks.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-0847-tropical-weather-shelter-upgrade.md
```

## Tests added

```txt
tests/tropical-weather-shelter-readability-kits-smoke.mjs
tests/tropical-weather-shelter-cdn-state-input-smoke.mjs
```

The kit smoke contains 10 intake cases and checks:

```txt
storm front sweeps
shelter palm canopies
tide escape windows
wave break warnings
supply cache glints
dusk return beacons
renderer handoff counts
serializable descriptor boundaries
renderer ownership boundaries
```

The CDN/state/input smoke contains 10 simulated state cases and checks:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in the changed overlay
route shell cache bust
GameHost.getWeatherShelterReadability exposure
GameHost.getRendererHandoff composition
renderer-neutral kit ownership
weather shelter overlay loading on the canonical route
```

## Validation results

- Added 10-case kit smoke coverage for the new tropical weather shelter readability domain.
- Added 10-case CDN/state/input coverage for the changed overlay entry, route shell, GameHost patch, and descriptor handoff.
- Wired both new smoke files into `scripts/run-checks.mjs` for full and deploy validation.
- Connector-only run did not execute a local shell test runner. The intended validation commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/tropical-island-scene/src/weather-shelter-readability-entry.js` imports NexusEngine main via:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The changed weather shelter overlay does not import:

```txt
LuminaryLabs-Dev/NexusRealtime@main/src/index.js
```

- The reusable weather shelter kit file does not import NexusRealtime, NexusEngine, DOM, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.
- The legacy local ProtoKit import-map remains in `index.html` for the old tropical island/water stack and was not destructively removed in this pass.

## Cleanup pass

- Avoided creating a version-suffixed tropical route.
- Kept reusable weather shelter logic in `src/tropical-weather-shelter-readability-domain-kit.js` as plain descriptor producers.
- Kept DOM/Canvas overlay work in `src/weather-shelter-readability-entry.js` only.
- Loaded the overlay through the existing canonical `index.html` with a cache-busted module URL.
- Patched `GameHost` without mutating camera, fish, coconut, route, physics, or old island/water truth.
- Updated the canonical manifest instead of adding parallel metadata.

## Non-game handling

`tropical-island-scene` is a small experience-driven web scene, not a full game. It was not deleted, renamed, or destructively refactored. The route is trying to prove a high-fidelity tropical scene composition, and this run preserved that proof while adding a weather-readiness objective layer.

## Next safe ledge

Fold the beachcomber, lagoon navigation, and weather shelter overlays into a single descriptor-overlay compositor so the three Canvas overlays share one presentation surface while keeping beachcomber, navigation, and weather shelter descriptor generation as separate atomic domains.
