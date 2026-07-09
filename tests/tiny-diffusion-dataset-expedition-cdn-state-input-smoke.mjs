import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTinyDiffusionDatasetExpeditionReadinessDomainKit } from "../experiments/tiny-diffusion-lab/kits/tiny-diffusion-dataset-expedition-readiness-domain-kit.js";

const indexHtml = readFileSync(new URL("../experiments/tiny-diffusion-lab/index.html", import.meta.url), "utf8");
const entrySource = readFileSync(new URL("../experiments/tiny-diffusion-lab/app/dataset-expedition-readiness-entry.js", import.meta.url), "utf8");
const kitSource = readFileSync(new URL("../experiments/tiny-diffusion-lab/kits/tiny-diffusion-dataset-expedition-readiness-domain-kit.js", import.meta.url), "utf8");

assert.ok(indexHtml.includes("dataset-expedition-readiness-renderer-handoff-pass"));
assert.ok(indexHtml.includes("datasetExpeditionReadiness"));
assert.ok(indexHtml.includes("dataset-expedition-readiness-entry.js"));
assert.ok(entrySource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(!entrySource.includes("NexusRealtime@"));
assert.ok(entrySource.includes("getTinyDiffusionDatasetExpeditionReadiness"));
assert.ok(entrySource.includes("getRendererHandoff"));
assert.ok(!/document\.|window\.|globalThis\.|setTimeout|requestAnimationFrame|canvas|getContext|addEventListener/.test(kitSource), "reusable kit source stays renderer/input/browser neutral");

function sample(label, salt) {
  return { id: label, label, pixels: Array.from({ length: 256 }, (_, index) => ((index * (salt + 3)) % 17) / 16) };
}

const domain = createTinyDiffusionDatasetExpeditionReadinessDomainKit();
const readinessValues = [];
for (let index = 0; index < 10; index += 1) {
  const input = {
    action: ["boot", "prepare", "map", "balance", "train-one", "train-ten", "sample", "inspect", "checkpoint", "archive"][index],
    datasetSamples: Array.from({ length: index + 1 }, (_, sampleIndex) => sample(`class-${sampleIndex % 5}`, sampleIndex + index)),
    noiseSteps: Array.from({ length: Math.min(8, index + 1) }, (_, stepIndex) => ({ amount: stepIndex / 7 })),
    denoiseFrames: Array.from({ length: Math.min(8, index) }, (_, frameIndex) => ({ timestep: frameIndex })),
    frames: Math.min(8, index),
    finalReady: index >= 6,
    finalPixels: index >= 6 ? sample("final", index).pixels : [],
    epochs: index + (index >= 5 ? 4 : 0),
    steps: index * 12,
    latestLoss: Math.max(0.1, 0.88 - index * 0.08),
    saved: index >= 8
  };
  const result = domain.evaluate(input);
  readinessValues.push(result.readinessScore);
  assert.equal(result.rendererHandoff.policy, "renderer-consumes-descriptors-only", `descriptor-only for step ${index}`);
  assert.ok(result.rendererHandoff.descriptorCount >= 6, `descriptor count for step ${index}`);
  assert.ok(result.descriptors.fieldGuideLedger.nextAction.length > 6, `next action for step ${index}`);
}

assert.ok(readinessValues.at(-1) > readinessValues[0], "state/input progression improves dataset expedition readiness");
console.log("Tiny Diffusion dataset expedition CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
