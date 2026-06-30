# Agent Ledger Entry: Cavalry of Rome seed

Date: 2026-06-30
Actor: GPT-5.5 Pro
Repo: LuminaryLabs-Agents/NexusRealtime-Experiments
Branch: main

## Goal

Begin a contained experiment seed for `The Cavalry of Rome`, a Roman terrain-map strategy game that moves armies between linked locations and enters original formation-command encounters using light, medium, and heavy troop classes.

## Files Read First

- `README.md`
- `.agent/START_HERE.md`
- `.agent/cycle-state.md`
- `.agent/route-canonicalization.md`
- `.agent/turn-ledger/README.md`
- `.agent/templates/ledger-entry-template.md`
- `package.json`
- `scripts/generate-application-routes.mjs`
- `experiments/next-ledge/index.html`
- `experiments/_shared/nexus-realtime-page-loader.js`

## Change Summary

Added an isolated browser experiment folder under `experiments/The Cavalry of Rome/`. The slice includes a canvas campaign map, click-to-move route nodes, Roman army state, hostile locations, and an original encounter loop based on formation commands, morale, cohesion, fatigue, terrain pressure, and momentum. The change intentionally does not modify canonical route manifests or claim deterministic replay coverage.

## Files Changed

- `experiments/The Cavalry of Rome/README.md`
- `experiments/The Cavalry of Rome/index.html`
- `experiments/The Cavalry of Rome/domain-plan.json`
- `experiments/The Cavalry of Rome/src/main.js`
- `.agent/turn-ledger/2026-06-30-cavalry-of-rome-seed.md`

## Checks Run

- `node --check` was run locally against the authored `src/main.js` contents before committing.
- Full repo checks were not run in this connector session because the repository was edited through GitHub contents writes and the sandbox could not clone GitHub.

## Decision Notes

- The folder name follows the user-requested exact title: `The Cavalry of Rome`.
- This is an experiment seed, not a manifest-owned canonical route.
- The battle model deliberately avoids board-game-specific expression and uses posture orders instead of copied cards, hexes, dice, command sections, scenarios, or rule text.
- Reusable implementation is not claimed here. Future kit pressure is documented in `domain-plan.json` and should be proven with a headless resolver smoke before expanding the game.

## Risks / Watch Items

- The exact folder name contains spaces, which is user-requested but different from the repo's usual lower-kebab route convention.
- The first tactical resolver is local experiment code. It should not grow much further before a deterministic, DOM-free smoke defines the durable formation-command boundary.
- The route is not currently wired into generated app galleries or canonical manifests.

## Next Ledge

Add a small headless smoke around `src/main.js` or a newly extracted DOM-free resolver module that drives a fixed command sequence and asserts deterministic encounter outcomes without Canvas, DOM, or browser timing.

## Do Not Do Next

- Do not add this to canonical manifests yet.
- Do not claim route-domain replay coverage yet.
- Do not copy tabletop board-game rule text, scenarios, command cards, dice symbols, or board layouts.
- Do not move reusable kit implementation into Experiments; promote only after the local seam is proven.
