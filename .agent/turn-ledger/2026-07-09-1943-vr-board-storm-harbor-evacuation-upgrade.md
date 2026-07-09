# 2026-07-09 19:43 UTC — VR Platformer Board storm harbor evacuation upgrade

## Chosen experiment

`experiments/vr-platformer-board/storm-harbor.html`.

## Why it was chosen

The latest completed ledger upgraded `experiments/peer-scene-transition/`, so this run intentionally selected a different experiment. VR Platformer Board remains one of the lowest-variability playable routes: a compact A/D + jump board with pickups and hazards. A prior storm-harbor shell and renderer-neutral kit existed, but the route needed final integration, gallery routing, CDN/state validation, and a logged cleanup pass to become a discoverable playable objective instead of an orphaned HTML shell.

## Last upgraded experiment

Latest observed turn-ledger before this run:

- `experiments/peer-scene-transition/`
- `.agent/turn-ledger/2026-07-09-1916-peer-scene-moon-gate-repair-upgrade.md`

This run did not repeat that experiment.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Story-scene orchestration proof with scene-host actions, puzzle tokens, exits, bell/archive/flood/courier/ferry/moon-gate overlays. | 3-7 min | Click actions, collect tokens, unlock exits, inspect readiness. | Not in latest changed moon-gate files. | Yes in upgraded entries. |
| `experiments/vr-platformer-board/storm-harbor.html` | Board-scale evacuation platformer with tide gauges, flare buoys, crane cable routes, supply nets, skiff berths, animated harbor water, and storm harbor descriptors. | 2-4 min | A/D movement, jump, collect flare/net caches, avoid dock hazards, launch skiff readiness. | No in changed entry. | Yes in changed entry. |
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
| `experiments/ThirdPersonFollowThrough/` | Third-person controller validation with camera, debug rays, traversal and afterimage rescue descriptors. | 3-6 min | Move, camera follow, debug overlay, traversal course. | No in changed entries. | Yes in upgraded entries. |
| `experiments/sora-the-infinite/` | Open aerial gateway with rescue, lighthouse, rookery, star orchard, and sky radio descriptors. | 4-8 min | Fly/steer, inspect sky route, staged rescue descriptor overlays. | No in changed entries. | Yes in upgraded entries. |
| `experiments/zombie-orchard/` | Survival slice with rounds, horde pressure, cure/seed/well/radio/cider overlays. | 5-12 min | Move, sprint, dodge, collect, swap/use gear, fight horde. | No in latest changed entries. | Yes in upgraded entries. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with portals, inventory, harvesting, building, waves, seed vault, covenant, and quarantine descriptors. | 8-15 min | Harvest, build, fight waves, maintain base readiness. | No in changed entries. | Yes in upgraded entries. |
| `experiments/onnx-agent-lab/incident-router.html` | Incident-router workshop for model failure operations with alert beacons, trace samplers, classifier lanes, fallback briefs, shift posts, and audit ledgers. | 3-8 min | Inspect routing state, classify/fallback readiness, audit incident descriptors. | No in changed incident entry. | Yes in upgraded entry. |

## Domain ASCII tree

```txt
vr-board-storm-harbor-evacuation-readiness-domain
├─ tide-warning-domain
│  ├─ harbor-tide-gauge-domain
│  │  └─ vr-board-harbor-tide-gauge-kit
│  └─ flare-buoy-domain
│     └─ vr-board-flare-buoy-marker-kit
├─ cargo-extraction-domain
│  ├─ crane-cable-domain
│  │  └─ vr-board-crane-cable-route-kit
│  └─ supply-net-domain
│     └─ vr-board-supply-net-cache-kit
├─ evacuation-handoff-domain
│  ├─ rescue-skiff-domain
│  │  ├─ skiff-berth-domain
│  │  │  └─ vr-board-rescue-skiff-berth-kit
│  └─ dawn-harbor-ledger-domain
│     └─ vr-board-dawn-harbor-ledger-kit
└─ renderer-handoff
   └─ vr-board-storm-harbor-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Finalized and integrated existing renderer-neutral storm harbor kit:

- `experiments/_kits/vr-platformer-board/vr-board-storm-harbor-evacuation-readiness-kits.js`

Atomic kits validated:

- `vr-board-harbor-tide-gauge-kit`
- `vr-board-flare-buoy-marker-kit`
- `vr-board-crane-cable-route-kit`
- `vr-board-supply-net-cache-kit`
- `vr-board-rescue-skiff-berth-kit`
- `vr-board-dawn-harbor-ledger-kit`
- `vr-board-storm-harbor-renderer-handoff-kit`

Reusable-kit ownership boundary remains outside renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame-loop ownership, physics ownership, and storage.

## Files changed

- `experiments/vr-platformer-board/storm-harbor.html`
- `experiments/vr-platformer-board/storm-harbor-evacuation-entry.js`
- `experiments/_shared/nexus-gallery-data.js`
- `tests/vr-board-storm-harbor-evacuation-readiness-kits-smoke.mjs`
- `tests/vr-board-storm-harbor-evacuation-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1943-vr-board-storm-harbor-evacuation-upgrade.md`

## Tests added

- `tests/vr-board-storm-harbor-evacuation-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Validates descriptor counts, tide/readiness bounds, mission-state enum, JSON safety, and ownership boundaries.
- `tests/vr-board-storm-harbor-evacuation-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Validates route markers, NexusEngine main CDN string, old NexusRealtime absence in changed entry, `GameHost` exposure, renderer handoff accessor, kit isolation, and descriptor families.

## Validation results

Connector/static validation completed:

- Read `.agent/README.md` before changing files.
- Read latest turn-ledger and found last upgraded experiment.
- Confirmed `storm-harbor.html` now references `storm-harbor-evacuation-entry.js?v=vr-board-storm-harbor-evacuation-2`.
- Confirmed `storm-harbor-evacuation-entry.js` imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js` and exposes `window.GameHost` with state, input, tick, readiness, tree, and renderer handoff accessors.
- Confirmed the storm harbor kit remains renderer-neutral and does not own DOM, browser input, requestAnimationFrame, canvas/WebGL, or audio.
- Scratch `node --check` was run against the generated entry/test payload before connector writes.

Not run in this connector-driven pass:

- Full `npm run check`.
- Full `npm run check:deploy`.
- Browser-rendered Playwright against GitHub Pages.

Reason: the local shell still cannot resolve `github.com`, so this run used GitHub connector reads/writes plus static smoke coverage instead of a full cloned workspace.

## NexusRealtime import audit

Changed files were checked for old runtime strings:

- `storm-harbor-evacuation-entry.js` uses NexusEngine main CDN.
- CDN/state smoke asserts no `NexusRealtime@main` or `LuminaryLabs-Dev/NexusRealtime@main` import in the changed entry.
- The changed reusable kit remains runtime-neutral and contains no old runtime import.

## Cleanup pass

- The orphaned storm harbor shell is now backed by an actual entry script.
- The gallery card now routes directly to `experiments/vr-platformer-board/storm-harbor.html` instead of leaving the new route hidden.
- The route version token was bumped to `vr-board-storm-harbor-evacuation-2`.
- The objective copy now matches the active descriptor families: tide gauges, flare buoys, crane cables, supply nets, rescue skiffs, and dawn harbor ledger.

## Non-game handling

This is a small experience-driven web game, so no delete/refactor/rename was needed. The proof being hardened is: a tiny board-scale platformer can consume atomic evacuation descriptors without moving reusable domain logic into rendering, browser input, or frame-loop ownership.

## Next safe ledge

The next safe upgrade is to consolidate the two VR Board passes, `skyline-medevac.html` and `storm-harbor.html`, behind a small board-mode selector so both objective loops share one platformer host while keeping the evacuation and medevac descriptor kits separate and testable.
