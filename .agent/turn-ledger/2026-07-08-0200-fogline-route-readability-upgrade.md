# Fogline route readability upgrade

Timestamp: 2026-07-08 02:00 America/New_York

## Chosen experiment

`experiments/fogline-relay/`

## Why it was chosen

The latest upgraded route was `games/signal-bastion/`, so this pass avoided it. `fogline-relay` is a small experience-driven web game with strong atmosphere and scan/relay pressure, but its latest fractal pass was mostly environmental. The weakest current part was route readability: the player can move, scan relays, and avoid wraiths, but the renderer did not yet receive atomic descriptors for scan direction, objective target, route memory, safe pockets, and local pressure.

## Last upgraded experiment

`games/signal-bastion/` from the latest visible commit sequence ending in `Log Signal Bastion command fractal upgrade`.

## Experiment inventory

| Experiment | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller/camera diagnostic arena. | Short diagnostic loop. | WASD, spring arm camera, debug metrics. | No direct old CDN found in changed audit. | Yes, through arena-fractal wrapper. |
| `experiments/peer-scene-transition/` | HTML scene puzzle/transition route. | Short scene chain. | Scene gates, clues, inventory/readability descriptors. | No direct old CDN found in changed audit. | Yes. |
| `apps/the-cavalry-of-rome/` | Campaign command map experiment. | Medium campaign slice. | World actions, march/supply/cohesion/morale descriptors. | Legacy compatibility surface still noted outside active handoff. | Yes, in campaign-fractal handoff. |
| `experiments/vr-platformer-board/` | XR/stereo platformer board route. | Short arcade board. | A/D movement, jumping, board comfort/visual descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/next-ledge/` | Cinematic grapple-climb route. | Short ascent. | Grapple, swing, route progress, cargo/pressure descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/infinite-radial-terrain/` | Infinite/radial terrain visualization route. | Open-ended exploration. | Camera flight, radial terrain rings, biome/hydrology descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/high-fidelity-meadow/` | Meadow scene/visual fidelity route. | Ambient exploration. | Grass, flowers, sheep, depth/pattern descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/fogline-relay/` | First-person fog-forest relay route. | Short objective route. | Move, look, scan relays, avoid wraiths, open gate. | No old runtime CDN in `src/urls.js`. | Yes: `NexusEngine@main/src/index.js`. |
| `experiments/nexus-frontier-signal-isles/` | Broad field-engineer kit showcase. | Medium objective sandbox. | Harvest, build mast, pressure wave, resource/objective descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/sora-the-infinite/` | Compatibility gateway for aerial/open traversal lane. | Short launch handoff. | Alias preservation, launch vector, input coaching. | No direct old CDN found in changed audit. | Yes. |
| `experiments/zombie-orchard/` | Survival orchard route. | Short wave survival. | Move, collect apples, weapons, monsters, survival rounds. | No direct old CDN found in changed audit. | Yes. |
| `experiments/tropical-island-scene/` | WebGL tropical island/lagoons route. | Ambient scene. | Orbit camera, water/reef/current/wake descriptors. | Old local import-map compatibility preserved for island/water stack. | Yes. |
| `games/signal-bastion/` | Strategic tower-defense route. | 30-wave defense loop. | Build towers, enemies, economy, command/readability descriptors. | Last upgraded; avoided. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Action-defense/extraction route. | Short-to-medium wave survival. | Realm portals, harvesting, inventory, build, core defense. | No direct old CDN found in changed audit. | Yes. |

## Domain ASCII tree

```txt
fogline-route-readability-domain
├─ scan-readability
│  ├─ player-scan-cone-domain
│  │  └─ fogline-scan-cone-kit
│  └─ next-objective-domain
│     └─ fogline-objective-needle-kit
├─ route-memory
│  ├─ breadcrumb-domain
│  │  └─ fogline-memory-breadcrumb-kit
│  └─ safe-pocket-domain
│     └─ fogline-safe-pocket-kit
├─ threat-readability
│  └─ local-pressure-domain
│     └─ fogline-pressure-vignette-kit
└─ renderer-handoff
   └─ fogline-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added / integrated in `experiments/fogline-relay/src/fogline-visual-fractal-kits.js`:

- `fogline-scan-cone-kit`
- `fogline-objective-needle-kit`
- `fogline-memory-breadcrumb-kit`
- `fogline-pressure-vignette-kit`
- `fogline-safe-pocket-kit`
- `fogline-renderer-handoff-kit`

Changed:

- `fogline-visual-fractal-domain-kit` now composes the existing environmental descriptors plus route-readability descriptors and emits `rendererHandoff`.

## Files changed

- `experiments/fogline-relay/src/fogline-visual-fractal-kits.js`
- `experiments/fogline-relay/src/main.js`
- `experiments/fogline-relay/src/renderer.js`
- `tests/fogline-route-readability-kits-smoke.mjs`
- `tests/fogline-relay-playwright-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0200-fogline-route-readability-upgrade.md`

## Tests added

- `tests/fogline-route-readability-kits-smoke.mjs`
  - 10 intake cases.
  - 7 checked surfaces.
  - 70 total intake checks.
  - Verifies descriptor shape, serializability, renderer-neutral boundaries, handoff policy, and deterministic descriptor counts.

## Tests upgraded

- `tests/fogline-relay-playwright-state-input-smoke.mjs`
  - Still boots the route through Playwright.
  - Still validates NexusEngine main CDN usage.
  - Now checks `GameHost.getRendererHandoff()`.
  - Now checks scan cone, objective needle, breadcrumb, pressure vignette, safe pocket, and renderer handoff state.

## Validation results

Static connector validation completed by refetching the changed files after writing them.

Runtime shell validation was not executed in this connector-only run. The wired commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/fogline-relay/src/urls.js` already imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- No old `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@0.0.1/src/index.js` import was found in the Fogline CDN/state smoke scope.
- The changed runtime continues to use NexusEngine main via CDN.

## Cleanup pass

- Kept reusable route-readability logic out of renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, and frame-loop ownership.
- Canvas fallback now consumes the new descriptor buckets directly.
- Three renderer already consumes `visualFractal.drawOrder`; the new descriptors are included in that queue and are routed through the existing generic fractal mesh handoff.
- `GameHost` exposes `getRendererHandoff()` so tests and future QA can inspect presentation descriptors without reaching into renderer internals.
- No destructive route deletion or rename occurred.

## Next safe ledge

Add a deterministic Fogline replay fixture that records player movement, scan timing, wraith pressure, relay completion, and gate opening while snapshot-hashing the new renderer-handoff descriptors.
