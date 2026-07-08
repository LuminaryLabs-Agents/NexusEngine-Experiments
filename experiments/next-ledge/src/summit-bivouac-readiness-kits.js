const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, num(value, min)));
const clamp01 = (value) => clamp(value, 0, 1);
const point = (source = {}, fallback = {}) => ({
  x: num(source.x, fallback.x ?? 0),
  y: num(source.y, fallback.y ?? 0),
  z: num(source.z, fallback.z ?? 1)
});
const dist = (a = {}, b = {}) => Math.hypot(num(a.x) - num(b.x), num(a.y) - num(b.y));

export const NEXT_LEDGE_SUMMIT_BIVOUAC_READINESS_TREE = `
next-ledge-summit-bivouac-readiness-domain
├─ exposure-survival-domain
│  ├─ storm-exposure-domain
│  │  └─ next-ledge-storm-exposure-band-kit
│  └─ bivouac-shelter-domain
│     └─ next-ledge-bivouac-shelter-pocket-kit
├─ team-assurance-domain
│  ├─ partner-belay-domain
│  │  └─ next-ledge-partner-belay-echo-kit
│  └─ med-cache-domain
│     └─ next-ledge-med-cache-station-kit
├─ summit-return-domain
│  ├─ route-flag-domain
│  │  └─ next-ledge-route-flag-thread-kit
│  └─ evacuation-flare-domain
│     └─ next-ledge-evacuation-flare-window-kit
└─ renderer-handoff
   └─ next-ledge-summit-bivouac-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;

function orderedLedges(snapshot = {}) {
  return Array.isArray(snapshot.route?.ledges) ? snapshot.route.ledges : [];
}

function playerPoint(snapshot = {}) {
  return point(snapshot.player, { x: 0, y: 0, z: 2 });
}

function currentIndex(snapshot = {}) {
  const ledges = orderedLedges(snapshot);
  const current = snapshot.currentAnchorId ?? snapshot.lastLedgeId;
  const index = ledges.findIndex((ledge) => ledge.id === current);
  return Math.max(0, index < 0 ? 0 : index);
}

function progressRatio(snapshot = {}) {
  const ledges = orderedLedges(snapshot);
  return clamp01(currentIndex(snapshot) / Math.max(1, ledges.length - 1));
}

function exposure(snapshot = {}, rescueReadiness = {}) {
  const p = playerPoint(snapshot);
  const altitude = Math.max(0, p.y);
  const velocity = Math.hypot(num(snapshot.player?.vx), num(snapshot.player?.vy));
  const staminaRatio = clamp01(num(snapshot.stamina, 0) / Math.max(1, num(snapshot.constants?.maxStamina, 115)));
  const strains = (rescueReadiness.tetherStrainPulses ?? []).map((entry) => num(entry.strain, 0));
  const strain = strains.length ? Math.max(...strains) : 0;
  return clamp01(altitude / 1500 * 0.34 + velocity / 48 * 0.22 + (1 - staminaRatio) * 0.24 + strain * 0.2);
}

function restLedgesAhead(snapshot = {}) {
  const index = currentIndex(snapshot);
  return orderedLedges(snapshot)
    .slice(index + 1)
    .filter((ledge) => ledge.type === "rest" || /rest|shelter|camp/i.test(String(ledge.label ?? "")));
}

function summitLedge(snapshot = {}) {
  const ledges = orderedLedges(snapshot);
  return ledges.find((ledge) => ledge.type === "summit") ?? ledges.at(-1) ?? null;
}

export function createStormExposureBandKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-storm-exposure-band-kit",
    describe(snapshot = {}, rescueReadiness = {}) {
      const p = playerPoint(snapshot);
      const severity = exposure(snapshot, rescueReadiness);
      const drift = num(snapshot.player?.vx, 0) * 0.18;
      return [{
        id: `${snapshot.levelId ?? "next-ledge"}:storm-exposure-band`,
        kind: "next-ledge-storm-exposure-band",
        position: { x: p.x + drift, y: p.y + 74 + severity * 42, z: 9 },
        width: 96 + severity * 160,
        height: 22 + severity * 36,
        severity,
        safeWindow: Math.max(4, Math.round(18 - severity * 11)),
        label: severity > 0.68 ? "storm exposure critical" : severity > 0.42 ? "storm exposure building" : "weather gap usable"
      }];
    }
  };
}

export function createBivouacShelterPocketKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-bivouac-shelter-pocket-kit",
    describe(snapshot = {}) {
      const p = playerPoint(snapshot);
      const shelters = restLedgesAhead(snapshot);
      const fallback = orderedLedges(snapshot).slice(currentIndex(snapshot) + 1, currentIndex(snapshot) + 4);
      return (shelters.length ? shelters : fallback)
        .map((ledge) => {
          const distance = dist(p, ledge);
          const verticalGain = num(ledge.y) - p.y;
          const warmth = clamp01(0.88 - distance / 420 + (ledge.type === "rest" ? 0.22 : 0) - Math.max(0, verticalGain - 220) / 520);
          return { ledge, distance, warmth };
        })
        .sort((a, b) => b.warmth - a.warmth || a.distance - b.distance)
        .slice(0, 3)
        .map((entry, order) => ({
          id: `${snapshot.levelId ?? "next-ledge"}:bivouac-shelter:${entry.ledge.id}`,
          kind: "next-ledge-bivouac-shelter-pocket",
          shelterId: entry.ledge.id,
          order,
          position: point(entry.ledge, { z: 5 }),
          radius: num(entry.ledge.r, 8) + 16 + entry.warmth * 24,
          warmth: entry.warmth,
          label: entry.warmth > 0.7 ? "safe bivouac pocket" : "temporary shelter pocket"
        }));
    }
  };
}

export function createPartnerBelayEchoKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-partner-belay-echo-kit",
    describe(snapshot = {}, rescueReadiness = {}) {
      const p = playerPoint(snapshot);
      const triages = rescueReadiness.rescueAnchorTriages ?? [];
      const best = triages.find((entry) => entry.reachable) ?? triages[0];
      const anchor = point(best?.position ?? snapshot.anchorLedge ?? snapshot.rope?.start, p);
      const confidence = clamp01(num(best?.rescueScore, 0.4) + progressRatio(snapshot) * 0.22 - exposure(snapshot, rescueReadiness) * 0.18);
      return [{
        id: `${snapshot.levelId ?? "next-ledge"}:partner-belay-echo`,
        kind: "next-ledge-partner-belay-echo",
        start: p,
        end: anchor,
        confidence,
        cadence: 0.8 + confidence * 1.4,
        label: confidence > 0.68 ? "belay partner synced" : "belay call needs confirmation"
      }];
    }
  };
}

export function createMedCacheStationKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-med-cache-station-kit",
    describe(snapshot = {}) {
      const p = playerPoint(snapshot);
      const staminaRatio = clamp01(num(snapshot.stamina, 0) / Math.max(1, num(snapshot.constants?.maxStamina, 115)));
      return restLedgesAhead(snapshot)
        .map((ledge) => ({ ledge, distance: dist(p, ledge), staminaRatio }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3)
        .map((entry, order) => ({
          id: `${snapshot.levelId ?? "next-ledge"}:med-cache:${entry.ledge.id}`,
          kind: "next-ledge-med-cache-station",
          cacheId: entry.ledge.id,
          order,
          position: point(entry.ledge, { z: 6 }),
          urgency: clamp01((1 - entry.staminaRatio) * 0.78 + order * 0.08),
          supply: Math.max(1, Math.round(4 - order + (entry.ledge.type === "rest" ? 1 : 0))),
          label: entry.staminaRatio < 0.35 ? "med cache priority" : "med cache optional"
        }));
    }
  };
}

export function createRouteFlagThreadKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-route-flag-thread-kit",
    describe(snapshot = {}) {
      const p = playerPoint(snapshot);
      const index = currentIndex(snapshot);
      const ledges = orderedLedges(snapshot);
      return ledges
        .slice(index + 1, index + 7)
        .map((ledge, order) => ({
          id: `${snapshot.levelId ?? "next-ledge"}:route-flag:${ledge.id}`,
          kind: "next-ledge-route-flag-thread",
          flagId: ledge.id,
          order,
          start: order === 0 ? p : point(ledges[index + order], { z: 5 }),
          end: point(ledge, { z: 5 }),
          commitment: clamp01(progressRatio(snapshot) + (6 - order) * 0.07),
          label: ledge.type === "summit" ? "summit flag" : "route flag"
        }));
    }
  };
}

export function createEvacuationFlareWindowKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-evacuation-flare-window-kit",
    describe(snapshot = {}, rescueReadiness = {}) {
      const p = playerPoint(snapshot);
      const summit = summitLedge(snapshot);
      if (!summit) return [];
      const progress = progressRatio(snapshot);
      const distance = dist(p, summit);
      const severity = exposure(snapshot, rescueReadiness);
      const readiness = clamp01(progress * 0.72 + (1 - distance / 900) * 0.22 + (1 - severity) * 0.06);
      return [{
        id: `${snapshot.levelId ?? "next-ledge"}:evacuation-flare-window`,
        kind: "next-ledge-evacuation-flare-window",
        start: p,
        end: point(summit, { z: 8 }),
        readiness,
        flareWindow: readiness > 0.8 ? "open" : readiness > 0.52 ? "approaching" : "locked",
        countdown: Math.max(3, Math.round(28 - readiness * 20)),
        label: readiness > 0.8 ? "flare window open" : "flare window forming"
      }];
    }
  };
}

export function createSummitBivouacRendererHandoffKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-summit-bivouac-renderer-handoff-kit",
    describe(groups = {}) {
      const descriptors = [
        ...(groups.stormExposureBands ?? []),
        ...(groups.bivouacShelterPockets ?? []),
        ...(groups.partnerBelayEchoes ?? []),
        ...(groups.medCacheStations ?? []),
        ...(groups.routeFlagThreads ?? []),
        ...(groups.evacuationFlareWindows ?? [])
      ];
      return {
        id: "next-ledge-summit-bivouac-readiness-renderer-handoff",
        kind: "renderer-handoff",
        descriptorCount: descriptors.length,
        descriptors,
        rendererContract: "renderer consumes descriptors only; survival exposure, belay assurance, medical cache, route flag, flare timing, browser input, and frame-loop truth stay outside renderer presentation",
        counts: {
          stormExposureBands: groups.stormExposureBands?.length ?? 0,
          bivouacShelterPockets: groups.bivouacShelterPockets?.length ?? 0,
          partnerBelayEchoes: groups.partnerBelayEchoes?.length ?? 0,
          medCacheStations: groups.medCacheStations?.length ?? 0,
          routeFlagThreads: groups.routeFlagThreads?.length ?? 0,
          evacuationFlareWindows: groups.evacuationFlareWindows?.length ?? 0
        }
      };
    }
  };
}

export function createNextLedgeSummitBivouacReadinessDomainKit(options = {}) {
  const storm = options.stormExposureBandKit ?? createStormExposureBandKit(options.stormExposureBand ?? {});
  const shelter = options.bivouacShelterPocketKit ?? createBivouacShelterPocketKit(options.bivouacShelterPocket ?? {});
  const belay = options.partnerBelayEchoKit ?? createPartnerBelayEchoKit(options.partnerBelayEcho ?? {});
  const med = options.medCacheStationKit ?? createMedCacheStationKit(options.medCacheStation ?? {});
  const flags = options.routeFlagThreadKit ?? createRouteFlagThreadKit(options.routeFlagThread ?? {});
  const flare = options.evacuationFlareWindowKit ?? createEvacuationFlareWindowKit(options.evacuationFlareWindow ?? {});
  const handoff = options.rendererHandoffKit ?? createSummitBivouacRendererHandoffKit(options.rendererHandoff ?? {});
  return {
    id: options.id ?? "next-ledge-summit-bivouac-readiness-domain-kit",
    tree: NEXT_LEDGE_SUMMIT_BIVOUAC_READINESS_TREE,
    describe(snapshot = {}, rescueReadiness = {}) {
      const stormExposureBands = storm.describe(snapshot, rescueReadiness);
      const bivouacShelterPockets = shelter.describe(snapshot, rescueReadiness);
      const partnerBelayEchoes = belay.describe(snapshot, rescueReadiness);
      const medCacheStations = med.describe(snapshot, rescueReadiness);
      const routeFlagThreads = flags.describe(snapshot, rescueReadiness);
      const evacuationFlareWindows = flare.describe(snapshot, rescueReadiness);
      const rendererHandoff = handoff.describe({ stormExposureBands, bivouacShelterPockets, partnerBelayEchoes, medCacheStations, routeFlagThreads, evacuationFlareWindows });
      return {
        id: "next-ledge-summit-bivouac-readiness-domain",
        kind: "domain",
        tree: NEXT_LEDGE_SUMMIT_BIVOUAC_READINESS_TREE,
        stormExposureBands,
        bivouacShelterPockets,
        partnerBelayEchoes,
        medCacheStations,
        routeFlagThreads,
        evacuationFlareWindows,
        rendererHandoff,
        summary: {
          descriptorCount: rendererHandoff.descriptorCount,
          exposureBandCount: stormExposureBands.length,
          shelterPocketCount: bivouacShelterPockets.length,
          flareReady: evacuationFlareWindows.some((entry) => entry.flareWindow === "open"),
          rendererContract: rendererHandoff.rendererContract
        }
      };
    }
  };
}
