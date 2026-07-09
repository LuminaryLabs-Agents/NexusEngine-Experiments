import assert from "node:assert/strict";
import {
  TROPICAL_LAGOON_OBSERVATORY_READINESS_DOMAIN_TREE,
  createTropicalCoralSensorBuoyKit,
  createTropicalPlanktonSampleTrailKit,
  createTropicalMangroveNurseryMarkerKit,
  createTropicalMantaCorridorArcKit,
  createTropicalDataRelayKiteKit,
  createTropicalLighthouseWatchLensKit,
  createTropicalLagoonObservatoryRendererHandoffKit,
  createTropicalLagoonObservatoryReadinessDomainKit
} from "../experiments/tropical-island-scene/src/tropical-lagoon-observatory-readiness-domain-kit.js";

const cases = Array.from({ length: 10 }, (_, index) => ({
  time: index * 6.75,
  orbit: index * 0.18,
  fish: Array.from({ length: 5 }, (__, fishIndex) => ({ id: `fish-${index}-${fishIndex}`, x: -14 + fishIndex * 7, y: 0.3 + fishIndex * 0.05, z: 16 - fishIndex * 3 })),
  floatProps: Array.from({ length: 4 }, (__, propIndex) => ({ id: `float-${index}-${propIndex}`, x: -18 + propIndex * 10, y: 0.2, z: 20 - propIndex * 4 })),
  tideSalvageReadiness: { rendererHandoff: { counts: { tideSurgeWindows: index % 4, shipwreckCargoBeacons: (index + 1) % 4 } } },
  reefRescueReadiness: { rendererHandoff: { counts: { ripCurrentHazards: 2 + index % 3 } } },
  weatherShelterReadability: { rendererHandoff: { counts: { stormFronts: index % 3 } } },
  stormClinicReadiness: { rendererHandoff: { counts: { triageBuoys: 4 } } }
}));

assert.ok(TROPICAL_LAGOON_OBSERVATORY_READINESS_DOMAIN_TREE.includes("sensor-grid-domain"));
assert.ok(TROPICAL_LAGOON_OBSERVATORY_READINESS_DOMAIN_TREE.includes("renderer consumes descriptors only"));

const atomicKits = [
  createTropicalCoralSensorBuoyKit(),
  createTropicalPlanktonSampleTrailKit(),
  createTropicalMangroveNurseryMarkerKit(),
  createTropicalMantaCorridorArcKit(),
  createTropicalDataRelayKiteKit(),
  createTropicalLighthouseWatchLensKit()
];

const domain = createTropicalLagoonObservatoryReadinessDomainKit();
const handoff = createTropicalLagoonObservatoryRendererHandoffKit();

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
      assert.ok(descriptor.rendererContract.rendererMustNotOwn.includes("frame loop"));
    }
  }

  const readiness = domain.describe(intake);
  assert.equal(readiness.kind, "tropical-lagoon-observatory-readiness-domain");
  assert.equal(readiness.rendererHandoff.contract, "renderer-consumes-descriptors-only");
  assert.equal(readiness.rendererHandoff.counts.coralSensorBuoys, 4);
  assert.equal(readiness.rendererHandoff.counts.planktonSampleTrails, 5);
  assert.equal(readiness.rendererHandoff.counts.mangroveNurseryMarkers, 3);
  assert.equal(readiness.rendererHandoff.counts.mantaCorridorArcs, 3);
  assert.equal(readiness.rendererHandoff.counts.dataRelayKites, 4);
  assert.equal(readiness.rendererHandoff.counts.lighthouseWatchLenses, 2);
  assert.equal(readiness.rendererHandoff.counts.total, 21);
  assert.ok(readiness.subdomains.sensorGrid.descriptors.coralSensorBuoys.length > 0);
  assert.ok(readiness.subdomains.habitatWatch.descriptors.mantaCorridorArcs.length > 0);
  assert.ok(readiness.subdomains.nightReport.descriptors.dataRelayKites.length > 0);
  assert.doesNotThrow(() => JSON.stringify(readiness));
}

const sample = domain.describe(cases[0]).rendererHandoff.descriptors;
const composed = handoff.describe(sample);
assert.equal(composed.counts.total, 21);
assert.deepEqual(Object.keys(composed.descriptors), ["coralSensorBuoys", "planktonSampleTrails", "mangroveNurseryMarkers", "mantaCorridorArcs", "dataRelayKites", "lighthouseWatchLenses"]);

console.log("tropical lagoon observatory readiness kits smoke passed: 10 intake cases");
