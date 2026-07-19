# Next Ledge Score Restore Pulse

- Packet: `2026-07-19-next-ledge-score-restore-pulse`
- Date: 2026-07-19
- Status: validated, committed, and published
- Active Work Table row: completed by this bounded unit; remove and queue the exact next unit
- Experiment-game: `experiments/next-ledge/`
- Change: materially upgraded existing playable experiment

## Intent

- Player fantasy: a stormline recovery operator carries a branch score back into the original ascent.
- Hero verb: catch original `anchor-12`, read the score-colored restore pulse, then release and fire into original `anchor-13`.
- Target feeling: mint feels buoyant and forgiving; amber feels compressed and decisive.
- Pressure loop: preserve the established stamina, fall-pressure, signal-cargo, route-choice, and recovery tradeoffs.
- Objective: carry `134 SPEED` or `175 CARGO` through `anchor-12` and physically secure `anchor-13`.
- Failure/recovery: the existing fail floor, dead state, and `R` reset remain authoritative; the bounded pulse extends only the existing recovery/aim window.
- Visual identity: mint or amber player light, sparks, target line, target material, HUD copy, and synth accent inside the existing dark cyan stormline scene.
- Interaction structure: first-screen `A / D`, `SPACE / CLICK`, and `R`; optional diagnostics remain in the closed Advanced disclosure.

## Composition And Ownership

Real ProtoKit features composed:

1. generic tether motion
2. generic cable launch
3. traversal vitals
4. traversal recovery
5. traversal camera
6. traversal cue
7. traversal feedback
8. generic route-cargo extraction, with generic route progress under the existing session wrapper

Natural-language ownership audit:

- Nexus Engine Core remains read-only runtime authority; no Core file changed.
- ProtoKits remain the deterministic reusable owner for tether, launch, vitals, recovery, camera, cue, feedback, route progress, cargo, and pressure behavior.
- The experiment owns authored route descriptors, score-specific copy/tuning, browser input, Three.js presentation, local Web Audio, and the HUD.
- The existing `restored` event is extended with bounded evidence; there is no restore-pulse state, timer, control, event type, entity, material, effect pool, meter, or diagnostic owner.
- The authored `-64` mint and `-72` amber vertical target leads flow through the existing aim-assist and cable-launch path rather than a second launch path.

## Player Loop

Enter sector 2 -> read counterwind -> choose mint Shelter Rise or amber Signal Cut -> rejoin at Fork Relay -> resolve Stormlock -> collect Slipstream or Cacheline payoff -> score `134 SPEED` or `175 CARGO` at Windglass -> release into original `anchor-11` -> carry the score into original `anchor-12` -> read the branch-aware restore pulse -> release/fire -> latch original `anchor-13` -> continue generic ascent.

Both full branches reached `anchor-12`. Mint published a `36`-frame `mint-score-restored` event carrying `134 SPEED`; amber published a `26`-frame `amber-score-restored` event carrying `175 CARGO`. Both selected and physically latched original `anchor-13` through the existing cable owner. A deliberate fall reached the existing dead state, and physical keyboard `R` restored the route.

## Cleanup And Consolidation

- Kept all authored tuning under one nested safe/shortcut `rejoinRestorePulse` descriptor.
- Reused one `describeScoreRestorePulse()` event-age consumer across session, renderer, HUD, effects, and recovery.
- Reused the existing consequence line, ledge entity/materials, player material/light, spark pool, camera, HUD fields, synth, recovery owner, and cable launcher.
- Kept the consequence line readable above scene depth without adding a line or overlay.
- Added no DOM or Canvas/WebGL entity, listener, flag, route state, diagnostic surface, or standalone test file.
- Removed no source, feature, asset, route, kit, experiment, or game.
- Advanced, optional, and diagnostic controls remain closed by default; visible diagnostic layers measured `0` in the default and reopened/closed views.

## Feel Scores

| Category | Before | After |
| --- | ---: | ---: |
| Responsiveness | 9 | 9 |
| Predictability | 10 | 10 |
| Readability | 10 | 10 |
| Impact | 10 | 10 |
| Recovery | 9 | 10 |
| Delight | 10 | 10 |
| Replay desire | 10 | 10 |
| Average | 9.7 | 9.9 |

## Performance Gate

Matched sequential headless measurements compared detached starting commit `d5b3ba42d377da6744ef61cec857e5dbfb29f035` with this run's working tree. Each used a stable 30-frame warm-up followed by the same 90-frame active swing window.

| Metric | Before | After |
| --- | ---: | ---: |
| Average frame | 204.686 ms | 193.957 ms |
| Measured FPS | 4.886 | 5.156 |
| p95 frame | 304.3 ms | 284.3 ms |
| Long tasks | 90 | 89 |
| Max long task | 433 ms | 452 ms |
| DOM nodes | 69 | 69 |
| Canvas nodes | 1 | 1 |
| Active descriptors | 76 | 76 |
| Scene nodes | 236 | 236 |
| Ledge entities | 25 | 25 |
| Draw calls | 82 | 78 |
| Triangles | 8,904 | 8,756 |
| Geometries | 61 | 61 |
| Textures | 0 | 0 |

Primary average frame time improved `5.24%`; FPS improved `5.53%`; p95 improved `6.57%`. Dynamic line capacities remained bounded. Before heap checkpoints were `29.28 / 28.59 / 42.75 MB`; after checkpoints were `32.89 / 40.49 / 38.38 MB`, with no monotonic steady-state growth. The machine was concurrently saturated, so absolute FPS is environmental; the sequential matched comparison is the publication gate.

## Evidence And Validation

- Human View before: `evidence/human-view-before-first-screen.png`, `evidence/human-view-before-anchor-12.png`
- Human View final: `evidence/human-view-final-first-screen.png`, `evidence/human-view-final-mint-anchor-12-pulse.png`, `evidence/human-view-final-amber-anchor-12-pulse.png`, `evidence/human-view-final-failure.png`, `evidence/human-view-final-recovery.png`
- First screen shows purpose and hero controls with Advanced closed.
- Playwright completed safe and shortcut routes through their pulses and physical `anchor-13` latches.
- Post-cleanup Playwright replay completed the full safe route through `anchor-13` on cache-bust `score-restore-pulse-3`.
- Advanced disclosure passed closed -> open -> closed; no diagnostic layer was visible by default.
- Console result: zero errors and zero warnings.
- All 28 existing `tests/next-ledge-*.mjs` entrypoints passed.
- Affected JavaScript syntax, production JSON parsing, and `git diff --check` passed.

## Audits

- Diversity: in-place legacy refinement; fantasy, hero verb, pressure loop, interaction structure, kit signature, production signature, and all creation/lifecycle counts remain unchanged.
- Feature migration: no feature or source moved, pruned, merged, archived, or retired; `feature-migration-ledger.json` and `retirement-ledger.md` remain unchanged.
- Reusable/local boundary: no reusable deterministic behavior was missing, so ProtoKits remain unchanged; all new branch fiction and presentation stay local.
- Diagnostics: hidden by default and still available only under the labeled Advanced disclosure.

## Git

- Core read-only reference: `a5882b47bd5a9284550bb3af1f0cd8580c62665e` (unrelated pre-existing local work observed and untouched)
- ProtoKits start/final: `194d37714d7c23984970e09015b5dd4bffbbab7b` / unchanged
- Experiments run start: `d5b3ba42d377da6744ef61cec857e5dbfb29f035`
- Experiments integration base after the non-overlapping Hellscape lane published: `2b5e5eebe1c616a4a504500dce6667b2d0f59943`
- Experiments production commit: `aacb20ccc1423d0062814c1b5979c68d76002d75`
- Push: production commit published to resolved default branch `main` after fetch-before-push verification; this receipt commit records publication

## Exact Next Playable Improvement

Make original `anchor-13` close both branch results through one cyan stabilization catch and point toward original `anchor-14`, reusing the existing `anchor-locked` event, route-choice score, route progress, tether, camera, HUD, spark, and synth owners without another state or control.
