# Next Ledge Score-Carry Release

Packet ID: `2026-07-19-next-ledge-score-carry-release`
Automation: `nexus-engine-game-production-builder`
Date: 2026-07-19
Status: validated and published; publication receipt pending

## Intent

- Player fantasy: a stormline recovery operator carries the route they mastered into the restored generic ascent.
- Hero verb: build one scored rebound at original `anchor-11`, release in the branch-colored band, then fire into original `anchor-12`.
- Target feeling: earned, branch-specific, readable, and physically decisive.
- Pressure loop: stamina, fall pressure, carried signal cargo, release timing, miss/re-grapple recovery, and rest-anchor recovery.
- Objective: preserve `134 SPEED` from Shelter Rise or `175 CARGO` from Signal Cut through the first generic swing and secure `anchor-12`.
- Failure/recovery: the existing fall floor, retry command, recovery anchor, and midair cable path remain authoritative.
- Visual identity: mint lift for safe mastery, amber drive for shortcut mastery, cyan route geometry, and one highlighted original restore node.
- Interaction structure: `A/D` builds, `Space/click` releases and fires, and `R` retries; Advanced controls and diagnostics remain closed by default.

## Result

Next Ledge now carries the branch score through the first generic swing after original `anchor-11`. The safe route authors a mint `134 SPEED` release with stronger lift and lateral control. The shortcut authors a faster amber `175 CARGO` drive. Both reuse the original `anchor-12` entity, consequence line, release command, semantic event stream, camera, HUD, effects, atmosphere, and synth.

The release event now records target, score metric, and score value as evidence. It does not become a new state owner. Readiness is derived from resolved route choice, existing secured/released event order, existing swing angle, and existing angular velocity.

## Real ProtoKits And Features

1. `generic-tether-motion-kit` — authoritative swing angle, angular velocity, release motion, and tether behavior.
2. `generic-cable-launch-kit` — grapple launch, aim assistance, and original-anchor catch.
3. `generic-traversal-vitals-kit` — stamina and pressure-facing traversal state.
4. `generic-traversal-recovery-kit` — fall floor, miss recovery, retry, and rest-anchor recovery.
5. `generic-traversal-camera-kit` — target framing and bounded release impact.
6. `generic-traversal-cue-kit` — branch-colored release readiness and action copy.
7. `generic-traversal-feedback-kit` — semantic release/catch feedback consumed by presentation.
8. `generic-route-cargo-extraction-kit` — the route cargo and pressure values that make the two branches materially different.

Nexus Engine Core remained read-only at `a5882b47bd5a9284550bb3af1f0cd8580c62665e`. No Core behavior was copied. ProtoKits remained unchanged at `194d37714d7c23984970e09015b5dd4bffbbab7b`; the required deterministic surfaces already existed.

## Ownership And Cleanup Audit

- Authored readiness, motion, color, camera response, and copy live under one nested safe/shortcut route descriptor.
- The climb adapter is the sole cue derivation path and reads existing event order instead of adding score-carry state or a timer.
- The session release command remains the only deterministic motion mutation and extends the existing `released` event only with evidence.
- The renderer reuses the existing consequence line, original target entity, target materials, camera owner, and one canvas.
- The HUD reuses existing purpose, objective, status, hero prompt, and default-closed Advanced disclosure. Human View caught duplicate committed-release copy; cleanup separated score confirmation from the immediate anchor-12 action.
- Diegetic effects and synth reuse existing player light, atmosphere, spark, and audio owners. No effect pool, material family, listener, or event type was added.
- Cache-bust tags were advanced once to `score-carry-release-1`; no stale parallel module path remains.
- Run-owned debug code and diagnostic overlays: none. Advanced opened and closed by real click, and the final view is closed.

## Feel Score

| Dimension | Before | After |
| --- | ---: | ---: |
| Responsiveness | 9 | 9 |
| Predictability | 9 | 10 |
| Readability | 10 | 10 |
| Impact | 10 | 10 |
| Recovery | 9 | 9 |
| Delight | 9 | 10 |
| Replay desire | 9 | 10 |
| Average | 9.3 | 9.7 |

The gain comes from a visible causal chain between the banked route score, a route-colored release band, a branch-specific impulse, and one original target. Both lines remain worth replaying because the mint release floats while the amber release drives.

## Playwright And Human View

Human View question: Does the preserved `134 SPEED` or `175 CARGO` visibly cause one clear, branch-colored release into original `anchor-12`, while the objective, hero controls, and target remain readable with diagnostics closed?

Answer after edit loop: yes.

- Safe route completed through Shelter Rise, Fork Relay, Stormlock, Slipstream, Windglass, original `anchor-11`, mint score-carry release, and original `anchor-12`. The final release event recorded `mint-score-carry`, target `anchor-12`, metric `preserved-speed`, value `134`, velocity `1.12`, lateral `0.86`, and lift `0.56`.
- Shortcut route completed through Signal Cut with `46%` pressure, Fork Relay, the four-pulse Stormlock vent, Cacheline, Windglass, original `anchor-11`, amber score drive, and original `anchor-12`. The final release event recorded `amber-score-drive`, target `anchor-12`, metric `cargo-mastery`, value `175`, velocity `1.18`, lateral `1.02`, and lift `0.26`.
- A real `Space` interaction exercised release input. Post-cleanup deterministic Playwright intake replayed the complete safe loop and locked `anchor-12` with the score still `134`.
- A deliberate fall reached the existing failure state; physical `R` returned the player to a live recovery anchor.
- Advanced controls and diagnostics passed closed/open/closed by real click. Final `details.open` is false, visible debug panels are zero, and canvas count is one.
- Console result: zero errors and zero warnings. Error panel remained hidden.

Evidence:

- `evidence/human-view-before-first-screen.png`
- `evidence/human-view-before-score-carry-safe.png`
- `evidence/human-view-final-first-screen.png`
- `evidence/human-view-final-mint-build.png`
- `evidence/human-view-final-mint-ready.png`
- `evidence/human-view-final-mint-release.png`
- `evidence/human-view-final-mint-anchor-12.png`
- `evidence/human-view-final-amber-build.png`
- `evidence/human-view-final-amber-ready.png`
- `evidence/human-view-final-amber-release.png`
- `evidence/human-view-final-amber-anchor-12.png`
- `evidence/human-view-final-failure.png`

## Performance Gate

The matched starting-commit and working-tree samples used the same headed Playwright browser, sector-two restart, `30` warm-up animation frames, and `90` active animation frames under the same machine load. Concurrent macOS replay capture throttled both builds, so only the paired delta is used for the gate.

| Metric | Starting commit | Working tree | Delta |
| --- | ---: | ---: | ---: |
| Average frame time | 93.388 ms | 93.846 ms | +0.49% |
| Measured FPS | 10.708 | 10.656 | -0.49% |
| p95 frame time | 131.3 ms | 133.3 ms | +1.52% |
| Long-task samples | 118 | 119 | +1 sample |
| DOM elements | 69 | 69 | 0 |
| Canvas elements | 1 | 1 | 0 |
| Renderer descriptors | 76 | 76 | 0 |
| Scene nodes | 277 | 277 | 0 |
| Ledge entities | 32 | 32 | 0 |

The primary runtime metric is inside the `10%` budget. Draw calls, geometry-dependent counts, and triangles varied only with the same live rope/trajectory visibility and returned to the same paired sample values. Three additional `60`-frame active checkpoints held `69` DOM nodes, one canvas, `76` descriptors, `277` scene nodes, `32` ledges, and `55` geometries. Heap warmed from `33.58 MB` to `38.40 MB` and then stabilized at `38.46 MB`; there was no steady-state growth or duplicated visible entity.

## Validation

- All `28` existing `tests/next-ledge*.mjs` entrypoints pass.
- Affected JavaScript syntax passes `node --check`.
- Production JSON parses.
- `git diff --check` passes.
- Playwright console: `0` errors, `0` warnings.
- Final runtime: original `anchor-12`, swinging, safe score `134`, error panel hidden, one canvas, diagnostics closed.

## Diversity And Migration Audit

- Diversity: in-place legacy refinement only. It adds no kit, experiment, route family, production signature, or production count. The signature remains the same eight-feature stormline grapple composition and is distinct from the Hellscape action-defense/extraction loop and Signal Bastion command-defense loop.
- Feature migration: no source is pruned, retired, moved, or superseded. The original `anchor-11`, `anchor-12`, route choice, recovery, release, HUD, renderer, effects, and audio features remain live. `feature-migration-ledger.json` and `retirement-ledger.md` therefore remain unchanged.

## Publication

- Experiments start: `1b9108958f02b29db7bb97f4a8ff0edb0351cc41`
- ProtoKits start/final: `194d37714d7c23984970e09015b5dd4bffbbab7b`
- Core read-only reference: `a5882b47bd5a9284550bb3af1f0cd8580c62665e`
- Experiments production commit: `45b1f007e4df39855e59592c810fc29ff3f11f47`, published to resolved default branch `main`
- Experiments publication receipt: this follow-up repository commit

## Exact Next Playable Unit

Make original `anchor-12` acknowledge `134 SPEED` versus `175 CARGO` through one branch-aware restore pulse and point the first generic swing toward `anchor-13`, reusing the existing `restored` event, route-choice score, recovery, camera, HUD, spark, and synth owners without another state or control.
