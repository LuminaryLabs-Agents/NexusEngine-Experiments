# Next Ledge Windglass Branch Settle Refinement

- Packet: `2026-07-17-next-ledge-windglass-branch-settle-refinement`
- Experiment-game: `experiments/next-ledge/`
- Starting commits: Experiments `e7920f97ed923ad3975a58416f49a70881d0de24`; ProtoKits `04d34f049f58ae359cf71d43466c429dac2a6d08`; Core read-only `70cc2a1590677b872d40a42f7b7bb7e174941eb0`
- Production commit: pending
- Status: validated, pending publication

## Intent And Ownership

- Player purpose: make the shared Windglass catch visibly answer the route the player just mastered.
- Target feeling: mint settles with buoyant lift and breathing room; amber brakes with a compressed snap and immediate control.
- Ownership: local payoff descriptors author settle tuning; the existing Windglass score event carries it; the existing tether motion, route-choice state, camera trauma, materials, player scale, bounded spark pool, HUD, and synth consume it.
- Exclusions: no new control, route state owner, event type, timer owner, DOM node, entity, material, effect pool, Core change, or reusable ProtoKit behavior.
- Actions: build swing, release, re-grapple, choose a route, carry or vent pressure, release through the branch window, catch Windglass, recover the original ascent, fail, and retry.
- Resources/state: existing tether motion, stamina, cargo, pressure, route progress, route choice, score metric/value, camera trauma, and recent semantic events.
- Methods/events: existing session update/release/lock methods; extended `windglass-relay-scored`; preserved `windglass-rejoin-opened` and `windglass-rejoin-secured`.
- Snapshot/descriptors: selected payoff metadata supplies settle style, frames, color, angular multiplier, camera impulse, squash, and player copy; presentation derives bounded strength from existing event age.
- Dependencies: generic tether motion, cable launch, traversal vitals, traversal recovery, traversal camera, traversal cues, traversal feedback, and route-cargo extraction.
- Core relationship: Nexus Engine remains the read-only runtime authority; no Core API or source changed.
- ProtoKit composition: the same eight real traversal/cargo features remain composed; no reusable deterministic gap required a ProtoKit edit.

## Baseline

- Complete route play showed that mint and amber stayed distinct through payoff fire, latch, and first release, but `windglass-relay-scored` immediately collapsed both into the same cyan rejoin presentation.
- The score still worked (`134 SPEED` / `175 CARGO`), yet the exact payoff moment had generic white sparks, generic rising audio, generic player/catch material, and one generic rejoin prompt.
- Feel scores: responsiveness `9`, predictability `9`, readability `9`, impact `9`, recovery `8`, delight `9`, replay desire `9`; average `8.9`.
- Baseline Human View: `evidence/human-view-before-first-screen.png`, `evidence/human-view-before-mint-ready.png`, and `evidence/human-view-before-failure.png`.

## Concrete Refinement

- Added a `24`-frame `mint-float-settle` to Slipstream and a `16`-frame `amber-brake-settle` to Cacheline as declarative payoff data.
- Applied the authored angular settle and camera impulse through the existing lock, tether-motion, and camera owners.
- Extended the existing semantic score event with bounded presentation data; no event type or timer was added.
- Reused the existing Windglass/player materials, consequence line, beacon, spark pool, HUD, and synth for mint float versus amber brake feedback.
- Made first-swing direction copy resolve `{direction}` from the actual payoff-to-Windglass geometry so mirrored sectors do not advertise the wrong side.
- Mint replay banked `134 SPEED`; amber replay banked `175 CARGO`, vented authoritative pressure to `0`, and both retained the original protected `anchor-11` rejoin.

## Final Integration, Cleanup, And Performance

- Reviewed every run-owned file plus the full payoff-to-Windglass runtime path before and after the edit.
- Consolidated settle derivation in one descriptor/event-age helper. Added no duplicate state, event, listener, line, DOM node, material, renderer entity, or configuration path.
- Limited event scanning to the existing `rejoin-active` phase and restored shared Windglass material/beam state once, after the settle expires, instead of rewriting default material state every frame.
- Isolated the existing UI stacking context so deep-failure WebGL compositor tiles can no longer punch through first-screen purpose, status, controls, or resources.
- Diagnostics remain closed by default. No diagnostic label, identifier, graph, hit volume, or descriptor dump was added to the player view.
- Preserved objectives, counterwind pressure, route fork, Stormlock vent, confirmation, payoff, score, failure/recovery, original rejoin, route progress, cargo continuity, mastery crest, and summit systems. Water and combat remain not applicable to this traversal experiment.
- Final matched Playwright fixed window after compositor cleanup: starting commit `86.81 ms` average tick / `11.52` simulated FPS / `129.80 ms` p95; final `61.40 ms` / `16.29` FPS / `98.70 ms` p95. Average tick improved `29.3%`, with no regression.
- First-screen counts remained `69` DOM nodes, `1` canvas, `72` descriptors, `236` scene nodes, and `25` ledges. Active sector settled at `69` DOM nodes, `1` canvas, `76` descriptors, `277` scene nodes, and `32` ledges.
- A further `360` active ticks did not grow DOM, descriptor, ledge, or settled scene counts. Heap returned from the active sample to `21.73 MB` after a two-second collection window; no unbounded steady-state growth was observed.

## Human View And Playwright

- Final evidence with Advanced closed: `evidence/human-view-after-first-screen.png`, `evidence/human-view-after-mint-settle.png`, `evidence/human-view-after-amber-settle.png`, and `evidence/human-view-after-failure.png`.
- Playwright physically completed the safe and shortcut routes into Windglass, confirmed their score payloads and branch settle styles, secured original `anchor-11`, opened and closed Advanced, reached a real dead state, and recovered through physical `R`.
- Final console: `0` messages, `0` warnings, `0` errors; visible error panel remained hidden.
- Human View question: yes, all relevant states and interactions were inspected. Before/after images were reviewed directly for first-screen purpose/hero controls, mint score, amber score, protected rejoin, failure/retry, and diagnostics-closed presentation.

## Validation And Audits

- Checks: all `28` existing `tests/next-ledge*.mjs` entrypoints; affected JavaScript syntax; JSON parse; `git diff --check`.
- Feel scores after: responsiveness `9`, predictability `9`, readability `9`, impact `10`, recovery `9`, delight `9`, replay desire `9`; average `9.1`; no dimension below `9`.
- Natural-language ownership audit: deterministic generic traversal/cargo behavior remains in the eight ProtoKit features; route content/tuning stays in descriptors; browser/input/render/audio/HUD stay local; Core stays read-only.
- Diversity audit: in-place legacy refinement only; the existing eight-feature signature, fantasy, verb, objective, and pressure loop remain unchanged; no kit, experiment, route family, production count, exact duplicate, or near-duplicate was added.
- Feature-migration audit: no source was deleted, merged, pruned, or proposed for retirement; `feature-migration-ledger.json` and retirement counts correctly remain unchanged.

## Publication

- ProtoKits: unchanged at `04d34f049f58ae359cf71d43466c429dac2a6d08`.
- Experiments production commit: pending.
- Push: pending fetch-before-push verification.
- Exact next playable improvement: add one branch-neutral high-build release-ready cue from Windglass into original `anchor-11`, reusing existing swing readiness and release owners so the score settle flows into recovery without another state or control.
