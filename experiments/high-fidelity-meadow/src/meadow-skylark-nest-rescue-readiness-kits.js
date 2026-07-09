const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value, min)));
const average = (items = [], fn = (item) => item) => items.reduce((sum, item) => sum + n(fn(item)), 0) / Math.max(1, items.length);

export const MEADOW_SKYLARK_NEST_RESCUE_TREE = `
meadow-skylark-nest-rescue-readiness-domain
├─ brood-location-domain
│  ├─ skylark-nest-domain
│  │  └─ meadow-skylark-nest-cup-kit
│  └─ dew-path-domain
│     └─ meadow-dew-path-bead-kit
├─ predator-buffer-domain
│  ├─ fox-scent-domain
│  │  └─ meadow-fox-scent-ribbon-kit
│  └─ shepherd-bell-domain
│     └─ meadow-shepherd-bell-post-kit
├─ fledgling-handoff-domain
│  ├─ seed-cache-domain
│  │  └─ meadow-fledgling-seed-cache-kit
│  └─ dawn-brood-ledger-domain
│     └─ meadow-dawn-brood-ledger-kit
└─ renderer-handoff
   └─ meadow-skylark-nest-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;

const CONTRACT = "renderer consumes descriptors only; brood location, predator buffer, fledgling handoff, DOM, browser input, Three.js, WebGL, audio, asset loading, frame-loop, storage, network, and physics ownership stay outside reusable kit logic";

function seedText(state = {}) {
  return String(state.seed ?? state.build ?? state.levelId ?? "high-fidelity-meadow-skylark");
}

function hash(seed, salt = 0) {
  let value = 2166136261 ^ salt;
  for (let index = 0; index < seed.length; index += 1) {
    value ^= seed.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return (value >>> 0) / 4294967295;
}

function meadowRadius(state = {}) {
  return Math.max(48, n(state.meadowRadius, n(state.sceneDescriptor?.terrain?.radius, 92)));
}

function point(seed, index, radius, ring = 0.62) {
  const a = hash(seed, index * 31 + 7) * Math.PI * 2;
  const r = radius * (0.18 + hash(seed, index * 47 + 13) * ring);
  return { x: Math.cos(a) * r, z: Math.sin(a) * r };
}

function ecologyPressure(state = {}) {
  const sheep = n(state.sheep, n(state.sceneDescriptor?.sheep?.count, 14));
  const grassBlades = n(state.grassBlades, n(state.sceneDescriptor?.grass?.bladeCount, 16000));
  const vfx = n(state.vfxParticles, n(state.sceneDescriptor?.vfx?.particles?.length, 900));
  const hour = n(state.hour, n(state.timeOfDay, 5.2));
  const trampling = clamp((sheep - 8) / 24);
  const cover = 1 - clamp((grassBlades - 6000) / 22000);
  const insectNoise = 1 - clamp(vfx / 1800);
  const dusk = Math.abs(hour - 5.4) < 2 ? 0.08 : 0.18;
  return clamp(trampling * 0.34 + cover * 0.28 + insectNoise * 0.18 + dusk);
}

function rescueProgress(state = {}) {
  if (Number.isFinite(Number(state.skylarkRescue?.progress))) return clamp(state.skylarkRescue.progress);
  if (Number.isFinite(Number(state.rescueProgress))) return clamp(state.rescueProgress);
  const checks = n(state.skylarkRescue?.nestChecks, 0) + n(state.skylarkRescue?.bellPosts, 0) + n(state.skylarkRescue?.seedCaches, 0);
  return clamp(checks / 18);
}

export function createSkylarkNestCupKit(options = {}) {
  return {
    id: options.id ?? "meadow-skylark-nest-cup-kit",
    describe(state = {}) {
      const seed = seedText(state);
      const radius = meadowRadius(state);
      const pressure = ecologyPressure(state);
      return Array.from({ length: 6 }, (_, index) => {
        const p = point(seed, index, radius, 0.52);
        const cover = clamp(0.42 + hash(seed, index + 101) * 0.28 + rescueProgress(state) * 0.2 - pressure * 0.16);
        return {
          id: `${seed}:skylark-nest:${index}`,
          kind: "meadow-skylark-nest-cup",
          order: index,
          position: { x: p.x, z: p.z, y: 0.08 },
          cover,
          eggs: Math.max(1, Math.round(1 + cover * 4)),
          nestState: cover > 0.74 ? "hidden-in-tussock" : cover > 0.48 ? "mark-softly" : "exposed-to-trampling",
          rendererContract: CONTRACT
        };
      });
    }
  };
}

export function createDewPathBeadKit(options = {}) {
  return {
    id: options.id ?? "meadow-dew-path-bead-kit",
    describe(state = {}, graph = {}) {
      const nests = graph.skylarkNestCups ?? [];
      const progress = rescueProgress(state);
      return nests.flatMap((nest, nestIndex) => Array.from({ length: 3 }, (_, beadIndex) => {
        const offset = (beadIndex + 1) * 2.8;
        const clarity = clamp(n(nest.cover, 0.45) * 0.38 + progress * 0.34 + 0.2 - ecologyPressure(state) * 0.18);
        return {
          id: `${nest.id}:dew-bead:${beadIndex}`,
          kind: "meadow-dew-path-bead",
          nestId: nest.id,
          order: nestIndex * 3 + beadIndex,
          position: { x: n(nest.position?.x) + offset, z: n(nest.position?.z) - offset * 0.55, y: 0.06 },
          clarity,
          beadRadius: 0.12 + clarity * 0.18,
          beadState: clarity > 0.72 ? "path-glinting" : clarity > 0.46 ? "needs-morning-light" : "lost-in-grass",
          rendererContract: CONTRACT
        };
      }));
    }
  };
}

export function createFoxScentRibbonKit(options = {}) {
  return {
    id: options.id ?? "meadow-fox-scent-ribbon-kit",
    describe(state = {}, graph = {}) {
      const seed = seedText(state);
      const radius = meadowRadius(state);
      const nests = graph.skylarkNestCups ?? [];
      return Array.from({ length: 5 }, (_, index) => {
        const p = point(seed, index + 30, radius, 0.7);
        const nearestNest = nests.reduce((best, nest) => {
          const d = Math.hypot(n(nest.position?.x) - p.x, n(nest.position?.z) - p.z);
          return d < best.distance ? { nest, distance: d } : best;
        }, { nest: nests[0], distance: Infinity });
        const risk = clamp(0.26 + ecologyPressure(state) * 0.35 + (1 - rescueProgress(state)) * 0.2 - nearestNest.distance / 220);
        return {
          id: `${seed}:fox-scent-ribbon:${index}`,
          kind: "meadow-fox-scent-ribbon",
          order: index,
          nearestNestId: nearestNest.nest?.id,
          position: { x: p.x, z: p.z, y: 0.12 },
          risk,
          ribbonLength: Math.round(4 + risk * 18),
          ribbonState: risk > 0.66 ? "active-fox-line" : risk > 0.4 ? "watch-hedgerow" : "scent-fading",
          rendererContract: CONTRACT
        };
      });
    }
  };
}

export function createShepherdBellPostKit(options = {}) {
  return {
    id: options.id ?? "meadow-shepherd-bell-post-kit",
    describe(state = {}, graph = {}) {
      const seed = seedText(state);
      const pressure = ecologyPressure(state);
      const foxRisk = average(graph.foxScentRibbons, (ribbon) => ribbon.risk);
      return Array.from({ length: 4 }, (_, index) => {
        const p = point(seed, index + 60, meadowRadius(state), 0.48);
        const coverage = clamp(0.45 + rescueProgress(state) * 0.26 + (1 - foxRisk) * 0.22 - pressure * 0.12 + hash(seed, index + 300) * 0.12);
        return {
          id: `${seed}:shepherd-bell-post:${index}`,
          kind: "meadow-shepherd-bell-post",
          order: index,
          position: { x: p.x, z: p.z, y: 1.25 },
          coverage,
          bellCount: Math.max(1, Math.round(1 + coverage * 5)),
          bellState: coverage > 0.72 ? "flock-diverted" : coverage > 0.48 ? "retie-bell-cord" : "silent-post",
          rendererContract: CONTRACT
        };
      });
    }
  };
}

export function createFledglingSeedCacheKit(options = {}) {
  return {
    id: options.id ?? "meadow-fledgling-seed-cache-kit",
    describe(state = {}, graph = {}) {
      const nests = graph.skylarkNestCups ?? [];
      const bellCoverage = average(graph.shepherdBellPosts, (post) => post.coverage);
      return nests.slice(0, 5).map((nest, index) => {
        const supply = clamp(0.36 + n(nest.cover) * 0.2 + bellCoverage * 0.2 + rescueProgress(state) * 0.24 - ecologyPressure(state) * 0.14);
        return {
          id: `${nest.id}:seed-cache`,
          kind: "meadow-fledgling-seed-cache",
          nestId: nest.id,
          order: index,
          position: { x: n(nest.position?.x) - 3.2, z: n(nest.position?.z) + 2.4, y: 0.1 },
          supply,
          seedScoops: Math.max(1, Math.round(1 + supply * 6)),
          cacheState: supply > 0.74 ? "fledgling-fed" : supply > 0.48 ? "top-up-millet" : "cache-empty",
          rendererContract: CONTRACT
        };
      });
    }
  };
}

export function createDawnBroodLedgerKit(options = {}) {
  return {
    id: options.id ?? "meadow-dawn-brood-ledger-kit",
    describe(state = {}, graph = {}) {
      const readiness = clamp(
        average(graph.skylarkNestCups, (nest) => nest.cover) * 0.2 +
        average(graph.dewPathBeads, (bead) => bead.clarity) * 0.16 +
        (1 - average(graph.foxScentRibbons, (ribbon) => ribbon.risk)) * 0.2 +
        average(graph.shepherdBellPosts, (post) => post.coverage) * 0.2 +
        average(graph.fledglingSeedCaches, (cache) => cache.supply) * 0.18 +
        rescueProgress(state) * 0.06
      );
      const pressure = ecologyPressure(state);
      return [{
        id: `${seedText(state)}:dawn-brood-ledger`,
        kind: "meadow-dawn-brood-ledger",
        readiness,
        ecologyPressure: pressure,
        phase: readiness > 0.82 ? "open-meadow-after-fledging" : readiness > 0.62 ? "hold-fox-buffer" : readiness > 0.42 ? "mark-dew-paths" : "find-ground-nests",
        protectedNests: Math.max(0, Math.round(readiness * 6 - pressure * 2)),
        rendererContract: CONTRACT
      }];
    }
  };
}

export function createSkylarkNestRescueRendererHandoffKit(options = {}) {
  return {
    id: options.id ?? "meadow-skylark-nest-rescue-renderer-handoff-kit",
    describe(graph = {}) {
      const descriptors = [
        ...(graph.skylarkNestCups ?? []),
        ...(graph.dewPathBeads ?? []),
        ...(graph.foxScentRibbons ?? []),
        ...(graph.shepherdBellPosts ?? []),
        ...(graph.fledglingSeedCaches ?? []),
        ...(graph.dawnBroodLedgers ?? [])
      ];
      return {
        id: "meadow-skylark-nest-rescue-readiness-renderer-handoff",
        kind: "renderer-handoff",
        descriptorCount: descriptors.length,
        descriptors,
        rendererContract: CONTRACT,
        counts: {
          skylarkNestCups: graph.skylarkNestCups?.length ?? 0,
          dewPathBeads: graph.dewPathBeads?.length ?? 0,
          foxScentRibbons: graph.foxScentRibbons?.length ?? 0,
          shepherdBellPosts: graph.shepherdBellPosts?.length ?? 0,
          fledglingSeedCaches: graph.fledglingSeedCaches?.length ?? 0,
          dawnBroodLedgers: graph.dawnBroodLedgers?.length ?? 0,
          total: descriptors.length
        }
      };
    }
  };
}

export function createMeadowSkylarkNestRescueReadinessDomainKit(options = {}) {
  const nests = options.skylarkNestCupKit ?? createSkylarkNestCupKit(options.skylarkNestCup ?? {});
  const dew = options.dewPathBeadKit ?? createDewPathBeadKit(options.dewPathBead ?? {});
  const fox = options.foxScentRibbonKit ?? createFoxScentRibbonKit(options.foxScentRibbon ?? {});
  const bells = options.shepherdBellPostKit ?? createShepherdBellPostKit(options.shepherdBellPost ?? {});
  const seeds = options.fledglingSeedCacheKit ?? createFledglingSeedCacheKit(options.fledglingSeedCache ?? {});
  const ledger = options.dawnBroodLedgerKit ?? createDawnBroodLedgerKit(options.dawnBroodLedger ?? {});
  const handoff = options.rendererHandoffKit ?? createSkylarkNestRescueRendererHandoffKit(options.rendererHandoff ?? {});

  return {
    id: options.id ?? "meadow-skylark-nest-rescue-readiness-domain-kit",
    tree: MEADOW_SKYLARK_NEST_RESCUE_TREE,
    kits: [nests.id, dew.id, fox.id, bells.id, seeds.id, ledger.id, handoff.id],
    ownership: {
      renderer: false,
      dom: false,
      browserInput: false,
      three: false,
      webgl: false,
      audio: false,
      assetLoading: false,
      frameLoop: false,
      storage: false,
      network: false,
      physics: false
    },
    describe(state = {}) {
      const skylarkNestCups = nests.describe(state);
      const dewPathBeads = dew.describe(state, { skylarkNestCups });
      const foxScentRibbons = fox.describe(state, { skylarkNestCups });
      const shepherdBellPosts = bells.describe(state, { foxScentRibbons });
      const fledglingSeedCaches = seeds.describe(state, { skylarkNestCups, shepherdBellPosts });
      const dawnBroodLedgers = ledger.describe(state, { skylarkNestCups, dewPathBeads, foxScentRibbons, shepherdBellPosts, fledglingSeedCaches });
      const groups = { skylarkNestCups, dewPathBeads, foxScentRibbons, shepherdBellPosts, fledglingSeedCaches, dawnBroodLedgers };
      const primary = dawnBroodLedgers[0] ?? { readiness: 0, ecologyPressure: ecologyPressure(state), phase: "find-ground-nests" };
      return {
        id: "meadow-skylark-nest-rescue-readiness",
        kind: "domain-readiness",
        tree: MEADOW_SKYLARK_NEST_RESCUE_TREE,
        rendererContract: CONTRACT,
        ...groups,
        rendererHandoff: handoff.describe(groups),
        summary: {
          readiness: primary.readiness,
          ecologyPressure: primary.ecologyPressure,
          phase: primary.phase,
          protectedNests: primary.protectedNests ?? 0,
          broodMarkers: skylarkNestCups.length + dewPathBeads.length,
          predatorBuffers: foxScentRibbons.length + shepherdBellPosts.length
        }
      };
    }
  };
}

export default createMeadowSkylarkNestRescueReadinessDomainKit;
