# Route Notes

Track canonical experiment routes and route cleanup decisions.

Experiments should move toward about 20 strong canonical routes. The number is a target, not a rigid quota.

Routes should validate reusable domain boundaries and higher-level domain combinations. Reusable kit implementation belongs in ProtoKits.

## 2026-06-23 Canonical Route Pruner finding

Added `experiments/canonical-route-pruning-map.json` as a test-visible companion to `experiments/domain-kit-cutover-manifest.json`.

Current manifest-owned canonical routes remain:

- `next-ledge` for traversal/checkpoint/action-input pressure.
- `fogline-relay` for survey/scan/zone/timed-pressure/hazard pressure.
- `nexus-frontier-signal-isles` for broad field-engineer composition and kit-utilization showcase pressure.
- `sora-the-infinite` for aerial/open traversal pressure.
- `zombie-orchard` for survival/horde/resource/hazard pressure.
- `signal-bastion` for strategic tower-defense pressure.
- `rogue-lite-hellscape-siege` for action-defense-extraction pressure.

Pruning rule strengthened: every manifest canonical route now has an explicit route issue that names variants to fold or hold as seed/backlog, manifest/docs updates, local JavaScript that should move toward ProtoKits, smoke/replay coverage to preserve, and whether pruning helps the about-20 portfolio.

Route folders were not deleted in this pass. The safe next destructive step is still gated on unified canonical routes plus fixed-tick smoke/replay coverage.

## 2026-06-23 Canonical Route Pruner import-gate finding

Added `experiments/executable-route-replay-import-gates.json` so the strongest current fold candidate, `signal-bastion` / `strategic-pressure-loop`, could not be treated as executable route replay complete until Experiments could import Core and ProtoKits through stable local package/workspace/path wiring.

## 2026-06-23 Cycle Report Main Push Planner canonicalization update

The Signal Bastion replay gate has moved from blocked to proven for the Node replay path: the route-domain executable replay now imports real Core plus ProtoKits generic-defense DSK aliases through package wiring and keeps browser/renderer ownership excluded.

Canonicalization implication:

- Keep `signal-bastion` as the only canonical route with executable route-domain replay proof for now.
- Do not use that proof to delete defense/survival/action variants yet. The remaining browser-host convenience facade seam should shrink first, while bridge/spec/executable/facade smokes stay green.
- Do not add Signal Bastion V1/V2/V3 forks or route-local replay copies.
- Keep the other canonical routes contract-backed but non-executable until their reusable ProtoKit boundaries exist.
- Treat the 20-route target list as a portfolio lens. A route should join or remain canonical only when it adds reusable DSK pressure and a path to fixed-tick smoke/replay coverage.
