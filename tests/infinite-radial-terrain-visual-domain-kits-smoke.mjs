import assert from "node:assert/strict";
import {
  INFINITE_RADIAL_TERRAIN_DOMAIN_TREE,
  createInfiniteRadialTerrainVisualDomainKit,
  createTerrainBiomeMosaicKit,
  createTerrainGeologyProvinceKit,
  createTerrainHydrologyThreadKit,
  createTerrainLodRingTelemetryKit,
  createTerrainRendererHandoffKit,
  createTerrainSkyHazeGradientKit,
  createTerrainTravelForecastKit
} from "../experiments/_kits/infinite-radial-terrain/infinite-radial-terrain-kits.js";

function makeSample(index, tag, x, z) {
  const height = 620 + index * 38 + x * 0.025 - z * 0.018;
  const channelPotential = Math.max(0.16, Math.min(0.95, 0.2 + index * 0.055 + Math.abs(x) / 5000));
  const wetnessIndex = Math.max(0.05, Math.min(0.98, 0.18 + index * 0.04 + Math.abs(z) / 4200));
  const streamOrder = index % 4;
  const vegetation = Math.max(0.08, Math.min(0.9, 0.28 + index * 0.05));
  return {
    tag,
    x,
    z,
    distance: Math.hypot(x, z),
    baseHeight: height - 12,
    height,
    slope: 8 + index * 3.4,
    curvature: -0.5 + index * 0.08,
    geology: { provinceId: `foothill-alpine:${Math.floor((x + 4000) / 2000)},${Math.floor((z + 4000) / 2000)}`, regionType: index % 3 === 0 ? "alpine" : index % 3 === 1 ? "foothill" : "basin", uplift: Math.max(0, Math.min(1, 0.38 + index * 0.055)), faultInfluence: Math.max(0, Math.min(1, 0.1 + index * 0.07)) },
    lithology: { lithology: index % 4 === 0 ? "granite" : index % 4 === 1 ? "sandstone" : index % 4 === 2 ? "shale" : "alluvium", hardness: 0.25 + index * 0.055, erodibility: 0.7 - index * 0.035, permeability: 0.2 + index * 0.04 },
    climate: { rainfallMmYear: 700 + index * 82, temperatureC: 14 - index * 0.8, snowlineMeters: 1600 + index * 45, vegetationPotential: vegetation },
    hydrology: { flow: { flowDirection: { x: index % 2 ? 0.65 : -0.42, z: index % 2 ? 0.36 : 0.8 }, channelPotential, wetnessIndex, upstreamAreaMeters2: 65000 + index * 220000 }, stream: { isChannel: channelPotential > 0.28, streamOrder, channelWidthMeters: streamOrder * 2.5, drainageDensityKmPerKm2: 1 + index * 0.18 } },
    landform: { landform: index % 5 === 0 ? "ridge" : index % 5 === 1 ? "hollow" : index % 5 === 2 ? "valley" : index % 5 === 3 ? "bench" : "cliff", confidence: 0.52 + index * 0.035, convexity: Math.max(0, 0.8 - index * 0.06), concavity: Math.max(0, index * 0.04), terrainRuggedness: Math.max(0, Math.min(1, 0.2 + index * 0.06)) },
    material: { materialWeights: { bedrock: Math.max(0, Math.min(1, 0.22 + index * 0.05)), soil: Math.max(0, Math.min(1, 0.72 - index * 0.03)), silt: Math.max(0, Math.min(1, 0.08 + index * 0.04)), snow: height > 1680 ? 0.55 : 0.05, wetChannel: wetnessIndex }, vegetationMask: vegetation, albedoHint: "mixed" }
  };
}

function makeInput(index) {
  const samples = [
    makeSample(index, "focus", index * 120, -index * 90),
    makeSample(index + 1, "ahead", 820 + index * 120, -1100 - index * 90),
    makeSample(index + 2, "far-ahead", 1600 + index * 80, -1900 - index * 70),
    makeSample(index + 3, "left-ridge", -760 + index * 60, -340 - index * 40),
    makeSample(index + 4, "right-ridge", 760 + index * 60, -300 - index * 40),
    makeSample(index + 5, "rear", -420 + index * 50, 620 - index * 30)
  ];
  return {
    time: index * 0.5,
    camera: { position: { x: index * 120, y: samples[0].height + 170 + index * 12, z: -index * 90 }, yaw: index * 0.12, pitch: -0.3 + index * 0.02 },
    terrainSample: samples[0],
    samples,
    terrain: {
      version: index,
      focus: { x: index * 120, y: samples[0].height, z: -index * 90 },
      origin: { x: Math.round(index * 120 / 250) * 250, z: Math.round(-index * 90 / 250) * 250 },
      originSnap: 250,
      bands: [
        { id: "core", innerRadius: 0, outerRadius: 520, radialSegments: 112, angularSegments: 240, lod: 0, transitionWidth: 0 },
        { id: "near", innerRadius: 470, outerRadius: 1800, radialSegments: 78, angularSegments: 208, lod: 1, transitionWidth: 180 },
        { id: "mid", innerRadius: 1600, outerRadius: 6000, radialSegments: 54, angularSegments: 168, lod: 2, transitionWidth: 520 },
        { id: "far", innerRadius: 5400, outerRadius: 16000, radialSegments: 32, angularSegments: 128, lod: 3, transitionWidth: 1400 }
      ]
    }
  };
}

const intakes = Array.from({ length: 10 }, (_, index) => makeInput(index));
const geologyProvinceKit = createTerrainGeologyProvinceKit({ maxProvinces: 10 });
const hydrologyThreadKit = createTerrainHydrologyThreadKit({ maxThreads: 10 });
const biomeMosaicKit = createTerrainBiomeMosaicKit({ maxPatches: 10 });
const lodRingTelemetryKit = createTerrainLodRingTelemetryKit();
const travelForecastKit = createTerrainTravelForecastKit({ horizonMeters: 1600 });
const skyHazeGradientKit = createTerrainSkyHazeGradientKit({ bandCount: 6 });
const rendererHandoffKit = createTerrainRendererHandoffKit({ geologyProvinceKit, hydrologyThreadKit, biomeMosaicKit, lodRingTelemetryKit, travelForecastKit, skyHazeGradientKit });
const visualDomainKit = createInfiniteRadialTerrainVisualDomainKit({ geologyProvinceKit, hydrologyThreadKit, biomeMosaicKit, lodRingTelemetryKit, travelForecastKit, skyHazeGradientKit, rendererHandoffKit });

assert.equal(INFINITE_RADIAL_TERRAIN_DOMAIN_TREE.root, "infinite-radial-terrain-domain");
assert.ok(INFINITE_RADIAL_TERRAIN_DOMAIN_TREE.contract.includes("renderer consumes descriptors only"));

for (const input of intakes) {
  const geology = geologyProvinceKit.describe(input);
  assert.equal(geologyProvinceKit.id, "n-terrain-geology-province-kit");
  assert.equal(geologyProvinceKit.domain, "infinite-radial-terrain/earth-systems/geology-province");
  assert.ok(geology.length >= 1);
  assert.ok(geology.every((entry) => entry.centroid && entry.sampleCount >= 1));

  const hydrology = hydrologyThreadKit.describe(input);
  assert.equal(hydrologyThreadKit.id, "n-terrain-hydrology-thread-kit");
  assert.equal(hydrologyThreadKit.domain, "infinite-radial-terrain/earth-systems/hydrology/channel-thread");
  assert.ok(hydrology.length >= 1);
  assert.ok(hydrology.every((entry) => entry.from && entry.to && entry.widthMeters >= 2));

  const biomes = biomeMosaicKit.describe(input);
  assert.equal(biomeMosaicKit.id, "n-terrain-biome-mosaic-kit");
  assert.equal(biomeMosaicKit.domain, "infinite-radial-terrain/earth-systems/ecology/biome-mosaic");
  assert.equal(biomes.length, input.samples.length);
  assert.ok(biomes.every((entry) => entry.position && entry.colorHint.startsWith("#")));

  const lodRings = lodRingTelemetryKit.describe(input);
  assert.equal(lodRingTelemetryKit.id, "n-terrain-lod-ring-telemetry-kit");
  assert.equal(lodRingTelemetryKit.domain, "infinite-radial-terrain/navigation-readability/lod-ring-telemetry");
  assert.equal(lodRings.length, input.terrain.bands.length);

  const forecast = travelForecastKit.describe(input);
  assert.equal(travelForecastKit.id, "n-terrain-travel-forecast-kit");
  assert.equal(travelForecastKit.domain, "infinite-radial-terrain/navigation-readability/travel-forecast/terrain-travel-forecast-kit");
  assert.equal(forecast.horizonMeters, 1600);
  assert.ok(forecast.risk >= 0 && forecast.risk <= 1);

  const sky = skyHazeGradientKit.describe(input);
  assert.equal(skyHazeGradientKit.id, "n-terrain-sky-haze-gradient-kit");
  assert.equal(skyHazeGradientKit.domain, "infinite-radial-terrain/atmospheric-handoff/sky-haze-gradient");
  assert.equal(sky.bands.length, 6);
  assert.ok(sky.backgroundColor.startsWith("#"));

  const handoff = rendererHandoffKit.describe(input);
  const visual = visualDomainKit.describe(input);
  assert.equal(rendererHandoffKit.id, "n-terrain-renderer-handoff-kit");
  assert.equal(rendererHandoffKit.domain, "infinite-radial-terrain/atmospheric-handoff/renderer-handoff");
  assert.ok(handoff.counts.total >= 1 + input.terrain.bands.length + input.samples.length);
  assert.equal(visual.rendererHandoff.counts.total, handoff.counts.total);
  assert.ok(visual.rendererContract.rendererMustNotOwn.includes("radial LOD topology"));

  const serialized = JSON.stringify(visual);
  for (const forbidden of ["WebGLRenderer", "requestAnimationFrame", "querySelector", "getElementById"]) {
    assert.ok(!serialized.includes(forbidden), `visual descriptors should not own ${forbidden}`);
  }
}

console.log("infinite radial terrain visual domain kit smoke passed: 7 changed/new kit surfaces x 10 intake cases");
