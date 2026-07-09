import assert from "node:assert/strict";
import {
  MEADOW_POLLINATOR_RESCUE_READINESS_TREE,
  createMeadowBeeNestHealthKit,
  createMeadowNativeFlowerSeedbankKit,
  createMeadowPollenCorridorWindKit,
  createMeadowMilkweedMonarchWaystationKit,
  createMeadowPuddleDrinkMicrohabitatKit,
  createMeadowDuskPollinatorLedgerKit,
  createMeadowPollinatorRescueReadinessDomainKit
} from "../experiments/high-fidelity-meadow/src/meadow-pollinator-rescue-readiness-kits.js";

const heightAt = (x = 0, z = 0) => Math.sin(x * 0.031) * 0.22 + Math.cos(z * 0.037) * 0.16;
const pathMask = (x = 0, z = 0) => Math.max(0, 1 - Math.abs(x * 0.12 + z * 0.04) / 12);
const yardMask = (x = 0, z = 0) => Math.max(0, 1 - Math.hypot(x - 4, z + 3) / 18);

const cases = Array.from({ length: 10 }, (_, index) => ({
  seed: `pollinator-rescue-smoke-${index}`,
  width: 170 + index * 5,
  depth: 162 + index * 4,
  phase: index % 3 === 0 ? "dusk pollinator count" : "golden hour",
  dayAmount: 0.25 + index * 0.06,
  warmRim: 0.18 + index * 0.05,
  windSeed: index * 0.29,
  heightAt,
  pathMask,
  yardMask,
  sheep: Array.from({ length: 5 + index }, (_, sheepIndex) => ({ id: `sheep.${index}.${sheepIndex}`, transform: { x: -18 + sheepIndex * 4, y: 0, z: 8 + sheepIndex * 2 } })),
  flowers: Array.from({ length: 44 + index * 8 }, (_, flowerIndex) => ({ id: `flower.${index}.${flowerIndex}`, x: Math.sin(flowerIndex * 0.7) * 34, z: Math.cos(flowerIndex * 0.5) * 32, color: [0.86, 0.7, 0.38] }))
}));

const atomicKits = [
  ["bee", createMeadowBeeNestHealthKit()],
  ["seedbank", createMeadowNativeFlowerSeedbankKit()],
  ["pollen", createMeadowPollenCorridorWindKit()],
  ["monarch", createMeadowMilkweedMonarchWaystationKit()],
  ["puddle", createMeadowPuddleDrinkMicrohabitatKit()],
  ["ledger", createMeadowDuskPollinatorLedgerKit()]
];

assert.ok(MEADOW_POLLINATOR_RESCUE_READINESS_TREE.includes("pollinator-habitat-domain"), "domain tree should expose habitat split");
assert.ok(MEADOW_POLLINATOR_RESCUE_READINESS_TREE.includes("migration-support-domain"), "domain tree should expose migration split");
assert.ok(MEADOW_POLLINATOR_RESCUE_READINESS_TREE.includes("renderer consumes descriptors only"), "tree should document renderer-only consumption");

for (const input of cases) {
  for (const [name, kit] of atomicKits) {
    const result = kit.describe(input);
    assert.equal(typeof result.id, "string", `${name} kit should return a stable id`);
    assert.ok(JSON.stringify(result).includes("meadow.pollinator"), `${name} kit should serialize pollinator descriptors`);
  }

  const state = createMeadowPollinatorRescueReadinessDomainKit().describe(input);
  assert.equal(state.rendererHandoff.contract, "renderer-consumes-serializable-descriptors-only", `handoff contract should hold for ${input.seed}`);
  assert.ok(state.rendererHandoff.forbiddenOwnership.includes("renderer"), "domain kit must not own renderer");
  assert.ok(state.rendererHandoff.forbiddenOwnership.includes("browser-input"), "domain kit must not own browser input");
  assert.ok(state.rendererHandoff.forbiddenOwnership.includes("asset-loading"), "domain kit must not own asset loading");
  assert.equal(state.descriptorCounts.beeNestHealthClusters, 7, "bee nest cluster count should be deterministic");
  assert.equal(state.descriptorCounts.nativeSeedbankPatches, 9, "seedbank patch count should be deterministic");
  assert.equal(state.descriptorCounts.pollenCorridors, 8, "pollen corridor count should be deterministic");
  assert.equal(state.descriptorCounts.monarchWaystations, 6, "monarch waystation count should be deterministic");
  assert.equal(state.descriptorCounts.puddleDrinkMicrohabitats, 5, "puddle microhabitat count should be deterministic");
  assert.equal(state.descriptorCounts.duskLedgerEntries, 6, "ledger count should be deterministic");
  assert.equal(state.descriptorCounts.total, 41, "pollinator rescue should emit 41 descriptors");
  assert.equal(JSON.parse(JSON.stringify(state)).descriptorCounts.total, 41, "domain state should JSON serialize cleanly");
  assert.ok(state.descriptors.pollenCorridors.corridors.every((corridor) => corridor.from && corridor.to), "pollen corridors should be line descriptors");
}

console.log(`Meadow pollinator rescue readiness kit smoke passed ${cases.length} intake cases.`);
