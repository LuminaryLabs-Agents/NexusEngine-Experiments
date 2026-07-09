import assert from "node:assert/strict";
import {
  createTinyDiffusionCurriculumKilnReadiness,
  createTinyDiffusionCurriculumKilnRendererHandoff,
  getTinyDiffusionCurriculumKilnKitNames,
  getTinyDiffusionCurriculumKilnTree
} from "../experiments/tiny-diffusion-lab/app/curriculum-kiln-readiness-kits.js";

const cases = [
  { name: "cold boot", input: {} },
  { name: "prepared dataset", input: { datasetCount: 6, epochs: 0, steps: 0 } },
  { name: "first epoch", input: { datasetCount: 6, epochs: 1, steps: 4, latestLoss: 0.42 } },
  { name: "sample generated", input: { datasetCount: 6, epochs: 2, steps: 8, latestLoss: 0.31, generatedFrames: 8, sampleCount: 1 } },
  { name: "checkpoint ready", input: { datasetCount: 6, epochs: 4, steps: 16, latestLoss: 0.18, generatedFrames: 8, sampleCount: 1, checkpointCount: 1 } },
  { name: "tiny dataset risk", input: { datasetCount: 2, epochs: 20, steps: 80, latestLoss: 0.02, generatedFrames: 8, sampleCount: 2 } },
  { name: "large dataset", input: { datasetCount: 12, epochs: 8, steps: 36, latestLoss: 0.12, generatedFrames: 8, sampleCount: 4, checkpointCount: 2 } },
  { name: "bad numeric input", input: { datasetCount: "bad", epochs: -2, steps: Infinity, latestLoss: "nan" } },
  { name: "preview shaped input", input: { preview: { metrics: { epochs: 3, steps: 12, latestLoss: 0.28 }, datasetSamples: [{}, {}, {}, {}, {}, {}], denoiseFrames: [{}, {}, {}, {}] } } },
  { name: "mature export", input: { datasetCount: 9, epochs: 12, steps: 60, latestLoss: 0.09, generatedFrames: 8, sampleCount: 5, checkpointCount: 3 } }
];

const tree = getTinyDiffusionCurriculumKilnTree();
assert.equal(tree.id, "tiny-diffusion-curriculum-kiln-readiness-domain");
assert.ok(JSON.stringify(tree).includes("renderer consumes descriptors only"));

const kitNames = getTinyDiffusionCurriculumKilnKitNames();
assert.equal(kitNames.length, 7);
assert.ok(kitNames.includes("tiny-diffusion-curriculum-kiln-renderer-handoff-kit"));

let previousReadiness = 0;
for (const { name, input } of cases) {
  const readiness = createTinyDiffusionCurriculumKilnReadiness(input);
  assert.equal(readiness.id, "tiny-diffusion-curriculum-kiln-readiness-domain", name);
  assert.ok(readiness.readiness >= 0 && readiness.readiness <= 1, name);
  assert.ok(readiness.overfitRisk >= 0 && readiness.overfitRisk <= 1, name);
  assert.ok(["booting", "training", "curating", "export-ready"].includes(readiness.phase), name);
  assert.ok(readiness.descriptors.seedTiles.length >= 4, name);
  assert.ok(readiness.descriptors.noiseRamps.length >= 4, name);
  assert.equal(readiness.descriptors.overfitSentinels.length, 1, name);
  assert.equal(readiness.descriptors.artifactTriageTrays.length, 3, name);
  assert.ok(readiness.descriptors.checkpointSigils.length >= 1, name);
  assert.equal(readiness.descriptors.curriculumLedgers.length, 1, name);
  assert.doesNotThrow(() => JSON.stringify(readiness), name);

  const handoff = createTinyDiffusionCurriculumKilnRendererHandoff(input);
  assert.equal(handoff.consumes, "descriptors-only", name);
  assert.equal(handoff.domain, readiness.id, name);
  assert.equal(handoff.readiness, readiness.readiness, name);
  assert.ok(handoff.descriptorGroups.seedTiles.length === readiness.descriptors.seedTiles.length, name);

  if (name === "mature export") {
    assert.ok(readiness.readiness > previousReadiness, "mature export should be stronger than earlier states");
    assert.equal(readiness.phase, "export-ready");
  }
  previousReadiness = Math.max(previousReadiness, readiness.readiness);
}

console.log("Tiny Diffusion curriculum kiln readiness kits smoke passed 10 intake cases.");
