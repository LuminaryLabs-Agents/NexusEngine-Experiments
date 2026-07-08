import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  COZY_ISLAND_SEA_TURTLE_HATCHERY_DOMAIN_TREE,
  COZY_ISLAND_SEA_TURTLE_FORBIDDEN_OWNERSHIP,
  createCozyIslandNestTemperatureBandKit,
  createCozyIslandPredatorTrackBufferKit,
  createCozyIslandMoonlitHatchlingLaneKit,
  createCozyIslandSurfWindowTimingKit,
  createCozyIslandVolunteerRopeLineKit,
  createCozyIslandReleaseLedgerStampKit,
  createCozyIslandSeaTurtleHatcheryReadinessDomainKit
} from "../experiments/cozy-island/cozy-island-sea-turtle-hatchery-kits.js";

const cases = [
  { name: "balanced moon hatch", seed: "turtle-01", tide: 0.36, stormRisk: 0.12, sandHeat: 0.52, moonPhase: 0.84, predatorPressure: 0.24, visitorPressure: 0.18, surfCalm: 0.86, volunteerCoverage: 0.72 },
  { name: "hot nest emergency", seed: "turtle-02", tide: 0.42, stormRisk: 0.2, sandHeat: 0.9, moonPhase: 0.66, predatorPressure: 0.28, visitorPressure: 0.32, surfCalm: 0.7, volunteerCoverage: 0.6 },
  { name: "cold storm nests", seed: "turtle-03", tide: 0.7, stormRisk: 0.82, sandHeat: 0.18, moonPhase: 0.52, predatorPressure: 0.46, visitorPressure: 0.4, surfCalm: 0.32, volunteerCoverage: 0.44 },
  { name: "predator sweep", seed: "turtle-04", tide: 0.5, stormRisk: 0.18, sandHeat: 0.55, moonPhase: 0.74, predatorPressure: 0.92, visitorPressure: 0.35, surfCalm: 0.68, volunteerCoverage: 0.66 },
  { name: "visitor rope shortage", seed: "turtle-05", tide: 0.44, stormRisk: 0.22, sandHeat: 0.5, moonPhase: 0.78, predatorPressure: 0.38, visitorPressure: 0.92, surfCalm: 0.62, volunteerCoverage: 0.22 },
  { name: "flat surf hold", seed: "turtle-06", tide: 0.88, stormRisk: 0.54, sandHeat: 0.54, moonPhase: 0.36, predatorPressure: 0.4, visitorPressure: 0.24, surfCalm: 0.18, volunteerCoverage: 0.58 },
  { name: "bright full moon", seed: "turtle-07", tide: 0.28, stormRisk: 0.06, sandHeat: 0.49, moonPhase: 0.98, predatorPressure: 0.2, visitorPressure: 0.2, surfCalm: 0.9, volunteerCoverage: 0.82 },
  { name: "weak moon confusion", seed: "turtle-08", tide: 0.31, stormRisk: 0.16, sandHeat: 0.57, moonPhase: 0.08, predatorPressure: 0.28, visitorPressure: 0.74, surfCalm: 0.76, volunteerCoverage: 0.48 },
  { name: "low coverage mixed risk", seed: "turtle-09", tide: 0.58, stormRisk: 0.44, sandHeat: 0.62, moonPhase: 0.62, predatorPressure: 0.6, visitorPressure: 0.56, surfCalm: 0.5, volunteerCoverage: 0.18 },
  { name: "fallback defaults", seed: "turtle-10" }
];

const source = readFileSync("experiments/cozy-island/cozy-island-sea-turtle-hatchery-kits.js", "utf8");
const implementationSource = source.replace(/export const COZY_ISLAND_SEA_TURTLE_FORBIDDEN_OWNERSHIP = \[[\s\S]*?\];/, "");
const domain = createCozyIslandSeaTurtleHatcheryReadinessDomainKit();

assert.ok(COZY_ISLAND_SEA_TURTLE_HATCHERY_DOMAIN_TREE.includes("nest-protection-domain"), "domain tree keeps nest protection split");
assert.ok(COZY_ISLAND_SEA_TURTLE_HATCHERY_DOMAIN_TREE.includes("hatchling-route-domain"), "domain tree keeps hatchling route split");
assert.ok(COZY_ISLAND_SEA_TURTLE_HATCHERY_DOMAIN_TREE.includes("renderer consumes descriptors only"), "domain tree declares handoff policy");
for (const marker of COZY_ISLAND_SEA_TURTLE_FORBIDDEN_OWNERSHIP) {
  assert.equal(implementationSource.includes(marker), false, `kit source must not own ${marker}`);
}

for (const input of cases) {
  const readiness = domain.evaluate(input);
  assert.equal(readiness.kind, "cozy-island.sea-turtle-hatchery.readiness", `${input.name}: readiness kind`);
  assert.ok(readiness.nestTemperatureBands.length >= 3, `${input.name}: nest temperature descriptors`);
  assert.ok(readiness.predatorTrackBuffers.length >= 3, `${input.name}: predator buffer descriptors`);
  assert.ok(readiness.moonlitHatchlingLanes.length >= 4, `${input.name}: moonlit lane descriptors`);
  assert.equal(readiness.surfWindowTimings.length, 3, `${input.name}: surf window descriptors`);
  assert.ok(readiness.volunteerRopeLines.length >= 3, `${input.name}: rope line descriptors`);
  assert.equal(readiness.releaseLedgerStamps.length, 1, `${input.name}: release ledger descriptor`);
  assert.equal(readiness.rendererHandoff.counts.total, readiness.rendererHandoff.descriptors.length, `${input.name}: handoff total mirrors descriptors`);
  assert.equal(readiness.rendererHandoff.descriptorPolicy, "renderer-consumes-descriptors-only", `${input.name}: handoff policy`);
  assert.doesNotThrow(() => JSON.stringify(readiness), `${input.name}: serializable output`);
}

assert.equal(createCozyIslandNestTemperatureBandKit(cases[1]).length, 4, "extreme sand heat adds fourth temperature band");
assert.equal(createCozyIslandPredatorTrackBufferKit(cases[3]).length, 4, "predator pressure adds fourth buffer");
assert.equal(createCozyIslandMoonlitHatchlingLaneKit(cases[6]).length, 5, "full moon adds fifth hatchling lane");
assert.equal(createCozyIslandSurfWindowTimingKit(cases[0]).length, 3, "surf timing exposes three windows");
assert.equal(createCozyIslandVolunteerRopeLineKit(cases[4]).length, 4, "low volunteer coverage and visitor pressure add rope line");
assert.equal(createCozyIslandReleaseLedgerStampKit(cases[3])[0].state.priority, "sweep tracks", "predator case changes ledger priority");

console.log(`cozy island sea turtle hatchery readiness kits smoke passed ${cases.length} intake cases`);
