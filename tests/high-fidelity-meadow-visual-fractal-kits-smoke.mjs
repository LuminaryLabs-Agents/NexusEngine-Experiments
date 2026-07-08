import assert from "node:assert/strict";
import {
  createMeadowAtmosphericParallaxKit,
  createMeadowDepthStrataKit,
  createMeadowFlowerDriftPatchKit,
  createMeadowGrazingTrailKit,
  createMeadowGrassPatchClusterKit,
  createMeadowLightShaftKit,
  createMeadowRendererHandoffKit,
  createMeadowVisualFractalDomainKit,
  MEADOW_VISUAL_FRACTAL_VERSION
} from "../experiments/high-fidelity-meadow/src/meadow-visual-fractal-domain-kit.js";

const heightAt = (x = 0, z = 0) => Math.sin(x * 0.05) * 0.18 + Math.cos(z * 0.04) * 0.14;
const pathMask = (x = 0, z = 0) => Math.max(0, 1 - Math.abs(x + z * 0.1) / 12);
const yardMask = (x = 0, z = 0) => Math.max(0, 1 - Math.hypot(x, z) / 18);

const sheep = Array.from({ length: 8 }, (_, index) => ({
  id: `sheep.${index}`,
  transform: { x: -8 + index * 2.3, y: 0, z: 10 + index * 2.1, yaw: index * 0.31 }
}));

const flowers = Array.from({ length: 90 }, (_, index) => ({
  id: `flower.${index}`,
  x: Math.sin(index * 1.7) * 34,
  y: 0,
  z: Math.cos(index * 1.3) * 31,
  color: [0.8 + (index % 3) * 0.05, 0.5 + (index % 4) * 0.08, 0.3 + (index % 5) * 0.06]
}));

const intakeCases = Array.from({ length: 10 }, (_, index) => ({
  seed: `meadow-intake-${index}`,
  width: 96 + index * 14,
  depth: 104 + index * 12,
  time: index * 53,
  phase: ["day", "golden hour", "blue dusk", "moonlit quiet"][index % 4],
  dayAmount: (index % 10) / 9,
  warmRim: Math.max(0, 1 - Math.abs(index - 5) / 5),
  heightAt,
  pathMask,
  yardMask,
  sheep,
  flowers,
  patchCount: 10 + index,
  driftCount: 8 + index,
  shaftCount: 4 + index
}));

const kitFactories = [
  ["depth", () => createMeadowDepthStrataKit(null, { heightAt, pathMask, yardMask }), (result) => result.bands.length === 3],
  ["grass", () => createMeadowGrassPatchClusterKit(null, { heightAt, pathMask, yardMask }), (result) => result.patches.length >= 8],
  ["flowers", () => createMeadowFlowerDriftPatchKit(null, { heightAt, pathMask, yardMask }), (result) => result.drifts.length >= 6],
  ["grazing", () => createMeadowGrazingTrailKit(null, { heightAt, pathMask, yardMask }), (result) => result.trails.length === sheep.length],
  ["light", () => createMeadowLightShaftKit(null, { heightAt, pathMask, yardMask }), (result) => result.shafts.length >= 3],
  ["parallax", () => createMeadowAtmosphericParallaxKit(null, { heightAt, pathMask, yardMask }), (result) => result.layers.length === 4]
];

for (const [label, factory, predicate] of kitFactories) {
  const kit = factory();
  assert.equal(kit.version, MEADOW_VISUAL_FRACTAL_VERSION, `${label} kit should expose current version`);
  for (const intake of intakeCases) {
    const result = kit.describe(intake);
    assert.ok(result.id.startsWith("meadow."), `${label} should return meadow descriptor id`);
    assert.ok(predicate(result), `${label} should pass intake ${intake.seed}`);
    const serialized = JSON.stringify(result);
    assert.equal(serialized.includes("THREE"), false, `${label} must not emit engine-specific renderer objects`);
    assert.equal(serialized.includes("HTML"), false, `${label} must not emit DOM objects`);
    assert.equal(serialized.includes("AudioContext"), false, `${label} must not emit audio objects`);
  }
}

const rendererHandoffKit = createMeadowRendererHandoffKit();
for (const intake of intakeCases) {
  const handoff = rendererHandoffKit.describe({
    descriptors: {
      grassPatches: createMeadowGrassPatchClusterKit(null, { heightAt, pathMask, yardMask }).describe(intake),
      flowerDrifts: createMeadowFlowerDriftPatchKit(null, { heightAt, pathMask, yardMask }).describe(intake),
      grazingTrails: createMeadowGrazingTrailKit(null, { heightAt, pathMask, yardMask }).describe(intake)
    }
  });
  assert.equal(handoff.contract, "renderer-consumes-serializable-descriptors-only");
  assert.ok(handoff.counts.total >= 22, `handoff should count descriptor surfaces for ${intake.seed}`);
  assert.ok(handoff.forbiddenOwnership.includes("frame-loop"));
}

const composite = createMeadowVisualFractalDomainKit(null, { heightAt, pathMask, yardMask });
for (const intake of intakeCases) {
  const result = composite.describe(intake);
  assert.equal(result.domain, "high-fidelity-meadow-depth-patch-fractal-domain");
  assert.ok(result.descriptors.depthStrata.bands.length === 3);
  assert.ok(result.descriptors.grassPatches.patches.length >= 8);
  assert.ok(result.descriptors.flowerDrifts.drifts.length >= 6);
  assert.ok(result.descriptors.grazingTrails.trails.length === sheep.length);
  assert.ok(result.descriptors.lightShafts.shafts.length >= 3);
  assert.ok(result.descriptors.atmosphericParallax.layers.length === 4);
  assert.ok(result.descriptorCounts.total >= 40, `composite should emit many descriptors for ${intake.seed}`);
}

console.log(`High Fidelity Meadow visual fractal kits passed ${intakeCases.length} intake cases across ${kitFactories.length + 2} kit surfaces.`);
