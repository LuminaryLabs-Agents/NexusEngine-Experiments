import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createNextLedgeSummitWeatherStationReadinessDomainKit } from "../experiments/next-ledge/src/summit-weather-station-readiness-kits.js";

const html = readFileSync(new URL("../experiments/next-ledge/index.html", import.meta.url), "utf8");
const entry = readFileSync(new URL("../experiments/next-ledge/src/summit-weather-station-readiness-entry.js", import.meta.url), "utf8");
const kits = readFileSync(new URL("../experiments/next-ledge/src/summit-weather-station-readiness-kits.js", import.meta.url), "utf8");
assert.ok(html.includes("summit-weather-station-readiness-renderer-handoff-pass"), "route marker should advertise summit weather pass");
assert.ok(!html.includes("summit-weather-station-readiness-entry.js"), "clean playable route should not auto-load summit weather entry");
assert.ok(html.includes('<option value="weather-station">Weather station</option>'), "advanced disclosure should preserve weather station context");
assert.ok(entry.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "entry should import NexusEngine main CDN");
assert.ok(!entry.includes("NexusRealtime@"), "changed entry should not import old NexusRealtime runtime CDN");
assert.ok(entry.includes("getNextLedgeSummitWeatherStationReadiness"), "entry should expose GameHost readiness accessor");
assert.ok(entry.includes("getRendererHandoff"), "entry should compose renderer handoff");
for (const banned of ["document.", "window.", "THREE.", "WebGLRenderingContext", "AudioContext", "requestAnimationFrame", "getContext(", "addEventListener", "localStorage"]) assert.equal(kits.includes(banned), false, `reusable kit file should not own ${banned}`);

const kit = createNextLedgeSummitWeatherStationReadinessDomainKit();
const baseLedges = [
  { id: "a", x: -150, y: 80, type: "normal" },
  { id: "b", x: -60, y: 180, type: "normal" },
  { id: "c", x: 12, y: 295, type: "rest", safe: true },
  { id: "d", x: 84, y: 420, type: "normal" },
  { id: "e", x: 140, y: 540, type: "rest", safe: true },
  { id: "f", x: 24, y: 710, type: "summit", safe: true }
];
const simulatedInputs = [
  ["a", ["a"], 0.08, 0.7, 0.8, 48],
  ["b", ["a", "b"], 0.16, 0.62, 0.72, 58],
  ["c", ["a", "b", "c"], 0.28, 0.52, 0.63, 77],
  ["c", ["a", "b", "c"], 0.38, 0.48, 0.58, 92],
  ["d", ["a", "b", "c", "d"], 0.48, 0.42, 0.52, 70],
  ["e", ["a", "b", "c", "d", "e"], 0.58, 0.36, 0.44, 93],
  ["e", ["a", "b", "c", "d", "e"], 0.68, 0.3, 0.36, 108],
  ["f", ["a", "b", "c", "d", "e", "f"], 0.78, 0.25, 0.28, 112],
  ["f", ["a", "b", "c", "d", "e", "f"], 0.9, 0.18, 0.18, 115],
  ["f", ["a", "b", "c", "d", "e", "f"], 0.98, 0.08, 0.08, 115]
];
const readiness = simulatedInputs.map(([currentAnchorId, visitedLedgeIds, repairProgress, wind, storm, stamina], index) => kit.describe({
  levelId: "next-ledge-cdn-state-smoke",
  mode: "climbing",
  route: { id: "cdn-route", ledges: baseLedges },
  player: { x: -140 + index * 22, y: 80 + index * 70, z: 8, vx: 15, vy: 20 },
  camera: { x: 0, y: 260 + index * 35, z: 310 },
  currentAnchorId,
  visitedLedgeIds,
  weatherStation: { repairProgress },
  weather: { wind, storm },
  stamina,
  constants: { maxStamina: 115 }
}));
assert.equal(readiness.length, 10, "should evaluate 10 simulated cases");
for (const [index, result] of readiness.entries()) {
  assert.ok(result.rendererHandoff.descriptorCount >= 1, `case ${index} descriptors`);
  assert.equal(result.rendererHandoff.counts.dawnForecastLedgers, 1, `case ${index} ledger count`);
  assert.ok(result.summary.safeClimbWindowMinutes >= 5, `case ${index} safe window`);
}
assert.ok(readiness.at(-1).summary.readiness > readiness[0].summary.readiness, "state/input progression should improve weather-station readiness");
console.log("Next Ledge summit weather station CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
