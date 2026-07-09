# 2026-07-09 12:14 ET — Tiny Diffusion Repair Mural Upgrade

## Chosen experiment

`experiments/tiny-diffusion-lab/`

## Why it was chosen

Tiny Diffusion Lab is useful as a browser-side Nexus Engine diffusion proof, but it is still one of the least experience-driven routes because its main loop is a lab workflow: prepare, train, sample, checkpoint. The improvement adds a clearer objective layer without deleting the lab: restore a damaged generated mural by evaluating seed brushes, palette wells, noise masks, critic ribbons, repair orders, and a dawn mural ledger.

## Last upgraded experiment found before this run

Latest commit search showed the previous completed upgrade series was `games/rogue-lite-hellscape-siege/` for the Hellscape harvester covenant pass. The latest visible commit before this work was:

```txt
2fe7b0a4934ced372dce7ba6996a0c00f0479fb0 Integrate Hellscape harvester covenant route
```

This run intentionally picked a different route.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Story-scene orchestration with scene exits, puzzle tokens, archive and evacuation overlays. | Short multi-scene path. | Click/route through HTML scenes, validate continuity state, collect tokens. | No direct `NexusRealtime@` runtime found in changed scope. | Uses modern Nexus Engine overlay entries in prior upgrades. |
| `experiments/vr-platformer-board/` | Board-scale jump/coin/hazard route with skyline medevac descriptors. | Short arcade board loop. | Move, jump, collect, avoid hazards, evaluate medevac readiness. | No direct `NexusRealtime@` runtime found in changed scope. | Skyline medevac entry uses main CDN. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation with aquifer cartography descriptors. | Open-ended traversal proof. | WASD flight, LOD/origin snapping, descriptor overlays. | No direct `NexusRealtime@` runtime found in changed scope. | Aquifer/skybridge entries use main CDN. |
| `experiments/high-fidelity-meadow/` | Procedural meadow scene with ecology and soil mycelium restoration. | Open-ended scene viewing. | Terrain/vegetation/wind/creature descriptors, ecological readiness. | No direct `NexusRealtime@` runtime found in changed scope. | Soil mycelium entry uses main CDN. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion proof with CPU training, sampling, checkpoints, dataset expedition, sample clinic, latent museum, and now repair mural readiness. | Short lab session, repeatable. | Prepare dataset, train epochs, sample denoise frames, checkpoint, evaluate artifact/mural readiness. | Changed entry does not import old `NexusRealtime@`; package still carries legacy dependency naming. | `main.js` and new repair mural entry import `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`. |
| `experiments/living-agent-lab/` | Market-agent and civic festival mediation descriptors. | Short lab loop. | ONNX/fallback guard, market trust, permits, vendor lanes, disputes. | No direct `NexusRealtime@` runtime found in changed scope. | Civic festival entry uses main CDN. |
| `experiments/fogline-relay/` | First-person survey loop with signal courier and evacuation descriptors. | Short timed survey. | Scan targets, fog zones, hazard pressure, evacuation readiness. | No direct `NexusRealtime@` runtime found in changed scope. | Tide/signal entries use main CDN. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island slice with scan, harvest, build, hospital, desalination descriptors. | Short survival/field loop. | Scan, harvest, build, gates, cargo and water readiness. | No direct `NexusRealtime@` runtime found in changed scope. | Solar desalination entries use main CDN. |
| `apps/the-cavalry-of-rome/` | Painterly Roman strategy-map visual proof. | Short map inspection. | Pan, hover, cinematic dive, inspect armies and campaign descriptors. | No direct `NexusRealtime@` runtime found in changed scope. | Frontier beacon pass uses main CDN. |
| `games/signal-bastion/` | 2.5D tower defense with supply convoy descriptors. | Short wave-defense loop. | Place towers, cards, range rings, field/supply readiness. | No direct `NexusRealtime@` runtime found in changed scope. | Supply convoy entry uses main CDN. |
| `games/stonewake-depths/` | Flooded cavern rescue with valve pressure and silt archive drainage. | Short puzzle/rescue loop. | Carry blocks, valves, gates, survivor pings, drainage readiness. | No direct `NexusRealtime@` runtime found in changed scope. | Prior drainage entries use main CDN. |
| `experiments/next-ledge/` | Grapple-climb validation with rescue and drone relay descriptors. | Short climb loop. | Grapple, ledge routing, swing pressure, rescue readiness. | No direct `NexusRealtime@` runtime found in changed scope. | Drone/avalanche entries use main CDN. |
| `experiments/sora-the-infinite/` | Aerial gateway into The Open Above with many flight readiness descriptors. | Short gateway plus redirect. | Launch rehearsal, microflight, rescue, rookery, star orchard overlays. | No direct `NexusRealtime@` runtime found in changed scope. | Sora entries use main CDN. |
| `experiments/zombie-orchard/` | Survival slice with rescue, cure crafting, quarantine, antiserum, and radio fence readiness. | Short round/horde loop. | Rounds, horde pressure, pickups, weapons, cure/rescue descriptors. | No direct `NexusRealtime@` runtime found in changed scope. | Antiserum/radio entries use main CDN. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with harvest/build/wave defense and many recovery descriptors. | Short wave/action loop. | Portals, inventory, harvesting, building, waves, recovery ledgers. | No direct `NexusRealtime@` runtime found in changed scope. | Latest Hellscape entries use main CDN. |
| `experiments/onnx-agent-lab/signal-calibration.html` | ONNX workshop route with signal calibration descriptors. | Short lab loop. | Model handshake, fallback rails, tool cues, prompt intent, scene gate. | No direct `NexusRealtime@` runtime found in changed scope. | Signal calibration entry uses main CDN. |

## Domain ASCII tree

```txt
tiny-diffusion-repair-mural-readiness-domain
├─ artifact-source-domain
│  ├─ seed-brush-domain
│  │  └─ tiny-diffusion-seed-brush-kit
│  └─ palette-well-domain
│     └─ tiny-diffusion-palette-well-kit
├─ restoration-planning-domain
│  └─ noise-mask-domain
│     ├─ mask-grid-domain
│     │  └─ tiny-diffusion-noise-mask-grid-kit
│     └─ critic-ribbon-domain
│        └─ tiny-diffusion-critic-ribbon-kit
├─ gallery-handoff-domain
│  ├─ repair-order-domain
│  │  └─ tiny-diffusion-repair-order-kit
│  └─ dawn-mural-ledger-domain
│     └─ tiny-diffusion-dawn-mural-ledger-kit
└─ renderer-handoff
   └─ tiny-diffusion-repair-mural-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `tiny-diffusion-seed-brush-kit`
- `tiny-diffusion-palette-well-kit`
- `tiny-diffusion-noise-mask-grid-kit`
- `tiny-diffusion-critic-ribbon-kit`
- `tiny-diffusion-repair-order-kit`
- `tiny-diffusion-dawn-mural-ledger-kit`
- `tiny-diffusion-repair-mural-renderer-handoff-kit`
- Composite: `tiny-diffusion-repair-mural-readiness-domain-kit`

All reusable logic remains descriptor-only and excludes renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, diffusion backend, checkpoint storage, network, and frame-loop ownership.

## Files changed

Added:

```txt
experiments/tiny-diffusion-lab/kits/tiny-diffusion-repair-mural-readiness-domain-kit.js
experiments/tiny-diffusion-lab/app/repair-mural-readiness-entry.js
tests/tiny-diffusion-repair-mural-readiness-kits-smoke.mjs
tests/tiny-diffusion-repair-mural-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-1214-tiny-diffusion-repair-mural-upgrade.md
```

Updated:

```txt
experiments/tiny-diffusion-lab/index.html
```

## Tests added

- `tests/tiny-diffusion-repair-mural-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Validates domain tree root, 7-kit composition, descriptor keys, renderer handoff policy, descriptor count, readiness bounds, mission state enum, JSON safety, and forbidden ownership list.
- `tests/tiny-diffusion-repair-mural-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Validates route marker, repair mural panel, NexusEngine main CDN import, absence of `NexusRealtime@` in the changed entry, host input accessor, kit isolation, descriptor count, blocker count, and state progression.

## Validation results

Scratch validation passed in a partial local workspace:

```txt
node --check experiments/tiny-diffusion-lab/kits/tiny-diffusion-repair-mural-readiness-domain-kit.js
node --check experiments/tiny-diffusion-lab/app/repair-mural-readiness-entry.js
node --check tests/tiny-diffusion-repair-mural-readiness-kits-smoke.mjs
node --check tests/tiny-diffusion-repair-mural-cdn-state-input-smoke.mjs
node tests/tiny-diffusion-repair-mural-readiness-kits-smoke.mjs
node tests/tiny-diffusion-repair-mural-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Tiny Diffusion repair mural readiness kits smoke passed 10 intake cases.
Tiny Diffusion repair mural CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a fully cloned repository because the shell runtime could not resolve `github.com`. The connector writes succeeded.

## NexusRealtime import audit

- The new entry imports NexusEngine main CDN exactly:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The changed entry does not import `NexusRealtime@`.
- The route still has historical project naming in unrelated package/dev tooling and older helper names elsewhere in the repo, but no old runtime CDN import was introduced.

## Cleanup pass

- Added one route panel instead of another standalone page.
- Kept all repair mural business logic in `kits/` and all DOM rendering in `app/repair-mural-readiness-entry.js`.
- Composed into `TinyDiffusionLab.getRendererHandoff()` instead of replacing prior training mission, dataset expedition, sample clinic, or latent museum handoffs.
- Added `applyRepairMuralInput()` for browser/state validation without moving input ownership into the reusable kits.
- No destructive changes.

## Non-game handling

Tiny Diffusion Lab is not a small conventional web game. It is a browser diffusion proof. This run preserved the useful training/sampling/checkpoint functionality and added a more experience-driven restoration objective layer instead of deleting or renaming the lab.

## Next safe ledge

Add a lightweight gallery-card metadata update for Tiny Diffusion Lab and then do a browser-rendered Playwright pass once a full clone is available. The next route should not be `experiments/tiny-diffusion-lab/` and should avoid repeating the latest Hellscape work.
