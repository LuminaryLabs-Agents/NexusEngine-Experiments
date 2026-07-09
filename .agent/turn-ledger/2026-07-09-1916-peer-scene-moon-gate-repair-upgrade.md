# 2026-07-09 19:16 UTC — Peer Scene moon gate repair upgrade

## Chosen experiment

`experiments/peer-scene-transition/`.

## Why it was chosen

The route is a useful scene-host proof, but compared with the more complete survival, tower-defense, flight, cave-rescue, and third-person routes, it still has a low-variability interaction loop: click actions, receive puzzle tokens, unlock exits, and inspect debug state. The upgrade adds a concrete threshold-repair objective layer without deleting the existing scene host, transition, evidence, archive, shelter, flood, courier, bell, or ferry passes.

## Last upgraded experiment

The latest observed upgrade before this run was `apps/the-cavalry-of-rome/`, specifically the standard-bearer morale pass. The latest ledger named:

- `experiments/The Cavalry of Rome/src/cavalry-standard-bearer-morale-readiness-domain-kit.js`
- `experiments/The Cavalry of Rome/src/cavalry-standard-bearer-morale-readiness-pass.js`
- `apps/the-cavalry-of-rome/index.html`

This run intentionally chose a different experiment.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Story-scene orchestration proof with scene-host actions, route tokens, evidence/archive/shelter/flood/courier/bell/ferry overlays, and new moon-gate repair descriptors. | 3-7 min | Click actions, collect puzzle tokens, unlock transitions, inspect readiness panels. | Not in changed moon-gate files. | Yes; new moon-gate entry imports NexusEngine main CDN. |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale jump rescue pass with tether, wind, oxygen, medevac descriptors. | 2-4 min | A/D movement, jump, collect, avoid hazards, medevac readiness. | No in changed medevac entry. | Yes in upgraded entry. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation with LOD, aquifer, and glacier beacon descriptors. | 2-5 min | WASD flight, pan/scan terrain, inspect generated route-readiness descriptors. | Not observed in latest inventory shell. | Yes in upgraded entries. |
| `experiments/high-fidelity-meadow/` | Procedural meadow with terrain, vegetation, ecology, creek irrigation, and soil mycelium overlays. | 3-8 min | First-person/look exploration, visual target inspection, ecological descriptor overlays. | Not observed in latest inventory shell. | Yes in upgraded entries. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion lab with CPU training, sampling, checkpoints, dataset, museum, mural, and curriculum kiln readiness. | 5-15 min | Train/sample/checkpoint controls and readiness panels. | Not observed in latest inventory shell. | Yes in upgraded entries. |
| `experiments/living-agent-lab/` | Market-agent route with fallback/ONNX decisioning and civic festival mediation descriptors. | 3-8 min | Agent action selection, market trust, permit/vendor/dispute/steward readiness. | No in changed civic entry. | Yes in upgraded entry. |
| `experiments/fogline-relay/` | First-person fog survey with scan targets, hazards, rescue, observatory, courier, and tide descriptors. | 5-8 min | Move/look, scan targets, handle fog pressure, trigger readiness overlays. | No in changed observatory/courier/tide entries. | Yes in upgraded entries. |
| `experiments/nexus-frontier-signal-isles/` | Field engineer island slice with scan, harvest, build, pressure, hospital, and desalination descriptors. | 6-10 min | Explore, scan, harvest, build gates/cargo, handle storm/hospital/water readiness. | No in changed entries. | Yes in upgraded entries. |
| `apps/the-cavalry-of-rome/` | Painterly Roman strategy map with panning, hover/dive, army visualization, logistics, diplomacy, hospital, grain, aqueduct, beacon, and standard morale overlays. | 4-10 min | Pan map, select/inspect regions, campaign actions, tactical descriptor overlays. | No in changed standard-bearer pass. | Yes in upgraded pass. |
| `games/signal-bastion/` | 2.5D defense game with tower cards, range rings, field hospital, and supply convoy descriptors. | 5-12 min | Place towers, inspect cards, survive waves, manage supply/repair readiness. | No in changed supply entry. | Yes in upgraded entry. |
| `games/stonewake-depths/` | Flooded cavern rescue game with block carrying, pressure, rune gates, survivor pings, clinic/pump/archive/cartography overlays. | 6-12 min | Carry blocks, operate valves, solve gates, rescue survivors, manage rescue descriptors. | No in changed cartography entry. | Yes in upgraded entry. |
| `experiments/next-ledge/` | Grapple climb route with ledge/swing validation, avalanche/weather/drone rescue descriptors. | 3-7 min | Move, grapple/action input, ledge climb, manage feedback and rescue readiness. | No in changed entries. | Yes in upgraded entries. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller validation with camera, debug rays, traversal/afterimage rescue descriptors. | 3-6 min | Move, camera follow, debug overlay, traverse course, inspect rescue descriptors. | No in changed entries. | Yes in upgraded entries. |
| `experiments/sora-the-infinite/` | Open aerial gateway with rescue/lighthouse/rookery/star orchard/sky radio descriptors. | 4-8 min | Fly/steer, inspect sky route, staged rescue descriptor overlays. | No in changed sky radio entry. | Yes in upgraded entries. |
| `experiments/zombie-orchard/` | Survival slice with rounds, horde pressure, pickups, weapons, cure/seed/well/radio/cider overlays. | 5-12 min | Move, sprint, dodge, collect, swap/use gear, fight horde, readiness overlays. | No in latest changed entries. | Yes in upgraded entries. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with portals, inventory, harvesting, building, waves, seed vault, and covenant descriptors. | 8-15 min | Harvest, build, fight waves, maintain base, manage covenant descriptors. | No in changed entries. | Yes in upgraded entries. |
| `experiments/onnx-agent-lab/incident-router.html` | Incident-router workshop for model failure operations with alert beacons, trace samplers, classifier lanes, fallback briefs, shift posts, and audit ledgers. | 3-8 min | Inspect routing state, classify/fallback readiness, audit incident descriptors. | No in changed incident route entry. | Yes in upgraded entry. |

## Domain ASCII tree

```txt
peer-scene-moon-gate-repair-readiness-domain
├─ threshold-repair-domain
│  ├─ moon-gate-rune-domain
│  │  └─ peer-scene-moon-gate-rune-kit
│  └─ hinge-counterweight-domain
│     └─ peer-scene-hinge-counterweight-kit
├─ witness-chorus-domain
│  ├─ echo-choir-domain
│  │  ├─ memory-voice-domain
│  │  │  └─ peer-scene-echo-choir-kit
│  └─ oath-ribbon-domain
│     └─ peer-scene-oath-ribbon-kit
├─ dawn-threshold-handoff-domain
│  ├─ threshold-lantern-domain
│  │  └─ peer-scene-threshold-lantern-kit
│  └─ moon-gate-ledger-domain
│     └─ peer-scene-dawn-moon-gate-ledger-kit
└─ renderer-handoff
   └─ peer-scene-moon-gate-repair-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `experiments/_kits/peer-scene-transition/peer-scene-moon-gate-repair-kits.js`.

Atomic kits:

- `peer-scene-moon-gate-rune-kit`
- `peer-scene-hinge-counterweight-kit`
- `peer-scene-echo-choir-kit`
- `peer-scene-oath-ribbon-kit`
- `peer-scene-threshold-lantern-kit`
- `peer-scene-dawn-moon-gate-ledger-kit`
- `peer-scene-moon-gate-repair-renderer-handoff-kit`

Composite kit:

- `peer-scene-moon-gate-repair-readiness-domain-kit`

Ownership boundary:

- Reusable kit logic owns descriptor production only.
- Reusable kit logic does not own renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame loop, model inference, storage, navigation, physics, or network.

## Files changed

Added:

- `experiments/_kits/peer-scene-transition/peer-scene-moon-gate-repair-kits.js`
- `experiments/peer-scene-transition/shared/scene-moon-gate-repair-readiness-entry.js`
- `tests/peer-scene-moon-gate-repair-readiness-kits-smoke.mjs`
- `tests/peer-scene-moon-gate-repair-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1916-peer-scene-moon-gate-repair-upgrade.md`

Updated:

- `experiments/peer-scene-transition/index.html`
- `experiments/peer-scene-transition/crossroads.html`
- `experiments/peer-scene-transition/forest.html`
- `experiments/peer-scene-transition/bridge.html`

## Tests added

- `tests/peer-scene-moon-gate-repair-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Checks domain identity, all six descriptor families, 26 descriptor handoff count, readiness bounds, fracture-risk bounds, phase enum, JSON safety, cold-to-ready improvement, and ownership exclusions.
- `tests/peer-scene-moon-gate-repair-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Checks route markers on camp/crossroads/forest/bridge shared scene shells, NexusEngine main CDN import, absence of old `NexusRealtime@` in changed entry, `GameHost` moon-gate accessors, renderer handoff composition, descriptor totals, readiness bounds, fracture-risk bounds, and reusable-kit isolation from DOM/frame loop/audio/WebGL ownership.

## Validation results

Scratch validation run from a local file mirror before connector writes:

```txt
node --check experiments/_kits/peer-scene-transition/peer-scene-moon-gate-repair-kits.js
node --check experiments/peer-scene-transition/shared/scene-moon-gate-repair-readiness-entry.js
node --check tests/peer-scene-moon-gate-repair-readiness-kits-smoke.mjs
node --check tests/peer-scene-moon-gate-repair-cdn-state-input-smoke.mjs
node tests/peer-scene-moon-gate-repair-readiness-kits-smoke.mjs
node tests/peer-scene-moon-gate-repair-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
Peer Scene moon gate repair readiness kits smoke passed 10 intake cases.
Peer Scene moon gate repair CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full cloned workspace because this run used connector writes and a local scratch mirror. The added CDN/state-input smoke performs Playwright-style route/source validation by reading route shells and simulating 10 state cases through the kit.

## NexusRealtime import audit

Changed entry imports NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

Changed entry does not import old `NexusRealtime@`.

Changed reusable kit source contains no DOM access, no `requestAnimationFrame`, no WebGL/Three ownership, no audio ownership, no asset loading, no storage ownership, no network ownership, and no browser input ownership.

## Cleanup pass

- Preserved the existing scene host and all previous descriptor overlays.
- Integrated the new pass on the shared scene-host pages: camp, crossroads, forest, and bridge.
- Did not modify `shrine.html` because it is a separate 3D desert/beach transition shell rather than the shared scene-host page; no useful functionality was removed.
- Kept the new reusable logic in `_kits` and limited browser/DOM work to the entry adapter.
- Added descriptor-only handoff composition through `GameHost.getRendererHandoff()`.

## Non-game handling

The route is a small experience-driven web game/proof, not a purely non-game artifact. No deletion or rename was required. The lesson is that the route benefits when each scene transition has a visible repair/readiness objective, not just route-unlock feedback.

## Next safe ledge

Move the shared scene HTML shells to a generated template so new renderer-handoff passes can be mounted once and emitted consistently across camp, crossroads, forest, bridge, and any future shared scene pages. Keep the template renderer-only and keep domain logic in `_kits`.
