import assert from "node:assert/strict";
import {
  CAVALRY_LOGISTICS_READINESS_DOMAIN_TREE,
  createCavalryCourierOrderPulseKit,
  createCavalryForageCorridorKit,
  createCavalryLogisticsReadinessDomainKit,
  createCavalryLogisticsReadinessRendererHandoffKit,
  createCavalryRoadStrainThreadKit,
  createCavalrySiegeReadinessSignalKit,
  createCavalrySupplyDepotRadiusKit,
  createCavalryWinterAttritionWarningKit
} from "../experiments/The Cavalry of Rome/src/cavalry-logistics-readiness-domain-kit.js";

const makeCase = (i) => ({
  sizeId: i % 2 ? "medium-logistics" : "small-logistics",
  preset: { label: "Logistics Smoke", rivals: 2, worldW: 920, worldH: 620, actions: 4 },
  turn: i + 1,
  actions: i % 4,
  from: "rome-a",
  to: i % 2 ? "enemy-a" : "frontier-a",
  draft: { l: 3 + i, m: 1 + (i % 3), h: i % 4 === 0 ? 1 : 0 },
  camera: { x: 240, y: 190, z: 1 + i * 0.04 },
  cells: [
    { id: "rome-a", x: 120 + i, y: 160, owner: "player", t: { l: 5 + i, m: 2, h: 1 }, n: ["rome-b", "frontier-a", "enemy-a"] },
    { id: "rome-b", x: 220, y: 224 + i, owner: "player", t: { l: 3, m: 1 + i % 2, h: 1 }, n: ["rome-a", "frontier-a", "enemy-a"] },
    { id: "frontier-a", x: 332, y: 178 + i, owner: null, t: { l: 0, m: 0, h: 0 }, n: ["rome-a", "rome-b", "enemy-a"] },
    { id: "enemy-a", x: 424, y: 242, owner: "ai1", t: { l: 2 + i % 2, m: 2, h: i % 3 === 0 ? 1 : 0 }, n: ["rome-a", "rome-b", "frontier-a"] }
  ]
});

const cases = Array.from({ length: 10 }, (_, i) => makeCase(i));
const surfaces = [
  ["supply", createCavalrySupplyDepotRadiusKit()],
  ["forage", createCavalryForageCorridorKit()],
  ["road", createCavalryRoadStrainThreadKit()],
  ["siege", createCavalrySiegeReadinessSignalKit()],
  ["courier", createCavalryCourierOrderPulseKit()],
  ["winter", createCavalryWinterAttritionWarningKit()]
];

assert.ok(CAVALRY_LOGISTICS_READINESS_DOMAIN_TREE.includes("renderer consumes descriptors only"), "tree should declare descriptor-only renderer handoff");
assert.ok(CAVALRY_LOGISTICS_READINESS_DOMAIN_TREE.includes("cavalry-supply-depot-radius-kit"), "tree should include supply depot kit");
assert.ok(CAVALRY_LOGISTICS_READINESS_DOMAIN_TREE.includes("cavalry-winter-attrition-warning-kit"), "tree should include winter attrition kit");

let smokeCount = 0;
for (const input of cases) {
  for (const [name, kit] of surfaces) {
    const descriptors = kit.describe(input);
    assert.ok(Array.isArray(descriptors), `${name} should return a descriptor array`);
    assert.ok(descriptors.length > 0, `${name} should emit descriptors for intake turn ${input.turn}`);
    assert.doesNotThrow(() => JSON.stringify(descriptors), `${name} descriptors should serialize`);
    for (const descriptor of descriptors) {
      assert.equal(typeof descriptor.id, "string", `${name} descriptor id should be stable`);
      assert.equal(typeof descriptor.kind, "string", `${name} descriptor kind should be stable`);
    }
    smokeCount += 1;
  }

  const domain = createCavalryLogisticsReadinessDomainKit().describe(input);
  assert.equal(domain.source.route, "the-cavalry-of-rome", "domain source should identify the route");
  assert.ok(domain.rendererHandoff.rendererConsumesDescriptorsOnly, "composite handoff should be descriptor-only");
  assert.ok(domain.supplyDepotRadii.length >= 1, "composite should include depot radii");
  assert.ok(domain.forageCorridors.length >= 1, "composite should include forage corridors");
  assert.ok(domain.roadStrainThreads.length >= 1, "composite should include road strain threads");
  assert.ok(domain.siegeReadinessSignals.length >= 1, "composite should include siege readiness signals");
  assert.equal(domain.courierOrderPulses.length, 2, "composite should include two courier order pulses");
  assert.ok(domain.winterAttritionWarnings.length >= 1, "composite should include winter attrition warnings");
  assert.deepEqual(domain.rendererHandoff.counts, {
    supplyDepotRadii: domain.supplyDepotRadii.length,
    forageCorridors: domain.forageCorridors.length,
    roadStrainThreads: domain.roadStrainThreads.length,
    siegeReadinessSignals: domain.siegeReadinessSignals.length,
    courierOrderPulses: domain.courierOrderPulses.length,
    winterAttritionWarnings: domain.winterAttritionWarnings.length
  }, "handoff counts should mirror bucket sizes");
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(domain)), "composite domain should be JSON-safe");

  const handoff = createCavalryLogisticsReadinessRendererHandoffKit().describe(domain);
  assert.ok(handoff.contract.forbiddenOwnership.includes("browser-input"), "handoff should document browser-input boundary");
  assert.ok(handoff.contract.forbiddenOwnership.includes("frame-loop"), "handoff should document frame-loop boundary");
  smokeCount += 1;
}

assert.equal(smokeCount, 70, "10 intake cases should exercise 6 atomic kits plus the composite per case");
console.log("Cavalry logistics readiness domain kits smoke passed.");
