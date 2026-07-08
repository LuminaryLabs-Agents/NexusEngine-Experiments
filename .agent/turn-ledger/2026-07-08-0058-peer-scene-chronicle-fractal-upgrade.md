# Peer Scene Transition chronicle fractal upgrade

## Summary

- Chosen experiment: `experiments/peer-scene-transition/`.
- Last upgraded experiment avoided: `experiments/tropical-island-scene/`.
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main` only.
- Branches: no new branch created.

## Why this experiment was chosen

`experiments/peer-scene-transition/` was selected because it still has one of the shortest and least spatially varied loops in the experiment set: it is a multi-page HTML scene/puzzle route with button actions, state ledgers, and gate checks. It already had base scene descriptors plus atmospheric descriptors, but it still lacked a stronger small-game chronicle layer that makes objective progress, clues, inventory, pressure, continuity, and choice readability visible as independent descriptor domains. This pass keeps the page-based scene host intact and adds a new renderer-neutral chronicle fractal domain that gives the route more authored progression feedback without moving puzzle logic into the renderer.

## Last upgraded experiment

Recent commits showed the previous completed upgrade sequence was `tropical-island-scene`, ending with `Log tropical lagoon visual fractal upgrade`. This run avoided `tropical-island-scene` and picked a different route.

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `ThirdPersonFollowThrough` | Third-person controller/camera diagnostic arena upgraded with arena-fractal overlays | open-ended | WASD movement, S backpedal, Space jump, R reset, V debug, mouse/arrow camera, collider probes, arena descriptor overlay | no changed-runtime old import observed | yes |
| `peer-scene-transition` | Multi-scene HTML scene/puzzle route upgraded with base, atmospheric, and chronicle descriptor handoffs | 3-6 min | actions, inventory gates, scene exits, pressure, objective beats, clues, continuity splices, debug state | no changed-runtime old import observed | yes |
| `vr-platformer-board` | Spatial board platformer/XR facade | 2-4 min | A/D movement, jump, reset, head-pose drag, board descriptors | no changed-runtime old import observed | yes |
| `next-ledge` | Grapple/climb extraction route | 2-5 min | click/Space grapple, A/D swing, reset, sector advance, cargo handoff | no changed-runtime old import observed | yes |
| `infinite-radial-terrain` | Infinite radial terrain browser flight/debug scene | open-ended | WASD/QE camera, radial LOD, terrain descriptor overlays | no changed-runtime old import observed | yes |
| `high-fidelity-meadow` | Procedural meadow visual scene | open-ended | orbit camera, camera beat advance, wind seed advance, meadow visual descriptors | no changed-runtime old import observed | yes |
| `fogline-relay` | First-person fog relay scan route | 3-6 min | movement/look, hold scan, relays, pressure, hazards | no changed-runtime old import observed | yes |
| `nexus-frontier-signal-isles` | Kit utilization survival/island route upgraded with visual-fractal handoff | 5-10 min | movement/look, scan, harvest, build, survive, beacon activation, signal descriptor flow | changed runtime imports NexusEngine main CDN | yes |
| `sora-the-infinite` | Legacy Sora compatibility gateway | 30-90 sec before handoff | W/Space lift, A/D or pointer bank, readiness, launch handoff | no changed-runtime old import observed | yes |
| `zombie-orchard` | Survival orchard route | 3-6 min | move/sprint/dodge, collect, gear, waves, combat cues | no changed-runtime old import observed | yes |
| `tropical-island-scene` | Open-ended WebGL island scene upgraded with lagoon visual-fractal descriptors | open-ended | drag orbit, wheel zoom, falling coconuts, fish, floats, reef/current/shelf/cloud/wake descriptors | changed runtime keeps old ProtoKits import-map; no old NexusRealtime runtime CDN | yes |

## Domain ASCII tree

```txt
peer-scene-chronicle-domain
├─ objective-readability-domain
│  ├─ route-objective-domain
│  │  └─ scene-objective-beat-kit
│  └─ choice-domain
│     └─ scene-choice-readability-kit
├─ clue-and-pressure-domain
│  ├─ clue-thread-domain
│  │  └─ scene-clue-thread-kit
│  └─ pressure-weather-domain
│     └─ scene-pressure-weather-kit
├─ continuity-memory-domain
│  ├─ inventory-memory-domain
│  │  └─ scene-inventory-constellation-kit
│  └─ scene-continuity-domain
│     └─ scene-continuity-splice-kit
└─ renderer-handoff
   └─ scene-chronicle-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `scene-objective-beat-kit`
- `scene-clue-thread-kit`
- `scene-inventory-constellation-kit`
- `scene-pressure-weather-kit`
- `scene-continuity-splice-kit`
- `scene-choice-readability-kit`
- `scene-chronicle-renderer-handoff-kit`
- `scene-chronicle-domain-kit`

Changed:

- `peer-scene-transition` runtime now composes base scene, atmospheric, and chronicle descriptors into one renderer handoff.
- `GameHost` now exposes `getChronicleDomain()` and renderer handoff counts for objective/clue/inventory/pressure/continuity/choice descriptors.

All new kits accept plain manifest, scene id, state, inventory, pressure, and action inputs. They produce serializable descriptors and do not own renderer implementation, DOM insertion, browser input, Three.js, WebGL, audio, asset loading, or frame-loop timing.

## Files changed

Added:

- `experiments/_kits/peer-scene-transition/peer-scene-chronicle-handoff-kits.js`
- `tests/peer-scene-transition-chronicle-handoff-smoke.mjs`
- `tests/peer-scene-transition-chronicle-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-08-0058-peer-scene-chronicle-fractal-upgrade.md`

Changed:

- `experiments/peer-scene-transition/shared/scene-demo.js`
- `experiments/domain-kit-cutover-manifest.json`
- `scripts/run-checks.mjs`

## Tests added

- `tests/peer-scene-transition-chronicle-handoff-smoke.mjs`
  - 10 intake cases across each new kit surface.
  - Covers objective beats, clue threads, inventory constellation, pressure weather, continuity splices, choice readability, renderer handoff, and the composite chronicle domain.
  - Checks descriptor counts, serializability-friendly shapes, and renderer-neutral ownership boundaries.

- `tests/peer-scene-transition-chronicle-cdn-state-input-smoke.mjs`
  - 10 route/state/input coverage tokens.
  - Checks NexusEngine main CDN import, old NexusRealtime CDN absence, chronicle runtime import, storage key bump, `GameHost`, `getChronicleDomain`, renderer handoff exposure, and kit ownership boundaries.

Both tests are wired into `scripts/run-checks.mjs` for full and deploy validation.

## Validation results

Static connector validation completed by refetching changed files after the writes:

- new chronicle kit file
- changed `scene-demo.js`
- new smoke tests
- updated `scripts/run-checks.mjs`
- updated `experiments/domain-kit-cutover-manifest.json`
- this ledger entry

Runtime shell validation was not executed in this connector-only run. The wired commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- Changed runtime imports NexusEngine main CDN:
  - `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`
- Changed runtime does not include the old `LuminaryLabs-Dev/NexusRealtime` runtime string.
- The route still uses local Experiments repo peer-scene kits for scene state/action/transition/visual descriptors.
- No changed file imported old `NexusRealtime` as a runtime CDN.

## Cleanup pass

- Kept scene state, inventory truth, route solving, action eligibility, and pressure scoring in kits/state logic.
- Kept browser input, page navigation, DOM insertion, and visual placement in the route host.
- Added a composite chronicle domain that composes smaller kits without owning their internals.
- Avoided replacing the existing atmospheric pass; the chronicle pass is an additive domain layer consumed by the same visual stage.
- Preserved the existing scene pages, action buttons, route graph, state panel, debug panel, and storage-based continuity.

## Non-game route handling

This route is a small experience-driven web puzzle, not a full 3D game. It was not deleted, renamed, or collapsed because it is a useful canonical scene-host experiment for HTML scene transitions, route gates, and inventory-driven progression. The lesson recorded here is that simple HTML experiments still need domain fractalization; objective and clue readability should be first-class descriptor outputs rather than implicit button text.

## Next safe ledge

Turn the chronicle descriptors into an actual micro-objective layer: add a single hidden route score that rewards completing both forest and bridge before the shrine, then emit an ending variant descriptor without adding more UI panels.
