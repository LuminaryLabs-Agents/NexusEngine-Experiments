import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMeadowHarvestFestivalReadinessDomainKit } from "../experiments/high-fidelity-meadow/src/meadow-harvest-festival-readiness-kits.js";

function read(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const files = {
  index: read("../experiments/high-fidelity-meadow/index.html"),
  entry: read("../experiments/high-fidelity-meadow/src/meadow-harvest-festival-entry.js"),
  kit: read("../experiments/high-fidelity-meadow/src/meadow-harvest-festival-readiness-kits.js"),
  flockSafetySmoke: read("./high-fidelity-meadow-flock-safety-cdn-state-input-smoke.mjs"),
  manifest: read("../experiments/domain-kit-cutover-manifest.json")
};

const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
assert.ok(files.entry.includes(NEXUS_ENGINE_MAIN_CDN), "harvest festival entry should import NexusEngine main CDN");
assert.equal(files.entry.includes("LuminaryLabs-Dev/NexusRealtime"), false, "changed harvest festival entry must not import old NexusRealtime runtime");
assert.equal(files.kit.includes("LuminaryLabs-Dev/NexusRealtime"), false, "harvest festival kits must not import old NexusRealtime runtime");
assert.ok(files.index.includes("20260708-harvest-festival-readiness-1"), "route should cache-bust the harvest festival overlay");
assert.ok(files.entry.includes("getHarvestFestivalReadiness"), "GameHost should expose harvest festival readiness state");
assert.ok(files.entry.includes("getMeadowHarvestFestivalReadiness"), "GameHost should expose meadow harvest festival alias");
assert.ok(files.entry.includes("getHarvestFestivalReadinessTree"), "GameHost should expose harvest festival tree");
assert.ok(files.entry.includes("harvestFestivalReadiness"), "entry should compose harvest festival descriptors into state and handoff");
assert.ok(files.kit.includes("renderer consumes descriptors only"), "harvest festival domain tree should document descriptor-only handoff");
assert.equal(files.kit.includes("new THREE"), false, "harvest festival kits must not instantiate Three.js objects");
assert.equal(files.kit.includes("document.querySelector"), false, "harvest festival kits must not own DOM lookup");
assert.equal(files.kit.includes("requestAnimationFrame"), false, "harvest festival kits must not own frame loop");
assert.ok(files.manifest.includes("harvest-festival-readiness-renderer-handoff-pass"), "manifest should record harvest festival cutover");
assert.ok(files.manifest.includes("meadow-harvest-festival-readiness-domain-kit"), "manifest should register harvest festival domain kit");
assert.ok(files.flockSafetySmoke.includes("high-fidelity-meadow-harvest-festival-readiness-kits-smoke.mjs"), "existing routed smoke should import harvest festival kit smoke");
assert.ok(files.flockSafetySmoke.includes("high-fidelity-meadow-harvest-festival-cdn-state-input-smoke.mjs"), "existing routed smoke should import harvest festival CDN/state smoke");

const heightAt = (x = 0, z = 0) => Math.sin(x * 0.033) * 0.19 + Math.cos(z * 0.044) * 0.17;
const pathMask = (x = 0, z = 0) => Math.max(0, 1 - Math.abs(x * 0.16 + z * 0.05) / 12);
const yardMask = (x = 0, z = 0) => Math.max(0, 1 - Math.hypot(x - 2.5, z + 1.5) / 21);
const kit = createMeadowHarvestFestivalReadinessDomainKit(null, { heightAt, pathMask, yardMask });

const mockInputs = Array.from({ length: 10 }, (_, index) => ({
  seed: `playwright-style-meadow-harvest-festival-${index}`,
  width: 148 + index * 7,
  depth: 142 + index * 6,
  time: index * 71,
  phase: index % 3 === 0 ? "blue dusk" : index % 3 === 1 ? "golden hour" : "day",
  dayAmount: 0.16 + index * 0.073,
  warmRim: 0.18 + index * 0.04,
  windSeed: index * 0.21,
  heightAt,
  pathMask,
  yardMask,
  sheep: Array.from({ length: 16 }, (_, sheepIndex) => ({ id: `sheep.${sheepIndex}`, transform: { x: -18 + sheepIndex * 2.9 + (sheepIndex % 4 === 0 ? 7 : 0), z: 8 + sheepIndex * 1.3, yaw: sheepIndex * 0.16 } })),
  flowers: Array.from({ length: 96 }, (_, flowerIndex) => ({ id: `flower.${flowerIndex}`, x: Math.sin(flowerIndex * 1.2) * 33, z: Math.cos(flowerIndex * 1.1) * 31, color: [0.82, 0.68, 0.31] }))
}));

for (const input of mockInputs) {
  const state = kit.describe(input);
  assert.equal(state.rendererHandoff.contract, "renderer-consumes-serializable-descriptors-only", `renderer handoff contract should hold for ${input.seed}`);
  assert.ok(state.rendererHandoff.forbiddenOwnership.includes("browser-input"), "kit must not own browser input");
  assert.ok(state.rendererHandoff.forbiddenOwnership.includes("audio"), "kit must not own audio");
  assert.ok(state.rendererHandoff.forbiddenOwnership.includes("frame-loop"), "kit must not own frame-loop timing");
  assert.equal(state.descriptorCounts.total, 40, `state should expose harvest festival descriptors for ${input.seed}`);
  assert.ok(state.descriptors.hayrickYield.piles.every((pile) => Number.isFinite(pile.yieldScore)), "hayrick piles should expose finite yield scores");
  assert.ok(state.descriptors.lanternParadeRoute.beacons.every((beacon) => Number.isFinite(beacon.glow)), "lantern beacons should expose finite glow values");
}

const simulatedInputSequence = ["Space", "KeyR", "WheelUp", "PointerDrag", "Resize", "Frame", "Frame", "Space", "PointerDrag", "Frame"];
const simulatedState = mockInputs.map((input, index) => ({
  input: simulatedInputSequence[index],
  snapshot: kit.describe({ ...input, time: input.time + index * 19 })
}));

assert.equal(simulatedState.length, 10, "playwright-style smoke should cover 10 state/input cases");
assert.ok(simulatedState.every((entry) => entry.snapshot.descriptorCounts.total === 40), "each input should preserve harvest festival descriptor state");

console.log(`High Fidelity Meadow harvest festival CDN/state/input smoke passed ${simulatedState.length} cases against NexusEngine main CDN wiring.`);
