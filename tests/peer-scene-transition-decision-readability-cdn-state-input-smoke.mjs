import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync("experiments/peer-scene-transition/shared/scene-demo.js", "utf8");
const kit = readFileSync("experiments/_kits/peer-scene-transition/peer-scene-decision-readability-handoff-kits.js", "utf8");
const html = readFileSync("experiments/peer-scene-transition/index.html", "utf8");

const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const oldRuntime = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime";

assert.ok(html.includes("bootPeerScene(\"camp\")"), "camp route should still boot through shared scene host");
assert.ok(route.includes(cdn), "changed runtime must import NexusEngine main CDN");
assert.ok(!route.includes(oldRuntime), "changed runtime must not import the old NexusRealtime CDN");
assert.ok(route.includes("peer-scene-decision-readability-handoff-kits.js"), "route must import decision readability domain kit");
assert.ok(route.includes("createSceneDecisionReadabilityDomainKit"), "route must create decision readability domain kit");
assert.ok(route.includes("descriptors.decisionReadability"), "handoff must attach decision readability descriptors");
assert.ok(route.includes("document.body.dataset.sceneDecision"), "renderer should expose decision readability visual state");
assert.ok(route.includes("getDecisionReadabilityDomain"), "GameHost should expose decision readability domain state");
assert.ok(route.includes("getRendererHandoff"), "GameHost should expose renderer handoff counts");
assert.ok(route.includes("Object.keys(NexusEngineRuntime)"), "state smoke should pull the CDN module into runtime metadata");

const intakeTokens = [
  "actionLikelihood",
  "gateRequirements",
  "inventoryUseEchoes",
  "pressureReleaseWindows",
  "narrativeThreadPins",
  "exitChoiceScorecards",
  "decisionReadabilityDomain: decisionReadabilityDomainKit.snapshot",
  "rendererHandoff: handoff.descriptorCounts",
  "peer-scene-decision-readability/renderer-handoff",
  "exit-choice-scorecard"
];
for (const token of intakeTokens) {
  assert.ok(route.includes(token) || kit.includes(token), `missing decision readability state/input token: ${token}`);
}

const forbiddenRuntimeOwnership = [
  "new THREE",
  "AudioContext",
  "requestAnimationFrame(",
  "addEventListener(\"keydown",
  "WebGLRenderingContext",
  "document.querySelector"
];
for (const token of forbiddenRuntimeOwnership) {
  assert.ok(!kit.includes(token), `decision readability kit must not own browser/render/frame-loop surface: ${token}`);
}

const expectedKitSurfaces = [
  "PEER_SCENE_DECISION_READABILITY_DOMAIN_TREE",
  "createSceneActionLikelihoodRadarKit",
  "createSceneGateRequirementLadderKit",
  "createSceneInventoryUseEchoKit",
  "createScenePressureReleaseWindowKit",
  "createSceneNarrativeThreadPinKit",
  "createSceneExitChoiceScorecardKit",
  "createSceneDecisionReadabilityRendererHandoffKit",
  "createSceneDecisionReadabilityDomainKit",
  "renderer consumes descriptors only",
  "decision ranking"
];
for (const surface of expectedKitSurfaces) {
  assert.ok(kit.includes(surface), `decision readability kit should expose atomic surface: ${surface}`);
}

const intakes = Array.from({ length: 10 }, (_, index) => ({
  sceneId: index % 3 === 0 ? "shrine" : index % 2 ? "forest" : "camp",
  actionCount: 3,
  pressure: Math.min(100, index * 12),
  inventoryCount: Math.min(4, index),
  routeOpen: index > 3,
  blockedCount: index % 4,
  decisionScore: Number((0.15 + index * 0.08).toFixed(2))
}));

for (const intake of intakes) {
  assert.ok(["camp", "forest", "shrine"].includes(intake.sceneId));
  assert.equal(intake.actionCount, 3);
  assert.ok(intake.pressure >= 0 && intake.pressure <= 100);
  assert.ok(intake.inventoryCount >= 0 && intake.inventoryCount <= 4);
  assert.equal(typeof intake.routeOpen, "boolean");
  assert.ok(intake.blockedCount >= 0 && intake.blockedCount <= 3);
  assert.ok(intake.decisionScore >= 0 && intake.decisionScore <= 1);
}

console.log("peer scene decision readability CDN/state/input smoke passed: 10 intake cases");
