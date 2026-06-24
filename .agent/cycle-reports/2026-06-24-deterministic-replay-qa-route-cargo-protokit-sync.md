# 2026-06-24 — Deterministic Replay QA route/cargo ProtoKit sync

## Lens

Deterministic Replay QA for DSK boundary communication across Core, ProtoKits, and Experiments.

## Reviewed memory

- ProtoKits `.agent/replay-qa.md` now records `generic-route-cargo-extraction-kit` fixed-tick replay closure through namespaced child boundaries.
- ProtoKits `package.json` runs `tests/generic-route-cargo-extraction-replay-smoke.test.mjs` in the default `npm test` sequence.
- Experiments `.agent/replay-qa.md`, `experiments/canonical-route-replay-manifest.json`, `experiments/domain-kit-cutover-manifest.json`, and `tests/next-ledge-route-cargo-cutover-smoke.mjs` still treat Next Ledge cargo/resource/pressure route consumption as planned.
- Core `.agent/intent.md` was not available through the GitHub contents path during this run; do not infer Core durable-memory state from ProtoKits or Experiments.

## Finding

The delivery/extraction higher-level domain has advanced in ProtoKits, but Experiments has not yet consumed or mirrored the new replay proof at the route-host level.

ProtoKits now proves the reusable `generic-route-cargo-extraction-kit` boundary can coordinate `engine.n.genericRouteProgress`, `engine.n.genericResourceLoop`, and `engine.n.genericPressureLoop` through fixed inputs, fixed ticks, expected route/cargo/pressure events, snapshots, renderer-agnostic descriptors, source-level nondeterminism guards, and fresh-run digest equality.

Experiments should not claim a second executable route-domain lane yet. Next Ledge imports and consumes `generic-route-progress-kit` through `engine.n.genericRouteProgress`, but it intentionally does not import `createGenericRouteCargoExtractionKit()` and still keeps cargo/resource/pressure route consumption planned.

## Repo-state match

- Matches: Experiments correctly avoids route-local cargo/extraction simulation copies and does not falsely claim route-cargo executable route consumption.
- Drift to correct next: Experiments replay metadata should mention the new ProtoKits replay smoke as reusable proof while keeping the route-level gap open.

## DSK boundary implication

The DSK boundary is clearer at the ProtoKit layer: route progress, cargo/resource ledger, and pressure channels are now separate child namespaces under a composite delivery/extraction facade. The route-host boundary is still not complete because Next Ledge has not yet bridged browser/route inputs into `engine.n.genericRouteCargoExtraction` or consumed its route/cargo/pressure descriptors.

## Local JavaScript shrink status

No local Experiments JavaScript shrink is claimed from this run. The next shrink must happen in Next Ledge route-host code only after a bridge/spec smoke pins which browser responsibilities remain host-owned: collision, grapple/tether feel, camera, route fiction, Three.js rendering, assets, DOM input, and presentation.

## Higher-level domains

- Strengthened: delivery/extraction loop over route progress + cargo/resource ledger + pressure channels.
- Still strongest executable route lane: strategic-pressure loop through Signal Bastion.
- Still contract-only: survey pressure, field-engineer composition, aerial/open traversal, survival ecology, and action-defense-extraction.

## Exact main-branch patch plan

Safe next Experiments patch:

1. Update `experiments/canonical-route-replay-manifest.json` for `next-ledge` to add ProtoKits coverage for `tests/generic-route-cargo-extraction-replay-smoke.test.mjs` and fixture `tests/fixtures/generic-route-cargo-extraction-replay-fixtures.mjs`.
2. Keep `next-ledge.status` as `planned-fixture`; do not add `routeExecutableReplayCoverage` until the route imports and drives the composite through real local package wiring.
3. Update the `traversal-cargo-pressure` lane `coverageStatus` only if the manifest vocabulary can distinguish `protokit-covered` from route-executable coverage without weakening the existing planned-fixture pressure.
4. Update `tests/canonical-route-replay-manifest-smoke.mjs` and `tests/next-ledge-route-cargo-cutover-smoke.mjs` so they require the new ProtoKit route-cargo replay coverage while still asserting that Next Ledge has not yet imported `createGenericRouteCargoExtractionKit()`.
5. Update `.agent/replay-qa.md` and `.agent/smoke-tests.md` to record the distinction: reusable composite replay is closed in ProtoKits; route-host consumption and local JavaScript reduction remain open in Experiments.
6. Only after those metadata/smoke guards pass, add a route-level Next Ledge bridge/spec that maps semantic checkpoint/cargo/dropoff/pressure inputs into `engine.n.genericRouteCargoExtraction` and snapshots/descriptors without moving browser collision, camera, Three.js, DOM input, asset loading, or route fiction into ProtoKits.

## Direct push scope

This report is an `.agent/` durable-memory update only. No reusable implementation was pushed into Experiments, no route was deleted, and no executable route replay was falsely claimed.
