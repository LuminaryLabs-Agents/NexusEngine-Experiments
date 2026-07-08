const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const round = (value, digits = 3) => Number(n(value).toFixed(digits));
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const lerp = (a, b, t) => n(a) + (n(b) - n(a)) * clamp(t, 0, 1);

const RENDERER_CONTRACT = Object.freeze({
  policy: "renderer-consumes-descriptors-only",
  rendererMustNotOwn: [
    "terrain sampling",
    "erosion solving",
    "route scoring",
    "browser input",
    "DOM",
    "Three.js",
    "WebGL",
    "audio",
    "asset loading",
    "frame-loop timing"
  ],
  kitMustNotImport: ["NexusRealtime", "NexusEngine", "Three.js", "WebGL", "DOM", "AudioContext"]
});

export const TERRAIN_EXPEDITION_READABILITY_DOMAIN_TREE = Object.freeze({
  root: "terrain-expedition-readability-domain",
  contract: "renderer consumes descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership",
  children: [
    {
      id: "survey-planning",
      children: [
        { id: "transect-domain", kit: "terrain-survey-transect-kit" },
        { id: "sample-bookmark-domain", kit: "terrain-sample-bookmark-kit" }
      ]
    },
    {
      id: "flight-safety",
      children: [
        { id: "altitude-corridor-domain", kit: "terrain-altitude-corridor-kit" },
        { id: "hazard-basin-domain", kit: "terrain-hazard-basin-kit" }
      ]
    },
    {
      id: "route-intent",
      children: [
        { id: "ridge-pass-domain", kit: "terrain-ridge-pass-beacon-kit" },
        { id: "task-band-domain", kit: "terrain-route-task-band-kit" }
      ]
    },
    {
      id: "renderer-handoff",
      kit: "terrain-expedition-renderer-handoff-kit",
      contract: "renderer consumes descriptors only"
    }
  ]
});

function vector3(value = {}) {
  return { x: round(value.x), y: round(value.y), z: round(value.z) };
}

function coerceSamples(input = {}) {
  const samples = Array.isArray(input.samples) ? input.samples : [];
  if (samples.length > 0) return samples.map((sample, index) => ({ ...sample, index }));
  if (input.terrainSample) return [{ ...input.terrainSample, index: 0, tag: input.terrainSample.tag ?? "focus" }];
  return [];
}

function terrainRisk(sample = {}) {
  const slope = clamp(n(sample.slope) / 46, 0, 1);
  const rugged = clamp(sample.landform?.terrainRuggedness ?? 0, 0, 1);
  const wet = clamp(sample.hydrology?.flow?.wetnessIndex ?? sample.material?.materialWeights?.wetChannel ?? 0, 0, 1);
  const channel = clamp(n(sample.hydrology?.flow?.channelPotential), 0, 1);
  return round(clamp(slope * 0.34 + rugged * 0.34 + wet * 0.18 + channel * 0.14, 0, 1));
}

function dominantBiome(sample = {}) {
  const climate = sample.climate ?? {};
  const vegetation = clamp(sample.material?.vegetationMask ?? climate.vegetationPotential ?? 0.34, 0, 1);
  const wet = clamp(sample.hydrology?.flow?.wetnessIndex ?? 0, 0, 1);
  const height = n(sample.height);
  if (height > n(climate.snowlineMeters, 1800) + 70) return "snow-alpine";
  if (wet > 0.62) return "river-thread";
  if (vegetation > 0.66) return "meadow-basin";
  if (vegetation < 0.22) return "rock-scrub";
  return "steppe";
}

function forwardVector(yaw = 0) {
  return { x: -Math.sin(n(yaw)), z: -Math.cos(n(yaw)) };
}

function findTagged(samples, tag, fallbackIndex = 0) {
  return samples.find((sample) => sample.tag === tag) ?? samples[fallbackIndex] ?? samples[0] ?? {};
}

export function createTerrainSurveyTransectKit(options = {}) {
  const maxTransects = Math.max(2, Math.floor(n(options.maxTransects, 5)));
  return {
    id: "terrain-survey-transect-kit",
    domain: "terrain-expedition-readability/survey-planning/transect-domain",
    describe(input = {}) {
      const samples = coerceSamples(input);
      const focus = findTagged(samples, "focus", 0);
      const preferred = ["ahead", "far-ahead", "left-ridge", "right-ridge", "north", "east", "west", "south"];
      return preferred
        .map((tag) => samples.find((sample) => sample.tag === tag))
        .filter(Boolean)
        .slice(0, maxTransects)
        .map((sample, index) => {
          const risk = terrainRisk(sample);
          return {
            id: `survey-transect-${index}-${sample.tag ?? "sample"}`,
            kind: "survey-transect",
            tag: sample.tag ?? `sample-${index}`,
            from: vector3({ x: n(focus.x), y: n(focus.height) + 34, z: n(focus.z) }),
            to: vector3({ x: n(sample.x), y: n(sample.height) + 44 + risk * 42, z: n(sample.z) }),
            meters: round(Math.hypot(n(sample.x) - n(focus.x), n(sample.z) - n(focus.z)), 1),
            surveyValue: round(clamp((sample.landform?.confidence ?? 0.5) * 0.5 + (1 - risk) * 0.5, 0, 1)),
            risk,
            pulse: round(0.28 + index * 0.08 + risk * 0.22),
            rendererContract: RENDERER_CONTRACT
          };
        });
    }
  };
}

export function createTerrainAltitudeCorridorKit(options = {}) {
  const corridorCount = Math.max(2, Math.floor(n(options.corridorCount, 3)));
  return {
    id: "terrain-altitude-corridor-kit",
    domain: "terrain-expedition-readability/flight-safety/altitude-corridor-domain",
    describe(input = {}) {
      const camera = input.camera ?? {};
      const focus = input.terrain?.focus ?? input.terrainSample ?? {};
      const sample = input.terrainSample ?? findTagged(coerceSamples(input), "focus", 0);
      const clearance = n(camera.position?.y) - n(sample.height);
      return Array.from({ length: corridorCount }, (_, index) => {
        const targetClearance = [150, 360, 720][index] ?? 360 + index * 220;
        const delta = Math.abs(clearance - targetClearance);
        return {
          id: `altitude-corridor-${index}`,
          kind: "altitude-corridor",
          center: vector3({ x: n(focus.x ?? camera.position?.x), y: n(sample.height) + targetClearance, z: n(focus.z ?? camera.position?.z) }),
          radiusMeters: round(720 + index * 620),
          clearanceMeters: round(targetClearance, 1),
          currentClearanceMeters: round(clearance, 1),
          status: delta < 110 ? "inside" : clearance < targetClearance ? "climb" : "above",
          confidence: round(clamp(1 - delta / 900, 0.15, 1)),
          rendererContract: RENDERER_CONTRACT
        };
      });
    }
  };
}

export function createTerrainRidgePassBeaconKit(options = {}) {
  const maxBeacons = Math.max(1, Math.floor(n(options.maxBeacons, 4)));
  return {
    id: "terrain-ridge-pass-beacon-kit",
    domain: "terrain-expedition-readability/route-intent/ridge-pass-domain",
    describe(input = {}) {
      return coerceSamples(input)
        .map((sample) => ({ sample, risk: terrainRisk(sample) }))
        .filter(({ sample, risk }) => ["ridge", "bench", "saddle", "spur"].includes(sample.landform?.landform) || (sample.tag ?? "").includes("ridge") || risk < 0.48)
        .sort((a, b) => (a.risk - b.risk) || n(b.sample.height) - n(a.sample.height))
        .slice(0, maxBeacons)
        .map(({ sample, risk }, index) => ({
          id: `ridge-pass-beacon-${index}-${sample.tag ?? "sample"}`,
          kind: "ridge-pass-beacon",
          label: risk < 0.38 ? "clean-pass" : "check-slope",
          position: vector3({ x: n(sample.x), y: n(sample.height) + 118 + index * 12, z: n(sample.z) }),
          passScore: round(clamp((1 - risk) * 0.72 + (sample.landform?.confidence ?? 0.4) * 0.28, 0, 1)),
          risk,
          biome: dominantBiome(sample),
          rendererContract: RENDERER_CONTRACT
        }));
    }
  };
}

export function createTerrainHazardBasinKit(options = {}) {
  const maxBasins = Math.max(1, Math.floor(n(options.maxBasins, 5)));
  return {
    id: "terrain-hazard-basin-kit",
    domain: "terrain-expedition-readability/flight-safety/hazard-basin-domain",
    describe(input = {}) {
      return coerceSamples(input)
        .map((sample) => ({ sample, risk: terrainRisk(sample) }))
        .filter(({ risk }) => risk >= 0.42)
        .sort((a, b) => b.risk - a.risk)
        .slice(0, maxBasins)
        .map(({ sample, risk }, index) => ({
          id: `hazard-basin-${index}-${sample.tag ?? "sample"}`,
          kind: "hazard-basin",
          position: vector3({ x: n(sample.x), y: n(sample.height) + 12, z: n(sample.z) }),
          radiusMeters: round(150 + risk * 310),
          risk,
          cause: n(sample.hydrology?.flow?.wetnessIndex) > 0.58 ? "wet-channel" : n(sample.slope) > 28 ? "steep-slope" : "rugged-basin",
          avoidStrength: round(clamp(0.25 + risk * 0.75, 0, 1)),
          rendererContract: RENDERER_CONTRACT
        }));
    }
  };
}

export function createTerrainSampleBookmarkKit(options = {}) {
  const maxBookmarks = Math.max(2, Math.floor(n(options.maxBookmarks, 6)));
  return {
    id: "terrain-sample-bookmark-kit",
    domain: "terrain-expedition-readability/survey-planning/sample-bookmark-domain",
    describe(input = {}) {
      return coerceSamples(input)
        .slice(0, maxBookmarks)
        .map((sample, index) => {
          const risk = terrainRisk(sample);
          return {
            id: `sample-bookmark-${index}-${sample.tag ?? "sample"}`,
            kind: "sample-bookmark",
            tag: sample.tag ?? `sample-${index}`,
            position: vector3({ x: n(sample.x), y: n(sample.height) + 78, z: n(sample.z) }),
            biome: dominantBiome(sample),
            materialRole: Object.entries(sample.material?.materialWeights ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0] ?? sample.material?.albedoHint ?? "unknown",
            priority: round(clamp((sample.landform?.confidence ?? 0.5) * 0.45 + (1 - risk) * 0.3 + clamp(n(sample.hydrology?.flow?.channelPotential), 0, 1) * 0.25, 0, 1)),
            risk,
            rendererContract: RENDERER_CONTRACT
          };
        });
    }
  };
}

export function createTerrainRouteTaskBandKit(options = {}) {
  const bandCount = Math.max(2, Math.floor(n(options.bandCount, 4)));
  return {
    id: "terrain-route-task-band-kit",
    domain: "terrain-expedition-readability/route-intent/task-band-domain",
    describe(input = {}) {
      const camera = input.camera ?? {};
      const sample = input.terrainSample ?? findTagged(coerceSamples(input), "focus", 0);
      const forecast = input.visual?.travelForecast ?? {};
      const forward = forwardVector(camera.yaw);
      const action = forecast.recommendedAction ?? "free-cruise";
      return Array.from({ length: bandCount }, (_, index) => {
        const distance = 460 + index * 360;
        return {
          id: `route-task-band-${index}`,
          kind: "route-task-band",
          label: index === 0 ? action : index === 1 ? "survey-next-sample" : index === 2 ? "keep-clearance" : "compare-biomes",
          center: vector3({ x: n(camera.position?.x) + forward.x * distance, y: n(sample.height) + 92 + index * 34, z: n(camera.position?.z) + forward.z * distance }),
          radiusMeters: round(220 + index * 80),
          priority: round(clamp((forecast.cueStrength ?? 0.34) + index * 0.08, 0, 1)),
          recommendedAction: action,
          rendererContract: RENDERER_CONTRACT
        };
      });
    }
  };
}

export function createTerrainExpeditionRendererHandoffKit(kits = {}) {
  const surveyTransectKit = kits.surveyTransectKit ?? createTerrainSurveyTransectKit();
  const altitudeCorridorKit = kits.altitudeCorridorKit ?? createTerrainAltitudeCorridorKit();
  const ridgePassBeaconKit = kits.ridgePassBeaconKit ?? createTerrainRidgePassBeaconKit();
  const hazardBasinKit = kits.hazardBasinKit ?? createTerrainHazardBasinKit();
  const sampleBookmarkKit = kits.sampleBookmarkKit ?? createTerrainSampleBookmarkKit();
  const routeTaskBandKit = kits.routeTaskBandKit ?? createTerrainRouteTaskBandKit();
  return {
    id: "terrain-expedition-renderer-handoff-kit",
    domain: "terrain-expedition-readability/renderer-handoff",
    describe(input = {}) {
      const surveyTransects = surveyTransectKit.describe(input);
      const altitudeCorridors = altitudeCorridorKit.describe(input);
      const ridgePassBeacons = ridgePassBeaconKit.describe(input);
      const hazardBasins = hazardBasinKit.describe(input);
      const sampleBookmarks = sampleBookmarkKit.describe(input);
      const routeTaskBands = routeTaskBandKit.describe(input);
      const descriptors = { surveyTransects, altitudeCorridors, ridgePassBeacons, hazardBasins, sampleBookmarks, routeTaskBands };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]));
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return { id: "terrain-expedition-renderer-handoff", domainTree: clone(TERRAIN_EXPEDITION_READABILITY_DOMAIN_TREE), descriptors, counts, rendererContract: RENDERER_CONTRACT };
    }
  };
}

export function createTerrainExpeditionReadabilityDomainKit(options = {}) {
  const surveyTransectKit = options.surveyTransectKit ?? createTerrainSurveyTransectKit(options.surveyTransect);
  const altitudeCorridorKit = options.altitudeCorridorKit ?? createTerrainAltitudeCorridorKit(options.altitudeCorridor);
  const ridgePassBeaconKit = options.ridgePassBeaconKit ?? createTerrainRidgePassBeaconKit(options.ridgePassBeacon);
  const hazardBasinKit = options.hazardBasinKit ?? createTerrainHazardBasinKit(options.hazardBasin);
  const sampleBookmarkKit = options.sampleBookmarkKit ?? createTerrainSampleBookmarkKit(options.sampleBookmark);
  const routeTaskBandKit = options.routeTaskBandKit ?? createTerrainRouteTaskBandKit(options.routeTaskBand);
  const rendererHandoffKit = options.rendererHandoffKit ?? createTerrainExpeditionRendererHandoffKit({ surveyTransectKit, altitudeCorridorKit, ridgePassBeaconKit, hazardBasinKit, sampleBookmarkKit, routeTaskBandKit });
  return {
    id: "terrain-expedition-readability-domain-kit",
    domain: "terrain-expedition-readability-domain",
    kits: { surveyTransectKit, altitudeCorridorKit, ridgePassBeaconKit, hazardBasinKit, sampleBookmarkKit, routeTaskBandKit, rendererHandoffKit },
    describe(input = {}) {
      const rendererHandoff = rendererHandoffKit.describe(input);
      return {
        id: "terrain-expedition-readability-domain",
        mode: "survey-flight-descriptor-handoff",
        domainTree: clone(TERRAIN_EXPEDITION_READABILITY_DOMAIN_TREE),
        ...rendererHandoff.descriptors,
        rendererHandoff,
        rendererContract: RENDERER_CONTRACT
      };
    }
  };
}
