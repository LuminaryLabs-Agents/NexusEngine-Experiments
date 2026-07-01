# Agent Ledger Entry: Cavalry full combat rules

Date: 2026-07-01
Actor: GPT-5.5 Thinking
Repo: LuminaryLabs-Agents/NexusRealtime-Experiments
Branch: main

## Goal

Add full combat resolution while preserving the current constrained maneuver movement system. Add one-roll-per-turn AP with carryover, Pass Turn, Concede, Attack, 2d6 combat, rank advantage, range penalties, unit loss, and win/loss state.

## Change Summary

Added `src/hex-combat-controller-pass.js` as the final tactical controller loaded after the existing opponent AI pass. It supersedes prior tactical controllers and owns active combat state through `GameHost`.

Implemented:

- Attack action, cost 1 AP.
- AP rolls once per player turn through Roll AP.
- AP carryover when passing with unused AP.
- Pass Turn button support through `GameHost.passTurn`.
- Concede button support through `GameHost.concedeBattle`.
- 2d6 vs 2d6 combat.
- Rank advantage: 0 same rank, +2 one rank up, +5 two ranks up, symmetric negative penalties when attacking upward.
- Range penalties: 0 adjacent, -4 range-two light attack, -6 range-two non-light attack.
- Damage equals the absolute difference between final combat totals.
- The losing unit loses that many squad members; zero strength routes/wipes the unit.
- Battle ends when either side has no live units, or when the player concedes.
- Combat dice stay visible for about one minute before fading.

Movement remains constrained. Units still cannot move freely. Movement still goes through maneuvers, reachable highlights, water blocking, hill/fence stop behavior, section advances, line brigade original-line locking, heavy brigade, Scout, and Berserk.

## Files Changed

- `experiments/The Cavalry of Rome/src/hex-combat-controller-pass.js`
- `experiments/The Cavalry of Rome/src/hex-action-ui-pass.js`
- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `tests/cavalry-of-rome-combat-static-smoke.mjs`
- `experiments/The Cavalry of Rome/README.md`
- `.agent/turn-ledger/2026-07-01-cavalry-full-combat-rules.md`

## Checks Run

- GitHub contents writes succeeded on `main`.
- Static smoke now guards combat controller presence, attack action, AP carryover, one-roll-per-turn AP, pass/concede buttons, 2d6 combat, rank advantage, range penalties, damage by roll difference, route/wipeout behavior, win/loss state, constrained movement surfaces, and endpoint wiring.
- Browser-backed Playwright validation was not run in this session.

## Important Notes

- A real trained ONNX model artifact is still not included; opponent policy remains RAG/ONNX-shaped with memory fallback.
- Combat dice are canvas-rendered board dice and hold for one minute for combat rolls.
- Pass Turn and Concede are explicit UI controls above the action cards.

## Next Ledge

Browser-test full combat flow, especially AP roll once per turn, AP carryover after pass, combat dice hold duration, range-two attack penalties, and win/loss state.
