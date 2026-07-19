# Hellscape Crystal Sentry Choice

Status: validated playable production unit; production published; receipt pending
Packet ID: `2026-07-19-hellscape-crystal-sentry-choice`
Experiment-game: `games/rogue-lite-hellscape-siege/`
Run type: bounded legacy-game feel refinement; no production-count claim

## Player Outcome

After the stocked first wall, Siege 1, Grove/Ashes harvest, Emberplate forge, and Siege 2, the surviving fortification now unlocks one readable Crystal Sentry choice. Crystal alone supplies the visible `5 crystal + 3 energy` recipe. The existing `B` build action deploys exactly one Sentry at a descriptor-authored core-side anchor, and the existing Canvas/HUD owners show its 310-range defensive role before Siege 3.

Player purpose: convert earned Emberplate survival into a specialist defense decision and make the Crystal realm's first strategic use self-contained.
Target feeling: earned, obvious, potent, and immediately testable under real siege pressure.

## Bounded Feature Contract

- Ownership: local deterministic `createBuildKit` owns eligibility, cost, selection, placement, completion, and the Sentry descriptor; local `createWaveAndDefenseKit` owns the post-clear unlock, targeting, damage, failure, and same-wave retry; local HUD and Canvas renderer consume the descriptor.
- Exclusions: browser keyboard wiring, frame timing, DOM, Canvas drawing, labels, color, camera, and route fiction stay local presentation concerns. No Core or shared ProtoKit behavior changed.
- Actions: existing `WASD` move, `B` build/fortify/deploy, `E` realm/core interaction, and `Space` strike. Advanced blueprint cycling remains under the default-closed disclosure and is not required by this path.
- Resources/state: one surviving `emberplate-wall`, two secured sieges, `5 crystal`, `3 energy`, existing inventory/build/structure/combat/wave/core resources, and no new state owner.
- Events: existing `structure.built`, `wave.started`, `fx.flash`, `fx.shake`, and `fx.beam`; no new event type.
- Methods: existing `build.select`, `build.place`, `waves.start`, and `waves.strike`, plus the build-owned `getSentryChoiceState` query.
- Snapshot/descriptor: `state.sentryChoice` reports unlock, cost, collected/missing materials, readiness, selection, completion, one authored placement anchor, and range. The renderer does not recompute progression truth.
- Dependencies: the existing local nine-kit Hellscape composition—input, FX, avatar, inventory, realm, harvest/pickup, build, wave/defense, and the unifying Hellscape sequence. The coherent hero slice directly uses seven meaningful features: movement/input, realm travel, harvesting, inventory spending, structure mutation, wave defense, and FX/descriptor feedback.
- Core relationship: the route keeps its current Nexus Engine runtime import and descriptor-only presentation boundary. Core remained read-only.
- ProtoKit composition: no reusable deterministic gap was found; the bounded behavior belongs to the existing Hellscape build/wave owners, so NexusEngine-ProtoKits remained unchanged.

## Before Finding

Physical baseline play reached the post-Emberplate Crystal return with `1 wood`, `6 crystal`, and `8 energy`. The existing Sentry cost still required `2 wood`, the build owner still selected the wall, and the hero HUD only offered Siege 3. The player could not infer that another Grove trip plus the Advanced-only `2` key were required. The intended choice therefore existed as hidden catalog potential, not a playable basic-loop decision.

Bounded-slice feel score before: responsiveness `9`, predictability `6`, readability `5`, impact `7`, recovery `9`, delight `6`, replay desire `6`; average `6.9`.

## Concrete Refinement

- Authored one post-fortification Sentry recipe in the existing local tuning data.
- Made Crystal's route output fully fund the recipe without a second realm trip.
- Derived unlock from a surviving Emberplate wall plus two wave clears, then reused the existing build selection and `B` action.
- Added one readable Crystal-route objective, material progress, ready ghost, core-side placement anchor, online ring/range label, and active turret fire through the existing HUD/Canvas owners.
- Preserved exactly one Sentry and one Canvas; no new control, DOM overlay, state resource, or event type was introduced.
- Replayed through Siege 3 and observed the Sentry fire under pressure.

Bounded-slice feel score after: responsiveness `9`, predictability `9`, readability `10`, impact `9`, recovery `9`, delight `9`, replay desire `9`; average `9.1`. Whole-route quality moves `91 -> 94`, with whole-route feel `9.1 -> 9.4`.

## Final Integration, Cleanup, and Performance

- Moved placement from a player-relative ghost that stacked on Emberplate to one authored core-side anchor in the descriptor.
- Consolidated progression into the existing build/wave/inventory/structure owners and removed the need for an Advanced blueprint-select step.
- Restored the starter wall as the selected recovery action when failure leaves no wall, preventing the specialist recipe from blocking same-wave rebuild.
- Default view remains `52` DOM nodes, one Canvas, Advanced closed, and diagnostics false. Opening diagnostics once initializes the existing `113`-node diagnostic surface; closing it restores diagnostics false with no duplicate Canvas or visible diagnostic owner.
- Paired starting-commit/current active-play measurement under the same 30 Hz browser condition: average frame time `33.333 -> 33.335 ms` (`30.000 -> 29.998 FPS`, `+0.006%` frame-time change), p95 `34.3 -> 34.2 ms`, `52` DOM nodes, one Canvas, `214` active descriptor IDs, and zero long tasks in both samples.
- Current steady-state checkpoints stayed bounded at `52/52/52` DOM nodes, `1/1/1` Canvas, and `197/197/197` idle descriptor IDs; heap samples `10,085,896 -> 10,115,089 -> 8,958,809` bytes showed no unbounded growth.

## Human View and Playwright Evidence

- `evidence/human-view-before-first-screen.png`
- `evidence/human-view-before-crystal-return.png`
- `evidence/human-view-final-first-screen.png`
- `evidence/human-view-final-sentry-online.png`
- `evidence/human-view-final-sentry-active.png`
- `evidence/human-view-final-failure-recovery.png`

Playwright physically completed build, Siege 1, Grove/Ashes harvest, Emberplate forge, Siege 2, Crystal harvest/return, Sentry deployment, and Siege 3. A targeted failure probe then breached the core without a surviving wall, proved starter stock plus wall selection were restored, physically rebuilt with `B`, and retried Siege 1 with `E`. Advanced closed/open/closed and the browser console reported zero warnings and zero errors.

## Validation

- Existing `tests/hellscape-siege-cdn-state-input-smoke.mjs` now proves the composed deterministic unlock, Crystal-only cost, auto-selection, authored placement, exactly-one deployment, and wall-first failure recovery.
- All `22` existing Hellscape test entrypoints, affected JavaScript syntax, production JSON parsing, and owned-diff hygiene passed.
- Feature-migration audit: no source, mechanic, scene, system, asset, API, or route was removed; `feature-migration-ledger.json` and `retirement-ledger.json` remain unchanged.
- Diversity audit: this deepens the existing seven-feature Hellscape action-defense/extraction signature and adds no kit, experiment, route family, production signature, or production count.
- Natural-language ownership audit: deterministic recipe/unlock/place/recovery remains in local build/wave services; authored tuning remains data; browser/input/render/presentation remains local; Core remains read-only; ProtoKits remains unchanged.

## Publication

- Starting commits: Core read-only `a5882b47bd5a9284550bb3af1f0cd8580c62665e`; ProtoKits `194d37714d7c23984970e09015b5dd4bffbbab7b`; Experiments `d5b3ba42d377da6744ef61cec857e5dbfb29f035`.
- Experiments production commit: `453d76e4981b35aadf4988d91751045ab006c7c7`.
- Experiments receipt/final commit: this publication-receipt commit.
- ProtoKits: unchanged and synchronized at `194d37714d7c23984970e09015b5dd4bffbbab7b` after final fetch.
- Push: production commit published to resolved default branch `main` after fetch-before-push verification; this receipt update follows.

Exact next playable improvement: let Crystal overflow after the first Sentry fund one bounded in-place overcharge for Siege 3 through the existing inventory, build, turret cooldown, wave, HUD, and Canvas owners without another control, state owner, or visible diagnostic layer.
