import assert from "node:assert/strict";
import {
  createTinyDiffusionTrainingMissionReadinessDomainKit,
  TINY_DIFFUSION_TRAINING_MISSION_FORBIDDEN_OWNERSHIP
} from "../experiments/tiny-diffusion-lab/kits/tiny-diffusion-training-mission-readiness-domain-kit.js";

const cases = [
  { name: "cold boot", sampleCount: 0, timesteps: 8, previewedSteps: 0, epochs: 0, steps: 0, latestLoss: 1, frames: 0, finalReady: false, saved: false },
  { name: "prepared only", prepared: true, sampleCount: 4, classSpread: 0.4, timesteps: 8, previewedSteps: 2, epochs: 0, steps: 0, latestLoss: 1, frames: 0, finalReady: false },
  { name: "first epoch", prepared: true, sampleCount: 6, classSpread: 0.5, timesteps: 8, previewedSteps: 3, epochs: 1, steps: 8, latestLoss: 0.89, frames: 0, finalReady: false },
  { name: "noisy sample", prepared: true, sampleCount: 6, classSpread: 0.6, timesteps: 8, previewedSteps: 4, epochs: 2, steps: 16, latestLoss: 0.73, frames: 8, finalReady: true, clarity: 0.28 },
  { name: "balanced training", prepared: true, sampleCount: 8, classSpread: 0.78, timesteps: 8, previewedSteps: 6, epochs: 4, steps: 32, latestLoss: 0.52, frames: 8, finalReady: true, clarity: 0.51, saved: true, checkpointAge: 5 },
  { name: "stale checkpoint", prepared: true, sampleCount: 8, classSpread: 0.8, timesteps: 8, previewedSteps: 8, epochs: 5, steps: 44, latestLoss: 0.44, frames: 8, finalReady: true, clarity: 0.62, saved: true, checkpointAge: 80 },
  { name: "small seed bank", prepared: true, sampleCount: 3, classSpread: 0.3, seeds: ["dot"], timesteps: 8, previewedSteps: 5, epochs: 3, steps: 24, latestLoss: 0.67, frames: 4, finalReady: true, clarity: 0.4 },
  { name: "full seed bank", prepared: true, sampleCount: 12, classSpread: 0.92, seeds: ["ring", "bar", "cross", "spiral"], timesteps: 8, previewedSteps: 8, epochs: 7, steps: 64, latestLoss: 0.31, frames: 8, finalReady: true, clarity: 0.74, saved: true, checkpointAge: 2 },
  { name: "long training", prepared: true, sampleCount: 14, classSpread: 1, timesteps: 8, previewedSteps: 8, epochs: 12, steps: 96, latestLoss: 0.18, frames: 8, finalReady: true, clarity: 0.88, saved: true, checkpointAge: 1 },
  { name: "overfit guard", prepared: true, sampleCount: 5, classSpread: 0.45, timesteps: 8, previewedSteps: 8, epochs: 18, steps: 140, latestLoss: 0.08, frames: 8, finalReady: true, clarity: 0.91, saved: false, checkpointAge: 999 }
];

const domain = createTinyDiffusionTrainingMissionReadinessDomainKit();
assert.equal(domain.id, "tiny-diffusion-training-mission-readiness-domain-kit");
assert.equal(domain.kits.length, 7);
assert.ok(domain.tree.split.datasetPreparation.sampleBalance.includes("tiny-diffusion-dataset-curation-kit"));
assert.ok(TINY_DIFFUSION_TRAINING_MISSION_FORBIDDEN_OWNERSHIP.includes("renderer"));
assert.ok(TINY_DIFFUSION_TRAINING_MISSION_FORBIDDEN_OWNERSHIP.includes("diffusion-backend"));

for (const intake of cases) {
  const result = domain.evaluate(intake);
  assert.equal(result.id, "tiny-diffusion-training-mission-readiness");
  assert.ok(result.readinessScore >= 0 && result.readinessScore <= 1, `${intake.name} readiness stays normalized`);
  assert.equal(result.rendererHandoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(result.rendererHandoff.descriptorCount, 6);
  assert.deepEqual(result.rendererHandoff.buckets, ["datasetCuration", "promptSeedBank", "noiseCurriculum", "trainingSentry", "sampleTriage", "checkpointAudit"]);
  assert.equal(result.descriptors.datasetCuration.kind, "dataset-curation");
  assert.equal(result.descriptors.promptSeedBank.kind, "prompt-seed-bank");
  assert.equal(result.descriptors.noiseCurriculum.kind, "noise-curriculum");
  assert.equal(result.descriptors.trainingSentry.kind, "training-sentry");
  assert.equal(result.descriptors.sampleTriage.kind, "sample-triage");
  assert.equal(result.descriptors.checkpointAudit.kind, "checkpoint-audit");
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(result)));
}

const cold = domain.evaluate(cases[0]);
const trained = domain.evaluate(cases[8]);
assert.equal(cold.status, "cold-start");
assert.ok(trained.readinessScore > cold.readinessScore, "trained case should improve mission readiness");
assert.equal(trained.status, "mission-ready");

console.log("tiny-diffusion-training-mission-readiness-kits-smoke.mjs passed");
