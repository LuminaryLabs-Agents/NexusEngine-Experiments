import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMeadowNightWatchReadinessDomainKit } from "../experiments/high-fidelity-meadow/src/meadow-night-watch-readiness-kits.js";

function read(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const files = {
  index: read("../experiments/high-fidelity-meadow/index.html"),
  entry: read("../experiments/high-fidelity-meadow/src/meadow-night-watch-entry.js"),
  kit: read("../experiments/high-fidelity-meadow/src/meadow-night-watch-readiness-kits.js"),
  parentSmoke: read("./high-fidelity-meadow-playwright-state-input-smoke.mjs")
};

const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
assert.ok(files.index.includes("night-watch-readiness-renderer-handoff-pass"), "route should advertise night watch pass");
assert.ok(files.index.includes("meadow-night-watch-entry.js?v=20260708-night-watch-readiness-1"), "route should load night watch entry");
assert.ok(files.entry.includes(NEXUS_ENGINE_MAIN_CDN), "night watch entry should import NexusEngine main CDN");
assert.equal(files.entry.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"), false, "changed entry must not import old NexusRealtime runtime CDN");
assert.equal(files.kit.includes("LuminaryLabs-Dev/NexusRealtime"), false, "domain kit must remain runtime-neutral");
assert.ok(files.entry.includes("getMeadowNightWatchReadiness"), "entry should expose meadow-specific GameHost accessor");
assert.ok(files.entry.includes("nightWatchReadiness"), "entry should compose night watch descriptors into renderer handoff");
assert.ok(files.parentSmoke.includes("meadow-night-watch-cdn-state-input-smoke.mjs"), "parent smoke should route night watch CDN smoke");

const heightAt = (x = 0, z = 0) => Math.sin(x * 0.028) * 0.2 + Math.cos(z * 0.035) * 0.14;
const pathMask = (x = 0, z = 0) => Math.max(0, 1 - Math.abs(x * 0.14 + z * 0.05) / 11);
const yardMask = (x = 0, z = 0) => Math.max(0, 1 - Math.hypot(x - 2.5, z + 2) / 19);
const kit = createMeadowNightWatchReadinessDomainKit(null, { heightAt, pathMask, yardMask });

const stateInputCases = ["Frame", "PointerDrag", "WheelUp", "Space", "Resize", "Frame", "KeyR", "PointerDrag", "Frame", "WheelDown"].map((inputName, index) => ({
  inputName,
  seed: `night-watch-cdn-${index}`,
  width: 184 + index * 3,
  depth: 178 + index * 2,
  phase: index % 2 ? "moonlit night watch" : "golden hour",
  dayAmount: 0.22 + index * 0.05,
  warmRim: 0.18 + index * 0.04,
  windSeed: index * 0.33,
  heightAt,
  pathMask,
  yardMask,
  sheep: Array.from({ length: 8 + index }, (_, sheepIndex) => ({ id: `sheep.${index}.${sheepIndex}`, transform: { x: -12 + sheepIndex * 3, z: 7 + sheepIndex } })),
  flowers: Array.from({ length: 54 + index * 6 }, (_, flowerIndex) => ({ id: `flower.${index}.${flowerIndex}`, x: Math.sin(flowerIndex * 0.37) * 35, z: Math.cos(flowerIndex * 0.41) * 30 }))
}));

for (const scenario of stateInputCases) {
  const state = kit.describe(scenario);
  assert.equal(state.rendererHandoff.contract, "renderer-consumes-serializable-descriptors-only", `contract should hold for ${scenario.inputName}`);
  assert.equal(state.descriptorCounts.total, 38, `descriptor count should remain stable for ${scenario.inputName}`);
  assert.ok(state.rendererHandoff.descriptorKeys.includes("lanternPatrol"), "handoff should include lantern patrol descriptors");
  assert.ok(state.rendererHandoff.descriptorKeys.includes("foxPressure"), "handoff should include fox pressure descriptors");
  assert.ok(state.descriptors.lambShelters.pockets.length > 0, "night watch should keep lamb shelter pockets available");
}

console.log(`Meadow night watch CDN/state/input smoke passed ${stateInputCases.length} cases against NexusEngine main CDN wiring.`);
