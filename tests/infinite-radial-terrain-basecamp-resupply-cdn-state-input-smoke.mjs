import "./infinite-radial-terrain-basecamp-resupply-readiness-kits-smoke.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTerrainBasecampResupplyReadinessDomainKit } from "../experiments/_kits/infinite-radial-terrain/terrain-basecamp-resupply-readiness-kits.js";

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const index = readFileSync("experiments/infinite-radial-terrain/index.html", "utf8");
const entry = readFileSync("experiments/infinite-radial-terrain/terrain-basecamp-resupply-readiness-entry.js", "utf8");
const kits = readFileSync("experiments/_kits/infinite-radial-terrain/terrain-basecamp-resupply-readiness-kits.js", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");
const playwrightSmoke = readFileSync("tests/infinite-radial-terrain-playwright-state-input-smoke.mjs", "utf8");

assert.ok(entry.includes(nexusEngineCdn), "basecamp resupply overlay should import NexusEngine main CDN");
assert.ok(!entry.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"), "basecamp overlay should not import old NexusRealtime runtime CDN");
assert.ok(index.includes("infinite-radial-terrain-basecamp-resupply-readiness-v1"), "index should cache-bust basecamp resupply overlay");
assert.ok(index.includes("basecamp resupply"), "route shell should advertise basecamp resupply descriptors");
assert.ok(manifest.includes("terrain-basecamp-resupply-readiness-domain-kit"), "manifest should register basecamp resupply domain kit");
assert.ok(manifest.includes("basecamp-resupply-readiness-renderer-handoff-pass"), "manifest should mark basecamp resupply pass");
assert.ok(playwrightSmoke.includes("infinite-radial-terrain-basecamp-resupply-readiness-kits-smoke.mjs"), "Playwright smoke should route kit smoke");
assert.ok(playwrightSmoke.includes("infinite-radial-terrain-basecamp-resupply-cdn-state-input-smoke.mjs"), "Playwright smoke should route CDN/state smoke");

for (const expected of [
  "createTerrainBasecampResupplyReadinessDomainKit",
  "getBasecampResupplyReadiness",
  "getInfiniteRadialTerrainBasecampResupplyReadiness",
  "getBasecampResupplyReadinessTree",
  "infiniteRadialTerrainBasecampResupply",
  "rendererConsumes = \"descriptors-only\"",
  "composeHandoff(originalGetRendererHandoff?.(), current)",
  "document.body.dataset.terrainBasecampResupplyReadiness = \"enabled\""
]) {
  assert.ok(entry.includes(expected), expected);
}

for (const expected of [
  "TERRAIN_BASECAMP_RESUPPLY_READINESS_DOMAIN_TREE",
  "createTerrainBasecampSupplyCacheKit",
  "createTerrainLandingZoneCertificationKit",
  "createTerrainWeatherWindowFlagKit",
  "createTerrainSampleCrateRouteKit",
  "createTerrainEmergencyBivouacShelterKit",
  "createTerrainReturnFuelBeaconKit",
  "createTerrainBasecampResupplyRendererHandoffKit",
  "renderer consumes terrain basecamp resupply descriptors only"
]) {
  assert.ok(kits.includes(expected), expected);
}

const domain = createTerrainBasecampResupplyReadinessDomainKit();
const makeInput = (index) => ({
  time: index / 10,
  camera: { position: { x: index * 220, y: 860 + index * 58, z: -index * 160 }, yaw: index * 0.21, pitch: -0.34 + index * 0.015 },
  terrain: { origin: { x: 0, z: 0 }, focus: { x: index * 80, y: 500 + index * 18, z: -index * 40 }, bands: [{ id: `near-${index}` }] },
  terrainSample: { tag: "focus", x: index * 80, z: -index * 40, height: 500 + index * 18, slope: 8 + index, hydrology: { flow: { wetnessIndex: 0.18, channelPotential: 0.2 } }, landform: { confidence: 0.55, terrainRuggedness: 0.22 }, material: { materialWeights: { wetChannel: 0.12, snow: 0.01 }, vegetationMask: 0.34 } },
  samples: Array.from({ length: 8 }, (_, sampleIndex) => ({
    tag: ["focus", "cache-bench", "landing-bench", "river-cache", "ridge-bivouac", "valley-crate", "return-landing", "far-cache"][sampleIndex],
    x: index * 180 + sampleIndex * 260,
    z: -index * 140 - sampleIndex * 210,
    height: 460 + index * 20 + sampleIndex * 36,
    slope: 6 + (sampleIndex % 6) * 4,
    climate: { vegetationPotential: 0.25 + sampleIndex * 0.06 },
    hydrology: { flow: { wetnessIndex: 0.1 + sampleIndex * 0.04, channelPotential: 0.18 + sampleIndex * 0.05 } },
    landform: { confidence: 0.42 + sampleIndex * 0.05, terrainRuggedness: 0.18 + sampleIndex * 0.07 },
    material: { materialWeights: { wetChannel: 0.1 + sampleIndex * 0.03, snow: sampleIndex > 6 ? 0.15 : 0.01 }, vegetationMask: 0.28 + sampleIndex * 0.04 }
  }))
});

const simulatedInputs = Array.from({ length: 10 }, (_, index) => makeInput(index));
for (const intake of simulatedInputs) {
  const described = domain.describe(intake);
  assert.ok(described.basecampSupplyCaches.length > 0);
  assert.ok(described.landingZoneCertifications.length > 0);
  assert.ok(described.weatherWindowFlags.length > 0);
  assert.ok(described.sampleCrateRoutes.length > 0);
  assert.ok(described.emergencyBivouacShelters.length > 0);
  assert.equal(described.returnFuelBeacons.length, 3);
  assert.ok(described.rendererHandoff.counts.total >= 20);
  assert.ok(Number.isFinite(described.summary.readiness));
  assert.doesNotThrow(() => JSON.stringify(described));
}

console.log("infinite radial terrain basecamp resupply CDN/state-input smoke passed: 10 intake cases");
