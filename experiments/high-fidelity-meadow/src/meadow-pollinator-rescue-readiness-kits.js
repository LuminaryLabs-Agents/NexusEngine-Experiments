export const MEADOW_POLLINATOR_RESCUE_READINESS_VERSION = "2026.07.08.pollinator-rescue-1";

export const MEADOW_POLLINATOR_RESCUE_READINESS_TREE = `
meadow-pollinator-rescue-readiness-domain
├─ pollinator-habitat-domain
│  ├─ bee-nest-health-domain
│  │  └─ meadow-bee-nest-health-kit
│  └─ native-seedbank-domain
│     └─ meadow-native-flower-seedbank-kit
├─ migration-support-domain
│  ├─ pollen-corridor-domain
│  │  └─ meadow-pollen-corridor-wind-kit
│  └─ monarch-waystation-domain
│     └─ meadow-milkweed-monarch-waystation-kit
├─ microclimate-stewardship-domain
│  ├─ puddle-drink-domain
│  │  └─ meadow-puddle-drink-microhabitat-kit
│  └─ dusk-ledger-domain
│     └─ meadow-dusk-pollinator-ledger-kit
└─ renderer-handoff
   └─ meadow-pollinator-rescue-renderer-handoff-kit
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
  "frame-loop",
  "physics"
]);

function clamp01(value) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function hashNumber(seed = "meadow-pollinator", index = 0) {
  let h = 2166136261;
  const text = `${seed}:${index}`;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
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

function pointAt(input, x, z, lift = 0.08) {
  const heightAt = typeof input.heightAt === "function" ? input.heightAt : null;
  const y = heightAt ? heightAt(x, z) + lift : lift;
  return Object.freeze({ x: Number(x.toFixed(3)), y: Number(y.toFixed(3)), z: Number(z.toFixed(3)) });
}

function radialPoint(input, index, count, radiusScale = 0.32, lift = 0.08) {
  const width = Number.isFinite(input.width) ? input.width : 180;
  const depth = Number.isFinite(input.depth) ? input.depth : 172;
  const angle = Math.PI * 2 * ((index / Math.max(1, count)) + hashNumber(input.seed, index + 19) * 0.075);
  const radius = Math.min(width, depth) * radiusScale * (0.72 + hashNumber(input.seed, index + 31) * 0.22);
  return pointAt(input, Math.cos(angle) * radius, Math.sin(angle) * radius, lift);
}

function pathScore(input, point) {
  return clamp01(typeof input.pathMask === "function" ? input.pathMask(point.x, point.z) : 0.28);
}

function yardScore(input, point) {
  return clamp01(typeof input.yardMask === "function" ? input.yardMask(point.x, point.z) : 0.24);
}

function flowerPoint(input, index, fallbackScale = 0.3, lift = 0.1) {
  const flowers = normalizeFlowers(input.flowers);
  if (!flowers.length) return radialPoint(input, index, 12, fallbackScale, lift);
  const flower = flowers[(index * 11) % flowers.length];
  const fallback = radialPoint(input, index, 12, fallbackScale, lift);
  return pointAt(input, Number.isFinite(flower?.x) ? flower.x : fallback.x, Number.isFinite(flower?.z) ? flower.z : fallback.z, lift);
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

export function createMeadowBeeNestHealthKit(_runtime = null, defaults = {}) {
  return Object.freeze({
    id: "meadow-bee-nest-health-kit",
    version: MEADOW_POLLINATOR_RESCUE_READINESS_VERSION,
    describe(input = {}) {
      const scope = { ...defaults, ...input };
      const sheepPressure = normalizeSheep(scope.sheep).length / 30;
      const clusters = Array.from({ length: 7 }, (_, index) => {
        const position = radialPoint(scope, index, 7, 0.2 + index * 0.012, 0.12);
        const trampling = clamp01(pathScore(scope, position) * 0.48 + sheepPressure * 0.22 + hashNumber(scope.seed, index + 4) * 0.14);
        const health = clamp01(0.82 - trampling * 0.46 + clamp01(scope.dayAmount ?? 0.6) * 0.16);
        return Object.freeze({
          id: `meadow.pollinator.beeNest.${index}`,
          kind: "bee-nest-health-cluster",
          position,
          health: Number(health.toFixed(3)),
          tramplingRisk: Number(trampling.toFixed(3)),
          guardRadius: Number((2.2 + health * 2.1).toFixed(2)),
          rendererHint: "amber-nest-guard-ring"
        });
      });
      return freezeResult({ id: "meadow.pollinatorRescue.beeNestHealth", clusters });
    }
  });
}

export function createMeadowNativeFlowerSeedbankKit(_runtime = null, defaults = {}) {
  return Object.freeze({
    id: "meadow-native-flower-seedbank-kit",
    version: MEADOW_POLLINATOR_RESCUE_READINESS_VERSION,
    describe(input = {}) {
      const scope = { ...defaults, ...input };
      const flowers = normalizeFlowers(scope.flowers);
      const seedbeds = Array.from({ length: 9 }, (_, index) => {
        const position = flowerPoint(scope, index, 0.34, 0.1);
        const diversity = clamp01(0.36 + flowers.length / 260 + hashNumber(scope.seed, index + 22) * 0.24);
        return Object.freeze({
          id: `meadow.pollinator.seedbank.${index}`,
          kind: "native-flower-seedbank-patch",
          position,
          diversity: Number(diversity.toFixed(3)),
          seedPackets: 2 + Math.round(diversity * 7),
          rendererHint: "wildflower-seed-mosaic"
        });
      });
      return freezeResult({ id: "meadow.pollinatorRescue.nativeSeedbank", seedbeds });
    }
  });
}

export function createMeadowPollenCorridorWindKit(_runtime = null, defaults = {}) {
  return Object.freeze({
    id: "meadow-pollen-corridor-wind-kit",
    version: MEADOW_POLLINATOR_RESCUE_READINESS_VERSION,
    describe(input = {}) {
      const scope = { ...defaults, ...input };
      const wind = Number(scope.windSeed ?? 0);
      const corridors = Array.from({ length: 8 }, (_, index) => {
        const from = radialPoint(scope, index, 8, 0.18, 0.2);
        const to = radialPoint(scope, index + 3, 8, 0.42, 0.2);
        const drift = clamp01(Math.abs(Math.sin(wind + index * 0.47)) * 0.72 + clamp01(scope.warmRim ?? 0.3) * 0.18);
        return Object.freeze({
          id: `meadow.pollinator.pollenCorridor.${index}`,
          kind: "pollen-corridor-wind-ribbon",
          from,
          to,
          drift: Number(drift.toFixed(3)),
          ribbonWidth: Number((0.6 + drift * 1.8).toFixed(2)),
          rendererHint: "floating-gold-pollen-stream"
        });
      });
      return freezeResult({ id: "meadow.pollinatorRescue.pollenCorridors", corridors });
    }
  });
}

export function createMeadowMilkweedMonarchWaystationKit(_runtime = null, defaults = {}) {
  return Object.freeze({
    id: "meadow-milkweed-monarch-waystation-kit",
    version: MEADOW_POLLINATOR_RESCUE_READINESS_VERSION,
    describe(input = {}) {
      const scope = { ...defaults, ...input };
      const stations = Array.from({ length: 6 }, (_, index) => {
        const position = radialPoint(scope, index, 6, 0.38, 0.14);
        const nectar = clamp01(0.34 + yardScore(scope, position) * 0.34 + hashNumber(scope.seed, index + 43) * 0.3);
        return Object.freeze({
          id: `meadow.pollinator.monarchWaystation.${index}`,
          kind: "milkweed-monarch-waystation",
          position,
          nectarScore: Number(nectar.toFixed(3)),
          milkweedStems: 3 + Math.round(nectar * 9),
          rendererHint: "orange-wing-waystation-halo"
        });
      });
      return freezeResult({ id: "meadow.pollinatorRescue.monarchWaystations", stations });
    }
  });
}

export function createMeadowPuddleDrinkMicrohabitatKit(_runtime = null, defaults = {}) {
  return Object.freeze({
    id: "meadow-puddle-drink-microhabitat-kit",
    version: MEADOW_POLLINATOR_RESCUE_READINESS_VERSION,
    describe(input = {}) {
      const scope = { ...defaults, ...input };
      const dampness = clamp01(1 - clamp01(scope.dayAmount ?? 0.58) + Math.abs(Math.sin(Number(scope.windSeed ?? 0))) * 0.2);
      const puddles = Array.from({ length: 5 }, (_, index) => {
        const position = radialPoint(scope, index, 5, 0.26, 0.045);
        const hydration = clamp01(0.32 + dampness * 0.4 + hashNumber(scope.seed, index + 61) * 0.2);
        return Object.freeze({
          id: `meadow.pollinator.puddleDrink.${index}`,
          kind: "puddle-drink-microhabitat",
          position,
          hydration: Number(hydration.toFixed(3)),
          pebbleCount: 5 + Math.round(hydration * 10),
          rendererHint: "shallow-blue-pollinator-water-dot"
        });
      });
      return freezeResult({ id: "meadow.pollinatorRescue.puddleDrinks", puddles });
    }
  });
}

export function createMeadowDuskPollinatorLedgerKit(_runtime = null, defaults = {}) {
  return Object.freeze({
    id: "meadow-dusk-pollinator-ledger-kit",
    version: MEADOW_POLLINATOR_RESCUE_READINESS_VERSION,
    describe(input = {}) {
      const scope = { ...defaults, ...input };
      const phaseText = String(scope.phase ?? "golden hour").toLowerCase();
      const dusk = phaseText.includes("dusk") || phaseText.includes("night") ? 0.35 : 0.1;
      const entries = Array.from({ length: 6 }, (_, index) => {
        const position = radialPoint(scope, index, 6, 0.12 + index * 0.02, 0.26);
        const urgency = clamp01(0.22 + dusk + pathScore(scope, position) * 0.22 + hashNumber(scope.seed, index + 82) * 0.22);
        return Object.freeze({
          id: `meadow.pollinator.ledger.${index}`,
          kind: "dusk-pollinator-ledger-entry",
          position,
          urgency: Number(urgency.toFixed(3)),
          noteCount: 1 + Math.round(urgency * 5),
          rendererHint: "clipboard-firefly-ledger-chip"
        });
      });
      return freezeResult({ id: "meadow.pollinatorRescue.duskLedger", entries });
    }
  });
}

export function createMeadowPollinatorRescueRendererHandoffKit() {
  return Object.freeze({
    id: "meadow-pollinator-rescue-renderer-handoff-kit",
    version: MEADOW_POLLINATOR_RESCUE_READINESS_VERSION,
    describe({ descriptors = {} } = {}) {
      const counts = Object.freeze({
        beeNestHealthClusters: descriptors.beeNestHealth?.clusters?.length ?? 0,
        nativeSeedbankPatches: descriptors.nativeSeedbank?.seedbeds?.length ?? 0,
        pollenCorridors: descriptors.pollenCorridors?.corridors?.length ?? 0,
        monarchWaystations: descriptors.monarchWaystations?.stations?.length ?? 0,
        puddleDrinkMicrohabitats: descriptors.puddleDrinks?.puddles?.length ?? 0,
        duskLedgerEntries: descriptors.duskLedger?.entries?.length ?? 0,
        total: descriptorCount(descriptors)
      });
      return freezeResult({
        id: "meadow.pollinatorRescue.rendererHandoff",
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

export function createMeadowPollinatorRescueReadinessDomainKit(runtime = null, defaults = {}) {
  const beeNestHealthKit = createMeadowBeeNestHealthKit(runtime, defaults);
  const nativeSeedbankKit = createMeadowNativeFlowerSeedbankKit(runtime, defaults);
  const pollenCorridorKit = createMeadowPollenCorridorWindKit(runtime, defaults);
  const monarchWaystationKit = createMeadowMilkweedMonarchWaystationKit(runtime, defaults);
  const puddleDrinkKit = createMeadowPuddleDrinkMicrohabitatKit(runtime, defaults);
  const duskLedgerKit = createMeadowDuskPollinatorLedgerKit(runtime, defaults);
  const handoffKit = createMeadowPollinatorRescueRendererHandoffKit(runtime, defaults);
  return Object.freeze({
    id: "meadow-pollinator-rescue-readiness-domain-kit",
    version: MEADOW_POLLINATOR_RESCUE_READINESS_VERSION,
    tree: MEADOW_POLLINATOR_RESCUE_READINESS_TREE,
    describe(input = {}) {
      const descriptors = Object.freeze({
        beeNestHealth: beeNestHealthKit.describe(input),
        nativeSeedbank: nativeSeedbankKit.describe(input),
        pollenCorridors: pollenCorridorKit.describe(input),
        monarchWaystations: monarchWaystationKit.describe(input),
        puddleDrinks: puddleDrinkKit.describe(input),
        duskLedger: duskLedgerKit.describe(input)
      });
      const rendererHandoff = handoffKit.describe({ descriptors });
      return freezeResult({
        id: "meadow.pollinatorRescue.readiness",
        domain: "meadow-pollinator-rescue-readiness-domain",
        version: MEADOW_POLLINATOR_RESCUE_READINESS_VERSION,
        tree: MEADOW_POLLINATOR_RESCUE_READINESS_TREE,
        descriptors,
        descriptorCounts: rendererHandoff.counts,
        rendererHandoff
      });
    }
  });
}
