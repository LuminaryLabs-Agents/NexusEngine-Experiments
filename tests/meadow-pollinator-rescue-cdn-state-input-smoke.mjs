import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMeadowPollinatorRescueReadinessDomainKit } from "../experiments/high-fidelity-meadow/src/meadow-pollinator-rescue-readiness-kits.js";

function read(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const files = {
  index: read("../experiments/high-fidelity-meadow/index.html"),
  entry: read("../experiments/high-fidelity-meadow/src/meadow-pollinator-rescue-entry.js"),
  kit: read("../experiments/high-fidelity-meadow/src/meadow-pollinator-rescue-readiness-kits.js"),
  manifest: read("../experiments/domain-kit-cutover-manifest.json"),
  parentSmoke: read("./high-fidelity-meadow-playwright-state-input-smoke.mjs")
};

const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
assert.ok(files.index.includes("pollinator-rescue-readiness-renderer-handoff-pass"), "route should advertise pollinator rescue pass");
assert.ok(files.index.includes("meadow-pollinator-rescue-entry.js?v=20260708-pollinator-rescue-readiness-1"), "route should load pollinator rescue entry");
assert.ok(files.entry.includes(NEXUS_ENGINE_MAIN_CDN), "pollinator rescue entry should import NexusEngine main CDN");
assert.equal(files.entry.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"), false, "changed entry must not import old NexusRealtime runtime CDN");
assert.equal(files.kit.includes("LuminaryLabs-Dev/NexusRealtime"), false, "domain kit must remain runtime-neutral");
assert.ok(files.entry.includes("getMeadowPollinatorRescueReadiness"), "entry should expose meadow-specific GameHost accessor");
assert.ok(files.entry.includes("pollinatorRescueReadiness"), "entry should compose pollinator descriptors into renderer handoff");
assert.ok(files.manifest.includes("meadow-pollinator-rescue-readiness-domain-kit"), "manifest should register pollinator rescue domain kit");
assert.ok(files.manifest.includes("pollinator-rescue-readiness-renderer-handoff-pass"), "manifest status should include pollinator rescue pass");
assert.ok(files.parentSmoke.includes("meadow-pollinator-rescue-cdn-state-input-smoke.mjs"), "parent smoke should route pollinator rescue CDN smoke");

const heightAt = (x = 0, z = 0) => Math.sin(x * 0.028) * 0.2 + Math.cos(z * 0.035) * 0.14;
const pathMask = (x = 0, z = 0) => Math.max(0, 1 - Math.abs(x * 0.14 + z * 0.05) / 11);
const yardMask = (x = 0, z = 0) => Math.max(0, 1 - Math.hypot(x - 2.5, z + 2) / 19);
const kit = createMeadowPollinatorRescueReadinessDomainKit(null, { heightAt, pathMask, yardMask });

const stateInputCases = ["Frame", "PointerDrag", "WheelUp", "Space", "Resize", "Frame", "KeyR", "PointerDrag", "Frame", "WheelDown"].map((inputName, index) => ({
  inputName,
  seed: `pollinator-rescue-cdn-${index}`,
  width: 184 + index * 3,
  depth: 178 + index * 2,
  phase: index % 2 ? "dusk count" : "golden hour",
  dayAmount: 0.32 + index * 0.05,
  warmRim: 0.22 + index * 0.04,
  windSeed: index * 0.33,
  heightAt,
  pathMask,
  yardMask,
  sheep: Array.from({ length: 6 + index }, (_, sheepIndex) => ({ id: `sheep.${index}.${sheepIndex}`, transform: { x: -12 + sheepIndex * 3, z: 7 + sheepIndex } })),
  flowers: Array.from({ length: 52 + index * 6 }, (_, flowerIndex) => ({ id: `flower.${index}.${flowerIndex}`, x: Math.sin(flowerIndex * 0.37) * 35, z: Math.cos(flowerIndex * 0.41) * 30 }))
}));

for (const scenario of stateInputCases) {
  const state = kit.describe(scenario);
  assert.equal(state.rendererHandoff.contract, "renderer-consumes-serializable-descriptors-only", `contract should hold for ${scenario.inputName}`);
  assert.equal(state.descriptorCounts.total, 41, `descriptor count should remain stable for ${scenario.inputName}`);
  assert.ok(state.rendererHandoff.descriptorKeys.includes("beeNestHealth"), "handoff should include bee nest health descriptors");
  assert.ok(state.rendererHandoff.descriptorKeys.includes("pollenCorridors"), "handoff should include pollen corridor descriptors");
}

console.log(`Meadow pollinator rescue CDN/state/input smoke passed ${stateInputCases.length} cases against NexusEngine main CDN wiring.`);
