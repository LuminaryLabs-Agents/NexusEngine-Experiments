# Next Ledge Signal Pressure Carry Refinement

Packet: `2026-07-16-next-ledge-signal-pressure-carry-refinement`

Status: validated and published

Experiment: `experiments/next-ledge/`

## Intent And Ownership

- Player purpose: make the 46-pressure trip from Signal Cut to Fork Relay readable as a deliberate carry beat instead of generic traversal copy followed by an unannounced state change.
- Target feeling: build left under visible pressure, recognize one trustworthy amber release cue, land Fork Relay in one committed launch, and feel the retained pressure bank before Stormlock.
- Hero actions: `A / D` builds; `Space / Click` releases and fires; `R` retries. No control was added.
- Resources and state: existing stamina, fall pressure, route cargo, `routeChoice`, target enablement, traversal state, and route progress remain authoritative.
- Events and methods: existing public `GameHost.tick`, cable launch, grapple, route-choice, cargo, and pressure flows remain authoritative. Two semantic presentation events mark the carry fire and landing.
- Snapshots and descriptors: Fork Relay owns shortcut-only angle, target-directed speed, assist, window copy, and landing copy in the climb preset. The adapter projects those values; launcher, HUD, renderer, audio, and effects consume them.
- Dependencies: tether motion, cable launch, traversal vitals/recovery/camera/cues/feedback, anchor descriptors, projected route, route progress, and route-cargo extraction remain composed.
- Core relationship: NexusEngine Core remained read-only at `8b57b03904889cdbc71021d3bdb1d4070af5c8d3`.
- ProtoKit relationship: existing deterministic APIs were sufficient; ProtoKits remained unchanged at `04d34f049f58ae359cf71d43466c429dac2a6d08`.
- Local ownership: authored route content/tuning/copy, bounded route-choice sequencing, browser input, Three.js presentation, HUD, audio, and effects remain experiment-local.
- Exclusions: no new kit, resource, state owner, branch, protection, route family, DOM node, canvas, diagnostic layer, source retirement, or production-count claim.

## Starting State And Baseline Finding

- Experiments started clean and synchronized at `f0f85148a4e8d499ca85b71cd62cbc4837dadac1` on resolved default branch `main`.
- ProtoKits started clean and synchronized at `04d34f049f58ae359cf71d43466c429dac2a6d08` on resolved default branch `main`.
- Baseline play completed Counterwind Gate, Leeward Cradle, Reverse Catch, Counterwind Rest, Signal Cut, Fork Relay, Stormlock, Cacheline, Windglass, and original `anchor-11`, then proved real failure and keyboard retry.
- After Signal Cut, 12 deliberate left-build frames left the prompt at `AMBER ROUTE — Hold pressure to Fork Relay`; no release timing appeared.
- Fork Relay caught in 37 flight/reel ticks, but landing immediately switched to the Stormlock demand with no explicit pressure-carry confirmation.
- Bounded feel scores: responsiveness `8`, predictability `5`, readability `6`, impact `5`, recovery `8`, delight `5`, replay desire `6`; average `6.1`.

## Concrete Refinement

- Fork Relay now authors a shortcut-only minimum angle `1.0`, target-directed angular speed `0.06`, and `+14` aim-assist bonus.
- Before the velocity threshold, the first-screen prompt says `46% PRESSURE — Build left for Fork Relay`.
- At angle `-1.393` and angular velocity `-0.062`, the same descriptor opens `AMBER CARRY WINDOW — Release · fire Fork Relay`.
- The existing cable launcher grants the assist only while Signal Cut is committed, Fork Relay is the target, and both authored thresholds pass.
- Firing emits `signal-pressure-carry-window-fired`; landing emits `signal-pressure-carry-landed`, increases camera impact, plays distinct audio/effects, and reports `Fork Relay locked. 46% pressure carry banked—Stormlock vent is live.`
- Shelter Rise receives no carry assist or event, keeps pressure at zero, earns the same protected grapple, and remains the safe mint line.

## Player Loop Result

- Shortcut approach repeated the baseline build/flight sequence: Gate `19 / 36`, Cradle `21 / 24`, Reverse `34 / 22`, Rest `34 / 27`, Signal Cut `25 / 33`.
- Twelve left-build frames stayed instructional; eight more crossed the authored window. One release/fire then landed Fork Relay in the same 37 ticks as baseline, with 45 pressure after the existing recovery tick and `4.25 / 10` cargo.
- The full shortcut continued through Stormlock Restore, Cacheline High, Windglass Relay score `175`, and original `anchor-11`; route-choice state resolved and generic ascent resumed.
- The safe replay selected Shelter Rise and Fork Relay with zero pressure, one protected grapple, and zero `signal-pressure-carry*` events.
- A deliberate fall reached `dead` with `100%` pressure; physical keyboard `R` restored `swinging`, `alive: true`, `anchor-0`, and zero pressure.

## Final Integration, Cleanup, And Performance

- Authored timing and copy remain declarative. Reusable deterministic tether, launch, route, cargo, and pressure behavior stays behind existing Core/ProtoKit APIs.
- The launcher has one aim path. The shortcut carry extends its existing authored profile; no duplicate launch, target, pressure, state, listener, line, overlay, or descriptor owner was added.
- The renderer reuses the existing Fork Relay mesh, halo, branch lines, bounded spark pool, and camera state. No persistent scene entity was added.
- Human View rejected two screenshots where foreground WebGL tiles erased hero glyphs at the amber window. Cleanup promoted each UI surface above the unpromoted canvas with no new surface or style path; the accepted recapture is fully readable.
- Diagnostics remain closed by default. Playwright proved closed, open, and closed again with 69 DOM nodes and one canvas.
- Three settled post-rejoin samples stayed fixed at `69` DOM nodes, `1` canvas, `76` descriptors, `277` scene nodes, and `32` ledges. Draw calls settled `75 -> 71 -> 71`; triangles settled `11,200 -> 11,052 -> 11,052`.

Matched fresh headed Chromium samples used `950 ms` warm-up, `3.4 s` active `D` input, and a `1440x900` viewport.

| Metric | Before | After |
| --- | ---: | ---: |
| Samples | `97` | `99` |
| Average frame time | `35.19 ms` | `34.71 ms` |
| FPS | `28.42` | `28.81` |
| p95 frame time | `50.10 ms` | `50.00 ms` |
| Long tasks / total | `4 / 313 ms` | `4 / 366 ms` |
| DOM / canvas | `69 / 1` | `69 / 1` |
| Descriptors | `72` | `72` |
| Scene nodes / ledges | `236 / 25` | `236 / 25` |
| Draw calls / triangles | `74 / 11,400` | `69 / 10,908` |
| Point-in-time heap | `45.08 MB` | `56.58 MB` |

- Primary FPS improved `1.4%`; average frame time improved `1.4%`; p95 held. Long-task count did not increase, and no new spike appeared in the primary frame metric.
- Heap is a volatile point-in-time browser signal and is recorded without an improvement claim.

## Feel Scores

| Dimension | Before | After |
| --- | ---: | ---: |
| Responsiveness | 8 | 9 |
| Predictability | 5 | 9 |
| Readability | 6 | 9 |
| Impact | 5 | 9 |
| Recovery | 8 | 8 |
| Delight | 5 | 9 |
| Replay desire | 6 | 9 |
| Average | 6.1 | 8.9 |

## Human View And Playwright Evidence

- `evidence/human-view-before-first-screen.png`
- `evidence/human-view-before-pressure-carry-build.png`
- `evidence/human-view-before-fork-relay-landed.png`
- `evidence/human-view-final-first-screen.png`
- `evidence/human-view-final-pressure-carry-build.png`
- `evidence/human-view-final-pressure-carry-window.png`
- `evidence/human-view-final-fork-relay-landed.png`
- `evidence/human-view-final-shortcut-rejoin.png`
- `evidence/human-view-final-failure.png`
- Surface: game / interactive scene.
- Human perspectives: player readability, objective clarity, feedback feel, camera framing, task completion, failure/retry, debugging-user disclosure, and regression player view.
- Final evidence keeps Advanced closed and shows one owner for build instruction, amber release window, retained pressure, landing confirmation, and next vent demand.

## Validation And Audits

- All `28` existing `tests/next-ledge*.mjs` entrypoints passed.
- All `experiments/next-ledge/src/*.js` files passed `node --check`; production JSON and `git diff --check` passed.
- Browser console reported zero errors and zero warnings; the visible error panel remained hidden.
- Natural-language ownership: Core owns runtime/ECS contracts; ProtoKits own tether, launch, vitals, recovery, camera, cues, feedback, route, resource, cargo, and pressure behavior; the experiment owns authored route descriptors, branch sequence, browser input, Three.js, HUD, audio, effects, and fiction.
- Diversity: this is an in-place refinement of the same stormline fantasy, swing/release verb, pressure loop, interaction structure, and eight-feature signature. It creates no kit, experiment, game, route family, or production count.
- Feature migration: no source, asset, route, kit, readiness layer, environmental system, traversal system, objective, progression path, public API, or other valuable behavior was deleted or retired. `feature-migration-ledger.json` and `retirement-ledger.md` remain unchanged.

## Publication

- Production commit: `e2160861620cfae8edf6b96ebe31d222f76ae40f`.
- ProtoKits push: not required; `main`, `HEAD`, and `origin/main` remain synchronized at `04d34f049f58ae359cf71d43466c429dac2a6d08`.
- Experiments push: production and publication-receipt commits published to resolved default branch `main` after fetch-before-push verification.

## Exact Next Playable Improvement

Make the Stormlock vent drain retained pressure visibly during the reel instead of snapping only on lock, using the existing pressure owner and no new meter.
