import assert from "node:assert/strict";
import {
  createOrchardAppleRarityHeatKit,
  createOrchardBossOmenBranchKit,
  createOrchardForagingRendererHandoffKit,
  createOrchardGearChoiceArcKit,
  createOrchardHarvestStreakTrailKit,
  createOrchardRowMemoryBreadcrumbKit,
  createOrchardSafeHarvestPocketKit,
  createZombieOrchardForagingReadabilityDomainKit,
  ZOMBIE_ORCHARD_FORAGING_READABILITY_TREE
} from "../experiments/zombie-orchard/src/foraging-readability-kits.js";

const cases = Array.from({ length: 10 }, (_, index) => ({
  index,
  health01: Math.max(0.1, 1 - index * 0.07),
  stamina01: Math.max(0.08, 1 - index * 0.08),
  danger: index > 7,
  recentApples: index % 6,
  scoreMomentum: index / 10,
  player: { position: { x: index - 4, z: index * -2 }, facing: { x: 0.18 + index * 0.03, z: -1 } },
  horde: { pressure01: index / 10, mode: index > 8 ? "panic" : "stalking" },
  round: { round: 1 + index, status: index % 2 ? "active" : "rest", bossWave: index === 9 },
  orchard: {
    width: 76,
    depth: 104,
    hauntedZones: [
      { id: `haunt-${index}`, position: { x: 10 - index, z: -18 + index }, radius: 8 + index }
    ],
    treeRows: [
      { id: `row-${index}-a`, z: -28 + index, trees: [] },
      { id: `row-${index}-b`, z: 8 + index, trees: [] },
      { id: `row-${index}-c`, z: 28 - index, trees: [] }
    ],
    activeApples: [
      { id: `apple-${index}-a`, label: "red apple", typeId: "red-apple", rarity: "common", position: { x: 5 + index, z: -4 - index } },
      { id: `apple-${index}-b`, label: "moon apple", typeId: "moon-apple", rarity: index > 5 ? "legendary" : "rare", position: { x: -6, z: 10 + index } }
    ]
  },
  weapons: {
    pickups: [
      { id: `pickup-${index}-a`, weaponId: index % 2 ? "pitchfork" : "orchard-bow", position: { x: -2 - index, z: 3 }, active: true },
      { id: `pickup-${index}-inactive`, weaponId: "broken-rake", position: { x: 22, z: 22 }, active: false }
    ]
  },
  nearestApple: { id: `apple-${index}-a` },
  nearestWeapon: { id: `pickup-${index}-a` },
  monsters: [
    { entity: `monster-${index}-a`, position: { x: index, z: -index }, threat: { threat: 1 + index * 0.2 }, archetypeId: "walker-zombie" },
    { entity: `monster-${index}-boss`, position: { x: 8, z: 8 - index }, threat: { threat: 5 }, boss: index > 7, label: "Orchard Keeper", archetypeId: "orchard-keeper" }
  ],
  survivalReadability: {
    resourceRoutes: [],
    threatGradients: []
  }
}));

const assertSerializable = (value) => assert.doesNotThrow(() => JSON.stringify(value));

const appleHeat = createOrchardAppleRarityHeatKit();
const gearChoice = createOrchardGearChoiceArcKit();
const harvestTrail = createOrchardHarvestStreakTrailKit();
const safePocket = createOrchardSafeHarvestPocketKit();
const rowMemory = createOrchardRowMemoryBreadcrumbKit();
const bossOmen = createOrchardBossOmenBranchKit();
const rendererHandoff = createOrchardForagingRendererHandoffKit();
const domain = createZombieOrchardForagingReadabilityDomainKit();

for (const intake of cases) {
  const heat = appleHeat.describe(intake);
  assert.equal(heat.length, 2);
  assert.ok(heat.every((item) => item.kind === "apple-rarity-heat" && item.radius > 0 && item.priority >= 0 && item.priority <= 1));
  assertSerializable(heat);

  const gear = gearChoice.describe(intake);
  assert.equal(gear.length, 1);
  assert.ok(gear.every((item) => item.kind === "gear-choice-arc" && item.fit >= 0 && item.fit <= 1 && item.distance >= 0));
  assertSerializable(gear);

  const trail = harvestTrail.describe(intake);
  assert.equal(trail.length, 5);
  assert.ok(trail.every((item) => item.kind === "harvest-streak-trail" && item.radius > 0));
  assertSerializable(trail);

  const pockets = safePocket.describe(intake);
  assert.equal(pockets.length, 2);
  assert.ok(pockets.every((item) => item.kind === "safe-harvest-pocket" && item.safety >= 0 && item.safety <= 1));
  assertSerializable(pockets);

  const rows = rowMemory.describe(intake);
  assert.equal(rows.length, 3);
  assert.ok(rows.every((item) => item.kind === "row-memory-breadcrumb" && item.memory >= 0 && item.memory <= 1));
  assertSerializable(rows);

  const omens = bossOmen.describe(intake);
  if (intake.round.bossWave || intake.monsters.some((monster) => monster.boss)) {
    assert.ok(omens.length >= 1);
    assert.ok(omens.every((item) => item.kind === "boss-omen-branch" && item.omen >= 0 && item.omen <= 1));
  } else {
    assert.equal(omens.length, 0);
  }
  assertSerializable(omens);

  const composed = domain.compose(intake, intake.survivalReadability);
  assert.equal(composed.appleRarityHeat.length, 2);
  assert.equal(composed.gearChoiceArcs.length, 1);
  assert.equal(composed.harvestStreakTrails.length, 5);
  assert.equal(composed.safeHarvestPockets.length, 2);
  assert.equal(composed.rowMemoryBreadcrumbs.length, 3);

  const handoff = rendererHandoff.describe(composed);
  assert.equal(handoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(handoff.descriptorCounts.appleRarityHeat, 2);
  assert.equal(handoff.descriptorCounts.gearChoiceArcs, 1);
  assert.equal(handoff.descriptorCounts.harvestStreakTrails, 5);
  assert.equal(handoff.descriptorCounts.safeHarvestPockets, 2);
  assert.equal(handoff.descriptorCounts.rowMemoryBreadcrumbs, 3);
  assert.ok(handoff.ownership.forbiddenOwners.includes("renderer"));
  assert.ok(handoff.ownership.forbiddenOwners.includes("browser-input"));
  assert.ok(handoff.ownership.forbiddenOwners.includes("frame-loop"));
  assertSerializable(handoff);

  assert.equal(composed.rendererHandoff.policy, "renderer-consumes-descriptors-only");
  assert.deepEqual(composed.rendererHandoff.descriptorCounts, handoff.descriptorCounts);
}

assert.ok(ZOMBIE_ORCHARD_FORAGING_READABILITY_TREE.includes("orchard-apple-rarity-heat-kit"));
assert.ok(ZOMBIE_ORCHARD_FORAGING_READABILITY_TREE.includes("orchard-foraging-renderer-handoff-kit"));
assert.ok(ZOMBIE_ORCHARD_FORAGING_READABILITY_TREE.includes("renderer consumes descriptors only"));

console.log("zombie orchard foraging readability kits smoke passed: 90 intake checks");
