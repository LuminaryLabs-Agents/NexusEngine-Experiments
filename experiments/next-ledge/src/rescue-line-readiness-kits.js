const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, num(value, min)));
const clamp01 = (value) => clamp(value, 0, 1);
const point = (source = {}, fallback = {}) => ({
  x: num(source.x, fallback.x ?? 0),
  y: num(source.y, fallback.y ?? 0),
  z: num(source.z, fallback.z ?? 1)
});
const dist = (a = {}, b = {}) => Math.hypot(num(a.x) - num(b.x), num(a.y) - num(b.y));

export const NEXT_LEDGE_RESCUE_LINE_READINESS_TREE = `
next-ledge-rescue-line-readiness-domain
├─ emergency-recovery-domain
│  ├─ fall-recovery-domain
│  │  └─ next-ledge-fall-recovery-net-kit
│  └─ tether-strain-domain
│     └─ next-ledge-tether-strain-pulse-kit
├─ route-assurance-domain
│  ├─ rescue-anchor-domain
│  │  └─ next-ledge-rescue-anchor-triage-kit
│  └─ stamina-cache-domain
│     └─ next-ledge-stamina-cache-hop-kit
├─ cargo-extraction-domain
│  ├─ cargo-retention-domain
│  │  └─ next-ledge-cargo-retention-warning-kit
│  └─ summit-extraction-domain
│     └─ next-ledge-summit-extraction-beacon-kit
└─ renderer-handoff
   └─ next-ledge-rescue-line-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;

function orderedLedges(snapshot = {}) {
  return Array.isArray(snapshot.route?.ledges) ? snapshot.route.ledges : [];
}

function playerPoint(snapshot = {}) {
  return point(snapshot.player, { x: 0, y: 0, z: 2 });
}

function cargoPressure(cargoSnapshot = {}) {
  const channel = cargoSnapshot.pressure?.channelsById?.["fall-pressure"] ?? cargoSnapshot.pressure?.channels?.find?.((entry) => entry.id === "fall-pressure") ?? {};
  return clamp01(num(channel.value, 0) / 100);
}

function progressIndex(snapshot = {}) {
  const ledges = orderedLedges(snapshot);
  const current = snapshot.currentAnchorId ?? snapshot.lastLedgeId;
  const index = ledges.findIndex((ledge) => ledge.id === current);
  return Math.max(0, index < 0 ? 0 : index);
}

export function createFallRecoveryNetKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-fall-recovery-net-kit",
    describe(snapshot = {}, cargoSnapshot = {}) {
      const p = playerPoint(snapshot);
      const failY = num(snapshot.camera?.y, p.y) - num(snapshot.tuning?.failFloorDistance, snapshot.constants?.failFloorDistance ?? 520);
      const buffer = p.y - failY;
      const pressure = cargoPressure(cargoSnapshot);
      return [{
        id: `${snapshot.levelId ?? "next-ledge"}:fall-recovery-net`,
        kind: "next-ledge-fall-recovery-net",
        position: { x: 0, y: failY + 28, z: -2 },
        width: num(snapshot.constants?.scaffoldBoundary, 176) * 2,
        height: 18 + pressure * 26,
        buffer,
        urgency: clamp01(1 - buffer / Math.max(1, num(snapshot.tuning?.failFloorDistance, snapshot.constants?.failFloorDistance ?? 520))),
        recoveryMode: ["falling", "retracting", "launched"].includes(snapshot.mode) ? "active" : "standby",
        label: buffer < 160 ? "rescue net hot" : "rescue net staged"
      }];
    }
  };
}

export function createTetherStrainPulseKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-tether-strain-pulse-kit",
    describe(snapshot = {}) {
      const p = playerPoint(snapshot);
      const anchor = point(snapshot.anchorLedge ?? snapshot.rope?.start, p);
      const ropeLength = num(snapshot.constants?.ropeLength, 52);
      const currentLength = dist(anchor, p);
      const velocity = Math.hypot(num(snapshot.player?.vx), num(snapshot.player?.vy));
      const strain = clamp01((currentLength - ropeLength * 0.78) / Math.max(1, ropeLength * 0.75) + velocity / 38);
      return [{
        id: `${snapshot.levelId ?? "next-ledge"}:tether-strain-pulse`,
        kind: "next-ledge-tether-strain-pulse",
        start: anchor,
        end: p,
        strain,
        pulseRate: 0.45 + strain * 1.6,
        mode: snapshot.mode ?? "unknown",
        label: strain > 0.72 ? "strain critical" : strain > 0.42 ? "strain building" : "strain stable"
      }];
    }
  };
}

export function createRescueAnchorTriageKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-rescue-anchor-triage-kit",
    describe(snapshot = {}) {
      const p = playerPoint(snapshot);
      const ledges = orderedLedges(snapshot);
      const enabled = new Set(snapshot.enabledTargetIds ?? []);
      const maxCable = num(snapshot.constants?.maxCableLength, 176);
      return ledges
        .filter((ledge) => ledge.id !== snapshot.currentAnchorId)
        .map((ledge) => {
          const distance = dist(p, ledge);
          const reachable = enabled.has(ledge.id) || distance <= maxCable + num(ledge.r, 8);
          const verticalGain = num(ledge.y) - p.y;
          const score = clamp01((reachable ? 0.45 : 0.12) + clamp(verticalGain / 260, -0.2, 0.4) + (ledge.type === "rest" ? 0.2 : ledge.type === "summit" ? 0.3 : 0));
          return { ledge, distance, reachable, score };
        })
        .filter((entry) => entry.reachable || entry.score > 0.26)
        .sort((a, b) => b.score - a.score || a.distance - b.distance)
        .slice(0, 5)
        .map((entry, order) => ({
          id: `${snapshot.levelId ?? "next-ledge"}:rescue-anchor:${entry.ledge.id}`,
          kind: "next-ledge-rescue-anchor-triage",
          anchorId: entry.ledge.id,
          anchorType: entry.ledge.type ?? "normal",
          order,
          position: point(entry.ledge, { z: 3 }),
          radius: num(entry.ledge.r, 8) + 12 + entry.score * 18,
          rescueScore: entry.score,
          reachable: entry.reachable,
          label: entry.ledge.type === "rest" ? "recovery anchor" : entry.ledge.type === "summit" ? "summit rescue" : "viable rescue anchor"
        }));
    }
  };
}

export function createStaminaCacheHopKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-stamina-cache-hop-kit",
    describe(snapshot = {}) {
      const p = playerPoint(snapshot);
      const staminaRatio = clamp01(num(snapshot.stamina, 0) / Math.max(1, num(snapshot.constants?.maxStamina, 115)));
      return orderedLedges(snapshot)
        .filter((ledge) => ledge.type === "rest")
        .map((ledge) => ({ ledge, distance: dist(p, ledge), verticalGain: num(ledge.y) - p.y }))
        .filter((entry) => entry.verticalGain > -60)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3)
        .map((entry, order) => ({
          id: `${snapshot.levelId ?? "next-ledge"}:stamina-cache-hop:${entry.ledge.id}`,
          kind: "next-ledge-stamina-cache-hop",
          start: p,
          end: point(entry.ledge, { z: 4 }),
          order,
          staminaRatio,
          priority: clamp01((1 - staminaRatio) * 0.75 + (2 - order) * 0.12),
          label: staminaRatio < 0.34 ? "route through cache" : "cache optional"
        }));
    }
  };
}

export function createCargoRetentionWarningKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-cargo-retention-warning-kit",
    describe(snapshot = {}, cargoSnapshot = {}) {
      const pressure = cargoPressure(cargoSnapshot);
      const p = playerPoint(snapshot);
      return [{
        id: `${snapshot.levelId ?? "next-ledge"}:cargo-retention-warning`,
        kind: "next-ledge-cargo-retention-warning",
        position: { x: p.x, y: p.y - 28, z: 7 },
        pressure,
        radius: 18 + pressure * 30,
        cargoStatus: pressure > 0.72 ? "critical" : pressure > 0.42 ? "strained" : "stable",
        label: pressure > 0.72 ? "cargo signal slipping" : "cargo retained"
      }];
    }
  };
}

export function createSummitExtractionBeaconKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-summit-extraction-beacon-kit",
    describe(snapshot = {}) {
      const ledges = orderedLedges(snapshot);
      const summit = ledges.find((ledge) => ledge.type === "summit") ?? ledges.at(-1);
      if (!summit) return [];
      const index = progressIndex(snapshot);
      const remaining = Math.max(0, ledges.length - index - 1);
      const p = playerPoint(snapshot);
      const readiness = clamp01(index / Math.max(1, ledges.length - 1));
      return [{
        id: `${snapshot.levelId ?? "next-ledge"}:summit-extraction-beacon`,
        kind: "next-ledge-summit-extraction-beacon",
        start: p,
        end: point(summit, { z: 6 }),
        remainingAnchors: remaining,
        readiness,
        label: readiness > 0.82 ? "extraction imminent" : "summit thread visible"
      }];
    }
  };
}

export function createRescueLineRendererHandoffKit(options = {}) {
  return {
    id: options.id ?? "next-ledge-rescue-line-renderer-handoff-kit",
    describe(groups = {}) {
      const descriptors = [
        ...(groups.fallRecoveryNets ?? []),
        ...(groups.tetherStrainPulses ?? []),
        ...(groups.rescueAnchorTriages ?? []),
        ...(groups.staminaCacheHops ?? []),
        ...(groups.cargoRetentionWarnings ?? []),
        ...(groups.summitExtractionBeacons ?? [])
      ];
      return {
        id: "next-ledge-rescue-line-readiness-renderer-handoff",
        kind: "renderer-handoff",
        descriptorCount: descriptors.length,
        descriptors,
        rendererContract: "renderer consumes descriptors only; route, cargo, rescue scoring, browser input, and frame-loop truth stay outside renderer presentation",
        counts: {
          fallRecoveryNets: groups.fallRecoveryNets?.length ?? 0,
          tetherStrainPulses: groups.tetherStrainPulses?.length ?? 0,
          rescueAnchorTriages: groups.rescueAnchorTriages?.length ?? 0,
          staminaCacheHops: groups.staminaCacheHops?.length ?? 0,
          cargoRetentionWarnings: groups.cargoRetentionWarnings?.length ?? 0,
          summitExtractionBeacons: groups.summitExtractionBeacons?.length ?? 0
        }
      };
    }
  };
}

export function createNextLedgeRescueLineReadinessDomainKit(options = {}) {
  const fall = options.fallRecoveryNetKit ?? createFallRecoveryNetKit(options.fallRecoveryNet ?? {});
  const strain = options.tetherStrainPulseKit ?? createTetherStrainPulseKit(options.tetherStrainPulse ?? {});
  const anchor = options.rescueAnchorTriageKit ?? createRescueAnchorTriageKit(options.rescueAnchorTriage ?? {});
  const stamina = options.staminaCacheHopKit ?? createStaminaCacheHopKit(options.staminaCacheHop ?? {});
  const cargo = options.cargoRetentionWarningKit ?? createCargoRetentionWarningKit(options.cargoRetentionWarning ?? {});
  const summit = options.summitExtractionBeaconKit ?? createSummitExtractionBeaconKit(options.summitExtractionBeacon ?? {});
  const handoff = options.rendererHandoffKit ?? createRescueLineRendererHandoffKit(options.rendererHandoff ?? {});
  return {
    id: options.id ?? "next-ledge-rescue-line-readiness-domain-kit",
    tree: NEXT_LEDGE_RESCUE_LINE_READINESS_TREE,
    describe(snapshot = {}, cargoSnapshot = {}) {
      const fallRecoveryNets = fall.describe(snapshot, cargoSnapshot);
      const tetherStrainPulses = strain.describe(snapshot, cargoSnapshot);
      const rescueAnchorTriages = anchor.describe(snapshot, cargoSnapshot);
      const staminaCacheHops = stamina.describe(snapshot, cargoSnapshot);
      const cargoRetentionWarnings = cargo.describe(snapshot, cargoSnapshot);
      const summitExtractionBeacons = summit.describe(snapshot, cargoSnapshot);
      const rendererHandoff = handoff.describe({ fallRecoveryNets, tetherStrainPulses, rescueAnchorTriages, staminaCacheHops, cargoRetentionWarnings, summitExtractionBeacons });
      return {
        id: "next-ledge-rescue-line-readiness-domain",
        kind: "domain",
        tree: NEXT_LEDGE_RESCUE_LINE_READINESS_TREE,
        fallRecoveryNets,
        tetherStrainPulses,
        rescueAnchorTriages,
        staminaCacheHops,
        cargoRetentionWarnings,
        summitExtractionBeacons,
        rendererHandoff,
        summary: {
          descriptorCount: rendererHandoff.descriptorCount,
          rescueAnchorCount: rescueAnchorTriages.length,
          activeRecovery: fallRecoveryNets.some((entry) => entry.recoveryMode === "active"),
          criticalCargo: cargoRetentionWarnings.some((entry) => entry.cargoStatus === "critical")
        }
      };
    }
  };
}
