export const MEADOW_ECOLOGY_READABILITY_VERSION = "2026-07-08-ecology-readability-1";

export const MEADOW_ECOLOGY_READABILITY_TREE = Object.freeze(`meadow-ecology-readability-domain
├─ living-route-domain
│  ├─ pollinator-route-domain
│  │  └─ meadow-pollinator-route-kit
│  └─ shepherd-path-domain
│     └─ meadow-shepherd-path-kit
├─ habitat-comfort-domain
│  ├─ rest-spot-domain
│  │  └─ meadow-rest-spot-kit
│  └─ wind-lane-domain
│     └─ meadow-wind-lane-kit
├─ seasonal-attention-domain
│  ├─ bloom-queue-domain
│  │  └─ meadow-seasonal-bloom-queue-kit
│  └─ attention-beacon-domain
│     └─ meadow-attention-beacon-kit
└─ renderer-handoff
   └─ meadow-ecology-renderer-handoff-kit
      └─ renderer consumes descriptors only`);

const FORBIDDEN_OWNERSHIP = Object.freeze([
  "renderer",
  "dom",
  "browser-input",
  "three",
  "webgl",
  "audio",
  "asset-loading",
  "frame-loop"
]);

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
}

function round(value, digits = 4) {
  const scale = 10 ** digits;
  return Math.round(Number(value || 0) * scale) / scale;
}

function hashString(text) {
  let hash = 2166136261;
  const input = String(text ?? "meadow-ecology");
  for (let index = 0; index < input.length; index += 1) {
    hash = Math.imul(hash ^ input.charCodeAt(index), 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed = "meadow-ecology") {
  let state = hashString(seed) || 1;
  const random = () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  random.range = (min, max) => min + (max - min) * random();
  random.pick = (items) => items[Math.floor(random() * items.length) % items.length];
  return random;
}

function safeHeightAt(heightAt, x, z) {
  if (typeof heightAt !== "function") return 0;
  return round(heightAt(x, z), 4);
}

function safeMask(mask, x, z) {
  if (typeof mask !== "function") return 0;
  return clamp(mask(x, z));
}

function samplePoint(rng, width, depth, radiusScale = 0.45) {
  const angle = rng.range(0, Math.PI * 2);
  const radius = Math.sqrt(rng()) * Math.min(width, depth) * radiusScale;
  return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
}

function stableId(prefix, seed, index) {
  return `${prefix}.${index}.${hashString(`${seed}:${prefix}:${index}`).toString(36).slice(0, 5)}`;
}

function normalizeInput(input = {}, options = {}) {
  return Object.freeze({
    seed: String(input.seed ?? options.seed ?? "high-fidelity-meadow-ecology"),
    width: clamp(input.width ?? input.terrain?.width ?? options.width ?? 196, 32, 512),
    depth: clamp(input.depth ?? input.terrain?.depth ?? options.depth ?? 196, 32, 512),
    time: Number(input.time ?? input.cycle?.time?.seconds ?? 0) || 0,
    phase: String(input.phase ?? input.cycle?.time?.phase ?? "golden hour"),
    dayAmount: clamp(input.dayAmount ?? input.cycle?.light?.dayAmount ?? 0.62),
    warmRim: clamp(input.warmRim ?? input.cycle?.light?.warmRim ?? 0.35),
    heightAt: input.heightAt ?? options.heightAt,
    pathMask: input.pathMask ?? options.pathMask,
    yardMask: input.yardMask ?? options.yardMask,
    sheep: input.sheep?.sheep ?? input.sheep?.flock ?? input.sheep ?? [],
    flowers: input.flowers?.flowers ?? input.flowers ?? [],
    visualFractal: input.visualFractal ?? null
  });
}

function descriptorCount(value) {
  if (Array.isArray(value)) return value.length;
  if (Array.isArray(value?.routes)) return value.routes.length;
  if (Array.isArray(value?.paths)) return value.paths.length;
  if (Array.isArray(value?.spots)) return value.spots.length;
  if (Array.isArray(value?.lanes)) return value.lanes.length;
  if (Array.isArray(value?.blooms)) return value.blooms.length;
  if (Array.isArray(value?.beacons)) return value.beacons.length;
  return 1;
}

export function createMeadowPollinatorRouteKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-pollinator-route-kit",
    version: MEADOW_ECOLOGY_READABILITY_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const flowers = Array.isArray(ctx.flowers) ? ctx.flowers : [];
      const count = Math.round(clamp(input.routeCount ?? options.routeCount ?? 18, 6, 36));
      const rng = createSeededRandom(`${ctx.seed}:pollinator:${flowers.length}:${ctx.phase}`);
      const routes = Array.from({ length: count }, (_, index) => {
        const a = flowers.length ? flowers[(index * 7) % flowers.length] : samplePoint(rng, ctx.width, ctx.depth, 0.38);
        const b = flowers.length ? flowers[(index * 13 + 5) % flowers.length] : samplePoint(rng, ctx.width, ctx.depth, 0.4);
        const fromX = Number(a.x ?? 0);
        const fromZ = Number(a.z ?? 0);
        const toX = Number(b.x ?? fromX + rng.range(-8, 8));
        const toZ = Number(b.z ?? fromZ + rng.range(-8, 8));
        return Object.freeze({
          id: stableId("pollinatorRoute", ctx.seed, index),
          from: { x: round(fromX), y: safeHeightAt(ctx.heightAt, fromX, fromZ) + round(rng.range(0.35, 1.4), 3), z: round(fromZ) },
          to: { x: round(toX), y: safeHeightAt(ctx.heightAt, toX, toZ) + round(rng.range(0.35, 1.4), 3), z: round(toZ) },
          arc: round(rng.range(0.16, 0.84), 3),
          density: round(0.25 + ctx.dayAmount * 0.55 + rng.range(0, 0.16), 3),
          species: rng.pick(["bee", "moth", "lacewing", "butterfly"]),
          phase: round((ctx.time * 0.05 + index * 0.11) % 1, 3),
          rendererHint: "consume-as-pollinator-thread"
        });
      });
      return Object.freeze({ id: "meadow.pollinatorRoutes", kind: "pollinator-routes", routes });
    }
  });
}

export function createMeadowShepherdPathKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-shepherd-path-kit",
    version: MEADOW_ECOLOGY_READABILITY_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const sheep = Array.isArray(ctx.sheep) ? ctx.sheep : [];
      const paths = sheep.slice(0, 10).map((animal, index) => {
        const transform = animal.transform ?? animal;
        const x = Number(transform.x ?? 0);
        const z = Number(transform.z ?? 0);
        const yardBias = safeMask(ctx.yardMask, x, z);
        const midX = round(x * 0.45 + Math.sin(index * 1.7) * 4);
        const midZ = round(z * 0.45 + Math.cos(index * 1.3) * 4);
        return Object.freeze({
          id: `${animal.id ?? "sheep"}.shepherdPath.${index}`,
          points: Object.freeze([
            { x: 0, y: safeHeightAt(ctx.heightAt, 0, 0) + 0.035, z: 0 },
            { x: midX, y: safeHeightAt(ctx.heightAt, midX, midZ) + 0.035, z: midZ },
            { x: round(x), y: safeHeightAt(ctx.heightAt, x, z) + 0.035, z: round(z) }
          ]),
          urgency: round(0.18 + (1 - yardBias) * 0.36 + index * 0.015, 3),
          width: round(0.3 + (index % 4) * 0.06, 3),
          phase: round((ctx.time * 0.03 + index * 0.09) % 1, 3)
        });
      });
      return Object.freeze({ id: "meadow.shepherdPaths", kind: "shepherd-paths", paths });
    }
  });
}

export function createMeadowRestSpotKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-rest-spot-kit",
    version: MEADOW_ECOLOGY_READABILITY_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const rng = createSeededRandom(`${ctx.seed}:rest:${ctx.phase}`);
      const count = Math.round(clamp(input.restSpotCount ?? options.restSpotCount ?? 9, 4, 18));
      const spots = [];
      let attempts = 0;
      while (spots.length < count && attempts < count * 10) {
        attempts += 1;
        const point = samplePoint(rng, ctx.width, ctx.depth, 0.42);
        const yard = safeMask(ctx.yardMask, point.x, point.z);
        const path = safeMask(ctx.pathMask, point.x, point.z);
        if (path > 0.8) continue;
        spots.push(Object.freeze({
          id: stableId("restSpot", ctx.seed, spots.length),
          x: round(point.x),
          y: safeHeightAt(ctx.heightAt, point.x, point.z) + 0.04,
          z: round(point.z),
          radius: round(rng.range(1.4, 4.8) * (1 + yard * 0.2), 3),
          shade: round(rng.range(0.22, 0.88) * (1 - ctx.dayAmount * 0.18), 3),
          calm: round(0.42 + yard * 0.28 + rng.range(0, 0.22), 3),
          label: rng.pick(["clover shade", "wool rest", "soft bank", "bee hush"]),
          phase: round(rng.range(0, Math.PI * 2), 4)
        }));
      }
      return Object.freeze({ id: "meadow.restSpots", kind: "rest-spots", spots, attempts });
    }
  });
}

export function createMeadowWindLaneKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-wind-lane-kit",
    version: MEADOW_ECOLOGY_READABILITY_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const rng = createSeededRandom(`${ctx.seed}:wind:${Math.round(ctx.time / 30)}`);
      const count = Math.round(clamp(input.windLaneCount ?? options.windLaneCount ?? 11, 4, 22));
      const lanes = Array.from({ length: count }, (_, index) => {
        const start = samplePoint(rng, ctx.width, ctx.depth, 0.46);
        const drift = rng.range(10, 28);
        const yaw = rng.range(-0.45, 0.45) + Math.PI * 0.08;
        const end = { x: start.x + Math.cos(yaw) * drift, z: start.z + Math.sin(yaw) * drift };
        return Object.freeze({
          id: stableId("windLane", ctx.seed, index),
          from: { x: round(start.x), y: safeHeightAt(ctx.heightAt, start.x, start.z) + 0.24, z: round(start.z) },
          to: { x: round(end.x), y: safeHeightAt(ctx.heightAt, end.x, end.z) + 0.24, z: round(end.z) },
          width: round(rng.range(0.5, 1.9), 3),
          speed: round(0.28 + ctx.warmRim * 0.25 + rng.range(0, 0.32), 3),
          seedOffset: round(rng.range(0, 1), 4),
          phase: round((ctx.time * 0.07 + index * 0.15) % 1, 3)
        });
      });
      return Object.freeze({ id: "meadow.windLanes", kind: "wind-lanes", lanes });
    }
  });
}

export function createMeadowSeasonalBloomQueueKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-seasonal-bloom-queue-kit",
    version: MEADOW_ECOLOGY_READABILITY_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const rng = createSeededRandom(`${ctx.seed}:bloom:${ctx.flowers.length}`);
      const flowers = Array.isArray(ctx.flowers) ? ctx.flowers : [];
      const count = Math.round(clamp(input.bloomCount ?? options.bloomCount ?? 14, 6, 28));
      const blooms = Array.from({ length: count }, (_, index) => {
        const source = flowers.length ? flowers[(index * 17 + 3) % flowers.length] : samplePoint(rng, ctx.width, ctx.depth, 0.4);
        const x = Number(source.x ?? 0) + rng.range(-1.8, 1.8);
        const z = Number(source.z ?? 0) + rng.range(-1.8, 1.8);
        return Object.freeze({
          id: stableId("bloomQueue", ctx.seed, index),
          x: round(x),
          y: safeHeightAt(ctx.heightAt, x, z) + 0.065,
          z: round(z),
          radius: round(rng.range(0.45, 1.9), 3),
          openness: round(clamp(ctx.dayAmount * 0.55 + ctx.warmRim * 0.3 + rng.range(0, 0.25)), 3),
          nextPeakSeconds: Math.round(20 + index * 9 + rng.range(0, 18)),
          color: source.color ?? rng.pick([[0.96, 0.78, 0.32], [0.88, 0.44, 0.64], [0.78, 0.92, 0.52]]),
          phase: round((ctx.time * 0.04 + index * 0.17) % 1, 3)
        });
      });
      return Object.freeze({ id: "meadow.seasonalBloomQueue", kind: "seasonal-bloom-queue", blooms });
    }
  });
}

export function createMeadowAttentionBeaconKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-attention-beacon-kit",
    version: MEADOW_ECOLOGY_READABILITY_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const sheep = Array.isArray(ctx.sheep) ? ctx.sheep : [];
      const flockX = sheep.length ? sheep.reduce((sum, animal) => sum + Number((animal.transform ?? animal).x ?? 0), 0) / sheep.length : 8;
      const flockZ = sheep.length ? sheep.reduce((sum, animal) => sum + Number((animal.transform ?? animal).z ?? 0), 0) / sheep.length : 12;
      const anchors = [
        { label: "cottage threshold", x: 0, z: 0, priority: 0.88 },
        { label: "grazing flock", x: flockX, z: flockZ, priority: 0.74 },
        { label: "flower drift", x: -16, z: 18, priority: 0.62 },
        { label: "far hedgerow", x: 32, z: -28, priority: 0.48 },
        { label: "golden shaft", x: -28, z: -18, priority: 0.56 }
      ];
      const beacons = anchors.map((anchor, index) => Object.freeze({
        id: stableId("attentionBeacon", ctx.seed, index),
        x: round(anchor.x),
        y: safeHeightAt(ctx.heightAt, anchor.x, anchor.z) + round(1.2 + index * 0.22, 3),
        z: round(anchor.z),
        radius: round(1.4 + anchor.priority * 2.2, 3),
        priority: round(anchor.priority + ctx.warmRim * 0.08, 3),
        label: anchor.label,
        phase: round((ctx.time * 0.035 + index * 0.21) % 1, 3)
      }));
      return Object.freeze({ id: "meadow.attentionBeacons", kind: "attention-beacons", beacons });
    }
  });
}

export function createMeadowEcologyRendererHandoffKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-ecology-renderer-handoff-kit",
    version: MEADOW_ECOLOGY_READABILITY_VERSION,
    describe(input = {}) {
      const descriptors = input.descriptors ?? {};
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, descriptorCount(value)]));
      const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return Object.freeze({
        id: "meadow.ecologyRendererHandoff",
        kind: "renderer-handoff",
        contract: "renderer-consumes-serializable-descriptors-only",
        forbiddenOwnership: FORBIDDEN_OWNERSHIP,
        descriptorKeys: Object.keys(descriptors),
        counts: Object.freeze({ ...counts, total })
      });
    }
  });
}

export function createMeadowEcologyReadabilityDomainKit(_N = null, options = {}) {
  const pollinatorRouteKit = createMeadowPollinatorRouteKit(_N, options);
  const shepherdPathKit = createMeadowShepherdPathKit(_N, options);
  const restSpotKit = createMeadowRestSpotKit(_N, options);
  const windLaneKit = createMeadowWindLaneKit(_N, options);
  const seasonalBloomQueueKit = createMeadowSeasonalBloomQueueKit(_N, options);
  const attentionBeaconKit = createMeadowAttentionBeaconKit(_N, options);
  const rendererHandoffKit = createMeadowEcologyRendererHandoffKit(_N, options);

  return Object.freeze({
    id: "meadow-ecology-readability-domain-kit",
    version: MEADOW_ECOLOGY_READABILITY_VERSION,
    tree: MEADOW_ECOLOGY_READABILITY_TREE,
    kits: Object.freeze({
      pollinatorRouteKit,
      shepherdPathKit,
      restSpotKit,
      windLaneKit,
      seasonalBloomQueueKit,
      attentionBeaconKit,
      rendererHandoffKit
    }),
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const descriptors = Object.freeze({
        pollinatorRoutes: pollinatorRouteKit.describe(ctx),
        shepherdPaths: shepherdPathKit.describe(ctx),
        restSpots: restSpotKit.describe(ctx),
        windLanes: windLaneKit.describe(ctx),
        seasonalBloomQueue: seasonalBloomQueueKit.describe(ctx),
        attentionBeacons: attentionBeaconKit.describe(ctx)
      });
      const rendererHandoff = rendererHandoffKit.describe({ descriptors });
      return Object.freeze({
        id: "meadow.ecologyReadability",
        version: MEADOW_ECOLOGY_READABILITY_VERSION,
        domain: "high-fidelity-meadow-ecology-readability-domain",
        tree: MEADOW_ECOLOGY_READABILITY_TREE,
        descriptors,
        rendererHandoff,
        descriptorCounts: rendererHandoff.counts,
        lesson: "Ecology readability turns an ambient meadow into an authored living scene through pollinator routes, shepherd paths, rest pockets, wind lanes, bloom timing, and attention beacons without letting renderer code own simulation truth."
      });
    }
  });
}
