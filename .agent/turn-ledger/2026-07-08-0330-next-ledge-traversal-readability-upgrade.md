# Next Ledge traversal readability upgrade

Timestamp: 2026-07-08 03:30 America/New_York

## Chosen experiment

`experiments/next-ledge/`

## Why it was chosen

The latest upgraded experiment was `experiments/infinite-radial-terrain/`, so this pass avoided it. `next-ledge` still had the weakest remaining gameplay readability among the canonical routes because the core loop was already fun, but the decisive moment was still under-explained: when to release, which anchor is reachable, how dangerous low stamina is, where recovery is, and how close the player is to the summit. This pass upgrades that moment with atomic traversal-readability descriptors without moving physics, input, route progress, cargo, or renderer ownership into the kits.

## Last upgraded experiment

`experiments/infinite-radial-terrain/` from the latest visible ledger and commit sequence.

## Experiment inventory

| Experiment | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller/camera diagnostic arena. | Short diagnostic loop. | WASD, spring arm camera, debug metrics. | No direct old CDN found in changed audit. | Yes, through arena-fractal wrapper. |
| `experiments/peer-scene-transition/` | HTML scene puzzle/transition route. | Short scene chain. | Scene gates, clues, inventory, chronicle/consequence descriptors. | No direct old CDN in changed runtime. | Yes. |
| `apps/the-cavalry-of-rome/` | Campaign command map experiment. | Medium campaign slice. | World actions, march/supply/cohesion/morale descriptors. | Legacy compatibility surface still noted outside active handoff. | Yes, in campaign-fractal handoff. |
| `experiments/vr-platformer-board/` | Flat Canvas XR-board platformer route. | Short arcade route. | A/D movement, Space jump, R reset, drag-head offset, coins, hazards, exit, traversal descriptors. | Old ProtoKits CDN import removed from changed route; no old NexusRealtime runtime CDN. | Yes. |
| `experiments/next-ledge/` | Cinematic grapple-climb route upgraded with traversal readability. | Short ascent with repeatable sectors. | Grapple, swing, release timing, cargo cache, fall pressure, arc forecast, anchor confidence, stamina risk, recovery vectors, summit route beats. | Base `session.js` still contains the legacy NexusRealtime runtime import outside this changed wrapper pass. | Yes, through the changed cargo/traversal wrapper. |
| `experiments/infinite-radial-terrain/` | Infinite/radial terrain visualization route upgraded into survey flight. | Open-ended exploration. | Camera flight, radial terrain rings, biome/hydrology descriptors, survey transects, altitude corridors, hazard basins, ridge pass beacons, route task bands. | No old runtime CDN in changed audit. | Yes. |
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
next-ledge-traversal-readability-domain
├─ swing-decision-domain
│  ├─ arc-forecast-domain
│  │  └─ swing-arc-forecast-kit
│  └─ momentum-window-domain
│     └─ momentum-window-kit
├─ anchor-choice-domain
│  ├─ anchor-confidence-domain
│  │  └─ anchor-confidence-field-kit
│  └─ summit-route-beat-domain
│     └─ summit-route-beat-kit
├─ survival-recovery-domain
│  ├─ stamina-risk-domain
│  │  └─ stamina-risk-band-kit
│  └─ recovery-vector-domain
│     └─ recovery-vector-kit
└─ renderer-handoff
   └─ traversal-readability-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added in `experiments/next-ledge/src/traversal-readability-kits.js`:

- `NEXT_LEDGE_TRAVERSAL_READABILITY_TREE`
- `swing-arc-forecast-kit`
- `anchor-confidence-field-kit`
- `stamina-risk-band-kit`
- `recovery-vector-kit`
- `momentum-window-kit`
- `summit-route-beat-kit`
- `traversal-readability-renderer-handoff-kit`
- `next-ledge-traversal-readability-domain-kit`

Changed:

- `session-cargo-extraction-upgrade.js` now composes traversal readability after route-cargo extraction.
- `diegetic-effects.js` now consumes traversal readability descriptor buckets through particle layers.
- `runtime-loop.js` now exposes `GameHost.getTraversalReadability()` and `GameHost.getRendererHandoff()`.
- `index.html` now records the traversal-readability cutover and cache-busts the upgraded module.
- `domain-kit-cutover-manifest.json` now records the pass as `traversal-readability-renderer-handoff-pass`.

## Files changed

- `experiments/next-ledge/src/traversal-readability-kits.js`
- `experiments/next-ledge/src/session-cargo-extraction-upgrade.js`
- `experiments/next-ledge/src/diegetic-effects.js`
- `experiments/next-ledge/src/runtime-loop.js`
- `experiments/next-ledge/index.html`
- `tests/next-ledge-traversal-readability-kits-smoke.mjs`
- `tests/next-ledge-traversal-readability-cdn-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0330-next-ledge-traversal-readability-upgrade.md`

## Tests added

- `tests/next-ledge-traversal-readability-kits-smoke.mjs`
  - 10 intake cases.
  - Checks swing arc forecasts, anchor confidence fields, stamina risk bands, recovery vectors, momentum windows, summit route beats, renderer handoff, and composite domain output.
  - Checks serializable descriptor output and renderer-neutral ownership boundaries.

- `tests/next-ledge-traversal-readability-cdn-state-input-smoke.mjs`
  - 10 state/input validation surfaces.
  - Validates NexusEngine main CDN usage in the changed wrapper, old NexusRealtime runtime CDN absence in the changed wrapper, route cache busting, `GameHost.getTraversalReadability()`, `GameHost.getRendererHandoff()`, renderer descriptor consumption, and ownership boundaries.

Both tests are wired into full and deploy validation through `scripts/run-checks.mjs`.

## Validation results

Static connector validation completed by refetching the changed route shell, wrapper, runtime loop, diegetic effects, new kit file, new tests, manifest, and check wiring after writing them.

Runtime shell validation was not executed in this connector-only run. The wired commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/next-ledge/src/session-cargo-extraction-upgrade.js` imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- The changed wrapper does not import `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js`.
- `experiments/next-ledge/src/session.js` still imports the legacy NexusRealtime runtime CDN and is intentionally logged as remaining cleanup because this pass changed the wrapper/readability layer, not the lower-level traversal host.
- The new traversal readability kits do not import NexusRealtime, NexusEngine, DOM, browser input, renderer code, Three.js, WebGL, audio, assets, or frame-loop code.

## Cleanup pass

- Kept traversal readability logic in pure descriptor kits.
- Kept swing physics, grapple input, route progress, cargo extraction, browser input, Three rendering, audio, and frame-loop timing outside reusable kits.
- Preserved existing grapple, swing, cargo, parallax, visual-fractal, and sector-advance behavior.
- No route was deleted, renamed, or destructively removed.

## Non-game route handling

`next-ledge` is a small experience-driven web game, so no delete/rename/refactor cleanup was required. The proof it was trying to provide is a cinematic tether traversal loop. The lesson from this pass is that the highest-value next layer is decision readability: release windows, anchor confidence, stamina risk, recovery lines, and summit beats make the core swing loop readable without letting the renderer own gameplay truth.

## Next safe ledge

Migrate the lower-level `experiments/next-ledge/src/session.js` traversal host from the legacy `NexusRealtime@main` runtime import to `NexusEngine@main`, while preserving the current tether traversal behavior with a deterministic replay fixture for swing → release → launch → latch → rest → summit.
