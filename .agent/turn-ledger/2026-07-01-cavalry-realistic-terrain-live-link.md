# Agent Ledger Entry: Cavalry realistic terrain live link update

Date: 2026-07-01
Actor: GPT-5.5 Pro
Repo: LuminaryLabs-Agents/NexusRealtime-Experiments
Branch: main

## Goal

Update the live `The Cavalry of Rome` website endpoint so it loads the new realistic terrain visual module rather than the prior painterly/high-fidelity module.

## Files Read First

- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `experiments/The Cavalry of Rome/src/main-realistic.js`

## Change Summary

Repointed the live endpoint and local experiment entry to `experiments/The Cavalry of Rome/src/main-realistic.js`. The static smoke now reads `main-realistic.js`, asserts the live endpoint and experiment entry both load it, and guards the realistic terrain features: value noise, FBM, ridged noise, domain warp, biome color blending, non-repeating landform metadata, map pan/zoom, WebGPU fallback, and primitive full-bodied soldiers.

## Files Changed

- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `.agent/turn-ledger/2026-07-01-cavalry-realistic-terrain-live-link.md`

## Checks Run

- GitHub contents writes succeeded on `main`.
- Fetched the updated live endpoint, experiment entry, and smoke from `main` for path verification.
- Full repo checks were not run locally because the repository was edited through GitHub contents writes rather than a local checkout.

## Decision Notes

- The public URL remains `apps/the-cavalry-of-rome/`.
- The live route now resolves through `main-realistic.js`.
- The DSK architecture remains unchanged.
- This update does not claim canonical route or deterministic replay status.

## Risks / Watch Items

- GitHub Pages propagation is separate from the repository write; the link may take time to reflect the new file reference.
- The static smoke verifies source wiring and terrain-feature presence, not browser rendering.

## Next Ledge

Add a browser-backed Playwright smoke that opens `apps/the-cavalry-of-rome/`, waits for `GameHost`, calls `GameHost.getSnapshot()`, and asserts `terrainFidelity` is `domain-warped-fbm-biome-blended-non-repeating-landforms`.

## Do Not Do Next

- Do not add combat, troop stats, campaign economy, or encounter resolution yet.
- Do not claim canonical-route or deterministic-replay status yet.
- Do not copy tabletop board-game rules, scenarios, command cards, dice symbols, or board layouts.
