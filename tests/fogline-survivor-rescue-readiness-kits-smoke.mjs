import assert from "node:assert/strict";
import { createFoglineRelayLevel } from "../experiments/fogline-relay/src/level.js";
import {
  FOGLINE_SURVIVOR_RESCUE_DOMAIN_TREE,
  FOGLINE_SURVIVOR_RESCUE_KIT_NAMES,
  createFoglineBlackoutDeadlineRingKit,
  createFoglineExtractionWarmthCorridorKit,
  createFoglineFlareDecoyFieldKit,
  createFoglineRescuePathRibbonKit,
  createFoglineSurvivorDistressLanternKit,
  createFoglineSurvivorRescueReadinessDomainKit,
  createFoglineSurvivorRescueRendererHandoffKit,
  createFoglineTriageCacheHaloKit
} from "../experiments/fogline-relay/src/fogline-survivor-rescue-kits.js";

const level = createFoglineRelayLevel();

function makeGame(caseIndex) {
  const scanned = caseIndex % (level.relays.length + 1);
  const progress = (caseIndex % 10) / 9;
  return {
    mode: caseIndex === 8 ? "complete" : caseIndex === 9 ? "failed" : "active",
    player: { x: -5 + caseIndex * 1.1, z: -3 + caseIndex * 4.6, yaw: caseIndex * 0.25 },
    relays: level.relays.map((relay, index) => ({
      ...relay,
      scanned: index < scanned,
      scanProgress: index < scanned ? 1 : index === scanned ? progress : 0
    })),
    gate: { ...level.gate, open: scanned >= level.relays.length, openProgress: scanned >= level.relays.length ? progress : scanned / Math.max(1, level.relays.length) },
    wraiths: level.wraiths.map((wraith, index) => ({
      ...wraith,
      mode: index === caseIndex % level.wraiths.length ? "chase" : "patrol",
      x: wraith.x + caseIndex * 0.3,
      z: wraith.z - caseIndex * 0.2
    })),
    survivors: [
      { id: "survivor-relay-west", x: -10.3 + caseIndex * 0.14, z: 12.7, condition: caseIndex > 6 ? "injured" : "critical", rescued: caseIndex > 8 },
      { id: "survivor-canopy", x: 11.1, z: 16.6 + caseIndex * 0.2, condition: "injured", carried: caseIndex === 5 },
      { id: "survivor-gate", x: -2.6, z: 37.7, condition: "stable", rescued: caseIndex === 9 }
    ],
    stats: { scanned, elapsed: caseIndex * 31, timeBudget: 360 }
  };
}

function assertSerializable(value, label) {
  assert.equal(JSON.stringify(JSON.parse(JSON.stringify(value))), JSON.stringify(value), `${label} should be JSON serializable`);
}

function assertRendererNeutral(value, label) {
  const serialized = JSON.stringify(value);
  for (const forbidden of ["mesh", "material", "canvas", "assetLoader", "THREE", "requestAnimationFrame"]) {
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
const distressKit = createFoglineSurvivorDistressLanternKit();
const pathKit = createFoglineRescuePathRibbonKit();
const triageKit = createFoglineTriageCacheHaloKit();
const decoyKit = createFoglineFlareDecoyFieldKit();
const blackoutKit = createFoglineBlackoutDeadlineRingKit();
const warmthKit = createFoglineExtractionWarmthCorridorKit();
const rendererHandoffKit = createFoglineSurvivorRescueRendererHandoffKit();
const domainKit = createFoglineSurvivorRescueReadinessDomainKit();
let checked = 0;

for (const input of cases) {
  const distress = distressKit.describe(input);
  assertDescriptorList(distress, "survivor distress lantern kit");
  assert.equal(distress.length, 3, "distress kit should track all survivor signals");
  assert.ok(distress.every((descriptor) => descriptor.urgency >= 0 && descriptor.urgency <= 1));
  checked += 1;

  const paths = pathKit.describe(input);
  assertDescriptorList(paths, "rescue path ribbon kit");
  assert.equal(paths.length, 2, "rescue path kit should emit survivor and extraction ribbons");
  assert.ok(paths.every((descriptor) => descriptor.length > 0 && descriptor.width > 0));
  checked += 1;

  const triage = triageKit.describe(input);
  assertDescriptorList(triage, "triage cache halo kit");
  assert.ok(triage.every((descriptor) => descriptor.readiness >= 0 && descriptor.readiness <= 1));
  checked += 1;

  const decoys = decoyKit.describe(input);
  assertDescriptorList(decoys, "flare decoy field kit");
  assert.equal(decoys.length, level.wraiths.length, "flare decoy kit should track each wraith pressure source");
  assert.ok(decoys.every((descriptor) => descriptor.decoyStrength >= 0 && descriptor.decoyStrength <= 1));
  checked += 1;

  const blackout = blackoutKit.describe(input);
  assertDescriptorList(blackout, "blackout deadline ring kit");
  assert.equal(blackout.length, 2, "blackout kit should emit gate and field pressure rings");
  assert.ok(blackout.every((descriptor) => descriptor.blackout >= 0 && descriptor.blackout <= 1));
  checked += 1;

  const warmth = warmthKit.describe(input);
  assertDescriptorList(warmth, "extraction warmth corridor kit");
  assert.equal(warmth.length, 2, "extraction warmth kit should emit route and pocket descriptors");
  assert.ok(warmth.every((descriptor) => descriptor.readiness >= 0 && descriptor.readiness <= 1));
  checked += 1;

  const composite = domainKit.describe(input);
  assertDescriptorList(composite.drawOrder, "survivor rescue composite");
  assert.equal(composite.survivorDistressLanterns.length, distress.length);
  assert.equal(composite.rescuePathRibbons.length, paths.length);
  assert.equal(composite.triageCacheHalos.length, triage.length);
  assert.equal(composite.flareDecoyFields.length, decoys.length);
  assert.equal(composite.blackoutDeadlineRings.length, blackout.length);
  assert.equal(composite.extractionWarmthCorridors.length, warmth.length);
  assert.equal(composite.rendererHandoff.descriptorCount, composite.drawOrder.length);
  checked += 1;

  const handoff = rendererHandoffKit.describe(composite);
  assert.equal(handoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(handoff.descriptorCount, composite.drawOrder.length);
  assert.equal(handoff.ownership.renderer, "consume-only");
  assert.equal(handoff.ownership.dom, "excluded");
  assert.equal(handoff.ownership.browserInput, "excluded");
  assertSerializable(handoff, "survivor rescue renderer handoff kit");
  checked += 1;
}

assert.ok(FOGLINE_SURVIVOR_RESCUE_DOMAIN_TREE.includes("fogline-survivor-rescue-readiness-domain"));
assert.deepEqual(FOGLINE_SURVIVOR_RESCUE_KIT_NAMES, [
  "fogline-survivor-distress-lantern-kit",
  "fogline-rescue-path-ribbon-kit",
  "fogline-triage-cache-halo-kit",
  "fogline-flare-decoy-field-kit",
  "fogline-blackout-deadline-ring-kit",
  "fogline-extraction-warmth-corridor-kit",
  "fogline-survivor-rescue-renderer-handoff-kit",
  "fogline-survivor-rescue-readiness-domain-kit"
]);
assert.equal(checked, 80, "8 Fogline survivor rescue surfaces should each receive 10 smoke intake cases");

console.log("Fogline survivor rescue readiness kits smoke passed with 80 intake cases.");
