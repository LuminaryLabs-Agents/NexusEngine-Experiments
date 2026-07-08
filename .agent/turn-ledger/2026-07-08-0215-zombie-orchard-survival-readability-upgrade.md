# Zombie Orchard survival readability upgrade

Timestamp: 2026-07-08 02:15 America/New_York

## Chosen experiment

`experiments/zombie-orchard/`

## Why it was chosen

The latest upgraded route was `experiments/fogline-relay/`, so this pass avoided it. `zombie-orchard` is a small experience-driven web game with a survival loop, apples, gear, monsters, rounds, and pressure, but its prior pass focused mostly on ecology/visual descriptors. The weakest current part was survival readability: threat proximity, resource routes, stamina stress, round pressure, escape lanes, and melee timing were not yet split into atomic renderer-neutral descriptors.

## Last upgraded experiment

`experiments/fogline-relay/` from the latest visible commit sequence ending in `Log Fogline route readability upgrade`.

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
| `experiments/fogline-relay/` | First-person fog-forest relay route. | Short objective route. | Move, look, scan relays, avoid wraiths, open gate. | No old runtime CDN in `src/urls.js`. | Yes; last upgraded and avoided. |
| `experiments/nexus-frontier-signal-isles/` | Broad field-engineer kit showcase. | Medium objective sandbox. | Harvest, build mast, pressure wave, resource/objective descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/sora-the-infinite/` | Compatibility gateway for aerial/open traversal lane. | Short launch handoff. | Alias preservation, launch vector, input coaching. | No direct old CDN found in changed audit. | Yes. |
| `experiments/zombie-orchard/` | Survival orchard route. | Short wave survival. | Move, collect apples, scavenge gear, fight monsters, survive/advance rounds. | No old runtime CDN in changed audit. | Yes: `NexusEngine@main/src/index.js`. |
| `experiments/tropical-island-scene/` | WebGL tropical island/lagoons route. | Ambient scene. | Orbit camera, water/reef/current/wake descriptors. | Old local import-map compatibility preserved for island/water stack. | Yes. |
| `games/signal-bastion/` | Strategic tower-defense route. | 30-wave defense loop. | Build towers, enemies, economy, command/readability descriptors. | No old runtime CDN in changed audit. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Action-defense/extraction route. | Short-to-medium wave survival. | Realm portals, harvesting, inventory, build, core defense. | No direct old CDN found in changed audit. | Yes. |

## Domain ASCII tree

```txt
zombie-orchard-survival-readability-domain
├─ threat-readability
│  └─ orchard-threat-gradient-kit
├─ resource-routing
│  └─ orchard-resource-route-kit
├─ player-state-readability
│  └─ orchard-stamina-breath-kit
├─ wave-pressure-readability
│  └─ orchard-round-pressure-band-kit
├─ navigation-readability
│  └─ orchard-escape-lane-kit
├─ combat-readability
│  └─ orchard-melee-window-kit
└─ renderer-handoff
   └─ orchard-survival-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added in `experiments/zombie-orchard/src/survival-readability-kits.js`:

- `orchard-threat-gradient-kit`
- `orchard-resource-route-kit`
- `orchard-stamina-breath-kit`
- `orchard-round-pressure-band-kit`
- `orchard-escape-lane-kit`
- `orchard-melee-window-kit`
- `orchard-survival-renderer-handoff-kit`
- `zombie-orchard-survival-readability-domain-kit`

Changed:

- `createZombieOrchardSession` now composes the survival readability domain after the visual-fractal domain.
- `GameHost` now exposes `getSurvivalReadability()` and `getRendererHandoff()`.
- Canvas fallback now consumes the survival renderer-handoff descriptor buckets.

## Files changed

- `experiments/zombie-orchard/src/survival-readability-kits.js`
- `experiments/zombie-orchard/src/session.js`
- `experiments/zombie-orchard/src/bootstrap.js`
- `experiments/zombie-orchard/src/canvas-view.js`
- `tests/zombie-orchard-survival-readability-kits-smoke.mjs`
- `tests/zombie-orchard-survival-readability-cdn-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0215-zombie-orchard-survival-readability-upgrade.md`

## Tests added

- `tests/zombie-orchard-survival-readability-kits-smoke.mjs`
  - 10 intake cases.
  - 8 checked kit/composite surfaces.
  - Checks threat gradients, resource routes, stamina breath, round pressure, escape lanes, melee windows, renderer handoff policy, descriptor counts, serializability, and ownership boundaries.

- `tests/zombie-orchard-survival-readability-cdn-state-input-smoke.mjs`
  - Boots the browser route through Playwright.
  - Validates NexusEngine main CDN usage.
  - Validates old NexusRealtime runtime CDN absence in the changed kit-stack scope.
  - Runs 10 state/input cases.
  - Checks `GameHost.getRendererHandoff()`, `GameHost.getSurvivalReadability()`, visual survival readability state, descriptor buckets, descriptor counts, and ownership boundaries.

## Validation results

Static connector validation completed by refetching the changed session and kit files after writing them.

Runtime shell validation was not executed in this connector-only run. The wired commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/zombie-orchard/src/kit-stack.js` imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- The changed survival readability kit file does not import NexusRealtime, NexusEngine, DOM, renderer, Three.js, WebGL, audio, assets, or frame-loop code.
- The CDN/state-input smoke checks that the old `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js` runtime URL is absent from the Zombie Orchard kit-stack scope.

## Cleanup pass

- Reusable readability logic stayed out of renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, and frame-loop ownership.
- The survival readability domain consumes plain snapshot objects and emits serializable descriptors.
- Canvas fallback reads only `rendererHandoff.descriptors` for threat gradients, resource routes, stamina breath, round pressure bands, escape lanes, and melee windows.
- Existing visual-fractal kit file was preserved instead of being inflated further.
- No destructive route deletion or rename occurred.

## Non-game route handling

`zombie-orchard` is already a small experience-driven web game, so no deletion/refactor/rename was needed.

## Next safe ledge

Add a deterministic Zombie Orchard replay fixture that records round start, apple collection, gear pickup, threat contact, melee clear, and survival/failure outcome while snapshot-hashing the new survival renderer-handoff descriptors.
