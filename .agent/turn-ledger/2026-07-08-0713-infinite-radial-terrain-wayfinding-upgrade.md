# Infinite Radial Terrain Wayfinding Readability Upgrade

## Summary

- Chosen experiment: `experiments/infinite-radial-terrain/`
- Upgrade: added a renderer-neutral terrain wayfinding readability domain and a descriptor-only overlay.
- Last upgraded experiment avoided: `experiments/vr-platformer-board/`
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main`

## Why this experiment was chosen

The last completed upgrade was `vr-platformer-board`, so this run selected a different route. `infinite-radial-terrain` already had terrain rendering, radial LOD, visual descriptors, and expedition descriptors, but it was still closer to a flying terrain inspection sandbox than a clear micro-experience. The missing layer was wayfinding: the route had survey and safety cues, but did not explicitly tell the player where to point, what horizon feature mattered, what slope path was safer, where biome transition value was, how to return, or when drift/clearance was becoming risky.

## Last upgraded experiment

```txt
experiments/vr-platformer-board/
```

Latest prior commit marker:

```txt
512bc3f8b74a5cac1e30ea1895a8e23f8db39957 Log VR board objective readability upgrade
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller and locomotion debug sandbox. | Short sandbox, continuous. | WASD, spring camera, jump/backpedal/yaw readability. | No changed-runtime old CDN. | Yes. |
| `experiments/peer-scene-transition/` | Scene transition and puzzle decision demo. | Short puzzle loop. | Scene actions, exits, inventory, gates, decision cues. | No changed-runtime old CDN. | Yes. |
| `apps/the-cavalry-of-rome/` | Strategy/campaign map prototype. | Medium campaign loop. | World actions, scouting, reinforcement, objectives. | No changed-runtime old CDN. | Yes. |
| `experiments/vr-platformer-board/` | Flat board platformer with VR-style comfort constraints. | Short platformer loop. | Move, jump, coins, hazards, exit, route risk. | No changed-runtime old CDN. | Yes. |
| `experiments/next-ledge/` | Grapple/swing traversal experiment. | Short traversal loop. | Grapple, swing, cargo, fall pressure. | No changed-runtime old CDN. | Yes. |
| `experiments/infinite-radial-terrain/` | Radial terrain flight and survey route. | Continuous flight sandbox. | WASD flight, terrain LOD, survey, altitude, route tasks. | No changed-runtime old CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow scene. | Passive/short exploration. | Grass, flowers, sheep, ecology route cues. | No changed-runtime old CDN. | Yes. |
| `experiments/fogline-relay/` | Fogline relay scan loop. | Short relay loop. | Move, scan, relays, wraith pressure, retreat. | No changed-runtime old CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person survival/build signal-island prototype. | Medium objective loop. | Harvest, build, cargo, pressure, beacon. | No changed-runtime old CDN. | Yes. |
| `experiments/sora-the-infinite/` | Route-preview and launch/flightplan gateway. | Short planning loop. | Preview, preflight, flightplan, launch cues. | No changed-runtime old CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival/foraging loop. | Short wave loop. | Move, collect, gear, boss omen, safe harvest. | No changed-runtime old CDN. | Yes. |
| `experiments/tropical-island-scene/` | Tropical island lagoon scene. | Passive/short exploration. | Orbit, fish, coconuts, reef, beachcomber, lagoon cues. | Legacy local ProtoKit import-map remains for old stack. | Yes for new overlays. |
| `games/signal-bastion/` | Tower-defense wave game. | 30-wave game. | Place/upgrade towers, waves, leak risk, reserves. | No changed-runtime old CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Rogue-lite survival siege. | Medium survival/extraction loop. | Harvest, craft, build, defend, extract. | No changed-runtime old CDN. | Yes. |

## Domain ASCII tree

```txt
terrain-wayfinding-readability-domain
├─ heading-intent-domain
│  ├─ bearing-needle-domain
│  │  └─ terrain-bearing-needle-kit
│  └─ horizon-landmark-domain
│     └─ terrain-horizon-landmark-kit
├─ route-comparison-domain
│  ├─ slope-choice-domain
│  │  └─ terrain-slope-choice-ribbon-kit
│  └─ biome-transition-domain
│     └─ terrain-biome-transition-gate-kit
├─ return-safety-domain
│  ├─ origin-return-domain
│  │  └─ terrain-origin-return-anchor-kit
│  └─ stamina-drift-domain
│     └─ terrain-stamina-drift-meter-kit
└─ renderer-handoff
   └─ terrain-wayfinding-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
terrain-bearing-needle-kit
terrain-horizon-landmark-kit
terrain-slope-choice-ribbon-kit
terrain-biome-transition-gate-kit
terrain-origin-return-anchor-kit
terrain-stamina-drift-meter-kit
terrain-wayfinding-renderer-handoff-kit
terrain-wayfinding-readability-domain-kit
```

The new kits accept plain terrain/camera/sample/visual input and produce plain serializable descriptor output. They do not import NexusEngine, NexusRealtime, Three.js, WebGL, DOM, browser input, audio, assets, or frame-loop ownership.

## Files changed

```txt
experiments/_kits/infinite-radial-terrain/terrain-wayfinding-readability-kits.js
experiments/infinite-radial-terrain/terrain-wayfinding-readability-entry.js
experiments/infinite-radial-terrain/index.html
tests/infinite-radial-terrain-wayfinding-readability-kits-smoke.mjs
tests/infinite-radial-terrain-wayfinding-cdn-state-input-smoke.mjs
scripts/run-checks.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-0713-infinite-radial-terrain-wayfinding-upgrade.md
```

## Tests added

```txt
tests/infinite-radial-terrain-wayfinding-readability-kits-smoke.mjs
tests/infinite-radial-terrain-wayfinding-cdn-state-input-smoke.mjs
```

The kit smoke contains 10 intake cases and checks:

```txt
bearing needles
horizon landmarks
slope choice ribbons
biome transition gates
origin return anchors
stamina drift meters
renderer handoff counts
serializable descriptor boundaries
```

The CDN/state-input smoke contains 10 simulated state/input cases and checks:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in the changed entry
route shell cache bust
GameHost.getWayfindingReadability exposure
GameHost.getRendererHandoff composition
renderer-neutral kit ownership
```

## Validation results

- Added 10-case kit smoke coverage for the new wayfinding domain.
- Added 10-case CDN/state/input coverage for the changed route entry.
- Wired both new tests into `npm run check` and `npm run check:deploy` through `scripts/run-checks.mjs`.
- Connector-only run did not execute a local shell test runner. The intended validation commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `terrain-wayfinding-readability-entry.js` imports NexusEngine main via:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The new changed entry does not import:

```txt
LuminaryLabs-Dev/NexusRealtime@main/src/index.js
```

- The new reusable kit file does not import NexusRealtime, NexusEngine, DOM, Three.js, WebGL, audio, asset loading, or frame-loop systems.

## Cleanup pass

- Avoided adding a version-suffixed route.
- Kept reusable logic in `_kits`.
- Kept the new overlay as a renderer/host adapter that consumes descriptors only.
- Preserved the existing terrain flight route and existing expedition readability handoff.
- Added the new route shell as an additive script after the existing route boot.
- Updated the canonical manifest rather than creating duplicate route metadata.

## Non-game handling

`infinite-radial-terrain` is a small experience-driven web experiment, not a complete game. It was not deleted, renamed, or destructively refactored. The route is trying to prove radial terrain LOD plus terrain descriptors. This run preserved that proof and added a clearer route-planning layer.

## Next safe ledge

Promote the synthetic wayfinding sample cloud into a shared terrain-sample-ring domain so the route can provide actual sampled terrain around the camera to visual, expedition, and wayfinding kits from one deterministic descriptor source.
