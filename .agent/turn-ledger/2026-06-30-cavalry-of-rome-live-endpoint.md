# Agent Ledger Entry: Cavalry of Rome live endpoint

Date: 2026-06-30
Actor: GPT-5.5 Pro
Repo: LuminaryLabs-Agents/NexusRealtime-Experiments
Branch: main

## Goal

Expose `The Cavalry of Rome` on the live website surface while keeping it as a contained experiment seed rather than a canonical-route or replay-lane claim.

## Files Read First

- `README.md`
- `.agent/START_HERE.md`
- `.agent/cycle-state.md`
- `.agent/route-canonicalization.md`
- `.agent/turn-ledger/2026-06-30-cavalry-of-rome-seed.md`
- `scripts/generate-application-routes.mjs`
- `apps/_shared/generated-app-route.js`
- `experiments/aaa-batch/host/game-registry.js`
- `experiments/_shared/nexus-gallery-data.js`
- `index.html`

## Change Summary

Added a standalone live endpoint at `apps/the-cavalry-of-rome/` that hosts the existing experiment source without forcing it into the generated AAA batch host. Added the route to the website gallery data and noscript index fallback.

## Files Changed

- `apps/the-cavalry-of-rome/index.html`
- `experiments/_shared/nexus-gallery-data.js`
- `index.html`
- `.agent/turn-ledger/2026-06-30-cavalry-of-rome-live-endpoint.md`

## Checks Run

- GitHub contents writes succeeded on `main`.
- Fetched the updated endpoint, gallery data, and index after commits for path verification.
- Full repo checks were not run in this connector session because the edits were applied through GitHub contents writes rather than a local checkout.

## Decision Notes

- The live endpoint uses lower-kebab URL path `apps/the-cavalry-of-rome/` while keeping the user-requested experiment folder name `experiments/The Cavalry of Rome/` intact.
- The endpoint directly loads the existing experiment `src/main.js` and shared page loader with corrected relative paths for the `apps/` surface.
- This avoids adding the game to `experiments/aaa-batch/host/game-registry.js`, because that host owns generic AAA seed actions and renderer assumptions that do not match this bespoke campaign/formation prototype.
- The gallery route points to `./apps/the-cavalry-of-rome/` so the live website opens the stable endpoint path.

## Risks / Watch Items

- The live endpoint imports an experiment path with spaces via `%20` encoding. Keep an eye on deployment/static-host path handling.
- No deterministic replay or canonical route status is claimed.
- A future `npm run generate` should not delete this standalone app folder, but the generated route process does not own this endpoint.

## Next Ledge

Add a route smoke that asserts `apps/the-cavalry-of-rome/index.html` contains the required DOM nodes and references the Cavalry experiment module path, then extract the formation resolver into a DOM-free deterministic check.

## Do Not Do Next

- Do not add this to canonical manifests until it has a clear reusable domain boundary and smoke/replay proof.
- Do not force it into the AAA batch game registry unless its host abstraction is changed to support bespoke route modules.
- Do not copy tabletop board-game rule text, scenarios, command cards, dice symbols, or board layouts.
