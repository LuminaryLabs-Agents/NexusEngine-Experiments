import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMeadowCreekIrrigationReadinessDomainKit } from "../experiments/high-fidelity-meadow/src/meadow-creek-irrigation-readiness-kits.js";

function read(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const files = {
  index: read("../experiments/high-fidelity-meadow/index.html"),
  entry: read("../experiments/high-fidelity-meadow/src/meadow-creek-irrigation-entry.js"),
  kit: read("../experiments/high-fidelity-meadow/src/meadow-creek-irrigation-readiness-kits.js"),
  parentSmoke: read("./high-fidelity-meadow-playwright-state-input-smoke.mjs")
};

const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
assert.ok(files.index.includes("creek-irrigation-readiness-renderer-handoff-pass"), "route should advertise creek irrigation readiness pass");
assert.ok(files.index.includes("meadow-creek-irrigation-entry.js?v=20260709-creek-irrigation-readiness-1"), "route should load creek irrigation readiness entry");
assert.ok(files.entry.includes(NEXUS_ENGINE_MAIN_CDN), "changed entry should import NexusEngine main CDN");
assert.equal(files.entry.includes("LuminaryLabs-Dev/NexusRealtime"), false, "changed entry must not import old NexusRealtime runtime");
assert.ok(files.entry.includes("getMeadowCreekIrrigationReadiness"), "GameHost should expose meadow creek irrigation readiness accessor");
assert.ok(files.entry.includes("getRendererHandoff"), "entry should compose descriptor-only renderer handoff");
assert.ok(files.kit.includes("meadow-creek-irrigation-readiness-domain"), "kit should declare the readiness domain");
assert.ok(files.kit.includes("renderer consumes creek irrigation descriptors only"), "kit should document descriptor-only renderer contract");
assert.ok(files.parentSmoke.includes("high-fidelity-meadow-creek-irrigation-cdn-state-input-smoke.mjs"), "parent meadow smoke should route creek irrigation validation");

const heightAt = (x = 0, z = 0) => Math.sin(x * 0.027) * 0.2 + Math.cos(z * 0.039) * 0.13;
const pathMask = (x = 0, z = 0) => Math.max(0, 1 - Math.abs(x * 0.12 + z * 0.05) / 11);
const yardMask = (x = 0, z = 0) => Math.max(0, 1 - Math.hypot(x - 3.8, z + 2.9) / 19);
const kit = createMeadowCreekIrrigationReadinessDomainKit();
const simulatedInputs = ["Frame", "PointerDrag", "Resize", "KeyW", "Wheel", "Frame", "KeyA", "Frame", "PointerDrag", "Frame"].map((eventName, index) => ({
  eventName,
  seed: `creek-playwright-style-${index}`,
  width: 148 + index * 9,
  depth: 144 + index * 8,
  dayAmount: 0.2 + index * 0.06,
  heightAt,
  pathMask,
  yardMask,
  sheep: Array.from({ length: 6 + index }, (_, sheepIndex) => ({ id: `sheep.${index}.${sheepIndex}`, transform: { x: -10 + sheepIndex * 3, z: 12 + sheepIndex } })),
  flowers: Array.from({ length: 50 + index * 4 }, (_, flowerIndex) => ({ id: `flower.${index}.${flowerIndex}`, x: Math.sin(flowerIndex) * 36, z: Math.cos(flowerIndex * 0.8) * 34 }))
}));

const simulatedState = simulatedInputs.map((input) => ({ input: input.eventName, snapshot: kit.describe(input) }));
assert.equal(simulatedState.length, 10, "CDN/state/input smoke should cover 10 state/input cases");
assert.ok(simulatedState.every((entry) => entry.snapshot.rendererHandoff.contract === "renderer-consumes-serializable-descriptors-only"), "each state should preserve descriptor-only contract");
assert.ok(simulatedState.every((entry) => entry.snapshot.descriptorCounts.total >= 22), "each state should emit creek irrigation descriptors");
assert.ok(simulatedState.every((entry) => entry.snapshot.rendererHandoff.forbiddenOwnership.includes("browser-input")), "state/input validation should keep browser input outside reusable kits");

console.log(`High Fidelity Meadow creek irrigation CDN/state/input smoke passed ${simulatedState.length} simulated cases against NexusEngine main CDN wiring.`);
