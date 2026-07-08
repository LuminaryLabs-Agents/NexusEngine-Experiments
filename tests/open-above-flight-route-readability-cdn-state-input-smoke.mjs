import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createOpenAboveFlightRouteReadabilityDomainKit
} from "../experiments/the-open-above/open-above-flight-route-readability-kits.js";

const CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const OLD_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";
const configSource = readFileSync("experiments/the-open-above/open-above.config.js", "utf8");
const htmlSource = readFileSync("experiments/the-open-above/index.html", "utf8");
const entrySource = readFileSync("experiments/the-open-above/open-above-flight-route-readability-entry.js", "utf8");
const kitSource = readFileSync("experiments/the-open-above/open-above-flight-route-readability-kits.js", "utf8");
const existingPlaywrightSmokeSource = readFileSync("tests/open-above-playwright-cdn-state-input-smoke.mjs", "utf8");
const manifestSource = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");

assert.ok(configSource.includes(CDN), "Open Above config uses NexusEngine main CDN");
assert.ok(!configSource.includes(OLD_CDN), "Open Above config no longer points at old NexusRealtime runtime CDN");
assert.ok(entrySource.includes(CDN), "flight route overlay directly imports NexusEngine main CDN");
assert.ok(!entrySource.includes(OLD_CDN), "flight route overlay avoids old NexusRealtime runtime CDN");
assert.ok(htmlSource.includes("open-above-flight-route-readability-entry.js?v=flight-route-readability-20260708"), "route shell loads cache-busted flight route entry");
assert.ok(entrySource.includes("getFlightRouteReadability"), "GameHost exposes flight route readability");
assert.ok(entrySource.includes("getRendererHandoff"), "GameHost exposes composed renderer handoff");
assert.ok(entrySource.includes("rendererConsumes = \"descriptors-only\""), "overlay declares descriptor-only consumption");
assert.ok(existingPlaywrightSmokeSource.includes("./open-above-flight-route-readability-kits-smoke.mjs"), "existing Open Above Playwright smoke imports kit smoke");
assert.ok(existingPlaywrightSmokeSource.includes("./open-above-flight-route-readability-cdn-state-input-smoke.mjs"), "existing Open Above Playwright smoke imports CDN state smoke");
assert.ok(manifestSource.includes("the-open-above"), "manifest records The Open Above canonical route");
assert.ok(manifestSource.includes("open-above-flight-route-readability-domain-kit"), "manifest records the flight route domain kit");

for (const forbidden of ["document.", "window.", "HTMLElement", "WebGL", "THREE", "Audio", "requestAnimationFrame", "addEventListener"] ) {
  assert.ok(!kitSource.includes(forbidden), `reusable kit source does not own ${forbidden}`);
}

const domain = createOpenAboveFlightRouteReadabilityDomainKit();
const states = Array.from({ length: 10 }, (_, index) => ({
  frame: index * 83,
  input: { pitchDown: index % 3 === 0, bankLeft: index % 2 === 0, boost: index === 7 },
  body: {
    speed: 42 + index * 11,
    altitude: 140 + index * 24,
    clearance: 55 + index * 23,
    position: { x: index * 130 - 420, y: 140 + index * 24, z: 510 - index * 94 },
    rotation: { yaw: -1.2 + index * 0.27, pitch: 0.03, roll: -0.4 + index * 0.08 },
    velocity: { x: 10 + index, y: index % 4 === 0 ? -6 : 3, z: -60 - index },
    carve: { turnStrength: index / 9 },
    stability: { sinkRate: index < 3 ? -32 + index * 5 : -4 }
  },
  flock: {
    agents: Array.from({ length: index % 4 }, (_, flockIndex) => ({ id: `case-${index}-flock-${flockIndex}`, velocity: { z: -20 - flockIndex } }))
  }
}));

for (const [index, state] of states.entries()) {
  const result = domain.compose(state);
  assert.equal(result.rendererHandoff.contract, "renderer-consumes-descriptors-only", `case ${index} uses descriptor-only handoff`);
  assert.ok(result.rendererHandoff.counts.updraftCorridors >= 3, `case ${index} emits updraft options`);
  assert.ok(result.rendererHandoff.counts.ridgeHazardShelves >= 2, `case ${index} emits ridge hazard shelves`);
  assert.equal(result.rendererHandoff.counts.altitudeReserveMeters, 1, `case ${index} emits one reserve meter`);
  assert.equal(result.rendererHandoff.counts.homewardBearingThreads, 6, `case ${index} emits six homeward thread segments`);
  assert.ok(result.summary.descriptorCount === result.rendererHandoff.counts.total, `case ${index} mirrors descriptor count`);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(result)), `case ${index} is JSON-safe`);
}

console.log("Open Above flight route readability CDN/state-input smoke passed");
