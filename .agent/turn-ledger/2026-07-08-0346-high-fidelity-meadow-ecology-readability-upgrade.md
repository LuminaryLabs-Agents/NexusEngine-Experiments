# High Fidelity Meadow ecology readability upgrade

Timestamp: 2026-07-08 03:46 America/New_York

## Chosen experiment

`experiments/high-fidelity-meadow/`

## Why it was chosen

The latest upgraded experiment was `experiments/next-ledge/`, so this pass avoided it. `high-fidelity-meadow` still had one of the weakest experience loops among the canonical routes because it was visually rich but mostly ambient: grass, flowers, sheep, clouds, and audio existed, yet the living-scene intent was not readable as ecology. This pass adds ecology readability descriptors for pollinator movement, shepherd routes, rest pockets, wind lanes, bloom timing, and attention beacons while keeping renderer, DOM, input, Three.js, WebGL, audio, asset loading, and frame-loop ownership outside the reusable kits.

## Last upgraded experiment

`experiments/next-ledge/` from the latest visible ledger and commit sequence.

## Experiment inventory

| Experiment | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller/camera diagnostic arena. | Short diagnostic loop. | WASD, spring arm camera, debug metrics, arena readability descriptors. | No direct old CDN found in changed audit. | Yes, through arena-fractal wrapper. |
| `experiments/peer-scene-transition/` | HTML scene puzzle/transition route. | Short scene chain. | Scene gates, clues, inventory, chronicle/consequence descriptors. | No direct old CDN in changed runtime. | Yes. |
| `apps/the-cavalry-of-rome/` | Campaign command map experiment. | Medium campaign slice. | World actions, march/supply/cohesion/morale descriptors. | Legacy compatibility surface still noted outside active handoff. | Yes, in campaign-fractal handoff. |
| `experiments/vr-platformer-board/` | Flat Canvas XR-board platformer route. | Short arcade route. | A/D movement, Space jump, R reset, drag-head offset, coins, hazards, exit, traversal descriptors. | Old ProtoKits CDN import removed from changed route; no old NexusRealtime runtime CDN. | Yes. |
| `experiments/next-ledge/` | Cinematic grapple-climb route upgraded with traversal readability. | Short ascent with repeatable sectors. | Grapple, swing, release timing, cargo cache, fall pressure, traversal readability descriptors. | Base `session.js` still contains the legacy NexusRealtime runtime import outside the wrapper pass. | Yes, through the changed wrapper. |
| `experiments/infinite-radial-terrain/` | Infinite/radial terrain visualization route upgraded into survey flight. | Open-ended exploration. | Camera flight, radial terrain rings, biome/hydrology descriptors, expedition guidance descriptors. | No old runtime CDN in changed audit. | Yes. |
| `experiments/high-fidelity-meadow/` | Meadow scene/visual fidelity route now upgraded with ecology readability. | Ambient exploration. | Grass, flowers, sheep, depth/pattern descriptors, pollinator routes, shepherd paths, rest spots, wind lanes, bloom queues, attention beacons. | No direct old CDN found in changed runtime. | Yes. |
| `experiments/fogline-relay/` | First-person fog-forest relay route. | Short objective route. | Move, look, scan relays, avoid wraiths, open gate, route readability descriptors. | No old runtime CDN in changed audit. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer kit showcase. | Medium objective sandbox. | Harvest, build mast, pressure wave, resource/objective descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/sora-the-infinite/` | Authored compatibility gateway into The Open Above. | Short launch handoff. | Alias preservation, launch vector, route preview, wind/altitude/waypoint handoff descriptors. | No old runtime CDN in changed runtime. | Yes. |
| `experiments/zombie-orchard/` | Survival orchard route. | Short wave survival. | Move, collect apples, scavenge gear, fight monsters, survive/advance rounds, survival readability descriptors. | No old runtime CDN in changed audit. | Yes. |
| `experiments/tropical-island-scene/` | WebGL tropical island/lagoons route. | Ambient scene. | Orbit camera, water/reef/current/wake descriptors. | Old local import-map compatibility preserved for island/water stack. | Yes. |
| `games/signal-bastion/` | Strategic tower-defense route. | 30-wave defense loop. | Build towers, enemies, economy, command/readability descriptors. | No old runtime CDN in changed audit. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Action-defense/extraction route. | Short-to-medium wave survival. | Realm portals, harvesting, inventory, build, core defense, hellscape readability descriptors. | No direct old CDN found in changed audit. | Yes. |

## Domain ASCII tree

```txt
meadow-ecology-readability-domain
├─ living-route-domain
│  ├─ pollinator-route-domain
│  │  └─ meadow-pollinator-route-kit
│  └─ shepherd-path-domain
│     └─ meadow-shepherd-path-kit
├─ habitat-comfort-domain
│  ├─ rest-spot-domain
│  │  └─ meadow-rest-spot-kit
│  └─ wind-lane-domain
│     └─ meadow-wind-lane-kit
├─ seasonal-attention-domain
│  ├─ bloom-queue-domain
│  │  └─ meadow-seasonal-bloom-queue-kit
│  └─ attention-beacon-domain
│     └─ meadow-attention-beacon-kit
└─ renderer-handoff
   └─ meadow-ecology-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added in `experiments/high-fidelity-meadow/src/meadow-ecology-readability-kits.js`:

- `MEADOW_ECOLOGY_READABILITY_TREE`
- `meadow-pollinator-route-kit`
- `meadow-shepherd-path-kit`
- `meadow-rest-spot-kit`
- `meadow-wind-lane-kit`
- `meadow-seasonal-bloom-queue-kit`
- `meadow-attention-beacon-kit`
- `meadow-ecology-renderer-handoff-kit`
- `meadow-ecology-readability-domain-kit`

Changed:

- `main-aaa.js` now composes ecology readability after the existing visual fractal domain and exposes `GameHost.getEcologyReadability()` and `GameHost.getRendererHandoff()`.
- `meadow-visual-fractal-renderers.js` now consumes ecology descriptors as presentation-only Three layers.
- `index.html` now records the ecology readability pass and cache-busts the upgraded module.
- `domain-kit-cutover-manifest.json` now records `meadow-ecology-readability-handoff-pass`.
- `scripts/run-checks.mjs` now runs the ecology kit and CDN/state validation in both full and deploy suites.

## Files changed

- `experiments/high-fidelity-meadow/src/meadow-ecology-readability-kits.js`
- `experiments/high-fidelity-meadow/src/main-aaa.js`
- `experiments/high-fidelity-meadow/src/meadow-visual-fractal-renderers.js`
- `experiments/high-fidelity-meadow/index.html`
- `tests/high-fidelity-meadow-ecology-readability-kits-smoke.mjs`
- `tests/high-fidelity-meadow-ecology-cdn-state-input-smoke.mjs`
- `tests/high-fidelity-meadow-playwright-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0346-high-fidelity-meadow-ecology-readability-upgrade.md`

## Tests added

- `tests/high-fidelity-meadow-ecology-readability-kits-smoke.mjs`
  - 10 intake cases.
  - Checks pollinator routes, shepherd paths, rest spots, wind lanes, seasonal bloom queue, attention beacons, renderer handoff, and composite ecology domain output.
  - Checks serializable descriptor output and renderer-neutral ownership boundaries.

- `tests/high-fidelity-meadow-ecology-cdn-state-input-smoke.mjs`
  - 10 state/input validation cases.
  - Validates NexusEngine main CDN usage, absence of old NexusRealtime runtime CDN in the changed runtime, route cache busting, `GameHost.getEcologyReadability()`, `GameHost.getRendererHandoff()`, renderer descriptor consumption, and ownership boundaries.

Updated:

- `tests/high-fidelity-meadow-playwright-state-input-smoke.mjs`
  - Refreshes the route cache-bust assertion to the ecology readability pass.

Both new tests are wired into full and deploy validation through `scripts/run-checks.mjs`.

## Validation results

Static connector validation completed by refetching the new ecology kit file, the changed meadow route runtime, the changed renderer, and the new smoke tests after writing them.

Runtime shell validation was not executed in this connector-only run. The wired commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/high-fidelity-meadow/src/main-aaa.js` imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- The changed meadow runtime does not import `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js`.
- The new ecology readability kits do not import NexusRealtime, NexusEngine, DOM, browser input, renderer code, Three.js, WebGL, audio, assets, or frame-loop code.
- `meadow-experiment-scene.js` still references local/legacy ProtoKit-era meadow kit surfaces as preserved compatibility for the broader scene descriptor stack; this pass did not destructively replace that stack.

## Cleanup pass

- Kept ecology logic in pure descriptor kits.
- Kept grass generation, flower generation, sheep rendering, audio, browser input, Three rendering, post-processing, and frame-loop timing outside reusable kits.
- Preserved existing meadow visual fractal descriptors, grass/flower/sheep scene content, high clouds, procedural audio, post-processing, and visual-target validation.
- No route was deleted, renamed, or destructively removed.

## Non-game route handling

`high-fidelity-meadow` is an ambient scene, not a conventional small input-driven game. It was kept because it proves the high-fidelity renderer/descriptor route. The lesson from this pass is that ambient scenes need readable ecology intent: pollinator routes, shepherd paths, rest pockets, wind lanes, bloom timing, and attention beacons make the meadow feel authored without moving renderer ownership into domain kits.

## Next safe ledge

Add a deterministic meadow ecology replay fixture that samples the same seed at morning, golden hour, blue dusk, and moonlight, then snapshot-hashes visual and ecology renderer-handoff counts to catch accidental descriptor drift.
