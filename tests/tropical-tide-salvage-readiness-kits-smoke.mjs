import assert from "node:assert/strict";
import {
  createTropicalShipwreckCargoBeaconKit,
  createTropicalPearlCacheGlimmerKit,
  createTropicalTideSurgeWindowKit,
  createTropicalReefCutHazardKit,
  createTropicalOutriggerRouteThreadKit,
  createTropicalSunsetMarketDeliveryKit,
  createTropicalTideSalvageReadinessDomainKit,
  TROPICAL_TIDE_SALVAGE_DOMAIN_TREE
} from "../experiments/tropical-island-scene/src/tropical-tide-salvage-readiness-domain-kit.js";

const cases = Array.from({ length: 10 }, (_, index) => ({
  time: index * 13.7,
  orbit: index * 0.31,
  camera: { angle: index * 0.17 },
  floatProps: [
    { id: `crate-${index}-a`, x: -12 + index, y: 0.6, z: 14 - index },
    { id: `crate-${index}-b`, x: 6 - index * 0.4, y: 0.9, z: -10 + index }
  ],
  coconuts: [{ id: `coconut-${index}`, x: index * 1.7, y: 1.1, z: 8 - index }],
  weatherShelterReadability: { rendererHandoff: { counts: { stormFronts: index % 3 } } },
  reefRescueReadiness: { rendererHandoff: { counts: { ripCurrentHazards: 3 + (index % 2) } } }
}));

const kitCases = [
  ["shipwreck cargo beacons", createTropicalShipwreckCargoBeaconKit(), "tropical-shipwreck-cargo-beacon"],
  ["pearl cache glimmers", createTropicalPearlCacheGlimmerKit(), "tropical-pearl-cache-glimmer"],
  ["tide surge windows", createTropicalTideSurgeWindowKit(), "tropical-tide-surge-window"],
  ["reef cut hazards", createTropicalReefCutHazardKit(), "tropical-reef-cut-hazard"],
  ["outrigger route threads", createTropicalOutriggerRouteThreadKit(), "tropical-outrigger-route-thread"],
  ["sunset market deliveries", createTropicalSunsetMarketDeliveryKit(), "tropical-sunset-market-delivery"]
];

for (const [name, kit, kind] of kitCases) {
  for (const input of cases) {
    const descriptors = kit.describe(input);
    assert.ok(Array.isArray(descriptors), `${name} should produce an array`);
    assert.ok(descriptors.length > 0, `${name} should produce descriptors`);
    assert.equal(descriptors[0].kind, kind, `${name} should preserve descriptor kind`);
    assert.equal(descriptors[0].rendererContract.renderer, "presentation-only", `${name} should not own renderer`);
    assert.ok(!JSON.stringify(descriptors).includes("NexusRealtime"), `${name} should not depend on old NexusRealtime`);
  }
}

const domain = createTropicalTideSalvageReadinessDomainKit({ engine: "NexusEngine main CDN" });
assert.equal(domain.id, "tropical-tide-salvage-readiness-domain-kit");
assert.ok(TROPICAL_TIDE_SALVAGE_DOMAIN_TREE.includes("tropical-tide-salvage-renderer-handoff-kit"));

for (const input of cases) {
  const readiness = domain.describe(input);
  assert.equal(readiness.kind, "tropical-tide-salvage-readiness-domain");
  assert.equal(readiness.engine, "NexusEngine main CDN");
  assert.ok(readiness.subdomains.salvageResource.descriptors.shipwreckCargoBeacons.length > 0);
  assert.ok(readiness.subdomains.lagoonHazard.descriptors.tideSurgeWindows.length > 0);
  assert.ok(readiness.subdomains.returnHandoff.descriptors.outriggerRouteThreads.length > 0);
  assert.equal(readiness.rendererHandoff.contract, "renderer-consumes-descriptors-only");
  assert.ok(readiness.rendererHandoff.counts.total >= 21);
  assert.equal(readiness.rendererHandoff.counts.shipwreckCargoBeacons, readiness.rendererHandoff.descriptors.shipwreckCargoBeacons.length);
  assert.doesNotThrow(() => JSON.stringify(readiness));
  assert.ok(readiness.rendererHandoff.ownership.rendererMustNotOwn.includes("DOM"));
  assert.ok(readiness.rendererHandoff.ownership.rendererMustNotOwn.includes("Three.js"));
}

console.log("tropical tide salvage readiness kits smoke passed: 10 intake cases validated");
