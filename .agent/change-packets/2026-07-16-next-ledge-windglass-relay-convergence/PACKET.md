# Next Ledge Windglass Relay Convergence

Packet: `2026-07-16-next-ledge-windglass-relay-convergence`

Status: validated and published

Experiment: `experiments/next-ledge/`

## Intent

- Player fantasy: a stormline recovery operator proves that either a fast shelter line or a cargo-funded high line can carry mastery into one shared relay.
- Hero verb: build swing, release, aim, and re-grapple; no control is added.
- Target feeling: Slipstream Launch preserves mint velocity, Cacheline High preserves amber cargo mastery, and Windglass Relay turns either branch into a crisp scored catch.
- Pressure loop: the safe line carries launch tempo while the shortcut carries its harder target and gust; existing fall pressure, failure, and retry remain authoritative.
- Objective: secure the selected payoff, read the branch score, catch Windglass Relay, then continue through the original generic ascent.
- Failure and recovery: a missed catch can still reach the fail floor; visible keyboard `R` restarts the sector cleanly.
- Visual identity: mint or amber approach lines converge on one bright cyan-white Windglass beam with branch-specific score copy and a shared impact cadence.
- Interaction structure: purpose and `A / D`, `Space / Click`, and `R` remain first-screen hero controls. Pause, next-sector action, readiness detail, and diagnostics remain in the closed Advanced disclosure.
- Selected ProtoKit features: generic tether motion, cable launch, traversal vitals, traversal recovery, traversal camera, traversal cues, traversal feedback, and generic route-cargo extraction with route progress, resource, and pressure composition.
- Core relationship: NexusEngine Core remains read-only and owns runtime/kit composition contracts; no Core behavior is copied or changed.
- Ownership: reusable deterministic cable, recovery, route, cargo, and pressure behavior remains behind existing ProtoKit APIs. Authored convergence content, bounded route-choice sequencing, browser input, Three.js, HUD, audio, and fiction remain local to the experiment.

## Human View Route

- Surface: game / interactive scene.
- Primary human task: understand the branch score, secure Windglass Relay, and recognize that generic ascent has resumed.
- Perspectives: player readability, objective clarity, feedback feel, camera framing, task completion, and regression player view.
- Techniques: launch inspection, before/after screenshots, safe and shortcut walkthroughs, failure/retry, Advanced closed/open/closed, console review, and stable warm-up plus active-play performance comparison.

## Starting State

- Experiments: `f7a1515461803354d63921462b83183ee8f23a4b` on resolved default branch `main`.
- ProtoKits: `04d34f049f58ae359cf71d43466c429dac2a6d08` on resolved default branch `main`.
- Core local read-only: `8b57b03904889cdbc71021d3bdb1d4070af5c8d3`.

## Playable Result

- Upgraded, not new: `experiments/next-ledge/` now carries both post-Stormlock rewards into one visible convergence catch instead of resolving directly into generic ascent.
- Slipstream Launch records its existing `1.34x` launch window as `134` preserved speed. Cacheline High records its existing `1.75` cargo requirement as `175` cargo mastery.
- Catching either payoff opens `windglass-relay`; catching Windglass records one `convergenceScore`, publishes one semantic score event, and restores the original `anchor-11` continuation.
- The original generic anchor is preserved by insertion and reindexing rather than overwritten. Only the current payoff or convergence target is visible and targetable.
- The complete basic loop remains enter, understand, swing, release, fire, gain cargo, face pressure, fail or recover, choose a branch, resolve Stormlock, secure a payoff, score Windglass, and continue upward.

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

- Added score and convergence descriptors to the declarative climb preset; the route adapter now has one shared descriptor-mapping helper instead of repeating branch, payoff, and convergence metadata assembly.
- Inserted Windglass without replacing the original generic anchor, then reindexed the route once. No stale one-scene duplicate or route fork remains.
- Extended the existing `routeChoice` sequence with score and convergence fields; no second branch, score, pressure, cargo, or launch state owner was added.
- Reused the existing bounded consequence line and existing renderer groups. Windglass adds one authored ledge and beam, not a DOM overlay, canvas, or persistent debug entity.
- Routed all score presentation through semantic `windglass-relay-opened` and `windglass-relay-scored` events consumed by HUD, audio, and diegetic effects.
- Diagnostics remain off by default. Playwright proved closed, open, then closed, and every final screenshot has the disclosure closed.

## Feel Scores

Scores are for the bounded convergence beat; the before score is the published post-Stormlock payoff baseline.

| Dimension | Before | After |
| --- | ---: | ---: |
| Responsiveness | 10 | 10 |
| Predictability | 9 | 10 |
| Readability | 10 | 10 |
| Impact | 9 | 9 |
| Recovery | 9 | 9 |
| Delight | 9 | 10 |
| Replay desire | 10 | 10 |
| Average | 9.4 | 9.7 |

## Performance Gate

Matched sample: `950 ms` stable warm-up followed by a `3.4 s` active `D` input window at `1440x900`.

| Metric | Before | After |
| --- | ---: | ---: |
| Samples | `106` | `103` |
| Average frame time | `32.39 ms` | `33.24 ms` |
| FPS | `30.87` | `30.08` |
| p95 frame time | `50.00 ms` | `50.00 ms` |
| Long tasks observed | `0` | `0` |
| DOM / canvas / descriptors | `69 / 1 / 72` | `69 / 1 / 72` |
| Scene nodes / ledges | `236 / 25` | `236 / 25` |
| Draw calls / triangles | `66 / 10,820` | `68 / 10,884` |
| Point-in-time heap | `39.48 MB` | `26.71 MB` |

- Primary metric: FPS changed by `-2.6%`, within the `10%` budget; p95 and long-task count were unchanged.
- Heap is a volatile browser signal and is recorded without claiming a memory improvement.
- Three active sector-two samples remained fixed at `277` scene nodes, `32` ledges, `76` descriptors, `69` DOM nodes, and one canvas. Dynamic capacities remained `route 27`, `safe 3`, `shortcut 3`, and `consequence 3`; draw calls varied `78 / 80 / 76` with transient effects, while entity counts did not grow.

## Human View And Playwright Evidence

- Baseline first screen: `evidence/human-view-before-first-screen.png`.
- Final first screen: `evidence/human-view-first-screen-final.png` proves purpose, hero controls, resources, and the closed Advanced disclosure remain readable without debug layers.
- Safe score open: `evidence/human-view-safe-convergence-open.png` proves the `134` preserved-speed objective, bright shared target, and diagnostics closed.
- Safe score resolved: `evidence/human-view-safe-convergence-scored.png` proves the score confirmation and original generic ascent continuation.
- Shortcut score open: `evidence/human-view-shortcut-convergence-open.png` proves the `175` cargo-mastery objective, amber-to-Windglass handoff, and diagnostics closed.
- Playwright traversed the entire safe sector-two branch through public grapple input, caught Windglass with `convergenceScore: { metric: "preserved-speed", value: 134 }`, then caught the preserved original `anchor-11` with `anchor-12` enabled next.
- Playwright traversed the shortcut through Cacheline High via public grapple input and exposed `scoreMetric: "cargo-mastery"` with `scoreValue: 175`; the smaller high line still needed a second launch, which is recorded as the exact next feel problem.
- A real keyboard release reached `mode: dead`, `alive: false`, and the sector fail floor; keyboard `R` restored `mode: swinging`, `alive: true`, and `currentAnchorId: anchor-0`.
- Advanced disclosure passed closed/open/closed with one canvas and `69` DOM nodes. Final console review reported zero errors and zero warnings.

## Validation

- All `28` existing `tests/next-ledge*.mjs` entrypoints passed.
- All `experiments/next-ledge/src/*.js` files passed `node --check`; `git diff --check` passed.
- Safe convergence, shortcut score exposure, failure/retry, cleanup replay, Advanced disclosure, stable counts, performance, Human View screenshots, and console/error surfaces were checked in a real headed browser.

## Audits

- Ownership: Core stayed read-only. ProtoKits retain deterministic tether, cable, recovery, route, resource, cargo, and pressure ownership. The experiment owns authored score/convergence content, bounded route-choice sequencing, browser input, Three.js, HUD, audio, and fiction.
- Diversity: this is an in-place refinement of the existing stormline fantasy, hero verb, pressure loop, interaction structure, and eight-feature signature. It creates no experiment, route family, production signature, or production count.
- Feature migration: no source, asset, route, kit, readiness layer, or environmental system was deleted or retired. `feature-migration-ledger.json` and `retirement-ledger.md` correctly remain unchanged.

## Publication

- Production commit: `8d439d38e45c71ae3c110a681364c4c762fa5607`.
- ProtoKits push: not required; `main`, `HEAD`, and `origin/main` remain synchronized at `04d34f049f58ae359cf71d43466c429dac2a6d08`.
- Experiments push: production commit published to `origin/main` after a second fetch proved the remote still matched the starting commit.

## Exact Next Playable Improvement

Retune Cacheline High's approach framing and aim assistance so the `175`-cargo shortcut clears in one readable launch while remaining visibly harder than Slipstream Launch.
