# 2026-07-10 00:44 - Tiny Diffusion latent garden pollination upgrade

## Chosen experiment

- `experiments/tiny-diffusion-lab/`
- New route: `experiments/tiny-diffusion-lab/latent-garden-pollination.html`
- New pass: `latent-garden-pollination-readiness-renderer-handoff-pass`

## Why it was chosen

The latest completed remote ledger was the Meadow rainwater pond restoration route, so this run chose a different experiment. Tiny Diffusion Lab is useful, but it still has the lowest game feel because most of the loop is button-driven training and panel inspection. This pass adds a small objective layer that makes samples feel like a procedural garden: prompt seed packets germinate, color soil beds diversify, gradient trellises stabilize denoising, pollen bees carry variation, checkpoint hives protect progress, and a dawn pollen ledger records readiness.

## Last upgraded experiment

- Last upgraded experiment observed from latest remote ledger: `experiments/high-fidelity-meadow/`
- Latest ledger before this run: `.agent/turn-ledger/2026-07-10-0016-meadow-rainwater-pond-restoration-upgrade.md`
- This run chose `experiments/tiny-diffusion-lab/`, so it does not repeat the last route.

## Experiment inventory

| Experiment | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime imports | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Scene-host transition route with rescue overlays. | 3-8 minutes | Click exits, collect puzzle tokens, scene state, descriptors. | No changed-route old CDN found. | Uses NexusEngine main CDN route passes. |
| `experiments/vr-platformer-board/storm-harbor.html` | Board-scale storm harbor platformer. | 5-10 minutes | A/D movement, jump, reset, collect supplies, avoid hazards. | No changed-route old CDN found. | Uses NexusEngine main CDN route passes. |
| `experiments/infinite-radial-terrain/` | Radial terrain inspection route. | 5-12 minutes | WASD flight, terrain LOD, origin snapping, rescue descriptors. | No changed-route old CDN found. | Uses NexusEngine main CDN validation pass. |
| `experiments/high-fidelity-meadow/` | Procedural meadow ecology scene. | 4-10 minutes | Orbit/inspect meadow, ecology markers, brood, soil, pond descriptors. | Historical package names remain in older layers. | Uses NexusEngine main CDN validation pass. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion training lab with objective overlays. | 6-15 minutes | Prepare, train, sample, checkpoint, inspect readiness panels, garden descriptors. | No changed-route old CDN found. | Changed entry imports NexusEngine main CDN. |
| `experiments/living-agent-lab/market-fire-evacuation.html` | Procedural market emergency drill. | 5-12 minutes | Inspect hazards, clear aisles, stage relays, account for civilians. | No changed-route old CDN found. | Uses NexusEngine main CDN validation pass. |
| `experiments/fogline-relay/` | First-person fog survey and rescue route. | 5-12 minutes | Scan targets, route through fog, avoid hazards, rescue descriptors. | Older page loader removed in prior Fogline pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/nexus-frontier-signal-isles/` | Field engineer island slice. | 8-15 minutes | Scan, harvest, build, cargo, tide, storm, desalination descriptors. | No changed-route old CDN found. | Uses NexusEngine main CDN validation pass. |
| `apps/the-cavalry-of-rome/` | Painted Roman strategy-map proof. | 5-10 minutes | Pan/hover, region focus, army and morale descriptors. | No changed-route old CDN found. | Uses NexusEngine main CDN validation pass. |
| `games/signal-bastion/` | 2.5D tower defense game. | 8-20 minutes | Tower cards, placement ghosts, range rings, waves, supply descriptors. | Historical package names remain for compatibility. | Uses NexusEngine main CDN validation pass. |
| `games/stonewake-depths/` | Flooded cavern rescue game. | 10-20 minutes | Block carrying, valves, rune plates, survivor pings, cartography descriptors. | No changed-route old CDN found. | Uses NexusEngine main CDN validation pass. |
| `experiments/next-ledge/` | Grapple-climb validation route. | 4-9 minutes | Grapple/action input, ledges, swing pressure, rescue descriptors. | No changed-route old CDN found. | Uses NexusEngine main CDN validation pass. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller/camera validation. | 5-10 minutes | Locomotion, spring camera, debug rays, rescue overlays. | No changed-route old CDN found. | Uses NexusEngine main CDN validation pass. |
| `experiments/sora-the-infinite/stormglass-courier.html` | Procedural open flight courier route. | 6-12 minutes | Thermal lanes, storm cells, buoy tuning, cargo, landing. | No changed-route old CDN found. | Uses NexusEngine main CDN validation pass. |
| `experiments/zombie-orchard/` | Orchard survival slice. | 8-18 minutes | Rounds, horde pressure, pickups, weapons, refuge overlays. | No changed-route old CDN found. | Uses NexusEngine main CDN validation pass. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route. | 12-25 minutes | Portals, inventory, harvesting, building, waves, quarantine descriptors. | No changed-route old CDN found. | Uses NexusEngine main CDN validation pass. |
| `experiments/onnx-agent-lab/red-team-evacuation.html` | Red-team evacuation and safehouse rollback workshop. | 6-15 minutes | Canary prompts, sandbox locks, evidence routes, rollback drills. | No changed-route old CDN found. | Uses NexusEngine main CDN validation pass. |

## Domain ASCII tree

```txt
tiny-diffusion-latent-garden-pollination-readiness-domain
├─ prompt-germination-domain
│  ├─ seed-packet-domain
│  │  └─ tiny-diffusion-prompt-seed-packet-kit
│  └─ color-soil-domain
│     └─ tiny-diffusion-color-soil-bed-kit
├─ denoise-pollination-domain
│  ├─ gradient-trellis-domain
│  │  └─ tiny-diffusion-gradient-trellis-kit
│  └─ pollen-bee-domain
│     └─ variance-bloom-subdomain
│        └─ tiny-diffusion-pollen-bee-swarm-kit
├─ export-orchard-domain
│  ├─ checkpoint-hive-domain
│  │  └─ tiny-diffusion-checkpoint-hive-kit
│  └─ dawn-pollen-ledger-domain
│     └─ tiny-diffusion-dawn-pollen-ledger-kit
└─ renderer-handoff
   └─ tiny-diffusion-latent-garden-pollination-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `experiments/tiny-diffusion-lab/app/latent-garden-pollination-readiness-kits.js` with:

- `tiny-diffusion-prompt-seed-packet-kit`
- `tiny-diffusion-color-soil-bed-kit`
- `tiny-diffusion-gradient-trellis-kit`
- `tiny-diffusion-pollen-bee-swarm-kit`
- `tiny-diffusion-checkpoint-hive-kit`
- `tiny-diffusion-dawn-pollen-ledger-kit`
- `tiny-diffusion-latent-garden-pollination-renderer-handoff-kit`
- Composite domain kit: `tiny-diffusion-latent-garden-pollination-readiness-domain-kit`

The reusable logic is deterministic, idempotent, descriptor-only, and excludes renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame loop, model training, model inference, storage, and network ownership.

## Files changed

Added:

```txt
experiments/tiny-diffusion-lab/app/latent-garden-pollination-readiness-kits.js
experiments/tiny-diffusion-lab/app/latent-garden-pollination-readiness-entry.js
experiments/tiny-diffusion-lab/latent-garden-pollination.html
tests/tiny-diffusion-latent-garden-pollination-readiness-kits-smoke.mjs
tests/tiny-diffusion-latent-garden-pollination-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-10-0044-tiny-diffusion-latent-garden-pollination-upgrade.md
```

Updated:

```txt
No existing files were modified in this connector-safe landing path.
```

## Tests added

- `tests/tiny-diffusion-latent-garden-pollination-readiness-kits-smoke.mjs`
  - Runs 10 intake cases through every new atomic kit and the composite domain.
  - Checks descriptor counts, readiness bounds, artifact-pressure bounds, mission-state enums, JSON safety, renderer handoff policy, and ownership exclusions.
- `tests/tiny-diffusion-latent-garden-pollination-cdn-state-input-smoke.mjs`
  - Validates route markers, NexusEngine main CDN usage, old `NexusRealtime@` absence, host accessors, reusable-kit isolation, 10 simulated state/input cases, and CDN download-to-local-`.mjs` syntax checking when network is available.

## Validation results

Observed local validation before connector writes:

```txt
node --check experiments/tiny-diffusion-lab/app/latent-garden-pollination-readiness-kits.js
node --check experiments/tiny-diffusion-lab/app/latent-garden-pollination-readiness-entry.js
node tests/tiny-diffusion-latent-garden-pollination-readiness-kits-smoke.mjs
node tests/tiny-diffusion-latent-garden-pollination-cdn-state-input-smoke.mjs

Tiny Diffusion latent garden pollination readiness kits smoke passed 10 intake cases.
Tiny Diffusion latent garden pollination CDN/state/input smoke passed 10 simulated cases; CDN validation: downloaded-to-local-mjs-and-syntax-checked.
```

Full repo `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from this partial scratch workspace. The focused kit and CDN/state/input checks passed.

## NexusRealtime import audit

- New entry imports:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- New and changed pass files contain no old `NexusRealtime@` CDN import.
- Historical dependency names remain in `package.json` for compatibility with older routes.

## Cleanup pass

- Confirmed reusable garden kit owns no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, storage, network, model training, model inference, or frame loop.
- Confirmed browser entry owns only route integration, readiness panel text, lightweight host patching, and descriptor rendering.
- Confirmed the standalone route keeps the existing Tiny Diffusion index untouched while adding a focused objective surface.
- No destructive changes were made.

## Non-game handling

Tiny Diffusion Lab is not a conventional small web game. This pass preserves its useful model-training workshop functionality and adds a more experience-driven objective route that can be tested independently.

## Next safe ledge

Next safe ledge: link `latent-garden-pollination.html` from the main Tiny Diffusion Lab panel or gallery once shared route metadata can be updated without clobbering concurrent scheduled work.
