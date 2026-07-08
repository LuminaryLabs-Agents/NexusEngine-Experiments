import assert from "node:assert/strict";
import {
  createMeadowBellwetherLeadThreadKit,
  createMeadowCottageLanternReturnKit,
  createMeadowFlockSafetyReadinessDomainKit,
  createMeadowFlockSafetyRendererHandoffKit,
  createMeadowFoxShadowBoundaryKit,
  createMeadowLostLambCallKit,
  createMeadowNightfallFoldGateKit,
  createMeadowVetCheckPulseKit,
  MEADOW_FLOCK_SAFETY_READINESS_TREE,
  MEADOW_FLOCK_SAFETY_READINESS_VERSION
} from "../experiments/high-fidelity-meadow/src/meadow-flock-safety-readiness-kits.js";

const heightAt = (x = 0, z = 0) => Math.sin(x * 0.04) * 0.22 + Math.cos(z * 0.035) * 0.18;
const pathMask = (x = 0, z = 0) => Math.max(0, 1 - Math.abs(x * 0.1 + z * 0.06) / 12);
const yardMask = (x = 0, z = 0) => Math.max(0, 1 - Math.hypot(x - 3, z + 2) / 20);

const sheep = Array.from({ length: 14 }, (_, index) => ({
  id: `sheep.${index}`,
  transform: { x: -18 + index * 3.4 + (index % 4 === 0 ? 9 : 0), y: 0, z: 5 + index * 1.65 + (index % 5 === 0 ? 14 : 0), yaw: index * 0.21 }
}));

const flowers = Array.from({ length: 118 }, (_, index) => ({
  id: `flower.${index}`,
  x: Math.sin(index * 1.19) * 38,
  y: 0,
  z: Math.cos(index * 1.07) * 34,
  color: [0.56 + (index % 6) * 0.05, 0.58 + (index % 4) * 0.06, 0.26 + (index % 3) * 0.1]
}));

const intakeCases = Array.from({ length: 10 }, (_, index) => ({
  seed: `meadow-flock-safety-intake-${index}`,
  width: 140 + index * 8,
  depth: 136 + index * 7,
  time: index * 71,
  phase: ["mist morning", "day", "golden hour", "blue dusk"][index % 4],
  dayAmount: 0.12 + index * 0.075,
  warmRim: Math.max(0, 1 - Math.abs(index - 5) / 5.5),
  windSeed: index * 0.29,
  heightAt,
  pathMask,
  yardMask,
  sheep,
  flowers,
  boundaryCount: 4 + index
}));

const factories = [
  ["lost lamb", () => createMeadowLostLambCallKit(null, { heightAt, pathMask, yardMask }), (result) => result.calls.length === 12 && result.calls.every((call) => Number.isFinite(call.priority) && call.rendererHint)],
  ["fox shadow", () => createMeadowFoxShadowBoundaryKit(null, { heightAt, pathMask, yardMask }), (result) => result.boundaries.length >= 4 && result.boundaries.every((boundary) => Number.isFinite(boundary.risk))],
  ["bellwether", () => createMeadowBellwetherLeadThreadKit(null, { heightAt, pathMask, yardMask }), (result) => result.threads.length === 5 && result.threads.every((thread) => thread.from && thread.to)],
  ["vet check", () => createMeadowVetCheckPulseKit(null, { heightAt, pathMask, yardMask }), (result) => result.pulses.length === 10 && result.pulses.every((pulse) => Number.isFinite(pulse.concern))],
  ["nightfall", () => createMeadowNightfallFoldGateKit(null, { heightAt, pathMask, yardMask }), (result) => result.gates.length === 4 && result.gates.every((gate) => Number.isFinite(gate.readiness))],
  ["lantern", () => createMeadowCottageLanternReturnKit(null, { heightAt, pathMask, yardMask }), (result) => result.lanterns.length === 6 && result.lanterns.every((lantern) => Number.isFinite(lantern.glow))]
];

assert.ok(MEADOW_FLOCK_SAFETY_READINESS_TREE.includes("renderer consumes descriptors only"), "domain tree must end in descriptor-only renderer handoff");
assert.ok(MEADOW_FLOCK_SAFETY_READINESS_TREE.includes("lost-lamb-domain"), "domain tree should split flock risk into smaller subdomains");
assert.ok(MEADOW_FLOCK_SAFETY_READINESS_TREE.includes("cottage-lantern-domain"), "domain tree should keep return guidance split from flock risk");

for (const [label, factory, predicate] of factories) {
  const kit = factory();
  assert.equal(kit.version, MEADOW_FLOCK_SAFETY_READINESS_VERSION, `${label} kit should expose current flock safety version`);
  for (const intake of intakeCases) {
    const result = kit.describe(intake);
    assert.ok(result.id.startsWith("meadow."), `${label} should return meadow descriptor id`);
    assert.ok(predicate(result), `${label} should pass intake ${intake.seed}`);
    const serialized = JSON.stringify(result);
    assert.equal(serialized.includes("THREE"), false, `${label} must not emit renderer objects`);
    assert.equal(serialized.includes("HTML"), false, `${label} must not emit DOM objects`);
    assert.equal(serialized.includes("AudioContext"), false, `${label} must not emit audio objects`);
    assert.equal(serialized.includes("requestAnimationFrame"), false, `${label} must not own frame loop`);
  }
}

const rendererHandoffKit = createMeadowFlockSafetyRendererHandoffKit();
for (const intake of intakeCases) {
  const descriptors = {
    lostLambCalls: createMeadowLostLambCallKit(null, { heightAt, pathMask, yardMask }).describe(intake),
    foxShadowBoundaries: createMeadowFoxShadowBoundaryKit(null, { heightAt, pathMask, yardMask }).describe(intake),
    bellwetherLeadThreads: createMeadowBellwetherLeadThreadKit(null, { heightAt, pathMask, yardMask }).describe(intake),
    vetCheckPulses: createMeadowVetCheckPulseKit(null, { heightAt, pathMask, yardMask }).describe(intake),
    nightfallFoldGates: createMeadowNightfallFoldGateKit(null, { heightAt, pathMask, yardMask }).describe(intake),
    cottageLanternReturns: createMeadowCottageLanternReturnKit(null, { heightAt, pathMask, yardMask }).describe(intake)
  };
  const handoff = rendererHandoffKit.describe({ descriptors });
  assert.equal(handoff.contract, "renderer-consumes-serializable-descriptors-only");
  assert.ok(handoff.counts.total >= 41, `handoff should count flock safety descriptors for ${intake.seed}`);
  assert.ok(handoff.forbiddenOwnership.includes("browser-input"));
  assert.ok(handoff.forbiddenOwnership.includes("frame-loop"));
}

const composite = createMeadowFlockSafetyReadinessDomainKit(null, { heightAt, pathMask, yardMask });
for (const intake of intakeCases) {
  const result = composite.describe(intake);
  assert.equal(result.domain, "high-fidelity-meadow-flock-safety-readiness-domain");
  assert.equal(result.descriptors.lostLambCalls.calls.length, 12);
  assert.ok(result.descriptors.foxShadowBoundaries.boundaries.length >= 4);
  assert.equal(result.descriptors.bellwetherLeadThreads.threads.length, 5);
  assert.equal(result.descriptors.vetCheckPulses.pulses.length, 10);
  assert.equal(result.descriptors.nightfallFoldGates.gates.length, 4);
  assert.equal(result.descriptors.cottageLanternReturns.lanterns.length, 6);
  assert.ok(result.descriptorCounts.total >= 41, `composite should emit many flock safety descriptors for ${intake.seed}`);
  assert.equal(JSON.stringify(result).includes("new THREE"), false, "composite must serialize without renderer ownership");
}

console.log(`High Fidelity Meadow flock safety readiness kits passed ${intakeCases.length} intake cases across ${factories.length + 2} kit surfaces.`);
