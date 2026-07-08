# Tropical Island lagoon visual fractal upgrade

## Summary

- Chosen experiment: `experiments/tropical-island-scene/`.
- Last upgraded experiment avoided: `experiments/ThirdPersonFollowThrough/`.
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main` only.
- Branches: no new branch created.

## Why this experiment was chosen

`experiments/tropical-island-scene/` was selected because it still behaved more like a short open-ended WebGL scene than a small game loop. It already had a useful island/water/palm/coconut composition, but most of the visual variety was fused into the shader and one local runtime file. This pass keeps the existing scene intact and adds a renderer-neutral lagoon visual-fractal domain so reef blooms, current ribbons, shelf bands, cloud banks, palm motion, and wake trails are generated as testable descriptors before the shader consumes them.

## Last upgraded experiment

The previous completed upgrade sequence was `ThirdPersonFollowThrough`, ending with the third-person arena-fractal ledger. This run avoided that route and selected `tropical-island-scene`.

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
| `tropical-island-scene` | Open-ended WebGL island scene upgraded with lagoon visual-fractal descriptors | open-ended | drag orbit, wheel zoom, falling coconuts, fish, floats, reef/current/shelf/cloud/wake descriptors | changed runtime keeps old ProtoKits import-map; no old NexusRealtime runtime CDN | yes |

## Domain ASCII tree

```txt
tropical-lagoon-visual-fractal-domain
├─ lagoon-bathymetry-domain
│  ├─ shallow-shelf-domain
│  │  └─ lagoon-depth-shelf-kit
│  └─ reef-color-domain
│     └─ reef-bloom-cluster-kit
├─ water-readability-domain
│  ├─ current-flow-domain
│  │  └─ current-ribbon-field-kit
│  └─ wildlife-wake-domain
│     ├─ fish-wake-domain
│     │  └─ wildlife-wake-trail-kit
│     └─ float-prop-wake-domain
│        └─ wildlife-wake-trail-kit
├─ island-atmosphere-domain
│  ├─ canopy-motion-domain
│  │  └─ palm-canopy-motion-kit
│  └─ horizon-cloud-domain
│     └─ horizon-cloud-bank-kit
└─ renderer-handoff
   └─ tropical-lagoon-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `lagoon-depth-shelf-kit`
- `reef-bloom-cluster-kit`
- `current-ribbon-field-kit`
- `palm-canopy-motion-kit`
- `horizon-cloud-bank-kit`
- `wildlife-wake-trail-kit`
- `tropical-lagoon-renderer-handoff-kit`
- `tropical-lagoon-visual-fractal-domain-kit`

These kits accept plain scene state, time, orbit, fish, coconut, float, and water inputs. They emit serializable descriptors and do not own DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop timing.

## Files changed

Added:

- `experiments/tropical-island-scene/src/tropical-lagoon-visual-fractal-domain-kit.js`
- `tests/tropical-lagoon-visual-fractal-kits-smoke.mjs`
- `tests/tropical-lagoon-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-08-0045-tropical-island-lagoon-fractal-upgrade.md`

Changed:

- `experiments/tropical-island-scene/src/main.js`
- `experiments/tropical-island-scene/index.html`
- `experiments/domain-kit-cutover-manifest.json`
- `scripts/run-checks.mjs`

## Tests added

- `tests/tropical-lagoon-visual-fractal-kits-smoke.mjs`
  - 10 intake cases.
  - Checks shelf bands, reef blooms, current ribbons, canopy descriptors, cloud banks, wake trails, renderer handoff, serializability, and descriptor ownership boundaries.

- `tests/tropical-lagoon-cdn-state-input-smoke.mjs`
  - 10 state/input coverage tokens.
  - Checks NexusEngine main CDN import, old NexusRealtime runtime CDN absence, cache-busted route entry, `GameHost` state export, visual-fractal state, renderer handoff, shader descriptor uniforms, and reusable kit ownership boundaries.

Both tests are wired into `scripts/run-checks.mjs` for full and deploy validation.

## Validation results

Static connector validation completed by refetching changed route files, new kit, tests, manifest, and check runner after the writes.

Runtime shell validation was not executed in this connector-only run. The wired commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- Changed runtime imports NexusEngine main CDN:
  - `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`
- Changed runtime does not include the old `LuminaryLabs-Dev/NexusRealtime` runtime string.
- Existing `NexusRealtime-ProtoKits@0.0.2` import-map entries were preserved because this route still depends on local mapped ProtoKit compatibility surfaces for island, palm, coconut, fish, float, camera, cel, outline, reflection, fluid, and water domains.
- The new visual-fractal kits are local to the Experiments repo and emit descriptors only.

## Cleanup pass

- Kept reusable lagoon descriptor generation out of the WebGL shader and DOM/event code.
- Kept browser input and frame-loop ownership in `main.js`.
- Moved lagoon shelf/reef/current/cloud/wake/canopy variation into atomic kit descriptors.
- Added one composite domain kit that composes smaller kits without taking ownership of their internals.
- Preserved the old scene behavior, local import-map compatibility, WebGL2 render path, Sobel outline requirement, reflective water, fish, floats, falling coconuts, and minimal HUD.

## Non-game route handling

This route is not yet a small experience-driven web game; it is closer to an interactive scene. It was not deleted or renamed because it is a useful WebGL/procedural-water testbed. The lesson recorded here is that scene routes should either gain a small objective loop later or become clearly labeled visual labs. Useful functionality was preserved and expanded through descriptors rather than removed.

## Next safe ledge

Add a small objective loop without increasing UI: collect three fallen coconuts by steering a small raft through current ribbons, with reef shelves as readability lanes and the existing fish/wake descriptors acting as navigational motion cues.
