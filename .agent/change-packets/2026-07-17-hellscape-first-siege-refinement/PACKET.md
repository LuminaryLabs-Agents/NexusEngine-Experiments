# Hellscape First-Siege Refinement Packet

- Packet: `2026-07-17-hellscape-first-siege-refinement`
- Date: 2026-07-17
- Experiment-game: `games/rogue-lite-hellscape-siege/`
- Starting Experiments commit: `1c163d3de2bcb488ee522751b69dd5d9d944c575`
- Starting/final ProtoKits commit: `04d34f049f58ae359cf71d43466c429dac2a6d08`
- Core read-only reference: `a5882b47bd5a9284550bb3af1f0cd8580c62665e`
- Production commit: `03c68775b109ec7e1a7ed94b289604329f453305`
- Final receipt commit: reported after publication

## Result

The weakest unscored active legacy route now has one complete first-siege loop. The player builds a stocked Spike Wall, starts Siege 1 at the Ember Core, closes on threats and lands physical Warden strikes, secures or breaches the core, recovers starter materials, then harvests and returns from a resource realm without losing clear or inventory state. Five readiness overlays moved out of the player view and behind one default-closed Advanced diagnostic owner.

## Selection and baseline finding

`rogue-lite-hellscape-siege`, `signal-bastion`, and `stonewake-depths` were unscored; the stable-ID tie selected Hellscape after confirming no overlapping live work. Before editing, the route opened with five diagnostic panels and descriptor text instead of purpose or controls. The player could build, start a wave, and harvest, but Space did not damage enemies, so the defense fantasy had no player-owned impact.

## Feature contract

- Player purpose: prepare and personally hold the Ember Core, then gather materials for the next defense.
- Target feeling: build, brace, break, recover.
- Owner: the local Hellscape game composes its existing kit-shaped runtime; `createWaveAndDefenseKit` owns deterministic strike/recovery state, while the HUD and Canvas renderer consume snapshots and events.
- Exclusions: no Core changes, no ProtoKit export changes, no generic-defense cutover, no new browser API, no route retirement, and no new test file.
- Hero actions: move, build, interact/start/enter/return, strike/harvest.
- Advanced actions: cycle/select blueprint and show readiness diagnostics.
- Resources/state: player, core, inventory, realm, resources/drops, build/structures, wave/enemies, combat counters, and bounded FX.
- Events/methods: existing inventory, realm, structure, wave, and FX events; `engine.waves.start()`, `engine.waves.strike()`, build, realm, and inventory methods.
- Snapshots/descriptors: one enriched `GameHost.getState()` snapshot, six cached domain descriptions, one composed renderer handoff, and one diagnostics boolean.
- Dependencies: current Nexus Engine CDN surface and the route's local runtime composition; ProtoKits and Core were unchanged.

## Real kit features composed

1. input/avatar movement
2. inventory plus starter-cache recovery
3. realm/portal transitions
4. harvest and pickup loop
5. build blueprint and structure loop
6. wave/core defense plus Warden strike
7. bounded FX plus renderer handoff

## Concrete refinement

- Added starter stock for one first wall, a smaller six-enemy first wave, and an explicit build-before-start gate.
- Added a 132-unit, 48-damage, 0.32-second Warden strike with nearest-target selection, hit/kills/clear/failure counters, beam, flash, burst, camera shake, and hurt color.
- Added clear and natural breach outcomes; breach restores core/player health and starter materials for an immediate rebuild.
- Added a first-screen mission, live objective, core/wave/player status, four hero controls, action emphasis, and semantic impact cue.
- Preserved the Grove/Crystal/Ashes harvest loop and proved a Grove harvest/return after clear with inventory and clear state intact.

## Final integration, cleanup, and performance

- Authored first-siege stock, strike, wave size, and cadence live in `config.firstSiege`; reusable runtime mutation remains in the wave/defense and inventory APIs.
- Browser input, HUD, Canvas drawing, presentation tuning, and diagnostic disclosure remain local.
- Consolidated the player view to one HUD owner and one Canvas owner. Removed the unused diagnostic subscription path and compositor blur/layer hints that produced long-session capture tearing.
- Cached the six expensive domain descriptions and reduced default refresh to 250 ms.
- Kept only the core visual-fractal layer in the default renderer. Expedition, siegecraft, contract, caravan, forge, blood-moon, purification, seed-vault, covenant, and lantern diagnostic presentation remains available only through Advanced.
- Five readiness entry loops now patch their host API once, avoid default descriptor/render work, and update at most every 750 ms when diagnostics are enabled.
- Default diagnostics: closed, zero visible readiness panels. First disclosure creates exactly five panels; a second open/close cycle remains five panels and zero visible when closed.

### Measured comparison

Matched 40-frame active-play window:

| Metric | Before | After | Result |
| --- | ---: | ---: | --- |
| average frame time | 85.45 ms | 32.99 ms | 61.4% lower |
| p95 frame time | 166.60 ms | 34.30 ms | 79.4% lower |
| measured FPS | 11.70 | 30.31 | 159% higher |
| default DOM nodes | 79 | 50 | 29 fewer |
| canvas nodes | 1 | 1 | bounded |
| active descriptor count | 245 | 254 | bounded feature union |
| available heap signal | 10.77 MB | 7.19 MB | no regression |
| console errors | 0 | 0 | clean |

After removal of the final compositor blur paths, the same warm active view rechecked at 16.34 ms average, 18.20 ms p95, and 61.18 FPS with 50 DOM nodes, one canvas, zero visible diagnostics, and the error panel hidden.

Three post-failure steady-state checkpoints held 50 DOM nodes, one canvas, no enemies/structures, and 248 settled descriptor IDs. Bounded particles decayed `16 -> 0 -> 0`; the available heap signal stayed bounded at `6.96 -> 6.41 -> 6.82 MB`.

## Feel score

| Dimension | Before | After |
| --- | ---: | ---: |
| responsiveness | 4 | 9 |
| predictability | 3 | 9 |
| readability | 1 | 9 |
| impact | 3 | 9 |
| recovery | 4 | 8 |
| delight | 2 | 8 |
| replay desire | 2 | 8 |
| average | 2.7 | 8.6 |

## Human View and Playwright proof

Before:

- `evidence/human-view-before-first-screen.png`
- `evidence/human-view-before-wave.png`
- `evidence/human-view-before-harvest.png`

After:

- `evidence/human-view-final-first-screen.png`
- `evidence/human-view-final-starter-wall.png`
- `evidence/human-view-final-strike-impact.png`
- `evidence/human-view-final-siege-clear.png`
- `evidence/human-view-final-harvest.png`
- `evidence/human-view-final-return.png`
- `evidence/human-view-final-recovery.png`

Playwright used actual keyboard input to build, move, start, strike, clear, enter Grove, harvest wood, return to base, strike in a later wave, breach naturally, recover, and open/check/uncheck/close Advanced. The completed Siege 1 recorded eight hits, six kills, one clear, and no failure; later proof recorded a real strike followed by a natural breach and starter-cache recovery. Console result: zero errors and zero warnings.

## Validation

- all existing `tests/hellscape*.mjs`
- affected JavaScript syntax checks
- repository `node scripts/run-checks.mjs` invoked; it stops at the unchanged starting-commit duplicate `drawHexFill` declaration in `experiments/The Cavalry of Rome/src/hex-gameplay-pass.js`
- JSON parse checks
- `git diff --check`
- fresh local HTTP runtime and Playwright browser loop

## Audits

- Ownership: Core stayed read-only; ProtoKits stayed clean and unchanged. Deterministic local game mutation remains in kit APIs. Input, authored content/tuning, HUD, Canvas, and diagnostics remain local.
- Diversity: this seven-feature action-defense/extraction loop is materially distinct from Next Ledge's traversal/cargo loop. It is an in-place legacy refinement and claims no production signature or count.
- Feature migration: no source, route, scene, mechanic, or public API was deleted or retired, so `feature-migration-ledger.json` correctly remains unchanged with zero retirement entries.
- Valuable union: realm portals, inventory, harvesting, pickups, three blueprints, structures, waves, core defense, player failure, recovery, progression, readiness domain APIs, renderer handoffs, and FX remain present.

## Exact next playable improvement

Make the post-clear Grove and Ashes material run preserve a visible two-resource rebuild recipe and one meaningful return-to-core fortification choice without adding a first-screen control or duplicating defense state.
