import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSoraCloudClinicTriageReadinessDomainKit } from "../experiments/sora-the-infinite/sora-cloud-clinic-triage-readiness-kits.js";

const domainKit = createSoraCloudClinicTriageReadinessDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => ({
  tick: index * 41,
  readiness: index / 9,
  stormRisk: 1 - index / 12,
  input: {
    bank: (index % 3 - 1) * 0.45,
    climb: index % 2 ? 0.5 : -0.25,
    pointerX: index / 9,
    pointerY: 1 - index / 10,
    pointerActive: index % 2 === 0
  },
  skyRescueReadiness: { rendererHandoff: { counts: { total: 16 + index } } },
  skyLighthouseReadiness: { rendererHandoff: { counts: { total: 11 + index } } },
  skyRookeryMigrationReadiness: { rendererHandoff: { counts: { total: 13 } } },
  starOrchardRescueReadiness: { rendererHandoff: { counts: { total: 14 } } },
  skyRadioBeaconReadiness: { rendererHandoff: { counts: { total: 22 } }, dawnRadioLedger: { stormRisk: 0.5 } }
}));

for (const [index, input] of cases.entries()) {
  const result = domainKit.describe(input);
  assert.equal(result.cloudClinicLandingPads.length, 5, `case ${index} landing pads`);
  assert.equal(result.pulseKiteTriage.length, 6, `case ${index} pulse kites`);
  assert.equal(result.vaporSterilizerRings.length, 4, `case ${index} sterilizer rings`);
  assert.equal(result.medicineSatchelBalances.length, 5, `case ${index} medicine satchels`);
  assert.equal(result.recoveryHammockBays.length, 4, `case ${index} hammock bays`);
  assert.equal(result.rendererHandoff.counts.total, 25, `case ${index} handoff count`);
  assert.ok(result.readinessScore >= 0 && result.readinessScore <= 1, `case ${index} bounded readiness`);
  assert.ok(result.patientRisk >= 0 && result.patientRisk <= 1, `case ${index} bounded patient risk`);
  assert.ok(["circle-clinic", "triage-clouds", "receive-patients"].includes(result.missionState), `case ${index} mission state`);
  assert.doesNotThrow(() => JSON.stringify(result), `case ${index} serializable`);
}

const cold = domainKit.describe({ tick: 0, readiness: 0.05, stormRisk: 0.9, input: { bank: 1, pointerY: 1 } });
const prepared = domainKit.describe({
  tick: 120,
  readiness: 0.95,
  stormRisk: 0.1,
  input: { bank: 0, pointerY: 0.5 },
  skyRescueReadiness: { rendererHandoff: { counts: { total: 25 } } },
  skyLighthouseReadiness: { rendererHandoff: { counts: { total: 20 } } },
  skyRookeryMigrationReadiness: { rendererHandoff: { counts: { total: 20 } } },
  starOrchardRescueReadiness: { rendererHandoff: { counts: { total: 20 } } },
  skyRadioBeaconReadiness: { rendererHandoff: { counts: { total: 25 } }, dawnRadioLedger: { stormRisk: 0.08 } }
});
assert.ok(prepared.readinessScore > cold.readinessScore, "prepared clinic improves readiness");
assert.equal(prepared.rendererHandoff.contract, "renderer consumes descriptors only");

const source = readFileSync(new URL("../experiments/sora-the-infinite/sora-cloud-clinic-triage-readiness-kits.js", import.meta.url), "utf8");
for (const forbidden of ["document.", "window.", "requestAnimationFrame", "THREE", "WebGL", "Audio(", "addEventListener", "localStorage"]) {
  assert.equal(source.includes(forbidden), false, `kit must not own ${forbidden}`);
}

console.log("Sora cloud clinic triage readiness kits smoke passed 10 intake cases.");
