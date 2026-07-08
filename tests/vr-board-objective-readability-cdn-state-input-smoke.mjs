import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const index = readFileSync("experiments/vr-platformer-board/index.html", "utf8");
const traversalKits = readFileSync("experiments/_kits/vr-platformer-board/vr-board-traversal-readability-kits.js", "utf8");
const objectiveKits = readFileSync("experiments/_kits/vr-platformer-board/vr-board-objective-readability-kits.js", "utf8");
const checks = readFileSync("scripts/run-checks.mjs", "utf8");

assert.ok(index.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(!index.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"));
assert.ok(index.includes("await import(NEXUS_URL)"));
assert.ok(index.includes("createVrBoardTraversalReadabilityDomainKit"));
assert.ok(index.includes("getRendererHandoff: () => latestTraversalReadability?.rendererHandoff ?? null"));

assert.ok(traversalKits.includes("./vr-board-objective-readability-kits.js"));
assert.ok(traversalKits.includes("VR_BOARD_OBJECTIVE_READABILITY_DOMAIN_TREE"));
assert.ok(traversalKits.includes("objectiveReadabilityDomainKit = createVrBoardObjectiveReadabilityDomainKit()"));
assert.ok(traversalKits.includes("mergeObjectiveCheckpointThread"));
assert.ok(traversalKits.includes("mergeObjectiveRecoveryBeacons"));
assert.ok(traversalKits.includes("mergeObjectiveTempoBands"));
assert.ok(traversalKits.includes("objectiveReadability: rendererHandoff.descriptors.objectiveReadability"));

const expectedObjectiveTokens = [
  "VR_BOARD_OBJECTIVE_READABILITY_DOMAIN_TREE",
  "createVrBoardCollectiblePriorityOrbitKit",
  "createVrBoardHazardApproachFunnelKit",
  "createVrBoardMomentumLaneKit",
  "createVrBoardExitReadinessGateKit",
  "createVrBoardHeadComfortCorridorKit",
  "createVrBoardRouteRiskScorecardKit",
  "createVrBoardObjectiveRendererHandoffKit",
  "createVrBoardObjectiveReadabilityDomainKit",
  "renderer consumes objective descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership"
];
for (const token of expectedObjectiveTokens) assert.ok(objectiveKits.includes(token), token);

assert.ok(checks.includes("tests/vr-board-objective-readability-kits-smoke.mjs"));
assert.ok(checks.includes("tests/vr-board-objective-readability-cdn-state-input-smoke.mjs"));

const stateInputCases = Array.from({ length: 10 }, (_, index) => ({
  dt: index % 2 ? 1 / 72 : 1 / 30,
  input: {
    moveAxis: index % 3 === 0 ? -1 : index % 3 === 1 ? 0 : 1,
    jumpPressed: index === 2 || index === 5,
    restartPressed: index === 9,
    collectedValue: index % 4,
    head: {
      position: {
        x: Math.max(-0.22, Math.min(0.22, -0.12 + index * 0.028)),
        y: Math.max(1.35, Math.min(1.9, 1.42 + index * 0.044)),
        z: 0
      }
    },
    objectiveRoute: {
      uncollectedCoins: Math.max(0, 4 - (index % 5)),
      hazardsAhead: index % 4,
      exitReadiness: Math.max(0, Math.min(1, index / 9))
    }
  }
}));

for (const stateCase of stateInputCases) {
  assert.ok(Number.isFinite(stateCase.dt));
  assert.ok(stateCase.input.moveAxis >= -1 && stateCase.input.moveAxis <= 1);
  assert.equal(typeof stateCase.input.jumpPressed, "boolean");
  assert.equal(typeof stateCase.input.restartPressed, "boolean");
  assert.ok(stateCase.input.collectedValue >= 0 && stateCase.input.collectedValue <= 3);
  assert.ok(stateCase.input.head.position.x >= -0.22 && stateCase.input.head.position.x <= 0.22);
  assert.ok(stateCase.input.head.position.y >= 1.35 && stateCase.input.head.position.y <= 1.9);
  assert.ok(stateCase.input.objectiveRoute.uncollectedCoins >= 0 && stateCase.input.objectiveRoute.uncollectedCoins <= 4);
  assert.ok(stateCase.input.objectiveRoute.hazardsAhead >= 0 && stateCase.input.objectiveRoute.hazardsAhead <= 3);
  assert.ok(stateCase.input.objectiveRoute.exitReadiness >= 0 && stateCase.input.objectiveRoute.exitReadiness <= 1);
}

console.log("vr board objective readability NexusEngine CDN/state-input smoke passed: 10 intake cases");
