import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMeadowFlockSafetyReadinessDomainKit } from "../experiments/high-fidelity-meadow/src/meadow-flock-safety-readiness-kits.js";

function read(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const files = {
  index: read("../experiments/high-fidelity-meadow/index.html"),
  main: read("../experiments/high-fidelity-meadow/src/main-aaa.js"),
  flockSafety: read("../experiments/high-fidelity-meadow/src/meadow-flock-safety-readiness-kits.js"),
  renderer: read("../experiments/high-fidelity-meadow/src/meadow-visual-fractal-renderers.js"),
  runChecks: read("../scripts/run-checks.mjs"),
  manifest: read("../experiments/domain-kit-cutover-manifest.json")
};

const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
assert.ok(files.main.includes(NEXUS_ENGINE_MAIN_CDN), "High Fidelity Meadow main route should import NexusEngine main CDN");
assert.equal(files.main.includes("LuminaryLabs-Dev/NexusRealtime"), false, "changed meadow runtime must not import old NexusRealtime runtime");
assert.ok(files.main.includes("createMeadowFlockSafetyReadinessDomainKit"), "main should install flock safety readiness domain kit");
assert.ok(files.main.includes("getFlockSafetyReadiness"), "GameHost should expose flock safety readiness state");
assert.ok(files.main.includes("flockSafetyReadiness"), "main should compose flock safety descriptors into state");
assert.ok(files.main.includes("getRendererHandoff"), "GameHost should expose composed renderer handoff");
assert.ok(files.index.includes("20260708-flock-safety-readiness-1"), "entrypoint should cache-bust the flock safety upgrade");
assert.ok(files.renderer.includes("lostLambCalls"), "renderer should consume lost lamb call descriptors");
assert.ok(files.renderer.includes("foxShadowBoundaries"), "renderer should consume fox boundary descriptors");
assert.ok(files.renderer.includes("bellwetherLeadThreads"), "renderer should consume bellwether lead descriptors");
assert.ok(files.renderer.includes("cottageLanternReturns"), "renderer should consume cottage lantern return descriptors");
assert.ok(files.flockSafety.includes("renderer consumes descriptors only"), "flock safety domain tree should document descriptor-only handoff");
assert.equal(files.flockSafety.includes("new THREE"), false, "flock safety kits must not instantiate Three.js objects");
assert.equal(files.flockSafety.includes("document.querySelector"), false, "flock safety kits must not own DOM lookup");
assert.equal(files.flockSafety.includes("requestAnimationFrame"), false, "flock safety kits must not own frame loop");
assert.ok(files.runChecks.includes("high-fidelity-meadow-flock-safety-readiness-kits-smoke.mjs"), "full/deploy checks should route flock safety kit smoke");
assert.ok(files.runChecks.includes("high-fidelity-meadow-flock-safety-cdn-state-input-smoke.mjs"), "full/deploy checks should route flock safety CDN/state smoke");
assert.ok(files.manifest.includes("flock-safety-readiness-renderer-handoff-pass"), "manifest should record the flock safety cutover");

const heightAt = (x = 0, z = 0) => Math.sin(x * 0.031) * 0.2 + Math.cos(z * 0.037) * 0.17;
const pathMask = (x = 0, z = 0) => Math.max(0, 1 - Math.abs(x * 0.18 + z * 0.05) / 11);
const yardMask = (x = 0, z = 0) => Math.max(0, 1 - Math.hypot(x - 2.5, z + 1.5) / 18);
const kit = createMeadowFlockSafetyReadinessDomainKit(null, { heightAt, pathMask, yardMask });

const mockInputs = Array.from({ length: 10 }, (_, index) => ({
  seed: `playwright-style-meadow-flock-safety-${index}`,
  width: 148 + index * 7,
  depth: 140 + index * 6,
  time: index * 67,
  phase: index % 2 ? "golden hour" : "blue dusk",
  dayAmount: 0.13 + index * 0.075,
  warmRim: 0.12 + index * 0.045,
  windSeed: index * 0.19,
  heightAt,
  pathMask,
  yardMask,
  sheep: Array.from({ length: 13 }, (_, sheepIndex) => ({ id: `sheep.${sheepIndex}`, transform: { x: -16 + sheepIndex * 2.7 + (sheepIndex % 4 === 0 ? 8 : 0), z: 8 + sheepIndex * 1.4, yaw: sheepIndex * 0.18 } })),
  flowers: Array.from({ length: 90 }, (_, flowerIndex) => ({ id: `flower.${flowerIndex}`, x: Math.sin(flowerIndex * 1.2) * 30, z: Math.cos(flowerIndex * 1.1) * 32, color: [0.8, 0.7, 0.28] }))
}));

for (const input of mockInputs) {
  const state = kit.describe(input);
  assert.equal(state.rendererHandoff.contract, "renderer-consumes-serializable-descriptors-only", `renderer handoff contract should hold for ${input.seed}`);
  assert.ok(state.rendererHandoff.forbiddenOwnership.includes("browser-input"), "kit must not own browser input");
  assert.ok(state.rendererHandoff.forbiddenOwnership.includes("audio"), "kit must not own audio");
  assert.ok(state.rendererHandoff.forbiddenOwnership.includes("frame-loop"), "kit must not own frame-loop timing");
  assert.ok(state.descriptorCounts.total >= 41, `state should expose enough flock safety descriptors for ${input.seed}`);
  assert.ok(state.descriptors.lostLambCalls.calls.every((call) => Number.isFinite(call.priority)), "lost lamb calls should expose priorities");
  assert.ok(state.descriptors.bellwetherLeadThreads.threads.every((thread) => thread.from && thread.to), "bellwether threads should be serializable line descriptors");
}

const simulatedInputSequence = ["Space", "KeyR", "WheelUp", "PointerDrag", "Resize", "Frame", "Frame", "Space", "PointerDrag", "Frame"];
const simulatedState = mockInputs.map((input, index) => ({
  input: simulatedInputSequence[index],
  snapshot: kit.describe({ ...input, time: input.time + index * 17 })
}));

assert.equal(simulatedState.length, 10, "playwright-style smoke should cover 10 state/input cases");
assert.ok(simulatedState.every((entry) => entry.snapshot.descriptorCounts.total >= 41), "each input should preserve flock safety descriptor state");

console.log(`High Fidelity Meadow flock safety CDN/state/input smoke passed ${simulatedState.length} cases against NexusEngine main CDN wiring.`);
