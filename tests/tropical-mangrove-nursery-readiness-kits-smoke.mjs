import assert from "node:assert/strict";
import {
  createTropicalMangroveNurseryReadinessDomainKit,
  TROPICAL_MANGROVE_NURSERY_READINESS_DOMAIN_TREE
} from "../experiments/tropical-island-scene/src/tropical-mangrove-nursery-readiness-domain-kit.js";

assert.ok(TROPICAL_MANGROVE_NURSERY_READINESS_DOMAIN_TREE.includes("tropical-mangrove-nursery-readiness-domain"));
assert.ok(TROPICAL_MANGROVE_NURSERY_READINESS_DOMAIN_TREE.includes("renderer consumes descriptors only"));

const intakeCases = Array.from({ length: 10 }, (_, index) => ({
  time: index * 6.5,
  orbit: index * 0.21,
  fish: Array.from({ length: 4 + (index % 5) }, (_, fishIndex) => ({ id: fishIndex })),
  reefRescueReadiness: { rendererHandoff: { counts: { snorkelSearchLanes: index % 4 } } },
  tideSalvageReadiness: { rendererHandoff: { counts: { tideSurgeWindows: index % 3 } } },
  stormClinicReadiness: { rendererHandoff: { counts: { raftStretcherLanes: 2 + (index % 4) } } },
  rainwaterPurificationReadiness: { rendererHandoff: { counts: { dawnHydrationStations: 3, total: 18 + index } } }
}));

const kit = createTropicalMangroveNurseryReadinessDomainKit();
for (const [index, input] of intakeCases.entries()) {
  const readiness = kit.describe(input);
  assert.equal(readiness.id, "tropical-mangrove-nursery-readiness");
  assert.equal(readiness.rendererHandoff.contract, "renderer-consumes-descriptors-only");
  assert.equal(readiness.rendererHandoff.counts.propaguleClusters, 5);
  assert.equal(readiness.rendererHandoff.counts.rootNurseryCradles, 4);
  assert.equal(readiness.rendererHandoff.counts.crabBurrowGuards, 4);
  assert.equal(readiness.rendererHandoff.counts.brackishChannelRibbons, 5);
  assert.equal(readiness.rendererHandoff.counts.heronRoostWatches, 3);
  assert.equal(readiness.rendererHandoff.counts.dawnRangerTagLedgers, 4);
  assert.equal(readiness.rendererHandoff.counts.total, 25);
  assert.ok(readiness.nurseryReadiness >= 0 && readiness.nurseryReadiness <= 1, `case ${index} should normalize readiness`);

  const descriptors = readiness.rendererHandoff.descriptors;
  assert.ok(descriptors.propaguleClusters.every((item) => item.kind === "tropical-mangrove-propagule-cluster"));
  assert.ok(descriptors.rootNurseryCradles.every((item) => item.kind === "tropical-root-nursery-cradle"));
  assert.ok(descriptors.crabBurrowGuards.every((item) => item.kind === "tropical-crab-burrow-guard"));
  assert.ok(descriptors.brackishChannelRibbons.every((item) => item.kind === "tropical-brackish-channel-ribbon"));
  assert.ok(descriptors.heronRoostWatches.every((item) => item.kind === "tropical-heron-roost-watch"));
  assert.ok(descriptors.dawnRangerTagLedgers.every((item) => item.kind === "tropical-dawn-ranger-tag-ledger"));
  assert.ok(descriptors.crabBurrowGuards.every((item) => item.crabPressure >= 0 && item.crabPressure <= 1));
  assert.ok(descriptors.brackishChannelRibbons.every((item) => item.flowScore >= 0 && item.flowScore <= 1));
  assert.doesNotThrow(() => JSON.stringify(readiness));
}

for (const forbidden of ["requestAnimationFrame(", "document.querySelector", "canvas.addEventListener", "getContext(\"webgl2\"", "AudioContext", "new THREE", "import * as THREE"]) {
  assert.equal(JSON.stringify(kit).includes(forbidden), false, `reusable kit should not own ${forbidden}`);
}

console.log("tropical mangrove nursery readiness kit smoke passed: 10 intake cases");
