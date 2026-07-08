# Signal Isles Expedition Readiness Upgrade

## Summary

- Chosen experiment: `experiments/nexus-frontier-signal-isles/`
- Upgrade: added renderer-neutral expedition readiness kits and integrated their descriptor handoff into the existing WebGL Signal Isles route.
- Last upgraded experiment avoided: `experiments/high-fidelity-meadow/`
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main`

## Why this experiment was chosen

The previous completed upgrade was `experiments/high-fidelity-meadow/`, so this run selected a different route. `nexus-frontier-signal-isles` already had objective readability, but the active field-engineer loop still made the next expedition decision too implicit: where to sweep next, how shards should ferry into the mast, when the mast is charge-ready, which retreat lane is safest under pressure, how the gate runway opens, and what remains in the beacon activation chain. This pass keeps gameplay truth in the composition layer and makes those decisions readable through atomic descriptor kits.

## Last upgraded experiment

```txt
experiments/high-fidelity-meadow/
```

Latest prior commit marker:

```txt
d53988091603c901ace5f29e9930c278e994a9f4 Log meadow pasture route readability upgrade
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller and locomotion debug sandbox. | Short sandbox, continuous. | WASD, spring camera, jump/backpedal/yaw/camera readability. | No changed-runtime old CDN. | Yes. |
| `experiments/peer-scene-transition/` | Scene transition and puzzle decision demo. | Short puzzle loop. | Scene actions, exits, inventory, gates, decision cues. | No changed-runtime old CDN. | Yes. |
| `apps/the-cavalry-of-rome/` | Strategy/campaign map prototype. | Medium campaign loop. | World actions, scouting, reinforcement, objectives. | No changed-runtime old CDN. | Yes. |
| `experiments/vr-platformer-board/` | Flat board platformer with VR-style comfort constraints. | Short platformer loop. | Move, jump, coins, hazards, exit, route risk. | No changed-runtime old CDN. | Yes. |
| `experiments/next-ledge/` | Grapple/swing traversal experiment. | Short traversal loop. | Grapple, swing, cargo, fall pressure, traversal readability, anchor timing. | Legacy base `session.js` still imports old NexusRealtime; changed wrapper imports NexusEngine main CDN. | Yes for changed wrapper. |
| `experiments/infinite-radial-terrain/` | Radial terrain flight and survey route. | Continuous flight sandbox. | WASD flight, terrain LOD, survey, altitude, route tasks, wayfinding. | No changed-runtime old CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow scene upgraded into a light pasture route planning micro experience. | Passive/short exploration, continuous. | Grass, flowers, sheep, ecology cues, grazing route scores, forage priorities, comfort arcs, water threads, gate return, shelter bands. | No changed-runtime old CDN. | Yes. |
| `experiments/fogline-relay/` | Fogline relay scan loop. | Short relay loop. | Move, scan, relays, wraith pressure, retreat. | No changed-runtime old CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person survival/build signal-island prototype upgraded with expedition readiness. | Medium objective loop. | Move, scan, harvest, build, survive, unlock, carry cargo, activate beacon, read expedition runways. | No changed-runtime old CDN. | Yes. |
| `experiments/sora-the-infinite/` | Route-preview and launch/flightplan gateway. | Short planning loop. | Preview, preflight, flightplan, launch cues. | No changed-runtime old CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival/foraging loop. | Short wave loop. | Move, collect, gear, boss omen, safe harvest. | No changed-runtime old CDN. | Yes. |
| `experiments/tropical-island-scene/` | Tropical island lagoon scene. | Passive/short exploration. | Orbit, fish, coconuts, reef, beachcomber, lagoon cues. | Legacy local ProtoKit import-map remains for old stack. | Yes for new overlays. |
| `games/signal-bastion/` | Tower-defense wave game. | 30-wave game. | Place/upgrade towers, waves, leak risk, reserves. | No changed-runtime old CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Rogue-lite survival siege. | Medium survival/extraction loop. | Harvest, craft, build, defend, extract. | No changed-runtime old CDN. | Yes. |

## Domain ASCII tree

```txt
signal-isles-expedition-readiness-domain
├─ survey-routing-domain
│  ├─ scan-sweep-domain
│  │  └─ signal-isles-scan-sweep-sector-kit
│  └─ shard-ferry-domain
│     └─ signal-isles-shard-ferry-line-kit
├─ defense-unlock-domain
│  ├─ mast-charge-domain
│  │  └─ signal-isles-mast-charge-window-kit
│  └─ pressure-retreat-domain
│     └─ signal-isles-pressure-retreat-lane-kit
├─ beacon-return-domain
│  ├─ gate-timing-domain
│  │  └─ signal-isles-gate-timing-runway-kit
│  └─ beacon-forecast-domain
│     └─ signal-isles-beacon-activation-forecast-kit
└─ renderer-handoff
   └─ signal-isles-expedition-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
signal-isles-scan-sweep-sector-kit
signal-isles-shard-ferry-line-kit
signal-isles-mast-charge-window-kit
signal-isles-pressure-retreat-lane-kit
signal-isles-gate-timing-runway-kit
signal-isles-beacon-activation-forecast-kit
signal-isles-expedition-renderer-handoff-kit
signal-isles-expedition-readiness-domain-kit
```

The new kits accept plain Signal Isles level/session snapshots and produce plain serializable descriptor output. They do not import NexusEngine, NexusRealtime, Three.js, WebGL, DOM, browser input, audio, assets, or frame-loop ownership.

## Files changed

```txt
experiments/_kits/nexus-frontier-signal-isles/signal-isles-expedition-readiness-domain-kits.js
experiments/nexus-frontier-signal-isles/src/game-composition.js
experiments/nexus-frontier-signal-isles/src/renderer.js
experiments/nexus-frontier-signal-isles/src/debug-host.js
experiments/nexus-frontier-signal-isles/src/main.js
experiments/nexus-frontier-signal-isles/index.html
tests/signal-isles-expedition-readiness-kits-smoke.mjs
tests/signal-isles-expedition-readiness-cdn-state-input-smoke.mjs
scripts/run-checks.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-0815-signal-isles-expedition-readiness-upgrade.md
```

## Tests added

```txt
tests/signal-isles-expedition-readiness-kits-smoke.mjs
tests/signal-isles-expedition-readiness-cdn-state-input-smoke.mjs
```

The kit smoke contains 10 intake cases and checks:

```txt
scan sweep sectors
shard ferry lines
mast charge windows
pressure retreat lanes
gate timing runways
beacon activation forecasts
renderer handoff counts
serializable descriptor boundaries
```

The CDN/state/input smoke contains 10 simulated state/input surfaces and checks:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in the changed route
route shell cache bust
GameHost.getExpeditionReadinessState exposure
GameHost.getRendererHandoff composition
Three renderer descriptor consumption
renderer-neutral kit ownership
```

## Validation results

- Added 10-case kit smoke coverage for the new Signal Isles expedition readiness domain.
- Added 10-case CDN/state/input coverage for the changed route shell, host, and descriptor handoff.
- Wired both new tests into `npm run check` and `npm run check:deploy` through `scripts/run-checks.mjs`.
- Connector-only run did not execute a local shell test runner. The intended validation commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/nexus-frontier-signal-isles/src/main.js` imports NexusEngine main via:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The changed Signal Isles runtime does not import:

```txt
LuminaryLabs-Dev/NexusRealtime@main/src/index.js
```

- The new reusable kit file does not import NexusRealtime, NexusEngine, DOM, Three.js, WebGL, audio, asset loading, or frame-loop systems.

## Cleanup pass

- Avoided creating a duplicate or version-suffixed Signal Isles route.
- Kept reusable expedition readiness logic in a renderer-neutral kit file under `experiments/_kits`.
- Kept Three.js drawing inside `renderer.js` only.
- Preserved existing visual fractal and objective readability outputs.
- Composed visual, objective, and expedition handoffs through `GameHost.getRendererHandoff()`.
- Updated the canonical manifest instead of adding parallel metadata.

## Non-game handling

`nexus-frontier-signal-isles` is a small experience-driven web experiment, not a complete long-form game. It was not deleted, renamed, or destructively refactored. The route is trying to prove a first-person field-engineer game loop built from reusable domain kits. This run preserved that proof and added a clearer expedition readiness layer.

## Next safe ledge

Add a deterministic Signal Isles route replay fixture that executes scan, harvest, build, pressure, unlock, cargo pickup, cargo delivery, and beacon activation while hashing visual, objective, and expedition renderer-handoff descriptors at each phase.
