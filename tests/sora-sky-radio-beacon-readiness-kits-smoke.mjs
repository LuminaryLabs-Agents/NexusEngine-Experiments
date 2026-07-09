import assert from "node:assert/strict";
import {
  SORA_SKY_RADIO_BEACON_READINESS_DOMAIN_TREE,
  createSoraSkyRadioBeaconReadinessDomainKit
} from "../experiments/sora-the-infinite/sora-sky-radio-beacon-readiness-kits.js";

const domain = createSoraSkyRadioBeaconReadinessDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => ({
  tick: index * 9,
  readiness: Math.min(1, 0.18 + index * 0.083),
  input: {
    thrust: index % 3 === 0 ? 1 : 0.35,
    bank: (index - 5) / 8,
    climb: index % 2 ? 0.65 : -0.1,
    pointerActive: index >= 4,
    pointerX: index / 9,
    pointerY: 1 - index / 12
  },
  skyRescueReadiness: { rendererHandoff: { counts: { total: 18 + index } } },
  skyLighthouseReadiness: { rendererHandoff: { counts: { total: 14 + index } } },
  skyRookeryMigrationReadiness: { rendererHandoff: { counts: { total: 11 + index } } },
  starOrchardRescueReadiness: { rendererHandoff: { counts: { total: 21 + index } } }
}));

assert.equal(domain.id, "sora-sky-radio-beacon-rescue-readiness-domain-kit");
assert.match(SORA_SKY_RADIO_BEACON_READINESS_DOMAIN_TREE, /sora-sky-radio-beacon-rescue-readiness-domain/);
assert.ok(domain.kits.includes("sora-cloud-radio-mast-kit"));
assert.ok(domain.kits.includes("sora-dawn-radio-ledger-kit"));

let firstReadiness = 0;
let lastReadiness = 0;
for (const [index, intake] of cases.entries()) {
  const result = domain.describe(intake);
  if (index === 0) firstReadiness = result.readinessScore;
  if (index === cases.length - 1) lastReadiness = result.readinessScore;
  assert.equal(result.cloudRadioMasts.length, 5);
  assert.equal(result.beaconFrequencyBands.length, 6);
  assert.equal(result.lightningGapMarkers.length, 5);
  assert.equal(result.thermalRelayBuoys.length, 5);
  assert.equal(result.skyStretcherCradles.length, 4);
  assert.equal(result.rendererHandoff.contract, "renderer-consumes-descriptors-only");
  assert.equal(result.rendererHandoff.counts.total, 26);
  assert.ok(result.readinessScore >= 0 && result.readinessScore <= 1);
  assert.ok(result.stormRisk >= 0 && result.stormRisk <= 1);
  assert.ok(["listen", "triangulate", "broadcast"].includes(result.missionState));
  assert.doesNotThrow(() => JSON.stringify(result));
}

assert.ok(lastReadiness >= firstReadiness, "later high-readiness intake should not regress below cold start");
console.log("Sora sky radio beacon rescue readiness kits smoke passed 10 intake cases.");
