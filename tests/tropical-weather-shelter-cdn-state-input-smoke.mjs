import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTropicalWeatherShelterReadabilityDomainKit } from "../experiments/tropical-island-scene/src/tropical-weather-shelter-readability-domain-kit.js";

const CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const OLD_RUNTIME_CDN = "LuminaryLabs-Dev/NexusRealtime@main/src/index.js";
const indexHtml = readFileSync("experiments/tropical-island-scene/index.html", "utf8");
const entry = readFileSync("experiments/tropical-island-scene/src/weather-shelter-readability-entry.js", "utf8");
const kitSource = readFileSync("experiments/tropical-island-scene/src/tropical-weather-shelter-readability-domain-kit.js", "utf8");
const checks = readFileSync("scripts/run-checks.mjs", "utf8");

assert.match(entry, new RegExp(CDN.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "changed entry must import NexusEngine main CDN");
assert.equal(entry.includes(OLD_RUNTIME_CDN), false, "changed weather shelter entry must not import old NexusRealtime runtime CDN");
assert.match(indexHtml, /weather-shelter-readability-entry\.js\?v=tropical-island-weather-shelter-20260708/, "route shell must load weather shelter overlay");
assert.match(entry, /getWeatherShelterReadability/, "GameHost must expose weather shelter readability");
assert.match(entry, /getRendererHandoff/, "GameHost renderer handoff must be extended");
assert.match(entry, /weatherShelter/, "composed renderer handoff must include weather shelter group");
assert.match(entry, /document\.body\.dataset\.tropicalWeatherShelter/, "route should expose a Playwright-readable dataset marker");
assert.equal(kitSource.includes("document."), false, "domain kit must not own DOM");
assert.equal(kitSource.includes("window."), false, "domain kit must not own browser globals");
assert.equal(kitSource.includes("requestAnimationFrame"), false, "domain kit must not own frame loop");
assert.equal(kitSource.includes("WebGLRenderer"), false, "domain kit must not own WebGL implementation classes");
assert.match(checks, /tests\/tropical-weather-shelter-readability-kits-smoke\.mjs/);
assert.match(checks, /tests\/tropical-weather-shelter-cdn-state-input-smoke\.mjs/);

const domain = createTropicalWeatherShelterReadabilityDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => ({
  time: index * 9.75,
  orbit: index * 0.17,
  camera: { angle: index * 0.17 },
  palms: [{ id: `palm-a-${index}`, x: -10 + index, y: 2.2, z: -12 }, { id: `palm-b-${index}`, x: 12 - index, y: 2.5, z: -18 }],
  coconuts: [{ id: `cache-a-${index}`, x: -4 + index, y: 0.7, z: 5 - index }],
  floatProps: [{ id: `raft-${index}`, x: -8 + index, y: 0, z: -8 - index }]
}));

for (const [index, state] of cases.entries()) {
  const result = domain.describe(state);
  const handoff = result.rendererHandoff;
  assert.equal(handoff.kind, "renderer-handoff", `case ${index} handoff kind`);
  assert.equal(handoff.contract, "renderer-consumes-descriptors-only", `case ${index} handoff contract`);
  assert.equal(handoff.counts.total > 0, true, `case ${index} must emit descriptors`);
  assert.equal(handoff.descriptors.stormFronts.length >= 3, true, `case ${index} storm fronts`);
  assert.equal(handoff.descriptors.tideEscapeWindows.every((window) => Number.isFinite(window.tideRisk)), true, `case ${index} tide risk finite`);
  assert.equal(handoff.descriptors.waveBreakWarnings.every((warning) => Number.isFinite(warning.breakRisk)), true, `case ${index} break risk finite`);
  assert.equal(handoff.descriptors.duskReturnBeacons.every((beacon) => Number.isFinite(beacon.returnUrgency)), true, `case ${index} return urgency finite`);
  assert.doesNotThrow(() => JSON.stringify(result));
}

console.log("tropical weather shelter CDN state input smoke passed");
