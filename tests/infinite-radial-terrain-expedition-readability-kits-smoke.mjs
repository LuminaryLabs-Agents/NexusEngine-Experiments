import assert from "node:assert/strict";
import {
  TERRAIN_EXPEDITION_READABILITY_DOMAIN_TREE,
  createTerrainAltitudeCorridorKit,
  createTerrainExpeditionReadabilityDomainKit,
  createTerrainExpeditionRendererHandoffKit,
  createTerrainHazardBasinKit,
  createTerrainRidgePassBeaconKit,
  createTerrainRouteTaskBandKit,
  createTerrainSampleBookmarkKit,
  createTerrainSurveyTransectKit
} from "../experiments/_kits/infinite-radial-terrain/terrain-expedition-readability-kits.js";

function makeSample(index, tag, x, z) {
  const height = 580 + index * 46 + x * 0.018 - z * 0.012;
  const channelPotential = Math.max(0.12, Math.min(0.95, 0.18 + index * 0.07 + Math.abs(x) / 5200));
  const wetnessIndex = Math.max(0.05, Math.min(0.98, 0.16 + index * 0.05 + Math.abs(z) / 4600));
  const vegetation = Math.max(0.08, Math.min(0.9, 0.26 + index * 0.045));
  return {
    tag,
    x,
    z,
    height,
    slope: 7 + index * 3.8,
    climate: { rainfallMmYear: 620 + index * 95, temperatureC: 16 - index * 0.7, snowlineMeters: 1550 + index * 60, vegetationPotential: vegetation },
    hydrology: { flow: { flowDirection: { x: index % 2 ? 0.55 : -0.38, z: index % 2 ? 0.42 : 0.86 }, channelPotential, wetnessIndex }, stream: { streamOrder: index % 4, channelWidthMeters: (index % 4) * 3, drainageDensityKmPerKm2: 1 + index * 0.2 } },
    landform: { landform: index % 5 === 0 ? "ridge" : index % 5 === 1 ? "hollow" : index % 5 === 2 ? "valley" : index % 5 === 3 ? "bench" : "cliff", confidence: 0.48 + index * 0.04, terrainRuggedness: Math.max(0, Math.min(1, 0.16 + index * 0.075)) },
    material: { materialWeights: { bedrock: Math.max(0, Math.min(1, 0.24 + index * 0.05)), soil: Math.max(0, Math.min(1, 0.78 - index * 0.035)), silt: Math.max(0, Math.min(1, 0.08 + index * 0.04)), snow: height > 1700 ? 0.55 : 0.04, wetChannel: wetnessIndex }, vegetationMask: vegetation, albedoHint: "mixed" }
  };
}

function makeInput(index) {
  const samples = [
    makeSample(index, "focus", index * 140, -index * 110),
    makeSample(index + 1, "ahead", 760 + index * 120, -860 - index * 95),
    makeSample(index + 2, "far-ahead", 1500 + index * 130, -1780 - index * 80),
    makeSample(index + 3, "left-ridge", -820 + index * 45, -320 - index * 30),
    makeSample(index + 4, "right-ridge", 840 + index * 55, -260 - index * 40),
    makeSample(index + 5, "rear", -500 + index * 50, 620 - index * 35),
    makeSample(index + 6, "north", index * 120, -1300 - index * 55),
    makeSample(index + 7, "east", 1350 + index * 40, -index * 90)
  ];
  return {
    time: index * 0.45,
    camera: { position: { x: index * 140, y: samples[0].height + 190 + index * 16, z: -index * 110 }, yaw: index * 0.13, pitch: -0.34 + index * 0.018 },
    terrainSample: samples[0],
    samples,
    visual: { travelForecast: { recommendedAction: index % 3 === 0 ? "follow-ridge-contour" : index % 3 === 1 ? "trace-river-corridor" : "gain-altitude", cueStrength: Math.min(1, 0.28 + index * 0.07) } },
    terrain: {
      version: index,
      focus: { x: samples[0].x, y: samples[0].height, z: samples[0].z },
      origin: { x: Math.round(samples[0].x / 250) * 250, z: Math.round(samples[0].z / 250) * 250 },
      bands: [
        { id: "core", innerRadius: 0, outerRadius: 520, radialSegments: 112, angularSegments: 240, lod: 0, transitionWidth: 0 },
        { id: "near", innerRadius: 470, outerRadius: 1800, radialSegments: 78, angularSegments: 208, lod: 1, transitionWidth: 180 },
        { id: "mid", innerRadius: 1600, outerRadius: 6000, radialSegments: 54, angularSegments: 168, lod: 2, transitionWidth: 520 }
      ]
    }
  };
}

const intakes = Array.from({ length: 10 }, (_, index) => makeInput(index));
const surveyTransectKit = createTerrainSurveyTransectKit({ maxTransects: 5 });
const altitudeCorridorKit = createTerrainAltitudeCorridorKit({ corridorCount: 3 });
const ridgePassBeaconKit = createTerrainRidgePassBeaconKit({ maxBeacons: 4 });
const hazardBasinKit = createTerrainHazardBasinKit({ maxBasins: 5 });
const sampleBookmarkKit = createTerrainSampleBookmarkKit({ maxBookmarks: 6 });
const routeTaskBandKit = createTerrainRouteTaskBandKit({ bandCount: 4 });
const rendererHandoffKit = createTerrainExpeditionRendererHandoffKit({ surveyTransectKit, altitudeCorridorKit, ridgePassBeaconKit, hazardBasinKit, sampleBookmarkKit, routeTaskBandKit });
const expeditionDomainKit = createTerrainExpeditionReadabilityDomainKit({ surveyTransectKit, altitudeCorridorKit, ridgePassBeaconKit, hazardBasinKit, sampleBookmarkKit, routeTaskBandKit, rendererHandoffKit });

assert.equal(TERRAIN_EXPEDITION_READABILITY_DOMAIN_TREE.root, "terrain-expedition-readability-domain");
assert.ok(TERRAIN_EXPEDITION_READABILITY_DOMAIN_TREE.contract.includes("renderer consumes descriptors only"));

for (const input of intakes) {
  const survey = surveyTransectKit.describe(input);
  assert.equal(surveyTransectKit.id, "terrain-survey-transect-kit");
  assert.equal(surveyTransectKit.domain, "terrain-expedition-readability/survey-planning/transect-domain");
  assert.ok(survey.length >= 2);
  assert.ok(survey.every((entry) => entry.from && entry.to && entry.kind === "survey-transect"));

  const corridors = altitudeCorridorKit.describe(input);
  assert.equal(altitudeCorridorKit.id, "terrain-altitude-corridor-kit");
  assert.equal(corridors.length, 3);
  assert.ok(corridors.every((entry) => entry.center && entry.radiusMeters > 0 && ["inside", "climb", "above"].includes(entry.status)));

  const beacons = ridgePassBeaconKit.describe(input);
  assert.equal(ridgePassBeaconKit.domain, "terrain-expedition-readability/route-intent/ridge-pass-domain");
  assert.ok(beacons.length >= 1);
  assert.ok(beacons.every((entry) => entry.position && entry.passScore >= 0 && entry.passScore <= 1));

  const basins = hazardBasinKit.describe(input);
  assert.equal(hazardBasinKit.id, "terrain-hazard-basin-kit");
  assert.ok(basins.length >= 1);
  assert.ok(basins.every((entry) => entry.radiusMeters >= 150 && entry.avoidStrength >= 0));

  const bookmarks = sampleBookmarkKit.describe(input);
  assert.equal(sampleBookmarkKit.domain, "terrain-expedition-readability/survey-planning/sample-bookmark-domain");
  assert.equal(bookmarks.length, 6);
  assert.ok(bookmarks.every((entry) => entry.position && entry.priority >= 0 && entry.priority <= 1));

  const tasks = routeTaskBandKit.describe(input);
  assert.equal(routeTaskBandKit.id, "terrain-route-task-band-kit");
  assert.equal(tasks.length, 4);
  assert.ok(tasks.every((entry) => entry.center && entry.recommendedAction));

  const handoff = rendererHandoffKit.describe(input);
  const domain = expeditionDomainKit.describe(input);
  assert.equal(rendererHandoffKit.id, "terrain-expedition-renderer-handoff-kit");
  assert.equal(expeditionDomainKit.id, "terrain-expedition-readability-domain-kit");
  assert.equal(domain.rendererHandoff.counts.total, handoff.counts.total);
  assert.ok(handoff.counts.total >= 20);
  assert.ok(domain.rendererContract.rendererMustNotOwn.includes("Three.js"));

  const serialized = JSON.stringify(domain);
  for (const forbidden of ["WebGLRenderer", "requestAnimationFrame", "querySelector", "getElementById", "AudioContext"] ) {
    assert.ok(!serialized.includes(forbidden), `expedition descriptors should not own ${forbidden}`);
  }
}

console.log("infinite radial terrain expedition readability kits smoke passed: 8 kit surfaces x 10 intake cases");
