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

function avatarProgress(avatar = {}, level = {}) {
  const start = Number(level.start?.x ?? 0);
  const exit = Number(level.exit?.x ?? 12);
  const x = Number(avatar.position?.x ?? start);
  return clamp((x - start) / Math.max(1, exit - start), 0, 1);
}

function notOwnRendererContract(owner) {
  return {
    owner,
    rendererConsumes: "serializable traversal descriptors only",
    rendererMustOwn: ["Canvas placement", "draw order", "color application", "view interpolation"],
    rendererMustNotOwn: ["simulation state", "XR input", "browser input", "collision", "platformer physics", "objective sequence", "asset loading", "audio", "frame loop"]
  };
}

function platformTop(platform = {}) {
  return Number(platform.y ?? 0);
}

function platformMidX(platform = {}) {
  return Number(platform.x ?? 0) + Number(platform.w ?? 1) * 0.5;
}

function distanceToNearestHazard(x, level = {}) {
  const hazards = stableArray(level.hazards);
  if (!hazards.length) return 99;
  return hazards.reduce((best, hazard) => Math.min(best, Math.abs(Number(hazard.x ?? 0) - x)), 99);
}

export const VR_BOARD_TRAVERSAL_READABILITY_DOMAIN_TREE = Object.freeze({
  root: "vr-board-traversal-readability-domain",
  subdomains: [
    {
      id: "jump-readability",
      subdomains: [
        { id: "jump-arc-forecast", kits: ["vr-board-jump-arc-forecast-kit"] },
        { id: "landing-zone-heat", kits: ["vr-board-landing-zone-heat-kit"] }
      ]
    },
    {
      id: "route-memory",
      subdomains: [
        { id: "checkpoint-thread", kits: ["vr-board-checkpoint-thread-kit"] },
        { id: "fail-recovery-beacon", kits: ["vr-board-fail-recovery-beacon-kit"] }
      ]
    },
    {
      id: "cadence-and-coaching",
      subdomains: [
        { id: "tempo-pulse-band", kits: ["vr-board-tempo-pulse-band-kit"] },
        { id: "control-coaching-strip", kits: ["vr-board-control-coaching-strip-kit"] }
      ]
    },
    {
      id: "renderer-handoff",
      kits: ["vr-board-traversal-renderer-handoff-kit"],
      contract: "renderer consumes descriptors only"
    }
  ],
  contract: "renderer consumes traversal descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership"
});

export function createVrBoardJumpArcForecastKit({ sampleCount = 9 } = {}) {
  return {
    id: "n-vr-board-jump-arc-forecast-kit",
    domain: "vr-board-traversal-readability/jump-arc-forecast",
    describe({ avatar = {}, level = {}, input = {}, time = 0 } = {}) {
      const position = avatar.position ?? {};
      const velocity = avatar.velocity ?? {};
      const moveAxis = clamp(input.moveAxis ?? avatar.moveAxis ?? 0, -1, 1);
      const startX = Number(position.x ?? 0) + Number(avatar.size?.x ?? 0.5) * 0.5;
      const startY = Number(position.y ?? 0) + Number(avatar.size?.y ?? 0.8) * 0.5;
      const vx = Number(velocity.x ?? 0) + moveAxis * 2.1;
      const vy = Math.max(Number(velocity.y ?? 0), avatar.grounded ? 5.2 : 1.2);
      const points = Array.from({ length: sampleCount }, (_, index) => {
        const t = index * 0.115;
        return {
          id: `jump-arc-point-${index}`,
          x: round(startX + vx * t, 3),
          y: round(startY + vy * t - 4.9 * t * t, 3),
          alpha: round(1 - index / Math.max(1, sampleCount), 3)
        };
      });
      const finalPoint = points.at(-1) ?? { x: startX, y: startY };
      const platforms = stableArray(level.platforms);
      const landing = platforms
        .map((platform, index) => ({ platform, index, dx: Math.abs(platformMidX(platform) - finalPoint.x), dy: Math.abs(platformTop(platform) - finalPoint.y) }))
        .sort((a, b) => a.dx + a.dy - (b.dx + b.dy))[0];
      const risk = landing ? clamp01((landing.dx * 0.12) + (distanceToNearestHazard(platformMidX(landing.platform), level) < 1.2 ? 0.4 : 0)) : 1;
      return {
        id: "vr-board-jump-arc-forecast",
        kind: "jump-arc-forecast",
        phase: avatar.grounded ? "launchable" : "airborne",
        points,
        landingTarget: landing ? {
          id: `landing-target-${landing.platform.id ?? landing.index}`,
          platformId: landing.platform.id ?? `platform-${landing.index}`,
          x: round(platformMidX(landing.platform), 3),
          y: round(platformTop(landing.platform), 3),
          risk: round(risk, 3),
          confidence: round(1 - risk, 3)
        } : null,
        time: round(time, 3),
        rendererContract: notOwnRendererContract("vr-board-jump-arc-forecast-kit")
      };
    },
    snapshot(input) {
      const descriptor = this.describe(input);
      return { points: descriptor.points.length, phase: descriptor.phase, hasLandingTarget: Boolean(descriptor.landingTarget) };
    }
  };
}

export function createVrBoardLandingZoneHeatKit() {
  return {
    id: "n-vr-board-landing-zone-heat-kit",
    domain: "vr-board-traversal-readability/landing-zone-heat",
    describe({ level = {}, avatar = {} } = {}) {
      const avatarX = Number(avatar.position?.x ?? 0);
      return stableArray(level.platforms).map((platform, index) => {
        const midX = platformMidX(platform);
        const hazardDistance = distanceToNearestHazard(midX, level);
        const quality = clamp01(0.34 + Number(platform.w ?? 1) * 0.12 + Math.min(3, hazardDistance) * 0.11 - Math.abs(midX - avatarX) * 0.025);
        return {
          id: `landing-zone-${platform.id ?? index}`,
          kind: "landing-zone-heat",
          platformId: platform.id ?? `platform-${index}`,
          x: round(Number(platform.x ?? 0), 3),
          y: round(Number(platform.y ?? 0), 3),
          w: round(Number(platform.w ?? 1), 3),
          heat: round(1 - quality, 3),
          quality: round(quality, 3),
          hazardDistance: round(Math.min(hazardDistance, 9), 3),
          rendererContract: notOwnRendererContract("vr-board-landing-zone-heat-kit")
        };
      });
    },
    snapshot(input) {
      const zones = this.describe(input);
      return { zones: zones.length, safest: zones.reduce((best, zone) => Math.max(best, zone.quality), 0) };
    }
  };
}

export function createVrBoardCheckpointThreadKit() {
  return {
    id: "n-vr-board-checkpoint-thread-kit",
    domain: "vr-board-traversal-readability/checkpoint-thread",
    describe({ level = {}, objects = {}, avatar = {} } = {}) {
      const collectedIds = new Set(stableArray(objects.collectedIds));
      const nodes = [
        { id: "checkpoint-start", kind: "checkpoint", role: "start", x: Number(level.start?.x ?? 0), y: Number(level.start?.y ?? 1), active: avatarProgress(avatar, level) < 0.2 },
        ...stableArray(level.collectibles).filter((coin) => !collectedIds.has(coin.id)).map((coin, index) => ({
          id: `checkpoint-collectible-${coin.id ?? index}`,
          kind: "checkpoint",
          role: "collectible",
          x: Number(coin.x ?? 0),
          y: Number(coin.y ?? 0),
          active: true
        })),
        { id: "checkpoint-exit", kind: "checkpoint", role: "exit", x: Number(level.exit?.x ?? 12), y: Number(level.exit?.y ?? 2), active: true }
      ].sort((a, b) => a.x - b.x).map((node, index) => ({ ...node, order: index, x: round(node.x, 3), y: round(node.y, 3) }));
      const links = nodes.slice(1).map((node, index) => ({
        id: `checkpoint-link-${index}`,
        kind: "checkpoint-link",
        from: nodes[index].id,
        to: node.id,
        progress: round(avatarProgress(avatar, level), 3)
      }));
      return { id: "vr-board-checkpoint-thread", nodes, links, rendererContract: notOwnRendererContract("vr-board-checkpoint-thread-kit") };
    },
    snapshot(input) {
      const thread = this.describe(input);
      return { nodes: thread.nodes.length, links: thread.links.length };
    }
  };
}

export function createVrBoardFailRecoveryBeaconKit() {
  return {
    id: "n-vr-board-fail-recovery-beacon-kit",
    domain: "vr-board-traversal-readability/fail-recovery-beacon",
    describe({ level = {}, avatar = {}, collisions = {} } = {}) {
      const avatarX = Number(avatar.position?.x ?? 0);
      const avatarY = Number(avatar.position?.y ?? 0);
      const hazardHits = stableArray(collisions.hazardHits);
      const hazards = stableArray(level.hazards);
      const nearHazards = hazards.filter((hazard) => Math.abs(Number(hazard.x ?? 0) - avatarX) < 2.4);
      const safePlatforms = stableArray(level.platforms).filter((platform) => platformMidX(platform) <= avatarX + 0.8).sort((a, b) => platformMidX(b) - platformMidX(a));
      const anchor = safePlatforms[0] ?? stableArray(level.platforms)[0] ?? { id: "start", x: 0, y: 1, w: 2 };
      const beacons = nearHazards.map((hazard, index) => ({
        id: `hazard-recovery-${hazard.id ?? index}`,
        kind: "fail-recovery-beacon",
        role: "hazard-warning",
        x: round(Number(hazard.x ?? 0), 3),
        y: round(Number(hazard.y ?? 0), 3),
        radius: round(0.6 + Math.max(0, 2 - Math.abs(Number(hazard.x ?? 0) - avatarX)) * 0.18, 3),
        urgency: round(clamp01(0.4 + hazardHits.length * 0.4 + Math.max(0, 2 - Math.abs(Number(hazard.x ?? 0) - avatarX)) * 0.2), 3)
      }));
      if (avatarY < -0.5 || avatar.mode === "fallen") {
        beacons.push({
          id: "fall-recovery-anchor",
          kind: "fail-recovery-beacon",
          role: "fall-anchor",
          x: round(platformMidX(anchor), 3),
          y: round(platformTop(anchor), 3),
          radius: 0.85,
          urgency: 1
        });
      }
      return { id: "vr-board-fail-recovery-beacons", beacons, recoveryAnchor: { x: round(platformMidX(anchor), 3), y: round(platformTop(anchor), 3) }, rendererContract: notOwnRendererContract("vr-board-fail-recovery-beacon-kit") };
    },
    snapshot(input) {
      const descriptor = this.describe(input);
      return { beacons: descriptor.beacons.length, anchorX: descriptor.recoveryAnchor.x };
    }
  };
}

export function createVrBoardTempoPulseBandKit({ bandCount = 5 } = {}) {
  return {
    id: "n-vr-board-tempo-pulse-band-kit",
    domain: "vr-board-traversal-readability/tempo-pulse-band",
    describe({ avatar = {}, level = {}, time = 0 } = {}) {
      const progress = avatarProgress(avatar, level);
      const speed = Math.hypot(Number(avatar.velocity?.x ?? 0), Number(avatar.velocity?.y ?? 0));
      return Array.from({ length: bandCount }, (_, index) => ({
        id: `tempo-pulse-band-${index}`,
        kind: "tempo-pulse-band",
        x: round(Number(level.start?.x ?? 0) + (Number(level.exit?.x ?? 12) - Number(level.start?.x ?? 0)) * ((index + 1) / (bandCount + 1)), 3),
        y: round(0.55 + index * 0.08, 3),
        pulse: round(clamp01(0.18 + speed * 0.08 + Math.abs(progress - index / Math.max(1, bandCount - 1)) * 0.16 + Math.sin(time + index) * 0.05), 3),
        progress: round(progress, 3),
        rendererContract: notOwnRendererContract("vr-board-tempo-pulse-band-kit")
      }));
    },
    snapshot(input) {
      const bands = this.describe(input);
      return { bands: bands.length, maxPulse: bands.reduce((max, band) => Math.max(max, band.pulse), 0) };
    }
  };
}

export function createVrBoardControlCoachingStripKit() {
  return {
    id: "n-vr-board-control-coaching-strip-kit",
    domain: "vr-board-traversal-readability/control-coaching-strip",
    describe({ avatar = {}, input = {}, level = {}, comfort = {} } = {}) {
      const progress = avatarProgress(avatar, level);
      const warnings = stableArray(comfort.warnings);
      const chips = [
        { id: "coach-move", label: Math.abs(input.moveAxis ?? avatar.moveAxis ?? 0) > 0.1 ? "steering" : "A/D to steer", active: Math.abs(input.moveAxis ?? avatar.moveAxis ?? 0) > 0.1 },
        { id: "coach-jump", label: avatar.grounded ? "jump window ready" : "commit in air", active: Boolean(avatar.grounded) },
        { id: "coach-route", label: progress > 0.72 ? "exit lane" : "thread checkpoints", active: progress > 0.72 },
        { id: "coach-comfort", label: warnings.length ? "recentre head" : "comfort stable", active: !warnings.length }
      ];
      return {
        id: "vr-board-control-coaching-strip",
        kind: "control-coaching-strip",
        tone: warnings.length ? "warning" : progress > 0.72 ? "success" : "training",
        chips,
        rendererContract: notOwnRendererContract("vr-board-control-coaching-strip-kit")
      };
    },
    snapshot(input) {
      const descriptor = this.describe(input);
      return { tone: descriptor.tone, chips: descriptor.chips.length };
    }
  };
}

export function createVrBoardTraversalRendererHandoffKit({
  jumpArcForecastKit = createVrBoardJumpArcForecastKit(),
  landingZoneHeatKit = createVrBoardLandingZoneHeatKit(),
  checkpointThreadKit = createVrBoardCheckpointThreadKit(),
  failRecoveryBeaconKit = createVrBoardFailRecoveryBeaconKit(),
  tempoPulseBandKit = createVrBoardTempoPulseBandKit(),
  controlCoachingStripKit = createVrBoardControlCoachingStripKit()
} = {}) {
  return {
    id: "n-vr-board-traversal-renderer-handoff-kit",
    domain: "vr-board-traversal-readability/renderer-handoff",
    kits: { jumpArcForecastKit, landingZoneHeatKit, checkpointThreadKit, failRecoveryBeaconKit, tempoPulseBandKit, controlCoachingStripKit },
    describe(input = {}) {
      const jumpArcForecast = jumpArcForecastKit.describe(input);
      const landingZoneHeat = landingZoneHeatKit.describe(input);
      const checkpointThread = checkpointThreadKit.describe(input);
      const failRecoveryBeacons = failRecoveryBeaconKit.describe(input);
      const tempoPulseBands = tempoPulseBandKit.describe(input);
      const controlCoachingStrip = controlCoachingStripKit.describe(input);
      const counts = {
        jumpArcPoints: jumpArcForecast.points.length,
        landingZones: landingZoneHeat.length,
        checkpointNodes: checkpointThread.nodes.length,
        checkpointLinks: checkpointThread.links.length,
        recoveryBeacons: failRecoveryBeacons.beacons.length,
        tempoBands: tempoPulseBands.length,
        coachingChips: controlCoachingStrip.chips.length
      };
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id: "vr-board-traversal-renderer-handoff",
        domainTree: VR_BOARD_TRAVERSAL_READABILITY_DOMAIN_TREE,
        policy: "renderer-consumes-descriptors-only",
        rendererContract: notOwnRendererContract("vr-board-traversal-renderer-handoff-kit"),
        descriptors: {
          jumpArcForecast,
          landingZoneHeat,
          checkpointThread,
          failRecoveryBeacons,
          tempoPulseBands,
          controlCoachingStrip
        },
        counts
      };
    },
    snapshot(input) {
      const handoff = this.describe(input);
      return { total: handoff.counts.total, landingZones: handoff.counts.landingZones, tone: handoff.descriptors.controlCoachingStrip.tone };
    }
  };
}

export function createVrBoardTraversalReadabilityDomainKit(options = {}) {
  const rendererHandoffKit = options.rendererHandoffKit ?? createVrBoardTraversalRendererHandoffKit(options);
  return {
    id: "n-vr-board-traversal-readability-domain-kit",
    domain: "vr-board-traversal-readability-domain",
    rendererHandoffKit,
    describe(input = {}) {
      const rendererHandoff = rendererHandoffKit.describe(input);
      return {
        id: "vr-board-traversal-readability-domain",
        domainTree: VR_BOARD_TRAVERSAL_READABILITY_DOMAIN_TREE,
        rendererHandoff,
        jumpArcForecast: rendererHandoff.descriptors.jumpArcForecast,
        landingZoneHeat: rendererHandoff.descriptors.landingZoneHeat,
        checkpointThread: rendererHandoff.descriptors.checkpointThread,
        failRecoveryBeacons: rendererHandoff.descriptors.failRecoveryBeacons,
        tempoPulseBands: rendererHandoff.descriptors.tempoPulseBands,
        controlCoachingStrip: rendererHandoff.descriptors.controlCoachingStrip,
        rendererContract: notOwnRendererContract("vr-board-traversal-readability-domain-kit")
      };
    },
    snapshot(input) {
      const descriptor = this.describe(input);
      return {
        total: descriptor.rendererHandoff.counts.total,
        arcPoints: descriptor.jumpArcForecast.points.length,
        landingZones: descriptor.landingZoneHeat.length,
        checkpointNodes: descriptor.checkpointThread.nodes.length,
        coachingTone: descriptor.controlCoachingStrip.tone
      };
    }
  };
}
