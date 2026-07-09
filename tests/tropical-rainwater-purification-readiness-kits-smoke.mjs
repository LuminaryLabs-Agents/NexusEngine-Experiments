import assert from "node:assert/strict";
import {
  TROPICAL_RAINWATER_PURIFICATION_READINESS_DOMAIN_TREE,
  createTropicalRoofCatchmentGutterKit,
  createTropicalPalmLeafChannelKit,
  createTropicalCharcoalFilterBedKit,
  createTropicalCisternBoilWatchKit,
  createTropicalClayJugRationRouteKit,
  createTropicalDawnHydrationStationKit,
  createTropicalRainwaterPurificationRendererHandoffKit,
  createTropicalRainwaterPurificationReadinessDomainKit
} from "../experiments/tropical-island-scene/src/tropical-rainwater-purification-readiness-domain-kit.js";

const cases = Array.from({ length: 10 }, (_, index) => ({
  time: index * 6.75,
  orbit: index * 0.19,
  fish: Array.from({ length: 5 }, (__, fishIndex) => ({ id: `fish-${index}-${fishIndex}`, x: -11 + fishIndex * 5.5, y: 0.35 + fishIndex * 0.04, z: 13 - fishIndex * 2.8 })),
  floatProps: Array.from({ length: 4 }, (__, propIndex) => ({ id: `float-${index}-${propIndex}`, x: -15 + propIndex * 8, y: 0.2, z: 17 - propIndex * 3.5 })),
  weatherShelterReadability: { rendererHandoff: { counts: { stormFronts: index % 4 } } },
  stormClinicReadiness: { rendererHandoff: { counts: { triageBuoys: 4 + (index % 2), cisternPurityMarkers: 3 } } },
  reefRescueReadiness: { rendererHandoff: { counts: { extractionPierBeacons: (index + 2) % 5 } } }
}));

assert.ok(TROPICAL_RAINWATER_PURIFICATION_READINESS_DOMAIN_TREE.includes("collection-routing-domain"));
assert.ok(TROPICAL_RAINWATER_PURIFICATION_READINESS_DOMAIN_TREE.includes("purification-safety-domain"));
assert.ok(TROPICAL_RAINWATER_PURIFICATION_READINESS_DOMAIN_TREE.includes("renderer consumes descriptors only"));

const atomicKits = [
  createTropicalRoofCatchmentGutterKit(),
  createTropicalPalmLeafChannelKit(),
  createTropicalCharcoalFilterBedKit(),
  createTropicalCisternBoilWatchKit(),
  createTropicalClayJugRationRouteKit(),
  createTropicalDawnHydrationStationKit()
];

const domain = createTropicalRainwaterPurificationReadinessDomainKit();
const handoff = createTropicalRainwaterPurificationRendererHandoffKit();

for (const intake of cases) {
  for (const kit of atomicKits) {
    const output = kit.describe(intake);
    assert.ok(Array.isArray(output), `${kit.id} should return descriptor array`);
    assert.ok(output.length >= 2, `${kit.id} should return useful descriptor density`);
    for (const descriptor of output) {
      assert.equal(typeof descriptor.kind, "string");
      assert.ok(descriptor.rendererContract, "descriptor should expose renderer contract");
      assert.equal(descriptor.rendererContract.renderer, "presentation-only");
      assert.ok(descriptor.rendererContract.rendererMustNotOwn.includes("DOM"));
      assert.ok(descriptor.rendererContract.rendererMustNotOwn.includes("Three.js"));
      assert.ok(descriptor.rendererContract.rendererMustNotOwn.includes("WebGL"));
      assert.ok(descriptor.rendererContract.rendererMustNotOwn.includes("audio"));
      assert.ok(descriptor.rendererContract.rendererMustNotOwn.includes("asset loading"));
      assert.ok(descriptor.rendererContract.rendererMustNotOwn.includes("frame loop"));
    }
  }

  const readiness = domain.describe(intake);
  assert.equal(readiness.kind, "tropical-rainwater-purification-readiness-domain");
  assert.equal(readiness.rendererHandoff.contract, "renderer-consumes-descriptors-only");
  assert.equal(readiness.rendererHandoff.counts.catchmentGutters, 4);
  assert.equal(readiness.rendererHandoff.counts.palmLeafChannels, 5);
  assert.equal(readiness.rendererHandoff.counts.charcoalFilterBeds, 3);
  assert.equal(readiness.rendererHandoff.counts.cisternBoilWatches, 3);
  assert.equal(readiness.rendererHandoff.counts.clayJugRationRoutes, 4);
  assert.equal(readiness.rendererHandoff.counts.dawnHydrationStations, 3);
  assert.equal(readiness.rendererHandoff.counts.total, 22);
  assert.ok(readiness.subdomains.collectionRouting.descriptors.catchmentGutters.length > 0);
  assert.ok(readiness.subdomains.purificationSafety.descriptors.charcoalFilterBeds.length > 0);
  assert.ok(readiness.subdomains.rationHandoff.descriptors.dawnHydrationStations.length > 0);
  assert.doesNotThrow(() => JSON.stringify(readiness));
}

const sample = domain.describe(cases[0]).rendererHandoff.descriptors;
const composed = handoff.describe(sample);
assert.equal(composed.counts.total, 22);
assert.deepEqual(Object.keys(composed.descriptors), ["catchmentGutters", "palmLeafChannels", "charcoalFilterBeds", "cisternBoilWatches", "clayJugRationRoutes", "dawnHydrationStations"]);

console.log("tropical rainwater purification readiness kits smoke passed: 10 intake cases");
