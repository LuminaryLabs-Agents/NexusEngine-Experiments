# Next Ledge Stormlock Confirmation Beat Refinement

- Packet: `2026-07-16-next-ledge-stormlock-confirmation-beat-refinement`
- Run type: bounded active-legacy experiment feel refinement
- Starting Experiments commit: `56333afcbb34d1876aaf06bbc5dc6e4a6ab77647`
- Starting / final ProtoKits commit: `04d34f049f58ae359cf71d43466c429dac2a6d08` (unchanged)
- Read-only Core commit: `70cc2a1590677b872d40a42f7b7bb7e174941eb0`
- Production commit: `5170655bafd7e5c2d31b7082c09cae8dfaac62cc`
- Publication receipt: recorded by the follow-up repository commit

## Intent

- Player fantasy: stormline recovery operator stabilizing a broken summit relay.
- Hero verb: build swing, release, and re-grapple.
- Target feeling: the Stormlock result lands clearly before the next branch reward asks for action.
- Pressure loop: safe protection versus retained fall pressure and banked cargo.
- Objective: secure Stormlock, read the confirmed branch result, then continue through Slipstream or Cacheline to Windglass.
- Failure / recovery: the existing fall floor, protected safe catch, missed-shot recovery, and `R` retry remain authoritative.
- Visual identity: cyan rescue geometry, mint protection, amber pressure/cargo, signal particles, and dark industrial cliff.
- Interaction structure: continuous action canvas with `A / D`, release/fire, and retry as hero controls; optional diagnostics remain under one closed Advanced disclosure.
- Reusable-vs-local ownership: no new ProtoKit was justified. The branch-specific presentation cadence and copy are local route descriptors; deterministic timing reuses the experiment's existing route-choice frame and phase. Core and reusable kit behavior remain unchanged.

## Real Kit Composition

The playable route continues to import and exercise these real NexusEngine-ProtoKits features:

1. `generic-tether-motion-kit`
2. `generic-cable-launch-kit`
3. `generic-traversal-vitals-kit`
4. `generic-traversal-recovery-kit`
5. `generic-traversal-camera-kit`
6. `generic-traversal-cue-kit`
7. `generic-traversal-feedback-kit`
8. `generic-route-cargo-extraction-kit`

## Playable Change

- Stormlock lock now enters `confirmation-active` for `24` descriptor-authored route frames.
- Shortcut copy holds the zero-pressure result while Cacheline accepts the banked cargo; safe copy holds the protected-catch result while Slipstream charges.
- The selected payoff stays hidden and action input is ignored only during the bounded confirmation.
- At the exact end frame, the original `post-stormlock-payoff-opened` event fires once and the original payoff/cargo logic resumes.
- The existing Stormlock target, branch material, beam, camera frame, HUD, route-choice object, and frame counter present the beat; no second line, timer, target, meter, input, or DOM entity was added.

## Player Loop Proof

- Shortcut: Counterwind opening -> Signal Cut -> Fork Relay -> four-pulse Stormlock vent -> `ZERO PRESSURE` confirmation -> Cacheline High -> Windglass `175` cargo mastery -> original `anchor-11` rejoin.
- Safe: Counterwind opening -> Shelter Rise -> Fork Relay -> Stormlock protected catch -> `STORMLOCK STABLE` confirmation -> Slipstream Launch -> Windglass `134` preserved speed -> original `anchor-11` rejoin.
- Boundary proof: frame `531` remained confirmation-active with zero payoff events; frame `532` opened the selected payoff with exactly one event. Action at frame `509` left the player swinging and did not skip the beat.
- Failure / recovery: an intentional missed release reached `dead`; a real Playwright keyboard `R` input restored `anchor-0`, swinging mode, and the authored retry status.

## Human View

Route packet:

- Surface: interactive browser game.
- Primary task: recognize the secured Stormlock result, then understand the next branch payoff.
- Perspectives: player readability, objective clarity, feedback feel, camera framing, task completion, regression, diagnostics disclosure, and performance.
- Techniques: launch inspection, before/after screenshots, safe and shortcut walkthroughs, failure/retry, Advanced closed/open/closed, console review, stable-count sampling, and matched active-play timing.

Evidence:

- `evidence/human-view-before-first-screen.png`
- `evidence/human-view-before-stormlock-secured.png`
- `evidence/human-view-final-first-screen.png`
- `evidence/human-view-final-shortcut-confirmation.png`
- `evidence/human-view-final-safe-confirmation.png`

The before Stormlock view immediately replaced the secured result with Cacheline instructions. Both final branch views keep one readable confirmation owner, the authoritative pressure meter, hero controls, and immediate purpose visible while Advanced remains closed.

## Feel Score

| Category | Before | After |
| --- | ---: | ---: |
| Responsiveness | 9 | 9 |
| Predictability | 7 | 9 |
| Readability | 6 | 9 |
| Impact | 6 | 9 |
| Recovery | 8 | 8 |
| Delight | 6 | 9 |
| Replay desire | 7 | 9 |
| Average | 7.0 | 8.9 |

## Final Integration, Cleanup, and Performance

- Consolidated HUD descriptor lookup behind one confirmation-target helper.
- Kept authored timing/copy in the climb preset and adapter; kept deterministic sequence behavior in the existing route-choice state; kept browser input, Three.js rendering, HUD, and cache-busting local.
- Deferred the original payoff event instead of creating a parallel cargo or launch path.
- Removed run-generated Playwright snapshot debris. No run-owned dead flag, duplicate listener, duplicate state, duplicate visible entity, stale style, or debug overlay remains.
- Diagnostics are unchanged, explicitly labeled, closed by default, and verified closed/open/closed. Default view remains `69` DOM nodes and one canvas.

Matched isolated Chromium runs used the starting commit archive and working tree at `1440x900`, with a `950 ms` warm-up plus `3.4 s` held-`D` active-play window:

| Metric | Before | After |
| --- | ---: | ---: |
| Samples | 98 | 100 |
| Average frame time | 34.77 ms | 34.14 ms |
| FPS | 28.76 | 29.29 |
| p95 frame time | 51.8 ms | 51.8 ms |
| Long tasks | 5 / 412 ms | 2 / 289 ms |
| DOM / canvas | 69 / 1 | 69 / 1 |
| Descriptors / scene nodes | 72 / 236 | 72 / 236 |
| Geometries / draw calls / triangles | 56 / 72 / 11,336 | 56 / 67 / 10,844 |
| JS heap signal | 26.91 MB | 30.94 MB |

Primary FPS improved `1.86%`; p95 and structural counts held. Five later after-state samples kept DOM `69`, canvas `1`, descriptors `72`, scene nodes `236`, geometries `60`, and heap samples `41.25 -> 36.92 -> 42.85 -> 24.71 -> 29.27 MB`, showing no steady-state growth.

## Validation

- All 28 existing `tests/next-ledge*.mjs` entrypoints passed.
- Affected JavaScript syntax checks passed.
- JSON parsing and `git diff --check` passed.
- Playwright completed both branch continuations, exact-frame confirmation, single-event transition, failure, keyboard retry, and Advanced disclosure checks.
- Browser console: zero errors and zero warnings.
- Human View accepted the final first screen and both branch confirmation captures with diagnostics closed.

## Ownership Audit

- Core: read-only runtime and domain-service reference; unchanged.
- ProtoKits: eight imported renderer-agnostic deterministic features; unchanged and still pinned to the synchronized commit.
- Experiment: route authoring, branch-specific copy/timing, existing route-choice orchestration, browser input, Three.js, HUD, audio consumption, and playable proof.
- No Core behavior was copied, no reusable kit behavior was duplicated, and no browser/render concern entered ProtoKits.

## Diversity and Migration Audits

- Diversity: in-place refinement of the same stormline fantasy, swing/re-grapple verb, pressure loop, route structure, and eight-feature signature. Creation, duplicate-signature, and near-duplicate totals remain unchanged.
- Feature migration: no source was pruned, replaced, merged, archived, or retired. `feature-migration-ledger.json` and `retirement-ledger.md` remain unchanged because no migration claim occurred.

## Exact Next Playable Improvement

Animate the existing Stormlock consequence line into the selected Slipstream or Cacheline target as confirmation ends, so the branch handoff reads before the next swing without adding a line, target, or state owner.
