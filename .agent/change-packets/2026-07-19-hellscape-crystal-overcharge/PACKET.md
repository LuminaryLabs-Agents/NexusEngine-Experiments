# Hellscape Crystal Overflow Overcharge

Status: validated playable production unit; publication pending
Packet ID: `2026-07-19-hellscape-crystal-overcharge`
Experiment-game: `games/rogue-lite-hellscape-siege/`
Run type: bounded legacy-game feel refinement; no production-count claim

## Player Outcome

The one Crystal left after the first Sentry is now a readable Siege 3 decision. The existing `B` build action spends that shard in place, arms exactly six `30`-damage shots at a `0.3s` cooldown, and returns to the normal `16`-damage / `0.68s` Sentry cadence when the bounded surge is spent. The same HUD, Canvas Sentry, beam, flash, shake, particle, inventory, build, wave, and turret owners present the choice and impact.

Player purpose: turn guaranteed Crystal overflow into an earned opening volley instead of dead inventory.
Target feeling: obvious, charged, forceful, finite, and worth replaying before Siege 3.

## Human View Route Packet

- Surface: game / interactive Canvas scene.
- Primary human task: deploy the earned Sentry, notice one leftover Crystal, arm it with the existing `B` action, survive Siege 3, and recover if the wall falls.
- Selected perspectives: player readability, feedback feel, objective clarity, regression player, and debugging user.
- Validation techniques: launch inspection, before/after screenshots, physical keyboard walkthrough, Advanced closed/open/closed, console review, deterministic browser-visible state inspection, and matched active performance measurement.
- Before evidence: the first screen, post-Sentry dead `SENTRY ONLINE` action, unused one Crystal, and normal Siege 3 Sentry state.
- After evidence: overcharge ready, armed, active purple shot, Siege 3 completion, successful wall-loss rebuild prompt, and failure/rebuild/retry.
- Perspective result: pass. The player can read the shard spend, finite shot count, active surge, spent state, and next recovery action without opening diagnostics.

## Bounded Feature Contract

- Ownership: local deterministic `createBuildKit` owns eligibility, cost, activation, the nested Sentry descriptor, and post-clear wall selection; local `createWaveAndDefenseKit` consumes the authored shot damage/cooldown/count and preserves wave clear/failure/retry; the existing HUD and Canvas renderer consume the descriptor.
- Exclusions: keyboard wiring, frame timing, DOM, Canvas drawing, color, labels, camera, and route fiction remain local presentation. No Core or ProtoKit behavior changed.
- Actions: existing `WASD`, `B`, `E`, and `Space`; no new input or first-screen control.
- Resources/state: one overflow Crystal plus bounded fields on the existing Sentry structure; no new world resource or parallel progression owner.
- Events: existing `fx.beam`, `fx.flash`, `fx.shake`, `fx.burst`, `inventory.spent`, and `structure.built`; no new event type.
- Methods: existing build and wave facades, extended by one build-owned `overcharge()` action consumed by the existing `B` input path.
- Snapshot/descriptor: `state.sentryChoice.overcharge` carries authored cost, target wave, damage, cooldown, total/remaining shots, readiness, completion, active state, and color. HUD and Canvas do not recompute progression truth.
- Dependencies: the existing nine local Hellscape kits—input, FX, avatar, inventory, realm, harvest/pickup, build, wave/defense, and sequence. The coherent loop materially uses movement/input, harvesting, inventory spend, build mutation, turret cooldown, wave pressure, recovery, and descriptor/FX feedback.
- Core relationship: Nexus Engine remains read-only runtime authority. This is game-specific authored progression over existing local deterministic owners, not a Core primitive.
- ProtoKit composition: no reusable renderer-agnostic gap was found; NexusEngine-ProtoKits remains unchanged.

## Before Finding And Feel

Physical play completed the starter build, Siege 1, Grove/Ashes materials, Emberplate, and Siege 2, with breach/rebuild recovery observed. A matched post-Siege-2 setup then physically deployed the Sentry and proved the guaranteed `1 crystal` remainder. The first screen exposed only `SENTRY ONLINE` and “start Siege 3”; the leftover resource had no action, purpose, feedback, or replay value.

Bounded-slice feel before: responsiveness `9`, predictability `6`, readability `5`, impact `7`, recovery `9`, delight `6`, replay desire `7`; average `7.0`.

## Concrete Refinement

- Added one declarative `postSentryOvercharge` descriptor: `1 crystal`, Siege `3`, six shots, `30` damage, `0.3s` cooldown, and one Crystal color.
- Nested readiness and shot evidence under the existing Sentry choice descriptor.
- Routed `B` through the existing build owner: deploy first, then overcharge in place.
- Reused turret cooldown and damage resolution; each shot consumes one bounded charge and emits existing beam/flash/shake/burst feedback.
- Replaced the dead action with `OVERCHARGE`, `SURGE ARMED`, active `n/6` shot feedback, and `SURGE SPENT` on the same Sentry.
- Removed the stale post-deploy build ghost instead of layering another overlay.
- Converted a physically observed post-Siege-3 wall loss into a basic-flow repair: the existing build owner now selects the wall, the HUD exposes `REBUILD STOCK`, and rebuilt structures receive collision-free monotonic IDs.

Bounded-slice feel after: responsiveness `9`, predictability `9`, readability `10`, impact `10`, recovery `10`, delight `10`, replay desire `9`; average `9.6`. Whole-route quality moves `94 -> 96`; whole-route feel `9.4 -> 9.6`.

## Final Integration, Cleanup, And Performance

- Authored tuning remains data; deterministic spend/shot/recovery behavior remains inside the existing build/wave services; browser/input/render presentation remains local.
- One nested Sentry descriptor replaced any need for a new meter, timer, event, DOM node, Canvas, material owner, or diagnostic panel.
- The spent Sentry suppresses the superseded player-relative build ghost. Default diagnostics remain false and Advanced remains closed.
- Matched active Siege 3 browser window: average frame time `16.6666 -> 16.6641 ms` (`60.000 -> 60.009 FPS`, `-0.015%`), p95 `17.6 -> 17.4 ms`, `52` DOM nodes, one Canvas, `192 -> 203` active descriptor IDs, and zero long tasks. The primary metric did not regress.
- Matched heap sample moved `11,963,692 -> 12,618,125` bytes (`+5.47%`). Three idle post-cleanup checkpoints stayed bounded at `52/52/52` DOM nodes, `1/1/1` Canvas, `179/179/179` descriptor IDs, two structures, zero FX residue, and non-monotonic heap `16,657,177 -> 11,204,305 -> 14,258,837` bytes.
- Physical Siege 3 play spent all six charges, then completed the wave with `CORE 284`, `WARDEN 26`, ten player kills, and the surviving Sentry. The observed wall loss now leads to a first-screen rebuild route instead of an Advanced-only blueprint escape.

## Human View And Playwright Evidence

- `evidence/human-view-before-first-screen.png`
- `evidence/human-view-before-crystal-overflow.png`
- `evidence/human-view-before-siege-three.png`
- `evidence/human-view-final-first-screen.png`
- `evidence/human-view-final-overcharge-ready.png`
- `evidence/human-view-final-overcharge-armed.png`
- `evidence/human-view-final-overcharge-active.png`
- `evidence/human-view-final-wall-rebuild.png`
- `evidence/human-view-final-failure-recovery.png`

Playwright used real keyboard input for build, movement, siege start/retry, combat, realm travel, harvest, Sentry deployment, overcharge, wall rebuild, and recovery. It captured the purple active beam at `5/6` charges, completed Siege 3, proved a successful wall-loss rebuild with unique structure IDs, checked Advanced closed/open/closed, and reported zero console warnings/errors.

## Audits

- Natural-language ownership audit: authored tuning stays data; deterministic eligibility/spend/shot/recovery stays inside local build/wave services; the existing Sentry structure is the only shot-state owner; HUD/Canvas only consume descriptors; Core is read-only; ProtoKits is unchanged.
- Diversity audit: this deepens the existing seven-feature Hellscape action-defense/extraction signature and adds no kit, experiment, route family, production signature, or production count.
- Feature-migration audit: no source, mechanic, scene, system, asset, public API, or route was removed; the feature-migration and retirement ledgers remain unchanged.
- Diagnostics audit: default `52`-node player view, one Canvas, diagnostics false, Advanced closed; opening diagnostics once creates the existing `113`-node hidden support surface and closing restores diagnostics false without a duplicate Canvas.

## Validation

- Existing `tests/hellscape-siege-cdn-state-input-smoke.mjs` proves the overflow cost, one-time activation, bounded shot count, heavy damage, fast cooldown, Crystal beam color, Siege 3 clear ownership, wall-first successful-clear recovery, real rebuild, and unique structure IDs.
- Affected syntax, all `22` existing Hellscape entrypoints, production JSON parsing, owned-diff hygiene, and the full repository `npm run check` passed. The repository gate syntax-checked `1,038` JS/MJS files and completed the static, gameplay, CDN/state-input, and named-route checks without an error.

## Publication

- Starting commits: Core read-only `a5882b47bd5a9284550bb3af1f0cd8580c62665e`; ProtoKits `194d37714d7c23984970e09015b5dd4bffbbab7b`; Experiments `9e516580bd9e0827ae4b8c90a64c7f9e75b8d19e`.
- Experiments production commit: pending.
- Experiments receipt/final commit: pending.
- ProtoKits: unchanged at `194d37714d7c23984970e09015b5dd4bffbbab7b`; synchronized before publication.
- Push: pending final fetch-before-push verification and publication.

Exact next playable improvement: refine Signal Bastion's older `8.6` feel baseline with one readable post-clear second-command choice between upgrading the starter line and adding a specialist tower, reusing its economy, session, wave-preview, descriptor, HUD, and Canvas owners without another first-screen control or state owner.
