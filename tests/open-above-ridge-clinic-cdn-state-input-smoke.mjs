import "./open-above-ridge-clinic-readiness-kits-smoke.mjs";

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createOpenAboveRidgeClinicReadinessDomainKit
} from "../experiments/the-open-above/open-above-ridge-clinic-readiness-kits.js";

const CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const OLD_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";
const htmlSource = readFileSync("experiments/the-open-above/index.html", "utf8");
const entrySource = readFileSync("experiments/the-open-above/open-above-ridge-clinic-entry.js", "utf8");
const kitSource = readFileSync("experiments/the-open-above/open-above-ridge-clinic-readiness-kits.js", "utf8");
const configSource = readFileSync("experiments/the-open-above/open-above.config.js", "utf8");
const playwrightSmokeSource = readFileSync("tests/open-above-playwright-cdn-state-input-smoke.mjs", "utf8");

assert.ok(configSource.includes(CDN), "Open Above runtime config uses NexusEngine main CDN");
assert.ok(entrySource.includes(CDN), "ridge clinic overlay imports NexusEngine main CDN");
assert.ok(!entrySource.includes(OLD_CDN), "ridge clinic overlay avoids old NexusRealtime runtime CDN");
assert.ok(!kitSource.includes(OLD_CDN), "ridge clinic kits avoid old NexusRealtime runtime CDN");
assert.ok(htmlSource.includes("open-above-ridge-clinic-entry.js?v=ridge-clinic-readiness-20260709"), "route shell loads cache-busted ridge clinic entry");
assert.ok(htmlSource.includes("ridge-clinic-readiness-renderer-handoff-pass"), "route shell advertises ridge clinic pass");
assert.ok(entrySource.includes("getRidgeClinicReadiness"), "GameHost exposes ridge clinic readiness");
assert.ok(entrySource.includes("getOpenAboveRidgeClinicReadiness"), "GameHost exposes route-namespaced ridge clinic readiness");
assert.ok(entrySource.includes("getRendererHandoff"), "GameHost composes renderer handoff");
assert.ok(entrySource.includes("rendererConsumes = \"descriptors-only\""), "overlay declares descriptor-only consumption");
assert.ok(playwrightSmokeSource.includes("./open-above-ridge-clinic-readiness-kits-smoke.mjs"), "Playwright smoke imports ridge clinic kit smoke");
assert.ok(playwrightSmokeSource.includes("./open-above-ridge-clinic-cdn-state-input-smoke.mjs"), "Playwright smoke imports ridge clinic CDN smoke");

for (const forbidden of ["document.", "window.", "HTMLElement", "WebGL", "THREE", "Audio", "requestAnimationFrame", "addEventListener"]) {
  assert.ok(!kitSource.includes(forbidden), `reusable kit source does not own ${forbidden}`);
}

const domain = createOpenAboveRidgeClinicReadinessDomainKit();
const states = Array.from({ length: 10 }, (_, index) => ({
  frame: index * 101,
  elapsed: index * 0.48,
  input: { pitchDown: index % 2 === 0, boost: index === 4 || index === 8, bankLeft: index % 3 === 0 },
  body: {
    speed: 46 + index * 10,
    altitude: 148 + index * 26,
    clearance: 58 + index * 24,
    position: { x: -430 + index * 104, y: 148 + index * 26, z: 640 - index * 78 },
    rotation: { yaw: -0.8 + index * 0.19, pitch: 0.02 + index * 0.01, roll: -0.36 + index * 0.078 },
    velocity: { x: 7 + index * 1.6, y: index < 4 ? -20 + index * 5 : 2 + index, z: -58 - index * 4.2 },
    stability: { sinkRate: index < 5 ? -44 + index * 7 : -3 }
  },
  flock: { agents: [] }
}));

for (const [index, state] of states.entries()) {
  const result = domain.compose(state);
  assert.equal(result.rendererHandoff.contract, "renderer-consumes-descriptors-only", `case ${index} uses descriptor-only handoff`);
  assert.ok(result.rendererHandoff.counts.windsockLandingStrips >= 3, `case ${index} emits windsocks`);
  assert.ok(result.rendererHandoff.counts.ropeGuideLanes >= 4, `case ${index} emits rope lanes`);
  assert.ok(result.rendererHandoff.counts.oxygenCrateCaches >= 3, `case ${index} emits oxygen caches`);
  assert.ok(result.rendererHandoff.counts.stretcherCircleMarkers >= 2, `case ${index} emits stretcher circles`);
  assert.ok(result.rendererHandoff.counts.clinicFlareTriads >= 3, `case ${index} emits clinic flares`);
  assert.ok(result.rendererHandoff.counts.dawnTransferRosters >= 4, `case ${index} emits transfer roster`);
  assert.ok(result.summary.descriptorCount === result.rendererHandoff.counts.total, `case ${index} mirrors descriptor count`);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(result)), `case ${index} is JSON-safe`);
}

console.log("Open Above ridge clinic readiness CDN/state-input smoke passed.");
