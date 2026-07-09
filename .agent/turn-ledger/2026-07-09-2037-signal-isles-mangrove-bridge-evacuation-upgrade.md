# 2026-07-09 20:37 UTC — Signal Isles mangrove bridge evacuation upgrade

## Chosen experiment

`experiments/nexus-frontier-signal-isles/`.

## Why it was chosen

The route is already a strong field-engineer island slice, but its newer overlays were mostly signal, storm, hospital, and desalination readiness layers. It still had room for a more tactile small-game objective around low-tide crossings, rescue channels, hand-built bridges, and visible traversal safety. This run adds descriptor-only mangrove bridge evacuation kits that make the island more visually varied without moving reusable logic into the renderer.

## Last upgraded experiment

The latest observed changelog/commit before this run was `experiments/infinite-radial-terrain/` for the mirage caravan rescue upgrade.

This run intentionally chose a different experiment.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Story-scene orchestration with scene-host actions, route tokens, evidence/archive/shelter/flood/courier/bell/ferry/moon-gate overlays. | 3-7 min | Click actions, collect tokens, unlock transitions, inspect readiness panels. | Not in latest changed files. | Yes in upgraded entries. |
| `experiments/vr-platformer-board/storm-harbor.html` | Board-scale platformer evacuation with tide gauges, flare buoys, crane cables, supply nets, and rescue skiffs. | 2-4 min | A/D movement, jump, collect, avoid hazards, inspect rescue readiness. | Not in latest changed entries. | Yes in upgraded entries. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain with LOD, aquifer, glacier, and mirage caravan descriptors. | 2-6 min | WASD flight, terrain inspection, descriptor handoff inspection. | No in latest changed mirage files. | Yes in upgraded entries. |
| `experiments/high-fidelity-meadow/` | Procedural meadow with terrain, wind, vegetation, creek irrigation, and soil mycelium overlays. | 3-8 min | Explore/inspect ecology and descriptor overlays. | Not observed in latest changed files. | Yes in upgraded entries. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion lab with training, sampling, checkpoints, museum, mural, and curriculum kiln readiness. | 5-15 min | Train/sample/checkpoint controls and readiness panels. | Not observed in latest changed files. | Yes in upgraded entries. |
| `experiments/living-agent-lab/` | Market-agent route with fallback/ONNX decisioning and civic festival mediation descriptors. | 3-8 min | Agent action selection, trust state, permit/vendor/dispute/steward readiness. | No in changed civic entry. | Yes in upgraded entry. |
| `experiments/fogline-relay/` | First-person fog survey with scan targets, hazards, observatory/courier/tide evacuation descriptors. | 5-8 min | Move/look, scan targets, manage fog pressure and readiness overlays. | No in changed courier/tide entries. | Yes in upgraded entries. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island slice with scan, harvest, build, storm, hospital, desalination, stormbreak, and new mangrove bridge evacuation descriptors. | 6-10 min | Explore, scan, harvest, build, manage tide/storm/hospital/water/bridge readiness. | No in changed mangrove files. | Yes; changed entry imports NexusEngine main CDN. |
| `apps/the-cavalry-of-rome/` | Painterly Roman strategy map with region inspection, campaign overlays, beacon chain, and standard morale descriptors. | 4-10 min | Pan/select regions, inspect campaign descriptors and tactical readiness. | No in latest changed passes. | Yes in upgraded passes. |
| `games/signal-bastion/` | 2.5D defense game with tower cards, range rings, field hospital, and supply convoy descriptors. | 5-12 min | Place towers, inspect cards, survive waves, manage supply readiness. | No in changed supply entry. | Yes in upgraded entry. |
| `games/stonewake-depths/` | Flooded cavern rescue with block carrying, valves, rune gates, survivor pings, and cartography overlays. | 6-12 min | Carry blocks, operate valves, solve gates, rescue survivors. | No in changed cartography entry. | Yes in upgraded entry. |
| `experiments/next-ledge/` | Grapple climb route with ledge/swing validation and rescue/weather/drone descriptors. | 3-7 min | Move, grapple/action input, ledge climb, inspect rescue feedback. | No in changed entries. | Yes in upgraded entries. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller validation with camera/debug rays and traversal/rescue descriptors. | 3-6 min | Move, camera follow, debug overlay, traverse/inspect descriptors. | No in changed entries. | Yes in upgraded entries. |
| `experiments/sora-the-infinite/` | Open aerial gateway with rescue, lighthouse, rookery, sky radio, and cloud clinic descriptors. | 4-8 min | Fly/steer, inspect sky route, staged rescue overlays. | No in changed entries. | Yes in upgraded entries. |
| `experiments/zombie-orchard/` | Survival slice with horde rounds, pickups, weapons, cure/seed/well/radio/cider overlays. | 5-12 min | Move, sprint, dodge, collect, fight horde, manage readiness overlays. | No in latest changed entries. | Yes in upgraded entries. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with portals, harvesting, building, waves, seed vault, and quarantine descriptors. | 8-15 min | Harvest, build, fight waves, maintain base, inspect descriptors. | No in changed entries. | Yes in upgraded entries. |
| `experiments/onnx-agent-lab/incident-router.html` | Incident-router workshop for model failure operations with alert beacons, trace samplers, classifier lanes, and audit ledgers. | 3-8 min | Inspect routing state, classify/fallback readiness, audit descriptors. | No in changed incident route entry. | Yes in upgraded entry. |

## Domain ASCII tree

```txt
signal-isles-mangrove-bridge-evacuation-readiness-domain
├─ crossing-stability-domain
│  ├─ mangrove-root-bridge-domain
│  │  └─ signal-isles-mangrove-root-bridge-kit
│  └─ plank-causeway-domain
│     └─ signal-isles-plank-causeway-kit
├─ tide-route-domain
│  ├─ tide-pole-gauge-domain
│  │  └─ signal-isles-tide-pole-gauge-kit
│  └─ rescue-skiff-flag-domain
│     ├─ channel-mark-domain
│     │  └─ signal-isles-rescue-skiff-flag-kit
├─ lantern-handoff-domain
│  ├─ crab-lantern-guide-domain
│  │  └─ signal-isles-crab-lantern-guide-kit
│  └─ dusk-bridge-ledger-domain
│     └─ signal-isles-dusk-bridge-ledger-kit
└─ renderer-handoff
   └─ signal-isles-mangrove-bridge-evacuation-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `experiments/_kits/nexus-frontier-signal-isles/signal-isles-mangrove-bridge-evacuation-readiness-domain-kits.js`.

Atomic kits:

- `signal-isles-mangrove-root-bridge-kit`
- `signal-isles-plank-causeway-kit`
- `signal-isles-tide-pole-gauge-kit`
- `signal-isles-rescue-skiff-flag-kit`
- `signal-isles-crab-lantern-guide-kit`
- `signal-isles-dusk-bridge-ledger-kit`
- `signal-isles-mangrove-bridge-evacuation-renderer-handoff-kit`

Composite kit:

- `signal-isles-mangrove-bridge-evacuation-readiness-domain-kit`

Ownership boundary:

- Reusable kit logic produces serializable descriptors only.
- Reusable kit logic does not own renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, frame loop, storage, or network.

## Files changed

Added:

- `experiments/_kits/nexus-frontier-signal-isles/signal-isles-mangrove-bridge-evacuation-readiness-domain-kits.js`
- `experiments/nexus-frontier-signal-isles/src/mangrove-bridge-evacuation-readiness-entry.js`
- `tests/signal-isles-mangrove-bridge-evacuation-readiness-kits-smoke.mjs`
- `tests/signal-isles-mangrove-bridge-evacuation-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-2037-signal-isles-mangrove-bridge-evacuation-upgrade.md`

Updated:

- `experiments/nexus-frontier-signal-isles/index.html`

## Tests added

- `tests/signal-isles-mangrove-bridge-evacuation-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Checks domain identity, tree root, kit list, all six descriptor families, descriptor counts, readiness bounds, tide-risk bounds, mission enum, JSON safety, prepared-state improvement, high-tide risk, and ownership exclusions.
- `tests/signal-isles-mangrove-bridge-evacuation-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Checks route marker, cache-busted entry script, NexusEngine main CDN import, old `NexusRealtime@` absence, `GameHost` accessors, renderer handoff composition, descriptor richness, and reusable-kit isolation from browser/runtime ownership.

## Validation results

Scratch validation run from a local file mirror before connector writes:

```txt
node --check experiments/_kits/nexus-frontier-signal-isles/signal-isles-mangrove-bridge-evacuation-readiness-domain-kits.js
node --check experiments/nexus-frontier-signal-isles/src/mangrove-bridge-evacuation-readiness-entry.js
node --check tests/signal-isles-mangrove-bridge-evacuation-readiness-kits-smoke.mjs
node --check tests/signal-isles-mangrove-bridge-evacuation-cdn-state-input-smoke.mjs
node tests/signal-isles-mangrove-bridge-evacuation-readiness-kits-smoke.mjs
node tests/signal-isles-mangrove-bridge-evacuation-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
Signal Isles mangrove bridge evacuation readiness kits smoke passed 10 intake cases.
Signal Isles mangrove bridge evacuation CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full cloned workspace because shell git could not resolve `github.com`. The added CDN/state-input smoke performs Playwright-style route/source validation by reading the route shell and simulating 10 state cases through the kit.

## NexusRealtime import audit

Changed entry imports NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

Changed entry does not import old `NexusRealtime@`.

Changed reusable kit source contains no DOM access, no `requestAnimationFrame`, no Three/WebGL operational ownership, no audio ownership, no asset loading, no storage ownership, no network ownership, and no browser input ownership.

## Cleanup pass

- Preserved the existing Signal Isles renderer and previous descriptor overlays.
- Added mangrove bridge evacuation as a thin browser adapter that consumes descriptor output.
- Kept reusable logic under `_kits` and browser/DOM drawing in the entry adapter.
- Composed `GameHost.getRendererHandoff()` without replacing previous handoff output.
- Did not remove any existing island scan, harvest, build, storm, hospital, desalination, or stormbreak functionality.

## Non-game handling

This is a small experience-driven web route. No deletion, refactor, or rename was required.

## Next safe ledge

The next safe improvement is to let the core Signal Isles renderer consume the mangrove descriptor families as in-world bridge meshes, tide poles, skiff flags, and lantern crabs while keeping the entry adapter as a status/overlay layer and preserving the reusable kit ownership boundary.
