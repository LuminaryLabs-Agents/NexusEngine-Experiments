# 2026-07-09 13:16 ET — Tiny Diffusion Curriculum Kiln Upgrade

## Chosen experiment

`experiments/tiny-diffusion-lab/`

## Why it was chosen

The latest visible completed turn was `experiments/sora-the-infinite/` with the sky radio beacon rescue pass, so this run picked a different route. `experiments/tiny-diffusion-lab/` is a useful workshop, but it is less of a small experience-driven web game than the route games: most interaction is button-driven training/sampling without a strong progression gate. This upgrade adds a curriculum kiln layer that turns the lab into a clearer procedural loop: prepare seed tiles, climb noise ramps, watch overfit risk, triage artifacts, capture checkpoint sigils, and reach export readiness.

## Last upgraded experiment

`experiments/sora-the-infinite/` — Sora sky radio beacon rescue upgrade.

Latest visible completed log before this run:

- `fdd6110017815971c96753044db3203b4da30b78` — `Log Sora sky radio beacon upgrade`.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Scene-hosted story route with puzzle tokens and evacuation overlays. | 3–6 min | Scene transitions, token gates, stateful exits, descriptor overlays. | Not found in search audit. | Yes in upgraded overlay entries. |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale platformer rescue route. | 2–4 min | Jumping, coins, hazards, tether/oxygen/medevac descriptors. | Not found in search audit. | Yes in upgraded route entry. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation. | 3–5 min | WASD flight, LOD rings, origin snapping, cartography overlays. | Not found in search audit. | Yes in upgraded overlay entries. |
| `experiments/high-fidelity-meadow/` | Procedural meadow ecology scene. | 2–5 min | Camera exploration, vegetation/wind/ecology descriptors. | Not found in search audit. | Yes in upgraded overlay entries. |
| `experiments/tiny-diffusion-lab/` | Browser tiny diffusion training/sampling lab with curriculum kiln readiness. | 4–8 min | Prepare/train/sample/checkpoint plus seed tile, noise ramp, overfit, artifact, checkpoint, and export readiness descriptors. | No old `NexusRealtime@` import in changed entry. | Yes, changed entry imports NexusEngine main CDN. |
| `experiments/living-agent-lab/` | Small ONNX/fallback market-agent route. | 3–6 min | Visible-state agent actions, market trust, civic mediation descriptors. | Not found in search audit. | Yes in upgraded route entry. |
| `experiments/fogline-relay/` | First-person fog survey/courier route. | 4–7 min | Movement, scan targets, hazard/fog pressure, evacuation overlays. | Not found in search audit. | Yes in upgraded route entry. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island slice. | 5–8 min | Scan, harvest, build, cargo, storm surge, hospital/desalination overlays. | Not found in search audit. | Yes in upgraded route entries. |
| `apps/the-cavalry-of-rome/` | Painterly Roman strategy-map proof. | 3–6 min | Pannable map, hover regions, cinematic dive, army/logistics overlays. | Not found in search audit. | Yes in upgraded campaign pass. |
| `games/signal-bastion/` | 2.5D tower-defense game. | 5–8 min | Tower cards, placement, waves, range rings, hospital/supply overlays. | Not found in search audit. | Yes in upgraded route entry. |
| `games/stonewake-depths/` | Flooded cavern puzzle rescue game. | 4–7 min | Block carrying, valve pressure, plate gate, rising water, glowworm cartography. | Not found in search audit. | Yes in changed overlay entries. |
| `experiments/next-ledge/` | Grapple-climb validation route. | 3–6 min | Grapple, ledges, swing pressure, avalanche/drone/weather overlays. | Not found in search audit. | Yes in upgraded route entries. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller validation route. | 3–5 min | Spring-arm camera, debug rays, locomotion, traversal-course descriptors. | Not found in search audit. | Yes in upgraded route entry. |
| `experiments/sora-the-infinite/` | Sora gateway into The Open Above with stacked rescue readiness descriptors. | 2–5 min | Gateway rehearsal, launch readiness, rescue/lighthouse/rookery/orchard/radio descriptors. | Not found in search audit. | Yes in upgraded route entry. |
| `experiments/zombie-orchard/` | Survival/horde orchard slice. | 5–8 min | Rounds, pickups, weapons, rescue/cure/radio/fence overlays. | Not found in search audit. | Yes in upgraded route entries. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route. | 6–10 min | Harvesting, building, portals, waves, forge/refuge/seed/covenant overlays. | Not found in search audit. | Yes in upgraded route entries. |
| `experiments/onnx-agent-lab/signal-calibration.html` | ONNX workshop calibration route. | 3–6 min | Model handshake, fallback rails, tool cues, prompt intent, scene gate. | Not found in search audit. | Yes in upgraded route entry. |

## Domain ASCII tree

```txt
tiny-diffusion-curriculum-kiln-readiness-domain
├─ curriculum-forge-domain
│  ├─ seed-tile-domain
│  │  └─ tiny-diffusion-seed-tile-sampler-kit
│  └─ noise-ramp-domain
│     └─ tiny-diffusion-noise-ramp-ladder-kit
├─ quality-gate-domain
│  ├─ overfit-sentinel-domain
│  │  └─ tiny-diffusion-overfit-sentinel-kit
│  └─ artifact-triage-domain
│     └─ tiny-diffusion-artifact-triage-tray-kit
├─ export-handoff-domain
│  ├─ checkpoint-sigil-domain
│  │  └─ tiny-diffusion-checkpoint-sigil-kit
│  └─ curriculum-ledger-domain
│     └─ tiny-diffusion-curriculum-ledger-kit
└─ renderer-handoff
   └─ tiny-diffusion-curriculum-kiln-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `tiny-diffusion-seed-tile-sampler-kit`
- `tiny-diffusion-noise-ramp-ladder-kit`
- `tiny-diffusion-overfit-sentinel-kit`
- `tiny-diffusion-artifact-triage-tray-kit`
- `tiny-diffusion-checkpoint-sigil-kit`
- `tiny-diffusion-curriculum-ledger-kit`
- `tiny-diffusion-curriculum-kiln-renderer-handoff-kit`
- `tiny-diffusion-curriculum-kiln-readiness-domain`

The new kit source remains renderer-neutral and produces serializable descriptors only.

## Files changed

Added:

- `experiments/tiny-diffusion-lab/app/curriculum-kiln-readiness-kits.js`
- `experiments/tiny-diffusion-lab/app/curriculum-kiln-readiness-entry.js`
- `tests/tiny-diffusion-curriculum-kiln-readiness-kits-smoke.mjs`
- `tests/tiny-diffusion-curriculum-kiln-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1316-tiny-diffusion-curriculum-kiln-upgrade.md`

Updated:

- `experiments/tiny-diffusion-lab/index.html`
- `experiments/_shared/nexus-gallery-data.js`

## Tests added

- `tests/tiny-diffusion-curriculum-kiln-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Validates domain id, tree, kit list, descriptor counts, bounded readiness, bounded overfit risk, phase enum, JSON safety, and descriptor-only handoff parity.
- `tests/tiny-diffusion-curriculum-kiln-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Validates route marker, panel wiring, cache-busted entry script, NexusEngine main CDN import, old `NexusRealtime@` absence, `TinyDiffusionLab` accessors, renderer handoff composition, reusable kit isolation, descriptor counts, readiness bounds, and progression from prepare to export.

## Validation results

Scratch validation run from generated local files before GitHub writes:

```txt
node --check experiments/tiny-diffusion-lab/app/curriculum-kiln-readiness-kits.js
node --check experiments/tiny-diffusion-lab/app/curriculum-kiln-readiness-entry.js
node --check tests/tiny-diffusion-curriculum-kiln-readiness-kits-smoke.mjs
node --check tests/tiny-diffusion-curriculum-kiln-cdn-state-input-smoke.mjs
node tests/tiny-diffusion-curriculum-kiln-readiness-kits-smoke.mjs
node tests/tiny-diffusion-curriculum-kiln-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Tiny Diffusion curriculum kiln readiness kits smoke passed 10 intake cases.
Tiny Diffusion curriculum kiln CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full cloned workspace because the local shell runtime could not resolve `github.com`. This run used scratch Node validation plus connector file inspection.

## NexusRealtime import audit

- Repository search for `NexusRealtime@` returned no results during this run.
- Changed entry imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- Changed entry does not import `LuminaryLabs-Dev/NexusRealtime@main` or `NexusRealtime@`.
- CDN/state smoke confirms the reusable kit source contains no DOM, input, renderer, timing, storage, audio, Three.js, WebGL, network, or host ownership calls from the audit regex.

## Cleanup pass

- No destructive file removals.
- No route rename.
- Existing prepare/train/sample/checkpoint flow is preserved.
- Existing training mission, dataset expedition, sample clinic, latent museum, and repair mural panels are preserved.
- The new pass composes into `TinyDiffusionLab.getRendererHandoff()` and adds a separate panel rather than moving reusable logic into `main.js`.
- Gallery tags and description now mention curriculum kiln readiness.

## What it was trying to prove

Tiny Diffusion Lab is valuable, but it was still mostly a button-driven workshop. The new curriculum kiln makes progression legible without changing model internals: dataset breadth, noise schedule progression, artifact review, overfit risk, checkpoint stability, and export readiness are now explicit descriptor families.

## Lesson

A non-game workshop can be made more experience-driven by adding a curriculum/readiness layer that interprets state and produces small atomic descriptors. The renderer stays a consumer, while the kit remains deterministic and easy to validate with arbitrary state snapshots.

## Next safe ledge

Make the curriculum kiln panel actionable: let each descriptor row trigger a bounded lab action such as prepare, train one, generate, or checkpoint while preserving the current descriptor-only kit boundary.
