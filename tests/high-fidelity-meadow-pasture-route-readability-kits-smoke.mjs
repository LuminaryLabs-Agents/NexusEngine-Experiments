import assert from "node:assert/strict";
import {
  createMeadowForagePatchPriorityKit,
  createMeadowGateReturnCueKit,
  createMeadowGrazingRouteScoreKit,
  createMeadowPastureRouteReadabilityDomainKit,
  createMeadowPastureRouteRendererHandoffKit,
  createMeadowSheepComfortArcKit,
  createMeadowWaterTroughThreadKit,
  createMeadowWeatherShelterBandKit,
  MEADOW_PASTURE_ROUTE_READABILITY_TREE,
  MEADOW_PASTURE_ROUTE_READABILITY_VERSION
} from "../experiments/high-fidelity-meadow/src/meadow-pasture-route-readability-kits.js";

const heightAt = (x = 0, z = 0) => Math.sin(x * 0.04) * 0.22 + Math.cos(z * 0.035) * 0.18;
const pathMask = (x = 0, z = 0) => Math.max(0, 1 - Math.abs(x * 0.1 + z * 0.06) / 12);
const yardMask = (x = 0, z = 0) => Math.max(0, 1 - Math.hypot(x - 3, z + 2) / 20);

const sheep = Array.from({ length: 10 }, (_, index) => ({
  id: `sheep.${index}`,
  transform: { x: -15 + index * 3.4, y: 0, z: 6 + index * 1.9, yaw: index * 0.21 }
}));

const flowers = Array.from({ length: 132 }, (_, index) => ({
  id: `flower.${index}`,
  x: Math.sin(index * 1.19) * 38,
  y: 0,
  z: Math.cos(index * 1.07) * 34,
  color: [0.56 + (index % 6) * 0.05, 0.58 + (index % 4) * 0.06, 0.26 + (index % 3) * 0.1]
}));

const intakeCases = Array.from({ length: 10 }, (_, index) => ({
  seed: `meadow-pasture-route-intake-${index}`,
  width: 138 + index * 8,
  depth: 132 + index * 9,
  time: index * 53,
  phase: ["mist morning", "day", "golden hour", "blue dusk"][index % 4],
  dayAmount: 0.14 + index * 0.078,
  warmRim: Math.max(0, 1 - Math.abs(index - 5) / 5.5),
  windSeed: index * 0.23,
  heightAt,
  pathMask,
  yardMask,
  sheep,
  flowers,
  routeCount: 7 + index,
  patchCount: 8 + index,
  shelterBandCount: 4 + Math.floor(index / 2)
}));

const factories = [
  ["grazing", () => createMeadowGrazingRouteScoreKit(null, { heightAt, pathMask, yardMask }), (result) => result.routes.length >= 4 && result.routes.every((route) => route.from && route.to && Number.isFinite(route.score))],
  ["forage", () => createMeadowForagePatchPriorityKit(null, { heightAt, pathMask, yardMask }), (result) => result.patches.length >= 6 && result.patches.every((patch) => Number.isFinite(patch.priority))],
  ["comfort", () => createMeadowSheepComfortArcKit(null, { heightAt, pathMask, yardMask }), (result) => result.arcs.length === sheep.length && result.arcs.every((arc) => Number.isFinite(arc.comfort))],
  ["water", () => createMeadowWaterTroughThreadKit(null, { heightAt, pathMask, yardMask }), (result) => result.threads.length === 4 && result.threads.every((thread) => thread.from && thread.to)],
  ["gate", () => createMeadowGateReturnCueKit(null, { heightAt, pathMask, yardMask }), (result) => result.cues.length === 5 && result.cues.every((cue) => cue.label)],
  ["shelter", () => createMeadowWeatherShelterBandKit(null, { heightAt, pathMask, yardMask }), (result) => result.bands.length >= 3 && result.bands.every((band) => Number.isFinite(band.shelter))]
];

assert.ok(MEADOW_PASTURE_ROUTE_READABILITY_TREE.includes("renderer consumes descriptors only"), "domain tree must end in descriptor-only renderer handoff");

for (const [label, factory, predicate] of factories) {
  const kit = factory();
  assert.equal(kit.version, MEADOW_PASTURE_ROUTE_READABILITY_VERSION, `${label} kit should expose current pasture route version`);
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

const rendererHandoffKit = createMeadowPastureRouteRendererHandoffKit();
for (const intake of intakeCases) {
  const descriptors = {
    grazingRouteScores: createMeadowGrazingRouteScoreKit(null, { heightAt, pathMask, yardMask }).describe(intake),
    foragePatchPriorities: createMeadowForagePatchPriorityKit(null, { heightAt, pathMask, yardMask }).describe(intake),
    sheepComfortArcs: createMeadowSheepComfortArcKit(null, { heightAt, pathMask, yardMask }).describe(intake),
    waterTroughThreads: createMeadowWaterTroughThreadKit(null, { heightAt, pathMask, yardMask }).describe(intake),
    gateReturnCues: createMeadowGateReturnCueKit(null, { heightAt, pathMask, yardMask }).describe(intake),
    weatherShelterBands: createMeadowWeatherShelterBandKit(null, { heightAt, pathMask, yardMask }).describe(intake)
  };
  const handoff = rendererHandoffKit.describe({ descriptors });
  assert.equal(handoff.contract, "renderer-consumes-serializable-descriptors-only");
  const countedDescriptors = Object.entries(handoff.counts)
    .filter(([key]) => key !== "total")
    .reduce((sum, [, count]) => sum + count, 0);
  assert.equal(handoff.counts.total, countedDescriptors, `handoff should count every pasture descriptor for ${intake.seed}`);
  assert.ok(handoff.counts.total >= 6, `handoff should retain all pasture descriptor groups for ${intake.seed}`);
  assert.ok(handoff.forbiddenOwnership.includes("browser-input"));
  assert.ok(handoff.forbiddenOwnership.includes("frame-loop"));
}

const composite = createMeadowPastureRouteReadabilityDomainKit(null, { heightAt, pathMask, yardMask });
for (const intake of intakeCases) {
  const result = composite.describe(intake);
  assert.equal(result.domain, "high-fidelity-meadow-pasture-route-readability-domain");
  assert.ok(result.descriptors.grazingRouteScores.routes.length >= 4);
  assert.ok(result.descriptors.foragePatchPriorities.patches.length >= 6);
  assert.equal(result.descriptors.sheepComfortArcs.arcs.length, sheep.length);
  assert.equal(result.descriptors.waterTroughThreads.threads.length, 4);
  assert.equal(result.descriptors.gateReturnCues.cues.length, 5);
  assert.ok(result.descriptors.weatherShelterBands.bands.length >= 3);
  assert.ok(result.descriptorCounts.total >= 39, `composite should emit many pasture descriptors for ${intake.seed}`);
}

console.log(`High Fidelity Meadow pasture route readability kits passed ${intakeCases.length} intake cases across ${factories.length + 2} kit surfaces.`);
