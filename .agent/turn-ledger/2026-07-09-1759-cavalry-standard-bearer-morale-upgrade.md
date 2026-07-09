# 2026-07-09 17:59 UTC — Cavalry standard bearer morale upgrade

## Chosen experiment

`apps/the-cavalry-of-rome/` with source modules in `experiments/The Cavalry of Rome/src/`.

## Why it was chosen

The route is visually ambitious but still mostly a painterly strategy proof rather than a small objective-driven web game. Compared with the more complete survival, platformer, tower-defense, cave-rescue, and flight routes, it had weaker immediate gameplay variability: pan, hover, select, and inspect armies. The upgrade adds a concrete tactical morale layer around legion standards without deleting the existing campaign renderer.

## Last upgraded experiment

The latest observed upgrade before this run was `experiments/zombie-orchard/`, specifically the cider mill refuge pass. The latest commit sequence included:

- `Load Zombie Orchard cider mill refuge pass`
- `Add Zombie Orchard cider mill refuge CDN smoke`
- `Add Zombie Orchard cider mill refuge kit smoke`
- `Wire Zombie Orchard cider mill refuge entry`
- `Add Zombie Orchard cider mill refuge kits`

This run intentionally chose a different experiment.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Scene host puzzle proof with tokens, exits, oracle/readability, clue pressure, evidence ritual, archive/shelter/flood/courier/bell archive overlays. | 3-6 min | Click scene actions, inspect debug state, unlock transition routes. | Not observed in inventory shell; route uses shared scene modules. | Existing overlays likely yes where upgraded. |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale jump rescue pass with tether, wind, oxygen, medevac descriptors. | 2-4 min | A/D movement, jump, collect, avoid hazards, medevac readiness. | No in changed medevac entry. | Yes in upgraded entry. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation with LOD and aquifer descriptors. | 2-5 min | WASD flight, pan/scan terrain, inspect generated water-readiness descriptors. | Not observed in changed route inventory. | Yes in upgraded aquifer entry. |
| `experiments/high-fidelity-meadow/` | Procedural meadow with terrain, vegetation, ecology, creek irrigation, and soil mycelium overlays. | 3-8 min | First-person/look exploration, visual target inspection, ecological descriptor overlays. | Not observed in changed route inventory. | Yes in upgraded entries. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion lab with CPU training, sampling, checkpoints, dataset expedition, museum, mural, curriculum kiln readiness. | 5-15 min | Train/sample/checkpoint controls, inspect generated readiness panels. | Not observed in changed route inventory. | Yes in upgraded entries. |
| `experiments/living-agent-lab/` | Market-agent route with fallback/ONNX decisioning and civic festival mediation descriptors. | 3-8 min | Agent action selection, market trust, permit/vendor/dispute/steward readiness. | No in changed civic entry. | Yes in upgraded entry. |
| `experiments/fogline-relay/` | First-person fog survey with scan targets, hazards, rescue overlays, observatory, courier descriptors. | 5-8 min | Move/look, scan targets, handle fog pressure, trigger rescue/courier readiness. | No in changed observatory/courier entries. | Yes in upgraded entries. |
| `experiments/nexus-frontier-signal-isles/` | Field engineer island slice with scan, harvest, build, pressure, hospital, desalination descriptors. | 6-10 min | Explore, scan, harvest, build gates/cargo, handle storm/hospital/water readiness. | No in changed entries. | Yes in upgraded entries. |
| `apps/the-cavalry-of-rome/` | Painterly Roman strategy map with panning, hover/dive, army visualization, logistics/diplomacy/hospital/grain/aqueduct/beacon overlays. | 4-10 min | Pan map, select/inspect regions, campaign actions, tactical descriptor overlays. | No in changed pass. | Yes; new pass imports NexusEngine main CDN. |
| `games/signal-bastion/` | 2.5D defense game with tower cards, range rings, field hospital, supply convoy descriptors. | 5-12 min | Place towers, inspect cards, survive waves, manage supply/repair readiness. | No in changed supply entry. | Yes in upgraded entry. |
| `games/stonewake-depths/` | Flooded cavern rescue game with block carrying, pressure, rune gates, survivor pings, clinic/pump/archive/cartography overlays. | 6-12 min | Carry blocks, operate valves, solve gates, rescue survivors, manage rescue descriptors. | No in changed entries. | Yes in upgraded entries. |
| `experiments/next-ledge/` | Grapple climb route with ledge/swing validation, avalanche/weather/drone rescue descriptors. | 3-7 min | Move, grapple/action input, ledge climb, manage feedback and rescue readiness. | No in changed entries. | Yes in upgraded entries. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller validation with camera, debug rays, traversal/afterimage rescue descriptors. | 3-6 min | Move, camera follow, debug overlay, traverse course, inspect rescue descriptors. | No in changed entries. | Yes in upgraded entries. |
| `experiments/sora-the-infinite/` | Open aerial gateway with rescue/lighthouse/rookery/star orchard/sky radio descriptors. | 4-8 min | Fly/steer, inspect sky route, staged rescue descriptor overlays. | No in changed sky radio entry. | Yes in upgraded entries. |
| `experiments/zombie-orchard/` | Survival slice with rounds, horde pressure, pickups, weapons, cure/seed/well/radio/cider overlays. | 5-12 min | Move, sprint, dodge, collect, swap/use gear, fight horde, readiness overlays. | No in latest changed cider/radio entries. | Yes in upgraded entries. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with portals, inventory, harvesting, building, waves, covenant descriptors. | 8-15 min | Harvest, build, fight waves, maintain base, manage covenant descriptors. | No in changed covenant entry. | Yes in upgraded entry. |
| `experiments/onnx-agent-lab/signal-calibration.html` | Workshop route for model handshake, fallback rails, tool cues, prompt intent, memory traces, scene gates. | 3-8 min | Inspect tools, calibrate signal, validate fallback/model readiness. | No in changed signal calibration entry. | Yes in upgraded entry. |

## Domain ASCII tree

```txt
cavalry-standard-bearer-morale-readiness-domain
├─ legion-identity-domain
│  ├─ aquila-standard-domain
│  │  └─ cavalry-aquila-standard-kit
│  └─ vexillum-rally-domain
│     └─ cavalry-vexillum-rally-route-kit
├─ morale-stabilization-domain
│  ├─ cohort-drum-domain
│  │  ├─ rhythm-cadence-domain
│  │  │  └─ cavalry-cohort-morale-drum-kit
│  └─ standard-guard-domain
│     └─ cavalry-standard-guard-ring-kit
├─ honor-evacuation-domain
│  ├─ wounded-standard-litter-domain
│  │  └─ cavalry-wounded-standard-litter-kit
│  └─ dusk-honor-ledger-domain
│     └─ cavalry-dusk-honor-ledger-kit
└─ renderer-handoff
   └─ cavalry-standard-bearer-morale-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `experiments/The Cavalry of Rome/src/cavalry-standard-bearer-morale-readiness-domain-kit.js`.

Atomic kits:

- `cavalry-aquila-standard-kit`
- `cavalry-vexillum-rally-route-kit`
- `cavalry-cohort-morale-drum-kit`
- `cavalry-standard-guard-ring-kit`
- `cavalry-wounded-standard-litter-kit`
- `cavalry-dusk-honor-ledger-kit`
- `cavalry-standard-bearer-morale-renderer-handoff-kit`

Composite kit:

- `cavalry-standard-bearer-morale-readiness-domain-kit`

Ownership boundary:

- Reusable kit logic owns descriptor production only.
- Reusable kit logic does not own renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame loop, physics, storage, or network.

## Files changed

Added:

- `experiments/The Cavalry of Rome/src/cavalry-standard-bearer-morale-readiness-domain-kit.js`
- `experiments/The Cavalry of Rome/src/cavalry-standard-bearer-morale-readiness-pass.js`
- `tests/cavalry-standard-bearer-morale-readiness-kits-smoke.mjs`
- `tests/cavalry-standard-bearer-morale-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1759-cavalry-standard-bearer-morale-upgrade.md`

Updated:

- `apps/the-cavalry-of-rome/index.html`
- `experiments/_shared/nexus-gallery-data.js`

## Tests added

- `tests/cavalry-standard-bearer-morale-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Checks all descriptor families, readiness bounds, morale risk bounds, mission enum, descriptor-only renderer handoff, JSON safety, and ownership exclusions.
- `tests/cavalry-standard-bearer-morale-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Checks route marker, build stamp, new pass loading, NexusEngine main CDN import, absence of old `NexusRealtime@` import in changed pass, kit isolation from DOM/frame loop/audio, descriptor totals, readiness bounds, morale risk bounds, and mission enum.

## Validation results

Scratch validation run from a local file mirror before connector writes:

```txt
node --check experiments/The\ Cavalry\ of\ Rome/src/cavalry-standard-bearer-morale-readiness-domain-kit.js
node --check experiments/The\ Cavalry\ of\ Rome/src/cavalry-standard-bearer-morale-readiness-pass.js
node --check tests/cavalry-standard-bearer-morale-readiness-kits-smoke.mjs
node --check tests/cavalry-standard-bearer-morale-cdn-state-input-smoke.mjs
node tests/cavalry-standard-bearer-morale-readiness-kits-smoke.mjs
node tests/cavalry-standard-bearer-morale-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
Cavalry standard bearer morale readiness kits smoke passed 10 intake cases.
Cavalry standard bearer morale CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full cloned workspace because shell git could not resolve `github.com` in this runtime. The added CDN/state-input smoke performs the requested local Playwright-style route/source validation by reading the route shell and simulating 10 state cases through the kit.

## NexusRealtime import audit

Changed pass imports NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

Changed pass does not import old `NexusRealtime@`.

Changed reusable kit source contains no DOM access, no `requestAnimationFrame`, no WebGL/Three ownership, no audio ownership, no asset loading, and no browser input ownership.

## Cleanup pass

- Preserved existing Cavalry campaign passes and did not delete useful visual or tactical functionality.
- Added the new pass as a descriptor overlay instead of moving domain logic into the renderer.
- Updated the app build stamp from `campaign-040-frontier-beacon-chain` to `campaign-041-standard-bearer-morale`.
- Updated gallery metadata to reflect the new Standard Morale layer.
- Kept the app route stable at `./apps/the-cavalry-of-rome/`.

## Non-game handling

The route is not a conventional small web game; it is a strategy-map visual proof. It was not deleted or renamed because it has useful campaign-map, panning, hover, region, and army visualization functionality. The lesson is that its experience loop improves when each visual proof layer carries a concrete tactical goal; standard bearer morale now gives the player another meaningful campaign-readiness problem to inspect.

## Next safe ledge

Turn the Cavalry route's many readiness overlays into a compact in-scene campaign objective board that reads from `GameHost.getRendererHandoff()` and summarizes only the top three urgent descriptor groups. Keep that board renderer-only and avoid pushing any campaign decision logic into DOM code.
