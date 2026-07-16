# Core Domain Coverage Report

Status: bootstrap Phase B catalog in progress
Accepted catalog definitions: 20 of 100 bootstrap definitions
Implemented production kits: 0
Playable production experiments: 0

## Coverage Rule

Core is authoritative. A new kit must name the Core domains it configures or composes, explain the semantic responsibility Core does not own, and keep provider, renderer, browser, authored content, and game fiction outside reusable state. Coverage does not reward duplicating Core.

## Accepted Definition Coverage

| Accepted definition | Core mapping | New semantic ownership | Boundary result |
| --- | --- | --- | --- |
| `contagion-transmission-domain-kit` | simulation + data; agent/spatial observations | exposure lineage and infection lifecycle | pass |
| `ecosystem-population-cycle-domain-kit` | simulation + data + world regions | aggregate cohorts and trophic cycles | pass |
| `structural-support-network-domain-kit` | simulation + physics + scene | support topology and ordered failure propagation | pass |
| `collective-resolve-domain-kit` | simulation + agent + data | group resolve, break, and rally semantics | pass |
| `territory-influence-domain-kit` | simulation + spatial + scene + data | faction influence, contest, and control | pass |
| `rumor-propagation-domain-kit` | data + agent + policy | claim exposure, lineage, distortion, correction | pass |
| `navigation-knowledge-domain-kit` | data + world + scene + spatial | observer-specific place/link knowledge | pass |
| `rescue-triage-domain-kit` | simulation + interaction + data + agent | severity priority, stabilization, deterioration, transport readiness | pass |
| `negotiation-commitment-domain-kit` | data + policy + simulation + agent | offers, obligations, fulfillment, breach, settlement | pass |
| `habitat-suitability-domain-kit` | data + world + spatial + simulation | ecological fit and limiting-factor evaluation | pass |
| `wildfire-propagation-domain-kit` | simulation + data + world + spatial | fuel, ignition, spread, suppression, and containment | pass |
| `power-distribution-domain-kit` | simulation + data + world + scene + policy | sources, loads, switches, faults, islands, and service allocation | pass |
| `environmental-contamination-domain-kit` | data + simulation + world + spatial | contaminant release lineage, concentration, cleanup, and clearance | pass |
| `supply-chain-fulfillment-domain-kit` | data + simulation + world + policy | allocation, backorders, shipment milestones, and fulfillment outcomes | pass |
| `perishability-storage-domain-kit` | simulation + data + world observations | batch freshness, storage exposure, preservation, and spoilage | pass |
| `habitat-corridor-domain-kit` | data + world + spatial | species-specific ecological connectivity and isolation | pass |
| `pollination-network-domain-kit` | data + simulation + agent + world + spatial | visits, pollen lineage, compatibility, fertilization, and readiness | pass |
| `lineage-succession-domain-kit` | data + policy + agent | descent, inherited eligibility, precedence, and succession | pass |
| `governance-resolution-domain-kit` | data + policy + simulation + agent | proposals, quorum, ballots, ratification, and enactment | pass |
| `language-comprehension-domain-kit` | data + agent + policy + optional ML observations | proficiency, mutual intelligibility, semantic comprehension, and learning | pass |

No definition claims Core state primitives, provider implementations, renderer ownership, raw input, browser lifecycle, or game-specific content.

## Rejected Overlap Summary

- `signal-triangulation-domain-kit`: existing universal survey/cartography declaration and adjacent acoustic/scan owners.
- `investigation-evidence-domain-kit`: existing `engine.n.investigation` owns evidence and hypotheses.
- `crafting-transformation-domain-kit`: existing crafting domain service and recipe-table owners.
- `shelter-exposure-domain-kit`: existing survival-needs/weather meaning plus promoted resource/pressure primitives.
- `crowd-flow-demand-domain-kit`: promoted Core `OccupantFlowKit` and `RequestQueueKit` semantics.
- `formation-assignment-domain-kit`: existing Agent Group formation-state ownership.
- `infrastructure-restoration-domain-kit`: existing semantic `engine.n.restoration` owner.
- `stealth-suspicion-domain-kit`: existing sensory/perception observations plus RPG social suspicion.
- `item-ownership-transfer-domain-kit`: existing RPG social ownership, theft, and return facts.
- `utility-network-domain-kit`: blurred electricity, water, fuel, data, repair, and service semantics; split to power distribution.
- `incident-priority-domain-kit`: Core RequestQueue priority plus rescue-triage severity ownership.
- `signal-relay-domain-kit`: existing acoustic signal owner plus universal signal/relay declarations.

## Baseline Risk Map

| Existing ProtoKit family | Current Core authority | Continuing disposition |
| --- | --- | --- |
| Registry, capability graph, composition planning | `core-composition-kit` | Treat wrappers as compatibility/history; reject new duplicates |
| Seed streams, completion ledgers, state digests | `core-data-kit` | Require higher-level procedural, knowledge, or progression meaning |
| Resource meters, pressure loops, action windows | `core-simulation-kit` | Require a composed semantic loop beyond the primitive |
| Interaction/affordance aliases | `core-interaction-kit` | Merge/adapter review before adjacent acceptance |
| Transform, spatial scene graph, zones | `core-spatial-kit` + `core-scene-kit` | Require semantic spatial behavior, not renamed facts |
| Render/visual descriptors | `core-graphics-kit` | Descriptor composition allowed; renderer ownership forbidden |
| Camera modes | `core-camera-kit` | Specialized policy only with distinct reuse proof |
| Physics wrappers | `core-physics-kit` | Provider adapters or gameplay meaning only |
| World/terrain/content families | `core-world-domain` plus providers | Heavy terrain/content stays provider-owned; portable snapshots remain light |
| Capture, compute, object fidelity | dedicated Core domains | Compose requests/builders/providers; no parallel orchestration |

## Exact Next Audit

Audit bootstrap catalog definitions 021-030 against all 514 existing top-level folders, nested declarations, package exports, and the current Core map before acceptance.
