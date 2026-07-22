# Change Packet — SAT-005 Projection Behavior Promotion

Status: validated / reconciled / publication-ready
Date: 2026-07-22

## Result and Bounded Contract

Counterweight Cathedral advanced exactly one abstraction stage from the frozen implementation contract to validated reusable behavior. ProtoKits now package-exports `physics-body-weight-source-projection-kit`; no Counterweight Cathedral runtime source, consumer, player-visible feature, migration, purge, or new experiment changed.

- Current artifact: SAT-005 Counterweight Cathedral.
- Source / target: implementation -> behavior.
- Player fantasy: tune a suspended cathedral mobile into exact balance.
- Hero verb: shift and settle a physical counterweight.
- Semantic boundary: one authoritative Physics Body Lite snapshot -> one same-id Weighted Trigger source upsert.
- Current consumer: Counterweight Cathedral.
- Plausible consumers: body-driven pressure plates, cargo/vehicle mass sensors, and reusable balance scales.
- Quality bar: deterministic command behavior plus preserved diagnostics-closed playable parity.
- Performance budget: 60 target FPS, at most 20 ms average, at most 30 ms p95, at most 85 DOM nodes, one Canvas, zero active-play long tasks, and less than 10% primary-metric regression.
- Required proof: targeted behavior, package self-import, real-engine composition, full ProtoKits check, pointer and keyboard player loops, deterministic replay, disclosure closure, Human View, console, and bounded telemetry.

## Implemented Behavior

`engine.n.weightedTrigger.sourceIngestion.projectPhysicsBody({ bodyId, tags, disabled })`

- ProtoKits commit: `e803b7e3fad75c41dc79d754851eb4a7e6a02d25`.
- Kit/factory/export: `physics-body-weight-source-projection-kit` / `createPhysicsBodyWeightSourceProjectionKit` / `./physics-body-weight-source-projection-kit`.
- Requires: `physics:body-lite` and `trigger:weighted`.
- Provides: `trigger:weighted-source-ingestion:physics-body`.
- Reads only `engine.n.physicsBodyLite.getBody(bodyId)` and writes only `engine.n.weightedTrigger.setWeightSource(source)`.
- Authoritative id, cloned position, and mass ignore caller override attempts; string tags and disabled normalize deterministically.
- Missing/unknown bodies return serializable `body-id-required` / `physics-body-not-found` results without mutation.
- Repeated projections replace the same source id. Returned values are serializable and clone-isolated.
- The behavior owns no resources, events, systems, snapshots, descriptors, alias, reset, state, settled policy, lifecycle, or tick.

## Ownership and Capability Decisions

- Core owns engine installation and deterministic ticks; no matching Core bridge exists at pinned `a5882b47bd5a9284550bb3af1f0cd8580c62665e`.
- Physics Body Lite owns body facts; Weighted Trigger owns source storage, aggregation, activation, events, descriptors, and endpoint lifecycle.
- Counterweight Cathedral keeps settled eligibility, invocation timing, authored arrangement, overload/exact outcomes, browser input, rendering, diagnostics, and restart.
- `syncStone` and `settle` remain migration inputs, not separate capabilities. No alias, duplicate state, lifecycle, configuration, event, listener, render path, broad puzzle domain, or mobile domain was added.
- The behavior is one implemented promotion, not a newly accepted atomic capability.
- Kit-level README, manifest, status matrix, map, promotion-ledger, and catalog reconciliation remain the exact next-stage gap.

## Player Loop and Parity

`select stone -> read target -> shift -> settle -> inspect weight -> overload/restart or exact balance -> replay`

- Experiment-game parity owner: `experiments/counterweight-cathedral/`.
- New/upgraded status: reusable behavior only; hero feature unchanged.
- Real features used: Core installation/tick lifecycle; Physics Body Lite bodies, impulses, snapshots, and descriptors; Weighted Trigger sources, aggregation, activation, state, events, and descriptors.
- Pointer route: Three-weight shifted to Dawn and settled for a visible `3 / 2` overload, then recovered through Restart.
- Keyboard route: Two at Dawn, Three at Zenith, and One at Vesper completed exact balance.
- Replay: byte-identical 2,576-byte endpoint-domain state and 3,470-byte public state.
- Advanced: `closed -> open -> closed`; diagnostics closed in all published screenshots.
- Console: zero messages, errors, or warnings.

## Human View and World-First Gate

- Surface/task: browser game; identify target bowls, shift and settle, recover overload, finish exact balance, and replay.
- Perspectives: player readability, objective clarity, feedback/feel, camera framing, and regression player.
- Techniques: launch inspection, real pointer/keyboard walkthrough, diagnostics-closed screenshots, control-hierarchy scan, world-only test, and runtime regression.
- Behavioral verdict: PASS across enter, understand, act, feedback, pressure, failure/recovery, completion, and replay.
- Presentation verdict: FAIL, unchanged pre-existing debt. Offenders are the upper-left hero/control card, upper-right stone cards, lower-left status card, lower-center bowl strip, centered terminal card, and lower-right Advanced shell.
- World replacements: cathedral framing and bowl motion/light for purpose; rail/bowl affordances for action; stone form/material for identity/mass; bowl/world response for progress; fracture/drop plus camera/audio for overload; sculpture transformation/chord for exact balance; contextual restart only after outcome.
- Smallest later presentation edit: remove the persistent right stone cards and bottom status/bowl strips, put selection/weight facts on stones and bowls, then replay.
- No overlay was removed and no exception was claimed because this stage is structural. Presentation completion remains withheld.

Evidence:

- `evidence/diagnostics-closed-active-play.png`
- `evidence/pointer-overload-loss.png`
- `evidence/keyboard-exact-success.png`

## Feel and Performance

- Preserved feel: responsiveness 8, predictability 9, readability 9, impact 8, recovery 8, delight 8, replay desire 8; average 8.29.
- Authoritative baseline: 16.594 ms average, 60.26 FPS, 17.7 ms p95, 77 DOM nodes, one Canvas, zero long tasks.
- Stable warm-up: 1,200 frames, 16.667 ms average, 60 FPS, 17.8 ms p95, 77 DOM nodes, one Canvas, one buffered page-load/CLI long task, 7,538,523 / 13,856,307 used/total JS heap bytes.
- Active play: 1,200 frames, 16.667 ms average, 60 FPS, 17.9 ms p95, 77 DOM nodes, one Canvas, 3 bodies, 3 sources, 6 descriptors, zero active-window long-task delta, 7,170,565 / 14,120,553 used/total JS heap bytes.
- Baseline delta: average `+0.440%`, FPS `-0.431%`, p95 `+1.130%`; all pass the 10% budget. Playable bytes are unchanged, so change-induced regression is 0%.
- No unbounded DOM, entity, descriptor, active long-task, or memory-growth signal appeared.

## Validation

- Existing ProtoKits targeted smoke passed command failures, authoritative projection, normalization, idempotence, clone isolation, serializability, zero tick, zero owned surfaces, and real installed NexusEngine composition.
- Package self-export import passed.
- Full ProtoKits `npm run check` passed across 688 JavaScript modules, manifests, boundaries, performance checks, documentation checks, and the complete existing test suite.
- The full check reported 804 nonblocking legacy warnings; the two new expected warnings identify the uncompleted README and manifest work reserved for behavior -> kit.
- Playwright at 1440 x 900 completed pointer overload/restart, keyboard exact success, deterministic replay, disclosure, telemetry, and a zero-message console.
- Human View inspected all three diagnostics-closed evidence frames and returned behavioral PASS plus the exact pre-existing presentation FAIL.
- Runtime SHA-256 remains `3cb22a1...` for the application kit, `a92a1bb...` for main JavaScript, and `8259099...` for HTML.

## Migration, Purge, and Publication Audits

- Ownership: pass; every deterministic fact retains one canonical owner.
- Diversity: pass; pressure-plate, cargo/vehicle, and balance-scale policies remain distinct.
- Migration: intentionally not run; behavior-to-kit promotion is next and the consumer remains pinned.
- Purge: fail-closed; kit readiness, consumer migration, reference cleanup, successor parity, retirement evidence, and recovery publication are incomplete.
- Capability count: 17 mapped; 2 Core-reused, 2 domain-reused, 0 newly accepted, 1 merged duplicate, 3 specializations, 5 adapters, 4 local-only, 2 rejected; 1 selected contract and 1 implemented behavior promotion.
- Experiments start: `d9ce1bbbba00e51da5fecb8aaa714d8a9799a9d7` on default branch `main`.
- ProtoKits start/final: `5986b69b047d622ea2efe58d12876033f3de2291` -> `e803b7e3fad75c41dc79d754851eb4a7e6a02d25`, pushed to `origin/main` first.
- Core reference: `a5882b47bd5a9284550bb3af1f0cd8580c62665e`; its unrelated dirty checkout remained untouched.
- Experiments publication commit: the validated commit containing this packet, after final fetch and remote-advance check.

## Exact Next Stage

Promote only the validated projection behavior from behavior to kit in NexusEngine-ProtoKits. Add the kit-level README, manifest, discoverability, status, and atlas reconciliation while preserving the exact command semantics and zero-owned-surface contract. Do not promote to subdomain, migrate Counterweight Cathedral, change player-visible code, purge, or derive a new experiment.
