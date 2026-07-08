import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTerrainSurveyContractReadinessDomainKit } from "../experiments/_kits/infinite-radial-terrain/terrain-survey-contract-readiness-kits.js";

const index = readFileSync("experiments/infinite-radial-terrain/index.html", "utf8");
const entry = readFileSync("experiments/infinite-radial-terrain/terrain-survey-contract-readiness-entry.js", "utf8");
const kits = readFileSync("experiments/_kits/infinite-radial-terrain/terrain-survey-contract-readiness-kits.js", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");
const existingPlaywright = readFileSync("tests/infinite-radial-terrain-playwright-state-input-smoke.mjs", "utf8");

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
assert.ok(entry.includes(nexusEngineCdn), "survey contract entry should import NexusEngine main through the CDN");
assert.ok(index.includes("terrain-survey-contract-readiness-entry.js?v=infinite-radial-terrain-survey-contract-readiness-v1"), "route should load the survey contract overlay");
assert.ok(!entry.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"), "changed overlay must not import the old NexusRealtime runtime CDN");
assert.ok(entry.includes("await import(NEXUS_ENGINE_URL)"));
assert.ok(entry.includes("getSurveyContractReadiness"));
assert.ok(entry.includes("getInfiniteRadialTerrainSurveyContractReadiness"));
assert.ok(entry.includes("infiniteRadialTerrainSurveyContract"));
assert.ok(entry.includes("rendererConsumes = \"descriptors-only\""));
assert.ok(entry.includes("composeHandoff(originalGetRendererHandoff?.(), current)"));
assert.ok(existingPlaywright.includes("infinite-radial-terrain-survey-contract-readiness-kits-smoke.mjs"));
assert.ok(existingPlaywright.includes("infinite-radial-terrain-survey-contract-cdn-state-input-smoke.mjs"));
assert.ok(manifest.includes("terrain-survey-contract-readiness-domain-kit"));

for (const expected of [
  "TERRAIN_SURVEY_CONTRACT_READINESS_DOMAIN_TREE",
  "createTerrainSurveyContractStepKit",
  "createTerrainWaypointTempoRingKit",
  "createTerrainRiskRewardForkKit",
  "createTerrainAltitudePledgeBandKit",
  "createTerrainSampleChainGhostKit",
  "createTerrainReturnConfidenceCompassKit",
  "createTerrainSurveyContractRendererHandoffKit",
  "createTerrainSurveyContractReadinessDomainKit",
  "renderer consumes terrain survey contract descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership"
]) {
  assert.ok(kits.includes(expected), expected);
}

function makeInput(index) {
  const focus = {
    tag: "focus",
    x: index * 210,
    z: -index * 160,
    height: 620 + index * 90,
    slope: 8 + index * 3,
    climate: { rainfallMmYear: 540 + index * 70, vegetationPotential: Math.min(1, 0.28 + index * 0.05) },
    hydrology: { flow: { wetnessIndex: Math.min(1, 0.18 + index * 0.04), channelPotential: Math.min(1, 0.22 + index * 0.06) }, stream: { streamOrder: index % 4, drainageDensityKmPerKm2: 1 + index * 0.2 } },
    landform: { landform: index % 2 ? "ridge" : "bench", confidence: Math.min(1, 0.5 + index * 0.04), terrainRuggedness: Math.min(1, 0.2 + index * 0.07) },
    material: { materialWeights: { bedrock: 0.3, soil: 0.6, wetChannel: Math.min(1, 0.16 + index * 0.04), snow: index > 7 ? 0.35 : 0.02 }, vegetationMask: 0.4 }
  };
  const samples = Array.from({ length: 8 }, (_, sampleIndex) => ({
    ...focus,
    tag: sampleIndex === 0 ? "focus" : sampleIndex % 3 === 0 ? "ridge-risk" : sampleIndex % 3 === 1 ? "valley-payoff" : "return-bench",
    x: focus.x + sampleIndex * 340 - index * 20,
    z: focus.z - sampleIndex * 280 + index * 30,
    height: focus.height + sampleIndex * 50,
    slope: focus.slope + sampleIndex * 2
  }));
  return {
    dt: index % 2 ? 1 / 60 : 1 / 30,
    keys: { KeyW: index % 3 !== 0, KeyA: index % 4 === 0, KeyD: index % 4 === 1, Space: index === 3, ShiftLeft: index === 8 },
    camera: { position: { x: focus.x, y: focus.height + 160 + index * 38, z: focus.z }, yaw: index * 0.13, pitch: -0.32 + index * 0.02 },
    terrainSample: focus,
    samples,
    terrain: { origin: { x: Math.round(focus.x / 250) * 250, z: Math.round(focus.z / 250) * 250 }, focus: { x: focus.x, y: focus.height, z: focus.z }, bands: [] }
  };
}

const domainKit = createTerrainSurveyContractReadinessDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => makeInput(index));

for (const stateCase of cases) {
  assert.ok(Number.isFinite(stateCase.dt));
  assert.ok(stateCase.dt > 0 && stateCase.dt <= 1 / 30);
  assert.ok(Object.values(stateCase.keys).every((value) => typeof value === "boolean"));
  assert.ok(stateCase.camera.pitch >= -1.22 && stateCase.camera.pitch <= 0.22);
  const domain = domainKit.describe(stateCase);
  assert.ok(domain.rendererHandoff.counts.total >= 20);
  assert.equal(domain.rendererHandoff.policy, "renderer-consumes-descriptors-only");
  assert.ok(domain.surveyContractSteps.length >= 4);
  assert.ok(domain.waypointTempoRings.length >= 3);
  assert.ok(domain.riskRewardForks.length >= 3);
  assert.ok(domain.altitudePledgeBands.every((band) => ["kept", "thin", "broken"].includes(band.status)));
  assert.ok(domain.returnConfidenceCompass.distanceMeters >= 0);
}

console.log("infinite radial terrain survey contract CDN/state-input smoke passed: 10 intake cases with NexusEngine CDN overlay");
