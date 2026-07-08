import assert from "node:assert/strict";
import "./fogline-survivor-rescue-readiness-kits-smoke.mjs";
import { createFoglineRelayLevel } from "../experiments/fogline-relay/src/level.js";
import {
  FOGLINE_OPERATOR_RHYTHM_DOMAIN_TREE,
  FOGLINE_OPERATOR_RHYTHM_KIT_NAMES,
  createFoglineExtractionCommitmentBeaconKit,
  createFoglineLanternBreathPocketKit,
  createFoglineOperatorRhythmDomainKit,
  createFoglineOperatorRhythmRendererHandoffKit,
  createFoglineRelayRepairBeatKit,
  createFoglineRouteDriftCorrectionKit,
  createFoglineScanPulseCadenceKit,
  createFoglineWraithNoiseShadowKit
} from "../experiments/fogline-relay/src/fogline-operator-rhythm-kits.js";

const level = createFoglineRelayLevel();

function makeGame(caseIndex) {
  const scanned = caseIndex % (level.relays.length + 1);
  const progress = (caseIndex % 10) / 9;
  return {
    mode: caseIndex === 8 ? "complete" : caseIndex === 9 ? "failed" : "active",
    player: { x: -6 + caseIndex * 1.35, z: -3 + caseIndex * 4.4, yaw: caseIndex * 0.28, pitch: -0.02 },
    input: { scan: caseIndex % 2 === 0 },
    relays: level.relays.map((relay, index) => ({
      ...relay,
      scanned: index < scanned,
      scanProgress: index < scanned ? 1 : index === scanned ? progress : 0
    })),
    gate: { ...level.gate, open: scanned >= level.relays.length, openProgress: scanned >= level.relays.length ? progress : scanned / Math.max(1, level.relays.length) },
    wraiths: level.wraiths.map((wraith, index) => ({
      ...wraith,
      mode: index === caseIndex % level.wraiths.length ? "chase" : "patrol",
      x: wraith.x + caseIndex * 0.24,
      z: wraith.z - caseIndex * 0.18
    })),
    stats: { scanned, elapsed: caseIndex * 19, scanActive: caseIndex % 3 === 0 }
  };
}

function assertSerializable(value, label) {
  assert.equal(JSON.stringify(JSON.parse(JSON.stringify(value))), JSON.stringify(value), `${label} should be JSON serializable`);
}

function assertRendererNeutral(value, label) {
  const serialized = JSON.stringify(value);
  for (const forbidden of ["mesh", "material", "canvas", "assetLoader", "THREE"]) {
    assert.ok(!serialized.includes(`\"${forbidden}\"`), `${label} should not contain ${forbidden} ownership`);
  }
}

function assertDescriptorList(list, label) {
  assert.ok(Array.isArray(list), `${label} should return an array`);
  assert.ok(list.length > 0, `${label} should produce at least one descriptor`);
  for (const descriptor of list) {
    assert.ok(descriptor.id, `${label} descriptor should have an id`);
    assert.ok(descriptor.archetype, `${label} descriptor should have an archetype`);
    assert.ok(descriptor.compatibleBucket, `${label} descriptor should expose a renderer-compatible bucket`);
    assert.ok(descriptor.position && Number.isFinite(descriptor.position.x) && Number.isFinite(descriptor.position.z), `${label} descriptor should expose finite x/z position`);
  }
  assertSerializable(list, label);
  assertRendererNeutral(list, label);
}

const cases = Array.from({ length: 10 }, (_, caseIndex) => ({ level, route: level.route, game: makeGame(caseIndex) }));
const scanPulseKit = createFoglineScanPulseCadenceKit();
const repairBeatKit = createFoglineRelayRepairBeatKit();
const noiseShadowKit = createFoglineWraithNoiseShadowKit();
const breathPocketKit = createFoglineLanternBreathPocketKit();
const driftCorrectionKit = createFoglineRouteDriftCorrectionKit();
const extractionBeaconKit = createFoglineExtractionCommitmentBeaconKit();
const rendererHandoffKit = createFoglineOperatorRhythmRendererHandoffKit();
const domainKit = createFoglineOperatorRhythmDomainKit();
let checked = 0;

for (const input of cases) {
  const scanPulses = scanPulseKit.describe(input);
  assertDescriptorList(scanPulses, "scan pulse cadence kit");
  assert.equal(scanPulses.length, 3, "scan pulse kit should emit three cadence rings");
  assert.ok(scanPulses.every((descriptor) => descriptor.length >= 6 && descriptor.angle > 0));
  checked += 1;

  const repairBeats = repairBeatKit.describe(input);
  assertDescriptorList(repairBeats, "relay repair beat kit");
  assert.equal(repairBeats.length, level.relays.length, "relay repair beat kit should track every relay");
  assert.ok(repairBeats.every((descriptor) => descriptor.beat >= 0 && descriptor.beat <= 1));
  checked += 1;

  const noiseShadows = noiseShadowKit.describe(input);
  assertDescriptorList(noiseShadows, "wraith noise shadow kit");
  assert.equal(noiseShadows.length, level.wraiths.length, "wraith noise kit should track every wraith");
  assert.ok(noiseShadows.every((descriptor) => descriptor.noise >= 0 && descriptor.noise <= 1));
  checked += 1;

  const breathPockets = breathPocketKit.describe(input);
  assertDescriptorList(breathPockets, "lantern breath pocket kit");
  assert.ok(breathPockets.every((descriptor) => descriptor.radius > 0 && descriptor.breath >= 0));
  checked += 1;

  const driftCorrections = driftCorrectionKit.describe(input);
  assertDescriptorList(driftCorrections, "route drift correction kit");
  assert.equal(driftCorrections.length, 2, "route drift kit should emit current and target correction threads");
  assert.ok(driftCorrections.every((descriptor) => descriptor.length > 0 && descriptor.width > 0));
  checked += 1;

  const extractionBeacons = extractionBeaconKit.describe(input);
  assertDescriptorList(extractionBeacons, "extraction commitment beacon kit");
  assert.equal(extractionBeacons.length, 2, "extraction beacon kit should emit needle and gate-sigil descriptors");
  assert.ok(extractionBeacons.every((descriptor) => descriptor.commitment >= 0 && descriptor.commitment <= 1));
  checked += 1;

  const composite = domainKit.describe(input);
  assertDescriptorList(composite.drawOrder, "operator rhythm composite");
  assert.equal(composite.scanPulseCadenceRings.length, scanPulses.length);
  assert.equal(composite.relayRepairBeats.length, repairBeats.length);
  assert.equal(composite.wraithNoiseShadows.length, noiseShadows.length);
  assert.equal(composite.lanternBreathPockets.length, breathPockets.length);
  assert.equal(composite.routeDriftCorrections.length, driftCorrections.length);
  assert.equal(composite.extractionCommitmentBeacons.length, extractionBeacons.length);
  assert.equal(composite.rendererHandoff.descriptorCount, composite.drawOrder.length);
  checked += 1;

  const handoff = rendererHandoffKit.describe(composite);
  assert.equal(handoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(handoff.descriptorCount, composite.drawOrder.length);
  assert.equal(handoff.ownership.renderer, "consume-only");
  assert.equal(handoff.ownership.dom, "excluded");
  assert.equal(handoff.ownership.browserInput, "excluded");
  assert.equal(handoff.ownership.audio, "excluded");
  assertSerializable(handoff, "operator rhythm renderer handoff kit");
  checked += 1;
}

assert.ok(FOGLINE_OPERATOR_RHYTHM_DOMAIN_TREE.includes("fogline-operator-rhythm-domain"));
assert.deepEqual(FOGLINE_OPERATOR_RHYTHM_KIT_NAMES, [
  "fogline-scan-pulse-cadence-kit",
  "fogline-relay-repair-beat-kit",
  "fogline-wraith-noise-shadow-kit",
  "fogline-lantern-breath-pocket-kit",
  "fogline-route-drift-correction-kit",
  "fogline-extraction-commitment-beacon-kit",
  "fogline-operator-rhythm-renderer-handoff-kit",
  "fogline-operator-rhythm-domain-kit"
]);
assert.equal(checked, 80, "8 Fogline operator rhythm surfaces should each receive 10 smoke intake cases");

console.log("Fogline operator rhythm domain kits smoke passed with 80 intake cases.");
