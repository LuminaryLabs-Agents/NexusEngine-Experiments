import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSceneBellArchiveEvacuationReadinessDomainKit } from "../experiments/_kits/peer-scene-transition/peer-scene-bell-archive-evacuation-kits.js";

const CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const entryPath = "experiments/peer-scene-transition/shared/scene-bell-archive-evacuation-readiness-entry.js";
const kitPath = "experiments/_kits/peer-scene-transition/peer-scene-bell-archive-evacuation-kits.js";
const routePaths = [
  "experiments/peer-scene-transition/index.html",
  "experiments/peer-scene-transition/crossroads.html",
  "experiments/peer-scene-transition/forest.html",
  "experiments/peer-scene-transition/bridge.html"
];

const entry = readFileSync(entryPath, "utf8");
const kitSource = readFileSync(kitPath, "utf8");
assert.ok(entry.includes(CDN), "changed entry imports NexusEngine main CDN");
assert.ok(!entry.includes("NexusRealtime@"), "changed entry avoids old NexusRealtime CDN import");
assert.ok(entry.includes("getSceneBellArchiveEvacuationReadiness"), "GameHost readiness accessor exposed");
assert.ok(entry.includes("getRendererHandoff"), "GameHost renderer handoff composed");
assert.ok(!/document\.|window\.|globalThis\.document|requestAnimationFrame|THREE|WebGL|AudioContext/.test(kitSource), "reusable kit stays renderer and DOM neutral");
assert.ok(kitSource.includes("renderer consumes descriptors only"), "kit declares descriptor-only renderer handoff");

for (const routePath of routePaths) {
  const route = readFileSync(routePath, "utf8");
  assert.ok(route.includes("bell-archive-evacuation-readiness-renderer-handoff-pass"), `${routePath} advertises route marker`);
  assert.ok(route.includes("scene-bell-archive-evacuation-readiness-entry.js"), `${routePath} loads entry script`);
}

const kit = createSceneBellArchiveEvacuationReadinessDomainKit();
const inputCases = [
  { sceneId: "camp", visited: ["camp"], inventory: [], pressure: 20 },
  { sceneId: "camp", visited: ["camp"], inventory: ["map clue"], pressure: 20 },
  { sceneId: "crossroads", visited: ["camp", "crossroads"], inventory: ["map clue"], pressure: 30 },
  { sceneId: "crossroads", visited: ["camp", "crossroads"], inventory: ["map clue", "rope"], pressure: 30 },
  { sceneId: "forest", visited: ["camp", "crossroads", "forest"], inventory: ["map clue", "rope", "witness"], pressure: 45 },
  { sceneId: "forest", visited: ["camp", "crossroads", "forest"], inventory: ["map clue", "rope", "witness", "plank"], pressure: 45 },
  { sceneId: "bridge", visited: ["camp", "crossroads", "forest", "bridge"], inventory: ["map clue", "rope", "witness", "plank"], pressure: 45 },
  { sceneId: "bridge", visited: ["camp", "crossroads", "forest", "bridge"], inventory: ["map clue", "rope", "witness", "plank", "oracle"], pressure: 20 },
  { sceneId: "bridge", visited: ["camp", "crossroads", "forest", "bridge"], inventory: ["map clue", "rope", "witness", "plank", "oracle", "keeper"], pressure: 10 },
  { sceneId: "bridge", visited: ["camp", "crossroads", "forest", "bridge"], inventory: ["map clue", "rope", "witness", "plank", "oracle", "keeper", "evidence"], pressure: 0 }
];

let last = 0;
for (const [index, state] of inputCases.entries()) {
  const readiness = kit.describe(state);
  assert.equal(readiness.rendererHandoff.policy, "renderer-consumes-descriptors-only", `case ${index} descriptor handoff`);
  assert.ok(readiness.rendererHandoff.counts.bellTowerAnchors === 4, `case ${index} bell anchors count`);
  assert.ok(readiness.readiness >= 0 && readiness.readiness <= 100, `case ${index} readiness bounds`);
  assert.ok(readiness.floodPressure >= 0 && readiness.floodPressure <= 100, `case ${index} pressure bounds`);
  if (index > 0 && state.pressure <= inputCases[index - 1].pressure) {
    assert.ok(readiness.readiness >= last || state.sceneId !== inputCases[index - 1].sceneId, `case ${index} readiness trend with same-or-lower pressure`);
  }
  last = readiness.readiness;
}

console.log("Peer scene bell archive evacuation CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
