function stableArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function round(value, digits = 3) {
  return Number((Number(value) || 0).toFixed(digits));
}

function hashUnit(seed = "meadow-soil", index = 0) {
  const text = `${seed}:${index}`;
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 10000) / 10000;
}

function forbiddenOwnership() {
  return Object.freeze(["renderer", "dom", "browser-input", "three-js", "webgl", "audio", "asset-loading", "frame-loop", "physics"]);
}

function rendererContract(owner) {
  return Object.freeze({
    owner,
    rendererConsumes: "serializable soil restoration descriptors only",
    rendererMustOwn: Object.freeze(["draw order", "palette", "camera projection", "screen-space layout", "material binding"]),
    rendererMustNotOwn: forbiddenOwnership()
  });
}

function meadowSize(input = {}) {
  return {
    width: Math.max(64, Number(input.width ?? 196)),
    depth: Math.max(64, Number(input.depth ?? 196))
  };
}

function sampleHeight(input = {}, x = 0, z = 0) {
  return typeof input.heightAt === "function" ? Number(input.heightAt(x, z)) || 0 : Math.sin(x * 0.027) * 0.18 + Math.cos(z * 0.034) * 0.14;
}

function samplePath(input = {}, x = 0, z = 0) {
  return typeof input.pathMask === "function" ? clamp01(input.pathMask(x, z)) : clamp01(1 - Math.abs(x * 0.1 + z * 0.044) / 12);
}

function sampleYard(input = {}, x = 0, z = 0) {
  return typeof input.yardMask === "function" ? clamp01(input.yardMask(x, z)) : clamp01(1 - Math.hypot(x - 3.8, z + 2.9) / 20);
}

function priorTotal(input = {}, key = "") {
  const handoffTotal = input[key]?.rendererHandoff?.counts?.total;
  const countsTotal = input[key]?.descriptorCounts?.total;
  return Number.isFinite(handoffTotal) ? handoffTotal : Number.isFinite(countsTotal) ? countsTotal : 0;
}

function flowerCentroids(input = {}) {
  const flowers = stableArray(input.flowers?.flowers ?? input.flowers).slice(0, 120);
  if (!flowers.length) {
    return [
      { id: "fallback-yarrow", x: -22, z: 18, density: 0.48 },
      { id: "fallback-clover", x: 16, z: 14, density: 0.42 },
      { id: "fallback-orchard-grass", x: 7, z: -20, density: 0.35 },
      { id: "fallback-sorrel", x: -12, z: -24, density: 0.31 }
    ];
  }
  const buckets = new Map();
  for (const flower of flowers) {
    const x = Number(flower.x ?? flower.transform?.x ?? flower.position?.x ?? 0);
    const z = Number(flower.z ?? flower.transform?.z ?? flower.position?.z ?? 0);
    const key = `${Math.round(x / 20)}:${Math.round(z / 20)}`;
    const bucket = buckets.get(key) ?? { id: `patch-${key}`, x: 0, z: 0, count: 0 };
    bucket.x += x;
    bucket.z += z;
    bucket.count += 1;
    buckets.set(key, bucket);
  }
  return [...buckets.values()].map((bucket) => ({
    id: bucket.id,
    x: bucket.x / Math.max(1, bucket.count),
    z: bucket.z / Math.max(1, bucket.count),
    density: clamp01(bucket.count / 20)
  })).slice(0, 7);
}

function sheepPressure(input = {}) {
  const sheep = stableArray(input.sheep?.sheep ?? input.sheep);
  return clamp01(sheep.length / 18);
}

export const MEADOW_SOIL_MYCELIUM_RESTORATION_VERSION = "20260709-soil-mycelium-restoration-1";

export const MEADOW_SOIL_MYCELIUM_RESTORATION_DOMAIN_TREE = Object.freeze({
  root: "meadow-soil-mycelium-restoration-readiness-domain",
  subdomains: Object.freeze([
    {
      id: "soil-health-domain",
      subdomains: Object.freeze([
        { id: "soil-spore-monitor-domain", kits: Object.freeze(["meadow-soil-spore-monitor-kit"]) },
        { id: "mycelium-thread-domain", kits: Object.freeze(["meadow-mycelium-thread-weave-kit"]) }
      ])
    },
    {
      id: "decomposition-nursery-domain",
      subdomains: Object.freeze([
        {
          id: "mushroom-ring-domain",
          subdomains: Object.freeze([
            { id: "fruiting-body-domain", kits: Object.freeze(["meadow-mushroom-ring-nursery-kit"]) }
          ])
        },
        { id: "beetle-lane-domain", kits: Object.freeze(["meadow-beetle-lane-detritus-kit"]) }
      ])
    },
    {
      id: "edge-protection-handoff-domain",
      subdomains: Object.freeze([
        { id: "hedgerow-windbreak-domain", kits: Object.freeze(["meadow-hedgerow-windbreak-kit"]) },
        { id: "dawn-soil-ledger-domain", kits: Object.freeze(["meadow-dawn-soil-ledger-kit"]) }
      ])
    },
    {
      id: "renderer-handoff",
      kits: Object.freeze(["meadow-soil-mycelium-renderer-handoff-kit"]),
      contract: "renderer consumes descriptors only"
    }
  ]),
  contract: "renderer consumes soil restoration descriptors only; no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, or frame-loop ownership"
});

export function createMeadowSoilSporeMonitorKit() {
  return {
    id: "n-meadow-soil-spore-monitor-kit",
    domain: "meadow-soil-mycelium-restoration/soil-health/soil-spore-monitor",
    describe(input = {}) {
      const { width, depth } = meadowSize(input);
      const seed = input.seed ?? "meadow-soil";
      return Array.from({ length: 5 }, (_, index) => {
        const t = index / 4;
        const x = -width * 0.38 + width * 0.76 * t + (hashUnit(seed, index + 4) - 0.5) * 10;
        const z = Math.sin(t * Math.PI * 2 + hashUnit(seed, index + 20)) * depth * 0.24;
        const compaction = clamp01(0.46 + samplePath(input, x, z) * 0.18 + sheepPressure(input) * 0.22 - sampleYard(input, x, z) * 0.1);
        const moisture = clamp01(0.35 + Number(input.dayAmount ?? 0.45) * 0.1 + priorTotal(input, "creekIrrigationReadiness") / 90 - compaction * 0.16);
        return Object.freeze({
          id: `soil-spore-monitor-${index}`,
          kind: "soil-spore-monitor",
          x: round(x),
          z: round(z),
          y: round(sampleHeight(input, x, z) + 0.018),
          compaction: round(compaction),
          moisture: round(moisture),
          status: moisture > 0.62 && compaction < 0.62 ? "breathing" : moisture > 0.42 ? "watch" : "dry",
          rendererContract: rendererContract("meadow-soil-spore-monitor-kit")
        });
      });
    }
  };
}

export function createMeadowMyceliumThreadWeaveKit() {
  return {
    id: "n-meadow-mycelium-thread-weave-kit",
    domain: "meadow-soil-mycelium-restoration/soil-health/mycelium-thread",
    describe(input = {}) {
      const patches = flowerCentroids(input);
      const seed = input.seed ?? "meadow-soil";
      return Array.from({ length: 8 }, (_, index) => {
        const a = patches[index % patches.length];
        const b = patches[(index + 2) % patches.length];
        const slack = hashUnit(seed, index + 80) * 8;
        const vitality = clamp01(0.34 + a.density * 0.22 + b.density * 0.18 + priorTotal(input, "pollinatorRescueReadiness") / 120 + priorTotal(input, "creekIrrigationReadiness") / 140);
        return Object.freeze({
          id: `mycelium-thread-${index}`,
          kind: "mycelium-thread-weave",
          x1: round(a.x),
          z1: round(a.z),
          y1: round(sampleHeight(input, a.x, a.z) + 0.012),
          x2: round(b.x + slack - 4),
          z2: round(b.z - slack * 0.45),
          y2: round(sampleHeight(input, b.x, b.z) + 0.012),
          vitality: round(vitality),
          width: round(0.6 + vitality * 1.4),
          rendererContract: rendererContract("meadow-mycelium-thread-weave-kit")
        });
      });
    }
  };
}

export function createMeadowMushroomRingNurseryKit() {
  return {
    id: "n-meadow-mushroom-ring-nursery-kit",
    domain: "meadow-soil-mycelium-restoration/decomposition-nursery/mushroom-ring",
    describe(input = {}) {
      const seed = input.seed ?? "meadow-soil";
      const threads = createMeadowMyceliumThreadWeaveKit().describe(input);
      return threads.filter((_, index) => index % 2 === 0).map((thread, index) => {
        const x = (thread.x1 + thread.x2) * 0.5 + (hashUnit(seed, index + 140) - 0.5) * 7;
        const z = (thread.z1 + thread.z2) * 0.5 + (hashUnit(seed, index + 150) - 0.5) * 6;
        const fruiting = clamp01(0.28 + thread.vitality * 0.56 + priorTotal(input, "creekIrrigationReadiness") / 180);
        return Object.freeze({
          id: `mushroom-ring-${index}`,
          kind: "mushroom-ring-nursery",
          x: round(x),
          z: round(z),
          y: round(sampleHeight(input, x, z) + 0.026),
          radius: round(1.8 + fruiting * 2.7),
          fruiting: round(fruiting),
          ringState: fruiting > 0.68 ? "fruiting" : fruiting > 0.46 ? "primed" : "dormant",
          rendererContract: rendererContract("meadow-mushroom-ring-nursery-kit")
        });
      });
    }
  };
}

export function createMeadowBeetleLaneDetritusKit() {
  return {
    id: "n-meadow-beetle-lane-detritus-kit",
    domain: "meadow-soil-mycelium-restoration/decomposition-nursery/beetle-lane",
    describe(input = {}) {
      const { width, depth } = meadowSize(input);
      const seed = input.seed ?? "meadow-soil";
      return Array.from({ length: 5 }, (_, index) => {
        const x1 = -width * 0.42 + index * width * 0.18;
        const z1 = depth * 0.36 - index * depth * 0.15 + (hashUnit(seed, index + 210) - 0.5) * 9;
        const x2 = x1 + 16 + (hashUnit(seed, index + 220) - 0.5) * 11;
        const z2 = z1 - 18 + (hashUnit(seed, index + 230) - 0.5) * 10;
        const detritus = clamp01(0.38 + sheepPressure(input) * 0.2 + priorTotal(input, "harvestFestivalReadiness") / 120 - sampleYard(input, x1, z1) * 0.12);
        return Object.freeze({
          id: `beetle-lane-${index}`,
          kind: "beetle-lane-detritus",
          x1: round(x1),
          z1: round(z1),
          y1: round(sampleHeight(input, x1, z1) + 0.02),
          x2: round(x2),
          z2: round(z2),
          y2: round(sampleHeight(input, x2, z2) + 0.02),
          detritus: round(detritus),
          laneState: detritus > 0.64 ? "active" : "thin",
          rendererContract: rendererContract("meadow-beetle-lane-detritus-kit")
        });
      });
    }
  };
}

export function createMeadowHedgerowWindbreakKit() {
  return {
    id: "n-meadow-hedgerow-windbreak-kit",
    domain: "meadow-soil-mycelium-restoration/edge-protection/hedgerow-windbreak",
    describe(input = {}) {
      const { width, depth } = meadowSize(input);
      const seed = input.seed ?? "meadow-soil";
      return Array.from({ length: 4 }, (_, index) => {
        const side = index % 2 === 0 ? -1 : 1;
        const x = side * width * 0.43;
        const z = -depth * 0.34 + index * depth * 0.22 + (hashUnit(seed, index + 310) - 0.5) * 8;
        const shelter = clamp01(0.42 + priorTotal(input, "nightWatchReadiness") / 140 + priorTotal(input, "flockSafetyReadiness") / 120 - Math.abs(Number(input.windSeed ?? 0) % 1) * 0.18);
        return Object.freeze({
          id: `hedgerow-windbreak-${index}`,
          kind: "hedgerow-windbreak",
          x: round(x),
          z: round(z),
          y: round(sampleHeight(input, x, z) + 0.12),
          height: round(1.8 + shelter * 2.5),
          shelter: round(shelter),
          side: side < 0 ? "west" : "east",
          rendererContract: rendererContract("meadow-hedgerow-windbreak-kit")
        });
      });
    }
  };
}

export function createMeadowDawnSoilLedgerKit() {
  return {
    id: "n-meadow-dawn-soil-ledger-kit",
    domain: "meadow-soil-mycelium-restoration/edge-protection/dawn-soil-ledger",
    describe(input = {}) {
      const monitors = createMeadowSoilSporeMonitorKit().describe(input);
      const threads = createMeadowMyceliumThreadWeaveKit().describe(input);
      const rings = createMeadowMushroomRingNurseryKit().describe(input);
      const drySpots = monitors.filter((monitor) => monitor.status === "dry").length;
      const breathingSpots = monitors.filter((monitor) => monitor.status === "breathing").length;
      const averageThreadVitality = threads.reduce((sum, thread) => sum + thread.vitality, 0) / Math.max(1, threads.length);
      const fruitingRings = rings.filter((ring) => ring.ringState === "fruiting").length;
      const soilHealth = clamp01(0.34 + breathingSpots * 0.06 + averageThreadVitality * 0.32 + fruitingRings * 0.05 - drySpots * 0.07);
      return Object.freeze([
        Object.freeze({
          id: "dawn-soil-ledger",
          kind: "dawn-soil-ledger",
          drySpots,
          breathingSpots,
          myceliumThreads: threads.length,
          mushroomRings: rings.length,
          soilHealth: round(soilHealth),
          status: soilHealth > 0.72 ? "restored" : soilHealth > 0.52 ? "stabilizing" : "repair-needed",
          rendererContract: rendererContract("meadow-dawn-soil-ledger-kit")
        })
      ]);
    }
  };
}

export function createMeadowSoilMyceliumRendererHandoffKit(kits = {}) {
  const sourceKits = {
    soilSporeMonitorKit: kits.soilSporeMonitorKit ?? createMeadowSoilSporeMonitorKit(),
    myceliumThreadWeaveKit: kits.myceliumThreadWeaveKit ?? createMeadowMyceliumThreadWeaveKit(),
    mushroomRingNurseryKit: kits.mushroomRingNurseryKit ?? createMeadowMushroomRingNurseryKit(),
    beetleLaneDetritusKit: kits.beetleLaneDetritusKit ?? createMeadowBeetleLaneDetritusKit(),
    hedgerowWindbreakKit: kits.hedgerowWindbreakKit ?? createMeadowHedgerowWindbreakKit(),
    dawnSoilLedgerKit: kits.dawnSoilLedgerKit ?? createMeadowDawnSoilLedgerKit()
  };
  return {
    id: "n-meadow-soil-mycelium-renderer-handoff-kit",
    domain: "meadow-soil-mycelium-restoration/renderer-handoff",
    describe(input = {}) {
      const descriptors = Object.freeze({
        soilSporeMonitors: Object.freeze(sourceKits.soilSporeMonitorKit.describe(input)),
        myceliumThreads: Object.freeze(sourceKits.myceliumThreadWeaveKit.describe(input)),
        mushroomRings: Object.freeze(sourceKits.mushroomRingNurseryKit.describe(input)),
        beetleLanes: Object.freeze(sourceKits.beetleLaneDetritusKit.describe(input)),
        hedgerowWindbreaks: Object.freeze(sourceKits.hedgerowWindbreakKit.describe(input)),
        dawnSoilLedger: Object.freeze(sourceKits.dawnSoilLedgerKit.describe(input))
      });
      const counts = Object.freeze(Object.fromEntries([
        ["soilSporeMonitors", descriptors.soilSporeMonitors.length],
        ["myceliumThreads", descriptors.myceliumThreads.length],
        ["mushroomRings", descriptors.mushroomRings.length],
        ["beetleLanes", descriptors.beetleLanes.length],
        ["hedgerowWindbreaks", descriptors.hedgerowWindbreaks.length],
        ["dawnSoilLedger", descriptors.dawnSoilLedger.length],
        ["total", Object.values(descriptors).reduce((sum, bucket) => sum + stableArray(bucket).length, 0)]
      ]));
      return Object.freeze({
        id: "meadow.soilMycelium.rendererHandoff",
        kind: "renderer-handoff",
        contract: "renderer-consumes-descriptors-only",
        descriptorKeys: Object.freeze(Object.keys(descriptors)),
        descriptors,
        counts,
        forbiddenOwnership: forbiddenOwnership(),
        compatibleDescriptorBuckets: Object.freeze(["soilSporeMonitors", "myceliumThreads", "mushroomRings", "beetleLanes", "hedgerowWindbreaks", "dawnSoilLedger"])
      });
    }
  };
}

export function createMeadowSoilMyceliumRestorationDomainKit() {
  const kits = Object.freeze({
    soilSporeMonitorKit: createMeadowSoilSporeMonitorKit(),
    myceliumThreadWeaveKit: createMeadowMyceliumThreadWeaveKit(),
    mushroomRingNurseryKit: createMeadowMushroomRingNurseryKit(),
    beetleLaneDetritusKit: createMeadowBeetleLaneDetritusKit(),
    hedgerowWindbreakKit: createMeadowHedgerowWindbreakKit(),
    dawnSoilLedgerKit: createMeadowDawnSoilLedgerKit()
  });
  const rendererHandoffKit = createMeadowSoilMyceliumRendererHandoffKit(kits);
  return {
    id: "n-meadow-soil-mycelium-restoration-domain-kit",
    domain: MEADOW_SOIL_MYCELIUM_RESTORATION_DOMAIN_TREE.root,
    version: MEADOW_SOIL_MYCELIUM_RESTORATION_VERSION,
    tree: MEADOW_SOIL_MYCELIUM_RESTORATION_DOMAIN_TREE,
    kits,
    rendererHandoffKit,
    describe(input = {}) {
      const rendererHandoff = rendererHandoffKit.describe(input);
      const ledger = rendererHandoff.descriptors.dawnSoilLedger[0] ?? { soilHealth: 0, status: "unknown" };
      const soilHealth = clamp01(ledger.soilHealth);
      return Object.freeze({
        id: "meadow.soilMyceliumRestorationReadiness",
        kind: "meadow-soil-mycelium-restoration-readiness",
        version: MEADOW_SOIL_MYCELIUM_RESTORATION_VERSION,
        tree: MEADOW_SOIL_MYCELIUM_RESTORATION_DOMAIN_TREE,
        domainTree: JSON.stringify(MEADOW_SOIL_MYCELIUM_RESTORATION_DOMAIN_TREE),
        descriptors: rendererHandoff.descriptors,
        descriptorCounts: rendererHandoff.counts,
        soilHealth: round(soilHealth),
        missionState: soilHealth > 0.72 ? "restored" : soilHealth > 0.52 ? "stabilizing" : "repair-needed",
        rendererHandoff,
        summary: `Soil mycelium ${ledger.status} with ${rendererHandoff.counts.total} descriptor marks`,
        forbiddenOwnership: forbiddenOwnership()
      });
    },
    snapshot(input = {}) {
      const state = this.describe(input);
      return Object.freeze({ version: state.version, missionState: state.missionState, soilHealth: state.soilHealth, counts: state.descriptorCounts });
    }
  };
}
