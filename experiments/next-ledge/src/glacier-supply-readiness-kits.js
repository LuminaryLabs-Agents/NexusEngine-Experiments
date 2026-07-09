const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, num(value, min)));
const clamp01 = (value) => clamp(value, 0, 1);
const point = (source = {}, fallback = {}) => ({
  x: num(source.x, fallback.x ?? 0),
  y: num(source.y, fallback.y ?? 0),
  z: num(source.z, fallback.z ?? 2)
});
const ledgesOf = (snapshot = {}) => Array.isArray(snapshot.route?.ledges) ? snapshot.route.ledges : [];
const playerPoint = (snapshot = {}) => point(snapshot.player, { x: 0, y: 0, z: 2 });
const distance = (a = {}, b = {}) => Math.hypot(num(a.x) - num(b.x), num(a.y) - num(b.y));

export const NEXT_LEDGE_GLACIER_SUPPLY_READINESS_TREE = `
next-ledge-glacier-supply-readiness-domain
├─ frost-navigation-domain
│  ├─ storm-lantern-domain
│  │  └─ next-ledge-storm-lantern-chain-kit
│  └─ crampon-rail-domain
│     └─ next-ledge-crampon-step-rail-kit
├─ cold-safety-domain
│  ├─ warmth-cache-domain
│  │  └─ next-ledge-frostbite-warmth-cache-kit
│  └─ avalanche-cornice-domain
│     └─ next-ledge-avalanche-cornice-warning-kit
├─ extraction-supply-domain
│  ├─ rescue-sled-domain
│  │  └─ next-ledge-rescue-sled-transfer-lane-kit
│  └─ summit-ledger-domain
│     └─ next-ledge-summit-supply-ledger-kit
└─ renderer-handoff
   └─ next-ledge-glacier-supply-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;

const RENDERER_CONTRACT = "renderer consumes descriptors only; frost navigation, cold safety, extraction supply, browser input, Three.js, WebGL, audio, asset loading, physics, and frame-loop truth stay outside reusable kit logic";

function routeIndex(snapshot = {}) {
  const ledges = ledgesOf(snapshot);
  const current = snapshot.currentAnchorId ?? snapshot.lastLedgeId ?? snapshot.anchorLedge?.id;
  const index = ledges.findIndex((ledge) => ledge.id === current);
  if (index >= 0) return index;
  const p = playerPoint(snapshot);
  let best = 0;
  let bestDistance = Infinity;
  ledges.forEach((ledge, ledgeIndex) => {
    const gap = distance(p, ledge);
    if (gap < bestDistance) {
      best = ledgeIndex;
      bestDistance = gap;
    }
  });
  return best;
}

function futureLedges(snapshot = {}, count = 5) {
  const ledges = ledgesOf(snapshot);
  if (!ledges.length) return [];
  const index = routeIndex(snapshot);
  const enabled = new Set(Array.isArray(snapshot.enabledTargetIds) ? snapshot.enabledTargetIds : []);
  const slice = ledges.slice(index, Math.min(ledges.length, index + count));
  return (slice.length ? slice : ledges.slice(-count)).map((ledge, order) => ({
    ...ledge,
    order,
    enabled: enabled.size ? enabled.has(ledge.id) || order === 0 : true
  }));
}

function staminaRatio(snapshot = {}) {
  return clamp01(num(snapshot.stamina, 0) / Math.max(1, num(snapshot.constants?.maxStamina, 115)));
}

function frostRisk(snapshot = {}) {
  const p = playerPoint(snapshot);
  const velocity = Math.hypot(num(snapshot.player?.vx), num(snapshot.player?.vy));
  const altitude = clamp01(Math.max(0, p.y) / 900);
  const staminaPressure = 1 - staminaRatio(snapshot);
  const failed = snapshot.mode === "failed" || snapshot.mode === "falling" ? 0.14 : 0;
  return clamp01(altitude * 0.34 + staminaPressure * 0.38 + velocity / 420 * 0.14 + failed);
}

export function createStormLanternChainKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-storm-lantern-chain-kit",
    describe(snapshot = {}) {
      const risk = frostRisk(snapshot);
      return futureLedges(snapshot, 5).slice(0, 4).map((ledge, order) => ({
        id: `${snapshot.levelId ?? "next-ledge"}:storm-lantern:${ledge.id}`,
        kind: "next-ledge-storm-lantern-chain",
        ledgeId: ledge.id,
        order,
        position: point(ledge, { z: 9 }),
        glowRadius: 34 + risk * 46 + order * 6,
        visibility: clamp01(0.88 - risk * 0.36 + (ledge.enabled ? 0.08 : -0.12) - order * 0.03),
        lanternState: risk > 0.72 ? "blizzard-bright" : risk > 0.42 ? "wind-shielded" : "steady",
        rendererContract: RENDERER_CONTRACT
      }));
    }
  };
}

export function createCramponStepRailKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-crampon-step-rail-kit",
    describe(snapshot = {}) {
      const p = playerPoint(snapshot);
      const risk = frostRisk(snapshot);
      const ledges = futureLedges(snapshot, 5);
      return ledges.slice(0, 4).map((ledge, order) => {
        const start = order === 0 ? p : point(ledges[order - 1], { z: 4 });
        const end = point(ledge, { z: 4 });
        const slope = clamp01(Math.max(0, end.y - start.y) / 260);
        return {
          id: `${snapshot.levelId ?? "next-ledge"}:crampon-rail:${ledge.id}`,
          kind: "next-ledge-crampon-step-rail",
          railId: ledge.id,
          order,
          start,
          end,
          notchCount: Math.max(3, Math.round(4 + distance(start, end) / 55)),
          slipRisk: clamp01(risk * 0.52 + slope * 0.36 + (ledge.enabled ? -0.08 : 0.12)),
          rendererContract: RENDERER_CONTRACT
        };
      });
    }
  };
}

export function createFrostbiteWarmthCacheKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-frostbite-warmth-cache-kit",
    describe(snapshot = {}) {
      const risk = frostRisk(snapshot);
      const restLedges = ledgesOf(snapshot).filter((ledge) => ledge.type === "rest" || ledge.type === "summit");
      const sources = restLedges.length ? restLedges : futureLedges(snapshot, 4);
      return sources.slice(0, 3).map((ledge, order) => ({
        id: `${snapshot.levelId ?? "next-ledge"}:warmth-cache:${ledge.id ?? order}`,
        kind: "next-ledge-frostbite-warmth-cache",
        cacheId: ledge.id ?? `cache-${order}`,
        order,
        position: point(ledge, { z: 7 }),
        heatReserve: clamp01(0.48 + staminaRatio(snapshot) * 0.24 - risk * 0.12 + (ledge.type === "summit" ? 0.16 : 0)),
        blanketCount: Math.max(1, Math.round(2 + (1 - risk) * 4)),
        cacheState: risk > 0.7 ? "open-now" : "standby",
        rendererContract: RENDERER_CONTRACT
      }));
    }
  };
}

export function createAvalancheCorniceWarningKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-avalanche-cornice-warning-kit",
    describe(snapshot = {}) {
      const risk = frostRisk(snapshot);
      return futureLedges(snapshot, 6).slice(0, 4).map((ledge, order) => {
        const overhang = clamp01(Math.abs(num(ledge.x, 0)) / 420 + num(ledge.r, 20) / 120 + order * 0.03);
        const severity = clamp01(risk * 0.58 + overhang * 0.32 + (ledge.enabled ? -0.06 : 0.08));
        return {
          id: `${snapshot.levelId ?? "next-ledge"}:avalanche-cornice:${ledge.id}`,
          kind: "next-ledge-avalanche-cornice-warning",
          ledgeId: ledge.id,
          order,
          position: point(ledge, { z: 12 }),
          severity,
          warningState: severity > 0.72 ? "red-cornice" : severity > 0.44 ? "yellow-crack" : "blue-safe",
          rendererContract: RENDERER_CONTRACT
        };
      });
    }
  };
}

export function createRescueSledTransferLaneKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-rescue-sled-transfer-lane-kit",
    describe(snapshot = {}) {
      const p = playerPoint(snapshot);
      const ledges = futureLedges(snapshot, 5);
      const route = ledges.map((ledge) => point(ledge, { z: 5 }));
      const readiness = clamp01(staminaRatio(snapshot) * 0.36 + (1 - frostRisk(snapshot)) * 0.34 + ledges.filter((ledge) => ledge.enabled).length / Math.max(1, ledges.length) * 0.3);
      return [{
        id: `${snapshot.levelId ?? "next-ledge"}:rescue-sled-transfer-lane`,
        kind: "next-ledge-rescue-sled-transfer-lane",
        start: p,
        route,
        readiness,
        sledState: readiness > 0.74 ? "ready-to-haul" : readiness > 0.46 ? "rigging" : "blocked-by-ice",
        pullTeamCount: Math.max(2, Math.round(2 + readiness * 5)),
        rendererContract: RENDERER_CONTRACT
      }];
    }
  };
}

export function createSummitSupplyLedgerKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-summit-supply-ledger-kit",
    describe(snapshot = {}, groups = {}) {
      const lanterns = groups.stormLanternChains ?? [];
      const rails = groups.cramponStepRails ?? [];
      const caches = groups.frostbiteWarmthCaches ?? [];
      const cornices = groups.avalancheCorniceWarnings ?? [];
      const sled = groups.rescueSledTransferLanes?.[0];
      const averageVisibility = lanterns.reduce((sum, item) => sum + num(item.visibility), 0) / Math.max(1, lanterns.length);
      const averageSlip = rails.reduce((sum, item) => sum + num(item.slipRisk), 0) / Math.max(1, rails.length);
      const maxCornice = Math.max(0, ...cornices.map((item) => num(item.severity)));
      const readiness = clamp01(averageVisibility * 0.28 + (1 - averageSlip) * 0.22 + (1 - maxCornice) * 0.2 + num(sled?.readiness, 0.4) * 0.22 + Math.min(1, caches.length / 3) * 0.08);
      return [{
        id: `${snapshot.levelId ?? "next-ledge"}:summit-supply-ledger`,
        kind: "next-ledge-summit-supply-ledger",
        readiness,
        phase: readiness > 0.78 ? "summit-supply-ready" : readiness > 0.52 ? "cache-and-belay" : "hold-for-weather",
        lanternCount: lanterns.length,
        railCount: rails.length,
        warmthCacheCount: caches.length,
        corniceRisk: maxCornice,
        rendererContract: RENDERER_CONTRACT
      }];
    }
  };
}

export function createGlacierSupplyRendererHandoffKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-glacier-supply-renderer-handoff-kit",
    describe(groups = {}) {
      const descriptors = [
        ...(groups.stormLanternChains ?? []),
        ...(groups.cramponStepRails ?? []),
        ...(groups.frostbiteWarmthCaches ?? []),
        ...(groups.avalancheCorniceWarnings ?? []),
        ...(groups.rescueSledTransferLanes ?? []),
        ...(groups.summitSupplyLedgers ?? [])
      ];
      return {
        id: "next-ledge-glacier-supply-readiness-renderer-handoff",
        kind: "renderer-handoff",
        descriptorCount: descriptors.length,
        descriptors,
        rendererContract: RENDERER_CONTRACT,
        counts: {
          stormLanternChains: groups.stormLanternChains?.length ?? 0,
          cramponStepRails: groups.cramponStepRails?.length ?? 0,
          frostbiteWarmthCaches: groups.frostbiteWarmthCaches?.length ?? 0,
          avalancheCorniceWarnings: groups.avalancheCorniceWarnings?.length ?? 0,
          rescueSledTransferLanes: groups.rescueSledTransferLanes?.length ?? 0,
          summitSupplyLedgers: groups.summitSupplyLedgers?.length ?? 0,
          total: descriptors.length
        }
      };
    }
  };
}

export function createNextLedgeGlacierSupplyReadinessDomainKit(options = {}) {
  const lantern = options.stormLanternChainKit ?? createStormLanternChainKit(options.stormLanternChain ?? {});
  const rail = options.cramponStepRailKit ?? createCramponStepRailKit(options.cramponStepRail ?? {});
  const cache = options.frostbiteWarmthCacheKit ?? createFrostbiteWarmthCacheKit(options.frostbiteWarmthCache ?? {});
  const cornice = options.avalancheCorniceWarningKit ?? createAvalancheCorniceWarningKit(options.avalancheCorniceWarning ?? {});
  const sled = options.rescueSledTransferLaneKit ?? createRescueSledTransferLaneKit(options.rescueSledTransferLane ?? {});
  const ledger = options.summitSupplyLedgerKit ?? createSummitSupplyLedgerKit(options.summitSupplyLedger ?? {});
  const handoff = options.rendererHandoffKit ?? createGlacierSupplyRendererHandoffKit(options.rendererHandoff ?? {});
  return {
    id: options.id ?? "next-ledge-glacier-supply-readiness-domain-kit",
    tree: NEXT_LEDGE_GLACIER_SUPPLY_READINESS_TREE,
    kits: [lantern.id, rail.id, cache.id, cornice.id, sled.id, ledger.id, handoff.id],
    ownership: {
      renderer: false,
      dom: false,
      browserInput: false,
      three: false,
      webgl: false,
      audio: false,
      assetLoading: false,
      frameLoop: false,
      physics: false
    },
    describe(snapshot = {}) {
      const stormLanternChains = lantern.describe(snapshot);
      const cramponStepRails = rail.describe(snapshot);
      const frostbiteWarmthCaches = cache.describe(snapshot);
      const avalancheCorniceWarnings = cornice.describe(snapshot);
      const rescueSledTransferLanes = sled.describe(snapshot);
      const summitSupplyLedgers = ledger.describe(snapshot, {
        stormLanternChains,
        cramponStepRails,
        frostbiteWarmthCaches,
        avalancheCorniceWarnings,
        rescueSledTransferLanes
      });
      const groups = {
        stormLanternChains,
        cramponStepRails,
        frostbiteWarmthCaches,
        avalancheCorniceWarnings,
        rescueSledTransferLanes,
        summitSupplyLedgers
      };
      return {
        id: "next-ledge-glacier-supply-readiness",
        kind: "domain-readiness",
        tree: NEXT_LEDGE_GLACIER_SUPPLY_READINESS_TREE,
        rendererContract: RENDERER_CONTRACT,
        ...groups,
        rendererHandoff: handoff.describe(groups),
        summary: {
          readiness: summitSupplyLedgers[0]?.readiness ?? 0,
          phase: summitSupplyLedgers[0]?.phase ?? "hold-for-weather",
          frostRisk: frostRisk(snapshot)
        }
      };
    }
  };
}

export default createNextLedgeGlacierSupplyReadinessDomainKit;
