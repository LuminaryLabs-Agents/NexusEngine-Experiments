import assert from "node:assert/strict";
import { createFoglineLighthouseBatteryReadinessDomainKit, FOGLINE_LIGHTHOUSE_BATTERY_READINESS_DOMAIN_TREE } from "../experiments/fogline-relay/src/lighthouse-battery-readiness-kits.js";

const kit = createFoglineLighthouseBatteryReadinessDomainKit();

function makeCase(index) {
  return {
    level: {
      bounds: { minX: -18, maxX: 18, minZ: -8, maxZ: 48 },
      route: [
        { id: `dock-${index}`, x: -10 + index * 0.2, z: 3 + index },
        { id: `generator-${index}`, x: -4 + index * 0.15, z: 10 + index },
        { id: `cache-${index}`, x: 2 + index * 0.2, z: 18 + index },
        { id: `lens-${index}`, x: 8 - index * 0.12, z: 29 + index },
        { id: `lighthouse-${index}`, x: 1 + index * 0.1, z: 41 + index }
      ]
    },
    game: {
      player: { x: -2 + index * 0.4, z: -6 + index * 5.4 },
      scanActive: index % 2 === 0,
      supplies: index % 5,
      rescued: Math.floor(index / 2)
    },
    time: index * 0.37
  };
}

assert.equal(FOGLINE_LIGHTHOUSE_BATTERY_READINESS_DOMAIN_TREE.root, "fogline-lighthouse-battery-readiness-domain");
assert.ok(kit.kits.length >= 7, "domain should compose atomic kits and renderer handoff");

const outcomes = Array.from({ length: 10 }, (_, index) => kit.describe(makeCase(index)));
for (const [index, outcome] of outcomes.entries()) {
  assert.ok(["dark", "charging", "broadcast"].includes(outcome.missionState), `case ${index} mission state should be valid`);
  assert.ok(outcome.readiness >= 0 && outcome.readiness <= 1, `case ${index} readiness should be bounded`);
  assert.equal(outcome.handCrankGenerators.length, 2, `case ${index} should emit generator descriptors`);
  assert.equal(outcome.batteryCaches.length, 2, `case ${index} should emit battery cache descriptors`);
  assert.ok(outcome.fresnelAlignments.length >= 4, `case ${index} should emit beam route threads`);
  assert.equal(outcome.fogBreachWindows.length, 3, `case ${index} should emit fog breach windows`);
  assert.equal(outcome.familySignalFlares.length, 3, `case ${index} should emit family signal flares`);
  assert.equal(outcome.dawnBeamLedger.length, 1, `case ${index} should emit a dawn beam ledger`);
  assert.equal(outcome.rendererHandoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(outcome.rendererHandoff.counts.total, outcome.drawOrder.length, `case ${index} handoff counts should match draw order`);
  assert.ok(outcome.drawOrder.every((descriptor) => descriptor.id && descriptor.kind && descriptor.position), `case ${index} descriptors should be render-consumable`);
  assert.doesNotThrow(() => JSON.stringify(outcome));
}

assert.ok(outcomes[9].readiness >= outcomes[0].readiness, "later/high-supply cases should not regress readiness below boot case");
console.log("Fogline lighthouse battery readiness kits smoke passed 10 intake cases.");
