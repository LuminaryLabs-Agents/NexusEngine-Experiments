import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createTinyDiffusionCurriculumKilnReadiness,
  createTinyDiffusionCurriculumKilnRendererHandoff
} from "../experiments/tiny-diffusion-lab/app/curriculum-kiln-readiness-kits.js";

const route = readFileSync(new URL("../experiments/tiny-diffusion-lab/index.html", import.meta.url), "utf8");
const entry = readFileSync(new URL("../experiments/tiny-diffusion-lab/app/curriculum-kiln-readiness-entry.js", import.meta.url), "utf8");
const kit = readFileSync(new URL("../experiments/tiny-diffusion-lab/app/curriculum-kiln-readiness-kits.js", import.meta.url), "utf8");

assert.ok(route.includes("curriculum-kiln-readiness-renderer-handoff-pass"));
assert.ok(route.includes("curriculumKilnReadiness"));
assert.ok(route.includes("curriculum-kiln-readiness-entry.js?v=tiny-diffusion-curriculum-kiln-20260709"));
assert.ok(entry.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(!entry.includes("NexusRealtime@"));
assert.ok(entry.includes("TinyDiffusionLab"));
assert.ok(entry.includes("getCurriculumKilnReadiness"));
assert.ok(entry.includes("getRendererHandoff"));

const forbiddenKitOwnership = [
  "document.",
  "window.",
  "requestAnimationFrame",
  "setInterval",
  "setTimeout",
  "localStorage",
  "sessionStorage",
  "new Audio",
  "THREE.",
  "WebGL"
];
for (const token of forbiddenKitOwnership) {
  assert.ok(!kit.includes(token), `renderer-neutral kit must not contain ${token}`);
}

const cases = [
  { action: "prepare", state: { datasetCount: 6 } },
  { action: "trainOne", state: { datasetCount: 6, epochs: 1, steps: 4, latestLoss: 0.39 } },
  { action: "trainTen", state: { datasetCount: 6, epochs: 10, steps: 40, latestLoss: 0.16 } },
  { action: "generate", state: { datasetCount: 6, epochs: 10, steps: 40, latestLoss: 0.16, generatedFrames: 8, sampleCount: 1 } },
  { action: "checkpoint", state: { datasetCount: 6, epochs: 10, steps: 40, latestLoss: 0.16, generatedFrames: 8, sampleCount: 1, checkpointCount: 1 } },
  { action: "reset", state: { datasetCount: 0, epochs: 0, steps: 0, generatedFrames: 0 } },
  { action: "low-loss-watch", state: { datasetCount: 3, epochs: 24, steps: 96, latestLoss: 0.01, generatedFrames: 8 } },
  { action: "wide-dataset", state: { datasetCount: 12, epochs: 5, steps: 20, latestLoss: 0.22, generatedFrames: 5 } },
  { action: "partial-preview", state: { preview: { metrics: { epochs: 2, steps: 7, latestLoss: 0.32 }, datasetSamples: [{}, {}, {}, {}, {}], denoiseFrames: [{}, {}] } } },
  { action: "export", state: { datasetCount: 10, epochs: 14, steps: 70, latestLoss: 0.08, generatedFrames: 8, sampleCount: 5, checkpointCount: 3 } }
];

for (const { action, state } of cases) {
  const readiness = createTinyDiffusionCurriculumKilnReadiness(state);
  const handoff = createTinyDiffusionCurriculumKilnRendererHandoff(state);
  assert.ok(readiness.readiness >= 0 && readiness.readiness <= 1, action);
  assert.ok(readiness.overfitRisk >= 0 && readiness.overfitRisk <= 1, action);
  assert.equal(handoff.consumes, "descriptors-only", action);
  assert.ok(Object.keys(handoff.descriptorGroups).length >= 6, action);
}

const early = createTinyDiffusionCurriculumKilnReadiness(cases[0].state);
const late = createTinyDiffusionCurriculumKilnReadiness(cases.at(-1).state);
assert.ok(late.readiness > early.readiness, "input progression should increase curriculum readiness");

console.log("Tiny Diffusion curriculum kiln CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
