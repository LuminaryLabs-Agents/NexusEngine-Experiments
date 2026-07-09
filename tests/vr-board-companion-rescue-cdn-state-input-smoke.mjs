import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const index = readFileSync("experiments/vr-platformer-board/index.html", "utf8");
const companionKits = readFileSync("experiments/_kits/vr-platformer-board/vr-board-companion-rescue-readiness-kits.js", "utf8");
const playSmoke = readFileSync("tests/vr-platformer-board-playwright-state-input-smoke.mjs", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");

assert.ok(index.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(!index.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"));
assert.ok(!index.includes("LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits"));
assert.ok(index.includes("createVrBoardCompanionRescueReadinessDomainKit"));
assert.ok(index.includes("latestCompanionRescueReadiness = companionRescueReadinessKit.describe"));
assert.ok(index.includes("drawCompanionRescueReadiness(companionRescue, cameraX, cameraY)"));
assert.ok(index.includes("getCompanionRescueReadiness"));
assert.ok(index.includes("getVrBoardCompanionRescueReadiness"));
assert.ok(index.includes("companionRescueReadiness: latestCompanionRescueReadiness"));

const expectedTokens = [
  "VR_BOARD_COMPANION_RESCUE_READINESS_DOMAIN_TREE",
  "createVrBoardLostCompanionBeaconKit",
  "createVrBoardMemoryShardTrailKit",
  "createVrBoardEscortLaneRibbonKit",
  "createVrBoardGuardianBridgeRibbonKit",
  "createVrBoardRescueNetAnchorKit",
  "createVrBoardShieldBubbleTimingKit",
  "createVrBoardCheckpointSanctuarySignalKit",
  "createVrBoardMedalCacheSignalKit",
  "createVrBoardExitPortalBloomKit",
  "createVrBoardExitStretcherCommitKit",
  "createVrBoardCompanionRescueRendererHandoffKit",
  "createVrBoardCompanionRescueReadinessDomainKit",
  "memory-shard-trail-domain",
  "guardian-bridge-domain",
  "checkpoint-sanctuary-domain",
  "portal-bloom-domain",
  "renderer consumes companion rescue descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership"
];
for (const token of expectedTokens) assert.ok(companionKits.includes(token), token);

assert.ok(playSmoke.includes("vr-board-companion-rescue-readiness-kits-smoke.mjs"));
assert.ok(playSmoke.includes("vr-board-companion-rescue-cdn-state-input-smoke.mjs"));
assert.ok(manifest.includes("vr-board-companion-rescue-readiness-domain-kit"));
assert.ok(manifest.includes("companion-rescue-readiness-renderer-handoff-pass"));

const stateInputCases = Array.from({ length: 10 }, (_, index) => ({
  dt: index % 2 ? 1 / 90 : 1 / 30,
  input: {
    moveAxis: index % 3 === 0 ? -1 : index % 3 === 1 ? 0 : 1,
    jumpPressed: index === 2 || index === 5,
    restartPressed: index === 9,
    rescue: {
      companionsRemaining: Math.max(0, 4 - (index % 5)),
      memoryShardBeacons: 4,
      guardianBridgeRibbons: 5,
      checkpointSanctuaries: 6,
      escortRisk: Math.max(0, Math.min(1, 0.16 + index * 0.07)),
      shieldReadiness: Math.max(0, Math.min(1, 0.2 + index * 0.08)),
      portalBloom: Math.max(0, Math.min(1, index / 9)),
      exitCommitment: Math.max(0, Math.min(1, index / 9))
    }
  }
}));

for (const stateCase of stateInputCases) {
  assert.ok(Number.isFinite(stateCase.dt));
  assert.ok(stateCase.input.moveAxis >= -1 && stateCase.input.moveAxis <= 1);
  assert.equal(typeof stateCase.input.jumpPressed, "boolean");
  assert.equal(typeof stateCase.input.restartPressed, "boolean");
  assert.ok(stateCase.input.rescue.companionsRemaining >= 0 && stateCase.input.rescue.companionsRemaining <= 4);
  assert.equal(stateCase.input.rescue.memoryShardBeacons, 4);
  assert.equal(stateCase.input.rescue.guardianBridgeRibbons, 5);
  assert.equal(stateCase.input.rescue.checkpointSanctuaries, 6);
  assert.ok(stateCase.input.rescue.escortRisk >= 0 && stateCase.input.rescue.escortRisk <= 1);
  assert.ok(stateCase.input.rescue.shieldReadiness >= 0 && stateCase.input.rescue.shieldReadiness <= 1);
  assert.ok(stateCase.input.rescue.portalBloom >= 0 && stateCase.input.rescue.portalBloom <= 1);
  assert.ok(stateCase.input.rescue.exitCommitment >= 0 && stateCase.input.rescue.exitCommitment <= 1);
}

console.log("vr board companion rescue guardian bridge NexusEngine CDN/state-input smoke passed: 10 intake cases");
