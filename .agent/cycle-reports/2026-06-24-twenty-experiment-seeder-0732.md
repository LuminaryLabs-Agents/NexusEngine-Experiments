# Twenty Experiment Seeder — 2026-06-24 07:32 America/New_York

## Scope

Reviewed Experiments `.agent` memory plus current ProtoKits route-progress / route-cargo-extraction memory before changing the Experiments repo. Core `.agent` is still not treated as reviewed because the previous cycle recorded that Core `.agent/intent.md` was absent and creation was blocked by integration access.

## What changed

- Added `experiments/twenty-experiment-seeder-map.json`.
- Added `tests/twenty-experiment-seeder-map-smoke.mjs`.
- Wired the new smoke into both full and deploy checks through `scripts/run-checks.mjs`.

## Intent alignment

The long-form intent remains unchanged: reusable implementation belongs in ProtoKits; Experiments should stay thin around canonical routes, presets, bridges, manifests, docs, tests, and renderer-only presentation; DSKs are durable domain communication boundaries through resources, events, methods, snapshots, and descriptors; about 20 routes is guidance, not a quota.

## Repo-state finding

The manifest-owned canonical portfolio is still seven routes, not twenty. That is intentional: `signal-bastion` remains the only executable route-domain replay lane, while `next-ledge`, `fogline-relay`, `nexus-frontier-signal-isles`, `sora-the-infinite`, `zombie-orchard`, and `rogue-lite-hellscape-siege` stay contract/planned lanes until they consume reusable DSKs and gain fixed-tick replay proof.

## Seeder map decisions

The new map records for each current manifest route:

- domain boundaries validated;
- ProtoKits consumed or planned;
- local JavaScript that should remain as bridge/preset/renderer host code;
- local JavaScript that should move toward ProtoKits;
- smoke/replay scenario still needed;
- whether the route should be seeded, hardened, folded, or removed.

No route is removed in this pass. No reusable implementation was pushed into Experiments.

## Boundary and shrink implications

DSK boundaries are clearer because the route portfolio now has a checked per-route seeder decision layer between `domain-kit-cutover-manifest.json`, `canonical-route-pruning-map.json`, and `canonical-route-replay-manifest.json`.

Local experiment JavaScript is not newly shrunk by this patch. It is a manifest/test guard that prevents future shrink claims unless the route actually consumes the named ProtoKit boundary.

## Higher-level domains emerging

- Delivery/extraction loop: `next-ledge` first, with Harbor Salvage / Cargo Chain / Sky Courier / Trainyard Switcher / Dungeon Relay / Floodplain Rescue folded as backlog pressure.
- Survey pressure loop: `fogline-relay` first, with cartographer/drone variants folded.
- Field-engineer composition loop: `nexus-frontier-signal-isles` as composition showcase.
- Aerial traversal loop: `sora-the-infinite` first, with Open Above / Downhill Prix variants folded.
- Survival ecology loop: `zombie-orchard` first, with horde/ecology variants folded.
- Strategic pressure loop: `signal-bastion` remains the only executable lane.
- Action-defense-extraction loop: `rogue-lite-hellscape-siege` remains the unified base route.

## Missing tests / replay

The new smoke is metadata/guard coverage. Missing executable replay remains unchanged for every lane except Signal Bastion. Next missing executable fixture pressure:

- `next-ledge`: checkpoint/cargo/tether replay importing `generic-route-progress-kit` or `generic-route-cargo-extraction-kit`.
- `fogline-relay`: move/look/scan replay with scan/zone/hazard/objective descriptor hashes.
- `nexus-frontier-signal-isles`: harvest/build/unlock replay over resource/build/objective/pressure boundaries.
- `sora-the-infinite`: pitch/bank/boost/checkpoint aerial replay.
- `zombie-orchard`: pickup/gear/horde replay.
- `rogue-lite-hellscape-siege`: harvest/build/wave/core/extraction replay.

## Safest next main-branch patch

Patch `next-ledge` only after package/import feasibility is checked: install/compose `generic-route-progress-kit` through the route host or a thin compatibility bridge, migrate ordered checkpoint progress first, and keep browser collision, grapple movement, route fiction, camera, renderer, DOM, Canvas, WebGL, audio, and assets in the host. Do not claim local JavaScript shrink until route-local checkpoint bookkeeping is actually removed.
