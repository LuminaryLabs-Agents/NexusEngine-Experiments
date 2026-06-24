# Twenty Experiment Seeder — 2026-06-24 13:25 America/New_York

## Lens

Maintain the canonical experiment portfolio near twenty routes without treating twenty as a quota. Keep Experiments as thin validation hosts and use the portfolio map to decide which routes should be seeded, hardened, folded, or held until reusable DSK pressure exists.

## `.agent` memory reviewed

- Experiments: `intent.md`, `architecture.md`, `dsk-boundaries.md`, `cycle-state.md`, `domain-backlog.md`, `protokit-map.md`, `experiment-map.md`, `candidate-promotions.md`, `smoke-tests.md`, `replay-qa.md`, `route-canonicalization.md`, and `scheduled-task-cycle.md`.
- ProtoKits: `intent.md`, `architecture.md`, `dsk-boundaries.md`, `cycle-state.md`, `domain-backlog.md`, `protokit-map.md`, `experiment-map.md`, and `smoke-tests.md`.
- Core: `.agent/intent.md` is still absent on `main`; do not treat Core `.agent` memory as reviewed for this cycle.

## Durable finding

The seeder map had fallen behind two real downstream states:

1. `next-ledge` now partially consumes `generic-route-progress-kit` through `engine.n.genericRouteProgress` and exposes `domain.routeProgress`, so the remaining route/cargo seed pressure is no longer the ordered checkpoint ledger. The next target is cargo/resource/pressure consumption through `generic-route-cargo-extraction-kit`.
2. `signal-bastion` has closed the foundation, wave preview, scale/budget, and setBlueprint/sell browser-host facade seams through namespaced `engine.n.genericDefense` and `generic-defense-session-command-kit`. The seeder map should not keep those closed seams as pending shrink targets.

## Main-branch changes pushed

- Updated `experiments/twenty-experiment-seeder-map.json`:
  - Records `next-ledge` as a partial route-progress DSK consumer, not just a future consumer candidate.
  - Keeps `next-ledge` executable replay unclaimed until cargo/resource/pressure route-level replay consumes `generic-route-cargo-extraction-kit`.
  - Adds `generic-defense-session-command-kit` to `signal-bastion` seeder coverage.
  - Moves the next `signal-bastion` pressure to presentation bridge hardening instead of closed host facade seams.
- Updated `tests/twenty-experiment-seeder-map-smoke.mjs`:
  - Fails if `next-ledge` regresses to treating consumed route-progress as the main remaining migration target.
  - Fails if `signal-bastion` reopens closed foundation, build, wave, scale, setBlueprint, or sell seams in the seeder map.
- Updated `experiments/canonical-route-replay-manifest.json`:
  - Adds ProtoKits deterministic replay coverage references for `generic-route-progress-replay-smoke.test.mjs` and `generic-route-cargo-extraction-replay-smoke.test.mjs`.
  - Keeps the route-level `next-ledge` executable fixture planned until the actual route consumes the cargo/resource/pressure composite.
- Updated `tests/canonical-route-replay-manifest-smoke.mjs`:
  - Guards all four current ProtoKits route/cargo coverage references for `next-ledge`.

## What did not change

- No reusable kit implementation was added to Experiments.
- No route folders were removed.
- No new canonical route was added to inflate the portfolio toward twenty.
- No second executable route-domain lane was claimed.
- No new local JavaScript reduction is claimed by this seeder patch; it is manifest/test/agent alignment around already-landed route-progress and Signal Bastion host-facade work.

## Seeder decisions remain

- Canonical / harden: `signal-bastion`.
- Seed and harden next: `next-ledge`, but only for cargo/resource/pressure composite consumption.
- Harden as contract-backed lanes: `fogline-relay`, `nexus-frontier-signal-isles`, `sora-the-infinite`, `zombie-orchard`, `rogue-lite-hellscape-siege`.
- Fold/hold as backlog pressure: Harbor Salvage, Cargo Chain, Sky Courier, Trainyard Switcher, Dungeon Relay, Floodplain Rescue, and related route/cargo variants until they prove a distinct reusable boundary.

## Safest next main-branch patch

Implement a narrow `next-ledge` route-cargo source migration only if it removes or centralizes real cargo/resource/pressure bookkeeping. The route should import `generic-route-cargo-extraction-kit`, expose `domain.routeCargoExtraction`, preserve `domain.routeProgress`, and keep tether physics, collision/hit tests, camera, renderer, browser input, assets, audio, and fiction in the host. Add a route-level smoke/replay spec before claiming executable traversal/cargo coverage.
