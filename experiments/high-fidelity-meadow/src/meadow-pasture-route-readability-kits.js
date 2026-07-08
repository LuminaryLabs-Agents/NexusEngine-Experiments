export const MEADOW_PASTURE_ROUTE_READABILITY_VERSION = "2026-07-08-pasture-route-readability-1";

export const MEADOW_PASTURE_ROUTE_READABILITY_TREE = Object.freeze(`meadow-pasture-route-readability-domain
├─ forage-intent-domain
│  ├─ grazing-route-score-domain
│  │  └─ meadow-grazing-route-score-kit
│  └─ forage-patch-priority-domain
│     └─ meadow-forage-patch-priority-kit
├─ flock-comfort-domain
│  ├─ sheep-comfort-arc-domain
│  │  └─ meadow-sheep-comfort-arc-kit
│  └─ water-trough-thread-domain
│     └─ meadow-water-trough-thread-kit
├─ return-weather-domain
│  ├─ gate-return-cue-domain
│  │  └─ meadow-gate-return-cue-kit
│  └─ weather-shelter-band-domain
│     └─ meadow-weather-shelter-band-kit
└─ renderer-handoff
   └─ meadow-pasture-route-renderer-handoff-kit
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
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, number));
}

function round(value, digits = 4) {
  const scale = 10 ** digits;
  return Math.round(Number(value || 0) * scale) / scale;
}

function hashString(text) {
  let hash = 2166136261;
  const input = String(text ?? "meadow-pasture-route");
  for (let index = 0; index < input.length; index += 1) {
    hash = Math.imul(hash ^ input.charCodeAt(index), 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed = "meadow-pasture-route") {
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

function toTransform(entity = {}) {
  return entity.transform ?? entity.position ?? entity;
}

function normalizeInput(input = {}, options = {}) {
  const sheep = input.sheep?.sheep ?? input.sheep?.flock ?? input.sheep ?? [];
  const flowers = input.flowers?.flowers ?? input.flowers ?? [];
  const cycle = input.cycle ?? {};
  return Object.freeze({
    seed: String(input.seed ?? options.seed ?? "high-fidelity-meadow-pasture-route"),
    width: clamp(input.width ?? input.terrain?.width ?? options.width ?? 196, 32, 512),
    depth: clamp(input.depth ?? input.terrain?.depth ?? options.depth ?? 196, 32, 512),
    time: Number(input.time ?? cycle.time?.seconds ?? 0) || 0,
    phase: String(input.phase ?? cycle.time?.phase ?? "golden hour"),
    dayAmount: clamp(input.dayAmount ?? cycle.light?.dayAmount ?? 0.62),
    warmRim: clamp(input.warmRim ?? cycle.light?.warmRim ?? 0.35),
    windSeed: Number(input.windSeed ?? cycle.wind?.seed ?? input.visualFractal?.seed ?? 0) || 0,
    heightAt: input.heightAt ?? options.heightAt,
    pathMask: input.pathMask ?? options.pathMask,
    yardMask: input.yardMask ?? options.yardMask,
    sheep: Array.isArray(sheep) ? sheep : [],
    flowers: Array.isArray(flowers) ? flowers : [],
    ecologyReadability: input.ecologyReadability ?? null,
    visualFractal: input.visualFractal ?? null
  });
}

function flockCenter(sheep = []) {
  if (!sheep.length) return { x: 0, z: 0 };
  const sum = sheep.reduce((memo, animal) => {
    const t = toTransform(animal);
    memo.x += Number(t.x ?? 0);
    memo.z += Number(t.z ?? 0);
    return memo;
  }, { x: 0, z: 0 });
  return { x: sum.x / sheep.length, z: sum.z / sheep.length };
}

function descriptorCount(value) {
  if (Array.isArray(value)) return value.length;
  for (const key of ["routes", "patches", "arcs", "threads", "cues", "bands"]) {
    if (Array.isArray(value?.[key])) return value[key].length;
  }
  return 1;
}

export function createMeadowGrazingRouteScoreKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-grazing-route-score-kit",
    version: MEADOW_PASTURE_ROUTE_READABILITY_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const rng = createSeededRandom(`${ctx.seed}:grazing-route:${ctx.sheep.length}:${ctx.flowers.length}`);
      const center = flockCenter(ctx.sheep);
      const count = Math.round(clamp(input.routeCount ?? options.routeCount ?? 10, 4, 18));
      const routes = Array.from({ length: count }, (_, index) => {
        const flower = ctx.flowers.length ? ctx.flowers[(index * 19 + 7) % ctx.flowers.length] : samplePoint(rng, ctx.width, ctx.depth, 0.38);
        const targetX = Number(flower.x ?? flower.position?.x ?? 0) + rng.range(-4, 4);
        const targetZ = Number(flower.z ?? flower.position?.z ?? 0) + rng.range(-4, 4);
        const path = safeMask(ctx.pathMask, targetX, targetZ);
        const yard = safeMask(ctx.yardMask, targetX, targetZ);
        const forage = clamp(0.3 + yard * 0.32 + (1 - path) * 0.22 + rng.range(0, 0.22));
        return Object.freeze({
          id: stableId("grazingRouteScore", ctx.seed, index),
          from: { x: round(center.x), y: safeHeightAt(ctx.heightAt, center.x, center.z) + 0.055, z: round(center.z) },
          to: { x: round(targetX), y: safeHeightAt(ctx.heightAt, targetX, targetZ) + 0.055, z: round(targetZ) },
          score: round(forage, 3),
          width: round(0.28 + forage * 0.42, 3),
          label: forage > 0.72 ? "rich graze" : path > 0.45 ? "path edge" : "soft forage",
          phase: round((ctx.time * 0.022 + index * 0.13) % 1, 3),
          rendererHint: "consume-as-grazing-route-score"
        });
      });
      return Object.freeze({ id: "meadow.grazingRouteScores", kind: "grazing-route-scores", routes });
    }
  });
}

export function createMeadowForagePatchPriorityKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-forage-patch-priority-kit",
    version: MEADOW_PASTURE_ROUTE_READABILITY_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const rng = createSeededRandom(`${ctx.seed}:forage-patch:${ctx.phase}:${ctx.flowers.length}`);
      const count = Math.round(clamp(input.patchCount ?? options.patchCount ?? 14, 6, 26));
      const patches = Array.from({ length: count }, (_, index) => {
        const source = ctx.flowers.length ? ctx.flowers[(index * 23 + 5) % ctx.flowers.length] : samplePoint(rng, ctx.width, ctx.depth, 0.42);
        const x = Number(source.x ?? source.position?.x ?? 0) + rng.range(-2.8, 2.8);
        const z = Number(source.z ?? source.position?.z ?? 0) + rng.range(-2.8, 2.8);
        const yard = safeMask(ctx.yardMask, x, z);
        const priority = clamp(0.28 + yard * 0.3 + ctx.dayAmount * 0.18 + rng.range(0, 0.28));
        return Object.freeze({
          id: stableId("foragePatchPriority", ctx.seed, index),
          x: round(x),
          y: safeHeightAt(ctx.heightAt, x, z) + 0.045,
          z: round(z),
          radius: round(rng.range(0.9, 3.2) * (0.8 + priority * 0.5), 3),
          priority: round(priority, 3),
          freshness: round(clamp(0.35 + ctx.warmRim * 0.2 + rng.range(0, 0.35)), 3),
          color: source.color ?? rng.pick([[0.68, 0.86, 0.38], [0.82, 0.74, 0.34], [0.55, 0.78, 0.44]]),
          phase: round((ctx.time * 0.018 + index * 0.19) % 1, 3)
        });
      });
      return Object.freeze({ id: "meadow.foragePatchPriorities", kind: "forage-patch-priorities", patches });
    }
  });
}

export function createMeadowSheepComfortArcKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-sheep-comfort-arc-kit",
    version: MEADOW_PASTURE_ROUTE_READABILITY_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const arcs = ctx.sheep.slice(0, 12).map((animal, index) => {
        const t = toTransform(animal);
        const x = Number(t.x ?? 0);
        const z = Number(t.z ?? 0);
        const yard = safeMask(ctx.yardMask, x, z);
        const path = safeMask(ctx.pathMask, x, z);
        const comfort = clamp(0.38 + yard * 0.26 + (1 - path) * 0.14 + ctx.warmRim * 0.12);
        return Object.freeze({
          id: `${animal.id ?? "sheep"}.comfortArc.${index}`,
          x: round(x),
          y: safeHeightAt(ctx.heightAt, x, z) + 0.09,
          z: round(z),
          radius: round(1.35 + comfort * 2.4 + index * 0.025, 3),
          yawStart: round(Number(t.yaw ?? 0) - 0.85, 3),
          yawEnd: round(Number(t.yaw ?? 0) + 0.85, 3),
          comfort: round(comfort, 3),
          label: comfort > 0.68 ? "settled" : "restless",
          phase: round((ctx.time * 0.026 + index * 0.1) % 1, 3)
        });
      });
      return Object.freeze({ id: "meadow.sheepComfortArcs", kind: "sheep-comfort-arcs", arcs });
    }
  });
}

export function createMeadowWaterTroughThreadKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-water-trough-thread-kit",
    version: MEADOW_PASTURE_ROUTE_READABILITY_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const center = flockCenter(ctx.sheep);
      const troughs = [
        { label: "cottage trough", x: 5.8, z: -3.5 },
        { label: "brook lip", x: -24, z: 22 },
        { label: "lower hollow", x: 28, z: 18 },
        { label: "shade basin", x: -18, z: -24 }
      ];
      const threads = troughs.map((target, index) => {
        const distance = Math.hypot(target.x - center.x, target.z - center.z);
        const hydration = clamp(1 - distance / Math.max(ctx.width, ctx.depth));
        return Object.freeze({
          id: stableId("waterTroughThread", ctx.seed, index),
          from: { x: round(center.x), y: safeHeightAt(ctx.heightAt, center.x, center.z) + 0.08, z: round(center.z) },
          to: { x: round(target.x), y: safeHeightAt(ctx.heightAt, target.x, target.z) + 0.08, z: round(target.z) },
          label: target.label,
          urgency: round(0.22 + (1 - hydration) * 0.52 + (1 - ctx.dayAmount) * 0.12, 3),
          width: round(0.22 + hydration * 0.32, 3),
          phase: round((ctx.time * 0.02 + index * 0.24) % 1, 3)
        });
      });
      return Object.freeze({ id: "meadow.waterTroughThreads", kind: "water-trough-threads", threads });
    }
  });
}

export function createMeadowGateReturnCueKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-gate-return-cue-kit",
    version: MEADOW_PASTURE_ROUTE_READABILITY_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const center = flockCenter(ctx.sheep);
      const anchors = [
        { label: "north stile", x: -4, z: -ctx.depth * 0.39 },
        { label: "east gate", x: ctx.width * 0.38, z: 4 },
        { label: "cottage close", x: 1, z: -8 },
        { label: "west hedge gap", x: -ctx.width * 0.36, z: 12 },
        { label: "south sheep lane", x: 7, z: ctx.depth * 0.36 }
      ];
      const cues = anchors.map((anchor, index) => {
        const distance = Math.hypot(anchor.x - center.x, anchor.z - center.z);
        const priority = clamp(0.82 - distance / (Math.max(ctx.width, ctx.depth) * 0.9) + index * 0.015);
        return Object.freeze({
          id: stableId("gateReturnCue", ctx.seed, index),
          x: round(anchor.x),
          y: safeHeightAt(ctx.heightAt, anchor.x, anchor.z) + 1.0 + index * 0.08,
          z: round(anchor.z),
          radius: round(1.2 + priority * 2.1, 3),
          priority: round(priority, 3),
          label: anchor.label,
          phase: round((ctx.time * 0.017 + index * 0.21) % 1, 3)
        });
      });
      return Object.freeze({ id: "meadow.gateReturnCues", kind: "gate-return-cues", cues });
    }
  });
}

export function createMeadowWeatherShelterBandKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-weather-shelter-band-kit",
    version: MEADOW_PASTURE_ROUTE_READABILITY_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const rng = createSeededRandom(`${ctx.seed}:shelter:${Math.round(ctx.time / 45)}:${ctx.phase}`);
      const count = Math.round(clamp(input.shelterBandCount ?? options.shelterBandCount ?? 6, 3, 12));
      const weatherPressure = clamp((1 - ctx.dayAmount) * 0.36 + ctx.warmRim * 0.12 + Math.abs(Math.sin(ctx.time * 0.013 + ctx.windSeed)) * 0.28);
      const bands = Array.from({ length: count }, (_, index) => {
        const point = samplePoint(rng, ctx.width, ctx.depth, 0.38);
        const shelter = clamp(0.42 + weatherPressure * 0.38 + safeMask(ctx.yardMask, point.x, point.z) * 0.2 + rng.range(0, 0.18));
        return Object.freeze({
          id: stableId("weatherShelterBand", ctx.seed, index),
          x: round(point.x),
          y: safeHeightAt(ctx.heightAt, point.x, point.z) + 0.11,
          z: round(point.z),
          radius: round(rng.range(3.8, 9.5), 3),
          shelter: round(shelter, 3),
          pressure: round(weatherPressure, 3),
          label: shelter > 0.72 ? "best shelter" : "light cover",
          phase: round((ctx.time * 0.015 + index * 0.27) % 1, 3)
        });
      });
      return Object.freeze({ id: "meadow.weatherShelterBands", kind: "weather-shelter-bands", bands });
    }
  });
}

export function createMeadowPastureRouteRendererHandoffKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-pasture-route-renderer-handoff-kit",
    version: MEADOW_PASTURE_ROUTE_READABILITY_VERSION,
    describe(input = {}) {
      const descriptors = input.descriptors ?? {};
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, descriptorCount(value)]));
      const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return Object.freeze({
        id: "meadow.pastureRouteRendererHandoff",
        kind: "renderer-handoff",
        contract: "renderer-consumes-serializable-descriptors-only",
        forbiddenOwnership: FORBIDDEN_OWNERSHIP,
        descriptorKeys: Object.keys(descriptors),
        counts: Object.freeze({ ...counts, total })
      });
    }
  });
}

export function createMeadowPastureRouteReadabilityDomainKit(_N = null, options = {}) {
  const grazingRouteScoreKit = createMeadowGrazingRouteScoreKit(_N, options);
  const foragePatchPriorityKit = createMeadowForagePatchPriorityKit(_N, options);
  const sheepComfortArcKit = createMeadowSheepComfortArcKit(_N, options);
  const waterTroughThreadKit = createMeadowWaterTroughThreadKit(_N, options);
  const gateReturnCueKit = createMeadowGateReturnCueKit(_N, options);
  const weatherShelterBandKit = createMeadowWeatherShelterBandKit(_N, options);
  const rendererHandoffKit = createMeadowPastureRouteRendererHandoffKit(_N, options);

  return Object.freeze({
    id: "meadow-pasture-route-readability-domain-kit",
    version: MEADOW_PASTURE_ROUTE_READABILITY_VERSION,
    tree: MEADOW_PASTURE_ROUTE_READABILITY_TREE,
    kits: Object.freeze({
      grazingRouteScoreKit,
      foragePatchPriorityKit,
      sheepComfortArcKit,
      waterTroughThreadKit,
      gateReturnCueKit,
      weatherShelterBandKit,
      rendererHandoffKit
    }),
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const descriptors = Object.freeze({
        grazingRouteScores: grazingRouteScoreKit.describe(ctx),
        foragePatchPriorities: foragePatchPriorityKit.describe(ctx),
        sheepComfortArcs: sheepComfortArcKit.describe(ctx),
        waterTroughThreads: waterTroughThreadKit.describe(ctx),
        gateReturnCues: gateReturnCueKit.describe(ctx),
        weatherShelterBands: weatherShelterBandKit.describe(ctx)
      });
      const rendererHandoff = rendererHandoffKit.describe({ descriptors });
      return Object.freeze({
        id: "meadow.pastureRouteReadability",
        version: MEADOW_PASTURE_ROUTE_READABILITY_VERSION,
        domain: "high-fidelity-meadow-pasture-route-readability-domain",
        tree: MEADOW_PASTURE_ROUTE_READABILITY_TREE,
        descriptors,
        rendererHandoff,
        descriptorCounts: rendererHandoff.counts,
        lesson: "Pasture route readability turns a passive meadow scene into a light herding-planning micro experience through grazing routes, forage priority, sheep comfort, water threads, return cues, and weather shelter bands without giving renderer code simulation ownership."
      });
    }
  });
}
