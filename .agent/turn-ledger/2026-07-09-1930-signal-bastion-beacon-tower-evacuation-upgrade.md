# 2026-07-09 19:30 - Signal Bastion beacon tower evacuation upgrade

## Chosen experiment

- `games/signal-bastion/`
- New pass: `beacon-tower-evacuation-readiness-renderer-handoff-pass`
- New entry: `games/signal-bastion/src/signal-bastion-beacon-tower-evacuation-readiness-entry.js`

## Why it was chosen

The latest completed upgrade on `main` was `experiments/high-fidelity-meadow/` skylark nest rescue, so this run intentionally chose a different route. Signal Bastion is already a playable tower-defense route, but compared with the most recently upgraded routes it still had narrower procedural rescue variability. The beacon tower evacuation layer adds a clearer civilian objective over the defense board: tune prism lenses, fire signal flares, open evacuation stair lanes, watch tower shadows, stock safehouse tokens, and close a dawn beacon ledger.

## Last upgraded experiment

- Last upgraded experiment observed from latest commit stream: `experiments/high-fidelity-meadow/`
- Latest ledger commit observed before this run: `65c1622ad3372319ead5c3bfff09f967c9a52f4c` - `Log meadow skylark nest rescue upgrade`
- This run chose `games/signal-bastion/`, so it does not repeat the last route.

## Experiment inventory

| Experiment | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime imports | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Scene-host route proof with bell archive evacuation overlays. | 3-8 minutes | Click exits, collect puzzle tokens, scene-to-scene state. | No changed-route old CDN found in this pass. | Uses route passes that import NexusEngine main CDN. |
| `experiments/vr-platformer-board/storm-harbor.html` | Board-scale storm harbor platformer rescue. | 5-10 minutes | Jump, collect, avoid hazards, lighthouse/breakwater descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain inspection with rescue overlays. | 5-12 minutes | WASD flight, terrain LOD, origin snapping, beacon/rescue descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/high-fidelity-meadow/` | Procedural meadow scene with ecology overlays including skylark nest rescue. | 4-10 minutes | Orbit/inspect meadow, watch sheep/grass/VFX, follow nest/dew/bell/seed descriptors. | Base renderer still references historical ProtoKits package naming; changed route not repeated. | Uses NexusEngine main CDN validation pass. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion training and curriculum lab. | 6-15 minutes | CPU training, sampling, checkpoints, readiness panels. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/living-agent-lab/market-fire-evacuation.html` | Procedural market emergency drill. | 5-12 minutes | Inspect lanterns, clear aisles, stage relays, account for civilians, canal brigade. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/fogline-relay/` | First-person fog survey and evacuation/rescue overlays. | 5-12 minutes | Scan targets, route through fog, avoid hazards, rescue descriptors. | Older page loader removed in a prior Fogline pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/nexus-frontier-signal-isles/` | Field engineer island slice. | 8-15 minutes | Scan, harvest, build, pressure gates, cargo, storm and water descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `apps/the-cavalry-of-rome/` | Painted Roman strategy-map proof. | 5-10 minutes | Pan/hover, region focus, army descriptors, morale overlays. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `games/signal-bastion/` | 2.5D cel-style defense game with the new beacon tower evacuation objective. | 8-20 minutes | Tower cards, placement ghosts, waves, field hospital, supply convoy, beacon evacuation descriptors. | Changed entry has no old `NexusRealtime@` CDN import. Existing ProtoKits dependency names remain in base boot bridge URLs. | Changed entry imports NexusEngine main CDN. |
| `games/stonewake-depths/` | Flooded cavern rescue game. | 10-20 minutes | Block carrying, valves, rune plates, survivor pings, cartography descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/next-ledge/` | Grapple-climb validation route. | 4-9 minutes | Grapple/action input, ledges, swing pressure, rescue descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller/camera validation. | 5-10 minutes | Locomotion, spring camera, route caches, rescue overlays. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/sora-the-infinite/stormglass-courier.html` | Procedural open flight courier route. | 6-12 minutes | Thermal lanes, storm cells, buoy tuning, landing. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/zombie-orchard/` | Orchard survival slice. | 8-18 minutes | Rounds, horde pressure, pickups, weapons, refuge overlays. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route. | 12-25 minutes | Portals, inventory, harvesting, building, waves, quarantine descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/onnx-agent-lab/red-team-evacuation.html` | Red-team evacuation workshop. | 6-15 minutes | Canary prompts, sandbox locks, evidence routes, rollback drills. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |

## Domain ASCII tree

```txt
signal-bastion-beacon-tower-evacuation-readiness-domain
├─ beacon-signal-domain
│  ├─ prism-lens-domain
│  │  └─ bastion-beacon-prism-lens-kit
│  └─ signal-flare-domain
│     └─ bastion-signal-flare-burst-kit
├─ gate-routing-domain
│  ├─ evacuation-stair-domain
│  │  └─ bastion-evacuation-stair-lane-kit
│  └─ tower-shadow-domain
│     └─ bastion-tower-shadow-watch-kit
├─ civilian-handoff-domain
│  ├─ safehouse-token-domain
│  │  └─ bastion-safehouse-token-kit
│  └─ dawn-beacon-ledger-domain
│     └─ bastion-dawn-beacon-ledger-kit
└─ renderer-handoff
   └─ bastion-beacon-tower-evacuation-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `games/signal-bastion/src/signal-bastion-beacon-tower-evacuation-readiness-domain-kit.js` with:

- `bastion-beacon-prism-lens-kit`
- `bastion-signal-flare-burst-kit`
- `bastion-evacuation-stair-lane-kit`
- `bastion-tower-shadow-watch-kit`
- `bastion-safehouse-token-kit`
- `bastion-dawn-beacon-ledger-kit`
- `bastion-beacon-tower-evacuation-renderer-handoff-kit`
- Composite domain kit: `signal-bastion-beacon-tower-evacuation-readiness-domain-kit`

The reusable kit logic is deterministic, idempotent, descriptor-only, and does not own renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, storage, network, physics, or frame-loop behavior.

## Files changed

Added:

```txt
games/signal-bastion/src/signal-bastion-beacon-tower-evacuation-readiness-domain-kit.js
games/signal-bastion/src/signal-bastion-beacon-tower-evacuation-readiness-entry.js
tests/signal-bastion-beacon-tower-evacuation-readiness-kits-smoke.mjs
tests/signal-bastion-beacon-tower-evacuation-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-1930-signal-bastion-beacon-tower-evacuation-upgrade.md
```

Updated:

```txt
games/signal-bastion/index.html
package.json
```

## Tests added

- `tests/signal-bastion-beacon-tower-evacuation-readiness-kits-smoke.mjs`
  - Runs 10 tower-defense intake cases through every new atomic kit and the composite domain.
  - Checks descriptor family counts, readiness bounds, pressure bounds, phase enum, renderer-handoff parity, JSON safety, prepared-state improvement, and ownership exclusions.
- `tests/signal-bastion-beacon-tower-evacuation-cdn-state-input-smoke.mjs`
  - Validates route markers, NexusEngine main CDN import, old `NexusRealtime@` absence in the changed entry, `GameHost` accessors, renderer handoff composition, ownership boundaries, 10 simulated state/input cases, and CDN download-to-local-`.mjs` syntax checking when network is available.

## Validation results

Observed local validation before connector writes:

```txt
node --check games/signal-bastion/src/signal-bastion-beacon-tower-evacuation-readiness-domain-kit.js
node --check games/signal-bastion/src/signal-bastion-beacon-tower-evacuation-readiness-entry.js
npm run check:signal-bastion-beacon-tower-evacuation

Signal Bastion beacon tower evacuation readiness kits smoke passed 10 intake cases.
Signal Bastion beacon tower evacuation CDN/state/input smoke passed 10 simulated cases; CDN validation: source-wiring-only.
```

Validation caught and fixed one broken kit behavior: a one-tower board emitted too few tower-shadow watch descriptors. The shadow kit now pads from map slots to keep a stable five-watch-zone descriptor contract.

Full repo `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full cloned workspace. The focused kit and CDN/state/input checks were run and passed.

## NexusRealtime import audit

- New entry imports:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- New and changed pass files contain no old `NexusRealtime@` CDN import.
- The existing Signal Bastion boot bridge still imports ProtoKits from historical `NexusRealtime-ProtoKits` package URLs; that bridge was not changed because this pass is scoped to the new beacon evacuation layer.

## Cleanup pass

- Confirmed reusable kit file owns no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, storage, network, physics, or frame loop.
- Confirmed browser entry owns only route integration, overlay canvas, panel text, and descriptor drawing.
- Confirmed route advertises and loads the cache-busted beacon entry.
- Preserved existing tower-defense gameplay, field hospital pass, supply convoy pass, and base renderer.

## Next safe ledge

Next safe ledge: add one shared Signal Bastion overlay adapter so field hospital, supply convoy, and beacon evacuation descriptors draw through a single route-owned canvas while each domain kit stays descriptor-only. Avoid upgrading `games/signal-bastion/` again on the next automation run unless it is the only safe target.
