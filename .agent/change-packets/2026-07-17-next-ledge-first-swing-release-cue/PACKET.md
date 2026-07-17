# Next Ledge First-Swing Branch Release Cue

- Packet: `2026-07-17-next-ledge-first-swing-release-cue`
- Run time: `2026-07-17T03:08:05-04:00`
- Result: materially upgraded active experiment-game
- Experiment-game: `experiments/next-ledge/`
- Starting commits: Experiments `1d8f821e8bcb208a00ea74289fd115b9fd5c9632`; ProtoKits `04d34f049f58ae359cf71d43466c429dac2a6d08`; Core read-only `70cc2a1590677b872d40a42f7b7bb7e174941eb0`
- Production commit: pending publication receipt
- Publication: pending validated commit and push to the resolved default branch

## Intent

- Player fantasy: stormline recovery operator riding the captured route payoff into the shared relay.
- Hero verb: read one branch cue, release the first payoff swing, then re-grapple.
- Target feeling: mint is buoyant and forgiving; amber is compressed and explosive.
- Pressure loop: choose protection or pressure-for-cargo mastery, vent at Stormlock, convert the payoff recoil into one timed release, then catch Windglass.
- Objective: preserve `134` speed or bank `175` cargo mastery at the existing shared relay.
- Failure/recovery: a mistimed release loses the bonus but the original grapple recovery remains; falling below the floor reaches a real dead state and `R` restores the swing.
- Visual identity: cyan rescue geometry, mint glide atmosphere, amber aftershock atmosphere, bounded signal sparks, and a dark industrial cliff.
- Interaction structure: first-screen `A / D`, `SPACE / CLICK`, and `R`; optional and diagnostic actions remain inside the closed Advanced disclosure.

## Composition and Ownership

Real ProtoKit features used: generic tether motion, cable launch, traversal vitals, traversal recovery, traversal camera, traversal cues, traversal feedback, and route-cargo extraction.

Core remains read-only runtime authority. Local descriptors author both release bands, copy, motion multipliers, lift, camera impulse, and color. Existing route-choice, swing angle/angular velocity, `released` event, HUD, spark pool, player light, atmosphere, camera, and synth paths consume the result. No reusable behavior was copied from Core, and no new ProtoKit boundary was required.

## Player-Visible Upgrade

- Slipstream: a `0.48–0.92` rightward mint window applies `1.08x` velocity, `0.48` lift, and a softer `0.16` camera impulse.
- Cacheline: a faster `0.62–1.08` leftward amber window applies `1.18x` velocity, `0.18` lift, and a harder `0.32` camera impulse.
- The cue changes the first-screen objective and hero prompt from build copy to an explicit ready instruction, then carries its color through sparks, player glow, local light, and a brief atmosphere while branch audio confirms the release.
- The complete loop is enter/understand, build and grapple, choose a route, carry or vent pressure, latch the payoff, time the branch release, catch and score Windglass, fail by falling, and recover with `R`.

## Feel Scores

| Dimension | Before | After |
| --- | ---: | ---: |
| Responsiveness | 9 | 9 |
| Predictability | 8 | 9 |
| Readability | 7 | 9 |
| Impact | 8 | 9 |
| Recovery | 8 | 8 |
| Delight | 8 | 9 |
| Replay desire | 8 | 9 |
| Average | 8.0 | 8.9 |

## Integration, Cleanup, and Performance

- Reviewed every run-owned file and retained one descriptor flow, one release mutation path, one existing event type, one HUD prompt owner, one bounded effect pool, one player-light path, one atmosphere path, and one synth path.
- The Human View loop found generic fall red overwhelming the mint cue; the existing visual signal owner now derives a ten-frame branch surge from the original release event.
- The actual-input amber replay found a one-frame cue/input mismatch; its upper edge moved from `1.02` to `1.08` radians and the same physical Space path then passed.
- Cleanup consolidated duplicate HUD and renderer release-cue derivation. Added no state, timer, control, event type, DOM node, canvas, entity, effect pool, line, material, or debug owner.
- Advanced diagnostics remained closed by default; one real click opened and one real click closed the existing disclosure.
- Stable matched window: 60 warm-up ticks plus 180 active ticks, followed by three steady-state count/heap checkpoints.
- Before: `91.17 ms` average, `10.97 FPS`, `132.50 ms` p95, `169.50 ms` max, 69 DOM nodes, one canvas, 76 descriptors, 277 scene nodes, 32 ledges, 78 draw calls, 11,488 triangles, 107 geometries, and a 55,646,053-byte heap signal.
- After: `47.24 ms` average, `21.17 FPS`, `65.10 ms` p95, `81.20 ms` max, 69 DOM nodes, one canvas, 76 descriptors, 277 scene nodes, 32 ledges, 78 draw calls, 9,220 triangles, 57 geometries, and a 46,334,158-byte heap signal.
- Primary average time improved `48.2%`; measured FPS improved `93.0%`. Three post-window checkpoints held 277 scene nodes and 32 ledges while heap moved `58,535,994 -> 58,896,402 -> 46,334,158`, so no steady growth, duplicated visible entity, new long-task spike, or primary-metric regression remained.

## Playwright and Human View Evidence

- Safe route: physical Space emitted `mint-glide-window` with `1.08x` velocity and `0.48` lift, then the original Windglass catch scored `134 SPEED`.
- Shortcut route: physical Space emitted `amber-aftershock` with `1.18x` velocity and `0.18` lift, then the original Windglass catch scored `175 CARGO`.
- Post-cleanup safe replay repeated the physical mint release and `134 SPEED` score with Advanced closed and no visible error panel.
- Space reached a real falling/dead path; physical keyboard `R` restored sector-two `anchor-0` swinging. DOM stayed `69`, canvas stayed one, and console errors/warnings stayed zero.
- Mandatory Human View question: “Have I checked what the human would actually see, and do I need screenshots, visual inspection, launch-state inspection, or before/after comparison to validate this properly?” Answer: yes. Before/after first-screen and first-swing frames were captured and inspected; final mint and amber ready/release frames keep purpose, hero controls, resources, branch identity, and Advanced closed readable.
- Evidence: `evidence/human-view-before-first-screen.png`, `evidence/human-view-before-first-swing.png`, `evidence/human-view-final-first-screen.png`, `evidence/human-view-final-mint-ready.png`, `evidence/human-view-final-mint-release.png`, `evidence/human-view-final-amber-ready.png`, `evidence/human-view-final-amber-release.png`, and `evidence/human-view-final-failure.png`.

## Audits

- Natural-language ownership: deterministic reusable behavior remains in the eight imported ProtoKit features; authored route content/tuning, browser input, Three.js, HUD, Web Audio, and branch-release composition remain local. Core was read-only.
- Diversity: in-place refinement of the existing stormline recovery fantasy and eight-feature signature; no new experiment, game, route family, or production signature is claimed.
- Feature migration: no source moved, merged, retired, pruned, or deleted. Existing routes, scores, readiness sources, assets, and environmental systems remain intact; migration and retirement ledgers do not change.
- Diagnostics: closed by default; no diagnostic label, graph line, hit volume, identifier, descriptor dump, or instrumentation was added to the player view.

## Validation

- All 28 existing `tests/next-ledge*.mjs` entrypoints passed after final cleanup.
- Affected JavaScript syntax checks, `git diff --check`, Playwright safe/shortcut route and input replay, post-cleanup full safe replay, physical failure/recovery, real disclosure clicks, Human View inspection, zero-message console, and the matched performance/growth gate passed.
- ProtoKits stayed clean and synchronized; no shared export or registry changed.

## Next Playable Improvement

Let Windglass answer the branch release with a short mint float-settle or amber brake-settle on score, using the existing score event, camera, material, and cue owners without another state or control.
