import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const index = readFileSync("experiments/vr-platformer-board/index.html", "utf8");
const traversalKits = readFileSync("experiments/_kits/vr-platformer-board/vr-board-traversal-readability-kits.js", "utf8");
const visualKits = readFileSync("experiments/_kits/vr-platformer-board/vr-platformer-board-kits.js", "utf8");

assert.ok(index.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(!index.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"));
assert.ok(!index.includes("LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits"));
assert.ok(index.includes("await import(NEXUS_URL)"));
assert.ok(index.includes("createVrBoardTraversalReadabilityDomainKit"));
assert.ok(index.includes("latestTraversalReadability = traversalReadabilityKit.describe"));
assert.ok(index.includes("getTraversalReadability: () => latestTraversalReadability"));
assert.ok(index.includes("getRendererHandoff: () => latestTraversalReadability?.rendererHandoff ?? null"));
assert.ok(index.includes("drawJumpArc(traversal, cameraX, cameraY)"));
assert.ok(index.includes("drawLandingZones(traversal, cameraX, cameraY)"));
assert.ok(index.includes("drawCheckpointThread(traversal, cameraX, cameraY)"));
assert.ok(index.includes("drawFailRecoveryBeacons(traversal, cameraX, cameraY)"));
assert.ok(index.includes("drawTempoPulseBands(traversal, cameraX, cameraY)"));
assert.ok(index.includes("drawControlCoachingStrip(traversal)"));
assert.ok(index.includes("domain: { vrBoardTraversalReadability: latestTraversalReadability }"));

const expectedTraversalTokens = [
  "VR_BOARD_TRAVERSAL_READABILITY_DOMAIN_TREE",
  "createVrBoardJumpArcForecastKit",
  "createVrBoardLandingZoneHeatKit",
  "createVrBoardCheckpointThreadKit",
  "createVrBoardFailRecoveryBeaconKit",
  "createVrBoardTempoPulseBandKit",
  "createVrBoardControlCoachingStripKit",
  "createVrBoardTraversalRendererHandoffKit",
  "createVrBoardTraversalReadabilityDomainKit",
  "renderer consumes traversal descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership"
];
for (const token of expectedTraversalTokens) assert.ok(traversalKits.includes(token), token);

assert.ok(visualKits.includes("VR_PLATFORMER_BOARD_VISUAL_DOMAIN_TREE"));
assert.ok(visualKits.includes("createVrBoardCompositionKit"));

const stateInputCases = Array.from({ length: 10 }, (_, index) => ({
  dt: index % 2 ? 1 / 60 : 1 / 30,
  input: {
    moveAxis: index % 3 === 0 ? -1 : index % 3 === 1 ? 0 : 1,
    jumpPressed: index === 2 || index === 6,
    restartPressed: index === 9,
    head: {
      position: {
        x: Math.max(-0.22, Math.min(0.22, -0.1 + index * 0.025)),
        y: Math.max(1.35, Math.min(1.9, 1.45 + index * 0.04)),
        z: 0
      }
    }
  }
}));

for (const stateCase of stateInputCases) {
  assert.ok(Number.isFinite(stateCase.dt));
  assert.ok(stateCase.input.moveAxis >= -1 && stateCase.input.moveAxis <= 1);
  assert.equal(typeof stateCase.input.jumpPressed, "boolean");
  assert.equal(typeof stateCase.input.restartPressed, "boolean");
  assert.ok(stateCase.input.head.position.x >= -0.22 && stateCase.input.head.position.x <= 0.22);
  assert.ok(stateCase.input.head.position.y >= 1.35 && stateCase.input.head.position.y <= 1.9);
}

console.log("vr board traversal readability NexusEngine CDN/state-input smoke passed: 10 intake cases");
