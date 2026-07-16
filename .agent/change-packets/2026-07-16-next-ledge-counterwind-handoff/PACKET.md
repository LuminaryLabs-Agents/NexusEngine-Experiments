# Change Packet: Next Ledge Counterwind Handoff

Packet ID: `2026-07-16-next-ledge-counterwind-handoff`
Automation: Nexus Engine Game Production Builder
Status: validated; publication receipt pending

## Intent

- Player fantasy: stormline recovery operator broadcasting a restored relay into a newly answering route.
- Hero verb: finish the summit delivery, transmit it with `N`, then read and enter a reversed-wind grapple pattern.
- Target feeling: a consequential handoff followed by an immediately legible remix of mastered traversal.
- Pressure loop: completed cargo earns the handoff; the reversed gust changes swing loading while a fourth-beat rest anchor confirms recovery.
- Objective: deliver the sector-one signal, broadcast it, and enter sector two through the counterwind zig-zag.
- Failure and recovery: unfinished handoffs are rejected; a missed grapple reaches the existing dead state and `R` restores the route baseline.
- Visual identity: gold summit transmission becomes cyan handshake energy, then moving counterwind ribbons over the industrial cliff.
- Interaction structure: purpose and hero controls stay on the first screen; `N`, pause, and diagnostics remain in the closed Advanced disclosure.
- Selected ProtoKit features: route pacing/projection, tether motion, cable launch/aim assist, traversal vitals, traversal recovery, traversal camera, traversal cues/feedback, route progress, and route-cargo extraction.
- Core relationship: Core owns realtime ticks and renderer-neutral contracts; the experiment composes them without modifying or copying Core.
- Ownership: authored transition timings, opening anchor data, browser input, Three.js wind/camera presentation, HUD copy, and audio stay local; reusable deterministic traversal, route, cargo, and pressure behavior remains in ProtoKits.

## Starting State

- NexusEngine Core local read-only: `8b57b03904889cdbc71021d3bdb1d4070af5c8d3`.
- NexusEngine Core fetched remote authority: `80146b8947e0877e26b851563bd17f5cdfcbf38a`.
- NexusEngine-ProtoKits: `04d34f049f58ae359cf71d43466c429dac2a6d08` on resolved default branch `main`.
- NexusEngine-Experiments: `67cb1fc02fda06c75f12f8a46ee60347317ff27b` on resolved default branch `main`.

## Human View Route

- Surface: game / interactive scene.
- Primary human task: complete the summit relay, trigger the advanced next-sector action, understand the broadcast/handshake, and recognize the reversed opening.
- Perspectives: first-time readability, objective clarity, feedback/feel, task completion, failure/recovery, and regression player view.
- Techniques: launch inspection, before/after screenshots, keyboard interaction, full-route completion, phased transition capture, disclosure check, console review, and measured performance/steady-state comparison.

## Result

- Materially upgraded the active Next Ledge experiment; no new experiment or production-count claim was created.
- Replaced the immediate keyboard `N` reset with a completion-gated three-phase broadcast, route handshake, and counterwind reveal.
- Added a declarative four-anchor sector-two opening: Counterwind Gate -> Leeward Cradle -> Reverse Catch -> Counterwind Rest.
- Reversed deterministic wind direction in sector two and mirrored projected route control points without duplicating ProtoKit behavior.
- Preserved delivered cargo through broadcast/handshake, then reset route-cargo state only when the generated route actually changes.
- Kept the completion panel as the single transition owner and hid it automatically once the opening reveal completes.

## Player Feel

| Dimension | Before | After |
| --- | ---: | ---: |
| Responsiveness | 9 | 9 |
| Predictability | 9 | 9 |
| Readability | 9 | 9 |
| Impact | 9 | 10 |
| Recovery | 9 | 9 |
| Delight | 9 | 10 |
| Replay desire | 8 | 9 |
| Average | 8.9 | 9.3 |

The transition now makes the restored relay visibly leave the summit, confirms that sector two answered, and previews a concrete counterwind skill test instead of erasing the payoff with an instant reset.

## Cleanup and Performance Gate

- Opening geometry and timings live in declarative preset data; the route adapter maps those authored beats into anchors.
- Session state is the single deterministic owner for transition phase, wind direction, eligibility, and route replacement. HUD, renderer, and synth consume that state.
- The route-cargo wrapper resets on the generated route key instead of duplicating keyboard transition state.
- One fixed-size 18-segment Three.js wind field is reused and remains visible only through the authored opening. No DOM/canvas overlay or duplicate route entity was added.
- Advanced controls and diagnostics remain closed by default. The clean player view contains one canvas and no identifiers, graphs, hit volumes, or descriptor dumps.

Measured Playwright window, 1 second warm-up plus about 2.4 seconds active play:

| Metric | Before | After |
| --- | ---: | ---: |
| Average frame time | 94.312 ms | 72.059 ms |
| Approximate FPS | 10.60 | 13.88 |
| P95 frame time | 117.6 ms | 100.9 ms |
| Long tasks | 18 / 2017 ms | 35 / 2396 ms |
| DOM nodes | 69 | 69 |
| Canvas count | 1 | 1 |
| Renderer handoff descriptors | 72 | 72 |
| JavaScript heap signal | 35.52 MB | 33.97 MB |

The primary FPS metric improved by about 30.9 percent. Counterwind steady state held at 269 scene nodes, 31 ledges, 78-80 draw calls, 59 geometries, 60 lines, 69 DOM nodes, and one canvas across an additional 3.2-second window with no entity or geometry growth. Heap samples fluctuated with collection and did not show bounded-window monotonic growth.

## Validation Evidence

- Playwright: clean first screen, unfinished `N` rejection, complete 25-anchor summit route, keyboard `N` broadcast/handshake/opening, reversed wind `-1`, authored opening descriptors, real fall/dead state, keyboard `R` recovery, closed/open/closed Advanced disclosure, one canvas, stable counterwind scene counts, and zero console messages/errors/warnings.
- Human View: `human-view-before.png`, `human-view-broadcast.png`, `human-view-opening.png`, and `human-view-after.png`; the final screenshot has diagnostics closed and the basic counterwind workflow readable.
- Repository: all 28 `tests/next-ledge*.mjs` entrypoints, changed JavaScript parsing, JSON parsing, and `git diff --check` are required green before publication.
- Core remained read-only. ProtoKits remained unchanged because the existing composition already supplies every reusable deterministic service needed by this upgrade.

## Audits

- Ownership: Core owns runtime contracts; ProtoKits own route pacing/projection, tether/cable settings, vitals, recovery, camera, cues/feedback, progress, cargo, and pressure; Experiments own authored beats, browser input, Three.js, HUD, Web Audio, camera presentation, and tuning. No reusable service was copied.
- Diversity: this is a deeper sector transition for the active legacy stormline-recovery composition, not a new fantasy, route family, or production signature. Creation counts remain unchanged.
- Feature migration: no source, readiness layer, environment system, or asset was removed. Existing diagnostic explanations remain under Advanced, and the feature-migration/retirement ledgers remain unchanged.

## Publication

- Starting Experiments commit: `67cb1fc02fda06c75f12f8a46ee60347317ff27b`.
- Starting and final ProtoKits commit: `04d34f049f58ae359cf71d43466c429dac2a6d08`.
- Experiments production commit: `pending-owned-commit`.
- Exact next playable improvement: make the four-anchor counterwind opening a stronger pressure crescendo with earlier gust anticipation and a more satisfying recovery confirmation at Counterwind Rest.
