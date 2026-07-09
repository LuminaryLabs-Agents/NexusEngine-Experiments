import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  DOMAIN_MANA_RIFT_SPIRE_STABILIZATION_KITS,
  DOMAIN_MANA_RIFT_SPIRE_STABILIZATION_TREE,
  createDomainManaRiftSpireStabilizationReadiness
} from "../experiments/domain-mana-rift/domain-mana-rift-spire-stabilization-kits.js";

const cases = [
  { tick: 0, mana: 0.25, riftIntensity: 0.9, apprenticeCount: 7, anchorCount: 2, playerDistance: 14 },
  { tick: 8, mana: 0.4, riftIntensity: 0.7, apprenticeCount: 5, anchorCount: 3, playerDistance: 9 },
  { tick: 16, mana: 0.6, riftIntensity: 0.55, apprenticeCount: 6, anchorCount: 4, playerDistance: 8 },
  { tick: 24, mana: 0.82, riftIntensity: 0.36, apprenticeCount: 4, anchorCount: 5, playerDistance: 5 },
  { tick: 32, mana: 0.95, riftIntensity: 0.22, apprenticeCount: 8, anchorCount: 6, playerDistance: 3 },
  { tick: 40, mana: 0.5, riftIntensity: 0.8, apprenticeCount: 2, anchorCount: 1, playerDistance: 16 },
  { tick: 48, mana: 0.72, riftIntensity: 0.44, apprenticeCount: 9, anchorCount: 7, playerDistance: 11 },
  { tick: 56, mana: 0.33, riftIntensity: 0.61, apprenticeCount: 3, anchorCount: 3, playerDistance: 7 },
  { tick: 64, mana: 0.67, riftIntensity: 0.49, apprenticeCount: 6, anchorCount: 4, playerDistance: 12 },
  { tick: 72, mana: 0.88, riftIntensity: 0.18, apprenticeCount: 5, anchorCount: 5, playerDistance: 2 }
];

assert.equal(DOMAIN_MANA_RIFT_SPIRE_STABILIZATION_KITS.length, 8);
assert.ok(DOMAIN_MANA_RIFT_SPIRE_STABILIZATION_TREE.includes("renderer consumes descriptors only"));

for (const [index, input] of cases.entries()) {
  const readiness = createDomainManaRiftSpireStabilizationReadiness(input);
  assert.equal(readiness.domain, "domain-mana-rift-spire-stabilization-readiness-domain");
  assert.ok(["critical", "recoverable", "stabilized"].includes(readiness.missionState), `case ${index} mission state`);
  assert.ok(readiness.readiness >= 0 && readiness.readiness <= 1, `case ${index} readiness bounded`);
  assert.equal(readiness.descriptors.pulses.length, 6, `case ${index} pulse descriptors`);
  assert.equal(readiness.descriptors.vents.length, 4, `case ${index} vent descriptors`);
  assert.ok(readiness.descriptors.anchors.length >= 3, `case ${index} anchor descriptors`);
  assert.equal(readiness.descriptors.conduits.length, 5, `case ${index} conduit descriptors`);
  assert.equal(readiness.descriptors.wards.length, 3, `case ${index} ward descriptors`);
  assert.ok(readiness.descriptors.ledger.length >= 1, `case ${index} ledger descriptors`);
  assert.equal(readiness.rendererHandoff.rendererConsumesDescriptorsOnly, true, `case ${index} descriptor-only handoff`);
  assert.equal(readiness.rendererHandoff.totalDescriptors, Object.values(readiness.rendererHandoff.counts).reduce((sum, value) => sum + value, 0), `case ${index} handoff counts`);
  assert.doesNotThrow(() => JSON.stringify(readiness), `case ${index} serializable`);
}

const kitSource = readFileSync(new URL("../experiments/domain-mana-rift/domain-mana-rift-spire-stabilization-kits.js", import.meta.url), "utf8");
for (const forbidden of ["document.querySelector", "new WebGL", "THREE.", "requestAnimationFrame", "addEventListener("]) {
  assert.equal(kitSource.includes(forbidden), false, `reusable kit must not own ${forbidden}`);
}

console.log("Domain Mana Rift spire stabilization readiness kits smoke passed 10 intake cases.");
