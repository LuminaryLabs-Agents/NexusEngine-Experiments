# Twenty Experiment Seeder — 2026-06-24 01:30

## Scope reviewed

- Core repo was reachable, but `.agent/intent.md` was still not present at the expected path during this pass. Do not treat Core `.agent` memory as reviewed until the folder/file exists or a later run can fetch it.
- ProtoKits `.agent` now records two route-lane ProtoKit additions: `generic-route-progress-kit` and `generic-route-cargo-extraction-kit`.
- Experiments `.agent` still records `signal-bastion` / `strategic-pressure-loop` as the only executable route-domain lane. Other lanes remain contract-only.

## Seeder finding

This pass should not add filler experiments to chase the number 20. The stronger move is to seed the next canonical route-consumption proof where a real reusable boundary now exists.

The strongest new seeding opportunity is the `next-ledge` / `traversal-cargo-pressure` lane, because ProtoKits now has:

- `generic-route-progress-kit` as the atomic route/checkpoint/objective progress boundary.
- `generic-route-cargo-extraction-kit` as a composite over route progress, resource/cargo ledger, and pressure channels.

That means the portfolio can begin moving delivery/extraction pressure out of route-local JavaScript without creating separate canonical filler routes for Harbor Salvage, Cargo Chain, Sky Courier, Trainyard Switcher, Dungeon Relay, Floodplain Rescue, or similar checkpoint/cargo variants.

## Repo-state match against `.agent`

- Match: Experiments is still correctly conservative about canonical count. The manifest-owned canonical set remains smaller than the 20-name target list, and `.agent` treats 20 as a coverage lens rather than a quota.
- Match: `signal-bastion` remains the only executable route-domain replay lane and should not be copied into other lanes until reusable ProtoKit boundaries exist.
- Drift/opportunity: ProtoKits now has a route-progress/cargo-extraction boundary that Experiments has not yet consumed or reflected in its route-canonicalization memory. This is an opportunity, not breakage.
- Drift/opportunity: `next-ledge` still names older route-checkpoint/cargo concepts in Experiments metadata, while the actual ProtoKit implementation path is now `generic-route-progress-kit` plus `generic-route-cargo-extraction-kit`.

## Per-route seeding decisions

| Route | Domain boundaries validated | ProtoKits consumed now | Local JS that should remain | Local JS pressure to move | Smoke/replay needed | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| `next-ledge` | traversal/cargo pressure; route/checkpoint/action-input | none proven yet for new route DSKs | input bridge, movement/presentation, hit tests, camera/renderer | checkpoint ledger, cargo/tether ledger, route pressure deltas | `generic-route-progress-kit` / `generic-route-cargo-extraction-kit` consumption contract, then fixed-tick route replay | seed + harden as first route-progress consumer |
| `fogline-relay` | survey pressure; scan/zone/hazard/objective | generic pressure/affordance primitives at contract level | movement/look/scan input bridge, renderer presentation | scan target ledger, zone pressure, hazard/objective snapshots | survey-pressure executable contract after real scan/zone DSK exists | harden contract; do not promote extra survey routes |
| `nexus-frontier-signal-isles` | field-engineer composition | generic resource/affordance primitives at contract level | showcase presets, bridges, renderer presentation | objective/completion bookkeeping, composition presets | field-engineer executable only after reusable objective/resource/build boundaries align | harden as showcase; avoid sink behavior |
| `sora-the-infinite` | aerial/open traversal | none proven for aerial replay lane | flight presentation, camera renderer, route fiction | flight envelope, aerial checkpoint ledger, camera descriptors | aerial traversal replay after flight/checkpoint/camera DSK proof | harden contract; fold Open Above variants |
| `zombie-orchard` | survival ecology | generic resource/pressure/action/affordance at contract level | controls, view, pickups presentation | pickup/gear ledger, horde cadence, hazard pressure | survival-ecology replay after agent/hazard/resource DSK proof | harden contract; fold horde variants |
| `signal-bastion` | strategic pressure loop | generic-defense DSK boundaries and executable route replay | Canvas/HUD/input/audio/assets, remaining explicit presentation bridges | remaining browser convenience facades only where guarded | keep executable replay, bridge/spec/import/facade guards green | canonical + harden; no destructive variant deletion yet |
| `rogue-lite-hellscape-siege` | action-defense-extraction | generic resource/pressure/action/affordance at contract level | action host, renderer, FX, input bridge | inventory/material ledger, harvest/build/extraction state | extraction replay after reusable extraction/cargo/route DSK proof | harden unified base; keep variants folded/backlog |

## Higher-level domains emerging

- Delivery/extraction loop is now the active seeding lane: `route progress + cargo/resource ledger + pressure channels`.
- Strategic pressure loop remains the only executable route-domain lane: `defense map + economy + build + waves/agents + combat + render descriptors`.
- Survey pressure, survival ecology, aerial traversal, field-engineer composition, and action-defense-extraction remain valid portfolio lenses but should stay contract-only until real reusable DSK surfaces exist.

## Safest next main-branch patch plan

1. Update Experiments metadata to name `generic-route-progress-kit` and `generic-route-cargo-extraction-kit` as the first concrete traversal/cargo ProtoKit candidates for `next-ledge`.
2. Add or strengthen a manifest/contract smoke that keeps `next-ledge` as the first consumer candidate without claiming executable route replay or local JavaScript shrink.
3. Only after the metadata smoke is in place, migrate the smallest ordered checkpoint ledger seam in `experiments/next-ledge/` to `generic-route-progress-kit` while leaving browser collision, movement, camera, renderer, route fiction, DOM, Canvas, WebGL, audio, and assets in the host.
4. Consider `generic-route-cargo-extraction-kit` only after the route-progress seam is consumed cleanly; do not create a new Harbor/Cargo/Sky Courier canonical route just to show cargo.

## Pushed in this pass

- Added this `.agent` cycle report to record the Twenty Experiment Seeder route-progress/cargo-extraction seeding decision.
- Updated `.agent/cycle-state.md` and `.agent/experiment-map.md` so future runs build from this finding instead of restarting from the older route-checkpoint/cargo backlog wording.
