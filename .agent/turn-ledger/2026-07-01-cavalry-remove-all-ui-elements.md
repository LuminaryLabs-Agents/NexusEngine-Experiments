# Agent Ledger Entry: Cavalry full UI element removal

Date: 2026-07-01
Actor: GPT-5.5 Thinking
Repo: LuminaryLabs-Agents/NexusRealtime-Experiments
Branch: main

## Goal

Fully remove all UI elements from `The Cavalry of Rome`, not merely hide them. Keep the route stable by providing non-DOM status/readout/command sinks for existing runtime writes.

## Files Read First

- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `experiments/The Cavalry of Rome/README.md`
- `experiments/The Cavalry of Rome/domain-plan.json`

## Change Summary

The live and experiment HTML entries now contain only the app root, game canvas, a non-DOM `CavalryUiSinkShim`, and direct module scripts for `main-realistic.js` and `vegetation-pass.js`. HUD, footer, commandBar, hidden UI DOM, and shared page-loader UI have been removed.

`CavalryUiSinkShim` intercepts `document.querySelector("#status")`, `document.querySelector("#readout")`, and `document.querySelector("#commandBar")` and returns lightweight plain objects instead of DOM elements. This keeps the current runtime compatible without putting UI nodes back into the document.

## Files Changed

- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `experiments/The Cavalry of Rome/README.md`
- `experiments/The Cavalry of Rome/domain-plan.json`
- `.agent/turn-ledger/2026-07-01-cavalry-remove-all-ui-elements.md`

## Checks Run

- GitHub contents writes succeeded on `main`.
- Static smoke source was updated to verify no HUD/footer/commandBar DOM and no shared page-loader import.
- Fetched final live and experiment HTML from `main` for verification.
- Full repo checks were not run locally because the repository was edited through GitHub contents writes rather than a local checkout.

## Decision Notes

- The route is now canvas-only in the document.
- The shared page loader is intentionally omitted from this route because it can display loading UI.
- Existing DSK/GameHost debug surfaces are preserved through runtime objects, not DOM UI.
- Visual fidelity remains a standing secondary goal for all future gameplay work.

## Risks / Watch Items

- This shim should be replaced later by making `main-realistic.js` fully null-safe around optional status/readout/command sinks.
- Shared route smoke tests that require the page loader may need an explicit exception for this route because the product direction is no visible UI.

## Next Ledge

Add scene-native gameplay interaction with no UI DOM or loader overlay, likely beginning with region commitment and army visual state directly in the terrain scene.

## Do Not Do Next

- Do not reintroduce HUD, footer, command panels, hidden UI DOM, or loader overlays.
- Do not add combat rules, troop stats, campaign economy, or encounter resolution yet.
- Do not claim canonical-route or deterministic-replay status yet.
