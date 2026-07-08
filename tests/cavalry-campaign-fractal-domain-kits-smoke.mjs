import assert from "node:assert/strict";
import {
  createCavalryCampaignFractalDomainKit,
  createCavalryFractalRendererHandoffKit,
  createCavalryManeuverChoiceBandKit,
  createCavalryMarchCorridorKit,
  createCavalryMoraleWeatherFrontKit,
  createCavalrySupplyLineKit,
  createCavalryUnitCohesionFieldKit,
  CAVALRY_CAMPAIGN_FRACTAL_DOMAIN_TREE
} from "../experiments/The Cavalry of Rome/src/cavalry-campaign-fractal-domain-kit.js";

const owners = ["player", "player", "ai1", null, "ai2", "player", "ai1", null, "ai2", "ai3"];
const baseCells = Array.from({ length: 10 }, (_, i) => ({
  id: `c-${i}`,
  x: 80 + i * 48,
  y: 90 + (i % 3) * 72,
  owner: owners[i],
  t: { l: i % 2 === 0 ? 3 : 1, m: i % 3, h: i % 4 === 0 ? 2 : 0 },
  n: [`c-${(i + 1) % 10}`, `c-${(i + 9) % 10}`, `c-${(i + 3) % 10}`]
}));

const cases = Array.from({ length: 10 }, (_, i) => ({
  sizeId: i % 2 ? "medium" : "small",
  preset: { label: i % 2 ? "Medium" : "Small", rivals: 3, worldW: 960, worldH: 640 },
  cells: baseCells.map((cell, index) => ({
    ...cell,
    owner: index === i % baseCells.length ? "player" : cell.owner,
    t: { l: cell.t.l + (index === i ? 2 : 0), m: cell.t.m + (index % 2), h: cell.t.h }
  })),
  turn: i + 1,
  actions: i % 3,
  from: `c-${i % 10}`,
  to: i % 2 ? `c-${(i + 1) % 10}` : null,
  draft: { l: 2 + (i % 2), m: i % 3, h: i % 4 === 0 ? 1 : 0 },
  camera: { x: 300, y: 240, z: 1 }
}));

const surfaces = [
  ["supply", createCavalrySupplyLineKit()],
  ["march", createCavalryMarchCorridorKit()],
  ["cohesion", createCavalryUnitCohesionFieldKit()],
  ["morale", createCavalryMoraleWeatherFrontKit()],
  ["choices", createCavalryManeuverChoiceBandKit()]
];

assert.ok(CAVALRY_CAMPAIGN_FRACTAL_DOMAIN_TREE.includes("renderer consumes descriptors only"), "domain tree should declare descriptor-only renderer handoff");

let smokeCount = 0;
for (const input of cases) {
  for (const [name, kit] of surfaces) {
    const descriptors = kit.describe(input);
    assert.ok(Array.isArray(descriptors), `${name} should return an array`);
    assert.ok(descriptors.length > 0, `${name} should produce descriptors for intake ${input.turn}`);
    assert.doesNotThrow(() => JSON.stringify(descriptors), `${name} descriptors should be serializable`);
    for (const descriptor of descriptors) {
      assert.ok(descriptor.id && descriptor.kind, `${name} descriptor should include id and kind`);
      assert.equal(typeof descriptor.id, "string", `${name} descriptor id should be stable string`);
    }
    smokeCount += 1;
  }

  const domain = createCavalryCampaignFractalDomainKit().describe(input);
  assert.ok(domain.rendererHandoff.rendererConsumesDescriptorsOnly, "composite handoff should be descriptor-only");
  assert.ok(domain.supplyLines.length > 0, "composite should include supply lines");
  assert.ok(domain.marchCorridors.length > 0, "composite should include march corridors");
  assert.ok(domain.cohesionFields.length > 0, "composite should include cohesion fields");
  assert.ok(domain.moraleFronts.length > 0, "composite should include morale fronts");
  assert.equal(domain.maneuverChoices.length, 4, "composite should include four maneuver choice descriptors");
  assert.deepEqual(
    domain.rendererHandoff.counts,
    {
      supplyLines: domain.supplyLines.length,
      marchCorridors: domain.marchCorridors.length,
      cohesionFields: domain.cohesionFields.length,
      moraleFronts: domain.moraleFronts.length,
      maneuverChoices: domain.maneuverChoices.length
    },
    "handoff counts should mirror descriptor bucket sizes"
  );
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(domain)), "composite domain should be JSON-safe");

  const handoff = createCavalryFractalRendererHandoffKit().describe({
    supplyLines: domain.supplyLines,
    marchCorridors: domain.marchCorridors,
    cohesionFields: domain.cohesionFields,
    moraleFronts: domain.moraleFronts,
    maneuverChoices: domain.maneuverChoices
  });
  assert.ok(handoff.contract.forbiddenOwnership.includes("browser-input"), "handoff should document browser-input ownership boundary");
  assert.ok(handoff.contract.forbiddenOwnership.includes("frame-loop"), "handoff should document frame-loop ownership boundary");
  smokeCount += 1;
}

assert.equal(smokeCount, 60, "10 intake cases should exercise 5 atomic kits plus the composite per case");
console.log("Cavalry campaign fractal domain kits smoke passed.");
