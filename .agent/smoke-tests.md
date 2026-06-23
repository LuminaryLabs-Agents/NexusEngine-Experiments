# Headless Tick Smoke Tests

Track headless validation coverage for routes, kits, domain boundaries, and scenarios.

Every meaningful domain boundary should move toward fixed-tick validation without relying on browser rendering.

Scheduled tasks should append durable findings here.

## 2026-06-23 Twenty Game Refiner gaps

The current strongest route pressure is not a route-count problem; it is a fixed-tick boundary coverage problem.

Missing or under-specified smoke coverage:

- Canonical cutover manifest smoke: assert each `canonicalRoutes[]` entry has an existing route `index.html`, non-empty `domainCutover`, and a bridge/preset ownership note, then separately assert seed routes are not silently treated as canonical.
- Survey-pressure smoke: fixed seed scan target registration, zone pressure tick progression, hazard escalation, objective completion, and renderer-agnostic descriptor snapshot for `fogline-relay` plus cartographer/survey seeds.
- Defense/survival smoke: path/wave spawn, build or pickup action, resource spend/gain, vital target damage, wave completion, and descriptor-only HUD/event output for `signal-bastion`, `zombie-orchard`, and `rogue-lite-hellscape-siege`.
- Traversal/cargo smoke: checkpoint enter/exit, cargo pickup/dropoff, tether or vehicle contact, resource pressure change, and route-complete snapshot for `next-ledge`, `tideglass-salvage`, `skyrig-suture`, and courier/harbor seeds.
- Aerial traversal smoke: deterministic flight input ticks, updraft/terrain-window descriptors, checkpoint crossing, camera rig snapshot, and route completion for `sora-the-infinite` / `the-open-above` harnesses.
- Economy/social smoke: keep `clockwork-verdict`, `rift-bazaar`, `market` and broker seeds non-canonical until a decision/economy/social DSK can expose headless resources, events, methods, snapshots, and descriptors.

## 2026-06-23 Cycle Report Main Push Planner smoke closure

- Added `tests/domain-cutover-manifest-smoke.mjs` so the canonical cutover manifest now proves each canonical entry has a real route `index.html`, non-empty `domainCutover`, bridge/preset ownership, and a generated gallery route/id match.
- Wired the new smoke into both `npm run check` and `npm run check:deploy` through `scripts/run-checks.mjs`, which also removes the overlong inline test command from `package.json`.
- This closes the first manifest-vs-gallery drift visibility gap without deleting routes or promoting seed/backlog routes.

Next smoke priority: route-level smoke/replay manifests that map each canonical route to the ProtoKit/domain replay scenario it validates.
