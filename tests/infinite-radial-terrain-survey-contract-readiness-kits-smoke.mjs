import assert from "node:assert/strict";
import {
  TERRAIN_SURVEY_CONTRACT_READINESS_DOMAIN_TREE,
  createTerrainAltitudePledgeBandKit,
  createTerrainReturnConfidenceCompassKit,
  createTerrainRiskRewardForkKit,
  createTerrainSampleChainGhostKit,
  createTerrainSurveyContractReadinessDomainKit,
  createTerrainSurveyContractRendererHandoffKit,
  createTerrainSurveyContractStepKit,
  createTerrainWaypointTempoRingKit
} from "../experiments/_kits/infinite-radial-terrain/terrain-survey-contract-readiness-kits.js";

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function makeSample(index, tag, x, z) {
  const height = 620 + index * 82 + x * 0.01 - z * 0.006;
  const wetnessIndex = clamp(0.14 + index * 0.052 + Math.abs(z) / 6200);
  const channelPotential = clamp(0.12 + index * 0.064 + Math.abs(x) / 7000);
  const ruggedness = clamp(0.16 + index * 0.07 + (tag.includes("ridge") ? 0.22 : 0));
  return {
    tag,
    x,
    z,
    height,
    slope: 7 + index * 3.4,
    climate: { rainfallMmYear: 520 + index * 95, temperatureC: 18 - index * 0.52, snowlineMeters: 1640, vegetationPotential: clamp(0.24 + index * 0.052) },
    hydrology: { flow: { wetnessIndex, channelPotential, flowDirection: { x: index % 2 ? 0.4 : -0.26, z: 0.72 } }, stream: { streamOrder: index % 4, drainageDensityKmPerKm2: 0.9 + index * 0.22 } },
    landform: { landform: tag.includes("ridge") ? "ridge" : tag.includes("valley") ? "valley" : "bench", confidence: clamp(0.46 + index * 0.044), terrainRuggedness: ruggedness },
    material: { materialWeights: { bedrock: clamp(0.24 + ruggedness * 0.45), soil: clamp(0.75 - ruggedness * 0.24), wetChannel: wetnessIndex, snow: height > 1680 ? 0.5 : 0.02 }, vegetationMask: clamp(0.24 + wetnessIndex * 0.48), albedoHint: "smoke" }
  };
}

function makeInput(index) {
  const samples = [
    makeSample(index, "focus", index * 180, -index * 120),
    makeSample(index + 1, "ahead-contract", 680 + index * 110, -760 - index * 90),
    makeSample(index + 2, "ridge-risk", 1180 + index * 100, -420 - index * 70),
    makeSample(index + 3, "valley-payoff", 920 + index * 120, -1320 - index * 95),
    makeSample(index + 4, "left-fork", -840 + index * 60, -520 - index * 45),
    makeSample(index + 5, "right-fork", 940 + index * 70, -480 - index * 55),
    makeSample(index + 6, "return-bench", -420 + index * 30, 620 - index * 38),
    makeSample(index + 7, "far-survey", 1850 + index * 130, -1910 - index * 105)
  ];
  return {
    time: index * 0.42,
    camera: { position: { x: samples[0].x + index * 14, y: samples[0].height + 180 + index * 34, z: samples[0].z - index * 20 }, yaw: index * 0.15, pitch: -0.34 + index * 0.02 },
    terrainSample: samples[0],
    samples,
    terrain: {
      version: index,
      origin: { x: Math.round(samples[0].x / 250) * 250, z: Math.round(samples[0].z / 250) * 250 },
      focus: { x: samples[0].x, y: samples[0].height, z: samples[0].z },
      bands: [
        { id: "core", innerRadius: 0, outerRadius: 520, lod: 0 },
        { id: "near", innerRadius: 470, outerRadius: 1800, lod: 1 },
        { id: "mid", innerRadius: 1600, outerRadius: 6000, lod: 2 }
      ]
    },
    visual: { travelForecast: { recommendedAction: index % 2 ? "trace-river-corridor" : "gain-altitude", cueStrength: clamp(0.32 + index * 0.05) } },
    expedition: { rendererHandoff: { counts: { total: 12 + index } } },
    wayfinding: { rendererHandoff: { counts: { total: 20 + index } } }
  };
}

const intakes = Array.from({ length: 10 }, (_, index) => makeInput(index));
const surveyContractStepKit = createTerrainSurveyContractStepKit({ maxSteps: 5 });
const waypointTempoRingKit = createTerrainWaypointTempoRingKit({ ringCount: 4 });
const riskRewardForkKit = createTerrainRiskRewardForkKit({ maxForks: 4 });
const altitudePledgeBandKit = createTerrainAltitudePledgeBandKit({ bandCount: 3 });
const sampleChainGhostKit = createTerrainSampleChainGhostKit({ ghostCount: 6 });
const returnConfidenceCompassKit = createTerrainReturnConfidenceCompassKit();
const rendererHandoffKit = createTerrainSurveyContractRendererHandoffKit({ surveyContractStepKit, waypointTempoRingKit, riskRewardForkKit, altitudePledgeBandKit, sampleChainGhostKit, returnConfidenceCompassKit });
const surveyContractDomainKit = createTerrainSurveyContractReadinessDomainKit({ rendererHandoffKit });

assert.equal(TERRAIN_SURVEY_CONTRACT_READINESS_DOMAIN_TREE.root, "terrain-survey-contract-readiness-domain");
assert.ok(TERRAIN_SURVEY_CONTRACT_READINESS_DOMAIN_TREE.contract.includes("renderer consumes terrain survey contract descriptors only"));

for (const input of intakes) {
  const steps = surveyContractStepKit.describe(input);
  assert.equal(surveyContractStepKit.id, "terrain-survey-contract-step-kit");
  assert.equal(steps.length, 5);
  assert.ok(steps.every((step) => step.kind === "survey-contract-step" && step.position && step.value >= 0 && step.value <= 1));

  const rings = waypointTempoRingKit.describe(input);
  assert.equal(waypointTempoRingKit.id, "terrain-waypoint-tempo-ring-kit");
  assert.equal(rings.length, 4);
  assert.ok(rings.every((ring) => ring.kind === "waypoint-tempo-ring" && ring.radiusMeters > 0 && ["commit", "hold", "approach"].includes(ring.tempo)));

  const forks = riskRewardForkKit.describe(input);
  assert.equal(riskRewardForkKit.domain, "terrain-survey-contract-readiness/pacing-and-choice-domain/risk-reward-fork-domain");
  assert.equal(forks.length, 4);
  assert.ok(forks.every((fork) => fork.from && fork.to && Number.isFinite(fork.routeBias)));

  const bands = altitudePledgeBandKit.describe(input);
  assert.equal(altitudePledgeBandKit.id, "terrain-altitude-pledge-band-kit");
  assert.equal(bands.length, 3);
  assert.ok(bands.every((band) => band.clearanceMeters > 0 && ["kept", "thin", "broken"].includes(band.status)));

  const ghosts = sampleChainGhostKit.describe(input);
  assert.equal(sampleChainGhostKit.id, "terrain-sample-chain-ghost-kit");
  assert.equal(ghosts.length, 6);
  assert.ok(ghosts.every((ghost) => ghost.position && ghost.priority >= 0 && ghost.priority <= 1));

  const compass = returnConfidenceCompassKit.describe(input);
  assert.equal(returnConfidenceCompassKit.id, "terrain-return-confidence-compass-kit");
  assert.ok(Number.isFinite(compass.headingRadians));
  assert.ok(["anchored", "drifting", "lost-thread"].includes(compass.status));

  const handoff = rendererHandoffKit.describe(input);
  const domain = surveyContractDomainKit.describe(input);
  assert.equal(rendererHandoffKit.id, "terrain-survey-contract-renderer-handoff-kit");
  assert.equal(surveyContractDomainKit.id, "terrain-survey-contract-readiness-domain-kit");
  assert.equal(domain.rendererHandoff.counts.total, handoff.counts.total);
  assert.ok(handoff.counts.total >= 23);
  assert.ok(domain.rendererContract.rendererMustNotOwn.includes("Three.js"));

  const serialized = JSON.stringify(domain);
  for (const forbidden of ["WebGLRenderer", "requestAnimationFrame", "querySelector", "getElementById"]) {
    assert.ok(!serialized.includes(forbidden), `survey contract descriptors should not own ${forbidden}`);
  }
}

console.log("infinite radial terrain survey contract readiness kits smoke passed: 8 kit surfaces x 10 intake cases");
