# Game Production Ledger

Status: bootstrap Phase B catalog in progress
Operating mode: 10 bootstrap games, then exactly 1 new game per numbered production epoch

## Progress

| Scope | Games created | Experiments mapped | Full doc sets | Refinement slices |
| --- | ---: | ---: | ---: | ---: |
| Bootstrap epoch 0 | 0 / 10 | 0 / 50 | 0 / 10 | 0 / 0 |
| Current numbered epoch | not open | not open | not open | not open |
| Lifetime | 0 | 0 | 0 | 0 |

## Lifecycle Totals

| Lifetime created | Active | Merged | Archived | Retired |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 0 | 0 | 0 | 0 |

## Existing Games Excluded From Production Count

- `next-ledge-grapple`
- `rogue-lite-hellscape-siege`
- `signal-bastion`
- `stonewake-depths`

These remain active legacy baseline inventory. No production game or gameplay-time claim exists yet.

## Run History

| Packet | Epoch | Unit | ProtoKits start/final | Experiments start | Production commit | Validation | Push |
| --- | ---: | --- | --- | --- | --- | --- | --- |
| `2026-07-15-phase-a-production-baseline` | 0 | Phase A inventory | `ffdcc962d3c984864a2d78e9276879adf04250eb` | `615a7e1e2170164acef0edebdbe0b88b8c01fd1b` | `71a51c11847e99994a0cb8cdb6a137e27e806df9` | inventory + JSON invariants passed | Experiments published; ProtoKits unchanged |
| `2026-07-15-phase-a-goal-gate-alignment` | 0 | Phase A goal gate refinement | `ffdcc962d3c984864a2d78e9276879adf04250eb` | `6c6f473a39f89eddbd6361b8dc4d0f642fa2e368` | `d9255466e6883d8bb68e2a472e98ba1c2dba30ee` | inventory + JSON + Playwright/Human View passed | Experiments published; ProtoKits unchanged |
| `2026-07-15-bootstrap-catalog-001-010` | 0 | Perpetual migration + catalog 001-010 | `ffdcc962d3c984864a2d78e9276879adf04250eb` | `f05ad5ab3cfce0f2be9479b0aa5f26df5c001a5c` | `63c73df322d228a430cedf3d76a25c2c6c091885` | inventory + JSON + Playwright/Human View passed | Experiments production commit published; ProtoKits unchanged |

## Source Migration Gate

Exactly five validated production experiments map into each production game. Source folders are disposable only after `feature-migration-ledger.json` inventories their full feature union, the successor proves every retained feature, references are cleaned, and `retirement-ledger.md` records the result.

## Required Game Gate

Each game must share progression/state; include at least five connected scenes or regions with persistent transitions, objectives, escalation, failure/recovery, and completion; provide at least three materially different interaction modes when appropriate; and maintain the complete required documentation set before initial completion.
