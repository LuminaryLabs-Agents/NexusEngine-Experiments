# Agent Ledger Entry: Cavalry loader UI removal

Date: 2026-07-01
Actor: GPT-5.5 Thinking
Repo: LuminaryLabs-Agents/NexusRealtime-Experiments
Branch: main

## Goal

Complete the `Remove all UI elements` request by removing the shared page-loader overlay from `The Cavalry of Rome`, in addition to removing HUD, footer, command bar, and hidden UI DOM.

## Files Read First

- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `experiments/The Cavalry of Rome/README.md`
- `experiments/The Cavalry of Rome/domain-plan.json`

## Change Summary

The live and experiment HTML entries no longer attach or import `nexus-realtime-page-loader.js`. The pages now consist of the app root, game canvas, a non-DOM `CavalryUiSinkShim`, and route modules only. This removes visible HUD/footer/command surfaces, hidden UI DOM, and shared loading UI from the in-game presentation.

## Files Changed

- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `experiments/The Cavalry of Rome/README.md`
- `experiments/The Cavalry of Rome/domain-plan.json`
- `.agent/turn-ledger/2026-07-01-cavalry-remove-loader-ui.md`

## Checks Run

- GitHub contents writes succeeded on `main`.
- Static smoke source now verifies that the live and experiment entries do not contain HUD/footer/commandBar DOM and do not import or attach the shared page loader.
- Fetched final live and experiment HTML from `main` for verification.
- Full repo checks were not run locally because the repository was edited through GitHub contents writes rather than a local checkout.

## Decision Notes

- Existing runtime status writes are protected by `CavalryUiSinkShim`, which returns plain objects for `#status`, `#readout`, and `#commandBar` queries.
- The route is now canvas-only in the DOM while retaining the gameplay and visual modules.
- Visual fidelity remains a standing secondary goal for future gameplay work.

## Risks / Watch Items

- Repo-wide static smoke may need to tolerate this route not using the shared loader because the product direction explicitly requires no UI elements.
- A future cleanup should make `main-realistic.js` null-safe and remove the query-selector shim.

## Next Ledge

Add scene-native gameplay interactions directly through terrain, regions, units, and camera affordances, with no UI DOM or loader overlay.

## Do Not Do Next

- Do not reintroduce HUD, footer, command panels, hidden UI DOM, or loader overlays.
- Do not add combat rules, troop stats, campaign economy, or encounter resolution yet.
- Do not claim canonical-route or deterministic-replay status yet.
