const round = (value, places = 4) => Number(Number.isFinite(Number(value)) ? Number(value).toFixed(places) : 0);
const scalarFrom = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.max(0, Math.min(1, scalarFrom(value, 0)));
const safeArray = (value) => Array.isArray(value) ? value : [];
const hash01 = (seed, salt = 0) => {
  const x = Math.sin((Number(seed) + 1) * 29.317 + salt * 41.619) * 43758.5453;
  return x - Math.floor(x);
};
const average = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const rendererContract = (owner) => ({
  owner,
  renderer: "presentation-only",
  reusableKits: "plain-input-to-plain-descriptor-output",
  rendererConsumes: "serializable tropical coral restoration readiness descriptors only",
  rendererMustNotOwn: [
    "reef truth",
    "coral nursery state",
    "diver scheduling",
    "browser input",
    "DOM",
    "Three.js",
    "WebGL",
    "audio",
    "asset loading",
    "frame loop",
    "physics"
  ]
});

export const TROPICAL_CORAL_RESTORATION_READINESS_DOMAIN_TREE = `tropical-coral-restoration-readiness-domain
├─ reef-damage-survey-domain
│  ├─ bleaching-scan-domain
│  │  └─ tropical-coral-bleaching-scan-kit
│  └─ algae-pressure-domain
│     └─ tropical-algae-pressure-gauge-kit
├─ nursery-replant-domain
│  ├─ coral-fragment-cradle-domain
│  │  └─ tropical-coral-fragment-cradle-kit
│  └─ diver-transect-domain
│     └─ tropical-diver-transect-route-kit
├─ reef-protection-handoff-domain
│  ├─ turtle-safe-corridor-domain
│  │  └─ tropical-turtle-safe-corridor-kit
│  └─ dawn-reef-ledger-domain
│     └─ tropical-dawn-reef-ledger-kit
└─ renderer-handoff
   └─ tropical-coral-restoration-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

function tidePressure(input = {}) {
  const tideWindows = scalarFrom(input.tideSalvageReadiness?.rendererHandoff?.counts?.tideSurgeWindows, 0);
  const stormLanes = scalarFrom(input.stormClinicReadiness?.rendererHandoff?.counts?.raftStretcherLanes, 0);
  return clamp01(0.26 + tideWindows * 0.018 + stormLanes * 0.012);
}

export function createTropicalCoralBleachingScanKit(options = {}) {
  const id = "tropical-coral-bleaching-scan-kit";
  const count = Math.max(4, Math.min(8, Math.floor(options.count ?? 6)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      const rainwaterSupport = scalarFrom(input.rainwaterPurificationReadiness?.rendererHandoff?.counts?.dawnHydrationStations, 0);
      const pressure = tidePressure(input);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const bleachingRisk = clamp01(0.5 + Math.sin(time * 0.11 + index * 0.73) * 0.18 + pressure * 0.22 - rainwaterSupport * 0.01 + hash01(index, 3) * 0.16);
        return {
          id: `${id}-${index}`,
          kind: "tropical-coral-bleaching-scan",
          position: { x: round(lane * 0.94 + Math.sin(orbit + index) * 0.035), y: round(-0.08 + Math.cos(time * 0.08 + index) * 0.035) },
          radius: round(0.026 + bleachingRisk * 0.042),
          bleachingRisk: round(bleachingRisk),
          triageBand: bleachingRisk > 0.68 ? "urgent" : bleachingRisk > 0.46 ? "watch" : "stable",
          opacity: round(0.16 + bleachingRisk * 0.38),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalAlgaePressureGaugeKit(options = {}) {
  const id = "tropical-algae-pressure-gauge-kit";
  const count = Math.max(3, Math.min(7, Math.floor(options.count ?? 5)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const mangroveFlow = scalarFrom(input.mangroveNurseryReadiness?.rendererHandoff?.counts?.brackishChannelRibbons, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const algaePressure = clamp01(0.44 + Math.cos(time * 0.13 + index * 0.82) * 0.2 + hash01(index, 7) * 0.18 - mangroveFlow * 0.012);
        return {
          id: `${id}-${index}`,
          kind: "tropical-algae-pressure-gauge",
          start: { x: round(-0.7 + lane * 1.4), y: round(-0.34 + Math.sin(time * 0.06 + index) * 0.024) },
          end: { x: round(-0.6 + lane * 1.2), y: round(-0.46 + Math.cos(time * 0.07 + index) * 0.022) },
          algaePressure: round(algaePressure),
          scrubPriority: round(clamp01(algaePressure * 0.8 + 0.12)),
          width: round(0.006 + algaePressure * 0.014),
          opacity: round(0.13 + algaePressure * 0.36),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalCoralFragmentCradleKit(options = {}) {
  const id = "tropical-coral-fragment-cradle-kit";
  const count = Math.max(4, Math.min(8, Math.floor(options.count ?? 6)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const reefRescue = scalarFrom(input.reefRescueReadiness?.rendererHandoff?.counts?.snorkelSearchLanes, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const cradleReadiness = clamp01(0.42 + Math.sin(time * 0.1 + index * 0.63) * 0.16 + reefRescue * 0.014 + hash01(index, 11) * 0.2);
        return {
          id: `${id}-${index}`,
          kind: "tropical-coral-fragment-cradle",
          position: { x: round(lane * 0.72), y: round(-0.22 + Math.cos(time * 0.09 + index) * 0.026) },
          radius: round(0.024 + cradleReadiness * 0.036),
          cradleReadiness: round(cradleReadiness),
          fragmentsReady: Math.max(2, Math.round(4 + cradleReadiness * 12)),
          opacity: round(0.14 + cradleReadiness * 0.38),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalDiverTransectRouteKit(options = {}) {
  const id = "tropical-diver-transect-route-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const fishCount = safeArray(input.fish).length;
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const visibility = clamp01(0.5 + Math.cos(time * 0.12 + index * 0.77) * 0.18 + Math.min(fishCount, 12) * 0.008 + hash01(index, 13) * 0.16);
        return {
          id: `${id}-${index}`,
          kind: "tropical-diver-transect-route",
          start: { x: round(lane * 0.86 - 0.06), y: round(0.08 + Math.sin(time * 0.05 + index) * 0.024) },
          end: { x: round(lane * 0.54 + 0.08), y: round(-0.38 + Math.cos(time * 0.06 + index) * 0.026) },
          visibilityScore: round(visibility),
          routeWindow: visibility > 0.62 ? "open" : "guided",
          width: round(0.006 + visibility * 0.012),
          opacity: round(0.14 + visibility * 0.34),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalTurtleSafeCorridorKit(options = {}) {
  const id = "tropical-turtle-safe-corridor-kit";
  const count = Math.max(2, Math.min(5, Math.floor(options.count ?? 3)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const mangroveTags = scalarFrom(input.mangroveNurseryReadiness?.rendererHandoff?.counts?.dawnRangerTagLedgers, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const corridorSafety = clamp01(0.46 + Math.sin(time * 0.09 + index * 0.83) * 0.18 + mangroveTags * 0.012 + hash01(index, 17) * 0.18);
        return {
          id: `${id}-${index}`,
          kind: "tropical-turtle-safe-corridor",
          start: { x: round(-0.58 + lane * 1.16), y: round(0.32 + Math.cos(time * 0.04 + index) * 0.02) },
          end: { x: round(-0.4 + lane * 0.8), y: round(-0.52 + Math.sin(time * 0.05 + index) * 0.028) },
          corridorSafety: round(corridorSafety),
          hatchlingBypassReady: corridorSafety > 0.58,
          width: round(0.008 + corridorSafety * 0.014),
          opacity: round(0.14 + corridorSafety * 0.34),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalDawnReefLedgerKit(options = {}) {
  const id = "tropical-dawn-reef-ledger-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const priorOverlays = [
        scalarFrom(input.reefRescueReadiness?.rendererHandoff?.counts?.total, 0),
        scalarFrom(input.mangroveNurseryReadiness?.rendererHandoff?.counts?.total, 0),
        scalarFrom(input.rainwaterPurificationReadiness?.rendererHandoff?.counts?.total, 0)
      ];
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const readiness = clamp01(0.4 + Math.cos(time * 0.08 + index * 0.7) * 0.17 + average(priorOverlays) * 0.004 + hash01(index, 23) * 0.2);
        return {
          id: `${id}-${index}`,
          kind: "tropical-dawn-reef-ledger",
          position: { x: round(lane * 0.66), y: round(0.46 + Math.sin(time * 0.07 + index) * 0.024) },
          radius: round(0.028 + readiness * 0.034),
          reefReadiness: round(readiness),
          fragmentsLogged: Math.max(4, Math.round(8 + readiness * 18)),
          missionState: readiness > 0.7 ? "ready" : readiness > 0.48 ? "staging" : "survey",
          opacity: round(0.14 + readiness * 0.36),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalCoralRestorationRendererHandoffKit() {
  const id = "tropical-coral-restoration-renderer-handoff-kit";
  return {
    id,
    describe({ bleachingScans = [], algaePressureGauges = [], coralFragmentCradles = [], diverTransectRoutes = [], turtleSafeCorridors = [], dawnReefLedgers = [] } = {}) {
      const descriptors = { bleachingScans, algaePressureGauges, coralFragmentCradles, diverTransectRoutes, turtleSafeCorridors, dawnReefLedgers };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, safeArray(value).length]));
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id,
        kind: "renderer-handoff",
        domainTree: TROPICAL_CORAL_RESTORATION_READINESS_DOMAIN_TREE,
        contract: "renderer-consumes-descriptors-only",
        ownership: rendererContract(id),
        counts,
        descriptors
      };
    }
  };
}

export function createTropicalCoralRestorationReadinessDomainKit(options = {}) {
  const bleachingKit = createTropicalCoralBleachingScanKit(options.bleachingScans);
  const algaeKit = createTropicalAlgaePressureGaugeKit(options.algaePressureGauges);
  const cradleKit = createTropicalCoralFragmentCradleKit(options.coralFragmentCradles);
  const transectKit = createTropicalDiverTransectRouteKit(options.diverTransectRoutes);
  const turtleKit = createTropicalTurtleSafeCorridorKit(options.turtleSafeCorridors);
  const ledgerKit = createTropicalDawnReefLedgerKit(options.dawnReefLedgers);
  const handoffKit = createTropicalCoralRestorationRendererHandoffKit();
  return {
    id: "tropical-coral-restoration-readiness-domain-kit",
    domainTree: TROPICAL_CORAL_RESTORATION_READINESS_DOMAIN_TREE,
    kits: [bleachingKit, algaeKit, cradleKit, transectKit, turtleKit, ledgerKit, handoffKit],
    describe(input = {}) {
      const bleachingScans = bleachingKit.describe(input);
      const algaePressureGauges = algaeKit.describe(input);
      const coralFragmentCradles = cradleKit.describe(input);
      const diverTransectRoutes = transectKit.describe(input);
      const turtleSafeCorridors = turtleKit.describe(input);
      const dawnReefLedgers = ledgerKit.describe(input);
      const rendererHandoff = handoffKit.describe({ bleachingScans, algaePressureGauges, coralFragmentCradles, diverTransectRoutes, turtleSafeCorridors, dawnReefLedgers });
      const urgentBleaching = bleachingScans.filter((scan) => scan.triageBand === "urgent").length;
      const algaePressure = round(average(algaePressureGauges.map((gauge) => gauge.algaePressure)));
      const reefReadiness = round(clamp01(average([
        average(coralFragmentCradles.map((cradle) => cradle.cradleReadiness)),
        average(diverTransectRoutes.map((route) => route.visibilityScore)),
        average(turtleSafeCorridors.map((corridor) => corridor.corridorSafety)),
        average(dawnReefLedgers.map((ledger) => ledger.reefReadiness)),
        1 - algaePressure,
        1 - Math.min(1, urgentBleaching / Math.max(1, bleachingScans.length))
      ])));
      return {
        id: "tropical-coral-restoration-readiness",
        kind: "tropical-coral-restoration-readiness",
        reefReadiness,
        urgentBleaching,
        algaePressure,
        missionState: reefReadiness > 0.7 ? "ready" : reefReadiness > 0.48 ? "staging" : "survey",
        bleachingScans,
        algaePressureGauges,
        coralFragmentCradles,
        diverTransectRoutes,
        turtleSafeCorridors,
        dawnReefLedgers,
        rendererHandoff,
        domainTree: TROPICAL_CORAL_RESTORATION_READINESS_DOMAIN_TREE
      };
    }
  };
}
