import "./open-above-aerial-courier-readiness-domain-kits-smoke.mjs";

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createOpenAboveAerialCourierReadinessDomainKit
} from "../experiments/the-open-above/open-above-aerial-courier-readiness-kits.js";

const CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const OLD_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";
const htmlSource = readFileSync("experiments/the-open-above/index.html", "utf8");
const entrySource = readFileSync("experiments/the-open-above/open-above-aerial-courier-entry.js", "utf8");
const kitSource = readFileSync("experiments/the-open-above/open-above-aerial-courier-readiness-kits.js", "utf8");
const configSource = readFileSync("experiments/the-open-above/open-above.config.js", "utf8");
const manifestSource = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");
const playwrightSmokeSource = readFileSync("tests/open-above-playwright-cdn-state-input-smoke.mjs", "utf8");
const runChecksSource = readFileSync("scripts/run-checks.mjs", "utf8");

assert.ok(configSource.includes(CDN), "Open Above runtime config uses NexusEngine main CDN");
assert.ok(entrySource.includes(CDN), "aerial courier overlay imports NexusEngine main CDN");
assert.ok(!entrySource.includes(OLD_CDN), "aerial courier overlay avoids old NexusRealtime runtime CDN");
assert.ok(!kitSource.includes(OLD_CDN), "aerial courier kits avoid old NexusRealtime runtime CDN");
assert.ok(htmlSource.includes("open-above-aerial-courier-entry.js?v=aerial-courier-readiness-20260708"), "route shell loads cache-busted aerial courier entry");
assert.ok(entrySource.includes("getAerialCourierReadiness"), "GameHost exposes aerial courier readiness");
assert.ok(entrySource.includes("getOpenAboveAerialCourierReadiness"), "GameHost exposes route-namespaced aerial courier readiness");
assert.ok(entrySource.includes("getRendererHandoff"), "GameHost composes renderer handoff");
assert.ok(entrySource.includes("rendererConsumes = \"descriptors-only\""), "overlay declares descriptor-only consumption");
assert.ok(manifestSource.includes("open-above-aerial-courier-readiness-domain-kit"), "manifest registers aerial courier domain kit");
assert.ok(playwrightSmokeSource.includes("./open-above-aerial-courier-readiness-domain-kits-smoke.mjs"), "Playwright smoke imports aerial courier kit smoke");
assert.ok(playwrightSmokeSource.includes("./open-above-aerial-courier-cdn-state-input-smoke.mjs"), "Playwright smoke imports aerial courier CDN state smoke");
assert.ok(runChecksSource.includes("tests/open-above-aerial-courier-readiness-domain-kits-smoke.mjs"), "full/deploy checks include aerial courier kit smoke");
assert.ok(runChecksSource.includes("tests/open-above-aerial-courier-cdn-state-input-smoke.mjs"), "full/deploy checks include aerial courier CDN state smoke");

for (const forbidden of ["document.", "window.", "HTMLElement", "WebGL", "THREE", "Audio", "requestAnimationFrame", "addEventListener"]) {
  assert.ok(!kitSource.includes(forbidden), `reusable kit source does not own ${forbidden}`);
}

const domain = createOpenAboveAerialCourierReadinessDomainKit();
const states = Array.from({ length: 10 }, (_, index) => ({
  frame: index * 91,
  elapsed: index * 0.6,
  input: { pitchDown: index % 2 === 0, boost: index === 2 || index === 7, bankLeft: index % 3 === 0 },
  body: {
    speed: 52 + index * 10,
    altitude: 150 + index * 26,
    clearance: 62 + index * 25,
    position: { x: -360 + index * 96, y: 150 + index * 26, z: 440 - index * 72 },
    rotation: { yaw: -0.9 + index * 0.22, pitch: 0.03 + index * 0.01, roll: -0.36 + index * 0.09 },
    velocity: { x: 8 + index * 1.5, y: index < 3 ? -9 : 4, z: -55 - index * 5 },
    carve: { turnStrength: Math.min(1, index / 8) },
    stability: { sinkRate: index < 4 ? -38 + index * 8 : -2 }
  },
  flock: { agents: [] }
}));

for (const [index, state] of states.entries()) {
  const result = domain.compose(state);
  assert.equal(result.rendererHandoff.contract, "renderer-consumes-descriptors-only", `case ${index} uses descriptor-only handoff`);
  assert.ok(result.rendererHandoff.counts.courierPouchTargets >= 3, `case ${index} emits pouch targets`);
  assert.ok(result.rendererHandoff.counts.ribbonCheckpoints >= 4, `case ${index} emits ribbon checkpoints`);
  assert.equal(result.rendererHandoff.counts.comfortStabilityMeters, 1, `case ${index} emits one comfort meter`);
  assert.ok(result.rendererHandoff.counts.stormShearWarnings >= 3, `case ${index} emits storm shear warnings`);
  assert.ok(result.rendererHandoff.counts.meadowDropZones >= 2, `case ${index} emits meadow drop zones`);
  assert.ok(result.rendererHandoff.counts.returnDockBeacons >= 4, `case ${index} emits return dock beacons`);
  assert.ok(result.summary.descriptorCount === result.rendererHandoff.counts.total, `case ${index} mirrors descriptor count`);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(result)), `case ${index} is JSON-safe`);
}

console.log("Open Above aerial courier readiness CDN/state-input smoke passed.");
