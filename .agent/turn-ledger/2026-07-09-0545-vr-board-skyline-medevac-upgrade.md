# VR Platformer Board skyline medevac upgrade

## Summary

Upgraded `experiments/vr-platformer-board/` with a new route-level skyline medevac rescue pass. The route now turns the fixed board-platformer proof into a more objective-driven rescue scenario with tether pylons, harness threads, crosswind ribbons, oxygen canisters, medevac pod staging, and an evacuation manifest.

## Chosen experiment

`experiments/vr-platformer-board/`

## Why it was chosen

The latest completed upgrade was `experiments/tropical-island-scene/`, so this run needed a different route. VR Platformer Board was selected because it is one of the smallest fixed-board experiences in the gallery: a short A/D + jump platformer with coins and hazards. It already had useful traversal/readability work, but the experience still benefited from a concrete objective layer and stronger procedural descriptor variation without moving renderer, DOM, input, or frame-loop logic into reusable kits.

## Last upgraded experiment

`experiments/tropical-island-scene/` from commit `1823594479b0d9d8597d6d3aa7877586a9bd453e` (`Log tropical coral restoration upgrade`).

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Scene transition / story route | 2-4 min | scene gates, inventory, chronicle/consequence/courier overlays | no current changed import noted | yes |
| `experiments/vr-platformer-board/` | Board-scale platformer, now routed to Skyline Medevac | 1-3 min | A/D movement, jump, oxygen pickup, hazards, tether/medevac overlays | no changed runtime import | yes |
| `experiments/infinite-radial-terrain/` | Radial terrain flight/survey | 2-5 min | camera flight, LOD rings, survey/shelter overlays | no changed import noted | yes |
| `experiments/high-fidelity-meadow/` | Meadow ecology route | 2-5 min | grass, flowers, sheep, ecology/rescue/irrigation overlays | no changed import noted | yes |
| `experiments/tiny-diffusion-lab/` | Tiny browser diffusion lab | 2-5 min | train/sample/checkpoint, sample clinic overlays | no changed import noted | yes |
| `experiments/living-agent-lab/` | Small ONNX/fallback market agent | 2-4 min | agent choice, trust restoration overlays | no changed import noted | yes |
| `experiments/fogline-relay/` | Fog relay FPS | 3-6 min | movement, scan, relays, rescue/repair/battery overlays | no changed import noted | yes |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer kit showcase | 4-8 min | harvest, build, mast, route/pressure/surge overlays | no changed import noted | yes |
| `apps/the-cavalry-of-rome/` | Rome campaign map | 3-6 min | map, actions, logistics/aqueduct overlays | no changed import noted | yes |
| `games/signal-bastion/` | Strategic tower-defense pressure route | 10-20 min | placement, waves, command/fractal/readiness overlays | no changed import noted | yes |
| `games/stonewake-depths/` | Flooded cavern puzzle rescue | 5-10 min | blocks, valves, rune gates, survivor extraction descriptors | no changed import noted | yes |
| `experiments/next-ledge/` | Grapple climb demo | 2-4 min | grapple, swing, cargo, traversal/readiness overlays | no changed import noted | yes |
| `experiments/sora-the-infinite/` | Aerial/open traversal gateway | 2-5 min | launch, flightplan, sky rescue/lighthouse/orchard overlays | no changed import noted | yes |
| `experiments/zombie-orchard/` | Survival orchard game | 3-6 min | movement, pickups, horde pressure, cure/evacuation/seed bank overlays | no changed import noted | yes |
| `games/rogue-lite-hellscape-siege/` | Base-defense rogue-lite route | 10-20 min | harvesting, inventory, build, core defense, caravan/refuge overlays | no changed import noted | yes |

## Domain ASCII tree

```txt
vr-board-skyline-medevac-readiness-domain
├─ tether-routing-domain
│  ├─ anchor-pylon-domain
│  │  └─ vr-board-anchor-pylon-kit
│  └─ harness-thread-domain
│     └─ vr-board-harness-thread-kit
├─ airborne-risk-domain
│  ├─ crosswind-ribbon-domain
│  │  └─ vr-board-crosswind-ribbon-kit
│  └─ oxygen-canister-domain
│     └─ vr-board-oxygen-canister-kit
├─ evacuation-handoff-domain
│  ├─ medevac-pod-domain
│  │  └─ vr-board-medevac-pod-kit
│  └─ evac-manifest-domain
│     └─ vr-board-evac-manifest-kit
└─ renderer-handoff
   └─ vr-board-skyline-medevac-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `vr-board-anchor-pylon-kit`
- `vr-board-harness-thread-kit`
- `vr-board-crosswind-ribbon-kit`
- `vr-board-oxygen-canister-kit`
- `vr-board-medevac-pod-kit`
- `vr-board-evac-manifest-kit`
- `vr-board-skyline-medevac-renderer-handoff-kit`
- `vr-board-skyline-medevac-readiness-domain-kit`

## Files changed

- `experiments/_kits/vr-platformer-board/vr-board-skyline-medevac-readiness-kits.js`
- `experiments/vr-platformer-board/skyline-medevac.html`
- `experiments/vr-platformer-board/skyline-medevac-readiness-entry.js`
- `experiments/_shared/nexus-gallery-data.js`
- `tests/vr-board-skyline-medevac-readiness-kits-smoke.mjs`
- `tests/vr-board-skyline-medevac-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-0545-vr-board-skyline-medevac-upgrade.md`

## Integration notes

The gallery card for `vr-platformer-board` now opens:

```txt
./experiments/vr-platformer-board/skyline-medevac.html
```

The route declares:

```txt
vr-board-skyline-medevac-readiness-renderer-handoff-pass
skyline-medevac-readiness-entry.js?v=vr-board-skyline-medevac-readiness-1
```

The entry imports NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

It exposes:

- `GameHost.getSkylineMedevacReadiness()`
- `GameHost.getVrBoardSkylineMedevacReadiness()`
- `GameHost.getSkylineMedevacReadinessTree()`
- `GameHost.getRendererHandoff()`
- `GameHost.getBoardDomainSnapshot()`

## Tests added

- `tests/vr-board-skyline-medevac-readiness-kits-smoke.mjs`
- `tests/vr-board-skyline-medevac-cdn-state-input-smoke.mjs`

Both tests use 10 intake/simulated state cases.

## Validation results

Scratch validation passed before connector writes:

```txt
node --check experiments/_kits/vr-platformer-board/vr-board-skyline-medevac-readiness-kits.js
node --check experiments/vr-platformer-board/skyline-medevac-readiness-entry.js
node --check tests/vr-board-skyline-medevac-readiness-kits-smoke.mjs
node --check tests/vr-board-skyline-medevac-cdn-state-input-smoke.mjs
node tests/vr-board-skyline-medevac-readiness-kits-smoke.mjs
node tests/vr-board-skyline-medevac-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
VR board skyline medevac readiness kits smoke passed 10 intake cases.
VR board skyline medevac CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace because this runtime could not resolve `github.com` via shell git. The CDN/state/input smoke validates the route marker, NexusEngine main CDN import, old NexusRealtime absence in the changed entry, GameHost exposure, renderer handoff availability, reusable-kit isolation, and 10 simulated input/state cases.

## NexusRealtime import audit

- New kit file: no NexusRealtime import.
- New entry file: imports NexusEngine main CDN and does not import old NexusRealtime.
- New route HTML: loads only the local skyline medevac entry.
- Gallery route now points to the new NexusEngine-CDN-backed medevac route.
- Existing `experiments/vr-platformer-board/index.html` is preserved as the prior route and already imports NexusEngine main CDN.

## Cleanup pass

- Reusable kit logic does not own renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, or frame-loop work.
- Entry owns browser canvas drawing, keyboard/pointer input, and `GameHost` exposure.
- Renderer handoff emits serializable descriptors only.
- No files were deleted.
- No branch was created.

## Non-game handling

VR Platformer Board is a small experience-driven web game/proof, so it was not deleted or renamed. The old `index.html` was preserved, and the gallery now uses the upgraded medevac route as the canonical card entry.

## Next safe ledge

Merge the older `index.html` traversal readability and companion rescue renderer layers with the new skyline medevac route so the whole VR board experiment has one canonical page with traversal, companion rescue, and medevac descriptors all composed under a single `GameHost.getRendererHandoff()` contract.
