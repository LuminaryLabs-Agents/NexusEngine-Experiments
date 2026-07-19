import "./zombie-orchard-horde-pathing-readiness-kits-smoke.mjs";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createZombieOrchardHordePathingReadinessDomainKit } from "../experiments/zombie-orchard/src/horde-pathing-readiness-kits.js";

const root = process.cwd();
const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const oldCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";

const indexSource = await readFile(join(root, "experiments/zombie-orchard/index.html"), "utf8");
const entrySource = await readFile(join(root, "experiments/zombie-orchard/src/horde-pathing-readiness-entry.js"), "utf8");
const kitSource = await readFile(join(root, "experiments/zombie-orchard/src/horde-pathing-readiness-kits.js"), "utf8");
const kitStackSource = await readFile(join(root, "experiments/zombie-orchard/src/kit-stack.js"), "utf8");
const survivalSmokeSource = await readFile(join(root, "tests/zombie-orchard-survival-readability-cdn-state-input-smoke.mjs"), "utf8");

assert.ok(kitStackSource.includes(cdn), "Zombie Orchard runtime stack should use NexusEngine main CDN");
assert.ok(!kitStackSource.includes(oldCdn), "Zombie Orchard runtime stack should not import old NexusRealtime runtime CDN");
assert.ok(entrySource.includes(cdn), "horde overlay should import NexusEngine main CDN");
assert.ok(!entrySource.includes(oldCdn), "horde overlay should not import old NexusRealtime runtime CDN");
assert.ok(indexSource.includes("horde-pathing-readiness-entry.js?v=zombie-orchard-horde-pathing-20260708"));
assert.ok(indexSource.includes("main.js?v=zombie-orchard-"), "route should cache-bust the current main composition");
assert.ok(entrySource.includes("getHordePathingReadiness"));
assert.ok(entrySource.includes("getZombieOrchardHordePathingReadiness"));
assert.ok(entrySource.includes("getRendererHandoff"));
assert.ok(entrySource.includes("descriptors-only"));
assert.ok(entrySource.includes("ZombieOrchardHordePathingReadiness"));
assert.ok(survivalSmokeSource.includes("zombie-orchard-horde-pathing-cdn-state-input-smoke.mjs"));

for (const forbidden of ["from \"three", "from 'three", "document.", "window.", "requestAnimationFrame", "addEventListener", "Audio", "WebGL"]) {
  assert.ok(!kitSource.includes(forbidden), `renderer/input ownership leaked into reusable kit source: ${forbidden}`);
}
assert.ok(kitSource.includes("forbiddenOwners"));
assert.ok(kitSource.includes("renderer-consumes-descriptors-only"));

function stateCase(index) {
  const pressure = Math.min(1, 0.1 + index * 0.09);
  return {
    player: {
      position: { x: -12 + index * 2, z: 18 - index },
      facing: { x: index % 2 ? 0.4 : -0.25, z: -1 }
    },
    orchard: {
      width: 76,
      depth: 104,
      treeRows: Array.from({ length: 6 }, (_, row) => ({ id: `row-${row}`, z: -40 + row * 16 })),
      hauntedZones: [{ id: "shed-haunt", position: { x: 25, z: -30 }, active: true }]
    },
    weapons: {
      equippedId: "gear-1",
      inventory: [{ instanceId: "gear-1", label: "Pitchfork", durability: 6 - index * 0.25, maxDurability: 6 }]
    },
    weaponLabel: "Pitchfork",
    round: { round: index + 1, status: index % 2 ? "active" : "ready", bossWave: index === 9 },
    horde: { pressure01: pressure, pressure },
    monsters: Array.from({ length: 1 + (index % 5) }, (_, monsterIndex) => ({
      entity: `m-${index}-${monsterIndex}`,
      position: { x: -30 + monsterIndex * 13, z: -35 + monsterIndex * 10 },
      label: monsterIndex === 0 && index === 9 ? "Orchard Keeper" : "ghoul",
      boss: monsterIndex === 0 && index === 9,
      elite: monsterIndex === 1 && index > 4,
      threat: { threat: 1 + monsterIndex * 0.8 + index * 0.12 }
    })),
    targetMonster: { position: { x: -24, z: -30 }, threat: { threat: 2 } },
    health01: Math.max(0.2, 1 - index * 0.075),
    stamina01: Math.max(0.2, 1 - index * 0.045),
    recentApples: index % 4,
    recentClears: index % 3,
    recentHits: index > 6 ? 2 : 0,
    scoreMomentum: index * 0.06
  };
}

const domain = createZombieOrchardHordePathingReadinessDomainKit();
const results = Array.from({ length: 10 }, (_, index) => domain.compose(stateCase(index), {}, {}));
assert.equal(results.length, 10);
for (const [index, result] of results.entries()) {
  const descriptors = result.rendererHandoff.descriptors;
  assert.equal(result.rendererHandoff.policy, "renderer-consumes-descriptors-only");
  assert.ok(Array.isArray(descriptors.spawnLaneForecasts), `spawn lanes missing for state ${index}`);
  assert.ok(Array.isArray(descriptors.chokeRowPriorities), `choke rows missing for state ${index}`);
  assert.ok(Array.isArray(descriptors.noiseLureCones), `noise cones missing for state ${index}`);
  assert.ok(Array.isArray(descriptors.panicRetreatThreads), `retreat threads missing for state ${index}`);
  assert.ok(Array.isArray(descriptors.weaponUptimeRings), `weapon rings missing for state ${index}`);
  assert.ok(Array.isArray(descriptors.roundSurgeCountdowns), `surge rings missing for state ${index}`);
  assert.equal(result.rendererHandoff.descriptorCounts.weaponUptimeRings, 1);
  assert.equal(result.rendererHandoff.descriptorCounts.roundSurgeCountdowns, 1);
  assert.ok(result.summary.descriptorCount >= 8);
  assert.ok(result.rendererHandoff.ownership.forbiddenOwners.includes("dom"));
  assert.ok(result.rendererHandoff.ownership.forbiddenOwners.includes("browser-input"));
  assert.doesNotThrow(() => JSON.stringify(result));
}

console.log("zombie orchard horde pathing CDN/state-input smoke passed: NexusEngine CDN plus 10 state cases");
