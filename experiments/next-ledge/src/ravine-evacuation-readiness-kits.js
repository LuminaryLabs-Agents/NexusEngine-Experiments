const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, num(value, min)));
const clamp01 = (value) => clamp(value, 0, 1);
const point = (source = {}, fallback = {}) => ({
  x: num(source.x, fallback.x ?? 0),
  y: num(source.y, fallback.y ?? 0),
  z: num(source.z, fallback.z ?? 1)
});
const distance = (a = {}, b = {}) => Math.hypot(num(a.x) - num(b.x), num(a.y) - num(b.y));
const orderedLedges = (snapshot = {}) => Array.isArray(snapshot.route?.ledges) ? snapshot.route.ledges : [];

export const NEXT_LEDGE_RAVINE_EVACUATION_READINESS_TREE = `
next-ledge-ravine-evacuation-readiness-domain
├─ casualty-location-domain
│  ├─ ravine-caller-domain
│  │  └─ next-ledge-ravine-caller-beacon-kit
│  └─ cliff-stretcher-domain
│     └─ next-ledge-cliff-stretcher-route-kit
├─ safety-rigging-domain
│  ├─ pulley-anchor-domain
│  │  └─ next-ledge-pulley-anchor-array-kit
│  └─ crosswind-gap-domain
│     └─ next-ledge-crosswind-gap-window-kit
├─ extraction-handoff-domain
│  ├─ signal-smoke-domain
│  │  └─ next-ledge-signal-smoke-column-kit
│  └─ valley-pickup-domain
│     └─ next-ledge-valley-pickup-zone-kit
└─ renderer-handoff
   └─ next-ledge-ravine-evacuation-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;

const RENDERER_CONTRACT = "renderer consumes descriptors only; casualty location, rigging safety, crosswind timing, smoke signals, pickup zones, browser input, physics, asset loading, audio, and frame-loop truth stay outside renderer presentation";

function currentIndex(snapshot = {}) {
  const ledges = orderedLedges(snapshot);
  const current = snapshot.currentAnchorId ?? snapshot.lastLedgeId;
  const index = ledges.findIndex((ledge) => ledge.id === current);
  return Math.max(0, index < 0 ? 0 : index);
}

function playerPoint(snapshot = {}) {
  return point(snapshot.player, { x: 0, y: 0, z: 2 });
}

function nextReachableLedges(snapshot = {}, count = 5) {
  const ledges = orderedLedges(snapshot);
  const index = currentIndex(snapshot);
  const enabled = new Set(Array.isArray(snapshot.enabledTargetIds) ? snapshot.enabledTargetIds : []);
  const candidates = ledges.slice(index + 1, index + 1 + count);
  return candidates.length ? candidates.map((ledge) => ({ ...ledge, enabled: enabled.size ? enabled.has(ledge.id) : true })) : ledges.slice(-count).map((ledge) => ({ ...ledge, enabled: true }));
}

function risk(snapshot = {}, rescueLine = {}, summitBivouac = {}) {
  const p = playerPoint(snapshot);
  const staminaRatio = clamp01(num(snapshot.stamina, 0) / Math.max(1, num(snapshot.constants?.maxStamina, 115)));
  const verticalDrop = clamp01(Math.max(0, num(snapshot.anchorLedge?.y, p.y) - p.y) / Math.max(1, num(snapshot.tuning?.failFloorDistance, snapshot.constants?.failFloorDistance ?? 520)));
  const strain = Math.max(0, ...(rescueLine.tetherStrainPulses ?? []).map((pulse) => num(pulse.strain, 0)));
  const exposure = Math.max(0, ...(summitBivouac.stormExposureBands ?? []).map((band) => num(band.severity, 0)));
  return clamp01((1 - staminaRatio) * 0.28 + verticalDrop * 0.24 + strain * 0.24 + exposure * 0.24);
}

function summitOrLast(snapshot = {}) {
  const ledges = orderedLedges(snapshot);
  return ledges.find((ledge) => ledge.type === "summit") ?? ledges.at(-1) ?? point(snapshot.anchorLedge, { x: 0, y: 0, z: 2 });
}

export function createRavineCallerBeaconKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-ravine-caller-beacon-kit",
    describe(snapshot = {}, rescueLine = {}, summitBivouac = {}) {
      const p = playerPoint(snapshot);
      const severity = risk(snapshot, rescueLine, summitBivouac);
      return nextReachableLedges(snapshot, 4).slice(0, 3).map((ledge, order) => {
        const gap = distance(p, ledge);
        const urgency = clamp01(severity * 0.55 + gap / 620 * 0.3 + order * 0.07 + (ledge.enabled ? 0 : 0.12));
        return {
          id: `${snapshot.levelId ?? "next-ledge"}:ravine-caller:${ledge.id}`,
          kind: "next-ledge-ravine-caller-beacon",
          casualtyId: ledge.id,
          order,
          position: point(ledge, { z: 6 }),
          urgency,
          callSign: urgency > 0.68 ? "critical-call" : "steady-call",
          rendererContract: RENDERER_CONTRACT
        };
      });
    }
  };
}

export function createCliffStretcherRouteKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-cliff-stretcher-route-kit",
    describe(snapshot = {}, rescueLine = {}) {
      const p = playerPoint(snapshot);
      const ledges = nextReachableLedges(snapshot, 6);
      return ledges.slice(0, 4).map((ledge, order) => {
        const previous = order === 0 ? p : point(ledges[order - 1], { z: 4 });
        const end = point(ledge, { z: 4 });
        const strain = Math.max(0, ...(rescueLine.tetherStrainPulses ?? []).map((pulse) => num(pulse.strain, 0)));
        const steepness = clamp01(Math.max(0, end.y - previous.y) / 260 + strain * 0.2);
        return {
          id: `${snapshot.levelId ?? "next-ledge"}:stretcher-route:${ledge.id}`,
          kind: "next-ledge-cliff-stretcher-route",
          routeId: ledge.id,
          order,
          start: previous,
          end,
          steepness,
          carryCadence: steepness > 0.62 ? "slow-belay-carry" : "two-step-carry",
          rendererContract: RENDERER_CONTRACT
        };
      });
    }
  };
}

export function createPulleyAnchorArrayKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-pulley-anchor-array-kit",
    describe(snapshot = {}, rescueLine = {}) {
      const triages = Array.isArray(rescueLine.rescueAnchorTriages) ? rescueLine.rescueAnchorTriages : [];
      const ledges = nextReachableLedges(snapshot, 5);
      const sources = triages.length ? triages : ledges.map((ledge, order) => ({ id: ledge.id, reachable: ledge.enabled, rescueScore: 0.42 + order * 0.08, position: ledge }));
      return sources.slice(0, 5).map((source, order) => {
        const score = clamp01(num(source.rescueScore, 0.4) + (source.reachable ? 0.18 : -0.08));
        return {
          id: `${snapshot.levelId ?? "next-ledge"}:pulley-anchor:${source.id ?? order}`,
          kind: "next-ledge-pulley-anchor-array",
          anchorId: source.id ?? `anchor-${order}`,
          order,
          position: point(source.position ?? ledges[order] ?? {}, { z: 5 }),
          redundancy: Math.max(1, Math.round(1 + score * 3)),
          stability: score,
          rendererContract: RENDERER_CONTRACT
        };
      });
    }
  };
}

export function createCrosswindGapWindowKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-crosswind-gap-window-kit",
    describe(snapshot = {}, rescueLine = {}, summitBivouac = {}) {
      const p = playerPoint(snapshot);
      const severity = risk(snapshot, rescueLine, summitBivouac);
      const speed = Math.hypot(num(snapshot.player?.vx), num(snapshot.player?.vy));
      return nextReachableLedges(snapshot, 4).slice(0, 3).map((ledge, order) => {
        const timing = clamp01(0.84 - severity * 0.48 - speed / 90 + (ledge.enabled ? 0.08 : -0.12) - order * 0.04);
        return {
          id: `${snapshot.levelId ?? "next-ledge"}:crosswind-gap:${ledge.id}`,
          kind: "next-ledge-crosswind-gap-window",
          gapId: ledge.id,
          order,
          start: p,
          end: point(ledge, { z: 5 }),
          timing,
          windowState: timing > 0.62 ? "open" : timing > 0.38 ? "narrow" : "closed",
          rendererContract: RENDERER_CONTRACT
        };
      });
    }
  };
}

export function createSignalSmokeColumnKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-signal-smoke-column-kit",
    describe(snapshot = {}, rescueLine = {}, summitBivouac = {}) {
      const p = playerPoint(snapshot);
      const shelters = summitBivouac.bivouacShelterPockets ?? [];
      const sources = shelters.length ? shelters : nextReachableLedges(snapshot, 4).map((ledge) => ({ position: ledge, warmth: 0.42, shelterId: ledge.id }));
      return sources.slice(0, 3).map((source, order) => {
        const clarity = clamp01(0.54 + num(source.warmth, 0.4) * 0.3 - risk(snapshot, rescueLine, summitBivouac) * 0.22 + order * 0.03);
        return {
          id: `${snapshot.levelId ?? "next-ledge"}:signal-smoke:${source.shelterId ?? order}`,
          kind: "next-ledge-signal-smoke-column",
          order,
          position: point(source.position, p),
          height: 36 + clarity * 72,
          clarity,
          signal: clarity > 0.7 ? "visible-to-valley" : "needs-fanning",
          rendererContract: RENDERER_CONTRACT
        };
      });
    }
  };
}

export function createValleyPickupZoneKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-valley-pickup-zone-kit",
    describe(snapshot = {}, rescueLine = {}, summitBivouac = {}) {
      const p = playerPoint(snapshot);
      const summit = summitOrLast(snapshot);
      const progress = clamp01(currentIndex(snapshot) / Math.max(1, orderedLedges(snapshot).length - 1));
      const readiness = clamp01(progress * 0.5 + (1 - risk(snapshot, rescueLine, summitBivouac)) * 0.28 + (num(snapshot.stamina, 0) / Math.max(1, num(snapshot.constants?.maxStamina, 115))) * 0.22);
      return [{
        id: `${snapshot.levelId ?? "next-ledge"}:valley-pickup-zone`,
        kind: "next-ledge-valley-pickup-zone",
        start: p,
        end: point(summit, { z: 8 }),
        readiness,
        zoneState: readiness > 0.76 ? "ready" : readiness > 0.48 ? "assembling" : "blocked",
        stretcherCapacity: Math.max(1, Math.round(1 + readiness * 4)),
        rendererContract: RENDERER_CONTRACT
      }];
    }
  };
}

export function createRavineEvacuationRendererHandoffKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-ravine-evacuation-renderer-handoff-kit",
    describe(groups = {}) {
      const descriptors = [
        ...(groups.ravineCallerBeacons ?? []),
        ...(groups.cliffStretcherRoutes ?? []),
        ...(groups.pulleyAnchorArrays ?? []),
        ...(groups.crosswindGapWindows ?? []),
        ...(groups.signalSmokeColumns ?? []),
        ...(groups.valleyPickupZones ?? [])
      ];
      return {
        id: "next-ledge-ravine-evacuation-readiness-renderer-handoff",
        kind: "renderer-handoff",
        descriptorCount: descriptors.length,
        descriptors,
        rendererContract: RENDERER_CONTRACT,
        counts: {
          ravineCallerBeacons: groups.ravineCallerBeacons?.length ?? 0,
          cliffStretcherRoutes: groups.cliffStretcherRoutes?.length ?? 0,
          pulleyAnchorArrays: groups.pulleyAnchorArrays?.length ?? 0,
          crosswindGapWindows: groups.crosswindGapWindows?.length ?? 0,
          signalSmokeColumns: groups.signalSmokeColumns?.length ?? 0,
          valleyPickupZones: groups.valleyPickupZones?.length ?? 0
        }
      };
    }
  };
}

export function createNextLedgeRavineEvacuationReadinessDomainKit(options = {}) {
  const caller = options.ravineCallerBeaconKit ?? createRavineCallerBeaconKit(options.ravineCallerBeacon ?? {});
  const stretcher = options.cliffStretcherRouteKit ?? createCliffStretcherRouteKit(options.cliffStretcherRoute ?? {});
  const pulley = options.pulleyAnchorArrayKit ?? createPulleyAnchorArrayKit(options.pulleyAnchorArray ?? {});
  const wind = options.crosswindGapWindowKit ?? createCrosswindGapWindowKit(options.crosswindGapWindow ?? {});
  const smoke = options.signalSmokeColumnKit ?? createSignalSmokeColumnKit(options.signalSmokeColumn ?? {});
  const pickup = options.valleyPickupZoneKit ?? createValleyPickupZoneKit(options.valleyPickupZone ?? {});
  const handoff = options.rendererHandoffKit ?? createRavineEvacuationRendererHandoffKit(options.rendererHandoff ?? {});
  return {
    id: options.id ?? "next-ledge-ravine-evacuation-readiness-domain-kit",
    tree: NEXT_LEDGE_RAVINE_EVACUATION_READINESS_TREE,
    describe(snapshot = {}, rescueLine = {}, summitBivouac = {}) {
      const ravineCallerBeacons = caller.describe(snapshot, rescueLine, summitBivouac);
      const cliffStretcherRoutes = stretcher.describe(snapshot, rescueLine, summitBivouac);
      const pulleyAnchorArrays = pulley.describe(snapshot, rescueLine, summitBivouac);
      const crosswindGapWindows = wind.describe(snapshot, rescueLine, summitBivouac);
      const signalSmokeColumns = smoke.describe(snapshot, rescueLine, summitBivouac);
      const valleyPickupZones = pickup.describe(snapshot, rescueLine, summitBivouac);
      const rendererHandoff = handoff.describe({ ravineCallerBeacons, cliffStretcherRoutes, pulleyAnchorArrays, crosswindGapWindows, signalSmokeColumns, valleyPickupZones });
      return {
        id: "next-ledge-ravine-evacuation-readiness-domain",
        kind: "domain",
        tree: NEXT_LEDGE_RAVINE_EVACUATION_READINESS_TREE,
        ravineCallerBeacons,
        cliffStretcherRoutes,
        pulleyAnchorArrays,
        crosswindGapWindows,
        signalSmokeColumns,
        valleyPickupZones,
        rendererHandoff,
        summary: {
          descriptorCount: rendererHandoff.descriptorCount,
          callers: ravineCallerBeacons.length,
          stretcherRoutes: cliffStretcherRoutes.length,
          windWindowsOpen: crosswindGapWindows.filter((gapWindow) => gapWindow.windowState === "open").length,
          pickupReady: valleyPickupZones.some((zone) => zone.zoneState === "ready"),
          rendererContract: RENDERER_CONTRACT
        }
      };
    }
  };
}
