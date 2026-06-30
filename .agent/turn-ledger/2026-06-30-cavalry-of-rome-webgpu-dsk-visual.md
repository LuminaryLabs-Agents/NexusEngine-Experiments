# Agent Ledger Entry: Cavalry of Rome WebGPU DSK visual update

Date: 2026-06-30
Actor: GPT-5.5 Pro
Repo: LuminaryLabs-Agents/NexusRealtime-Experiments
Branch: main

## Goal

Replace the data-heavy Cavalry of Rome prototype with a visual-first, DSK-composed route: WebGPU terrain scan, highlighted regions instead of points, cinematic zoom into a battlefield scene, and low-poly opposing armies preparing for war.

## Files Read First

- `.agent/START_HERE.md`
- `.agent/cycle-state.md`
- `.agent/route-canonicalization.md`
- `.agent/turn-ledger/2026-06-30-cavalry-of-rome-seed.md`
- `.agent/turn-ledger/2026-06-30-cavalry-of-rome-live-endpoint.md`
- `experiments/The Cavalry of Rome/src/main.js`
- `experiments/The Cavalry of Rome/README.md`
- `experiments/The Cavalry of Rome/domain-plan.json`
- `experiments/_shared/nexus-gallery-data.js`
- `scripts/run-checks.mjs`
- ProtoKits `action-input-kit`
- ProtoKits `generic-route-progress-kit`
- ProtoKits `generic-affordance-descriptor-kit`
- ProtoKits `zone-field-kit`
- ProtoKits `camera-cinematic-maker-kit`
- ProtoKits `visual-fidelity-maker-kit`
- ProtoKits `gamehost-standard-kit`
- ProtoKits `scenario-qa-harness`

## Change Summary

Rebuilt `experiments/The Cavalry of Rome/src/main.js` around an existing DSK stack. The route now imports and composes action input, generic route progress, affordance descriptors, zone fields, camera cinematic descriptors, visual fidelity reporting, GameHost standard contract, and scenario QA. The route keeps Roman terrain art direction and WebGPU rendering local/presentation-only.

The previous campaign node graph, troop counts, encounter resolver, command buttons, and combat-oriented logic were removed from the user-facing prototype. Interaction is now visual: scan over a sculpted 3D terrain, hover highlighted regions, click to trigger a cinematic dive, then reveal a low-poly battlefield tableau.

## Files Changed

- `experiments/The Cavalry of Rome/src/main.js`
- `experiments/The Cavalry of Rome/README.md`
- `experiments/The Cavalry of Rome/domain-plan.json`
- `experiments/_shared/nexus-gallery-data.js`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `scripts/run-checks.mjs`
- `.agent/turn-ledger/2026-06-30-cavalry-of-rome-webgpu-dsk-visual.md`

## Checks Run

- Local syntax check before committing:
  - `node --check /mnt/data/cavalry-main.js`
  - `node --check /mnt/data/cavalry-smoke.mjs`
  - `node --check /mnt/data/run-checks.mjs`
  - `node --check /mnt/data/nexus-gallery-data.js`
- Added `tests/cavalry-of-rome-visual-static-smoke.mjs` and wired it into both full and deploy check lists.
- Full repo checks were not run locally because the repo was edited through GitHub contents writes rather than a local checkout.

## Decision Notes

- This remains a non-canonical visual experiment seed. No deterministic replay coverage is claimed.
- The live endpoint remains `apps/the-cavalry-of-rome/` and continues to load the experiment module from `experiments/The Cavalry of Rome/src/main.js`.
- Existing DSKs used: `gamehost-standard-kit`, `action-input-kit`, `generic-affordance-descriptor-kit`, `generic-route-progress-kit`, `zone-field-kit`, `camera-cinematic-maker-kit`, `visual-fidelity-maker-kit`, and `scenario-qa-harness`.
- New custom local logic is intentionally visual/presentation composition: procedural terrain mesh, region overlay mesh, camera interpolation, low-poly soldiers/banners, WebGPU pipeline setup, and Canvas fallback.

## Risks / Watch Items

- Browser support for WebGPU varies. The route has a Canvas fallback but the ideal visual target requires WebGPU-capable browsers.
- The route imports ProtoKits from `@main` CDN paths. If ProtoKit export names change, the route can fail at boot; the new static smoke guards expected import paths but not runtime CDN availability.
- The folder path still contains spaces because the user requested `experiments/The Cavalry of Rome`; the live endpoint uses lower-kebab `apps/the-cavalry-of-rome/` to avoid user-facing URL spaces.
- This is not yet a browser-executed visual regression proof.

## Next Ledge

Add a browser-backed Playwright route smoke that opens `apps/the-cavalry-of-rome/`, waits for `GameHost`, calls `GameHost.getSnapshot()`, and asserts DSK-backed visual state exists with either `webgpu` or `canvas-fallback` renderer mode.

## Do Not Do Next

- Do not add combat rules, troop stats, campaign economy, or encounter resolution until the visual proof is stable.
- Do not claim canonical-route or deterministic-replay status yet.
- Do not copy tabletop board-game rule text, scenarios, command cards, dice symbols, or board layouts.
- Do not move reusable kit implementation into Experiments; only promote custom visual seams to ProtoKits after repeated route pressure proves them reusable.
