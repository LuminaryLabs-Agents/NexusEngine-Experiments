# Game Production Ledger

Status: blocked on 50 validated mission experiments
Target: 10 new games, exactly 5 source experiments per game

## Totals

| Games created | Experiments mapped | Full doc sets | Expansion slices |
| ---: | ---: | ---: | ---: |
| 0 | 0 | 0 | 0 |

## Existing Games Excluded From Mission Count

- `next-ledge-grapple`
- `rogue-lite-hellscape-siege`
- `signal-bastion`
- `stonewake-depths`

These remain preserved legacy inventory. No mission game or gameplay-time claim exists yet.

## Run History

| Packet | Unit | ProtoKits start/final | Experiments start | Production commit | Validation | Push |
| --- | --- | --- | --- | --- | --- | --- |
| `2026-07-15-phase-a-production-baseline` | Phase A inventory | `ffdcc962d3c984864a2d78e9276879adf04250eb` | `615a7e1e2170164acef0edebdbe0b88b8c01fd1b` | `71a51c11847e99994a0cb8cdb6a137e27e806df9` | inventory check + JSON invariants passed | Experiments `origin/main` passed; ProtoKits unchanged |
| `2026-07-15-phase-a-goal-gate-alignment` | Phase A goal gate refinement | `ffdcc962d3c984864a2d78e9276879adf04250eb` | `6c6f473a39f89eddbd6361b8dc4d0f642fa2e368` | `d9255466e6883d8bb68e2a472e98ba1c2dba30ee` | inventory + JSON invariants + Playwright/Human View + diff passed | Experiments `origin/main` passed; ProtoKits unchanged |

## Required Game Gate

Each mission game must preserve five source experiments; share progression/state; include at least five connected scenes or regions with persistent transitions, objectives, escalation, failure/recovery, and completion; provide at least three materially different interaction modes when appropriate; and maintain the complete required documentation set before initial completion.
