import assert from "node:assert/strict";
import {
  TROPICAL_STORM_CLINIC_READINESS_DOMAIN_TREE,
  createTropicalInjuredSnorkelerTriageBuoyKit,
  createTropicalFreshwaterCisternPurityKit,
  createTropicalClinicTentShadeKit,
  createTropicalRaftStretcherLaneKit,
  createTropicalFeverHerbGardenKit,
  createTropicalDawnEvacuationCanoeKit,
  createTropicalStormClinicRendererHandoffKit,
  createTropicalStormClinicReadinessDomainKit
} from "../experiments/tropical-island-scene/src/tropical-storm-clinic-readiness-domain-kit.js";

const cases = Array.from({ length: 10 }, (_, index) => ({
  time: index * 7.5,
  orbit: index * 0.21,
  fish: Array.from({ length: 5 }, (__, fishIndex) => ({ id: `fish-${index}-${fishIndex}`, x: -12 + fishIndex * 6, y: 0.4 + fishIndex * 0.05, z: 14 - fishIndex * 3 })),
  floatProps: Array.from({ length: 4 }, (__, propIndex) => ({ id: `float-${index}-${propIndex}`, x: -16 + propIndex * 9, y: 0.2, z: 18 - propIndex * 4 })),
  tideSalvageReadiness: { rendererHandoff: { counts: { tideSurgeWindows: index % 4 } } },
  reefRescueReadiness: { rendererHandoff: { counts: { extractionPierBeacons: (index + 1) % 4 } } },
  weatherShelterReadability: { rendererHandoff: { counts: { stormFronts: index % 3 } } }
}));

assert.ok(TROPICAL_STORM_CLINIC_READINESS_DOMAIN_TREE.includes("patient-triage-domain"));
assert.ok(TROPICAL_STORM_CLINIC_READINESS_DOMAIN_TREE.includes("renderer consumes descriptors only"));

const atomicKits = [
  createTropicalInjuredSnorkelerTriageBuoyKit(),
  createTropicalFreshwaterCisternPurityKit(),
  createTropicalClinicTentShadeKit(),
  createTropicalRaftStretcherLaneKit(),
  createTropicalFeverHerbGardenKit(),
  createTropicalDawnEvacuationCanoeKit()
];

const domain = createTropicalStormClinicReadinessDomainKit();
const handoff = createTropicalStormClinicRendererHandoffKit();

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
  assert.equal(readiness.kind, "tropical-storm-clinic-readiness-domain");
  assert.equal(readiness.rendererHandoff.contract, "renderer-consumes-descriptors-only");
  assert.equal(readiness.rendererHandoff.counts.triageBuoys, 4);
  assert.equal(readiness.rendererHandoff.counts.cisternPurityMarkers, 3);
  assert.equal(readiness.rendererHandoff.counts.clinicTentShades, 4);
  assert.equal(readiness.rendererHandoff.counts.raftStretcherLanes, 4);
  assert.equal(readiness.rendererHandoff.counts.feverHerbGardens, 5);
  assert.equal(readiness.rendererHandoff.counts.evacuationCanoeWindows, 3);
  assert.equal(readiness.rendererHandoff.counts.total, 23);
  assert.ok(readiness.subdomains.patientTriage.descriptors.triageBuoys.length > 0);
  assert.ok(readiness.subdomains.clinicShelter.descriptors.clinicTentShades.length > 0);
  assert.ok(readiness.subdomains.recoveryHandoff.descriptors.evacuationCanoeWindows.length > 0);
  assert.doesNotThrow(() => JSON.stringify(readiness));
}

const sample = domain.describe(cases[0]).rendererHandoff.descriptors;
const composed = handoff.describe(sample);
assert.equal(composed.counts.total, 23);
assert.deepEqual(Object.keys(composed.descriptors), ["triageBuoys", "cisternPurityMarkers", "clinicTentShades", "raftStretcherLanes", "feverHerbGardens", "evacuationCanoeWindows"]);

console.log("tropical storm clinic readiness kits smoke passed: 10 intake cases");
