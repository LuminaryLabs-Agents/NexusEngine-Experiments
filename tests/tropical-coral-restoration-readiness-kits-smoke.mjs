import assert from "node:assert/strict";
import { createTropicalCoralRestorationReadinessDomainKit, TROPICAL_CORAL_RESTORATION_READINESS_DOMAIN_TREE } from "../experiments/tropical-island-scene/src/tropical-coral-restoration-readiness-domain-kit.js";

const kit = createTropicalCoralRestorationReadinessDomainKit();
const basePrior = {
  reefRescueReadiness: { rendererHandoff: { counts: { total: 18, snorkelSearchLanes: 4 } } },
  tideSalvageReadiness: { rendererHandoff: { counts: { total: 14, tideSurgeWindows: 3 } } },
  stormClinicReadiness: { rendererHandoff: { counts: { total: 20, raftStretcherLanes: 4 } } },
  rainwaterPurificationReadiness: { rendererHandoff: { counts: { total: 24, dawnHydrationStations: 4 } } },
  mangroveNurseryReadiness: { rendererHandoff: { counts: { total: 26, brackishChannelRibbons: 5, dawnRangerTagLedgers: 4 } } }
};

const cases = Array.from({ length: 10 }, (_, index) => ({
  time: index * 7.25,
  orbit: index * 0.33,
  fish: Array.from({ length: index + 2 }, (_, fishIndex) => ({ id: `fish-${index}-${fishIndex}` })),
  ...basePrior,
  rainwaterPurificationReadiness: { rendererHandoff: { counts: { total: 18 + index, dawnHydrationStations: 2 + (index % 4) } } },
  reefRescueReadiness: { rendererHandoff: { counts: { total: 14 + index, snorkelSearchLanes: 2 + (index % 5) } } }
}));

for (const [index, input] of cases.entries()) {
  const readiness = kit.describe(input);
  assert.equal(readiness.kind, "tropical-coral-restoration-readiness", `case ${index} readiness kind`);
  assert.ok(TROPICAL_CORAL_RESTORATION_READINESS_DOMAIN_TREE.includes("coral-fragment-cradle-domain"), "domain tree names nested nursery domain");
  assert.ok(readiness.domainTree.includes("renderer consumes descriptors only"), "domain tree documents renderer handoff");
  assert.ok(readiness.reefReadiness >= 0 && readiness.reefReadiness <= 1, `case ${index} readiness bounded`);
  assert.ok(readiness.algaePressure >= 0 && readiness.algaePressure <= 1, `case ${index} algae pressure bounded`);
  assert.ok(["ready", "staging", "survey"].includes(readiness.missionState), `case ${index} mission state enum`);
  assert.equal(readiness.bleachingScans.length, 6, `case ${index} bleaching scan count`);
  assert.equal(readiness.algaePressureGauges.length, 5, `case ${index} algae gauge count`);
  assert.equal(readiness.coralFragmentCradles.length, 6, `case ${index} coral cradle count`);
  assert.equal(readiness.diverTransectRoutes.length, 4, `case ${index} diver transect count`);
  assert.equal(readiness.turtleSafeCorridors.length, 3, `case ${index} turtle corridor count`);
  assert.equal(readiness.dawnReefLedgers.length, 4, `case ${index} dawn ledger count`);
  assert.equal(readiness.rendererHandoff.counts.total, 28, `case ${index} renderer total count`);
  assert.equal(readiness.rendererHandoff.contract, "renderer-consumes-descriptors-only", `case ${index} handoff contract`);
  assert.ok(JSON.stringify(readiness).includes("rendererMustNotOwn"), `case ${index} ownership included`);
  assert.ok(!JSON.stringify(readiness).includes("[object Object]"), `case ${index} JSON clean`);
}

const weak = kit.describe({ time: 1, fish: [] });
const supported = kit.describe({ time: 1, fish: Array.from({ length: 12 }, (_, index) => ({ id: index })), ...basePrior });
assert.ok(supported.reefReadiness >= weak.reefReadiness - 0.12, "prior rescue/mangrove/rainwater support should not collapse reef readiness");

console.log("tropical coral restoration readiness kits smoke passed 10 intake cases");
