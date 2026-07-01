# Agent Ledger Entry: Cavalry hex battlefield pass

Date: 2026-07-01
Actor: GPT-5.5 Thinking
Repo: LuminaryLabs-Agents/NexusRealtime-Experiments
Branch: main

## Goal

Implement the requested hex battlefield after zone selection and address floating vegetation during tactical play.

## Files Read First

- `experiments/The Cavalry of Rome/src/main-realistic.js`
- `experiments/The Cavalry of Rome/src/vegetation-pass.js`
- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `experiments/The Cavalry of Rome/domain-plan.json`
- `experiments/The Cavalry of Rome/README.md`

## Change Summary

Added `src/hex-battlefield-pass.js`, a no-UI tactical battlefield overlay that activates when the existing route enters `battlefield` mode. It covers the old freeform battlefield, presents an 11x9 pseudo-perspective hex board from above and behind Rome, adds grass/water/hill/fence tiles with movement/defense metadata, and renders aggregated light/medium/heavy troop units with class colors and army band colors.

Rome now uses green light units with a red band, blue medium units with a red band, and red heavy units with a darker red band/trim. Enemy units keep the same class colors while their army bands vary by region. The first deployment is auto-formed rather than alternating placement so that scene-native gameplay can stabilize without reintroducing UI.

The pass also sets `CavalryHexBattlefieldActive` and hides the screen-space vegetation overlay during hex battle. This addresses the floating vegetation problem in tactical play by ensuring battlefield grass/features are drawn inside the hex playfield rather than as detached screen-space vegetation.

## Files Changed

- `experiments/The Cavalry of Rome/src/hex-battlefield-pass.js`
- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `experiments/The Cavalry of Rome/domain-plan.json`
- `experiments/The Cavalry of Rome/README.md`
- `.agent/turn-ledger/2026-07-01-cavalry-hex-battlefield-pass.md`

## Checks Run

- GitHub contents writes succeeded on `main`.
- Static smoke source now guards the hex pass, terrain types, class colors, army band colors, unit counts, GameHost hex snapshot, and vegetation overlay suppression during hex battle.
- Fetched the updated endpoint and experiment entry to verify `hex-battlefield-pass.js` is loaded.
- Full repo checks were not run locally because the repository was edited through GitHub contents writes rather than a local checkout.

## Decision Notes

- This implementation is an overlay pass rather than a full replacement of the underlying WebGPU battlefield renderer. It intentionally covers the old freeform battlefield so the user sees the hex playfield while minimizing risk to the existing world-map and transition code.
- Vegetation floating happened because `vegetation-pass.js` is a screen-space overlay with approximate map projection, not terrain-anchored WebGPU geometry. Tactical mode now hides that overlay and draws tile features directly on the hex battlefield.
- The first pass uses auto-deployed formations rather than alternating placement. Alternating placement can come next as scene-native board interaction.
- No visible UI, HUD, footer, command panel, or loader overlay was reintroduced.

## Risks / Watch Items

- World-map vegetation remains a screen-space overlay. It is acceptable as map ornamentation for now, but true terrain anchoring should eventually move into WebGPU or a shared terrain-anchored vegetation kit.
- The old WebGPU freeform battlefield still renders underneath the new hex overlay; future cleanup should disable or replace it directly in `main-realistic.js`.
- A browser-backed smoke is still needed to verify real route boot, hex overlay visibility after region selection, and `GameHost.getHexBattlefieldSnapshot()` availability.

## Next Ledge

Add scene-native unit movement on the hex board: select a unit, show reachable hexes using movement costs, and move the selected unit with terrain effects, all without HUD or panels.

## Do Not Do Next

- Do not reintroduce visible UI or loader overlays.
- Do not add combat resolution until movement and placement are stable.
- Do not copy tabletop rules, scenarios, cards, dice, or stat tables.
