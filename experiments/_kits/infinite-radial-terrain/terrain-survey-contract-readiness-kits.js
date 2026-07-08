const stableArray = (value) => Array.isArray(value) ? [...value] : [];
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value, min)));
const clamp01 = (value) => clamp(value, 0, 1);
const round = (value, digits = 3) => Number(n(value).toFixed(digits));

function positionOf(sample = {}, fallback = {}) {
  return {
    x: round(n(sample.x, fallback.x)),
    y: round(n(sample.height, sample.y ?? fallback.y), 1),
    z: round(n(sample.z, fallback.z))
  };
}

function cameraPosition(camera = {}) {
  if (Array.isArray(camera.position)) return { x: n(camera.position[0]), y: n(camera.position[1]), z: n(camera.position[2]) };
  return { x: n(camera.position?.x), y: n(camera.position?.y), z: n(camera.position?.z) };
}

function distance2d(a = {}, b = {}) {
  return Math.hypot(n(a.x) - n(b.x), n(a.z) - n(b.z));
}

function terrainRisk(sample = {}) {
  const slopeRisk = clamp01((n(sample.slope) - 10) / 34);
  const wetness = clamp01(sample.hydrology?.flow?.wetnessIndex ?? sample.material?.materialWeights?.wetChannel ?? 0);
  const ruggedness = clamp01(sample.landform?.terrainRuggedness ?? sample.landform?.ruggedness ?? 0);
  const snow = clamp01(sample.material?.materialWeights?.snow ?? 0);
  return clamp01(slopeRisk * 0.38 + wetness * 0.2 + ruggedness * 0.3 + snow * 0.12);
}

function surveyValue(sample = {}, index = 0) {
  const confidence = clamp01(sample.landform?.confidence ?? 0.4);
  const channel = clamp01(sample.hydrology?.flow?.channelPotential ?? 0.12);
  const vegetation = clamp01(sample.climate?.vegetationPotential ?? sample.material?.vegetationMask ?? 0.2);
  const novelty = clamp01(0.24 + index * 0.055 + Math.abs(n(sample.height) - n(sample.y)) / 2200);
  return clamp01(confidence * 0.28 + channel * 0.24 + vegetation * 0.18 + novelty * 0.3);
}

function rendererContract(owner) {
  return {
    owner,
    rendererConsumes: "terrain survey contract descriptors only",
    rendererMustOwn: ["DOM placement", "Canvas/Three draw order", "color application", "view interpolation"],
    rendererMustNotOwn: ["mission truth", "terrain sampling", "browser input", "flight physics", "route scoring", "asset loading", "audio", "frame loop", "Three.js", "WebGL"]
  };
}

export const TERRAIN_SURVEY_CONTRACT_READINESS_DOMAIN_TREE = Object.freeze({
  root: "terrain-survey-contract-readiness-domain",
  subdomains: [
    {
      id: "mission-contract-domain",
      subdomains: [
        { id: "survey-step-domain", kits: ["terrain-survey-contract-step-kit"] },
        { id: "sample-chain-domain", kits: ["terrain-sample-chain-ghost-kit"] }
      ]
    },
    {
      id: "pacing-and-choice-domain",
      subdomains: [
        { id: "waypoint-tempo-domain", kits: ["terrain-waypoint-tempo-ring-kit"] },
        { id: "risk-reward-fork-domain", kits: ["terrain-risk-reward-fork-kit"] }
      ]
    },
    {
      id: "safety-return-domain",
      subdomains: [
        { id: "altitude-pledge-domain", kits: ["terrain-altitude-pledge-band-kit"] },
        { id: "return-confidence-domain", kits: ["terrain-return-confidence-compass-kit"] }
      ]
    },
    {
      id: "renderer-handoff",
      kits: ["terrain-survey-contract-renderer-handoff-kit"],
      contract: "renderer consumes descriptors only"
    }
  ],
  contract: "renderer consumes terrain survey contract descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership"
});

export function createTerrainSurveyContractStepKit({ maxSteps = 5 } = {}) {
  return {
    id: "terrain-survey-contract-step-kit",
    domain: "terrain-survey-contract-readiness/mission-contract-domain/survey-step-domain",
    describe(input = {}) {
      const samples = stableArray(input.samples).filter(Boolean);
      const cam = cameraPosition(input.camera);
      return samples
        .map((sample, index) => {
          const value = surveyValue(sample, index);
          const risk = terrainRisk(sample);
          const position = positionOf(sample, cam);
          const distanceMeters = distance2d(position, cam);
          const completion = clamp01(1 - distanceMeters / 2200 + value * 0.18 - risk * 0.12);
          return {
            id: `survey-contract-step-${sample.tag ?? index}`,
            kind: "survey-contract-step",
            label: sample.tag ?? `sample-${index}`,
            order: index,
            position,
            distanceMeters: round(distanceMeters, 1),
            completion: round(completion),
            value: round(value),
            risk: round(risk),
            rendererContract: rendererContract("terrain-survey-contract-step-kit")
          };
        })
        .sort((a, b) => b.value - b.risk * 0.42 - (a.value - a.risk * 0.42))
        .slice(0, maxSteps)
        .map((step, index) => ({ ...step, order: index, active: index === 0 || step.completion < 0.72 }));
    },
    snapshot(input) {
      const steps = this.describe(input);
      return { steps: steps.length, active: steps.filter((step) => step.active).length, topValue: steps[0]?.value ?? 0 };
    }
  };
}

export function createTerrainWaypointTempoRingKit({ ringCount = 4 } = {}) {
  return {
    id: "terrain-waypoint-tempo-ring-kit",
    domain: "terrain-survey-contract-readiness/pacing-and-choice-domain/waypoint-tempo-domain",
    describe(input = {}) {
      const samples = stableArray(input.samples).filter(Boolean);
      const cam = cameraPosition(input.camera);
      const time = n(input.time);
      return samples.slice(0, ringCount).map((sample, index) => {
        const position = positionOf(sample, cam);
        const beat = clamp01(0.48 + Math.sin(time * 1.15 + index * 0.8) * 0.22 + surveyValue(sample, index) * 0.3);
        return {
          id: `waypoint-tempo-ring-${sample.tag ?? index}`,
          kind: "waypoint-tempo-ring",
          center: position,
          radiusMeters: round(120 + index * 64 + beat * 72, 1),
          beat: round(beat),
          tempo: beat > 0.68 ? "commit" : beat < 0.42 ? "hold" : "approach",
          rendererContract: rendererContract("terrain-waypoint-tempo-ring-kit")
        };
      });
    },
    snapshot(input) {
      const rings = this.describe(input);
      return { rings: rings.length, commitRings: rings.filter((ring) => ring.tempo === "commit").length };
    }
  };
}

export function createTerrainRiskRewardForkKit({ maxForks = 4 } = {}) {
  return {
    id: "terrain-risk-reward-fork-kit",
    domain: "terrain-survey-contract-readiness/pacing-and-choice-domain/risk-reward-fork-domain",
    describe(input = {}) {
      const cam = cameraPosition(input.camera);
      const samples = stableArray(input.samples).filter(Boolean).slice(1);
      return samples
        .map((sample, index) => {
          const position = positionOf(sample, cam);
          const risk = terrainRisk(sample);
          const reward = surveyValue(sample, index + 1);
          const routeBias = reward - risk * 0.58;
          return {
            id: `risk-reward-fork-${sample.tag ?? index}`,
            kind: "risk-reward-fork",
            from: { x: round(cam.x), y: round(cam.y), z: round(cam.z) },
            to: position,
            label: routeBias >= 0.16 ? "survey-payoff" : risk > 0.58 ? "avoid-for-now" : "slow-approach",
            reward: round(reward),
            risk: round(risk),
            routeBias: round(routeBias),
            widthMeters: round(18 + Math.abs(routeBias) * 46, 1),
            rendererContract: rendererContract("terrain-risk-reward-fork-kit")
          };
        })
        .sort((a, b) => Math.abs(b.routeBias) - Math.abs(a.routeBias))
        .slice(0, maxForks);
    },
    snapshot(input) {
      const forks = this.describe(input);
      return { forks: forks.length, positive: forks.filter((fork) => fork.routeBias > 0).length };
    }
  };
}

export function createTerrainAltitudePledgeBandKit({ bandCount = 3 } = {}) {
  return {
    id: "terrain-altitude-pledge-band-kit",
    domain: "terrain-survey-contract-readiness/safety-return-domain/altitude-pledge-domain",
    describe(input = {}) {
      const cam = cameraPosition(input.camera);
      const terrainHeight = n(input.terrainSample?.height, input.terrainSample?.y ?? cam.y - 180);
      const clearance = cam.y - terrainHeight;
      return Array.from({ length: bandCount }, (_, index) => {
        const minimum = 120 + index * 170;
        const score = clamp01((clearance - minimum + 120) / 420);
        return {
          id: `altitude-pledge-band-${index}`,
          kind: "altitude-pledge-band",
          center: { x: round(cam.x), y: round(terrainHeight + minimum, 1), z: round(cam.z) },
          minimumMeters: minimum,
          clearanceMeters: round(clearance, 1),
          score: round(score),
          status: score > 0.72 ? "kept" : score > 0.34 ? "thin" : "broken",
          rendererContract: rendererContract("terrain-altitude-pledge-band-kit")
        };
      });
    },
    snapshot(input) {
      const bands = this.describe(input);
      return { bands: bands.length, broken: bands.filter((band) => band.status === "broken").length };
    }
  };
}

export function createTerrainSampleChainGhostKit({ ghostCount = 6 } = {}) {
  return {
    id: "terrain-sample-chain-ghost-kit",
    domain: "terrain-survey-contract-readiness/mission-contract-domain/sample-chain-domain",
    describe(input = {}) {
      const samples = stableArray(input.samples).filter(Boolean);
      return samples.slice(0, ghostCount).map((sample, index) => ({
        id: `sample-chain-ghost-${sample.tag ?? index}`,
        kind: "sample-chain-ghost",
        position: positionOf(sample),
        label: sample.tag ?? `sample-${index}`,
        priority: round(surveyValue(sample, index)),
        risk: round(terrainRisk(sample)),
        chainIndex: index,
        rendererContract: rendererContract("terrain-sample-chain-ghost-kit")
      }));
    },
    snapshot(input) {
      const ghosts = this.describe(input);
      return { ghosts: ghosts.length, highestPriority: ghosts.reduce((best, ghost) => Math.max(best, ghost.priority), 0) };
    }
  };
}

export function createTerrainReturnConfidenceCompassKit() {
  return {
    id: "terrain-return-confidence-compass-kit",
    domain: "terrain-survey-contract-readiness/safety-return-domain/return-confidence-domain",
    describe(input = {}) {
      const cam = cameraPosition(input.camera);
      const origin = input.terrain?.origin ?? { x: 0, z: 0 };
      const dx = n(origin.x) - cam.x;
      const dz = n(origin.z) - cam.z;
      const distanceMeters = Math.hypot(dx, dz);
      const clearance = cam.y - n(input.terrainSample?.height, cam.y - 180);
      const confidence = clamp01(1 - distanceMeters / 8200 + clearance / 1800);
      return {
        id: "return-confidence-compass",
        kind: "return-confidence-compass",
        origin: { x: round(n(origin.x)), y: round(n(input.terrainSample?.height, 0), 1), z: round(n(origin.z)) },
        headingRadians: round(Math.atan2(dx, dz), 4),
        distanceMeters: round(distanceMeters, 1),
        confidence: round(confidence),
        status: confidence > 0.68 ? "anchored" : confidence > 0.36 ? "drifting" : "lost-thread",
        rendererContract: rendererContract("terrain-return-confidence-compass-kit")
      };
    },
    snapshot(input) {
      const compass = this.describe(input);
      return { status: compass.status, confidence: compass.confidence, distanceMeters: compass.distanceMeters };
    }
  };
}

export function createTerrainSurveyContractRendererHandoffKit({
  surveyContractStepKit = createTerrainSurveyContractStepKit(),
  waypointTempoRingKit = createTerrainWaypointTempoRingKit(),
  riskRewardForkKit = createTerrainRiskRewardForkKit(),
  altitudePledgeBandKit = createTerrainAltitudePledgeBandKit(),
  sampleChainGhostKit = createTerrainSampleChainGhostKit(),
  returnConfidenceCompassKit = createTerrainReturnConfidenceCompassKit()
} = {}) {
  return {
    id: "terrain-survey-contract-renderer-handoff-kit",
    domain: "terrain-survey-contract-readiness/renderer-handoff",
    kits: { surveyContractStepKit, waypointTempoRingKit, riskRewardForkKit, altitudePledgeBandKit, sampleChainGhostKit, returnConfidenceCompassKit },
    describe(input = {}) {
      const surveyContractSteps = surveyContractStepKit.describe(input);
      const waypointTempoRings = waypointTempoRingKit.describe(input);
      const riskRewardForks = riskRewardForkKit.describe(input);
      const altitudePledgeBands = altitudePledgeBandKit.describe(input);
      const sampleChainGhosts = sampleChainGhostKit.describe(input);
      const returnConfidenceCompass = returnConfidenceCompassKit.describe(input);
      const counts = {
        surveyContractSteps: surveyContractSteps.length,
        waypointTempoRings: waypointTempoRings.length,
        riskRewardForks: riskRewardForks.length,
        altitudePledgeBands: altitudePledgeBands.length,
        sampleChainGhosts: sampleChainGhosts.length,
        returnConfidenceCompass: returnConfidenceCompass ? 1 : 0
      };
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id: "terrain-survey-contract-renderer-handoff",
        domainTree: TERRAIN_SURVEY_CONTRACT_READINESS_DOMAIN_TREE,
        policy: "renderer-consumes-descriptors-only",
        rendererContract: rendererContract("terrain-survey-contract-renderer-handoff-kit"),
        descriptors: { surveyContractSteps, waypointTempoRings, riskRewardForks, altitudePledgeBands, sampleChainGhosts, returnConfidenceCompass },
        counts
      };
    },
    snapshot(input) {
      const handoff = this.describe(input);
      return { total: handoff.counts.total, steps: handoff.counts.surveyContractSteps, returnStatus: handoff.descriptors.returnConfidenceCompass.status };
    }
  };
}

export function createTerrainSurveyContractReadinessDomainKit(options = {}) {
  const rendererHandoffKit = options.rendererHandoffKit ?? createTerrainSurveyContractRendererHandoffKit(options);
  return {
    id: "terrain-survey-contract-readiness-domain-kit",
    domain: "terrain-survey-contract-readiness-domain",
    rendererHandoffKit,
    describe(input = {}) {
      const rendererHandoff = rendererHandoffKit.describe(input);
      return {
        id: "terrain-survey-contract-readiness-domain",
        domainTree: TERRAIN_SURVEY_CONTRACT_READINESS_DOMAIN_TREE,
        rendererHandoff,
        surveyContractSteps: rendererHandoff.descriptors.surveyContractSteps,
        waypointTempoRings: rendererHandoff.descriptors.waypointTempoRings,
        riskRewardForks: rendererHandoff.descriptors.riskRewardForks,
        altitudePledgeBands: rendererHandoff.descriptors.altitudePledgeBands,
        sampleChainGhosts: rendererHandoff.descriptors.sampleChainGhosts,
        returnConfidenceCompass: rendererHandoff.descriptors.returnConfidenceCompass,
        rendererContract: rendererContract("terrain-survey-contract-readiness-domain-kit")
      };
    },
    snapshot(input) {
      const descriptor = this.describe(input);
      return {
        total: descriptor.rendererHandoff.counts.total,
        steps: descriptor.surveyContractSteps.length,
        forks: descriptor.riskRewardForks.length,
        returnStatus: descriptor.returnConfidenceCompass.status
      };
    }
  };
}
