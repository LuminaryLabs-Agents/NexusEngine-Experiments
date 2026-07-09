import assert from "node:assert/strict";
import {
  OPEN_ABOVE_RIDGE_CLINIC_READINESS_TREE,
  createOpenAboveRidgeClinicReadinessDomainKit,
  createOpenAboveWindsockLandingStripKit,
  createOpenAboveRopeGuideLaneKit,
  createOpenAboveOxygenCrateCacheKit,
  createOpenAboveStretcherCircleMarkerKit,
  createOpenAboveClinicFlareTriadKit,
  createOpenAboveDawnTransferRosterKit
} from "../experiments/the-open-above/open-above-ridge-clinic-readiness-kits.js";

const cases = Array.from({ length: 10 }, (_, index) => ({
  frame: index * 83,
  elapsed: index * 0.63,
  input: {
    pitchDown: index % 2 === 0,
    pitchUp: index === 1,
    bankLeft: index % 3 === 0,
    bankRight: index % 3 === 1,
    boost: index === 2 || index === 7
  },
  body: {
    speed: 42 + index * 12,
    altitude: 130 + index * 31,
    clearance: 48 + index * 29,
    position: { x: -520 + index * 116, y: 130 + index * 31, z: 720 - index * 92 },
    rotation: { yaw: -0.9 + index * 0.18, pitch: -0.05 + index * 0.014, roll: -0.44 + index * 0.092 },
    velocity: { x: 5 + index * 1.5, y: index < 4 ? -18 + index * 4 : 4 + index, z: -54 - index * 5 },
    stability: { sinkRate: index < 5 ? -48 + index * 8 : -5 + index }
  },
  terrain: { patchCount: 16 + index }
}));

const domain = createOpenAboveRidgeClinicReadinessDomainKit();
assert.ok(OPEN_ABOVE_RIDGE_CLINIC_READINESS_TREE.includes("renderer consumes descriptors only"));
assert.equal(domain.id, "open-above-ridge-clinic-readiness-domain-kit");

const atomicKits = [
  createOpenAboveWindsockLandingStripKit(),
  createOpenAboveRopeGuideLaneKit(),
  createOpenAboveOxygenCrateCacheKit(),
  createOpenAboveStretcherCircleMarkerKit(),
  createOpenAboveClinicFlareTriadKit(),
  createOpenAboveDawnTransferRosterKit()
];

for (const kit of atomicKits) {
  assert.equal(typeof kit.describe, "function", `${kit.id} exposes describe()`);
  const descriptors = kit.describe(cases[0]);
  assert.ok(Array.isArray(descriptors), `${kit.id} returns descriptor array`);
  assert.ok(descriptors.length > 0, `${kit.id} emits descriptors`);
  assert.ok(descriptors.every((descriptor) => descriptor.id && descriptor.kind && descriptor.domain), `${kit.id} descriptors are named`);
}

for (const [index, state] of cases.entries()) {
  const result = domain.compose(state);
  assert.equal(result.rendererHandoff.contract, "renderer-consumes-descriptors-only", `case ${index} uses descriptor handoff`);
  assert.ok(result.rendererHandoff.counts.windsockLandingStrips >= 3, `case ${index} emits windsocks`);
  assert.ok(result.rendererHandoff.counts.ropeGuideLanes >= 4, `case ${index} emits rope lanes`);
  assert.ok(result.rendererHandoff.counts.oxygenCrateCaches >= 3, `case ${index} emits oxygen crates`);
  assert.ok(result.rendererHandoff.counts.stretcherCircleMarkers >= 2, `case ${index} emits stretcher circles`);
  assert.ok(result.rendererHandoff.counts.clinicFlareTriads >= 3, `case ${index} emits clinic flares`);
  assert.ok(result.rendererHandoff.counts.dawnTransferRosters >= 4, `case ${index} emits transfer roster slots`);
  assert.equal(result.summary.descriptorCount, result.rendererHandoff.counts.total, `case ${index} mirrors descriptor count`);
  assert.ok(result.summary.readiness >= 0 && result.summary.readiness <= 1, `case ${index} readiness normalized`);
  assert.ok(["land and transfer", "stage ridge clinic", "hold above ridge"].includes(result.summary.clinicCall), `case ${index} has bounded clinic call`);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(result)), `case ${index} is JSON safe`);
}

const first = domain.compose(cases[0]);
const tenth = domain.compose(cases[9]);
assert.notEqual(first.summary.patientPressure, tenth.summary.patientPressure, "varied intake changes patient pressure");
assert.ok(first.rendererHandoff.flatDescriptors.every((descriptor) => descriptor.kind), "flat descriptors keep kind fields");

console.log("Open Above ridge clinic readiness kits smoke passed.");
