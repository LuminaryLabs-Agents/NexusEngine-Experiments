import assert from "node:assert/strict";
import {
  createVrBoardChallengeDirectorKit,
  createVrBoardCompositionKit,
  createVrBoardDepthLaneKit,
  createVrBoardHudDescriptorKit,
  createVrBoardWorldSeedKit
} from "../experiments/_kits/vr-platformer-board/vr-platformer-board-kits.js";

const level = {
  start: { x: 0, y: 2 },
  exit: { x: 12, y: 3 },
  platforms: [{ x: 0, y: 1, w: 3, h: 0.3 }, { x: 4, y: 2, w: 2, h: 0.3 }, { x: 8, y: 3, w: 2, h: 0.3 }],
  collectibles: [{ id: "coin-a", x: 2, y: 2.5 }, { id: "coin-b", x: 6, y: 3.5 }],
  hazards: [{ x: 5, y: 1, w: 1, h: 0.4 }]
};
const avatar = { position: { x: 6, y: 3 }, size: { x: 0.5, y: 0.8 } };
const camera = { position: { x: 3, y: 1 } };
const board = { sizeMeters: { x: 1.6, y: 0.9 } };
const objects = { collectedValue: 2 };
const comfort = { warnings: [] };
const sequence = { hint: "Collect coins" };
const input = { level, avatar, camera, board, objects, comfort, sequence, time: 1.5 };

const worldSeedKit = createVrBoardWorldSeedKit({ seed: "test-board" });
const challengeDirectorKit = createVrBoardChallengeDirectorKit();
const depthLaneKit = createVrBoardDepthLaneKit({ laneCount: 6 });
const hudDescriptorKit = createVrBoardHudDescriptorKit();
const compositionKit = createVrBoardCompositionKit({ worldSeedKit, challengeDirectorKit, depthLaneKit, hudDescriptorKit });

// VR board world seed kit: 10 intake checks.
const world = worldSeedKit.describe(input);
assert.equal(worldSeedKit.id, "n-vr-board-world-seed-kit");
assert.equal(worldSeedKit.domain, "vr-board-world-seed");
assert.equal(world.seed, "test-board");
assert.equal(world.boardTone, "hazard-training");
assert.equal(world.skyline.length, 10);
assert.equal(world.platformAuras.length, 3);
assert.equal(world.collectibleOrbits.length, 2);
assert.ok(world.skyline[0].h >= 24);
assert.ok(world.platformAuras[0].pulse >= 0.34);
assert.deepEqual(worldSeedKit.snapshot(input), { seed: "test-board", boardTone: "hazard-training", skylineCount: 10, platformAuraCount: 3, collectibleOrbitCount: 2 });

// VR board challenge director kit: 10 intake checks.
const challenge = challengeDirectorKit.describe(input);
assert.equal(challengeDirectorKit.id, "n-vr-board-challenge-director-kit");
assert.equal(challengeDirectorKit.domain, "vr-board-challenge-director");
assert.equal(challenge.stage, "mid-board");
assert.equal(challenge.progress, 0.5);
assert.equal(challenge.collected, 2);
assert.equal(challenge.hazards, 1);
assert.equal(challenge.objectiveHint, "Collect coins");
assert.deepEqual(challenge.comfortWarnings, []);
assert.ok(challenge.intensity > 30);
assert.deepEqual(challengeDirectorKit.snapshot(input), { stage: "mid-board", progress: 0.5, intensity: challenge.intensity, warnings: 0 });

// VR board depth lane kit: 10 intake checks.
const lanes = depthLaneKit.describe(input);
assert.equal(depthLaneKit.id, "n-vr-board-depth-lane-kit");
assert.equal(depthLaneKit.domain, "vr-board-depth-lanes");
assert.equal(lanes.length, 6);
assert.equal(lanes[0].depth, 1);
assert.equal(lanes[5].depth, 6);
assert.ok(lanes[0].opacity < lanes[5].opacity);
assert.ok(lanes[0].width < lanes[5].width);
assert.equal(typeof lanes[0].offset, "number");
assert.equal(depthLaneKit.snapshot(input).laneCount, 6);
assert.deepEqual(depthLaneKit.snapshot(input), { laneCount: 6, nearestDepth: 1, farthestDepth: 6 });

// VR board HUD descriptor kit: 10 intake checks.
const hud = hudDescriptorKit.describe({ challenge, comfort, sequence });
assert.equal(hudDescriptorKit.id, "n-vr-board-hud-descriptor-kit");
assert.equal(hudDescriptorKit.domain, "vr-board-hud-descriptor");
assert.ok(hud.objective.includes("Collect coins"));
assert.ok(hud.objective.includes("50%"));
assert.ok(hud.objective.includes("comfort ok"));
assert.ok(hud.controls.includes("board domains live"));
assert.equal(hud.statusTone, "neutral");
assert.equal(hud.chips.length, 3);
assert.equal(hud.chips[0], "mid-board");
assert.equal(hudDescriptorKit.snapshot({ challenge, comfort, sequence }).chipCount, 3);

// VR board composition kit: 10 intake checks.
const composed = compositionKit.describe(input);
assert.equal(compositionKit.id, "n-vr-board-composition-kit");
assert.equal(compositionKit.domain, "vr-board-composition");
assert.equal(composed.world.skyline.length, 10);
assert.equal(composed.challenge.stage, "mid-board");
assert.equal(composed.depthLanes.length, 6);
assert.equal(composed.hud.statusTone, "neutral");
assert.equal(composed.hud.chips[1], "50%");
assert.equal(compositionKit.snapshot(input).hasWorld, true);
assert.equal(compositionKit.snapshot(input).hasChallenge, true);
assert.equal(compositionKit.snapshot(input).depthLanes, 6);
assert.equal(compositionKit.snapshot(input).hudTone, "neutral");
assert.equal(compositionKit.describe({}).depthLanes.length, 6);

console.log("vr platformer board kit smoke passed");
