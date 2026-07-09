import assert from "node:assert/strict";
import {
  TINY_DIFFUSION_REPAIR_MURAL_FORBIDDEN_OWNERSHIP,
  createTinyDiffusionRepairMuralReadinessDomainKit
} from "../experiments/tiny-diffusion-lab/kits/tiny-diffusion-repair-mural-readiness-domain-kit.js";

const domain = createTinyDiffusionRepairMuralReadinessDomainKit();
const pixels = (count, seed = 1) => Array.from({ length: count }, (_, index) => {
  const raw = Math.sin((index + 1) * 12.9898 + seed * 78.233) * 43758.5453;
  return raw - Math.floor(raw);
});
const dataset = (count) => Array.from({ length: count }, (_, index) => ({ id: `seed-${index + 1}`, label: `seed-${index + 1}`, width: 16, height: 16, pixels: pixels(256, index + 1) }));
const frames = (count) => Array.from({ length: count }, (_, index) => ({ timestep: index, pixels: pixels(256, index + 20) }));
const noise = (count) => Array.from({ length: count }, (_, index) => ({ timestep: index, amount: count <= 1 ? 0 : index / (count - 1) }));

const cases = [
  {},
  { datasetSamples: dataset(2), sampleCount: 2 },
  { datasetSamples: dataset(4), sampleCount: 4, noiseSteps: noise(2) },
  { datasetSamples: dataset(6), sampleCount: 6, noiseSteps: noise(4), denoiseFrames: frames(2) },
  { datasetSamples: dataset(8), sampleCount: 8, noiseSteps: noise(8), denoiseFrames: frames(4), finalPixels: pixels(256, 40), epochs: 1, steps: 8, latestLoss: 0.68 },
  { datasetSamples: dataset(8), sampleCount: 8, noiseSteps: noise(8), denoiseFrames: frames(8), finalPixels: pixels(256, 50), epochs: 3, steps: 24, latestLoss: 0.52 },
  { datasetSamples: dataset(8), sampleCount: 8, noiseSteps: noise(8), denoiseFrames: frames(8), finalPixels: pixels(256, 60), epochs: 8, steps: 64, latestLoss: 0.28, saved: true },
  { datasetSamples: dataset(10), sampleCount: 10, noiseSteps: noise(10), denoiseFrames: frames(10), finalPixels: pixels(256, 70), epochs: 12, steps: 96, latestLoss: 0.18, saved: true, patchCount: 18 },
  { datasetSamples: dataset(7), sampleCount: 7, noiseSteps: noise(5), denoiseFrames: frames(6), finalImage: { width: 16, height: 16, pixels: pixels(256, 80) }, epochs: 5, steps: 44, latestLoss: 0.41, checkpointSaved: true },
  { datasetSamples: dataset(9), sampleCount: 9, noiseSteps: noise(9), denoiseFrames: frames(9), pixels: pixels(256, 90), epochs: 10, steps: 80, latestLoss: 0.24, saved: true }
];

const results = cases.map((input) => domain.evaluate(input));

assert.equal(domain.tree.root, "tiny-diffusion-repair-mural-readiness-domain");
assert.equal(domain.kits.length, 7);
assert.deepEqual(TINY_DIFFUSION_REPAIR_MURAL_FORBIDDEN_OWNERSHIP.includes("renderer"), true);

for (const [index, result] of results.entries()) {
  assert.equal(result.id, "tiny-diffusion-repair-mural-readiness", `case ${index} id`);
  assert.ok(result.readinessScore >= 0 && result.readinessScore <= 1, `case ${index} readiness bounds`);
  assert.ok(["mural-restored", "restoration-underway", "atelier-open"].includes(result.missionState), `case ${index} mission enum`);
  assert.equal(result.rendererHandoff.policy, "renderer-consumes-descriptors-only", `case ${index} handoff policy`);
  assert.equal(result.rendererHandoff.descriptorCount, 6, `case ${index} descriptor count`);
  assert.deepEqual(Object.keys(result.descriptors), ["seedBrush", "paletteWell", "noiseMaskGrid", "criticRibbon", "repairOrder", "dawnMuralLedger"], `case ${index} descriptor keys`);
  assert.doesNotThrow(() => JSON.stringify(result), `case ${index} JSON safe`);
  for (const forbidden of ["renderer", "dom", "browser-input", "three-js", "webgl", "audio", "asset-loading", "diffusion-backend", "frame-loop"]) {
    assert.ok(result.forbiddenOwnership.includes(forbidden), `case ${index} forbidden ${forbidden}`);
  }
}

assert.ok(results[7].readinessScore > results[0].readinessScore, "mature restoration should improve readiness over cold start");
assert.equal(results[7].status, "mural-restored");
console.log("Tiny Diffusion repair mural readiness kits smoke passed 10 intake cases.");
