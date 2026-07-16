# Next Ledge Windglass Generic Rejoin Feel Refinement

Packet: `2026-07-16-next-ledge-windglass-rejoin-cue-refinement`

Status: validated and published

Experiment: `experiments/next-ledge/`

## Intent And Ownership

- Player purpose: carry the scored Windglass branch result into the preserved generic ascent without a blind long shot.
- Target feeling: a crisp score, one readable high-build recovery catch, then a stable generic climb.
- Hero actions: `A / D` builds high, `Space / Click` releases and fires, and `R` retries. No control was added.
- Resources and state: existing stamina, fall pressure, route cargo, `routeChoice`, target enablement, and convergence score remain authoritative.
- Events and methods: `windglass-rejoin-opened` and `windglass-rejoin-secured` extend the existing semantic route event stream; public `GameHost.tick` and existing launch/recovery methods remain authoritative.
- Snapshots and descriptors: the climb preset owns fail-floor, aim-assist, camera, and copy tuning. The adapter derives the rejoin ID from the original projected route; session, renderer, HUD, and audio consume one snapshot.
- Dependencies: existing tether motion, cable launch, traversal vitals, recovery, camera, cue, feedback, route progress, and route-cargo extraction features remain composed.
- Core relationship: NexusEngine Core remained read-only. No Core or ProtoKit behavior was copied into the experiment.
- Local ownership: authored content/tuning, browser input, Three.js presentation, HUD copy, audio, and bounded route-choice sequencing remain experiment-local.
- Exclusions: no new ProtoKit, route anchor, control, resource ledger, DOM overlay, canvas, debug surface, route family, or production-count claim.

## Starting State

- Experiments: `71ddcfcfc5677cd86ff42756863f48b21077e9e2` on resolved default branch `main`.
- ProtoKits: `04d34f049f58ae359cf71d43466c429dac2a6d08` on resolved default branch `main`.
- Core local read-only: `8b57b03904889cdbc71021d3bdb1d4070af5c8d3`.

## Baseline Finding

- Windglass scored the selected branch, then immediately marked the route resolved while the next generic `anchor-11` sat about `242` world units away from the live player against a `184`-unit cable limit.
- The player had to infer a high build from a dim generic target without explicit rejoin copy, authored camera framing, or a miss-recovery allowance.
- Bounded feel scores: responsiveness `8`, predictability `6`, readability `5`, impact `8`, recovery `5`, delight `7`, replay desire `6`; average `6.4`.

## Concrete Refinement

- Preserved the original projected-route `anchor-11` ID during Windglass insertion instead of adding a replacement anchor.
- Added one `rejoin-active` phase to the existing route-choice state, preserving the selected branch and score until the generic catch lands.
- Authored a `260` fail-floor bonus, `34` aim-assist bonus, `96` camera-zoom bonus, and branch-neutral score/rejoin copy in the climb preset.
- Reused the existing recovery calculation, enabled-target authority, consequence line, target mesh/halo, route-choice snapshot, and semantic event stream.
- Framed live player plus generic destination, enlarged the cyan target, and exposed one first-screen hero prompt naming the required high build and fire.
- Resolved the temporary line, prompt, and camera state immediately on `anchor-11`, restoring ordinary generic ascent.

## Player Loop Result

- Public fixed-input play completed Counterwind Gate, Leeward Cradle, Reverse Catch, Counterwind Rest, Shelter Rise, Fork Relay, Stormlock Restore, Slipstream Launch, and Windglass Relay.
- Windglass preserved `{ metric: "preserved-speed", value: 134 }` and opened the rejoin to original `anchor-11`.
- A deliberate bad grapple was followed by an aim-assisted second shot; the ordered event chain ended in `grapple-latched`, `anchor-locked`, and `windglass-rejoin-secured` without death.
- A clean replay used a `17`-frame high build, released at `153.69` units, secured `anchor-11` in `37` fixed flight frames, and kept the `134` score.
- The existing real failure path and keyboard `R` recovery were also exercised during the complete loop.

## Final Integration And Cleanup

- Authored route/tuning remains declarative; the existing route-choice and recovery owners remain the only deterministic state paths.
- Browser/input/render adapters remain local; Core and ProtoKit boundaries remain unchanged.
- No duplicate route anchor, state ledger, listener, DOM/canvas entity, line object, target mesh, descriptor stream, or debug overlay was introduced.
- One bounded consequence line changes to cyan during rejoin and disappears on resolution; one existing target entity becomes visually hot and returns to generic presentation afterward.
- Advanced diagnostics remain closed by default and passed closed/open/closed interaction at `69` DOM nodes and one canvas.

## Feel Scores

| Dimension | Before | After |
| --- | ---: | ---: |
| Responsiveness | 8 | 9 |
| Predictability | 6 | 9 |
| Readability | 5 | 9 |
| Impact | 8 | 9 |
| Recovery | 5 | 9 |
| Delight | 7 | 9 |
| Replay desire | 6 | 9 |
| Average | 6.4 | 9.0 |

## Performance Gate

Matched fresh headed Chromium samples used `950 ms` warm-up, `3.4 s` active `D` input, and a `1440x900` viewport.

| Metric | Before | After |
| --- | ---: | ---: |
| Samples | `42` | `64` |
| Average frame time | `83.34 ms` | `53.79 ms` |
| FPS | `12.00` | `18.59` |
| p95 frame time | `100.60 ms` | `66.70 ms` |
| Long tasks / total | `43 / 3,437 ms` | `46 / 3,295 ms` |
| DOM / canvas | `69 / 1` | `69 / 1` |
| Descriptors | `72` | `72` |
| Scene nodes / ledges | `236 / 25` | `236 / 25` |
| Draw calls / triangles | `79 / 12,296` | `74 / 11,076` |
| Point-in-time heap | `35.56 MB` | `30.08 MB` |

- Primary FPS improved `54.9%`; average and p95 frame time both improved, with long-task total slightly lower.
- Three later active samples held `236` scene nodes, `25` ledge entities, `78` draw calls, `69` DOM nodes, one canvas, and `72` descriptors. Heap cycled `34.78 -> 44.13 -> 27.26 MB` under garbage collection instead of growing monotonically.

## Human View And Playwright Evidence

- `evidence/human-view-before-first-screen.png`
- `evidence/human-view-before-windglass-scored.png`
- `evidence/human-view-final-first-screen.png`
- `evidence/human-view-final-rejoin-open.png`
- `evidence/human-view-final-rejoin-secured.png`
- Surface: game / interactive scene.
- Primary human task: recognize the post-score destination, build high, recover a miss if needed, catch the original generic anchor, and understand that generic ascent resumed.
- Perspectives: player readability, camera framing, feedback feel, objective/task completion, recovery, and regression.
- Final evidence keeps Advanced closed, presents one readable cyan route owner, and removes the temporary signal after resolution.

## Validation

- All existing `tests/next-ledge*.mjs` entrypoints, all `experiments/next-ledge/src/*.js` syntax checks, affected JSON parsing, and `git diff --check` passed.
- Headed Playwright completed the mint route, Windglass score, intentional miss/recovery, clean `anchor-11` catch, keyboard retry, disclosure, active-count, performance, and Human View gates.
- Final browser console reported zero errors and zero warnings; no visible error panel appeared.

## Audits

- Ownership: deterministic tether, cable, vitals, recovery, camera, cue, feedback, route progress, cargo, and pressure stay in existing ProtoKit/Core contracts; experiment-local route content and presentation remain local.
- Diversity: this is an in-place refinement of the same stormline fantasy, swing/release verb, pressure loop, interaction structure, and eight-feature signature. It creates no kit, experiment, game, route family, or production count.
- Feature migration: no source, asset, route, kit, readiness layer, environmental system, traversal system, objective, progression path, public API, or other valuable behavior was deleted or retired. Migration and retirement ledgers remain unchanged.

## Publication

- Production commit: `7895295021aabd058ba15c73fcd5b55a350003f6`.
- ProtoKits push: not required; `main`, `HEAD`, and `origin/main` remain synchronized at `04d34f049f58ae359cf71d43466c429dac2a6d08`.
- Experiments push: production and receipt commits published to `origin/main` after fetch-before-push verification.

## Exact Next Playable Improvement

Retune the initial Signal Cut commitment from Counterwind Rest so the amber shortcut opens with one readable high-build launch without making it as safe as Shelter Rise.
