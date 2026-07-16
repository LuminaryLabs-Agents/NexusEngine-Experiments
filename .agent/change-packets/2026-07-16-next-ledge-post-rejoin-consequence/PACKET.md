# Next Ledge Post-Rejoin Consequence

Packet: `2026-07-16-next-ledge-post-rejoin-consequence`

Status: validated and published

Experiment: `experiments/next-ledge/`

## Intent

- Player fantasy: a stormline recovery operator whose route choice has a tangible consequence after both lines rejoin.
- Hero verb: build swing, release, and re-grapple; no new control is introduced.
- Target feeling: Shelter Rise feels like earned protection for one risky catch, while Signal Cut feels lucrative but visibly unresolved until the climber deliberately vents retained pressure.
- Pressure loop: the safe line grants one protected grapple window; the shortcut retains fall pressure through Fork Relay and demands a readable vent opportunity before stabilization.
- Objective: survive the first post-rejoin restore and convert the chosen branch consequence into a clear recovery state.
- Failure and recovery: the existing fall-pressure abort and retry remain authoritative; a missed catch must still fail and recover cleanly.
- Visual identity: mint protection language for Shelter Rise versus amber retained-pressure and vent language for Signal Cut, with one readable owner per signal.
- Interaction structure: first-screen hero controls stay unchanged; pause, next-sector action, readiness details, and diagnostics remain in the closed Advanced disclosure.
- Selected ProtoKit features: generic tether motion, cable launch, traversal vitals, traversal recovery, traversal camera, traversal cues, traversal feedback, and generic route-cargo extraction with route progress, resource, and pressure composition.
- Core relationship: NexusEngine Core remains read-only and owns runtime/kit composition contracts; no Core behavior is copied or changed.
- Ownership: reusable deterministic route, cargo, pressure, recovery, cue, and feedback behavior remains behind existing ProtoKit APIs. Authored anchors, branch tuning, browser input, Three.js presentation, HUD, audio, and player-facing copy remain local to the experiment.

## Human View Route

- Surface: game / interactive scene.
- Primary human task: choose a route, rejoin at Fork Relay, understand the carried consequence, and complete its first recovery demand using the existing grapple controls.
- Perspectives: player readability, objective clarity, feedback/feel, camera framing, task completion, and regression player view.
- Techniques: launch-state inspection, before/after screenshots, actual keyboard/mouse interaction, both branch walkthroughs, failure/retry, Advanced closed/open/closed, console review, and matched warm-up plus active-play performance comparison.

## Starting State

- Experiments: `87e3a1b10d1bba9d21b520b5b8f316f365a3050d` on resolved default branch `main`.
- ProtoKits: `04d34f049f58ae359cf71d43466c429dac2a6d08` on resolved default branch `main`.
- Core local read-only: `8b57b03904889cdbc71021d3bdb1d4070af5c8d3`.

## Playable Result

- Upgraded, not new: `experiments/next-ledge/` now carries the sector-two branch choice beyond Fork Relay instead of erasing its meaning at the rejoin.
- Shelter Rise grants exactly one protected grapple to Stormlock Restore by extending the existing aim-assist and fail-floor recovery tuning.
- Signal Cut retains 45 fall pressure after Fork Relay and exposes one amber Stormlock vent demand; locking Stormlock routes a `100` recovery through the existing pressure facade and returns pressure to `0`.
- The unchanged basic loop is enter, read the stormline objective, swing, release, fire, recover or fail, choose a route, face its consequence, and resolve it at Stormlock. A real failed shortcut attempt reached the dead state at `100` pressure and keyboard `R` restored a live zero-pressure climb.

## Real ProtoKit Composition

1. `generic-tether-motion-kit`
2. `generic-cable-launch-kit`
3. `generic-traversal-vitals-kit`
4. `generic-traversal-recovery-kit`
5. `generic-traversal-camera-kit`
6. `generic-traversal-cue-kit`
7. `generic-traversal-feedback-kit`
8. `generic-route-cargo-extraction-kit`, including its existing route-progress, resource, and pressure composition

ProtoKits remained unchanged at `04d34f049f58ae359cf71d43466c429dac2a6d08`.

## Final Integration And Cleanup

- Moved Stormlock content and tuning into the authored climb preset and mapped it through the existing route adapter.
- Extended the single `routeChoice` owner with a bounded consequence state; no parallel branch, pressure, recovery, or event store was added.
- Routed the shortcut vent through the existing route-cargo pressure recovery command rather than mutating pressure locally.
- Reused the existing recovery, aim-assist, fail-floor, cue, effects, audio, HUD, camera, and renderer paths. The renderer adds one bounded two-point consequence line and one owned/disposed beacon material.
- Hid the obsolete fork branches once the consequence begins. Stormlock is the only target, HUD prompt, beam, and consequence line owner for the active signal.
- Advanced controls and diagnostic layers are closed by default. Playwright proved closed, open, then closed; the final player screenshots have diagnostics closed.

## Feel Scores

Scores are for the bounded post-rejoin consequence, not a rescore of the entire game.

| Dimension | Before | After |
| --- | ---: | ---: |
| Responsiveness | 9 | 9 |
| Predictability | 7 | 9 |
| Readability | 7 | 10 |
| Impact | 7 | 9 |
| Recovery | 8 | 10 |
| Delight | 8 | 9 |
| Replay desire | 8 | 10 |
| Average | 7.7 | 9.4 |

## Performance Gate

Matched fresh-browser sample: `950 ms` warm-up followed by a `3.4 s` active keyboard window.

| Metric | Before | After |
| --- | ---: | ---: |
| Average frame time | `60.46 ms` | `29.45 ms` |
| FPS | `16.54` | `33.96` |
| p95 frame time | `82.50 ms` | `34.30 ms` |
| Long tasks observed | `0` | `0` |
| DOM / canvas / descriptors | `69 / 1 / 72` | `69 / 1 / 72` |
| Scene nodes / ledges | `235 / 25` | `236 / 25` |
| Heap start / end | `20.72 / 25.97 MB` | `27.04 / 54.27 MB` |

- Primary metric: FPS improved `105.3%`; p95 frame time improved `58.4%`.
- The heap signal includes fresh-browser compilation/allocation and is recorded without claiming a memory improvement.
- A post-effects sector-two sample remained fixed across repeated active samples at `272` scene nodes, `31` ledges, `77` descriptors, `69` DOM nodes, and one canvas. Dynamic line capacities also remained fixed, so no steady-state entity or descriptor growth was observed.

## Human View And Playwright Evidence

- First screen: `evidence/human-view-final-first-screen.png` proves immediate purpose and hero controls with diagnostics closed.
- Safe consequence: `evidence/human-view-after-safe-window.png` and `evidence/human-view-after-safe-resolved.png` prove the mint protected catch and its consumption.
- Shortcut consequence: `evidence/human-view-final-shortcut-vent-demand.png` and `evidence/human-view-final-shortcut-vented.png` prove retained pressure, the amber target, deliberate vent, and resolved state.
- Before references: `evidence/human-view-before-first-screen.png` and `evidence/human-view-before-shortcut-rejoin.png` show the prior generic post-rejoin state.
- Playwright physically traversed Counterwind Gate, Leeward Cradle, Reverse Catch, Counterwind Rest, Shelter Rise or Signal Cut, Fork Relay, and Stormlock Restore through public session input. The final cleanup replay resolved the shortcut at frame `462` with `post-rejoin-pressure-vented` and `routeChoice.status = resolved`.
- The safe replay aimed `48` world units off target, magnetized only because of the earned protection, then emitted `post-rejoin-protected-grapple-consumed`.
- Final console: `0` errors and `0` warnings.

## Validation

- All `28` existing `tests/next-ledge*.mjs` entrypoints passed.
- Changed JavaScript passed `node --check`; `git diff --check` passed.
- Both branches, failure/retry, the final shortcut cleanup replay, Advanced disclosure, stable counts, fresh-browser performance, screenshots, and console were checked in a real browser.

## Audits

- Ownership: Core stayed read-only. ProtoKits retain deterministic tether, recovery, cue, feedback, route, resource, cargo, and pressure ownership. The experiment owns authored anchors/tuning, the existing route-choice state, browser input, Three.js, HUD, audio, and fiction.
- Diversity: this is an in-place refinement of the existing stormline fantasy and eight-feature signature. It creates no experiment, route family, production signature, or production count.
- Feature migration: no source, asset, route, kit, or preserved readiness layer was deleted or retired. No migration or retirement ledger count changes are warranted.

## Publication

- Production commit: `a9c1a94570100cf9f6a640dfbafe44f7de713a2e`.
- ProtoKits push: not required; `main`, `HEAD`, and `origin/main` remained clean and synchronized at `04d34f049f58ae359cf71d43466c429dac2a6d08`.
- Experiments push: production commit published to `origin/main` after a second fetch proved the remote still matched the starting commit.

## Exact Next Playable Improvement

Turn Stormlock resolution into one immediate payoff anchor: the safe branch converts protection into a faster launch window while the shortcut converts banked cargo into a harder amber high line, without adding a control or another state owner.
