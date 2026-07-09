const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value, min)));
const point = (value = {}, fallback = {}) => ({
  x: n(value.x, fallback.x ?? 0),
  y: n(value.y, fallback.y ?? 0),
  z: n(value.z, fallback.z ?? 12)
});
const average = (items = [], fn = (item) => item) => items.reduce((sum, item) => sum + n(fn(item)), 0) / Math.max(1, items.length);
const ledges = (state = {}) => Array.isArray(state.route?.ledges) ? state.route.ledges : [];
const player = (state = {}) => point(state.player, { x: 0, y: 0, z: 8 });
const distance = (a = {}, b = {}) => Math.hypot(n(a.x) - n(b.x), n(a.y) - n(b.y));

export const NEXT_LEDGE_RIDGE_STRETCHER_RELAY_TREE = `
next-ledge-ridge-stretcher-relay-readiness-domain
├─ ridge-medical-domain
│  ├─ stretcher-anchor-domain
│  │  └─ next-ledge-stretcher-anchor-kit
│  └─ med-pack-cache-domain
│     └─ next-ledge-med-pack-cache-kit
├─ traverse-safety-domain
│  ├─ belay-post-domain
│  │  └─ next-ledge-belay-post-kit
│  └─ wind-shear-ribbon-domain
│     └─ next-ledge-wind-shear-ribbon-kit
├─ extraction-handoff-domain
│  ├─ ridge-signal-panel-domain
│  │  └─ next-ledge-ridge-signal-panel-kit
│  └─ dawn-stretcher-ledger-domain
│     └─ next-ledge-dawn-stretcher-ledger-kit
└─ renderer-handoff
   └─ next-ledge-ridge-stretcher-relay-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;

const CONTRACT = "renderer consumes descriptors only; ridge medical, traverse safety, extraction handoff, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, storage, network, and frame-loop ownership stay outside reusable kit logic";

function routeIndex(state = {}) {
  const route = ledges(state);
  const current = state.currentAnchorId ?? state.lastLedgeId ?? state.anchorLedge?.id;
  const found = route.findIndex((ledge) => ledge.id === current);
  if (found >= 0) return found;
  const p = player(state);
  return route.reduce((best, ledge, index) => distance(p, ledge) < distance(p, route[best] ?? {}) ? index : best, 0);
}

function routeWindow(state = {}, count = 8) {
  const route = ledges(state);
  if (!route.length) return [];
  const index = routeIndex(state);
  return route
    .slice(Math.max(0, index - 1), Math.min(route.length, index + count))
    .map((ledge, order) => ({ ...ledge, order }));
}

function safeLedges(state = {}) {
  const preferred = ledges(state).filter((ledge) => ledge.safe || ledge.type === "rest" || ledge.type === "summit");
  return (preferred.length ? preferred : routeWindow(state, 6)).slice(0, 6).map((ledge, order) => ({ ...ledge, order }));
}

function progress(state = {}) {
  if (Number.isFinite(Number(state.ridgeStretcherRelay?.rescueProgress))) return clamp(state.ridgeStretcherRelay.rescueProgress);
  if (Number.isFinite(Number(state.rescueProgress))) return clamp(state.rescueProgress);
  const visited = Array.isArray(state.visitedLedgeIds) ? state.visitedLedgeIds.length : routeIndex(state) + 1;
  return clamp(visited / Math.max(1, ledges(state).length || 8));
}

function staminaRatio(state = {}) {
  return clamp(n(state.stamina, 0) / Math.max(1, n(state.constants?.maxStamina, 115)));
}

function windShearRisk(state = {}) {
  const wind = n(state.weather?.wind, state.wind ?? 0.38);
  const snow = n(state.weather?.snow, state.blizzardIntensity ?? state.weather?.storm ?? 0.3);
  const altitude = clamp(Math.max(0, player(state).y) / 920);
  const fatigue = 1 - staminaRatio(state);
  const fall = state.mode === "failed" || state.mode === "falling" ? 0.2 : 0;
  return clamp(wind * 0.34 + snow * 0.24 + altitude * 0.18 + fatigue * 0.18 + fall);
}

function ridgeSpanSafety(ledge = {}, next = {}, risk = 0.4) {
  const span = distance(ledge, next);
  return clamp(0.88 - span / 760 - risk * 0.32 + (ledge.safe ? 0.08 : 0));
}

export function createStretcherAnchorKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-stretcher-anchor-kit",
    describe(state = {}) {
      const risk = windShearRisk(state);
      return safeLedges(state).slice(0, 5).map((ledge, order) => {
        const grip = clamp(0.48 + progress(state) * 0.28 + (ledge.safe ? 0.18 : 0.04) - risk * 0.2 - order * 0.025);
        return {
          id: `${state.levelId ?? "next-ledge"}:stretcher-anchor:${ledge.id ?? order}`,
          kind: "next-ledge-stretcher-anchor",
          ledgeId: ledge.id,
          order,
          position: point({ x: n(ledge.x) - 18, y: n(ledge.y) + 20, z: 18 }),
          grip,
          anchorPins: Math.max(2, Math.round(2 + grip * 6)),
          anchorState: grip > 0.78 ? "stretcher-lock-ready" : grip > 0.52 ? "drive-secondary-pin" : "unsafe-for-casualty-load",
          rendererContract: CONTRACT
        };
      });
    }
  };
}

export function createMedPackCacheKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-med-pack-cache-kit",
    describe(state = {}, graph = {}) {
      const anchorGrip = average(graph.stretcherAnchors, (anchor) => anchor.grip);
      return safeLedges(state).slice(0, 5).map((ledge, order) => {
        const supply = clamp(0.36 + anchorGrip * 0.24 + staminaRatio(state) * 0.16 + progress(state) * 0.24 - windShearRisk(state) * 0.16 - order * 0.02);
        return {
          id: `${state.levelId ?? "next-ledge"}:med-pack-cache:${ledge.id ?? order}`,
          kind: "next-ledge-med-pack-cache",
          ledgeId: ledge.id,
          order,
          position: point({ x: n(ledge.x) + 24, y: n(ledge.y) + 16, z: 13 }),
          supply,
          splintCount: Math.max(1, Math.round(1 + supply * 5)),
          cacheState: supply > 0.76 ? "hypothermia-kit-ready" : supply > 0.48 ? "restock-splints" : "cache-buried-by-spindrift",
          rendererContract: CONTRACT
        };
      });
    }
  };
}

export function createBelayPostKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-belay-post-kit",
    describe(state = {}, graph = {}) {
      const route = routeWindow(state, 8);
      const anchorGrip = average(graph.stretcherAnchors, (anchor) => anchor.grip);
      return route.slice(0, 6).map((ledge, order) => {
        const next = route[order + 1] ?? ledge;
        const ropeSafety = clamp(ridgeSpanSafety(ledge, next, windShearRisk(state)) * 0.68 + anchorGrip * 0.22 + progress(state) * 0.1);
        return {
          id: `${state.levelId ?? "next-ledge"}:belay-post:${ledge.id ?? order}`,
          kind: "next-ledge-belay-post",
          ledgeId: ledge.id,
          order,
          start: point({ x: n(ledge.x) - 2, y: n(ledge.y) + 28, z: 22 }),
          end: point({ x: n(next.x) - 2, y: n(next.y) + 28, z: 22 }),
          ropeSafety,
          ropeMeters: Math.round(38 + distance(ledge, next) * 0.62),
          belayState: ropeSafety > 0.74 ? "belay-line-safe" : ropeSafety > 0.48 ? "double-wrap-needed" : "span-too-exposed",
          rendererContract: CONTRACT
        };
      });
    }
  };
}

export function createWindShearRibbonKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-wind-shear-ribbon-kit",
    describe(state = {}, graph = {}) {
      const route = routeWindow(state, 7);
      const belaySafety = average(graph.belayPosts, (post) => post.ropeSafety);
      const risk = windShearRisk(state);
      return route.slice(0, 6).map((ledge, order) => {
        const stability = clamp(0.42 + belaySafety * 0.26 + progress(state) * 0.2 - risk * 0.28 + (ledge.type === "rest" ? 0.08 : 0));
        return {
          id: `${state.levelId ?? "next-ledge"}:wind-shear-ribbon:${ledge.id ?? order}`,
          kind: "next-ledge-wind-shear-ribbon",
          ledgeId: ledge.id,
          order,
          position: point({ x: n(ledge.x) + 8, y: n(ledge.y) + 44, z: 25 }),
          stability,
          ribbonStrands: Math.max(2, Math.round(2 + stability * 8)),
          shearState: stability > 0.72 ? "crosswind-readable" : stability > 0.46 ? "watch-gust-pocket" : "route-hidden-by-shear",
          rendererContract: CONTRACT
        };
      });
    }
  };
}

export function createRidgeSignalPanelKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-ridge-signal-panel-kit",
    describe(state = {}, graph = {}) {
      const anchorGrip = average(graph.stretcherAnchors, (anchor) => anchor.grip);
      const supply = average(graph.medPackCaches, (cache) => cache.supply);
      const windReadability = average(graph.windShearRibbons, (ribbon) => ribbon.stability);
      return safeLedges(state).slice(0, 4).map((ledge, order) => {
        const signal = clamp(0.34 + anchorGrip * 0.18 + supply * 0.16 + windReadability * 0.22 + progress(state) * 0.22 - windShearRisk(state) * 0.14 - order * 0.018);
        return {
          id: `${state.levelId ?? "next-ledge"}:ridge-signal-panel:${ledge.id ?? order}`,
          kind: "next-ledge-ridge-signal-panel",
          ledgeId: ledge.id,
          order,
          position: point({ x: n(ledge.x) + 38, y: n(ledge.y) + 26, z: 20 }),
          signal,
          panelFlashCount: Math.max(1, Math.round(1 + signal * 7)),
          signalState: signal > 0.76 ? "medevac-visible" : signal > 0.5 ? "tilt-panel-toward-summit" : "panel-obscured",
          rendererContract: CONTRACT
        };
      });
    }
  };
}

export function createDawnStretcherLedgerKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-dawn-stretcher-ledger-kit",
    describe(state = {}, graph = {}) {
      const readiness = clamp(
        average(graph.stretcherAnchors, (anchor) => anchor.grip) * 0.2 +
        average(graph.medPackCaches, (cache) => cache.supply) * 0.18 +
        average(graph.belayPosts, (post) => post.ropeSafety) * 0.22 +
        average(graph.windShearRibbons, (ribbon) => ribbon.stability) * 0.16 +
        average(graph.ridgeSignalPanels, (panel) => panel.signal) * 0.18 +
        progress(state) * 0.06
      );
      const pressure = windShearRisk(state);
      return [{
        id: `${state.levelId ?? "next-ledge"}:dawn-stretcher-ledger`,
        kind: "next-ledge-dawn-stretcher-ledger",
        readiness,
        windShearRisk: pressure,
        phase: readiness > 0.82 ? "lower-stretcher-to-extraction" : readiness > 0.62 ? "stabilize-belay-spans" : readiness > 0.42 ? "stock-medical-ledges" : "pin-safe-stretcher-anchors",
        casualtySlots: Math.max(1, Math.round(1 + readiness * 5 - pressure * 2)),
        rendererContract: CONTRACT
      }];
    }
  };
}

export function createRidgeStretcherRelayRendererHandoffKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-ridge-stretcher-relay-renderer-handoff-kit",
    describe(graph = {}) {
      const descriptors = [
        ...(graph.stretcherAnchors ?? []),
        ...(graph.medPackCaches ?? []),
        ...(graph.belayPosts ?? []),
        ...(graph.windShearRibbons ?? []),
        ...(graph.ridgeSignalPanels ?? []),
        ...(graph.dawnStretcherLedgers ?? [])
      ];
      return {
        id: "next-ledge-ridge-stretcher-relay-readiness-renderer-handoff",
        kind: "renderer-handoff",
        descriptorCount: descriptors.length,
        descriptors,
        rendererContract: CONTRACT,
        counts: {
          stretcherAnchors: graph.stretcherAnchors?.length ?? 0,
          medPackCaches: graph.medPackCaches?.length ?? 0,
          belayPosts: graph.belayPosts?.length ?? 0,
          windShearRibbons: graph.windShearRibbons?.length ?? 0,
          ridgeSignalPanels: graph.ridgeSignalPanels?.length ?? 0,
          dawnStretcherLedgers: graph.dawnStretcherLedgers?.length ?? 0,
          total: descriptors.length
        }
      };
    }
  };
}

export function createNextLedgeRidgeStretcherRelayReadinessDomainKit(options = {}) {
  const stretcherAnchor = options.stretcherAnchorKit ?? createStretcherAnchorKit(options.stretcherAnchor ?? {});
  const medPackCache = options.medPackCacheKit ?? createMedPackCacheKit(options.medPackCache ?? {});
  const belayPost = options.belayPostKit ?? createBelayPostKit(options.belayPost ?? {});
  const windShearRibbon = options.windShearRibbonKit ?? createWindShearRibbonKit(options.windShearRibbon ?? {});
  const ridgeSignalPanel = options.ridgeSignalPanelKit ?? createRidgeSignalPanelKit(options.ridgeSignalPanel ?? {});
  const dawnStretcherLedger = options.dawnStretcherLedgerKit ?? createDawnStretcherLedgerKit(options.dawnStretcherLedger ?? {});
  const rendererHandoff = options.rendererHandoffKit ?? createRidgeStretcherRelayRendererHandoffKit(options.rendererHandoff ?? {});

  return {
    id: options.id ?? "next-ledge-ridge-stretcher-relay-readiness-domain-kit",
    tree: NEXT_LEDGE_RIDGE_STRETCHER_RELAY_TREE,
    kits: [stretcherAnchor.id, medPackCache.id, belayPost.id, windShearRibbon.id, ridgeSignalPanel.id, dawnStretcherLedger.id, rendererHandoff.id],
    ownership: {
      renderer: false,
      dom: false,
      browserInput: false,
      three: false,
      webgl: false,
      audio: false,
      assetLoading: false,
      frameLoop: false,
      physics: false,
      storage: false,
      network: false
    },
    describe(state = {}) {
      const stretcherAnchors = stretcherAnchor.describe(state);
      const medPackCaches = medPackCache.describe(state, { stretcherAnchors });
      const belayPosts = belayPost.describe(state, { stretcherAnchors });
      const windShearRibbons = windShearRibbon.describe(state, { belayPosts });
      const ridgeSignalPanels = ridgeSignalPanel.describe(state, { stretcherAnchors, medPackCaches, windShearRibbons });
      const dawnStretcherLedgers = dawnStretcherLedger.describe(state, { stretcherAnchors, medPackCaches, belayPosts, windShearRibbons, ridgeSignalPanels });
      const groups = { stretcherAnchors, medPackCaches, belayPosts, windShearRibbons, ridgeSignalPanels, dawnStretcherLedgers };
      const primaryLedger = dawnStretcherLedgers[0] ?? { readiness: 0, windShearRisk: windShearRisk(state), phase: "pin-safe-stretcher-anchors" };
      return {
        id: "next-ledge-ridge-stretcher-relay-readiness",
        kind: "domain-readiness",
        tree: NEXT_LEDGE_RIDGE_STRETCHER_RELAY_TREE,
        rendererContract: CONTRACT,
        ...groups,
        rendererHandoff: rendererHandoff.describe(groups),
        summary: {
          readiness: primaryLedger.readiness,
          windShearRisk: primaryLedger.windShearRisk,
          phase: primaryLedger.phase,
          casualtySlots: primaryLedger.casualtySlots ?? 1,
          medicalNodes: stretcherAnchors.length + medPackCaches.length,
          safetyNodes: belayPosts.length + windShearRibbons.length
        }
      };
    }
  };
}

export default createNextLedgeRidgeStretcherRelayReadinessDomainKit;
