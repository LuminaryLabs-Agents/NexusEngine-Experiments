import assert from "node:assert/strict";
import {
  TROPICAL_LAGOON_NAVIGATION_DOMAIN_TREE,
  createLagoonReefDepthContourKit,
  createLagoonSwimSafetyConeKit,
  createLagoonCurrentVectorFanKit,
  createLagoonSnorkelPointScoreKit,
  createLagoonRaftReturnWakeKit,
  createLagoonSunGlareTimingBandKit,
  createLagoonNavigationRendererHandoffKit,
  createTropicalLagoonNavigationReadabilityDomainKit
} from "../experiments/tropical-island-scene/src/tropical-lagoon-navigation-readability-domain-kit.js";

function makeInput(index) {
  return {
    time: index * 0.37,
    orbit: -0.7 + index * 0.16,
    camera: { angle: -0.7 + index * 0.16 },
    fish: Array.from({ length: 5 + (index % 3) }, (_, fishIndex) => ({
      id: `fish-${index}-${fishIndex}`,
      position: { x: -10 + fishIndex * 4 + index * 0.2, y: -1.4 + fishIndex * 0.05, z: -12 - fishIndex * 2.7 },
      scale: 0.7 + fishIndex * 0.08
    })),
    floatProps: Array.from({ length: 4 + (index % 4) }, (_, propIndex) => ({
      id: `float-${index}-${propIndex}`,
      position: { x: -16 + propIndex * 6, y: 0, z: -18 - propIndex * 3 - index * 0.25 },
      scale: 0.8 + propIndex * 0.1
    })),
    visualFractal: {
      reef: { intensity: 0.4 + index * 0.03 },
      water: { clarity: 0.8 - index * 0.02 }
    }
  };
}

const intakes = Array.from({ length: 10 }, (_, index) => makeInput(index));
const reefKit = createLagoonReefDepthContourKit({ count: 5 });
const swimKit = createLagoonSwimSafetyConeKit({ count: 4 });
const currentKit = createLagoonCurrentVectorFanKit({ count: 7 });
const snorkelKit = createLagoonSnorkelPointScoreKit({ count: 6 });
const raftKit = createLagoonRaftReturnWakeKit({ count: 5 });
const glareKit = createLagoonSunGlareTimingBandKit({ count: 4 });
const handoffKit = createLagoonNavigationRendererHandoffKit();
const domainKit = createTropicalLagoonNavigationReadabilityDomainKit({
  reefContours: { count: 5 },
  swimSafetyCones: { count: 4 },
  currentVectors: { count: 7 },
  snorkelScores: { count: 6 },
  raftReturnWakes: { count: 5 },
  sunGlareBands: { count: 4 }
});

assert.ok(TROPICAL_LAGOON_NAVIGATION_DOMAIN_TREE.includes("tropical-lagoon-navigation-readability-domain"));
assert.ok(TROPICAL_LAGOON_NAVIGATION_DOMAIN_TREE.includes("renderer consumes descriptors only"));

for (const input of intakes) {
  const reefContours = reefKit.describe(input);
  assert.equal(reefKit.id, "lagoon-reef-depth-contour-kit");
  assert.equal(reefContours.length, 5);
  assert.ok(reefContours.every((entry) => entry.kind === "lagoon-reef-depth-contour"));
  assert.ok(reefContours.every((entry) => entry.rendererContract.rendererMustNotOwn.includes("WebGL")));

  const swimSafetyCones = swimKit.describe(input);
  assert.equal(swimKit.id, "lagoon-swim-safety-cone-kit");
  assert.equal(swimSafetyCones.length, 4);
  assert.ok(swimSafetyCones.every((entry) => entry.safety >= 0 && entry.safety <= 1));

  const currentVectors = currentKit.describe(input);
  assert.equal(currentKit.id, "lagoon-current-vector-fan-kit");
  assert.equal(currentVectors.length, 7);
  assert.ok(currentVectors.every((entry) => entry.force >= 0 && entry.force <= 1));

  const snorkelScores = snorkelKit.describe(input);
  assert.equal(snorkelKit.id, "lagoon-snorkel-point-score-kit");
  assert.equal(snorkelScores.length, Math.min(6, input.fish.length));
  assert.ok(snorkelScores.every((entry) => entry.score >= 0 && entry.score <= 1));

  const raftReturnWakes = raftKit.describe(input);
  assert.equal(raftKit.id, "lagoon-raft-return-wake-kit");
  assert.equal(raftReturnWakes.length, Math.min(5, input.floatProps.length));
  assert.ok(raftReturnWakes.every((entry) => entry.kind === "lagoon-raft-return-wake"));

  const sunGlareBands = glareKit.describe(input);
  assert.equal(glareKit.id, "lagoon-sun-glare-timing-band-kit");
  assert.equal(sunGlareBands.length, 4);
  assert.ok(sunGlareBands.every((entry) => entry.safeWindow >= 0 && entry.safeWindow <= 1));

  const handoff = handoffKit.describe({ reefContours, swimSafetyCones, currentVectors, snorkelScores, raftReturnWakes, sunGlareBands });
  assert.equal(handoffKit.id, "lagoon-navigation-renderer-handoff-kit");
  assert.equal(handoff.contract, "renderer-consumes-descriptors-only");
  const descriptorTotal = reefContours.length + swimSafetyCones.length + currentVectors.length + snorkelScores.length + raftReturnWakes.length + sunGlareBands.length;
  assert.equal(handoff.counts.total, descriptorTotal);
  assert.deepEqual(JSON.parse(JSON.stringify(handoff.counts)), handoff.counts);

  const domain = domainKit.describe(input);
  assert.equal(domainKit.id, "tropical-lagoon-navigation-readability-domain-kit");
  assert.equal(domain.rendererHandoff.counts.total, descriptorTotal);
  assert.ok(domain.subdomains.waterReading.kits.includes("lagoon-reef-depth-contour-kit"));
  assert.ok(domain.rendererHandoff.ownership.rendererMustNotOwn.includes("browser input"));
}

console.log("tropical lagoon navigation readability kit smoke passed: 8 kit surfaces x 10 intake cases");
