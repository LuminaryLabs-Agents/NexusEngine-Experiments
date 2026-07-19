import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync("experiments/peer-scene-transition/shared/scene-demo.js", "utf8");
const kit = readFileSync("experiments/_kits/peer-scene-transition/peer-scene-chronicle-handoff-kits.js", "utf8");
const html = readFileSync("experiments/peer-scene-transition/index.html", "utf8");

const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const oldRuntime = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime";
const intakeTokens = [
  "createSceneChronicleDomainKit",
  "chronicleDomainKit.describe",
  "descriptors.chronicle",
  "objectiveBeats",
  "clueThreads",
  "inventoryStars",
  "pressureWeather",
  "continuitySplices",
  "choiceReadability",
  "getChronicleDomain"
];

assert.ok(html.includes("bootPeerScene(\"camp\")"), "camp route must still boot through the shared peer scene host");
assert.ok(route.includes(cdn), "changed runtime must import NexusEngine main CDN");
assert.ok(!route.includes(oldRuntime), "changed runtime must not import the old NexusRealtime CDN");
assert.ok(route.includes("peer-scene-chronicle-handoff-kits.js"), "runtime must import the chronicle domain kit");
assert.ok(route.includes("const KEY = \"nexus.peerSceneTransition.v6\""), "state key should preserve the current peer-scene handoff shape");
assert.ok(route.includes("document.body.dataset.sceneChronicle"), "route should expose chronicle visual state to presentation only");
assert.ok(route.includes("globalThis.GameHost"), "route should expose GameHost smoke surface");
assert.ok(route.includes("getRendererHandoff"), "GameHost should expose renderer handoff counts");
assert.ok(route.includes("getChronicleDomain"), "GameHost should expose chronicle domain state");
assert.ok(route.includes("Object.keys(NexusEngineRuntime)"), "state smoke should pull the CDN module into runtime metadata");

for (const token of intakeTokens) {
  assert.ok(route.includes(token), `route should contain state/input handoff token: ${token}`);
}

const forbiddenRuntimeOwnership = [
  "new THREE",
  "AudioContext",
  "requestAnimationFrame(",
  "addEventListener(\"keydown",
  "WebGLRenderingContext"
];
for (const token of forbiddenRuntimeOwnership) {
  assert.ok(!kit.includes(token), `chronicle kit must not own browser/render/frame-loop surface: ${token}`);
}

const kitSurfaceTokens = [
  "createSceneObjectiveBeatKit",
  "createSceneClueThreadKit",
  "createSceneInventoryConstellationKit",
  "createScenePressureWeatherKit",
  "createSceneContinuitySpliceKit",
  "createSceneChoiceReadabilityKit",
  "createSceneChronicleRendererHandoffKit",
  "createSceneChronicleDomainKit",
  "rendererMustNotOwn",
  "descriptor synthesis"
];
for (const token of kitSurfaceTokens) {
  assert.ok(kit.includes(token), `chronicle kit should expose atomic surface: ${token}`);
}

console.log("peer scene transition chronicle CDN/state/input smoke passed: 10 intake tokens");
