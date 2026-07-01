# Agent Ledger Entry: Cavalry roll in place action

Date: 2026-07-01
Actor: GPT-5.5 Thinking
Repo: LuminaryLabs-Agents/NexusRealtime-Experiments
Branch: main

## Goal

Add an explicit roll-in-place action so the player can roll action points on demand from the battlefield action UI without starting a maneuver or moving a unit.

## Change Summary

Added `src/hex-roll-controller-pass.js`, loaded after the bottom card UI. This controller patches `GameHost` after the existing gameplay pass and exposes `rollActionPointsInPlace()`. The new function rolls 2d6, updates the action point counter, clears pending selection state, and shows board dice without forcing a maneuver.

Updated `hex-action-ui-pass.js` to add a `Roll AP` card at the start of the bottom action bar. The card uses hotkey `0`, calls `GameHost.rollActionPointsInPlace()`, and remains available when no maneuver is active. Maneuver cards continue to call `GameHost.startManeuver(actionId)`.

The roll controller also supersedes the older gameplay/squad overlay layers so the roll-in-place AP state, movement highlights, squad rendering, and dice feedback are driven from one controller surface.

## Files Changed

- `experiments/The Cavalry of Rome/src/hex-roll-controller-pass.js`
- `experiments/The Cavalry of Rome/src/hex-action-ui-pass.js`
- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `.agent/turn-ledger/2026-07-01-cavalry-roll-in-place-action.md`

## Checks Run

- GitHub contents writes succeeded on `main`.
- Fetched the live and experiment endpoints after update to verify `hex-roll-controller-pass.js` is loaded after `hex-action-ui-pass.js`.
- Browser-backed Playwright validation was not run in this session.

## Decision Notes

- This is a targeted patch to fix the missing roll-in-place ability without rewriting the longer existing gameplay pass.
- The new roll controller patches `GameHost.startManeuver`, `GameHost.getTacticalGameplaySnapshot`, and `GameHost.rollActionPointsInPlace` after the older gameplay module loads.
- Roll AP uses 2d6 and updates the real AP value read by the bottom card UI.
- The card UI now has eight cards: Roll AP plus the seven maneuvers.

## Next Ledge

Browser-test the Roll AP card, AP counter update, maneuver start, and movement highlights together. Then add enemy turn behavior.
