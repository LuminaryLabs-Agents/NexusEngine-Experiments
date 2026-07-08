import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTropicalReefRescueReadinessDomainKit } from "../experiments/tropical-island-scene/src/tropical-reef-rescue-readiness-domain-kit.js";

const CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const OLD_RUNTIME_CDN = "LuminaryLabs-Dev/NexusRealtime@main/src/index.js";
const indexHtml = readFileSync("experiments/tropical-island-scene/index.html", "utf8");
const entry = readFileSync("experiments/tropical-island-scene/src/reef-rescue-readiness-entry.js", "utf8");
const kitSource = readFileSync("experiments/tropical-island-scene/src/tropical-reef-rescue-readiness-domain-kit.js", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");
const weatherSmoke = readFileSync("tests/tropical-weather-shelter-cdn-state-input-smoke.mjs", "utf8");

assert.match(entry, new RegExp(CDN.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "changed reef rescue entry must import NexusEngine main CDN");
assert.equal(entry.includes(OLD_RUNTIME_CDN), false, "changed reef rescue entry must not import old NexusRealtime runtime CDN");
assert.match(indexHtml, /reef-rescue-readiness-entry\.js\?v=tropical-island-reef-rescue-20260708/, "route shell must load reef rescue overlay");
assert.match(entry, /getReefRescueReadiness/, "GameHost must expose reef rescue readiness");
assert.match(entry, /getTropicalReefRescueReadiness/, "GameHost must expose tropical-specific reef rescue readiness");
assert.match(entry, /getRendererHandoff/, "GameHost renderer handoff must be extended");
assert.match(entry, /reefRescue/, "composed renderer handoff must include reef rescue group");
assert.match(entry, /document\.body\.dataset\.tropicalReefRescue/, "route should expose a Playwright-readable dataset marker");
assert.match(weatherSmoke, /tropical-reef-rescue-readiness-kits-smoke\.mjs/, "existing tropical smoke must route reef rescue kit smoke");
assert.match(weatherSmoke, /tropical-reef-rescue-cdn-state-input-smoke\.mjs/, "existing tropical smoke must route reef rescue CDN smoke");
assert.match(manifest, /tropical-reef-rescue-readiness-domain-kit/, "manifest must register reef rescue kit");
assert.equal(kitSource.includes("document."), false, "domain kit must not own DOM");
assert.equal(kitSource.includes("window."), false, "domain kit must not own browser globals");
assert.equal(kitSource.includes("requestAnimationFrame"), false, "domain kit must not own frame loop");
assert.equal(kitSource.includes("WebGLRenderer"), false, "domain kit must not own WebGL implementation classes");
assert.equal(kitSource.includes("NexusRealtime@main"), false, "domain kit must not import old NexusRealtime CDN");

const domain = createTropicalReefRescueReadinessDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => ({
  time: index * 8.5,
  orbit: index * 0.19,
  camera: { angle: index * 0.19 },
  coconuts: [{ id: `aid-${index}`, x: -5 + index, y: 0.7, z: 4 - index }],
  floatProps: [{ id: `raft-${index}`, x: -8 + index, y: 0.1, z: -8 - index }],
  weatherShelterReadability: { rendererHandoff: { counts: { stormFronts: 2 + index } } }
}));

for (const [index, state] of cases.entries()) {
  const result = domain.describe(state);
  const handoff = result.rendererHandoff;
  assert.equal(handoff.kind, "renderer-handoff", `case ${index} handoff kind`);
  assert.equal(handoff.contract, "renderer-consumes-descriptors-only", `case ${index} handoff contract`);
  assert.equal(handoff.counts.total > 0, true, `case ${index} must emit descriptors`);
  assert.equal(handoff.descriptors.distressFlareArcs.length >= 3, true, `case ${index} distress flare descriptors`);
  assert.equal(handoff.descriptors.snorkelSearchLanes.every((lane) => Number.isFinite(lane.coverage)), true, `case ${index} snorkel coverage finite`);
  assert.equal(handoff.descriptors.ripCurrentHazards.every((hazard) => Number.isFinite(hazard.currentRisk)), true, `case ${index} current risk finite`);
  assert.equal(handoff.descriptors.firstAidCacheSparks.every((cache) => Number.isFinite(cache.priority)), true, `case ${index} first aid priority finite`);
  assert.equal(handoff.descriptors.raftAnchorRoutes.every((route) => Number.isFinite(route.stability)), true, `case ${index} raft stability finite`);
  assert.equal(handoff.descriptors.extractionPierBeacons.every((beacon) => Number.isFinite(beacon.readyScore)), true, `case ${index} extraction readiness finite`);
  assert.doesNotThrow(() => JSON.stringify(result));
}

console.log("tropical reef rescue CDN state input smoke passed");
