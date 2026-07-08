import assert from "node:assert/strict";
import {
  createMeadowFenceRepairMarkerKit,
  createMeadowHarvestFestivalReadinessDomainKit,
  createMeadowHarvestFestivalRendererHandoffKit,
  createMeadowHarvestWeatherTarpKit,
  createMeadowHayrickYieldKit,
  createMeadowLanternParadeRouteKit,
  createMeadowPicnicTableLayoutKit,
  createMeadowWildflowerBouquetTrailKit,
  MEADOW_HARVEST_FESTIVAL_READINESS_TREE,
  MEADOW_HARVEST_FESTIVAL_READINESS_VERSION
} from "../experiments/high-fidelity-meadow/src/meadow-harvest-festival-readiness-kits.js";

const heightAt = (x = 0, z = 0) => Math.sin(x * 0.039) * 0.18 + Math.cos(z * 0.041) * 0.2;
const pathMask = (x = 0, z = 0) => Math.max(0, 1 - Math.abs(x * 0.13 + z * 0.06) / 12);
const yardMask = (x = 0, z = 0) => Math.max(0, 1 - Math.hypot(x - 4, z + 2) / 22);

const sheep = Array.from({ length: 18 }, (_, index) => ({
  id: `sheep.${index}`,
  transform: {
    x: -22 + index * 2.8 + (index % 5 === 0 ? 8 : 0),
    y: 0,
    z: 9 + index * 1.6 + (index % 4 === 0 ? 12 : 0),
    yaw: index * 0.19
  }
}));

const flowers = Array.from({ length: 128 }, (_, index) => ({
  id: `flower.${index}`,
  x: Math.sin(index * 1.17) * 41,
  y: 0,
  z: Math.cos(index * 1.09) * 38,
  color: [0.62 + (index % 5) * 0.05, 0.55 + (index % 4) * 0.07, 0.24 + (index % 6) * 0.06]
}));

const intakeCases = Array.from({ length: 10 }, (_, index) => ({
  seed: `meadow-harvest-festival-intake-${index}`,
  width: 150 + index * 6,
  depth: 144 + index * 5,
  time: index * 83,
  phase: ["mist morning", "day", "golden hour", "blue dusk", "night lanterns"][index % 5],
  dayAmount: 0.18 + index * 0.07,
  warmRim: Math.max(0, 1 - Math.abs(index - 6) / 6.5),
  windSeed: index * 0.23,
  heightAt,
  pathMask,
  yardMask,
  sheep,
  flowers
}));

const factories = [
  ["hayrick", () => createMeadowHayrickYieldKit(null, { heightAt, pathMask, yardMask }), (result) => result.piles.length === 8 && result.piles.every((pile) => Number.isFinite(pile.yieldScore) && pile.rendererHint)],
  ["bouquet", () => createMeadowWildflowerBouquetTrailKit(null, { heightAt, pathMask, yardMask }), (result) => result.bouquets.length === 10 && result.bouquets.every((bouquet) => Number.isFinite(bouquet.fullness) && Array.isArray(bouquet.color))],
  ["fence", () => createMeadowFenceRepairMarkerKit(null, { heightAt, pathMask, yardMask }), (result) => result.markers.length === 6 && result.markers.every((marker) => Number.isFinite(marker.urgency) && marker.boardCount >= 2)],
  ["picnic", () => createMeadowPicnicTableLayoutKit(null, { heightAt, pathMask, yardMask }), (result) => result.tables.length === 5 && result.tables.every((table) => table.seats >= 4 && Number.isFinite(table.shadeScore))],
  ["lantern", () => createMeadowLanternParadeRouteKit(null, { heightAt, pathMask, yardMask }), (result) => result.beacons.length === 7 && result.beacons.every((beacon) => Number.isFinite(beacon.glow) && Number.isFinite(beacon.routeOrder))],
  ["weather", () => createMeadowHarvestWeatherTarpKit(null, { heightAt, pathMask, yardMask }), (result) => result.windows.length === 4 && result.windows.every((window) => Number.isFinite(window.windRisk) && window.tieDowns >= 3)]
];

assert.ok(MEADOW_HARVEST_FESTIVAL_READINESS_TREE.includes("renderer consumes descriptors only"), "domain tree must end in descriptor-only renderer handoff");
assert.ok(MEADOW_HARVEST_FESTIVAL_READINESS_TREE.includes("hayrick-yield-domain"), "harvest resources should split into hayrick subdomain");
assert.ok(MEADOW_HARVEST_FESTIVAL_READINESS_TREE.includes("weather-tarp-domain"), "weather tarp domain should stay independent from renderer handoff");

for (const [label, factory, predicate] of factories) {
  const kit = factory();
  assert.equal(kit.version, MEADOW_HARVEST_FESTIVAL_READINESS_VERSION, `${label} kit should expose current harvest festival version`);
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

const rendererHandoffKit = createMeadowHarvestFestivalRendererHandoffKit();
for (const intake of intakeCases) {
  const descriptors = {
    hayrickYield: createMeadowHayrickYieldKit(null, { heightAt, pathMask, yardMask }).describe(intake),
    wildflowerBouquetTrail: createMeadowWildflowerBouquetTrailKit(null, { heightAt, pathMask, yardMask }).describe(intake),
    fenceRepairMarkers: createMeadowFenceRepairMarkerKit(null, { heightAt, pathMask, yardMask }).describe(intake),
    picnicTableLayout: createMeadowPicnicTableLayoutKit(null, { heightAt, pathMask, yardMask }).describe(intake),
    lanternParadeRoute: createMeadowLanternParadeRouteKit(null, { heightAt, pathMask, yardMask }).describe(intake),
    weatherTarps: createMeadowHarvestWeatherTarpKit(null, { heightAt, pathMask, yardMask }).describe(intake)
  };
  const handoff = rendererHandoffKit.describe({ descriptors });
  assert.equal(handoff.contract, "renderer-consumes-serializable-descriptors-only");
  assert.equal(handoff.counts.total, 40, `handoff should count harvest festival descriptors for ${intake.seed}`);
  assert.ok(handoff.forbiddenOwnership.includes("browser-input"));
  assert.ok(handoff.forbiddenOwnership.includes("frame-loop"));
}

const composite = createMeadowHarvestFestivalReadinessDomainKit(null, { heightAt, pathMask, yardMask });
for (const intake of intakeCases) {
  const result = composite.describe(intake);
  assert.equal(result.domain, "meadow-harvest-festival-readiness-domain");
  assert.equal(result.descriptors.hayrickYield.piles.length, 8);
  assert.equal(result.descriptors.wildflowerBouquetTrail.bouquets.length, 10);
  assert.equal(result.descriptors.fenceRepairMarkers.markers.length, 6);
  assert.equal(result.descriptors.picnicTableLayout.tables.length, 5);
  assert.equal(result.descriptors.lanternParadeRoute.beacons.length, 7);
  assert.equal(result.descriptors.weatherTarps.windows.length, 4);
  assert.equal(result.descriptorCounts.total, 40, `composite should emit harvest festival descriptors for ${intake.seed}`);
  assert.equal(JSON.stringify(result).includes("new THREE"), false, "composite must serialize without renderer ownership");
}

console.log(`High Fidelity Meadow harvest festival readiness kits passed ${intakeCases.length} intake cases across ${factories.length + 2} kit surfaces.`);
