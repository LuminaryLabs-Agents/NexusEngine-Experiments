# Next Ledge Signal Cut One-Launch Feel Refinement

Packet: `2026-07-16-next-ledge-signal-cut-one-launch-refinement`

Status: validated and published

Experiment: `experiments/next-ledge/`

## Intent And Ownership

- Player purpose: turn Counterwind Rest's amber shortcut into a deliberate high-build commitment instead of an unexplained first-shot miss.
- Target feeling: take the smaller, higher-pressure line with one readable build, one release/fire cadence, and one crisp catch while mint Shelter Rise remains the obvious recovery choice.
- Hero actions: `A / D` builds; `Space / Click` releases and fires; `R` retries. No control was added.
- Resources and state: existing stamina, fall pressure, route cargo, `routeChoice`, enabled-target state, and traversal state remain authoritative.
- Events and methods: existing `aim-assisted`, grapple, latch, route-choice, pressure, cargo, convergence, and rejoin events remain authoritative; public `GameHost.tick` and existing launch/recovery methods drive the loop.
- Snapshots and descriptors: the climb preset authors Signal Cut position, radius, high-build gate, aim bonus/lead, pressure, cargo, and copy. The adapter projects those values into route descriptors; session and HUD consume them.
- Dependencies: generic tether motion, cable launch, traversal vitals/recovery, traversal camera/cues/feedback, generic anchor descriptors, mode-projected route, route progress, and route-cargo extraction remain composed.
- Core relationship: NexusEngine Core remained read-only. ProtoKits remained unchanged; no Core or reusable deterministic behavior was copied into the experiment.
- Local ownership: authored scene geometry/tuning, browser input, Three.js presentation, HUD copy, audio, and bounded route-choice sequencing stay experiment-local.
- Exclusions: no new ProtoKit, control, resource ledger, state owner, DOM overlay, canvas, diagnostic layer, route family, source retirement, or production-count claim.

## Starting State

- Experiments: `b67e37363ad3d2a6784b7b23d2d11f6207e56618` on resolved default branch `main`.
- ProtoKits: `04d34f049f58ae359cf71d43466c429dac2a6d08` on resolved default branch `main`.
- Core local read-only: `8b57b03904889cdbc71021d3bdb1d4070af5c8d3`; refreshed remote default reference: `ebb63803f1e7f6e096abec9e0377a693fd1d8e01`.

## Baseline Finding

- Counterwind Rest opened both branches, but its generic choice prompt never became a release cue.
- A `26`-frame amber high build reached angle `2.10`, yet the smaller Signal Cut remained outside ordinary acquisition and the first launch missed into the wall/fall path instead of committing the advertised shortcut.
- Shelter Rise was already the readable recovery line; Signal Cut needed stronger commitment clarity without inheriting shelter protection.
- Bounded feel scores: responsiveness `7`, predictability `5`, readability `6`, impact `7`, recovery `8`, delight `5`, replay desire `5`; average `6.1`.

## Concrete Refinement

- Moved Signal Cut twenty world units inward and ten units lower while reducing its authored radius from `8.6` to `8`, preserving a visibly smaller target than Shelter Rise's `10.5` radius.
- Added declarative Signal Cut aim bonus, minimum build angle, and lead. The existing cable launch consumes those descriptors; no second launch path exists.
- Generalized route-choice aim descriptor names so the same authored compensation path serves both initial branch targets and later payoff targets.
- Made the high-build window priority deterministic only after angle `2.0`; before that gate, neutral/low input still selects Shelter Rise. The high-build state exposes one `AMBER WINDOW — Release high · fire Signal Cut` hero cue.
- Preserved `+46` fall pressure, `1.75` cargo, the smaller anchor, no protected grapple, and every downstream shortcut consequence/reward/rejoin beat.

## Player Loop Result

- Public fixed-input play completed Counterwind Gate (`19` build / `37` flight frames), Leeward Cradle (`21 / 25`), Reverse Catch (`34 / 23`), and Counterwind Rest (`34 / 28`).
- At Counterwind Rest, neutral/low release selected Shelter Rise, confirming the larger recovery route remained the safe default.
- The amber replay used a `25`-frame high build to angle `2.00`; Signal Cut became the sole priority, the projectile latched in `6` ticks, and the player settled on the anchor after `34` total flight/reel frames with `46%` pressure and `4 / 10` cargo visible.
- The committed shortcut then completed Fork Relay, Stormlock Restore, Cacheline High, Windglass Relay, and original `anchor-11`; cargo mastery remained `175`, the convergence score survived, and generic ascent resumed.
- A deliberate post-rejoin fall reached real `dead` state at frame `816`; keyboard `R` restored sector two at `anchor-0`, alive and swinging, with the normal recovery status.

## Final Integration And Cleanup

- Authored geometry, acquisition gate, lead, and copy remain declarative; the existing route-choice and cable-launch owners remain the only deterministic paths.
- Browser/input/render adapters remain local; Core and ProtoKit boundaries remain unchanged.
- Renamed the narrow payoff-only aim metadata path instead of adding a duplicate initial-choice path.
- No duplicate target, state, event stream, listener, DOM/canvas entity, line object, descriptor stream, overlay, debug flag, or stale style was introduced.
- Advanced diagnostics remain closed by default. Closed/open/closed validation held `69` DOM nodes and one canvas; the foldout added no visible diagnostic surface until explicitly requested.

## Feel Scores

| Dimension | Before | After |
| --- | ---: | ---: |
| Responsiveness | 7 | 9 |
| Predictability | 5 | 9 |
| Readability | 6 | 9 |
| Impact | 7 | 9 |
| Recovery | 8 | 8 |
| Delight | 5 | 9 |
| Replay desire | 5 | 9 |
| Average | 6.1 | 8.9 |

## Performance Gate

Matched fresh headed Chromium samples used `950 ms` warm-up, `3.4 s` active `D` input, and a `1440x900` viewport.

| Metric | Before | After |
| --- | ---: | ---: |
| Samples | `37` | `50` |
| Average frame time | `91.51 ms` | `70.33 ms` |
| FPS | `10.93` | `14.22` |
| p95 frame time | `133.40 ms` | `83.30 ms` |
| Long tasks / total | `58 / 5,395 ms` | `34 / 2,613 ms` |
| DOM / canvas | `69 / 1` | `69 / 1` |
| Descriptors | `72` | `72` |
| Scene nodes / ledges | `236 / 25` | `236 / 25` |
| Draw calls / triangles | `79 / 12,296` | `78 / 11,528` |
| Point-in-time heap | `34.72 MB` | `33.47 MB` |

- Primary FPS improved `30.1%`; average frame time improved `23.1%`, p95 improved `37.6%`, and long-task time fell `51.6%`.
- Three later active samples held `69` DOM nodes, one canvas, `72` descriptors, `236` scene nodes, and `25` ledges; draw calls settled from `78` to `76` with no steady-state entity growth.

## Human View And Playwright Evidence

- `evidence/human-view-before-first-screen.png`
- `evidence/human-view-before-signal-fork-open.png`
- `evidence/human-view-before-signal-cut-high-build.png`
- `evidence/human-view-before-signal-cut-first-launch-miss.png`
- `evidence/human-view-final-first-screen.png`
- `evidence/human-view-final-signal-fork-open.png`
- `evidence/human-view-final-signal-cut-window.png`
- `evidence/human-view-final-signal-cut-secured.png`
- `evidence/human-view-final-shortcut-rejoin.png`
- Surface: game / interactive scene.
- Primary human task: recognize the safe and shortcut lines, build into the amber release window, commit Signal Cut in one launch, carry its pressure/reward through convergence, and recover from failure.
- Perspectives: player readability, camera framing, feedback feel, task completion, failure/retry, disclosure, performance, and regression.
- Final evidence keeps Advanced closed and shows one readable owner for the fork, high-build window, commitment state, and rejoin result.

## Validation

- All existing `tests/next-ledge*.mjs` entrypoints, all `experiments/next-ledge/src/*.js` syntax checks, affected JSON parsing, and `git diff --check` passed.
- Headed Playwright completed both branch commitments, the full amber consequence/payoff/convergence/rejoin loop, real failure, keyboard retry, disclosure, steady-count, matched-performance, and Human View gates.
- Final browser console reported zero errors and zero warnings; no visible error panel appeared.

## Audits

- Ownership: deterministic tether, cable, vitals, recovery, camera, cue, feedback, route progress, cargo, and pressure stay in existing ProtoKit/Core contracts; experiment-local authored route content and presentation remain local.
- Diversity: this is an in-place refinement of the same stormline fantasy, swing/release verb, pressure loop, interaction structure, and eight-feature signature. It creates no kit, experiment, game, route family, or production count.
- Feature migration: no source, asset, route, kit, readiness layer, environmental system, traversal system, objective, progression path, public API, or other valuable behavior was deleted or retired. Migration and retirement ledgers remain unchanged.

## Publication

- Production commit: `593b78647715cd089fc1f858a06efe4b2bb3c1a1`.
- ProtoKits push: not required; `main`, `HEAD`, and `origin/main` remain synchronized at `04d34f049f58ae359cf71d43466c429dac2a6d08`.
- Experiments push: production and receipt commits published to `origin/main` after fetch-before-push verification.

## Exact Next Playable Improvement

Give the Signal Cut-to-Fork Relay pressure carry one explicit amber release window and landing confirmation so the shortcut's first consequence is as readable as its new commitment, without adding protection or weakening the mint line.
