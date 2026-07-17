# Next Ledge Windglass Rejoin Release Cue

- Packet: `2026-07-17-next-ledge-windglass-rejoin-release-cue`
- Run started: `2026-07-17T05:05:30-04:00`
- Result: validated playable upgrade; publication pending
- Experiment-game: `experiments/next-ledge/`
- Starting commits: Experiments `9e183248ce5e8c75fb78c7f7ce562d34a4d81a67`; ProtoKits `04d34f049f58ae359cf71d43466c429dac2a6d08`; Core read-only `a5882b47bd5a9284550bb3af1f0cd8580c62665e`

## Intent

- Player fantasy: a stormline recovery operator cashes out either branch at Windglass, reads the shared route, and vaults back into the original ascent.
- Hero verb: settle on Windglass, build high toward original `anchor-11`, release on the cyan ready cue, then re-grapple.
- Target feeling: settle, load, and snap upward with confidence; one branch-neutral recovery beat that feels earned after either score.
- Pressure loop: the safe route preserves speed while the shortcut banks cargo and vents pressure; both must now convert the score settle into the same readable recovery launch.
- Objective: secure original `anchor-11` and restore generic ascent without losing the `134 SPEED` or `175 CARGO` branch result.
- Failure/recovery: releasing outside the cue remains valid but unboosted; the existing rejoin fail-floor and aim-assist window preserves one forgiving retry, while falling still reaches the real `R` recovery path.
- Visual identity: the mint or amber score settle visibly hands off to one protected cyan high-build cue, with the existing rope, player light, atmosphere, sparks, camera, HUD, and synth owners.
- Interaction structure: first-screen `A / D`, `SPACE / CLICK`, and `R`; optional controls and diagnostics stay inside Advanced and closed by default.
- Selected ProtoKit features: generic tether motion, cable launch, traversal vitals, traversal recovery, traversal camera, traversal cues, traversal feedback, and route-cargo extraction.
- Core relationship: NexusEngine remains the read-only runtime and composition authority; no Core primitive is duplicated.
- Ownership: declarative route cue tuning and browser presentation stay local; reusable deterministic traversal, recovery, route, cargo, and pressure behavior remains in ProtoKits.

## Human View Route Packet

- Surface: browser game / interactive Three.js scene.
- Primary human task: understand the shared high-build recovery cue, release into it, and secure `anchor-11` after either Windglass score.
- Selected perspectives: player readability, feedback feel, camera framing, objective clarity, and regression player view.
- Validation techniques: launch-state inspection, actual-input Playwright walkthrough, before/after screenshots, first-screen/control-hierarchy scan, real failure/recovery, Advanced closed/open/closed, console review, and matched warm/active performance comparison.
- Before evidence: `evidence/human-view-before-first-screen.png` and `evidence/human-view-before-mint-release.png`.
- After evidence: `evidence/human-view-final-cyan-ready-safe.png`, `evidence/human-view-final-cyan-release-safe.png`, `evidence/human-view-final-rejoin-secured-safe.png`, `evidence/human-view-final-cyan-ready-shortcut.png`, `evidence/human-view-final-cyan-release-shortcut.png`, `evidence/human-view-final-rejoin-secured-shortcut.png`, `evidence/human-view-final-failure.png`, and `evidence/human-view-final-recovery.png`.
- Perspective results: the shared cyan target, high-build beam, and hero prompt remain readable on both branch identities; release frames now replace build copy with the authored fire instruction; camera keeps player and `anchor-11` visible; failure and retry preserve first-screen purpose and controls; diagnostics stay closed.
- Failure routes: tune authored angle/speed/camera/feedback values locally; do not add controls or parallel state.
- Next action: let original `anchor-11` answer the secured cyan release with one short score-preserving rebound/confirmation beat, reusing the existing `windglass-rejoin-secured`, tether, camera, player-scale, spark, and synth owners.

## Playable Result

- Upgraded the active `next-ledge` experiment-game; no new experiment or creation count is claimed.
- Both the `134 SPEED` mint line and `175 CARGO` amber line now settle, expose one cyan high-build readiness cue, release with upward lift plus `0.42x` authored lateral damping, and secure original `anchor-11` through physical Space input.
- The hero cue reuses one direction/speed descriptor consumer, the existing release command and `released` event, existing camera trauma, rope/player materials, bounded sparks, atmosphere, HUD, and synth. No release state, timer, control, event type, DOM node, renderer entity, material, effect pool, or diagnostic owner was added.
- Human View caught and fixed two real issues: stale build copy after release, and shortcut lateral velocity that could latch `anchor-11` then hit the wall before lock.

## Feel Score

| Dimension | Before | After |
| --- | ---: | ---: |
| Responsiveness | 8 | 9 |
| Predictability | 7 | 9 |
| Readability | 7 | 9 |
| Impact | 7 | 10 |
| Recovery | 9 | 9 |
| Delight | 8 | 9 |
| Replay desire | 8 | 9 |
| Average | 7.7 | 9.1 |

## Final Integration, Cleanup, And Performance

- Reviewed every run-owned file plus the score-settle, readiness, release, launch, latch, rejoin, renderer, HUD, effects, audio, and route-cargo paths.
- Consolidated payoff and rejoin readiness behind `describeActiveSwingReleaseCue`; score-settle gating remains one event-age helper. Authored data remains in the climb preset, deterministic release response remains in the existing session command, and adapters stay local.
- Extended the existing `released` event payload for evidence only. Removed no proven gameplay, environment, route, cargo, pressure, failure, recovery, mastery, or summit system.
- Diagnostics are closed by default. No identifier, graph, hit volume, descriptor dump, or instrumentation moved into the player view.
- Matched 60-rendered-tick warm-up plus 180-rendered-tick active comparison: published before `61.40 ms` average / `16.29 FPS` / `98.70 ms` p95; final `66.18 ms` / `15.11 FPS` / `84.80 ms` p95. The primary average changed `+7.8%`, inside the `10%` budget, while p95 improved.
- Three further 120-tick checkpoints held `69` DOM nodes, `1` canvas, `76` descriptors, `32` ledges, and `277` settled scene nodes. Heap settled at `26.351`, `26.353`, and `26.354 MB`; no unbounded growth or duplicate visible entity appeared.

## Validation And Audits

- All `28` existing `tests/next-ledge*.mjs` entrypoints passed; affected JavaScript syntax, JSON, and `git diff --check` passed.
- Playwright physically completed both branch routes, banked both scores, fired both cyan releases, secured original `anchor-11`, reached a real dead state, recovered with physical `R`, and proved Advanced `closed → open → closed`.
- Final reload reported zero console errors, zero page errors, hidden fatal panel, and Advanced closed.
- Ownership audit: Core remained read-only; ProtoKits remained unchanged; reusable tether, cable, vitals, recovery, camera, cue, feedback, route, cargo, and pressure behavior was not copied. Experiment-only route tuning, browser input, Three.js, HUD, effects, synth, and proof stayed local.
- Diversity audit: same stormline fantasy, hero verb, pressure loop, interaction structure, and eight-feature signature; no new kit, experiment, route family, production signature, or count.
- Feature-migration audit: no source was retired, pruned, or replaced; all prior route, environment, readiness, cargo, pressure, failure/recovery, mastery, and summit features remain reachable.

## Publication

- Production commit: pending.
- Final receipt commit: pending.
- ProtoKits: unchanged at `04d34f049f58ae359cf71d43466c429dac2a6d08`.
