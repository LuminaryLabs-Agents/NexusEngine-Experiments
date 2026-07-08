function stableArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function round(value, digits = 3) {
  return Number((Number(value) || 0).toFixed(digits));
}

function notOwnRendererContract(owner) {
  return {
    owner,
    rendererConsumes: "serializable objective descriptors only",
    rendererMustOwn: ["Canvas placement", "draw order", "color application", "view interpolation"],
    rendererMustNotOwn: ["simulation state", "XR input", "browser input", "collision", "platformer physics", "objective sequence", "asset loading", "audio", "frame loop"]
  };
}

function platformMidX(platform = {}) {
  return Number(platform.x ?? 0) + Number(platform.w ?? 1) * 0.5;
}

function platformTop(platform = {}) {
  return Number(platform.y ?? 0);
}

function nearestPlatformForX(level = {}, x = 0) {
  const platforms = stableArray(level.platforms);
  return platforms
    .map((platform, index) => ({ platform, index, distance: Math.abs(platformMidX(platform) - x) }))
    .sort((a, b) => a.distance - b.distance)[0] ?? { platform: { id: "fallback", x, y: 1, w: 1 }, index: 0, distance: 0 };
}

function avatarProgress(avatar = {}, level = {}) {
  const start = Number(level.start?.x ?? 0);
  const exit = Number(level.exit?.x ?? 12);
  const x = Number(avatar.position?.x ?? start);
  return clamp((x - start) / Math.max(1, exit - start), 0, 1);
}

function distanceToNearestHazard(x, level = {}) {
  const hazards = stableArray(level.hazards);
  if (!hazards.length) return 99;
  return hazards.reduce((best, hazard) => Math.min(best, Math.abs(Number(hazard.x ?? 0) - x)), 99);
}

export const VR_BOARD_OBJECTIVE_READABILITY_DOMAIN_TREE = Object.freeze({
  root: "vr-board-objective-readability-domain",
  subdomains: [
    {
      id: "collection-intent-domain",
      subdomains: [
        { id: "collectible-priority-orbit", kits: ["vr-board-collectible-priority-orbit-kit"] },
        { id: "exit-readiness-gate", kits: ["vr-board-exit-readiness-gate-kit"] }
      ]
    },
    {
      id: "risk-route-domain",
      subdomains: [
        { id: "hazard-approach-funnel", kits: ["vr-board-hazard-approach-funnel-kit"] },
        { id: "momentum-lane", kits: ["vr-board-momentum-lane-kit"] }
      ]
    },
    {
      id: "comfort-choice-domain",
      subdomains: [
        { id: "head-comfort-corridor", kits: ["vr-board-head-comfort-corridor-kit"] },
        { id: "route-risk-scorecard", kits: ["vr-board-route-risk-scorecard-kit"] }
      ]
    },
    {
      id: "renderer-handoff",
      kits: ["vr-board-objective-renderer-handoff-kit"],
      contract: "renderer consumes objective descriptors only"
    }
  ],
  contract: "renderer consumes objective descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership"
});

export function createVrBoardCollectiblePriorityOrbitKit({ maxOrbits = 4 } = {}) {
  return {
    id: "n-vr-board-collectible-priority-orbit-kit",
    domain: "vr-board-objective-readability/collectible-priority-orbit",
    describe({ level = {}, objects = {}, avatar = {}, time = 0 } = {}) {
      const collectedIds = new Set(stableArray(objects.collectedIds));
      const avatarX = Number(avatar.position?.x ?? 0);
      const progress = avatarProgress(avatar, level);
      return stableArray(level.collectibles)
        .filter((coin) => !collectedIds.has(coin.id))
        .map((coin, index) => {
          const dx = Math.max(0, Number(coin.x ?? 0) - avatarX);
          const platform = nearestPlatformForX(level, Number(coin.x ?? 0));
          const hazardDistance = distanceToNearestHazard(Number(coin.x ?? 0), level);
          const priority = clamp01(0.92 - dx * 0.045 + Number(coin.value ?? 1) * 0.12 + Math.min(3, hazardDistance) * 0.035 - progress * 0.08);
          return {
            id: `collectible-priority-${coin.id ?? index}`,
            kind: "collectible-priority-orbit",
            coinId: coin.id ?? `coin-${index}`,
            platformId: platform.platform.id ?? `platform-${platform.index}`,
            x: round(Number(coin.x ?? 0), 3),
            y: round(Number(coin.y ?? 0), 3),
            routeOrder: index,
            priority: round(priority, 3),
            radius: round(0.34 + priority * 0.36 + Math.sin(time + index) * 0.025, 3),
            active: priority > 0.18,
            rendererContract: notOwnRendererContract("vr-board-collectible-priority-orbit-kit")
          };
        })
        .sort((a, b) => b.priority - a.priority)
        .slice(0, maxOrbits)
        .map((orbit, index) => ({ ...orbit, routeOrder: index }));
    },
    snapshot(input) {
      const orbits = this.describe(input);
      return { orbits: orbits.length, topPriority: orbits.reduce((best, orbit) => Math.max(best, orbit.priority), 0) };
    }
  };
}

export function createVrBoardHazardApproachFunnelKit() {
  return {
    id: "n-vr-board-hazard-approach-funnel-kit",
    domain: "vr-board-objective-readability/hazard-approach-funnel",
    describe({ level = {}, avatar = {}, input = {}, time = 0 } = {}) {
      const avatarX = Number(avatar.position?.x ?? 0);
      const moveAxis = clamp(input.moveAxis ?? avatar.moveAxis ?? 0, -1, 1);
      return stableArray(level.hazards).map((hazard, index) => {
        const hx = Number(hazard.x ?? 0);
        const approach = clamp01(1 - Math.abs(hx - avatarX) / 4.8);
        const movingToward = Math.sign(hx - avatarX) === Math.sign(moveAxis) && Math.abs(moveAxis) > 0.1;
        const urgency = clamp01(0.16 + approach * 0.7 + (movingToward ? 0.18 : 0) + Math.sin(time + index) * 0.025);
        const safe = nearestPlatformForX(level, hx - Math.sign(moveAxis || 1) * 1.2);
        return {
          id: `hazard-funnel-${hazard.id ?? index}`,
          kind: "hazard-approach-funnel",
          hazardId: hazard.id ?? `hazard-${index}`,
          x: round(hx, 3),
          y: round(Number(hazard.y ?? 0), 3),
          w: round(Number(hazard.w ?? 0.7), 3),
          h: round(Number(hazard.h ?? 0.35), 3),
          urgency: round(urgency, 3),
          safeX: round(platformMidX(safe.platform), 3),
          safeY: round(platformTop(safe.platform), 3),
          rendererContract: notOwnRendererContract("vr-board-hazard-approach-funnel-kit")
        };
      });
    },
    snapshot(input) {
      const funnels = this.describe(input);
      return { funnels: funnels.length, maxUrgency: funnels.reduce((best, funnel) => Math.max(best, funnel.urgency), 0) };
    }
  };
}

export function createVrBoardMomentumLaneKit() {
  return {
    id: "n-vr-board-momentum-lane-kit",
    domain: "vr-board-objective-readability/momentum-lane",
    describe({ level = {}, avatar = {}, input = {}, time = 0 } = {}) {
      const platforms = stableArray(level.platforms).sort((a, b) => platformMidX(a) - platformMidX(b));
      const speed = Math.hypot(Number(avatar.velocity?.x ?? 0), Number(avatar.velocity?.y ?? 0));
      const moveAxis = clamp(input.moveAxis ?? avatar.moveAxis ?? 0, -1, 1);
      return platforms.slice(1).map((platform, index) => {
        const previous = platforms[index];
        const gap = Math.max(0, Number(platform.x ?? 0) - (Number(previous.x ?? 0) + Number(previous.w ?? 1)));
        const x = (platformMidX(platform) + platformMidX(previous)) * 0.5;
        const y = Math.max(platformTop(platform), platformTop(previous)) + 0.28;
        const pulse = clamp01(0.18 + speed * 0.09 + gap * 0.11 + Math.abs(moveAxis) * 0.12 + Math.sin(time * 1.4 + index) * 0.04);
        return {
          id: `momentum-lane-${previous.id ?? index}-to-${platform.id ?? index + 1}`,
          kind: "momentum-lane",
          fromPlatformId: previous.id ?? `platform-${index}`,
          toPlatformId: platform.id ?? `platform-${index + 1}`,
          x: round(x, 3),
          y: round(y, 3),
          width: round(gap, 3),
          direction: platformMidX(platform) >= platformMidX(previous) ? "right" : "left",
          pulse: round(pulse, 3),
          progress: round(avatarProgress(avatar, level), 3),
          rendererContract: notOwnRendererContract("vr-board-momentum-lane-kit")
        };
      });
    },
    snapshot(input) {
      const lanes = this.describe(input);
      return { lanes: lanes.length, maxPulse: lanes.reduce((best, lane) => Math.max(best, lane.pulse), 0) };
    }
  };
}

export function createVrBoardExitReadinessGateKit({ requiredCollectibles = 3 } = {}) {
  return {
    id: "n-vr-board-exit-readiness-gate-kit",
    domain: "vr-board-objective-readability/exit-readiness-gate",
    describe({ level = {}, objects = {}, avatar = {} } = {}) {
      const collected = Number(objects.collectedValue ?? stableArray(objects.collectedIds).length ?? 0);
      const missing = Math.max(0, requiredCollectibles - collected);
      const progress = avatarProgress(avatar, level);
      const readiness = clamp01(collected / Math.max(1, requiredCollectibles) * 0.72 + progress * 0.28);
      return {
        id: "exit-readiness-gate",
        kind: "exit-readiness-gate",
        x: round(Number(level.exit?.x ?? 12), 3),
        y: round(Number(level.exit?.y ?? 3), 3),
        w: round(Number(level.exit?.w ?? 0.8), 3),
        h: round(Number(level.exit?.h ?? 1.2), 3),
        requiredCollectibles,
        collected,
        missingCollectibles: missing,
        readiness: round(readiness, 3),
        label: missing > 0 ? `${missing} coin${missing === 1 ? "" : "s"} before exit` : "exit route primed",
        rendererContract: notOwnRendererContract("vr-board-exit-readiness-gate-kit")
      };
    },
    snapshot(input) {
      const gate = this.describe(input);
      return { readiness: gate.readiness, missingCollectibles: gate.missingCollectibles };
    }
  };
}

export function createVrBoardHeadComfortCorridorKit() {
  return {
    id: "n-vr-board-head-comfort-corridor-kit",
    domain: "vr-board-objective-readability/head-comfort-corridor",
    describe({ xrPose = {}, comfort = {}, board = {} } = {}) {
      const head = xrPose.head ?? {};
      const x = clamp(Number(head.position?.x ?? 0), -0.4, 0.4);
      const y = clamp(Number(head.position?.y ?? 1.6), 1.2, 2.1);
      const warnings = stableArray(comfort.warnings);
      const boardWidth = Number(board.sizeMeters?.x ?? 1.6);
      const limit = Math.max(0.08, boardWidth * 0.14);
      const drift = clamp01(Math.abs(x) / limit);
      const bands = [-1, 0, 1].map((slot) => ({
        id: `head-comfort-band-${slot + 1}`,
        kind: "head-comfort-band",
        slot,
        centerX: round(slot * limit * 0.72, 3),
        centerY: round(y, 3),
        drift: round(drift, 3),
        alpha: round(clamp01(0.22 + (slot === 0 ? 0.32 : 0.08) - drift * 0.12), 3)
      }));
      return {
        id: "head-comfort-corridor",
        kind: "head-comfort-corridor",
        tone: warnings.length || drift > 0.86 ? "warning" : "stable",
        drift: round(drift, 3),
        bands,
        rendererContract: notOwnRendererContract("vr-board-head-comfort-corridor-kit")
      };
    },
    snapshot(input) {
      const corridor = this.describe(input);
      return { tone: corridor.tone, bands: corridor.bands.length, drift: corridor.drift };
    }
  };
}

export function createVrBoardRouteRiskScorecardKit() {
  return {
    id: "n-vr-board-route-risk-scorecard-kit",
    domain: "vr-board-objective-readability/route-risk-scorecard",
    describe({ level = {}, avatar = {}, objects = {}, input = {}, comfort = {} } = {}) {
      const progress = avatarProgress(avatar, level);
      const collected = Number(objects.collectedValue ?? stableArray(objects.collectedIds).length ?? 0);
      const hazardsAhead = stableArray(level.hazards).filter((hazard) => Number(hazard.x ?? 0) >= Number(avatar.position?.x ?? 0)).length;
      const speed = Math.hypot(Number(avatar.velocity?.x ?? 0), Number(avatar.velocity?.y ?? 0));
      const warnings = stableArray(comfort.warnings).length;
      const chips = [
        { id: "risk-route", label: progress > 0.72 ? "exit pressure" : "coin route", value: round(progress, 3), active: true },
        { id: "risk-hazards", label: hazardsAhead ? `${hazardsAhead} hazards ahead` : "clear lane", value: clamp01(hazardsAhead / 4), active: hazardsAhead > 0 },
        { id: "risk-collection", label: `${collected} coin${collected === 1 ? "" : "s"}`, value: clamp01(collected / 4), active: collected > 0 },
        { id: "risk-comfort", label: warnings ? "recentre head" : "comfort stable", value: warnings ? 1 : 0, active: warnings > 0 },
        { id: "risk-speed", label: Math.abs(input.moveAxis ?? avatar.moveAxis ?? 0) > 0.1 ? "committed" : "set cadence", value: clamp01(speed / 5), active: speed > 0.5 }
      ];
      const risk = clamp01(hazardsAhead * 0.12 + warnings * 0.22 + (avatar.grounded ? 0 : 0.08) + Math.max(0, 0.5 - speed) * 0.08 - collected * 0.03);
      return {
        id: "route-risk-scorecard",
        kind: "route-risk-scorecard",
        risk: round(risk, 3),
        tone: risk > 0.55 ? "warning" : progress > 0.72 ? "success" : "training",
        chips,
        rendererContract: notOwnRendererContract("vr-board-route-risk-scorecard-kit")
      };
    },
    snapshot(input) {
      const scorecard = this.describe(input);
      return { tone: scorecard.tone, chips: scorecard.chips.length, risk: scorecard.risk };
    }
  };
}

export function createVrBoardObjectiveRendererHandoffKit({
  collectiblePriorityOrbitKit = createVrBoardCollectiblePriorityOrbitKit(),
  hazardApproachFunnelKit = createVrBoardHazardApproachFunnelKit(),
  momentumLaneKit = createVrBoardMomentumLaneKit(),
  exitReadinessGateKit = createVrBoardExitReadinessGateKit(),
  headComfortCorridorKit = createVrBoardHeadComfortCorridorKit(),
  routeRiskScorecardKit = createVrBoardRouteRiskScorecardKit()
} = {}) {
  return {
    id: "n-vr-board-objective-renderer-handoff-kit",
    domain: "vr-board-objective-readability/renderer-handoff",
    kits: { collectiblePriorityOrbitKit, hazardApproachFunnelKit, momentumLaneKit, exitReadinessGateKit, headComfortCorridorKit, routeRiskScorecardKit },
    describe(input = {}) {
      const collectiblePriorityOrbits = collectiblePriorityOrbitKit.describe(input);
      const hazardApproachFunnels = hazardApproachFunnelKit.describe(input);
      const momentumLanes = momentumLaneKit.describe(input);
      const exitReadinessGate = exitReadinessGateKit.describe(input);
      const headComfortCorridor = headComfortCorridorKit.describe(input);
      const routeRiskScorecard = routeRiskScorecardKit.describe(input);
      const counts = {
        collectiblePriorityOrbits: collectiblePriorityOrbits.length,
        hazardApproachFunnels: hazardApproachFunnels.length,
        momentumLanes: momentumLanes.length,
        exitReadinessGate: exitReadinessGate ? 1 : 0,
        headComfortBands: headComfortCorridor.bands.length,
        riskChips: routeRiskScorecard.chips.length
      };
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id: "vr-board-objective-renderer-handoff",
        domainTree: VR_BOARD_OBJECTIVE_READABILITY_DOMAIN_TREE,
        policy: "renderer-consumes-descriptors-only",
        rendererContract: notOwnRendererContract("vr-board-objective-renderer-handoff-kit"),
        descriptors: {
          collectiblePriorityOrbits,
          hazardApproachFunnels,
          momentumLanes,
          exitReadinessGate,
          headComfortCorridor,
          routeRiskScorecard
        },
        counts
      };
    },
    snapshot(input) {
      const handoff = this.describe(input);
      return { total: handoff.counts.total, orbits: handoff.counts.collectiblePriorityOrbits, riskTone: handoff.descriptors.routeRiskScorecard.tone };
    }
  };
}

export function createVrBoardObjectiveReadabilityDomainKit(options = {}) {
  const rendererHandoffKit = options.rendererHandoffKit ?? createVrBoardObjectiveRendererHandoffKit(options);
  return {
    id: "n-vr-board-objective-readability-domain-kit",
    domain: "vr-board-objective-readability-domain",
    rendererHandoffKit,
    describe(input = {}) {
      const rendererHandoff = rendererHandoffKit.describe(input);
      return {
        id: "vr-board-objective-readability-domain",
        domainTree: VR_BOARD_OBJECTIVE_READABILITY_DOMAIN_TREE,
        rendererHandoff,
        collectiblePriorityOrbits: rendererHandoff.descriptors.collectiblePriorityOrbits,
        hazardApproachFunnels: rendererHandoff.descriptors.hazardApproachFunnels,
        momentumLanes: rendererHandoff.descriptors.momentumLanes,
        exitReadinessGate: rendererHandoff.descriptors.exitReadinessGate,
        headComfortCorridor: rendererHandoff.descriptors.headComfortCorridor,
        routeRiskScorecard: rendererHandoff.descriptors.routeRiskScorecard,
        rendererContract: notOwnRendererContract("vr-board-objective-readability-domain-kit")
      };
    },
    snapshot(input) {
      const descriptor = this.describe(input);
      return {
        total: descriptor.rendererHandoff.counts.total,
        orbits: descriptor.collectiblePriorityOrbits.length,
        funnels: descriptor.hazardApproachFunnels.length,
        scoreTone: descriptor.routeRiskScorecard.tone
      };
    }
  };
}
