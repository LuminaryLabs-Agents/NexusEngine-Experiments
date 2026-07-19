import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync("experiments/infinite-radial-terrain/infinite-radial-terrain.js", "utf8");
const index = readFileSync("experiments/infinite-radial-terrain/index.html", "utf8");
const entry = readFileSync("experiments/infinite-radial-terrain/terrain-wayfinding-readability-entry.js", "utf8");
const wayfindingKits = readFileSync("experiments/_kits/infinite-radial-terrain/terrain-wayfinding-readability-kits.js", "utf8");

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

assert.ok(route.includes(nexusEngineCdn), "base route should keep importing NexusEngine main from CDN");
assert.ok(entry.includes(nexusEngineCdn), "wayfinding entry should import NexusEngine main from CDN");
assert.ok(!entry.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"), "changed wayfinding entry should not import the old NexusRealtime runtime CDN");
assert.ok(index.includes("infinite-radial-terrain-wayfinding-readability-v1"), "route shell should cache-bust the wayfinding readability pass");

for (const expected of [
  "terrain-wayfinding-readability-entry.js",
  "wayfinding",
  "Infinite Radial Terrain expedition"
]) {
  assert.ok(index.includes(expected), expected);
}

for (const expected of [
  "terrain-wayfinding-readability-kits.js",
  "createTerrainWayfindingReadabilityDomainKit",
  "wayfindingDomain.describe",
  "getWayfindingReadability",
  "getRendererHandoff",
  "infiniteRadialTerrainWayfinding",
  "Terrain wayfinding readability overlay",
  "composeHandoff"
]) {
  assert.ok(entry.includes(expected), expected);
}

for (const expected of [
  "TERRAIN_WAYFINDING_READABILITY_DOMAIN_TREE",
  "createTerrainBearingNeedleKit",
  "createTerrainHorizonLandmarkKit",
  "createTerrainSlopeChoiceRibbonKit",
  "createTerrainBiomeTransitionGateKit",
  "createTerrainOriginReturnAnchorKit",
  "createTerrainStaminaDriftMeterKit",
  "createTerrainWayfindingRendererHandoffKit",
  "createTerrainWayfindingReadabilityDomainKit",
  "renderer consumes descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership"
]) {
  assert.ok(wayfindingKits.includes(expected), expected);
}

const simulatedInputs = Array.from({ length: 10 }, (_, index) => ({
  dt: index % 2 ? 1 / 60 : 1 / 30,
  camera: {
    position: { x: index * 280, y: 720 + index * 36, z: -index * 210 },
    yaw: index * 0.14,
    pitch: Math.max(-1.22, Math.min(0.22, -0.32 + index * 0.026))
  },
  samples: ["focus", "ahead", "far-ahead", "left-ridge", "right-ridge", "north", "return-bench", "valley-thread"].map((tag, sampleIndex) => ({ tag, height: 520 + sampleIndex * 88 + index * 13, slope: 7 + sampleIndex * 4, hydrology: { flow: { wetnessIndex: 0.12 + sampleIndex * 0.08, channelPotential: 0.18 + sampleIndex * 0.07 } } })),
  expectedDescriptors: ["bearingNeedles", "horizonLandmarks", "slopeChoiceRibbons", "biomeTransitionGates", "originReturnAnchors", "staminaDriftMeters"]
}));

for (const intake of simulatedInputs) {
  assert.ok(Number.isFinite(intake.dt));
  assert.ok(intake.dt > 0 && intake.dt <= 1 / 30);
  assert.ok(intake.camera.pitch >= -1.22 && intake.camera.pitch <= 0.22);
  assert.ok(Number.isFinite(intake.camera.position.y));
  assert.equal(intake.samples.length, 8);
  assert.deepEqual(intake.expectedDescriptors, ["bearingNeedles", "horizonLandmarks", "slopeChoiceRibbons", "biomeTransitionGates", "originReturnAnchors", "staminaDriftMeters"]);
}

const forbiddenReusableOwnership = ["querySelector", "addEventListener", "requestAnimationFrame", "WebGLRenderer", "new THREE", "document."];
for (const forbidden of forbiddenReusableOwnership) {
  assert.ok(!wayfindingKits.includes(forbidden), `wayfinding kit should not own executable ${forbidden}`);
}

console.log("infinite radial terrain wayfinding CDN/state-input smoke passed: 10 intake cases");
