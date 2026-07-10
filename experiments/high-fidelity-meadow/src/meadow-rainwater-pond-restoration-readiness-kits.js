const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value, min)));
const average = (items = [], fn = (item) => item) => items.reduce((sum, item) => sum + n(fn(item)), 0) / Math.max(1, items.length);

export const MEADOW_RAINWATER_POND_RESTORATION_TREE = `
meadow-rainwater-pond-restoration-readiness-domain
├─ water-catchment-domain
│  ├─ rain-chain-basin-domain
│  │  └─ meadow-rain-chain-basin-kit
│  └─ pond-mirror-pool-domain
│     └─ meadow-pond-mirror-pool-kit
├─ amphibian-habitat-domain
│  ├─ frog-call-stone-domain
│  │  └─ meadow-frog-call-stone-kit
│  └─ reed-filter-domain
│     └─ silt-sieve-subdomain
│        └─ meadow-reed-filter-bed-kit
├─ visitor-crossing-domain
│  ├─ stepping-log-domain
│  │  └─ meadow-stepping-log-route-kit
│  └─ dusk-pond-ledger-domain
│     └─ meadow-dusk-pond-ledger-kit
└─ renderer-handoff
   └─ meadow-rainwater-pond-restoration-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;

export const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

const CONTRACT = "renderer consumes descriptors only; water catchment, amphibian habitat, visitor crossing, DOM, browser input, Three.js, WebGL, audio, asset loading, storage, network, physics, and frame-loop ownership stay outside reusable pond restoration kit logic";

function seedText(state = {}) {
  return String(state.seed ?? state.build ?? state.levelId ?? "high-fidelity-meadow-rainwater-pond");
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
  return Math.max(54, n(state.meadowRadius, n(state.sceneDescriptor?.terrain?.radius, 94)));
}

function point(seed, index, radius, ring = 0.58) {
  const angle = hash(seed, index * 41 + 17) * Math.PI * 2;
  const distance = radius * (0.14 + hash(seed, index * 67 + 29) * ring);
  return { x: Math.cos(angle) * distance, z: Math.sin(angle) * distance };
}

export function normalizeRainwaterPondRestorationInput(state = {}) {
  const restoration = state.pondRestoration ?? state.rainwaterPondRestoration ?? {};
  const rainfall = clamp(n(restoration.rainfall, n(state.rainfall, 0.42)));
  const frogCalls = Math.max(0, Math.round(n(restoration.frogCalls, n(state.frogCalls, 0))));
  const reedFilters = Math.max(0, Math.round(n(restoration.reedFilters, n(state.reedFilters, 0))));
  const steppingLogs = Math.max(0, Math.round(n(restoration.steppingLogs, n(state.steppingLogs, 0))));
  const progress = Number.isFinite(Number(restoration.progress)) ? clamp(restoration.progress) : clamp((frogCalls + reedFilters + steppingLogs) / 21);
  const sheep = n(state.sheep, n(state.sceneDescriptor?.sheep?.count, 12));
  const grassBlades = n(state.grassBlades, n(state.sceneDescriptor?.grass?.bladeCount, 18000));
  const insects = n(state.vfxParticles, n(state.sceneDescriptor?.vfx?.particles?.length, 980));
  const trampling = clamp((sheep - 8) / 26);
  const dryGrass = 1 - clamp((grassBlades - 7000) / 26000);
  const quietInsects = 1 - clamp(insects / 2200);
  const siltPressure = clamp(0.26 + trampling * 0.28 + dryGrass * 0.22 + quietInsects * 0.18 - rainfall * 0.12 - progress * 0.14);
  return { seed: seedText(state), radius: meadowRadius(state), rainfall, frogCalls, reedFilters, steppingLogs, progress, siltPressure };
}

export function createRainChainBasinKit(options = {}) {
  return {
    id: options.id ?? "meadow-rain-chain-basin-kit",
    describe(state = {}) {
      const input = normalizeRainwaterPondRestorationInput(state);
      return Array.from({ length: 5 }, (_, index) => {
        const p = point(input.seed, index + 11, input.radius, 0.36);
        const fill = clamp(0.28 + input.rainfall * 0.42 + input.progress * 0.2 + hash(input.seed, index + 100) * 0.14 - input.siltPressure * 0.16);
        return {
          id: `${input.seed}:rain-chain-basin:${index}`,
          kind: "meadow-rain-chain-basin",
          order: index,
          position: { x: p.x, y: 0.08, z: p.z },
          fill,
          basinState: fill > 0.72 ? "brimming-clear" : fill > 0.45 ? "catching-drizzle" : "dry-chain",
          rippleRings: Math.max(1, Math.round(1 + fill * 7)),
          rendererContract: CONTRACT
        };
      });
    }
  };
}

export function createPondMirrorPoolKit(options = {}) {
  return {
    id: options.id ?? "meadow-pond-mirror-pool-kit",
    describe(state = {}, graph = {}) {
      const input = normalizeRainwaterPondRestorationInput(state);
      const basinFill = average(graph.rainChainBasins, (basin) => basin.fill);
      return Array.from({ length: 4 }, (_, index) => {
        const p = point(input.seed, index + 41, input.radius, 0.42);
        const clarity = clamp(0.32 + basinFill * 0.34 + input.progress * 0.18 + input.rainfall * 0.16 - input.siltPressure * 0.22 + hash(input.seed, index + 170) * 0.08);
        return {
          id: `${input.seed}:pond-mirror-pool:${index}`,
          kind: "meadow-pond-mirror-pool",
          order: index,
          position: { x: p.x, y: 0.04, z: p.z },
          clarity,
          mirrorRadius: 3.2 + clarity * 5.4,
          poolState: clarity > 0.72 ? "sky-reflecting" : clarity > 0.46 ? "silt-settling" : "mud-clouded",
          rendererContract: CONTRACT
        };
      });
    }
  };
}

export function createFrogCallStoneKit(options = {}) {
  return {
    id: options.id ?? "meadow-frog-call-stone-kit",
    describe(state = {}, graph = {}) {
      const input = normalizeRainwaterPondRestorationInput(state);
      const clarity = average(graph.pondMirrorPools, (pool) => pool.clarity);
      return Array.from({ length: 6 }, (_, index) => {
        const pool = graph.pondMirrorPools?.[index % Math.max(1, graph.pondMirrorPools.length)] ?? { position: point(input.seed, index + 80, input.radius) };
        const callStrength = clamp(0.22 + clarity * 0.34 + input.progress * 0.26 + input.frogCalls / 18 - input.siltPressure * 0.18 + hash(input.seed, index + 260) * 0.08);
        return {
          id: `${input.seed}:frog-call-stone:${index}`,
          kind: "meadow-frog-call-stone",
          order: index,
          poolId: pool.id,
          position: { x: n(pool.position?.x) + 3.8 - index * 0.7, y: 0.22, z: n(pool.position?.z) + 2.1 + index * 0.4 },
          callStrength,
          stoneState: callStrength > 0.72 ? "chorus-returning" : callStrength > 0.46 ? "single-call" : "silent-stone",
          echoPips: Math.max(1, Math.round(1 + callStrength * 6)),
          rendererContract: CONTRACT
        };
      });
    }
  };
}

export function createReedFilterBedKit(options = {}) {
  return {
    id: options.id ?? "meadow-reed-filter-bed-kit",
    describe(state = {}, graph = {}) {
      const input = normalizeRainwaterPondRestorationInput(state);
      const basinFill = average(graph.rainChainBasins, (basin) => basin.fill);
      return Array.from({ length: 5 }, (_, index) => {
        const p = point(input.seed, index + 90, input.radius, 0.48);
        const filtration = clamp(0.28 + basinFill * 0.22 + input.reedFilters / 12 + input.progress * 0.18 - input.siltPressure * 0.24 + hash(input.seed, index + 360) * 0.1);
        return {
          id: `${input.seed}:reed-filter-bed:${index}`,
          kind: "meadow-reed-filter-bed",
          order: index,
          position: { x: p.x, y: 0.16, z: p.z },
          filtration,
          reedCount: Math.max(3, Math.round(4 + filtration * 18)),
          siltSieveState: filtration > 0.72 ? "water-polished" : filtration > 0.48 ? "needs-weaving" : "silt-blocked",
          rendererContract: CONTRACT
        };
      });
    }
  };
}

export function createSteppingLogRouteKit(options = {}) {
  return {
    id: options.id ?? "meadow-stepping-log-route-kit",
    describe(state = {}, graph = {}) {
      const input = normalizeRainwaterPondRestorationInput(state);
      const filters = average(graph.reedFilterBeds, (bed) => bed.filtration);
      return Array.from({ length: 7 }, (_, index) => {
        const angle = index / 7 * Math.PI * 2 + hash(input.seed, 510) * 0.4;
        const distance = input.radius * (0.22 + index * 0.036);
        const stability = clamp(0.34 + filters * 0.2 + input.steppingLogs / 14 + input.progress * 0.2 - input.siltPressure * 0.16 + hash(input.seed, index + 520) * 0.08);
        return {
          id: `${input.seed}:stepping-log:${index}`,
          kind: "meadow-stepping-log-route",
          order: index,
          position: { x: Math.cos(angle) * distance, y: 0.2, z: Math.sin(angle) * distance },
          stability,
          logState: stability > 0.74 ? "safe-crossing" : stability > 0.5 ? "lash-log" : "slippery-bank",
          plankMoss: clamp(1 - stability + input.rainfall * 0.2),
          rendererContract: CONTRACT
        };
      });
    }
  };
}

export function createDuskPondLedgerKit(options = {}) {
  return {
    id: options.id ?? "meadow-dusk-pond-ledger-kit",
    describe(state = {}, graph = {}) {
      const input = normalizeRainwaterPondRestorationInput(state);
      const readiness = clamp(
        average(graph.rainChainBasins, (basin) => basin.fill) * 0.18 +
        average(graph.pondMirrorPools, (pool) => pool.clarity) * 0.2 +
        average(graph.frogCallStones, (stone) => stone.callStrength) * 0.17 +
        average(graph.reedFilterBeds, (bed) => bed.filtration) * 0.2 +
        average(graph.steppingLogRoutes, (log) => log.stability) * 0.17 +
        input.progress * 0.08
      );
      return [{
        id: `${input.seed}:dusk-pond-ledger`,
        kind: "meadow-dusk-pond-ledger",
        readiness,
        siltPressure: input.siltPressure,
        phase: readiness > 0.82 ? "release-evening-fireflies" : readiness > 0.62 ? "listen-for-frog-chorus" : readiness > 0.42 ? "weave-reed-filters" : "catch-first-rain",
        clearPools: Math.max(0, Math.round(readiness * 4 - input.siltPressure)),
        rendererContract: CONTRACT
      }];
    }
  };
}

export function createRainwaterPondRestorationRendererHandoffKit(options = {}) {
  return {
    id: options.id ?? "meadow-rainwater-pond-restoration-renderer-handoff-kit",
    describe(graph = {}) {
      const descriptors = [
        ...(graph.rainChainBasins ?? []),
        ...(graph.pondMirrorPools ?? []),
        ...(graph.frogCallStones ?? []),
        ...(graph.reedFilterBeds ?? []),
        ...(graph.steppingLogRoutes ?? []),
        ...(graph.duskPondLedgers ?? [])
      ];
      return {
        id: "meadow-rainwater-pond-restoration-readiness-renderer-handoff",
        kind: "renderer-handoff",
        descriptorCount: descriptors.length,
        descriptors,
        rendererContract: CONTRACT,
        counts: {
          rainChainBasins: graph.rainChainBasins?.length ?? 0,
          pondMirrorPools: graph.pondMirrorPools?.length ?? 0,
          frogCallStones: graph.frogCallStones?.length ?? 0,
          reedFilterBeds: graph.reedFilterBeds?.length ?? 0,
          steppingLogRoutes: graph.steppingLogRoutes?.length ?? 0,
          duskPondLedgers: graph.duskPondLedgers?.length ?? 0,
          total: descriptors.length
        }
      };
    }
  };
}

export function createMeadowRainwaterPondRestorationReadinessDomainKit(options = {}) {
  const basins = options.rainChainBasinKit ?? createRainChainBasinKit(options.rainChainBasin ?? {});
  const pools = options.pondMirrorPoolKit ?? createPondMirrorPoolKit(options.pondMirrorPool ?? {});
  const frogs = options.frogCallStoneKit ?? createFrogCallStoneKit(options.frogCallStone ?? {});
  const reeds = options.reedFilterBedKit ?? createReedFilterBedKit(options.reedFilterBed ?? {});
  const logs = options.steppingLogRouteKit ?? createSteppingLogRouteKit(options.steppingLogRoute ?? {});
  const ledger = options.duskPondLedgerKit ?? createDuskPondLedgerKit(options.duskPondLedger ?? {});
  const handoff = options.rendererHandoffKit ?? createRainwaterPondRestorationRendererHandoffKit(options.rendererHandoff ?? {});

  return {
    id: options.id ?? "meadow-rainwater-pond-restoration-readiness-domain-kit",
    tree: MEADOW_RAINWATER_POND_RESTORATION_TREE,
    kits: [basins.id, pools.id, frogs.id, reeds.id, logs.id, ledger.id, handoff.id],
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
      const rainChainBasins = basins.describe(state);
      const pondMirrorPools = pools.describe(state, { rainChainBasins });
      const frogCallStones = frogs.describe(state, { pondMirrorPools });
      const reedFilterBeds = reeds.describe(state, { rainChainBasins, pondMirrorPools });
      const steppingLogRoutes = logs.describe(state, { reedFilterBeds });
      const duskPondLedgers = ledger.describe(state, { rainChainBasins, pondMirrorPools, frogCallStones, reedFilterBeds, steppingLogRoutes });
      const groups = { rainChainBasins, pondMirrorPools, frogCallStones, reedFilterBeds, steppingLogRoutes, duskPondLedgers };
      const primary = duskPondLedgers[0] ?? { readiness: 0, siltPressure: normalizeRainwaterPondRestorationInput(state).siltPressure, phase: "catch-first-rain" };
      return {
        id: "meadow-rainwater-pond-restoration-readiness",
        kind: "domain-readiness",
        tree: MEADOW_RAINWATER_POND_RESTORATION_TREE,
        rendererContract: CONTRACT,
        ...groups,
        rendererHandoff: handoff.describe(groups),
        summary: {
          readiness: primary.readiness,
          siltPressure: primary.siltPressure,
          phase: primary.phase,
          clearPools: primary.clearPools ?? 0,
          catchmentMarkers: rainChainBasins.length + pondMirrorPools.length,
          habitatMarkers: frogCallStones.length + reedFilterBeds.length,
          crossingMarkers: steppingLogRoutes.length
        }
      };
    }
  };
}

export default createMeadowRainwaterPondRestorationReadinessDomainKit;
