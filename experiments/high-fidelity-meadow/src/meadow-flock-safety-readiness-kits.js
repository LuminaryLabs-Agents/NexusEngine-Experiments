export const MEADOW_FLOCK_SAFETY_READINESS_VERSION = "2026-07-08-flock-safety-readiness-1";

export const MEADOW_FLOCK_SAFETY_READINESS_TREE = Object.freeze(`meadow-flock-safety-readiness-domain
├─ flock-risk-domain
│  ├─ lost-lamb-domain
│  │  └─ meadow-lost-lamb-call-kit
│  └─ fox-shadow-domain
│     └─ meadow-fox-shadow-boundary-kit
├─ guidance-response-domain
│  ├─ bellwether-lead-domain
│  │  └─ meadow-bellwether-lead-thread-kit
│  └─ vet-check-domain
│     └─ meadow-vet-check-pulse-kit
├─ fold-return-domain
│  ├─ nightfall-fold-domain
│  │  └─ meadow-nightfall-fold-gate-kit
│  └─ cottage-lantern-domain
│     └─ meadow-cottage-lantern-return-kit
└─ renderer-handoff
   └─ meadow-flock-safety-renderer-handoff-kit
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
  const input = String(text ?? "meadow-flock-safety");
  for (let index = 0; index < input.length; index += 1) {
    hash = Math.imul(hash ^ input.charCodeAt(index), 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed = "meadow-flock-safety") {
  let state = hashString(seed) || 1;
  const random = () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  random.range = (min, max) => min + (max - min) * random();
  return random;
}

function stableId(prefix, seed, index) {
  return `${prefix}.${index}.${hashString(`${seed}:${prefix}:${index}`).toString(36).slice(0, 5)}`;
}

function toTransform(entity = {}) {
  return entity.transform ?? entity.position ?? entity;
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
  const sheep = input.sheep?.sheep ?? input.sheep?.flock ?? input.sheep ?? [];
  const flowers = input.flowers?.flowers ?? input.flowers ?? [];
  const cycle = input.cycle ?? {};
  return Object.freeze({
    seed: String(input.seed ?? options.seed ?? "high-fidelity-meadow-flock-safety"),
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
    pastureRouteReadability: input.pastureRouteReadability ?? null,
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

function sampleEdgePoint(ctx, rng, index) {
  const side = index % 4;
  const x = side === 0 ? -ctx.width * 0.46 : side === 1 ? ctx.width * 0.46 : rng.range(-ctx.width * 0.42, ctx.width * 0.42);
  const z = side === 2 ? -ctx.depth * 0.46 : side === 3 ? ctx.depth * 0.46 : rng.range(-ctx.depth * 0.42, ctx.depth * 0.42);
  return { x, z };
}

function descriptorCount(value) {
  if (Array.isArray(value)) return value.length;
  for (const key of ["calls", "boundaries", "threads", "gates", "lanterns", "pulses"]) {
    if (Array.isArray(value?.[key])) return value[key].length;
  }
  return 1;
}

export function createMeadowLostLambCallKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-lost-lamb-call-kit",
    version: MEADOW_FLOCK_SAFETY_READINESS_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const center = flockCenter(ctx.sheep);
      const calls = ctx.sheep.slice(0, 12).map((animal, index) => {
        const t = toTransform(animal);
        const x = Number(t.x ?? 0);
        const z = Number(t.z ?? 0);
        const distance = Math.hypot(x - center.x, z - center.z);
        const isolation = clamp(distance / Math.max(4, Math.min(ctx.width, ctx.depth) * 0.18));
        return Object.freeze({
          id: `${animal.id ?? "sheep"}.lostLambCall.${index}`,
          x: round(x),
          y: safeHeightAt(ctx.heightAt, x, z) + 0.34 + isolation * 0.22,
          z: round(z),
          radius: round(0.85 + isolation * 3.6, 3),
          isolation: round(isolation, 3),
          priority: round(clamp(isolation * 0.72 + (1 - ctx.dayAmount) * 0.18), 3),
          label: isolation > 0.72 ? "stray lamb" : "within flock",
          phase: round((ctx.time * 0.031 + index * 0.17) % 1, 3),
          rendererHint: "consume-as-lost-lamb-call"
        });
      });
      return Object.freeze({ id: "meadow.lostLambCalls", kind: "lost-lamb-calls", calls });
    }
  });
}

export function createMeadowFoxShadowBoundaryKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-fox-shadow-boundary-kit",
    version: MEADOW_FLOCK_SAFETY_READINESS_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const rng = createSeededRandom(`${ctx.seed}:fox-shadow:${Math.round(ctx.time / 60)}:${ctx.phase}`);
      const count = Math.round(clamp(input.boundaryCount ?? options.boundaryCount ?? 7, 4, 14));
      const duskPressure = clamp((1 - ctx.dayAmount) * 0.58 + Math.abs(Math.sin(ctx.time * 0.011 + ctx.windSeed)) * 0.26);
      const boundaries = Array.from({ length: count }, (_, index) => {
        const point = sampleEdgePoint(ctx, rng, index);
        const path = safeMask(ctx.pathMask, point.x, point.z);
        const risk = clamp(0.28 + duskPressure * 0.45 + path * 0.12 + rng.range(0, 0.2));
        return Object.freeze({
          id: stableId("foxShadowBoundary", ctx.seed, index),
          x: round(point.x),
          y: safeHeightAt(ctx.heightAt, point.x, point.z) + 0.05,
          z: round(point.z),
          radius: round(rng.range(3.4, 8.8) * (0.85 + risk * 0.42), 3),
          risk: round(risk, 3),
          duskPressure: round(duskPressure, 3),
          label: risk > 0.72 ? "fox shadow" : "watch edge",
          phase: round((ctx.time * 0.018 + index * 0.23) % 1, 3),
          rendererHint: "consume-as-fox-shadow-boundary"
        });
      });
      return Object.freeze({ id: "meadow.foxShadowBoundaries", kind: "fox-shadow-boundaries", boundaries });
    }
  });
}

export function createMeadowBellwetherLeadThreadKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-bellwether-lead-thread-kit",
    version: MEADOW_FLOCK_SAFETY_READINESS_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const center = flockCenter(ctx.sheep);
      const gates = [
        { label: "cottage fold", x: 2.4, z: -9.6 },
        { label: "upper pasture", x: -24, z: -18 },
        { label: "lower water", x: 24, z: 18 },
        { label: "shade lane", x: -18, z: 24 },
        { label: "south stile", x: 8, z: ctx.depth * 0.36 }
      ];
      const threads = gates.map((gate, index) => {
        const distance = Math.hypot(gate.x - center.x, gate.z - center.z);
        const confidence = clamp(1 - distance / Math.max(ctx.width, ctx.depth));
        return Object.freeze({
          id: stableId("bellwetherLeadThread", ctx.seed, index),
          from: { x: round(center.x), y: safeHeightAt(ctx.heightAt, center.x, center.z) + 0.12, z: round(center.z) },
          to: { x: round(gate.x), y: safeHeightAt(ctx.heightAt, gate.x, gate.z) + 0.12, z: round(gate.z) },
          label: gate.label,
          confidence: round(confidence, 3),
          urgency: round(clamp((1 - ctx.dayAmount) * 0.38 + (1 - confidence) * 0.36 + index * 0.025), 3),
          width: round(0.22 + confidence * 0.42, 3),
          phase: round((ctx.time * 0.021 + index * 0.2) % 1, 3),
          rendererHint: "consume-as-bellwether-lead-thread"
        });
      });
      return Object.freeze({ id: "meadow.bellwetherLeadThreads", kind: "bellwether-lead-threads", threads });
    }
  });
}

export function createMeadowNightfallFoldGateKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-nightfall-fold-gate-kit",
    version: MEADOW_FLOCK_SAFETY_READINESS_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const anchors = [
        { label: "fold yard", x: 0, z: -12 },
        { label: "east hedge", x: ctx.width * 0.36, z: -5 },
        { label: "west hedge", x: -ctx.width * 0.36, z: 7 },
        { label: "cottage door", x: 7, z: -5 }
      ];
      const nightfall = clamp(1 - ctx.dayAmount + Math.max(0, Math.sin(ctx.time * 0.006)) * 0.18);
      const gates = anchors.map((anchor, index) => Object.freeze({
        id: stableId("nightfallFoldGate", ctx.seed, index),
        x: round(anchor.x),
        y: safeHeightAt(ctx.heightAt, anchor.x, anchor.z) + 0.8 + nightfall * 0.35,
        z: round(anchor.z),
        radius: round(1.1 + nightfall * 2.7 + index * 0.16, 3),
        readiness: round(clamp(0.34 + nightfall * 0.52 + safeMask(ctx.yardMask, anchor.x, anchor.z) * 0.16), 3),
        label: anchor.label,
        phase: round((ctx.time * 0.019 + index * 0.27) % 1, 3),
        rendererHint: "consume-as-nightfall-fold-gate"
      }));
      return Object.freeze({ id: "meadow.nightfallFoldGates", kind: "nightfall-fold-gates", gates });
    }
  });
}

export function createMeadowCottageLanternReturnKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-cottage-lantern-return-kit",
    version: MEADOW_FLOCK_SAFETY_READINESS_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const rng = createSeededRandom(`${ctx.seed}:lantern:${ctx.phase}`);
      const anchors = [
        { label: "porch lamp", x: 5, z: -7 },
        { label: "lane lamp", x: -6, z: -18 },
        { label: "stone marker", x: 18, z: 8 },
        { label: "brook glint", x: -20, z: 15 },
        { label: "fold lantern", x: 2, z: -15 },
        { label: "hedge lantern", x: -28, z: -2 }
      ];
      const glow = clamp(0.2 + (1 - ctx.dayAmount) * 0.62 + ctx.warmRim * 0.16);
      const lanterns = anchors.map((anchor, index) => Object.freeze({
        id: stableId("cottageLanternReturn", ctx.seed, index),
        x: round(anchor.x + rng.range(-0.9, 0.9)),
        y: safeHeightAt(ctx.heightAt, anchor.x, anchor.z) + 1.1 + glow * 0.4,
        z: round(anchor.z + rng.range(-0.9, 0.9)),
        radius: round(1.5 + glow * 3.4 + index * 0.06, 3),
        glow: round(glow, 3),
        label: anchor.label,
        phase: round((ctx.time * 0.025 + index * 0.31) % 1, 3),
        rendererHint: "consume-as-cottage-lantern-return"
      }));
      return Object.freeze({ id: "meadow.cottageLanternReturns", kind: "cottage-lantern-returns", lanterns });
    }
  });
}

export function createMeadowVetCheckPulseKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-vet-check-pulse-kit",
    version: MEADOW_FLOCK_SAFETY_READINESS_VERSION,
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const pulses = ctx.sheep.slice(0, 10).map((animal, index) => {
        const t = toTransform(animal);
        const x = Number(t.x ?? 0);
        const z = Number(t.z ?? 0);
        const path = safeMask(ctx.pathMask, x, z);
        const yard = safeMask(ctx.yardMask, x, z);
        const concern = clamp(0.2 + path * 0.22 + (1 - yard) * 0.2 + (1 - ctx.dayAmount) * 0.18 + (index % 3) * 0.045);
        return Object.freeze({
          id: `${animal.id ?? "sheep"}.vetCheckPulse.${index}`,
          x: round(x),
          y: safeHeightAt(ctx.heightAt, x, z) + 0.18,
          z: round(z),
          radius: round(0.72 + concern * 2.6, 3),
          concern: round(concern, 3),
          label: concern > 0.66 ? "check hoof" : "steady",
          phase: round((ctx.time * 0.034 + index * 0.14) % 1, 3),
          rendererHint: "consume-as-vet-check-pulse"
        });
      });
      return Object.freeze({ id: "meadow.vetCheckPulses", kind: "vet-check-pulses", pulses });
    }
  });
}

export function createMeadowFlockSafetyRendererHandoffKit(_N = null, options = {}) {
  return Object.freeze({
    id: "meadow-flock-safety-renderer-handoff-kit",
    version: MEADOW_FLOCK_SAFETY_READINESS_VERSION,
    describe(input = {}) {
      const descriptors = input.descriptors ?? {};
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, descriptorCount(value)]));
      const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return Object.freeze({
        id: "meadow.flockSafetyRendererHandoff",
        kind: "renderer-handoff",
        contract: "renderer-consumes-serializable-descriptors-only",
        forbiddenOwnership: FORBIDDEN_OWNERSHIP,
        descriptorKeys: Object.keys(descriptors),
        counts: Object.freeze({ ...counts, total })
      });
    }
  });
}

export function createMeadowFlockSafetyReadinessDomainKit(_N = null, options = {}) {
  const lostLambCallKit = createMeadowLostLambCallKit(_N, options);
  const foxShadowBoundaryKit = createMeadowFoxShadowBoundaryKit(_N, options);
  const bellwetherLeadThreadKit = createMeadowBellwetherLeadThreadKit(_N, options);
  const vetCheckPulseKit = createMeadowVetCheckPulseKit(_N, options);
  const nightfallFoldGateKit = createMeadowNightfallFoldGateKit(_N, options);
  const cottageLanternReturnKit = createMeadowCottageLanternReturnKit(_N, options);
  const rendererHandoffKit = createMeadowFlockSafetyRendererHandoffKit(_N, options);

  return Object.freeze({
    id: "meadow-flock-safety-readiness-domain-kit",
    version: MEADOW_FLOCK_SAFETY_READINESS_VERSION,
    tree: MEADOW_FLOCK_SAFETY_READINESS_TREE,
    kits: Object.freeze({
      lostLambCallKit,
      foxShadowBoundaryKit,
      bellwetherLeadThreadKit,
      vetCheckPulseKit,
      nightfallFoldGateKit,
      cottageLanternReturnKit,
      rendererHandoffKit
    }),
    describe(input = {}) {
      const ctx = normalizeInput(input, options);
      const descriptors = Object.freeze({
        lostLambCalls: lostLambCallKit.describe(ctx),
        foxShadowBoundaries: foxShadowBoundaryKit.describe(ctx),
        bellwetherLeadThreads: bellwetherLeadThreadKit.describe(ctx),
        vetCheckPulses: vetCheckPulseKit.describe(ctx),
        nightfallFoldGates: nightfallFoldGateKit.describe(ctx),
        cottageLanternReturns: cottageLanternReturnKit.describe(ctx)
      });
      const rendererHandoff = rendererHandoffKit.describe({ descriptors });
      return Object.freeze({
        id: "meadow.flockSafetyReadiness",
        version: MEADOW_FLOCK_SAFETY_READINESS_VERSION,
        domain: "high-fidelity-meadow-flock-safety-readiness-domain",
        tree: MEADOW_FLOCK_SAFETY_READINESS_TREE,
        descriptors,
        rendererHandoff,
        descriptorCounts: rendererHandoff.counts,
        summary: Object.freeze({
          lostLambCalls: rendererHandoff.counts.lostLambCalls ?? 0,
          foxShadowBoundaries: rendererHandoff.counts.foxShadowBoundaries ?? 0,
          safetyDescriptorCount: rendererHandoff.counts.total ?? 0
        }),
        lesson: "Flock safety readiness turns the passive meadow into a light shepherding micro-loop by exposing strays, predator edges, bellwether guidance, vet checks, nightfall gates, and lantern returns as renderer-neutral descriptors."
      });
    }
  });
}
