# 2026-06-23 Deterministic Replay QA

## What changed

- Added `tests/signal-bastion-replay-bridge-smoke.mjs`.
- Wired it into both full and deploy check suites via `scripts/run-checks.mjs`.
- Updated `.agent/replay-qa.md`, `.agent/smoke-tests.md`, and `.agent/cycle-state.md` with durable replay findings.

## Long-form intent

The long-form intent remains: grow reusable DSK-based ProtoKits while shrinking local experiment JavaScript. Core owns stable deterministic runtime and promoted contracts, ProtoKits owns reusable rendererless domain-service kits, and Experiments owns thin routes, presets, bridges, manifests, docs, tests, and renderer-only presentation.

## Repo-state read

- ProtoKits state matches the replay direction for `generic-defense-kits`: generic-defense replay and DSK-boundary smoke coverage already exist and are wired into ProtoKits `npm test`.
- Experiments state now better matches the replay direction for Signal Bastion because the strategic-pressure route bridge is protected by a smoke test that checks manifest coverage, lane-contract coverage, semantic input bridging, descriptor/snapshot consumption, and isolation of browser timing and renderer ownership.
- Core `.agent/intent.md` and `.agent/replay-qa.md` mirror the same cumulative replay intent; no Core write was needed for this pass.

## DSK-boundary clarity

Signal Bastion is still a browser host, but its replay boundary is clearer:

- simulation remains in generic-defense ProtoKits;
- input bridges browser events into semantic methods;
- renderer consumes snapshots/descriptors;
- Canvas, DOM, performance timing, and animation frames stay in route-host code and are explicitly outside reusable kit logic.

## Local JavaScript

No local experiment JavaScript was removed in this pass. The new smoke creates a guardrail for future shrinkage by making it harder for Signal Bastion to re-own defense simulation in route files.

## Higher-level domains

The strongest executable lane remains `strategic-pressure-loop`: defense map/slots + economy + build placement + waves/agents + combat + render descriptors. Other lanes remain contract-only until executable route/domain replays exist.

## ProtoKit direction

- Keep `generic-defense-kits` compatible.
- Continue moving host usage toward the smallest generic-defense DSK aliases where safe: map, economy wallet, build placement, wave/agent director, combat resolver, session facade, and render descriptors.
- Do not push reusable kit implementation into Experiments.

## Experiment direction

- `signal-bastion` remains the strongest canonical route for strategic-pressure replay validation.
- Other canonical routes still need executable fixed-tick scenarios for survey pressure, traversal/cargo, aerial/open traversal, survival ecology, field-engineer composition, and action-defense-extraction.

## Remaining gaps

- The new bridge smoke is static; it is not a browserless executable route-domain replay.
- Signal Bastion still needs a compact fixed-tick route-domain harness that imports the smallest generic-defense DSK aliases, advances fixed ticks, asserts event/snapshot/descriptor digests, and excludes DOM, Canvas, WebGL, Three.js, pointer lock, browser audio, asset loading, animation frames, and browser timing.
- Non-strategic lanes remain contract-only.

## Safest next main-branch patch plan

Create a browserless Signal Bastion strategic-pressure replay harness in Experiments or ProtoKits-adjacent test fixtures that reuses existing generic-defense fixture shape, imports the smallest generic-defense DSK boundary aliases where available, runs a fixed build/upgrade/wave sequence, and asserts descriptor digests against the route bridge contract. Keep route visuals and input events as host-only presentation and do not move reusable implementation into Experiments.
