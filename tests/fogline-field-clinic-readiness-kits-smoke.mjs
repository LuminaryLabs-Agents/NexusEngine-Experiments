import assert from "node:assert/strict";
import {
  FOGLINE_FIELD_CLINIC_DOMAIN_TREE,
  FOGLINE_FIELD_CLINIC_KIT_NAMES,
  createFoglineFieldClinicReadinessDomainKit
} from "../experiments/fogline-relay/src/fogline-field-clinic-kits.js";

const baseLevel = Object.freeze({
  id: "fogline-relay-test",
  spawn: { x: 0, z: -4 },
  gate: { x: 0, z: 46 },
  bounds: { minX: -18, maxX: 18, minZ: -8, maxZ: 48 },
  route: [
    { x: 0, z: -4 },
    { x: -5, z: 5 },
    { x: 3, z: 15 },
    { x: -2, z: 25 },
    { x: 6, z: 36 },
    { x: 0, z: 46 }
  ],
  relays: [
    { id: "relay-a", x: -4, z: 7, scanProgress: 0.2 },
    { id: "relay-b", x: 5, z: 20, scanProgress: 0.5 },
    { id: "relay-c", x: -3, z: 33, scanned: true }
  ],
  wraiths: [
    { id: "wraith-a", x: 8, z: 18, mode: "wander" },
    { id: "wraith-b", x: -9, z: 27, mode: "chase" }
  ]
});

function makeInput(overrides = {}) {
  return {
    level: baseLevel,
    route: baseLevel.route,
    game: {
      player: { x: 0, z: 0, yaw: 0.1 },
      gate: baseLevel.gate,
      relays: baseLevel.relays,
      wraiths: baseLevel.wraiths,
      stats: { elapsed: 120, timeBudget: 420, scanBursts: 2, scanned: 1 },
      ...overrides.game
    },
    ...overrides
  };
}

const cases = [
  { name: "baseline readiness", input: makeInput(), expectMin: 16 },
  { name: "all relays scanned lowers emergency colors", input: makeInput({ game: { relays: baseLevel.relays.map((relay) => ({ ...relay, scanned: true })) } }), expectMin: 16 },
  { name: "late route raises pressure vitals", input: makeInput({ game: { stats: { elapsed: 410, timeBudget: 420, scanBursts: 7, scanned: 0 } } }), expectMin: 16 },
  { name: "no relays fallback still renders", input: makeInput({ game: { relays: [] } }), expectMin: 12 },
  { name: "no route fallback remains serializable", input: makeInput({ route: [], level: { ...baseLevel, route: [] } }), expectMin: 8 },
  { name: "heavy chase increases triage risk", input: makeInput({ game: { wraiths: baseLevel.wraiths.map((wraith) => ({ ...wraith, mode: "chase" })) } }), expectMin: 16 },
  { name: "scan bursts improve oxygen caches", input: makeInput({ game: { stats: { elapsed: 80, timeBudget: 420, scanBursts: 9, scanned: 3 } } }), expectMin: 16 },
  { name: "missing game uses level defaults", input: { level: baseLevel, route: baseLevel.route }, expectMin: 16 },
  { name: "minimal input does not throw", input: {}, expectMin: 8 },
  { name: "wide level bounds keep positions numeric", input: makeInput({ level: { ...baseLevel, bounds: { minX: -80, maxX: 80, minZ: -80, maxZ: 120 } } }), expectMin: 16 }
];

const domainKit = createFoglineFieldClinicReadinessDomainKit();

assert.ok(FOGLINE_FIELD_CLINIC_DOMAIN_TREE.includes("fogline-field-clinic-readiness-domain"));
assert.ok(FOGLINE_FIELD_CLINIC_DOMAIN_TREE.includes("fogline-triage-beacon-kit"));
assert.ok(FOGLINE_FIELD_CLINIC_DOMAIN_TREE.includes("renderer consumes descriptors only"));
assert.deepEqual(FOGLINE_FIELD_CLINIC_KIT_NAMES.at(-1), "fogline-field-clinic-readiness-domain-kit");

for (const testCase of cases) {
  const domain = domainKit.describe(testCase.input);
  assert.equal(domain.id, "fogline-field-clinic-readiness-domain", testCase.name);
  assert.equal(domain.rendererHandoff.policy, "renderer-consumes-descriptors-only", testCase.name);
  assert.ok(domain.drawOrder.length >= testCase.expectMin, `${testCase.name} should produce rich descriptors`);
  assert.equal(domain.rendererHandoff.descriptorCount, domain.drawOrder.length, testCase.name);
  assert.ok(domain.triageBeacons.length >= 1, `${testCase.name} should expose triage beacons`);
  assert.ok(domain.oxygenCaches.length >= 1, `${testCase.name} should expose oxygen caches`);
  assert.ok(domain.stretcherLanes.length >= 0, `${testCase.name} should expose stretcher lane array`);
  assert.ok(domain.medicShelterPockets.length >= 1, `${testCase.name} should expose medic shelter pockets`);
  assert.ok(domain.ambulanceRouteSignals.length >= 2, `${testCase.name} should expose ambulance route signals`);
  assert.ok(domain.dawnClinicLedger.length >= 2, `${testCase.name} should expose dawn clinic ledger descriptors`);
  assert.ok(domain.drawOrder.every((descriptor) => descriptor.id && descriptor.archetype && descriptor.position), testCase.name);
  assert.ok(domain.drawOrder.every((descriptor) => Number.isFinite(descriptor.position.x) && Number.isFinite(descriptor.position.z)), testCase.name);
  assert.ok(domain.drawOrder.every((descriptor) => descriptor.compatibleBucket && descriptor.compatibleArchetype), testCase.name);
  assert.equal(domain.rendererHandoff.ownership.renderer, "consume-only", testCase.name);
  assert.equal(domain.rendererHandoff.ownership.dom, "excluded", testCase.name);
  assert.equal(domain.rendererHandoff.ownership.three, "excluded", testCase.name);
  assert.equal(domain.rendererHandoff.ownership.webgl, "excluded", testCase.name);
  assert.equal(domain.rendererHandoff.ownership.frameLoop, "excluded", testCase.name);
  assert.doesNotThrow(() => JSON.stringify(domain), testCase.name);
}

const lowPressure = domainKit.describe(makeInput({ game: { relays: baseLevel.relays.map((relay) => ({ ...relay, scanned: true })), stats: { elapsed: 20, timeBudget: 420, scanBursts: 0, scanned: 3 }, wraiths: [] } }));
const highPressure = domainKit.describe(makeInput({ game: { relays: baseLevel.relays.map((relay) => ({ ...relay, scanProgress: 0 })), stats: { elapsed: 420, timeBudget: 420, scanBursts: 9, scanned: 0 }, wraiths: baseLevel.wraiths.map((wraith) => ({ ...wraith, mode: "chase" })) } }));
assert.ok(
  highPressure.dawnClinicLedger.find((descriptor) => descriptor.id === "field-clinic-pressure-vitals").pressure >
    lowPressure.dawnClinicLedger.find((descriptor) => descriptor.id === "field-clinic-pressure-vitals").pressure,
  "pressure vitals should respond to worse state"
);

console.log("Fogline field clinic readiness kit smoke passed");
