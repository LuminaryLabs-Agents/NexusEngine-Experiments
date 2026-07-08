import "./cavalry-logistics-readiness-domain-kits-smoke.mjs";
import assert from "node:assert/strict";
import {
  CAVALRY_BATTLEFIELD_ORDERS_DOMAIN_TREE,
  createCavalryAttritionForecastChipKit,
  createCavalryBattlefieldOrdersDomainKit,
  createCavalryBattlefieldOrdersRendererHandoffKit,
  createCavalryFlankRiskArcKit,
  createCavalryObjectivePressureBannerKit,
  createCavalryReinforcementCalloutKit,
  createCavalryScoutingVectorKit,
  createCavalryTurnTempoStandardKit
} from "../experiments/The Cavalry of Rome/src/cavalry-battlefield-orders-domain-kit.js";

const owners = ["player", "player", "ai1", null, "ai2", "player", "ai1", null, "ai2", "ai3"];
const baseCells = Array.from({ length: 10 }, (_, i) => ({
  id: `c-${i}`,
  x: 100 + i * 52,
  y: 120 + (i % 3) * 68,
  owner: owners[i],
  t: { l: i % 2 === 0 ? 3 : 1, m: i % 3, h: i % 4 === 0 ? 2 : 0 },
  n: [`c-${(i + 1) % 10}`, `c-${(i + 9) % 10}`, `c-${(i + 2) % 10}`]
}));

const cases = Array.from({ length: 10 }, (_, i) => ({
  sizeId: i % 2 ? "medium" : "small",
  preset: { label: i % 2 ? "Medium" : "Small", rivals: 3, worldW: 960, worldH: 640, actions: 4 },
  cells: baseCells.map((cell, index) => ({
    ...cell,
    owner: index === i % baseCells.length ? "player" : cell.owner,
    t: { l: cell.t.l + (index === i ? 2 : 0), m: cell.t.m + (index % 2), h: cell.t.h }
  })),
  turn: i + 1,
  actions: i % 4,
  from: `c-${i % 10}`,
  to: i % 2 ? `c-${(i + 1) % 10}` : null,
  draft: { l: 2 + (i % 2), m: i % 3, h: i % 4 === 0 ? 1 : 0 },
  camera: { x: 300, y: 240, z: 1 }
}));

const surfaces = [
  ["scouting", createCavalryScoutingVectorKit()],
  ["flank", createCavalryFlankRiskArcKit()],
  ["reinforcement", createCavalryReinforcementCalloutKit()],
  ["attrition", createCavalryAttritionForecastChipKit()],
  ["tempo", createCavalryTurnTempoStandardKit()],
  ["objective", createCavalryObjectivePressureBannerKit()]
];

assert.ok(CAVALRY_BATTLEFIELD_ORDERS_DOMAIN_TREE.includes("renderer consumes descriptors only"), "domain tree should declare descriptor-only renderer handoff");
assert.ok(CAVALRY_BATTLEFIELD_ORDERS_DOMAIN_TREE.includes("cavalry-scouting-vector-kit"), "tree should include scouting vector kit");
assert.ok(CAVALRY_BATTLEFIELD_ORDERS_DOMAIN_TREE.includes("cavalry-objective-pressure-banner-kit"), "tree should include objective pressure kit");

let smokeCount = 0;
for (const input of cases) {
  for (const [name, kit] of surfaces) {
    const descriptors = kit.describe(input);
    assert.ok(Array.isArray(descriptors), `${name} should return descriptors array`);
    assert.ok(descriptors.length > 0, `${name} should emit descriptors for intake ${input.turn}`);
    assert.doesNotThrow(() => JSON.stringify(descriptors), `${name} descriptors should be serializable`);
    for (const descriptor of descriptors) {
      assert.equal(typeof descriptor.id, "string", `${name} descriptor id should be stable`);
      assert.equal(typeof descriptor.kind, "string", `${name} descriptor kind should be stable`);
    }
    smokeCount += 1;
  }

  const domain = createCavalryBattlefieldOrdersDomainKit().describe(input);
  assert.equal(domain.source.route, "the-cavalry-of-rome", "domain source should identify the route");
  assert.ok(domain.rendererHandoff.rendererConsumesDescriptorsOnly, "composite handoff should be descriptor-only");
  assert.ok(domain.scoutingVectors.length > 0, "composite should include scouting vectors");
  assert.ok(domain.flankRiskArcs.length > 0, "composite should include flank risk arcs");
  assert.ok(domain.reinforcementCallouts.length > 0, "composite should include reinforcement callouts");
  assert.ok(domain.attritionForecastChips.length > 0, "composite should include attrition forecast chips");
  assert.equal(domain.turnTempoStandards.length, 2, "composite should include two turn tempo standards");
  assert.equal(domain.objectivePressureBanners.length, 1, "composite should include one objective pressure banner");
  assert.deepEqual(domain.rendererHandoff.counts, {
    scoutingVectors: domain.scoutingVectors.length,
    flankRiskArcs: domain.flankRiskArcs.length,
    reinforcementCallouts: domain.reinforcementCallouts.length,
    attritionForecastChips: domain.attritionForecastChips.length,
    turnTempoStandards: domain.turnTempoStandards.length,
    objectivePressureBanners: domain.objectivePressureBanners.length
  }, "handoff counts should mirror bucket sizes");
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(domain)), "composite domain should be JSON-safe");

  const handoff = createCavalryBattlefieldOrdersRendererHandoffKit().describe({
    scoutingVectors: domain.scoutingVectors,
    flankRiskArcs: domain.flankRiskArcs,
    reinforcementCallouts: domain.reinforcementCallouts,
    attritionForecastChips: domain.attritionForecastChips,
    turnTempoStandards: domain.turnTempoStandards,
    objectivePressureBanners: domain.objectivePressureBanners
  });
  assert.ok(handoff.contract.forbiddenOwnership.includes("browser-input"), "handoff should document browser-input ownership boundary");
  assert.ok(handoff.contract.forbiddenOwnership.includes("frame-loop"), "handoff should document frame-loop ownership boundary");
  smokeCount += 1;
}

assert.equal(smokeCount, 70, "10 intake cases should exercise 6 atomic kits plus the composite per case");
console.log("Cavalry battlefield orders domain kits smoke passed.");
