# Agent Ledger Entry: Cavalry procedural vegetation pass

Date: 2026-07-01
Actor: GPT-5.5 Pro
Repo: LuminaryLabs-Agents/NexusRealtime-Experiments
Branch: main

## Goal

Add the final major terrain visualization pass for `The Cavalry of Rome`: procedural grass, reeds, shrubs, flowers, rocks, and trees over the realistic terrain route while preserving DSK architecture and avoiding gameplay/business logic.

## Files Read First

- `.agent/START_HERE.md`
- `.agent/cycle-state.md`
- `.agent/route-canonicalization.md`
- `experiments/The Cavalry of Rome/src/main-realistic.js`
- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `experiments/The Cavalry of Rome/domain-plan.json`
- `experiments/The Cavalry of Rome/README.md`
- searched ProtoKits for procedural/vegetation-related kits

## Change Summary

Added `src/vegetation-pass.js`, a local procedural vegetation descriptor DSK candidate that generates renderer-neutral vegetation placements from terrain-like biome conditions: terrain height, slope, moisture, river masks, FBM/value/ridged noise, and deterministic density gates. It renders a presentation-only overlay with grass, reeds, shrubs, trees, flowers, rocks, and battlefield foreground grass. It patches `GameHost.getSnapshot()` with `proceduralVegetation` metadata and exposes `CavalryVegetationProceduralDsk` for descriptor access.

The live endpoint and local experiment entry now load both `main-realistic.js` and `vegetation-pass.js`. Static smoke coverage now guards the vegetation pass and endpoint wiring.

## Files Changed

- `experiments/The Cavalry of Rome/src/vegetation-pass.js`
- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `experiments/The Cavalry of Rome/domain-plan.json`
- `experiments/The Cavalry of Rome/README.md`
- `.agent/turn-ledger/2026-07-01-cavalry-procedural-vegetation-pass.md`

## Checks Run

- Local syntax check before commit:
  - `node --check /mnt/data/vegetation-pass.js`
- GitHub contents writes succeeded on `main`.
- Fetched changed live endpoint, experiment entry, smoke, and vegetation module from `main` for path/feature verification.
- Full repo checks were not run locally because the repository was edited through GitHub contents writes rather than a local checkout.

## Decision Notes

- No dedicated procedural vegetation/procedural generation ProtoKit was found by search in `NexusRealtime-ProtoKits`, so the implementation is a local DSK candidate rather than pretending an existing kit owns the logic.
- Existing DSKs still own route/input/affordance/zone/camera/fidelity/QA/GameHost proof surfaces.
- The new vegetation field is renderer-neutral data plus presentation-only overlay rendering.
- The live endpoint remains `apps/the-cavalry-of-rome/`.
- No combat, harvesting, collision, economy, or unit interaction was added.

## Risks / Watch Items

- The vegetation overlay is a presentation layer rather than true WebGPU instancing. It improves perceived vegetation density now, but the next DSK extraction should move toward a renderer-neutral procedural vegetation ProtoKit and eventually WebGPU instanced vegetation rendering.
- GitHub Pages propagation is outside the contents write; the live URL may take time to reflect the updated module list.
- A browser-backed smoke is still needed to verify `GameHost.getSnapshot().proceduralVegetation` after real page boot.

## Next Ledge

Add a Playwright/browser smoke that opens `apps/the-cavalry-of-rome/`, waits for `GameHost`, verifies `proceduralVegetation.counts.total`, pans/zooms the map, and confirms the route still reaches the battlefield tableau after region selection.

## Do Not Do Next

- Do not add combat rules, resource harvesting, tree collision, fire spread, AI, campaign economy, or encounter resolution yet.
- Do not claim canonical-route or deterministic-replay status yet.
- Do not move reusable kit implementation into Experiments; promote only after the vegetation descriptor seam proves reusable across another route.
