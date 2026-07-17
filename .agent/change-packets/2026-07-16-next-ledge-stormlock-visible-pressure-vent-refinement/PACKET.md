# Next Ledge Stormlock Visible Pressure Vent Refinement

Packet: `2026-07-16-next-ledge-stormlock-visible-pressure-vent-refinement`

Status: validated; publication pending

Experiment: `experiments/next-ledge/`

## Intent And Ownership

- Player fantasy: carry a dangerous amber signal charge into Stormlock and feel the restore unit bleed that pressure away while the cable physically reels home.
- Hero verb: build swing, release, fire, and commit to the catch; no control is added.
- Target feeling: the Stormlock latch starts a readable stepped vent, the existing fall-pressure meter visibly falls during the reel, and lock lands with a sharp zero-pressure confirmation.
- Pressure loop: Signal Cut and Fork Relay retain the existing 46-pressure shortcut; Stormlock drains that same channel rather than introducing another meter or state owner.
- Objective: read the amber vent demand, latch Stormlock, watch the risk fall during approach, then continue into Cacheline High.
- Failure and recovery: cutting the line or missing before latch preserves the existing danger; the physical `R` retry remains the recovery path.
- Visual identity: the existing amber consequence line, Stormlock beam, pressure meter, bounded spark pool, camera, and audio carry the vent cadence.
- Interaction structure: `A / D`, `Space / Click`, and `R` remain the only first-screen hero controls. Advanced diagnostics remain closed by default.
- Selected ProtoKit features: generic tether motion, cable launch, traversal vitals, traversal recovery, traversal camera, traversal cues, traversal feedback, and generic route-cargo extraction with its route-progress, resource, and pressure children.
- Core relationship: NexusEngine Core is read-only and retains runtime, simulation, camera, graphics-descriptor, and UI-descriptor authority.
- Reusable-versus-local ownership: the ProtoKit pressure facade remains the sole pressure owner. Authored vent cadence/copy, route-choice sequencing, browser input, Three.js, HUD, audio, and effects remain local.

## Human View Route

- Surface: game / interactive scene.
- Primary human task: recognize the live vent target, commit the grapple, see retained pressure fall before lock, and trust the zero-pressure confirmation.
- Perspectives: player readability, objective clarity, feedback feel, camera framing, task completion, failure/retry, debugging-user disclosure, performance, and regression player view.
- Techniques: launch inspection, before/after screenshots, input-driven shortcut walkthrough, failure/retry, Advanced closed/open/closed, console review, stable counts, and matched warm-up plus active-play performance sampling.

## Starting State

- Experiments: `98fb9ae0cb72d7eb817f79a7b055cb15dd0747fb` on resolved default branch `main`.
- ProtoKits: `04d34f049f58ae359cf71d43466c429dac2a6d08` on resolved default branch `main`.
- Core local read-only: `8b57b03904889cdbc71021d3bdb1d4070af5c8d3`.

Core advanced independently during this read-only unit and finished clean at `70cc2a1590677b872d40a42f7b7bb7e174941eb0`; no Core file was changed by this run.

## Baseline Finding

- The shortcut reached Fork Relay with `45%` retained pressure and clearly demanded Stormlock Restore.
- Release/fire added normal traversal pressure, so Stormlock began reeling at `48%`. Twelve reel ticks left the pressure unchanged at `48%`, the hero prompt stayed generic `Latch incoming`, and the pressure snapped to zero only when the lock event fired.
- Baseline Human View showed the right target and risk but no intermediate vent progress, anticipation, or impact cadence.
- Bounded feel scores: responsiveness `8`, predictability `6`, readability `5`, impact `5`, recovery `8`, delight `5`, replay desire `6`; average `6.1`.

## Concrete Refinement

- Stormlock authors `4` vent pulses and a `0.12` reel-start threshold in the climb preset; the adapter projects those fields into the existing anchor descriptor.
- The existing reeling state records its initial rope length and derives one normalized vent progress value while the same cable shortens. Four bounded semantic `post-rejoin-pressure-vent-pulsed` events are the only new deterministic output.
- The existing route-cargo pressure facade consumes each pulse as an idempotent recovery command. The final lock event only carries the unused authored recovery remainder, so the pressure channel has one owner and cannot double-recover.
- The existing fall-pressure meter remains the only numeric pressure display. Cleanup changed route copy to `Stormlock vent pulse 2/4` after Human View found authored rounded pressure disagreed with the authoritative meter.
- The existing consequence line fades as risk falls, the existing Stormlock beam brightens, and the bounded spark pool, camera trauma, and synth consume the pulse event. No persistent entity, listener, overlay, meter, or debug surface was added.

## Player Loop Result

- Input-driven sector two completed Counterwind Gate, Leeward Cradle, Reverse Catch, Counterwind Rest, Signal Cut, and Fork Relay, carrying the authored `46` shortcut pressure into the Stormlock demand.
- Stormlock emitted exactly four `11.5`-point recoveries. The live pressure channel visibly stepped from the post-release `48` through `36.5`, `25`, `13.5`, and zero before the lock completed; Human View captured pulse `2/4` with the HUD and meter both reporting `25%`.
- The shortcut continued to Cacheline High in one launch, then reached Windglass Relay and scored `{ metric: "cargo-mastery", value: 175 }` before a deliberate generic-rejoin miss produced the real dead state.
- With the runtime loop active, physical keyboard `R` restored `mode: swinging`, `alive: true`, sector `2`, `anchor-0`, and zero fall pressure.
- The safe Shelter Rise descriptor, protection path, Slipstream payoff, and all branch resources remain unchanged; the vent guard requires shortcut role, consequence-active status, vent-required state, and the authored Stormlock anchor.

## Final Integration, Cleanup, And Performance

- Authored cadence and copy remain declarative; reusable tether, launch, recovery, route, cargo, and pressure behavior stays behind existing Core and ProtoKit APIs.
- One `routeChoice` vent progression extends the existing consequence state. One pressure facade owns numeric recovery. One event stream feeds the existing renderer, HUD, camera, audio, and effect paths.
- Cleanup removed the competing rounded status percentage, leaving the authoritative meter as the single numeric signal and pulse-stage copy as the cadence signal.
- Advanced and diagnostic controls remain closed by default. Closed/open/closed disclosure held `69` DOM nodes, one canvas, and `72` descriptors.
- Five warm steady-state samples held `69` DOM nodes, one canvas, `72` descriptors, `236` scene nodes, `25` ledges, and `56` geometries. Draw calls remained bounded from `72` to `78`; heap cycled from `38.26` to `39.69` to `30.12` to `32.53` to `27.27 MB`, showing reclamation rather than unbounded growth.

Matched fresh headed Chromium samples used a `950 ms` warm-up, `3.4 s` active `D` input, and a `1440x900` viewport.

| Metric | Before | After |
| --- | ---: | ---: |
| Samples | `67` | `74` |
| Average frame time | `51.00 ms` | `46.36 ms` |
| FPS | `19.61` | `21.57` |
| p95 frame time | `67.60 ms` | `66.60 ms` |
| Long tasks / total | `19 / 1170 ms` | `7 / 778 ms` |
| DOM / canvas | `69 / 1` | `69 / 1` |
| Descriptors | `72` | `72` |
| Scene nodes / ledges | `236 / 25` | `236 / 25` |
| Draw calls / triangles | `76 / 11,140` | `75 / 12,168` |
| Point-in-time heap | `32.68 MB` | `54.17 MB` |

- Primary FPS improved `10.0%`, average frame time improved `9.1%`, p95 improved `1.5%`, and long-task count/duration fell. Triangles increased `9.2%`, below the `10%` budget, while scene/entity counts remained fixed.
- Point-in-time heap is volatile and carries no improvement claim; the subsequent ten-second window reclaimed below its first sample and showed no steady-state growth.

## Feel Scores

| Dimension | Before | After |
| --- | ---: | ---: |
| Responsiveness | 8 | 9 |
| Predictability | 6 | 9 |
| Readability | 5 | 9 |
| Impact | 5 | 8 |
| Recovery | 8 | 8 |
| Delight | 5 | 8 |
| Replay desire | 6 | 8 |
| Average | 6.1 | 8.4 |

## Human View And Playwright Evidence

- `evidence/human-view-before-first-screen.png`
- `evidence/human-view-before-stormlock-demand.png`
- `evidence/human-view-before-stormlock-reel.png`
- `evidence/human-view-before-stormlock-mid-reel.png`
- `evidence/human-view-final-first-screen.png`
- `evidence/human-view-final-stormlock-demand.png`
- `evidence/human-view-final-stormlock-mid-vent.png`
- `evidence/human-view-final-stormlock-secured.png`
- Surface: game / interactive scene.
- Human perspectives: player readability, objective clarity, feedback feel, camera framing, task completion, failure/retry, debugging-user disclosure, performance, and regression player view.
- Final Human View keeps Advanced closed and shows hero controls on the first screen, one amber vent target, one authoritative pressure meter, pulse-stage cadence, readable reel framing, and a zero-pressure secured state.

## Validation And Audits

- All `28` existing `tests/next-ledge*.mjs` entrypoints passed.
- All `experiments/next-ledge/src/*.js` files passed `node --check`; affected production JSON and `git diff --check` passed.
- Browser console reported zero errors and zero warnings; the visible error panel remained hidden.
- Natural-language ownership: Core owns runtime/ECS contracts; ProtoKits own tether, launch, vitals, recovery, camera, cues, feedback, route, resource, cargo, and pressure behavior; the experiment owns authored cadence/copy, route-choice sequencing, browser input, Three.js, HUD, audio, effects, and fiction.
- Diversity: this is an in-place refinement of the same stormline fantasy, swing/release verb, pressure loop, interaction structure, and eight-feature signature. It creates no kit, experiment, game, route family, or production count.
- Feature migration: no source, asset, route, kit, readiness layer, environmental system, traversal system, objective, progression path, public API, or other valuable behavior was deleted or retired. `feature-migration-ledger.json` and `retirement-ledger.md` remain unchanged.

## Publication

- Production commit: pending.
- ProtoKits push: not required; `main`, `HEAD`, and `origin/main` remain synchronized at `04d34f049f58ae359cf71d43466c429dac2a6d08`.
- Experiments push: pending fetch-before-push publication to resolved default branch `main`.

## Exact Next Playable Improvement

Keep the final zero-pressure Stormlock confirmation visible for one short branch-aware beat before the Cacheline or Slipstream payoff instruction replaces it, using the existing route-choice sequence and no new state owner.
