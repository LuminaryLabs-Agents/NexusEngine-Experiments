import assert from "node:assert/strict";
import { createTinyDiffusionLatentMuseumCuratorReadinessDomainKit } from "../experiments/tiny-diffusion-lab/kits/tiny-diffusion-latent-museum-curator-readiness-domain-kit.js";

function pixels(count, seed = 1) {
  return Array.from({ length: count }, (_, index) => {
    const value = Math.sin((index + 1) * 12.9898 + seed * 78.233) * 43758.5453;
    return value - Math.floor(value);
  });
}

function caseInput(index) {
  const sampleCount = Math.min(10, index + 1);
  const frames = Math.min(8, index);
  return {
    sampleCount,
    seeds: Array.from({ length: sampleCount }, (_, seedIndex) => `glyph-${index}-${seedIndex}`),
    noiseSteps: Array.from({ length: Math.min(8, index + 2) }, (_, step) => ({ timestep: step, amount: step / 7 })),
    denoiseFrames: Array.from({ length: frames }, (_, frame) => ({ timestep: frame, pixels: pixels(64, frame + index) })),
    frames,
    finalReady: index >= 4,
    finalPixels: index >= 4 ? pixels(256, index) : [],
    width: 16,
    height: 16,
    epochs: index,
    steps: index * 9,
    latestLoss: Math.max(0.08, 0.92 - index * 0.08),
    clarity: index / 10,
    saved: index >= 7,
    checkpointAge: index >= 7 ? 2 : 999
  };
}

const domain = createTinyDiffusionLatentMuseumCuratorReadinessDomainKit();
assert.equal(domain.id, "tiny-diffusion-latent-museum-curator-readiness-domain-kit");
assert.equal(domain.tree.root, "tiny-diffusion-latent-museum-curator-readiness-domain");
assert.equal(domain.kits.length, 7);
assert.ok(domain.forbiddenOwnership.includes("renderer"));
assert.ok(domain.forbiddenOwnership.includes("dom"));

const cases = Array.from({ length: 10 }, (_, index) => caseInput(index));
let previousScore = -1;
for (const [index, input] of cases.entries()) {
  const result = domain.evaluate(input);
  assert.equal(result.id, "tiny-diffusion-latent-museum-curator-readiness");
  assert.ok(result.readinessScore >= 0 && result.readinessScore <= 1, `case ${index} score bounded`);
  assert.ok(["collection-open", "curator-review", "exhibition-ready"].includes(result.status), `case ${index} status enum`);
  assert.equal(result.rendererHandoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(result.rendererHandoff.descriptorCount, 6);
  assert.deepEqual(Object.keys(result.descriptors), [
    "seedVitrine",
    "noiseTunnelMap",
    "denoiseWitnessFrame",
    "provenancePlaque",
    "exportCrate",
    "exhibitionLedger"
  ]);
  assert.ok(result.descriptors.seedVitrine.kind === "seed-vitrine");
  assert.ok(result.descriptors.noiseTunnelMap.kind === "noise-tunnel-map");
  assert.ok(result.descriptors.denoiseWitnessFrame.kind === "denoise-witness-frame");
  assert.ok(result.descriptors.provenancePlaque.kind === "provenance-plaque");
  assert.ok(result.descriptors.exportCrate.kind === "export-crate");
  assert.ok(result.descriptors.exhibitionLedger.kind === "exhibition-ledger");
  JSON.stringify(result);
  if (index > 2) assert.ok(result.readinessScore >= previousScore - 0.18, `case ${index} readiness should not collapse`);
  previousScore = result.readinessScore;
}

const cold = domain.evaluate(cases[0]);
const mature = domain.evaluate(cases[9]);
assert.ok(mature.readinessScore > cold.readinessScore, "mature curation should improve readiness");
assert.equal(mature.status, "exhibition-ready");
assert.equal(mature.descriptors.exhibitionLedger.blockerCount, 0);

console.log("Tiny diffusion latent museum curator readiness kits smoke passed 10 intake cases.");
