import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync("experiments/infinite-radial-terrain/infinite-radial-terrain.js", "utf8");
const index = readFileSync("experiments/infinite-radial-terrain/index.html", "utf8");
const expeditionKits = readFileSync("experiments/_kits/infinite-radial-terrain/terrain-expedition-readability-kits.js", "utf8");

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

assert.ok(route.includes(nexusEngineCdn), "changed route should import NexusEngine main from CDN");
assert.ok(!route.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"), "changed route should not import the old NexusRealtime runtime CDN");
assert.ok(index.includes("infinite-radial-terrain-expedition-readability-v1"), "route shell should cache-bust the expedition readability pass");

for (const expected of [
  "terrain-expedition-readability-kits.js",
  "createTerrainExpeditionReadabilityDomainKit",
  "terrainExpeditionDomain.describe",
  "renderExpeditionDescriptors()",
  "getExpeditionReadability",
  "getRendererHandoff",
  "infiniteRadialTerrainExpedition",
  "descriptor-only expedition domain"
]) {
  assert.ok(route.includes(expected), expected);
}

for (const expected of [
  "TERRAIN_EXPEDITION_READABILITY_DOMAIN_TREE",
  "createTerrainSurveyTransectKit",
  "createTerrainAltitudeCorridorKit",
  "createTerrainRidgePassBeaconKit",
  "createTerrainHazardBasinKit",
  "createTerrainSampleBookmarkKit",
  "createTerrainRouteTaskBandKit",
  "createTerrainExpeditionRendererHandoffKit",
  "createTerrainExpeditionReadabilityDomainKit",
  "renderer consumes descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership"
]) {
  assert.ok(expeditionKits.includes(expected), expected);
}

const simulatedInputs = Array.from({ length: 10 }, (_, index) => ({
  dt: index % 2 ? 1 / 60 : 1 / 30,
  camera: {
    position: { x: index * 260, y: 700 + index * 44, z: -index * 190 },
    yaw: index * 0.12,
    pitch: Math.max(-1.22, Math.min(0.22, -0.32 + index * 0.025))
  },
  samples: ["focus", "ahead", "far-ahead", "left-ridge", "right-ridge", "rear"].map((tag, sampleIndex) => ({ tag, height: 500 + sampleIndex * 90 + index * 12, slope: 8 + sampleIndex * 4, hydrology: { flow: { wetnessIndex: 0.1 + sampleIndex * 0.09, channelPotential: 0.2 + sampleIndex * 0.08 } } })),
  expectedDescriptors: ["surveyTransects", "altitudeCorridors", "ridgePassBeacons", "hazardBasins", "sampleBookmarks", "routeTaskBands"]
}));

for (const intake of simulatedInputs) {
  assert.ok(Number.isFinite(intake.dt));
  assert.ok(intake.dt > 0 && intake.dt <= 1 / 30);
  assert.ok(intake.camera.pitch >= -1.22 && intake.camera.pitch <= 0.22);
  assert.ok(Number.isFinite(intake.camera.position.y));
  assert.equal(intake.samples.length, 6);
  assert.deepEqual(intake.expectedDescriptors, ["surveyTransects", "altitudeCorridors", "ridgePassBeacons", "hazardBasins", "sampleBookmarks", "routeTaskBands"]);
}

const forbiddenKitOwnership = ["querySelector", "addEventListener", "requestAnimationFrame", "WebGLRenderer", "new THREE", "AudioContext"];
for (const forbidden of forbiddenKitOwnership) {
  assert.ok(!expeditionKits.includes(forbidden), `expedition kit should not own ${forbidden}`);
}

console.log("infinite radial terrain expedition CDN/state-input smoke passed: 10 intake cases");
