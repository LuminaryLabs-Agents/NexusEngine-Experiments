const round = (value, places = 4) => Number(Number.isFinite(Number(value)) ? Number(value).toFixed(places) : 0);
const scalarFrom = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.max(0, Math.min(1, scalarFrom(value, 0)));
const safeArray = (value) => Array.isArray(value) ? value : [];
const hash01 = (seed, salt = 0) => {
  const x = Math.sin((Number(seed) + 1) * 23.711 + salt * 37.193) * 43758.5453;
  return x - Math.floor(x);
};
const rendererContract = (owner) => ({
  owner,
  renderer: "presentation-only",
  reusableKits: "plain-input-to-plain-descriptor-output",
  rendererConsumes: "serializable tropical mangrove nursery readiness descriptors only",
  rendererMustNotOwn: [
    "mangrove truth",
    "nursery state",
    "ranger scheduling",
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

export const TROPICAL_MANGROVE_NURSERY_READINESS_DOMAIN_TREE = `tropical-mangrove-nursery-readiness-domain
├─ seedling-source-domain
│  ├─ propagule-cluster-domain
│  │  └─ tropical-mangrove-propagule-cluster-kit
│  └─ root-nursery-domain
│     └─ tropical-root-nursery-cradle-kit
├─ shoreline-protection-domain
│  ├─ crab-burrow-domain
│  │  └─ tropical-crab-burrow-guard-kit
│  └─ brackish-channel-domain
│     └─ tropical-brackish-channel-ribbon-kit
├─ ranger-handoff-domain
│  ├─ heron-roost-domain
│  │  └─ tropical-heron-roost-watch-kit
│  └─ dawn-tagging-domain
│     └─ tropical-dawn-ranger-tag-ledger-kit
└─ renderer-handoff
   └─ tropical-mangrove-nursery-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createTropicalMangrovePropaguleClusterKit(options = {}) {
  const id = "tropical-mangrove-propagule-cluster-kit";
  const count = Math.max(3, Math.min(7, Math.floor(options.count ?? 5)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      const rainwater = scalarFrom(input.rainwaterPurificationReadiness?.rendererHandoff?.counts?.dawnHydrationStations, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const germination = clamp01(0.42 + hash01(index, 2) * 0.2 + Math.sin(time * 0.12 + index * 0.73) * 0.18 + rainwater * 0.018);
        return {
          id: `${id}-${index}`,
          kind: "tropical-mangrove-propagule-cluster",
          position: {
            x: round(lane * 0.84 + Math.sin(orbit + index) * 0.035),
            y: round(-0.28 + Math.cos(time * 0.08 + index) * 0.026)
          },
          radius: round(0.022 + germination * 0.035),
          germinationScore: round(germination),
          propagulesReady: Math.max(2, Math.round(4 + germination * 9)),
          opacity: round(0.14 + germination * 0.38),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalRootNurseryCradleKit(options = {}) {
  const id = "tropical-root-nursery-cradle-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const reefRescue = scalarFrom(input.reefRescueReadiness?.rendererHandoff?.counts?.snorkelSearchLanes, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const cradle = clamp01(0.46 + Math.cos(time * 0.1 + index * 0.64) * 0.18 + hash01(index, 5) * 0.18 + reefRescue * 0.012);
        return {
          id: `${id}-${index}`,
          kind: "tropical-root-nursery-cradle",
          start: { x: round(lane * 0.62 - 0.08), y: round(-0.16 + Math.sin(time * 0.06 + index) * 0.02) },
          end: { x: round(lane * 0.44 + 0.1), y: round(-0.34 + Math.cos(time * 0.07 + index) * 0.022) },
          cradleScore: round(cradle),
          shadePercent: Math.max(20, Math.round(38 + cradle * 45)),
          width: round(0.007 + cradle * 0.012),
          opacity: round(0.13 + cradle * 0.36),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalCrabBurrowGuardKit(options = {}) {
  const id = "tropical-crab-burrow-guard-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const tideSalvage = scalarFrom(input.tideSalvageReadiness?.rendererHandoff?.counts?.tideSurgeWindows, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const guard = clamp01(0.36 + Math.sin(time * 0.16 + index * 0.9) * 0.2 + hash01(index, 9) * 0.22 - tideSalvage * 0.01);
        return {
          id: `${id}-${index}`,
          kind: "tropical-crab-burrow-guard",
          position: { x: round(-0.62 + lane * 1.24), y: round(-0.39 + Math.cos(time * 0.1 + index) * 0.028) },
          radius: round(0.026 + guard * 0.032),
          guardScore: round(guard),
          crabPressure: round(1 - guard),
          fenceStakesNeeded: Math.max(1, Math.round(5 - guard * 3)),
          opacity: round(0.14 + guard * 0.34),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalBrackishChannelRibbonKit(options = {}) {
  const id = "tropical-brackish-channel-ribbon-kit";
  const count = Math.max(4, Math.min(7, Math.floor(options.count ?? 5)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      const stormClinic = scalarFrom(input.stormClinicReadiness?.rendererHandoff?.counts?.raftStretcherLanes, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const salinity = clamp01(0.4 + Math.cos(time * 0.13 + index * 0.72) * 0.18 + hash01(index, 12) * 0.18 + stormClinic * 0.01);
        return {
          id: `${id}-${index}`,
          kind: "tropical-brackish-channel-ribbon",
          start: { x: round(lane * 0.92), y: round(-0.08 + Math.sin(orbit + index) * 0.03) },
          end: { x: round(lane * 0.56 + Math.sin(time * 0.05 + index) * 0.05), y: round(-0.5 + Math.cos(orbit + index) * 0.03) },
          salinityBalance: round(salinity),
          flowScore: round(clamp01(1 - Math.abs(salinity - 0.62))),
          width: round(0.006 + salinity * 0.012),
          opacity: round(0.13 + salinity * 0.35),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalHeronRoostWatchKit(options = {}) {
  const id = "tropical-heron-roost-watch-kit";
  const count = Math.max(2, Math.min(5, Math.floor(options.count ?? 3)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const fishCount = safeArray(input.fish).length;
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const watch = clamp01(0.48 + Math.sin(time * 0.11 + index * 0.82) * 0.2 + hash01(index, 17) * 0.18 + Math.min(fishCount, 12) * 0.006);
        return {
          id: `${id}-${index}`,
          kind: "tropical-heron-roost-watch",
          position: { x: round(-0.52 + lane * 1.04), y: round(0.2 + Math.cos(time * 0.08 + index) * 0.022) },
          radius: round(0.032 + watch * 0.038),
          watchScore: round(watch),
          roostsStable: Math.max(1, Math.round(1 + watch * 4)),
          opacity: round(0.13 + watch * 0.38),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalDawnRangerTagLedgerKit(options = {}) {
  const id = "tropical-dawn-ranger-tag-ledger-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const purification = scalarFrom(input.rainwaterPurificationReadiness?.rendererHandoff?.counts?.total, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const readiness = clamp01(0.44 + Math.cos(time * 0.09 + index * 0.7) * 0.2 + hash01(index, 21) * 0.18 + purification * 0.003);
        return {
          id: `${id}-${index}`,
          kind: "tropical-dawn-ranger-tag-ledger",
          position: { x: round(lane * 0.72), y: round(0.36 + Math.sin(time * 0.1 + index) * 0.025) },
          radius: round(0.03 + readiness * 0.036),
          tagReadiness: round(readiness),
          seedlingsTagged: Math.max(3, Math.round(5 + readiness * 15)),
          departureWindowMinutes: round(24 - readiness * 8 + index * 2, 1),
          opacity: round(0.14 + readiness * 0.36),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalMangroveNurseryRendererHandoffKit() {
  const id = "tropical-mangrove-nursery-renderer-handoff-kit";
  return {
    id,
    describe({
      propaguleClusters = [],
      rootNurseryCradles = [],
      crabBurrowGuards = [],
      brackishChannelRibbons = [],
      heronRoostWatches = [],
      dawnRangerTagLedgers = []
    } = {}) {
      const descriptors = {
        propaguleClusters,
        rootNurseryCradles,
        crabBurrowGuards,
        brackishChannelRibbons,
        heronRoostWatches,
        dawnRangerTagLedgers
      };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, safeArray(value).length]));
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id,
        kind: "renderer-handoff",
        domainTree: TROPICAL_MANGROVE_NURSERY_READINESS_DOMAIN_TREE,
        contract: "renderer-consumes-descriptors-only",
        ownership: rendererContract(id),
        counts,
        descriptors
      };
    }
  };
}

export function createTropicalMangroveNurseryReadinessDomainKit(options = {}) {
  const propaguleKit = createTropicalMangrovePropaguleClusterKit(options.propaguleClusters);
  const cradleKit = createTropicalRootNurseryCradleKit(options.rootNurseryCradles);
  const crabKit = createTropicalCrabBurrowGuardKit(options.crabBurrowGuards);
  const channelKit = createTropicalBrackishChannelRibbonKit(options.brackishChannelRibbons);
  const heronKit = createTropicalHeronRoostWatchKit(options.heronRoostWatches);
  const ledgerKit = createTropicalDawnRangerTagLedgerKit(options.dawnRangerTagLedgers);
  const handoffKit = createTropicalMangroveNurseryRendererHandoffKit();
  return {
    id: "tropical-mangrove-nursery-readiness-domain-kit",
    kind: "domain-kit",
    domainTree: TROPICAL_MANGROVE_NURSERY_READINESS_DOMAIN_TREE,
    owns: [
      "mangrove nursery readiness descriptors",
      "propagule cluster descriptors",
      "root cradle descriptors",
      "crab burrow guard descriptors",
      "brackish channel descriptors",
      "heron roost descriptors",
      "dawn ranger tag ledger descriptors"
    ],
    doesNotOwn: rendererContract("tropical-mangrove-nursery-readiness-domain-kit").rendererMustNotOwn,
    kits: {
      propaguleKit,
      cradleKit,
      crabKit,
      channelKit,
      heronKit,
      ledgerKit,
      handoffKit
    },
    describe(input = {}) {
      const propaguleClusters = propaguleKit.describe(input);
      const rootNurseryCradles = cradleKit.describe(input);
      const crabBurrowGuards = crabKit.describe(input);
      const brackishChannelRibbons = channelKit.describe(input);
      const heronRoostWatches = heronKit.describe(input);
      const dawnRangerTagLedgers = ledgerKit.describe(input);
      const rendererHandoff = handoffKit.describe({
        propaguleClusters,
        rootNurseryCradles,
        crabBurrowGuards,
        brackishChannelRibbons,
        heronRoostWatches,
        dawnRangerTagLedgers
      });
      const nurseryReadiness = round(clamp01(
        (propaguleClusters.reduce((sum, item) => sum + item.germinationScore, 0) / Math.max(1, propaguleClusters.length)) * 0.22 +
        (rootNurseryCradles.reduce((sum, item) => sum + item.cradleScore, 0) / Math.max(1, rootNurseryCradles.length)) * 0.18 +
        (crabBurrowGuards.reduce((sum, item) => sum + item.guardScore, 0) / Math.max(1, crabBurrowGuards.length)) * 0.14 +
        (brackishChannelRibbons.reduce((sum, item) => sum + item.flowScore, 0) / Math.max(1, brackishChannelRibbons.length)) * 0.18 +
        (heronRoostWatches.reduce((sum, item) => sum + item.watchScore, 0) / Math.max(1, heronRoostWatches.length)) * 0.12 +
        (dawnRangerTagLedgers.reduce((sum, item) => sum + item.tagReadiness, 0) / Math.max(1, dawnRangerTagLedgers.length)) * 0.16
      ));
      return {
        id: "tropical-mangrove-nursery-readiness",
        kind: "readiness-domain-output",
        domainTree: TROPICAL_MANGROVE_NURSERY_READINESS_DOMAIN_TREE,
        nurseryReadiness,
        rendererHandoff,
        descriptors: rendererHandoff.descriptors,
        ownership: rendererContract("tropical-mangrove-nursery-readiness-domain-kit")
      };
    }
  };
}
