import assert from "node:assert/strict";
import { createFoglineRelayLevel } from "../experiments/fogline-relay/src/level.js";
import {
  FOGLINE_RADIO_REPAIR_DOMAIN_TREE,
  FOGLINE_RADIO_REPAIR_KIT_NAMES,
  createFoglineAntennaAlignmentArcKit,
  createFoglineBroadcastWindowPulseKit,
  createFoglinePowerLoadBalancingKit,
  createFoglineRadioRepairReadinessDomainKit,
  createFoglineRadioRepairRendererHandoffKit,
  createFoglineRepairPartCacheKit,
  createFoglineReturnSignalThreadKit,
  createFoglineSolderStationWarmthKit
} from "../experiments/fogline-relay/src/fogline-radio-repair-kits.js";

const level = createFoglineRelayLevel();

function makeGame(caseIndex) {
  const scanned = caseIndex % (level.relays.length + 1);
  const progress = (caseIndex % 10) / 9;
  return {
    mode: caseIndex === 8 ? "complete" : caseIndex === 9 ? "failed" : "active",
    player: { x: -6 + caseIndex * 1.15, z: -4 + caseIndex * 4.6, yaw: caseIndex * 0.31 },
    relays: level.relays.map((relay, index) => ({
      ...relay,
      scanned: index < scanned,
      scanProgress: index < scanned ? 1 : index === scanned ? progress : 0
    })),
    gate: { ...level.gate, open: scanned >= level.relays.length, openProgress: scanned / Math.max(1, level.relays.length) },
    wraiths: level.wraiths.map((wraith, index) => ({
      ...wraith,
      mode: index === caseIndex % level.wraiths.length ? "chase" : "patrol",
      x: wraith.x + caseIndex * 0.18,
      z: wraith.z - caseIndex * 0.22
    })),
    repairParts: { claimed: caseIndex % 3 === 0 ? [level.relays[0].id] : [] },
    stats: { scanned, elapsed: caseIndex * 41, timeBudget: 420, scanActive: caseIndex % 2 === 0 }
  };
}

function assertSerializable(value, label) {
  assert.equal(JSON.stringify(JSON.parse(JSON.stringify(value))), JSON.stringify(value), `${label} should be JSON serializable`);
}

function assertRendererNeutral(value, label) {
  const serialized = JSON.stringify(value);
  for (const forbidden of ["mesh", "material", "canvas", "assetLoader", "THREE", "requestAnimationFrame", "AudioContext", "document."]) {
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
const repairPartCacheKit = createFoglineRepairPartCacheKit();
const solderStationWarmthKit = createFoglineSolderStationWarmthKit();
const antennaAlignmentArcKit = createFoglineAntennaAlignmentArcKit();
const powerLoadBalancingKit = createFoglinePowerLoadBalancingKit();
const returnSignalThreadKit = createFoglineReturnSignalThreadKit();
const broadcastWindowPulseKit = createFoglineBroadcastWindowPulseKit();
const rendererHandoffKit = createFoglineRadioRepairRendererHandoffKit();
const domainKit = createFoglineRadioRepairReadinessDomainKit();
let checked = 0;

for (const input of cases) {
  const repairPartCaches = repairPartCacheKit.describe(input);
  assertDescriptorList(repairPartCaches, "repair part cache kit");
  assert.equal(repairPartCaches.length, level.relays.length + 1, "repair part cache kit should emit one cache per relay plus spawn reserve");
  assert.ok(repairPartCaches.every((descriptor) => descriptor.readiness >= 0 && descriptor.readiness <= 1));
  checked += 1;

  const solderStationWarmths = solderStationWarmthKit.describe(input);
  assertDescriptorList(solderStationWarmths, "solder station warmth kit");
  assert.ok(solderStationWarmths.length >= 1 && solderStationWarmths.length <= level.relays.length);
  assert.ok(solderStationWarmths.every((descriptor) => descriptor.heat >= 0 && descriptor.heat <= 1));
  checked += 1;

  const antennaAlignmentArcs = antennaAlignmentArcKit.describe(input);
  assertDescriptorList(antennaAlignmentArcs, "antenna alignment arc kit");
  assert.equal(antennaAlignmentArcs.length, level.relays.length, "antenna alignment kit should track each relay");
  assert.ok(antennaAlignmentArcs.every((descriptor) => descriptor.alignment >= 0 && descriptor.alignment <= 1));
  checked += 1;

  const powerLoadBalancers = powerLoadBalancingKit.describe(input);
  assertDescriptorList(powerLoadBalancers, "power load balancing kit");
  assert.equal(powerLoadBalancers.length, level.relays.length, "power load balancing kit should track each relay");
  assert.ok(powerLoadBalancers.every((descriptor) => descriptor.load >= 0 && descriptor.load <= 1));
  checked += 1;

  const returnSignalThreads = returnSignalThreadKit.describe(input);
  assertDescriptorList(returnSignalThreads, "return signal thread kit");
  assert.equal(returnSignalThreads.length, level.route.length - 1, "return signal thread kit should cover every route segment");
  assert.ok(returnSignalThreads.every((descriptor) => descriptor.length > 0 && descriptor.width > 0));
  checked += 1;

  const broadcastWindowPulses = broadcastWindowPulseKit.describe(input);
  assertDescriptorList(broadcastWindowPulses, "broadcast window pulse kit");
  assert.equal(broadcastWindowPulses.length, 2, "broadcast window pulse kit should emit gate and return broadcast descriptors");
  assert.ok(broadcastWindowPulses.every((descriptor) => descriptor.repairReadiness >= 0 && descriptor.repairReadiness <= 1));
  checked += 1;

  const composite = domainKit.describe(input);
  assertDescriptorList(composite.drawOrder, "radio repair composite");
  assert.equal(composite.repairPartCaches.length, repairPartCaches.length);
  assert.equal(composite.solderStationWarmths.length, solderStationWarmths.length);
  assert.equal(composite.antennaAlignmentArcs.length, antennaAlignmentArcs.length);
  assert.equal(composite.powerLoadBalancers.length, powerLoadBalancers.length);
  assert.equal(composite.returnSignalThreads.length, returnSignalThreads.length);
  assert.equal(composite.broadcastWindowPulses.length, broadcastWindowPulses.length);
  assert.equal(composite.rendererHandoff.descriptorCount, composite.drawOrder.length);
  checked += 1;

  const handoff = rendererHandoffKit.describe(composite);
  assert.equal(handoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(handoff.descriptorCount, composite.drawOrder.length);
  assert.equal(handoff.ownership.renderer, "consume-only");
  assert.equal(handoff.ownership.dom, "excluded");
  assert.equal(handoff.ownership.browserInput, "excluded");
  assertSerializable(handoff, "radio repair renderer handoff kit");
  checked += 1;
}

assert.ok(FOGLINE_RADIO_REPAIR_DOMAIN_TREE.includes("fogline-radio-repair-readiness-domain"));
assert.deepEqual(FOGLINE_RADIO_REPAIR_KIT_NAMES, [
  "fogline-repair-part-cache-kit",
  "fogline-solder-station-warmth-kit",
  "fogline-antenna-alignment-arc-kit",
  "fogline-power-load-balancing-kit",
  "fogline-return-signal-thread-kit",
  "fogline-broadcast-window-pulse-kit",
  "fogline-radio-repair-renderer-handoff-kit",
  "fogline-radio-repair-readiness-domain-kit"
]);
assert.equal(checked, 80, "8 Fogline radio repair surfaces should each receive 10 smoke intake cases");

console.log("Fogline radio repair readiness kits smoke passed with 80 intake cases.");
