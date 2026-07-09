import "./open-above-alpine-clinic-readiness-kits-smoke.mjs";

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createOpenAboveAlpineClinicReadinessDomainKit } from "../experiments/the-open-above/open-above-alpine-clinic-readiness-kits.js";

const CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const OLD_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";
const htmlSource = readFileSync("experiments/the-open-above/index.html", "utf8");
const entrySource = readFileSync("experiments/the-open-above/open-above-alpine-clinic-entry.js", "utf8");
const kitSource = readFileSync("experiments/the-open-above/open-above-alpine-clinic-readiness-kits.js", "utf8");
const parentSmokeSource = readFileSync("tests/open-above-playwright-cdn-state-input-smoke.mjs", "utf8");

assert.ok(entrySource.includes(CDN), "alpine clinic overlay imports NexusEngine main CDN");
assert.ok(!entrySource.includes(OLD_CDN), "alpine clinic overlay avoids old NexusRealtime runtime CDN");
assert.ok(!kitSource.includes(OLD_CDN), "alpine clinic kits avoid old NexusRealtime runtime CDN");
assert.ok(htmlSource.includes("open-above-alpine-clinic-entry.js?v=alpine-clinic-readiness-20260709"), "route shell loads cache-busted alpine clinic entry");
assert.ok(htmlSource.includes("alpine-clinic-readiness-renderer-handoff-pass"), "route shell advertises alpine clinic pass");
assert.ok(entrySource.includes("getAlpineClinicReadiness"), "GameHost exposes alpine clinic readiness");
assert.ok(entrySource.includes("getOpenAboveAlpineClinicReadiness"), "GameHost exposes route-namespaced alpine clinic readiness");
assert.ok(entrySource.includes("getRendererHandoff"), "GameHost composes renderer handoff");
assert.ok(entrySource.includes("rendererConsumes = \"descriptors-only\""), "overlay declares descriptor-only consumption");
assert.ok(parentSmokeSource.includes("./open-above-alpine-clinic-readiness-kits-smoke.mjs"), "parent smoke imports alpine clinic kit smoke");
assert.ok(parentSmokeSource.includes("./open-above-alpine-clinic-cdn-state-input-smoke.mjs"), "parent smoke imports alpine clinic CDN smoke");

for (const forbidden of ["document.", "window.", "HTMLElement", "WebGL", "THREE", "Audio", "requestAnimationFrame", "addEventListener"]) {
  assert.ok(!kitSource.includes(forbidden), `reusable kit source does not own ${forbidden}`);
}

const domain = createOpenAboveAlpineClinicReadinessDomainKit();
const states = Array.from({ length: 10 }, (_, index) => ({
  frame: index * 97,
  elapsed: index * 0.55,
  input: { pitchDown: index % 2 === 0, boost: index === 3 || index === 8, bankLeft: index % 3 === 0 },
  body: {
    speed: 50 + index * 11,
    altitude: 150 + index * 24,
    clearance: 60 + index * 27,
    position: { x: -460 + index * 108, y: 150 + index * 24, z: 580 - index * 86 },
    rotation: { yaw: -1 + index * 0.21, pitch: 0.03 + index * 0.012, roll: -0.38 + index * 0.084 },
    velocity: { x: 7 + index * 1.7, y: index < 3 ? -12 : 3 + index, z: -60 - index * 4.5 },
    stability: { sinkRate: index < 4 ? -42 + index * 7 : -4 }
  },
  flock: { agents: [] }
}));

for (const [index, state] of states.entries()) {
  const result = domain.compose(state);
  assert.equal(result.rendererHandoff.contract, "renderer-consumes-descriptors-only", `case ${index} uses descriptor-only handoff`);
  assert.ok(result.rendererHandoff.counts.strandedClimberBeacons >= 3, `case ${index} emits climber beacons`);
  assert.ok(result.rendererHandoff.counts.hypothermiaTriageMarkers >= 3, `case ${index} emits triage markers`);
  assert.ok(result.rendererHandoff.counts.windShearGaps >= 4, `case ${index} emits wind shear gaps`);
  assert.ok(result.rendererHandoff.counts.ropeBasketDrops >= 3, `case ${index} emits rope basket drops`);
  assert.ok(result.rendererHandoff.counts.medicineCacheGliders >= 3, `case ${index} emits medicine cache gliders`);
  assert.ok(result.rendererHandoff.counts.helipadSmokeSignals >= 4, `case ${index} emits helipad smoke signals`);
  assert.equal(result.summary.descriptorCount, result.rendererHandoff.counts.total, `case ${index} mirrors descriptor count`);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(result)), `case ${index} is JSON-safe`);
}

console.log("Open Above alpine clinic readiness CDN/state-input smoke passed.");
