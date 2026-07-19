# SAT-001 Floodline Triage

Status: validated / reconciled / preserved

## Purpose

Build and validate the first capability-saturation experiment without modifying read-only Core or clean ProtoKits.

## Baselines

- Core: `a5882b47bd5a9284550bb3af1f0cd8580c62665e`
- ProtoKits: `5986b69b047d622ea2efe58d12876033f3de2291`
- Experiments start: `91fc44049681520dbcf9f29886548b6e98d53cf0`

## Declared Slice

- `goal.md`
- `memory.md`
- `.agent/saturation-series/**`
- `.agent/change-packets/2026-07-19-saturation-001-floodline-triage/**`
- `experiments/floodline-triage/**`

## Proof Contract

See `.agent/saturation-series/experiments/SAT-001-floodline-triage.md` and `evidence/`.

## Result

- Human View and Playwright: passed full success, structural failure, restart, Advanced disclosure, and zero-console routes.
- Performance: `16.666 ms` average, `17.7 ms` p95, `60 FPS`, `80` DOM nodes, one Canvas, zero long tasks.
- Determinism: two complete successful replays produced identical domain snapshots.
- Consolidation: no duplicate live owner, no migration or removal required, `0` newly accepted atomic capabilities.
- Saturation streak: `0 -> 1`.
