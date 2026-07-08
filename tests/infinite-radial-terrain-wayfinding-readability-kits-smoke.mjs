import assert from "node:assert/strict";
import {
  TERRAIN_WAYFINDING_READABILITY_DOMAIN_TREE,
  createTerrainBearingNeedleKit,
  createTerrainBiomeTransitionGateKit,
  createTerrainHorizonLandmarkKit,
  createTerrainOriginReturnAnchorKit,
  createTerrainSlopeChoiceRibbonKit,
  createTerrainStaminaDriftMeterKit,
  createTerrainWayfindingReadabilityDomainKit,
  createTerrainWayfindingRendererHandoffKit
} from "../experiments/_kits/infinite-radial-terrain/terrain-wayfinding-readability-kits.js";

function makeSample(index, tag, x, z) {
  const height = 520 + index * 74 + x * 0.012 - z * 0.009;
  const wetnessIndex = Math.max(0.08, Math.min(0.95, 0.12 + index * 0.055 + Math.abs(z) / 5200));
  const channelPotential = Math.max(0.1, Math.min(0.92, 0.14 + index * 0.06 + Math.abs(x) / 6400));
  const vegetation = Math.max(0.06, Math.min(0.9, 0.24 + index * 0.052));
  return {
    tag,
    x,
    z,
    height,
    slope: 6 + index * 3.7,
    climate: { rainfallMmYear: 580 + index * 105, temperatureC: 17 - index * 0.55, snowlineMeters: 1600 + index * 40, vegetationPotential: vegetation },
    hydrology: { flow: { wetnessIndex, channelPotential, flowDirection: { x: index % 2 ? 0.44 : -0.31, z: index % 2 ? 0.5 : 0.8 } }, stream: { streamOrder: index % 4, drainageDensityKmPerKm2: 0.9 + index * 0.24 } },
    landform: { landform: index % 5 === 0 ? "ridge" : index % 5 === 1 ? "saddle" : index % 5 === 2 ? "valley" : index % 5 === 3 ? "bench" : "spur", confidence: 0.46 + index * 0.04, terrainRuggedness: Math.max(0, Math.min(1, 0.14 + index * 0.07)) },
    material: { materialWeights: { bedrock: Math.max(0, Math.min(1, 0.26 + index * 0.04)), soil: Math.max(0, Math.min(1, 0.76 - index * 0.034)), silt: Math.max(0, Math.min(1, 0.1 + index * 0.045)), snow: height > 1700 ? 0.52 : 0.03, wetChannel: wetnessIndex }, vegetationMask: vegetation, albedoHint: "mixed" }
  };
}

function makeInput(index) {
  const samples = [
    makeSample(index, "focus", index * 170, -index * 130),
    makeSample(index + 1, "ahead", 740 + index * 120, -820 - index * 90),
    makeSample(index + 2, "far-ahead", 1460 + index * 140, -1600 - index * 110),
    makeSample(index + 3, "left-ridge", -780 + index * 70, -360 - index * 35),
    makeSample(index + 4, "right-ridge", 820 + index * 55, -300 - index * 44),
    makeSample(index + 5, "north", index * 90, -1360 - index * 50),
    makeSample(index + 6, "east", 1420 + index * 55, -index * 86),
    makeSample(index + 7, "return-bench", -520 + index * 40, 620 - index * 42)
  ];
  return {
    time: index * 0.5,
    camera: { position: { x: samples[0].x, y: samples[0].height + 220 + index * 18, z: samples[0].z }, yaw: index * 0.17, pitch: -0.34 + index * 0.02 },
    terrainSample: samples[0],
    samples,
    visual: { travelForecast: { recommendedAction: index % 3 === 0 ? "follow-ridge-contour" : index % 3 === 1 ? "trace-river-corridor" : "gain-altitude", cueStrength: Math.min(1, 0.3 + index * 0.06) } },
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
const bearingNeedleKit = createTerrainBearingNeedleKit({ needleCount: 4 });
const horizonLandmarkKit = createTerrainHorizonLandmarkKit({ maxLandmarks: 5 });
const slopeChoiceRibbonKit = createTerrainSlopeChoiceRibbonKit({ maxRibbons: 4 });
const biomeTransitionGateKit = createTerrainBiomeTransitionGateKit({ maxGates: 4 });
const originReturnAnchorKit = createTerrainOriginReturnAnchorKit({ anchorCount: 2 });
const staminaDriftMeterKit = createTerrainStaminaDriftMeterKit({ meterCount: 3 });
const rendererHandoffKit = createTerrainWayfindingRendererHandoffKit({ bearingNeedleKit, horizonLandmarkKit, slopeChoiceRibbonKit, biomeTransitionGateKit, originReturnAnchorKit, staminaDriftMeterKit });
const wayfindingDomainKit = createTerrainWayfindingReadabilityDomainKit({ bearingNeedleKit, horizonLandmarkKit, slopeChoiceRibbonKit, biomeTransitionGateKit, originReturnAnchorKit, staminaDriftMeterKit, rendererHandoffKit });

assert.equal(TERRAIN_WAYFINDING_READABILITY_DOMAIN_TREE.root, "terrain-wayfinding-readability-domain");
assert.ok(TERRAIN_WAYFINDING_READABILITY_DOMAIN_TREE.contract.includes("renderer consumes descriptors only"));

for (const input of intakes) {
  const needles = bearingNeedleKit.describe(input);
  assert.equal(bearingNeedleKit.id, "terrain-bearing-needle-kit");
  assert.equal(needles.length, 4);
  assert.ok(needles.every((entry) => entry.from && entry.to && entry.kind === "bearing-needle"));

  const landmarks = horizonLandmarkKit.describe(input);
  assert.equal(horizonLandmarkKit.domain, "terrain-wayfinding-readability/heading-intent-domain/horizon-landmark-domain");
  assert.ok(landmarks.length >= 2);
  assert.ok(landmarks.every((entry) => entry.position && entry.prominence >= 0 && entry.prominence <= 1));

  const ribbons = slopeChoiceRibbonKit.describe(input);
  assert.equal(slopeChoiceRibbonKit.id, "terrain-slope-choice-ribbon-kit");
  assert.equal(ribbons.length, 4);
  assert.ok(ribbons.every((entry) => entry.from && entry.to && entry.widthMeters > 0));

  const gates = biomeTransitionGateKit.describe(input);
  assert.equal(biomeTransitionGateKit.domain, "terrain-wayfinding-readability/route-comparison-domain/biome-transition-domain");
  assert.ok(gates.length >= 2);
  assert.ok(gates.every((entry) => entry.center && entry.radiusMeters > 0 && entry.toBiome));

  const anchors = originReturnAnchorKit.describe(input);
  assert.equal(originReturnAnchorKit.id, "terrain-origin-return-anchor-kit");
  assert.equal(anchors.length, 2);
  assert.ok(anchors.every((entry) => entry.center && entry.distanceMeters >= 0 && entry.urgency >= 0));

  const meters = staminaDriftMeterKit.describe(input);
  assert.equal(staminaDriftMeterKit.id, "terrain-stamina-drift-meter-kit");
  assert.equal(meters.length, 3);
  assert.ok(meters.every((entry) => entry.position && entry.load >= 0 && entry.load <= 1));

  const handoff = rendererHandoffKit.describe(input);
  const domain = wayfindingDomainKit.describe(input);
  assert.equal(rendererHandoffKit.id, "terrain-wayfinding-renderer-handoff-kit");
  assert.equal(wayfindingDomainKit.id, "terrain-wayfinding-readability-domain-kit");
  assert.equal(domain.rendererHandoff.counts.total, handoff.counts.total);
  assert.ok(handoff.counts.total >= 19);
  assert.ok(domain.rendererContract.rendererMustNotOwn.includes("Three.js"));

  const serialized = JSON.stringify(domain);
  for (const forbidden of ["WebGLRenderer", "requestAnimationFrame", "querySelector", "getElementById"]) {
    assert.ok(!serialized.includes(forbidden), `wayfinding descriptors should not own ${forbidden}`);
  }
}

console.log("infinite radial terrain wayfinding readability kits smoke passed: 8 kit surfaces x 10 intake cases");
