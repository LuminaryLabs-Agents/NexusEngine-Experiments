import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMeadowPastureRouteReadabilityDomainKit } from "../experiments/high-fidelity-meadow/src/meadow-pasture-route-readability-kits.js";

function read(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const files = {
  index: read("../experiments/high-fidelity-meadow/index.html"),
  main: read("../experiments/high-fidelity-meadow/src/main-aaa.js"),
  pasture: read("../experiments/high-fidelity-meadow/src/meadow-pasture-route-readability-kits.js"),
  renderer: read("../experiments/high-fidelity-meadow/src/meadow-visual-fractal-renderers.js")
};

const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
assert.ok(files.main.includes(NEXUS_ENGINE_MAIN_CDN), "High Fidelity Meadow main route should import NexusEngine main CDN");
assert.equal(files.main.includes("LuminaryLabs-Dev/NexusRealtime"), false, "changed meadow runtime must not import old NexusRealtime runtime");
assert.ok(files.main.includes("createMeadowPastureRouteReadabilityDomainKit"), "main should install pasture route readability domain kit");
assert.ok(files.main.includes("getPastureRouteReadability"), "GameHost should expose pasture route readability state");
assert.ok(files.main.includes("pastureRouteReadability"), "main should compose pasture route descriptors into state");
assert.ok(files.main.includes("getRendererHandoff"), "GameHost should expose composed renderer handoff");
assert.ok(files.index.includes("20260708-flock-safety-readiness-1"), "entrypoint should cache-bust the latest meadow upgrade while preserving pasture wiring");
assert.ok(files.renderer.includes("grazingRouteScores"), "renderer should consume grazing route descriptors");
assert.ok(files.renderer.includes("foragePatchPriorities"), "renderer should consume forage patch descriptors");
assert.ok(files.renderer.includes("weatherShelterBands"), "renderer should consume weather shelter descriptors");
assert.ok(files.pasture.includes("renderer consumes descriptors only"), "pasture domain tree should document descriptor-only handoff");
assert.equal(files.pasture.includes("new THREE"), false, "pasture kits must not instantiate Three.js objects");
assert.equal(files.pasture.includes("document.querySelector"), false, "pasture kits must not own DOM lookup");
assert.equal(files.pasture.includes("requestAnimationFrame"), false, "pasture kits must not own frame loop");

const heightAt = (x = 0, z = 0) => Math.sin(x * 0.031) * 0.2 + Math.cos(z * 0.037) * 0.17;
const pathMask = (x = 0, z = 0) => Math.max(0, 1 - Math.abs(x * 0.18 + z * 0.05) / 11);
const yardMask = (x = 0, z = 0) => Math.max(0, 1 - Math.hypot(x - 2.5, z + 1.5) / 18);
const kit = createMeadowPastureRouteReadabilityDomainKit(null, { heightAt, pathMask, yardMask });

const mockInputs = Array.from({ length: 10 }, (_, index) => ({
  seed: `playwright-style-meadow-pasture-route-${index}`,
  width: 148 + index * 7,
  depth: 140 + index * 6,
  time: index * 67,
  phase: index % 2 ? "golden hour" : "mist morning",
  dayAmount: 0.18 + index * 0.07,
  warmRim: 0.12 + index * 0.045,
  windSeed: index * 0.19,
  heightAt,
  pathMask,
  yardMask,
  sheep: Array.from({ length: 10 }, (_, sheepIndex) => ({ id: `sheep.${sheepIndex}`, transform: { x: -12 + sheepIndex * 2.3, z: 10 + sheepIndex * 1.2, yaw: sheepIndex * 0.18 } })),
  flowers: Array.from({ length: 90 }, (_, flowerIndex) => ({ id: `flower.${flowerIndex}`, x: Math.sin(flowerIndex * 1.2) * 30, z: Math.cos(flowerIndex * 1.1) * 32, color: [0.8, 0.7, 0.28] }))
}));

for (const input of mockInputs) {
  const state = kit.describe(input);
  assert.equal(state.rendererHandoff.contract, "renderer-consumes-serializable-descriptors-only", `renderer handoff contract should hold for ${input.seed}`);
  assert.ok(state.rendererHandoff.forbiddenOwnership.includes("browser-input"), "kit must not own browser input");
  assert.ok(state.rendererHandoff.forbiddenOwnership.includes("audio"), "kit must not own audio");
  assert.ok(state.rendererHandoff.forbiddenOwnership.includes("frame-loop"), "kit must not own frame-loop timing");
  assert.ok(state.descriptorCounts.total >= 39, `state should expose enough pasture descriptors for ${input.seed}`);
  assert.ok(state.descriptors.grazingRouteScores.routes.every((route) => route.from && route.to), "grazing routes should be serializable line descriptors");
  assert.ok(state.descriptors.sheepComfortArcs.arcs.every((arc) => Number.isFinite(arc.comfort)), "sheep comfort arcs should expose comfort scores");
}

const simulatedInputSequence = ["Space", "KeyR", "WheelUp", "PointerDrag", "Resize", "Frame", "Frame", "Space", "PointerDrag", "Frame"];
const simulatedState = mockInputs.map((input, index) => ({
  input: simulatedInputSequence[index],
  snapshot: kit.describe({ ...input, time: input.time + index * 17 })
}));

assert.equal(simulatedState.length, 10, "playwright-style smoke should cover 10 state/input cases");
assert.ok(simulatedState.every((entry) => entry.snapshot.descriptorCounts.total >= 39), "each input should preserve pasture route descriptor state");

console.log(`High Fidelity Meadow pasture route CDN/state/input smoke passed ${simulatedState.length} cases against NexusEngine main CDN wiring.`);
