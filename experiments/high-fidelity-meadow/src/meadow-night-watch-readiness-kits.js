export const MEADOW_NIGHT_WATCH_READINESS_VERSION = "2026.07.08.night-watch-1";

export const MEADOW_NIGHT_WATCH_READINESS_TREE = `
meadow-night-watch-readiness-domain
├─ dusk-patrol-domain
│  ├─ lantern-chain-domain
│  │  └─ meadow-lantern-patrol-chain-kit
│  └─ fox-pressure-domain
│     └─ meadow-fox-pressure-perimeter-kit
├─ flock-shelter-domain
│  ├─ lamb-shelter-domain
│  │  └─ meadow-lamb-shelter-pocket-kit
│  └─ gate-latch-domain
│     └─ meadow-gate-latch-checkpoint-kit
├─ dawn-recovery-domain
│  ├─ dew-pond-domain
│  │  └─ meadow-dew-pond-moon-reflection-kit
│  └─ dawn-rollcall-domain
│     └─ meadow-dawn-rollcall-ledger-kit
└─ renderer-handoff
   └─ meadow-night-watch-renderer-handoff-kit
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

function hashNumber(seed = "meadow-night-watch", index = 0) {
  let h = 2166136261;
  const text = `${seed}:${index}`;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function normalizeSheep(sheep) {
  if (Array.isArray(sheep)) return sheep;
  if (Array.isArray(sheep?.sheep)) return sheep.sheep;
  if (Array.isArray(sheep?.flock)) return sheep.flock;
  return [];
}

function normalizeFlowers(flowers) {
  if (Array.isArray(flowers)) return flowers;
  if (Array.isArray(flowers?.flowers)) return flowers.flowers;
  return [];
}

function positionFromEntity(entity = {}, fallback = {}) {
  const t = entity.transform ?? entity.position ?? entity;
  return {
    x: Number.isFinite(t.x) ? t.x : fallback.x ?? 0,
    z: Number.isFinite(t.z) ? t.z : fallback.z ?? 0
  };
}

function pointAt(input, x, z, lift = 0.1) {
  const heightAt = typeof input.heightAt === "function" ? input.heightAt : null;
  const y = heightAt ? heightAt(x, z) + lift : lift;
  return Object.freeze({ x: Number(x.toFixed(3)), y: Number(y.toFixed(3)), z: Number(z.toFixed(3)) });
}

function radialPoint(input, index, count, radiusScale = 0.3, lift = 0.1) {
  const width = Number.isFinite(input.width) ? input.width : 190;
  const depth = Number.isFinite(input.depth) ? input.depth : 184;
  const angle = Math.PI * 2 * ((index / Math.max(1, count)) + hashNumber(input.seed, index + 17) * 0.06);
  const radius = Math.min(width, depth) * radiusScale * (0.78 + hashNumber(input.seed, index + 39) * 0.18);
  return pointAt(input, Math.cos(angle) * radius, Math.sin(angle) * radius, lift);
}

function pathScore(input, point) {
  return clamp01(typeof input.pathMask === "function" ? input.pathMask(point.x, point.z) : 0.34);
}

function yardScore(input, point) {
  return clamp01(typeof input.yardMask === "function" ? input.yardMask(point.x, point.z) : 0.3);
}

function sheepPoint(input, index, lift = 0.12) {
  const sheep = normalizeSheep(input.sheep);
  if (!sheep.length) return radialPoint(input, index, 8, 0.24, lift);
  const entity = sheep[(index * 5) % sheep.length];
  const fallback = radialPoint(input, index, 8, 0.24, lift);
  const pos = positionFromEntity(entity, fallback);
  const offset = (hashNumber(input.seed, index + 101) - 0.5) * 4;
  return pointAt(input, pos.x + offset, pos.z - offset * 0.6, lift);
}

function phaseNightFactor(input = {}) {
  const phase = String(input.phase ?? input.cycle?.time?.phase ?? "golden hour").toLowerCase();
  const textual = phase.includes("night") || phase.includes("dusk") || phase.includes("blue") || phase.includes("moon") ? 0.45 : 0.12;
  const dayAmount = clamp01(input.dayAmount ?? input.cycle?.light?.dayAmount ?? 0.65);
  return clamp01(textual + (1 - dayAmount) * 0.44);
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

export function createMeadowLanternPatrolChainKit(_runtime = null, defaults = {}) {
  return Object.freeze({
    id: "meadow-lantern-patrol-chain-kit",
    version: MEADOW_NIGHT_WATCH_READINESS_VERSION,
    describe(input = {}) {
      const scope = { ...defaults, ...input };
      const night = phaseNightFactor(scope);
      const lanterns = Array.from({ length: 8 }, (_, index) => {
        const position = radialPoint(scope, index, 8, 0.16 + index * 0.012, 0.46);
        const coverage = clamp01(0.38 + pathScore(scope, position) * 0.34 + night * 0.2 + hashNumber(scope.seed, index + 3) * 0.14);
        return Object.freeze({
          id: `meadow.nightWatch.lantern.${index}`,
          kind: "lantern-patrol-chain-node",
          position,
          coverage: Number(coverage.toFixed(3)),
          lightRadius: Number((3.2 + coverage * 4.4).toFixed(2)),
          rendererHint: "warm-lantern-patrol-halo"
        });
      });
      return freezeResult({ id: "meadow.nightWatch.lanternPatrol", lanterns });
    }
  });
}

export function createMeadowFoxPressurePerimeterKit(_runtime = null, defaults = {}) {
  return Object.freeze({
    id: "meadow-fox-pressure-perimeter-kit",
    version: MEADOW_NIGHT_WATCH_READINESS_VERSION,
    describe(input = {}) {
      const scope = { ...defaults, ...input };
      const night = phaseNightFactor(scope);
      const sheepPressure = normalizeSheep(scope.sheep).length / 28;
      const tracks = Array.from({ length: 6 }, (_, index) => {
        const position = radialPoint(scope, index, 6, 0.39, 0.08);
        const pressure = clamp01(0.18 + night * 0.38 + sheepPressure * 0.16 + (1 - yardScore(scope, position)) * 0.12 + hashNumber(scope.seed, index + 21) * 0.18);
        return Object.freeze({
          id: `meadow.nightWatch.foxPressure.${index}`,
          kind: "fox-pressure-perimeter-track",
          position,
          pressure: Number(pressure.toFixed(3)),
          bufferRadius: Number((4.6 + pressure * 5.2).toFixed(2)),
          rendererHint: "copper-fox-track-warning-ring"
        });
      });
      return freezeResult({ id: "meadow.nightWatch.foxPressure", tracks });
    }
  });
}

export function createMeadowLambShelterPocketKit(_runtime = null, defaults = {}) {
  return Object.freeze({
    id: "meadow-lamb-shelter-pocket-kit",
    version: MEADOW_NIGHT_WATCH_READINESS_VERSION,
    describe(input = {}) {
      const scope = { ...defaults, ...input };
      const night = phaseNightFactor(scope);
      const pockets = Array.from({ length: 7 }, (_, index) => {
        const position = sheepPoint(scope, index, 0.18);
        const warmth = clamp01(0.42 + yardScore(scope, position) * 0.24 + (1 - night) * 0.08 + hashNumber(scope.seed, index + 42) * 0.2);
        return Object.freeze({
          id: `meadow.nightWatch.lambShelter.${index}`,
          kind: "lamb-shelter-pocket",
          position,
          warmth: Number(warmth.toFixed(3)),
          blanketStacks: 1 + Math.round(warmth * 4),
          rendererHint: "soft-straw-shelter-pool"
        });
      });
      return freezeResult({ id: "meadow.nightWatch.lambShelters", pockets });
    }
  });
}

export function createMeadowGateLatchCheckpointKit(_runtime = null, defaults = {}) {
  return Object.freeze({
    id: "meadow-gate-latch-checkpoint-kit",
    version: MEADOW_NIGHT_WATCH_READINESS_VERSION,
    describe(input = {}) {
      const scope = { ...defaults, ...input };
      const checkpoints = Array.from({ length: 5 }, (_, index) => {
        const position = radialPoint(scope, index, 5, 0.31, 0.22);
        const latchRisk = clamp01(pathScore(scope, position) * 0.38 + hashNumber(scope.seed, index + 66) * 0.34 + phaseNightFactor(scope) * 0.16);
        return Object.freeze({
          id: `meadow.nightWatch.gateLatch.${index}`,
          kind: "gate-latch-checkpoint",
          position,
          latchRisk: Number(latchRisk.toFixed(3)),
          repairPins: 1 + Math.round(latchRisk * 5),
          rendererHint: "white-gate-latch-check"
        });
      });
      return freezeResult({ id: "meadow.nightWatch.gateLatches", checkpoints });
    }
  });
}

export function createMeadowDewPondMoonReflectionKit(_runtime = null, defaults = {}) {
  return Object.freeze({
    id: "meadow-dew-pond-moon-reflection-kit",
    version: MEADOW_NIGHT_WATCH_READINESS_VERSION,
    describe(input = {}) {
      const scope = { ...defaults, ...input };
      const night = phaseNightFactor(scope);
      const dampness = clamp01(0.22 + (1 - clamp01(scope.dayAmount ?? 0.58)) * 0.34 + night * 0.22 + Math.abs(Math.sin(Number(scope.windSeed ?? 0))) * 0.12);
      const ponds = Array.from({ length: 6 }, (_, index) => {
        const position = radialPoint(scope, index, 6, 0.27, 0.045);
        const reflection = clamp01(dampness + hashNumber(scope.seed, index + 88) * 0.18);
        return Object.freeze({
          id: `meadow.nightWatch.dewPond.${index}`,
          kind: "dew-pond-moon-reflection",
          position,
          reflection: Number(reflection.toFixed(3)),
          rimPebbles: 4 + Math.round(reflection * 9),
          rendererHint: "silver-dew-pond-glint"
        });
      });
      return freezeResult({ id: "meadow.nightWatch.dewPonds", ponds });
    }
  });
}

export function createMeadowDawnRollcallLedgerKit(_runtime = null, defaults = {}) {
  return Object.freeze({
    id: "meadow-dawn-rollcall-ledger-kit",
    version: MEADOW_NIGHT_WATCH_READINESS_VERSION,
    describe(input = {}) {
      const scope = { ...defaults, ...input };
      const flowers = normalizeFlowers(scope.flowers);
      const sheep = normalizeSheep(scope.sheep);
      const entries = Array.from({ length: 6 }, (_, index) => {
        const position = radialPoint(scope, index, 6, 0.1 + index * 0.024, 0.32);
        const urgency = clamp01(0.24 + sheep.length / 70 + flowers.length / 2400 + phaseNightFactor(scope) * 0.24 + hashNumber(scope.seed, index + 117) * 0.16);
        return Object.freeze({
          id: `meadow.nightWatch.rollcall.${index}`,
          kind: "dawn-rollcall-ledger-entry",
          position,
          urgency: Number(urgency.toFixed(3)),
          missingCheckmarks: Math.max(0, Math.round(urgency * 5) - 1),
          rendererHint: "dawn-ledger-parchment-chip"
        });
      });
      return freezeResult({ id: "meadow.nightWatch.dawnRollcall", entries });
    }
  });
}

export function createMeadowNightWatchRendererHandoffKit() {
  return Object.freeze({
    id: "meadow-night-watch-renderer-handoff-kit",
    version: MEADOW_NIGHT_WATCH_READINESS_VERSION,
    describe({ descriptors = {} } = {}) {
      const counts = Object.freeze({
        lanternPatrolNodes: descriptors.lanternPatrol?.lanterns?.length ?? 0,
        foxPressureTracks: descriptors.foxPressure?.tracks?.length ?? 0,
        lambShelterPockets: descriptors.lambShelters?.pockets?.length ?? 0,
        gateLatchCheckpoints: descriptors.gateLatches?.checkpoints?.length ?? 0,
        dewPondReflections: descriptors.dewPonds?.ponds?.length ?? 0,
        dawnRollcallEntries: descriptors.dawnRollcall?.entries?.length ?? 0,
        total: descriptorCount(descriptors)
      });
      return freezeResult({
        id: "meadow.nightWatch.rendererHandoff",
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

export function createMeadowNightWatchReadinessDomainKit(runtime = null, defaults = {}) {
  const lanternPatrolKit = createMeadowLanternPatrolChainKit(runtime, defaults);
  const foxPressureKit = createMeadowFoxPressurePerimeterKit(runtime, defaults);
  const lambShelterKit = createMeadowLambShelterPocketKit(runtime, defaults);
  const gateLatchKit = createMeadowGateLatchCheckpointKit(runtime, defaults);
  const dewPondKit = createMeadowDewPondMoonReflectionKit(runtime, defaults);
  const dawnRollcallKit = createMeadowDawnRollcallLedgerKit(runtime, defaults);
  const handoffKit = createMeadowNightWatchRendererHandoffKit(runtime, defaults);
  return Object.freeze({
    id: "meadow-night-watch-readiness-domain-kit",
    version: MEADOW_NIGHT_WATCH_READINESS_VERSION,
    tree: MEADOW_NIGHT_WATCH_READINESS_TREE,
    describe(input = {}) {
      const descriptors = Object.freeze({
        lanternPatrol: lanternPatrolKit.describe(input),
        foxPressure: foxPressureKit.describe(input),
        lambShelters: lambShelterKit.describe(input),
        gateLatches: gateLatchKit.describe(input),
        dewPonds: dewPondKit.describe(input),
        dawnRollcall: dawnRollcallKit.describe(input)
      });
      const rendererHandoff = handoffKit.describe({ descriptors });
      return freezeResult({
        id: "meadow.nightWatch.readiness",
        domain: "meadow-night-watch-readiness-domain",
        version: MEADOW_NIGHT_WATCH_READINESS_VERSION,
        tree: MEADOW_NIGHT_WATCH_READINESS_TREE,
        descriptors,
        descriptorCounts: rendererHandoff.counts,
        rendererHandoff
      });
    }
  });
}
