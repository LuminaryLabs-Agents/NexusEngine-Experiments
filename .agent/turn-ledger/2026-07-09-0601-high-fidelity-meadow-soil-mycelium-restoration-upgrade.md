# High Fidelity Meadow soil mycelium restoration upgrade

## Summary

Upgraded `experiments/high-fidelity-meadow/` with a soil mycelium restoration readiness layer. The meadow now has descriptor-only underground ecology: soil spore monitors, mycelium thread weaves, mushroom nursery rings, beetle detritus lanes, hedgerow windbreaks, and a dawn soil health ledger.

## Chosen experiment

`experiments/high-fidelity-meadow/`

## Why it was chosen

The latest completed upgrade was `experiments/vr-platformer-board/`, so this run needed a different route. High Fidelity Meadow was selected because it is a visual experience more than a compact game loop and still benefits from deeper procedural structure beneath the surface scene. The new pass improves long-term composition by adding an underground ecology domain without moving renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, or frame-loop logic into reusable kits.

## Last upgraded experiment

`experiments/vr-platformer-board/` from commit `0006f6c29798c7366ef503204834da3c57400239` (`Log VR board skyline medevac upgrade`).

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Scene transition / story route | 2-4 min | scene gates, inventory, chronicle/consequence/courier overlays | no current changed import noted | yes |
| `experiments/vr-platformer-board/` | Board-scale platformer routed to Skyline Medevac | 1-3 min | A/D movement, jump, oxygen pickup, hazards, tether/medevac overlays | no changed runtime import | yes |
| `experiments/infinite-radial-terrain/` | Radial terrain flight/survey | 2-5 min | camera flight, LOD rings, survey/shelter overlays | no changed import noted | yes |
| `experiments/high-fidelity-meadow/` | Procedural meadow ecology scene, now with soil mycelium restoration | 2-5 min | camera orbit, grass/cloud/sheep scene, ecology/creek/soil descriptor overlays | no changed runtime import | yes |
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
meadow-soil-mycelium-restoration-readiness-domain
├─ soil-health-domain
│  ├─ soil-spore-monitor-domain
│  │  └─ meadow-soil-spore-monitor-kit
│  └─ mycelium-thread-domain
│     └─ meadow-mycelium-thread-weave-kit
├─ decomposition-nursery-domain
│  ├─ mushroom-ring-domain
│  │  ├─ fruiting-body-domain
│  │  │  └─ meadow-mushroom-ring-nursery-kit
│  └─ beetle-lane-domain
│     └─ meadow-beetle-lane-detritus-kit
├─ edge-protection-handoff-domain
│  ├─ hedgerow-windbreak-domain
│  │  └─ meadow-hedgerow-windbreak-kit
│  └─ dawn-soil-ledger-domain
│     └─ meadow-dawn-soil-ledger-kit
└─ renderer-handoff
   └─ meadow-soil-mycelium-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `meadow-soil-spore-monitor-kit`
- `meadow-mycelium-thread-weave-kit`
- `meadow-mushroom-ring-nursery-kit`
- `meadow-beetle-lane-detritus-kit`
- `meadow-hedgerow-windbreak-kit`
- `meadow-dawn-soil-ledger-kit`
- `meadow-soil-mycelium-renderer-handoff-kit`
- `meadow-soil-mycelium-restoration-domain-kit`

## Files changed

- `experiments/high-fidelity-meadow/src/meadow-soil-mycelium-restoration-kits.js`
- `experiments/high-fidelity-meadow/src/meadow-soil-mycelium-restoration-entry.js`
- `experiments/high-fidelity-meadow/index.html`
- `experiments/_shared/nexus-gallery-data.js`
- `tests/meadow-soil-mycelium-restoration-kits-smoke.mjs`
- `tests/meadow-soil-mycelium-restoration-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-0601-high-fidelity-meadow-soil-mycelium-restoration-upgrade.md`

## Integration notes

The route now declares:

```txt
soil-mycelium-restoration-readiness-renderer-handoff-pass
```

The route loads:

```txt
./src/meadow-soil-mycelium-restoration-entry.js?v=20260709-soil-mycelium-restoration-1
```

The entry imports NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

It exposes:

- `GameHost.getSoilMyceliumRestoration()`
- `GameHost.getMeadowSoilMyceliumRestoration()`
- `GameHost.getSoilMyceliumRestorationTree()`
- `GameHost.getRendererHandoff()`

## Tests added

- `tests/meadow-soil-mycelium-restoration-kits-smoke.mjs`
- `tests/meadow-soil-mycelium-restoration-cdn-state-input-smoke.mjs`

Both tests use 10 intake/simulated state cases.

## Validation results

Scratch validation passed before connector writes:

```txt
node --check experiments/high-fidelity-meadow/src/meadow-soil-mycelium-restoration-kits.js
node --check experiments/high-fidelity-meadow/src/meadow-soil-mycelium-restoration-entry.js
node --check tests/meadow-soil-mycelium-restoration-kits-smoke.mjs
node --check tests/meadow-soil-mycelium-restoration-cdn-state-input-smoke.mjs
node tests/meadow-soil-mycelium-restoration-kits-smoke.mjs
node tests/meadow-soil-mycelium-restoration-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
meadow soil mycelium restoration kits smoke passed 10 intake cases
meadow soil mycelium restoration CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace. The CDN/state/input smoke validates the route marker, NexusEngine main CDN import, old NexusRealtime absence in the changed entry, `GameHost` exposure, renderer handoff composition, reusable-kit isolation, and 10 simulated input/state cases.

## NexusRealtime import audit

- New kit file: no NexusRealtime import.
- New entry file: imports NexusEngine main CDN and does not import old NexusRealtime.
- Updated route HTML: loads the local soil mycelium entry after the existing NexusEngine-backed meadow passes.
- Updated gallery copy: no runtime import.
- Existing `src/main-aaa.js` already imports NexusEngine main CDN and was not changed.

## Cleanup pass

- Reusable kit logic does not own renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, or frame-loop work.
- Entry owns browser overlay drawing, panel rendering, host patching, and `requestAnimationFrame` refresh.
- Renderer handoff emits serializable descriptors only.
- No files were deleted.
- No branch was created.

## Non-game handling

High Fidelity Meadow is an experience-driven WebGL route, not a conventional small level-based game. It was preserved and augmented rather than renamed or deleted. The lesson is that a scenic route becomes more useful when structural ecology is represented as testable, descriptor-only subdomains instead of being only visible surface dressing.

## Next safe ledge

Merge the many meadow overlay panels into a single composed diagnostics drawer and have `main-aaa.js` include all current readiness descriptors in its first-party `composeRendererHandoff()` so later passes can patch fewer browser surfaces.
