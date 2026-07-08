# Third Person Camera Composition Readability Upgrade

## Summary

- Chosen experiment: `experiments/ThirdPersonFollowThrough/`
- Upgrade: added renderer-neutral camera composition readability kits and integrated their descriptor handoff into the existing arena/locomotion overlay.
- Last upgraded experiment avoided: `experiments/high-fidelity-meadow/`
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main`

## Why this experiment was chosen

The last completed upgrade was `experiments/high-fidelity-meadow/`, so this run selected a different route. `ThirdPersonFollowThrough` is still one of the lowest-variation canonical experiences: it is primarily a controller and camera sandbox. It already exposed arena and locomotion readability, but the most important third-person usability question remained implicit: whether the camera is framing the actor well, whether the shoulder view is clear, whether obstacles are entering the camera line, and whether orbit/handoff is comfortable. The new camera-composition layer turns the sandbox into a more useful playable camera diagnostic without moving camera follow math or collision truth into renderer code.

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
| `experiments/ThirdPersonFollowThrough/` | Third-person controller and camera diagnostic sandbox upgraded with arena, locomotion, and camera composition readability. | Short sandbox, continuous. | WASD, mouse/arrow camera, jump, debug rays, yaw alignment, backpedal guard, landing patches, focus ribbons, shoulder wedges, occlusion veils, comfort meters. | No changed-runtime old CDN. | Yes. |
| `experiments/peer-scene-transition/` | Scene transition and puzzle decision demo. | Short puzzle loop. | Scene actions, exits, inventory, gates, decision cues. | No changed-runtime old CDN. | Yes. |
| `apps/the-cavalry-of-rome/` | Strategy/campaign map prototype. | Medium campaign loop. | World actions, scouting, reinforcement, objectives. | No changed-runtime old CDN. | Yes. |
| `experiments/vr-platformer-board/` | Flat board platformer with VR-style comfort constraints. | Short platformer loop. | Move, jump, coins, hazards, exit, route risk. | No changed-runtime old CDN. | Yes. |
| `experiments/next-ledge/` | Grapple/swing traversal experiment. | Short traversal loop. | Grapple, swing, cargo, fall pressure, traversal readability, anchor timing. | Legacy base `session.js` still imports old NexusRealtime; changed wrapper imports NexusEngine main CDN. | Yes for changed wrapper. |
| `experiments/infinite-radial-terrain/` | Radial terrain flight and survey route. | Continuous flight sandbox. | WASD flight, terrain LOD, survey, altitude, route tasks, wayfinding. | No changed-runtime old CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow scene upgraded into a pasture-route planning micro experience. | Passive/short exploration, continuous. | Grass, flowers, sheep, ecology cues, grazing route scores, forage priorities, comfort arcs, water threads, gate return, shelter bands. | No changed-runtime old CDN. | Yes. |
| `experiments/fogline-relay/` | Fogline relay scan loop. | Short relay loop. | Move, scan, relays, wraith pressure, retreat. | No changed-runtime old CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person survival/build signal-island prototype. | Medium objective loop. | Harvest, build, cargo, pressure, beacon. | No changed-runtime old CDN. | Yes. |
| `experiments/sora-the-infinite/` | Route-preview and launch/flightplan gateway. | Short planning loop. | Preview, preflight, flightplan, launch cues. | No changed-runtime old CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival/foraging loop. | Short wave loop. | Move, collect, gear, boss omen, safe harvest. | No changed-runtime old CDN. | Yes. |
| `experiments/tropical-island-scene/` | Tropical island lagoon scene. | Passive/short exploration. | Orbit, fish, coconuts, reef, beachcomber, lagoon cues. | Legacy local ProtoKit import-map remains for old stack. | Yes for new overlays. |
| `games/signal-bastion/` | Tower-defense wave game. | 30-wave game. | Place/upgrade towers, waves, leak risk, reserves. | No changed-runtime old CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Rogue-lite survival siege. | Medium survival/extraction loop. | Harvest, craft, build, defend, extract. | No changed-runtime old CDN. | Yes. |

## Domain ASCII tree

```txt
third-person-camera-composition-readability-domain
├─ focus-framing-domain
│  ├─ focus-target-domain
│  │  └─ third-person-focus-target-ribbon-kit
│  └─ near-clip-domain
│     └─ third-person-near-clip-cushion-kit
├─ camera-clearance-domain
│  ├─ shoulder-clearance-domain
│  │  └─ third-person-shoulder-clearance-wedge-kit
│  └─ occlusion-risk-domain
│     └─ third-person-occlusion-risk-veil-kit
├─ orbit-comfort-domain
│  ├─ orbit-intent-domain
│  │  └─ third-person-orbit-intent-rail-kit
│  └─ camera-comfort-domain
│     └─ third-person-camera-comfort-meter-kit
└─ renderer-handoff
   └─ third-person-camera-composition-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
third-person-focus-target-ribbon-kit
third-person-shoulder-clearance-wedge-kit
third-person-near-clip-cushion-kit
third-person-orbit-intent-rail-kit
third-person-occlusion-risk-veil-kit
third-person-camera-comfort-meter-kit
third-person-camera-composition-renderer-handoff-kit
third-person-camera-composition-readability-domain-kit
```

Changed:

```txt
third-person-follow-through-domain metadata
arena-fractal-entry composed renderer handoff
third-person arena CDN smoke
third-person locomotion CDN smoke
```

The new kits accept plain controller/camera snapshots and produce plain serializable descriptor output. They do not import NexusEngine, NexusRealtime, Three.js, WebGL, DOM, browser input, audio, assets, or frame-loop ownership.

## Files changed

```txt
experiments/ThirdPersonFollowThrough/kits/third-person-camera-composition-readability-domain-kit.js
experiments/ThirdPersonFollowThrough/domain/third-person-follow-through-domain.js
experiments/ThirdPersonFollowThrough/app/arena-fractal-entry.js
experiments/ThirdPersonFollowThrough/app/index.js
experiments/ThirdPersonFollowThrough/index.html
tests/third-person-camera-composition-readability-kits-smoke.mjs
tests/third-person-camera-composition-readability-cdn-state-input-smoke.mjs
tests/third-person-locomotion-readability-cdn-state-input-smoke.mjs
tests/third-person-arena-cdn-state-input-smoke.mjs
scripts/run-checks.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-0802-third-person-camera-composition-upgrade.md
```

## Tests added

```txt
tests/third-person-camera-composition-readability-kits-smoke.mjs
tests/third-person-camera-composition-readability-cdn-state-input-smoke.mjs
```

The kit smoke contains 10 intake cases and checks:

```txt
focus target ribbons
shoulder clearance wedges
near clip cushions
orbit intent rails
occlusion risk veils
camera comfort meters
renderer handoff counts
serializable descriptor boundaries
renderer-neutral source ownership
```

The CDN/state/input smoke contains 10 simulated state/input surfaces and checks:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in the changed route
route shell cache bust
GameHost.getCameraCompositionReadability exposure
GameHost.getRendererHandoff composition
DOM overlay descriptor consumption hooks
renderer-neutral kit ownership
```

Existing Third Person arena and locomotion CDN smokes were refreshed to accept the new cache-busted composed wrapper while continuing to guard the prior arena/locomotion handoffs.

## Validation results

- Added 10-case kit smoke coverage for the new camera composition readability domain.
- Added 10-case CDN/state/input coverage for the changed route shell, host, and descriptor handoff.
- Refreshed existing arena and locomotion CDN/state smokes after the route cache-bust changed from locomotion-only to camera-composition composition.
- Wired both new tests into `npm run check` and `npm run check:deploy` through `scripts/run-checks.mjs`.
- Connector-only run did not execute a local shell test runner. The intended validation commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/ThirdPersonFollowThrough/app/arena-fractal-entry.js` imports NexusEngine main via:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The changed wrapper does not import:

```txt
LuminaryLabs-Dev/NexusRealtime@main/src/index.js
```

- The new reusable kit file does not import NexusRealtime, NexusEngine, DOM, Three.js, WebGL, audio, asset loading, or frame-loop systems.

## Cleanup pass

- Avoided adding a version-suffixed route.
- Kept camera composition logic in a renderer-neutral kit file.
- Kept DOM overlay rendering inside `arena-fractal-entry.js` only.
- Preserved arena fractal and locomotion readability outputs.
- Composed arena, locomotion, and camera composition handoffs through `GameHost.getRendererHandoff()`.
- Updated route shell cache busts and refreshed older smoke expectations to prevent stale test drift.
- Updated the canonical manifest instead of creating duplicate route metadata.

## Non-game handling

`ThirdPersonFollowThrough` is a small experience-driven web experiment and diagnostic sandbox, not a complete game. It was not deleted, renamed, or destructively refactored. The route is trying to prove third-person camera/controller behavior in a simple graybox arena. This run preserved that proof and added a camera-composition readability layer that makes camera framing and obstruction decisions visible.

## Next safe ledge

Add a deterministic Third Person controller replay fixture that records actor position, root yaw, orbit offset, camera position, collision proximity, and composed renderer-handoff descriptor hashes across arena, locomotion, and camera composition domains for 120 fixed input ticks.
