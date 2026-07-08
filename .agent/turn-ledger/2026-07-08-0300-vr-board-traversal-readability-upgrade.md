# VR Platformer Board traversal readability upgrade

Timestamp: 2026-07-08 03:00 America/New_York

## Chosen experiment

`experiments/vr-platformer-board/`

## Why it was chosen

The latest upgraded route was `experiments/peer-scene-transition/`, so this pass avoided it. `vr-platformer-board` remained one of the smallest low-variation routes because its loop was mostly A/D movement, jump, reset, and visual board decoration. The missing gameplay value was traversal readability: the player could see the board, but not the intended jump arc, safe landing heat, checkpoint thread, recovery target, tempo, or control coaching as atomic renderer-neutral descriptors.

## Last upgraded experiment

`experiments/peer-scene-transition/` from the latest visible ledger and commit sequence for the consequence-fractal handoff.

## Experiment inventory

| Experiment | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller/camera diagnostic arena. | Short diagnostic loop. | WASD, spring arm camera, debug metrics. | No direct old CDN found in changed audit. | Yes, through arena-fractal wrapper. |
| `experiments/peer-scene-transition/` | HTML scene puzzle/transition route. | Short scene chain. | Scene gates, clues, inventory, chronicle/consequence descriptors. | No direct old CDN in changed runtime. | Yes. |
| `apps/the-cavalry-of-rome/` | Campaign command map experiment. | Medium campaign slice. | World actions, march/supply/cohesion/morale descriptors. | Legacy compatibility surface still noted outside active handoff. | Yes, in campaign-fractal handoff. |
| `experiments/vr-platformer-board/` | Flat Canvas XR-board platformer route. | Short arcade route. | A/D movement, Space jump, R reset, drag-head offset, coins, hazards, exit, traversal descriptors. | Old ProtoKits CDN import removed from changed route; no old NexusRealtime runtime CDN. | Yes. |
| `experiments/next-ledge/` | Cinematic grapple-climb route. | Short ascent. | Grapple, swing, route progress, cargo/pressure descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/infinite-radial-terrain/` | Infinite/radial terrain visualization route. | Open-ended exploration. | Camera flight, radial terrain rings, biome/hydrology descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/high-fidelity-meadow/` | Meadow scene/visual fidelity route. | Ambient exploration. | Grass, flowers, sheep, depth/pattern descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/fogline-relay/` | First-person fog-forest relay route. | Short objective route. | Move, look, scan relays, avoid wraiths, open gate. | No old runtime CDN in changed audit. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer kit showcase. | Medium objective sandbox. | Harvest, build mast, pressure wave, resource/objective descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/sora-the-infinite/` | Authored compatibility gateway into The Open Above. | Short launch handoff. | Alias preservation, launch vector, route preview, wind/altitude/waypoint handoff descriptors. | No old runtime CDN in changed runtime. | Yes. |
| `experiments/zombie-orchard/` | Survival orchard route. | Short wave survival. | Move, collect apples, scavenge gear, fight monsters, survive/advance rounds. | No old runtime CDN in changed audit. | Yes. |
| `experiments/tropical-island-scene/` | WebGL tropical island/lagoons route. | Ambient scene. | Orbit camera, water/reef/current/wake descriptors. | Old local import-map compatibility preserved for island/water stack. | Yes. |
| `games/signal-bastion/` | Strategic tower-defense route. | 30-wave defense loop. | Build towers, enemies, economy, command/readability descriptors. | No old runtime CDN in changed audit. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Action-defense/extraction route. | Short-to-medium wave survival. | Realm portals, harvesting, inventory, build, core defense. | No direct old CDN found in changed audit. | Yes. |

## Domain ASCII tree

```txt
vr-board-traversal-readability-domain
├─ jump-readability
│  ├─ jump-arc-forecast-domain
│  │  └─ vr-board-jump-arc-forecast-kit
│  └─ landing-zone-heat-domain
│     └─ vr-board-landing-zone-heat-kit
├─ route-memory
│  ├─ checkpoint-thread-domain
│  │  └─ vr-board-checkpoint-thread-kit
│  └─ fail-recovery-beacon-domain
│     └─ vr-board-fail-recovery-beacon-kit
├─ cadence-and-coaching
│  ├─ tempo-pulse-band-domain
│  │  └─ vr-board-tempo-pulse-band-kit
│  └─ control-coaching-strip-domain
│     └─ vr-board-control-coaching-strip-kit
└─ renderer-handoff
   └─ vr-board-traversal-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added in `experiments/_kits/vr-platformer-board/vr-board-traversal-readability-kits.js`:

- `VR_BOARD_TRAVERSAL_READABILITY_DOMAIN_TREE`
- `vr-board-jump-arc-forecast-kit`
- `vr-board-landing-zone-heat-kit`
- `vr-board-checkpoint-thread-kit`
- `vr-board-fail-recovery-beacon-kit`
- `vr-board-tempo-pulse-band-kit`
- `vr-board-control-coaching-strip-kit`
- `vr-board-traversal-renderer-handoff-kit`
- `vr-board-traversal-readability-domain-kit`

Changed:

- `experiments/vr-platformer-board/index.html` now uses a local deterministic board/platformer loop instead of importing the old ProtoKits CDN stack.
- The changed route still imports NexusEngine main via CDN.
- The renderer consumes traversal descriptor buckets for checkpoint thread, tempo bands, landing heat, jump arc, fail recovery, and coaching chips.
- `GameHost` now exposes `getTraversalReadability()` and `getRendererHandoff()`.

## Files changed

- `experiments/_kits/vr-platformer-board/vr-board-traversal-readability-kits.js`
- `experiments/vr-platformer-board/index.html`
- `tests/vr-board-traversal-readability-kits-smoke.mjs`
- `tests/vr-board-traversal-readability-cdn-state-input-smoke.mjs`
- `tests/vr-platformer-board-playwright-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0300-vr-board-traversal-readability-upgrade.md`

## Tests added

- `tests/vr-board-traversal-readability-kits-smoke.mjs`
  - 10 intake cases.
  - Checks jump arc forecast, landing zone heat, checkpoint thread, fail recovery beacons, tempo pulse bands, control coaching strip, renderer handoff, and composite domain.
  - Checks serializable descriptor output and renderer-neutral ownership boundaries.

- `tests/vr-board-traversal-readability-cdn-state-input-smoke.mjs`
  - 10 state/input cases.
  - Validates NexusEngine main CDN usage, old NexusRealtime runtime CDN absence, old ProtoKits CDN removal, `GameHost.getTraversalReadability()`, `GameHost.getRendererHandoff()`, and descriptor renderer functions.

Changed:

- `tests/vr-platformer-board-playwright-state-input-smoke.mjs` now validates the traversal handoff path instead of the removed ProtoKits CDN import path.

## Validation results

Static connector validation completed by refetching the changed route, new kit file, updated tests, manifest, and check wiring after writing them.

Runtime shell validation was not executed in this connector-only run. The wired commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/vr-platformer-board/index.html` imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- The changed route no longer imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits`.
- The changed route does not import `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js`.
- The new traversal readability kits do not import NexusRealtime, NexusEngine, DOM, browser input, renderer code, Three.js, WebGL, audio, assets, or frame-loop code.

## Cleanup pass

- Removed the old runtime dependency on remote ProtoKit imports for this route and replaced it with a deterministic route-local board loop.
- Preserved the small game loop: move, jump, reset, collect coins, avoid hazards, and reach exit.
- Kept reusable traversal logic in pure descriptor kits.
- Kept browser input, Canvas rendering, and frame-loop ownership inside the route host.
- No route was deleted, renamed, or destructively removed.

## Non-game route handling

`vr-platformer-board` is a small arcade/prototype route rather than a full XR runtime. The proof it was trying to provide is an XR-sized board platformer with comfort and board-readability descriptors. The lesson from this pass is that traversal prototypes need immediate readable affordances before more XR work: jump prediction, safe landing zones, checkpoint threads, recovery beacons, tempo bands, and coaching chips make the scene meaningfully playable without adding renderer-owned simulation truth.

## Next safe ledge

Add a deterministic route replay fixture for `vr-platformer-board` that runs launch → collect → bridge hazard → recovery platform → summit → exit and snapshot-hashes visual and traversal renderer-handoff counts without requiring browser timing.
