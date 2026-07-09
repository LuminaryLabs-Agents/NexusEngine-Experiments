import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTerrainGlacierBeaconRescueReadinessDomainKit } from "../experiments/_kits/infinite-radial-terrain/terrain-glacier-beacon-rescue-readiness-kits.js";

const route = readFileSync(new URL("../experiments/infinite-radial-terrain/index.html", import.meta.url), "utf8");
const entry = readFileSync(new URL("../experiments/infinite-radial-terrain/terrain-glacier-beacon-rescue-readiness-entry.js", import.meta.url), "utf8");
const kitSource = readFileSync(new URL("../experiments/_kits/infinite-radial-terrain/terrain-glacier-beacon-rescue-readiness-kits.js", import.meta.url), "utf8");

assert.ok(route.includes("glacier-beacon-rescue-readiness-renderer-handoff-pass"), "route advertises glacier beacon rescue pass");
assert.ok(route.includes("terrain-glacier-beacon-rescue-readiness-entry.js?v=terrain-glacier-beacon-rescue-readiness-v1"), "route loads cache-busted glacier entry");
assert.ok(entry.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "entry imports NexusEngine main CDN");
assert.ok(!entry.includes("NexusRealtime@"), "changed entry avoids old NexusRealtime runtime import");
assert.ok(entry.includes("getInfiniteRadialTerrainGlacierBeaconRescueReadiness"), "GameHost exposes glacier readiness");
assert.ok(entry.includes("getRendererHandoff"), "GameHost composes renderer handoff");
for (const forbidden of ["document.", "window.", "requestAnimationFrame", "new Audio", "AudioContext", "addEventListener", "localStorage"]) {
  assert.ok(!kitSource.includes(forbidden), `kit source stays reusable and avoids ${forbidden}`);
}
assert.ok(!/from ["']three["']|new\s+THREE\.|createElement\(["']canvas["']\)/.test(kitSource), "kit source has no graphics runtime ownership");

const domain = createTerrainGlacierBeaconRescueReadinessDomainKit();
for (let index = 0; index < 10; index += 1) {
  const state = {
    frame: index * 75,
    camera: { position: { x: index * 120, y: 1120 + index * 22, z: -index * 160 }, yaw: index * 0.12 },
    samples: Array.from({ length: 7 }, (_unused, sampleIndex) => ({
      tag: `playwright-style-${index}-${sampleIndex}`,
      x: index * 120 + sampleIndex * 330,
      z: -index * 160 + sampleIndex * 250,
      height: 900 + sampleIndex * 120,
      slope: 10 + sampleIndex * 2,
      material: { materialWeights: { snow: 0.22 + sampleIndex * 0.06, soil: 0.24, wetChannel: 0.1 }, vegetationMask: 0.18 },
      landform: { confidence: 0.62, terrainRuggedness: 0.26 },
      hydrology: { flow: { wetnessIndex: 0.14 + sampleIndex * 0.03, channelPotential: 0.22 } }
    }))
  };
  const described = domain.describe({ time: state.frame / 60, camera: state.camera, samples: state.samples });
  assert.ok(described.rendererHandoff.counts.total >= 12, `state ${index} descriptor count`);
  assert.ok(described.summary.readiness >= 0 && described.summary.readiness <= 1, `state ${index} readiness`);
  assert.ok(described.summary.whiteoutRisk >= 0 && described.summary.whiteoutRisk <= 1, `state ${index} whiteout`);
  assert.match(described.summary.status, /route-secure|flagged-approach|lost-in-whiteout/, `state ${index} status enum`);
}
console.log("Terrain glacier beacon rescue CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
