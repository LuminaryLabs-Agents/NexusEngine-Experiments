# 2026-07-09 19:00 UTC — Peer Scene Transition ferry lantern convoy upgrade

## Chosen experiment

`experiments/peer-scene-transition/`.

## Why it was chosen

The latest logged turn-ledger upgrade was `experiments/infinite-radial-terrain/` glacier beacon rescue, and the latest raw commit sequence immediately before this run was an ONNX Agent Lab incident-router pass. This run intentionally selected a different route from both. `experiments/peer-scene-transition/` remains one of the lowest-variability experiences because the base loop is still a small HTML scene chain with click actions, token gates, and debug panels. The upgrade adds a more legible objective layer: ferry dock cleats, lantern buoy chains, cargo tallies, scout raft routes, survivor roll calls, and a dawn ferry ledger.

## Last upgraded experiment

Latest observed completed changelog: `experiments/infinite-radial-terrain/` glacier beacon rescue.

Latest observed raw commit sequence before this run:

- `Add ONNX incident router kits`
- `Wire ONNX incident router entry`
- `Add ONNX incident router route`
- `Add ONNX incident router kit smoke`

This run did not repeat either route.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Scene host puzzle proof with tokens, exits, oracle/readability, clue pressure, evidence ritual, archive/shelter/flood/courier/bell archive overlays, now ferry lantern convoy readiness. | 3-6 min | Click scene actions, inspect debug state, unlock routes, watch descriptor readiness panels. | No old `NexusRealtime@` observed in changed entry. | Yes; shared scene demo and the new ferry entry use NexusEngine main CDN. |
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
| `experiments/onnx-agent-lab/signal-calibration.html` | Workshop route for model handshake, fallback rails, tool cues, prompt intent, memory traces, scene gates, and incident routing. | 3-8 min | Inspect tools, calibrate signal, validate fallback/model readiness, route incident descriptors. | No in changed signal calibration / incident entries. | Yes in upgraded entries. |

## Domain ASCII tree

```txt
peer-scene-ferry-lantern-convoy-readiness-domain
├─ river-crossing-domain
│  ├─ ferry-dock-cleat-domain
│  │  └─ peer-scene-ferry-dock-cleat-kit
│  └─ lantern-buoy-chain-domain
│     └─ peer-scene-lantern-buoy-chain-kit
├─ convoy-supply-domain
│  ├─ cargo-tally-domain
│  │  ├─ crate-token-domain
│  │  │  └─ peer-scene-cargo-tally-token-kit
│  └─ scout-raft-domain
│     └─ peer-scene-scout-raft-route-kit
├─ passenger-handoff-domain
│  ├─ survivor-rollcall-domain
│  │  └─ peer-scene-survivor-rollcall-card-kit
│  └─ dawn-ferry-ledger-domain
│     └─ peer-scene-dawn-ferry-ledger-kit
└─ renderer-handoff
   └─ peer-scene-ferry-lantern-convoy-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `experiments/_kits/peer-scene-transition/peer-scene-ferry-lantern-convoy-kits.js`.

Atomic kits:

- `peer-scene-ferry-dock-cleat-kit`
- `peer-scene-lantern-buoy-chain-kit`
- `peer-scene-cargo-tally-token-kit`
- `peer-scene-scout-raft-route-kit`
- `peer-scene-survivor-rollcall-card-kit`
- `peer-scene-dawn-ferry-ledger-kit`
- `peer-scene-ferry-lantern-convoy-renderer-handoff-kit`

Composite kit:

- `peer-scene-ferry-lantern-convoy-readiness-domain-kit`

Ownership boundary:

- Reusable kit logic owns descriptor production only.
- Reusable kit logic does not own renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame loop, storage, navigation, physics, or network.

## Files changed

Added:

- `experiments/_kits/peer-scene-transition/peer-scene-ferry-lantern-convoy-kits.js`
- `experiments/peer-scene-transition/shared/scene-ferry-lantern-convoy-readiness-entry.js`
- `tests/peer-scene-ferry-lantern-convoy-readiness-kits-smoke.mjs`
- `tests/peer-scene-ferry-lantern-convoy-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1900-peer-scene-ferry-lantern-convoy-upgrade.md`

Updated:

- `experiments/peer-scene-transition/index.html`
- `experiments/peer-scene-transition/camp.html`
- `experiments/peer-scene-transition/crossroads.html`
- `experiments/peer-scene-transition/forest.html`
- `experiments/peer-scene-transition/bridge.html`

## Tests added

- `tests/peer-scene-ferry-lantern-convoy-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Checks six descriptor families plus ledger, readiness bounds, crossing pressure bounds, phase enum, descriptor-only renderer handoff, JSON safety, prepared-state improvement, and renderer ownership exclusions.
- `tests/peer-scene-ferry-lantern-convoy-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Checks route marker, cache-busted script, NexusEngine main CDN import, absence of old `NexusRealtime@` import in the changed entry, `GameHost` accessors, reusable kit isolation, descriptor totals, readiness bounds, and crossing pressure bounds.

## Validation results

Scratch validation run from a local file mirror before connector writes:

```txt
node --check experiments/_kits/peer-scene-transition/peer-scene-ferry-lantern-convoy-kits.js
node --check experiments/peer-scene-transition/shared/scene-ferry-lantern-convoy-readiness-entry.js
node --check tests/peer-scene-ferry-lantern-convoy-readiness-kits-smoke.mjs
node --check tests/peer-scene-ferry-lantern-convoy-cdn-state-input-smoke.mjs
node tests/peer-scene-ferry-lantern-convoy-readiness-kits-smoke.mjs
node tests/peer-scene-ferry-lantern-convoy-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
Peer scene ferry lantern convoy readiness kits smoke passed 10 intake cases.
Peer scene ferry lantern convoy CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full cloned workspace because shell git could not resolve `github.com`. The added CDN/state-input smoke performs the requested local Playwright-style source and state validation by reading the route shell and simulating 10 state cases through the kit.

## NexusRealtime import audit

Changed entry imports NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

Changed entry does not import old `NexusRealtime@`.

Changed reusable kit source contains no DOM access, no `requestAnimationFrame`, no browser input listener, no audio ownership, no asset loading, no graphics runtime ownership, no storage ownership, and no network ownership. The ownership exclusion strings mention Three.js/WebGL only as forbidden responsibilities.

## Cleanup pass

- Preserved the existing peer scene transition flow.
- Added the ferry convoy pass to `index.html`, `camp.html`, `crossroads.html`, `forest.html`, and `bridge.html`.
- Normalized the bridge HTML shell while preserving the same `bootPeerScene("bridge")` runtime call.
- Left the separate 3D `shrine.html` and `final.html` scene proof untouched because it is a different scene-mode renderer and changing it would be destructive without a fuller migration pass.
- Kept reusable convoy scoring in kits and the UI panel in the entry script as a descriptor consumer.

## Non-game handling

The route is a small experience-driven web experiment, not a traditional game. It was not deleted or renamed because it is useful as a scene-host, scene-state, token-gate, and descriptor-composition proof. The lesson is that the route becomes clearer when a concrete evacuation objective sits on top of the abstract transition graph.

## Next safe ledge

Unify the many peer-scene overlays into a single presentation-only expedition board that reads `GameHost.getRendererHandoff()` and groups oracle, clue pressure, evidence ritual, archive, shelter, flood, courier, bell archive, and ferry convoy descriptors by urgency. Keep every scoring rule in renderer-neutral kits.
