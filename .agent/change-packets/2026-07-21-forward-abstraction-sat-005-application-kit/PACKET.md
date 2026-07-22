# Change Packet — SAT-005 Application-Domain Kit

Status: validated / reconciled / publication-ready
Date: 2026-07-21 through 2026-07-22

## Result

Counterweight Cathedral advanced exactly one artifact stage from a validated playable with inline composition to a frozen local full-game application-domain kit. The live route imports that artifact, retains canonical Core/ProtoKit behavior, and adds a data-driven selected-stone target guide so the matching bowl is readable without diagnostics.

## Intent and Boundary

- Player fantasy: tune a suspended cathedral mobile into exact balance.
- Hero verb: shift and settle physical counterweights.
- Target feeling: deliberate, legible mass placement with immediate cause and effect.
- Pressure: every settle commits weight; any overload fractures the frame.
- Objective: exact `2 / 3 / 1` balance across Dawn, Zenith, and Vesper.
- Failure/recovery: visible overload ending and one-action deterministic restart.
- Visual identity: dark suspended sculpture with cyan, gold, and rose stones.
- Current layer: application-domain kit; no reusable semantic promotion occurred.
- Core: read-only and unchanged.
- ProtoKits: unchanged; Physics Body Lite and Weighted Trigger remain canonical behavior owners.
- Local ownership: fantasy, scene/tuning descriptor, selection, settle adapter, exact outcome policy, target guide, browser input, Canvas, DOM, and diagnostics.

## Real Features Composed

- NexusEngine engine lifecycle and deterministic tick
- Physics Body Lite body registration, mass, impulse, position, velocity, and friction
- Weighted Trigger registration, source observation, aggregate weight, activation, and snapshot
- explicit settled-body-to-weight-source adapter
- application-domain descriptor for scene, tuning, outcomes, budgets, and ownership
- data-driven matching-bowl prompt, strip label, and Canvas highlight

## Player Loop and Human View

`select stone -> read highlighted exact bowl -> shift -> settle -> inspect canonical weight -> overload and restart or balance all bowls -> chord -> replay`

- First screen clearly shows purpose, three hero actions, selected stone, and its matching bowl.
- Pointer play intentionally overloaded Dawn `3 / 2` and reached `Frame Fractured`.
- Keyboard play reached exact `2 / 2`, `3 / 3`, `1 / 1` and `Cathedral Chord`.
- A second complete success produced byte-identical Physics Body Lite and Weighted Trigger states.
- Advanced diagnostics proved `closed -> open -> closed` and remained closed in final evidence.

Evidence:

- `evidence/before-first-screen.png`
- `evidence/final-first-screen.png`
- `evidence/overload-loss.png`
- `evidence/exact-success.png`

## Feel Scores

| Category | Before | After |
| --- | ---: | ---: |
| Responsiveness | 8 | 8 |
| Predictability | 9 | 9 |
| Readability | 8 | 9 |
| Impact | 8 | 8 |
| Recovery | 8 | 8 |
| Delight | 8 | 8 |
| Replay desire | 7 | 8 |
| Average | 8.00 | 8.29 |

The behavior did not need retuning; the target guide improved the two weaker player-facing categories without changing state ownership.

## Cleanup and Consolidation

- Removed inline scene inventory, baselines, rail constants, trigger tuning/tags, outcome presentation data, and hard-coded counts from the route consumer.
- Consolidated those values in one frozen application descriptor.
- Kept reusable physics and weighted-trigger logic behind existing ProtoKit APIs.
- Added no parallel state, listeners, DOM nodes, canvases, effect pools, or debug owners.
- Kept optional domain evidence in the existing explicitly labeled disclosure, closed by default.
- Retained the playable; no source purge is eligible before atomic mapping, canonical successor selection, migration, and parity.

## Performance

Stable warm-up plus active input window:

| Metric | Before | After | Decision |
| --- | ---: | ---: | --- |
| average frame | 16.668 ms | 16.594 ms | pass, 0.44% faster |
| FPS | 59.99 | 60.26 | pass |
| p95 frame | 18.7 ms | 17.7 ms | pass |
| DOM nodes | 77 | 77 | bounded |
| Canvas | 1 | 1 | bounded |
| long tasks | 0 | 0 | pass |
| console messages | 0 | 0 | pass |

No entity, descriptor, DOM, or memory-growth signal appeared; the application descriptor is frozen and created once.

## Validation

- `node --check` passed for the route and application kit.
- Direct application-kit import/freeze/scene contract passed.
- `node scripts/run-checks.mjs` passed: 1,044 JS/MJS files, 255 HTML files, 610 JS modules, route/gallery/domain checks; legacy static warnings were unchanged.
- The complete repository `npm run check` also passed before the final local target-guide pass; the final affected static/runtime surfaces were then rerun successfully.
- Playwright physical loss/success/restart/replay/disclosure flows passed.
- Human View passed first-screen, loss, and success inspection.
- Final console: zero errors, warnings, or other messages.

## Audits

- Ownership: Core lifecycle is reused; Physics Body Lite owns bodies; Weighted Trigger owns aggregate activation; the host owns only the settle observation bridge and application policy/presentation.
- Diversity: this remains the kinetic weighted-balance proof; no new experiment was falsely counted.
- Feature migration: all prior SAT-005 features remain present; route constants moved to the application kit and one matching-bowl guide was added. No reusable behavior moved or duplicated.
- Capability count: zero newly accepted atomic capabilities in this artifact-packaging stage; the historical saturation streak remains closed at `5 / 5`.
- Purge: rejected for now; the validated playable remains the parity owner.

## Commits and Next Stage

- Starting Experiments commit: `c6cf0be42db856f559be872cfc442deabc815817`.
- ProtoKits remains unchanged at `5986b69b047d622ea2efe58d12876033f3de2291`.
- Exact next stage: create SAT-005's atomic responsibility map, classify each candidate, and choose one semantic boundary for taxonomy review. Do not promote, purge, or start an unrelated experiment in that same cycle.
