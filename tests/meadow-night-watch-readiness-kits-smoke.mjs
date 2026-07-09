import assert from "node:assert/strict";
import {
  MEADOW_NIGHT_WATCH_READINESS_TREE,
  createMeadowLanternPatrolChainKit,
  createMeadowFoxPressurePerimeterKit,
  createMeadowLambShelterPocketKit,
  createMeadowGateLatchCheckpointKit,
  createMeadowDewPondMoonReflectionKit,
  createMeadowDawnRollcallLedgerKit,
  createMeadowNightWatchReadinessDomainKit
} from "../experiments/high-fidelity-meadow/src/meadow-night-watch-readiness-kits.js";

const heightAt = (x = 0, z = 0) => Math.sin(x * 0.031) * 0.23 + Math.cos(z * 0.037) * 0.15;
const pathMask = (x = 0, z = 0) => Math.max(0, 1 - Math.abs(x * 0.12 + z * 0.04) / 12);
const yardMask = (x = 0, z = 0) => Math.max(0, 1 - Math.hypot(x - 4, z + 3) / 18);

const cases = Array.from({ length: 10 }, (_, index) => ({
  seed: `night-watch-smoke-${index}`,
  width: 172 + index * 5,
  depth: 164 + index * 4,
  phase: index % 3 === 0 ? "blue dusk moon watch" : "golden hour",
  dayAmount: 0.18 + index * 0.055,
  warmRim: 0.14 + index * 0.04,
  windSeed: index * 0.31,
  heightAt,
  pathMask,
  yardMask,
  sheep: Array.from({ length: 7 + index }, (_, sheepIndex) => ({ id: `sheep.${index}.${sheepIndex}`, transform: { x: -18 + sheepIndex * 4, y: 0, z: 8 + sheepIndex * 2 } })),
  flowers: Array.from({ length: 52 + index * 7 }, (_, flowerIndex) => ({ id: `flower.${index}.${flowerIndex}`, x: Math.sin(flowerIndex * 0.7) * 34, z: Math.cos(flowerIndex * 0.5) * 32, color: [0.86, 0.7, 0.38] }))
}));

const atomicKits = [
  ["lantern", createMeadowLanternPatrolChainKit()],
  ["fox", createMeadowFoxPressurePerimeterKit()],
  ["lamb", createMeadowLambShelterPocketKit()],
  ["gate", createMeadowGateLatchCheckpointKit()],
  ["dew", createMeadowDewPondMoonReflectionKit()],
  ["rollcall", createMeadowDawnRollcallLedgerKit()]
];

assert.ok(MEADOW_NIGHT_WATCH_READINESS_TREE.includes("dusk-patrol-domain"), "domain tree should expose dusk patrol split");
assert.ok(MEADOW_NIGHT_WATCH_READINESS_TREE.includes("flock-shelter-domain"), "domain tree should expose flock shelter split");
assert.ok(MEADOW_NIGHT_WATCH_READINESS_TREE.includes("renderer consumes descriptors only"), "tree should document renderer-only consumption");

for (const input of cases) {
  for (const [name, kit] of atomicKits) {
    const result = kit.describe(input);
    assert.equal(typeof result.id, "string", `${name} kit should return a stable id`);
    assert.ok(JSON.stringify(result).includes("meadow.nightWatch"), `${name} kit should serialize night watch descriptors`);
  }

  const state = createMeadowNightWatchReadinessDomainKit().describe(input);
  assert.equal(state.rendererHandoff.contract, "renderer-consumes-serializable-descriptors-only", `handoff contract should hold for ${input.seed}`);
  assert.ok(state.rendererHandoff.forbiddenOwnership.includes("renderer"), "domain kit must not own renderer");
  assert.ok(state.rendererHandoff.forbiddenOwnership.includes("browser-input"), "domain kit must not own browser input");
  assert.ok(state.rendererHandoff.forbiddenOwnership.includes("asset-loading"), "domain kit must not own asset loading");
  assert.equal(state.descriptorCounts.lanternPatrolNodes, 8, "lantern patrol count should be deterministic");
  assert.equal(state.descriptorCounts.foxPressureTracks, 6, "fox pressure count should be deterministic");
  assert.equal(state.descriptorCounts.lambShelterPockets, 7, "lamb shelter count should be deterministic");
  assert.equal(state.descriptorCounts.gateLatchCheckpoints, 5, "gate latch count should be deterministic");
  assert.equal(state.descriptorCounts.dewPondReflections, 6, "dew pond count should be deterministic");
  assert.equal(state.descriptorCounts.dawnRollcallEntries, 6, "rollcall count should be deterministic");
  assert.equal(state.descriptorCounts.total, 38, "night watch should emit 38 descriptors");
  assert.equal(JSON.parse(JSON.stringify(state)).descriptorCounts.total, 38, "domain state should JSON serialize cleanly");
  assert.ok(state.descriptors.lanternPatrol.lanterns.every((node) => Number.isFinite(node.coverage)), "lantern nodes should expose coverage");
  assert.ok(state.descriptors.foxPressure.tracks.every((track) => Number.isFinite(track.pressure)), "fox pressure tracks should expose pressure");
}

console.log(`Meadow night watch readiness kit smoke passed ${cases.length} intake cases.`);
