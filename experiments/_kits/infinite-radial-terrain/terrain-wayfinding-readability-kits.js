const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const round = (value, digits = 3) => Number(n(value).toFixed(digits));
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

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

export const TERRAIN_WAYFINDING_READABILITY_DOMAIN_TREE = Object.freeze({
  root: "terrain-wayfinding-readability-domain",
  contract: "renderer consumes descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership",
  children: [
    {
      id: "heading-intent-domain",
      children: [
        { id: "bearing-needle-domain", kit: "terrain-bearing-needle-kit" },
        { id: "horizon-landmark-domain", kit: "terrain-horizon-landmark-kit" }
      ]
    },
    {
      id: "route-comparison-domain",
      children: [
        { id: "slope-choice-domain", kit: "terrain-slope-choice-ribbon-kit" },
        { id: "biome-transition-domain", kit: "terrain-biome-transition-gate-kit" }
      ]
    },
    {
      id: "return-safety-domain",
      children: [
        { id: "origin-return-domain", kit: "terrain-origin-return-anchor-kit" },
        { id: "stamina-drift-domain", kit: "terrain-stamina-drift-meter-kit" }
      ]
    },
    {
      id: "renderer-handoff",
      kit: "terrain-wayfinding-renderer-handoff-kit",
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

function findTagged(samples, tag, fallbackIndex = 0) {
  return samples.find((sample) => sample.tag === tag) ?? samples[fallbackIndex] ?? samples[0] ?? {};
}

function forwardVector(yaw = 0) {
  return { x: -Math.sin(n(yaw)), z: -Math.cos(n(yaw)) };
}

function rightVector(yaw = 0) {
  return { x: Math.cos(n(yaw)), z: -Math.sin(n(yaw)) };
}

function terrainRisk(sample = {}) {
  const slope = clamp(n(sample.slope) / 46, 0, 1);
  const rugged = clamp(sample.landform?.terrainRuggedness ?? 0, 0, 1);
  const wet = clamp(sample.hydrology?.flow?.wetnessIndex ?? sample.material?.materialWeights?.wetChannel ?? 0, 0, 1);
  const channel = clamp(n(sample.hydrology?.flow?.channelPotential), 0, 1);
  return round(clamp(slope * 0.36 + rugged * 0.32 + wet * 0.16 + channel * 0.16, 0, 1));
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

function distance2d(a = {}, b = {}) {
  return Math.hypot(n(a.x) - n(b.x), n(a.z) - n(b.z));
}

function cameraOrigin(input = {}) {
  const camera = input.camera ?? {};
  const sample = input.terrainSample ?? findTagged(coerceSamples(input), "focus", 0);
  return {
    x: n(camera.position?.x, sample.x),
    y: n(camera.position?.y, n(sample.height) + 140),
    z: n(camera.position?.z, sample.z)
  };
}

export function createTerrainBearingNeedleKit(options = {}) {
  const needleCount = Math.max(2, Math.floor(n(options.needleCount, 4)));
  return {
    id: "terrain-bearing-needle-kit",
    domain: "terrain-wayfinding-readability/heading-intent-domain/bearing-needle-domain",
    describe(input = {}) {
      const samples = coerceSamples(input);
      const origin = cameraOrigin(input);
      const forward = forwardVector(input.camera?.yaw);
      const right = rightVector(input.camera?.yaw);
      const preferred = [
        { id: "forward", dx: forward.x, dz: forward.z, weight: 1 },
        { id: "left", dx: forward.x * 0.72 - right.x * 0.54, dz: forward.z * 0.72 - right.z * 0.54, weight: 0.74 },
        { id: "right", dx: forward.x * 0.72 + right.x * 0.54, dz: forward.z * 0.72 + right.z * 0.54, weight: 0.74 },
        { id: "return", dx: -origin.x || -forward.x, dz: -origin.z || -forward.z, weight: 0.66 }
      ];
      const focus = input.terrainSample ?? findTagged(samples, "focus", 0);
      return preferred.slice(0, needleCount).map((needle, index) => {
        const length = 520 + index * 170;
        const magnitude = Math.hypot(needle.dx, needle.dz) || 1;
        const dx = needle.dx / magnitude;
        const dz = needle.dz / magnitude;
        const target = {
          x: origin.x + dx * length,
          y: n(focus.height) + 128 + index * 24,
          z: origin.z + dz * length
        };
        return {
          id: `bearing-needle-${index}-${needle.id}`,
          kind: "bearing-needle",
          label: needle.id === "return" ? "origin-bearing" : `${needle.id}-bearing`,
          from: vector3({ x: origin.x, y: n(focus.height) + 118, z: origin.z }),
          to: vector3(target),
          confidence: round(clamp(needle.weight + (input.visual?.travelForecast?.cueStrength ?? 0.24) * 0.18, 0, 1)),
          headingRadians: round(Math.atan2(-dx, -dz), 4),
          rendererContract: RENDERER_CONTRACT
        };
      });
    }
  };
}

export function createTerrainHorizonLandmarkKit(options = {}) {
  const maxLandmarks = Math.max(2, Math.floor(n(options.maxLandmarks, 5)));
  return {
    id: "terrain-horizon-landmark-kit",
    domain: "terrain-wayfinding-readability/heading-intent-domain/horizon-landmark-domain",
    describe(input = {}) {
      return coerceSamples(input)
        .filter((sample) => ["ahead", "far-ahead", "left-ridge", "right-ridge", "north", "east", "west"].includes(sample.tag) || n(sample.height) > n(input.terrainSample?.height) + 120)
        .map((sample) => ({ sample, score: clamp(n(sample.height) / 2200 * 0.36 + (sample.landform?.confidence ?? 0.4) * 0.42 + (1 - terrainRisk(sample)) * 0.22, 0, 1) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, maxLandmarks)
        .map(({ sample, score }, index) => ({
          id: `horizon-landmark-${index}-${sample.tag ?? "sample"}`,
          kind: "horizon-landmark",
          label: sample.landform?.landform ?? dominantBiome(sample),
          position: vector3({ x: n(sample.x), y: n(sample.height) + 180 + index * 26, z: n(sample.z) }),
          prominence: round(score),
          biome: dominantBiome(sample),
          risk: terrainRisk(sample),
          rendererContract: RENDERER_CONTRACT
        }));
    }
  };
}

export function createTerrainSlopeChoiceRibbonKit(options = {}) {
  const maxRibbons = Math.max(2, Math.floor(n(options.maxRibbons, 4)));
  return {
    id: "terrain-slope-choice-ribbon-kit",
    domain: "terrain-wayfinding-readability/route-comparison-domain/slope-choice-domain",
    describe(input = {}) {
      const samples = coerceSamples(input);
      const focus = input.terrainSample ?? findTagged(samples, "focus", 0);
      return samples
        .filter((sample) => sample.tag !== "focus")
        .map((sample) => {
          const slopeDelta = Math.abs(n(sample.slope) - n(focus.slope));
          const risk = terrainRisk(sample);
          return { sample, risk, score: clamp((1 - risk) * 0.6 + clamp(1 - slopeDelta / 38, 0, 1) * 0.4, 0, 1) };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, maxRibbons)
        .map(({ sample, risk, score }, index) => ({
          id: `slope-choice-ribbon-${index}-${sample.tag ?? "sample"}`,
          kind: "slope-choice-ribbon",
          label: score > 0.68 ? "clean-slope" : risk > 0.56 ? "avoid-steep" : "survey-slope",
          from: vector3({ x: n(focus.x), y: n(focus.height) + 72, z: n(focus.z) }),
          to: vector3({ x: n(sample.x), y: n(sample.height) + 94, z: n(sample.z) }),
          score: round(score),
          risk,
          widthMeters: round(34 + score * 92),
          rendererContract: RENDERER_CONTRACT
        }));
    }
  };
}

export function createTerrainBiomeTransitionGateKit(options = {}) {
  const maxGates = Math.max(2, Math.floor(n(options.maxGates, 4)));
  return {
    id: "terrain-biome-transition-gate-kit",
    domain: "terrain-wayfinding-readability/route-comparison-domain/biome-transition-domain",
    describe(input = {}) {
      const samples = coerceSamples(input);
      const focusBiome = dominantBiome(input.terrainSample ?? findTagged(samples, "focus", 0));
      return samples
        .filter((sample) => sample.tag !== "focus")
        .map((sample) => ({ sample, biome: dominantBiome(sample), risk: terrainRisk(sample) }))
        .filter(({ biome }, index) => biome !== focusBiome || index < 2)
        .slice(0, maxGates)
        .map(({ sample, biome, risk }, index) => ({
          id: `biome-transition-gate-${index}-${sample.tag ?? "sample"}`,
          kind: "biome-transition-gate",
          fromBiome: focusBiome,
          toBiome: biome,
          center: vector3({ x: n(sample.x), y: n(sample.height) + 62, z: n(sample.z) }),
          radiusMeters: round(120 + (1 - risk) * 180 + index * 28),
          transitionValue: round(clamp((biome === focusBiome ? 0.28 : 0.72) + (1 - risk) * 0.18, 0, 1)),
          rendererContract: RENDERER_CONTRACT
        }));
    }
  };
}

export function createTerrainOriginReturnAnchorKit(options = {}) {
  const anchorCount = Math.max(1, Math.floor(n(options.anchorCount, 2)));
  return {
    id: "terrain-origin-return-anchor-kit",
    domain: "terrain-wayfinding-readability/return-safety-domain/origin-return-domain",
    describe(input = {}) {
      const origin = input.terrain?.origin ?? { x: 0, z: 0 };
      const camera = cameraOrigin(input);
      const focus = input.terrainSample ?? findTagged(coerceSamples(input), "focus", 0);
      const distance = Math.hypot(n(camera.x) - n(origin.x), n(camera.z) - n(origin.z));
      return Array.from({ length: anchorCount }, (_, index) => {
        const radius = 180 + index * 160 + clamp(distance / 4800, 0, 1) * 160;
        return {
          id: `origin-return-anchor-${index}`,
          kind: "origin-return-anchor",
          label: index === 0 ? "return-origin" : "safe-recenter",
          center: vector3({ x: n(origin.x), y: n(focus.height) + 84 + index * 26, z: n(origin.z) }),
          from: vector3({ x: camera.x, y: n(focus.height) + 112, z: camera.z }),
          distanceMeters: round(distance, 1),
          radiusMeters: round(radius),
          urgency: round(clamp(distance / 5200, 0.12, 1)),
          rendererContract: RENDERER_CONTRACT
        };
      });
    }
  };
}

export function createTerrainStaminaDriftMeterKit(options = {}) {
  const meterCount = Math.max(1, Math.floor(n(options.meterCount, 3)));
  return {
    id: "terrain-stamina-drift-meter-kit",
    domain: "terrain-wayfinding-readability/return-safety-domain/stamina-drift-domain",
    describe(input = {}) {
      const samples = coerceSamples(input);
      const focus = input.terrainSample ?? findTagged(samples, "focus", 0);
      const camera = cameraOrigin(input);
      const forward = forwardVector(input.camera?.yaw);
      const baseRisk = terrainRisk(focus);
      const clearance = n(camera.y) - n(focus.height);
      return Array.from({ length: meterCount }, (_, index) => {
        const load = clamp(baseRisk * 0.42 + clamp(1 - clearance / (520 + index * 180), 0, 1) * 0.42 + index * 0.08, 0, 1);
        return {
          id: `stamina-drift-meter-${index}`,
          kind: "stamina-drift-meter",
          label: load > 0.66 ? "slow-survey" : load > 0.38 ? "watch-clearance" : "stable-cruise",
          position: vector3({ x: camera.x + forward.x * (240 + index * 140), y: n(focus.height) + 160 + index * 44, z: camera.z + forward.z * (240 + index * 140) }),
          load: round(load),
          clearanceMeters: round(clearance, 1),
          driftMeters: round(distance2d(camera, input.terrain?.origin ?? { x: 0, z: 0 }), 1),
          rendererContract: RENDERER_CONTRACT
        };
      });
    }
  };
}

export function createTerrainWayfindingRendererHandoffKit(kits = {}) {
  const bearingNeedleKit = kits.bearingNeedleKit ?? createTerrainBearingNeedleKit();
  const horizonLandmarkKit = kits.horizonLandmarkKit ?? createTerrainHorizonLandmarkKit();
  const slopeChoiceRibbonKit = kits.slopeChoiceRibbonKit ?? createTerrainSlopeChoiceRibbonKit();
  const biomeTransitionGateKit = kits.biomeTransitionGateKit ?? createTerrainBiomeTransitionGateKit();
  const originReturnAnchorKit = kits.originReturnAnchorKit ?? createTerrainOriginReturnAnchorKit();
  const staminaDriftMeterKit = kits.staminaDriftMeterKit ?? createTerrainStaminaDriftMeterKit();
  return {
    id: "terrain-wayfinding-renderer-handoff-kit",
    domain: "terrain-wayfinding-readability/renderer-handoff",
    describe(input = {}) {
      const bearingNeedles = bearingNeedleKit.describe(input);
      const horizonLandmarks = horizonLandmarkKit.describe(input);
      const slopeChoiceRibbons = slopeChoiceRibbonKit.describe(input);
      const biomeTransitionGates = biomeTransitionGateKit.describe(input);
      const originReturnAnchors = originReturnAnchorKit.describe(input);
      const staminaDriftMeters = staminaDriftMeterKit.describe(input);
      const descriptors = { bearingNeedles, horizonLandmarks, slopeChoiceRibbons, biomeTransitionGates, originReturnAnchors, staminaDriftMeters };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]));
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return { id: "terrain-wayfinding-renderer-handoff", domainTree: clone(TERRAIN_WAYFINDING_READABILITY_DOMAIN_TREE), descriptors, counts, rendererContract: RENDERER_CONTRACT };
    }
  };
}

export function createTerrainWayfindingReadabilityDomainKit(options = {}) {
  const bearingNeedleKit = options.bearingNeedleKit ?? createTerrainBearingNeedleKit(options.bearingNeedle);
  const horizonLandmarkKit = options.horizonLandmarkKit ?? createTerrainHorizonLandmarkKit(options.horizonLandmark);
  const slopeChoiceRibbonKit = options.slopeChoiceRibbonKit ?? createTerrainSlopeChoiceRibbonKit(options.slopeChoiceRibbon);
  const biomeTransitionGateKit = options.biomeTransitionGateKit ?? createTerrainBiomeTransitionGateKit(options.biomeTransitionGate);
  const originReturnAnchorKit = options.originReturnAnchorKit ?? createTerrainOriginReturnAnchorKit(options.originReturnAnchor);
  const staminaDriftMeterKit = options.staminaDriftMeterKit ?? createTerrainStaminaDriftMeterKit(options.staminaDriftMeter);
  const rendererHandoffKit = options.rendererHandoffKit ?? createTerrainWayfindingRendererHandoffKit({
    bearingNeedleKit,
    horizonLandmarkKit,
    slopeChoiceRibbonKit,
    biomeTransitionGateKit,
    originReturnAnchorKit,
    staminaDriftMeterKit
  });
  return {
    id: "terrain-wayfinding-readability-domain-kit",
    domain: "terrain-wayfinding-readability-domain",
    kits: { bearingNeedleKit, horizonLandmarkKit, slopeChoiceRibbonKit, biomeTransitionGateKit, originReturnAnchorKit, staminaDriftMeterKit, rendererHandoffKit },
    describe(input = {}) {
      const rendererHandoff = rendererHandoffKit.describe(input);
      return {
        id: "terrain-wayfinding-readability-domain",
        mode: "bearing-route-return-descriptor-handoff",
        domainTree: clone(TERRAIN_WAYFINDING_READABILITY_DOMAIN_TREE),
        ...rendererHandoff.descriptors,
        rendererHandoff,
        rendererContract: RENDERER_CONTRACT
      };
    }
  };
}
