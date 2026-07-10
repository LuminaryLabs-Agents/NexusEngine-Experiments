import assert from "node:assert/strict";
import {
  LATENT_GARDEN_KIT_IDS,
  LATENT_GARDEN_OWNERSHIP_EXCLUSIONS,
  createCheckpointHiveKit,
  createColorSoilBedKit,
  createDawnPollenLedgerKit,
  createGradientTrellisKit,
  createLatentGardenPollinationReadiness,
  createPollenBeeSwarmKit,
  createPromptSeedPacketKit
} from "../experiments/tiny-diffusion-lab/app/latent-garden-pollination-readiness-kits.js";

const cases = [
  {},
  { seed: "cold-start", epochs: 0, samples: 0, loss: 0.96, artifactRate: 0.8, denoiseSteps: 0 },
  { seed: "first-sprout", epochs: 3, samples: 2, loss: 0.82, artifactRate: 0.62, denoiseSteps: 5 },
  { seed: "palette-lift", epochs: 8, samples: 6, loss: 0.7, paletteDiversity: 0.78, denoiseSteps: 12 },
  { seed: "bee-variance", epochs: 16, samples: 16, loss: 0.62, artifactRate: 0.35, denoiseSteps: 24 },
  { seed: "fresh-hive", epochs: 28, samples: 24, loss: 0.48, checkpointAge: 2, denoiseSteps: 36 },
  { seed: "old-hive", epochs: 40, samples: 30, loss: 0.44, checkpointAge: 96, denoiseSteps: 42 },
  { seed: "near-bloom", epochs: 64, samples: 48, loss: 0.32, artifactRate: 0.18, denoiseSteps: 64 },
  { seed: "full-garden", epochs: 100, samples: 80, loss: 0.18, artifactRate: 0.08, denoiseSteps: 96, paletteDiversity: 0.96 },
  { seed: "malformed", epochs: -9, samples: 999, loss: "bad", artifactRate: 2, denoiseSteps: -4, checkpointAge: -10 }
];

const atomicKits = [
  createPromptSeedPacketKit,
  createColorSoilBedKit,
  createGradientTrellisKit,
  createPollenBeeSwarmKit,
  createCheckpointHiveKit,
  createDawnPollenLedgerKit
];

for (const [index, intake] of cases.entries()) {
  for (const kit of atomicKits) {
    const result = kit(intake);
    assert.ok(LATENT_GARDEN_KIT_IDS.includes(result.kitId), `case ${index} unknown kit ${result.kitId}`);
    assert.ok(Array.isArray(result.descriptors), `case ${index} ${result.kitId} descriptors missing`);
    assert.ok(result.descriptors.length > 0, `case ${index} ${result.kitId} descriptors empty`);
    assert.equal(JSON.parse(JSON.stringify(result)).kitId, result.kitId, `case ${index} ${result.kitId} not JSON safe`);
  }

  const readiness = createLatentGardenPollinationReadiness(intake);
  assert.equal(readiness.passId, "latent-garden-pollination-readiness-renderer-handoff-pass");
  assert.ok(readiness.readiness >= 0 && readiness.readiness <= 1, `case ${index} readiness out of bounds`);
  assert.ok(readiness.artifactPressure >= 0 && readiness.artifactPressure <= 1, `case ${index} pressure out of bounds`);
  assert.ok(["dormant", "germinating", "cross-pollinating", "pollinated"].includes(readiness.missionState), `case ${index} bad mission`);
  assert.ok(readiness.descriptorCount >= 18, `case ${index} descriptor floor missed`);
  assert.equal(readiness.rendererHandoff.rendererConsumesDescriptorsOnly, true, `case ${index} handoff policy missing`);
  for (const excluded of LATENT_GARDEN_OWNERSHIP_EXCLUSIONS) {
    assert.ok(readiness.rendererHandoff.ownershipExclusions.includes(excluded), `case ${index} missing exclusion ${excluded}`);
  }
}

const cold = createLatentGardenPollinationReadiness(cases[1]);
const full = createLatentGardenPollinationReadiness(cases[8]);
assert.ok(full.readiness > cold.readiness, "prepared garden should improve readiness");
assert.ok(full.artifactPressure < cold.artifactPressure, "prepared garden should reduce artifact pressure");

console.log("Tiny Diffusion latent garden pollination readiness kits smoke passed 10 intake cases.");
