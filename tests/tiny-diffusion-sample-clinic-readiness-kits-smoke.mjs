import assert from "node:assert/strict";
import { createTinyDiffusionSampleClinicReadinessDomainKit } from "../experiments/tiny-diffusion-lab/kits/tiny-diffusion-sample-clinic-readiness-domain-kit.js";

function pixels(seed, count = 256) {
  return Array.from({ length: count }, (_, index) => {
    const value = Math.sin((index + 1) * (seed + 3.17)) * 43758.5453;
    return Math.abs(value - Math.floor(value));
  });
}

const cases = [
  { name: "cold boot", input: { sampleCount: 0, latestLoss: 1, epochs: 0, steps: 0, frames: 0, finalReady: false, finalPixels: [] } },
  { name: "prepared only", input: { sampleCount: 6, latestLoss: 0.92, epochs: 0, steps: 0, frames: 0, finalReady: false, finalPixels: [] } },
  { name: "one epoch noisy", input: { sampleCount: 6, latestLoss: 0.72, epochs: 1, steps: 8, frames: 2, finalReady: true, finalPixels: pixels(1) } },
  { name: "partial curriculum", input: { sampleCount: 8, latestLoss: 0.58, epochs: 3, steps: 24, frames: 4, finalReady: true, saved: false, finalPixels: pixels(2) } },
  { name: "checkpoint stale", input: { sampleCount: 8, latestLoss: 0.48, epochs: 5, steps: 40, frames: 6, finalReady: true, saved: true, checkpointAge: 32, finalPixels: pixels(3) } },
  { name: "checkpoint fresh", input: { sampleCount: 10, latestLoss: 0.42, epochs: 7, steps: 56, frames: 8, finalReady: true, saved: true, checkpointAge: 4, finalPixels: pixels(4) } },
  { name: "flat artifact", input: { sampleCount: 10, latestLoss: 0.38, epochs: 8, steps: 64, frames: 8, finalReady: true, saved: true, checkpointAge: 2, finalPixels: Array(256).fill(0.5) } },
  { name: "bright glyph", input: { sampleCount: 12, latestLoss: 0.28, epochs: 10, steps: 80, frames: 8, finalReady: true, saved: true, checkpointAge: 1, finalPixels: pixels(7).map((value) => Math.min(1, value * 0.4 + 0.55)) } },
  { name: "shadow glyph", input: { sampleCount: 12, latestLoss: 0.34, epochs: 9, steps: 72, frames: 8, finalReady: true, saved: true, checkpointAge: 1, finalPixels: pixels(8).map((value) => value * 0.42) } },
  { name: "handoff ready", input: { sampleCount: 16, latestLoss: 0.18, epochs: 14, steps: 112, frames: 8, finalReady: true, saved: true, checkpointAge: 0, finalPixels: pixels(9) } }
];

const domain = createTinyDiffusionSampleClinicReadinessDomainKit();
assert.equal(domain.id, "tiny-diffusion-sample-clinic-readiness-domain-kit");
assert.equal(domain.kits.length, 7);
assert.ok(domain.tree.contract.includes("renderer"));
assert.ok(domain.forbiddenOwnership.includes("dom"));
assert.ok(domain.forbiddenOwnership.includes("diffusion-backend"));

for (const { name, input } of cases) {
  const result = domain.evaluate(input);
  assert.equal(result.id, "tiny-diffusion-sample-clinic-readiness", name);
  assert.ok(result.readinessScore >= 0 && result.readinessScore <= 1, name);
  assert.ok(["clinic-ready", "needs-review", "waiting-for-sample"].includes(result.status), name);
  assert.equal(Object.keys(result.descriptors).length, 6, name);
  assert.equal(result.rendererHandoff.policy, "renderer-consumes-descriptors-only", name);
  assert.equal(result.rendererHandoff.descriptorCount, 6, name);
  assert.ok(result.rendererHandoff.forbiddenOwnership.includes("frame-loop"), name);
  assert.ok(Array.isArray(result.descriptors.artifactScanMap.scanPoints), name);
  assert.ok(Array.isArray(result.descriptors.anomalyMask.anomalies), name);
  assert.ok(result.descriptors.lossTriageBand.triageScore >= 0, name);
  assert.ok(result.descriptors.retryPrescription.actionCount >= 1, name);
  assert.ok(result.descriptors.curatorLabelCard.labelScore >= 0, name);
  assert.ok(result.descriptors.archiveHandoffLedger.handoffScore >= 0, name);
  const serializable = JSON.parse(JSON.stringify(result));
  assert.equal(serializable.rendererHandoff.descriptorCount, 6, name);
}

const cold = domain.evaluate(cases[0].input);
const ready = domain.evaluate(cases.at(-1).input);
assert.ok(ready.readinessScore > cold.readinessScore, "ready sample should score higher than cold boot");
console.log("Tiny Diffusion sample clinic readiness kits smoke passed 10 intake cases.");
