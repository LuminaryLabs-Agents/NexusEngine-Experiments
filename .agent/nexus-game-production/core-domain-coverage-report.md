# Core Domain Coverage Report

Status: bootstrap Phase B catalog in progress
Accepted catalog definitions: 80 of 100 bootstrap definitions
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
| `flood-inundation-domain-kit` | simulation + data + world + spatial + physics observations | water balance, inundation, overtopping, drainage, and recession | pass |
| `soil-nutrient-cycle-domain-kit` | simulation + data + world | nutrient pools, transformations, transfers, uptake, return, and recovery | pass |
| `genetic-diversity-domain-kit` | data + simulation + agent identities | marker frequencies, contributions, diversity, relatedness, and cohort inheritance | pass |
| `seed-dispersal-domain-kit` | data + simulation + agent + world + spatial | biological seed transport lineage, viability, dormancy, and readiness | pass |
| `aquifer-balance-domain-kit` | simulation + data + world + spatial | groundwater storage, recharge, extraction, drawdown, and availability | pass |
| `potable-water-service-domain-kit` | simulation + data + policy + world + scene | treatment, safety clearance, storage, allocation, outages, and delivery acceptance | pass |
| `thermal-energy-network-domain-kit` | simulation + data + physics/world observations | multi-zone energy balance, transfer links, equilibrium, overheat, and freeze | pass |
| `habitat-atmosphere-balance-domain-kit` | simulation + data + world + scene + agent facts | sealed-compartment gas balance, exchange, processing, and breathability | pass |
| `seismic-event-sequence-domain-kit` | simulation + data + world + spatial + physics observations | fault stress, rupture order, regional intensity, aftershocks, and quiet recovery | pass |
| `orbital-transfer-window-domain-kit` | data + simulation + motion/physics/spatial observations | maneuver opportunities, reservations, tolerance, and arrival-window outcomes | pass |
| `seasonal-phenology-domain-kit` | simulation + data + world/agent observations | biological phenophase triggers, readiness, transitions, and missed windows | pass |
| `ecological-symbiosis-domain-kit` | data + simulation + agent/world facts | partner exchange, compatibility, asymmetric cost, dependency, and recovery | pass |
| `organic-decomposition-domain-kit` | simulation + data + world/agent observations | organic batch breakdown stages, decomposer contributions, returned mass, and stabilization | pass |
| `habitat-succession-domain-kit` | simulation + data + world + spatial | ecological stage graphs, transition eligibility, regression, and alternate stable states | pass |
| `bioaccumulation-domain-kit` | data + simulation + agent/world facts | body burden, elimination, trophic contaminant transfer, and biomagnification | pass |
| `volcanic-eruption-sequence-domain-kit` | simulation + data + world/spatial/physics observations | volcanic unrest, reservoir-to-vent allocation, eruption phases, discharge, and quiet recovery | pass |
| `material-recovery-stream-domain-kit` | data + simulation + policy + scene/world facts | heterogeneous discard classification, contamination grades, recovery yields, residuals, and dispositions | pass |
| `instrument-calibration-domain-kit` | data + diagnostics + policy + scene facts | reference comparison, drift, bias, uncertainty, adjustment, validity, and measurement fitness | pass |
| `chemical-reaction-batch-domain-kit` | simulation + data + policy observations | stoichiometric limits, reaction stages, yield, byproducts, quench, and terminal outcomes | pass |
| `specimen-integrity-domain-kit` | data + simulation + policy + scene/world facts | collection condition, seals, aliquot lineage, preservation exposure, contamination, and analysis readiness | pass |
| `cryosphere-mass-balance-domain-kit` | simulation + data + world/spatial observations | snow, firn, and ice reservoirs, accumulation, ablation, calving, runoff release, and equilibrium | pass |
| `wastewater-treatment-train-domain-kit` | simulation + data + policy + world/scene facts | ordered treatment stages, constituent removal and transfer, bypass, residuals, and effluent classes | pass |
| `material-corrosion-domain-kit` | simulation + data + scene/physics/diagnostics observations | corrosive exposure, protective-layer depletion, pitting, section loss, inspection confidence, and stabilization | pass |
| `orbital-conjunction-risk-domain-kit` | data + simulation + policy + motion/physics/spatial observations | conjunction screening, closest approach, uncertainty envelopes, risk classes, avoidance, and outcomes | pass |
| `celestial-event-visibility-domain-kit` | data + simulation + spatial/capture/world observations | observer eligibility, visibility conditions, event opportunities, acquisition completeness, and missed events | pass |
| `fermentation-culture-domain-kit` | simulation + data + agent/world facts | living culture lineage, viability, growth phases, conversion, contamination, maturation, and harvest | pass |
| `archaeological-stratigraphy-domain-kit` | data + policy + scene/world/spatial facts | deposition, cut, fill, containment, disturbance, mixing, and relative chronology | pass |
| `cultural-artifact-conservation-domain-kit` | data + policy + simulation + object-fidelity/scene facts | cultural-object condition, treatment compatibility, reversibility, stabilization, and readiness | pass |
| `circadian-entrainment-domain-kit` | simulation + data + agent/world observations | biological phase, zeitgeber entrainment, desynchronization, adaptation, and readiness windows | pass |
| `environmental-trace-persistence-domain-kit` | data + simulation + scene/spatial/agent facts | trace lineage, persistence, decay, disturbance, masking, contamination, transfer, and disappearance | pass |
| `material-fatigue-domain-kit` | simulation + data + physics/diagnostics/scene observations | cyclic damage, crack progression, inspection confidence, and fatigue service state | pass |
| `mechanical-wear-domain-kit` | simulation + data + physics/diagnostics/scene observations | contact-pair wear, lubrication, surface loss, debris, friction drift, and seizure risk | pass |
| `material-phase-transition-domain-kit` | simulation + data + physics/world observations | phase fractions, latent-energy budgets, hysteresis, reversal, and transition completion | pass |
| `watershed-runoff-domain-kit` | simulation + data + world/spatial/physics observations | catchment partition, routing, storage, outlet hydrographs, peaks, and recession | pass |
| `water-salinity-balance-domain-kit` | simulation + data + world/spatial/physics observations | salt mass, salinity, stratification, intrusion, flushing, and recovery | pass |
| `aquatic-oxygen-balance-domain-kit` | simulation + data + world/agent/physics observations | dissolved oxygen, saturation, biological demand, reaeration, hypoxia, and recovery | pass |
| `biogeochemical-carbon-cycle-domain-kit` | simulation + data + world/agent observations | carbon reservoirs, flux lineage, sequestration, release, conservation, and balance | pass |
| `behavioral-conditioning-domain-kit` | data + simulation + agent/input/interaction observations | cue-action-outcome associations, habituation, extinction, generalization, and discrimination | pass |
| `cultural-norm-adoption-domain-kit` | data + policy + simulation + agent/interaction observations | norm adoption lineage, compliance, sanctions, exemptions, contest, and replacement | pass |
| `magnetic-interaction-domain-kit` | simulation + data + physics/spatial/scene observations | polarity, magnetization, remanence, saturation, coupling, and force-intent descriptors | pass |
| `material-creep-domain-kit` | simulation + data + physics/diagnostics/scene observations | sustained-load creep stages, relaxation, deformation, rupture margin, and service state | pass |
| `granular-material-state-domain-kit` | simulation + data + physics/world/scene observations | bulk packing, segregation, flowability, bridging, jamming, discharge, and recovery | pass |
| `electrochemical-energy-storage-domain-kit` | simulation + data + physics/diagnostics/world observations | cell and pack charge, health, imbalance, cycle degradation, cutoff, and stranded energy | pass |
| `aqueous-acid-base-balance-domain-kit` | simulation + data + world/physics/diagnostics observations | acid-base equivalents, alkalinity, buffer reserve, dosing, pH bands, overshoot, and recovery | pass |
| `radioactive-decay-chain-domain-kit` | simulation + data + world/policy/diagnostics observations | nuclide inventories, deterministic branching, daughter lineage, activity bands, and stable products | pass |
| `optical-propagation-domain-kit` | simulation + data + physics/spatial observations; graphics presentation boundary | gameplay optical paths, medium transitions, polarization, attenuation, and receiver arrivals | pass |
| `capillary-wetting-domain-kit` | simulation + data + physics/spatial/world observations | wetting-front lineage, capillary uptake, hysteresis, saturation, breakthrough, drainage, and drying | pass |
| `selective-membrane-transport-domain-kit` | simulation + data + physics/world/diagnostics observations | selective species flux, retention, fouling, integrity, breakthrough, and regeneration | pass |
| `mechanical-resonance-domain-kit` | simulation + data + physics/diagnostics/scene observations | mechanical modes, forcing history, modal response, resonance capture, detuning, overload, and mitigation | pass |
| `dielectric-interaction-domain-kit` | simulation + data + physics/spatial/scene observations | dielectric polarization, stored charge, loss, hysteresis, coupling, discharge, and breakdown risk | pass |
| `interfacial-adhesion-domain-kit` | simulation + data + physics/scene/spatial observations | interface preparation, cure, bond capacity, debonding, repair, and residual adhesion | pass |
| `plastic-deformation-domain-kit` | simulation + data + physics/diagnostics/scene observations | yield history, elastic-plastic partition, hardening, residual deformation, necking, and collapse risk | pass |
| `fluid-cavitation-domain-kit` | simulation + data + physics/world/diagnostics observations | cavitation inception, cavity populations, collapse exposure, erosion intents, suppression, and recovery | pass |
| `surface-sorption-domain-kit` | simulation + data + world/physics/diagnostics observations | finite surface sites, competitive occupancy, adsorption, desorption, poisoning, and regeneration | pass |
| `photoluminescence-domain-kit` | simulation + data + graphics/physics/scene descriptor boundary | excitation populations, emission timing, afterglow, quenching, bleaching, and recovery | pass |
| `microbial-biofilm-domain-kit` | simulation + data + world/scene/agent observations | attached colonies, matrix stages, detachment, cleaning tolerance, dispersal, and recurrence | pass |
| `taphonomic-preservation-domain-kit` | simulation + data + world/scene/object-fidelity observations | burial, mineral replacement, compression, distortion, preservation quality, and recoverability | pass |
| `plant-transpiration-domain-kit` | simulation + data + world/agent/spatial observations | plant water stores, stomatal regulation, transpiration, turgor, wilting, and recovery | pass |
| `piezoelectric-transduction-domain-kit` | simulation + data + physics/spatial/diagnostics observations | bidirectional strain-charge transduction, orientation, coupling, saturation, and depolarization | pass |
| `crystal-nucleation-growth-domain-kit` | simulation + data + physics/world observations; Core Object Shape handoff | nucleus lineage, growth-front competition, habit, inclusions, defects, annealing, and quality | pass |

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
- `soil-fertility-domain-kit`: existing agriculture soil, fertility, watering, growth, and harvest ownership; refined to nutrient-pool mass balance.
- `atmosphere-weather-domain-kit`: existing atmosphere fog, sky, clouds, wind, precipitation, and visibility ownership; refined to sealed gas balance.
- `flood-water-body-domain-kit`: existing water-body/profile declaration; refined to flood propagation and recession semantics.
- `heat-pressure-domain-kit`: promoted resource/pressure scalar ownership; refined to a multi-zone thermal transfer network.
- `orbital-trajectory-domain-kit`: Core Motion and Physics trajectory/provider ownership; refined to transfer-window coordination over observations.
- `water-utility-domain-kit`: blurred aquifer, treatment, distribution, contamination, repair, and fluid physics; split to two explicit service boundaries.
- `radiation-dose-shielding-domain-kit`: existing radiation pressure, hazard, field, shielding, and exposure declarations already own the proposed surface.
- `avalanche-risk-domain-kit`: the current documented idea inventory already defines snowpack stress, trigger zones, and runout under that boundary.
- `ecosystem-food-web-domain-kit`: accepted ecosystem population cycle already owns aggregate feeding, predation, cohorts, carrying capacity, and trophic flow.
- `manufacturing-workflow-domain-kit`: existing semantic manufacturing/processing and crafting owners cover known-input production; refined to heterogeneous material recovery.
- `chain-of-custody-domain-kit`: existing custody/provenance declarations and investigation evidence ownership overlap; specimen integrity excludes evidentiary custody.
- `ecosystem-restoration-domain-kit`: blurred work plans, habitat fit, populations, interventions, and outcomes; refined to ecological succession stages only.
- `immune-response-lifecycle-domain-kit`: accepted contagion transmission already owns infection stages, recovery, immunity windows, exposure lineage, and outbreak state.
- `wildlife-migration-route-domain-kit`: documented migration-route and wildlife-population candidates already own paths, timing, population groups, and migration.
- `tidal-cycle-window-domain-kit`: the documented tidal-cycle candidate already owns tides and shoreline exposure.
- `landslide-slope-stability-domain-kit`: the documented landslide-risk candidate already owns slope stress, debris paths, and blockage.
- `pressure-vessel-integrity-domain-kit`: existing pressure-surge, pipe-break, and water-pressure declarations already own pressure, rupture, leak, valve, and repair semantics.
- `weather-risk-forecast-domain-kit`: existing weather-alert, hazard-forecast, storm-front, risk-forecast, and dependency-forecast declarations already own the proposed surface.
- `reproductive-life-cycle-domain-kit`: ecosystem population already owns reproduction and births, phenology owns life-stage timing, and genetic diversity owns parent contributions and inheritance.
- `combustion-process-domain-kit`: chemical reaction batches own reaction stages and byproducts while wildfire propagation owns spatial fuel ignition and burn spread.
- `fire-suppression-response-domain-kit`: existing fire-smoke and hazard-suppression declarations plus accepted wildfire containment already own suppression actions.
- `debt-obligation-domain-kit`: existing debt, invoice, social-debt, promise, and contract declarations plus negotiation commitments already own the lifecycle.
- `soil-moisture-balance-domain-kit`: the idea inventory explicitly declares soil moisture and agriculture already owns plot watering observations.
- `collective-consensus-domain-kit`: governance resolution owns proposals, quorum, ballots, ratification, enactment, challenge, and appeal; collective resolve owns group rally and break state.
- `sediment-transport-domain-kit`: the idea inventory already declares sediment flow while terrain erosion emits sediment and deposition deltas.
- `market-price-discovery-domain-kit`: economy plus market-pressure, price-band, procurement, forecast, mutation, and trade owners already cover the cluster.
- `geothermal-reservoir-domain-kit`: blurred aquifer, thermal, volcanic, power, pressure, extraction, and authored geology responsibilities.
- `organism-metabolism-domain-kit`: blurred survival resources, chemical conversion, respiration, growth, waste, population, and creature physiology.
- `dialect-evolution-domain-kit`: blurred language comprehension, rumor lineage, cultural norms, group identity, lexicons, and dialogue content.
- `osmosis-balance-domain-kit`: accepted selective membrane transport already owns gradients, permeability, selectivity, flux, retention, fouling, integrity, breakthrough, and regeneration.
- `catalyst-activity-domain-kit`: accepted chemical reaction batches already own catalyst references and effects, progress, yield, byproducts, quench, and outcomes.
- `brittle-fracture-propagation-domain-kit`: accepted fatigue already owns crack growth while structural support owns ordered support failure.
- `triboelectric-charging-domain-kit`: accepted wear owns contact history while dielectric interaction owns stored charge, coupling, discharge, and breakdown risk.
- `permafrost-thaw-domain-kit`: accepted cryosphere, phase-transition, thermal, and carbon boundaries already own its proposed state.
- `ocean-carbonate-balance-domain-kit`: accepted acid-base, carbon, salinity, and oxygen boundaries already own its proposed state.
- `biological-tissue-repair-domain-kit`: existing damage-health and status owners already own wounds, healing, restoration, and staged subject conditions.

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
| Object shape derivation | `core-object-shape-domain` | Add object-specific semantics or providers only; do not duplicate source/derived shape descriptors, preservation targets, content-addressed jobs, or quality evidence |

## Exact Next Audit

Audit bootstrap catalog definitions 081-090 against all 514 existing top-level folders, nested declarations, package exports, and the current Core map before acceptance.
