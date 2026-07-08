const round = (value, places = 3) => Number(Number(value).toFixed(places));
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));

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

function routePreviewCounts(routePreview = {}) {
  return routePreview.rendererHandoff?.descriptorCounts ?? {};
}

function rehearsalCounts(launchRehearsal = {}) {
  return launchRehearsal.rendererHandoff?.descriptorCounts ?? {};
}

export const SORA_FLIGHTPLAN_READABILITY_DOMAIN_TREE = `sora-flightplan-readability-domain
├─ launch-path-domain
│  ├─ runway-vector-domain
│  │  └─ sora-runway-vector-lattice-kit
│  └─ launch-lane-domain
│     └─ sora-launch-lane-choice-kit
├─ risk-budget-domain
│  ├─ energy-budget-domain
│  │  └─ sora-energy-budget-ribbon-kit
│  └─ risk-reward-domain
│     └─ sora-risk-reward-card-kit
├─ sky-memory-domain
│  ├─ cloud-cover-domain
│  │  └─ sora-cloud-cover-slit-kit
│  └─ return-anchor-domain
│     └─ sora-return-anchor-kit
└─ renderer-handoff
   └─ sora-flightplan-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createSoraRunwayVectorLatticeKit(options = {}) {
  const vectorCount = clamp(options.vectorCount ?? 7, 5, 11);
  return {
    id: "sora-runway-vector-lattice-kit",
    describe(input = {}) {
      const tick = clamp(input.tick ?? 0, 0, 1000000);
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const vectors = Array.from({ length: vectorCount }, (_, index) => {
        const t = vectorCount <= 1 ? 0.5 : index / (vectorCount - 1);
        const centerBias = 1 - Math.abs(t - 0.5) * 2;
        const phase = tick * 0.012 + index * 0.53 + control.bank * 0.4;
        const alignment = clamp(centerBias * 0.55 + readiness * 0.3 + Math.max(0, control.thrust) * 0.15 - Math.abs(control.bank) * Math.abs(t - 0.5) * 0.32, 0, 1);
        return {
          id: `runway-vector-${index}`,
          kind: "runway-vector",
          x: round(10 + t * 80 + Math.sin(phase) * 2.2, 2),
          y: round(79 - centerBias * 24 - readiness * 11 + Math.cos(phase) * 1.8, 2),
          length: round(34 + alignment * 72, 2),
          bearingDeg: round(-32 + t * 64 + control.bank * 10, 2),
          alignment: round(alignment),
          active: alignment >= 0.56,
          label: alignment >= 0.72 ? "primary launch vector" : alignment >= 0.56 ? "usable launch vector" : "cold vector"
        };
      });
      return { kind: "runway-vector-lattice", vectors };
    }
  };
}

export function createSoraEnergyBudgetRibbonKit() {
  return {
    id: "sora-energy-budget-ribbon-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const routeCounts = routePreviewCounts(input.routePreview);
      const rehearsal = rehearsalCounts(input.launchRehearsal);
      const routeNeed = clamp(((routeCounts.waypoints ?? 0) + (routeCounts.altitudeBands ?? 0)) / 12, 0, 1);
      const confidence = clamp((rehearsal.confidenceAxes ?? 0) / 4, 0, 1);
      const burn = clamp(Math.max(0, control.thrust) * 0.38 + Math.abs(control.bank) * 0.2 + Math.max(0, control.climb) * 0.24, 0, 1);
      const reserve = clamp(readiness * 0.68 + confidence * 0.18 + routeNeed * 0.14 - burn * 0.16, 0, 1);
      const segments = ["wake", "climb", "drift", "handoff", "reserve"].map((id, index) => {
        const threshold = round((index + 1) / 6 + routeNeed * 0.08, 3);
        const value = clamp(reserve - index * 0.08 + (index === 4 ? 0.08 : 0), 0, 1);
        return {
          id: `energy-${id}`,
          kind: "energy-budget-segment",
          index,
          label: id,
          value: round(value),
          threshold,
          stable: value >= threshold
        };
      });
      return {
        kind: "energy-budget-ribbon",
        reserve: round(reserve),
        burn: round(burn),
        segments
      };
    }
  };
}

export function createSoraCloudCoverSlitKit(options = {}) {
  const slitCount = clamp(options.slitCount ?? 6, 4, 9);
  return {
    id: "sora-cloud-cover-slit-kit",
    describe(input = {}) {
      const tick = clamp(input.tick ?? 0, 0, 1000000);
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const warnings = input.launchRehearsal?.driftWarnings?.warnings ?? [];
      const driftPressure = warnings.reduce((max, warning) => Math.max(max, Number(warning.severity ?? 0)), 0);
      const slits = Array.from({ length: slitCount }, (_, index) => {
        const t = slitCount <= 1 ? 0.5 : index / (slitCount - 1);
        const phase = tick * 0.009 + index * 1.17 + control.climb * 0.42;
        const openness = clamp(0.22 + readiness * 0.48 + Math.sin(phase) * 0.16 - driftPressure * 0.18, 0, 1);
        return {
          id: `cloud-slit-${index}`,
          kind: "cloud-cover-slit",
          x: round(12 + t * 76 + Math.sin(phase * 0.8) * 3, 2),
          y: round(20 + Math.cos(phase) * 9 + index % 2 * 8, 2),
          width: round(8 + openness * 22, 2),
          openness: round(openness),
          clear: openness >= 0.5,
          label: openness >= 0.64 ? "clear sky slit" : openness >= 0.5 ? "thin opening" : "cloud cover"
        };
      });
      return { kind: "cloud-cover-slits", slits };
    }
  };
}

export function createSoraLaunchLaneChoiceKit(options = {}) {
  const laneCount = clamp(options.laneCount ?? 5, 3, 7);
  return {
    id: "sora-launch-lane-choice-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const thermalSlots = input.launchRehearsal?.thermalSlots?.slots ?? [];
      const lanes = Array.from({ length: laneCount }, (_, index) => {
        const t = laneCount <= 1 ? 0.5 : index / (laneCount - 1);
        const thermal = thermalSlots[index % Math.max(1, thermalSlots.length)]?.lift ?? 0.35;
        const bankFit = clamp(1 - Math.abs(control.bank - (t - 0.5) * 1.7), 0, 1);
        const score = clamp(readiness * 0.42 + thermal * 0.36 + bankFit * 0.22, 0, 1);
        return {
          id: `launch-lane-${index}`,
          kind: "launch-lane-choice",
          index,
          x: round(18 + t * 64, 2),
          score: round(score),
          thermal: round(thermal),
          selected: score >= 0.68 && score >= readiness * 0.6,
          label: score >= 0.74 ? "best lane" : score >= 0.58 ? "safe lane" : "weak lane"
        };
      });
      return { kind: "launch-lane-choices", lanes };
    }
  };
}

export function createSoraRiskRewardCardKit() {
  return {
    id: "sora-risk-reward-card-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const launchRehearsal = input.launchRehearsal ?? {};
      const activeWarnings = launchRehearsal.driftWarnings?.warnings?.filter((warning) => warning.active).length ?? 0;
      const usableThermals = launchRehearsal.thermalSlots?.slots?.filter((slot) => slot.usable).length ?? 0;
      const linkedGhosts = launchRehearsal.targetGhosts?.ghosts?.filter((ghost) => ghost.linked).length ?? 0;
      const risk = clamp(activeWarnings * 0.18 + Math.abs(control.bank) * 0.18 + Math.max(0, -control.climb) * 0.16 + (readiness < 0.5 ? 0.18 : 0), 0, 1);
      const reward = clamp(readiness * 0.46 + usableThermals * 0.07 + linkedGhosts * 0.08 + Math.max(0, control.thrust) * 0.12, 0, 1);
      const cards = [
        { id: "risk-drift", label: "drift risk", value: round(risk), state: risk > 0.52 ? "danger" : "contained" },
        { id: "reward-lift", label: "lift reward", value: round(reward), state: reward > 0.62 ? "strong" : "building" },
        { id: "launch-window", label: "launch window", value: round(clamp(reward - risk * 0.45, 0, 1)), state: reward - risk * 0.45 > 0.56 ? "open" : "warming" }
      ];
      return { kind: "risk-reward-cards", risk: round(risk), reward: round(reward), cards };
    }
  };
}

export function createSoraReturnAnchorKit(options = {}) {
  const anchorCount = clamp(options.anchorCount ?? 4, 3, 6);
  return {
    id: "sora-return-anchor-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const query = String(input.query ?? "");
      const hash = String(input.hash ?? "");
      const continuity = query || hash ? 1 : 0.35;
      const anchors = Array.from({ length: anchorCount }, (_, index) => {
        const progress = anchorCount <= 1 ? 1 : index / (anchorCount - 1);
        const lock = clamp(continuity * 0.35 + readiness * 0.45 + progress * 0.2, 0, 1);
        return {
          id: `return-anchor-${index}`,
          kind: "return-anchor",
          x: round(20 + progress * 60, 2),
          y: round(86 - progress * 18, 2),
          lock: round(lock),
          linked: lock >= 0.56,
          label: index === 0 ? "source route" : index === anchorCount - 1 ? "open above handoff" : "continuity anchor"
        };
      });
      return { kind: "return-anchors", anchors, continuityPreserved: Boolean(query || hash) };
    }
  };
}

export function createSoraFlightplanRendererHandoffKit() {
  return {
    id: "sora-flightplan-renderer-handoff-kit",
    describe(input = {}) {
      const descriptors = {
        runwayVectors: input.runwayVectors,
        energyBudget: input.energyBudget,
        cloudCoverSlits: input.cloudCoverSlits,
        launchLaneChoices: input.launchLaneChoices,
        riskRewardCards: input.riskRewardCards,
        returnAnchors: input.returnAnchors
      };
      return {
        kind: "sora-flightplan-renderer-handoff",
        contract: "renderer consumes descriptors only",
        forbiddenOwnership: ["renderer ownership", "DOM input ownership", "browser input ownership", "Three.js ownership", "WebGL ownership", "audio ownership", "asset loading ownership", "frame-loop ownership"],
        descriptors,
        descriptorCounts: {
          runwayVectors: descriptors.runwayVectors?.vectors?.length ?? 0,
          energySegments: descriptors.energyBudget?.segments?.length ?? 0,
          cloudSlits: descriptors.cloudCoverSlits?.slits?.length ?? 0,
          launchLanes: descriptors.launchLaneChoices?.lanes?.length ?? 0,
          riskRewardCards: descriptors.riskRewardCards?.cards?.length ?? 0,
          returnAnchors: descriptors.returnAnchors?.anchors?.length ?? 0
        }
      };
    }
  };
}

export function createSoraFlightplanReadabilityDomainKit(options = {}) {
  const runwayVectorKit = createSoraRunwayVectorLatticeKit(options);
  const energyBudgetKit = createSoraEnergyBudgetRibbonKit(options);
  const cloudCoverKit = createSoraCloudCoverSlitKit(options);
  const laneChoiceKit = createSoraLaunchLaneChoiceKit(options);
  const riskRewardKit = createSoraRiskRewardCardKit(options);
  const returnAnchorKit = createSoraReturnAnchorKit(options);
  const rendererHandoffKit = createSoraFlightplanRendererHandoffKit(options);

  return {
    id: "sora-flightplan-readability-domain-kit",
    domainTree: SORA_FLIGHTPLAN_READABILITY_DOMAIN_TREE,
    kits: [
      runwayVectorKit.id,
      energyBudgetKit.id,
      cloudCoverKit.id,
      laneChoiceKit.id,
      riskRewardKit.id,
      returnAnchorKit.id,
      rendererHandoffKit.id
    ],
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1);
      const tick = clamp(input.tick ?? 0, 0, 1000000);
      const control = safeInput(input.input);
      const routePreview = input.routePreview ?? {};
      const launchRehearsal = input.launchRehearsal ?? {};
      const shared = { tick, readiness, input: control, routePreview, launchRehearsal, query: input.query, hash: input.hash };
      const runwayVectors = runwayVectorKit.describe(shared);
      const energyBudget = energyBudgetKit.describe(shared);
      const cloudCoverSlits = cloudCoverKit.describe(shared);
      const launchLaneChoices = laneChoiceKit.describe(shared);
      const riskRewardCards = riskRewardKit.describe(shared);
      const returnAnchors = returnAnchorKit.describe(shared);
      const rendererHandoff = rendererHandoffKit.describe({ runwayVectors, energyBudget, cloudCoverSlits, launchLaneChoices, riskRewardCards, returnAnchors });
      return {
        kind: "sora-flightplan-readability-domain",
        routeId: "sora-the-infinite",
        readiness: round(readiness),
        runwayVectors,
        energyBudget,
        cloudCoverSlits,
        launchLaneChoices,
        riskRewardCards,
        returnAnchors,
        rendererHandoff,
        summary: {
          activeVectors: runwayVectors.vectors.filter((vector) => vector.active).length,
          stableEnergySegments: energyBudget.segments.filter((segment) => segment.stable).length,
          clearCloudSlits: cloudCoverSlits.slits.filter((slit) => slit.clear).length,
          selectedLaunchLanes: launchLaneChoices.lanes.filter((lane) => lane.selected).length,
          launchWindowValue: riskRewardCards.cards.find((card) => card.id === "launch-window")?.value ?? 0,
          linkedReturnAnchors: returnAnchors.anchors.filter((anchor) => anchor.linked).length
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
