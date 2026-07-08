const round = (value, places = 3) => Number(Number(value).toFixed(places));
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));

function safeInput(input = {}) {
  return {
    thrust: clamp(input.thrust ?? input.forward ?? 0, -1, 1),
    bank: clamp(input.bank ?? input.x ?? 0, -1, 1),
    climb: clamp(input.climb ?? input.y ?? 0, -1, 1),
    launch: Boolean(input.launch),
    pointerActive: Boolean(input.pointerActive),
    pointerX: clamp(input.pointerX ?? 0.5, 0, 1),
    pointerY: clamp(input.pointerY ?? 0.5, 0, 1)
  };
}

function skySummary(input = {}) {
  return input.skyNegotiationReadiness?.summary ?? {};
}

function flightSummary(input = {}) {
  return input.flightplanReadability?.summary ?? {};
}

function preflightSummary(input = {}) {
  return input.preflightChallengeReadiness?.summary ?? {};
}

export const SORA_MICROFLIGHT_TRIAL_READINESS_DOMAIN_TREE = `sora-microflight-trial-readiness-domain
├─ lift-economy-domain
│  ├─ thermal-token-domain
│  │  └─ sora-thermal-token-cluster-kit
│  └─ glide-stamina-domain
│     └─ sora-glide-stamina-ribbon-kit
├─ hazard-routing-domain
│  ├─ crosswind-gate-domain
│  │  └─ sora-crosswind-gate-weave-kit
│  └─ storm-burst-domain
│     └─ sora-storm-burst-avoidance-kit
├─ score-return-domain
│  ├─ sky-medal-domain
│  │  └─ sora-sky-medal-score-kit
│  └─ landing-runway-domain
│     └─ sora-landing-runway-commit-kit
└─ renderer-handoff
   └─ sora-microflight-trial-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createSoraThermalTokenClusterKit(options = {}) {
  const tokenCount = Math.floor(clamp(options.tokenCount ?? 7, 4, 10));
  return {
    id: "sora-thermal-token-cluster-kit",
    describe(input = {}) {
      const tick = clamp(input.tick ?? 0, 0, 1000000);
      const readiness = clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const thermalHelp = clamp((skySummary(input).chosenThermalRungs ?? 0) / 6, 0, 1);
      const cloudHelp = clamp((flightSummary(input).clearCloudSlits ?? 0) / 6, 0, 1);
      const tokens = Array.from({ length: tokenCount }, (_, index) => {
        const t = tokenCount <= 1 ? 1 : index / (tokenCount - 1);
        const phase = tick * 0.014 + index * 0.88;
        const catchFit = clamp(1 - Math.abs(control.bank - Math.sin(index * 1.7) * 0.65) * 0.42, 0, 1);
        const value = clamp(readiness * 0.26 + Math.max(0, control.thrust) * 0.22 + thermalHelp * 0.22 + cloudHelp * 0.13 + catchFit * 0.17, 0, 1);
        return {
          id: `thermal-token-${index}`,
          kind: "thermal-token",
          index,
          x: round(14 + t * 72 + Math.sin(phase) * 3, 2),
          y: round(32 + Math.cos(phase * 0.8) * 18 + index % 2 * 8, 2),
          value: round(value),
          collected: value >= 0.58,
          label: value >= 0.72 ? "bright thermal token" : value >= 0.58 ? "reachable thermal token" : "cold thermal token"
        };
      });
      return { kind: "thermal-token-clusters", tokens };
    }
  };
}

export function createSoraGlideStaminaRibbonKit(options = {}) {
  const segmentCount = Math.floor(clamp(options.segmentCount ?? 6, 4, 8));
  return {
    id: "sora-glide-stamina-ribbon-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const stormPenalty = clamp((skySummary(input).activeStormShelves ?? 0) / 4, 0, 1);
      const tetherHelp = clamp((preflightSummary(input).linkedVelocityTethers ?? 0) / 7, 0, 1);
      const drain = Math.abs(control.bank) * 0.2 + Math.max(0, -control.climb) * 0.18 + stormPenalty * 0.22;
      const staminaBase = clamp(0.2 + readiness * 0.33 + Math.max(0, control.thrust) * 0.19 + tetherHelp * 0.2 - drain, 0, 1);
      const segments = Array.from({ length: segmentCount }, (_, index) => {
        const t = segmentCount <= 1 ? 1 : index / (segmentCount - 1);
        const stamina = clamp(staminaBase + (0.5 - t) * 0.18, 0, 1);
        return {
          id: `glide-stamina-${index}`,
          kind: "glide-stamina-segment",
          index,
          x: round(18 + t * 64, 2),
          y: round(82 - stamina * 22, 2),
          width: round(8 + stamina * 12, 2),
          stamina: round(stamina),
          stable: stamina >= 0.54,
          label: stamina >= 0.7 ? "long glide reserve" : stamina >= 0.54 ? "usable glide reserve" : "thin glide reserve"
        };
      });
      return { kind: "glide-stamina-ribbons", segments, average: round(segments.reduce((sum, segment) => sum + segment.stamina, 0) / Math.max(1, segments.length)) };
    }
  };
}

export function createSoraCrosswindGateWeaveKit(options = {}) {
  const gateCount = Math.floor(clamp(options.gateCount ?? 5, 3, 7));
  return {
    id: "sora-crosswind-gate-weave-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const jetstreamHelp = clamp((skySummary(input).usableJetstreams ?? 0) / 6, 0, 1);
      const stormPenalty = clamp((skySummary(input).activeStormShelves ?? 0) / 4, 0, 1);
      const gates = Array.from({ length: gateCount }, (_, index) => {
        const expectedBank = index % 2 === 0 ? -0.45 : 0.45;
        const alignment = clamp(1 - Math.abs(control.bank - expectedBank) * 0.58, 0, 1);
        const weave = clamp(readiness * 0.24 + alignment * 0.34 + jetstreamHelp * 0.23 + Math.max(0, control.climb) * 0.1 - stormPenalty * 0.14 + index * 0.02, 0, 1);
        return {
          id: `crosswind-gate-${index}`,
          kind: "crosswind-gate",
          index,
          x: round(20 + index * (60 / Math.max(1, gateCount - 1)), 2),
          y: round(46 + (index % 2 === 0 ? -12 : 12), 2),
          alignment: round(alignment),
          weave: round(weave),
          open: weave >= 0.56,
          side: expectedBank < 0 ? "left" : "right",
          label: weave >= 0.72 ? "clean crosswind weave" : weave >= 0.56 ? "narrow crosswind gate" : "closed crosswind gate"
        };
      });
      return { kind: "crosswind-gate-weaves", gates };
    }
  };
}

export function createSoraStormBurstAvoidanceKit(options = {}) {
  const burstCount = Math.floor(clamp(options.burstCount ?? 4, 3, 6));
  return {
    id: "sora-storm-burst-avoidance-kit",
    describe(input = {}) {
      const tick = clamp(input.tick ?? 0, 0, 1000000);
      const readiness = clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const activeStorms = clamp((skySummary(input).activeStormShelves ?? 0) / 4, 0, 1);
      const glidePockets = clamp((skySummary(input).openGlidePockets ?? 0) / 5, 0, 1);
      const bursts = Array.from({ length: burstCount }, (_, index) => {
        const phase = tick * 0.02 + index * 1.1;
        const threat = clamp(0.28 + activeStorms * 0.38 + Math.max(0, -control.climb) * 0.15 + Math.abs(control.bank) * 0.1 - readiness * 0.16 - glidePockets * 0.13 + Math.sin(phase) * 0.08, 0, 1);
        return {
          id: `storm-burst-${index}`,
          kind: "storm-burst",
          index,
          x: round(24 + index * (52 / Math.max(1, burstCount - 1)) + Math.sin(phase) * 4, 2),
          y: round(18 + Math.cos(phase) * 8 + index * 5, 2),
          radius: round(8 + threat * 18, 2),
          threat: round(threat),
          avoidable: threat < 0.66,
          label: threat >= 0.66 ? "danger storm burst" : threat >= 0.46 ? "threadable storm burst" : "distant storm burst"
        };
      });
      return { kind: "storm-burst-avoidance", bursts };
    }
  };
}

export function createSoraSkyMedalScoreKit() {
  return {
    id: "sora-sky-medal-score-kit",
    describe(input = {}) {
      const tokenScore = clamp((input.thermalTokenClusters?.tokens ?? []).filter((token) => token.collected).length / Math.max(1, (input.thermalTokenClusters?.tokens ?? []).length), 0, 1);
      const gateScore = clamp((input.crosswindGateWeaves?.gates ?? []).filter((gate) => gate.open).length / Math.max(1, (input.crosswindGateWeaves?.gates ?? []).length), 0, 1);
      const stormScore = clamp((input.stormBurstAvoidance?.bursts ?? []).filter((burst) => burst.avoidable).length / Math.max(1, (input.stormBurstAvoidance?.bursts ?? []).length), 0, 1);
      const staminaScore = clamp(input.glideStaminaRibbons?.average ?? 0, 0, 1);
      const medals = [
        { id: "thermal", label: "thermal medal", value: tokenScore },
        { id: "weave", label: "weave medal", value: gateScore },
        { id: "safety", label: "storm safety medal", value: stormScore },
        { id: "stamina", label: "stamina medal", value: staminaScore }
      ].map((medal, index) => ({
        id: `sky-medal-${medal.id}`,
        kind: "sky-medal-score",
        index,
        label: medal.label,
        value: round(medal.value),
        earned: medal.value >= 0.58,
        tier: medal.value >= 0.78 ? "gold" : medal.value >= 0.58 ? "silver" : "training"
      }));
      return { kind: "sky-medal-scores", medals, average: round(medals.reduce((sum, medal) => sum + medal.value, 0) / Math.max(1, medals.length)) };
    }
  };
}

export function createSoraLandingRunwayCommitKit(options = {}) {
  const runwayCount = Math.floor(clamp(options.runwayCount ?? 3, 2, 5));
  return {
    id: "sora-landing-runway-commit-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const returnAnchors = clamp((flightSummary(input).linkedReturnAnchors ?? 0) / 4, 0, 1);
      const landingOaths = clamp((preflightSummary(input).sealedLandingOaths ?? 0) / 4, 0, 1);
      const medalAverage = clamp(input.skyMedalScores?.average ?? 0, 0, 1);
      const runways = Array.from({ length: runwayCount }, (_, index) => {
        const t = runwayCount <= 1 ? 0.5 : index / (runwayCount - 1);
        const bankFit = clamp(1 - Math.abs(control.bank - (t * 2 - 1) * 0.45) * 0.46, 0, 1);
        const commit = clamp(readiness * 0.22 + returnAnchors * 0.2 + landingOaths * 0.2 + medalAverage * 0.24 + bankFit * 0.1 + (control.launch ? 0.04 : 0), 0, 1);
        return {
          id: `landing-runway-${index}`,
          kind: "landing-runway-commitment",
          index,
          x: round(24 + t * 52, 2),
          y: round(90 - commit * 36, 2),
          width: round(20 + commit * 28, 2),
          commit: round(commit),
          open: commit >= 0.6,
          label: commit >= 0.76 ? "clear landing runway" : commit >= 0.6 ? "narrow landing runway" : "uncommitted landing runway"
        };
      });
      return { kind: "landing-runway-commitments", runways };
    }
  };
}

export function createSoraMicroflightTrialRendererHandoffKit() {
  return {
    id: "sora-microflight-trial-renderer-handoff-kit",
    describe(input = {}) {
      const descriptors = {
        thermalTokenClusters: input.thermalTokenClusters,
        glideStaminaRibbons: input.glideStaminaRibbons,
        crosswindGateWeaves: input.crosswindGateWeaves,
        stormBurstAvoidance: input.stormBurstAvoidance,
        skyMedalScores: input.skyMedalScores,
        landingRunwayCommitments: input.landingRunwayCommitments
      };
      return {
        kind: "sora-microflight-trial-renderer-handoff",
        contract: "renderer consumes descriptors only",
        forbiddenOwnership: ["renderer ownership", "DOM input ownership", "browser input ownership", "Three.js ownership", "WebGL ownership", "audio ownership", "asset loading ownership", "frame-loop ownership"],
        descriptors,
        descriptorCounts: {
          thermalTokens: descriptors.thermalTokenClusters?.tokens?.length ?? 0,
          glideStaminaSegments: descriptors.glideStaminaRibbons?.segments?.length ?? 0,
          crosswindGates: descriptors.crosswindGateWeaves?.gates?.length ?? 0,
          stormBursts: descriptors.stormBurstAvoidance?.bursts?.length ?? 0,
          skyMedals: descriptors.skyMedalScores?.medals?.length ?? 0,
          landingRunways: descriptors.landingRunwayCommitments?.runways?.length ?? 0
        }
      };
    }
  };
}

export function createSoraMicroflightTrialReadinessDomainKit(options = {}) {
  const thermalTokenKit = createSoraThermalTokenClusterKit(options);
  const glideStaminaKit = createSoraGlideStaminaRibbonKit(options);
  const crosswindGateKit = createSoraCrosswindGateWeaveKit(options);
  const stormBurstKit = createSoraStormBurstAvoidanceKit(options);
  const skyMedalKit = createSoraSkyMedalScoreKit(options);
  const landingRunwayKit = createSoraLandingRunwayCommitKit(options);
  const rendererHandoffKit = createSoraMicroflightTrialRendererHandoffKit(options);

  return {
    id: "sora-microflight-trial-readiness-domain-kit",
    domainTree: SORA_MICROFLIGHT_TRIAL_READINESS_DOMAIN_TREE,
    kits: [
      thermalTokenKit.id,
      glideStaminaKit.id,
      crosswindGateKit.id,
      stormBurstKit.id,
      skyMedalKit.id,
      landingRunwayKit.id,
      rendererHandoffKit.id
    ],
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1);
      const tick = clamp(input.tick ?? 0, 0, 1000000);
      const shared = {
        ...input,
        tick,
        readiness,
        input: safeInput(input.input)
      };
      const thermalTokenClusters = thermalTokenKit.describe(shared);
      const glideStaminaRibbons = glideStaminaKit.describe(shared);
      const crosswindGateWeaves = crosswindGateKit.describe(shared);
      const stormBurstAvoidance = stormBurstKit.describe(shared);
      const skyMedalScores = skyMedalKit.describe({ ...shared, thermalTokenClusters, glideStaminaRibbons, crosswindGateWeaves, stormBurstAvoidance });
      const landingRunwayCommitments = landingRunwayKit.describe({ ...shared, skyMedalScores });
      const rendererHandoff = rendererHandoffKit.describe({ thermalTokenClusters, glideStaminaRibbons, crosswindGateWeaves, stormBurstAvoidance, skyMedalScores, landingRunwayCommitments });
      return {
        kind: "sora-microflight-trial-readiness-domain",
        routeId: "sora-the-infinite",
        readiness: round(readiness),
        thermalTokenClusters,
        glideStaminaRibbons,
        crosswindGateWeaves,
        stormBurstAvoidance,
        skyMedalScores,
        landingRunwayCommitments,
        rendererHandoff,
        summary: {
          collectedThermalTokens: thermalTokenClusters.tokens.filter((token) => token.collected).length,
          stableStaminaSegments: glideStaminaRibbons.segments.filter((segment) => segment.stable).length,
          openCrosswindGates: crosswindGateWeaves.gates.filter((gate) => gate.open).length,
          avoidableStormBursts: stormBurstAvoidance.bursts.filter((burst) => burst.avoidable).length,
          earnedSkyMedals: skyMedalScores.medals.filter((medal) => medal.earned).length,
          openLandingRunways: landingRunwayCommitments.runways.filter((runway) => runway.open).length,
          descriptorCount: Object.values(rendererHandoff.descriptorCounts).reduce((sum, value) => sum + value, 0)
        }
      };
    },
    snapshot(input = {}) {
      const described = this.describe(input);
      return {
        routeId: described.routeId,
        readiness: described.readiness,
        summary: described.summary,
        descriptorCounts: described.rendererHandoff.descriptorCounts
      };
    }
  };
}
