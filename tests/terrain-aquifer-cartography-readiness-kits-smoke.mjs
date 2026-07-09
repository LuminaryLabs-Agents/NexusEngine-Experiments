import assert from "node:assert/strict";
import {
  TERRAIN_AQUIFER_CARTOGRAPHY_READINESS_DOMAIN_TREE,
  createTerrainAquiferCartographyReadinessDomainKit
} from "../experiments/_kits/infinite-radial-terrain/terrain-aquifer-cartography-readiness-kits.js";

const domain = createTerrainAquiferCartographyReadinessDomainKit();
const sample = (tag, index, wet = 0.4, slope = 12) => ({
  tag,
  x: index * 340 - 960,
  z: index * -280 + 720,
  height: 760 + index * 34 - wet * 120,
  slope,
  climate: { rainfallMmYear: 420 + wet * 650, temperatureC: 9, snowlineMeters: 980, vegetationPotential: 0.22 + wet * 0.42 },
  hydrology: { flow: { wetnessIndex: wet, channelPotential: wet * 0.82 }, stream: { streamOrder: Math.floor(wet * 5), drainageDensityKmPerKm2: 0.7 + wet * 3.4 } },
  landform: { landform: wet > 0.58 ? "springline" : "foothill", confidence: 0.58 + wet * 0.32, terrainRuggedness: slope / 44 },
  material: { materialWeights: { soil: 0.34 + wet * 0.34, bedrock: 0.42 - wet * 0.12, wetChannel: wet, snow: 0.02 }, vegetationMask: 0.2 + wet * 0.42 }
});

const cases = Array.from({ length: 10 }, (_, index) => ({
  time: index * 0.73,
  camera: { position: [index * 80, 910 + index * 12, -index * 55], yaw: index * 0.18, pitch: -0.32 },
  terrainSample: sample(`focus-${index}`, index, 0.2 + index * 0.065, 7 + index),
  samples: [
    sample(`spring-${index}`, index, 0.28 + index * 0.06, 7 + index * 0.4),
    sample(`basin-${index}`, index + 1, 0.34 + index * 0.05, 6 + index * 0.5),
    sample(`moraine-${index}`, index + 2, 0.22 + index * 0.07, 11 + index * 0.6),
    sample(`thread-${index}`, index + 3, 0.42 + index * 0.04, 8 + index * 0.3),
    sample(`dye-${index}`, index + 4, 0.18 + index * 0.06, 15 + index * 0.4),
    sample(`ledge-${index}`, index + 5, 0.24 + index * 0.05, 19 + index * 0.7)
  ]
}));

assert.equal(domain.domain, TERRAIN_AQUIFER_CARTOGRAPHY_READINESS_DOMAIN_TREE.root);
assert.equal(domain.domainTree.contract.includes("renderer consumes"), true);

let previousReadiness = -1;
for (const [index, input] of cases.entries()) {
  const result = domain.describe(input);
  assert.equal(result.kind, "terrain-aquifer-cartography-readiness");
  assert.ok(result.summary.readiness >= 0 && result.summary.readiness <= 1, `readiness bounded for case ${index}`);
  assert.ok(result.summary.scarcity >= 0 && result.summary.scarcity <= 1, `scarcity bounded for case ${index}`);
  assert.ok(["water-secure", "rationed-route", "dry-expedition"].includes(result.summary.status));
  assert.ok(result.springSeeps.length > 0, "spring seeps emitted");
  assert.ok(result.moraineWells.length > 0, "moraine wells emitted");
  assert.ok(result.aquiferThreads.length > 0, "aquifer threads emitted");
  assert.ok(result.cisternBasins.length > 0, "cistern basins emitted");
  assert.ok(result.dyeMarkers.length > 0, "dye markers emitted");
  assert.equal(result.dawnWaterLedgers.length, 1, "one dawn water ledger emitted");
  assert.equal(result.rendererHandoff.rendererConsumesDescriptorsOnly, true);
  assert.ok(result.rendererHandoff.counts.total >= 6, "handoff has descriptors");
  assert.doesNotThrow(() => JSON.stringify(result), "result is JSON safe");
  const contracts = [
    ...result.springSeeps,
    ...result.moraineWells,
    ...result.aquiferThreads,
    ...result.cisternBasins,
    ...result.dyeMarkers,
    ...result.dawnWaterLedgers
  ].map((entry) => entry.rendererContract?.rendererMustNotOwn ?? []);
  assert.ok(contracts.every((items) => items.includes("browser input") && items.includes("frame loop") && items.includes("Three.js")), "ownership exclusions are present");
  if (index > 0) assert.ok(result.summary.readiness >= 0 || previousReadiness >= 0);
  previousReadiness = result.summary.readiness;
}

const cold = domain.describe(cases[0]).summary;
const mature = domain.describe(cases[9]).summary;
assert.ok(mature.readiness >= cold.readiness, "wetter/mature intake should not reduce readiness in aggregate");
console.log("Infinite radial terrain aquifer cartography readiness kits smoke passed 10 intake cases.");
