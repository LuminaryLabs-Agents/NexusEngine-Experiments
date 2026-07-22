# Agent Start Here

`.agent/` is the repo-local source of truth for NexusEngine-Experiments.

Before architecture, domain, route, extraction, retirement, validation, or automation work:

1. Read `goal.md` and repository `memory.md`.
2. Read `.agent/forward-abstraction/stage-ledger.md` for the current artifact, layer, proof state, and next stage.
3. Read `.agent/forward-abstraction/contracts.md` before extraction, export, migration, or purge decisions.
4. Read `.agent/cycle-state.md` and the latest relevant change packet for player-visible history.
5. Advance one bounded artifact by one stage, then record proof and the exact next stage.

## Operating Rule

- Consume the prior validated output; do not invent an unrelated experiment while its forward stage is unfinished.
- Keep reusable deterministic behavior in ProtoKits, stable primitives in read-only Core, and application/browser/presentation ownership local here.
- Promote reusable semantics exactly one layer per cycle.
- Stop before retirement whenever parity, migration, references, or consumer proof is incomplete.
- Preserve historical ledgers and playables; cleanup means consolidation with successor proof, not blanket deletion.

## Minimum Read Set

```txt
goal.md
memory.md
.agent/START_HERE.md
.agent/forward-abstraction/stage-ledger.md
.agent/forward-abstraction/contracts.md
.agent/cycle-state.md
latest relevant .agent/change-packets/*/PACKET.md
```
