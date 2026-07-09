import assert from "node:assert/strict";
import {
  BIRD_RUN_CANOPY_RESCUE_DOMAIN_TREE,
  BIRD_RUN_CANOPY_RESCUE_FORBIDDEN_OWNERS,
  createBirdRunCanopyRescueDomainKit,
  createBirdRunCollisionWindowKit,
  createBirdRunLaneIntentKit,
  createBirdRunNestlingRescueBeaconKit,
  createBirdRunObstacleGroveKit,
  createBirdRunRendererHandoffKit,
  createBirdRunRescueLedgerKit,
  createBirdRunWingbeatMotionKit
} from "../experiments/BirdRun/bird-run-canopy-rescue-domain-kits.js";

const cases = [
  { name: "idle center", state: { lane: 0, distance: 0 }, intent: {}, dt: 0.016 },
  { name: "left lane", state: { lane: 0, distance: 45 }, intent: { left: true }, dt: 0.03 },
  { name: "right lane", state: { lane: -1, distance: 80 }, intent: { right: true }, dt: 0.03 },
  { name: "flap climb", state: { lane: 1, altitude: 0.2, distance: 130 }, intent: { flap: true }, dt: 0.04 },
  { name: "fast runner", state: { speed: 52, distance: 220 }, intent: {}, dt: 0.05 },
  { name: "restart", state: { alive: false, status: "grounded", distance: 300 }, intent: { restart: true }, dt: 0.02 },
  { name: "invalid lane clamps", state: { lane: 99, distance: 30 }, intent: { right: true }, dt: 0.02 },
  { name: "rescue pressure", state: { lane: 0, rescued: 3, distance: 380 }, intent: {}, dt: 0.016 },
  { name: "late game speed", state: { lane: -1, speed: 40, distance: 760 }, intent: { left: true }, dt: 0.05 },
  { name: "conflicting input", state: { lane: 1, distance: 1200 }, intent: { left: true, right: true }, dt: 0.016 }
];

const domain = createBirdRunCanopyRescueDomainKit({ seed: 41 });
assert.ok(BIRD_RUN_CANOPY_RESCUE_DOMAIN_TREE.includes("renderer consumes descriptors only"));
assert.ok(BIRD_RUN_CANOPY_RESCUE_FORBIDDEN_OWNERS.includes("threejs"));
assert.equal(domain.atomicKits.length, 7);
assert.equal(createBirdRunLaneIntentKit().id, "bird-run-lane-intent-kit");
assert.equal(createBirdRunWingbeatMotionKit().id, "bird-run-wingbeat-motion-kit");
assert.equal(createBirdRunObstacleGroveKit().id, "bird-run-obstacle-grove-kit");
assert.equal(createBirdRunNestlingRescueBeaconKit().id, "bird-run-nestling-rescue-beacon-kit");
assert.equal(createBirdRunCollisionWindowKit().id, "bird-run-collision-window-kit");
assert.equal(createBirdRunRescueLedgerKit().id, "bird-run-rescue-ledger-kit");
assert.equal(createBirdRunRendererHandoffKit().id, "bird-run-canopy-rescue-renderer-handoff-kit");

for (const testCase of cases) {
  const result = domain.update(testCase);
  assert.equal(result.kind, "bird-run-canopy-rescue-readiness", testCase.name);
  assert.ok(Number.isFinite(result.state.distance), testCase.name);
  assert.ok(result.state.lane >= -1 && result.state.lane <= 1, testCase.name);
  assert.ok(result.descriptors.obstacles.length >= 6, testCase.name);
  assert.ok(result.descriptors.beacons.length >= 2, testCase.name);
  assert.equal(result.rendererHandoff.rendererConsumesDescriptorsOnly, true, testCase.name);
  assert.equal(result.rendererHandoff.bird.kind, "bird-avatar", testCase.name);
  assert.ok(result.rendererHandoff.telemetry.descriptorCount >= 10, testCase.name);
  assert.doesNotThrow(() => JSON.stringify(result), testCase.name);
}

console.log(`BirdRun canopy rescue kit smoke passed ${cases.length} cases.`);
