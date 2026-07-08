import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  COZY_ISLAND_TIDEPOOL_CONSERVATORY_DOMAIN_TREE,
  COZY_ISLAND_TIDEPOOL_FORBIDDEN_OWNERSHIP,
  createCozyIslandCoralNurseryBedKit,
  createCozyIslandTidepoolSpecimenTrailKit,
  createCozyIslandHermitCrabCrossingKit,
  createCozyIslandShellMarkerMosaicKit,
  createCozyIslandMoonTideSurveyKit,
  createCozyIslandConservationLedgerKit,
  createCozyIslandTidepoolConservatoryReadinessDomainKit
} from "../experiments/cozy-island/cozy-island-tidepool-conservatory-kits.js";

const cases = [
  { name: "clear balanced reef", seed: "tidepool-01", tide: 0.38, stormRisk: 0.12, waterClarity: 0.86, coralHealth: 0.66, crabActivity: 0.48, shellSupply: 0.62, moonPhase: 0.42, visitorPressure: 0.24 },
  { name: "coral emergency", seed: "tidepool-02", tide: 0.32, stormRisk: 0.28, waterClarity: 0.52, coralHealth: 0.22, crabActivity: 0.42, shellSupply: 0.44, moonPhase: 0.58, visitorPressure: 0.35 },
  { name: "murky storm tide", seed: "tidepool-03", tide: 0.74, stormRisk: 0.84, waterClarity: 0.24, coralHealth: 0.44, crabActivity: 0.52, shellSupply: 0.3, moonPhase: 0.76, visitorPressure: 0.66 },
  { name: "crab migration", seed: "tidepool-04", tide: 0.46, stormRisk: 0.2, waterClarity: 0.68, coralHealth: 0.58, crabActivity: 0.92, shellSupply: 0.5, moonPhase: 0.34, visitorPressure: 0.72 },
  { name: "shell shortage", seed: "tidepool-05", tide: 0.4, stormRisk: 0.34, waterClarity: 0.64, coralHealth: 0.54, crabActivity: 0.38, shellSupply: 0.12, moonPhase: 0.51, visitorPressure: 0.44 },
  { name: "full moon survey", seed: "tidepool-06", tide: 0.28, stormRisk: 0.06, waterClarity: 0.82, coralHealth: 0.74, crabActivity: 0.54, shellSupply: 0.7, moonPhase: 0.98, visitorPressure: 0.2 },
  { name: "visitor reroute", seed: "tidepool-07", tide: 0.48, stormRisk: 0.16, waterClarity: 0.58, coralHealth: 0.62, crabActivity: 0.62, shellSupply: 0.42, moonPhase: 0.48, visitorPressure: 0.9 },
  { name: "healthy nursery", seed: "tidepool-08", tide: 0.34, stormRisk: 0.1, waterClarity: 0.88, coralHealth: 0.9, crabActivity: 0.44, shellSupply: 0.75, moonPhase: 0.22, visitorPressure: 0.18 },
  { name: "windy catalog", seed: "tidepool-09", tide: 0.55, stormRisk: 0.52, waterClarity: 0.72, coralHealth: 0.55, crabActivity: 0.7, shellSupply: 0.5, moonPhase: 0.63, visitorPressure: 0.5, wind: { x: 0.8, z: -0.35 } },
  { name: "fallback defaults", seed: "tidepool-10" }
];

const source = readFileSync("experiments/cozy-island/cozy-island-tidepool-conservatory-kits.js", "utf8");
const implementationSource = source.replace(/export const COZY_ISLAND_TIDEPOOL_FORBIDDEN_OWNERSHIP = \[[\s\S]*?\];/, "");
const domain = createCozyIslandTidepoolConservatoryReadinessDomainKit();

assert.ok(COZY_ISLAND_TIDEPOOL_CONSERVATORY_DOMAIN_TREE.includes("reef-stewardship-domain"), "domain tree keeps reef stewardship split");
assert.ok(COZY_ISLAND_TIDEPOOL_CONSERVATORY_DOMAIN_TREE.includes("shorelife-safety-domain"), "domain tree keeps shorelife safety split");
assert.ok(COZY_ISLAND_TIDEPOOL_CONSERVATORY_DOMAIN_TREE.includes("renderer consumes descriptors only"), "domain tree declares handoff policy");
for (const marker of COZY_ISLAND_TIDEPOOL_FORBIDDEN_OWNERSHIP) {
  assert.equal(implementationSource.includes(marker), false, `kit source must not own ${marker}`);
}

for (const input of cases) {
  const readiness = domain.evaluate(input);
  assert.equal(readiness.kind, "cozy-island.tidepool-conservatory.readiness", `${input.name}: readiness kind`);
  assert.ok(readiness.coralNurseryBeds.length >= 3, `${input.name}: coral descriptors`);
  assert.ok(readiness.tidepoolSpecimenTrails.length >= 4, `${input.name}: specimen descriptors`);
  assert.ok(readiness.hermitCrabCrossings.length >= 3, `${input.name}: crab crossing descriptors`);
  assert.ok(readiness.shellMarkerMosaics.length >= 2, `${input.name}: shell marker descriptors`);
  assert.equal(readiness.moonTideSurveys.length, 3, `${input.name}: moon tide descriptors`);
  assert.equal(readiness.conservationLedgers.length, 1, `${input.name}: conservation ledger descriptor`);
  assert.equal(readiness.rendererHandoff.counts.total, readiness.rendererHandoff.descriptors.length, `${input.name}: handoff total mirrors descriptors`);
  assert.equal(readiness.rendererHandoff.descriptorPolicy, "renderer-consumes-descriptors-only", `${input.name}: handoff policy`);
  assert.doesNotThrow(() => JSON.stringify(readiness), `${input.name}: serializable output`);
}

assert.equal(createCozyIslandCoralNurseryBedKit(cases[1]).length, 4, "low coral health adds fourth nursery bed");
assert.equal(createCozyIslandTidepoolSpecimenTrailKit(cases[0]).length, 5, "clear water adds fifth specimen trail");
assert.equal(createCozyIslandHermitCrabCrossingKit(cases[3]).length, 4, "high crab activity adds fourth crossing");
assert.equal(createCozyIslandShellMarkerMosaicKit(cases[4]).length, 2, "low shell supply constrains mosaics");
assert.equal(createCozyIslandMoonTideSurveyKit(cases[5]).length, 3, "moon tide survey has three windows");
assert.equal(createCozyIslandConservationLedgerKit(cases[1])[0].state.priority, "restore reef", "coral emergency changes ledger priority");

console.log(`cozy island tidepool conservatory readiness kits smoke passed ${cases.length} intake cases`);
