# Next Ledge Post-Rest Route Choice

Packet: `2026-07-16-next-ledge-post-rest-route-choice`

Result: validated and published playable feel refinement

Experiment: `experiments/next-ledge/`

Production commit: `38b782940c62c473cb87c65b7235e916f8a9155d`

## Outcome

Counterwind Rest now opens a readable, consequential branch instead of continuing through anonymous generated anchors:

- Mint `Shelter Rise` is the safe recovery ascent. It restores stamina, adds no pressure, skips the unchosen shortcut, and rejoins at `Fork Relay` with 3.5 signal cargo.
- Amber `Signal Cut` is the reward shortcut. It grants a 1.75-unit signal cache, adds 46 fall pressure through the existing pressure facade, skips the unchosen recovery line, and rejoins at `Fork Relay` with 4.25 cargo and 45 retained pressure after recovery tick.
- Both paths preserve the same swing, release, aim, fire, reel, and lock verbs. No first-screen control was added.

## Feel Contract

- Player purpose: make the first post-recovery climb decision trade safety for signal reward.
- Target feeling: immediately legible, tempting, committed, and recoverable.
- Ownership: preset owns authored anchors/tuning; session owns one route-choice state; route-progress, resource, and pressure facades own deterministic mutation; renderer, HUD, effects, and synth consume descriptors/events.
- Exclusions: no browser/input/render/audio/tuning moved into ProtoKits; no Core duplication; no second pressure, cargo, checkpoint, or choice ledger.
- Hero actions: `A / D` swing; `Space / Click` release and fire; `R` retry.
- Advanced actions: pause, retry, next sector, and readiness-layer explanation remain inside the closed `Advanced controls + diagnostic layers` disclosure.
- Resources/state: stamina, signal cargo, fall pressure, current checkpoint, route-choice status/selection, wind stage, and failure/recovery state.
- Events: `post-rest-route-choice-opened`, `post-rest-route-choice-committed`, `route-choice-skipped`, and `post-rest-route-choice-rejoined`, plus existing anchor/cargo/pressure/failure events.
- Methods: existing session `update`, `restart`, route-progress enter/complete, cargo pickup, pressure adjust/recover, and descriptor snapshot surfaces.
- Snapshots/descriptors: `route.postRestChoice`, `routeChoice`, `domain.routeProgress`, `domain.routeCargoExtraction`, composed renderer handoff, and existing HUD/readability descriptors.
- Dependencies: current Nexus Engine Core CDN, current ProtoKit exports, local Three.js renderer/input/HUD/audio adapters.
- Core relationship: Core remains read-only and supplies runtime/kit composition; this change authors no Core behavior.

## Real ProtoKit Composition

The refinement preserves eight meaningful features: `generic-tether-motion-kit`, `generic-cable-launch-kit`, `generic-traversal-vitals-kit`, `generic-traversal-recovery-kit`, `generic-traversal-camera-kit`, `generic-traversal-cue-kit`, `generic-traversal-feedback-kit`, and `generic-route-cargo-extraction-kit` with its route-progress/resource/pressure composition. ProtoKits remained unchanged at `04d34f049f58ae359cf71d43466c429dac2a6d08`; the missing work was authored experiment composition.

## Player Loop Proof

Playwright drove the existing action inputs through Counterwind Gate, Leeward Cradle, Reverse Catch, and Counterwind Rest, then completed both branches:

| Path | Route result | Cargo | Pressure | Recovery |
| --- | --- | ---: | ---: | --- |
| Shelter Rise -> Fork Relay | `safe-recovery`, rejoined | 3.5 / 10 | 0% | stamina restored; unselected shortcut skipped |
| Signal Cut -> Fork Relay | `pressure-shortcut`, rejoined | 4.25 / 10 | 45% | +46 pressure and +1.75 cargo applied by existing facades |
| Miss below sector floor | dead | retained until retry | 100% | existing retry returned sector 2 to live anchor 0 at 0% |

Route-progress and route-cargo snapshots both advanced to `anchor-8` after either rejoin. Advanced disclosure passed closed/open/closed inspection and ended closed. Browser console messages: 0; warnings: 0; errors: 0.

## Feel Scores

| Dimension | Before | After |
| --- | ---: | ---: |
| Responsiveness | 9 | 9 |
| Predictability | 8 | 9 |
| Readability | 7 | 10 |
| Impact | 8 | 10 |
| Recovery | 9 | 10 |
| Delight | 8 | 10 |
| Replay desire | 7 | 10 |
| Average | 8.0 | 9.7 |

## Cleanup And Performance

- Replaced anonymous post-rest anchors with preset-authored descriptors and one session state; no scene-specific route ledger was added.
- Used two fixed branch lines and existing anchor entities. Removed the temporary duplicate branch beacons; the default scene has one readable owner for mint/amber route signaling.
- Hid the unselected branch after commitment. Diagnostic labels and readiness explanations remain Advanced-only and closed by default.
- Explicit HUD compositing keeps the player interface above WebGL foreground layers in Human View.
- Fresh-browser matched warm-up plus active-play measurement: 8.83 -> 8.80 FPS, 113.26 -> 113.68 ms average frame time, DOM 69 -> 69, canvas 1 -> 1, descriptors 76 -> 77, and heap 50.33 -> 32.84 MB.
- Long tasks normalized by window improved from 9.63 -> 8.44 tasks/second and about 1034 -> 960 ms/second. The primary FPS change was -0.4%, safely inside the 10% regression gate; no new aggregate long-task spike appeared.
- Final beacon cleanup reduced the feature scene from 273 to 271 nodes and from 80 to 72-76 active draw calls. Five settled samples remained fixed at 271 scene nodes, 69 DOM nodes, and 77 descriptors; heap warmed from 27.3 MB and plateaued near 31 MB with no unbounded growth.

## Human View Evidence

- [Before: generic post-rest continuation](evidence/human-view-before.png)
- [First screen: hero controls only](evidence/human-view-first-screen.png)
- [Choice open: mint recovery versus amber pressure](evidence/human-view-choice-open.png)
- [Safe path rejoined](evidence/human-view-safe-rejoin.png)
- [Shortcut rejoined](evidence/human-view-shortcut-rejoin.png)
- [Failure](evidence/human-view-failure.png)
- [Recovery](evidence/human-view-recovery.png)

## Validation

- All 28 existing `tests/next-ledge*.mjs` entrypoints passed; no standalone test file was added.
- Changed JavaScript and test entrypoints passed `node --check`; `git diff --check` passed.
- Playwright proved first screen, complete changed approach, open choice, both commitments and rejoin states, failure/retry, Advanced disclosure, settled counts, and zero console messages.
- Natural-language ownership audit passed: authored content/tuning is local data; deterministic shared route/cargo/pressure behavior stays in existing DSK facades; browser/input/render/HUD/audio remain local adapters.
- Diversity audit passed: this is one in-place legacy experiment refinement with the existing eight-feature signature; no production experiment or duplicate signature was claimed.
- Feature-migration audit passed: no source, system, scene, asset, API, or behavior was deleted or retired, so `feature-migration-ledger.json` and `retirement-ledger.md` require no entry.

## Git And Publication

- Core read-only: `8b57b03904889cdbc71021d3bdb1d4070af5c8d3`
- ProtoKits start/final: `04d34f049f58ae359cf71d43466c429dac2a6d08` (clean, synchronized, unchanged)
- Experiments start: `b3b9553e3ee495a66debe9cf3509134a62b31597`
- Experiments production: `38b782940c62c473cb87c65b7235e916f8a9155d` (published to `origin/main`)

## Exact Next Playable Improvement

Carry the chosen route consequence through the first post-rejoin restore: Shelter Rise grants one protected grapple window, while Signal Cut retains visible pressure until a deliberate vent opportunity. Use the existing recovery and pressure owners and add no new control.
