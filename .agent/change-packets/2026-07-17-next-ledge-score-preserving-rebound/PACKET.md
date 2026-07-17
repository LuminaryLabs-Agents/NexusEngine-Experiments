# Next Ledge Score-Preserving Rebound

- Packet: `2026-07-17-next-ledge-score-preserving-rebound`
- Run started: `2026-07-17T14:03:18-04:00`
- Result: validated playable upgrade; production commit published
- Experiment-game: `experiments/next-ledge/`
- Starting commits: Experiments `10e1c998ce0582238dcb236093e727a05b63b2b5`; ProtoKits `bb3d787da372bf001653635d6e57eb7ce54e3c50`; Core read-only `a5882b47bd5a9284550bb3af1f0cd8580c62665e`

## Intent

- Player fantasy: a stormline recovery operator carries the identity and score of a chosen rescue line back into the original climb.
- Hero verb: bank a mint or amber score, hit the cyan high-build release, fire for original `anchor-11`, and ride its answer upward.
- Target feeling: a crisp score-stamped recoil that makes the convergence catch feel like a launch instead of a quiet reset.
- Pressure loop: preserve `134 SPEED` through the protected line or vent pressure and bank `175 CARGO` through the shortcut, then prove either result on the shared catch.
- Objective: secure `anchor-11` and keep the selected branch score visible through its short upward rebound.
- Failure/recovery: missing the cyan shot still reaches the existing sector-floor failure and physical `R` recovery loop.
- Visual identity: cyan score rail, tall climber stretch, focused anchor ring, bounded spark burst, camera kick, and one bottom hero cue.
- Interaction structure: `A/D` builds swing; `Space/click` releases and fires; `R` recovers. Advanced diagnostics remain default-closed.
- ProtoKit composition: `generic-tether-motion-kit`, `generic-cable-launch-kit`, `generic-traversal-vitals-kit`, `generic-traversal-recovery-kit`, `generic-traversal-camera-kit`, `generic-traversal-cue-kit`, `generic-traversal-feedback-kit`, and `generic-route-cargo-extraction-kit`.
- Core relationship: Core remains read-only runtime authority; no Core behavior is copied or changed.
- Ownership: ProtoKits keep deterministic tether, launch, vitals, recovery, camera, cue, feedback, and route-cargo behavior. The experiment keeps authored convergence tuning, browser input, route fiction, Three.js/Web Audio presentation, and HUD copy.

## Playable Change

- The authored convergence descriptor now defines a bounded `18`-frame cyan score rebound, `0.034` target-directed angular impulse, `0.52` retained angular velocity, `0.36` camera impulse, and player stretch.
- Securing original `anchor-11` extends the existing `windglass-rejoin-secured` event with the chosen score and authored presentation evidence; it does not add a state, timer, event type, control, entity, material, or effect pool.
- The safe route preserves `134 SPEED`; the shortcut preserves `175 CARGO` with fall pressure still at zero.
- The existing tether/player scale, anchor material, camera, HUD, spark pool, and synth consume one event-age descriptor and expire back into generic ascent.

## Final Integration, Cleanup, and Ownership Audit

- Consolidated simulation-scale and presentation timing onto `describeWindglassRejoinRebound`; removed the duplicate event-age scanner found during cleanup.
- Reused the existing route-choice score, original `anchor-11`, `windglass-rejoin-secured` event, renderer entities/materials, HUD owners, spark pool, and audio path.
- No new DOM node, canvas, descriptor count, steady-state scene entity, listener, control, debug surface, state owner, timer, event type, material, or effect pool was added.
- Advanced controls and diagnostics are closed by default and physically toggled closed → open → closed.
- Natural-language ownership audit: deterministic reusable behavior remains in the eight imported ProtoKit features; all new values are route-authored content and local presentation of an existing semantic event. Core stayed read-only.

## Human View and Playwright Evidence

- Before: `evidence/human-view-before-first-screen.png`, `evidence/human-view-before-rejoin-secured-safe.png`, and `evidence/human-view-before-rejoin-secured-shortcut.png` show the prior generic ascent confirmation.
- After safe route: `evidence/human-view-final-mint-release-safe.png`, `evidence/human-view-final-cyan-ready-safe.png`, `evidence/human-view-final-cyan-release-safe.png`, and `evidence/human-view-final-rejoin-secured-safe.png`.
- After shortcut: `evidence/human-view-final-cyan-ready-shortcut.png`, `evidence/human-view-final-cyan-release-shortcut.png`, and `evidence/human-view-final-rejoin-secured-shortcut.png`.
- Recovery: `evidence/human-view-final-failure.png` and `evidence/human-view-final-recovery.png`.
- Playwright physically released and fired both branch routes into original `anchor-11`; scores remained `134 SPEED` and `175 CARGO`, the shortcut retained zero pressure, and both secured events carried the authored rebound.
- Human View passed the first screen, both cyan release identities, both secured-score frames, failure, and recovery with diagnostics closed.
- Fresh-load console errors: `0`; page errors: `0`; error panel hidden.

## Feel Score

| Dimension | Before | After |
|---|---:|---:|
| Responsiveness | 9 | 9 |
| Predictability | 9 | 9 |
| Readability | 9 | 10 |
| Impact | 10 | 10 |
| Recovery | 9 | 9 |
| Delight | 9 | 9 |
| Replay desire | 9 | 9 |
| Average | 9.1 | 9.3 |

## Performance and Validation

- A starting-commit worktree and the upgraded build ran the same `60`-tick warm-up, `180`-tick active-play sample, and three `120`-tick growth checkpoints in the same browser under the same observed host contention.
- Matched active average: `119.861 → 125.121 ms` (`+4.39%`, inside the `10%` gate); measured FPS `8.343 → 7.992`; p95 `152.900 → 166.300 ms` (`+8.76%`).
- Bounded counts: `69` DOM nodes, `1` canvas, `76` descriptors, `32` ledges, and `277` settled scene nodes before and after; no steady-state entity growth or duplicated visible entity appeared.
- After-collection heap signal: `54.958 → 58.211 MB` (`+5.92%`) with garbage-collection fluctuation but no monotonic growth across checkpoints.
- All `28` existing `tests/next-ledge*.mjs` entrypoints passed. Affected JavaScript syntax, JSON parsing, and diff hygiene passed.

## Diversity and Migration Audit

- Diversity: this is an in-place refinement of the existing stormline fantasy, swing/re-grapple verb, pressure loop, interaction structure, and eight-feature signature. It adds no experiment, route family, production signature, or production count.
- Feature migration: no source, route, asset, feature, export, or ledger entry was deleted, retired, merged, or migrated. Existing safe/shortcut scores, cyan release, recovery, progression, and diagnostics remain intact.

## Publication

- ProtoKits: unchanged at `bb3d787da372bf001653635d6e57eb7ce54e3c50`.
- Experiments production commit: `951f105aad815320e5a02781e567899319f87a75`, published to resolved default branch `main` after fetch-before-push verification.
- Final receipt commit: this publication-receipt commit; exact final repository head is recorded in the automation run summary.
- Exact next playable improvement: turn the `anchor-11` rebound into one score-aware first-swing release toward `anchor-12`, reusing the existing route-choice score, release, tether, camera, HUD, spark, and synth owners without another state or control.
