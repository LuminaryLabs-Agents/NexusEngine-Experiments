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
| `2026-07-15-bootstrap-catalog-011-020` | 0 | Catalog 011-020 | `ffdcc962d3c984864a2d78e9276879adf04250eb` | `abf797a5c2d6cb949fc8441a7edca9c7a080a40c` | `e024ef0027b4e272efa6a66a05edf04538443e6a` | inventory + JSON + collision invariants + Playwright/Human View passed | Experiments production commit published; ProtoKits unchanged |
| `2026-07-15-bootstrap-catalog-021-030` | 0 | Catalog 021-030 | `ffdcc962d3c984864a2d78e9276879adf04250eb` | `f39ecda720cd27664395d925307466e44cf6155c` | `6f6b0b3bf5137c6d882bde0264682e6e0d12c5de` | inventory + JSON + collision invariants + Playwright/Human View passed | Experiments production commit published; ProtoKits unchanged |
| `2026-07-15-bootstrap-catalog-031-040` | 0 | Catalog 031-040 | `ffdcc962d3c984864a2d78e9276879adf04250eb` | `2333e61eb808831e59559462487c0c013108eee3` | `d7640696fa98f77372e7605e506584adcfe58094` | inventory + JSON + collision invariants + Playwright/Human View passed | Experiments production commit published; ProtoKits unchanged |
| `2026-07-15-bootstrap-catalog-041-050` | 0 | Catalog 041-050 | `ffdcc962d3c984864a2d78e9276879adf04250eb` | `740ee0c63a24a8614e28d53abafc01c0913abd59` | `31d5c48e7b31855044b2eeadc9d6f07a14f98bf9` | inventory + JSON + collision invariants + Playwright/Human View passed | Experiments production commit published; ProtoKits unchanged |
| `2026-07-16-bootstrap-catalog-051-060` | 0 | Catalog 051-060 | `ffdcc962d3c984864a2d78e9276879adf04250eb` | `40ed1bff0bacb3b5fafdb83845451e505bc1bb51` | `4771dc0dfb503fd57f8669d260e4b8a4fde690a7` | Core refresh + inventory + JSON + collision invariants + Playwright/Human View passed | Experiments production commit published; ProtoKits unchanged |
| `2026-07-16-bootstrap-catalog-061-070` | 0 | Catalog 061-070 | `ffdcc962d3c984864a2d78e9276879adf04250eb` | `1b6e6aab6705b08447bd4929a1e053ea259d594f` | `ebe847ce07eec14bdc497a27560214c3d85596f4` | Core refresh + inventory + JSON + collision invariants + Playwright/Human View passed | Experiments production commit published; ProtoKits unchanged |

## Source Migration Gate

Exactly five validated production experiments map into each production game. Source folders are disposable only after `feature-migration-ledger.json` inventories their full feature union, the successor proves every retained feature, references are cleaned, and `retirement-ledger.md` records the result.

## Required Game Gate

Each game must share progression/state; include at least five connected scenes or regions with persistent transitions, objectives, escalation, failure/recovery, and completion; provide at least three materially different interaction modes when appropriate; and maintain the complete required documentation set before initial completion.
