# 2026-07-09 19:58 UTC — Third Person Follow Through wayfinding cache upgrade

## Chosen experiment

`experiments/ThirdPersonFollowThrough/`.

## Why it was chosen

The latest completed upgrade was `experiments/vr-platformer-board/storm-harbor.html`, so this run intentionally selected a different experiment. Third Person Follow Through is still one of the lowest-variability routes because its core loop is controller validation, camera follow, debug rays, and overlay inspection rather than a high-variance objective game. The upgrade adds a concrete evacuation-navigation objective layer without moving reusable logic into the renderer.

## Last upgraded experiment

Latest observed commit and turn-ledger context before this run:

- Commit `0cb3d7bef90d81384450b151b263ec426381598d`
- Message: `Log VR board storm harbor upgrade`
- Route: `experiments/vr-platformer-board/storm-harbor.html`

This run did not repeat that experiment.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Story-scene orchestration proof with scene-host actions, puzzle tokens, exits, and layered evacuation/repair overlays. | 3-7 min | Click actions, collect tokens, unlock exits, inspect readiness. | Not in latest changed moon-gate files. | Yes in upgraded entries. |
| `experiments/vr-platformer-board/storm-harbor.html` | Board-scale evacuation platformer with tide gauges, flare buoys, crane routes, supply nets, rescue skiffs, and storm harbor descriptors. | 2-4 min | A/D movement, jump, collect flare/net caches, avoid dock hazards, launch skiff readiness. | No in changed entry. | Yes in changed entry. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation with aquifer/glacier descriptors. | 2-5 min | WASD flight, pan/scan terrain, inspect generated readiness descriptors. | Not observed in latest route shell. | Yes in upgraded entries. |
| `experiments/high-fidelity-meadow/` | Procedural meadow with terrain, vegetation, creek irrigation, and soil mycelium overlays. | 3-8 min | First-person/look exploration and ecological descriptor inspection. | Not observed in latest route shell. | Yes in upgraded entries. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion lab with training, sampling, checkpoints, dataset/museum/mural/kiln readiness. | 5-15 min | Train/sample/checkpoint controls and readiness panels. | Not observed in latest route shell. | Yes in upgraded entries. |
| `experiments/living-agent-lab/` | Market-agent route with fallback/ONNX decisioning and civic festival mediation descriptors. | 3-8 min | Agent actions, market trust, permit/vendor/dispute/steward readiness. | No in changed civic entry. | Yes in upgraded entry. |
| `experiments/fogline-relay/` | First-person fog survey with scan targets, rescue, observatory, courier, and tide descriptors. | 5-8 min | Move/look, scan targets, manage fog pressure and readiness overlays. | No in latest changed entries. | Yes in upgraded entries. |
| `experiments/nexus-frontier-signal-isles/` | Field engineer island slice with scan, harvest, build, hospital, and desalination descriptors. | 6-10 min | Explore, scan, harvest, build gates/cargo, manage storm/hospital/water readiness. | No in changed entries. | Yes in upgraded entries. |
| `apps/the-cavalry-of-rome/` | Painterly Roman strategy map with logistics, diplomacy, hospital, aqueduct, beacon, and standard morale overlays. | 4-10 min | Pan map, inspect regions, campaign actions, tactical descriptors. | No in changed standard pass. | Yes in upgraded pass. |
| `games/signal-bastion/` | 2.5D defense game with tower cards, field hospital, and supply convoy descriptors. | 5-12 min | Place towers, inspect cards, survive waves, manage supply readiness. | No in changed supply entry. | Yes in upgraded entry. |
| `games/stonewake-depths/` | Flooded cavern rescue game with block carrying, pressure gates, survivors, clinic/pump/archive/cartography overlays. | 6-12 min | Carry blocks, operate valves, solve gates, rescue survivors. | No in changed entries. | Yes in upgraded entries. |
| `experiments/next-ledge/` | Grapple climb route with avalanche/weather/drone rescue descriptors. | 3-7 min | Move, grapple/action input, ledge climb, manage rescue feedback. | No in changed entries. | Yes in upgraded entries. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller validation with camera, debug rays, traversal, afterimage rescue, and wayfinding cache descriptors. | 3-6 min | Move, jump, camera follow, debug overlay, inspect route/cache readiness. | No in changed wayfinding entry. | Yes in changed wayfinding entry. |
| `experiments/sora-the-infinite/` | Open aerial gateway with rescue, lighthouse, rookery, star orchard, and sky radio descriptors. | 4-8 min | Fly/steer, inspect sky route, staged rescue descriptor overlays. | No in changed entries. | Yes in upgraded entries. |
| `experiments/zombie-orchard/` | Survival slice with rounds, horde pressure, cure/seed/well/radio/cider overlays. | 5-12 min | Move, sprint, dodge, collect, swap/use gear, fight horde. | No in latest changed entries. | Yes in upgraded entries. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with portals, inventory, harvesting, building, waves, seed vault, covenant, and quarantine descriptors. | 8-15 min | Harvest, build, fight waves, maintain base readiness. | No in changed entries. | Yes in upgraded entries. |
| `experiments/onnx-agent-lab/incident-router.html` | Incident-router workshop for model failure operations with alert beacons, trace samplers, classifier lanes, fallback briefs, shift posts, and audit ledgers. | 3-8 min | Inspect routing state, classify/fallback readiness, audit incident descriptors. | No in changed incident entry. | Yes in upgraded entry. |

## Domain ASCII tree

```txt
third-person-wayfinding-cache-readiness-domain
├─ route-marking-domain
│  ├─ chalk-arrow-domain
│  │  └─ third-person-chalk-arrow-mark-kit
│  └─ rescue-ribbon-domain
│     └─ third-person-rescue-ribbon-line-kit
├─ obstacle-assessment-domain
│  ├─ rubble-silhouette-domain
│  │  └─ third-person-rubble-silhouette-kit
│  └─ safe-step-domain
│     └─ third-person-safe-step-tile-kit
├─ supply-cache-handoff-domain
│  ├─ medkit-cache-domain
│  │  ├─ cache-stock-domain
│  │  │  └─ third-person-medkit-cache-crate-kit
│  └─ dawn-wayfinding-ledger-domain
│     └─ third-person-dawn-wayfinding-ledger-kit
└─ renderer-handoff
   └─ third-person-wayfinding-cache-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `third-person-wayfinding-cache-readiness-domain-kit`
- `third-person-chalk-arrow-mark-kit`
- `third-person-rescue-ribbon-line-kit`
- `third-person-rubble-silhouette-kit`
- `third-person-safe-step-tile-kit`
- `third-person-medkit-cache-crate-kit`
- `third-person-dawn-wayfinding-ledger-kit`
- `third-person-wayfinding-cache-renderer-handoff-kit`

The reusable kit file excludes renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics engine, storage, navigation, network, and frame-loop ownership. The browser entry owns only the route overlay presentation and consumes descriptors.

## Files changed

- `experiments/ThirdPersonFollowThrough/index.html`
- `experiments/ThirdPersonFollowThrough/app/index.js`
- `experiments/ThirdPersonFollowThrough/app/wayfinding-cache-readiness-entry.js`
- `experiments/ThirdPersonFollowThrough/kits/third-person-wayfinding-cache-readiness-domain-kit.js`
- `tests/third-person-wayfinding-cache-readiness-kits-smoke.mjs`
- `tests/third-person-wayfinding-cache-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1958-third-person-wayfinding-cache-upgrade.md`

## Tests added

- `tests/third-person-wayfinding-cache-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Validates descriptor counts, bounded readiness, bounded route pressure, bounded cache coverage, mission-state enum, JSON safety, and reusable-kit ownership boundaries.
- `tests/third-person-wayfinding-cache-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Validates route markers, cache-busted entry loading, NexusEngine main CDN import, old NexusRealtime absence, GameHost accessors, renderer handoff accessor, reusable-kit isolation, descriptor families, and readiness progression.

## Validation results

Scratch validation passed before connector writes:

```txt
node --check experiments/ThirdPersonFollowThrough/kits/third-person-wayfinding-cache-readiness-domain-kit.js
node --check experiments/ThirdPersonFollowThrough/app/wayfinding-cache-readiness-entry.js
node --check experiments/ThirdPersonFollowThrough/app/index.js
node tests/third-person-wayfinding-cache-readiness-kits-smoke.mjs
node tests/third-person-wayfinding-cache-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
Third Person wayfinding cache readiness kits smoke passed 10 intake cases.
Third Person wayfinding cache CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Not run in this connector-driven pass:

- Full `npm run check`.
- Full `npm run check:deploy`.
- Browser-rendered Playwright against GitHub Pages.

Reason: the local shell still cannot resolve `github.com`, so this run used GitHub connector reads/writes plus generated source checks and static smoke coverage instead of a full cloned workspace.

## NexusRealtime import audit

Changed files were checked for old runtime imports:

- `wayfinding-cache-readiness-entry.js` imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- The CDN/state smoke asserts no `NexusRealtime@main` or `LuminaryLabs-Dev/NexusRealtime@main` import in the changed entry.
- The reusable kit remains runtime-neutral and contains no old runtime import.

## Cleanup pass

- The route HTML now advertises `wayfinding-cache-readiness-renderer-handoff-pass`.
- The route HUD and panel now expose Wayfinding Cache as an active pass.
- `app/index.js` now imports the new cache-busted wayfinding entry after the existing afterimage rescue pass.
- `GameHost.getRendererHandoff()` is patched by composition, preserving existing handoff data and appending the `wayfindingCache` descriptor family.
- The route gains additional procedural visual variation: chalk arrows, rescue ribbons, rubble silhouettes, safe-step tiles, medkit cache crates, and a dawn wayfinding ledger.

## Non-game handling

This is a small experience-driven web route, so no delete, refactor, or rename was needed. The proof being hardened is: a third-person controller validation scene can receive richer objective descriptors while keeping controller, renderer, browser input, and reusable domain logic separate.

## Next safe ledge

The next safe upgrade is to consolidate the many Third Person overlay passes into a small route-objective selector, so medevac, traversal course, afterimage rescue, and wayfinding cache can be toggled independently while sharing one controller snapshot and one composed renderer handoff contract.
