import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  TROPICAL_WEATHER_SHELTER_DOMAIN_TREE,
  createTropicalStormFrontSweepKit,
  createTropicalShelterPalmCanopyKit,
  createTropicalTideEscapeWindowKit,
  createTropicalWaveBreakWarningKit,
  createTropicalSupplyCacheGlintKit,
  createTropicalDuskReturnBeaconKit,
  createTropicalWeatherShelterReadabilityDomainKit
} from "../experiments/tropical-island-scene/src/tropical-weather-shelter-readability-domain-kit.js";

const source = readFileSync("experiments/tropical-island-scene/src/tropical-weather-shelter-readability-domain-kit.js", "utf8");
const forbiddenRuntimeTokens = ["document.", "window.", "requestAnimationFrame", "from \"three", "WebGLRenderer", "AudioContext", "addEventListener"];
for (const token of forbiddenRuntimeTokens) {
  assert.equal(source.includes(token), false, `renderer-neutral kit source must not contain ${token}`);
}

assert.match(TROPICAL_WEATHER_SHELTER_DOMAIN_TREE, /tropical-weather-shelter-readability-domain/);
assert.match(TROPICAL_WEATHER_SHELTER_DOMAIN_TREE, /renderer consumes descriptors only/);

const stormKit = createTropicalStormFrontSweepKit();
const shelterKit = createTropicalShelterPalmCanopyKit();
const tideKit = createTropicalTideEscapeWindowKit();
const waveKit = createTropicalWaveBreakWarningKit();
const cacheKit = createTropicalSupplyCacheGlintKit();
const duskKit = createTropicalDuskReturnBeaconKit();
const domain = createTropicalWeatherShelterReadabilityDomainKit({ engine: "NexusEngine main CDN smoke" });

const cases = Array.from({ length: 10 }, (_, index) => ({
  time: index * 17.3,
  orbit: -0.8 + index * 0.21,
  camera: { angle: -0.8 + index * 0.21 },
  palms: Array.from({ length: 3 + (index % 4) }, (__, palmIndex) => ({ id: `palm-${index}-${palmIndex}`, x: -14 + palmIndex * 8, y: 2 + palmIndex * 0.2, z: -16 + index - palmIndex * 4, scale: 0.8 + palmIndex * 0.15 })),
  coconuts: Array.from({ length: 2 + (index % 5) }, (__, cacheIndex) => ({ id: `coconut-${index}-${cacheIndex}`, x: -8 + cacheIndex * 4, y: 0.8, z: 6 - cacheIndex * 3, scale: 0.8 + cacheIndex * 0.1 })),
  floatProps: Array.from({ length: 2 + (index % 3) }, (__, propIndex) => ({ id: `float-${index}-${propIndex}`, x: -10 + propIndex * 7, y: 0, z: -10 - propIndex * 4, scale: 1 }))
}));

for (const [index, input] of cases.entries()) {
  const stormFronts = stormKit.describe(input);
  const shelterCanopies = shelterKit.describe(input);
  const tideEscapeWindows = tideKit.describe(input);
  const waveBreakWarnings = waveKit.describe(input);
  const supplyCacheGlints = cacheKit.describe(input);
  const duskReturnBeacons = duskKit.describe(input);
  const described = domain.describe(input);
  const descriptors = described.rendererHandoff.descriptors;
  const counts = described.rendererHandoff.counts;

  assert.equal(stormFronts.length >= 3, true, `case ${index} storm fronts`);
  assert.equal(shelterCanopies.length >= 3, true, `case ${index} shelter canopies`);
  assert.equal(tideEscapeWindows.length >= 3, true, `case ${index} tide windows`);
  assert.equal(waveBreakWarnings.length >= 4, true, `case ${index} wave warnings`);
  assert.equal(supplyCacheGlints.length >= 2, true, `case ${index} supply cache glints`);
  assert.equal(duskReturnBeacons.length >= 3, true, `case ${index} dusk beacons`);

  assert.equal(described.kind, "tropical-weather-shelter-readability-domain");
  assert.equal(described.rendererHandoff.contract, "renderer-consumes-descriptors-only");
  assert.deepEqual(Object.keys(descriptors).sort(), ["duskReturnBeacons", "shelterCanopies", "stormFronts", "supplyCacheGlints", "tideEscapeWindows", "waveBreakWarnings"].sort());
  assert.equal(counts.stormFronts, descriptors.stormFronts.length);
  assert.equal(counts.shelterCanopies, descriptors.shelterCanopies.length);
  assert.equal(counts.tideEscapeWindows, descriptors.tideEscapeWindows.length);
  assert.equal(counts.waveBreakWarnings, descriptors.waveBreakWarnings.length);
  assert.equal(counts.supplyCacheGlints, descriptors.supplyCacheGlints.length);
  assert.equal(counts.duskReturnBeacons, descriptors.duskReturnBeacons.length);
  assert.equal(counts.total, Object.values(descriptors).reduce((sum, value) => sum + value.length, 0));
  assert.equal(descriptors.stormFronts.every((front) => front.kind === "tropical-storm-front-sweep" && front.rendererContract.renderer === "presentation-only"), true);
  assert.equal(descriptors.shelterCanopies.every((canopy) => canopy.coverScore >= 0 && canopy.coverScore <= 1), true);
  assert.equal(descriptors.tideEscapeWindows.every((window) => window.windowScore >= 0 && window.windowScore <= 1), true);
  assert.equal(descriptors.waveBreakWarnings.every((warning) => ["shore", "reef"].includes(warning.safeSide)), true);
  assert.equal(descriptors.supplyCacheGlints.every((cache) => cache.pickupPriority >= 0 && cache.pickupPriority <= 1), true);
  assert.equal(descriptors.duskReturnBeacons.every((beacon) => beacon.returnUrgency >= 0 && beacon.returnUrgency <= 1), true);
  assert.doesNotThrow(() => JSON.stringify(described));
}

console.log("tropical weather shelter readability kits smoke passed");
