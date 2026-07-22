# Forward-Abstraction Stage Ledger

Last reconciled: 2026-07-22

## Active Artifact

| Artifact | Current stage | Next stage | Status | Playable parity owner |
| --- | --- | --- | --- | --- |
| SAT-005 Counterweight Cathedral | semantic promotion: implementation -> behavior | semantic promotion: behavior -> kit | validated | `experiments/counterweight-cathedral/` |

## Stage Decision

- Completed output: the frozen projection advanced exactly one semantic layer from implementation to validated behavior in ProtoKits commit `e803b7e3fad75c41dc79d754851eb4a7e6a02d25`.
- Behavior: `physics-body-weight-source-projection-kit` package-exports one atomic adapter requiring `physics:body-lite` plus `trigger:weighted` and providing `trigger:weighted-source-ingestion:physics-body`.
- Implemented API: `engine.n.weightedTrigger.sourceIngestion.projectPhysicsBody({ bodyId, tags, disabled })` reads one canonical body and performs one same-id source upsert with serializable accepted/rejected results. It exposes no compatibility alias and owns no state, event, system, snapshot, descriptor, reset, or tick.
- Ownership: Physics Body Lite remains the authoritative body fact provider; Weighted Trigger remains the source/aggregation owner; Counterweight Cathedral retains settled eligibility and outcome policy; Core/application lifecycle retains tick scheduling.
- Capability status: 1 validated implementation-to-behavior promotion and 0 newly accepted capabilities. The 17-responsibility count remains 2 Core-reused, 2 domain-reused, 1 merged duplicate, 3 specializations, 5 adapters, and 4 local-only; both game-shaped domains remain rejected.
- Kit-readiness decision: package implementation and real-engine composition pass, but README, manifest, status matrix, ProtoKit map, promotion ledger, and catalog reconciliation remain absent. The behavior is not yet promoted to the kit layer.
- Consumer evidence: Counterweight Cathedral is the current consumer; pressure-plate, cargo/vehicle mass-sensor, and balance-scale hosts are three plausible policy-distinct consumers.
- Duplicate review: `syncStone` and `settle` are two local copies of one mapping, not two capabilities. They remain intact until promotion and migration parity authorize replacement.
- Player-visible effect: none. Playable source bytes, hero controls, endpoint state, deterministic replay, feel scores, and authoritative `16.594 ms` / `60.26 FPS` baseline remain preserved; fresh active play passed at `16.667 ms`, `60 FPS`, and `17.9 ms` p95.
- World-first debt: the stricter diagnostics-closed overlay gate rejects the pre-existing hero, stone, status, bowl, and ending cards. This structural stage does not claim presentation completion; resolve that debt before another player-visible feature or derived experiment.
- Purge eligibility: false because kit-level promotion, migration, reference cleanup, successor parity, and retirement evidence are unfinished; the playable remains proof.

## Next Stage

Promote only the validated projection behavior from behavior to kit inside NexusEngine-ProtoKits. Add the kit-level README, manifest, discoverability, status, and atlas reconciliation without changing command semantics, promoting to subdomain, migrating Counterweight Cathedral, resolving player-visible debt, purging sources, or deriving a new experiment.
