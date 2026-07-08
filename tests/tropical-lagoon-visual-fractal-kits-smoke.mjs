import assert from "node:assert/strict";
import {
  createLagoonDepthShelfKit,
  createReefBloomClusterKit,
  createCurrentRibbonFieldKit,
  createPalmCanopyMotionKit,
  createHorizonCloudBankKit,
  createWildlifeWakeTrailKit,
  createTropicalLagoonRendererHandoffKit,
  createTropicalLagoonVisualFractalDomainKit
} from "../experiments/tropical-island-scene/src/tropical-lagoon-visual-fractal-domain-kit.js";

const cases = Array.from({ length: 10 }, (_, index) => ({
  time: index * 7.25,
  orbit: -0.6 + index * 0.14,
  coconuts: [0, 1, 2].map((slot) => ({ id: `coconut-${slot}`, position: { x: slot * 0.2, y: 2 - index * 0.02, z: slot * -0.5 }, scale: 1 })),
  fish: Array.from({ length: 12 }, (__, fishIndex) => ({ id: `fish-${fishIndex}`, position: { x: fishIndex - 6, y: -1, z: -8 - fishIndex - index }, scale: 0.6 + (fishIndex % 4) * 0.1 })),
  floatProps: Array.from({ length: 6 }, (__, floatIndex) => ({ id: `float-${floatIndex}`, position: { x: -9 + floatIndex * 3, y: 0, z: -16 - floatIndex * 2 }, scale: 1 }))
}));

const shelfKit = createLagoonDepthShelfKit();
const reefKit = createReefBloomClusterKit({ seed: 91 });
const currentKit = createCurrentRibbonFieldKit();
const canopyKit = createPalmCanopyMotionKit();
const cloudKit = createHorizonCloudBankKit();
const wakeKit = createWildlifeWakeTrailKit();
const handoffKit = createTropicalLagoonRendererHandoffKit();
const domainKit = createTropicalLagoonVisualFractalDomainKit({ engine: "NexusEngine main CDN" });

for (const [index, input] of cases.entries()) {
  const shelves = shelfKit.describe(input);
  const reefs = reefKit.describe(input);
  const currents = currentKit.describe(input);
  const canopy = canopyKit.describe(input);
  const clouds = cloudKit.describe(input);
  const wakes = wakeKit.describe(input);
  const handoff = handoffKit.describe({ shelves, reefs, currents, canopy, clouds, wakes });
  const domain = domainKit.describe(input);

  assert.equal(shelves.length, 4, `case ${index} should emit four lagoon shelf bands`);
  assert.equal(reefs.length, 8, `case ${index} should emit eight reef bloom descriptors`);
  assert.equal(currents.length, 8, `case ${index} should emit eight current ribbons`);
  assert.equal(canopy.length, 10, `case ${index} should emit ten palm canopy descriptors`);
  assert.equal(clouds.length, 5, `case ${index} should emit five cloud bank descriptors`);
  assert.equal(wakes.length, 8, `case ${index} should cap wakes to eight descriptors`);
  assert.equal(handoff.contract, "renderer-consumes-descriptors-only", `case ${index} should preserve renderer handoff contract`);
  assert.equal(domain.rendererHandoff.counts.reefs, 8, `case ${index} domain should expose reef count`);
  assert.equal(domain.rendererHandoff.counts.currents, 8, `case ${index} domain should expose current count`);
  assert.deepEqual(JSON.parse(JSON.stringify(domain)).rendererHandoff.counts, domain.rendererHandoff.counts, `case ${index} descriptors should be JSON serializable`);

  const descriptorText = JSON.stringify(domain.rendererHandoff.descriptors);
  for (const forbidden of ["requestAnimationFrame", "document.", "window.", "AudioContext", "THREE.", "getContext("]) {
    assert.equal(descriptorText.includes(forbidden), false, `case ${index} descriptors should not own ${forbidden}`);
  }
}

assert.deepEqual(domainKit.kits.map((kit) => kit.id), [
  "lagoon-depth-shelf-kit",
  "reef-bloom-cluster-kit",
  "current-ribbon-field-kit",
  "palm-canopy-motion-kit",
  "horizon-cloud-bank-kit",
  "wildlife-wake-trail-kit",
  "tropical-lagoon-renderer-handoff-kit"
]);

console.log("Tropical lagoon visual fractal kit smoke passed.");
