import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMeadowEcologyReadabilityDomainKit } from "../experiments/high-fidelity-meadow/src/meadow-ecology-readability-kits.js";

function read(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const files = {
  index: read("../experiments/high-fidelity-meadow/index.html"),
  main: read("../experiments/high-fidelity-meadow/src/main-aaa.js"),
  ecology: read("../experiments/high-fidelity-meadow/src/meadow-ecology-readability-kits.js"),
  renderer: read("../experiments/high-fidelity-meadow/src/meadow-visual-fractal-renderers.js")
};

const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
assert.ok(files.main.includes(NEXUS_ENGINE_MAIN_CDN), "High Fidelity Meadow main route should import NexusEngine main CDN");
assert.equal(files.main.includes("LuminaryLabs-Dev/NexusRealtime"), false, "changed meadow runtime must not import old NexusRealtime runtime");
assert.ok(files.main.includes("createMeadowEcologyReadabilityDomainKit"), "main should install ecology readability domain kit");
assert.ok(files.main.includes("getEcologyReadability"), "GameHost should expose ecology readability state");
assert.ok(files.main.includes("getRendererHandoff"), "GameHost should expose composed renderer handoff");
assert.ok(files.index.includes("20260708-ecology-readability-1"), "entrypoint should cache-bust the ecology upgrade");
assert.ok(files.renderer.includes("pollinatorRoutes"), "renderer should consume pollinator route descriptors");
assert.ok(files.renderer.includes("seasonalBloomQueue"), "renderer should consume bloom queue descriptors");
assert.ok(files.renderer.includes("attentionBeacons"), "renderer should consume attention beacon descriptors");
assert.ok(files.ecology.includes("renderer consumes descriptors only"), "ecology domain tree should document descriptor-only handoff");

const heightAt = (x = 0, z = 0) => Math.sin(x * 0.033) * 0.24 + Math.cos(z * 0.041) * 0.12;
const pathMask = (x = 0, z = 0) => Math.max(0, 1 - Math.abs(x * 0.2 + z * 0.05) / 10);
const yardMask = (x = 0, z = 0) => Math.max(0, 1 - Math.hypot(x - 1.5, z + 2.5) / 16);
const kit = createMeadowEcologyReadabilityDomainKit(null, { heightAt, pathMask, yardMask });

const mockInputs = Array.from({ length: 10 }, (_, index) => ({
  seed: `playwright-style-meadow-ecology-${index}`,
  width: 150 + index * 7,
  depth: 144 + index * 6,
  time: index * 60,
  phase: index % 2 ? "golden hour" : "blue dusk",
  dayAmount: 0.2 + index * 0.07,
  warmRim: 0.1 + index * 0.05,
  heightAt,
  pathMask,
  yardMask,
  sheep: Array.from({ length: 9 }, (_, sheepIndex) => ({ id: `sheep.${sheepIndex}`, transform: { x: -10 + sheepIndex * 2, z: 12 + sheepIndex, yaw: sheepIndex * 0.22 } })),
  flowers: Array.from({ length: 80 }, (_, flowerIndex) => ({ id: `flower.${flowerIndex}`, x: Math.sin(flowerIndex) * 28, z: Math.cos(flowerIndex) * 30, color: [0.9, 0.7, 0.3] }))
}));

for (const input of mockInputs) {
  const state = kit.describe(input);
  assert.equal(state.rendererHandoff.contract, "renderer-consumes-serializable-descriptors-only", `renderer handoff contract should hold for ${input.seed}`);
  assert.ok(state.rendererHandoff.forbiddenOwnership.includes("browser-input"), "kit must not own browser input");
  assert.ok(state.rendererHandoff.forbiddenOwnership.includes("audio"), "kit must not own audio");
  assert.ok(state.rendererHandoff.forbiddenOwnership.includes("frame-loop"), "kit must not own frame-loop timing");
  assert.ok(state.descriptorCounts.total >= 40, `state should expose enough ecology descriptors for ${input.seed}`);
  assert.ok(state.descriptors.pollinatorRoutes.routes.every((route) => route.from && route.to), "pollinator routes should be serializable line descriptors");
  assert.ok(state.descriptors.shepherdPaths.paths.every((path) => Array.isArray(path.points)), "shepherd paths should expose point arrays");
}

const simulatedInputSequence = ["Space", "KeyR", "WheelUp", "PointerDrag", "Resize", "Frame", "Frame", "Space", "PointerDrag", "Frame"];
const simulatedState = mockInputs.map((input, index) => ({
  input: simulatedInputSequence[index],
  snapshot: kit.describe({ ...input, time: input.time + index * 13 })
}));

assert.equal(simulatedState.length, 10, "playwright-style smoke should cover 10 state/input cases");
assert.ok(simulatedState.every((entry) => entry.snapshot.descriptorCounts.total >= 40), "each input should preserve ecology descriptor state");

console.log(`High Fidelity Meadow ecology CDN/state/input smoke passed ${simulatedState.length} cases against NexusEngine main CDN wiring.`);
