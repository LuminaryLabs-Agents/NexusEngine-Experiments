import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTerrainAquiferCartographyReadinessDomainKit } from "../experiments/_kits/infinite-radial-terrain/terrain-aquifer-cartography-readiness-kits.js";

const routeHtml = readFileSync(new URL("../experiments/infinite-radial-terrain/index.html", import.meta.url), "utf8");
const entrySource = readFileSync(new URL("../experiments/infinite-radial-terrain/terrain-aquifer-cartography-readiness-entry.js", import.meta.url), "utf8");
const kitSource = readFileSync(new URL("../experiments/_kits/infinite-radial-terrain/terrain-aquifer-cartography-readiness-kits.js", import.meta.url), "utf8");

const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
assert.ok(routeHtml.includes("aquifer-cartography-readiness-renderer-handoff-pass"), "route advertises aquifer cartography pass");
assert.ok(routeHtml.includes("terrain-aquifer-cartography-readiness-entry.js"), "route loads aquifer cartography entry");
assert.ok(entrySource.includes(cdn), "entry pulls NexusEngine main CDN");
assert.ok(!entrySource.includes("NexusRealtime@"), "changed entry avoids old NexusRealtime runtime CDN");
assert.ok(entrySource.includes("getInfiniteRadialTerrainAquiferCartographyReadiness"), "GameHost exposes aquifer readiness accessor");
assert.ok(entrySource.includes("getRendererHandoff"), "entry composes renderer handoff");
for (const forbidden of ["document.", "window.", "requestAnimationFrame", "WebGLRenderer", "new THREE", "Audio", "localStorage"]) {
  assert.ok(!kitSource.includes(forbidden), `reusable kit source excludes ${forbidden}`);
}

const domain = createTerrainAquiferCartographyReadinessDomainKit();
const inputCases = Array.from({ length: 10 }, (_, index) => {
  const wet = 0.18 + index * 0.075;
  const camera = { position: [index * 120, 840 + index * 16, -index * 90], yaw: index * 0.21, pitch: -0.32 };
  return {
    stateLabel: `case-${index}`,
    input: index % 3 === 0 ? "fly-forward" : index % 3 === 1 ? "raise-altitude" : "scan-basin",
    frame: index * 48,
    camera,
    samples: Array.from({ length: 7 }, (_, sampleIndex) => ({
      tag: `state-${index}-sample-${sampleIndex}`,
      x: index * 120 + sampleIndex * 360,
      z: -index * 90 + sampleIndex * -280,
      height: 820 + sampleIndex * 18 - wet * 90,
      slope: 6 + sampleIndex * 2 + index * 0.4,
      climate: { rainfallMmYear: 420 + wet * 740, temperatureC: 9, snowlineMeters: 980, vegetationPotential: 0.26 + wet * 0.45 },
      hydrology: { flow: { wetnessIndex: wet + sampleIndex * 0.035, channelPotential: wet * 0.8 }, stream: { streamOrder: Math.floor((wet + sampleIndex * 0.02) * 5), drainageDensityKmPerKm2: 0.8 + wet * 3.2 } },
      landform: { landform: sampleIndex % 2 ? "springline" : "basin", confidence: 0.58 + wet * 0.28, terrainRuggedness: (6 + sampleIndex * 2) / 44 },
      material: { materialWeights: { soil: 0.32 + wet * 0.4, bedrock: 0.38, wetChannel: wet + sampleIndex * 0.03, snow: 0.02 }, vegetationMask: 0.25 + wet * 0.4 }
    }))
  };
});

for (const state of inputCases) {
  const result = domain.describe(state);
  assert.ok(result.rendererHandoff.counts.total >= 6, `descriptors emitted for ${state.stateLabel}`);
  assert.ok(result.summary.status, `summary status emitted for ${state.stateLabel}`);
  assert.ok(result.springSeeps[0].position, `spring position emitted for ${state.stateLabel}`);
  assert.ok(result.aquiferThreads[0].from && result.aquiferThreads[0].to, `thread endpoints emitted for ${state.stateLabel}`);
}

const first = domain.describe(inputCases[0]).summary.readiness;
const last = domain.describe(inputCases[9]).summary.readiness;
assert.ok(last >= first, "richer wet-state input improves readiness");
console.log("Infinite radial terrain aquifer cartography CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
