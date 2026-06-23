# Cycle State

Goal: grow reusable ProtoKit domain layers while shrinking local experiment JavaScript.

Constraints:

- Review `.agent/` before decisions.
- Kit implementation belongs in ProtoKits.
- Experiments should harden toward about 20 canonical routes.
- Treat 20 as guidance, not a rigid quota.
- Merge features and kits into cumulative higher-level domains.
- Keep DSKs as domain communication layers.

Current expansion focus: make canonical-route cutover and replay-lane decisions test-visible before adding, deleting, or folding playable routes.

Current pruning focus: keep generated gallery seed/backlog routes distinct from manifest-owned canonical routes, and keep each manifest canonical route paired with an explicit pruning issue and replay-lane contract before any destructive route fold/delete.

Current validation focus: guard `experiments/domain-kit-cutover-manifest.json`, `experiments/canonical-route-pruning-map.json`, `experiments/canonical-route-replay-manifest.json`, and `experiments/headless-lane-replay-contracts.json` against drift from generated gallery routes, route folders, non-empty `domainCutover`, bridge/preset ownership notes, variant/backlog pressure, renderer-free DSK surfaces, fixed-tick replay contracts, and local JavaScript reduction opportunities.

Last meaningful cycle report: `.agent/cycle-reports/2026-06-23-canonical-route-pruner.md`.

Latest Headless Tick Smoke Builder change: `experiments/headless-lane-replay-contracts.json` plus `tests/headless-lane-replay-contracts-smoke.mjs` now make every higher-level route lane carry a checked fixed-tick replay contract. The strategic-pressure lane is ProtoKit-backed; other lanes remain contract-only until executable Core/ProtoKit route-domain replays are added.
