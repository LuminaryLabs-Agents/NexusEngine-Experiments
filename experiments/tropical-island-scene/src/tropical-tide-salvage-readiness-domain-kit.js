const round = (value, places = 4) => Number(Number.isFinite(Number(value)) ? Number(value).toFixed(places) : 0);
const scalarFrom = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.max(0, Math.min(1, scalarFrom(value, 0)));
const safeArray = (value) => Array.isArray(value) ? value : [];
const hash01 = (seed, salt = 0) => {
  const x = Math.sin((Number(seed) + 1) * 19.919 + salt * 41.031) * 43758.5453;
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
  return { x: round((x / 46) * scale), y: round((-0.08 + y / 18 - z / 112) * scale), depth: round(z) };
};
const rendererContract = (owner) => ({
  owner,
  renderer: "presentation-only",
  reusableKits: "plain-input-to-plain-descriptor-output",
  rendererConsumes: "serializable tropical tide salvage readiness descriptors only",
  rendererMustNotOwn: ["salvage truth", "route state", "browser input", "DOM", "Three.js", "WebGL", "audio", "asset loading", "frame loop", "physics"]
});

export const TROPICAL_TIDE_SALVAGE_DOMAIN_TREE = `tropical-tide-salvage-readiness-domain
├─ salvage-resource-domain
│  ├─ shipwreck-cargo-domain
│  │  └─ tropical-shipwreck-cargo-beacon-kit
│  └─ pearl-cache-domain
│     └─ tropical-pearl-cache-glimmer-kit
├─ lagoon-hazard-domain
│  ├─ tide-surge-domain
│  │  └─ tropical-tide-surge-window-kit
│  └─ reef-cut-domain
│     └─ tropical-reef-cut-hazard-kit
├─ return-handoff-domain
│  ├─ outrigger-route-domain
│  │  └─ tropical-outrigger-route-thread-kit
│  └─ sunset-market-domain
│     └─ tropical-sunset-market-delivery-kit
└─ renderer-handoff
   └─ tropical-tide-salvage-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createTropicalShipwreckCargoBeaconKit(options = {}) {
  const id = "tropical-shipwreck-cargo-beacon-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      const props = safeArray(input.floatProps ?? input.coconuts ?? input.cargo).slice(0, count);
      const fallbacks = Array.from({ length: count }, (_, index) => ({ id: `wreck-${index}`, x: -18 + index * 12, y: 0.7, z: 19 - index * 7 }));
      return (props.length ? props : fallbacks).slice(0, count).map((entry, index) => {
        const p = projectIsland(positionFrom(entry, fallbacks[index]), orbit, 1.04);
        const priority = clamp01(0.42 + hash01(index, 5) * 0.28 + Math.sin(time * 0.28 + index * 0.9) * 0.18 + Math.max(0, -p.y) * 0.18);
        return {
          id: `${id}-${entry.id ?? index}`,
          kind: "tropical-shipwreck-cargo-beacon",
          position: { x: p.x, y: round(p.y - 0.018) },
          radius: round(0.028 + priority * 0.034),
          cargoPriority: round(priority),
          salvageEtaSeconds: round(20 + index * 9 - priority * 7, 1),
          opacity: round(0.14 + priority * 0.34),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalPearlCacheGlimmerKit(options = {}) {
  const id = "tropical-pearl-cache-glimmer-kit";
  const count = Math.max(4, Math.min(7, Math.floor(options.count ?? 5)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const glimmer = clamp01(0.36 + hash01(index, 9) * 0.28 + Math.cos(time * 0.34 + orbit * 0.2 + index) * 0.22 + (1 - Math.abs(lane)) * 0.16);
        return {
          id: `${id}-${index}`,
          kind: "tropical-pearl-cache-glimmer",
          position: { x: round(lane * 0.86), y: round(-0.24 + Math.sin(orbit + index) * 0.035) },
          radius: round(0.018 + glimmer * 0.028),
          glimmerScore: round(glimmer),
          cacheCount: Math.max(1, Math.round(1 + glimmer * 4)),
          opacity: round(0.12 + glimmer * 0.34),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalTideSurgeWindowKit(options = {}) {
  const id = "tropical-tide-surge-window-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const weatherPressure = scalarFrom(input.weatherShelterReadability?.rendererHandoff?.counts?.stormFronts, 0);
      return Array.from({ length: count }, (_, index) => {
        const phase = 0.5 + Math.sin(time * 0.22 + index * 0.8) * 0.5;
        const surgeRisk = clamp01(0.24 + phase * 0.48 + weatherPressure * 0.015 - index * 0.025);
        const lane = index / Math.max(1, count - 1);
        return {
          id: `${id}-${index}`,
          kind: "tropical-tide-surge-window",
          center: { x: round(-0.56 + lane * 1.12), y: round(-0.34 + Math.sin(time * 0.08 + index) * 0.025) },
          radius: { x: round(0.07 + surgeRisk * 0.08), y: round(0.018 + surgeRisk * 0.03) },
          surgeRisk: round(surgeRisk),
          safeWindowSeconds: round(12 + (1 - surgeRisk) * 26, 1),
          opacity: round(0.12 + surgeRisk * 0.36),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalReefCutHazardKit(options = {}) {
  const id = "tropical-reef-cut-hazard-kit";
  const count = Math.max(4, Math.min(7, Math.floor(options.count ?? 5)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const rescueCount = scalarFrom(input.reefRescueReadiness?.rendererHandoff?.counts?.ripCurrentHazards, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const cutRisk = clamp01(0.32 + hash01(index, 14) * 0.24 + Math.sin(time * 0.31 + index * 0.7) * 0.18 + rescueCount * 0.012);
        return {
          id: `${id}-${index}`,
          kind: "tropical-reef-cut-hazard",
          start: { x: round(lane * 0.92 - 0.07), y: round(-0.1 + Math.sin(index) * 0.04) },
          end: { x: round(lane * 0.92 + 0.07), y: round(-0.04 + Math.cos(index) * 0.035) },
          cutRisk: round(cutRisk),
          width: round(0.005 + cutRisk * 0.009),
          opacity: round(0.13 + cutRisk * 0.35),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalOutriggerRouteThreadKit(options = {}) {
  const id = "tropical-outrigger-route-thread-kit";
  const count = Math.max(3, Math.min(5, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const steadiness = clamp01(0.44 + Math.cos(time * 0.18 + index) * 0.22 + (1 - Math.abs(lane)) * 0.28);
        return {
          id: `${id}-${index}`,
          kind: "tropical-outrigger-route-thread",
          start: { x: round(lane * 0.66), y: round(-0.43 + Math.sin(orbit + index) * 0.025) },
          end: { x: round(lane * 0.22), y: round(0.07 + Math.cos(orbit + index) * 0.025) },
          steadiness: round(steadiness),
          paddleRhythm: round(clamp01(steadiness * 0.82 + hash01(index, 19) * 0.14)),
          width: round(0.007 + steadiness * 0.009),
          opacity: round(0.13 + steadiness * 0.33),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalSunsetMarketDeliveryKit(options = {}) {
  const id = "tropical-sunset-market-delivery-kit";
  const count = Math.max(2, Math.min(4, Math.floor(options.count ?? 3)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const readiness = clamp01(0.5 + Math.sin(time * 0.19 + index * 0.72) * 0.24 + (index === 1 ? 0.14 : 0));
        return {
          id: `${id}-${index}`,
          kind: "tropical-sunset-market-delivery",
          position: { x: round(-0.36 + lane * 0.72), y: round(0.18 + Math.sin(orbit + index) * 0.036) },
          radius: round(0.034 + readiness * 0.034),
          deliveryReadiness: round(readiness),
          closingSeconds: round(36 + index * 10 - readiness * 12, 1),
          opacity: round(0.16 + readiness * 0.32),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalTideSalvageRendererHandoffKit() {
  const id = "tropical-tide-salvage-renderer-handoff-kit";
  return {
    id,
    describe({ shipwreckCargoBeacons = [], pearlCacheGlimmers = [], tideSurgeWindows = [], reefCutHazards = [], outriggerRouteThreads = [], sunsetMarketDeliveries = [] } = {}) {
      const descriptors = { shipwreckCargoBeacons, pearlCacheGlimmers, tideSurgeWindows, reefCutHazards, outriggerRouteThreads, sunsetMarketDeliveries };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, safeArray(value).length]));
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id,
        kind: "renderer-handoff",
        domainTree: TROPICAL_TIDE_SALVAGE_DOMAIN_TREE,
        contract: "renderer-consumes-descriptors-only",
        ownership: rendererContract(id),
        counts,
        descriptors
      };
    }
  };
}

export function createTropicalTideSalvageReadinessDomainKit(options = {}) {
  const cargoKit = createTropicalShipwreckCargoBeaconKit(options.shipwreckCargoBeacons);
  const pearlKit = createTropicalPearlCacheGlimmerKit(options.pearlCacheGlimmers);
  const tideKit = createTropicalTideSurgeWindowKit(options.tideSurgeWindows);
  const reefCutKit = createTropicalReefCutHazardKit(options.reefCutHazards);
  const outriggerKit = createTropicalOutriggerRouteThreadKit(options.outriggerRouteThreads);
  const marketKit = createTropicalSunsetMarketDeliveryKit(options.sunsetMarketDeliveries);
  const handoffKit = createTropicalTideSalvageRendererHandoffKit();
  const id = "tropical-tide-salvage-readiness-domain-kit";
  return {
    id,
    domainTree: TROPICAL_TIDE_SALVAGE_DOMAIN_TREE,
    kits: [cargoKit, pearlKit, tideKit, reefCutKit, outriggerKit, marketKit, handoffKit],
    describe(input = {}) {
      const shipwreckCargoBeacons = cargoKit.describe(input);
      const pearlCacheGlimmers = pearlKit.describe(input);
      const tideSurgeWindows = tideKit.describe(input);
      const reefCutHazards = reefCutKit.describe(input);
      const outriggerRouteThreads = outriggerKit.describe(input);
      const sunsetMarketDeliveries = marketKit.describe(input);
      const rendererHandoff = handoffKit.describe({ shipwreckCargoBeacons, pearlCacheGlimmers, tideSurgeWindows, reefCutHazards, outriggerRouteThreads, sunsetMarketDeliveries });
      return {
        id,
        kind: "tropical-tide-salvage-readiness-domain",
        engine: options.engine ?? "NexusEngine main CDN",
        domainTree: TROPICAL_TIDE_SALVAGE_DOMAIN_TREE,
        subdomains: {
          salvageResource: { kits: [cargoKit.id, pearlKit.id], descriptors: { shipwreckCargoBeacons, pearlCacheGlimmers } },
          lagoonHazard: { kits: [tideKit.id, reefCutKit.id], descriptors: { tideSurgeWindows, reefCutHazards } },
          returnHandoff: { kits: [outriggerKit.id, marketKit.id], descriptors: { outriggerRouteThreads, sunsetMarketDeliveries } }
        },
        rendererHandoff
      };
    }
  };
}
