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

function launchSummary(input = {}) {
  return input.launchRehearsal?.summary ?? {};
}

export const SORA_PREFLIGHT_CHALLENGE_READINESS_DOMAIN_TREE = `sora-preflight-challenge-readiness-domain
├─ cadence-control-domain
│  ├─ gust-sync-domain
│  │  └─ sora-gust-sync-ring-kit
│  └─ velocity-tether-domain
│     └─ sora-velocity-tether-bead-kit
├─ route-contract-domain
│  ├─ altitude-contract-domain
│  │  └─ sora-altitude-contract-band-kit
│  └─ cloud-corridor-domain
│     └─ sora-cloud-corridor-lock-kit
├─ commitment-score-domain
│  ├─ route-tempo-domain
│  │  └─ sora-route-tempo-score-kit
│  └─ landing-oath-domain
│     └─ sora-landing-oath-seal-kit
└─ renderer-handoff
   └─ sora-preflight-challenge-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createSoraGustSyncRingKit(options = {}) {
  const ringCount = Math.floor(clamp(options.ringCount ?? 5, 3, 8));
  return {
    id: "sora-gust-sync-ring-kit",
    describe(input = {}) {
      const tick = clamp(input.tick ?? 0, 0, 1000000);
      const readiness = clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const usableJetstreams = clamp((skySummary(input).usableJetstreams ?? 0) / 6, 0, 1);
      const rings = Array.from({ length: ringCount }, (_, index) => {
        const phase = tick * 0.018 + index * 0.67;
        const centeredBank = 1 - Math.abs(control.bank);
        const sync = clamp(0.16 + readiness * 0.28 + Math.max(0, control.thrust) * 0.23 + centeredBank * 0.18 + usableJetstreams * 0.15 + Math.sin(phase) * 0.08, 0, 1);
        return {
          id: `gust-sync-ring-${index}`,
          kind: "gust-sync-ring",
          index,
          x: round(50 + Math.cos(phase) * (12 + index * 3), 2),
          y: round(52 + Math.sin(phase) * (8 + index * 2), 2),
          radius: round(16 + index * 8 + sync * 9, 2),
          sync: round(sync),
          open: sync >= 0.58,
          label: sync >= 0.72 ? "clean gust sync" : sync >= 0.58 ? "usable gust sync" : "off-beat gust"
        };
      });
      return { kind: "gust-sync-rings", rings };
    }
  };
}

export function createSoraVelocityTetherBeadKit(options = {}) {
  const beadCount = Math.floor(clamp(options.beadCount ?? 7, 4, 10));
  return {
    id: "sora-velocity-tether-bead-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const driftPressure = Math.abs(control.bank) * 0.36 + Math.max(0, -control.climb) * 0.22;
      const velocity = clamp(Math.max(0, control.thrust) * 0.55 + readiness * 0.25 + (control.launch ? 0.2 : 0), 0, 1);
      const beads = Array.from({ length: beadCount }, (_, index) => {
        const t = beadCount <= 1 ? 1 : index / (beadCount - 1);
        const tension = clamp(velocity * 0.58 + readiness * 0.2 + t * 0.18 - driftPressure * 0.34, 0, 1);
        return {
          id: `velocity-tether-bead-${index}`,
          kind: "velocity-tether-bead",
          index,
          x: round(16 + t * 68, 2),
          y: round(88 - tension * 38, 2),
          tension: round(tension),
          velocity: round(velocity),
          linked: tension >= 0.52,
          label: tension >= 0.7 ? "fast stable tether" : tension >= 0.52 ? "linked tether" : "slack tether"
        };
      });
      return { kind: "velocity-tether-beads", beads };
    }
  };
}

export function createSoraAltitudeContractBandKit(options = {}) {
  const bandCount = Math.floor(clamp(options.bandCount ?? 5, 3, 7));
  return {
    id: "sora-altitude-contract-band-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const chosenThermals = clamp((skySummary(input).chosenThermalRungs ?? 0) / 6, 0, 1);
      const activeVectors = clamp((flightSummary(input).activeVectors ?? 0) / 7, 0, 1);
      const bands = Array.from({ length: bandCount }, (_, index) => {
        const t = bandCount <= 1 ? 1 : index / (bandCount - 1);
        const climbFit = clamp(1 - Math.abs(control.climb - (t * 2 - 1)) * 0.5, 0, 1);
        const contract = clamp(readiness * 0.28 + chosenThermals * 0.25 + activeVectors * 0.2 + climbFit * 0.27, 0, 1);
        return {
          id: `altitude-contract-band-${index}`,
          kind: "altitude-contract-band",
          index,
          y: round(82 - t * 64, 2),
          width: round(26 + contract * 58, 2),
          contract: round(contract),
          signed: contract >= 0.6,
          label: contract >= 0.74 ? "signed altitude contract" : contract >= 0.6 ? "usable altitude band" : "thin altitude band"
        };
      });
      return { kind: "altitude-contract-bands", bands };
    }
  };
}

export function createSoraCloudCorridorLockKit(options = {}) {
  const lockCount = Math.floor(clamp(options.lockCount ?? 4, 3, 6));
  return {
    id: "sora-cloud-corridor-lock-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1);
      const clearSlits = clamp((flightSummary(input).clearCloudSlits ?? 0) / 6, 0, 1);
      const openPockets = clamp((skySummary(input).openGlidePockets ?? 0) / 5, 0, 1);
      const stormPenalty = clamp((skySummary(input).activeStormShelves ?? 0) / 4, 0, 1);
      const locks = Array.from({ length: lockCount }, (_, index) => {
        const t = lockCount <= 1 ? 0.5 : index / (lockCount - 1);
        const lock = clamp(readiness * 0.26 + clearSlits * 0.26 + openPockets * 0.28 + (1 - stormPenalty) * 0.14 + t * 0.06, 0, 1);
        return {
          id: `cloud-corridor-lock-${index}`,
          kind: "cloud-corridor-lock",
          index,
          x: round(20 + t * 60, 2),
          y: round(34 + Math.sin(index * 1.2) * 12, 2),
          lock: round(lock),
          open: lock >= 0.57,
          label: lock >= 0.72 ? "clean cloud corridor" : lock >= 0.57 ? "narrow cloud corridor" : "locked cloud corridor"
        };
      });
      return { kind: "cloud-corridor-locks", locks };
    }
  };
}

export function createSoraRouteTempoScoreKit() {
  return {
    id: "sora-route-tempo-score-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const sky = skySummary(input);
      const flight = flightSummary(input);
      const launch = launchSummary(input);
      const controlTempo = clamp(Math.max(0, control.thrust) * 0.38 + (1 - Math.abs(control.bank)) * 0.18 + Math.max(0, control.climb) * 0.18 + readiness * 0.26, 0, 1);
      const routeTempo = clamp((flight.launchWindowValue ?? 0) * 0.33 + (sky.usableJetstreams ?? 0) / 6 * 0.22 + (sky.openGlidePockets ?? 0) / 5 * 0.2 + readiness * 0.25, 0, 1);
      const handoffTempo = clamp((sky.readyConfidenceRails ?? 0) / 5 * 0.34 + (launch.readySteps ?? 0) / 5 * 0.22 + readiness * 0.28 + (control.launch ? 0.16 : 0), 0, 1);
      const scores = [
        { id: "control", label: "control tempo", value: controlTempo },
        { id: "route", label: "route tempo", value: routeTempo },
        { id: "handoff", label: "handoff tempo", value: handoffTempo }
      ].map((score, index) => ({
        id: `route-tempo-${score.id}`,
        kind: "route-tempo-score",
        index,
        label: score.label,
        value: round(score.value),
        state: score.value >= 0.7 ? "strong" : score.value >= 0.52 ? "building" : "weak"
      }));
      return { kind: "route-tempo-scores", scores, average: round(scores.reduce((sum, score) => sum + score.value, 0) / scores.length) };
    }
  };
}

export function createSoraLandingOathSealKit(options = {}) {
  const sealCount = Math.floor(clamp(options.sealCount ?? 4, 3, 6));
  return {
    id: "sora-landing-oath-seal-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1);
      const queryHashLock = input.query || input.hash ? 0.24 : 0.08;
      const returnVows = clamp((skySummary(input).sealedReturnVows ?? 0) / 4, 0, 1);
      const continuityOpen = input.routePreview?.continuityGate?.open ? 0.18 : 0;
      const seals = Array.from({ length: sealCount }, (_, index) => {
        const t = sealCount <= 1 ? 1 : index / (sealCount - 1);
        const seal = clamp(readiness * 0.32 + returnVows * 0.28 + queryHashLock + continuityOpen + t * 0.12, 0, 1);
        return {
          id: `landing-oath-seal-${index}`,
          kind: "landing-oath-seal",
          index,
          x: round(22 + t * 56, 2),
          y: round(76 + index % 2 * 8, 2),
          seal: round(seal),
          sealed: seal >= 0.6,
          label: index === 0 ? "route memory oath" : index === sealCount - 1 ? "landing continuity oath" : "flight vow oath"
        };
      });
      return { kind: "landing-oath-seals", seals };
    }
  };
}

export function createSoraPreflightChallengeRendererHandoffKit() {
  return {
    id: "sora-preflight-challenge-renderer-handoff-kit",
    describe(input = {}) {
      const descriptors = {
        gustSyncRings: input.gustSyncRings,
        velocityTetherBeads: input.velocityTetherBeads,
        altitudeContractBands: input.altitudeContractBands,
        cloudCorridorLocks: input.cloudCorridorLocks,
        routeTempoScores: input.routeTempoScores,
        landingOathSeals: input.landingOathSeals
      };
      return {
        kind: "sora-preflight-challenge-renderer-handoff",
        contract: "renderer consumes descriptors only",
        forbiddenOwnership: ["renderer ownership", "DOM input ownership", "browser input ownership", "Three.js ownership", "WebGL ownership", "audio ownership", "asset loading ownership", "frame-loop ownership"],
        descriptors,
        descriptorCounts: {
          gustSyncRings: descriptors.gustSyncRings?.rings?.length ?? 0,
          velocityTetherBeads: descriptors.velocityTetherBeads?.beads?.length ?? 0,
          altitudeContractBands: descriptors.altitudeContractBands?.bands?.length ?? 0,
          cloudCorridorLocks: descriptors.cloudCorridorLocks?.locks?.length ?? 0,
          routeTempoScores: descriptors.routeTempoScores?.scores?.length ?? 0,
          landingOathSeals: descriptors.landingOathSeals?.seals?.length ?? 0
        }
      };
    }
  };
}

export function createSoraPreflightChallengeReadinessDomainKit(options = {}) {
  const gustSyncKit = createSoraGustSyncRingKit(options);
  const velocityTetherKit = createSoraVelocityTetherBeadKit(options);
  const altitudeContractKit = createSoraAltitudeContractBandKit(options);
  const cloudCorridorKit = createSoraCloudCorridorLockKit(options);
  const routeTempoKit = createSoraRouteTempoScoreKit(options);
  const landingOathKit = createSoraLandingOathSealKit(options);
  const rendererHandoffKit = createSoraPreflightChallengeRendererHandoffKit(options);

  return {
    id: "sora-preflight-challenge-readiness-domain-kit",
    domainTree: SORA_PREFLIGHT_CHALLENGE_READINESS_DOMAIN_TREE,
    kits: [
      gustSyncKit.id,
      velocityTetherKit.id,
      altitudeContractKit.id,
      cloudCorridorKit.id,
      routeTempoKit.id,
      landingOathKit.id,
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
      const gustSyncRings = gustSyncKit.describe(shared);
      const velocityTetherBeads = velocityTetherKit.describe(shared);
      const altitudeContractBands = altitudeContractKit.describe(shared);
      const cloudCorridorLocks = cloudCorridorKit.describe(shared);
      const routeTempoScores = routeTempoKit.describe(shared);
      const landingOathSeals = landingOathKit.describe(shared);
      const rendererHandoff = rendererHandoffKit.describe({ gustSyncRings, velocityTetherBeads, altitudeContractBands, cloudCorridorLocks, routeTempoScores, landingOathSeals });
      return {
        kind: "sora-preflight-challenge-readiness-domain",
        routeId: "sora-the-infinite",
        readiness: round(readiness),
        gustSyncRings,
        velocityTetherBeads,
        altitudeContractBands,
        cloudCorridorLocks,
        routeTempoScores,
        landingOathSeals,
        rendererHandoff,
        summary: {
          openGustSyncRings: gustSyncRings.rings.filter((ring) => ring.open).length,
          linkedVelocityTethers: velocityTetherBeads.beads.filter((bead) => bead.linked).length,
          signedAltitudeContracts: altitudeContractBands.bands.filter((band) => band.signed).length,
          openCloudCorridors: cloudCorridorLocks.locks.filter((lock) => lock.open).length,
          strongTempoScores: routeTempoScores.scores.filter((score) => score.state === "strong").length,
          sealedLandingOaths: landingOathSeals.seals.filter((seal) => seal.sealed).length,
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
