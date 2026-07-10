# 2026-07-09 20:30 - ONNX safehouse rollback upgrade

## Chosen experiment

- `experiments/onnx-agent-lab/red-team-evacuation.html`
- New pass: `onnx-safehouse-rollback-readiness-renderer-handoff-pass`
- New entry: `experiments/onnx-agent-lab/safehouse-rollback-readiness-entry.js`

## Why it was chosen

The latest completed ledger was the VR Board harbor crane evacuation route, so this run chose a different experiment. ONNX Agent Lab remains one of the least conventional small web games because it is primarily a safety workshop. This upgrade preserves the red-team evacuation drill and adds a more spatial, objective-driven safehouse rollback layer with lantern wards, rollback keys, evidence lockers, model quarantine seals, operator bunks, and a dawn safehouse ledger.

## Last upgraded experiment

- Last upgraded experiment observed from latest ledger: `experiments/vr-platformer-board/storm-harbor.html`
- Latest ledger before this run: `.agent/turn-ledger/2026-07-09-2004-vr-board-harbor-crane-evacuation-upgrade.md`
- This run chose `experiments/onnx-agent-lab/red-team-evacuation.html`, so it does not repeat the last route.

## Experiment inventory

| Experiment | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime imports | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Scene-host transition route with archive and rescue overlays. | 3-8 minutes | Click exits, collect puzzle tokens, scene state, descriptor overlays. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN route passes. |
| `experiments/vr-platformer-board/storm-harbor.html` | Board-scale storm harbor platformer with lighthouse and harbor crane overlays. | 5-10 minutes | A/D movement, jump, reset, collect supplies, avoid hazards, tune rescue descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN route passes. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain inspection with rescue/cartography overlays. | 5-12 minutes | WASD flight, terrain LOD, origin snapping, rescue descriptors. | No changed-route old CDN found in this pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/high-fidelity-meadow/` | Procedural meadow ecology scene with restoration and rescue descriptors. | 4-10 minutes | Orbit/inspect meadow, ecology markers, brood and soil descriptors. | Historical ProtoKits naming remains in older renderer layers. | Uses NexusEngine main CDN validation pass. |
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
| `experiments/onnx-agent-lab/red-team-evacuation.html` | Red-team evacuation and safehouse rollback workshop. | 6-15 minutes | Canary prompts, sandbox locks, evidence routes, rollback drills, safehouse descriptors. | Changed files contain no old `NexusRealtime@` CDN import. | Changed entry imports NexusEngine main CDN. |

## Domain ASCII tree

```txt
onnx-safehouse-rollback-readiness-domain
├─ safehouse-prep-domain
│  ├─ lantern-ward-domain
│  │  └─ onnx-safehouse-lantern-ward-kit
│  └─ rollback-key-domain
│     └─ onnx-safehouse-rollback-key-kit
├─ evidence-preservation-domain
│  ├─ evidence-locker-domain
│  │  └─ onnx-safehouse-evidence-locker-kit
│  └─ quarantine-seal-domain
│     └─ model-quarantine-seal-domain
│        └─ onnx-safehouse-model-quarantine-seal-kit
├─ operator-recovery-domain
│  ├─ operator-bunk-domain
│  │  └─ onnx-safehouse-operator-bunk-kit
│  └─ dawn-safehouse-ledger-domain
│     └─ onnx-safehouse-dawn-ledger-kit
└─ renderer-handoff
   └─ onnx-safehouse-rollback-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `experiments/_kits/onnx-agent-lab/onnx-safehouse-rollback-readiness-kits.js` with:

- `onnx-safehouse-lantern-ward-kit`
- `onnx-safehouse-rollback-key-kit`
- `onnx-safehouse-evidence-locker-kit`
- `onnx-safehouse-model-quarantine-seal-kit`
- `onnx-safehouse-operator-bunk-kit`
- `onnx-safehouse-dawn-ledger-kit`
- `onnx-safehouse-rollback-renderer-handoff-kit`
- Composite domain kit: `onnx-safehouse-rollback-readiness-domain-kit`

The reusable kit logic is deterministic, idempotent, descriptor-only, and excludes renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, ONNX runtime loading, model inference, storage, network, and frame-loop ownership.

## Files changed

Added:

```txt
experiments/_kits/onnx-agent-lab/onnx-safehouse-rollback-readiness-kits.js
experiments/onnx-agent-lab/safehouse-rollback-readiness-entry.js
tests/onnx-safehouse-rollback-readiness-kits-smoke.mjs
tests/onnx-safehouse-rollback-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-2030-onnx-safehouse-rollback-upgrade.md
```

Updated:

```txt
experiments/onnx-agent-lab/red-team-evacuation.html
package.json
```

## Tests added

- `tests/onnx-safehouse-rollback-readiness-kits-smoke.mjs`
  - Runs 10 intake cases through every new atomic kit and the composite domain.
  - Checks descriptor counts, readiness bounds, pressure bounds, mission-state enums, JSON safety, and ownership exclusions.
- `tests/onnx-safehouse-rollback-cdn-state-input-smoke.mjs`
  - Validates route markers, NexusEngine main CDN usage, old `NexusRealtime@` absence, `GameHost` accessors, reusable-kit isolation, 10 simulated state/input cases, and CDN download-to-local-`.mjs` syntax checking when network is available.

## Validation results

Observed local validation:

```txt
node --check experiments/_kits/onnx-agent-lab/onnx-safehouse-rollback-readiness-kits.js
node --check experiments/onnx-agent-lab/safehouse-rollback-readiness-entry.js
npm run check:onnx-safehouse-rollback

ONNX safehouse rollback readiness kits smoke passed 10 intake cases.
ONNX safehouse rollback CDN/state/input smoke passed 10 simulated cases; CDN validation: downloaded-to-local-mjs-and-syntax-checked.
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

- Confirmed reusable safehouse kit owns no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, ONNX runtime loading, model inference, storage, network, or frame loop.
- Confirmed browser entry owns only route integration, readiness panel text, and host patching.
- Confirmed the route advertises both red-team evacuation and safehouse rollback passes.
- Preserved the existing red-team evacuation route and its `GameHost` surface.

## Non-game handling

ONNX Agent Lab is still a workshop route, not a conventional game. The useful functionality was preserved, and this pass moves it closer to a small experience-driven drill by adding visible spatial objectives and bounded readiness descriptors.

## Next safe ledge

Next safe ledge: combine red-team evacuation and safehouse rollback into one route-owned status adapter so the page has a single concise readiness panel while both domains remain descriptor-only.
