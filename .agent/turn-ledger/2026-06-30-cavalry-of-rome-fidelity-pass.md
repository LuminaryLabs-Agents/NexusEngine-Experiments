# Agent Ledger Entry: Cavalry of Rome fidelity pass

Date: 2026-06-30
Actor: GPT-5.5 Pro
Repo: LuminaryLabs-Agents/NexusRealtime-Experiments
Branch: main

## Goal

Increase the visual fidelity of `The Cavalry of Rome` while preserving its DSK-composed, visual-first architecture. The target was a more painterly large terrain map, larger pannable region selection, and less pawn-shaped soldiers built from reusable primitives.

## Files Read First

- `.agent/START_HERE.md`
- `.agent/cycle-state.md`
- `.agent/route-canonicalization.md`
- `.agent/turn-ledger/2026-06-30-cavalry-of-rome-webgpu-dsk-visual.md`
- `experiments/The Cavalry of Rome/src/main.js`
- `experiments/The Cavalry of Rome/README.md`
- `experiments/The Cavalry of Rome/domain-plan.json`
- `experiments/_shared/nexus-gallery-data.js`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`

## Change Summary

The visual route now has a larger pannable world-map surface, painterly terrain generation, terrain brush strokes, river ribbons, contour accents, larger highlighted regions, drag/WASD pan, wheel zoom, and higher-fidelity primitive-built soldiers. Soldiers are now composed from primitive body pieces including legs, boots, torso, cuirass, arms, head, helmet, crest, shield, spear, cape, and shadow.

The existing DSK stack remains intact: action input, route progress, affordance descriptors, zone fields, camera cinematic descriptors, visual fidelity, GameHost standard, and scenario QA. The route remains visual-only and does not add combat/campaign business logic.

## Files Changed

- `experiments/The Cavalry of Rome/src/main.js`
- `experiments/The Cavalry of Rome/README.md`
- `experiments/The Cavalry of Rome/domain-plan.json`
- `experiments/_shared/nexus-gallery-data.js`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `.agent/turn-ledger/2026-06-30-cavalry-of-rome-fidelity-pass.md`

## Checks Run

Local syntax checks before committing through GitHub contents writes:

- `node --check /mnt/data/cavalry-main-v2.js`
- `node --check /mnt/data/cavalry-smoke-v2.mjs`
- `node --check /mnt/data/nexus-gallery-data-v2.js`

The static smoke was updated to guard the new fidelity surfaces: painterly terrain, large map extents, pan state, wheel zoom, primitive soldier construction, and future DSK candidate documentation.

Full repo checks were not run locally because the repository was edited through GitHub contents writes rather than a local checkout.

## Decision Notes

- The live endpoint remains `apps/the-cavalry-of-rome/`.
- The route still loads from `experiments/The Cavalry of Rome/src/main.js`.
- WebGPU remains the preferred renderer path; Canvas fallback remains available.
- The route stays a non-canonical experiment seed and does not claim deterministic replay coverage.
- Fidelity is now the primary route pressure, not tactical simulation.

## Risks / Watch Items

- Browser WebGPU support still varies, so the Canvas fallback protects route access but not the full target look.
- The route imports ProtoKits from `@main` CDN paths; runtime behavior depends on those exports staying stable.
- The new painterly map is larger and more visually dense, so a browser-backed smoke should verify frame boot and `GameHost.getSnapshot()` after deployment.

## Next Ledge

Add a Playwright/browser route smoke that opens `apps/the-cavalry-of-rome/`, pans the large map, zooms, selects a highlighted region, reaches the battlefield tableau, and verifies `GameHost.getSnapshot()` exposes painterly terrain, panning, DSK state, and full-bodied primitive soldier fidelity metadata.

## Do Not Do Next

- Do not add combat rules, troop stats, campaign economy, enemy AI, or encounter resolution yet.
- Do not claim canonical-route or deterministic-replay status yet.
- Do not copy tabletop board-game rule text, scenarios, command cards, dice symbols, or board layouts.
- Do not move reusable kit implementation into Experiments; promote only after repeated route pressure proves a visual seam is reusable.
