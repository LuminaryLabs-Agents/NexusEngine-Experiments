import assert from "node:assert/strict";
import {
  VR_BOARD_COMPANION_RESCUE_READINESS_DOMAIN_TREE,
  createVrBoardCheckpointSanctuarySignalKit,
  createVrBoardCompanionRescueReadinessDomainKit,
  createVrBoardEscortLaneRibbonKit,
  createVrBoardExitPortalBloomKit,
  createVrBoardExitStretcherCommitKit,
  createVrBoardGuardianBridgeRibbonKit,
  createVrBoardLostCompanionBeaconKit,
  createVrBoardMedalCacheSignalKit,
  createVrBoardMemoryShardTrailKit,
  createVrBoardRescueNetAnchorKit,
  createVrBoardShieldBubbleTimingKit
} from "../experiments/_kits/vr-platformer-board/vr-board-companion-rescue-readiness-kits.js";

const level = {
  start: { x: 0, y: 1.15 },
  exit: { x: 14.4, y: 4.5, w: 0.7, h: 1.2 },
  platforms: [
    { id: "launch", x: -0.6, y: 1.15, w: 3.1, h: 0.28 },
    { id: "low-hop", x: 3.0, y: 2.0, w: 1.9, h: 0.26 },
    { id: "hazard-bridge", x: 5.9, y: 2.85, w: 2.2, h: 0.26 },
    { id: "recovery", x: 8.8, y: 2.2, w: 1.8, h: 0.26 },
    { id: "summit", x: 11.6, y: 3.55, w: 2.4, h: 0.28 },
    { id: "exit-pad", x: 14.0, y: 4.4, w: 1.5, h: 0.3 }
  ],
  collectibles: [
    { id: "coin-launch", x: 2.2, y: 2.2, value: 1 },
    { id: "coin-bridge", x: 6.8, y: 3.82, value: 1 },
    { id: "coin-recovery", x: 9.6, y: 3.1, value: 1 },
    { id: "coin-summit", x: 12.6, y: 4.5, value: 1 }
  ],
  hazards: [
    { id: "spike-gap", x: 4.95, y: 1.08, w: 0.8, h: 0.36 },
    { id: "spike-bridge", x: 7.45, y: 2.76, w: 0.7, h: 0.36 },
    { id: "drop-warning", x: 10.82, y: 1.12, w: 0.82, h: 0.36 }
  ]
};

const stateCases = Array.from({ length: 10 }, (_, index) => ({
  avatar: {
    position: { x: 0.1 + index * 1.48, y: 1.65 + (index % 3) * 0.18 },
    velocity: { x: index % 2 ? 2.4 : -0.8, y: index % 4 === 0 ? 4.8 : -1.2 },
    size: { x: 0.48, y: 0.78 },
    grounded: index % 2 === 0,
    mode: index === 8 ? "fallen" : "alive"
  },
  level,
  objects: {
    collectedValue: Math.min(4, index % 5),
    collectedIds: level.collectibles.slice(0, Math.min(4, index % 5)).map((coin) => coin.id)
  },
  comfort: { warnings: index === 7 ? ["head-drift"] : [] },
  input: { moveAxis: index % 3 === 0 ? -1 : index % 3 === 1 ? 0 : 1, jumpPressed: index % 4 === 0 },
  time: index * 0.37
}));

assert.equal(VR_BOARD_COMPANION_RESCUE_READINESS_DOMAIN_TREE.root, "vr-board-companion-rescue-readiness-domain");
assert.ok(VR_BOARD_COMPANION_RESCUE_READINESS_DOMAIN_TREE.contract.includes("no DOM"));
assert.ok(JSON.stringify(VR_BOARD_COMPANION_RESCUE_READINESS_DOMAIN_TREE).includes("memory-shard-trail-domain"));
assert.ok(JSON.stringify(VR_BOARD_COMPANION_RESCUE_READINESS_DOMAIN_TREE).includes("guardian-bridge-domain"));
assert.ok(JSON.stringify(VR_BOARD_COMPANION_RESCUE_READINESS_DOMAIN_TREE).includes("checkpoint-sanctuary-domain"));
assert.ok(JSON.stringify(VR_BOARD_COMPANION_RESCUE_READINESS_DOMAIN_TREE).includes("portal-bloom-domain"));

const lostCompanionBeaconKit = createVrBoardLostCompanionBeaconKit();
const memoryShardTrailKit = createVrBoardMemoryShardTrailKit();
const escortLaneRibbonKit = createVrBoardEscortLaneRibbonKit();
const guardianBridgeRibbonKit = createVrBoardGuardianBridgeRibbonKit();
const rescueNetAnchorKit = createVrBoardRescueNetAnchorKit();
const shieldBubbleTimingKit = createVrBoardShieldBubbleTimingKit();
const checkpointSanctuarySignalKit = createVrBoardCheckpointSanctuarySignalKit();
const medalCacheSignalKit = createVrBoardMedalCacheSignalKit();
const exitStretcherCommitKit = createVrBoardExitStretcherCommitKit();
const exitPortalBloomKit = createVrBoardExitPortalBloomKit();
const domainKit = createVrBoardCompanionRescueReadinessDomainKit();

for (const [index, stateCase] of stateCases.entries()) {
  const lostBeacons = lostCompanionBeaconKit.describe(stateCase);
  assert.ok(Array.isArray(lostBeacons));
  assert.ok(lostBeacons.every((beacon) => beacon.kind === "lost-companion-beacon"));
  assert.ok(lostBeacons.every((beacon) => beacon.rendererContract.rendererMustNotOwn.includes("frame loop")));

  const memoryShards = memoryShardTrailKit.describe(stateCase);
  assert.equal(memoryShards.length, level.collectibles.length, `memory shards for case ${index}`);
  assert.ok(memoryShards.every((shard) => shard.kind === "lost-companion-beacon"));
  assert.ok(memoryShards.every((shard) => shard.shard === true));

  const escortRibbons = escortLaneRibbonKit.describe(stateCase);
  assert.ok(escortRibbons.length >= 1, `escort ribbons for case ${index}`);
  assert.ok(escortRibbons.every((ribbon) => ribbon.kind === "escort-lane-ribbon"));

  const guardianBridges = guardianBridgeRibbonKit.describe(stateCase);
  assert.equal(guardianBridges.length, level.platforms.length - 1);
  assert.ok(guardianBridges.every((bridge) => bridge.kind === "escort-lane-ribbon"));
  assert.ok(guardianBridges.every((bridge) => bridge.bridge === true));

  const rescueAnchors = rescueNetAnchorKit.describe(stateCase);
  assert.equal(rescueAnchors.length, level.hazards.length);
  assert.ok(rescueAnchors.every((anchor) => anchor.tension >= 0 && anchor.tension <= 1));

  const shieldWindows = shieldBubbleTimingKit.describe(stateCase);
  assert.equal(shieldWindows.length, level.hazards.length);
  assert.ok(shieldWindows.every((window) => window.readiness >= 0 && window.readiness <= 1));

  const sanctuarySignals = checkpointSanctuarySignalKit.describe(stateCase);
  assert.equal(sanctuarySignals.length, level.platforms.length);
  assert.ok(sanctuarySignals.every((signal) => signal.sanctuary === true));

  const medalSignals = medalCacheSignalKit.describe(stateCase);
  assert.equal(medalSignals.length, level.collectibles.length);
  assert.ok(medalSignals.some((signal) => signal.kind === "medal-cache-signal"));

  const exitCommit = exitStretcherCommitKit.describe(stateCase);
  assert.equal(exitCommit.kind, "exit-stretcher-commit");
  assert.ok(exitCommit.readiness >= 0 && exitCommit.readiness <= 1);

  const exitPortalBloom = exitPortalBloomKit.describe(stateCase);
  assert.equal(exitPortalBloom.kind, "exit-portal-bloom");
  assert.ok(exitPortalBloom.bloom >= 0 && exitPortalBloom.bloom <= 1);

  const descriptor = domainKit.describe(stateCase);
  assert.equal(descriptor.id, "vr-board-companion-rescue-readiness-domain");
  assert.equal(descriptor.rendererHandoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(descriptor.rendererHandoff.counts.baseLostCompanionBeacons, lostBeacons.length);
  assert.equal(descriptor.rendererHandoff.counts.memoryShardBeacons, memoryShards.length);
  assert.equal(descriptor.rendererHandoff.counts.lostCompanionBeacons, lostBeacons.length + memoryShards.length);
  assert.equal(descriptor.rendererHandoff.counts.baseEscortLaneRibbons, escortRibbons.length);
  assert.equal(descriptor.rendererHandoff.counts.guardianBridgeRibbons, guardianBridges.length);
  assert.equal(descriptor.rendererHandoff.counts.escortLaneRibbons, escortRibbons.length + guardianBridges.length);
  assert.equal(descriptor.rendererHandoff.counts.rescueNetAnchors, rescueAnchors.length);
  assert.equal(descriptor.rendererHandoff.counts.shieldBubbleWindows, shieldWindows.length);
  assert.equal(descriptor.rendererHandoff.counts.checkpointSanctuarySignals, sanctuarySignals.length);
  assert.equal(descriptor.rendererHandoff.counts.baseMedalCacheSignals, medalSignals.length);
  assert.equal(descriptor.rendererHandoff.counts.medalCacheSignals, medalSignals.length + sanctuarySignals.length);
  assert.equal(descriptor.rendererHandoff.counts.exitPortalBlooms, 1);
  assert.equal(descriptor.rendererHandoff.counts.exitStretcherCommits, 1);
  assert.doesNotThrow(() => JSON.stringify(descriptor));
  assert.ok(!JSON.stringify(descriptor).includes("document.querySelector"));
  assert.ok(!JSON.stringify(descriptor).includes("requestAnimationFrame"));
}

console.log("vr board companion rescue guardian bridge readiness kits smoke passed: 10 intake cases");
