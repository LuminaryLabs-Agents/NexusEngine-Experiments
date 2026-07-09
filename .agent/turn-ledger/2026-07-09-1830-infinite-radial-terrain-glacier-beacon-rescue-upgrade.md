# 2026-07-09 18:30 UTC — Infinite Radial Terrain glacier beacon rescue upgrade

## Chosen experiment

`experiments/infinite-radial-terrain/`.

## Why it was chosen

The latest run upgraded `apps/the-cavalry-of-rome/`, so this run intentionally selected a different route. `experiments/infinite-radial-terrain/` is still one of the lowest-variability experiences in the gallery because its base loop is mostly free-flight over procedural terrain plus descriptor overlays. The upgrade adds a concrete mountain-rescue objective layer without disrupting the terrain renderer: establish cairn beacons, smoke columns, ice bridge flags, crevasse ropes, sled caches, and a dawn beacon ledger.

## Last upgraded experiment

The latest observed completed upgrade before this run was `apps/the-cavalry-of-rome/`, specifically the standard bearer morale pass. The latest commit sequence included:

- `Add Cavalry standard bearer morale kits`
- `Wire Cavalry standard bearer morale entry`
- `Add Cavalry standard bearer morale kit smoke`
- `Add Cavalry standard bearer morale CDN smoke`
- `Load Cavalry standard bearer morale pass`
- `Update gallery for Cavalry standard morale`
- `Log Cavalry standard bearer morale upgrade`

This run did not repeat that experiment.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Scene host puzzle proof with tokens, exits, oracle/readability, clue pressure, evidence ritual, archive/shelter/flood/courier/bell archive overlays. | 3-6 min | Click scene actions, inspect debug state, unlock transition routes. | Not observed in inventory shell; route uses shared scene modules. | Existing overlays likely yes where upgraded. |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale jump rescue pass with tether, wind, oxygen, medevac descriptors. | 2-4 min | A/D movement, jump, collect, avoid hazards, medevac readiness. | No in changed medevac entry. | Yes in upgraded entry. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation with LOD, aquifer cartography, and glacier beacon rescue descriptors. | 2-6 min | WASD flight, vertical flight, mouse look, terrain readback, inspect route-readiness overlays. | No in changed glacier entry. | Yes in changed glacier entry. |
| `experiments/high-fidelity-meadow/` | Procedural meadow with terrain, vegetation, ecology, creek irrigation, and soil mycelium overlays. | 3-8 min | First-person/look exploration, visual target inspection, ecological descriptor overlays. | Not observed in changed route inventory. | Yes in upgraded entries. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion lab with CPU training, sampling, checkpoints, dataset expedition, museum, mural, curriculum kiln readiness. | 5-15 min | Train/sample/checkpoint controls, inspect generated readiness panels. | Not observed in changed route inventory. | Yes in upgraded entries. |
| `experiments/living-agent-lab/` | Market-agent route with fallback/ONNX decisioning and civic festival mediation descriptors. | 3-8 min | Agent action selection, market trust, permit/vendor/dispute/steward readiness. | No in changed civic entry. | Yes in upgraded entry. |
| `experiments/fogline-relay/` | First-person fog survey with scan targets, hazards, rescue overlays, observatory, courier descriptors. | 5-8 min | Move/look, scan targets, handle fog pressure, trigger rescue/courier readiness. | No in changed courier entry. | Yes in upgraded entries. |
| `experiments/nexus-frontier-signal-isles/` | Field engineer island slice with scan, harvest, build, pressure, hospital, desalination descriptors. | 6-10 min | Explore, scan, harvest, build gates/cargo, handle storm/hospital/water readiness. | No in changed entries. | Yes in upgraded entries. |
| `apps/the-cavalry-of-rome/` | Painterly Roman strategy map with panning, hover/dive, army visualization, logistics/diplomacy/hospital/grain/aqueduct/beacon/standard morale overlays. | 4-10 min | Pan map, select/inspect regions, campaign actions, tactical descriptor overlays. | No in latest standard morale pass. | Yes in upgraded entry. |
| `games/signal-bastion/` | 2.5D defense game with tower cards, range rings, field hospital, supply convoy descriptors. | 5-12 min | Place towers, inspect cards, survive waves, manage supply/repair readiness. | No in changed supply entry. | Yes in upgraded entry. |
| `games/stonewake-depths/` | Flooded cavern rescue game with block carrying, pressure, rune gates, survivor pings, clinic/pump/archive/cartography overlays. | 6-12 min | Carry blocks, operate valves, solve gates, rescue survivors, manage rescue descriptors. | No in changed entries. | Yes in upgraded entries. |
| `experiments/next-ledge/` | Grapple climb route with ledge/swing validation, avalanche/weather/drone rescue descriptors. | 3-7 min | Move, grapple/action input, ledge climb, manage feedback and rescue readiness. | No in changed entries. | Yes in upgraded entries. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller validation with camera, debug rays, traversal/afterimage rescue descriptors. | 3-6 min | Move, camera follow, debug overlay, traverse course, inspect rescue descriptors. | No in changed entries. | Yes in upgraded entries. |
| `experiments/sora-the-infinite/` | Open aerial gateway with rescue/lighthouse/rookery/star orchard/sky radio descriptors. | 4-8 min | Fly/steer, inspect sky route, staged rescue descriptor overlays. | No in changed entries. | Yes in upgraded entries. |
| `experiments/zombie-orchard/` | Survival slice with rounds, horde pressure, pickups, weapons, cure/seed/well/radio/cider overlays. | 5-12 min | Move, sprint, dodge, collect, swap/use gear, fight horde, readiness overlays. | No in latest changed entries. | Yes in upgraded entries. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with portals, inventory, harvesting, building, waves, covenant descriptors. | 8-15 min | Harvest, build, fight waves, maintain base, manage covenant descriptors. | No in changed covenant entry. | Yes in upgraded entry. |
| `experiments/onnx-agent-lab/signal-calibration.html` | Workshop route for model handshake, fallback rails, tool cues, prompt intent, memory traces, scene gates. | 3-8 min | Inspect tools, calibrate signal, validate fallback/model readiness. | No in changed signal calibration entry. | Yes in upgraded entry. |

## Domain ASCII tree

```txt
terrain-glacier-beacon-rescue-readiness-domain
├─ whiteout-navigation-domain
│  ├─ moraine-cairn-domain
│  │  └─ terrain-moraine-cairn-beacon-kit
│  └─ signal-smoke-domain
│     └─ terrain-whiteout-signal-smoke-kit
├─ traverse-stability-domain
│  ├─ ice-bridge-flag-domain
│  │  └─ terrain-ice-bridge-flag-kit
│  └─ crevasse-rope-domain
│     └─ rope-tension-domain
│        └─ terrain-crevasse-rope-rake-kit
├─ rescue-handoff-domain
│  ├─ rescue-sled-cache-domain
│  │  └─ terrain-rescue-sled-cache-kit
│  └─ dawn-beacon-ledger-domain
│     └─ terrain-dawn-beacon-ledger-kit
└─ renderer-handoff
   └─ terrain-glacier-beacon-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `experiments/_kits/infinite-radial-terrain/terrain-glacier-beacon-rescue-readiness-kits.js`.

Atomic kits:

- `terrain-moraine-cairn-beacon-kit`
- `terrain-whiteout-signal-smoke-kit`
- `terrain-ice-bridge-flag-kit`
- `terrain-crevasse-rope-rake-kit`
- `terrain-rescue-sled-cache-kit`
- `terrain-dawn-beacon-ledger-kit`
- `terrain-glacier-beacon-rescue-renderer-handoff-kit`

Composite kit:

- `terrain-glacier-beacon-rescue-readiness-domain-kit`

Ownership boundary:

- Reusable kit logic owns descriptor production only.
- Reusable kit logic does not own renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame loop, physics, storage, or network.

## Files changed

Added:

- `experiments/_kits/infinite-radial-terrain/terrain-glacier-beacon-rescue-readiness-kits.js`
- `experiments/infinite-radial-terrain/terrain-glacier-beacon-rescue-readiness-entry.js`
- `tests/terrain-glacier-beacon-rescue-readiness-kits-smoke.mjs`
- `tests/terrain-glacier-beacon-rescue-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1830-infinite-radial-terrain-glacier-beacon-rescue-upgrade.md`

Updated:

- `experiments/infinite-radial-terrain/index.html`
- `experiments/_shared/nexus-gallery-data.js`

## Tests added

- `tests/terrain-glacier-beacon-rescue-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Checks six descriptor families, readiness bounds, whiteout risk bounds, status enum, descriptor-only renderer handoff, JSON safety, prepared-state improvement, and renderer ownership exclusions.
- `tests/terrain-glacier-beacon-rescue-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Checks route marker, cache-busted script, NexusEngine main CDN import, absence of old `NexusRealtime@` import in the changed entry, `GameHost` accessors, reusable kit isolation, descriptor totals, readiness bounds, whiteout risk bounds, and status enum.

## Validation results

Scratch validation run from a local file mirror before connector writes:

```txt
node --check experiments/_kits/infinite-radial-terrain/terrain-glacier-beacon-rescue-readiness-kits.js
node --check experiments/infinite-radial-terrain/terrain-glacier-beacon-rescue-readiness-entry.js
node --check tests/terrain-glacier-beacon-rescue-readiness-kits-smoke.mjs
node --check tests/terrain-glacier-beacon-rescue-cdn-state-input-smoke.mjs
node tests/terrain-glacier-beacon-rescue-readiness-kits-smoke.mjs
node tests/terrain-glacier-beacon-rescue-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
Terrain glacier beacon rescue readiness kits smoke passed 10 intake cases.
Terrain glacier beacon rescue CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full cloned workspace in this connector-driven run. The added CDN/state-input smoke performs the requested local Playwright-style source and state validation by reading the route shell and simulating 10 state cases through the kit.

## NexusRealtime import audit

Changed entry imports NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

Changed entry does not import old `NexusRealtime@`.

Changed reusable kit source contains no DOM access, no `requestAnimationFrame`, no browser input listener, no audio ownership, no asset loading, and no graphics runtime ownership. The ownership exclusion strings mention Three.js/WebGL only as forbidden responsibilities.

## Cleanup pass

- Preserved the existing radial terrain renderer and all prior overlays.
- Added glacier beacon rescue as a descriptor overlay instead of putting decision logic in the renderer.
- Updated the route metadata, HUD copy, hidden pass marker, and script list.
- Updated gallery metadata to reflect the new Glacier Beacon rescue layer.
- Kept the route stable at `./experiments/infinite-radial-terrain/`.

## Non-game handling

The route is a small experience-driven terrain demo rather than a traditional game. It was not deleted or renamed because it is useful as a procedural terrain, LOD, and descriptor-composition proof. The lesson is that a free-flight terrain proof becomes more legible when the player is given a concrete rescue-cartography objective to inspect.

## Next safe ledge

Fold the stacked terrain overlays into a single renderer-only expedition board that reads `GameHost.getRendererHandoff()` and groups aquifer, skybridge, avalanche, observatory, and glacier beacon descriptors by urgency. Keep all scoring in kits and keep the board presentation-only.
