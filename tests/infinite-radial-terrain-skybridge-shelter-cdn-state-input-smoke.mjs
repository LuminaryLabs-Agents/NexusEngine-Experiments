import assert from "node:assert/strict";
import fs from "node:fs";
import {
  createTerrainSkybridgeShelterReadinessDomainKit
} from "../experiments/_kits/infinite-radial-terrain/terrain-skybridge-shelter-readiness-kits.js";

const routeHtml = fs.readFileSync("experiments/infinite-radial-terrain/index.html", "utf8");
const entrySource = fs.readFileSync("experiments/infinite-radial-terrain/terrain-skybridge-shelter-readiness-entry.js", "utf8");
const kitSource = fs.readFileSync("experiments/_kits/infinite-radial-terrain/terrain-skybridge-shelter-readiness-kits.js", "utf8");

assert.ok(routeHtml.includes("skybridge-shelter-readiness-renderer-handoff-pass"), "route exposes skybridge shelter handoff marker");
assert.ok(routeHtml.includes("terrain-skybridge-shelter-readiness-entry.js?v=infinite-radial-terrain-skybridge-shelter-readiness-v1"), "route loads cache-busted skybridge entry");
assert.ok(entrySource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "entry imports NexusEngine main CDN");
assert.equal(entrySource.includes("LuminaryLabs-Dev/NexusRealtime@main"), false, "changed entry avoids old NexusRealtime CDN");
assert.ok(entrySource.includes("getInfiniteRadialTerrainSkybridgeShelterReadiness"), "GameHost exposes route-specific readiness accessor");
assert.ok(entrySource.includes("getRendererHandoff"), "GameHost renderer handoff is patched by composition");
assert.ok(entrySource.includes("document.body.dataset.terrainSkybridgeShelterReadiness"), "entry exposes Playwright-style body marker");
assert.equal(kitSource.includes("document."), false, "reusable kit avoids DOM ownership");
assert.equal(kitSource.includes("requestAnimationFrame"), false, "reusable kit avoids frame-loop ownership");
assert.equal(kitSource.includes("THREE"), false, "reusable kit avoids Three.js ownership");
assert.ok(kitSource.includes("renderer consumes terrain skybridge shelter descriptors only"), "kit declares descriptor-only contract");

function makeState(index) {
  const height = 900 + index * 125;
  const snow = Math.min(1, 0.2 + index * 0.06);
  return {
    frame: index * 80,
    input: { forward: index % 2 === 0, strafe: index % 3 === 0, ascend: index > 5 },
    camera: { position: [index * 240, 1360 + index * 90, -index * 310], yaw: index * 0.22, pitch: -0.3 },
    terrainSample: {
      tag: `state-focus-${index}`,
      x: index * 240,
      z: -index * 310,
      height,
      slope: 10 + index * 2.1,
      climate: { temperatureC: 5 - index, snowlineMeters: 940, vegetationPotential: 0.32 - snow * 0.1 },
      hydrology: { flow: { wetnessIndex: 0.14 + index * 0.025, channelPotential: 0.1 + index * 0.02 }, stream: { streamOrder: 1, drainageDensityKmPerKm2: 1.0 + index * 0.1 } },
      landform: { landform: index > 5 ? "ridge" : "bench", confidence: 0.5 + index * 0.035, terrainRuggedness: 0.26 + index * 0.055 },
      material: { materialWeights: { soil: 0.45, bedrock: 0.32 + index * 0.035, wetChannel: 0.1 + index * 0.015, snow }, vegetationMask: 0.22 }
    }
  };
}

const kit = createTerrainSkybridgeShelterReadinessDomainKit();
const states = Array.from({ length: 10 }, (_, index) => makeState(index));
const outcomes = states.map((state) => {
  const focus = state.terrainSample;
  const samples = [
    focus,
    { ...focus, tag: "north-anchor", x: focus.x + 820, z: focus.z - 360, height: focus.height + 520, slope: focus.slope + 7 },
    { ...focus, tag: "south-anchor", x: focus.x + 1260, z: focus.z + 420, height: focus.height + 480, slope: focus.slope + 8 },
    { ...focus, tag: "heat-tent-bench", x: focus.x + 620, z: focus.z + 760, height: focus.height + 80, slope: 9 },
    { ...focus, tag: "crevasse-lip", x: focus.x + 1860, z: focus.z - 740, height: focus.height + 420, slope: focus.slope + 16 },
    { ...focus, tag: "beacon-mirror", x: focus.x + 2180, z: focus.z + 120, height: focus.height + 600, slope: focus.slope + 4 }
  ];
  return kit.describe({ time: state.frame / 60, camera: state.camera, terrainSample: focus, samples, input: state.input });
});

for (const [index, outcome] of outcomes.entries()) {
  assert.ok(outcome.rendererHandoff.counts.total >= 20, `case ${index} enough descriptors`);
  assert.ok(outcome.readiness >= 0 && outcome.readiness <= 1, `case ${index} readiness bounded`);
  assert.ok(outcome.exposure >= 0 && outcome.exposure <= 1, `case ${index} exposure bounded`);
  assert.ok(outcome.rendererHandoff.descriptors.ridgeAnchors.length >= 4, `case ${index} ridge anchors`);
  assert.ok(outcome.rendererHandoff.descriptors.spanCables.length >= 3, `case ${index} span cables`);
  assert.ok(outcome.rendererHandoff.descriptors.shelterLedgers.length === 1, `case ${index} ledger`);
  assert.ok(["hold", "guide", "open"].includes(outcome.missionState), `case ${index} mission state`);
}

console.log("Infinite Radial Terrain skybridge shelter CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
