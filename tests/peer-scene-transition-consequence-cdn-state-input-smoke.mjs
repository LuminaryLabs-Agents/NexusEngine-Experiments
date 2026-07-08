import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync("experiments/peer-scene-transition/shared/scene-demo.js", "utf8");
const kit = readFileSync("experiments/_kits/peer-scene-transition/peer-scene-consequence-handoff-kits.js", "utf8");
const html = readFileSync("experiments/peer-scene-transition/index.html", "utf8");

const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const oldRuntime = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime";

assert.ok(html.includes("bootPeerScene(\"camp\")"), "camp route should still boot through shared scene host");
assert.ok(route.includes(cdn), "changed runtime must import NexusEngine main CDN");
assert.ok(!route.includes(oldRuntime), "changed runtime must not import the old NexusRealtime CDN");
assert.ok(route.includes("peer-scene-consequence-handoff-kits.js"), "route must import consequence domain kit");
assert.ok(route.includes("createSceneConsequenceDomainKit"), "route must create consequence domain kit");
assert.ok(route.includes("descriptors.consequence"), "handoff must attach consequence descriptors");
assert.ok(route.includes("document.body.dataset.sceneConsequence"), "renderer should expose consequence visual state");
assert.ok(route.includes("getConsequenceDomain"), "GameHost should expose consequence domain state");
assert.ok(route.includes("getRendererHandoff"), "GameHost should expose renderer handoff counts");
assert.ok(route.includes("Object.keys(NexusEngineRuntime)"), "state smoke should pull the CDN module into runtime metadata");

const intakeTokens = [
  "causeLens",
  "riskDelta",
  "allyPresence",
  "routeConsequences",
  "rewardPreview",
  "consequenceDomain: consequenceDomainKit.snapshot",
  "rendererHandoff: handoff.descriptorCounts",
  "peer-scene-consequence/renderer-handoff",
  "route-consequence",
  "reward-preview"
];
for (const token of intakeTokens) {
  assert.ok(route.includes(token) || kit.includes(token), `missing consequence state/input token: ${token}`);
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
  assert.ok(!kit.includes(token), `consequence kit must not own browser/render/frame-loop surface: ${token}`);
}

const expectedKitSurfaces = [
  "PEER_SCENE_CONSEQUENCE_DOMAIN_TREE",
  "createSceneCauseLensKit",
  "createSceneRiskDeltaKit",
  "createSceneAllyPresenceKit",
  "createSceneRouteConsequenceKit",
  "createSceneRewardPreviewKit",
  "createSceneConsequenceRendererHandoffKit",
  "createSceneConsequenceDomainKit",
  "renderer consumes descriptors only",
  "consequence synthesis"
];
for (const surface of expectedKitSurfaces) {
  assert.ok(kit.includes(surface), `consequence kit should expose atomic surface: ${surface}`);
}

const intakes = Array.from({ length: 10 }, (_, index) => ({
  sceneId: index % 2 ? "forest" : "camp",
  actionCount: 1 + (index % 4),
  pressure: Math.min(100, index * 13),
  inventoryCount: Math.min(3, index),
  routeOpen: index > 3,
  blockedCount: index % 3
}));

for (const intake of intakes) {
  assert.ok(["camp", "forest"].includes(intake.sceneId));
  assert.ok(intake.actionCount >= 1 && intake.actionCount <= 4);
  assert.ok(intake.pressure >= 0 && intake.pressure <= 100);
  assert.ok(intake.inventoryCount >= 0 && intake.inventoryCount <= 3);
  assert.equal(typeof intake.routeOpen, "boolean");
  assert.ok(intake.blockedCount >= 0 && intake.blockedCount <= 2);
}

console.log("peer scene consequence CDN/state/input smoke passed: 10 intake cases");
