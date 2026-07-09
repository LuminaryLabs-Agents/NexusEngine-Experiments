const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value, min)));
const point = (value = {}, fallback = {}) => ({
  x: n(value.x, fallback.x ?? 0),
  y: n(value.y, fallback.y ?? 0),
  z: n(value.z, fallback.z ?? 12)
});
const average = (items = [], fn = (x) => x) => items.reduce((sum, item) => sum + n(fn(item)), 0) / Math.max(1, items.length);
const routeLedges = (state = {}) => Array.isArray(state.route?.ledges) ? state.route.ledges : [];
const currentPlayer = (state = {}) => point(state.player, { x: 0, y: 0, z: 8 });
const distance = (a = {}, b = {}) => Math.hypot(n(a.x) - n(b.x), n(a.y) - n(b.y));

export const NEXT_LEDGE_DRONE_RELAY_RESCUE_TREE = `
next-ledge-drone-relay-rescue-readiness-domain
├─ route-marking-domain
│  ├─ phosphor-anchor-domain
│  │  └─ next-ledge-phosphor-anchor-kit
│  └─ snow-flag-breadcrumb-domain
│     └─ next-ledge-snow-flag-breadcrumb-kit
├─ aerial-relay-domain
│  ├─ drone-perch-domain
│  │  └─ next-ledge-drone-perch-kit
│  └─ rescue-cable-spool-domain
│     └─ next-ledge-rescue-cable-spool-kit
├─ survivor-handoff-domain
│  ├─ heat-beacon-flare-domain
│  │  └─ next-ledge-heat-beacon-flare-kit
│  └─ extraction-ledger-domain
│     └─ next-ledge-extraction-ledger-kit
└─ renderer-handoff
   └─ next-ledge-drone-relay-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;

const CONTRACT = "renderer consumes descriptors only; route marking, aerial relay, survivor handoff, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, storage, and frame-loop truth stay outside reusable kit logic";

function routeIndex(state = {}) {
  const ledges = routeLedges(state);
  const current = state.currentAnchorId ?? state.lastLedgeId ?? state.anchorLedge?.id;
  const found = ledges.findIndex((ledge) => ledge.id === current);
  if (found >= 0) return found;
  const player = currentPlayer(state);
  return ledges.reduce((best, ledge, index) => distance(player, ledge) < distance(player, ledges[best] ?? {}) ? index : best, 0);
}

function routeWindow(state = {}, count = 7) {
  const ledges = routeLedges(state);
  if (!ledges.length) return [];
  const index = routeIndex(state);
  return ledges
    .slice(Math.max(0, index - 1), Math.min(ledges.length, index + count))
    .map((ledge, order) => ({ ...ledge, order }));
}

function safeSites(state = {}) {
  const preferred = routeLedges(state).filter((ledge) => ledge.safe || ledge.type === "rest" || ledge.type === "summit");
  return (preferred.length ? preferred : routeWindow(state, 6)).slice(0, 6).map((ledge, order) => ({ ...ledge, order }));
}

function staminaRatio(state = {}) {
  return clamp(n(state.stamina, 0) / Math.max(1, n(state.constants?.maxStamina, 115)));
}

function rescueProgress(state = {}) {
  if (Number.isFinite(Number(state.droneRelay?.rescueProgress))) return clamp(state.droneRelay.rescueProgress);
  if (Number.isFinite(Number(state.rescueProgress))) return clamp(state.rescueProgress);
  const visited = Array.isArray(state.visitedLedgeIds) ? state.visitedLedgeIds.length : routeIndex(state) + 1;
  return clamp(visited / Math.max(1, routeLedges(state).length || 8));
}

function stormPressure(state = {}) {
  const wind = n(state.weather?.wind, state.wind ?? 0.42);
  const snow = n(state.weather?.snow, state.blizzardIntensity ?? state.weather?.storm ?? 0.36);
  const altitude = clamp(Math.max(0, currentPlayer(state).y) / 900);
  const failure = state.mode === "failed" || state.mode === "falling" ? 0.18 : 0;
  return clamp(wind * 0.3 + snow * 0.32 + altitude * 0.18 + (1 - staminaRatio(state)) * 0.16 + failure);
}

export function createPhosphorAnchorKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-phosphor-anchor-kit",
    describe(state = {}) {
      const pressure = stormPressure(state);
      const progress = rescueProgress(state);
      return routeWindow(state, 7).slice(0, 5).map((ledge, order) => {
        const visibility = clamp(0.44 + progress * 0.28 + (ledge.safe ? 0.16 : 0.04) - pressure * 0.2 - order * 0.025);
        return {
          id: `${state.levelId ?? "next-ledge"}:phosphor-anchor:${ledge.id ?? order}`,
          kind: "next-ledge-phosphor-anchor",
          order,
          ledgeId: ledge.id,
          position: point({ x: n(ledge.x) - 10, y: n(ledge.y) + 18, z: 14 }),
          visibility,
          glowRadius: Math.round(28 + visibility * 92),
          anchorState: visibility > 0.75 ? "visible-from-stormline" : visibility > 0.48 ? "needs-second-coat" : "lost-in-spindrift",
          rendererContract: CONTRACT
        };
      });
    }
  };
}

export function createSnowFlagBreadcrumbKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-snow-flag-breadcrumb-kit",
    describe(state = {}, graph = {}) {
      const anchors = graph.phosphorAnchors ?? [];
      return routeWindow(state, 8).slice(0, 6).map((ledge, order) => {
        const anchor = anchors[order % Math.max(1, anchors.length)] ?? {};
        const clarity = clamp(n(anchor.visibility, 0.45) * 0.55 + rescueProgress(state) * 0.25 + (ledge.type === "rest" ? 0.1 : 0) - stormPressure(state) * 0.18);
        return {
          id: `${state.levelId ?? "next-ledge"}:snow-flag:${ledge.id ?? order}`,
          kind: "next-ledge-snow-flag-breadcrumb",
          order,
          ledgeId: ledge.id,
          position: point({ x: n(ledge.x) + 14, y: n(ledge.y) + 12, z: 11 }),
          clarity,
          flagCount: Math.max(2, Math.round(3 + clarity * 7)),
          breadcrumbState: clarity > 0.72 ? "route-legible" : clarity > 0.46 ? "replant-flags" : "whiteout-gap",
          rendererContract: CONTRACT
        };
      });
    }
  };
}

export function createDronePerchKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-drone-perch-kit",
    describe(state = {}, graph = {}) {
      const routeClarity = average(graph.snowFlagBreadcrumbs, (flag) => flag.clarity);
      const pressure = stormPressure(state);
      return safeSites(state).slice(0, 4).map((ledge, order) => {
        const battery = clamp(0.42 + rescueProgress(state) * 0.32 + routeClarity * 0.18 - pressure * 0.24 - order * 0.035);
        return {
          id: `${state.levelId ?? "next-ledge"}:drone-perch:${ledge.id ?? order}`,
          kind: "next-ledge-drone-perch",
          order,
          ledgeId: ledge.id,
          position: point({ x: n(ledge.x) + 28, y: n(ledge.y) + 32, z: 26 }),
          battery,
          rotorCount: Math.max(2, Math.round(2 + battery * 4)),
          perchState: battery > 0.76 ? "relay-drone-ready" : battery > 0.5 ? "swap-battery" : "grounded-by-storm",
          rendererContract: CONTRACT
        };
      });
    }
  };
}

export function createRescueCableSpoolKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-rescue-cable-spool-kit",
    describe(state = {}, graph = {}) {
      const route = routeWindow(state, 7);
      const perchPower = average(graph.dronePerches, (perch) => perch.battery);
      return route.slice(0, 5).map((ledge, order) => {
        const next = route[order + 1] ?? ledge;
        const tension = clamp(0.36 + distance(ledge, next) / 520 + stormPressure(state) * 0.34 - perchPower * 0.18);
        return {
          id: `${state.levelId ?? "next-ledge"}:rescue-cable:${ledge.id ?? order}`,
          kind: "next-ledge-rescue-cable-spool",
          order,
          ledgeId: ledge.id,
          start: point({ x: n(ledge.x), y: n(ledge.y) + 22, z: 18 }),
          end: point({ x: n(next.x), y: n(next.y) + 22, z: 18 }),
          tension,
          cableMeters: Math.round(42 + distance(ledge, next) * 0.55),
          spoolState: tension > 0.74 ? "tension-brake-required" : tension > 0.5 ? "crew-belayer-needed" : "spool-cleared",
          rendererContract: CONTRACT
        };
      });
    }
  };
}

export function createHeatBeaconFlareKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-heat-beacon-flare-kit",
    describe(state = {}, graph = {}) {
      const routeClarity = average(graph.snowFlagBreadcrumbs, (flag) => flag.clarity);
      const cableSafety = 1 - Math.max(0, ...(graph.rescueCableSpools ?? []).map((spool) => n(spool.tension)));
      return safeSites(state).slice(0, 4).map((ledge, order) => {
        const warmth = clamp(0.38 + staminaRatio(state) * 0.18 + routeClarity * 0.22 + cableSafety * 0.2 - stormPressure(state) * 0.16 - order * 0.025);
        return {
          id: `${state.levelId ?? "next-ledge"}:heat-beacon:${ledge.id ?? order}`,
          kind: "next-ledge-heat-beacon-flare",
          order,
          ledgeId: ledge.id,
          position: point({ x: n(ledge.x) - 24, y: n(ledge.y) + 18, z: 16 }),
          warmth,
          flarePulse: Math.round(2 + warmth * 8),
          beaconState: warmth > 0.74 ? "survivor-visible" : warmth > 0.5 ? "add-fuel" : "beacon-at-risk",
          rendererContract: CONTRACT
        };
      });
    }
  };
}

export function createExtractionLedgerKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-extraction-ledger-kit",
    describe(state = {}, graph = {}) {
      const readiness = clamp(
        average(graph.phosphorAnchors, (anchor) => anchor.visibility) * 0.18 +
        average(graph.snowFlagBreadcrumbs, (flag) => flag.clarity) * 0.18 +
        average(graph.dronePerches, (perch) => perch.battery) * 0.2 +
        (1 - Math.max(0, ...(graph.rescueCableSpools ?? []).map((spool) => n(spool.tension)))) * 0.18 +
        average(graph.heatBeaconFlares, (flare) => flare.warmth) * 0.18 +
        rescueProgress(state) * 0.08
      );
      const pressure = stormPressure(state);
      return [{
        id: `${state.levelId ?? "next-ledge"}:drone-relay-extraction-ledger`,
        kind: "next-ledge-extraction-ledger",
        readiness,
        stormPressure: pressure,
        phase: readiness > 0.82 ? "launch-drone-extraction" : readiness > 0.62 ? "clear-cable-spools" : readiness > 0.42 ? "mark-whiteout-route" : "find-survivor-ledge",
        survivorSlots: Math.max(1, Math.round(1 + readiness * 5 - pressure * 2)),
        rendererContract: CONTRACT
      }];
    }
  };
}

export function createDroneRelayRescueRendererHandoffKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-drone-relay-rescue-renderer-handoff-kit",
    describe(graph = {}) {
      const descriptors = [
        ...(graph.phosphorAnchors ?? []),
        ...(graph.snowFlagBreadcrumbs ?? []),
        ...(graph.dronePerches ?? []),
        ...(graph.rescueCableSpools ?? []),
        ...(graph.heatBeaconFlares ?? []),
        ...(graph.extractionLedgers ?? [])
      ];
      return {
        id: "next-ledge-drone-relay-rescue-readiness-renderer-handoff",
        kind: "renderer-handoff",
        descriptorCount: descriptors.length,
        descriptors,
        rendererContract: CONTRACT,
        counts: {
          phosphorAnchors: graph.phosphorAnchors?.length ?? 0,
          snowFlagBreadcrumbs: graph.snowFlagBreadcrumbs?.length ?? 0,
          dronePerches: graph.dronePerches?.length ?? 0,
          rescueCableSpools: graph.rescueCableSpools?.length ?? 0,
          heatBeaconFlares: graph.heatBeaconFlares?.length ?? 0,
          extractionLedgers: graph.extractionLedgers?.length ?? 0,
          total: descriptors.length
        }
      };
    }
  };
}

export function createNextLedgeDroneRelayRescueReadinessDomainKit(options = {}) {
  const phosphorAnchor = options.phosphorAnchorKit ?? createPhosphorAnchorKit(options.phosphorAnchor ?? {});
  const snowFlag = options.snowFlagBreadcrumbKit ?? createSnowFlagBreadcrumbKit(options.snowFlagBreadcrumb ?? {});
  const dronePerch = options.dronePerchKit ?? createDronePerchKit(options.dronePerch ?? {});
  const cableSpool = options.rescueCableSpoolKit ?? createRescueCableSpoolKit(options.rescueCableSpool ?? {});
  const heatBeacon = options.heatBeaconFlareKit ?? createHeatBeaconFlareKit(options.heatBeaconFlare ?? {});
  const ledger = options.extractionLedgerKit ?? createExtractionLedgerKit(options.extractionLedger ?? {});
  const handoff = options.rendererHandoffKit ?? createDroneRelayRescueRendererHandoffKit(options.rendererHandoff ?? {});

  return {
    id: options.id ?? "next-ledge-drone-relay-rescue-readiness-domain-kit",
    tree: NEXT_LEDGE_DRONE_RELAY_RESCUE_TREE,
    kits: [phosphorAnchor.id, snowFlag.id, dronePerch.id, cableSpool.id, heatBeacon.id, ledger.id, handoff.id],
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
      storage: false
    },
    describe(state = {}) {
      const phosphorAnchors = phosphorAnchor.describe(state);
      const snowFlagBreadcrumbs = snowFlag.describe(state, { phosphorAnchors });
      const dronePerches = dronePerch.describe(state, { snowFlagBreadcrumbs });
      const rescueCableSpools = cableSpool.describe(state, { dronePerches });
      const heatBeaconFlares = heatBeacon.describe(state, { snowFlagBreadcrumbs, rescueCableSpools });
      const extractionLedgers = ledger.describe(state, { phosphorAnchors, snowFlagBreadcrumbs, dronePerches, rescueCableSpools, heatBeaconFlares });
      const groups = { phosphorAnchors, snowFlagBreadcrumbs, dronePerches, rescueCableSpools, heatBeaconFlares, extractionLedgers };
      const primaryLedger = extractionLedgers[0] ?? { readiness: 0, stormPressure: stormPressure(state), phase: "find-survivor-ledge" };
      return {
        id: "next-ledge-drone-relay-rescue-readiness",
        kind: "domain-readiness",
        tree: NEXT_LEDGE_DRONE_RELAY_RESCUE_TREE,
        rendererContract: CONTRACT,
        ...groups,
        rendererHandoff: handoff.describe(groups),
        summary: {
          readiness: primaryLedger.readiness,
          stormPressure: primaryLedger.stormPressure,
          phase: primaryLedger.phase,
          survivorSlots: primaryLedger.survivorSlots ?? 1,
          routeMarks: phosphorAnchors.length + snowFlagBreadcrumbs.length
        }
      };
    }
  };
}

export default createNextLedgeDroneRelayRescueReadinessDomainKit;
