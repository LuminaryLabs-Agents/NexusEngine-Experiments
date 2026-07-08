import assert from "node:assert/strict";
import {
  createZombieOrchardHordePathingReadinessDomainKit,
  ZOMBIE_ORCHARD_HORDE_PATHING_READINESS_TREE
} from "../experiments/zombie-orchard/src/horde-pathing-readiness-kits.js";

function sample(index = 0) {
  const pressure = Math.min(1, 0.12 + index * 0.08);
  const monsters = Array.from({ length: 2 + (index % 4) }, (_, monsterIndex) => ({
    id: `monster-${index}-${monsterIndex}`,
    entity: `m-${index}-${monsterIndex}`,
    position: { x: -24 + monsterIndex * 12 + index, z: -36 + monsterIndex * 9 },
    label: monsterIndex === 0 && index > 6 ? "Orchard Keeper" : "row ghoul",
    boss: monsterIndex === 0 && index > 6,
    elite: monsterIndex === 1 && index % 2 === 0,
    archetypeId: monsterIndex === 0 ? "walker-zombie" : "runner-zombie",
    threat: { threat: 1 + monsterIndex + index * 0.15 }
  }));
  return {
    clock: { elapsed: index * 3.5 },
    player: {
      position: { x: -8 + index * 1.7, z: 12 - index * 1.1 },
      facing: { x: index % 2 ? 0.5 : -0.2, z: -1 }
    },
    orchard: {
      width: 76,
      depth: 104,
      treeRows: Array.from({ length: 7 }, (_, row) => ({ id: `row-${row}`, z: -42 + row * 14 })),
      hauntedZones: [
        { id: "north-haunt", position: { x: -22, z: -38 }, active: index % 2 === 0 },
        { id: "south-haunt", position: { x: 28, z: 34 }, active: index % 3 === 0 }
      ],
      activeApples: [
        { id: "apple-a", typeId: "red", position: { x: 10, z: -6 } },
        { id: "apple-b", typeId: "golden", position: { x: -18, z: 22 } }
      ]
    },
    weapons: {
      equippedId: "gear-1",
      inventory: [{ instanceId: "gear-1", label: "Farm Axe", ammo: null, durability: 7 - index * 0.3, maxDurability: 8 }],
      pickups: []
    },
    weaponLabel: "Farm Axe",
    round: { round: index + 1, status: index % 3 === 0 ? "ready" : "active", bossWave: index > 7 },
    horde: { pressure01: pressure, pressure },
    monsters,
    targetMonster: monsters[0],
    health01: Math.max(0.18, 1 - index * 0.07),
    stamina01: Math.max(0.22, 1 - index * 0.04),
    recentApples: index % 5,
    recentClears: index % 4,
    recentHits: index > 5 ? index - 5 : 0,
    scoreMomentum: 0.08 * index
  };
}

const domain = createZombieOrchardHordePathingReadinessDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => sample(index));
const results = cases.map((state) => domain.compose(state, {}, {}));

assert.equal(results.length, 10);
assert.ok(ZOMBIE_ORCHARD_HORDE_PATHING_READINESS_TREE.includes("orchard-spawn-lane-forecast-kit"));
assert.ok(ZOMBIE_ORCHARD_HORDE_PATHING_READINESS_TREE.includes("renderer consumes descriptors only"));

for (const [index, result] of results.entries()) {
  assert.ok(Array.isArray(result.spawnLaneForecasts), `spawn lanes missing for case ${index}`);
  assert.ok(Array.isArray(result.chokeRowPriorities), `choke rows missing for case ${index}`);
  assert.ok(Array.isArray(result.noiseLureCones), `noise cones missing for case ${index}`);
  assert.ok(Array.isArray(result.panicRetreatThreads), `retreat threads missing for case ${index}`);
  assert.ok(Array.isArray(result.weaponUptimeRings), `weapon rings missing for case ${index}`);
  assert.ok(Array.isArray(result.roundSurgeCountdowns), `surge countdowns missing for case ${index}`);
  assert.equal(result.rendererHandoff.policy, "renderer-consumes-descriptors-only");
  assert.ok(result.rendererHandoff.ownership.forbiddenOwners.includes("renderer"));
  assert.ok(result.rendererHandoff.ownership.forbiddenOwners.includes("browser-input"));
  assert.ok(result.rendererHandoff.ownership.forbiddenOwners.includes("frame-loop"));
  assert.equal(result.rendererHandoff.descriptorCounts.weaponUptimeRings, 1);
  assert.equal(result.rendererHandoff.descriptorCounts.roundSurgeCountdowns, 1);
  assert.ok(result.summary.descriptorCount >= 8);
  assert.doesNotThrow(() => JSON.stringify(result));
}

const calm = domain.compose({ ...sample(0), monsters: [], horde: { pressure01: 0.05 }, round: { status: "ready", round: 1 }, targetMonster: null }, {}, {});
assert.ok(calm.spawnLaneForecasts.length >= 1, "haunted zones should provide forecast fallback when monsters are absent");
assert.ok(calm.weaponUptimeRings[0].uptime >= 0);

const panic = domain.compose(sample(9), {}, {});
assert.ok(panic.spawnLaneForecasts.some((lane) => lane.urgency > 0.65), "late cases should expose urgent horde pathing");
assert.ok(panic.panicRetreatThreads.some((thread) => thread.urgency > 0.55), "late cases should expose retreat pressure");
assert.ok(panic.roundSurgeCountdowns[0].surge > 0.55, "late cases should expose surge countdown pressure");

console.log("zombie orchard horde pathing readiness kit smoke passed: 10 intake cases");
