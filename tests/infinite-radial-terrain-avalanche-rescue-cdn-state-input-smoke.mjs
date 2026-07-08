import "./infinite-radial-terrain-avalanche-rescue-readiness-kits-smoke.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTerrainAvalancheRescueReadinessDomainKit } from "../experiments/_kits/infinite-radial-terrain/terrain-avalanche-rescue-readiness-kits.js";

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const index = readFileSync("experiments/infinite-radial-terrain/index.html", "utf8");
const entry = readFileSync("experiments/infinite-radial-terrain/terrain-avalanche-rescue-readiness-entry.js", "utf8");
const kits = readFileSync("experiments/_kits/infinite-radial-terrain/terrain-avalanche-rescue-readiness-kits.js", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");
const playwrightSmoke = readFileSync("tests/infinite-radial-terrain-playwright-state-input-smoke.mjs", "utf8");

assert.ok(entry.includes(nexusEngineCdn), "avalanche rescue overlay should import NexusEngine main CDN");
assert.ok(!entry.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"), "avalanche rescue overlay should not import old NexusRealtime runtime CDN");
assert.ok(index.includes("infinite-radial-terrain-avalanche-rescue-readiness-v1"), "index should cache-bust avalanche rescue overlay");
assert.ok(index.includes("avalanche rescue descriptors enabled"), "route shell should advertise avalanche rescue descriptors");
assert.ok(manifest.includes("terrain-avalanche-rescue-readiness-domain-kit"), "manifest should register avalanche rescue domain kit");
assert.ok(manifest.includes("avalanche-rescue-readiness-renderer-handoff-pass"), "manifest should mark avalanche rescue pass");
assert.ok(playwrightSmoke.includes("infinite-radial-terrain-avalanche-rescue-readiness-kits-smoke.mjs"), "Playwright smoke should route avalanche kit smoke");
assert.ok(playwrightSmoke.includes("infinite-radial-terrain-avalanche-rescue-cdn-state-input-smoke.mjs"), "Playwright smoke should route avalanche CDN/state smoke");

for (const expected of [
  "createTerrainAvalancheRescueReadinessDomainKit",
  "getAvalancheRescueReadiness",
  "getInfiniteRadialTerrainAvalancheRescueReadiness",
  "getAvalancheRescueReadinessTree",
  "infiniteRadialTerrainAvalancheRescue",
  "rendererConsumes = \"descriptors-only\"",
  "composeHandoff(originalGetRendererHandoff?.(), current)",
  "document.body.dataset.terrainAvalancheRescueReadiness = \"enabled\""
]) {
  assert.ok(entry.includes(expected), expected);
}

for (const expected of [
  "TERRAIN_AVALANCHE_RESCUE_READINESS_DOMAIN_TREE",
  "createTerrainBuriedCampTransponderKit",
  "createTerrainSnowfieldProbeLaneKit",
  "createTerrainAvalancheCrownHazardKit",
  "createTerrainRidgeShelterPocketKit",
  "createTerrainRescueSledCorridorKit",
  "createTerrainMedevacBeaconWindowKit",
  "createTerrainAvalancheRescueRendererHandoffKit",
  "renderer consumes terrain avalanche rescue descriptors only"
]) {
  assert.ok(kits.includes(expected), expected);
}

const domain = createTerrainAvalancheRescueReadinessDomainKit();
const makeInput = (index) => ({
  time: index / 9,
  camera: { position: { x: index * 240, y: 1040 + index * 72, z: -index * 170 }, yaw: index * 0.19, pitch: -0.38 + index * 0.012 },
  terrain: { origin: { x: 0, z: 0 }, focus: { x: index * 90, y: 820 + index * 34, z: -index * 50 }, bands: [{ id: `near-${index}` }] },
  terrainSample: { tag: "rescue-focus", x: index * 90, z: -index * 50, height: 820 + index * 34, slope: 22 + index, climate: { temperatureC: -2, snowlineMeters: 980, vegetationPotential: 0.22 }, hydrology: { flow: { wetnessIndex: 0.16, channelPotential: 0.22 } }, landform: { confidence: 0.58, terrainRuggedness: 0.38 }, material: { materialWeights: { wetChannel: 0.12, snow: 0.34 }, vegetationMask: 0.2 } },
  samples: Array.from({ length: 8 }, (_, sampleIndex) => ({
    tag: ["rescue-focus", "buried-camp", "snowfield-probe", "avalanche-crown", "ridge-shelter", "sled-valley", "medevac-bench", "far-crown"][sampleIndex],
    x: index * 210 + sampleIndex * 290,
    z: -index * 160 - sampleIndex * 240,
    height: 760 + index * 32 + sampleIndex * 86,
    slope: 14 + (sampleIndex % 6) * 5,
    climate: { vegetationPotential: 0.26 - sampleIndex * 0.01, temperatureC: 2 - sampleIndex * 0.9, snowlineMeters: 980 },
    hydrology: { flow: { wetnessIndex: 0.08 + sampleIndex * 0.035, channelPotential: 0.16 + sampleIndex * 0.045 } },
    landform: { confidence: 0.44 + sampleIndex * 0.055, terrainRuggedness: 0.2 + sampleIndex * 0.075 },
    material: { materialWeights: { wetChannel: 0.08 + sampleIndex * 0.025, snow: 0.16 + sampleIndex * 0.065 }, vegetationMask: 0.24 - sampleIndex * 0.008 }
  }))
});

const simulatedInputs = Array.from({ length: 10 }, (_, index) => makeInput(index));
for (const intake of simulatedInputs) {
  const described = domain.describe(intake);
  assert.ok(described.buriedCampTransponders.length > 0);
  assert.ok(described.snowfieldProbeLanes.length > 0);
  assert.ok(described.avalancheCrownHazards.length > 0);
  assert.ok(described.ridgeShelterPockets.length > 0);
  assert.ok(described.rescueSledCorridors.length > 0);
  assert.equal(described.medevacBeaconWindows.length, 3);
  assert.ok(described.rendererHandoff.counts.total >= 20);
  assert.ok(Number.isFinite(described.summary.readiness));
  assert.doesNotThrow(() => JSON.stringify(described));
}

console.log("infinite radial terrain avalanche rescue CDN/state-input smoke passed: 10 intake cases");
