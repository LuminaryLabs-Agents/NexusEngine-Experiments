import assert from "node:assert/strict";
import {
  createOrchardAppleGlowKit,
  createOrchardCombatCueKit,
  createOrchardFogRibbonKit,
  createOrchardGroundTextureKit,
  createOrchardHauntingZoneRingKit,
  createOrchardLaneBandKit,
  createOrchardLeafClusterKit,
  createOrchardPickupBeaconKit,
  createOrchardTensionLightingKit,
  createOrchardThreatSilhouetteKit,
  createOrchardTrunkFormKit,
  createZombieOrchardVisualFractalDomainKit,
  ZOMBIE_ORCHARD_VISUAL_KIT_TREE
} from "../experiments/zombie-orchard/src/visual-fractal-kits.js";

const cases = Array.from({ length: 10 }, (_, i) => i);
const EPSILON = 0.000001;

const leaves = createOrchardLeafClusterKit({ seed: "test-leaves", clusterCount: 7 });
for (const i of cases) {
  const out = leaves.describe({ id: `tree-${i}`, canopyRadius: 1.2 + i * 0.25 }, i);
  assert.equal(out.length, 7);
  assert.ok(out.every((leaf) => leaf.scale > 0));
  assert.ok(out.every((leaf) => Number.isFinite(leaf.offset.x) && Number.isFinite(leaf.offset.y) && Number.isFinite(leaf.offset.z)));
}

const trunks = createOrchardTrunkFormKit({ seed: "test-trunks" });
for (const i of cases) {
  const out = trunks.describe({ rowIndex: i }, i);
  assert.ok(out.height >= 2.7 && out.height <= 3.81);
  assert.ok(out.baseRadius > out.crownRadius);
  assert.ok(Number.isFinite(out.lean));
  assert.ok(out.barkBands >= 5 && out.barkBands <= 9);
}

const appleGlow = createOrchardAppleGlowKit();
const appleTypes = ["red-apple", "golden-apple", "moon-apple", "glass-apple", "cider-apple", "black-apple", "unknown"];
for (const i of cases) {
  const typeId = appleTypes[i % appleTypes.length];
  const out = appleGlow.describe({ id: `apple-${i}`, typeId }, i % 2 === 0 ? `apple-${i}` : "other");
  assert.equal(out.id, `apple-${i}`);
  assert.ok(out.emissiveIntensity > 0);
  assert.ok(out.haloScale >= 1.12);
  if (i % 2 === 0) assert.ok(out.haloScale > 1.12);
}

const lanes = createOrchardLaneBandKit({ seed: "test-lanes" });
for (const i of cases) {
  const out = lanes.describe({ id: `row-${i}`, z: i * 8 - 40 }, i);
  assert.equal(out.id, `lane-band:row-${i}`);
  assert.ok(out.width >= 3.6 && out.width <= 4.8);
  assert.ok(out.length === 110);
  assert.ok(out.leafScatter >= 14);
}

const ground = createOrchardGroundTextureKit({ seed: "test-ground" });
for (const i of cases) {
  const out = ground.describe({ width: 76, depth: 104, treeRows: [{ id: `row-${i}`, z: i * 4 }] }, { horde: { pressure01: i / 10 } });
  assert.equal(out.id, "orchard-ground-texture");
  assert.equal(out.furrows.length, 1);
  assert.ok(out.leafPatches.length >= 10);
  assert.equal(out.mudPatches.length, 8);
  assert.ok(out.furrows.every((furrow) => furrow.width > 0 && furrow.length > 0));
}

const fog = createOrchardFogRibbonKit({ seed: "test-fog" });
for (const i of cases) {
  const out = fog.describe({ id: `lane-${i}`, center: { x: i, z: -i }, width: 4, length: 60 }, i, { fogDensity: 0.018 + i * 0.003 });
  assert.equal(out.id, `fog-ribbon:lane-${i}:${i}`);
  assert.ok(out.width >= 4);
  assert.ok(out.length > 40);
  assert.ok(out.opacity >= 0.08);
}

const hauntZones = createOrchardHauntingZoneRingKit();
for (const i of cases) {
  const out = hauntZones.describe({ id: `zone-${i}`, position: { x: i, z: -i }, radius: 6 + i }, i === 6 ? `zone-${i}` : "other");
  assert.equal(out.id, `zone-${i}`);
  assert.ok(out.radius >= 6);
  assert.equal(out.active, i === 6);
  assert.ok(out.opacity > 0);
}

const pickupBeacons = createOrchardPickupBeaconKit();
for (const i of cases) {
  const out = pickupBeacons.describe({ id: `pickup-${i}`, weaponId: i % 2 ? "pitchfork" : "orchard-bow", position: { x: i, z: i * 2 } }, i % 3 === 0 ? `pickup-${i}` : "other");
  assert.equal(out.id, `pickup-${i}`);
  assert.ok(out.ringScale >= 1);
  assert.ok(out.opacity > 0);
  if (i % 3 === 0) assert.ok(out.pulse > 0.35);
}

const combatCue = createOrchardCombatCueKit();
for (const i of cases) {
  const out = combatCue.describe(i % 2 === 0 ? { entity: `monster-${i}`, position: { x: i, z: -i }, boss: i === 8, elite: i === 6 } : null, { position: { x: 0, z: 0 } }, i % 3 ? "pitchfork" : "empty hands");
  assert.equal(out.id, "orchard-combat-cue");
  assert.ok(out.playerRing.radius > 0);
  assert.equal(Boolean(out.targetLock), i % 2 === 0);
  if (out.targetLock) assert.ok(out.targetLock.range >= 0);
}

const silhouettes = createOrchardThreatSilhouetteKit();
for (const i of cases) {
  const out = silhouettes.describe({
    entity: `monster-${i}`,
    archetypeId: i % 3 === 0 ? "runner-zombie" : "walker-zombie",
    boss: i === 9,
    elite: i === 5,
    threat: { threat: 1 + i * 0.5 }
  });
  assert.equal(out.id, `monster-${i}`);
  assert.ok(out.height > 1.5);
  assert.ok(out.shoulderScale > 0.5);
  assert.ok(["lunge", "stomp", "shamble"].includes(out.gait));
}

const lighting = createOrchardTensionLightingKit();
for (const i of cases) {
  const health01 = 1 - i / 11;
  const pressure01 = i / 10;
  const out = lighting.describe({ health01, horde: { pressure01 }, danger: i > 7 });
  assert.ok(out.tension >= 0 && out.tension <= 1);
  assert.ok(out.fogDensity >= 0.018 && out.fogDensity <= 0.052 + EPSILON);
  assert.ok(out.moonIntensity >= 2.2);
  assert.ok(out.vignette >= 0.18);
}

const composite = createZombieOrchardVisualFractalDomainKit({
  leafCluster: { seed: "test-composite", clusterCount: 5 }
});
for (const i of cases) {
  const snapshot = {
    health01: 1 - i / 12,
    danger: i > 8,
    horde: { pressure01: i / 10 },
    nearestApple: { id: "apple-a" },
    nearestWeapon: { id: "pickup-a" },
    weaponLabel: i % 2 ? "pitchfork" : "empty hands",
    player: { position: { x: 0, z: 0 } },
    orchard: {
      width: 76,
      depth: 104,
      treeRows: [
        { id: "row-a", z: -12, trees: [{ id: "tree-a", position: { x: i, z: -12 }, canopyRadius: 2.2 }] },
        { id: "row-b", z: 12, trees: [{ id: "tree-b", position: { x: -i, z: 12 }, canopyRadius: 1.8 }] }
      ],
      fogLanes: [{ id: "fog-a", center: { x: 0, z: 8 }, width: 5, length: 70 }],
      hauntedZones: [{ id: "zone-a", position: { x: 3, z: 4 }, radius: 9 }],
      haunting: { activeZoneId: "zone-a" },
      activeApples: [{ id: "apple-a", typeId: i % 2 ? "moon-apple" : "red-apple", position: { x: 0, z: 0 } }]
    },
    weapons: { pickups: [{ id: "pickup-a", weaponId: "pitchfork", position: { x: 2, z: 2 }, active: true }] },
    monsters: [{ entity: "monster-a", archetypeId: "walker-zombie", position: { x: 5, z: 5 }, threat: { threat: 2 } }],
    targetMonster: { entity: "monster-a", position: { x: 5, z: 5 }, threat: { threat: 2 } }
  };
  const out = composite.compose(snapshot);
  assert.equal(out.trees.length, 2);
  assert.equal(out.apples.length, 1);
  assert.equal(out.lanes.length, 2);
  assert.equal(out.threats.length, 1);
  assert.equal(out.fogRibbons.length, 1);
  assert.equal(out.hauntZones.length, 1);
  assert.equal(out.pickups.length, 1);
  assert.ok(out.ground.furrows.length >= 2);
  assert.ok(out.combatCue.playerRing.radius > 0);
  assert.ok(out.lighting.fogDensity > 0);
}

assert.ok(ZOMBIE_ORCHARD_VISUAL_KIT_TREE.includes("orchard-ground-texture-kit"));
assert.ok(ZOMBIE_ORCHARD_VISUAL_KIT_TREE.includes("orchard-fog-ribbon-kit"));
assert.ok(ZOMBIE_ORCHARD_VISUAL_KIT_TREE.includes("orchard-combat-cue-kit"));
assert.ok(ZOMBIE_ORCHARD_VISUAL_KIT_TREE.includes("renderer descriptor handoff"));

console.log("zombie orchard visual fractal kit smoke passed: 120 intake cases");
