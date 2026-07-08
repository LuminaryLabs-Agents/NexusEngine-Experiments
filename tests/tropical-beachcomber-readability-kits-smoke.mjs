import assert from "node:assert/strict";
import {
  createBeachcomberTaskBeaconKit,
  createShorelinePathRibbonKit,
  createCoconutRiskShadowKit,
  createFishSchoolFocusRingKit,
  createDriftCollectionLaneKit,
  createTideWindowPulseKit,
  createBeachcomberRendererHandoffKit,
  createTropicalBeachcomberReadabilityDomainKit,
  TROPICAL_BEACHCOMBER_DOMAIN_TREE
} from "../experiments/tropical-island-scene/src/tropical-beachcomber-readability-domain-kit.js";

const cases = Array.from({ length: 10 }, (_, index) => ({
  time: index * 5.75,
  orbit: -0.45 + index * 0.11,
  camera: { angle: -0.45 + index * 0.11, distance: 42 },
  coconuts: [0, 1, 2].map((slot) => ({ id: `coconut-${slot}`, position: { x: 0.2 - slot * 0.18, y: 3.2 - index * 0.08, z: slot * 0.22 }, scale: 1 })),
  fish: Array.from({ length: 12 }, (__, fishIndex) => ({ id: `fish-${fishIndex}`, position: { x: fishIndex - 6, y: -1, z: -8 - fishIndex - index }, scale: 0.6 + (fishIndex % 4) * 0.1 })),
  floatProps: Array.from({ length: 6 }, (__, floatIndex) => ({ id: `float-${floatIndex}`, position: { x: -9 + floatIndex * 3, y: 0, z: -16 - floatIndex * 2 }, scale: 0.9 + (floatIndex % 3) * 0.1 }))
}));

const taskKit = createBeachcomberTaskBeaconKit();
const routeKit = createShorelinePathRibbonKit();
const riskKit = createCoconutRiskShadowKit();
const fishKit = createFishSchoolFocusRingKit();
const driftKit = createDriftCollectionLaneKit();
const tideKit = createTideWindowPulseKit();
const handoffKit = createBeachcomberRendererHandoffKit();
const domainKit = createTropicalBeachcomberReadabilityDomainKit({ engine: "NexusEngine main CDN" });

assert.ok(TROPICAL_BEACHCOMBER_DOMAIN_TREE.includes("renderer consumes descriptors only"), "domain tree should document renderer handoff boundary");

for (const [index, input] of cases.entries()) {
  const taskBeacons = taskKit.describe(input);
  const shoreRoutes = routeKit.describe(input);
  const coconutRisks = riskKit.describe(input);
  const fishFocus = fishKit.describe(input);
  const driftLanes = driftKit.describe(input);
  const tideWindows = tideKit.describe(input);
  const handoff = handoffKit.describe({ taskBeacons, shoreRoutes, coconutRisks, fishFocus, driftLanes, tideWindows });
  const domain = domainKit.describe(input);

  assert.equal(taskBeacons.length, 4, `case ${index} should emit four task beacons`);
  assert.equal(shoreRoutes.length, 5, `case ${index} should emit five shoreline path ribbons`);
  assert.equal(coconutRisks.length, 3, `case ${index} should emit three coconut risk shadows`);
  assert.equal(fishFocus.length, 6, `case ${index} should emit six fish focus rings`);
  assert.equal(driftLanes.length, 6, `case ${index} should emit six drift collection lanes`);
  assert.equal(tideWindows.length, 4, `case ${index} should emit four tide windows`);
  assert.equal(handoff.contract, "renderer-consumes-descriptors-only", `case ${index} should preserve renderer contract`);
  assert.equal(domain.rendererHandoff.counts.taskBeacons, 4, `case ${index} domain should expose task beacon count`);
  assert.equal(domain.rendererHandoff.counts.driftLanes, 6, `case ${index} domain should expose drift lane count`);
  assert.deepEqual(JSON.parse(JSON.stringify(domain)).rendererHandoff.counts, domain.rendererHandoff.counts, `case ${index} descriptors should be JSON serializable`);

  const descriptorText = JSON.stringify(domain.rendererHandoff.descriptors);
  for (const forbidden of ["requestAnimationFrame", "document.", "window.", "AudioContext", "THREE.", "getContext(", "canvas."]) {
    assert.equal(descriptorText.includes(forbidden), false, `case ${index} descriptors should not own ${forbidden}`);
  }
}

assert.deepEqual(domainKit.kits.map((kit) => kit.id), [
  "beachcomber-task-beacon-kit",
  "shoreline-path-ribbon-kit",
  "coconut-risk-shadow-kit",
  "fish-school-focus-ring-kit",
  "drift-collection-lane-kit",
  "tide-window-pulse-kit",
  "beachcomber-renderer-handoff-kit"
]);

console.log("Tropical beachcomber readability kit smoke passed.");
