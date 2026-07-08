import assert from "node:assert/strict";
import {
  TERRAIN_BASECAMP_RESUPPLY_READINESS_DOMAIN_TREE,
  createTerrainBasecampSupplyCacheKit,
  createTerrainLandingZoneCertificationKit,
  createTerrainWeatherWindowFlagKit,
  createTerrainSampleCrateRouteKit,
  createTerrainEmergencyBivouacShelterKit,
  createTerrainReturnFuelBeaconKit,
  createTerrainBasecampResupplyRendererHandoffKit,
  createTerrainBasecampResupplyReadinessDomainKit
} from "../experiments/_kits/infinite-radial-terrain/terrain-basecamp-resupply-readiness-kits.js";

const makeSample = (index, tag = `sample-${index}`) => ({
  tag,
  x: index * 310 - 900,
  z: index * -220 + 480,
  height: 540 + index * 38 + Math.sin(index) * 90,
  slope: 6 + (index % 7) * 5,
  climate: { vegetationPotential: Math.min(1, 0.22 + index * 0.06), rainfallMmYear: 520 + index * 90 },
  hydrology: { flow: { wetnessIndex: Math.min(1, 0.12 + index * 0.05), channelPotential: Math.min(1, 0.16 + index * 0.07) }, stream: { streamOrder: index % 5, drainageDensityKmPerKm2: 1.1 + index * 0.2 } },
  landform: { confidence: Math.min(1, 0.42 + index * 0.04), terrainRuggedness: Math.min(1, 0.18 + (index % 5) * 0.12), landform: index % 2 ? "ridge" : "bench" },
  material: { materialWeights: { bedrock: 0.22 + index * 0.03, soil: 0.7 - index * 0.02, wetChannel: Math.min(1, 0.1 + index * 0.04), snow: index > 7 ? 0.18 : 0.01 }, vegetationMask: Math.min(1, 0.24 + index * 0.05) }
});

const intakes = Array.from({ length: 10 }, (_, index) => ({
  time: index / 7,
  camera: { position: { x: index * 140, y: 900 + index * 45, z: -index * 115 }, yaw: index * 0.14, pitch: -0.36 + index * 0.02 },
  terrain: { origin: { x: 0, z: 0 }, focus: { x: index * 35, y: 520, z: -index * 25 }, bands: [] },
  terrainSample: makeSample(index, "focus"),
  samples: Array.from({ length: 8 }, (_, sampleIndex) => makeSample(sampleIndex + index, ["focus", "cache-bench", "landing-bench", "river-cache", "ridge-bivouac", "valley-crate", "return-landing", "far-cache"][sampleIndex]))
}));

assert.equal(TERRAIN_BASECAMP_RESUPPLY_READINESS_DOMAIN_TREE.root, "terrain-basecamp-resupply-readiness-domain");
assert.equal(TERRAIN_BASECAMP_RESUPPLY_READINESS_DOMAIN_TREE.subdomains.length, 4);
assert.ok(TERRAIN_BASECAMP_RESUPPLY_READINESS_DOMAIN_TREE.contract.includes("no DOM"));
assert.ok(TERRAIN_BASECAMP_RESUPPLY_READINESS_DOMAIN_TREE.contract.includes("Three.js"));

const supplyCacheKit = createTerrainBasecampSupplyCacheKit();
const landingZoneKit = createTerrainLandingZoneCertificationKit();
const weatherWindowKit = createTerrainWeatherWindowFlagKit();
const sampleCrateRouteKit = createTerrainSampleCrateRouteKit();
const bivouacShelterKit = createTerrainEmergencyBivouacShelterKit();
const returnFuelBeaconKit = createTerrainReturnFuelBeaconKit();
const handoffKit = createTerrainBasecampResupplyRendererHandoffKit();
const domain = createTerrainBasecampResupplyReadinessDomainKit();

for (const intake of intakes) {
  const caches = supplyCacheKit.describe(intake);
  const zones = landingZoneKit.describe(intake);
  const flags = weatherWindowKit.describe(intake);
  const routes = sampleCrateRouteKit.describe(intake);
  const shelters = bivouacShelterKit.describe(intake);
  const beacons = returnFuelBeaconKit.describe(intake);
  const handoff = handoffKit.describe(intake);
  const described = domain.describe(intake);

  assert.ok(caches.length > 0 && caches.length <= 5);
  assert.ok(caches.every((cache) => cache.kind === "basecamp-supply-cache" && cache.rendererContract.rendererMustNotOwn.includes("Three.js")));
  assert.ok(zones.length > 0 && zones.length <= 4);
  assert.ok(zones.every((zone) => zone.kind === "landing-zone-certification" && ["certified", "approach-only", "unsafe"].includes(zone.status)));
  assert.ok(flags.length > 0 && flags.length <= 4);
  assert.ok(flags.every((flag) => flag.kind === "weather-window-flag" && ["open", "watch", "closing"].includes(flag.window)));
  assert.ok(routes.length > 0 && routes.length <= 5);
  assert.ok(routes.every((route) => route.kind === "sample-crate-route" && route.from && route.to));
  assert.ok(shelters.length > 0 && shelters.length <= 4);
  assert.ok(shelters.every((shelter) => shelter.kind === "emergency-bivouac-shelter" && shelter.radiusMeters > 0));
  assert.equal(beacons.length, 3);
  assert.ok(beacons.every((beacon) => beacon.kind === "return-fuel-beacon" && ["green", "amber", "red"].includes(beacon.status)));
  assert.equal(handoff.counts.basecampSupplyCaches, caches.length);
  assert.equal(handoff.counts.landingZoneCertifications, zones.length);
  assert.equal(handoff.counts.weatherWindowFlags, flags.length);
  assert.equal(handoff.counts.sampleCrateRoutes, routes.length);
  assert.equal(handoff.counts.emergencyBivouacShelters, shelters.length);
  assert.equal(handoff.counts.returnFuelBeacons, beacons.length);
  assert.equal(handoff.counts.total, Object.values(handoff.descriptors).reduce((sum, list) => sum + list.length, 0));
  assert.equal(described.rendererHandoff.counts.total, handoff.counts.total);
  assert.ok(Number.isFinite(described.summary.readiness));
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(described)));
}

const source = await import("node:fs").then(({ readFileSync }) => readFileSync("experiments/_kits/infinite-radial-terrain/terrain-basecamp-resupply-readiness-kits.js", "utf8"));
for (const forbidden of ["document.", "window.", "THREE", "WebGL", "AudioContext", "requestAnimationFrame", "addEventListener"])
  assert.ok(!source.includes(forbidden), `kit should not own ${forbidden}`);

console.log("infinite radial terrain basecamp resupply readiness kit smoke passed: 10 intake cases");
