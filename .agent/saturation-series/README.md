# Nexus Engine Capability Saturation Series

This folder is the durable authority for the sequential stress-experiment series in `goal.md`.

Status: complete — saturation streak `5 / 5`.

## Gate

One active experiment at a time:

```txt
scope -> build -> human validation -> lessons -> capability map
-> consolidation -> parity/migration -> duplicate removal -> count -> next
```

The streak advances only when the complete gate passes and the final `newly accepted` count is zero. Failed, incomplete, repeated, or insufficiently distinct units do not change the streak. Any validated unit with at least one newly accepted atomic capability resets the streak to zero.

## Capability Dispositions

- `Core-reused`: stable Core primitive or contract owns the responsibility.
- `domain-reused`: an existing reusable engine domain owns it.
- `newly accepted`: a proven reusable atomic gap with canonical ownership and multiple plausible consumers.
- `merged duplicate`: equivalent ownership folded into the canonical owner.
- `specialization`: valid configured child behavior of an existing owner.
- `adapter-only`: platform or host translation without simulation meaning.
- `local-only`: route content, presentation, tuning, or orchestration without reusable ownership.
- `rejected`: weak, artificial, repeated, unsupported, or wrongly scoped candidate.

## Durable Files

- `atlas.md`: consolidated ownership map and overlap decisions.
- `series-ledger.md`: append-safe experiment transitions and streak state.
- `experiments/`: immutable prompt/scope plus evolving proof and postgame decisions for each unit.

Legacy `.agent/nexus-game-production/` artifacts remain archive evidence. They do not count toward this streak without the full gate above.
