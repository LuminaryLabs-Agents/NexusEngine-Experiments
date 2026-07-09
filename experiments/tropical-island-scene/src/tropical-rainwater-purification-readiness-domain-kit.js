const round = (value, places = 4) => Number(Number.isFinite(Number(value)) ? Number(value).toFixed(places) : 0);
const scalarFrom = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.max(0, Math.min(1, scalarFrom(value, 0)));
const safeArray = (value) => Array.isArray(value) ? value : [];
const hash01 = (seed, salt = 0) => {
  const x = Math.sin((Number(seed) + 1) * 19.913 + salt * 41.771) * 43758.5453;
  return x - Math.floor(x);
};
const positionFrom = (entry = {}, fallback = {}) => ({
  x: scalarFrom(entry.position?.x ?? entry.x, fallback.x ?? 0),
  y: scalarFrom(entry.position?.y ?? entry.y, fallback.y ?? 0),
  z: scalarFrom(entry.position?.z ?? entry.z, fallback.z ?? 0)
});
const projectIsland = (position = {}, orbit = 0, scale = 1) => {
  const c = Math.cos(orbit);
  const s = Math.sin(orbit);
  const x = scalarFrom(position.x, 0) * c - scalarFrom(position.z, 0) * s;
  const z = scalarFrom(position.x, 0) * s + scalarFrom(position.z, 0) * c;
  const y = scalarFrom(position.y, 0);
  return { x: round((x / 48) * scale), y: round((-0.06 + y / 18 - z / 118) * scale), depth: round(z) };
};
const rendererContract = (owner) => ({
  owner,
  renderer: "presentation-only",
  reusableKits: "plain-input-to-plain-descriptor-output",
  rendererConsumes: "serializable tropical rainwater purification readiness descriptors only",
  rendererMustNotOwn: ["water truth", "purification state", "ration priority", "browser input", "DOM", "Three.js", "WebGL", "audio", "asset loading", "frame loop", "physics"]
});

export const TROPICAL_RAINWATER_PURIFICATION_READINESS_DOMAIN_TREE = `tropical-rainwater-purification-readiness-domain
├─ collection-routing-domain
│  ├─ roof-catchment-domain
│  │  └─ tropical-roof-catchment-gutter-kit
│  └─ palm-leaf-channel-domain
│     └─ tropical-palm-leaf-channel-kit
├─ purification-safety-domain
│  ├─ charcoal-filter-domain
│  │  └─ tropical-charcoal-filter-bed-kit
│  └─ cistern-boil-domain
│     └─ tropical-cistern-boil-watch-kit
├─ ration-handoff-domain
│  ├─ clay-jug-route-domain
│  │  └─ tropical-clay-jug-ration-route-kit
│  └─ dawn-hydration-domain
│     └─ tropical-dawn-hydration-station-kit
└─ renderer-handoff
   └─ tropical-rainwater-purification-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createTropicalRoofCatchmentGutterKit(options = {}) {
  const id = "tropical-roof-catchment-gutter-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const stormFronts = scalarFrom(input.weatherShelterReadability?.rendererHandoff?.counts?.stormFronts, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const capture = clamp01(0.44 + stormFronts * 0.035 + Math.sin(time * 0.18 + index * 0.81) * 0.2 + (1 - Math.abs(lane)) * 0.18);
        return {
          id: `${id}-${index}`,
          kind: "tropical-roof-catchment-gutter",
          start: { x: round(lane * 0.72 - 0.08), y: round(0.22 + Math.sin(time * 0.07 + index) * 0.024) },
          end: { x: round(lane * 0.46 + 0.05), y: round(0.06 + Math.cos(time * 0.09 + index) * 0.018) },
          captureScore: round(capture),
          litersPerMinute: round(1.2 + capture * 4.6, 2),
          width: round(0.006 + capture * 0.009),
          opacity: round(0.14 + capture * 0.35),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalPalmLeafChannelKit(options = {}) {
  const id = "tropical-palm-leaf-channel-kit";
  const count = Math.max(4, Math.min(7, Math.floor(options.count ?? 5)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const flow = clamp01(0.38 + Math.cos(time * 0.16 + index * 0.6) * 0.2 + hash01(index, 4) * 0.18 + (1 - Math.abs(lane)) * 0.14);
        return {
          id: `${id}-${index}`,
          kind: "tropical-palm-leaf-channel",
          start: { x: round(lane * 0.84), y: round(0.34 + Math.sin(orbit + index) * 0.025) },
          end: { x: round(lane * 0.34), y: round(0.1 + Math.cos(orbit + index) * 0.02) },
          flowScore: round(flow),
          leakRisk: round(1 - flow),
          width: round(0.005 + flow * 0.011),
          opacity: round(0.13 + flow * 0.34),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalCharcoalFilterBedKit(options = {}) {
  const id = "tropical-charcoal-filter-bed-kit";
  const count = Math.max(2, Math.min(5, Math.floor(options.count ?? 3)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const clinicPressure = scalarFrom(input.stormClinicReadiness?.rendererHandoff?.counts?.triageBuoys, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const clarity = clamp01(0.52 + Math.sin(time * 0.13 + index * 0.72) * 0.2 - clinicPressure * 0.01 + hash01(index, 7) * 0.18);
        return {
          id: `${id}-${index}`,
          kind: "tropical-charcoal-filter-bed",
          position: { x: round(-0.38 + lane * 0.76), y: round(-0.02 + Math.cos(time * 0.08 + index) * 0.026) },
          radius: round(0.03 + clarity * 0.04),
          clarityScore: round(clarity),
          charcoalRemaining: Math.max(1, Math.round(2 + clarity * 6)),
          opacity: round(0.12 + clarity * 0.36),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalCisternBoilWatchKit(options = {}) {
  const id = "tropical-cistern-boil-watch-kit";
  const count = Math.max(2, Math.min(5, Math.floor(options.count ?? 3)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const cisternPurity = scalarFrom(input.stormClinicReadiness?.rendererHandoff?.counts?.cisternPurityMarkers, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const boil = clamp01(0.34 + Math.cos(time * 0.17 + index) * 0.22 + cisternPurity * 0.028 + hash01(index, 11) * 0.18);
        return {
          id: `${id}-${index}`,
          kind: "tropical-cistern-boil-watch",
          position: { x: round(-0.48 + lane * 0.96), y: round(0.18 + Math.sin(time * 0.09 + index) * 0.025) },
          radius: round(0.032 + boil * 0.042),
          boilReadiness: round(boil),
          minutesToSafe: round(18 - boil * 9 + index * 1.5, 1),
          opacity: round(0.13 + boil * 0.34),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalClayJugRationRouteKit(options = {}) {
  const id = "tropical-clay-jug-ration-route-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const priority = clamp01(0.4 + Math.sin(time * 0.2 + index * 0.9) * 0.22 + Math.abs(lane) * 0.12 + hash01(index, 13) * 0.18);
        return {
          id: `${id}-${index}`,
          kind: "tropical-clay-jug-ration-route",
          start: { x: round(lane * 0.26), y: round(0.04 + Math.sin(orbit + index) * 0.02) },
          end: { x: round(lane * 0.82), y: round(-0.34 + Math.cos(orbit + index) * 0.026) },
          rationPriority: round(priority),
          jugsAssigned: Math.max(1, Math.round(1 + priority * 4)),
          width: round(0.006 + priority * 0.012),
          opacity: round(0.14 + priority * 0.34),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalDawnHydrationStationKit(options = {}) {
  const id = "tropical-dawn-hydration-station-kit";
  const count = Math.max(2, Math.min(5, Math.floor(options.count ?? 3)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const rescuePressure = scalarFrom(input.reefRescueReadiness?.rendererHandoff?.counts?.extractionPierBeacons, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const readiness = clamp01(0.46 + Math.sin(time * 0.14 + index * 0.74) * 0.2 + rescuePressure * 0.025 + (index === 1 ? 0.1 : 0));
        return {
          id: `${id}-${index}`,
          kind: "tropical-dawn-hydration-station",
          position: { x: round(-0.42 + lane * 0.84), y: round(-0.22 + Math.cos(time * 0.1 + index) * 0.024) },
          radius: round(0.034 + readiness * 0.04),
          hydrationReadiness: round(readiness),
          cupsReady: Math.max(4, Math.round(8 + readiness * 18)),
          departureSupportSeconds: round(36 + index * 8 - readiness * 12, 1),
          opacity: round(0.15 + readiness * 0.34),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalRainwaterPurificationRendererHandoffKit() {
  const id = "tropical-rainwater-purification-renderer-handoff-kit";
  return {
    id,
    describe({ catchmentGutters = [], palmLeafChannels = [], charcoalFilterBeds = [], cisternBoilWatches = [], clayJugRationRoutes = [], dawnHydrationStations = [] } = {}) {
      const descriptors = { catchmentGutters, palmLeafChannels, charcoalFilterBeds, cisternBoilWatches, clayJugRationRoutes, dawnHydrationStations };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, safeArray(value).length]));
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id,
        kind: "renderer-handoff",
        domainTree: TROPICAL_RAINWATER_PURIFICATION_READINESS_DOMAIN_TREE,
        contract: "renderer-consumes-descriptors-only",
        ownership: rendererContract(id),
        counts,
        descriptors
      };
    }
  };
}

export function createTropicalRainwaterPurificationReadinessDomainKit(options = {}) {
  const catchmentKit = createTropicalRoofCatchmentGutterKit(options.catchmentGutters);
  const channelKit = createTropicalPalmLeafChannelKit(options.palmLeafChannels);
  const filterKit = createTropicalCharcoalFilterBedKit(options.charcoalFilterBeds);
  const boilKit = createTropicalCisternBoilWatchKit(options.cisternBoilWatches);
  const jugKit = createTropicalClayJugRationRouteKit(options.clayJugRationRoutes);
  const hydrationKit = createTropicalDawnHydrationStationKit(options.dawnHydrationStations);
  const handoffKit = createTropicalRainwaterPurificationRendererHandoffKit();
  const id = "tropical-rainwater-purification-readiness-domain-kit";
  return {
    id,
    domainTree: TROPICAL_RAINWATER_PURIFICATION_READINESS_DOMAIN_TREE,
    kits: [catchmentKit, channelKit, filterKit, boilKit, jugKit, hydrationKit, handoffKit],
    describe(input = {}) {
      const catchmentGutters = catchmentKit.describe(input);
      const palmLeafChannels = channelKit.describe(input);
      const charcoalFilterBeds = filterKit.describe(input);
      const cisternBoilWatches = boilKit.describe(input);
      const clayJugRationRoutes = jugKit.describe(input);
      const dawnHydrationStations = hydrationKit.describe(input);
      const rendererHandoff = handoffKit.describe({ catchmentGutters, palmLeafChannels, charcoalFilterBeds, cisternBoilWatches, clayJugRationRoutes, dawnHydrationStations });
      return {
        id,
        kind: "tropical-rainwater-purification-readiness-domain",
        engine: options.engine ?? "NexusEngine main CDN",
        domainTree: TROPICAL_RAINWATER_PURIFICATION_READINESS_DOMAIN_TREE,
        subdomains: {
          collectionRouting: { kits: [catchmentKit.id, channelKit.id], descriptors: { catchmentGutters, palmLeafChannels } },
          purificationSafety: { kits: [filterKit.id, boilKit.id], descriptors: { charcoalFilterBeds, cisternBoilWatches } },
          rationHandoff: { kits: [jugKit.id, hydrationKit.id], descriptors: { clayJugRationRoutes, dawnHydrationStations } }
        },
        rendererHandoff
      };
    }
  };
}
