import assert from "node:assert/strict";
import {
  SORA_STAR_ORCHARD_RESCUE_READINESS_DOMAIN_TREE,
  createSoraStarOrchardRescueReadinessDomainKit
} from "../experiments/sora-the-infinite/sora-star-orchard-rescue-readiness-kits.js";

const kit = createSoraStarOrchardRescueReadinessDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => ({
  tick: index * 17,
  readiness: index / 9,
  input: {
    thrust: index % 3 === 0 ? 1 : 0.2,
    bank: (index - 4.5) / 7,
    climb: index % 2 === 0 ? 1 : -0.2,
    pointerActive: index % 2 === 1
  },
  skyRescueReadiness: { rendererHandoff: { counts: { total: 8 + index } } },
  skyLighthouseReadiness: { rendererHandoff: { counts: { total: 5 + index } } },
  skyRookeryMigrationReadiness: { rendererHandoff: { counts: { total: 6 + index } } }
}));

assert.match(SORA_STAR_ORCHARD_RESCUE_READINESS_DOMAIN_TREE, /sora-star-orchard-rescue-readiness-domain/);
assert.match(SORA_STAR_ORCHARD_RESCUE_READINESS_DOMAIN_TREE, /renderer consumes descriptors only/);

let previousReadiness = -1;
for (const [index, intake] of cases.entries()) {
  const result = kit.describe(intake);
  assert.equal(result.id, "sora-star-orchard-rescue-readiness-domain");
  assert.ok(result.readinessScore >= 0 && result.readinessScore <= 1, `case ${index} readiness bounded`);
  assert.ok(["gather", "stabilize", "handoff"].includes(result.missionState), `case ${index} mission state enum`);
  assert.equal(result.starfruitGroves.length, 5, `case ${index} starfruit groves`);
  assert.equal(result.pollenCurrents.length, 4, `case ${index} pollen currents`);
  assert.equal(result.nestSlings.length, 4, `case ${index} nest slings`);
  assert.equal(result.cloudBloomMedicines.length, 4, `case ${index} cloud bloom medicine`);
  assert.equal(result.mooncalfCouriers.length, 4, `case ${index} mooncalf couriers`);
  assert.equal(result.rendererHandoff.counts.dawnOrchardLedger, 1, `case ${index} ledger count`);
  assert.equal(result.rendererHandoff.counts.total, 22, `case ${index} total descriptors`);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(result.rendererHandoff)), `case ${index} serializable`);
  for (const descriptorGroup of [result.starfruitGroves, result.pollenCurrents, result.nestSlings, result.cloudBloomMedicines, result.mooncalfCouriers]) {
    for (const descriptor of descriptorGroup) {
      assert.equal(descriptor.rendererContract.renderer, "presentation-only", `case ${index} renderer contract`);
      assert.ok(descriptor.rendererContract.rendererMustNotOwn.includes("DOM"), `case ${index} no DOM ownership`);
      assert.ok(descriptor.rendererContract.rendererMustNotOwn.includes("frame loop"), `case ${index} no frame-loop ownership`);
    }
  }
  if (index > 0) assert.ok(result.readinessScore >= previousReadiness - 0.3, `case ${index} readiness did not collapse`);
  previousReadiness = result.readinessScore;
}

const low = kit.snapshot(cases[0]);
const high = kit.snapshot(cases[9]);
assert.ok(high.readinessScore > low.readinessScore, "stronger state improves readiness");
assert.equal(high.descriptorCount, 22, "snapshot exposes descriptor count");

console.log("Sora star orchard rescue readiness kits smoke passed 10 intake cases.");
