# Next Ledge Payoff Latch Recoil

- Packet: `2026-07-17-next-ledge-payoff-latch-recoil`
- Run time: `2026-07-17T01:47:50-04:00`
- Result: materially upgraded active experiment-game
- Experiment-game: `experiments/next-ledge/`
- Starting commits: Experiments `e6c3a83eee44db7e1636d4c6853f7ae45e25ce23`; ProtoKits `04d34f049f58ae359cf71d43466c429dac2a6d08`; Core read-only `70cc2a1590677b872d40a42f7b7bb7e174941eb0`
- Production commit: `ace593a1a998309d44c25271500ed47c377e8470`
- Publication: production commit published to resolved default branch `main`; this packet update is the publication receipt

## Intent

- Player fantasy: stormline recovery operator converting a resolved route choice into physical momentum.
- Hero verb: build swing, release, and re-grapple.
- Target feeling: mint Slipstream pulls forward and tall; amber Cacheline hits harder and compresses wide.
- Pressure loop: choose protected recovery or pressure-for-cargo mastery, vent at Stormlock, then commit to the branch payoff.
- Objective: carry the selected payoff through Windglass scoring and back into the preserved ascent.
- Failure/recovery: falling below the sector floor reaches a real dead state; `R` restores the live swing.
- Visual identity: cyan rescue geometry, mint recovery, amber mastery, signal particles, and a dark industrial cliff.
- Interaction structure: first-screen hero controls; optional and diagnostic actions remain inside the closed Advanced disclosure.

## Composition and Ownership

Real ProtoKit features used: generic tether motion, cable launch, traversal vitals, traversal recovery, traversal camera, traversal cues, traversal feedback, and route-cargo extraction.

Core remains read-only runtime authority. Authored recoil values belong to the local climb preset and route adapter. The existing session latch applies target-directed velocity and camera trauma; the existing player-scale path derives bounded squash from the existing `grapple-latched` event age; the existing synth presents branch audio. No reusable behavior was copied from Core, and no new ProtoKit boundary was required.

## Player-Visible Upgrade

- Slipstream Launch: `mint-forward-pull`, `1.4` impulse, `0.28` camera impulse, seven-frame tall squash.
- Cacheline High: `amber-impact-snap`, `2.8` impulse, `0.46` camera impulse, five-frame wide compression.
- Both branches reuse the established payoff cable chroma, sparks, latch event, player mesh, camera, and synth.
- The complete validated loop is enter/understand, release and grapple, choose and carry pressure, recover at Stormlock, latch the branch payoff, fail by falling, and recover with `R`.

## Feel Scores

| Dimension | Before | After |
| --- | ---: | ---: |
| Responsiveness | 9 | 9 |
| Predictability | 9 | 9 |
| Readability | 8 | 9 |
| Impact | 7 | 9 |
| Recovery | 8 | 8 |
| Delight | 8 | 9 |
| Replay desire | 9 | 9 |
| Average | 8.3 | 8.9 |

## Integration, Cleanup, and Performance

- Reviewed every run-owned path and retained one descriptor flow, one latch mutation path, one bounded event, one player-scale owner, one camera-trauma owner, and one synth path.
- Removed the per-frame reversed event-array copy; the bounded event scan now walks backward without allocation.
- Added no state, event, timer, DOM node, canvas, entity, effect pool, line, material, or debug owner.
- Advanced diagnostics remained closed by default; one click opened and one click closed the existing disclosure.
- Stable matched window: 60 warm-up ticks plus 180 active ticks.
- Before: `218.26 ms` average, `4.58 FPS`, `314.30 ms` p95, `386.60 ms` max, 69 DOM nodes, one canvas, 76 descriptors, 277 settled scene nodes, 32 ledges, 80 draw calls, 12,036 triangles, 104 geometries, 49,458,028-byte heap signal.
- After: `130.15 ms` average, `7.68 FPS`, `180.70 ms` p95, `211.20 ms` max, 69 DOM nodes, one canvas, 76 descriptors, 277 settled scene nodes, 32 ledges, 80 draw calls, 12,056 triangles, 104 geometries, 49,689,618-byte heap signal.
- Primary average metric improved `40.4%`; measured FPS improved `67.7%`. No unbounded growth, duplicated visible entity, long-task regression, or primary-metric regression was observed.

## Playwright and Human View Evidence

- Actual-input safe route latched Slipstream at frame `476`: recoil style `mint-forward-pull`, impulse `1.4`, camera trauma `0.2464`, scale `0.846 x 1.555`.
- Actual-input shortcut route latched Cacheline at frame `538`: recoil style `amber-impact-snap`, impulse `2.8`, camera trauma `0.4048`, scale `1.580 x 0.739`.
- Space caused a real falling state; accelerated fixed ticks reached the real dead state; physical keyboard `R` restored sector-one swinging.
- First screen exposed purpose, `A / D`, `SPACE / CLICK`, `R`, and all three resources. DOM remained `69`; canvas remained one. Console messages and page errors remained zero.
- Mandatory Human View question: “Have I checked what the human would actually see, and do I need screenshots, visual inspection, launch-state inspection, or before/after comparison to validate this properly?” Answer: yes. Before/after first-screen and latch screenshots were captured and visually inspected. Final mint and amber frames keep hero controls/resources readable with Advanced closed.
- Evidence: `evidence/human-view-before-first-screen.png`, `evidence/human-view-before-mint-latch.png`, `evidence/human-view-final-mint-pull.png`, and `evidence/human-view-final-amber-snap.png`.

## Audits

- Natural-language ownership: reusable deterministic behavior remains in the imported ProtoKits; authored route content/tuning, browser input, Three.js, HUD, Web Audio, and the payoff recoil composition remain local. Core was read-only.
- Diversity: in-place refinement of the existing stormline recovery fantasy and eight-feature signature; no new experiment, game, route family, or production signature is claimed.
- Feature migration: no source moved, merged, retired, pruned, or deleted. Existing routes, scores, readiness sources, and assets remain intact; migration and retirement ledgers do not change.
- Diagnostics: closed by default; no new diagnostic labels, graph lines, hit volumes, identifiers, descriptor dumps, or instrumentation appear in the default player view.

## Validation

- All existing `tests/next-ledge*.mjs` entrypoints passed.
- Affected JavaScript syntax checks, JSON parsing, `git diff --check`, Playwright route/input replay, Human View inspection, console/page-error checks, and the matched performance gate passed.
- ProtoKits stayed clean and synchronized; no shared export or registry changed.

## Next Playable Improvement

Let the payoff recoil resolve into one branch-specific first-swing release cue—mint glide window or amber aftershock—using existing swing angle, route-choice, HUD, and cue owners without a new control or state.
