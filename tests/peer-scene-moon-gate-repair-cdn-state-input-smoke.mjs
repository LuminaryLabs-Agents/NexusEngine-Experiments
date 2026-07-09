import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createPeerSceneMoonGateRepairDomainKit } from "../experiments/_kits/peer-scene-transition/peer-scene-moon-gate-repair-kits.js";

const CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const routeFiles = [
  "experiments/peer-scene-transition/index.html",
  "experiments/peer-scene-transition/crossroads.html",
  "experiments/peer-scene-transition/forest.html",
  "experiments/peer-scene-transition/bridge.html"
];

for (const routeFile of routeFiles) {
  const html = readFileSync(new URL(`../${routeFile}`, import.meta.url), "utf8");
  assert.ok(html.includes("moon-gate-repair-readiness-renderer-handoff-pass"), `${routeFile} has route pass marker`);
  assert.ok(html.includes("scene-moon-gate-repair-readiness-entry.js?v=moon-gate-repair-readiness-1"), `${routeFile} loads moon gate entry`);
}

const entry = readFileSync(new URL("../experiments/peer-scene-transition/shared/scene-moon-gate-repair-readiness-entry.js", import.meta.url), "utf8");
assert.ok(entry.includes(CDN));
assert.equal(entry.includes("NexusRealtime@"), false);
assert.ok(entry.includes("getPeerSceneMoonGateRepairReadiness"));
assert.ok(entry.includes("getRendererHandoff"));
assert.ok(entry.includes("moonGateRepairCounts"));

const kitSource = readFileSync(new URL("../experiments/_kits/peer-scene-transition/peer-scene-moon-gate-repair-kits.js", import.meta.url), "utf8");
for (const forbidden of ["document.", "window.", "requestAnimationFrame", "THREE", "WebGL", "Audio(", "fetch("]) {
  assert.equal(kitSource.includes(forbidden), false, `reusable kit source must not include ${forbidden}`);
}

const states = [
  { sceneId: "camp", visited: ["camp"], inventory: [], pressure: 0 },
  { sceneId: "crossroads", visited: ["camp", "crossroads"], inventory: ["map"], tokens: ["clue"], pressure: 11 },
  { sceneId: "forest", visited: ["camp", "crossroads", "forest"], inventory: ["lantern"], actions: ["forest-lit"], pressure: 22 },
  { sceneId: "bridge", visited: ["camp", "crossroads", "forest", "bridge"], inventory: ["rope"], tokens: ["bridge-plank"], pressure: 33 },
  { sceneId: "shrine", visited: ["camp", "crossroads", "forest", "bridge", "shrine"], inventory: ["lantern", "seal"], actions: ["ritual-oath"], pressure: 12 },
  { sceneId: "ending", visited: ["camp", "crossroads", "forest", "bridge", "shrine", "ending"], inventory: ["lantern", "seal", "rope", "map"], tokens: ["witness-echo", "moon-rune"], pressure: 1 },
  { currentScene: "bridge", visitedScenes: ["camp", "forest"], items: ["torch"], completedActions: ["oath-ribbon"], pressureScore: 44 },
  { currentSceneId: "forest", visitedSceneIds: ["camp", "crossroads"], routeTokens: ["memory-voice"], hazardPressure: 58 },
  { sceneId: "camp", flags: { oracle: true, witness: true }, messages: ["echo choir answered"], pressure: { score: 23 } },
  { sceneId: "shrine", visited: ["camp", "crossroads", "forest", "bridge", "shrine"], inventory: ["lantern", "seal", "rope", "map", "key"], actions: ["moon-gate-open", "ritual-oath"], pressure: 3 }
];

const domainKit = createPeerSceneMoonGateRepairDomainKit();
for (const state of states) {
  const readiness = domainKit.describe(state);
  assert.equal(readiness.rendererHandoff.passId, "moon-gate-repair-readiness-renderer-handoff-pass");
  assert.equal(readiness.rendererHandoff.flatDescriptors.length, 26);
  assert.equal(Object.keys(readiness.rendererHandoff.counts).length, 6);
  assert.ok(readiness.readiness >= 0 && readiness.readiness <= 100);
  assert.ok(readiness.fractureRisk >= 0 && readiness.fractureRisk <= 100);
  assert.ok(readiness.summary.readinessScore >= 0 && readiness.summary.readinessScore <= 1);
  assert.ok(readiness.summary.risk >= 0 && readiness.summary.risk <= 1);
}

console.log("Peer Scene moon gate repair CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
