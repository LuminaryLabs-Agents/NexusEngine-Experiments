# Third Person arena fractal upgrade

## Summary

- Chosen experiment: `experiments/ThirdPersonFollowThrough/`.
- Last upgraded experiment avoided: `experiments/nexus-frontier-signal-isles/`.
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main` only.
- Branches: no new branch created.

## Why this experiment was chosen

`experiments/ThirdPersonFollowThrough/` was selected because the controller math and debug rays were useful, but the route still looked like a graybox diagnostic scene. It had low visual variability compared with the richer scene, terrain, orchard, meadow, and Signal Isles routes. This pass kept the controller runtime intact and added a renderer-neutral arena-fractal descriptor domain that makes camera handoff, movement basis, collision proximity, rig metrics, and training cues visible without moving control logic into presentation code.

## Last upgraded experiment

Recent commits showed the previous completed upgrade sequence was `nexus-frontier-signal-isles`, ending with `Refresh Signal Isles ledger after route copy cleanup`. This run explicitly avoided `nexus-frontier-signal-isles` and picked a different route.

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `ThirdPersonFollowThrough` | Third-person controller/camera diagnostic arena upgraded with arena-fractal overlays | open-ended | WASD movement, S backpedal, Space jump, R reset, V debug, mouse/arrow camera, collider probes, arena descriptor overlay | no changed-runtime old import observed | yes |
| `peer-scene-transition` | Multi-scene HTML transition/puzzle route | 3-6 min | actions, inventory gates, scene exits, debug state | no changed-runtime old import observed | yes |
| `vr-platformer-board` | Spatial board platformer/XR facade | 2-4 min | A/D movement, jump, reset, head-pose drag, board descriptors | no changed-runtime old import observed | yes |
| `next-ledge` | Grapple/climb extraction route | 2-5 min | click/Space grapple, A/D swing, reset, sector advance, cargo handoff | no changed-runtime old import observed | yes |
| `infinite-radial-terrain` | Infinite radial terrain browser flight/debug scene | open-ended | WASD/QE camera, radial LOD, terrain descriptor overlays | no changed-runtime old import observed | yes |
| `high-fidelity-meadow` | Procedural meadow visual scene | open-ended | orbit camera, camera beat advance, wind seed advance, meadow visual descriptors | no changed-runtime old import observed | yes |
| `fogline-relay` | First-person fog relay scan route | 3-6 min | movement/look, hold scan, relays, pressure, hazards | no changed-runtime old import observed | yes |
| `nexus-frontier-signal-isles` | Kit utilization survival/island route upgraded with visual-fractal handoff | 5-10 min | movement/look, scan, harvest, build, survive, beacon activation, signal descriptor flow | changed runtime imports NexusEngine main CDN | yes |
| `sora-the-infinite` | Legacy Sora compatibility gateway | 30-90 sec before handoff | W/Space lift, A/D or pointer bank, readiness, launch handoff | no changed-runtime old import observed | yes |
| `zombie-orchard` | Survival orchard route | 3-6 min | move/sprint/dodge, collect, gear, waves, combat cues | no changed-runtime old import observed | yes |

## Domain ASCII tree

```txt
third-person-follow-through-arena-fractal-domain
├─ arena-readability-domain
│  ├─ surface-band-domain
│  │  └─ third-person-arena-surface-band-kit
│  └─ collision-readability-domain
│     ├─ collider-proximity-domain
│     │  └─ third-person-collider-proximity-halo-kit
│     └─ training-cue-domain
│        └─ third-person-training-cue-kit
├─ controller-debug-domain
│  ├─ movement-basis-domain
│  │  └─ third-person-movement-basis-trail-kit
│  └─ camera-handoff-domain
│     ├─ orbit-threshold-domain
│     │  └─ third-person-camera-handoff-arc-kit
│     └─ root-yaw-domain
│        └─ third-person-camera-handoff-arc-kit
├─ rig-readability-domain
│  └─ metric-spine-domain
│     └─ third-person-rig-metric-spine-kit
└─ renderer-handoff
   └─ third-person-arena-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `third-person-arena-surface-band-kit`
- `third-person-movement-basis-trail-kit`
- `third-person-camera-handoff-arc-kit`
- `third-person-collider-proximity-halo-kit`
- `third-person-rig-metric-spine-kit`
- `third-person-training-cue-kit`
- `third-person-arena-renderer-handoff-kit`
- `third-person-arena-fractal-domain-kit`

Changed:

- `third-person-follow-through-domain` now records arena-fractal renderer handoff ownership and the new kit.

These kits accept plain controller snapshot inputs and emit serializable descriptors. They do not own DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop timing.

## Files changed

Added:

- `experiments/ThirdPersonFollowThrough/kits/third-person-arena-fractal-domain-kit.js`
- `experiments/ThirdPersonFollowThrough/app/arena-fractal-entry.js`
- `tests/third-person-arena-fractal-kits-smoke.mjs`
- `tests/third-person-arena-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-08-0030-third-person-arena-fractal-upgrade.md`

Changed:

- `experiments/ThirdPersonFollowThrough/app/index.js`
- `experiments/ThirdPersonFollowThrough/index.html`
- `experiments/ThirdPersonFollowThrough/domain/third-person-follow-through-domain.js`
- `experiments/domain-kit-cutover-manifest.json`
- `scripts/run-checks.mjs`

## Tests added

- `tests/third-person-arena-fractal-kits-smoke.mjs`
  - 10 intake cases.
  - Checks surface bands, movement trails, camera handoff arcs, collider halos, rig metric spine descriptors, training cues, serializability, and renderer-neutral kit ownership.

- `tests/third-person-arena-cdn-state-input-smoke.mjs`
  - 10 state/input cases.
  - Checks route shell cache busting, arena wrapper import, NexusEngine main CDN import, old NexusRealtime runtime absence in the changed wrapper, `__thirdPersonArenaFractal` state export, and renderer handoff descriptors.

Both tests are wired into `scripts/run-checks.mjs` for full and deploy validation.

## Validation results

Static connector validation completed by refetching the changed route files, kit, tests, manifest, and check runner from GitHub after the writes.

Runtime shell validation was not executed in this connector-only run. The wired commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- Changed arena wrapper imports NexusEngine main CDN:
  - `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`
- Changed arena wrapper does not include the old `LuminaryLabs-Dev/NexusRealtime` runtime string.
- Existing base `app.js` already imports NexusEngine runtime modules from `LuminaryLabs-Dev/NexusEngine@main`.
- Package-level historical dependency names and legacy script names were not changed because this pass was route-specific.

## Cleanup pass

- Kept controller math in the existing third-person runtime.
- Added one renderer-neutral descriptor domain file instead of scattering reusable readability math through the DOM overlay.
- Added a small presentation-only wrapper that consumes descriptors and renders arena bands, movement footprints, handoff arcs, collider halos, rig beads, and cue chips.
- Preserved existing debug rays, state export, third-person follow kit, rigged actor kit, controls, colliders, and reset/debug interactions.

## Next safe ledge

Move the arena-fractal overlay from DOM presentation into optional Three.js instanced meshes so the same descriptor buckets can drive in-world rings, footprints, and handoff arcs while keeping descriptor generation in the kit file.
