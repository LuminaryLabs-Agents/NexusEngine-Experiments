export const MEADOW_VISUAL_FRACTAL_VERSION = "2026-07-07-depth-patch-fractal-1";

const FORBIDDEN_OWNERSHIP = Object.freeze([
  "renderer",
  "dom",
  "browser-input",
  "webgl",
  "audio",
  "asset-loading",
  "frame-loop"
]);

const GRASS_PALETTE = Object.freeze([
  Object.freeze([0.18, 0.36, 0.16]),
  Object.freeze([0.34, 0.48, 0.20]),
  Object.freeze([0.58, 0.55, 0.25]),
  Object.freeze([0.72, 0.62, 0.32])
]);

const FLOWER_PALETTE = Object.freeze([
  Object.freeze([0.95, 0.82, 0.32]),
  Object.freeze([0.88, 0.42, 0.62]),
  Object.freeze([0.96, 0.94, 0.72]),
  Object.freeze([0.70, 0.86, 0.38]),
  Object.freeze([0.82, 0.34, 0.46])
]);

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
}

function mix(a, b, t) {
  return a + (b - a) * clamp(t);
}

function round(value, digits = 4) {
  const scale = 10 ** digits;
  return Math.round(Number(value || 0) * scale) / scale;
}

function hashString(text) {
  let hash = 2166136261;
  const input = String(text ?? "meadow");
  for (let index = 0; index < input.length; index += 1) {
    hash = Math.imul(hash ^ input.charCodeAt(index), 16777619);
  }
  return hash >>> 0;
}

export function createMeadowSeededRandom(seed = "meadow") {
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

function normalizeInput(input = {}, options = {}) {
  return Object.freeze({
    seed: String(input.seed ?? options.seed ?? "high-fidelity-meadow-visual-fractal"),
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
    camera: input.camera ?? null
  });
}

function samplePoint(rng, width, depth, radiusScale = 0.48) {
  const angle = rng.range(0, Math.PI * 2);
  const radius = Math.sqrt(rng()) * Math.min(width, depth) * radiusScale;
  return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
}

function stableId(prefix, seed, index) {
  return `${prefix}.${index}.${hashString(`${seed}:${index}`).toString(36).slice(0, 5)}`;
}

export function createMeadowDepthStrataKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-depth-strata-kit",
    version: MEADOW_VISUAL_FRACTAL_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const bands = [
        { id: "near", radius: Math.min(ctx.width, ctx.depth) * 0.18, density: 1.0, detail: "blade-readable foreground" },
        { id: "middle", radius: Math.min(ctx.width, ctx.depth) * 0.32, density: 0.72, detail: "flower and sheep readability" },
        { id: "far", radius: Math.min(ctx.width, ctx.depth) * 0.49, density: 0.42, detail: "soft horizon texture" }
      ].map((band, index) => Object.freeze({
        ...band,
        y: safeHeightAt(ctx.heightAt, 0, band.radius * 0.18),
        parallax: round(1 - index * 0.18, 3),
        haze: round(index * 0.18 + (1 - ctx.dayAmount) * 0.12, 3),
        colorBias: round(ctx.warmRim * (index + 1) * 0.08, 3)
      }));
      return Object.freeze({ id: "meadow.depthStrata", kind: "depth-strata", bands });
    }
  });
}

export function createMeadowGrassPatchClusterKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-grass-patch-cluster-kit",
    version: MEADOW_VISUAL_FRACTAL_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const count = Math.round(clamp(input.patchCount ?? options.patchCount ?? 28, 8, 80));
      const rng = createMeadowSeededRandom(`${ctx.seed}:grass-patches:${count}:${ctx.phase}`);
      const patches = [];
      let attempts = 0;
      while (patches.length < count && attempts < count * 8) {
        attempts += 1;
        const point = samplePoint(rng, ctx.width, ctx.depth, 0.47);
        const path = safeMask(ctx.pathMask, point.x, point.z);
        const yard = safeMask(ctx.yardMask, point.x, point.z);
        if (rng() < path * 0.62 + yard * 0.28) continue;
        const radius = rng.range(1.4, 5.8) * (1 - path * 0.28);
        const density = clamp(rng.range(0.44, 1.0) - path * 0.2 - yard * 0.1, 0.18, 1);
        patches.push(Object.freeze({
          id: stableId("grassPatch", ctx.seed, patches.length),
          x: round(point.x),
          y: safeHeightAt(ctx.heightAt, point.x, point.z) + 0.018,
          z: round(point.z),
          radius: round(radius, 3),
          heightBias: round(rng.range(0.68, 1.42), 3),
          density: round(density, 3),
          windPhase: round(rng.range(0, Math.PI * 2), 4),
          color: rng.pick(GRASS_PALETTE),
          shape: rng() > 0.58 ? "tall-tuft" : "soft-clump",
          rendererHint: "consume-as-layer-descriptor"
        }));
      }
      return Object.freeze({ id: "meadow.grassPatchClusters", kind: "grass-patch-clusters", patches, attempts });
    }
  });
}

export function createMeadowFlowerDriftPatchKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-flower-drift-patch-kit",
    version: MEADOW_VISUAL_FRACTAL_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const rng = createMeadowSeededRandom(`${ctx.seed}:flower-drifts:${ctx.flowers.length}`);
      const sourceFlowers = ctx.flowers.slice(0, 160);
      const driftCount = Math.round(clamp(input.driftCount ?? options.driftCount ?? 18, 6, 48));
      const drifts = [];
      for (let index = 0; index < driftCount; index += 1) {
        const flower = sourceFlowers.length ? sourceFlowers[Math.floor(rng() * sourceFlowers.length) % sourceFlowers.length] : samplePoint(rng, ctx.width, ctx.depth, 0.42);
        const x = Number(flower.x ?? 0) + rng.range(-2.2, 2.2);
        const z = Number(flower.z ?? 0) + rng.range(-2.2, 2.2);
        drifts.push(Object.freeze({
          id: stableId("flowerDrift", ctx.seed, index),
          x: round(x),
          y: safeHeightAt(ctx.heightAt, x, z) + 0.05,
          z: round(z),
          radius: round(rng.range(0.8, 3.4), 3),
          countHint: Math.round(rng.range(16, 92)),
          color: flower.color ?? rng.pick(FLOWER_PALETTE),
          lift: round(rng.range(0.02, 0.16), 3),
          phase: round(rng.range(0, Math.PI * 2), 4)
        }));
      }
      return Object.freeze({ id: "meadow.flowerDrifts", kind: "flower-drift-patches", drifts });
    }
  });
}

export function createMeadowGrazingTrailKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-grazing-trail-kit",
    version: MEADOW_VISUAL_FRACTAL_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const sheep = Array.isArray(ctx.sheep) ? ctx.sheep : [];
      const trails = sheep.slice(0, 10).map((animal, index) => {
        const transform = animal.transform ?? animal;
        const x = Number(transform.x ?? 0);
        const z = Number(transform.z ?? 0);
        const yaw = Number(transform.yaw ?? 0);
        const length = 2.2 + (index % 4) * 0.55;
        return Object.freeze({
          id: `${animal.id ?? "sheep"}.grazingTrail.${index}`,
          from: { x: round(x - Math.cos(yaw) * length), y: safeHeightAt(ctx.heightAt, x, z) + 0.025, z: round(z - Math.sin(yaw) * length) },
          to: { x: round(x + Math.cos(yaw) * 0.75), y: safeHeightAt(ctx.heightAt, x, z) + 0.025, z: round(z + Math.sin(yaw) * 0.75) },
          pressure: round(0.24 + (index % 5) * 0.08, 3),
          width: round(0.42 + (index % 3) * 0.16, 3),
          pulse: round((ctx.time * 0.07 + index * 0.13) % 1, 3)
        });
      });
      return Object.freeze({ id: "meadow.grazingTrails", kind: "grazing-trails", trails });
    }
  });
}

export function createMeadowLightShaftKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-light-shaft-kit",
    version: MEADOW_VISUAL_FRACTAL_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const rng = createMeadowSeededRandom(`${ctx.seed}:light-shafts:${ctx.phase}`);
      const shaftCount = Math.round(clamp(input.shaftCount ?? options.shaftCount ?? 9, 3, 24));
      const shafts = Array.from({ length: shaftCount }, (_, index) => {
        const point = samplePoint(rng, ctx.width, ctx.depth, 0.38);
        return Object.freeze({
          id: stableId("lightShaft", ctx.seed, index),
          x: round(point.x),
          y: round(safeHeightAt(ctx.heightAt, point.x, point.z) + rng.range(3.2, 8.8), 3),
          z: round(point.z),
          height: round(rng.range(12, 36) * (0.72 + ctx.dayAmount * 0.35), 3),
          radius: round(rng.range(2.4, 7.4), 3),
          warmth: round(0.38 + ctx.warmRim * 0.62, 3),
          opacity: round(0.05 + ctx.warmRim * 0.12 + (1 - ctx.dayAmount) * 0.04, 3),
          phase: round(rng.range(0, Math.PI * 2), 4)
        });
      });
      return Object.freeze({ id: "meadow.lightShafts", kind: "light-shafts", shafts });
    }
  });
}

export function createMeadowAtmosphericParallaxKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-atmospheric-parallax-kit",
    version: MEADOW_VISUAL_FRACTAL_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const layers = [0.2, 0.42, 0.66, 0.88].map((depth, index) => Object.freeze({
        id: `meadow.mistLayer.${index}`,
        depth: round(depth, 3),
        y: round(mix(0.65, 7.2, depth), 3),
        radius: round(Math.min(ctx.width, ctx.depth) * mix(0.18, 0.5, depth), 3),
        opacity: round(0.035 + (1 - ctx.dayAmount) * 0.06 + index * 0.012, 3),
        drift: round((ctx.time * (0.006 + index * 0.002)) % 1, 3),
        tint: [round(mix(0.74, 0.98, ctx.warmRim), 3), round(mix(0.82, 0.72, 1 - ctx.dayAmount), 3), round(mix(0.76, 0.95, depth), 3)]
      }));
      return Object.freeze({ id: "meadow.atmosphericParallax", kind: "atmospheric-parallax", layers });
    }
  });
}

export function createMeadowRendererHandoffKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-renderer-handoff-kit",
    version: MEADOW_VISUAL_FRACTAL_VERSION,
    describe(input = {}) {
      const descriptors = input.descriptors ?? {};
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.length : Array.isArray(value?.patches) ? value.patches.length : Array.isArray(value?.drifts) ? value.drifts.length : Array.isArray(value?.trails) ? value.trails.length : Array.isArray(value?.shafts) ? value.shafts.length : Array.isArray(value?.layers) ? value.layers.length : Array.isArray(value?.bands) ? value.bands.length : 1
      ]));
      const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return Object.freeze({
        id: "meadow.rendererHandoff",
        kind: "renderer-handoff",
        contract: "renderer-consumes-serializable-descriptors-only",
        forbiddenOwnership: FORBIDDEN_OWNERSHIP,
        descriptorKeys: Object.keys(descriptors),
        counts: Object.freeze({ ...counts, total })
      });
    }
  });
}

export function createMeadowVisualFractalDomainKit(_N = null, options = {}) {
  const depthStrataKit = createMeadowDepthStrataKit(_N, options);
  const grassPatchKit = createMeadowGrassPatchClusterKit(_N, options);
  const flowerDriftKit = createMeadowFlowerDriftPatchKit(_N, options);
  const grazingTrailKit = createMeadowGrazingTrailKit(_N, options);
  const lightShaftKit = createMeadowLightShaftKit(_N, options);
  const atmosphericParallaxKit = createMeadowAtmosphericParallaxKit(_N, options);
  const rendererHandoffKit = createMeadowRendererHandoffKit(_N, options);

  return Object.freeze({
    id: "meadow-visual-fractal-domain-kit",
    version: MEADOW_VISUAL_FRACTAL_VERSION,
    kits: Object.freeze({
      depthStrataKit,
      grassPatchKit,
      flowerDriftKit,
      grazingTrailKit,
      lightShaftKit,
      atmosphericParallaxKit,
      rendererHandoffKit
    }),
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const descriptors = Object.freeze({
        depthStrata: depthStrataKit.describe(ctx),
        grassPatches: grassPatchKit.describe(ctx),
        flowerDrifts: flowerDriftKit.describe(ctx),
        grazingTrails: grazingTrailKit.describe(ctx),
        lightShafts: lightShaftKit.describe(ctx),
        atmosphericParallax: atmosphericParallaxKit.describe(ctx)
      });
      const rendererHandoff = rendererHandoffKit.describe({ descriptors });
      return Object.freeze({
        id: "meadow.visualFractal",
        version: MEADOW_VISUAL_FRACTAL_VERSION,
        domain: "high-fidelity-meadow-depth-patch-fractal-domain",
        descriptors,
        rendererHandoff,
        descriptorCounts: rendererHandoff.counts,
        lesson: "Patch-level descriptors sit above individual blade data, so the meadow gains larger readable composition without giving renderer ownership to reusable kits."
      });
    }
  });
}
