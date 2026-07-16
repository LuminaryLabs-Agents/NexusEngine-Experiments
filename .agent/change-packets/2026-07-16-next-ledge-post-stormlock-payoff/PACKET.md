# Next Ledge Post-Stormlock Payoff

Packet: `2026-07-16-next-ledge-post-stormlock-payoff`

Status: validated; publication receipt pending

Experiment: `experiments/next-ledge/`

## Intent

- Player fantasy: a stormline recovery operator who converts a deliberately chosen route into an immediate traversal advantage.
- Hero verb: build swing, release, and re-grapple; no new control is introduced.
- Target feeling: Shelter Rise pays out as a generous mint slingshot, while Signal Cut buys a smaller, riskier amber high line.
- Pressure loop: the safe path accelerates the existing cable launch and assist window; the shortcut spends existing cargo for a hard target inside a strong gust, with the existing fall-pressure failure/recovery loop still authoritative.
- Objective: read the selected post-Stormlock target, commit with the same grapple controls, receive branch-specific feedback, and secure the payoff.
- Failure and recovery: a missed line can still reach the `100%` pressure abort; visible keyboard `R` restarts the current sector cleanly.
- Visual identity: mint overcharge and a broad target for Slipstream Launch versus amber streaks and a compact target for Cacheline High.
- Interaction structure: purpose and `A / D`, `Space / Click`, and `R` remain first-screen hero controls. Pause, next-sector action, readiness detail, and diagnostics remain in the closed Advanced disclosure.
- Selected ProtoKit features: generic tether motion, cable launch, traversal vitals, traversal recovery, traversal camera, traversal cues, traversal feedback, and generic route-cargo extraction with route progress, resource, and pressure composition.
- Core relationship: NexusEngine Core remains read-only and owns runtime/kit composition contracts; no Core behavior is copied or changed.
- Ownership: reusable deterministic cable, recovery, route, cargo, and pressure behavior remains behind existing ProtoKit APIs. Authored payoff descriptors, local route-choice sequencing, browser input, Three.js, HUD, audio, and fiction remain in the experiment.

## Human View Route

- Surface: game / interactive scene.
- Primary human task: resolve Stormlock, understand which reward opened, and secure it with the existing grapple verb.
- Perspectives: player readability, objective clarity, feedback feel, camera framing, task completion, and regression player view.
- Techniques: launch-state inspection, before/after screenshots, both branch walkthroughs, failure/retry, Advanced closed/open/closed, console review, final layer inspection, and stable warm-up plus active-play performance comparison.

## Starting State

- Experiments: `c23914419b58a066e99a8cb3830cf80d99e40d69` on resolved default branch `main`.
- ProtoKits: `04d34f049f58ae359cf71d43466c429dac2a6d08` on resolved default branch `main`.
- Core local read-only: `8b57b03904889cdbc71021d3bdb1d4070af5c8d3`.

## Playable Result

- Upgraded, not new: `experiments/next-ledge/` now turns Stormlock resolution into one visible, branch-specific traversal payoff instead of returning immediately to generic ascent.
- Shelter Rise opens `slipstream-launch`: the existing cable launch receives a `1.34x` speed multiplier, `0.16` lift bonus, and stronger aim assistance until the catch lands.
- Signal Cut opens `cacheline-high`: the existing route-cargo resource facade spends `1.75` banked cargo, and the renderer exposes a smaller amber target inside a `0.94` gust field.
- Only the selected payoff is targetable or visible. Securing it resolves the existing `routeChoice` state and filters all obsolete branch anchors from aim assistance.
- The complete basic loop remains enter, understand, swing, release, fire, gain cargo, face pressure, fail or recover, choose a branch, resolve Stormlock, secure the payoff, and continue upward.

## Real ProtoKit Composition

1. `generic-tether-motion-kit`
2. `generic-cable-launch-kit`
3. `generic-traversal-vitals-kit`
4. `generic-traversal-recovery-kit`
5. `generic-traversal-camera-kit`
6. `generic-traversal-cue-kit`
7. `generic-traversal-feedback-kit`
8. `generic-route-cargo-extraction-kit`, including its existing route-progress, resource, and pressure composition

ProtoKits remained unchanged at `04d34f049f58ae359cf71d43466c429dac2a6d08` because the required deterministic APIs already existed.

## Final Integration And Cleanup

- Added authored payoff anchors and tuning to the declarative climb preset and routed them through the existing anchor adapter.
- Extended the single `routeChoice` sequence with payoff IDs and one selected target; no second branch, reward, pressure, cargo, or launch owner was added.
- Routed the shortcut cost through `deliverCargo` in the existing route-cargo facade and safe acceleration through the existing cable launch calculation.
- Reused the existing consequence line for both the Stormlock approach and selected payoff. No new visible line, DOM node, canvas, or persistent scene entity was introduced.
- Consolidated target filtering so resolved choice-owned anchors cannot become stale aim-assist candidates.
- Removed a per-frame payoff lookup object allocation and kept authored route/content data outside renderer behavior.
- Human View moved Slipstream Launch from behind the hero into a central readable mint window.
- Human View also caught foreground WebGL geometry compositing over HUD glyphs after resolution. Cleanup moved the GPU transform to the canvas and removed it from the UI layer; the final sector-two screenshot keeps all HUD and Advanced text readable.
- Diagnostics remain off by default. Playwright proved closed, open, then closed, and the final screenshot has the disclosure closed.

## Feel Scores

Scores are for the bounded post-Stormlock payoff, not a rescore of the entire game.

| Dimension | Before | After |
| --- | ---: | ---: |
| Responsiveness | 9 | 10 |
| Predictability | 7 | 9 |
| Readability | 7 | 10 |
| Impact | 7 | 9 |
| Recovery | 9 | 9 |
| Delight | 8 | 9 |
| Replay desire | 8 | 10 |
| Average | 7.9 | 9.4 |

## Performance Gate

Matched sample: `950 ms` stable warm-up followed by a `3.4 s` active `D` input window.

| Metric | Before | After |
| --- | ---: | ---: |
| Average frame time | `34.33 ms` | `34.85 ms` |
| FPS | `29.13` | `28.69` |
| p95 frame time | `50.00 ms` | `50.10 ms` |
| Long tasks observed | `1` | `1` |
| DOM / canvas / descriptors | `69 / 1 / 72` | `69 / 1 / 72` |
| Scene nodes / ledges | `236 / 25` | `236 / 25` |
| Heap start / end | `25.50 / 50.69 MB` | `63.46 / 35.35 MB` |

- Primary metric: FPS changed by `-1.5%`, within the `10%` budget; p95 and long-task count remained effectively unchanged.
- Heap is a volatile browser signal and is recorded without claiming a memory improvement.
- The active sector-two post-effects state remained fixed across three settled samples at `272` scene nodes, `31` ledges, `77` descriptors, `69` DOM nodes, and one canvas. Dynamic route/consequence line capacities remained `27 / 2`, so no unbounded steady-state growth or duplicated visible entity was observed.

## Human View And Playwright Evidence

- Prior generic state: `evidence/human-view-before-stormlock-resolved.png` shows Stormlock returning to an undifferentiated continuation before this unit.
- Safe payoff: `evidence/human-view-after-safe-payoff-open.png` proves mint objective copy, selected target, connection line, and diagnostics closed after the target-position correction.
- Shortcut payoff: `evidence/human-view-after-shortcut-payoff-open.png` proves the compact amber high line, cargo-funded unlock copy, strong gust presentation, and diagnostics closed.
- Failure: `evidence/human-view-failure-state.png` proves the readable `100%` pressure abort and visible retry action.
- Final layer-safe view: `evidence/human-view-final-layer-safe.png` proves hero controls, resources, Advanced label, and objective remain readable above foreground WebGL geometry with diagnostics closed.
- Playwright physically traversed both sector-two branches through public session input. The safe catch emitted `post-stormlock-launch-window-fired` with `speedMultiplier: 1.34` and `liftBonus: 0.16`; the shortcut spent `1.75` cargo, required two launches to secure the smaller high line, and resolved with no stale enabled choice target.
- A real failed release reached `mode: dead` in `121` simulation ticks; keyboard `R` restored `mode: swinging`, `alive: true`, and `currentAnchorId: anchor-0`.
- Final console: `0` errors and `0` warnings; the visible error panel remained hidden.

## Validation

- All `28` existing `tests/next-ledge*.mjs` entrypoints passed.
- All `experiments/next-ledge/src/*.js` files passed `node --check`; `git diff --check` passed.
- Both payoff branches, failure/retry, final cleanup replay, Advanced disclosure, stable counts, performance, Human View screenshots, and console/error surfaces were checked in a real headed browser.

## Audits

- Ownership: Core stayed read-only. ProtoKits retain deterministic tether, cable, recovery, route, resource, cargo, and pressure ownership. The experiment owns authored payoff content/tuning, bounded route-choice sequencing, browser input, Three.js, HUD, audio, and fiction.
- Diversity: this is an in-place refinement of the existing stormline fantasy, hero verb, pressure loop, interaction structure, and eight-feature signature. It creates no experiment, route family, production signature, or production count.
- Feature migration: no source, asset, route, kit, readiness layer, or environmental system was deleted or retired. `feature-migration-ledger.json` and `retirement-ledger.md` correctly remain unchanged.

## Publication

- Production commit: `PENDING_THIS_COMMIT`.
- ProtoKits push: not required; `main`, `HEAD`, and `origin/main` remain synchronized at `04d34f049f58ae359cf71d43466c429dac2a6d08`.
- Experiments push: pending fetch-before-push verification.

## Exact Next Playable Improvement

Add one Windglass Relay convergence beat that scores preserved speed from Slipstream Launch versus elevated cargo mastery from Cacheline High before generic ascent resumes, without adding a control or another state owner.
