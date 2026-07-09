import assert from "node:assert/strict";
import {
  TERRAIN_SKYBRIDGE_SHELTER_READINESS_DOMAIN_TREE,
  createTerrainSkybridgeShelterReadinessDomainKit
} from "../experiments/_kits/infinite-radial-terrain/terrain-skybridge-shelter-readiness-kits.js";

function makeSample(tag, index, boost = 0) {
  const height = 840 + index * 190 + boost * 45;
  const snow = Math.min(1, 0.16 + index * 0.055 + boost * 0.03);
  const ruggedness = Math.min(1, 0.22 + index * 0.048 + (tag.includes("anchor") ? 0.22 : 0));
  return {
    tag,
    x: index * 370 - 920,
    z: 1240 - index * 260,
    height,
    slope: tag.includes("tent") ? 8 + index : 13 + index * 2.2,
    climate: { temperatureC: 7 - index - boost * 0.5, snowlineMeters: 940, vegetationPotential: 0.42 - snow * 0.18 },
    hydrology: { flow: { wetnessIndex: 0.12 + index * 0.025, channelPotential: 0.1 + index * 0.018 }, stream: { streamOrder: 1, drainageDensityKmPerKm2: 1.1 + index * 0.12 } },
    landform: { landform: tag.includes("tent") ? "bench" : "ridge", confidence: 0.46 + index * 0.036, terrainRuggedness: ruggedness },
    material: { materialWeights: { bedrock: 0.24 + ruggedness * 0.42, soil: 0.58 - ruggedness * 0.16, wetChannel: 0.08 + index * 0.018, snow }, vegetationMask: 0.26 - snow * 0.06 }
  };
}

function makeCase(index) {
  const tags = ["focus", "north-anchor", "south-anchor", "wind-span", "heat-tent-bench", "crevasse-lip", "beacon-mirror", "low-shelter-cache"];
  const samples = tags.map((tag, sampleIndex) => makeSample(tag, sampleIndex, index));
  return {
    time: index * 11.25,
    camera: { position: { x: index * 85, y: 1320 + index * 55, z: -index * 140 }, yaw: index * 0.18, pitch: -0.28 },
    terrain: { origin: { x: 0, z: 0 }, focus: { x: samples[0].x, y: samples[0].height, z: samples[0].z }, bands: [] },
    terrainSample: samples[0],
    samples,
    visual: { exposure: index / 10 },
    expedition: { distanceMeters: index * 500 },
    observatoryEvacuation: { summary: { readiness: index / 10 } },
    avalancheRescue: { summary: { readiness: index / 12 } }
  };
}

const kit = createTerrainSkybridgeShelterReadinessDomainKit();
assert.equal(TERRAIN_SKYBRIDGE_SHELTER_READINESS_DOMAIN_TREE.root, "terrain-skybridge-shelter-readiness-domain");
assert.ok(TERRAIN_SKYBRIDGE_SHELTER_READINESS_DOMAIN_TREE.contract.includes("renderer consumes"));

const results = Array.from({ length: 10 }, (_, index) => kit.describe(makeCase(index)));
for (const [index, state] of results.entries()) {
  assert.equal(state.domain, "terrain-skybridge-shelter-readiness-domain", `case ${index} domain`);
  assert.ok(state.ridgeAnchors.length >= 4, `case ${index} ridge anchors`);
  assert.ok(state.spanCables.length >= 3, `case ${index} span cables`);
  assert.ok(state.heatTents.length >= 3, `case ${index} heat tents`);
  assert.ok(state.crevasseWarnings.length >= 4, `case ${index} crevasse warnings`);
  assert.ok(state.beaconMirrors.length >= 3, `case ${index} beacon mirrors`);
  assert.equal(state.shelterLedgers.length, 1, `case ${index} shelter ledger`);
  assert.ok(state.readiness >= 0 && state.readiness <= 1, `case ${index} readiness bounded`);
  assert.ok(state.exposure >= 0 && state.exposure <= 1, `case ${index} exposure bounded`);
  assert.ok(["hold", "guide", "open"].includes(state.missionState), `case ${index} mission state`);
  assert.equal(state.rendererHandoff.rendererConsumesDescriptorsOnly, true, `case ${index} descriptors only`);
  assert.equal(state.rendererHandoff.rendererContract.rendererMustOwn.includes("DOM placement"), true, `case ${index} renderer owns DOM placement`);
  assert.equal(state.rendererHandoff.counts.total, state.ridgeAnchors.length + state.spanCables.length + state.heatTents.length + state.crevasseWarnings.length + state.beaconMirrors.length + state.shelterLedgers.length, `case ${index} count total`);
  assert.doesNotThrow(() => JSON.stringify(state), `case ${index} JSON serializable`);
}
assert.ok(results.some((state) => state.spanCables.some((span) => span.status !== "do-not-cross")), "at least one case should produce a usable span state");
console.log("Infinite Radial Terrain skybridge shelter readiness kits smoke passed 10 intake cases.");
