import assert from "node:assert/strict";
import { createTerrainGlacierBeaconRescueReadinessDomainKit } from "../experiments/_kits/infinite-radial-terrain/terrain-glacier-beacon-rescue-readiness-kits.js";

const domain = createTerrainGlacierBeaconRescueReadinessDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => ({
  time: index * 0.37,
  camera: { position: { x: index * 180, y: 1180 + index * 35, z: -index * 140 }, yaw: index * 0.16, pitch: -0.26 },
  samples: Array.from({ length: 8 }, (_unused, sampleIndex) => {
    const high = sampleIndex % 3 === 0;
    const bridge = sampleIndex % 3 === 1;
    const height = 840 + index * 38 + sampleIndex * 95 + (high ? 260 : bridge ? 120 : 0);
    const snow = Math.max(0, Math.min(1, 0.18 + (height - 760) / 2100 + sampleIndex * 0.015));
    return {
      tag: `case-${index}-sample-${sampleIndex}`,
      x: index * 220 + sampleIndex * 410,
      z: -index * 160 + sampleIndex * 270,
      height,
      slope: high ? 20 + sampleIndex : bridge ? 12 + sampleIndex : 8 + sampleIndex,
      climate: { rainfallMmYear: 260 + snow * 300, temperatureC: 7 - height / 420, snowlineMeters: 860, vegetationPotential: 0.18 + (1 - snow) * 0.12 },
      hydrology: { flow: { wetnessIndex: 0.1 + snow * 0.22, channelPotential: bridge ? 0.45 : 0.18 }, stream: { streamOrder: bridge ? 1 : 0, drainageDensityKmPerKm2: 0.8 + snow } },
      landform: { landform: high ? "moraine-ridge" : bridge ? "ice-bridge" : "sheltered-basin", confidence: 0.58 + sampleIndex * 0.035, terrainRuggedness: Math.min(1, (12 + sampleIndex) / 44) },
      material: { materialWeights: { soil: 0.22 + sampleIndex * 0.018, bedrock: 0.44, wetChannel: 0.09 + snow * 0.12, snow }, vegetationMask: 0.16 + sampleIndex * 0.02 }
    };
  })
}));

for (const [index, input] of cases.entries()) {
  const result = domain.describe(input);
  assert.equal(result.kind, "terrain-glacier-beacon-rescue-readiness", `case ${index} kind`);
  assert.ok(result.domainTree.root.includes("glacier-beacon-rescue"), `case ${index} tree root`);
  assert.ok(result.moraineCairns.length > 0, `case ${index} cairns`);
  assert.ok(result.signalSmokes.length > 0, `case ${index} smoke`);
  assert.ok(result.iceBridgeFlags.length > 0, `case ${index} flags`);
  assert.ok(result.crevasseRopes.length > 0, `case ${index} ropes`);
  assert.ok(result.rescueSledCaches.length > 0, `case ${index} caches`);
  assert.equal(result.dawnBeaconLedgers.length, 1, `case ${index} ledger`);
  assert.ok(result.rendererHandoff.rendererConsumesDescriptorsOnly, `case ${index} handoff policy`);
  assert.ok(result.rendererHandoff.counts.total >= 12, `case ${index} descriptor total`);
  assert.ok(result.summary.readiness >= 0 && result.summary.readiness <= 1, `case ${index} readiness bounds`);
  assert.ok(result.summary.whiteoutRisk >= 0 && result.summary.whiteoutRisk <= 1, `case ${index} whiteout bounds`);
  assert.match(result.summary.status, /route-secure|flagged-approach|lost-in-whiteout/, `case ${index} status`);
  assert.doesNotThrow(() => JSON.stringify(result), `case ${index} JSON safe`);
  const contract = result.rendererHandoff.rendererContract;
  assert.ok(contract.rendererMustNotOwn.includes("frame loop"), `case ${index} frame-loop exclusion`);
  assert.ok(contract.rendererMustNotOwn.includes("Three.js"), `case ${index} Three exclusion`);
}

const cold = domain.describe({ time: 0, camera: { position: { x: 0, y: 880, z: 0 }, yaw: 0 }, samples: [{ tag: "low", x: 0, z: 0, height: 780, slope: 44, material: { materialWeights: { snow: 0.9, soil: 0.08 }, vegetationMask: 0.02 }, landform: { confidence: 0.2 }, hydrology: { flow: { wetnessIndex: 0.04 } } }] });
const prepared = domain.describe(cases[9]);
assert.ok(prepared.summary.readiness >= cold.summary.readiness, "prepared terrain improves or matches rescue readiness");
console.log("Terrain glacier beacon rescue readiness kits smoke passed 10 intake cases.");
