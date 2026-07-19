# Consolidated Engine-Domain Atlas

Status: complete bounded atlas for the tested design space
Core baseline: `a5882b47bd5a9284550bb3af1f0cd8580c62665e` (read-only committed state)
ProtoKits baseline: `5986b69b047d622ea2efe58d12876033f3de2291`

## Current Family: Rescue Dispatch Under Infrastructure Decay

| Layer | Canonical owner | Owns | Excludes | Evidence |
| --- | --- | --- | --- | --- |
| Core | NexusEngine realtime substrate | ECS world, deterministic ticks, resources, events, DSK installation, reset/snapshot contracts | rescue meaning, route knowledge, structural failure policy, browser presentation | Core `createEngine` and `defineDomainServiceKit` public contracts |
| Core | Core Scene / Spatial / Simulation | stable identities, world/scene facts, explicit simulation inputs | observer knowledge, triage priority, semantic support topology | Core domain docs at the pinned baseline |
| Feature domain | `navigation-knowledge-domain-kit` | observer-specific facts, confidence decay, staleness, provenance, sharing, snapshot/reset | world truth, pathfinding, movement, map rendering | ProtoKit README, source, smoke replay |
| Feature domain | `rescue-triage-domain-kit` | fictional assessment, priority, deterioration, treatment stages, stabilization, transport readiness, outcomes | diagnosis, inventory, transport movement, UI | ProtoKit README, source, smoke replay |
| Feature domain | `structural-support-network-domain-kit` | semantic support graph, loads, margins, repair state, deterministic failure propagation | rigid bodies, fracture rendering, placement, scene content | ProtoKit README, source, smoke replay |
| Route domain | `SAT-001 Floodline Triage` host | authored sites/routes, player command ordering, win/loss composition, keyboard/pointer input, Canvas/DOM projection | reusable domain state or parallel ownership | pre-build scope and eventual browser proof |

## Initial Ownership Matrix

| Responsibility | Disposition | Canonical owner | Consolidation decision |
| --- | --- | --- | --- |
| deterministic runtime and DSK lifecycle | Core-reused | NexusEngine Core | no ProtoKit duplicate |
| observer route confidence and staleness | domain-reused | Navigation Knowledge | route host reads descriptors/snapshots only |
| casualty deterioration and stabilization | domain-reused | Rescue Triage | route host does not own parallel severity state |
| causeway support, load margin, and failure | domain-reused | Structural Support Network | route host supplies authored topology and loads |
| site and route fiction | local-only | SAT-001 content | not reusable engine meaning |
| keyboard/pointer translation | adapter-only | SAT-001 browser host | never promoted into simulation domains |
| win/loss ordering across the three domains | local-only | SAT-001 route composition | one proof and one consumer; no reusable owner justified |
| Canvas/HUD projection | adapter-only | SAT-001 presentation | consumes domain snapshots; owns no simulation state |

## Overlap And Ambiguity Ledger

- Navigation Knowledge does not duplicate Core pathfinding: it owns what an observer knows, not how a path is solved.
- Rescue Triage does not duplicate Core health/damage: it owns authored rescue priority and care stages, not combat vitality or clinical guidance.
- Structural Support Network does not duplicate Core Physics: it owns semantic support topology and ordered gameplay failure above provider-neutral observations.
- Cross-domain win/loss composition remains route-local until multiple validated consumers prove one natural reusable owner.

## SAT-001 Consolidation Result

- Canonical owners remained Core Realtime/DSK, Navigation Knowledge, Rescue Triage, and Structural Support Network.
- The route consumed domain snapshots and commands directly; it created no parallel route-confidence, severity, treatment, support-margin, or failure state.
- The tempting `rescue-dispatch-orchestrator` candidate was rejected: it describes this route's authored ordering, has one proven consumer, and adds no atomic meaning above the three existing owners.
- The route-freshness plus transport-ready command check remains local policy. Promoting it would duplicate existing condition/gate composition without a second consumer or owned lifecycle.
- No compatibility alias, legacy consumer, duplicate state, or reusable implementation was introduced, so migration, parity, and duplicate-removal obligations are satisfied by canonical direct use and zero removable concepts.

SAT-001 newly accepted atomic capabilities: **0**.

## Current Family: Social Truth, Commitment, And Group Readiness

| Layer | Canonical owner | Owns | Excludes |
| --- | --- | --- | --- |
| Core | NexusEngine realtime substrate | deterministic world, DSK install, resources, events, reset/snapshot | rumor, negotiation, resolve, browser presentation |
| Feature domain | `rumor-propagation-domain-kit` | claim exposure, seeded distortion, lineage, credibility, correction, retirement | dialogue generation, truth adjudication, agent choice, UI |
| Feature domain | `negotiation-commitment-domain-kit` | sessions, offers, accepted terms, obligations, deadlines, fulfillment/breach/release, settlement | dialogue, transfers, enforcement, relationship scores, UI |
| Feature domain | `collective-resolve-domain-kit` | group readiness, leadership, shocks, break, rally, recovery | individual emotion, planning, dialogue, animation, UI |
| Route domain | `SAT-002 Glasshouse Accord` host | authored testimony, player ordering, visible council state, ending composition, input/presentation | reusable claim, obligation, or resolve state |

Potential `truth-backed-offer` orchestration remains unaccepted pending play. It must not become a fourth state owner above exposure correction, obligation status, and collective resolve.

## SAT-002 Consolidation Result

- Rumor Propagation remained the sole owner of distorted exposure, lineage, and correction state.
- Negotiation Commitment remained the sole owner of offers, accepted obligations, fulfillment/breach, and settlement.
- Collective Resolve remained the sole owner of shock aggregation, break, and rally state.
- The host translated observed distortion and breach facts into explicit shock commands without retaining a second rumor, obligation, or resolve model.
- `truth-backed-offer`, `council-mediation`, and `verified-pledge-orchestrator` candidates were rejected as route-specific ordering with one consumer and no independent lifecycle.
- The host's corrected-exposure and non-broken preconditions are local command policy; a promoted gate would duplicate existing condition/gate composition without consumer or reset evidence.
- No legacy consumer, alias, reusable implementation, or duplicate live state was created. Canonical direct use proves parity; migration and removal obligations are empty.

SAT-002 newly accepted atomic capabilities: **0**.

## Current Family: Habitat Fit And Aggregate Ecology

| Layer | Canonical owner | Owns | Excludes |
| --- | --- | --- | --- |
| Core | NexusEngine realtime substrate | deterministic world, DSK install, resources, events, reset/snapshot | ecological interpretation, content, presentation |
| Feature domain | `habitat-suitability-domain-kit` | requirement profiles, observations, weighted suitability, limiting factors, eligibility | terrain, weather, population cycles, creatures, UI |
| Feature domain | `ecosystem-population-cycle-domain-kit` | species cohorts, migration, carrying capacity, seeded population cycles | spawn placement, individual AI, rendered wildlife, UI |
| Route domain | `SAT-003 Luminous Nursery` host | authored cradles/species, action order, endings, input, aquarium presentation | reusable suitability or population state |

## SAT-003 Consolidation Result

- Habitat Suitability remained the sole owner of observations, scores, limiting factors, and occupancy eligibility.
- Ecosystem Population Cycle remained the sole owner of migration totals, capacities, cycle count, and seeded cohort change.
- The host retained only sampled/tuned presentation flags and the two-season ending; every meaningful ecological value is read from canonical snapshots.
- `habitat-gated-population`, `reef-restoration-cycle`, and a new occupancy orchestrator were rejected as one-consumer ordering without an independent lifecycle.
- The eligibility-before-migration check is route policy. A reusable predicate owner would merge into the existing condition/gate family rather than form an ecological atom.
- No alias, reusable duplicate, or legacy consumer was introduced. Canonical direct use proves parity, leaving migration and duplicate-removal sets empty.

SAT-003 newly accepted atomic capabilities: **0**.

## Current Family: Timing Windows And Pressure Thresholds

| Layer | Canonical owner | Owns | Excludes |
| --- | --- | --- | --- |
| Core | NexusEngine scheduler/clock | deterministic phases, explicit bounded delta, runtime-kit install, events/resources | authored windows, pressure meaning, forge presentation |
| Feature domain | `action-window-domain-kit` | window time/status, completion, attempts, success/failure events | browser input, game tutorial, rendering |
| Feature domain | `pressure-domain-kit` | pressure channels, adjustments, warning/failure classification | HUD, game-specific fail screens, browser timers |
| Route domain | `SAT-004 Bellows Crown` host | authored bands/costs, strike order, fixed-step input mapping, endings, forge projection | parallel timing or pressure state |

## SAT-004 Consolidation Result

- Action Window remained the sole owner of pending/open/expired/completed status and attempt outcomes.
- Pressure remained the sole owner of furnace value and stable/warning/failed classification.
- The host's half-beat input uses Core's explicit tick configuration; it does not retain another clock or infer window status.
- `forge-rhythm-domain`, `timed-heat-combo`, and a generic timed-pressure coordinator were rejected as route ordering over existing atoms.
- Vent's simultaneous time cost and pressure reduction is a specialization with one consumer, not a new lifecycle.
- No reusable implementation, alias, or legacy consumer was introduced. Canonical state parity is direct and migration/removal sets are empty.

SAT-004 newly accepted atomic capabilities: **0**.

## Current Family: Lightweight Bodies And Weighted Triggers

| Layer | Canonical owner | Owns | Excludes |
| --- | --- | --- | --- |
| Core | NexusEngine scheduler/runtime | deterministic phases, resources/events, explicit commands, runtime-kit installation | body/weight semantics, sculpture content, rendering |
| Feature domain | `physics-body-lite-domain-kit` | lightweight body position, velocity, mass, impulse, friction, coarse contacts | full rigid-body physics, renderer, puzzle meaning |
| Feature domain | `weighted-trigger-domain-kit` | bounded weight sources, aggregate plate weight, activation/release facts, descriptors | object art, door or puzzle outcome, rendering |
| Route domain | `SAT-005 Counterweight Cathedral` host | authored stones/bowls, selection, settle observation, exact/overload ending, sculpture projection | parallel body or trigger state |

## SAT-005 Consolidation Result

- Physics Body Lite remained the sole owner of each stone's position, mass, velocity, impulse response, and friction.
- Weighted Trigger remained the sole owner of plate bounds, source membership, aggregate weight, and activation.
- The host bridge explicitly submits a settled canonical body position as a weight-source observation; it creates no reusable state owner.
- `counterweight-puzzle-domain`, `balance-mobile-domain`, and an exact-weight trigger atom were rejected. Exact equality and overload are authored outcome policies over the existing aggregate.
- No reusable duplicate, alias, or legacy consumer was introduced. Direct canonical reads prove parity and leave migration/removal sets empty.

SAT-005 newly accepted atomic capabilities: **0**.

## Atlas Maturity Decision

The five-unit qualifying streak contains five different semantic families and five different primary player loops:

1. rescue ordering under structural decay;
2. truth correction into commitments and group resolve;
3. habitat evidence into aggregate ecological establishment;
4. fixed-step action windows under pressure thresholds;
5. deterministic body placement into weighted activation.

Every candidate was classified, every canonical owner retained sole state authority, and all migration/parity/duplicate-removal sets were reconciled before counting. Across the tested design space, the series accepted **0** new atomic capabilities in five consecutive validated experiments. Atlas status: **sufficiently comprehensive for the tested design space**.
