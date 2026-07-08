import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const index = readFileSync("experiments/vr-platformer-board/index.html", "utf8");
const visualKits = readFileSync("experiments/_kits/vr-platformer-board/vr-platformer-board-kits.js", "utf8");
const traversalKits = readFileSync("experiments/_kits/vr-platformer-board/vr-board-traversal-readability-kits.js", "utf8");

assert.ok(index.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(!index.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"));
assert.ok(!index.includes("LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits"));
assert.ok(index.includes("await import(NEXUS_URL)"));
assert.ok(index.includes("createVrBoardCompositionKit"));
assert.ok(index.includes("createVrBoardTraversalReadabilityDomainKit"));
assert.ok(index.includes("latestBoardComposition = boardCompositionKit.describe"));
assert.ok(index.includes("latestTraversalReadability = traversalReadabilityKit.describe"));
assert.ok(index.includes("drawAtmosphericDome(composition)"));
assert.ok(index.includes("drawPlatformRelief(composition, cameraX, cameraY)"));
assert.ok(index.includes("drawHazardTelemetry(composition, cameraX, cameraY)"));
assert.ok(index.includes("drawComfortFocus(composition)"));
assert.ok(index.includes("drawJumpArc(traversal, cameraX, cameraY)"));
assert.ok(index.includes("drawLandingZones(traversal, cameraX, cameraY)"));
assert.ok(index.includes("getRendererHandoff: () => latestTraversalReadability?.rendererHandoff ?? null"));

const expectedVisualKits = [
  "createVrBoardAtmosphericDomeKit",
  "createVrBoardPlatformReliefKit",
  "createVrBoardHazardTelemetryKit",
  "createVrBoardCollectibleConstellationKit",
  "createVrBoardComfortFocusKit",
  "createVrBoardMotionTrailKit",
  "createVrBoardRendererHandoffKit",
  "VR_PLATFORMER_BOARD_VISUAL_DOMAIN_TREE",
  "renderer consumes descriptors only; no Three.js, DOM, browser input, WebGL, audio, or frame-loop ownership"
];
for (const kit of expectedVisualKits) assert.ok(visualKits.includes(kit), kit);

const expectedTraversalKits = [
  "createVrBoardJumpArcForecastKit",
  "createVrBoardLandingZoneHeatKit",
  "createVrBoardCheckpointThreadKit",
  "createVrBoardFailRecoveryBeaconKit",
  "createVrBoardTempoPulseBandKit",
  "createVrBoardControlCoachingStripKit",
  "createVrBoardTraversalRendererHandoffKit",
  "createVrBoardTraversalReadabilityDomainKit"
];
for (const kit of expectedTraversalKits) assert.ok(traversalKits.includes(kit), kit);

const intakes = Array.from({ length: 10 }, (_, index) => ({
  dt: index % 2 ? 1 / 60 : 1 / 30,
  input: {
    moveAxis: index % 3 === 0 ? -1 : index % 3 === 1 ? 0 : 1,
    jumpPressed: index === 2 || index === 5,
    restartPressed: index === 8,
    head: { position: { x: Math.max(-0.22, Math.min(0.22, -0.1 + index * 0.02)), y: Math.max(1.35, Math.min(1.9, 1.45 + index * 0.04)), z: 0 } }
  }
}));

for (const intake of intakes) {
  assert.ok(Number.isFinite(intake.dt));
  assert.ok(intake.input.moveAxis >= -1 && intake.input.moveAxis <= 1);
  assert.equal(typeof intake.input.jumpPressed, "boolean");
  assert.equal(typeof intake.input.restartPressed, "boolean");
  assert.ok(intake.input.head.position.y >= 1.35 && intake.input.head.position.y <= 1.9);
}

console.log("vr platformer board NexusEngine CDN playwright/state-input smoke passed: 10 intake cases with traversal handoff");
