# Agent Ledger Entry: Tiny Diffusion Lab

Date: 2026-07-09
Actor: GPT-5.5 Pro
Repo: LuminaryLabs-Agents/NexusEngine-Experiments
Branch: main

## Goal

Add a browser-host experiment that proves the new Nexus Engine diffusion module can be consumed from the public `NexusEngine@main` CDN entrypoint without moving reusable diffusion behavior into Experiments.

## Files Read First

- `README.md`
- `.agent/START_HERE.md`
- `.agent/cycle-state.md`
- `.agent/route-canonicalization.md`
- `.agent/turn-ledger/README.md`
- `.agent/templates/ledger-entry-template.md`
- `experiments/_shared/nexus-gallery-data.js`
- `scripts/generate-gallery-data.mjs`
- `tests/static-site-smoke.mjs`

## Change Summary

Added `experiments/tiny-diffusion-lab/` as a descriptor-rendering host for `createNexusDiffusionKits()` from `LuminaryLabs-Dev/NexusEngine@main`. The route renders procedural dataset samples, forward noise previews, backend/metrics status, denoising frames, final pixels, and checkpoint round-trip status. Reusable dataset, tensor, backend, noising, model, training, sampling, checkpoint, and preview logic remains in Nexus Engine.

## Files Changed

- `experiments/tiny-diffusion-lab/index.html`
- `experiments/tiny-diffusion-lab/main.js`
- `experiments/tiny-diffusion-lab/README.md`
- `experiments/tiny-diffusion-lab/experiment.json`
- `experiments/_shared/nexus-gallery-data.js`
- `tests/static-site-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-tiny-diffusion-lab.md`

## Checks Run

- Connector-level fetch/read verification after writing the route files.
- `tests/static-site-smoke.mjs` now includes static assertions for the Tiny Diffusion Lab route.

Local `npm run check` was not run in this connector-only environment.

## Decision Notes

This route is an experiment/lab proof, not a new canonical route-domain replay lane. It does not update canonical route replay claims, domain cutover manifests, or route pruning maps. The browser file owns only DOM, Canvas rendering, and button intent; the reusable diffusion pipeline is imported from Nexus Engine.

## Risks / Watch Items

- The route depends on `NexusEngine@main` CDN availability and cache refresh after the diffusion module push.
- The current Nexus diffusion module is CPU-first; WebGPU remains capability reporting only.
- The gallery generator will rediscover the folder automatically; curated gallery metadata can be promoted into `scripts/generate-gallery-data.mjs` later if the route should keep custom tags after regeneration.

## Next Ledge

Open the route through the deployed gallery once CDN cache catches up and verify Prepare, Train, Generate, and Checkpoint buttons in a browser.

## Do Not Do Next

Do not move tensor math, model weights, sampling, checkpointing, or dataset generation into Experiments. Do not mark this as an executable route-domain replay lane or use it to justify canonical route expansion.
