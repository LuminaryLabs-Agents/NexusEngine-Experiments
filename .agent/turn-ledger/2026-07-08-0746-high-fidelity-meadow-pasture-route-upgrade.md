# High Fidelity Meadow Pasture Route Readability Upgrade

## Summary

- Chosen experiment: `experiments/high-fidelity-meadow/`
- Upgrade: added renderer-neutral pasture route readability kits and integrated their descriptor handoff into the existing WebGL meadow scene.
- Last upgraded experiment avoided: `experiments/next-ledge/`
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main`

## Why this experiment was chosen

The last completed upgrade was `experiments/next-ledge/`, so this run selected a different route. `high-fidelity-meadow` already had strong visual and ecology readability descriptors, but it was still mostly passive: the player could look at the scene, but the scene did not yet expose route-planning decisions for light herding. The pasture route layer turns that passive scene into a small grazing-planning micro experience by making grazing routes, forage priority, sheep comfort, water access, return gates, and weather shelter readable without moving simulation truth into the renderer.

## Last upgraded experiment

```txt
experiments/next-ledge/
```

Latest prior commit marker:

```txt
c4beb4cddab91343585e39de026573676dcecb3d Log Next Ledge anchor timing readability upgrade
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller and locomotion debug sandbox. | Short sandbox, continuous. | WASD, spring camera, jump/backpedal/yaw readability. | No changed-runtime old CDN. | Yes. |
| `experiments/peer-scene-transition/` | Scene transition and puzzle decision demo. | Short puzzle loop. | Scene actions, exits, inventory, gates, decision cues. | No changed-runtime old CDN. | Yes. |
| `apps/the-cavalry-of-rome/` | Strategy/campaign map prototype. | Medium campaign loop. | World actions, scouting, reinforcement, objectives. | No changed-runtime old CDN. | Yes. |
| `experiments/vr-platformer-board/` | Flat board platformer with VR-style comfort constraints. | Short platformer loop. | Move, jump, coins, hazards, exit, route risk. | No changed-runtime old CDN. | Yes. |
| `experiments/next-ledge/` | Grapple/swing traversal experiment. | Short traversal loop. | Grapple, swing, cargo, fall pressure, traversal readability, anchor timing. | Legacy base `session.js` still imports old NexusRealtime; changed wrapper imports NexusEngine main CDN. | Yes for changed wrapper. |
| `experiments/infinite-radial-terrain/` | Radial terrain flight and survey route. | Continuous flight sandbox. | WASD flight, terrain LOD, survey, altitude, route tasks, wayfinding. | No changed-runtime old CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow scene upgraded into a light pasture route planning micro experience. | Passive/short exploration, continuous. | Grass, flowers, sheep, ecology cues, grazing route scores, forage priorities, comfort arcs, water threads, gate return, shelter bands. | No changed-runtime old CDN. | Yes. |
| `experiments/fogline-relay/` | Fogline relay scan loop. | Short relay loop. | Move, scan, relays, wraith pressure, retreat. | No changed-runtime old CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person survival/build signal-island prototype. | Medium objective loop. | Harvest, build, cargo, pressure, beacon. | No changed-runtime old CDN. | Yes. |
| `experiments/sora-the-infinite/` | Route-preview and launch/flightplan gateway. | Short planning loop. | Preview, preflight, flightplan, launch cues. | No changed-runtime old CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival/foraging loop. | Short wave loop. | Move, collect, gear, boss omen, safe harvest. | No changed-runtime old CDN. | Yes. |
| `experiments/tropical-island-scene/` | Tropical island lagoon scene. | Passive/short exploration. | Orbit, fish, coconuts, reef, beachcomber, lagoon cues. | Legacy local ProtoKit import-map remains for old stack. | Yes for new overlays. |
| `games/signal-bastion/` | Tower-defense wave game. | 30-wave game. | Place/upgrade towers, waves, leak risk, reserves. | No changed-runtime old CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Rogue-lite survival siege. | Medium survival/extraction loop. | Harvest, craft, build, defend, extract. | No changed-runtime old CDN. | Yes. |

## Domain ASCII tree

```txt
meadow-pasture-route-readability-domain
├─ forage-intent-domain
│  ├─ grazing-route-score-domain
│  │  └─ meadow-grazing-route-score-kit
│  └─ forage-patch-priority-domain
│     └─ meadow-forage-patch-priority-kit
├─ flock-comfort-domain
│  ├─ sheep-comfort-arc-domain
│  │  └─ meadow-sheep-comfort-arc-kit
│  └─ water-trough-thread-domain
│     └─ meadow-water-trough-thread-kit
├─ return-weather-domain
│  ├─ gate-return-cue-domain
│  │  └─ meadow-gate-return-cue-kit
│  └─ weather-shelter-band-domain
│     └─ meadow-weather-shelter-band-kit
└─ renderer-handoff
   └─ meadow-pasture-route-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
meadow-grazing-route-score-kit
meadow-forage-patch-priority-kit
meadow-sheep-comfort-arc-kit
meadow-water-trough-thread-kit
meadow-gate-return-cue-kit
meadow-weather-shelter-band-kit
meadow-pasture-route-renderer-handoff-kit
meadow-pasture-route-readability-domain-kit
```

The new kits accept plain meadow snapshots and produce plain serializable descriptor output. They do not import NexusEngine, NexusRealtime, Three.js, WebGL, DOM, browser input, audio, assets, or frame-loop ownership.

## Files changed

```txt
experiments/high-fidelity-meadow/src/meadow-pasture-route-readability-kits.js
experiments/high-fidelity-meadow/src/meadow-visual-fractal-renderers.js
experiments/high-fidelity-meadow/src/main-aaa.js
experiments/high-fidelity-meadow/index.html
tests/high-fidelity-meadow-pasture-route-readability-kits-smoke.mjs
tests/high-fidelity-meadow-pasture-route-cdn-state-input-smoke.mjs
scripts/run-checks.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-0746-high-fidelity-meadow-pasture-route-upgrade.md
```

## Tests added

```txt
tests/high-fidelity-meadow-pasture-route-readability-kits-smoke.mjs
tests/high-fidelity-meadow-pasture-route-cdn-state-input-smoke.mjs
```

The kit smoke contains 10 intake cases and checks:

```txt
grazing route scores
forage patch priorities
sheep comfort arcs
water trough threads
gate return cues
weather shelter bands
renderer handoff counts
serializable descriptor boundaries
```

The CDN/state/input smoke contains 10 simulated state/input surfaces and checks:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in the changed route
route shell cache bust
GameHost.getPastureRouteReadability exposure
GameHost.getRendererHandoff composition
Three renderer descriptor consumption
renderer-neutral kit ownership
```

## Validation results

- Added 10-case kit smoke coverage for the new pasture route readability domain.
- Added 10-case CDN/state/input coverage for the changed route shell, host, and descriptor handoff.
- Wired both new tests into `npm run check` and `npm run check:deploy` through `scripts/run-checks.mjs`.
- Connector-only run did not execute a local shell test runner. The intended validation commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/high-fidelity-meadow/src/main-aaa.js` imports NexusEngine main via:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The changed meadow runtime does not import:

```txt
LuminaryLabs-Dev/NexusRealtime@main/src/index.js
```

- The new reusable kit file does not import NexusRealtime, NexusEngine, DOM, Three.js, WebGL, audio, asset loading, or frame-loop systems.

## Cleanup pass

- Avoided adding a version-suffixed route.
- Kept reusable pasture route logic in a renderer-neutral kit file.
- Kept Three.js objects inside `meadow-visual-fractal-renderers.js` only.
- Preserved visual fractal and ecology readability outputs.
- Composed visual, ecology, and pasture route handoffs through `GameHost.getRendererHandoff()`.
- Updated the canonical manifest instead of creating duplicate route metadata.

## Non-game handling

`high-fidelity-meadow` is a small experience-driven web experiment, not a complete game. It was not deleted, renamed, or destructively refactored. The route is trying to prove a high-fidelity procedural scene built from reusable meadow domains. This run preserved that proof and added a clearer grazing / pasture route planning layer.

## Next safe ledge

Add a deterministic meadow replay fixture that samples camera orbit, sheep flock center, cycle phase, and composed renderer-handoff descriptor hashes across visual, ecology, and pasture route domains so visual changes can be compared without screenshot-only validation.
