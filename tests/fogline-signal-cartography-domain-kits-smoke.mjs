import assert from "node:assert/strict";
import { createFoglineRelayLevel } from "../experiments/fogline-relay/src/level.js";
import {
  FOGLINE_SIGNAL_CARTOGRAPHY_DOMAIN_TREE,
  FOGLINE_SIGNAL_CARTOGRAPHY_KIT_NAMES,
  createFoglineCartographyRendererHandoffKit,
  createFoglineGateChargeThreadKit,
  createFoglineRelayPriorityMapKit,
  createFoglineRetreatPocketCompassKit,
  createFoglineScanWindowLadderKit,
  createFoglineSignalCartographyDomainKit,
  createFoglineSignalTriangulationGridKit,
  createFoglineWraithAvoidanceCorridorKit
} from "../experiments/fogline-relay/src/fogline-signal-cartography-kits.js";

const level = createFoglineRelayLevel();

function makeGame(caseIndex) {
  const scanned = caseIndex % (level.relays.length + 1);
  const progress = (caseIndex % 10) / 9;
  return {
    mode: caseIndex === 8 ? "complete" : caseIndex === 9 ? "failed" : "active",
    player: { x: -7 + caseIndex * 1.6, z: -2 + caseIndex * 4.2, yaw: caseIndex * 0.31, pitch: -0.02 },
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
      x: wraith.x + caseIndex * 0.22,
      z: wraith.z - caseIndex * 0.16
    })),
    stats: { scanned, elapsed: caseIndex * 17, scanActive: caseIndex % 3 === 0 }
  };
}

function assertSerializable(value, label) {
  assert.equal(JSON.stringify(JSON.parse(JSON.stringify(value))), JSON.stringify(value), `${label} should be JSON serializable`);
}

function assertRendererNeutral(value, label) {
  const serialized = JSON.stringify(value);
  for (const forbidden of ["mesh", "material", "canvas", "assetLoader", "frameLoop", "THREE"]) {
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
const relayPriorityKit = createFoglineRelayPriorityMapKit();
const avoidanceCorridorKit = createFoglineWraithAvoidanceCorridorKit();
const scanWindowKit = createFoglineScanWindowLadderKit();
const gateChargeKit = createFoglineGateChargeThreadKit();
const retreatPocketKit = createFoglineRetreatPocketCompassKit();
const triangulationGridKit = createFoglineSignalTriangulationGridKit();
const rendererHandoffKit = createFoglineCartographyRendererHandoffKit();
const domainKit = createFoglineSignalCartographyDomainKit();
let checked = 0;

for (const input of cases) {
  const relayPriorities = relayPriorityKit.describe(input);
  assertDescriptorList(relayPriorities, "relay priority map kit");
  assert.equal(relayPriorities.length, level.relays.length, "relay priority map should track every relay");
  assert.ok(relayPriorities.every((descriptor) => descriptor.priority >= 0 && descriptor.priority <= 1));
  checked += 1;

  const avoidanceCorridors = avoidanceCorridorKit.describe(input);
  assertDescriptorList(avoidanceCorridors, "wraith avoidance corridor kit");
  assert.equal(avoidanceCorridors.length, level.wraiths.length, "avoidance corridor kit should track every wraith");
  assert.ok(avoidanceCorridors.every((descriptor) => descriptor.length > 0 && descriptor.width > 0));
  checked += 1;

  const scanWindows = scanWindowKit.describe(input);
  assertDescriptorList(scanWindows, "scan window ladder kit");
  assert.ok(scanWindows.length >= 1 && scanWindows.length <= 3, "scan windows should summarize the next one to three scan targets");
  assert.ok(scanWindows.every((descriptor) => descriptor.length >= 5.5));
  checked += 1;

  const gateThreads = gateChargeKit.describe(input);
  assertDescriptorList(gateThreads, "gate charge thread kit");
  assert.equal(gateThreads.length, 3, "gate charge kit should emit three stable gate rings");
  assert.ok(gateThreads.every((descriptor) => descriptor.charge >= 0 && descriptor.charge <= 1));
  checked += 1;

  const retreatPockets = retreatPocketKit.describe(input);
  assertDescriptorList(retreatPockets, "retreat pocket compass kit");
  assert.ok(retreatPockets.every((descriptor) => descriptor.radius > 0));
  checked += 1;

  const triangulation = triangulationGridKit.describe(input);
  assertDescriptorList(triangulation, "signal triangulation grid kit");
  assert.ok(triangulation.every((descriptor) => descriptor.distance >= 0));
  checked += 1;

  const composite = domainKit.describe(input);
  assertDescriptorList(composite.drawOrder, "signal cartography composite");
  assert.equal(composite.relayPriorityMarkers.length, relayPriorities.length);
  assert.equal(composite.wraithAvoidanceCorridors.length, avoidanceCorridors.length);
  assert.equal(composite.scanWindowLadders.length, scanWindows.length);
  assert.equal(composite.gateChargeThreads.length, gateThreads.length);
  assert.equal(composite.retreatPocketCompasses.length, retreatPockets.length);
  assert.equal(composite.signalTriangulationGrid.length, triangulation.length);
  assert.equal(composite.rendererHandoff.descriptorCount, composite.drawOrder.length);
  checked += 1;

  const handoff = rendererHandoffKit.describe(composite);
  assert.equal(handoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(handoff.descriptorCount, composite.drawOrder.length);
  assert.equal(handoff.ownership.renderer, "consume-only");
  assert.equal(handoff.ownership.dom, "excluded");
  assert.equal(handoff.ownership.browserInput, "excluded");
  assert.equal(handoff.ownership.audio, "excluded");
  assertSerializable(handoff, "cartography renderer handoff kit");
  checked += 1;
}

assert.ok(FOGLINE_SIGNAL_CARTOGRAPHY_DOMAIN_TREE.includes("fogline-signal-cartography-domain"));
assert.deepEqual(FOGLINE_SIGNAL_CARTOGRAPHY_KIT_NAMES, [
  "fogline-relay-priority-map-kit",
  "fogline-wraith-avoidance-corridor-kit",
  "fogline-scan-window-ladder-kit",
  "fogline-gate-charge-thread-kit",
  "fogline-retreat-pocket-compass-kit",
  "fogline-signal-triangulation-grid-kit",
  "fogline-cartography-renderer-handoff-kit",
  "fogline-signal-cartography-domain-kit"
]);
assert.equal(checked, 80, "8 Fogline signal cartography surfaces should each receive 10 smoke intake cases");

console.log("Fogline signal cartography domain kits smoke passed with 80 intake cases.");
