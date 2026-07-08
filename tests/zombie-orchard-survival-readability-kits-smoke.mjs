import assert from "node:assert/strict";
import {
  createOrchardEscapeLaneKit,
  createOrchardMeleeWindowKit,
  createOrchardResourceRouteKit,
  createOrchardRoundPressureBandKit,
  createOrchardStaminaBreathKit,
  createOrchardSurvivalRendererHandoffKit,
  createOrchardThreatGradientKit,
  createZombieOrchardSurvivalReadabilityDomainKit,
  ZOMBIE_ORCHARD_SURVIVAL_READABILITY_TREE
} from "../experiments/zombie-orchard/src/survival-readability-kits.js";

const cases = Array.from({ length: 10 }, (_, index) => ({
  index,
  health01: Math.max(0.08, 1 - index * 0.08),
  stamina01: Math.max(0.06, 1 - index * 0.09),
  danger: index > 7,
  player: { position: { x: index - 4, z: index * -2 }, facing: { x: 0.2, z: -1 } },
  horde: { pressure01: index / 10, mode: index > 8 ? "panic" : "stalking" },
  round: { round: 1 + index, nextRound: 2 + index, status: index % 2 ? "active" : "rest", bossWave: index === 9 },
  orchard: {
    width: 76,
    depth: 104,
    treeRows: [
      { id: `row-${index}-a`, z: -28 + index, trees: [] },
      { id: `row-${index}-b`, z: 8 + index, trees: [] },
      { id: `row-${index}-c`, z: 28 - index, trees: [] }
    ],
    activeApples: [
      { id: `apple-${index}-a`, label: "red apple", typeId: "red-apple", position: { x: 5 + index, z: -4 - index } },
      { id: `apple-${index}-b`, label: "moon apple", typeId: "moon-apple", position: { x: -6, z: 10 + index } }
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
  weaponLabel: index % 3 === 0 ? "empty hands" : "pitchfork",
  monsters: [
    { entity: `monster-${index}-a`, position: { x: index, z: -index }, threat: { threat: 1 + index * 0.2 }, archetypeId: "walker-zombie" },
    { entity: `monster-${index}-boss`, position: { x: 8, z: 8 - index }, threat: { threat: 5 }, boss: index > 7, archetypeId: "orchard-keeper" }
  ],
  targetMonster: { entity: `monster-${index}-a`, position: { x: index, z: -index }, range: 3 + index * 0.25, threat: { threat: 2 } },
  visualDomains: {
    combatCue: {
      targetLock: { id: `monster-${index}-a`, position: { x: index, z: -index }, range: 3 + index * 0.25 },
      playerRing: { position: { x: index - 4, z: index * -2 }, radius: 4 }
    }
  }
}));

const assertSerializable = (value) => assert.doesNotThrow(() => JSON.stringify(value));

const threatGradient = createOrchardThreatGradientKit();
const resourceRoute = createOrchardResourceRouteKit();
const staminaBreath = createOrchardStaminaBreathKit();
const pressureBand = createOrchardRoundPressureBandKit();
const escapeLane = createOrchardEscapeLaneKit();
const meleeWindow = createOrchardMeleeWindowKit();
const rendererHandoff = createOrchardSurvivalRendererHandoffKit();
const domain = createZombieOrchardSurvivalReadabilityDomainKit();

for (const intake of cases) {
  const threats = threatGradient.describe(intake);
  assert.equal(threats.length, 2);
  assert.ok(threats.every((item) => item.kind === "threat-gradient" && item.radius > 0 && item.urgency >= 0 && item.urgency <= 1));
  assertSerializable(threats);

  const routes = resourceRoute.describe(intake);
  assert.ok(routes.length >= 2);
  assert.ok(routes.every((item) => item.kind === "resource-route" && item.distance >= 0 && item.opacity > 0));
  assert.ok(routes.some((item) => item.targetType === "apple"));
  assertSerializable(routes);

  const breath = staminaBreath.describe(intake);
  assert.equal(breath.kind, "stamina-breath");
  assert.ok(breath.stress >= 0 && breath.stress <= 1);
  assert.ok(breath.radius > 0);
  assertSerializable(breath);

  const pressure = pressureBand.describe(intake);
  assert.equal(pressure.kind, "round-pressure-band");
  assert.ok(pressure.radius > 20);
  assert.ok(pressure.opacity > 0);
  assertSerializable(pressure);

  const lanes = escapeLane.describe(intake);
  assert.equal(lanes.length, 3);
  assert.ok(lanes.every((item) => item.kind === "escape-lane" && item.clearance >= 0 && item.clearance <= 1));
  assertSerializable(lanes);

  const melee = meleeWindow.describe(intake);
  assert.equal(melee.kind, "melee-window");
  assert.equal(melee.armed, intake.weaponLabel !== "empty hands");
  assert.ok(melee.radius > 0);
  assertSerializable(melee);

  const composed = domain.compose(intake, intake.visualDomains);
  assert.equal(composed.threatGradients.length, 2);
  assert.ok(composed.resourceRoutes.length >= 2);
  assert.ok(composed.staminaBreath);
  assert.ok(composed.roundPressureBand);
  assert.equal(composed.escapeLanes.length, 3);
  assert.ok(composed.meleeWindow);

  const handoff = rendererHandoff.describe(composed);
  assert.equal(handoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(handoff.descriptorCounts.threatGradients, 2);
  assert.equal(handoff.descriptorCounts.escapeLanes, 3);
  assert.ok(handoff.ownership.forbiddenOwners.includes("dom"));
  assert.ok(handoff.ownership.forbiddenOwners.includes("frame-loop"));
  assertSerializable(handoff);

  assert.equal(composed.rendererHandoff.policy, "renderer-consumes-descriptors-only");
  assert.deepEqual(composed.rendererHandoff.descriptorCounts, handoff.descriptorCounts);
}

assert.ok(ZOMBIE_ORCHARD_SURVIVAL_READABILITY_TREE.includes("orchard-threat-gradient-kit"));
assert.ok(ZOMBIE_ORCHARD_SURVIVAL_READABILITY_TREE.includes("orchard-survival-renderer-handoff-kit"));
assert.ok(ZOMBIE_ORCHARD_SURVIVAL_READABILITY_TREE.includes("renderer consumes descriptors only"));

console.log("zombie orchard survival readability kits smoke passed: 80 intake checks");
