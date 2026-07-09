import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTerrainMirageCaravanRescueReadinessDomainKit } from "../experiments/_kits/infinite-radial-terrain/terrain-mirage-caravan-rescue-readiness-kits.js";

const CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const indexHtml = readFileSync("experiments/infinite-radial-terrain/index.html", "utf8");
const entry = readFileSync("experiments/infinite-radial-terrain/terrain-mirage-caravan-rescue-readiness-entry.js", "utf8");
const kit = readFileSync("experiments/_kits/infinite-radial-terrain/terrain-mirage-caravan-rescue-readiness-kits.js", "utf8");

assert.ok(indexHtml.includes("mirage-caravan-rescue-readiness-renderer-handoff-pass"));
assert.ok(indexHtml.includes("terrain-mirage-caravan-rescue-readiness-entry.js?v=terrain-mirage-caravan-rescue-readiness-v1"));
assert.ok(entry.includes(CDN));
assert.ok(!entry.includes("NexusRealtime@"));
assert.ok(entry.includes("getInfiniteRadialTerrainMirageCaravanRescueReadiness"));
assert.ok(entry.includes("getMirageCaravanRescueReadinessTree"));
assert.ok(entry.includes("getRendererHandoff"));
for (const forbidden of ["document.", "window.", "requestAnimationFrame", "new THREE", "new WebGL", "new Audio", "localStorage", "fetch("]) {
  assert.ok(!kit.includes(forbidden), `reusable kit must not own ${forbidden}`);
}
assert.ok(kit.includes("rendererMustNotOwn"));
assert.ok(kit.includes("WebGL"));

const domain = createTerrainMirageCaravanRescueReadinessDomainKit();
const stateCases = Array.from({ length: 10 }, (_, index) => {
  const wet = 0.18 + index * 0.055;
  const veg = 0.18 + index * 0.045;
  return {
    frame: index * 90,
    camera: { position: [index * 140, 900 + index * 20, -index * 180], yaw: index * 0.13, pitch: -0.28 },
    descriptors: { focus: { x: index * 140, y: 680 + index * 12, z: -index * 180 }, bands: [] },
    samples: [0, 1, 2, 3, 4, 5].map((offset) => ({
      tag: offset === 0 ? "focus" : offset === 1 ? "mirage-well" : offset === 2 ? "shade-oasis" : offset === 3 ? "camel-bell" : offset === 4 ? "dune-stake" : "water-cache",
      x: index * 140 + offset * 360,
      z: -index * 180 - offset * 260,
      height: 620 + index * 24 + offset * 18,
      slope: 7 + offset + index * 0.5,
      climate: { rainfallMmYear: 110 + wet * 180, temperatureC: 34 - index * 0.9, snowlineMeters: 3000, vegetationPotential: Math.min(0.9, veg + offset * 0.03) },
      hydrology: { flow: { wetnessIndex: Math.min(0.9, wet + offset * 0.04), channelPotential: Math.min(0.8, wet * 0.5 + offset * 0.02) }, stream: { streamOrder: wet > 0.55 ? 1 : 0, drainageDensityKmPerKm2: wet } },
      landform: { landform: offset < 3 ? "alluvial-oasis" : "dune-corridor", confidence: 0.55 + wet * 0.25, terrainRuggedness: 0.2 + offset * 0.03 },
      material: { materialWeights: { soil: 0.54, bedrock: 0.22, wetChannel: wet * 0.26, snow: 0 }, vegetationMask: Math.min(0.9, veg + offset * 0.02) }
    }))
  };
});

for (const [index, state] of stateCases.entries()) {
  const described = domain.describe({
    time: state.frame / 60,
    camera: state.camera,
    terrain: state.descriptors,
    terrainSample: state.samples[0],
    samples: state.samples
  });
  assert.ok(described.rendererHandoff.counts.total >= 26, `case ${index} descriptor count`);
  assert.ok(described.summary.readiness >= 0 && described.summary.readiness <= 1, `case ${index} readiness`);
  assert.ok(described.summary.heatRisk >= 0 && described.summary.heatRisk <= 1, `case ${index} heatRisk`);
  assert.ok(["caravan-secure", "dusk-route-marked", "lost-to-mirage"].includes(described.summary.status), `case ${index} status`);
}

console.log("Terrain mirage caravan rescue CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
