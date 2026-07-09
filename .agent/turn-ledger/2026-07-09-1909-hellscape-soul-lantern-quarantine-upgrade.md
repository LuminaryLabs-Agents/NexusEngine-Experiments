# 2026-07-09 19:09 UTC — Rogue-Lite Hellscape soul lantern quarantine upgrade

## Chosen experiment

`games/rogue-lite-hellscape-siege/`.

## Why it was chosen

The latest observed repository head before this run was a `peer-scene-transition` ferry lantern convoy commit, so this run intentionally selected a different route. `games/rogue-lite-hellscape-siege/` already had a strong base-siege loop, but its newest covenant pass still made plague containment feel implicit rather than playable/readable. The upgrade adds a concrete quarantine logistics layer with containment rings, soul-lantern stakes, trenches, mist vanes, cure caches, and a dusk quarantine ledger.

## Last upgraded experiment

`experiments/peer-scene-transition/` — ferry lantern convoy entry was the latest observed head commit before this run.

Latest observed completed changelog before selection: `.agent/turn-ledger/2026-07-09-1843-onnx-workshop-incident-router-upgrade.md`.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Scene host puzzle proof with scene state, puzzle tokens, route exits, bell archive, and ferry lantern convoy overlays. | 3-6 min | Click scene actions, inspect state, unlock transitions, read convoy readiness. | Not observed in changed ferry entry. | Yes in changed entry. |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board platformer rescue pass with tether, wind, oxygen, and medevac staging. | 2-4 min | A/D move, jump, collect, avoid hazards, build medevac readiness. | No in changed medevac entry. | Yes in changed entry. |
| `experiments/infinite-radial-terrain/` | Radial terrain tessellation with LOD, aquifer cartography, and glacier rescue overlays. | 2-6 min | WASD/vertical flight, inspect terrain, read rescue overlays. | No in changed glacier entry. | Yes in changed entries. |
| `experiments/high-fidelity-meadow/` | Procedural meadow with vegetation, creek irrigation, ecology, and soil mycelium overlays. | 3-8 min | Explore/look, inspect visual targets, read ecological descriptors. | Not observed in changed entries. | Yes in changed entries. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion lab with training, sampling, checkpoints, museum/mural/kiln readiness. | 5-15 min | Train, sample, checkpoint, inspect generated readiness panels. | Not observed in changed entries. | Yes in changed entries. |
| `experiments/living-agent-lab/` | Market-agent route with ONNX/fallback action choice and civic mediation descriptors. | 3-8 min | Agent action selection, trust changes, permit/vendor/dispute/steward readiness. | No in changed civic entry. | Yes in changed entry. |
| `experiments/fogline-relay/` | First-person fog survey with scan targets, hazards, observatory, courier evacuation overlays. | 5-8 min | Move/look, scan targets, manage fog pressure and relay descriptors. | No in changed courier entry. | Yes in changed entries. |
| `experiments/nexus-frontier-signal-isles/` | Field engineer island slice with scan, harvest, build, storm, hospital, and desalination descriptors. | 6-10 min | Explore, scan, harvest, build, gate cargo, manage storm/hospital/water readiness. | No in changed entries. | Yes in changed entries. |
| `apps/the-cavalry-of-rome/` | Roman strategy map with panning, hover/dive, armies, logistics, diplomacy, hospital, grain, aqueduct, beacon, and standard morale overlays. | 4-10 min | Pan map, select regions, inspect campaign descriptors. | No in latest standard morale pass. | Yes in changed entries. |
| `games/signal-bastion/` | 2.5D tower-defense game with tower cards, range rings, field hospital, and supply convoy descriptors. | 5-12 min | Place towers, inspect cards, survive waves, manage supply readiness. | No in changed supply entry. | Yes in changed entry. |
| `games/stonewake-depths/` | Flooded cavern rescue with block carry, pressure valves, gates, survivor pings, pump/archive/cartography overlays. | 6-12 min | Carry blocks, operate valves, solve gates, rescue survivors. | No in changed entries. | Yes in changed entries. |
| `experiments/next-ledge/` | Grapple climb validation with ledges, swing pressure, avalanche/weather/drone rescue overlays. | 3-7 min | Move, grapple/action input, climb, manage rescue readiness. | No in changed entries. | Yes in changed entries. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller validation with camera, debug rays, traversal course, and afterimage rescue descriptors. | 3-6 min | Move, camera follow, inspect debug overlay, traverse course. | No in changed entries. | Yes in changed entries. |
| `experiments/sora-the-infinite/` | Open aerial gateway with rescue, lighthouse, rookery, star orchard, and radio beacon overlays. | 4-8 min | Fly/steer, inspect sky route, stage rescue descriptors. | No in changed entries. | Yes in changed entries. |
| `experiments/zombie-orchard/` | Survival slice with rounds, horde pressure, pickups, weapons, cure/seed/well/radio/cider overlays. | 5-12 min | Move, sprint, dodge, collect, swap/use gear, fight horde. | No in latest changed entries. | Yes in changed entries. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with portals, inventory, harvesting, building, waves, covenant descriptors, and new quarantine containment descriptors. | 8-15 min | Harvest, build, fight waves, maintain base, read plague quarantine readiness. | Existing page loader path still contains `nexus-realtime-page-loader`; changed quarantine entry has no old `NexusRealtime@` import. | Yes in main and changed quarantine entry. |
| `experiments/onnx-agent-lab/incident-router.html` | ONNX workshop route for incident operations with alert, trace, classifier, fallback, shift, and audit descriptors. | 3-8 min | Click desk actions, improve trace quality, route fallback, load model, escalate incidents. | No in changed incident-router entry. | Yes in changed entry. |

## Domain ASCII tree

```txt
hellscape-soul-lantern-quarantine-readiness-domain
├─ infection-containment-domain
│  ├─ quarantine-circle-domain
│  │  └─ hellscape-quarantine-circle-kit
│  └─ soul-lantern-stake-domain
│     └─ hellscape-soul-lantern-stake-kit
├─ breach-routing-domain
│  ├─ ashward-trench-domain
│  │  └─ hellscape-ashward-trench-kit
│  └─ plague-mist-vane-domain
│     └─ hellscape-plague-mist-vane-kit
├─ survivor-cure-handoff-domain
│  ├─ cure-totem-cache-domain
│  │  └─ hellscape-cure-totem-cache-kit
│  └─ dusk-quarantine-ledger-domain
│     └─ hellscape-dusk-quarantine-ledger-kit
└─ renderer-handoff
   └─ hellscape-soul-lantern-quarantine-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `games/rogue-lite-hellscape-siege/src/hellscape-soul-lantern-quarantine-readiness-domain-kit.js`.

Atomic kits:

- `hellscape-quarantine-circle-kit`
- `hellscape-soul-lantern-stake-kit`
- `hellscape-ashward-trench-kit`
- `hellscape-plague-mist-vane-kit`
- `hellscape-cure-totem-cache-kit`
- `hellscape-dusk-quarantine-ledger-kit`
- `hellscape-soul-lantern-quarantine-renderer-handoff-kit`

Composite kit:

- `hellscape-soul-lantern-quarantine-readiness-domain-kit`

Ownership boundary: reusable kit logic owns descriptor production only and does not own renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame loop, physics, or storage.

## Files changed

Added:

- `games/rogue-lite-hellscape-siege/src/hellscape-soul-lantern-quarantine-readiness-domain-kit.js`
- `games/rogue-lite-hellscape-siege/src/hellscape-soul-lantern-quarantine-readiness-entry.js`
- `tests/hellscape-soul-lantern-quarantine-readiness-kits-smoke.mjs`
- `tests/hellscape-soul-lantern-quarantine-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1909-hellscape-soul-lantern-quarantine-upgrade.md`

Updated:

- `games/rogue-lite-hellscape-siege/index.html`
- `experiments/_shared/nexus-gallery-data.js`

## Tests added

- `tests/hellscape-soul-lantern-quarantine-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Checks domain tree, ownership exclusions, descriptor families, readiness bounds, pressure bounds, phase enum, descriptor-only handoff, JSON safety, descriptor floor, and readiness improvement.
- `tests/hellscape-soul-lantern-quarantine-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Checks route marker, entry script, NexusEngine main CDN import, old `NexusRealtime@` absence in the changed entry, `GameHost` accessors, reusable-kit isolation, descriptor floor, readiness bounds, and readiness improvement.

## Validation results

Scratch validation run from a local file mirror before connector writes:

```txt
node --check games/rogue-lite-hellscape-siege/src/hellscape-soul-lantern-quarantine-readiness-domain-kit.js
node --check games/rogue-lite-hellscape-siege/src/hellscape-soul-lantern-quarantine-readiness-entry.js
node --check tests/hellscape-soul-lantern-quarantine-readiness-kits-smoke.mjs
node --check tests/hellscape-soul-lantern-quarantine-cdn-state-input-smoke.mjs
node --check experiments/_shared/nexus-gallery-data.js
node tests/hellscape-soul-lantern-quarantine-readiness-kits-smoke.mjs
node tests/hellscape-soul-lantern-quarantine-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
Hellscape soul lantern quarantine readiness kits smoke passed 10 intake cases.
Hellscape soul lantern quarantine CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

A validation issue was caught and fixed before commit: the cold-start intake case produced only 14 descriptors, below the visual descriptor floor. The ashward trench and cure cache minimum counts were raised so every case emits at least 16 descriptors.

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full cloned workspace in this connector-driven run. The added CDN/state-input smoke performs the requested local Playwright-style source and state validation by reading the route shell and simulating 10 state/input cases through the kit.

## NexusRealtime import audit

Changed entry imports NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

Changed entry does not import old `NexusRealtime@`.

The existing route shell still imports the shared `nexus-realtime-page-loader.js` path for loader UI compatibility. This run did not delete that shared loader dependency because it is not part of the reusable quarantine kit and would be a broader gallery/runtime cleanup. The new quarantine entry and kit are migrated toward NexusEngine main CDN use where changed.

Changed reusable kit source contains no DOM access, no `window`, no `document`, no `requestAnimationFrame`, no browser input listener, no audio ownership, no asset loading, no physics ownership, and no graphics runtime ownership. The ownership exclusion strings mention Three.js/WebGL only as forbidden responsibilities.

## Cleanup pass

- Preserved the existing Hellscape base-siege runtime and prior overlays.
- Added the quarantine pass as an additive descriptor layer rather than deleting previous covenant/forge/refuge/well/vault passes.
- Kept descriptor generation in a reusable domain kit.
- Kept DOM panel rendering in the entry file only.
- Updated gallery metadata to surface `Soul Quarantine` instead of leaving the route only at `Harvester Covenant`.
- No destructive changes.
- No files deleted.
- No branches created.
- No other repo modified.

## Non-game handling

`games/rogue-lite-hellscape-siege/` is already a small experience-driven web game, so no rename/delete/refactor was needed. The new pass preserves the base game and adds a readable quarantine objective layer over the existing wave-defense loop.

## Next safe ledge

Move the soul-lantern descriptors from HUD-only readability into the canvas renderer as descriptor consumers: draw quarantine rings, lantern stakes, and trench threads directly around base/portal pressure zones while keeping all scoring and descriptor generation inside the reusable kit.
