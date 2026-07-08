const round = (value, places = 4) => Number(Number.isFinite(Number(value)) ? Number(value).toFixed(places) : 0);
const scalarFrom = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.max(0, Math.min(1, scalarFrom(value, 0)));
const safeArray = (value) => Array.isArray(value) ? value : [];
const hash01 = (seed, salt = 0) => {
  const x = Math.sin((Number(seed) + 1) * 19.1919 + salt * 31.733) * 43758.5453;
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
  return { x: round((x / 42) * scale), y: round((-0.1 + y / 18 - z / 104) * scale), depth: round(z) };
};
const rendererContract = (owner) => ({
  owner,
  renderer: "presentation-only",
  reusableKits: "plain-input-to-plain-descriptor-output",
  rendererConsumes: "serializable tropical weather shelter descriptors only",
  rendererMustNotOwn: ["weather truth", "route state", "browser input", "DOM", "Three.js", "WebGL", "audio", "asset loading", "frame loop", "physics"]
});

export const TROPICAL_WEATHER_SHELTER_DOMAIN_TREE = `tropical-weather-shelter-readability-domain
├─ weather-forecast-domain
│  ├─ storm-front-domain
│  │  └─ tropical-storm-front-sweep-kit
│  └─ wave-break-domain
│     └─ tropical-wave-break-warning-kit
├─ shelter-routing-domain
│  ├─ palm-canopy-domain
│  │  └─ tropical-shelter-palm-canopy-kit
│  └─ tide-escape-domain
│     └─ tropical-tide-escape-window-kit
├─ return-resource-domain
│  ├─ supply-cache-domain
│  │  └─ tropical-supply-cache-glint-kit
│  └─ dusk-return-domain
│     └─ tropical-dusk-return-beacon-kit
└─ renderer-handoff
   └─ tropical-weather-shelter-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createTropicalStormFrontSweepKit(options = {}) {
  const id = "tropical-storm-front-sweep-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      const time = scalarFrom(input.time, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const phase = 0.5 + Math.sin(time * 0.22 + orbit * 0.55 + index * 0.78) * 0.5;
        return {
          id: `${id}-${index}`,
          kind: "tropical-storm-front-sweep",
          start: { x: round(-0.58 + lane * 0.22), y: round(-0.48 + lane * 0.08) },
          end: { x: round(0.42 + lane * 0.18), y: round(-0.22 + lane * 0.04 + Math.sin(orbit + index) * 0.018) },
          intensity: round(clamp01(0.22 + phase * 0.68)),
          etaSeconds: round(55 + index * 24 - phase * 18, 1),
          width: round(0.01 + phase * 0.01),
          opacity: round(0.1 + phase * 0.22),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalShelterPalmCanopyKit(options = {}) {
  const id = "tropical-shelter-palm-canopy-kit";
  const maxCount = Math.max(4, Math.min(8, Math.floor(options.count ?? 6)));
  return {
    id,
    describe(input = {}) {
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      const time = scalarFrom(input.time, 0);
      const palms = safeArray(input.palms ?? input.trees).slice(0, maxCount);
      const fallbacks = Array.from({ length: maxCount }, (_, index) => ({ id: `shelter-palm-${index}`, x: -16 + index * 6.4, y: 2.4, z: -12 - (index % 3) * 6, scale: 1 + (index % 2) * 0.3 }));
      return (palms.length ? palms : fallbacks).slice(0, maxCount).map((entry, index) => {
        const p = projectIsland(positionFrom(entry, fallbacks[index]), orbit, 1);
        const comfort = clamp01(0.38 + scalarFrom(entry.scale, 1) * 0.18 + hash01(index, 2) * 0.28 + Math.sin(time * 0.3 + index) * 0.06);
        return {
          id: `${id}-${entry.id ?? index}`,
          kind: "tropical-shelter-palm-canopy",
          position: { x: p.x, y: round(p.y - 0.02) },
          radius: round(0.045 + comfort * 0.035),
          comfort: round(comfort),
          coverScore: round(clamp01(comfort * 0.82 + hash01(index, 4) * 0.16)),
          opacity: round(0.18 + comfort * 0.28),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalTideEscapeWindowKit(options = {}) {
  const id = "tropical-tide-escape-window-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const windowScore = clamp01(0.55 + Math.sin(time * 0.24 + index * 0.72) * 0.32 - Math.abs(lane) * 0.16);
        return {
          id: `${id}-${index}`,
          kind: "tropical-tide-escape-window",
          start: { x: round(lane * 0.78), y: round(-0.40 + Math.sin(orbit + index) * 0.025) },
          end: { x: round(lane * 0.38), y: round(-0.14 + index * 0.014) },
          windowScore: round(windowScore),
          tideRisk: round(clamp01(1 - windowScore + hash01(index, 8) * 0.18)),
          width: round(0.008 + windowScore * 0.007),
          opacity: round(0.16 + windowScore * 0.25),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalWaveBreakWarningKit(options = {}) {
  const id = "tropical-wave-break-warning-kit";
  const count = Math.max(4, Math.min(8, Math.floor(options.count ?? 6)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const risk = clamp01(0.25 + hash01(index, 12) * 0.42 + Math.sin(time * 0.46 + orbit + index * 0.4) * 0.18);
        return {
          id: `${id}-${index}`,
          kind: "tropical-wave-break-warning",
          center: { x: round(-0.52 + lane * 1.04), y: round(-0.34 - Math.sin(index + orbit) * 0.03) },
          radius: { x: round(0.065 + risk * 0.06), y: round(0.015 + risk * 0.022) },
          breakRisk: round(risk),
          safeSide: risk > 0.58 ? "shore" : "reef",
          opacity: round(0.12 + risk * 0.30),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalSupplyCacheGlintKit(options = {}) {
  const id = "tropical-supply-cache-glint-kit";
  const maxCount = Math.max(4, Math.min(7, Math.floor(options.count ?? 5)));
  return {
    id,
    describe(input = {}) {
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      const time = scalarFrom(input.time, 0);
      const props = safeArray(input.coconuts ?? input.floatProps).slice(0, maxCount);
      const fallbacks = Array.from({ length: maxCount }, (_, index) => ({ id: `cache-${index}`, x: -10 + index * 5, y: 0.6, z: 8 - index * 5, scale: 1 }));
      return (props.length ? props : fallbacks).slice(0, maxCount).map((entry, index) => {
        const p = projectIsland(positionFrom(entry, fallbacks[index]), orbit, 1);
        const value = clamp01(0.32 + hash01(index, 16) * 0.44 + Math.sin(time * 0.8 + index) * 0.11);
        return {
          id: `${id}-${entry.id ?? index}`,
          kind: "tropical-supply-cache-glint",
          position: { x: p.x, y: round(p.y + 0.02) },
          radius: round(0.022 + value * 0.024),
          value: round(value),
          pickupPriority: round(clamp01(value * 0.7 + (1 - Math.abs(p.x)) * 0.18)),
          opacity: round(0.16 + value * 0.32),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalDuskReturnBeaconKit(options = {}) {
  const id = "tropical-dusk-return-beacon-kit";
  const count = Math.max(3, Math.min(5, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      const dusk = clamp01(0.45 + Math.sin(time * 0.17 + orbit * 0.3) * 0.35);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        return {
          id: `${id}-${index}`,
          kind: "tropical-dusk-return-beacon",
          position: { x: round(-0.36 + lane * 0.72), y: round(-0.08 + Math.sin(index + orbit) * 0.045) },
          radius: round(0.038 + dusk * 0.024 + index * 0.004),
          duskPressure: round(dusk),
          returnUrgency: round(clamp01(dusk + index * 0.08 - 0.12)),
          opacity: round(0.16 + dusk * 0.28),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalWeatherShelterRendererHandoffKit() {
  const id = "tropical-weather-shelter-renderer-handoff-kit";
  return {
    id,
    describe({ stormFronts = [], shelterCanopies = [], tideEscapeWindows = [], waveBreakWarnings = [], supplyCacheGlints = [], duskReturnBeacons = [] } = {}) {
      const descriptors = { stormFronts, shelterCanopies, tideEscapeWindows, waveBreakWarnings, supplyCacheGlints, duskReturnBeacons };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, safeArray(value).length]));
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id,
        kind: "renderer-handoff",
        domainTree: TROPICAL_WEATHER_SHELTER_DOMAIN_TREE,
        contract: "renderer-consumes-descriptors-only",
        ownership: rendererContract(id),
        counts,
        descriptors
      };
    }
  };
}

export function createTropicalWeatherShelterReadabilityDomainKit(options = {}) {
  const stormFrontKit = createTropicalStormFrontSweepKit(options.stormFronts);
  const shelterPalmKit = createTropicalShelterPalmCanopyKit(options.shelterCanopies);
  const tideEscapeKit = createTropicalTideEscapeWindowKit(options.tideEscapeWindows);
  const waveBreakKit = createTropicalWaveBreakWarningKit(options.waveBreakWarnings);
  const supplyCacheKit = createTropicalSupplyCacheGlintKit(options.supplyCacheGlints);
  const duskReturnKit = createTropicalDuskReturnBeaconKit(options.duskReturnBeacons);
  const handoffKit = createTropicalWeatherShelterRendererHandoffKit();
  const id = "tropical-weather-shelter-readability-domain-kit";
  return {
    id,
    domainTree: TROPICAL_WEATHER_SHELTER_DOMAIN_TREE,
    kits: [stormFrontKit, shelterPalmKit, tideEscapeKit, waveBreakKit, supplyCacheKit, duskReturnKit, handoffKit],
    describe(input = {}) {
      const stormFronts = stormFrontKit.describe(input);
      const shelterCanopies = shelterPalmKit.describe(input);
      const tideEscapeWindows = tideEscapeKit.describe(input);
      const waveBreakWarnings = waveBreakKit.describe(input);
      const supplyCacheGlints = supplyCacheKit.describe(input);
      const duskReturnBeacons = duskReturnKit.describe(input);
      const rendererHandoff = handoffKit.describe({ stormFronts, shelterCanopies, tideEscapeWindows, waveBreakWarnings, supplyCacheGlints, duskReturnBeacons });
      return {
        id,
        kind: "tropical-weather-shelter-readability-domain",
        engine: options.engine ?? "NexusEngine main CDN",
        domainTree: TROPICAL_WEATHER_SHELTER_DOMAIN_TREE,
        subdomains: {
          weatherForecast: { kits: [stormFrontKit.id, waveBreakKit.id], descriptors: { stormFronts, waveBreakWarnings } },
          shelterRouting: { kits: [shelterPalmKit.id, tideEscapeKit.id], descriptors: { shelterCanopies, tideEscapeWindows } },
          returnResource: { kits: [supplyCacheKit.id, duskReturnKit.id], descriptors: { supplyCacheGlints, duskReturnBeacons } }
        },
        rendererHandoff
      };
    }
  };
}
