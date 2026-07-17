# Stormlock Payoff Line Handoff

## Unit

- Packet: `2026-07-16-next-ledge-stormlock-payoff-line-handoff`
- Experiment: `experiments/next-ledge/`
- Result: material player-visible refinement; no new experiment or production count
- Experiments start: `f9657638115325c45780daf157df157c7a47159a`
- Experiments production commit: pending
- ProtoKits: `04d34f049f58ae359cf71d43466c429dac2a6d08` unchanged
- Core reference: `70cc2a1590677b872d40a42f7b7bb7e174941eb0` read-only

## Intent

- Player fantasy: a stormline recovery operator makes the secured relay visibly route its next launch before committing to open air.
- Hero verb: build swing, release, and re-grapple.
- Target feeling: Stormlock's result physically hands control toward the next target instead of ending as disconnected copy.
- Pressure loop: preserve shelter protection or vent retained signal pressure, then convert that result into branch-specific launch tempo.
- Objective: see the selected Slipstream or Cacheline destination before the payoff swing opens.
- Failure and recovery: miss or fall, then restart through the existing keyboard retry path.
- Visual identity: mint recovery or amber mastery energy drawn through the existing stormline geometry.
- Interaction structure: hero controls and purpose remain on the first screen; optional controls stay in Advanced.
- Selected ProtoKit features: tether motion, cable launch, traversal vitals, traversal recovery, traversal camera, traversal cues, traversal feedback, and route-cargo extraction.
- Core relationship: Nexus Engine remains the read-only composition/runtime authority.
- Ownership: the `12`-frame authored subwindow belongs in route data; selected-branch and confirmation timing remain in existing route-choice state; Three.js line, ledge preview, and camera presentation remain experiment-local.

## Playable Change

- Added one authored `confirmationHandoffFrames: 12` descriptor and exposed it through the existing anchor adapter.
- During that late subwindow, the existing consequence line grows from Stormlock toward the already-selected payoff target.
- The selected existing target scales into view and the existing camera eases toward the pair.
- The original payoff phase and event still open at the same confirmation boundary. No line, target, event, DOM node, timer, or route-choice state was added.

## Player Loop Proof

- Entered sector two, cleared Counterwind Gate and Leeward Cradle, opened Counterwind Rest, and selected the safe Shelter Rise line through actual host actions.
- Reached Stormlock at frame `740`; confirmation remained active through frame `763` and targeted `slipstream-launch`.
- Captured the grown mint handoff at frame `759` with `5` frames remaining.
- At frame `764`, the original payoff opened and exactly one `post-stormlock-payoff-opened` event appeared; the same input did not skip the boundary.
- Caught Slipstream Launch at frame `830`, scored `134` preserved speed at Windglass Relay at frame `914`, and continued into the original rejoin state.
- Deliberately missed, fell at frame `1150`, then pressed physical keyboard `R`; the route restarted alive in sector two with pressure cleared.
- The renderer selects either authored payoff ID and branch color from existing state. This run observed the safe branch live; existing static checks cover both selected target IDs, and shortcut gameplay logic was not changed.

## Human View

- Surface: desktop browser at `1440x1000`.
- Task: understand the purpose, perform the grapple loop, read the Stormlock-to-payoff handoff, fail, and recover.
- Perspectives: first-time player readability, objective clarity, camera framing, feedback feel, and regression safety.
- Techniques: direct Playwright actions, exact-frame state observation, before/after screenshots, disclosure checks, and final diagnostics-closed review.
- Before baseline: `../2026-07-16-next-ledge-stormlock-confirmation-beat-refinement/evidence/human-view-final-safe-confirmation.png` showed the secured Stormlock result without a visible connection to its payoff.
- Final first screen: `evidence/human-view-final-first-screen.png`.
- Final handoff: `evidence/human-view-final-safe-line-handoff.png` shows one mint line from Stormlock into visible Slipstream with hero copy readable and Advanced closed.
- Final payoff: `evidence/human-view-safe-payoff-open.png` shows the opened Slipstream target after the unchanged boundary.
- A transient WebGL screenshot capture tear was immediately rechecked in the next clean frame; the torn capture was removed from evidence.

## Feel Scores

| Dimension | Before | After |
| --- | ---: | ---: |
| Responsiveness | 9 | 9 |
| Predictability | 7 | 9 |
| Readability | 7 | 9 |
| Impact | 6 | 9 |
| Recovery | 8 | 8 |
| Delight | 6 | 9 |
| Replay desire | 7 | 9 |
| Average | 7.1 | 8.9 |

## Integration, Cleanup, and Performance

- Reviewed every run-owned route, adapter, renderer, host-cache, test, and visible path.
- Consolidated the presentation into the existing consequence line, ledge map, payoff IDs, route-choice timing, camera, materials, and event flow.
- Diagnostics remain inside the closed-by-default Advanced disclosure; the default view has one objective, one prompt, one pressure owner, and one selected-target line.
- Replayed the complete safe loop after cleanup. Objectives, feedback, pressure recovery, branch state, score continuity, fall, and retry remained intact.

Matched isolated warm-up plus active-play measurements:

| Metric | Before | After | Result |
| --- | ---: | ---: | --- |
| Average frame interval | 36.28 ms | 36.73 ms | +1.25% |
| FPS | 27.56 | 27.22 | -1.23%, within 10% budget |
| p95 frame interval | 50.6 ms | 51.0 ms | +0.4 ms |
| Long tasks | 4, max 72 ms | 6, max 58 ms | no new maximum spike |
| DOM / canvas / descriptors | 69 / 1 / 72 | 69 / 1 / 72 | unchanged |
| Scene / ledges / lines | 236 / 25 / 36 | 236 / 25 / 36 | unchanged |
| Consequence-line capacity | 1 | 1 | unchanged |
| Draw calls / triangles | 71 / 9,352 | 69 / 9,288 | lower |
| Heap sample | 25.7 MB | 33.4 MB | bounded follow-up, not monotonic |

Five follow-up heap samples were `29.8`, `29.3`, `25.4`, `43.3`, and `35.2` MB while DOM, canvas, descriptor, and scene counts stayed fixed. No unbounded steady-state growth or duplicate visible entity appeared.

## Validation

- All `28` existing `tests/next-ledge*.mjs` entrypoints passed.
- Affected JavaScript syntax checks, production JSON parsing, and `git diff --check` passed.
- Playwright proved the safe line handoff, exact boundary, single payoff event, Windglass score continuity, real fall, physical-keyboard retry, and Advanced closed/open/closed.
- Browser console: `0` messages, `0` errors, `0` warnings.
- Human View accepted the first screen, handoff, and payoff with diagnostics closed.

## Audits

- Natural-language ownership: authored content/tuning stays in the experiment descriptor; generic deterministic behavior remains in eight real ProtoKit features; Core was read-only; browser/input/render adapters remain local.
- Diversity: this deepens the existing stormline fantasy, hero verb, pressure loop, interaction structure, and eight-feature signature. It adds no experiment, route family, kit signature, or production count.
- Feature migration: no source was pruned, moved, duplicated, or retired. The feature-migration and retirement ledgers remain unchanged.

## Exact Next Playable Improvement

Carry the selected mint or amber handoff color through the first payoff grapple fire as one brief cable-and-impact surge, deriving it from existing payoff and grapple feedback without adding a cable, event, effect pool, or state owner.
