# Signal Isles visual fractal upgrade

## Summary

- Chosen experiment: `experiments/nexus-frontier-signal-isles/`.
- Last upgraded experiment avoided: `experiments/sora-the-infinite/`.
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main` only.
- Branches: no new branch created.

## Why this experiment was chosen

`experiments/nexus-frontier-signal-isles/` was the oldest canonical experiment still marked as a kit-utilization showcase without a route-specific visual-fractal handoff. It already had strong gameplay systems, but its presentation layer still owned most of the island readability: route flow, build readiness, resource shimmer, pressure state, and objective direction were mostly implied by object placement. This pass made those surfaces explicit through small renderer-neutral descriptor kits while preserving the existing survival/island loop.

## Last upgraded experiment

Recent commits showed the previous completed upgrade sequence was `sora-the-infinite`, ending in `Log Sora compatibility gateway upgrade`. This run explicitly avoided `sora-the-infinite` and picked a different route.

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `peer-scene-transition` | Multi-scene HTML transition/puzzle route | 3-6 min | actions, inventory gates, scene exits, debug state | no changed-runtime old import observed | yes |
| `vr-platformer-board` | Spatial board platformer/XR facade | 2-4 min | A/D movement, jump, reset, head-pose drag, board descriptors | no changed-runtime old import observed | yes |
| `next-ledge` | Grapple/climb extraction route | 2-5 min | click/Space grapple, A/D swing, reset, sector advance, cargo handoff | no changed-runtime old import observed | yes |
| `infinite-radial-terrain` | Infinite radial terrain browser flight/debug scene | open-ended | WASD/QE camera, radial LOD, terrain descriptor overlays | no changed-runtime old import observed | yes |
| `high-fidelity-meadow` | Procedural meadow visual scene | open-ended | orbit camera, camera beat advance, wind seed advance, meadow visual descriptors | no changed-runtime old import observed | yes |
| `fogline-relay` | First-person fog relay scan route | 3-6 min | movement/look, hold scan, relays, pressure, hazards | no changed-runtime old import observed | yes |
| `nexus-frontier-signal-isles` | Kit utilization survival/island route upgraded with visual-fractal handoff | 5-10 min | movement/look, scan, harvest, build, survive, beacon activation, descriptor-driven signal flow | changed runtime imports NexusEngine main CDN | yes |
| `sora-the-infinite` | Legacy Sora compatibility gateway | 30-90 sec before handoff | W/Space lift, A/D or pointer bank, readiness, launch handoff | no changed-runtime old import observed | yes |
| `zombie-orchard` | Survival orchard route | 3-6 min | move/sprint/dodge, collect, gear, waves, combat cues | no changed-runtime old import observed | yes |

## Domain ASCII tree

```txt
signal-isles-visual-fractal-domain
├─ island-surface-domain
│  ├─ biome-relief-domain
│  │  └─ signal-isles-island-relief-cell-kit
│  └─ shoreline-falloff-domain
│     └─ signal-isles-island-relief-cell-kit
├─ signal-route-domain
│  ├─ ruin-thread-domain
│  │  └─ signal-isles-signal-flow-thread-kit
│  ├─ objective-compass-domain
│  │  └─ signal-isles-objective-beacon-compass-kit
│  └─ beacon-flow-domain
│     └─ signal-isles-signal-flow-thread-kit
├─ pressure-ecology-domain
│  ├─ pressure-front-domain
│  │  └─ signal-isles-hazard-pressure-front-kit
│  └─ shard-spark-domain
│     └─ signal-isles-resource-shard-cluster-kit
├─ build-readiness-domain
│  └─ signal-isles-build-ghost-readout-kit
└─ renderer-handoff
   └─ signal-isles-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `signal-isles-island-relief-cell-kit`
- `signal-isles-signal-flow-thread-kit`
- `signal-isles-hazard-pressure-front-kit`
- `signal-isles-resource-shard-cluster-kit`
- `signal-isles-build-ghost-readout-kit`
- `signal-isles-objective-beacon-compass-kit`
- `signal-isles-renderer-handoff-kit`
- `signal-isles-visual-fractal-domain-kit`

These kits accept plain level, preset, session, objective, sequence, and kit-state inputs and emit serializable descriptors. They do not own DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop timing.

## Files changed

Added:

- `experiments/_kits/nexus-frontier-signal-isles/signal-isles-visual-fractal-domain-kits.js`
- `tests/signal-isles-visual-fractal-kits-smoke.mjs`
- `tests/signal-isles-playwright-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-08-0014-signal-isles-visual-fractal-upgrade.md`

Changed:

- `experiments/nexus-frontier-signal-isles/index.html`
- `experiments/nexus-frontier-signal-isles/src/game-composition.js`
- `experiments/nexus-frontier-signal-isles/src/renderer.js`
- `experiments/nexus-frontier-signal-isles/src/main.js`
- `experiments/nexus-frontier-signal-isles/src/debug-host.js`
- `experiments/domain-kit-cutover-manifest.json`
- `scripts/run-checks.mjs`

## Tests added

- `tests/signal-isles-visual-fractal-kits-smoke.mjs`
  - 10 intake cases.
  - Checks island relief cells, signal flow threads, pressure fronts, resource/cargo shard sparks, build ghost readouts, objective compass descriptors, serializability, and renderer-neutral ownership.

- `tests/signal-isles-playwright-state-input-smoke.mjs`
  - 10 state/input cases.
  - Checks the route HTML entry, NexusEngine main CDN import, old NexusRealtime main CDN absence in the changed runtime, composition visual state, GameHost visual state exposure, input movement effects, and renderer descriptor consumption.

Both tests are wired into `scripts/run-checks.mjs` for full and deploy validation.

## Validation results

Static connector validation completed by refetching the changed runtime, kit, tests, manifest, and check runner from GitHub after the writes.

Runtime shell validation was not executed in this connector-only run. The wired commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- Changed route runtime imports NexusEngine main CDN:
  - `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`
- Changed route runtime does not include the old NexusRealtime main CDN string.
- Route copy in `index.html` now says Nexus Engine instead of NexusRealtime.
- `game-composition.js` retains historical static audit marker text for old kit names, but the changed browser entrypoint is now a NexusEngine main CDN route.
- Package-level historical names and legacy scripts were not changed because this pass was route-specific.

## Cleanup pass

- Kept gameplay truth inside `game-composition.js`, not the renderer.
- Added one visual-fractal domain kit file instead of scattering reusable descriptor logic through the Three.js presentation layer.
- Added `getVisualFractalState()` to `GameHost` for state export.
- Renderer now consumes descriptor buckets for relief cells, signal threads, pressure rings, build ghosts, resource sparks, and compass flow.
- Preserved existing first-person controls, objective loop, replay digest, and static/data/replay tests.

## Next safe ledge

Add a deterministic Signal Isles replay fixture that walks every objective, snapshots `visualFractal.rendererHandoff.counts` after each fact, and fails if visual descriptors stop matching scan/build/pressure/gate/cargo progression.
