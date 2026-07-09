const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, num(value, min)));
const clamp01 = (value) => clamp(value, 0, 1);
const point = (source = {}, fallback = {}) => ({
  x: num(source.x, fallback.x ?? 0),
  y: num(source.y, fallback.y ?? 0),
  z: num(source.z, fallback.z ?? 3)
});
const ledgesOf = (snapshot = {}) => Array.isArray(snapshot.route?.ledges) ? snapshot.route.ledges : [];
const playerPoint = (snapshot = {}) => point(snapshot.player, { x: 0, y: 0, z: 3 });
const distance = (a = {}, b = {}) => Math.hypot(num(a.x) - num(b.x), num(a.y) - num(b.y));
const average = (items = [], selector = (item) => item) => items.reduce((sum, item) => sum + num(selector(item)), 0) / Math.max(1, items.length);

export const NEXT_LEDGE_AVALANCHE_BEACON_RESCUE_TREE = `
next-ledge-avalanche-beacon-rescue-readiness-domain
├─ buried-signal-domain
│  ├─ beacon-ping-domain
│  │  └─ next-ledge-beacon-ping-arc-kit
│  └─ probe-grid-domain
│     └─ next-ledge-probe-grid-flag-kit
├─ survival-shelter-domain
│  ├─ snow-cave-domain
│  │  └─ next-ledge-snow-cave-marker-kit
│  └─ rope-belay-domain
│     └─ next-ledge-rope-belay-anchor-kit
├─ extraction-command-domain
│  ├─ search-team-domain
│  │  └─ next-ledge-search-team-lantern-kit
│  └─ victim-ledger-domain
│     └─ next-ledge-avalanche-victim-ledger-kit
└─ renderer-handoff
   └─ next-ledge-avalanche-beacon-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;

const RENDERER_CONTRACT = "renderer consumes descriptors only; buried signal, survival shelter, extraction command, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, and frame-loop truth stay outside reusable kit logic";

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

function futureLedges(snapshot = {}, count = 6) {
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

function stormExposure(snapshot = {}) {
  const p = playerPoint(snapshot);
  const velocity = Math.hypot(num(snapshot.player?.vx), num(snapshot.player?.vy));
  const altitude = clamp01(Math.max(0, p.y) / 920);
  const staminaPressure = 1 - staminaRatio(snapshot);
  const fallPressure = snapshot.mode === "failed" || snapshot.mode === "falling" ? 0.16 : 0;
  const storm = clamp01(num(snapshot.weather?.storm, snapshot.blizzardIntensity ?? 0.42));
  return clamp01(altitude * 0.26 + staminaPressure * 0.25 + velocity / 480 * 0.12 + storm * 0.25 + fallPressure);
}

function searchProgress(snapshot = {}) {
  const explicit = snapshot.rescue?.searchProgress ?? snapshot.searchProgress;
  if (Number.isFinite(Number(explicit))) return clamp01(explicit);
  const visited = Array.isArray(snapshot.visitedLedgeIds) ? snapshot.visitedLedgeIds.length : routeIndex(snapshot) + 1;
  return clamp01(visited / Math.max(1, ledgesOf(snapshot).length || 6));
}

export function createBeaconPingArcKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-beacon-ping-arc-kit",
    describe(snapshot = {}) {
      const exposure = stormExposure(snapshot);
      const progress = searchProgress(snapshot);
      return futureLedges(snapshot, 6).slice(0, 5).map((ledge, order) => {
        const confidence = clamp01(0.42 + progress * 0.28 + (ledge.enabled ? 0.12 : -0.08) - exposure * 0.18 - order * 0.025);
        return {
          id: `${snapshot.levelId ?? "next-ledge"}:beacon-ping:${ledge.id}`,
          kind: "next-ledge-beacon-ping-arc",
          ledgeId: ledge.id,
          order,
          position: point(ledge, { z: 15 }),
          pingRadius: 44 + order * 12 + exposure * 38,
          confidence,
          signalState: confidence > 0.72 ? "locked-signal" : confidence > 0.46 ? "sweeping" : "weak-buried-ping",
          rendererContract: RENDERER_CONTRACT
        };
      });
    }
  };
}

export function createProbeGridFlagKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-probe-grid-flag-kit",
    describe(snapshot = {}) {
      const exposure = stormExposure(snapshot);
      return futureLedges(snapshot, 5).slice(0, 4).map((ledge, order) => {
        const snowDepth = clamp01(0.28 + exposure * 0.46 + Math.abs(num(ledge.x, 0)) / 900 + order * 0.04);
        return {
          id: `${snapshot.levelId ?? "next-ledge"}:probe-grid:${ledge.id}`,
          kind: "next-ledge-probe-grid-flag",
          gridId: ledge.id,
          order,
          position: point({ x: num(ledge.x) - 12 + order * 4, y: num(ledge.y) + 8, z: 8 }),
          flagCount: Math.max(3, Math.round(4 + snowDepth * 8)),
          snowDepth,
          gridState: snowDepth > 0.72 ? "deep-probe" : snowDepth > 0.48 ? "tight-grid" : "fast-sweep",
          rendererContract: RENDERER_CONTRACT
        };
      });
    }
  };
}

export function createSnowCaveMarkerKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-snow-cave-marker-kit",
    describe(snapshot = {}) {
      const exposure = stormExposure(snapshot);
      const safeLedges = ledgesOf(snapshot).filter((ledge) => ledge.type === "rest" || ledge.type === "summit" || ledge.safe);
      const sources = safeLedges.length ? safeLedges : futureLedges(snapshot, 4);
      return sources.slice(0, 3).map((ledge, order) => {
        const warmth = clamp01(0.46 + staminaRatio(snapshot) * 0.18 + (ledge.type === "summit" ? 0.16 : 0.04) - exposure * 0.12);
        return {
          id: `${snapshot.levelId ?? "next-ledge"}:snow-cave:${ledge.id ?? order}`,
          kind: "next-ledge-snow-cave-marker",
          shelterId: ledge.id ?? `snow-cave-${order}`,
          order,
          position: point(ledge, { z: 7 }),
          warmth,
          occupantCapacity: Math.max(1, Math.round(2 + warmth * 5)),
          shelterState: warmth > 0.72 ? "heated-shelter" : warmth > 0.44 ? "wind-cut-shelter" : "dig-out-needed",
          rendererContract: RENDERER_CONTRACT
        };
      });
    }
  };
}

export function createRopeBelayAnchorKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-rope-belay-anchor-kit",
    describe(snapshot = {}) {
      const exposure = stormExposure(snapshot);
      const p = playerPoint(snapshot);
      const ledges = futureLedges(snapshot, 5);
      return ledges.slice(0, 4).map((ledge, order) => {
        const start = order === 0 ? p : point(ledges[order - 1], { z: 5 });
        const end = point(ledge, { z: 5 });
        const length = distance(start, end);
        const tensionRisk = clamp01(exposure * 0.45 + length / 520 + (ledge.enabled ? -0.08 : 0.1));
        return {
          id: `${snapshot.levelId ?? "next-ledge"}:belay-anchor:${ledge.id}`,
          kind: "next-ledge-rope-belay-anchor",
          anchorId: ledge.id,
          order,
          start,
          end,
          lineLength: Math.round(length),
          tensionRisk,
          belayState: tensionRisk > 0.72 ? "needs-second-anchor" : tensionRisk > 0.48 ? "tension-watch" : "secure-belay",
          rendererContract: RENDERER_CONTRACT
        };
      });
    }
  };
}

export function createSearchTeamLanternKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-search-team-lantern-kit",
    describe(snapshot = {}, groups = {}) {
      const pings = groups.beaconPingArcs ?? [];
      const caves = groups.snowCaveMarkers ?? [];
      const exposure = stormExposure(snapshot);
      const confidence = average(pings, (item) => item.confidence);
      const caveWarmth = average(caves, (item) => item.warmth);
      return futureLedges(snapshot, 4).slice(0, 3).map((ledge, order) => {
        const readiness = clamp01(confidence * 0.34 + caveWarmth * 0.24 + searchProgress(snapshot) * 0.22 + (1 - exposure) * 0.2 - order * 0.04);
        return {
          id: `${snapshot.levelId ?? "next-ledge"}:search-team:${ledge.id}`,
          kind: "next-ledge-search-team-lantern",
          teamId: `lantern-team-${order + 1}`,
          order,
          position: point({ x: num(ledge.x) + 18, y: num(ledge.y) + 18, z: 12 }),
          readiness,
          teamSize: Math.max(2, Math.round(3 + readiness * 5)),
          teamState: readiness > 0.74 ? "deploy-to-ping" : readiness > 0.5 ? "rope-check" : "hold-at-shelter",
          rendererContract: RENDERER_CONTRACT
        };
      });
    }
  };
}

export function createAvalancheVictimLedgerKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-avalanche-victim-ledger-kit",
    describe(snapshot = {}, groups = {}) {
      const pings = groups.beaconPingArcs ?? [];
      const grids = groups.probeGridFlags ?? [];
      const caves = groups.snowCaveMarkers ?? [];
      const belays = groups.ropeBelayAnchors ?? [];
      const teams = groups.searchTeamLanterns ?? [];
      const confidence = average(pings, (item) => item.confidence);
      const probeCoverage = clamp01(grids.reduce((sum, item) => sum + num(item.flagCount), 0) / 24);
      const shelterWarmth = average(caves, (item) => item.warmth);
      const belaySafety = 1 - Math.max(0, ...belays.map((item) => num(item.tensionRisk)));
      const teamReadiness = average(teams, (item) => item.readiness);
      const exposure = stormExposure(snapshot);
      const readiness = clamp01(confidence * 0.24 + probeCoverage * 0.16 + shelterWarmth * 0.18 + belaySafety * 0.18 + teamReadiness * 0.18 + (1 - exposure) * 0.06);
      const victimsReported = Math.max(1, Math.round(num(snapshot.rescue?.victimsReported, snapshot.victimsReported ?? 2)));
      const victimsLocated = Math.min(victimsReported, Math.round(readiness * victimsReported));
      return [{
        id: `${snapshot.levelId ?? "next-ledge"}:avalanche-victim-ledger`,
        kind: "next-ledge-avalanche-victim-ledger",
        readiness,
        phase: readiness > 0.8 ? "extract-victims" : readiness > 0.58 ? "dig-confirmed-pings" : readiness > 0.36 ? "sweep-beacon-grid" : "establish-shelter",
        victimsReported,
        victimsLocated,
        victimsMissing: Math.max(0, victimsReported - victimsLocated),
        beaconConfidence: confidence,
        probeCoverage,
        shelterWarmth,
        belaySafety,
        teamReadiness,
        rendererContract: RENDERER_CONTRACT
      }];
    }
  };
}

export function createAvalancheBeaconRescueRendererHandoffKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-avalanche-beacon-rescue-renderer-handoff-kit",
    describe(groups = {}) {
      const descriptors = [
        ...(groups.beaconPingArcs ?? []),
        ...(groups.probeGridFlags ?? []),
        ...(groups.snowCaveMarkers ?? []),
        ...(groups.ropeBelayAnchors ?? []),
        ...(groups.searchTeamLanterns ?? []),
        ...(groups.avalancheVictimLedgers ?? [])
      ];
      return {
        id: "next-ledge-avalanche-beacon-rescue-readiness-renderer-handoff",
        kind: "renderer-handoff",
        descriptorCount: descriptors.length,
        descriptors,
        rendererContract: RENDERER_CONTRACT,
        counts: {
          beaconPingArcs: groups.beaconPingArcs?.length ?? 0,
          probeGridFlags: groups.probeGridFlags?.length ?? 0,
          snowCaveMarkers: groups.snowCaveMarkers?.length ?? 0,
          ropeBelayAnchors: groups.ropeBelayAnchors?.length ?? 0,
          searchTeamLanterns: groups.searchTeamLanterns?.length ?? 0,
          avalancheVictimLedgers: groups.avalancheVictimLedgers?.length ?? 0,
          total: descriptors.length
        }
      };
    }
  };
}

export function createNextLedgeAvalancheBeaconRescueReadinessDomainKit(options = {}) {
  const beacon = options.beaconPingArcKit ?? createBeaconPingArcKit(options.beaconPingArc ?? {});
  const probe = options.probeGridFlagKit ?? createProbeGridFlagKit(options.probeGridFlag ?? {});
  const cave = options.snowCaveMarkerKit ?? createSnowCaveMarkerKit(options.snowCaveMarker ?? {});
  const belay = options.ropeBelayAnchorKit ?? createRopeBelayAnchorKit(options.ropeBelayAnchor ?? {});
  const team = options.searchTeamLanternKit ?? createSearchTeamLanternKit(options.searchTeamLantern ?? {});
  const ledger = options.avalancheVictimLedgerKit ?? createAvalancheVictimLedgerKit(options.avalancheVictimLedger ?? {});
  const handoff = options.rendererHandoffKit ?? createAvalancheBeaconRescueRendererHandoffKit(options.rendererHandoff ?? {});
  return {
    id: options.id ?? "next-ledge-avalanche-beacon-rescue-readiness-domain-kit",
    tree: NEXT_LEDGE_AVALANCHE_BEACON_RESCUE_TREE,
    kits: [beacon.id, probe.id, cave.id, belay.id, team.id, ledger.id, handoff.id],
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
      const beaconPingArcs = beacon.describe(snapshot);
      const probeGridFlags = probe.describe(snapshot);
      const snowCaveMarkers = cave.describe(snapshot);
      const ropeBelayAnchors = belay.describe(snapshot);
      const searchTeamLanterns = team.describe(snapshot, {
        beaconPingArcs,
        snowCaveMarkers
      });
      const avalancheVictimLedgers = ledger.describe(snapshot, {
        beaconPingArcs,
        probeGridFlags,
        snowCaveMarkers,
        ropeBelayAnchors,
        searchTeamLanterns
      });
      const groups = {
        beaconPingArcs,
        probeGridFlags,
        snowCaveMarkers,
        ropeBelayAnchors,
        searchTeamLanterns,
        avalancheVictimLedgers
      };
      return {
        id: "next-ledge-avalanche-beacon-rescue-readiness",
        kind: "domain-readiness",
        tree: NEXT_LEDGE_AVALANCHE_BEACON_RESCUE_TREE,
        rendererContract: RENDERER_CONTRACT,
        ...groups,
        rendererHandoff: handoff.describe(groups),
        summary: {
          readiness: avalancheVictimLedgers[0]?.readiness ?? 0,
          phase: avalancheVictimLedgers[0]?.phase ?? "establish-shelter",
          stormExposure: stormExposure(snapshot),
          victimsMissing: avalancheVictimLedgers[0]?.victimsMissing ?? 0
        }
      };
    }
  };
}

export default createNextLedgeAvalancheBeaconRescueReadinessDomainKit;
