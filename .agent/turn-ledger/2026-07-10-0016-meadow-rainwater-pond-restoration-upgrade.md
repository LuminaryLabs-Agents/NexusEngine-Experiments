# 2026-07-10 00:16 - Meadow rainwater pond restoration upgrade

## Chosen experiment

- `experiments/high-fidelity-meadow/`
- New pass: `rainwater-pond-restoration-readiness-renderer-handoff-pass`
- New entry: `experiments/high-fidelity-meadow/src/meadow-rainwater-pond-restoration-entry.js`

## Why it was chosen

The latest completed remote ledger was the ONNX safehouse rollback route, so this run chose a different experiment. High Fidelity Meadow is visually ambitious, but it still behaves more like a procedural scene proof than a small objective loop. This pass adds a clearer ecological objective layer with rain-chain basins, mirror pools, frog call stones, reed filters, stepping logs, and a dusk pond ledger while preserving the renderer and existing meadow passes.

## Last upgraded experiment

- Last upgraded experiment observed from latest ledger: `experiments/onnx-agent-lab/red-team-evacuation.html`
- Latest ledger before this run: `.agent/turn-ledger/2026-07-09-2030-onnx-safehouse-rollback-upgrade.md`
- This run chose `experiments/high-fidelity-meadow/`, so it does not repeat the last route.

## Experiment inventory

| Experiment | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime imports | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Scene-host transition route with archive and rescue overlays. | 3-8 minutes | Click exits, collect puzzle tokens, scene state, descriptor overlays. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN route passes. |
| `experiments/vr-platformer-board/storm-harbor.html` | Board-scale storm harbor platformer with lighthouse and harbor crane overlays. | 5-10 minutes | A/D movement, jump, reset, collect supplies, avoid hazards, tune rescue descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN route passes. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain inspection with rescue/cartography overlays. | 5-12 minutes | WASD flight, terrain LOD, origin snapping, rescue descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/high-fidelity-meadow/` | Procedural meadow ecology scene with restoration and rescue descriptors. | 4-10 minutes | Orbit/inspect meadow, ecology markers, brood, soil, and pond descriptors. | Historical ProtoKits naming remains in older renderer layers. | Changed entry imports NexusEngine main CDN. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion training and curriculum lab. | 6-15 minutes | CPU training, sampling, checkpoints, museum/curriculum readiness panels. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/living-agent-lab/market-fire-evacuation.html` | Procedural market emergency drill. | 5-12 minutes | Inspect hazards, clear aisles, stage relays, account for civilians. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/fogline-relay/` | First-person fog survey and rescue route. | 5-12 minutes | Scan targets, route through fog, avoid hazards, rescue descriptors. | Older page loader removed in prior Fogline pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/nexus-frontier-signal-isles/` | Field engineer island slice. | 8-15 minutes | Scan, harvest, build, cargo, tide, storm, desalination descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `apps/the-cavalry-of-rome/` | Painted Roman strategy-map proof. | 5-10 minutes | Pan/hover, region focus, army and morale descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `games/signal-bastion/` | 2.5D tower defense game. | 8-20 minutes | Tower cards, placement ghosts, waves, hospital/supply/beacon descriptors. | Historical package names remain for compatibility. | Uses NexusEngine main CDN validation pass. |
| `games/stonewake-depths/` | Flooded cavern rescue game. | 10-20 minutes | Block carrying, valves, rune plates, survivor pings, cartography descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/next-ledge/` | Grapple-climb validation route. | 4-9 minutes | Grapple/action input, ledges, swing pressure, rescue descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller/camera validation. | 5-10 minutes | Locomotion, spring camera, debug rays, rescue overlays. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/sora-the-infinite/stormglass-courier.html` | Procedural open flight courier route. | 6-12 minutes | Thermal lanes, storm cells, buoy tuning, cargo, landing. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/zombie-orchard/` | Orchard survival slice. | 8-18 minutes | Rounds, horde pressure, pickups, weapons, refuge overlays. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route. | 12-25 minutes | Portals, inventory, harvesting, building, waves, quarantine descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/onnx-agent-lab/red-team-evacuation.html` | Red-team evacuation and safehouse rollback workshop. | 6-15 minutes | Canary prompts, sandbox locks, evidence routes, rollback drills, safehouse descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |

## Domain ASCII tree

```txt
meadow-rainwater-pond-restoration-readiness-domain
├─ water-catchment-domain
│  ├─ rain-chain-basin-domain
│  │  └─ meadow-rain-chain-basin-kit
│  └─ pond-mirror-pool-domain
│     └─ meadow-pond-mirror-pool-kit
├─ amphibian-habitat-domain
│  ├─ frog-call-stone-domain
│  │  └─ meadow-frog-call-stone-kit
│  └─ reed-filter-domain
│     └─ silt-sieve-subdomain
│        └─ meadow-reed-filter-bed-kit
├─ visitor-crossing-domain
│  ├─ stepping-log-domain
│  │  └─ meadow-stepping-log-route-kit
│  └─ dusk-pond-ledger-domain
│     └─ meadow-dusk-pond-ledger-kit
└─ renderer-handoff
   └─ meadow-rainwater-pond-restoration-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `experiments/high-fidelity-meadow/src/meadow-rainwater-pond-restoration-readiness-kits.js` with:

- `meadow-rain-chain-basin-kit`
- `meadow-pond-mirror-pool-kit`
- `meadow-frog-call-stone-kit`
- `meadow-reed-filter-bed-kit`
- `meadow-stepping-log-route-kit`
- `meadow-dusk-pond-ledger-kit`
- `meadow-rainwater-pond-restoration-renderer-handoff-kit`
- Composite domain kit: `meadow-rainwater-pond-restoration-readiness-domain-kit`

The reusable kit logic is deterministic, idempotent, descriptor-only, and excludes renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, storage, network, physics, and frame-loop ownership.

## Files changed

Added:

```txt
experiments/high-fidelity-meadow/src/meadow-rainwater-pond-restoration-readiness-kits.js
experiments/high-fidelity-meadow/src/meadow-rainwater-pond-restoration-entry.js
tests/meadow-rainwater-pond-restoration-readiness-kits-smoke.mjs
tests/meadow-rainwater-pond-restoration-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-10-0016-meadow-rainwater-pond-restoration-upgrade.md
```

Updated:

```txt
experiments/high-fidelity-meadow/index.html
package.json
```

## Tests added

- `tests/meadow-rainwater-pond-restoration-readiness-kits-smoke.mjs`
  - Runs 10 intake cases through every new atomic kit and the composite domain.
  - Checks descriptor counts, readiness bounds, silt-pressure bounds, mission-state enums, JSON safety, and ownership exclusions.
- `tests/meadow-rainwater-pond-restoration-cdn-state-input-smoke.mjs`
  - Validates route markers, NexusEngine main CDN usage, old `NexusRealtime@` absence, `GameHost` accessors, reusable-kit isolation, 10 simulated state/input cases, and CDN download-to-local-`.mjs` syntax checking when network is available.

## Validation results

Observed local validation before connector writes:

```txt
node --check experiments/high-fidelity-meadow/src/meadow-rainwater-pond-restoration-readiness-kits.js
node --check experiments/high-fidelity-meadow/src/meadow-rainwater-pond-restoration-entry.js
npm run check:meadow-rainwater-pond-restoration

Meadow rainwater pond restoration readiness kits smoke passed 10 intake cases.
Meadow rainwater pond restoration CDN/state/input smoke passed 10 simulated cases; CDN validation: downloaded-to-local-mjs-and-syntax-checked.
```

Full repo `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from this partial scratch workspace. The focused kit and CDN/state/input checks passed.

## NexusRealtime import audit

- New entry imports:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- New and changed pass files contain no old `NexusRealtime@` CDN import.
- Historical package dependency names remain for compatibility with older routes.

## Cleanup pass

- Confirmed reusable pond kit owns no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, storage, network, physics, or frame loop.
- Confirmed browser entry owns only route integration, readiness panel text, lightweight overlay drawing, and host patching.
- Confirmed the route advertises the new pass and preserves the existing meadow renderer plus previous meadow overlays.
- Kept gallery metadata untouched in this connector write to avoid a broad shared metadata rewrite; the route itself is updated and validated.

## Non-game handling

High Fidelity Meadow is still a scene-first experiment, not a conventional game. This pass preserves the useful visual functionality and adds a more objective-driven ecological layer that can be read and tested independently.

## Next safe ledge

Next safe ledge: fold the meadow overlays into one compact meadow stewardship panel so skylark, soil, creek, and pond descriptors share one readable route-level HUD while each domain remains descriptor-only.
