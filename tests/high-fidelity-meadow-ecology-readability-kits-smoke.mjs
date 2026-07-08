import assert from "node:assert/strict";
import {
  createMeadowAttentionBeaconKit,
  createMeadowEcologyReadabilityDomainKit,
  createMeadowEcologyRendererHandoffKit,
  createMeadowPollinatorRouteKit,
  createMeadowRestSpotKit,
  createMeadowSeasonalBloomQueueKit,
  createMeadowShepherdPathKit,
  createMeadowWindLaneKit,
  MEADOW_ECOLOGY_READABILITY_TREE,
  MEADOW_ECOLOGY_READABILITY_VERSION
} from "../experiments/high-fidelity-meadow/src/meadow-ecology-readability-kits.js";

const heightAt = (x = 0, z = 0) => Math.sin(x * 0.045) * 0.2 + Math.cos(z * 0.038) * 0.16;
const pathMask = (x = 0, z = 0) => Math.max(0, 1 - Math.abs(x * 0.12 + z * 0.04) / 12);
const yardMask = (x = 0, z = 0) => Math.max(0, 1 - Math.hypot(x - 2, z + 1) / 18);

const sheep = Array.from({ length: 9 }, (_, index) => ({
  id: `sheep.${index}`,
  transform: { x: -12 + index * 3.1, y: 0, z: 8 + index * 1.7, yaw: index * 0.27 }
}));

const flowers = Array.from({ length: 120 }, (_, index) => ({
  id: `flower.${index}`,
  x: Math.sin(index * 1.3) * 36,
  y: 0,
  z: Math.cos(index * 1.1) * 32,
  color: [0.72 + (index % 4) * 0.06, 0.44 + (index % 5) * 0.08, 0.26 + (index % 3) * 0.12]
}));

const intakeCases = Array.from({ length: 10 }, (_, index) => ({
  seed: `meadow-ecology-intake-${index}`,
  width: 126 + index * 9,
  depth: 118 + index * 11,
  time: index * 47,
  phase: ["day", "golden hour", "blue dusk", "moonlit quiet"][index % 4],
  dayAmount: 0.1 + index * 0.08,
  warmRim: Math.max(0, 1 - Math.abs(index - 4.5) / 5),
  heightAt,
  pathMask,
  yardMask,
  sheep,
  flowers,
  routeCount: 8 + index,
  restSpotCount: 5 + Math.floor(index / 2),
  windLaneCount: 6 + index,
  bloomCount: 7 + index
}));

const kitFactories = [
  ["pollinator", () => createMeadowPollinatorRouteKit(null, { heightAt, pathMask, yardMask }), (result) => result.routes.length >= 6],
  ["shepherd", () => createMeadowShepherdPathKit(null, { heightAt, pathMask, yardMask }), (result) => result.paths.length === sheep.length],
  ["rest", () => createMeadowRestSpotKit(null, { heightAt, pathMask, yardMask }), (result) => result.spots.length >= 4],
  ["wind", () => createMeadowWindLaneKit(null, { heightAt, pathMask, yardMask }), (result) => result.lanes.length >= 4],
  ["bloom", () => createMeadowSeasonalBloomQueueKit(null, { heightAt, pathMask, yardMask }), (result) => result.blooms.length >= 6],
  ["attention", () => createMeadowAttentionBeaconKit(null, { heightAt, pathMask, yardMask }), (result) => result.beacons.length === 5]
];

assert.ok(MEADOW_ECOLOGY_READABILITY_TREE.includes("renderer consumes descriptors only"), "domain tree must end in descriptor-only renderer handoff");

for (const [label, factory, predicate] of kitFactories) {
  const kit = factory();
  assert.equal(kit.version, MEADOW_ECOLOGY_READABILITY_VERSION, `${label} kit should expose current ecology version`);
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

const rendererHandoffKit = createMeadowEcologyRendererHandoffKit();
for (const intake of intakeCases) {
  const descriptors = {
    pollinatorRoutes: createMeadowPollinatorRouteKit(null, { heightAt, pathMask, yardMask }).describe(intake),
    shepherdPaths: createMeadowShepherdPathKit(null, { heightAt, pathMask, yardMask }).describe(intake),
    restSpots: createMeadowRestSpotKit(null, { heightAt, pathMask, yardMask }).describe(intake),
    windLanes: createMeadowWindLaneKit(null, { heightAt, pathMask, yardMask }).describe(intake),
    seasonalBloomQueue: createMeadowSeasonalBloomQueueKit(null, { heightAt, pathMask, yardMask }).describe(intake),
    attentionBeacons: createMeadowAttentionBeaconKit(null, { heightAt, pathMask, yardMask }).describe(intake)
  };
  const handoff = rendererHandoffKit.describe({ descriptors });
  assert.equal(handoff.contract, "renderer-consumes-serializable-descriptors-only");
  assert.ok(handoff.counts.total >= 40, `handoff should count ecology descriptors for ${intake.seed}`);
  assert.ok(handoff.forbiddenOwnership.includes("browser-input"));
  assert.ok(handoff.forbiddenOwnership.includes("frame-loop"));
}

const composite = createMeadowEcologyReadabilityDomainKit(null, { heightAt, pathMask, yardMask });
for (const intake of intakeCases) {
  const result = composite.describe(intake);
  assert.equal(result.domain, "high-fidelity-meadow-ecology-readability-domain");
  assert.ok(result.descriptors.pollinatorRoutes.routes.length >= 6);
  assert.equal(result.descriptors.shepherdPaths.paths.length, sheep.length);
  assert.ok(result.descriptors.restSpots.spots.length >= 4);
  assert.ok(result.descriptors.windLanes.lanes.length >= 4);
  assert.ok(result.descriptors.seasonalBloomQueue.blooms.length >= 6);
  assert.equal(result.descriptors.attentionBeacons.beacons.length, 5);
  assert.ok(result.descriptorCounts.total >= 40, `composite should emit many ecology descriptors for ${intake.seed}`);
}

console.log(`High Fidelity Meadow ecology readability kits passed ${intakeCases.length} intake cases across ${kitFactories.length + 2} kit surfaces.`);
