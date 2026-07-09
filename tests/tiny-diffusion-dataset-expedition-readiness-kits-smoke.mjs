import assert from "node:assert/strict";
import {
  TINY_DIFFUSION_DATASET_EXPEDITION_FORBIDDEN_OWNERSHIP,
  createTinyDiffusionDatasetExpeditionReadinessDomainKit
} from "../experiments/tiny-diffusion-lab/kits/tiny-diffusion-dataset-expedition-readiness-domain-kit.js";

function sample(label, salt) {
  return {
    id: label,
    label,
    width: 16,
    height: 16,
    pixels: Array.from({ length: 256 }, (_, index) => {
      const v = Math.sin((index + 1) * (salt + 1.17)) * 0.5 + 0.5;
      return Math.max(0, Math.min(1, v));
    })
  };
}

const cases = Array.from({ length: 10 }, (_, index) => {
  const sampleCount = Math.max(0, index + 1);
  return {
    id: `case-${index}`,
    datasetSamples: Array.from({ length: sampleCount }, (_, sampleIndex) => sample(`glyph-${sampleIndex % Math.max(1, Math.min(6, sampleCount))}`, sampleIndex + index)),
    noiseSteps: Array.from({ length: Math.min(8, index + 1) }, (_, stepIndex) => ({ timestep: stepIndex, amount: stepIndex / 7 })),
    denoiseFrames: Array.from({ length: Math.min(8, index) }, (_, frameIndex) => ({ timestep: frameIndex })),
    frames: Math.min(8, index),
    finalReady: index >= 5,
    finalPixels: index >= 5 ? sample("final", index).pixels : [],
    epochs: index,
    steps: index * 9,
    latestLoss: Math.max(0.12, 0.92 - index * 0.075),
    saved: index >= 8
  };
});

const domain = createTinyDiffusionDatasetExpeditionReadinessDomainKit();
assert.equal(domain.id, "tiny-diffusion-dataset-expedition-readiness-domain-kit");
assert.equal(domain.kits.length, 7);
assert.equal(domain.tree.root, "tiny-diffusion-dataset-expedition-readiness-domain");
assert.deepEqual(domain.forbiddenOwnership, TINY_DIFFUSION_DATASET_EXPEDITION_FORBIDDEN_OWNERSHIP);

const readinessValues = [];
for (const input of cases) {
  const result = domain.evaluate(input);
  readinessValues.push(result.readinessScore);
  assert.ok(result.readinessScore >= 0 && result.readinessScore <= 1, `${input.id} readiness is bounded`);
  assert.ok(["expedition-ready", "route-in-progress", "waiting-for-seeds"].includes(result.status), `${input.id} status enum`);
  assert.equal(Object.keys(result.descriptors).length, 6, `${input.id} descriptor families`);
  assert.equal(result.rendererHandoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(result.rendererHandoff.descriptorCount, 6);
  assert.ok(result.descriptors.seedCartography.mapPoints.length <= 12, `${input.id} map capped`);
  assert.ok(result.descriptors.classBalance.bucketCount >= 0, `${input.id} bucket count exists`);
  assert.ok(result.descriptors.curriculumRoute.route.length === 5, `${input.id} curriculum route exists`);
  assert.ok(result.descriptors.noiseWeather.stepCount <= 8, `${input.id} noise steps bounded`);
  assert.ok(result.descriptors.provenanceTicket.seeds.length <= 8, `${input.id} provenance capped`);
  assert.ok(result.descriptors.fieldGuideLedger.nextAction.length > 6, `${input.id} next action exists`);
  assert.doesNotThrow(() => JSON.stringify(result), `${input.id} serializes`);
}

assert.ok(readinessValues.at(-1) > readinessValues[0], "later expedition case improves readiness");
console.log("Tiny Diffusion dataset expedition readiness kits smoke passed 10 intake cases.");
