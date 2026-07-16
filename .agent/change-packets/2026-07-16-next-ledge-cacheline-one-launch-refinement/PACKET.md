# Next Ledge Cacheline One-Launch Feel Refinement

Packet: `2026-07-16-next-ledge-cacheline-one-launch-refinement`

Status: validated and published

Experiment: `experiments/next-ledge/`

## Intent And Ownership

- Player purpose: turn the banked `1.75` signal cargo into one readable skill catch before the shared Windglass score.
- Target feeling: visibly harder and smaller than mint Slipstream Launch, but predictable enough that one deliberate rightward arc succeeds.
- Hero actions: `A / D` builds the arc, `Space / Click` releases and fires, and `R` retries. No control was added.
- Resources and state: existing stamina, fall pressure, route cargo, `routeChoice`, target enablement, and convergence score remain authoritative.
- Events and methods: existing `aim-assisted`, payoff-opened/secured, Windglass-opened/scored, route-progress, cable-launch, and retry paths remain authoritative; no parallel event stream or launch method was added.
- Snapshots and descriptors: the climb preset owns authored target position, radius, aim bonus, horizontal/vertical lead, and camera zoom. The adapter exposes those values through the existing ledge descriptor; session and renderer consume the same snapshot.
- Dependencies: the existing tether, launch, vitals, recovery, camera, cue, feedback, route-progress, and route-cargo ProtoKit features remain composed.
- Core relationship: NexusEngine Core remained read-only. No Core or ProtoKit behavior was copied into the experiment.
- Local ownership: browser input, authored route content, tuning, presented-camera projection, Three.js, HUD copy, audio, and compositor layering remain experiment-local.
- Exclusions: no new ProtoKit, control, resource ledger, DOM overlay, canvas, debug surface, route family, or production-count claim.

## Starting State

- Preflight playable commit: `8d439d38e45c71ae3c110a681364c4c762fa5607`.
- A non-overlapping builder receipt advanced `main` and `origin/main` during the run to the actual production base `2ca326d85220e78c527057e2a3f9e63a4f07135c`; it changed only the previous packet, pipeline receipt, and production ledger.
- ProtoKits: `04d34f049f58ae359cf71d43466c429dac2a6d08` on resolved default branch `main`.
- Core local read-only: `8b57b03904889cdbc71021d3bdb1d4070af5c8d3`.

## Baseline Finding

- Cacheline High needed two shots and `195` fixed frames from Stormlock Restore.
- The smaller catch was partly clipped by the payoff framing, the pointer projected through simulation camera coordinates instead of the camera the player saw, and the HUD did not teach the required rightward arc.
- Bounded feel scores: responsiveness `7`, predictability `7`, readability `6`, impact `9`, recovery `8`, delight `7`, replay desire `8`; average `7.4`.

## Concrete Refinement

- Moved Cacheline from `82` to `66` horizontal units off the route axis and increased its radius from `5.8` to `6.2`, preserving a smaller target than the `9.4` Slipstream catch.
- Added target-authored `12` aim bonus, `+10 / -32` aim lead, and `72` camera zoom through the preset and route descriptor.
- Framed the live player and actual payoff target together, then made screen-to-world input use that presented camera.
- Rewrote the contextual objective and status copy around one rightward build and release.
- Restricted unassisted cable sweep to `enabledTargets(state)` so inactive branch rewards cannot steal a post-Windglass launch.
- Promoted the UI rather than the WebGL canvas, eliminating observed compositor overlap across hero copy.

## Player Loop Result

- Sector-two public input completed Counterwind Gate, Leeward Cradle, Reverse Catch, Counterwind Rest, Signal Cut, Fork Relay, and Stormlock Restore without a fall.
- One `22`-frame rightward build released from `(-12.04, 865.99)` at a `165.56`-unit target distance; authored aim assist applied `+10 / -32` lead and secured Cacheline in one launch and `36` fixed frames.
- Windglass Relay then scored `{ metric: "cargo-mastery", value: 175 }`.
- The preserved original `anchor-11` caught on the next launch, with only `anchor-12` enabled afterward. Inactive Slipstream/Cacheline anchors did not steal the sweep.
- A deliberate fall reached `mode: dead`, `alive: false`; real keyboard `R` restored `mode: swinging`, `alive: true`, sector `2`, and `anchor-0`.

## Final Integration And Cleanup

- Authored content and tuning remain declarative; one existing route-choice state and existing cable/route/cargo services remain deterministic owners.
- The renderer keeps browser/Three.js work local and reuses existing bounded route-choice line entities.
- Simulation and pointer projection now share the presented camera; no second camera, target, or input path remains.
- Inactive branch collision candidates are removed through existing enabled-target authority rather than another flag or list.
- WebGL is no longer the promoted compositor surface; the fixed UI is promoted above it, keeping hero copy readable.
- Advanced diagnostics remain closed by default and passed closed/open/closed interaction. Final evidence contains no diagnostic labels, hit volumes, graph overlays, or descriptor dumps.

## Feel Scores

| Dimension | Before | After |
| --- | ---: | ---: |
| Responsiveness | 7 | 9 |
| Predictability | 7 | 9 |
| Readability | 6 | 9 |
| Impact | 9 | 9 |
| Recovery | 8 | 8 |
| Delight | 7 | 9 |
| Replay desire | 8 | 9 |
| Average | 7.4 | 8.9 |

## Performance Gate

Matched contemporaneous sample: start-commit checkout and final checkout each used a fresh headed Chromium session, `950 ms` warm-up, `3.4 s` active `D` input, and `1440x900` viewport.

| Metric | Before | After |
| --- | ---: | ---: |
| Samples | `75` | `87` |
| Average frame time | `46.05 ms` | `39.37 ms` |
| FPS | `21.71` | `25.40` |
| p95 frame time | `66.80 ms` | `66.70 ms` |
| Long tasks / total | `18 / 1,006 ms` | `6 / 310 ms` |
| DOM / canvas | `69 / 1` | `69 / 1` |
| Scene nodes / ledges | `236 / 25` | `236 / 25` |
| Draw calls / triangles | `75 / 12,168` | `72 / 11,336` |
| Point-in-time heap | `45.29 MB` | `52.37 MB` |

- Primary FPS improved `17.0%`; p95 was effectively unchanged and long-task pressure fell.
- Heap is a volatile signal. Six later one-second samples cycled between `38.73 MB` and `57.59 MB` rather than growing monotonically.
- Active sector-two settled counts remained `277` scene nodes, `32` ledges, `76` descriptors, `69` DOM nodes, and one canvas. Repeated samples did not grow.

## Human View And Playwright Evidence

- `evidence/human-view-before-first-screen.png`
- `evidence/human-view-before-cacheline-open.png`
- `evidence/human-view-final-first-screen.png`
- `evidence/human-view-final-cacheline-open.png`
- `evidence/human-view-final-windglass-scored.png`
- Surface: game / interactive scene.
- Primary human task: understand the amber skill catch, execute it once, read the `175 CARGO` score, and recognize generic ascent resumed.
- Perspectives: player readability, camera framing, feedback feel, objective/task completion, and regression.
- Final first screen exposes purpose and only hero controls. Cacheline and Windglass evidence keep Advanced closed, preserve one readable owner per signal, and show no WebGL/HUD overlap.

## Validation

- All `28` existing `tests/next-ledge*.mjs` entrypoints passed.
- All `experiments/next-ledge/src/*.js` files passed `node --check`; affected JSON and `git diff --check` passed.
- Headed Playwright completed the shortcut, Cacheline one-launch catch, Windglass score, original `anchor-11` continuation, failure/retry, disclosure, settled-count, performance, and Human View gates.
- Final browser console reported zero errors and zero warnings.

## Audits

- Ownership: deterministic tether, cable, recovery, route, cargo, and pressure remain in existing ProtoKit/Core contracts; the experiment owns authored tuning, bounded route-choice sequencing, browser projection/input, Three.js, HUD, audio, and fiction.
- Diversity: this is an in-place refinement of the same stormline fantasy, swing/release verb, pressure loop, interaction structure, and eight-feature signature. It creates no kit, experiment, game, route family, or production count.
- Feature migration: no source, asset, route, kit, readiness layer, environmental system, or public API was deleted or retired. `feature-migration-ledger.json` and `retirement-ledger.md` remain unchanged.

## Publication

- Production commit: `56d02fa388a4c3c4cd2474e03ccb96fe6ed48dcd`.
- ProtoKits push: not required; `main`, `HEAD`, and `origin/main` remain synchronized at `04d34f049f58ae359cf71d43466c429dac2a6d08`.
- Experiments push: production and receipt commits published to `origin/main` after fetch-before-push verification.

## Exact Next Playable Improvement

Add a short branch-neutral rejoin cue and recovery window from Windglass Relay to the original `anchor-11` so the scored beat flows into generic ascent without a blind long shot.
