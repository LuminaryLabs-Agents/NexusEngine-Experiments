# 2026-07-09 11:15 ET — Cavalry Frontier Beacon Chain Upgrade

## Chosen experiment

`apps/the-cavalry-of-rome/`

## Why it was chosen

The latest completed upgrade was `games/rogue-lite-hellscape-siege/`, so this run selected a different route.

The Cavalry of Rome remains one of the least mechanically variable routes in the catalog: it is primarily a pannable painted strategy map with overlays. The upgrade adds a stronger objective layer without changing the core map renderer: establish a frontier signal chain using hill beacon towers, smoke plume relays, road mileposts, dispatch riders, night watch cohorts, and a Senate dispatch ledger.

## Last upgraded experiment checked before selection

Latest ledger context showed the previous completed route as `games/rogue-lite-hellscape-siege/` with the obsidian seed vault readiness upgrade.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Scene transition story proof | 2-5 min | HTML scene exits, puzzle tokens, inventory/visited state | No known old CDN import found | Mixed route-local; prior overlays may use CDN |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale platform rescue | 1-3 min | Jumping, hazards, coins/oxygen, medevac descriptors | No known old CDN import found | Yes in upgraded route entry |
| `experiments/infinite-radial-terrain/` | Radial terrain flight | Open-ended | WASD flight, origin snapping, terrain LOD and shelter descriptors | No known old CDN import found | Yes in upgraded overlay entries |
| `experiments/high-fidelity-meadow/` | Procedural meadow scene | Open-ended | Camera movement, vegetation/ecology descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/tiny-diffusion-lab/` | Browser diffusion lab | 3-8 min | Train/sample/checkpoint and readiness panels | No known old CDN import found | Yes through Nexus diffusion/lab entries |
| `experiments/living-agent-lab/` | Agent market/civic route | 2-5 min | Agent choice, trust, permit/vendor/dispute descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/fogline-relay/` | First-person fog survey | 3-6 min | Scan targets, fog zones, timed pressure, hazards, evacuation descriptors | No known old CDN import found | Yes in upgraded overlay entries |
| `experiments/nexus-frontier-signal-isles/` | Field engineer island slice | 5-10 min | Scan, harvest, build, cargo, gates, storm/clinic/desalination descriptors | No known old CDN import found in changed files | Yes in changed entries |
| `apps/the-cavalry-of-rome/` | Painted Rome strategy map | 2-5 min | Pan/hover/dive map, army reveal, campaign descriptors, aqueduct sabotage, frontier beacon chain | No old NexusRealtime import found in changed files | Yes in changed frontier beacon pass |
| `games/signal-bastion/` | Tower defense route | 5-10 min | Tower placement, waves, range rings, supply descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `games/stonewake-depths/` | Flood rescue game | 5-10 min | Carry blocks, valve pressure, gates, survivor pings | No known old CDN import found | Yes in upgraded overlay entries |
| `experiments/next-ledge/` | Grapple climb validation | 2-5 min | Grapple, ledges, swing pressure, summit/avalanche descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/sora-the-infinite/` | Open flight redirect/route | Open-ended | Aerial traversal, visual domains, flight readiness | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/zombie-orchard/` | Survival orchard slice | 3-8 min | Horde rounds, pressure, pickups, weapons, rescue descriptors | No known old CDN import found | Yes in upgraded overlay entries |
| `games/rogue-lite-hellscape-siege/` | Base siege action route | 5-12 min | Harvest, build, portals, waves, purification, refuge, seed vault descriptors | No known old CDN import found in changed files | Yes in changed entry |
| `experiments/onnx-agent-lab/signal-calibration.html` | ONNX workshop calibration route | 3-6 min | Model handshake, fallback rails, tool/prompt/memory descriptors | No known old CDN import found | Yes in upgraded route entry |

## Domain ASCII tree

```txt
cavalry-frontier-beacon-chain-readiness-domain
├─ hill-signal-domain
│  ├─ beacon-tower-domain
│  │  └─ cavalry-frontier-beacon-tower-kit
│  └─ smoke-plume-domain
│     └─ cavalry-smoke-plume-relay-kit
├─ courier-routing-domain
│  ├─ road-milepost-domain
│  │  └─ cavalry-road-milepost-kit
│  └─ dispatch-rider-domain
│     └─ cavalry-dispatch-rider-route-kit
├─ command-handoff-domain
│  ├─ night-watch-cohort-domain
│  │  └─ cavalry-night-watch-cohort-kit
│  └─ senate-dispatch-ledger-domain
│     └─ cavalry-senate-dispatch-ledger-kit
└─ renderer-handoff
   └─ cavalry-frontier-beacon-chain-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `cavalry-frontier-beacon-tower-kit`
- `cavalry-smoke-plume-relay-kit`
- `cavalry-road-milepost-kit`
- `cavalry-dispatch-rider-route-kit`
- `cavalry-night-watch-cohort-kit`
- `cavalry-senate-dispatch-ledger-kit`
- `cavalry-frontier-beacon-chain-renderer-handoff-kit`
- `cavalry-frontier-beacon-chain-readiness-domain-kit`

All reusable kit logic accepts plain campaign state input and returns serializable descriptor output. The kit boundary excludes renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame-loop, physics, and network ownership.

## Files changed

Added:

- `experiments/The Cavalry of Rome/src/cavalry-frontier-beacon-chain-readiness-domain-kit.js`
- `experiments/The Cavalry of Rome/src/cavalry-frontier-beacon-chain-readiness-pass.js`
- `tests/cavalry-frontier-beacon-chain-readiness-kits-smoke.mjs`
- `tests/cavalry-frontier-beacon-chain-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1115-cavalry-frontier-beacon-chain-upgrade.md`

Updated:

- `apps/the-cavalry-of-rome/index.html`

## Tests added

- `tests/cavalry-frontier-beacon-chain-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Validates all six descriptor families.
  - Validates readiness bounds, delay-risk bounds, mission-state enums, descriptor counts, JSON safety, and renderer-neutral ownership.

- `tests/cavalry-frontier-beacon-chain-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Validates route marker wiring, build stamp, NexusEngine main CDN import, old `NexusRealtime@` absence in the changed entry, GameHost pass surface, and reusable-kit isolation.

## Validation results

Scratch local Node validation passed before connector writes:

```txt
node --check "experiments/The Cavalry of Rome/src/cavalry-frontier-beacon-chain-readiness-domain-kit.js"
node --check "experiments/The Cavalry of Rome/src/cavalry-frontier-beacon-chain-readiness-pass.js"
node --check tests/cavalry-frontier-beacon-chain-readiness-kits-smoke.mjs
node --check tests/cavalry-frontier-beacon-chain-cdn-state-input-smoke.mjs
node tests/cavalry-frontier-beacon-chain-readiness-kits-smoke.mjs
node tests/cavalry-frontier-beacon-chain-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Cavalry frontier beacon chain readiness kits smoke passed 10 intake cases.
Cavalry frontier beacon chain CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace because this shell runtime could not resolve `github.com`; this is a connector-only limitation, not a kit failure.

## NexusRealtime import audit

Changed files:

- `cavalry-frontier-beacon-chain-readiness-pass.js` imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- `cavalry-frontier-beacon-chain-readiness-pass.js` does not import `NexusRealtime@`.
- `cavalry-frontier-beacon-chain-readiness-domain-kit.js` has no runtime import and no browser/renderer ownership.
- `apps/the-cavalry-of-rome/index.html` only wires local scripts and does not add an old `NexusRealtime@` CDN dependency.
- The CDN/state-input smoke asserts the route marker, build stamp, changed entry CDN import, and absence of old `NexusRealtime@` runtime import.

## Cleanup pass

- Preserved the existing Rome campaign map loop and all previous readiness passes.
- Added the new pass through descriptor composition rather than replacing `GameHost.getRendererHandoff()` output.
- Kept reusable domain logic in the domain kit file and DOM/canvas overlay behavior in the route pass.
- No destructive deletes.

## Non-game handling

The chosen route is a small experience-driven strategy-map proof. It did not need to be deleted, renamed, or refactored away.

## Next safe ledge

Make frontier beacon readiness actively influence map affordances: let player-owned hill cells spend a turn to raise beacon towers, then use the dispatch rider routes to reduce fog-of-war or reveal hostile army pressure before a region dive.
