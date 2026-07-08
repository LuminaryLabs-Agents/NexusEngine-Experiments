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

function platformMidX(platform = {}) {
  return Number(platform.x ?? 0) + Number(platform.w ?? 1) * 0.5;
}

function platformTop(platform = {}) {
  return Number(platform.y ?? 0);
}

function avatarCenter(avatar = {}) {
  return {
    x: Number(avatar.position?.x ?? 0) + Number(avatar.size?.x ?? 0.5) * 0.5,
    y: Number(avatar.position?.y ?? 0) + Number(avatar.size?.y ?? 0.8) * 0.5
  };
}

function avatarProgress(avatar = {}, level = {}) {
  const start = Number(level.start?.x ?? 0);
  const exit = Number(level.exit?.x ?? 12);
  const center = avatarCenter(avatar);
  return clamp01((center.x - start) / Math.max(1, exit - start));
}

function remainingCollectibles(level = {}, objects = {}) {
  const collected = new Set(stableArray(objects.collectedIds));
  return stableArray(level.collectibles).filter((coin) => !collected.has(coin.id));
}

function nearestPlatform(x, level = {}) {
  return stableArray(level.platforms)
    .map((platform, index) => ({ platform, index, distance: Math.abs(platformMidX(platform) - x) }))
    .sort((a, b) => a.distance - b.distance)[0] ?? { platform: { id: "fallback", x: x - 0.5, y: 1, w: 1 }, index: 0, distance: 0 };
}

function nearestHazardDistance(x, level = {}) {
  const hazards = stableArray(level.hazards);
  if (!hazards.length) return 99;
  return hazards.reduce((best, hazard) => Math.min(best, Math.abs(Number(hazard.x ?? 0) - x)), 99);
}

function notOwnRendererContract(owner) {
  return {
    owner,
    rendererConsumes: "serializable companion rescue descriptors only",
    rendererMustOwn: ["Canvas placement", "draw order", "color application", "view interpolation"],
    rendererMustNotOwn: ["simulation state", "XR input", "browser input", "collision", "platformer physics", "objective sequence", "asset loading", "audio", "frame loop", "Three.js", "WebGL"]
  };
}

export const VR_BOARD_COMPANION_RESCUE_READINESS_DOMAIN_TREE = Object.freeze({
  root: "vr-board-companion-rescue-readiness-domain",
  subdomains: [
    {
      id: "companion-route-domain",
      subdomains: [
        { id: "lost-companion-domain", kits: ["vr-board-lost-companion-beacon-kit"] },
        { id: "escort-lane-domain", kits: ["vr-board-escort-lane-ribbon-kit"] }
      ]
    },
    {
      id: "hazard-triage-domain",
      subdomains: [
        { id: "rescue-net-domain", kits: ["vr-board-rescue-net-anchor-kit"] },
        { id: "shield-bubble-domain", kits: ["vr-board-shield-bubble-timing-kit"] }
      ]
    },
    {
      id: "exit-handoff-domain",
      subdomains: [
        { id: "medal-cache-domain", kits: ["vr-board-medal-cache-signal-kit"] },
        { id: "exit-stretcher-domain", kits: ["vr-board-exit-stretcher-commit-kit"] }
      ]
    },
    {
      id: "renderer-handoff",
      kits: ["vr-board-companion-rescue-renderer-handoff-kit"],
      contract: "renderer consumes descriptors only"
    }
  ],
  contract: "renderer consumes companion rescue descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership"
});

export function createVrBoardLostCompanionBeaconKit() {
  return {
    id: "n-vr-board-lost-companion-beacon-kit",
    domain: "vr-board-companion-rescue-readiness/lost-companion",
    describe({ avatar = {}, level = {}, objects = {}, time = 0 } = {}) {
      const center = avatarCenter(avatar);
      return remainingCollectibles(level, objects).map((coin, index) => {
        const dx = Math.abs(Number(coin.x ?? 0) - center.x);
        const dy = Math.abs(Number(coin.y ?? 0) - center.y);
        const urgency = clamp01(0.34 + dx * 0.045 + dy * 0.035 + Math.sin(Number(time) + index) * 0.04);
        return {
          id: `lost-companion-${coin.id ?? index}`,
          kind: "lost-companion-beacon",
          companionId: coin.id ?? `companion-${index}`,
          x: round(Number(coin.x ?? 0), 3),
          y: round(Number(coin.y ?? 0) + 0.26, 3),
          urgency: round(urgency, 3),
          callSign: urgency > 0.68 ? "urgent" : "steady",
          rendererContract: notOwnRendererContract("vr-board-lost-companion-beacon-kit")
        };
      });
    },
    snapshot(input) {
      const beacons = this.describe(input);
      return { beacons: beacons.length, urgent: beacons.filter((beacon) => beacon.callSign === "urgent").length };
    }
  };
}

export function createVrBoardEscortLaneRibbonKit() {
  return {
    id: "n-vr-board-escort-lane-ribbon-kit",
    domain: "vr-board-companion-rescue-readiness/escort-lane",
    describe({ avatar = {}, level = {}, objects = {} } = {}) {
      const center = avatarCenter(avatar);
      const targets = [
        { id: "avatar", x: center.x, y: center.y },
        ...remainingCollectibles(level, objects).map((coin) => ({ id: coin.id, x: Number(coin.x ?? 0), y: Number(coin.y ?? 0) })),
        { id: "exit", x: Number(level.exit?.x ?? 12), y: Number(level.exit?.y ?? 2) }
      ].sort((a, b) => Number(a.x ?? 0) - Number(b.x ?? 0));
      return targets.slice(1).map((target, index) => {
        const previous = targets[index];
        const risk = clamp01(nearestHazardDistance((previous.x + target.x) * 0.5, level) < 1 ? 0.72 : 0.22 + index * 0.05);
        return {
          id: `escort-lane-${previous.id}-to-${target.id}`,
          kind: "escort-lane-ribbon",
          from: previous.id,
          to: target.id,
          x1: round(previous.x, 3),
          y1: round(previous.y, 3),
          x2: round(target.x, 3),
          y2: round(target.y, 3),
          risk: round(risk, 3),
          priority: round(1 - risk * 0.55, 3),
          rendererContract: notOwnRendererContract("vr-board-escort-lane-ribbon-kit")
        };
      });
    },
    snapshot(input) {
      const ribbons = this.describe(input);
      return { ribbons: ribbons.length, riskiest: ribbons.reduce((best, ribbon) => Math.max(best, ribbon.risk), 0) };
    }
  };
}

export function createVrBoardRescueNetAnchorKit() {
  return {
    id: "n-vr-board-rescue-net-anchor-kit",
    domain: "vr-board-companion-rescue-readiness/rescue-net-anchor",
    describe({ level = {}, avatar = {} } = {}) {
      const progress = avatarProgress(avatar, level);
      return stableArray(level.hazards).map((hazard, index) => {
        const anchor = nearestPlatform(Number(hazard.x ?? 0), level).platform;
        const tension = clamp01(0.46 + Math.abs(Number(hazard.x ?? 0) - platformMidX(anchor)) * 0.12 + progress * 0.14);
        return {
          id: `rescue-net-${hazard.id ?? index}`,
          kind: "rescue-net-anchor",
          hazardId: hazard.id ?? `hazard-${index}`,
          x: round(platformMidX(anchor), 3),
          y: round(platformTop(anchor) + 0.18, 3),
          radius: round(0.48 + tension * 0.28, 3),
          tension: round(tension, 3),
          rendererContract: notOwnRendererContract("vr-board-rescue-net-anchor-kit")
        };
      });
    },
    snapshot(input) {
      const anchors = this.describe(input);
      return { anchors: anchors.length, averageTension: round(anchors.reduce((sum, anchor) => sum + anchor.tension, 0) / Math.max(1, anchors.length), 3) };
    }
  };
}

export function createVrBoardShieldBubbleTimingKit() {
  return {
    id: "n-vr-board-shield-bubble-timing-kit",
    domain: "vr-board-companion-rescue-readiness/shield-bubble",
    describe({ level = {}, avatar = {}, time = 0 } = {}) {
      const center = avatarCenter(avatar);
      return stableArray(level.hazards).map((hazard, index) => {
        const distance = Math.abs(Number(hazard.x ?? 0) - center.x);
        const readiness = clamp01(0.22 + Math.max(0, 2.6 - distance) * 0.26 + (avatar.grounded ? 0.12 : 0) + Math.sin(Number(time) * 1.4 + index) * 0.05);
        return {
          id: `shield-bubble-${hazard.id ?? index}`,
          kind: "shield-bubble-window",
          hazardId: hazard.id ?? `hazard-${index}`,
          x: round(Number(hazard.x ?? 0) + Number(hazard.w ?? 0.6) * 0.5, 3),
          y: round(Number(hazard.y ?? 0) + Number(hazard.h ?? 0.35) + 0.22, 3),
          readiness: round(readiness, 3),
          phase: readiness > 0.66 ? "trigger" : "wait",
          rendererContract: notOwnRendererContract("vr-board-shield-bubble-timing-kit")
        };
      });
    },
    snapshot(input) {
      const windows = this.describe(input);
      return { windows: windows.length, triggerable: windows.filter((window) => window.phase === "trigger").length };
    }
  };
}

export function createVrBoardMedalCacheSignalKit() {
  return {
    id: "n-vr-board-medal-cache-signal-kit",
    domain: "vr-board-companion-rescue-readiness/medal-cache",
    describe({ level = {}, objects = {} } = {}) {
      const collected = new Set(stableArray(objects.collectedIds));
      return stableArray(level.collectibles).map((coin, index) => {
        const secured = collected.has(coin.id);
        return {
          id: `medal-cache-${coin.id ?? index}`,
          kind: "medal-cache-signal",
          coinId: coin.id ?? `coin-${index}`,
          x: round(Number(coin.x ?? 0), 3),
          y: round(Number(coin.y ?? 0) + 0.5, 3),
          secured,
          strength: round(secured ? 1 : 0.36 + index * 0.08, 3),
          rendererContract: notOwnRendererContract("vr-board-medal-cache-signal-kit")
        };
      });
    },
    snapshot(input) {
      const signals = this.describe(input);
      return { signals: signals.length, secured: signals.filter((signal) => signal.secured).length };
    }
  };
}

export function createVrBoardExitStretcherCommitKit() {
  return {
    id: "n-vr-board-exit-stretcher-commit-kit",
    domain: "vr-board-companion-rescue-readiness/exit-stretcher",
    describe({ avatar = {}, level = {}, objects = {} } = {}) {
      const total = Math.max(1, stableArray(level.collectibles).length);
      const secured = stableArray(objects.collectedIds).length;
      const progress = avatarProgress(avatar, level);
      const readiness = clamp01(progress * 0.56 + secured / total * 0.44);
      return {
        id: "exit-stretcher-commit",
        kind: "exit-stretcher-commit",
        x: round(Number(level.exit?.x ?? 12), 3),
        y: round(Number(level.exit?.y ?? 2), 3),
        readiness: round(readiness, 3),
        securedCompanions: secured,
        requiredCompanions: total,
        phase: readiness > 0.82 ? "commit" : readiness > 0.48 ? "gather" : "search",
        rendererContract: notOwnRendererContract("vr-board-exit-stretcher-commit-kit")
      };
    },
    snapshot(input) {
      const commit = this.describe(input);
      return { readiness: commit.readiness, phase: commit.phase, securedCompanions: commit.securedCompanions };
    }
  };
}

export function createVrBoardCompanionRescueRendererHandoffKit({
  lostCompanionBeaconKit = createVrBoardLostCompanionBeaconKit(),
  escortLaneRibbonKit = createVrBoardEscortLaneRibbonKit(),
  rescueNetAnchorKit = createVrBoardRescueNetAnchorKit(),
  shieldBubbleTimingKit = createVrBoardShieldBubbleTimingKit(),
  medalCacheSignalKit = createVrBoardMedalCacheSignalKit(),
  exitStretcherCommitKit = createVrBoardExitStretcherCommitKit()
} = {}) {
  return {
    id: "n-vr-board-companion-rescue-renderer-handoff-kit",
    domain: "vr-board-companion-rescue-readiness/renderer-handoff",
    kits: { lostCompanionBeaconKit, escortLaneRibbonKit, rescueNetAnchorKit, shieldBubbleTimingKit, medalCacheSignalKit, exitStretcherCommitKit },
    describe(input = {}) {
      const lostCompanionBeacons = lostCompanionBeaconKit.describe(input);
      const escortLaneRibbons = escortLaneRibbonKit.describe(input);
      const rescueNetAnchors = rescueNetAnchorKit.describe(input);
      const shieldBubbleWindows = shieldBubbleTimingKit.describe(input);
      const medalCacheSignals = medalCacheSignalKit.describe(input);
      const exitStretcherCommit = exitStretcherCommitKit.describe(input);
      const counts = {
        lostCompanionBeacons: lostCompanionBeacons.length,
        escortLaneRibbons: escortLaneRibbons.length,
        rescueNetAnchors: rescueNetAnchors.length,
        shieldBubbleWindows: shieldBubbleWindows.length,
        medalCacheSignals: medalCacheSignals.length,
        exitStretcherCommits: exitStretcherCommit ? 1 : 0
      };
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id: "vr-board-companion-rescue-renderer-handoff",
        domainTree: VR_BOARD_COMPANION_RESCUE_READINESS_DOMAIN_TREE,
        policy: "renderer-consumes-descriptors-only",
        rendererContract: notOwnRendererContract("vr-board-companion-rescue-renderer-handoff-kit"),
        descriptors: { lostCompanionBeacons, escortLaneRibbons, rescueNetAnchors, shieldBubbleWindows, medalCacheSignals, exitStretcherCommit },
        counts
      };
    },
    snapshot(input) {
      const handoff = this.describe(input);
      return { total: handoff.counts.total, lostCompanionBeacons: handoff.counts.lostCompanionBeacons, phase: handoff.descriptors.exitStretcherCommit.phase };
    }
  };
}

export function createVrBoardCompanionRescueReadinessDomainKit(options = {}) {
  const rendererHandoffKit = options.rendererHandoffKit ?? createVrBoardCompanionRescueRendererHandoffKit(options);
  return {
    id: "n-vr-board-companion-rescue-readiness-domain-kit",
    domain: "vr-board-companion-rescue-readiness-domain",
    rendererHandoffKit,
    describe(input = {}) {
      const rendererHandoff = rendererHandoffKit.describe(input);
      return {
        id: "vr-board-companion-rescue-readiness-domain",
        domainTree: VR_BOARD_COMPANION_RESCUE_READINESS_DOMAIN_TREE,
        rendererHandoff,
        lostCompanionBeacons: rendererHandoff.descriptors.lostCompanionBeacons,
        escortLaneRibbons: rendererHandoff.descriptors.escortLaneRibbons,
        rescueNetAnchors: rendererHandoff.descriptors.rescueNetAnchors,
        shieldBubbleWindows: rendererHandoff.descriptors.shieldBubbleWindows,
        medalCacheSignals: rendererHandoff.descriptors.medalCacheSignals,
        exitStretcherCommit: rendererHandoff.descriptors.exitStretcherCommit,
        rendererContract: notOwnRendererContract("vr-board-companion-rescue-readiness-domain-kit")
      };
    },
    snapshot(input) {
      const descriptor = this.describe(input);
      return {
        total: descriptor.rendererHandoff.counts.total,
        beacons: descriptor.lostCompanionBeacons.length,
        ribbons: descriptor.escortLaneRibbons.length,
        rescueNetAnchors: descriptor.rescueNetAnchors.length,
        phase: descriptor.exitStretcherCommit.phase
      };
    }
  };
}
