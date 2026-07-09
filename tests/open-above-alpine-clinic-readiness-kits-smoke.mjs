import assert from "node:assert/strict";
import {
  OPEN_ABOVE_ALPINE_CLINIC_OWNERSHIP,
  OPEN_ABOVE_ALPINE_CLINIC_READINESS_TREE,
  createOpenAboveAlpineClinicReadinessDomainKit
} from "../experiments/the-open-above/open-above-alpine-clinic-readiness-kits.js";

const domain = createOpenAboveAlpineClinicReadinessDomainKit();
assert.equal(domain.id, "open-above-alpine-clinic-readiness-domain-kit");
assert.ok(OPEN_ABOVE_ALPINE_CLINIC_READINESS_TREE.includes("renderer consumes descriptors only"));
assert.deepEqual(OPEN_ABOVE_ALPINE_CLINIC_OWNERSHIP, domain.ownership);

const cases = Array.from({ length: 10 }, (_, index) => ({
  frame: index * 83,
  elapsed: index * 0.43,
  input: { pitchDown: index % 2 === 1, boost: index === 2 || index === 7, bankLeft: index % 3 === 0 },
  body: {
    speed: 46 + index * 12,
    altitude: 160 + index * 27,
    clearance: 54 + index * 22,
    position: { x: -520 + index * 116, y: 160 + index * 27, z: 640 - index * 91 },
    rotation: { yaw: -0.9 + index * 0.18, pitch: 0.04 + index * 0.01, roll: -0.42 + index * 0.088 },
    velocity: { x: 5 + index * 1.9, y: index < 4 ? -18 + index * 3 : 2 + index, z: -54 - index * 4.2 },
    stability: { sinkRate: index < 5 ? -48 + index * 8 : -3 }
  }
}));

for (const [index, state] of cases.entries()) {
  const result = domain.compose(state);
  assert.equal(result.rendererHandoff.contract, "renderer-consumes-descriptors-only", `case ${index} uses descriptor-only handoff`);
  assert.equal(result.groups.strandedClimberBeacons.length, 4, `case ${index} emits climber beacons`);
  assert.equal(result.groups.hypothermiaTriageMarkers.length, 4, `case ${index} emits triage markers`);
  assert.equal(result.groups.windShearGaps.length, 5, `case ${index} emits wind gaps`);
  assert.equal(result.groups.ropeBasketDrops.length, 4, `case ${index} emits rope basket drops`);
  assert.equal(result.groups.medicineCacheGliders.length, 4, `case ${index} emits medicine gliders`);
  assert.equal(result.groups.helipadSmokeSignals.length, 5, `case ${index} emits smoke signals`);
  assert.equal(result.summary.descriptorCount, result.rendererHandoff.counts.total, `case ${index} mirrors descriptor count`);
  assert.ok(["extract now", "stabilize climbers", "survey clinic route"].includes(result.summary.missionState), `case ${index} returns known mission state`);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(result)), `case ${index} is JSON-safe`);
}

console.log("Open Above alpine clinic readiness kit smoke passed.");
