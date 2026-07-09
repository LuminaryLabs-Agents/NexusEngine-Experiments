# 2026-07-09 10:13 ET — Hellscape Obsidian Seed Vault Upgrade

## Chosen experiment

`games/rogue-lite-hellscape-siege/`

## Why it was chosen

The latest completed upgrade was Signal Isles, so this run selected a different route. Rogue-Lite Hellscape Siege already has a playable wave/harvest/build loop, but the long-term objective pressure was still mostly survival and purification. The route benefited from a more concrete recovery goal that adds visible procedural landmarks without moving reusable logic into the renderer.

The improvement adds an obsidian seed vault loop: recover charred orchard seed cores, seal them into obsidian shelves, run ash irrigation rills, raise blight-scarecrow sigils, escort sanctuary seed carts, and expose a dawn reseeding ledger.

## Last upgraded experiment checked before selection

Latest ledger context showed the previous completed route as `experiments/nexus-frontier-signal-isles/` with the solar desalination readiness upgrade.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Scene transition story proof | 2-5 min | HTML scene exits, puzzle tokens, inventory/visited state | No known old CDN import found | Mixed route-local; prior overlays may use CDN |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale platform rescue | 1-3 min | Jumping, hazards, coins/oxygen, medevac descriptors | No known old CDN import found | Yes in upgraded route entry |
| `experiments/infinite-radial-terrain/` | Radial terrain flight | Open-ended | WASD flight, origin snapping, terrain LOD | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/high-fidelity-meadow/` | Procedural meadow scene | Open-ended | Camera movement, vegetation/ecology descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/tiny-diffusion-lab/` | Browser diffusion lab | 3-8 min | Train/sample/checkpoint and readiness panels | No known old CDN import found | Yes through Nexus diffusion/lab entries |
| `experiments/living-agent-lab/` | Agent market/civic route | 2-5 min | Agent choice, trust, permit/vendor/dispute descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/fogline-relay/` | First-person fog survey | 3-6 min | Scan targets, fog zones, timed pressure, hazards | No known old CDN import found | Yes in upgraded overlay entries |
| `experiments/nexus-frontier-signal-isles/` | Field engineer island slice | 5-10 min | Scan, harvest, build, cargo, gates, storm/clinic/desalination descriptors | No known old CDN import found in changed files | Yes; latest changed entry imports NexusEngine main CDN |
| `apps/the-cavalry-of-rome/` | Painted Rome strategy map | 2-5 min | Pan/hover/dive map, army reveal, campaign descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `games/signal-bastion/` | Tower defense route | 5-10 min | Tower placement, waves, range rings, supply descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `games/stonewake-depths/` | Flood rescue game | 5-10 min | Carry blocks, valve pressure, gates, survivor pings | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/next-ledge/` | Grapple climb validation | 2-5 min | Grapple, ledges, swing pressure, summit/avalanche descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/sora-the-infinite/` | Open flight redirect/route | Open-ended | Aerial traversal, visual domains, flight readiness | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/zombie-orchard/` | Survival orchard slice | 3-8 min | Horde rounds, pressure, pickups, weapons, rescue descriptors | No known old CDN import found | Yes in upgraded overlay entries |
| `games/rogue-lite-hellscape-siege/` | Base siege action route | 5-12 min | Harvest, build, portals, waves, purification, forge, caravan, refuge, and seed vault descriptors | No known old CDN import found in changed files | Yes; base route and changed entry import NexusEngine main CDN |
| `experiments/onnx-agent-lab/signal-calibration.html` | ONNX workshop calibration route | 3-6 min | Model handshake, fallback rails, tool/prompt/memory descriptors | No known old CDN import found | Yes in upgraded route entry |

## Domain ASCII tree

```txt
hellscape-obsidian-seed-vault-readiness-domain
├─ seed-recovery-domain
│  ├─ charred-orchard-seed-domain
│  │  └─ hellscape-charred-orchard-seed-kit
│  └─ obsidian-vault-shelf-domain
│     └─ hellscape-obsidian-vault-shelf-kit
├─ warded-agriculture-domain
│  ├─ ash-irrigation-domain
│  │  └─ ember-rill-subdomain
│  │     └─ hellscape-ash-irrigation-channel-kit
│  └─ blight-scarecrow-domain
│     └─ hellscape-blight-scarecrow-sigil-kit
├─ caravan-handoff-domain
│  ├─ sanctuary-seed-cart-domain
│  │  └─ hellscape-sanctuary-seed-cart-kit
│  └─ dawn-reseeding-ledger-domain
│     └─ hellscape-dawn-reseeding-ledger-kit
└─ renderer-handoff
   └─ hellscape-obsidian-seed-vault-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `hellscape-charred-orchard-seed-kit`
- `hellscape-obsidian-vault-shelf-kit`
- `hellscape-ash-irrigation-channel-kit`
- `hellscape-blight-scarecrow-sigil-kit`
- `hellscape-sanctuary-seed-cart-kit`
- `hellscape-dawn-reseeding-ledger-kit`
- `hellscape-obsidian-seed-vault-renderer-handoff-kit`
- `hellscape-obsidian-seed-vault-readiness-domain-kit`

All reusable kit logic accepts plain state input and returns serializable descriptor output. The kit boundary excludes renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame-loop, physics, storage, and network ownership.

## Files changed

Added:

- `games/rogue-lite-hellscape-siege/src/hellscape-obsidian-seed-vault-readiness-domain-kit.js`
- `games/rogue-lite-hellscape-siege/src/hellscape-obsidian-seed-vault-readiness-entry.js`
- `tests/hellscape-obsidian-seed-vault-readiness-kits-smoke.mjs`
- `tests/hellscape-obsidian-seed-vault-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1013-hellscape-obsidian-seed-vault-upgrade.md`

Updated:

- `games/rogue-lite-hellscape-siege/index.html`

## Tests added

- `tests/hellscape-obsidian-seed-vault-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Validates all six descriptor families.
  - Validates readiness bounds, blight-pressure bounds, mission-state enums, descriptor counts, JSON safety, and renderer-neutral ownership.

- `tests/hellscape-obsidian-seed-vault-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Validates route marker wiring, NexusEngine main CDN import, old `NexusRealtime@` absence in the changed entry, `GameHost` readiness/tree/handoff exposure, and reusable-kit isolation.

## Validation results

Scratch local Node validation passed before connector writes:

```txt
node --check games/rogue-lite-hellscape-siege/src/hellscape-obsidian-seed-vault-readiness-domain-kit.js
node --check games/rogue-lite-hellscape-siege/src/hellscape-obsidian-seed-vault-readiness-entry.js
node --check tests/hellscape-obsidian-seed-vault-readiness-kits-smoke.mjs
node --check tests/hellscape-obsidian-seed-vault-cdn-state-input-smoke.mjs
node tests/hellscape-obsidian-seed-vault-readiness-kits-smoke.mjs
node tests/hellscape-obsidian-seed-vault-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Hellscape obsidian seed vault readiness kits smoke passed 10 intake cases.
Hellscape obsidian seed vault CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace because this shell runtime could not resolve `github.com`; this is a connector-only limitation, not a kit failure.

## NexusRealtime import audit

Changed files:

- `hellscape-obsidian-seed-vault-readiness-entry.js` imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- `hellscape-obsidian-seed-vault-readiness-entry.js` does not import `NexusRealtime@`.
- `hellscape-obsidian-seed-vault-readiness-domain-kit.js` has no runtime import and no browser/renderer ownership.
- `index.html` still uses the existing shared local page loader name, but no changed file adds an old `NexusRealtime@` CDN dependency.
- The CDN/state-input smoke asserts the route marker, changed entry CDN import, and absence of old `NexusRealtime@` runtime import.

## Cleanup pass

- Preserved the existing main game loop and all previously added Hellscape readiness passes.
- Added the new pass through composition rather than replacing `GameHost.getRendererHandoff()` output.
- Kept reusable domain logic in the kit file and DOM overlay behavior in the route entry.
- Left existing ash caravan, sanctuary forge, blood moon refuge, and ember well purification logic intact.
- No destructive deletes.

## Non-game handling

The chosen route is already a small experience-driven web game. No delete, rename, or refactor-away action was needed.

## Next safe ledge

Bridge the seed-vault descriptors into the base Hellscape inventory loop with explicit seed-core pickups and vault-shelf build recipes so the player can actively improve reseeding readiness through real collection/build events rather than mostly inferred wave/inventory state.
