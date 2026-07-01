# Agent Ledger Entry: Cavalry bottom action card UI

Date: 2026-07-01
Actor: GPT-5.5 Thinking
Repo: LuminaryLabs-Agents/NexusRealtime-Experiments
Branch: main

## Goal

Add a native, card-based tactical action UI at the bottom of the screen for all available maneuvers and an action point counter.

## Change Summary

Added `src/hex-action-ui-pass.js`, loaded after the tactical gameplay pass. It creates a battlefield-only bottom action bar with an AP counter and seven card buttons: Advance Left, Advance Center, Advance Right, Line Brigade, Heavy Brigade, Berserk, and Scout. Cards show cost, category, hotkey, and short action detail. Cards disable when AP is insufficient or a different maneuver is active, and clicking a card calls `GameHost.startManeuver(actionId)`.

The UI uses native DOM buttons styled as frosted battlefield cards with backdrop blur, AP chip cost markers, active states, disabled states, and responsive horizontal scrolling on smaller screens. This intentionally reintroduces a dedicated gameplay UI while keeping the old HUD/footer/commandBar DOM removed.

## Files Changed

- `experiments/The Cavalry of Rome/src/hex-action-ui-pass.js`
- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `experiments/The Cavalry of Rome/README.md`
- `.agent/turn-ledger/2026-07-01-cavalry-bottom-action-card-ui.md`

## Checks Run

- GitHub contents writes succeeded on `main`.
- Static smoke now guards the bottom card UI module, AP counter, action cards, action IDs, GameHost maneuver start integration, tactical snapshot reads, AP labels, and endpoint/experiment module wiring.
- Browser-backed validation was not run in this session.

## Decision Notes

- The old debug UI remains removed: no `hud`, `footer`, or `commandBar` DOM is reintroduced.
- The action UI appears only during battlefield mode.
- Keyboard hotkeys 1-7 remain available, but the card UI now exposes the same actions visibly.
- The current action UI reads existing tactical gameplay state rather than owning gameplay logic.

## Next Ledge

Browser-test the maneuver loop and action cards, then add enemy turn behavior and fuller combat resolution.
