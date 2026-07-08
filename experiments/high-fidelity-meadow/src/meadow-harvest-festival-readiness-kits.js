export const MEADOW_HARVEST_FESTIVAL_READINESS_VERSION = "2026.07.08.harvest-festival-1";

export const MEADOW_HARVEST_FESTIVAL_READINESS_TREE = `
meadow-harvest-festival-readiness-domain
├─ harvest-resource-domain
│  ├─ hayrick-yield-domain
│  │  └─ meadow-hayrick-yield-kit
│  └─ wildflower-bouquet-domain
│     └─ meadow-wildflower-bouquet-trail-kit
├─ fairground-prep-domain
│  ├─ fence-repair-domain
│  │  └─ meadow-fence-repair-marker-kit
│  └─ picnic-layout-domain
│     └─ meadow-picnic-table-layout-kit
├─ evening-return-domain
│  ├─ lantern-parade-domain
│  │  └─ meadow-lantern-parade-route-kit
│  └─ weather-tarp-domain
│     └─ meadow-harvest-weather-tarp-kit
└─ renderer-handoff
   └─ meadow-harvest-festival-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;

const FORBIDDEN_OWNERSHIP = Object.freeze([
  "renderer",
  "dom",
  "browser-input",
  "three-js",
  "webgl",
  "audio",
  "asset-loading",
  "frame-loop"
]);

function clamp01(value) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function hashNumber(seed = "meadow", index = 0) {
  let h = 2166136261;
  const text = `${seed}:${index}`;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function normAngle(index, count, seed = "meadow") {
  return Math.PI * 2 * ((index / Math.max(1, count)) + hashNumber(seed, index) * 0.09);
}

function normalizeFlowers(flowers) {
  if (Array.isArray(flowers)) return flowers;
  if (Array.isArray(flowers?.flowers)) return flowers.flowers;
  return [];
}

function normalizeSheep(sheep) {
  if (Array.isArray(sheep)) return sheep;
  if (Array.isArray(sheep?.sheep)) return sheep.sheep;
  if (Array.isArray(sheep?.flock)) return sheep.flock;
  return [];
}

function readPosition(item, fallback) {
  const transform = item?.transform ?? item?.position ?? item ?? {};
  return {
    x: Number.isFinite(transform.x) ? transform.x : fallback.x,
    y: Number.isFinite(transform.y) ? transform.y : fallback.y,
    z: Number.isFinite(transform.z) ? transform.z : fallback.z
  };
}

function pointAt(input, x, z, lift = 0.05) {
  const heightAt = typeof input.heightAt === "function" ? input.heightAt : null;
  const y = heightAt ? heightAt(x, z) + lift : lift;
  return Object.freeze({ x: Number(x.toFixed(3)), y: Number(y.toFixed(3)), z: Number(z.toFixed(3)) });
}

function radialPoint(input, index, count, radiusScale = 0.36, lift = 0.05) {
  const width = Number.isFinite(input.width) ? input.width : 160;
  const depth = Number.isFinite(input.depth) ? input.depth : 152;
  const angle = normAngle(index, count, input.seed);
  const radius = Math.min(width, depth) * radiusScale * (0.72 + hashNumber(input.seed, index + 41) * 0.24);
  return pointAt(input, Math.cos(angle) * radius, Math.sin(angle) * radius, lift);
}

function pathScore(input, point) {
  return clamp01(typeof input.pathMask === "function" ? input.pathMask(point.x, point.z) : 0.35);
}

function yardScore(input, point) {
  return clamp01(typeof input.yardMask === "function" ? input.yardMask(point.x, point.z) : 0.25);
}

function descriptorCount(descriptors = {}) {
  return Object.values(descriptors).reduce((total, group) => {
    if (!group || typeof group !== "object") return total;
    return total + Object.values(group).reduce((groupTotal, value) => groupTotal + (Array.isArray(value) ? value.length : 0), 0);
  }, 0);
}

function freezeResult(result) {
  return Object.freeze(result);
}

export function createMeadowHayrickYieldKit(_runtime = null, defaults = {}) {
  return Object.freeze({
    id: "meadow-hayrick-yield-kit",
    version: MEADOW_HARVEST_FESTIVAL_READINESS_VERSION,
    describe(input = {}) {
      const scope = { ...defaults, ...input };
      const sheep = normalizeSheep(scope.sheep);
      const piles = Array.from({ length: 8 }, (_, index) => {
        const position = radialPoint(scope, index, 8, 0.42, 0.08);
        const dryness = clamp01(0.46 + hashNumber(scope.seed, index) * 0.38 + (scope.warmRim ?? 0) * 0.18);
        const trampleRisk = clamp01((sheep.length / 24) * 0.18 + pathScore(scope, position) * 0.42);
        return Object.freeze({
          id: `meadow.harvest.hayrick.${index}`,
          kind: "hayrick-yield-pile",
          position,
          radius: Number((2.4 + hashNumber(scope.seed, index + 9) * 1.4).toFixed(2)),
          yieldScore: Number((dryness * (1 - trampleRisk * 0.35)).toFixed(3)),
          trampleRisk: Number(trampleRisk.toFixed(3)),
          rendererHint: "stacked-golden-sheaf-ring"
        });
      });
      return freezeResult({ id: "meadow.harvestFestival.hayrickYield", piles });
    }
  });
}

export function createMeadowWildflowerBouquetTrailKit(_runtime = null, defaults = {}) {
  return Object.freeze({
    id: "meadow-wildflower-bouquet-trail-kit",
    version: MEADOW_HARVEST_FESTIVAL_READINESS_VERSION,
    describe(input = {}) {
      const scope = { ...defaults, ...input };
      const flowers = normalizeFlowers(scope.flowers);
      const bouquets = Array.from({ length: 10 }, (_, index) => {
        const flower = flowers.length ? flowers[(index * 7) % flowers.length] : null;
        const fallback = radialPoint(scope, index, 10, 0.31, 0.1);
        const position = flower ? pointAt(scope, flower.x ?? fallback.x, flower.z ?? fallback.z, 0.1) : fallback;
        const color = flower?.color ?? [0.82, 0.74, 0.32];
        return Object.freeze({
          id: `meadow.harvest.bouquet.${index}`,
          kind: "wildflower-bouquet-trail-marker",
          position,
          color,
          fullness: Number(clamp01(0.42 + flowers.length / 220 + hashNumber(scope.seed, index + 12) * 0.28).toFixed(3)),
          pathAffinity: Number(pathScore(scope, position).toFixed(3)),
          rendererHint: "braided-flower-ribbon"
        });
      });
      return freezeResult({ id: "meadow.harvestFestival.wildflowerBouquetTrail", bouquets });
    }
  });
}

export function createMeadowFenceRepairMarkerKit(_runtime = null, defaults = {}) {
  return Object.freeze({
    id: "meadow-fence-repair-marker-kit",
    version: MEADOW_HARVEST_FESTIVAL_READINESS_VERSION,
    describe(input = {}) {
      const scope = { ...defaults, ...input };
      const markers = Array.from({ length: 6 }, (_, index) => {
        const position = radialPoint(scope, index, 6, 0.48, 0.12);
        const urgency = clamp01(0.3 + pathScore(scope, position) * 0.35 + hashNumber(scope.seed, index + 31) * 0.35);
        return Object.freeze({
          id: `meadow.harvest.fenceRepair.${index}`,
          kind: "fence-repair-marker",
          position,
          urgency: Number(urgency.toFixed(3)),
          boardCount: 2 + Math.round(urgency * 4),
          rendererHint: "leaning-whitewash-post-spark"
        });
      });
      return freezeResult({ id: "meadow.harvestFestival.fenceRepairMarkers", markers });
    }
  });
}

export function createMeadowPicnicTableLayoutKit(_runtime = null, defaults = {}) {
  return Object.freeze({
    id: "meadow-picnic-table-layout-kit",
    version: MEADOW_HARVEST_FESTIVAL_READINESS_VERSION,
    describe(input = {}) {
      const scope = { ...defaults, ...input };
      const tables = Array.from({ length: 5 }, (_, index) => {
        const position = radialPoint(scope, index, 5, 0.18 + index * 0.025, 0.08);
        const shade = clamp01(0.24 + yardScore(scope, position) * 0.5 + hashNumber(scope.seed, index + 44) * 0.2);
        return Object.freeze({
          id: `meadow.harvest.picnicTable.${index}`,
          kind: "picnic-table-layout-anchor",
          position,
          seats: 4 + (index % 3) * 2,
          shadeScore: Number(shade.toFixed(3)),
          rendererHint: "checked-cloth-table-footprint"
        });
      });
      return freezeResult({ id: "meadow.harvestFestival.picnicTableLayout", tables });
    }
  });
}

export function createMeadowLanternParadeRouteKit(_runtime = null, defaults = {}) {
  return Object.freeze({
    id: "meadow-lantern-parade-route-kit",
    version: MEADOW_HARVEST_FESTIVAL_READINESS_VERSION,
    describe(input = {}) {
      const scope = { ...defaults, ...input };
      const phaseText = String(scope.phase ?? "golden hour");
      const duskBoost = phaseText.includes("dusk") || phaseText.includes("night") ? 0.34 : 0.12;
      const beacons = Array.from({ length: 7 }, (_, index) => {
        const position = radialPoint(scope, index, 7, 0.28, 0.28);
        return Object.freeze({
          id: `meadow.harvest.lantern.${index}`,
          kind: "lantern-parade-beacon",
          position,
          glow: Number(clamp01(0.36 + duskBoost + index * 0.035 + hashNumber(scope.seed, index + 55) * 0.18).toFixed(3)),
          routeOrder: index,
          rendererHint: "warm-lantern-parade-orb"
        });
      });
      return freezeResult({ id: "meadow.harvestFestival.lanternParadeRoute", beacons });
    }
  });
}

export function createMeadowHarvestWeatherTarpKit(_runtime = null, defaults = {}) {
  return Object.freeze({
    id: "meadow-harvest-weather-tarp-kit",
    version: MEADOW_HARVEST_FESTIVAL_READINESS_VERSION,
    describe(input = {}) {
      const scope = { ...defaults, ...input };
      const wind = Math.abs(Number(scope.windSeed ?? 0));
      const windows = Array.from({ length: 4 }, (_, index) => {
        const position = radialPoint(scope, index, 4, 0.24, 0.18);
        const risk = clamp01(0.18 + ((wind + index * 0.17) % 1) * 0.48 + (1 - clamp01(scope.dayAmount ?? 0.5)) * 0.22);
        return Object.freeze({
          id: `meadow.harvest.weatherTarp.${index}`,
          kind: "harvest-weather-tarp-window",
          position,
          windRisk: Number(risk.toFixed(3)),
          tieDowns: 3 + Math.round(risk * 5),
          rendererHint: "canvas-tarp-wind-arc"
        });
      });
      return freezeResult({ id: "meadow.harvestFestival.weatherTarps", windows });
    }
  });
}

export function createMeadowHarvestFestivalRendererHandoffKit() {
  return Object.freeze({
    id: "meadow-harvest-festival-renderer-handoff-kit",
    version: MEADOW_HARVEST_FESTIVAL_READINESS_VERSION,
    describe({ descriptors = {} } = {}) {
      const counts = Object.freeze({
        hayrickYieldPiles: descriptors.hayrickYield?.piles?.length ?? 0,
        wildflowerBouquets: descriptors.wildflowerBouquetTrail?.bouquets?.length ?? 0,
        fenceRepairMarkers: descriptors.fenceRepairMarkers?.markers?.length ?? 0,
        picnicTableLayouts: descriptors.picnicTableLayout?.tables?.length ?? 0,
        lanternParadeBeacons: descriptors.lanternParadeRoute?.beacons?.length ?? 0,
        weatherTarpWindows: descriptors.weatherTarps?.windows?.length ?? 0,
        total: descriptorCount(descriptors)
      });
      return freezeResult({
        id: "meadow.harvestFestival.rendererHandoff",
        kind: "renderer-handoff",
        contract: "renderer-consumes-serializable-descriptors-only",
        descriptorKeys: Object.freeze(Object.keys(descriptors)),
        counts,
        forbiddenOwnership: FORBIDDEN_OWNERSHIP,
        descriptors
      });
    }
  });
}

export function createMeadowHarvestFestivalReadinessDomainKit(runtime = null, defaults = {}) {
  const hayrickYieldKit = createMeadowHayrickYieldKit(runtime, defaults);
  const wildflowerBouquetTrailKit = createMeadowWildflowerBouquetTrailKit(runtime, defaults);
  const fenceRepairMarkerKit = createMeadowFenceRepairMarkerKit(runtime, defaults);
  const picnicTableLayoutKit = createMeadowPicnicTableLayoutKit(runtime, defaults);
  const lanternParadeRouteKit = createMeadowLanternParadeRouteKit(runtime, defaults);
  const weatherTarpKit = createMeadowHarvestWeatherTarpKit(runtime, defaults);
  const handoffKit = createMeadowHarvestFestivalRendererHandoffKit(runtime, defaults);
  return Object.freeze({
    id: "meadow-harvest-festival-readiness-domain-kit",
    version: MEADOW_HARVEST_FESTIVAL_READINESS_VERSION,
    tree: MEADOW_HARVEST_FESTIVAL_READINESS_TREE,
    describe(input = {}) {
      const descriptors = Object.freeze({
        hayrickYield: hayrickYieldKit.describe(input),
        wildflowerBouquetTrail: wildflowerBouquetTrailKit.describe(input),
        fenceRepairMarkers: fenceRepairMarkerKit.describe(input),
        picnicTableLayout: picnicTableLayoutKit.describe(input),
        lanternParadeRoute: lanternParadeRouteKit.describe(input),
        weatherTarps: weatherTarpKit.describe(input)
      });
      const rendererHandoff = handoffKit.describe({ descriptors });
      return freezeResult({
        id: "meadow.harvestFestival.readiness",
        domain: "meadow-harvest-festival-readiness-domain",
        version: MEADOW_HARVEST_FESTIVAL_READINESS_VERSION,
        tree: MEADOW_HARVEST_FESTIVAL_READINESS_TREE,
        descriptors,
        descriptorCounts: rendererHandoff.counts,
        rendererHandoff
      });
    }
  });
}