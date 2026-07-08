const VERSION = "0.1.0";

export const FOGLINE_OPERATOR_RHYTHM_DOMAIN_TREE = `fogline-operator-rhythm-domain
├─ scan-tempo-domain
│  ├─ scan-pulse-domain
│  │  └─ fogline-scan-pulse-cadence-kit
│  └─ relay-repair-domain
│     └─ fogline-relay-repair-beat-kit
├─ threat-breath-domain
│  ├─ wraith-noise-domain
│  │  └─ fogline-wraith-noise-shadow-kit
│  └─ lantern-breath-domain
│     └─ fogline-lantern-breath-pocket-kit
├─ route-commitment-domain
│  ├─ route-drift-domain
│  │  └─ fogline-route-drift-correction-kit
│  └─ extraction-commitment-domain
│     └─ fogline-extraction-commitment-beacon-kit
└─ renderer-handoff
   └─ fogline-operator-rhythm-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function clonePoint(point = {}) {
  return { x: Number(point.x ?? 0), z: Number(point.z ?? point.y ?? 0) };
}

function distance(a = {}, b = {}) {
  return Math.hypot(Number(a.x ?? 0) - Number(b.x ?? 0), Number(a.z ?? a.y ?? 0) - Number(b.z ?? b.y ?? 0));
}

function midpoint(a = {}, b = {}) {
  return { x: (Number(a.x ?? 0) + Number(b.x ?? 0)) / 2, z: (Number(a.z ?? a.y ?? 0) + Number(b.z ?? b.y ?? 0)) / 2 };
}

function yawBetween(a = {}, b = {}) {
  return Math.atan2(Number(b.x ?? 0) - Number(a.x ?? 0), Number(b.z ?? b.y ?? 0) - Number(a.z ?? a.y ?? 0));
}

function relaysOf(game = {}, level = {}) {
  return game.relays ?? level.relays ?? [];
}

function wraithsOf(game = {}, level = {}) {
  return game.wraiths ?? level.wraiths ?? [];
}

function routeOf(route = [], level = {}) {
  return route.length ? route : level.route ?? [];
}

function playerOf(game = {}, level = {}) {
  return game.player ?? level.spawn ?? { x: 0, z: 0, yaw: 0 };
}

function scannedRatio(game = {}, level = {}) {
  const relays = relaysOf(game, level);
  const scanned = Number(game.stats?.scanned ?? relays.filter((relay) => relay.scanned).length ?? 0);
  return clamp(scanned / Math.max(1, relays.length), 0, 1);
}

function nextRelay(game = {}, level = {}) {
  return relaysOf(game, level).find((relay) => !relay.scanned) ?? null;
}

function nextTarget(game = {}, level = {}) {
  return nextRelay(game, level) ?? game.gate ?? level.gate ?? playerOf(game, level);
}

function nearestRoutePoint(player = {}, route = []) {
  if (!route.length) return clonePoint(player);
  return route.reduce((nearest, point) => {
    const d = distance(player, point);
    return d < nearest.distance ? { point, distance: d } : nearest;
  }, { point: route[0], distance: Infinity }).point;
}

function allDescriptorBuckets(domain = {}) {
  return [
    domain.scanPulseCadenceRings,
    domain.relayRepairBeats,
    domain.wraithNoiseShadows,
    domain.lanternBreathPockets,
    domain.routeDriftCorrections,
    domain.extractionCommitmentBeacons
  ].flatMap((bucket) => bucket ?? []);
}

export function createFoglineScanPulseCadenceKit(config = {}) {
  const color = config.color ?? "#bafcff";
  return {
    id: config.id ?? "fogline-scan-pulse-cadence-kit",
    describe({ game = {}, level = {} } = {}) {
      const player = playerOf(game, level);
      const target = nextTarget(game, level);
      const elapsed = Number(game.stats?.elapsed ?? 0);
      const scanActive = Boolean(game.input?.scan ?? game.stats?.scanActive);
      const phase = (elapsed % 12) / 12;
      return Array.from({ length: 3 }, (_, index) => {
        const spread = index * 0.86 + phase * 0.7;
        return {
          id: `scan-pulse-cadence-${index}`,
          sourceId: target.id ?? "scan-target",
          archetype: "fogline.scan.pulse.cadence",
          compatibleBucket: "scanCones",
          compatibleArchetype: "fogline.scan.cone",
          position: midpoint(player, target),
          origin: clonePoint(player),
          yaw: yawBetween(player, target),
          radius: clamp(1.6 + spread, 1.2, 5.6),
          length: clamp(distance(player, target) + spread * 2.1, 6, 24),
          angle: clamp(0.22 + index * 0.08 + (scanActive ? 0.08 : 0), 0.18, 0.62),
          opacity: clamp(0.045 + (scanActive ? 0.11 : 0.035) + (1 - phase) * 0.04 - index * 0.012, 0.035, 0.28),
          color,
          phase,
          scanActive
        };
      });
    }
  };
}

export function createFoglineRelayRepairBeatKit(config = {}) {
  const color = config.color ?? "#77f3ff";
  return {
    id: config.id ?? "fogline-relay-repair-beat-kit",
    describe({ game = {}, level = {} } = {}) {
      return relaysOf(game, level).map((relay, index) => {
        const progress = clamp(relay.scanProgress ?? (relay.scanned ? 1 : 0), 0, 1);
        const beat = clamp((relay.scanned ? 0.75 : 0.22) + progress * 0.48, 0.05, 1);
        return {
          id: `relay-repair-beat-${relay.id ?? index}`,
          sourceId: relay.id ?? `relay-${index}`,
          archetype: "fogline.relay.repair.beat",
          compatibleBucket: "relayAuras",
          compatibleArchetype: "fogline.relay.aura",
          position: clonePoint(relay),
          radius: clamp(1.7 + beat * 3.6 + index * 0.14, 1.4, 6.2),
          opacity: clamp(0.055 + beat * 0.19, 0.045, 0.32),
          color: relay.scanned ? "#e0ffff" : color,
          progress,
          beat,
          repaired: Boolean(relay.scanned)
        };
      });
    }
  };
}

export function createFoglineWraithNoiseShadowKit(config = {}) {
  const color = config.color ?? "#ff5068";
  return {
    id: config.id ?? "fogline-wraith-noise-shadow-kit",
    describe({ game = {}, level = {} } = {}) {
      const player = playerOf(game, level);
      return wraithsOf(game, level).map((wraith, index) => {
        const d = distance(player, wraith);
        const chase = wraith.mode === "chase";
        const noise = clamp((chase ? 0.56 : 0.22) + clamp(1 - d / 30, 0, 1) * 0.54, 0.06, 1);
        return {
          id: `wraith-noise-shadow-${wraith.id ?? index}`,
          sourceId: wraith.id ?? `wraith-${index}`,
          archetype: "fogline.wraith.noise.shadow",
          compatibleBucket: "pressureVignettes",
          compatibleArchetype: "fogline.pressure.vignette",
          position: midpoint(player, wraith),
          radius: clamp(2.2 + noise * 8.5, 2, 12),
          opacity: clamp(0.045 + noise * 0.22, 0.04, 0.34),
          color,
          noise,
          distance: d,
          chase
        };
      });
    }
  };
}

export function createFoglineLanternBreathPocketKit(config = {}) {
  const color = config.color ?? "#bafcff";
  return {
    id: config.id ?? "fogline-lantern-breath-pocket-kit",
    describe({ game = {}, level = {} } = {}) {
      const player = playerOf(game, level);
      const scanned = relaysOf(game, level).filter((relay) => relay.scanned || Number(relay.scanProgress ?? 0) > 0.42);
      const anchors = scanned.length ? scanned : [level.spawn ?? player];
      return anchors.slice(0, 4).map((anchor, index) => {
        const d = distance(player, anchor);
        const breath = clamp(0.25 + clamp(1 - d / 32, 0, 1) * 0.55 + index * 0.035, 0.1, 1);
        return {
          id: `lantern-breath-pocket-${anchor.id ?? index}`,
          sourceId: anchor.id ?? "spawn",
          archetype: "fogline.lantern.breath.pocket",
          compatibleBucket: "safePockets",
          compatibleArchetype: "fogline.safe.pocket",
          position: clonePoint(anchor),
          radius: clamp(2.1 + breath * 4.2, 2, 7.6),
          opacity: clamp(0.04 + breath * 0.15, 0.035, 0.26),
          color,
          breath,
          distance: d
        };
      });
    }
  };
}

export function createFoglineRouteDriftCorrectionKit(config = {}) {
  const color = config.color ?? "#9deaff";
  return {
    id: config.id ?? "fogline-route-drift-correction-kit",
    describe({ game = {}, level = {}, route = [] } = {}) {
      const player = playerOf(game, level);
      const path = routeOf(route, level);
      const nearest = nearestRoutePoint(player, path);
      const target = nextTarget(game, level);
      const drift = distance(player, nearest);
      const base = midpoint(player, target);
      return [
        {
          id: "route-drift-correction-current",
          sourceId: target.id ?? "route",
          archetype: "fogline.route.drift.correction",
          compatibleBucket: "routeThreads",
          compatibleArchetype: "fogline.route.thread",
          position: midpoint(player, nearest),
          yaw: yawBetween(player, nearest),
          length: clamp(4 + drift * 1.6, 4, 20),
          width: clamp(0.32 + drift * 0.14, 0.3, 2.8),
          opacity: clamp(0.055 + drift * 0.018, 0.045, 0.28),
          color,
          drift
        },
        {
          id: "route-drift-correction-target",
          sourceId: target.id ?? "target",
          archetype: "fogline.route.drift.correction",
          compatibleBucket: "routeThreads",
          compatibleArchetype: "fogline.route.thread",
          position: base,
          yaw: yawBetween(player, target),
          length: clamp(distance(player, target), 5, 28),
          width: clamp(0.34 + scannedRatio(game, level) * 1.2, 0.3, 2.4),
          opacity: clamp(0.05 + scannedRatio(game, level) * 0.16, 0.04, 0.28),
          color,
          drift
        }
      ];
    }
  };
}

export function createFoglineExtractionCommitmentBeaconKit(config = {}) {
  const color = config.color ?? "#e0ffff";
  return {
    id: config.id ?? "fogline-extraction-commitment-beacon-kit",
    describe({ game = {}, level = {} } = {}) {
      const gate = game.gate ?? level.gate ?? {};
      const ratio = Math.max(scannedRatio(game, level), clamp(gate.openProgress ?? 0, 0, 1));
      return Array.from({ length: 2 }, (_, index) => ({
        id: `extraction-commitment-beacon-${index}`,
        sourceId: gate.id ?? "gate",
        archetype: "fogline.extraction.commitment.beacon",
        compatibleBucket: index === 0 ? "objectiveNeedles" : "gateSigils",
        compatibleArchetype: index === 0 ? "fogline.objective.needle" : "fogline.gate.sigil",
        position: clonePoint(gate),
        height: clamp(3.2 + ratio * 5.2 + index, 2.6, 9.5),
        radius: clamp(Number(gate.radius ?? 3.2) + ratio * 4.2 + index * 0.9, 3, 9.5),
        opacity: clamp(0.05 + ratio * 0.22 - index * 0.03, 0.035, 0.32),
        rotation: ratio * Math.PI * (index + 1),
        color,
        commitment: ratio,
        ready: ratio >= 0.98
      }));
    }
  };
}

export function createFoglineOperatorRhythmRendererHandoffKit(config = {}) {
  const policy = config.policy ?? "renderer-consumes-descriptors-only";
  return {
    id: config.id ?? "fogline-operator-rhythm-renderer-handoff-kit",
    describe(domain = {}) {
      const descriptors = allDescriptorBuckets(domain);
      const counts = descriptors.reduce((acc, descriptor) => {
        acc[descriptor.archetype] = (acc[descriptor.archetype] ?? 0) + 1;
        return acc;
      }, {});
      return {
        id: "fogline-operator-rhythm-renderer-handoff",
        archetype: "fogline.operator.rhythm.renderer.handoff",
        policy,
        descriptorCount: descriptors.length,
        descriptors,
        counts,
        ownership: {
          renderer: "consume-only",
          dom: "excluded",
          browserInput: "excluded",
          three: "excluded",
          webgl: "excluded",
          audio: "excluded",
          assets: "excluded",
          frameLoop: "excluded"
        }
      };
    }
  };
}

export function createFoglineOperatorRhythmDomainKit(config = {}) {
  const kits = config.kits ?? [
    createFoglineScanPulseCadenceKit(),
    createFoglineRelayRepairBeatKit(),
    createFoglineWraithNoiseShadowKit(),
    createFoglineLanternBreathPocketKit(),
    createFoglineRouteDriftCorrectionKit(),
    createFoglineExtractionCommitmentBeaconKit()
  ];
  const handoffKit = config.handoffKit ?? createFoglineOperatorRhythmRendererHandoffKit();
  return {
    id: config.id ?? "fogline-operator-rhythm-domain-kit",
    tree: FOGLINE_OPERATOR_RHYTHM_DOMAIN_TREE,
    describe(input = {}) {
      const [
        scanPulseCadenceRings,
        relayRepairBeats,
        wraithNoiseShadows,
        lanternBreathPockets,
        routeDriftCorrections,
        extractionCommitmentBeacons
      ] = kits.map((kit) => kit.describe(input));
      const domain = {
        version: VERSION,
        scanPulseCadenceRings,
        relayRepairBeats,
        wraithNoiseShadows,
        lanternBreathPockets,
        routeDriftCorrections,
        extractionCommitmentBeacons
      };
      domain.drawOrder = allDescriptorBuckets(domain);
      domain.rendererHandoff = handoffKit.describe(domain);
      return domain;
    }
  };
}

export function createFoglineOperatorRhythmDomain(input = {}) {
  return createFoglineOperatorRhythmDomainKit().describe(input);
}

export const FOGLINE_OPERATOR_RHYTHM_KIT_NAMES = Object.freeze([
  "fogline-scan-pulse-cadence-kit",
  "fogline-relay-repair-beat-kit",
  "fogline-wraith-noise-shadow-kit",
  "fogline-lantern-breath-pocket-kit",
  "fogline-route-drift-correction-kit",
  "fogline-extraction-commitment-beacon-kit",
  "fogline-operator-rhythm-renderer-handoff-kit",
  "fogline-operator-rhythm-domain-kit"
]);
