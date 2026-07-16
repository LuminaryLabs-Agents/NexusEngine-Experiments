# Change Packet: Next Ledge Grapple Flow Upgrade

Packet ID: `2026-07-16-next-ledge-grapple-flow-upgrade`
Automation: Nexus Engine Game Production Builder
Status: validated; publication receipt pending

## Intent

- Player fantasy: stormline recovery operator climbing a broken summit relay.
- Hero verb: build swing, release, and re-grapple into the next anchor.
- Target feeling: readable kinetic flow with forgiving recovery and crisp latch impact.
- Pressure loop: stamina drain, fall pressure, and carried signal cargo create risk between rest anchors and summit delivery.
- Objective: reach the summit with the recovered anchor signal cargo.
- Failure and recovery: lose the tether below the sector floor, read the failure immediately, and retry with `R`.
- Visual identity: cyan rescue geometry, amber climber, signal particles, and a dark industrial cliff.
- Interaction structure: hero controls and purpose remain visible on the first screen; optional pause, next-sector, and diagnostic layers live under one advanced disclosure.
- Selected ProtoKit features: generic tether motion, cable launch/aim assist, traversal vitals, traversal recovery, traversal camera, traversal cues, traversal feedback, and route/cargo extraction composition.
- Core relationship: Core remains the runtime, fixed-tick, descriptor, and headless-render authority; this route composes imported kits without duplicating Core.
- Ownership: deterministic reusable behavior stays in NexusEngine-ProtoKits; browser input, DOM HUD, Three.js presentation, audio playback, route fiction, and tuning stay local to the experiment.

## Starting State

- NexusEngine-ProtoKits: `16e444d8f8fc43def17986fce2556dfb76d17be9` on resolved default branch `main`.
- NexusEngine-Experiments: `e5b630591525ec47677bd52702ea7e49fbe992bb` on resolved default branch `main`.
- Human View baseline: the route failed at startup because the route-cargo composite declared already-internal child kits as unresolved composer requirements. After that reusable blocker was repaired, the next launch exposed a null renderer style crash. Once both blockers were removed, the playable baseline showed severe diagnostic text overlap and no visible hero control or purpose.

## Feel Baseline

| Dimension | Before |
| --- | ---: |
| Responsiveness | 5 |
| Predictability | 3 |
| Readability | 2 |
| Impact | 5 |
| Recovery | 4 |
| Delight | 4 |
| Replay desire | 3 |

Average: `3.7 / 10`.

## Result

Next Ledge is materially upgraded from a broken/cluttered legacy route into a clean, visibly playable stormline-recovery grapple loop. The route now boots from current Nexus Engine and a pinned current NexusEngine-ProtoKits commit, exposes the hero verb and immediate objective on the first screen, advances cargo through an aim-assisted re-grapple, produces fall pressure, reaches a real failure state, and resets climb/cargo/pressure together through retry.

## Real ProtoKit Composition

1. `generic-tether-motion-kit` — deterministic swing and reel response.
2. `generic-cable-launch-kit` — projectile cable, collision sweep, and aim assist.
3. `generic-traversal-vitals-kit` — stamina capacity, drain, and rest recovery.
4. `generic-traversal-recovery-kit` — safe-anchor failure floor and recovery tuning.
5. `generic-traversal-camera-kit` — swing/fall follow and anticipation state.
6. `generic-traversal-cue-kit` — mode-aware player guidance.
7. `generic-traversal-feedback-kit` — trails, latch sparks, and camera trauma.
8. `generic-route-cargo-extraction-kit` — route progress, signal cargo/resource, fall pressure, snapshots, and descriptors through its child DSKs.

The reusable route-cargo composite was repaired in NexusEngine-ProtoKits so it installs its internal child kits without declaring them as unresolved external dependencies and no longer stores a cyclic engine reference in world state.

## Player Loop

1. Enter on a tether with `A / D`, release/fire, and retry visible.
2. Build momentum while stamina drains.
3. Release; fall pressure rises and the prompt changes to grapple guidance.
4. Fire into a viable cyan anchor; aim assist and cable sweep produce a readable latch.
5. Lock the next anchor; cargo advances from `0` to `0.5` and pressure recovers.
6. Miss the route long enough to cross the fixed floor below the last safe anchor; enter `dead` state.
7. Press `R`; return to `anchor-0` with stamina restored and cargo/pressure reset to zero.
8. Continue toward rest anchors and summit delivery.

## Feel Result

| Dimension | Before | After |
| --- | ---: | ---: |
| Responsiveness | 5 | 9 |
| Predictability | 3 | 8 |
| Readability | 2 | 9 |
| Impact | 5 | 8 |
| Recovery | 4 | 8 |
| Delight | 4 | 8 |
| Replay desire | 3 | 8 |

Average: `3.7 -> 8.3 / 10`; no after category is below `8`.

## Human View

Mandatory question: **Have I checked what the human would actually see, and do I need screenshots, visual inspection, launch-state inspection, or before/after comparison to validate this properly?** Yes. Launch state, first-screen hierarchy, live loop feedback, failure/retry, disclosure behavior, and before/after screenshots were inspected.

- `human-view-before.png`: unresolved route-cargo dependency fatal screen.
- `human-view-clutter-baseline.png`: restored runtime with diagnostic overlays covering the play view and no hero controls.
- `human-view-after.png`: clean 1200x734 player view with purpose, hero controls, resources, route, and contextual action prompt.
- Human View routes: first-time/player-readability, task completion, feedback feel, and objective clarity.
- The advanced disclosure explains preserved readiness layers without auto-loading competing canvases into the playable route.

## Playwright Evidence

- Launch: `mode=swinging`, `anchor=anchor-0`, visible hero controls, visible error panel hidden.
- Primary loop: charged swing `vx=3.43`, `vy=3.01`; release entered `falling` and pressure `3`; re-grapple reached `anchor-1`, cargo `0.5`, pressure `0`.
- Failure/recovery: release without re-grapple reached `mode=dead`, `alive=false`, `y=-321.41`; keyboard `R` returned `mode=swinging`, `alive=true`, `anchor=anchor-0`.
- Composite retry: after progressing to cargo `0.5`, keyboard `R` reset cargo and pressure to `0`.
- Advanced disclosure: rescue-line explanation rendered, only the game canvas remained, and the disclosure closed cleanly.
- Console: `0` messages, `0` errors, `0` warnings after the completed workflow.

## Validation

- Passed all affected Next Ledge route-cargo, traversal-readability, anchor-timing/readiness, NexusEngine CDN/state/input, plan, and route-progress existing smokes.
- Passed syntax checks for every changed JavaScript file.
- Passed JSON parsing for all changed manifests and durable production ledgers.
- ProtoKits passed targeted syntax, real Nexus Engine composer smoke, deterministic route-cargo replay, manifest, domain, performance, and documentation checks before publication.
- Broad Experiments checks retain two unrelated starting-repository failures: the canonical replay manifest has 7 replay entries for 16 canonical routes, and `experiments/The Cavalry of Rome/src/hex-gameplay-pass.js` declares `drawHexFill` twice. Neither file or lane was changed by this unit.

## Ownership Audit

- Core: runtime creation, fixed tick, world/resource/event mechanics, objective/render descriptors, and headless renderer authority; read-only at `8b57b03904889cdbc71021d3bdb1d4070af5c8d3`.
- ProtoKits: deterministic tether/cable/vitals/recovery/camera/cue/feedback plus route/cargo/pressure DSK behavior and facade contracts.
- Experiment: browser input, DOM/HUD, Three.js, audio, route generation/fiction, tuning, event translation, camera presentation, and first-screen interaction structure.
- No Core implementation was copied or modified. No reusable browser/renderer ownership moved into ProtoKits.

## Diversity Audit

This upgrade remains distinct from defense, survey, island, flight, and platformer lanes: alpine recovery fantasy; release/re-grapple verb; stamina/cargo/fall-pressure loop; continuous action-canvas structure; cyan/amber storm-cliff identity; and an eight-feature traversal/extraction signature. It does not add a quota-filling route or duplicate another composition.

## Feature-Migration Audit

No source, route, asset, or readiness implementation was deleted. Eight historical readiness entries and their kits remain on disk; only their default auto-loading was removed because it obscured and destabilized the playable view. Their purposes remain discoverable under Advanced. No retirement-ledger count changed and no successor/retirement claim is made.

## Durable State

- Active experiment: `next-ledge-grapple-flow`.
- Lifecycle: `active-legacy-upgrade`; excluded from new-production creation totals.
- Packet: `2026-07-16-next-ledge-grapple-flow-upgrade` (exactly one owned packet).
- Starting commits: ProtoKits `16e444d8f8fc43def17986fce2556dfb76d17be9`; Experiments `e5b630591525ec47677bd52702ea7e49fbe992bb`.
- ProtoKits production/final commit: `04d34f049f58ae359cf71d43466c429dac2a6d08`, published to `origin/main`.
- Experiments production/final commit: `pending-current-unit`.

## Exact Next Playable Improvement

Author a short late-route mastery sequence with a deliberate rest-anchor setup, one high-commitment release, and an unmistakable summit signal-delivery celebration. Preserve the current response, aim assist, retry semantics, and clean first screen.
