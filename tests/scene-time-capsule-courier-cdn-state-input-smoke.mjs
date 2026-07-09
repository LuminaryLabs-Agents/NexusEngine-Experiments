import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSceneTimeCapsuleCourierReadinessDomainKit } from "../experiments/peer-scene-transition/shared/scene-time-capsule-courier-readiness-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const entryPath = "experiments/peer-scene-transition/shared/scene-time-capsule-courier-readiness-entry.js";
const kitPath = "experiments/peer-scene-transition/shared/scene-time-capsule-courier-readiness-kits.js";
const entry = readFileSync(entryPath, "utf8");
const kit = readFileSync(kitPath, "utf8");

assert.ok(entry.includes(NEXUS_ENGINE_CDN), "entry imports NexusEngine main CDN");
assert.ok(!entry.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"), "entry avoids old NexusRealtime runtime CDN");
assert.ok(entry.includes("getSceneTimeCapsuleCourierReadiness"), "entry exposes GameHost readiness accessor");
assert.ok(entry.includes("getRendererHandoff"), "entry composes renderer handoff");
assert.ok(entry.includes("scene-time-capsule-courier-overlay"), "entry exposes route overlay marker");
for (const forbidden of ["document.querySelector", "addEventListener", "requestAnimationFrame", "THREE.", "AudioContext", "WebGLRenderingContext"]) {
  assert.ok(!kit.includes(forbidden), `kit does not own ${forbidden}`);
}

const routeFiles = ["index.html", "crossroads.html", "forest.html", "bridge.html"];
for (const file of routeFiles) {
  const html = readFileSync(`experiments/peer-scene-transition/${file}`, "utf8");
  assert.ok(html.includes("scene-time-capsule-courier-readiness-entry.js?v=time-capsule-courier-readiness-1"), `${file} loads the time capsule courier pass`);
}

const domain = createSceneTimeCapsuleCourierReadinessDomainKit();
const cases = [
  { sceneId: "camp", state: { inventory: [], visited: ["camp"], progress: 0.05, pressure: 0.1 }, input: { action: "inspect" } },
  { sceneId: "camp", state: { inventory: ["has-lantern"], visited: ["camp"], progress: 0.19, pressure: 0.25 }, input: { action: "take-lantern" } },
  { sceneId: "crossroads", state: { inventory: ["has-lantern", "camp-photo"], visited: ["camp", "crossroads"], progress: 0.34, pressure: 0.35 }, input: { action: "choose-left" } },
  { sceneId: "forest", state: { inventory: ["has-lantern", "map-scrap"], visited: ["camp", "crossroads", "forest"], progress: 0.43, pressure: 0.5 }, input: { action: "listen" } },
  { sceneId: "bridge", state: { inventory: ["river-note"], visited: ["camp", "bridge"], progress: 0.5, pressure: 0.75 }, input: { action: "cross" } },
  { sceneId: "shrine", state: { inventory: ["has-lantern", "shrine-key"], visited: ["camp", "forest", "shrine"], progress: 0.68, pressure: 0.32 }, input: { action: "unlock" } },
  { sceneId: "ending", state: { inventory: ["has-lantern", "shrine-key", "archive-seal"], visited: ["camp", "crossroads", "forest", "bridge", "shrine", "ending"], progress: 0.92, pressure: 0.18 }, input: { action: "seal" } },
  { sceneId: "forest", state: { inventory: [], visited: ["forest"], progress: 0.12, pressure: 0.88, log: ["panic", "lost trail"] }, input: { action: "recover" } },
  { sceneId: "crossroads", state: { inventory: ["witness-oath"], visited: ["camp", "crossroads"], progress: 0.38, pressure: 0.58 }, input: { action: "pledge" } },
  { sceneId: "bridge", state: { inventory: ["has-lantern", "camp-photo", "map-scrap", "river-note"], visited: ["camp", "crossroads", "forest", "bridge"], progress: 0.72, pressure: 0.22 }, input: { action: "thread-courier" } }
];

for (const [index, testCase] of cases.entries()) {
  const described = domain.describe(testCase.sceneId, { ...testCase.state, actions: [testCase.input] });
  assert.equal(described.rendererHandoff.contract, "renderer-consumes-descriptors-only", `case ${index} descriptor-only handoff`);
  assert.ok(described.rendererHandoff.counts.keepsakeTags >= 3, `case ${index} keepsake tags`);
  assert.ok(described.rendererHandoff.counts.lanternCourierThreads >= 5, `case ${index} courier threads`);
  assert.ok(described.summary.readiness >= 0 && described.summary.readiness <= 1, `case ${index} readiness bounded`);
}

console.log("Peer Scene Transition time capsule courier CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
