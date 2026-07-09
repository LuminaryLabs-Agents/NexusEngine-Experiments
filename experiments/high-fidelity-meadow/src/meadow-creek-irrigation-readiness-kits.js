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

function hashUnit(seed = "meadow-creek", index = 0) {
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
    rendererConsumes: "serializable creek irrigation descriptors only",
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
  return typeof input.heightAt === "function" ? Number(input.heightAt(x, z)) || 0 : Math.sin(x * 0.032) * 0.21 + Math.cos(z * 0.037) * 0.16;
}

function samplePath(input = {}, x = 0, z = 0) {
  return typeof input.pathMask === "function" ? clamp01(input.pathMask(x, z)) : clamp01(1 - Math.abs(x * 0.11 + z * 0.04) / 12);
}

function sampleYard(input = {}, x = 0, z = 0) {
  return typeof input.yardMask === "function" ? clamp01(input.yardMask(x, z)) : clamp01(1 - Math.hypot(x - 3.8, z + 2.9) / 20);
}

function flowerCentroids(input = {}) {
  const flowers = stableArray(input.flowers).slice(0, 80);
  if (!flowers.length) {
    return [
      { id: "fallback-clover", x: -18, z: 16, density: 0.42 },
      { id: "fallback-buttercup", x: 14, z: 10, density: 0.36 },
      { id: "fallback-thistle", x: 7, z: -18, density: 0.31 }
    ];
  }
  const buckets = new Map();
  for (const flower of flowers) {
    const x = Number(flower.x ?? flower.transform?.x ?? 0);
    const z = Number(flower.z ?? flower.transform?.z ?? 0);
    const key = `${Math.round(x / 18)}:${Math.round(z / 18)}`;
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
    density: clamp01(bucket.count / 18)
  })).slice(0, 8);
}

export const MEADOW_CREEK_IRRIGATION_READINESS_VERSION = "20260709-creek-irrigation-readiness-1";

export const MEADOW_CREEK_IRRIGATION_READINESS_TREE = Object.freeze({
  root: "meadow-creek-irrigation-readiness-domain",
  subdomains: Object.freeze([
    {
      id: "water-source-domain",
      subdomains: Object.freeze([
        { id: "spring-seep-domain", kits: Object.freeze(["meadow-spring-seep-source-kit"]) },
        { id: "creek-ribbon-domain", kits: Object.freeze(["meadow-creek-ribbon-course-kit"]) }
      ])
    },
    {
      id: "flow-control-domain",
      subdomains: Object.freeze([
        {
          id: "stone-weir-domain",
          subdomains: Object.freeze([
            { id: "weir-step-domain", kits: Object.freeze(["meadow-stone-weir-flow-kit"]) }
          ])
        },
        { id: "irrigation-furrow-domain", kits: Object.freeze(["meadow-irrigation-furrow-grid-kit"]) }
      ])
    },
    {
      id: "habitat-handoff-domain",
      subdomains: Object.freeze([
        { id: "frog-refuge-domain", kits: Object.freeze(["meadow-frog-refuge-pool-kit"]) },
        { id: "dawn-water-ledger-domain", kits: Object.freeze(["meadow-dawn-water-ledger-kit"]) }
      ])
    },
    {
      id: "renderer-handoff",
      kits: Object.freeze(["meadow-creek-irrigation-renderer-handoff-kit"]),
      contract: "renderer consumes descriptors only"
    }
  ]),
  contract: "renderer consumes creek irrigation descriptors only; no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, or frame-loop ownership"
});

export function createMeadowSpringSeepSourceKit() {
  return {
    id: "n-meadow-spring-seep-source-kit",
    domain: "meadow-creek-irrigation-readiness/water-source/spring-seep",
    describe(input = {}) {
      const { width, depth } = meadowSize(input);
      const seed = input.seed ?? "meadow-creek";
      return Array.from({ length: 4 }, (_, index) => {
        const x = -width * 0.34 + index * width * 0.18 + (hashUnit(seed, index) - 0.5) * 10;
        const z = -depth * 0.22 + Math.sin(index * 1.7 + hashUnit(seed, index + 20)) * depth * 0.12;
        const height = sampleHeight(input, x, z);
        const flow = clamp01(0.42 + hashUnit(seed, index + 100) * 0.32 + Number(input.dayAmount ?? 0.4) * 0.18);
        return Object.freeze({
          id: `spring-seep-${index}`,
          kind: "spring-seep-source",
          x: round(x),
          z: round(z),
          y: round(height + 0.04),
          flow: round(flow),
          pathAffinity: round(samplePath(input, x, z)),
          rendererContract: rendererContract("meadow-spring-seep-source-kit")
        });
      });
    }
  };
}

export function createMeadowCreekRibbonCourseKit() {
  return {
    id: "n-meadow-creek-ribbon-course-kit",
    domain: "meadow-creek-irrigation-readiness/water-source/creek-ribbon",
    describe(input = {}) {
      const { width, depth } = meadowSize(input);
      const seed = input.seed ?? "meadow-creek";
      return Array.from({ length: 9 }, (_, index) => {
        const t0 = index / 9;
        const t1 = (index + 1) / 9;
        const bend0 = Math.sin(t0 * Math.PI * 2.2 + hashUnit(seed, 41) * 2) * 11;
        const bend1 = Math.sin(t1 * Math.PI * 2.2 + hashUnit(seed, 41) * 2) * 11;
        const x1 = -width * 0.44 + width * 0.88 * t0;
        const x2 = -width * 0.44 + width * 0.88 * t1;
        const z1 = depth * 0.12 + bend0;
        const z2 = depth * 0.12 + bend1;
        const slope = sampleHeight(input, x1, z1) - sampleHeight(input, x2, z2);
        return Object.freeze({
          id: `creek-ribbon-${index}`,
          kind: "creek-ribbon-course",
          x1: round(x1),
          z1: round(z1),
          y1: round(sampleHeight(input, x1, z1) + 0.025),
          x2: round(x2),
          z2: round(z2),
          y2: round(sampleHeight(input, x2, z2) + 0.025),
          width: round(1.4 + hashUnit(seed, index + 60) * 1.2),
          flow: round(clamp01(0.52 + slope * 0.8 + Number(input.dayAmount ?? 0.4) * 0.12)),
          rendererContract: rendererContract("meadow-creek-ribbon-course-kit")
        });
      });
    }
  };
}

export function createMeadowStoneWeirFlowKit() {
  return {
    id: "n-meadow-stone-weir-flow-kit",
    domain: "meadow-creek-irrigation-readiness/flow-control/stone-weir",
    describe(input = {}) {
      const ribbons = createMeadowCreekRibbonCourseKit().describe(input);
      return ribbons.filter((_, index) => index % 2 === 1).map((ribbon, index) => {
        const pressure = clamp01(0.36 + ribbon.flow * 0.46 + sampleYard(input, ribbon.x1, ribbon.z1) * 0.16);
        return Object.freeze({
          id: `stone-weir-${index}`,
          kind: "stone-weir-flow",
          x: round((ribbon.x1 + ribbon.x2) * 0.5),
          z: round((ribbon.z1 + ribbon.z2) * 0.5),
          y: round((ribbon.y1 + ribbon.y2) * 0.5 + 0.08),
          pressure: round(pressure),
          status: pressure > 0.72 ? "needs-spillway" : pressure > 0.48 ? "holding" : "low-flow",
          rendererContract: rendererContract("meadow-stone-weir-flow-kit")
        });
      });
    }
  };
}

export function createMeadowIrrigationFurrowGridKit() {
  return {
    id: "n-meadow-irrigation-furrow-grid-kit",
    domain: "meadow-creek-irrigation-readiness/flow-control/irrigation-furrow",
    describe(input = {}) {
      const patches = flowerCentroids(input);
      return patches.map((patch, index) => {
        const creekZ = Number(input.depth ?? 196) * 0.12 + Math.sin((patch.x / 22) + index) * 7;
        const moisture = clamp01(0.28 + patch.density * 0.42 + samplePath(input, patch.x, patch.z) * 0.18 + sampleYard(input, patch.x, patch.z) * 0.12);
        return Object.freeze({
          id: `irrigation-furrow-${patch.id}`,
          kind: "irrigation-furrow-grid",
          x1: round(patch.x),
          z1: round(creekZ),
          y1: round(sampleHeight(input, patch.x, creekZ) + 0.03),
          x2: round(patch.x),
          z2: round(patch.z),
          y2: round(sampleHeight(input, patch.x, patch.z) + 0.03),
          moisture: round(moisture),
          priority: moisture < 0.48 ? "urgent" : moisture < 0.68 ? "steady" : "saturated",
          rendererContract: rendererContract("meadow-irrigation-furrow-grid-kit")
        });
      });
    }
  };
}

export function createMeadowFrogRefugePoolKit() {
  return {
    id: "n-meadow-frog-refuge-pool-kit",
    domain: "meadow-creek-irrigation-readiness/habitat/frog-refuge",
    describe(input = {}) {
      const seed = input.seed ?? "meadow-creek";
      const ribbons = createMeadowCreekRibbonCourseKit().describe(input);
      return ribbons.filter((_, index) => index % 3 === 0).map((ribbon, index) => {
        const x = (ribbon.x1 + ribbon.x2) * 0.5 + (hashUnit(seed, index + 170) - 0.5) * 6;
        const z = (ribbon.z1 + ribbon.z2) * 0.5 + (hashUnit(seed, index + 180) - 0.5) * 5;
        const safety = clamp01(0.5 + samplePath(input, x, z) * 0.16 + Number(input.dayAmount ?? 0.4) * 0.12 - sampleYard(input, x, z) * 0.06);
        return Object.freeze({
          id: `frog-refuge-${index}`,
          kind: "frog-refuge-pool",
          x: round(x),
          z: round(z),
          y: round(sampleHeight(input, x, z) + 0.02),
          radius: round(1.8 + hashUnit(seed, index + 190) * 1.8),
          safety: round(safety),
          call: safety > 0.64 ? "chorus" : "quiet",
          rendererContract: rendererContract("meadow-frog-refuge-pool-kit")
        });
      });
    }
  };
}

export function createMeadowDawnWaterLedgerKit() {
  return {
    id: "n-meadow-dawn-water-ledger-kit",
    domain: "meadow-creek-irrigation-readiness/handoff/dawn-water-ledger",
    describe(input = {}) {
      const furrows = createMeadowIrrigationFurrowGridKit().describe(input);
      const sheep = stableArray(input.sheep);
      const urgentFurrows = furrows.filter((furrow) => furrow.priority === "urgent").length;
      const sheepPressure = clamp01(sheep.length / 16);
      const waterIndex = clamp01(0.78 - urgentFurrows * 0.055 - sheepPressure * 0.12 + Number(input.dayAmount ?? 0.4) * 0.08);
      return Object.freeze([
        Object.freeze({
          id: "dawn-water-ledger",
          kind: "dawn-water-ledger",
          furrows: furrows.length,
          urgentFurrows,
          sheepGroups: sheep.length,
          waterIndex: round(waterIndex),
          status: waterIndex > 0.7 ? "ready" : waterIndex > 0.48 ? "watch" : "repair-needed",
          rendererContract: rendererContract("meadow-dawn-water-ledger-kit")
        })
      ]);
    }
  };
}

export function createMeadowCreekIrrigationRendererHandoffKit(kits = {}) {
  const sourceKits = {
    springSeepSourceKit: kits.springSeepSourceKit ?? createMeadowSpringSeepSourceKit(),
    creekRibbonCourseKit: kits.creekRibbonCourseKit ?? createMeadowCreekRibbonCourseKit(),
    stoneWeirFlowKit: kits.stoneWeirFlowKit ?? createMeadowStoneWeirFlowKit(),
    irrigationFurrowGridKit: kits.irrigationFurrowGridKit ?? createMeadowIrrigationFurrowGridKit(),
    frogRefugePoolKit: kits.frogRefugePoolKit ?? createMeadowFrogRefugePoolKit(),
    dawnWaterLedgerKit: kits.dawnWaterLedgerKit ?? createMeadowDawnWaterLedgerKit()
  };
  return {
    id: "n-meadow-creek-irrigation-renderer-handoff-kit",
    domain: "meadow-creek-irrigation-readiness/renderer-handoff",
    describe(input = {}) {
      const descriptors = Object.freeze({
        springSeeps: Object.freeze(sourceKits.springSeepSourceKit.describe(input)),
        creekRibbons: Object.freeze(sourceKits.creekRibbonCourseKit.describe(input)),
        stoneWeirs: Object.freeze(sourceKits.stoneWeirFlowKit.describe(input)),
        irrigationFurrows: Object.freeze(sourceKits.irrigationFurrowGridKit.describe(input)),
        frogRefugePools: Object.freeze(sourceKits.frogRefugePoolKit.describe(input)),
        dawnWaterLedger: Object.freeze(sourceKits.dawnWaterLedgerKit.describe(input))
      });
      const counts = Object.freeze(Object.fromEntries([
        ["springSeeps", descriptors.springSeeps.length],
        ["creekRibbons", descriptors.creekRibbons.length],
        ["stoneWeirs", descriptors.stoneWeirs.length],
        ["irrigationFurrows", descriptors.irrigationFurrows.length],
        ["frogRefugePools", descriptors.frogRefugePools.length],
        ["dawnWaterLedger", descriptors.dawnWaterLedger.length],
        ["total", Object.values(descriptors).reduce((sum, bucket) => sum + stableArray(bucket).length, 0)]
      ]));
      return Object.freeze({
        id: "meadow.creekIrrigation.rendererHandoff",
        kind: "renderer-handoff",
        contract: "renderer-consumes-serializable-descriptors-only",
        descriptorKeys: Object.freeze(Object.keys(descriptors)),
        descriptors,
        counts,
        forbiddenOwnership: forbiddenOwnership(),
        compatibleDescriptorBuckets: Object.freeze(["springSeeps", "creekRibbons", "stoneWeirs", "irrigationFurrows", "frogRefugePools", "dawnWaterLedger"])
      });
    }
  };
}

export function createMeadowCreekIrrigationReadinessDomainKit() {
  const kits = Object.freeze({
    springSeepSourceKit: createMeadowSpringSeepSourceKit(),
    creekRibbonCourseKit: createMeadowCreekRibbonCourseKit(),
    stoneWeirFlowKit: createMeadowStoneWeirFlowKit(),
    irrigationFurrowGridKit: createMeadowIrrigationFurrowGridKit(),
    frogRefugePoolKit: createMeadowFrogRefugePoolKit(),
    dawnWaterLedgerKit: createMeadowDawnWaterLedgerKit()
  });
  const rendererHandoffKit = createMeadowCreekIrrigationRendererHandoffKit(kits);
  return {
    id: "n-meadow-creek-irrigation-readiness-domain-kit",
    domain: MEADOW_CREEK_IRRIGATION_READINESS_TREE.root,
    version: MEADOW_CREEK_IRRIGATION_READINESS_VERSION,
    tree: MEADOW_CREEK_IRRIGATION_READINESS_TREE,
    kits,
    rendererHandoffKit,
    describe(input = {}) {
      const rendererHandoff = rendererHandoffKit.describe(input);
      const ledger = rendererHandoff.descriptors.dawnWaterLedger[0] ?? { waterIndex: 0, status: "unknown" };
      return Object.freeze({
        id: "meadow.creekIrrigationReadiness",
        kind: "domain-readiness-state",
        version: MEADOW_CREEK_IRRIGATION_READINESS_VERSION,
        tree: MEADOW_CREEK_IRRIGATION_READINESS_TREE,
        descriptors: rendererHandoff.descriptors,
        descriptorCounts: rendererHandoff.counts,
        waterIndex: ledger.waterIndex,
        status: ledger.status,
        rendererHandoff,
        summary: `Creek irrigation ${ledger.status} with ${rendererHandoff.counts.total} descriptor marks`,
        forbiddenOwnership: forbiddenOwnership()
      });
    },
    snapshot(input = {}) {
      const state = this.describe(input);
      return Object.freeze({ version: state.version, status: state.status, waterIndex: state.waterIndex, counts: state.descriptorCounts });
    }
  };
}
