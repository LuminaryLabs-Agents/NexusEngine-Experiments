const round = (value, places = 4) => Number(Number.isFinite(Number(value)) ? Number(value).toFixed(places) : 0);
const scalarFrom = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.max(0, Math.min(1, scalarFrom(value, 0)));
const safeArray = (value) => Array.isArray(value) ? value : [];
const hash01 = (seed, salt = 0) => {
  const x = Math.sin((Number(seed) + 1) * 19.417 + salt * 41.233) * 43758.5453;
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
  return { x: round((x / 48) * scale), y: round((-0.05 + y / 20 - z / 116) * scale), depth: round(z) };
};
const rendererContract = (owner) => ({
  owner,
  renderer: "presentation-only",
  reusableKits: "plain-input-to-plain-descriptor-output",
  rendererConsumes: "serializable tropical lagoon observatory readiness descriptors only",
  rendererMustNotOwn: ["observatory truth", "sampling state", "browser input", "DOM", "Three.js", "WebGL", "audio", "asset loading", "frame loop", "physics"]
});

export const TROPICAL_LAGOON_OBSERVATORY_READINESS_DOMAIN_TREE = `tropical-lagoon-observatory-readiness-domain
├─ sensor-grid-domain
│  ├─ coral-sensor-domain
│  │  └─ tropical-coral-sensor-buoy-kit
│  └─ plankton-sample-domain
│     └─ tropical-plankton-sample-trail-kit
├─ habitat-watch-domain
│  ├─ mangrove-nursery-domain
│  │  └─ tropical-mangrove-nursery-marker-kit
│  └─ manta-corridor-domain
│     └─ tropical-manta-corridor-arc-kit
├─ night-report-domain
│  ├─ data-relay-domain
│  │  └─ tropical-data-relay-kite-kit
│  └─ lighthouse-watch-domain
│     └─ tropical-lighthouse-watch-lens-kit
└─ renderer-handoff
   └─ tropical-lagoon-observatory-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createTropicalCoralSensorBuoyKit(options = {}) {
  const id = "tropical-coral-sensor-buoy-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      const sources = safeArray(input.fish ?? input.floatProps ?? input.coconuts).slice(0, count);
      const fallbacks = Array.from({ length: count }, (_, index) => ({ id: `coral-sensor-${index}`, x: -18 + index * 12, y: 0.35, z: 22 - index * 6 }));
      return (sources.length ? sources : fallbacks).slice(0, count).map((entry, index) => {
        const p = projectIsland(positionFrom(entry, fallbacks[index]), orbit, 1.02);
        const health = clamp01(0.54 + Math.sin(time * 0.19 + index) * 0.2 + hash01(index, 2) * 0.14);
        return {
          id: `${id}-${entry.id ?? index}`,
          kind: "tropical-coral-sensor-buoy",
          position: { x: p.x, y: round(p.y - 0.015) },
          radius: round(0.024 + health * 0.035),
          reefHealth: round(health),
          calibration: health > 0.62 ? "stable" : "needs-pass",
          sampleSeconds: round(16 + index * 5 - health * 6, 1),
          opacity: round(0.13 + health * 0.36),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalPlanktonSampleTrailKit(options = {}) {
  const id = "tropical-plankton-sample-trail-kit";
  const count = Math.max(4, Math.min(7, Math.floor(options.count ?? 5)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const bloom = clamp01(0.35 + Math.cos(time * 0.22 + index * 0.71) * 0.22 + (1 - Math.abs(lane)) * 0.2 + hash01(index, 7) * 0.12);
        return {
          id: `${id}-${index}`,
          kind: "tropical-plankton-sample-trail",
          start: { x: round(lane * 0.82), y: round(-0.5 + Math.sin(orbit + index) * 0.025) },
          end: { x: round(lane * 0.36 + Math.sin(time * 0.05 + index) * 0.03), y: round(-0.08 + Math.cos(orbit + index) * 0.04) },
          bloomDensity: round(bloom),
          samplePriority: bloom > 0.64 ? "high" : "steady",
          width: round(0.006 + bloom * 0.012),
          opacity: round(0.13 + bloom * 0.34),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalMangroveNurseryMarkerKit(options = {}) {
  const id = "tropical-mangrove-nursery-marker-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 3)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const tideWindows = scalarFrom(input.tideSalvageReadiness?.rendererHandoff?.counts?.tideSurgeWindows, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const hydration = clamp01(0.68 - tideWindows * 0.02 + Math.sin(time * 0.14 + index) * 0.17 + hash01(index, 11) * 0.11);
        return {
          id: `${id}-${index}`,
          kind: "tropical-mangrove-nursery-marker",
          center: { x: round(-0.5 + lane * 1.0), y: round(0.22 + Math.cos(time * 0.08 + index) * 0.035) },
          radius: { x: round(0.045 + hydration * 0.066), y: round(0.018 + hydration * 0.038) },
          hydrationScore: round(hydration),
          seedlingsReady: Math.max(2, Math.round(3 + hydration * 9)),
          opacity: round(0.12 + hydration * 0.33),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalMantaCorridorArcKit(options = {}) {
  const id = "tropical-manta-corridor-arc-kit";
  const count = Math.max(2, Math.min(5, Math.floor(options.count ?? 3)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const rescuePressure = scalarFrom(input.reefRescueReadiness?.rendererHandoff?.counts?.ripCurrentHazards, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const clearance = clamp01(0.5 + Math.cos(time * 0.18 + index) * 0.2 - rescuePressure * 0.018 + (1 - Math.abs(lane)) * 0.17);
        return {
          id: `${id}-${index}`,
          kind: "tropical-manta-corridor-arc",
          center: { x: round(lane * 0.72), y: round(-0.22 + Math.sin(time * 0.09 + index) * 0.026) },
          radius: { x: round(0.08 + clearance * 0.08), y: round(0.026 + clearance * 0.035) },
          corridorClearance: round(clearance),
          surveyPasses: Math.max(1, Math.round(1 + clearance * 4)),
          opacity: round(0.13 + clearance * 0.34),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalDataRelayKiteKit(options = {}) {
  const id = "tropical-data-relay-kite-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const stormFronts = scalarFrom(input.weatherShelterReadability?.rendererHandoff?.counts?.stormFronts, 0);
      const clinicLoad = scalarFrom(input.stormClinicReadiness?.rendererHandoff?.counts?.triageBuoys, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const strength = clamp01(0.44 + Math.sin(time * 0.2 + index * 0.6) * 0.18 - stormFronts * 0.022 + clinicLoad * 0.008 + (1 - Math.abs(lane)) * 0.16);
        return {
          id: `${id}-${index}`,
          kind: "tropical-data-relay-kite",
          anchor: { x: round(lane * 0.76), y: round(0.04 + Math.cos(time * 0.08 + index) * 0.02) },
          kite: { x: round(lane * 0.66 + Math.sin(time * 0.12 + index) * 0.035), y: round(0.44 + strength * 0.18) },
          linkStrength: round(strength),
          packetsQueued: Math.max(1, Math.round(2 + strength * 8)),
          width: round(0.006 + strength * 0.01),
          opacity: round(0.12 + strength * 0.36),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalLighthouseWatchLensKit(options = {}) {
  const id = "tropical-lighthouse-watch-lens-kit";
  const count = Math.max(2, Math.min(4, Math.floor(options.count ?? 2)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const salvagePressure = scalarFrom(input.tideSalvageReadiness?.rendererHandoff?.counts?.shipwreckCargoBeacons, 0);
      return Array.from({ length: count }, (_, index) => {
        const side = index % 2 === 0 ? -1 : 1;
        const focus = clamp01(0.5 + Math.cos(time * 0.12 + index) * 0.24 + salvagePressure * 0.012);
        return {
          id: `${id}-${index}`,
          kind: "tropical-lighthouse-watch-lens",
          position: { x: round(side * (0.28 + index * 0.09)), y: round(0.58 - index * 0.08) },
          radius: round(0.048 + focus * 0.05),
          focusScore: round(focus),
          reportWindow: focus > 0.68 ? "send-now" : "hold",
          opacity: round(0.14 + focus * 0.38),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalLagoonObservatoryRendererHandoffKit() {
  const id = "tropical-lagoon-observatory-renderer-handoff-kit";
  return {
    id,
    describe({ coralSensorBuoys = [], planktonSampleTrails = [], mangroveNurseryMarkers = [], mantaCorridorArcs = [], dataRelayKites = [], lighthouseWatchLenses = [] } = {}) {
      const descriptors = { coralSensorBuoys, planktonSampleTrails, mangroveNurseryMarkers, mantaCorridorArcs, dataRelayKites, lighthouseWatchLenses };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, safeArray(value).length]));
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id,
        kind: "renderer-handoff",
        domainTree: TROPICAL_LAGOON_OBSERVATORY_READINESS_DOMAIN_TREE,
        contract: "renderer-consumes-descriptors-only",
        ownership: rendererContract(id),
        counts,
        descriptors
      };
    }
  };
}

export function createTropicalLagoonObservatoryReadinessDomainKit(options = {}) {
  const coralSensorKit = createTropicalCoralSensorBuoyKit(options.coralSensorBuoys);
  const planktonTrailKit = createTropicalPlanktonSampleTrailKit(options.planktonSampleTrails);
  const mangroveNurseryKit = createTropicalMangroveNurseryMarkerKit(options.mangroveNurseryMarkers);
  const mantaCorridorKit = createTropicalMantaCorridorArcKit(options.mantaCorridorArcs);
  const dataRelayKit = createTropicalDataRelayKiteKit(options.dataRelayKites);
  const lighthouseLensKit = createTropicalLighthouseWatchLensKit(options.lighthouseWatchLenses);
  const rendererHandoffKit = createTropicalLagoonObservatoryRendererHandoffKit();

  return {
    id: "tropical-lagoon-observatory-readiness-domain-kit",
    domainTree: TROPICAL_LAGOON_OBSERVATORY_READINESS_DOMAIN_TREE,
    kits: { coralSensorKit, planktonTrailKit, mangroveNurseryKit, mantaCorridorKit, dataRelayKit, lighthouseLensKit, rendererHandoffKit },
    describe(input = {}) {
      const coralSensorBuoys = coralSensorKit.describe(input);
      const planktonSampleTrails = planktonTrailKit.describe(input);
      const mangroveNurseryMarkers = mangroveNurseryKit.describe(input);
      const mantaCorridorArcs = mantaCorridorKit.describe(input);
      const dataRelayKites = dataRelayKit.describe(input);
      const lighthouseWatchLenses = lighthouseLensKit.describe(input);
      const rendererHandoff = rendererHandoffKit.describe({ coralSensorBuoys, planktonSampleTrails, mangroveNurseryMarkers, mantaCorridorArcs, dataRelayKites, lighthouseWatchLenses });
      return {
        id: "tropical-lagoon-observatory-readiness-domain",
        kind: "tropical-lagoon-observatory-readiness-domain",
        domainTree: TROPICAL_LAGOON_OBSERVATORY_READINESS_DOMAIN_TREE,
        subdomains: {
          sensorGrid: { descriptors: { coralSensorBuoys, planktonSampleTrails } },
          habitatWatch: { descriptors: { mangroveNurseryMarkers, mantaCorridorArcs } },
          nightReport: { descriptors: { dataRelayKites, lighthouseWatchLenses } }
        },
        rendererHandoff,
        rendererContract: rendererContract("tropical-lagoon-observatory-readiness-domain-kit")
      };
    }
  };
}
