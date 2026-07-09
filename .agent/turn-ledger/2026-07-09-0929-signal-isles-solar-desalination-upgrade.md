# 2026-07-09 09:29 ET — Signal Isles Solar Desalination Upgrade

## Chosen experiment

`experiments/nexus-frontier-signal-isles/`

## Why it was chosen

Signal Isles already has a good first-person island engineering loop, but its freshwater survival stakes were still mostly implied by scan/harvest/build/cargo pressure. The route benefited from one more concrete, objective-driven system that adds visible variety without moving reusable logic into the renderer.

The chosen improvement adds a solar desalination recovery loop: scan salt pans, build solar still frames, pack mangrove charcoal filters, seal cistern jars, release freshwater ration buoys, and expose a dawn water ledger.

## Last upgraded experiment checked before selection

Latest commit context at selection time showed the previous completed route work as `experiments/fogline-relay/` tide siren evacuation. During this run, other scheduled connector activity also landed Tiny Diffusion latent museum, Signal Isles stormbreak signal mast, and Zombie Orchard radio fence commits on `main`; this run preserved those visible changes and did not overwrite the later merged Signal Isles index state.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Scene transition story proof | 2-5 min | HTML scene exits, puzzle tokens, inventory/visited state | No known old CDN import found | Mixed/route-local; prior overlays may use CDN |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale platform rescue | 1-3 min | Jumping, hazards, coins/oxygen, medevac descriptors | No known old CDN import found | Yes in upgraded route entry |
| `experiments/infinite-radial-terrain/` | Radial terrain flight | Open-ended | WASD flight, origin snapping, terrain LOD | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/high-fidelity-meadow/` | Procedural meadow scene | Open-ended | Camera movement, vegetation/ecology descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/tiny-diffusion-lab/` | Browser diffusion lab | 3-8 min | Train/sample/checkpoint and readiness panels | No known old CDN import found | Yes through Nexus diffusion/lab entries |
| `experiments/living-agent-lab/` | Agent market/civic route | 2-5 min | Agent choice, trust, permit/vendor/dispute descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/fogline-relay/` | First-person fog survey | 3-6 min | Scan targets, fog zones, timed pressure, hazards | No known old CDN import found | Yes in upgraded overlay entries |
| `experiments/nexus-frontier-signal-isles/` | Field engineer island slice | 5-10 min | Scan, harvest, build, cargo, gates, storm/clinic/desalination descriptors | No known old CDN import found in changed files | Yes; changed entry imports NexusEngine main CDN |
| `apps/the-cavalry-of-rome/` | Painted Rome strategy map | 2-5 min | Pan/hover/dive map, army reveal, campaign descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `games/signal-bastion/` | Tower defense route | 5-10 min | Tower placement, waves, range rings, supply descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `games/stonewake-depths/` | Flood rescue game | 5-10 min | Carry blocks, valve pressure, gates, survivor pings | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/next-ledge/` | Grapple climb validation | 2-5 min | Grapple, ledges, swing pressure, summit descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/sora-the-infinite/` | Open flight redirect/route | Open-ended | Aerial traversal, visual domains, flight readability | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/zombie-orchard/` | Survival orchard slice | 3-8 min | Horde rounds, pressure, pickups, weapons | No known old CDN import found | Yes in upgraded overlay entries |
| `games/rogue-lite-hellscape-siege/` | Action/base siege route | 5-12 min | Harvest, build, portals, waves, purification descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/onnx-agent-lab/signal-calibration.html` | ONNX workshop calibration route | 3-6 min | Model handshake, fallback rails, tool/prompt/memory descriptors | No known old CDN import found | Yes in upgraded route entry |

## Domain ASCII tree

```txt
signal-isles-solar-desalination-readiness-domain
├─ freshwater-source-domain
│  ├─ solar-still-frame-domain
│  │  └─ signal-isles-solar-still-frame-kit
│  └─ salt-pan-gauge-domain
│     └─ signal-isles-salt-pan-gauge-kit
├─ purification-storage-domain
│  ├─ cistern-jar-domain
│  │  ├─ sealed-clay-vessel-domain
│  │  │  └─ signal-isles-cistern-jar-kit
│  └─ mangrove-charcoal-filter-domain
│     └─ signal-isles-mangrove-charcoal-filter-kit
├─ relief-handoff-domain
│  ├─ ration-buoy-domain
│  │  └─ signal-isles-ration-buoy-kit
│  └─ dawn-water-ledger-domain
│     └─ signal-isles-dawn-water-ledger-kit
└─ renderer-handoff
   └─ signal-isles-solar-desalination-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `signal-isles-solar-still-frame-kit`
- `signal-isles-salt-pan-gauge-kit`
- `signal-isles-cistern-jar-kit`
- `signal-isles-mangrove-charcoal-filter-kit`
- `signal-isles-ration-buoy-kit`
- `signal-isles-dawn-water-ledger-kit`
- `signal-isles-solar-desalination-renderer-handoff-kit`
- `signal-isles-solar-desalination-readiness-domain-kit`

All reusable kits accept plain state input and return serializable descriptor output. They explicitly exclude renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, frame-loop, and storage ownership.

## Files changed

Added:

- `experiments/_kits/nexus-frontier-signal-isles/signal-isles-solar-desalination-readiness-domain-kits.js`
- `experiments/nexus-frontier-signal-isles/src/solar-desalination-readiness-entry.js`
- `tests/signal-isles-solar-desalination-readiness-kits-smoke.mjs`
- `tests/signal-isles-solar-desalination-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-0929-signal-isles-solar-desalination-upgrade.md`

Updated:

- `experiments/nexus-frontier-signal-isles/index.html`
- `experiments/_shared/nexus-gallery-data.js`

## Tests added

- `tests/signal-isles-solar-desalination-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Validates every descriptor group.
  - Validates readiness bounds, salt pressure bounds, mission-state enums, descriptor counts, JSON safety, and renderer-neutral ownership.

- `tests/signal-isles-solar-desalination-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Validates route script wiring, NexusEngine main CDN use, no old `NexusRealtime@` import in the changed entry, `GameHost` readiness/tree/handoff exposure, and reusable-kit isolation.

## Validation results

Scratch local Node validation passed before connector writes:

```txt
node --check experiments/_kits/nexus-frontier-signal-isles/signal-isles-solar-desalination-readiness-domain-kits.js
node --check experiments/nexus-frontier-signal-isles/src/solar-desalination-readiness-entry.js
node --check tests/signal-isles-solar-desalination-readiness-kits-smoke.mjs
node --check tests/signal-isles-solar-desalination-cdn-state-input-smoke.mjs
node tests/signal-isles-solar-desalination-readiness-kits-smoke.mjs
node tests/signal-isles-solar-desalination-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Signal Isles solar desalination readiness kits smoke passed 10 intake cases.
Signal Isles solar desalination CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace because this shell runtime could not resolve `github.com`; this is a connector-only limitation, not a kit failure.

## NexusRealtime import audit

Changed files:

- `solar-desalination-readiness-entry.js` imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- `solar-desalination-readiness-entry.js` does not import `NexusRealtime@`.
- `signal-isles-solar-desalination-readiness-domain-kits.js` has no runtime import and no browser/renderer ownership.
- The CDN/state-input smoke asserts the route marker, changed entry CDN import, and absence of old `NexusRealtime@` runtime import.

## Cleanup pass

- Preserved concurrent stormbreak signal mast route wiring in the Signal Isles shell.
- Kept the new desalination logic renderer-neutral and idempotent.
- Used descriptor composition instead of replacing previous `GameHost.getRendererHandoff()` output.
- Left existing storm surge, field hospital, and other Signal Isles readiness passes intact.
- No destructive deletes.

## Next safe ledge

Add a water scarcity gameplay bridge inside the base Signal Isles host state so the solar desalination descriptors can react to explicit water inventory, ration events, and thirst pressure instead of inferring readiness from scan/harvest/build/cargo facts alone.
