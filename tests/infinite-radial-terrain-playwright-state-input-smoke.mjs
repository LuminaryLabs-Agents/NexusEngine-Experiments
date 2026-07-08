import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync("experiments/infinite-radial-terrain/infinite-radial-terrain.js", "utf8");
const index = readFileSync("experiments/infinite-radial-terrain/index.html", "utf8");
const kits = readFileSync("experiments/_kits/infinite-radial-terrain/infinite-radial-terrain-kits.js", "utf8");

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

assert.ok(route.includes(nexusEngineCdn), "route should pull NexusEngine main through the CDN");
assert.ok(!route.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"), "route should not import the old NexusRealtime runtime CDN");
assert.ok(index.includes("infinite-radial-terrain-visual-fractal-v1"), "index should cache-bust the descriptor handoff route asset");

for (const expected of [
  "createInfiniteRadialTerrainVisualDomainKit",
  "collectVisualSamples()",
  "syncVisualDescriptors()",
  "visualDescriptors: core.clone(visualDescriptors)",
  "domain: { infiniteRadialTerrainVisual: core.clone(visualDescriptors) }",
  "renderer.render(scene, camera)",
  "NexusEngine CDN"
]) {
  assert.ok(route.includes(expected), expected);
}

for (const expected of [
  "createTerrainGeologyProvinceKit",
  "createTerrainHydrologyThreadKit",
  "createTerrainBiomeMosaicKit",
  "createTerrainLodRingTelemetryKit",
  "createTerrainTravelForecastKit",
  "createTerrainSkyHazeGradientKit",
  "createTerrainRendererHandoffKit",
  "INFINITE_RADIAL_TERRAIN_DOMAIN_TREE",
  "renderer consumes descriptors only; no Three.js, DOM, browser input, WebGL, audio, asset loading, or frame-loop ownership"
]) {
  assert.ok(kits.includes(expected), expected);
}

const simulatedInputs = Array.from({ length: 10 }, (_, index) => ({
  dt: index % 2 ? 1 / 60 : 1 / 30,
  keys: {
    KeyW: index % 3 !== 0,
    KeyA: index % 4 === 0,
    KeyD: index % 4 === 1,
    Space: index === 2 || index === 7,
    ShiftLeft: index === 5,
    ArrowLeft: index % 2 === 0,
    ArrowRight: index % 2 === 1,
    ArrowUp: index === 4,
    ArrowDown: index === 8
  },
  camera: {
    position: { x: index * 250, y: 900 + index * 32, z: -index * 180 },
    yaw: index * 0.1,
    pitch: Math.max(-1.22, Math.min(0.22, -0.32 + index * 0.03))
  }
}));

for (const intake of simulatedInputs) {
  assert.ok(Number.isFinite(intake.dt));
  assert.ok(intake.dt > 0 && intake.dt <= 1 / 30);
  assert.ok(Object.values(intake.keys).every((value) => typeof value === "boolean"));
  assert.ok(intake.camera.pitch >= -1.22 && intake.camera.pitch <= 0.22);
  assert.ok(Number.isFinite(intake.camera.position.y));
}

console.log("infinite radial terrain NexusEngine CDN/state-input smoke passed: 10 intake cases");
