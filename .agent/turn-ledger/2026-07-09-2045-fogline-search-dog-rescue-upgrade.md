# 2026-07-09 20:45 UTC — Fogline Relay search dog rescue upgrade

## Chosen experiment

`experiments/fogline-relay/`.

## Why it was chosen

Fogline Relay is a valid small web game with movement, scan pressure, hazards, and route state, but its latest visible value was mostly overlay accumulation. This run adds a clearer experience objective that reads as play: cast a working dog search grid, follow scent ribbons, mark pawprints, call handler whistle posts, cache thermal blankets, and prepare a rescue sled handoff before dawn.

## Last upgraded experiment

The latest observed completed changelog before this run was `experiments/infinite-radial-terrain/`, specifically the mirage caravan rescue pass.

The latest repository head also had an unlogged `nexus-frontier-signal-isles` mangrove bridge kit commit, so this run avoided both `experiments/infinite-radial-terrain/` and `experiments/nexus-frontier-signal-isles/`.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Story-scene orchestration proof with scene-host actions, route tokens, archive/ferry/bell/moon-gate overlays. | 3-7 min | Click actions, collect tokens, unlock transitions, inspect readiness panels. | Not in latest changed moon-gate files. | Yes in upgraded entries. |
| `experiments/vr-platformer-board/storm-harbor.html` | Board-scale platformer evacuation route with storm harbor readiness. | 2-4 min | A/D movement, jump, collect, avoid hazards, inspect rescue readiness. | Not in latest changed storm/medevac entries. | Yes in upgraded entries. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation with LOD, aquifer, glacier, and mirage caravan descriptors. | 2-6 min | WASD flight, vertical flight, arrow look, terrain inspection, descriptor handoff inspection. | No in changed mirage caravan files. | Yes in upgraded entries. |
| `experiments/high-fidelity-meadow/` | Procedural meadow with terrain, wind, vegetation, ecology, creek, and soil mycelium overlays. | 3-8 min | Explore meadow ecology and inspect descriptor overlays. | Not observed in latest changed files. | Yes in upgraded entries. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion lab with CPU training, sampling, checkpoints, curation, and curriculum descriptors. | 5-15 min | Train, sample, checkpoint, inspect readiness panels. | Not observed in latest changed files. | Yes in upgraded entries. |
| `experiments/living-agent-lab/` | Market-agent route with fallback/ONNX decisioning and civic festival descriptors. | 3-8 min | Agent action selection, trust state, permit/vendor/dispute/steward readiness. | No in changed civic entry. | Yes in upgraded entry. |
| `experiments/fogline-relay/` | First-person fog survey with scan targets, hazards, observatory/courier overlays, and new search dog rescue descriptors. | 5-8 min | Move/look, scan targets, manage fog pressure, cast scent grid, cache blankets, prepare sled handoff. | No in changed search dog files. | Yes; new search dog entry imports NexusEngine main CDN. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island slice with scan, harvest, build, storm, hospital, desalination, and mangrove bridge descriptors. | 6-10 min | Explore, scan, harvest, build, manage storm/water/bridge readiness. | No in changed bridge/desalination entries. | Yes in upgraded entries. |
| `apps/the-cavalry-of-rome/` | Painterly Roman strategy map with region inspection and morale descriptors. | 4-10 min | Pan/select regions, inspect campaign descriptors and tactical readiness. | No in changed standard-bearer pass. | Yes in upgraded pass. |
| `games/signal-bastion/` | 2.5D defense game with tower cards, field hospital, and supply convoy descriptors. | 5-12 min | Place towers, inspect cards, survive waves, manage supply readiness. | No in changed supply entry. | Yes in upgraded entry. |
| `games/stonewake-depths/` | Flooded cavern rescue game with valves, rune gates, survivor pings, and cartography descriptors. | 6-12 min | Carry blocks, operate valves, solve gates, rescue survivors. | No in changed cartography entry. | Yes in upgraded entry. |
| `experiments/next-ledge/` | Grapple climb route with ledge/swing validation and drone rescue descriptors. | 3-7 min | Move, grapple/action input, ledge climb, inspect rescue feedback. | No in changed entries. | Yes in upgraded entries. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller validation with traversal and afterimage descriptors. | 3-6 min | Move, camera follow, debug overlay, traverse course, inspect descriptors. | No in changed entries. | Yes in upgraded entries. |
| `experiments/sora-the-infinite/` | Open aerial gateway with rescue, lighthouse, rookery, orchard, radio, and cloud clinic descriptors. | 4-8 min | Fly/steer, inspect sky route, staged rescue overlays. | No in changed entries. | Yes in upgraded entries. |
| `experiments/zombie-orchard/` | Survival slice with horde pressure, pickups, weapons, cure, radio, and cider refuge overlays. | 5-12 min | Move, sprint, dodge, collect, fight horde, manage readiness overlays. | No in latest changed entries. | Yes in upgraded entries. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with portals, inventory, harvesting, building, waves, and quarantine descriptors. | 8-15 min | Harvest, build, fight waves, maintain base, inspect descriptors. | No in changed entries. | Yes in upgraded entries. |
| `experiments/onnx-agent-lab/incident-router.html` | Incident-router workshop for model failure operations with alert beacons and audit ledgers. | 3-8 min | Inspect routing state, classify/fallback readiness, audit incident descriptors. | No in changed incident route entry. | Yes in upgraded entry. |

## Domain ASCII tree

```txt
fogline-search-dog-rescue-readiness-domain
├─ search-grid-domain
│  ├─ scent-ribbon-domain
│  │  └─ fogline-scent-ribbon-trail-kit
│  └─ pawprint-grid-domain
│     └─ fogline-pawprint-grid-marker-kit
├─ survivor-warmth-domain
│  ├─ handler-whistle-domain
│  │  └─ fogline-handler-whistle-post-kit
│  └─ thermal-blanket-domain
│     └─ blanket-cache-domain
│        └─ fogline-thermal-blanket-cache-kit
├─ evacuation-handoff-domain
│  ├─ rescue-sled-domain
│  │  └─ fogline-rescue-sled-route-kit
│  └─ dawn-handler-ledger-domain
│     └─ fogline-dawn-handler-ledger-kit
└─ renderer-handoff
   └─ fogline-search-dog-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `experiments/fogline-relay/src/fogline-search-dog-rescue-readiness-kits.js`.

Atomic kits:

- `fogline-scent-ribbon-trail-kit`
- `fogline-pawprint-grid-marker-kit`
- `fogline-handler-whistle-post-kit`
- `fogline-thermal-blanket-cache-kit`
- `fogline-rescue-sled-route-kit`
- `fogline-dawn-handler-ledger-kit`
- `fogline-search-dog-rescue-renderer-handoff-kit`

Composite kit:

- `fogline-search-dog-rescue-readiness-domain-kit`

Ownership boundary:

- Reusable kit logic owns descriptor production only.
- Reusable kit logic does not own renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame loop, physics, storage, or network.

## Files changed

Added:

- `experiments/fogline-relay/src/fogline-search-dog-rescue-readiness-kits.js`
- `experiments/fogline-relay/src/fogline-search-dog-rescue-readiness-entry.js`
- `tests/fogline-search-dog-rescue-readiness-kits-smoke.mjs`
- `tests/fogline-search-dog-rescue-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-2045-fogline-search-dog-rescue-upgrade.md`

Updated:

- `experiments/fogline-relay/index.html`
- `experiments/_shared/nexus-gallery-data.js`

## Tests added

- `tests/fogline-search-dog-rescue-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Checks domain identity, all six descriptor families, 19 descriptor total, readiness bounds, pressure bounds, mission-state enum, JSON safety, ownership exclusions, and cold-to-ready improvement.
- `tests/fogline-search-dog-rescue-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Checks route marker, entry script, NexusEngine main CDN import, old `NexusRealtime@` absence, `GameHost` accessors, renderer handoff composition, descriptor totals, readiness/pressure bounds, and reusable-kit isolation from DOM/frame loop/audio/WebGL ownership.

## Validation results

Scratch validation run from a local file mirror before connector writes:

```txt
node --check experiments/fogline-relay/src/fogline-search-dog-rescue-readiness-kits.js
node --check experiments/fogline-relay/src/fogline-search-dog-rescue-readiness-entry.js
node --check tests/fogline-search-dog-rescue-readiness-kits-smoke.mjs
node --check tests/fogline-search-dog-rescue-cdn-state-input-smoke.mjs
node tests/fogline-search-dog-rescue-readiness-kits-smoke.mjs
node tests/fogline-search-dog-rescue-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
Fogline search dog rescue readiness kits smoke passed 10 intake cases.
Fogline search dog rescue CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full cloned workspace in this connector-driven run. The added CDN/state-input smoke performs Playwright-style source and state validation by reading the route shell and simulating 10 state cases through the new kit.

## NexusRealtime import audit

Changed entry imports NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

Changed entry does not import old `NexusRealtime@`.

Changed reusable kit source contains no DOM access, no `requestAnimationFrame`, no Three ownership, no WebGL runtime ownership, no audio ownership, no asset loading, no storage ownership, no network ownership, and no browser input ownership.

## Cleanup pass

- Preserved the existing Fogline Relay first-person renderer, scan loop, session, HUD, and prior rescue/courier/observatory overlays.
- Added the search dog rescue overlay as a browser adapter that consumes descriptor output.
- Kept reusable logic in a deterministic kit file and limited DOM/canvas work to the entry adapter.
- Composed descriptor-only handoff through `GameHost.getRendererHandoff()` instead of replacing the base handoff.
- Updated gallery metadata so the route advertises its new objective clearly.

## Non-game handling

This is a small experience-driven web route, not a non-game utility. No deletion, refactor, or rename was required.

## Next safe ledge

The next safe improvement is to make the core Fogline renderer consume the search dog descriptor families as in-world pawprints, scent ribbons, and rescue sled silhouettes while keeping the reusable kit layer renderer-neutral.
