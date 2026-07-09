import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createBirdRunCanopyRescueDomainKit } from "../experiments/BirdRun/bird-run-canopy-rescue-domain-kits.js";

const index = readFileSync("experiments/BirdRun/index.html", "utf8");
const entry = readFileSync("experiments/BirdRun/bird-run-canopy-rescue-entry.js", "utf8");
const kits = readFileSync("experiments/BirdRun/bird-run-canopy-rescue-domain-kits.js", "utf8");

assert.ok(index.includes("bird-run-canopy-rescue-readiness-renderer-handoff-pass"));
assert.ok(index.includes("bird-run-canopy-rescue-entry.js?v=bird-run-canopy-rescue-readiness-v1"));
assert.ok(entry.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(!entry.includes("NexusRealtime@main"));
assert.ok(entry.includes("getBirdRunCanopyRescueReadiness"));
assert.ok(entry.includes("getRendererHandoff"));
assert.ok(kits.includes("renderer consumes descriptors only"));
assert.ok(!kits.includes("document.querySelector"));
assert.ok(!kits.includes("requestAnimationFrame"));

const domain = createBirdRunCanopyRescueDomainKit({ seed: 52 });
const cases = [
  { state: { lane: 0, distance: 0 }, intent: { right: true }, dt: 0.016 },
  { state: { lane: 1, distance: 86 }, intent: { left: true }, dt: 0.02 },
  { state: { lane: -1, distance: 172 }, intent: { flap: true }, dt: 0.033 },
  { state: { lane: 0, distance: 258, speed: 33 }, intent: {}, dt: 0.04 },
  { state: { lane: 0, distance: 344, rescued: 2 }, intent: { left: true, flap: true }, dt: 0.016 },
  { state: { lane: 1, distance: 430 }, intent: { right: true }, dt: 0.05 },
  { state: { lane: -1, distance: 516, alive: false }, intent: { restart: true }, dt: 0.01 },
  { state: { lane: 0, distance: 602, altitude: 0.88 }, intent: {}, dt: 0.02 },
  { state: { lane: 1, distance: 688, speed: 54 }, intent: { left: true }, dt: 0.08 },
  { state: { lane: 0, distance: 774 }, intent: { left: true, right: true }, dt: 0.016 }
];

for (const testCase of cases) {
  const frame = domain.update(testCase);
  assert.ok(frame.rendererHandoff.telemetry.descriptorCount >= 10);
  assert.ok(["flying", "tracking", "urgent", "rescued", "grounded"].includes(frame.state.status));
  assert.ok(frame.rendererHandoff.obstacles.every((descriptor) => descriptor.kind === "canopy-obstacle"));
  assert.ok(frame.rendererHandoff.beacons.every((descriptor) => descriptor.kind === "nestling-rescue-beacon"));
}

console.log(`BirdRun canopy rescue CDN/state-input smoke passed ${cases.length} cases.`);
