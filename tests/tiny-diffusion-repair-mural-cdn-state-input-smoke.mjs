import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTinyDiffusionRepairMuralReadinessDomainKit } from "../experiments/tiny-diffusion-lab/kits/tiny-diffusion-repair-mural-readiness-domain-kit.js";

const indexHtml = readFileSync("experiments/tiny-diffusion-lab/index.html", "utf8");
const entry = readFileSync("experiments/tiny-diffusion-lab/app/repair-mural-readiness-entry.js", "utf8");
const kitSource = readFileSync("experiments/tiny-diffusion-lab/kits/tiny-diffusion-repair-mural-readiness-domain-kit.js", "utf8");

assert.ok(indexHtml.includes("repair-mural-readiness-renderer-handoff-pass"), "route advertises repair mural pass");
assert.ok(indexHtml.includes("repair-mural-readiness-entry.js"), "route loads repair mural entry");
assert.ok(indexHtml.includes("repairMuralReadiness"), "route has repair mural panel");
assert.ok(entry.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "entry pulls NexusEngine main CDN");
assert.equal(entry.includes("NexusRealtime@"), false, "changed entry must not import old NexusRealtime CDN");
assert.ok(entry.includes("getTinyDiffusionRepairMuralReadiness"), "entry exposes GameHost readiness accessor");
assert.ok(entry.includes("applyRepairMuralInput"), "entry exposes Playwright-style input surface");
for (const forbidden of ["document.", "window.", "requestAnimationFrame", "new THREE", "Audio", "fetch("]) {
  assert.equal(kitSource.includes(forbidden), false, `reusable kit should avoid ${forbidden}`);
}

const domain = createTinyDiffusionRepairMuralReadinessDomainKit();
const pixels = (seed) => Array.from({ length: 256 }, (_, index) => {
  const raw = Math.sin((index + 1) * 12.9898 + seed * 78.233) * 43758.5453;
  return raw - Math.floor(raw);
});
const makeState = (step) => ({
  datasetSamples: Array.from({ length: Math.min(8, 2 + step) }, (_, index) => ({ id: `sample-${index}`, label: `sample-${index}`, pixels: pixels(index + step), width: 16, height: 16 })),
  sampleCount: Math.min(8, 2 + step),
  noiseSteps: Array.from({ length: Math.min(8, step + 1) }, (_, index) => ({ timestep: index, amount: index / Math.max(1, step) })),
  denoiseFrames: Array.from({ length: Math.min(8, step) }, (_, index) => ({ timestep: index, pixels: pixels(index + step + 10) })),
  finalPixels: step >= 4 ? pixels(step + 30) : [],
  epochs: step,
  steps: step * 8,
  latestLoss: Math.max(0.14, 0.92 - step * 0.08),
  saved: step >= 7
});

const states = Array.from({ length: 10 }, (_, step) => makeState(step));
const results = states.map((state) => domain.evaluate(state));
for (const [index, result] of results.entries()) {
  assert.ok(Number.isFinite(result.readinessScore), `case ${index} readiness numeric`);
  assert.equal(result.rendererHandoff.descriptorCount, 6, `case ${index} descriptor count`);
  assert.ok(result.descriptors.dawnMuralLedger.blockerCount >= 0, `case ${index} blocker count`);
}
assert.ok(results.at(-1).readinessScore > results[0].readinessScore, "input progression improves repair mural readiness");
assert.ok(["mural-restored", "restoration-underway"].includes(results.at(-1).missionState), "mature input reaches useful state");
console.log("Tiny Diffusion repair mural CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
