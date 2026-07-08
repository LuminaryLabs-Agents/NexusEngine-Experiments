const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const round = (value, digits = 3) => Number(n(value).toFixed(digits));
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const lerp = (a, b, t) => n(a) + (n(b) - n(a)) * clamp(t, 0, 1);

const RENDERER_CONTRACT = Object.freeze({
  rendererConsumes: "serializable descriptors only",
  rendererMustNotOwn: [
    "terrain sampling",
    "erosion solving",
    "radial LOD topology",
    "browser input",
    "asset loading",
    "audio",
    "frame-loop timing"
  ],
  kitMustNotImport: ["Three.js", "WebGL", "DOM", "AudioContext"]
});

export const INFINITE_RADIAL_TERRAIN_DOMAIN_TREE = Object.freeze({
  root: "infinite-radial-terrain-domain",
  contract: "renderer consumes descriptors only; no Three.js, DOM, browser input, WebGL, audio, asset loading, or frame-loop ownership",
  children: [
    {
      id: "earth-systems",
      children: [
        { id: "geology-province", kit: "terrain-geology-province-kit" },
        { id: "hydrology", children: [{ id: "channel-thread", kit: "terrain-hydrology-thread-kit" }] },
        { id: "ecology", children: [{ id: "biome-mosaic", kit: "terrain-biome-mosaic-kit" }] }
      ]
    },
    {
      id: "navigation-readability",
      children: [
        { id: "lod-ring-telemetry", kit: "terrain-lod-ring-telemetry-kit" },
        { id: "travel-forecast", children: [{ id: "terrain-travel-forecast-kit", kit: "terrain-travel-forecast-kit" }] }
      ]
    },
    {
      id: "atmospheric-handoff",
      children: [
        { id: "sky-haze-gradient", kit: "terrain-sky-haze-gradient-kit" },
        { id: "renderer-handoff", kit: "terrain-renderer-handoff-kit", contract: "renderer consumes descriptors only" }
      ]
    }
  ]
});

function vector3(value = {}) {
  return { x: round(value.x), y: round(value.y), z: round(value.z) };
}

function coerceSamples(input = {}) {
  const samples = Array.isArray(input.samples) ? input.samples : [];
  if (samples.length > 0) return samples.map((sample, index) => ({ ...sample, index }));
  if (input.terrainSample) return [{ ...input.terrainSample, index: 0 }];
  return [];
}

function sampleRisk(sample = {}) {
  const slope = clamp(n(sample.slope) / 48, 0, 1);
  const wet = clamp(sample.hydrology?.flow?.wetnessIndex ?? sample.material?.materialWeights?.wetChannel ?? 0, 0, 1);
  const rugged = clamp(sample.landform?.terrainRuggedness ?? slope, 0, 1);
  return round(clamp(slope * 0.44 + wet * 0.26 + rugged * 0.3, 0, 1));
}

function materialRole(sample = {}) {
  const weights = sample.material?.materialWeights ?? {};
  const entries = Object.entries(weights).filter(([, value]) => Number.isFinite(Number(value)));
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? sample.material?.albedoHint ?? "soil";
}

function dominantBiome(sample = {}) {
  const climate = sample.climate ?? {};
  const height = n(sample.height);
  const vegetation = clamp(sample.material?.vegetationMask ?? climate.vegetationPotential ?? 0.3, 0, 1);
  const wet = clamp(sample.hydrology?.flow?.wetnessIndex ?? 0, 0, 1);
  const snowline = n(climate.snowlineMeters, 1800);
  if (height > snowline + 80) return "snow-alpine";
  if (wet > 0.62) return "riparian-thread";
  if (vegetation > 0.68) return "dense-meadow";
  if (vegetation < 0.22) return "scrub-rock";
  return "grass-steppe";
}

function colorForBiome(biome) {
  const colors = {
    "snow-alpine": "#e6eef0",
    "riparian-thread": "#3fa7bd",
    "dense-meadow": "#6aa84f",
    "scrub-rock": "#b69a67",
    "grass-steppe": "#8fb66a"
  };
  return colors[biome] ?? "#8fb66a";
}

export function createTerrainGeologyProvinceKit(options = {}) {
  const maxProvinces = Math.max(1, Math.floor(n(options.maxProvinces, 8)));
  return {
    id: "n-terrain-geology-province-kit",
    domain: "infinite-radial-terrain/earth-systems/geology-province",
    describe(input = {}) {
      const samples = coerceSamples(input);
      const byProvince = new Map();
      for (const sample of samples) {
        const geology = sample.geology ?? {};
        const lithology = sample.lithology ?? {};
        const key = `${geology.provinceId ?? "province:unknown"}:${lithology.lithology ?? "mixed"}`;
        const existing = byProvince.get(key) ?? {
          id: key,
          provinceId: geology.provinceId ?? "province:unknown",
          regionType: geology.regionType ?? "unknown",
          lithology: lithology.lithology ?? "mixed",
          samples: 0,
          uplift: 0,
          faultInfluence: 0,
          ridgeEnergy: 0,
          centroid: { x: 0, y: 0, z: 0 }
        };
        existing.samples += 1;
        existing.uplift += n(geology.uplift);
        existing.faultInfluence += n(geology.faultInfluence);
        existing.ridgeEnergy += clamp(n(sample.landform?.convexity) + n(sample.landform?.terrainRuggedness), 0, 2);
        existing.centroid.x += n(sample.x);
        existing.centroid.y += n(sample.height);
        existing.centroid.z += n(sample.z);
        byProvince.set(key, existing);
      }
      return [...byProvince.values()].slice(0, maxProvinces).map((entry) => {
        const scale = Math.max(1, entry.samples);
        return {
          id: entry.id,
          provinceId: entry.provinceId,
          regionType: entry.regionType,
          lithology: entry.lithology,
          sampleCount: entry.samples,
          centroid: vector3({ x: entry.centroid.x / scale, y: entry.centroid.y / scale, z: entry.centroid.z / scale }),
          ridgeEnergy: round(entry.ridgeEnergy / scale),
          uplift: round(entry.uplift / scale),
          faultGlow: round(entry.faultInfluence / scale),
          rendererContract: RENDERER_CONTRACT
        };
      });
    }
  };
}

export function createTerrainHydrologyThreadKit(options = {}) {
  const maxThreads = Math.max(1, Math.floor(n(options.maxThreads, 18)));
  return {
    id: "n-terrain-hydrology-thread-kit",
    domain: "infinite-radial-terrain/earth-systems/hydrology/channel-thread",
    describe(input = {}) {
      const samples = coerceSamples(input);
      return samples
        .filter((sample) => n(sample.hydrology?.flow?.channelPotential) > 0.12 || n(sample.hydrology?.stream?.streamOrder) > 0)
        .sort((a, b) => n(b.hydrology?.flow?.channelPotential) - n(a.hydrology?.flow?.channelPotential))
        .slice(0, maxThreads)
        .map((sample, index) => {
          const flow = sample.hydrology?.flow ?? {};
          const stream = sample.hydrology?.stream ?? {};
          const dir = flow.flowDirection ?? { x: 0, z: 1 };
          const length = lerp(70, 460, clamp(n(flow.channelPotential), 0, 1));
          const halfX = n(dir.x) * length * 0.5;
          const halfZ = n(dir.z) * length * 0.5;
          const order = n(stream.streamOrder);
          return {
            id: `hydrology-thread-${index}-${Math.round(n(sample.x))}-${Math.round(n(sample.z))}`,
            streamOrder: order,
            widthMeters: round(lerp(2, 28, clamp(n(stream.channelWidthMeters, order + 1) / 28, 0, 1))),
            wetness: round(clamp(n(flow.wetnessIndex), 0, 1)),
            channelPotential: round(clamp(n(flow.channelPotential), 0, 1)),
            from: vector3({ x: n(sample.x) - halfX, y: n(sample.height) + 7 + order * 1.5, z: n(sample.z) - halfZ }),
            to: vector3({ x: n(sample.x) + halfX, y: n(sample.height) + 7 + order * 1.5, z: n(sample.z) + halfZ }),
            pulse: round(0.18 + clamp(n(flow.channelPotential), 0, 1) * 0.72),
            rendererContract: RENDERER_CONTRACT
          };
        });
    }
  };
}

export function createTerrainBiomeMosaicKit(options = {}) {
  const maxPatches = Math.max(1, Math.floor(n(options.maxPatches, 24)));
  return {
    id: "n-terrain-biome-mosaic-kit",
    domain: "infinite-radial-terrain/earth-systems/ecology/biome-mosaic",
    describe(input = {}) {
      return coerceSamples(input).slice(0, maxPatches).map((sample, index) => {
        const biome = dominantBiome(sample);
        const risk = sampleRisk(sample);
        return {
          id: `biome-mosaic-${index}-${Math.round(n(sample.x))}-${Math.round(n(sample.z))}`,
          biome,
          materialRole: materialRole(sample),
          position: vector3({ x: n(sample.x), y: n(sample.height) + 5 + risk * 10, z: n(sample.z) }),
          radiusMeters: round(lerp(34, 150, clamp(sample.material?.vegetationMask ?? 0.4, 0, 1))),
          density: round(clamp(sample.climate?.vegetationPotential ?? sample.material?.vegetationMask ?? 0.4, 0, 1)),
          risk,
          colorHint: colorForBiome(biome),
          rendererContract: RENDERER_CONTRACT
        };
      });
    }
  };
}

export function createTerrainLodRingTelemetryKit(options = {}) {
  const opacityFloor = clamp(options.opacityFloor ?? 0.13, 0.02, 0.5);
  return {
    id: "n-terrain-lod-ring-telemetry-kit",
    domain: "infinite-radial-terrain/navigation-readability/lod-ring-telemetry",
    describe(input = {}) {
      const terrain = input.terrain ?? {};
      const focus = terrain.origin ?? terrain.focus ?? { x: 0, y: 0, z: 0 };
      const bands = Array.isArray(terrain.bands) ? terrain.bands : [];
      return bands.map((band, index) => ({
        id: `lod-ring-${band.id ?? index}`,
        bandId: band.id ?? `band-${index}`,
        center: vector3({ x: focus.x, y: n(input.terrainSample?.height, input.camera?.position?.y ?? 0) + 18 + index * 5, z: focus.z }),
        innerRadiusMeters: round(band.innerRadius),
        outerRadiusMeters: round(band.outerRadius),
        transitionWidthMeters: round(band.transitionWidth),
        radialSegments: Math.floor(n(band.radialSegments)),
        angularSegments: Math.floor(n(band.angularSegments)),
        opacity: round(clamp(opacityFloor + index * 0.045, 0, 0.55)),
        pulse: round(clamp(1 - index * 0.16 + (n(input.time) * 0.02 % 0.2), 0.12, 1)),
        rendererContract: RENDERER_CONTRACT
      }));
    }
  };
}

export function createTerrainTravelForecastKit(options = {}) {
  const horizonMeters = Math.max(200, n(options.horizonMeters, 1400));
  return {
    id: "n-terrain-travel-forecast-kit",
    domain: "infinite-radial-terrain/navigation-readability/travel-forecast/terrain-travel-forecast-kit",
    describe(input = {}) {
      const camera = input.camera ?? {};
      const sample = input.terrainSample ?? coerceSamples(input)[0] ?? {};
      const samples = coerceSamples(input);
      const ahead = samples.find((entry) => entry.tag === "ahead") ?? samples[0] ?? sample;
      const altitude = n(camera.position?.y) - n(sample.height);
      const risk = sampleRisk(ahead);
      const slope = n(ahead.slope);
      const order = n(ahead.hydrology?.stream?.streamOrder);
      return {
        id: "terrain-travel-forecast",
        horizonMeters,
        altitudeClearanceMeters: round(altitude, 1),
        aheadLandform: ahead.landform?.landform ?? "unknown",
        aheadBiome: dominantBiome(ahead),
        recommendedAction: altitude < 140 ? "gain-altitude" : risk > 0.72 ? "veer-around-rugged-wet-zone" : slope > 26 ? "follow-ridge-contour" : order >= 2 ? "trace-river-corridor" : "free-cruise",
        risk: round(risk),
        cueStrength: round(clamp(risk * 0.62 + (altitude < 160 ? 0.26 : 0.08), 0, 1)),
        camera: { position: vector3(camera.position ?? {}), yaw: round(camera.yaw), pitch: round(camera.pitch) },
        rendererContract: RENDERER_CONTRACT
      };
    }
  };
}

export function createTerrainSkyHazeGradientKit(options = {}) {
  const bandCount = Math.max(3, Math.floor(n(options.bandCount, 5)));
  return {
    id: "n-terrain-sky-haze-gradient-kit",
    domain: "infinite-radial-terrain/atmospheric-handoff/sky-haze-gradient",
    describe(input = {}) {
      const sample = input.terrainSample ?? coerceSamples(input)[0] ?? {};
      const humidity = clamp((n(sample.climate?.rainfallMmYear, 900) - 300) / 1500, 0, 1);
      const snow = clamp((n(sample.height) - n(sample.climate?.snowlineMeters, 1900) + 220) / 520, 0, 1);
      const rugged = clamp(sample.landform?.terrainRuggedness ?? 0.3, 0, 1);
      const haze = round(clamp(0.12 + humidity * 0.34 + rugged * 0.18 + snow * 0.08, 0.05, 0.78));
      const bands = Array.from({ length: bandCount }, (_, index) => ({
        id: `sky-haze-band-${index}`,
        horizonT: round(index / Math.max(1, bandCount - 1)),
        density: round(clamp(haze * (1 - index * 0.1), 0.02, 0.82)),
        liftMeters: round(lerp(120, 1600, index / Math.max(1, bandCount - 1))),
        tint: index < 2 ? "#b9ecff" : snow > 0.4 ? "#eef4ff" : "#ffe6b7"
      }));
      return { id: "terrain-sky-haze-gradient", backgroundColor: snow > 0.5 ? "#d8ecff" : humidity > 0.62 ? "#bfe7ff" : "#cdefff", fogDensity: round(0.00006 + haze * 0.00012, 6), haze, bands, rendererContract: RENDERER_CONTRACT };
    }
  };
}

export function createTerrainRendererHandoffKit(kits = {}) {
  const geologyProvinceKit = kits.geologyProvinceKit ?? createTerrainGeologyProvinceKit();
  const hydrologyThreadKit = kits.hydrologyThreadKit ?? createTerrainHydrologyThreadKit();
  const biomeMosaicKit = kits.biomeMosaicKit ?? createTerrainBiomeMosaicKit();
  const lodRingTelemetryKit = kits.lodRingTelemetryKit ?? createTerrainLodRingTelemetryKit();
  const travelForecastKit = kits.travelForecastKit ?? createTerrainTravelForecastKit();
  const skyHazeGradientKit = kits.skyHazeGradientKit ?? createTerrainSkyHazeGradientKit();
  return {
    id: "n-terrain-renderer-handoff-kit",
    domain: "infinite-radial-terrain/atmospheric-handoff/renderer-handoff",
    describe(input = {}) {
      const geologyProvinces = geologyProvinceKit.describe(input);
      const hydrologyThreads = hydrologyThreadKit.describe(input);
      const biomeMosaic = biomeMosaicKit.describe(input);
      const lodRings = lodRingTelemetryKit.describe(input);
      const travelForecast = travelForecastKit.describe(input);
      const skyHaze = skyHazeGradientKit.describe(input);
      const counts = { geologyProvinces: geologyProvinces.length, hydrologyThreads: hydrologyThreads.length, biomeMosaic: biomeMosaic.length, lodRings: lodRings.length, skyHazeBands: skyHaze.bands.length, total: geologyProvinces.length + hydrologyThreads.length + biomeMosaic.length + lodRings.length + skyHaze.bands.length + 1 };
      return { id: "terrain-renderer-handoff", domainTree: clone(INFINITE_RADIAL_TERRAIN_DOMAIN_TREE), geologyProvinces, hydrologyThreads, biomeMosaic, lodRings, travelForecast, skyHaze, counts, rendererContract: RENDERER_CONTRACT };
    }
  };
}

export function createInfiniteRadialTerrainVisualDomainKit(options = {}) {
  const geologyProvinceKit = options.geologyProvinceKit ?? createTerrainGeologyProvinceKit(options.geologyProvince);
  const hydrologyThreadKit = options.hydrologyThreadKit ?? createTerrainHydrologyThreadKit(options.hydrologyThread);
  const biomeMosaicKit = options.biomeMosaicKit ?? createTerrainBiomeMosaicKit(options.biomeMosaic);
  const lodRingTelemetryKit = options.lodRingTelemetryKit ?? createTerrainLodRingTelemetryKit(options.lodRingTelemetry);
  const travelForecastKit = options.travelForecastKit ?? createTerrainTravelForecastKit(options.travelForecast);
  const skyHazeGradientKit = options.skyHazeGradientKit ?? createTerrainSkyHazeGradientKit(options.skyHazeGradient);
  const rendererHandoffKit = options.rendererHandoffKit ?? createTerrainRendererHandoffKit({ geologyProvinceKit, hydrologyThreadKit, biomeMosaicKit, lodRingTelemetryKit, travelForecastKit, skyHazeGradientKit });
  return {
    id: "n-infinite-radial-terrain-visual-domain-kit",
    domain: "infinite-radial-terrain",
    kits: { geologyProvinceKit, hydrologyThreadKit, biomeMosaicKit, lodRingTelemetryKit, travelForecastKit, skyHazeGradientKit, rendererHandoffKit },
    describe(input = {}) {
      const rendererHandoff = rendererHandoffKit.describe(input);
      return { id: "infinite-radial-terrain-visual-domain", mode: "earth-system-fractal-descriptor-handoff", domainTree: clone(INFINITE_RADIAL_TERRAIN_DOMAIN_TREE), geologyProvinces: rendererHandoff.geologyProvinces, hydrologyThreads: rendererHandoff.hydrologyThreads, biomeMosaic: rendererHandoff.biomeMosaic, lodRings: rendererHandoff.lodRings, travelForecast: rendererHandoff.travelForecast, skyHaze: rendererHandoff.skyHaze, rendererHandoff, rendererContract: RENDERER_CONTRACT };
    }
  };
}
