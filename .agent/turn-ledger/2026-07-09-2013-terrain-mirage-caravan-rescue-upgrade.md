# 2026-07-09 20:13 UTC — Infinite Radial Terrain mirage caravan rescue upgrade

## Chosen experiment

`experiments/infinite-radial-terrain/`.

## Why it was chosen

The route is valuable as a large terrain/LOD proof, but it remains one of the least game-like entries because its core loop is camera flight, terrain inspection, and descriptor overlays. This run adds a concrete rescue objective layer without deleting the terrain renderer, existing radial domain, expedition readability, wayfinding, survey contract, basecamp, avalanche, observatory, skybridge, aquifer, or glacier beacon passes.

## Last upgraded experiment

The latest observed changelog before this run was `experiments/peer-scene-transition/`, specifically the moon-gate repair pass.

This run intentionally chose a different experiment.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Story-scene orchestration proof with scene-host actions, route tokens, evidence/archive/shelter/flood/courier/bell/ferry overlays, and moon-gate repair descriptors. | 3-7 min | Click actions, collect puzzle tokens, unlock transitions, inspect readiness panels. | Not in latest changed moon-gate files. | Yes in upgraded entries. |
| `experiments/vr-platformer-board/storm-harbor.html` | Board-scale platformer evacuation route with jump/collect/hazard play and storm harbor readiness. | 2-4 min | A/D movement, jump, collect, avoid hazards, inspect rescue readiness. | Not in latest changed storm/medevac entries. | Yes in upgraded entries. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation with LOD, expedition, wayfinding, aquifer, glacier beacon rescue, and new mirage caravan rescue descriptors. | 2-6 min | WASD flight, vertical flight, arrow look, terrain inspection, readiness overlays, descriptor handoff inspection. | No in changed mirage caravan files. | Yes; new mirage caravan entry imports NexusEngine main CDN. |
| `experiments/high-fidelity-meadow/` | Procedural meadow scene with terrain, wind, vegetation, ecology, creek irrigation, and soil mycelium overlays. | 3-8 min | Explore/inspect meadow ecology and descriptor overlays. | Not observed in latest changed files. | Yes in upgraded entries. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion lab with CPU training, sampling, checkpoints, dataset, museum, mural, and curriculum kiln readiness. | 5-15 min | Train/sample/checkpoint controls and readiness panels. | Not observed in latest changed files. | Yes in upgraded entries. |
| `experiments/living-agent-lab/` | Market-agent route with fallback/ONNX decisioning and civic festival mediation descriptors. | 3-8 min | Agent action selection, trust state, permit/vendor/dispute/steward readiness. | No in changed civic entry. | Yes in upgraded entry. |
| `experiments/fogline-relay/` | First-person fog survey with scan targets, hazards, observatory/courier/tide evacuation descriptors. | 5-8 min | Move/look, scan targets, manage fog pressure and readiness overlays. | No in changed tide/courier entries. | Yes in upgraded entries. |
| `experiments/nexus-frontier-signal-isles/` | Field engineer island slice with scan, harvest, build, storm, hospital, and desalination descriptors. | 6-10 min | Explore, scan, harvest, build, manage storm/hospital/water readiness. | No in changed entries. | Yes in upgraded entries. |
| `apps/the-cavalry-of-rome/` | Painterly Roman strategy map with region inspection, campaign overlays, beacon chain, and standard morale descriptors. | 4-10 min | Pan/select regions, inspect campaign descriptors and tactical readiness. | No in changed standard-bearer pass. | Yes in upgraded pass. |
| `games/signal-bastion/` | 2.5D defense game with tower cards, range rings, field hospital, and supply convoy descriptors. | 5-12 min | Place towers, inspect cards, survive waves, manage supply/repair readiness. | No in changed supply entry. | Yes in upgraded entry. |
| `games/stonewake-depths/` | Flooded cavern rescue game with carrying, valves, rune gates, survivor pings, and glowworm cartography. | 6-12 min | Carry blocks, operate valves, solve gates, rescue survivors, manage cave descriptors. | No in changed cartography entry. | Yes in upgraded entry. |
| `experiments/next-ledge/` | Grapple climb route with ledge/swing validation and avalanche/weather/drone rescue descriptors. | 3-7 min | Move, grapple/action input, ledge climb, manage rescue feedback. | No in changed entries. | Yes in upgraded entries. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller validation with camera, debug rays, traversal/afterimage rescue descriptors. | 3-6 min | Move, camera follow, debug overlay, traverse course, inspect descriptors. | No in changed entries. | Yes in upgraded entries. |
| `experiments/sora-the-infinite/` | Open aerial gateway with rescue, lighthouse, rookery, star orchard, sky radio, and cloud clinic descriptors. | 4-8 min | Fly/steer, inspect sky route, staged rescue overlays. | No in changed entries. | Yes in upgraded entries. |
| `experiments/zombie-orchard/` | Survival slice with rounds, horde pressure, pickups, weapons, cure/seed/well/radio/cider overlays. | 5-12 min | Move, sprint, dodge, collect, fight horde, manage readiness overlays. | No in latest changed entries. | Yes in upgraded entries. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with portals, inventory, harvesting, building, waves, seed vault, and quarantine descriptors. | 8-15 min | Harvest, build, fight waves, maintain base, inspect covenant/quarantine descriptors. | No in changed entries. | Yes in upgraded entries. |
| `experiments/onnx-agent-lab/incident-router.html` | Incident-router workshop for model failure operations with alert beacons, trace samplers, classifier lanes, fallback briefs, shift posts, and audit ledgers. | 3-8 min | Inspect routing state, classify/fallback readiness, audit incident descriptors. | No in changed incident route entry. | Yes in upgraded entry. |

## Domain ASCII tree

```txt
terrain-mirage-caravan-rescue-readiness-domain
├─ oasis-location-domain
│  ├─ mirage-well-domain
│  │  └─ terrain-mirage-well-marker-kit
│  └─ shade-sail-domain
│     └─ terrain-shade-sail-canopy-kit
├─ caravan-route-domain
│  ├─ camel-bell-domain
│  │  └─ terrain-camel-bell-trail-kit
│  └─ dune-stake-domain
│     ├─ wind-break-subdomain
│     │  └─ terrain-dune-stake-windbreak-kit
├─ survival-supply-domain
│  ├─ water-skin-cache-domain
│  │  └─ terrain-water-skin-cache-kit
│  └─ dusk-caravan-ledger-domain
│     └─ terrain-dusk-caravan-ledger-kit
└─ renderer-handoff
   └─ terrain-mirage-caravan-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `experiments/_kits/infinite-radial-terrain/terrain-mirage-caravan-rescue-readiness-kits.js`.

Atomic kits:

- `terrain-mirage-well-marker-kit`
- `terrain-shade-sail-canopy-kit`
- `terrain-camel-bell-trail-kit`
- `terrain-dune-stake-windbreak-kit`
- `terrain-water-skin-cache-kit`
- `terrain-dusk-caravan-ledger-kit`
- `terrain-mirage-caravan-rescue-renderer-handoff-kit`

Composite kit:

- `terrain-mirage-caravan-rescue-readiness-domain-kit`

Ownership boundary:

- Reusable kit logic owns descriptor production only.
- Reusable kit logic does not own renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame loop, physics, storage, or network.

## Files changed

Added:

- `experiments/_kits/infinite-radial-terrain/terrain-mirage-caravan-rescue-readiness-kits.js`
- `experiments/infinite-radial-terrain/terrain-mirage-caravan-rescue-readiness-entry.js`
- `tests/terrain-mirage-caravan-rescue-readiness-kits-smoke.mjs`
- `tests/terrain-mirage-caravan-rescue-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-2013-terrain-mirage-caravan-rescue-upgrade.md`

Updated:

- `experiments/infinite-radial-terrain/index.html`

## Tests added

- `tests/terrain-mirage-caravan-rescue-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Checks domain identity, all six descriptor families, descriptor count, readiness bounds, heat-risk bounds, mission enum, JSON safety, cold-to-ready improvement, and ownership exclusions.
- `tests/terrain-mirage-caravan-rescue-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Checks route markers, NexusEngine main CDN import, absence of old `NexusRealtime@` in the changed entry, `GameHost` mirage caravan accessors, renderer handoff composition, descriptor totals, readiness bounds, heat-risk bounds, and reusable-kit isolation from DOM/frame loop/audio/WebGL ownership.

## Validation results

Scratch validation run from a local file mirror before connector writes:

```txt
node --check experiments/_kits/infinite-radial-terrain/terrain-mirage-caravan-rescue-readiness-kits.js
node --check experiments/infinite-radial-terrain/terrain-mirage-caravan-rescue-readiness-entry.js
node --check tests/terrain-mirage-caravan-rescue-readiness-kits-smoke.mjs
node --check tests/terrain-mirage-caravan-rescue-cdn-state-input-smoke.mjs
node tests/terrain-mirage-caravan-rescue-readiness-kits-smoke.mjs
node tests/terrain-mirage-caravan-rescue-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
Terrain mirage caravan rescue readiness kits smoke passed 10 intake cases.
Terrain mirage caravan rescue CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full cloned workspace because shell git could not resolve `github.com`. The added CDN/state-input smoke performs Playwright-style route/source validation by reading the route shell and simulating 10 state cases through the kit.

## NexusRealtime import audit

Changed entry imports NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

Changed entry does not import old `NexusRealtime@`.

Changed reusable kit source contains no DOM access, no `requestAnimationFrame`, no WebGL/Three ownership, no audio ownership, no asset loading, no storage ownership, no network ownership, and no browser input ownership.

## Cleanup pass

- Preserved the existing terrain renderer and all previous descriptor overlays.
- Added the mirage caravan rescue overlay as a browser adapter that consumes descriptor output.
- Kept the new reusable logic in `_kits` and limited browser/DOM work to the entry adapter.
- Added descriptor-only handoff composition through `GameHost.getRendererHandoff()`.
- Did not remove any existing terrain, expedition, wayfinding, rescue, or cartography functionality.

## Non-game handling

This is a small experience-driven web route, not a non-game utility. No deletion, refactor, or rename was required.

## Next safe ledge

The next safe improvement is to let the core terrain renderer consume the mirage descriptor families as in-world rings, trails, and cache markers, while keeping the entry adapter as a thin UI/status layer and preserving the reusable kit ownership boundary.
