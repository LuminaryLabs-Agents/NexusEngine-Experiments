# 2026-07-09 20:04 - VR Board harbor crane evacuation upgrade

## Chosen experiment

- `experiments/vr-platformer-board/storm-harbor.html`
- New pass: `vr-board-harbor-crane-evacuation-readiness-renderer-handoff-pass`
- New entry: `experiments/vr-platformer-board/harbor-crane-evacuation-entry.js`

## Why it was chosen

The latest local completed upgrade was `games/signal-bastion/` beacon tower evacuation, so this run chose a different experiment. `vr-platformer-board/storm-harbor.html` is a compact board-scale route with a strong rescue shell, but it still benefits from a more tactile physical objective layer. The harbor crane evacuation pass adds crane rigging, swinging hooks, crate bridges, counterweights, triage baskets, and a dawn crane ledger over the existing storm harbor and lighthouse rescue route.

## Last upgraded experiment

- Last upgraded experiment observed from the latest local ledger: `games/signal-bastion/`
- Latest local ledger before this run: `.agent/turn-ledger/2026-07-09-1930-signal-bastion-beacon-tower-evacuation-upgrade.md`
- This run chose `experiments/vr-platformer-board/storm-harbor.html`, so it does not repeat the last route.

## Experiment inventory

| Experiment | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime imports | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Scene-host route proof with scene transition rescue overlays. | 3-8 minutes | Click exits, collect puzzle tokens, scene state, descriptor overlays. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN route passes. |
| `experiments/vr-platformer-board/storm-harbor.html` | Board-scale storm harbor platformer with lighthouse and harbor crane rescue overlays. | 5-10 minutes | A/D movement, jump, reset, collect supplies, avoid storm hazards, tune rescue descriptors. | Changed files contain no old `NexusRealtime@` CDN import. | Changed entry imports NexusEngine main CDN. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain inspection with rescue/cartography overlays. | 5-12 minutes | WASD flight, terrain LOD, origin snapping, rescue descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/high-fidelity-meadow/` | Procedural meadow ecology scene with rescue descriptors. | 4-10 minutes | Orbit/inspect meadow, ecology markers, brood rescue descriptors. | Base renderer still has historical ProtoKits naming. | Uses NexusEngine main CDN validation pass. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion training and curriculum lab. | 6-15 minutes | CPU training, sampling, checkpoints, readiness panels. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/living-agent-lab/market-fire-evacuation.html` | Procedural market emergency drill. | 5-12 minutes | Inspect hazards, clear aisles, stage relays, account for civilians. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/fogline-relay/` | First-person fog survey and rescue route. | 5-12 minutes | Scan targets, route through fog, avoid hazards, rescue descriptors. | Older page loader was removed in a prior Fogline pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/nexus-frontier-signal-isles/` | Field engineer island slice. | 8-15 minutes | Scan, harvest, build, cargo, tide and storm descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `apps/the-cavalry-of-rome/` | Painted Roman strategy-map proof. | 5-10 minutes | Pan/hover, region focus, army and morale descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `games/signal-bastion/` | 2.5D cel-style tower defense game. | 8-20 minutes | Tower cards, placement ghosts, waves, hospital/supply/beacon descriptors. | Existing package names include historical NexusRealtime ProtoKits; changed beacon entry uses no old CDN. | Uses NexusEngine main CDN validation pass. |
| `games/stonewake-depths/` | Flooded cavern rescue game. | 10-20 minutes | Block carrying, valves, rune plates, survivor pings, cartography descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/next-ledge/` | Grapple-climb validation route. | 4-9 minutes | Grapple/action input, ledges, swing pressure, rescue descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller/camera validation. | 5-10 minutes | Locomotion, spring camera, route caches, rescue overlays. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/sora-the-infinite/stormglass-courier.html` | Procedural open flight courier route. | 6-12 minutes | Thermal lanes, storm cells, buoy tuning, landing. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/zombie-orchard/` | Orchard survival slice. | 8-18 minutes | Rounds, horde pressure, pickups, weapons, refuge overlays. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route. | 12-25 minutes | Portals, inventory, harvesting, building, waves, quarantine descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/onnx-agent-lab/red-team-evacuation.html` | Red-team evacuation workshop. | 6-15 minutes | Canary prompts, sandbox locks, evidence routes, rollback drills. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |

## Domain ASCII tree

```txt
vr-board-harbor-crane-evacuation-readiness-domain
├─ crane-rigging-domain
│  ├─ gantry-rail-domain
│  │  └─ vr-board-gantry-rail-kit
│  └─ rescue-hook-domain
│     └─ vr-board-rescue-hook-sling-kit
├─ cargo-corridor-domain
│  ├─ crate-bridge-domain
│  │  └─ vr-board-floating-crate-bridge-kit
│  └─ tide-counterweight-domain
│     └─ vr-board-tide-counterweight-kit
├─ survivor-transfer-domain
│  ├─ triage-basket-domain
│  │  └─ vr-board-triage-basket-kit
│  └─ dawn-crane-ledger-domain
│     └─ vr-board-dawn-crane-ledger-kit
└─ renderer-handoff
   └─ vr-board-harbor-crane-evacuation-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `experiments/_kits/vr-platformer-board/vr-board-harbor-crane-evacuation-readiness-kits.js` with:

- `vr-board-gantry-rail-kit`
- `vr-board-rescue-hook-sling-kit`
- `vr-board-floating-crate-bridge-kit`
- `vr-board-tide-counterweight-kit`
- `vr-board-triage-basket-kit`
- `vr-board-dawn-crane-ledger-kit`
- `vr-board-harbor-crane-evacuation-renderer-handoff-kit`
- Composite domain kit: `vr-board-harbor-crane-evacuation-readiness-domain-kit`

The reusable kit logic is deterministic, idempotent, descriptor-only, and does not own renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, storage, network, physics, or frame-loop behavior.

## Files changed

Added:

```txt
experiments/_kits/vr-platformer-board/vr-board-harbor-crane-evacuation-readiness-kits.js
experiments/vr-platformer-board/harbor-crane-evacuation-entry.js
tests/vr-board-harbor-crane-evacuation-readiness-kits-smoke.mjs
tests/vr-board-harbor-crane-evacuation-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-2004-vr-board-harbor-crane-evacuation-upgrade.md
```

Updated:

```txt
experiments/vr-platformer-board/storm-harbor.html
package.json
```

## Tests added

- `tests/vr-board-harbor-crane-evacuation-readiness-kits-smoke.mjs`
  - Runs 10 storm-harbor board intake cases through every new atomic kit and the composite domain.
  - Checks descriptor counts, bounded readiness, mission-state enum, JSON safety, descriptor-only handoff policy, and ownership exclusions.
- `tests/vr-board-harbor-crane-evacuation-cdn-state-input-smoke.mjs`
  - Validates route markers, NexusEngine main CDN usage, old `NexusRealtime@` absence in the changed entry, `GameHost` accessors, reusable-kit isolation, 10 simulated state/input cases, and CDN download-to-local-`.mjs` syntax checking when network is available.

## Validation results

Observed local validation:

```txt
node --check experiments/_kits/vr-platformer-board/vr-board-harbor-crane-evacuation-readiness-kits.js
node --check experiments/vr-platformer-board/harbor-crane-evacuation-entry.js
npm run check:vr-board-harbor-crane-evacuation

VR Board harbor crane evacuation readiness kits smoke passed 10 intake cases.
VR Board harbor crane evacuation CDN/state/input smoke passed 10 simulated cases; CDN validation: downloaded-to-local-mjs-and-syntax-checked.
```

Full repo `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from this partial scratch workspace. The focused kit and CDN/state/input checks passed.

## NexusRealtime import audit

- New entry imports:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- New and changed pass files contain no old `NexusRealtime@` CDN import.
- The existing package still contains historical dependency names for compatibility with older routes; this pass did not alter those dependencies.

## Cleanup pass

- Confirmed reusable kit file owns no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, storage, network, physics, or frame loop.
- Confirmed browser entry owns only route integration, readiness panel text, and host patching.
- Confirmed route advertises and loads the cache-busted harbor crane entry.
- Preserved the existing storm harbor and breakwater lighthouse gameplay and descriptors.

## Next safe ledge

Next safe ledge: unify the Storm Harbor, Breakwater Lighthouse, and Harbor Crane readiness panels under one route-owned rescue status adapter, while keeping all three domain kits descriptor-only.
