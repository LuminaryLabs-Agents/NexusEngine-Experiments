const VERSION = "0.1.0";

export const FOGLINE_RADIO_REPAIR_DOMAIN_TREE = `fogline-radio-repair-readiness-domain
├─ parts-recovery-domain
│  ├─ repair-cache-domain
│  │  └─ fogline-repair-part-cache-kit
│  └─ solder-station-domain
│     └─ fogline-solder-station-warmth-kit
├─ signal-calibration-domain
│  ├─ antenna-alignment-domain
│  │  └─ fogline-antenna-alignment-arc-kit
│  └─ power-load-domain
│     └─ fogline-power-load-balancing-kit
├─ broadcast-return-domain
│  ├─ return-signal-domain
│  │  └─ fogline-return-signal-thread-kit
│  └─ broadcast-window-domain
│     └─ fogline-broadcast-window-pulse-kit
└─ renderer-handoff
   └─ fogline-radio-repair-renderer-handoff-kit
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

function gateOf(game = {}, level = {}) {
  return game.gate ?? level.gate ?? { x: 0, z: 42, radius: 3 };
}

function scannedRatio(game = {}, level = {}) {
  const relays = relaysOf(game, level);
  const scanned = Number(game.stats?.scanned ?? relays.filter((relay) => relay.scanned).length ?? 0);
  return clamp(scanned / Math.max(1, relays.length), 0, 1);
}

function scanLoad(relay = {}, index = 0, game = {}, level = {}) {
  const base = relay.scanned ? 1 : clamp(relay.scanProgress ?? 0, 0, 1);
  const elapsed = Number(game.stats?.elapsed ?? 0);
  const pulse = (Math.sin(elapsed / 19 + index * 1.7) + 1) * 0.5;
  const nearbyThreat = wraithsOf(game, level).reduce((nearest, wraith) => Math.min(nearest, distance(relay, wraith)), Infinity);
  const threatNoise = clamp(1 - nearbyThreat / 24, 0, 1) * 0.34;
  return clamp(base * 0.68 + pulse * 0.18 + threatNoise, 0.04, 1);
}

function partCachesOf(game = {}, level = {}) {
  const relays = relaysOf(game, level);
  const spawn = level.spawn ?? playerOf(game, level);
  return relays.map((relay, index) => ({
    id: `repair-cache-${relay.id ?? index}`,
    x: Number(relay.x ?? 0) + (index % 2 === 0 ? -2.4 : 2.4),
    z: Number(relay.z ?? 0) + 1.5,
    relayId: relay.id ?? `relay-${index}`,
    claimed: Boolean(game.repairParts?.claimed?.includes?.(relay.id))
  })).concat({ id: "repair-cache-spawn", x: Number(spawn.x ?? 0) + 2.8, z: Number(spawn.z ?? 0) + 3.2, relayId: "spawn", claimed: false });
}

function allDescriptorBuckets(domain = {}) {
  return [
    domain.repairPartCaches,
    domain.solderStationWarmths,
    domain.antennaAlignmentArcs,
    domain.powerLoadBalancers,
    domain.returnSignalThreads,
    domain.broadcastWindowPulses
  ].flatMap((bucket) => bucket ?? []);
}

export function createFoglineRepairPartCacheKit(config = {}) {
  const color = config.color ?? "#ffe3a3";
  return {
    id: config.id ?? "fogline-repair-part-cache-kit",
    describe({ game = {}, level = {} } = {}) {
      const player = playerOf(game, level);
      return partCachesOf(game, level).map((cache, index) => {
        const proximity = clamp(1 - distance(player, cache) / 30, 0, 1);
        const readiness = clamp((cache.claimed ? 0.18 : 0.54) + scannedRatio(game, level) * 0.24 + proximity * 0.22, 0.08, 1);
        return {
          id: cache.id,
          sourceId: cache.relayId,
          archetype: "fogline.radio.repair.part.cache",
          compatibleBucket: "safePockets",
          compatibleArchetype: "fogline.safe.pocket",
          position: clonePoint(cache),
          radius: clamp(1.6 + readiness * 3.8, 1.4, 6),
          opacity: cache.claimed ? 0.035 : clamp(0.045 + readiness * 0.17, 0.035, 0.26),
          color,
          readiness,
          claimed: cache.claimed,
          partIndex: index
        };
      });
    }
  };
}

export function createFoglineSolderStationWarmthKit(config = {}) {
  const color = config.color ?? "#e0ffff";
  return {
    id: config.id ?? "fogline-solder-station-warmth-kit",
    describe({ game = {}, level = {} } = {}) {
      const relays = relaysOf(game, level);
      const active = relays.filter((relay) => relay.scanned || Number(relay.scanProgress ?? 0) > 0.35);
      const stations = (active.length ? active : [level.spawn ?? playerOf(game, level)]).slice(0, 4);
      return stations.map((station, index) => {
        const heat = clamp(0.22 + scannedRatio(game, level) * 0.46 + scanLoad(station, index, game, level) * 0.32, 0.1, 1);
        return {
          id: `solder-station-warmth-${station.id ?? index}`,
          sourceId: station.id ?? "spawn",
          archetype: "fogline.radio.solder.station.warmth",
          compatibleBucket: "safePockets",
          compatibleArchetype: "fogline.safe.pocket",
          position: clonePoint(station),
          radius: clamp(2.2 + heat * 5.4, 2, 8.5),
          opacity: clamp(0.04 + heat * 0.16, 0.035, 0.25),
          color,
          heat
        };
      });
    }
  };
}

export function createFoglineAntennaAlignmentArcKit(config = {}) {
  const color = config.color ?? "#9deaff";
  return {
    id: config.id ?? "fogline-antenna-alignment-arc-kit",
    describe({ game = {}, level = {} } = {}) {
      const gate = gateOf(game, level);
      return relaysOf(game, level).map((relay, index) => {
        const alignment = clamp(scanLoad(relay, index, game, level) * 0.72 + scannedRatio(game, level) * 0.28, 0.05, 1);
        return {
          id: `antenna-alignment-arc-${relay.id ?? index}`,
          sourceId: relay.id ?? `relay-${index}`,
          archetype: "fogline.radio.antenna.alignment.arc",
          compatibleBucket: "objectiveNeedles",
          compatibleArchetype: "fogline.objective.needle",
          position: clonePoint(relay),
          yaw: yawBetween(relay, gate),
          radius: clamp(2.2 + alignment * 5.8, 2, 9),
          width: clamp(0.25 + alignment * 1.3, 0.22, 1.8),
          opacity: clamp(0.045 + alignment * 0.18, 0.035, 0.29),
          color,
          alignment
        };
      });
    }
  };
}

export function createFoglinePowerLoadBalancingKit(config = {}) {
  const color = config.color ?? "#ff5068";
  return {
    id: config.id ?? "fogline-power-load-balancing-kit",
    describe({ game = {}, level = {} } = {}) {
      const relays = relaysOf(game, level);
      return relays.map((relay, index) => {
        const load = clamp(1 - scanLoad(relay, index, game, level) * 0.62 + wraithsOf(game, level).filter((wraith) => distance(wraith, relay) < 18).length * 0.16, 0.08, 1);
        return {
          id: `power-load-balancer-${relay.id ?? index}`,
          sourceId: relay.id ?? `relay-${index}`,
          archetype: "fogline.radio.power.load.balancer",
          compatibleBucket: "pressureVignettes",
          compatibleArchetype: "fogline.pressure.vignette",
          position: midpoint(playerOf(game, level), relay),
          radius: clamp(2.4 + load * 7.6, 2.4, 12),
          opacity: clamp(0.035 + load * 0.19, 0.03, 0.3),
          color,
          load,
          overdrawRisk: load > 0.72
        };
      });
    }
  };
}

export function createFoglineReturnSignalThreadKit(config = {}) {
  const color = config.color ?? "#bafcff";
  return {
    id: config.id ?? "fogline-return-signal-thread-kit",
    describe({ game = {}, level = {}, route = [] } = {}) {
      const path = routeOf(route, level);
      const player = playerOf(game, level);
      const gate = gateOf(game, level);
      const nodes = path.length >= 2 ? path : [player, ...relaysOf(game, level), gate];
      return nodes.slice(0, -1).map((node, index) => {
        const next = nodes[index + 1];
        const repairConfidence = clamp(scannedRatio(game, level) * 0.62 + (index / Math.max(1, nodes.length - 2)) * 0.18 + 0.16, 0.08, 1);
        return {
          id: `return-signal-thread-${index}`,
          sourceId: `route-segment-${index}`,
          archetype: "fogline.radio.return.signal.thread",
          compatibleBucket: "routeThreads",
          compatibleArchetype: "fogline.route.thread",
          position: midpoint(node, next),
          yaw: yawBetween(node, next),
          length: clamp(distance(node, next), 3.5, 34),
          width: clamp(0.24 + repairConfidence * 1.4, 0.22, 1.9),
          opacity: clamp(0.035 + repairConfidence * 0.15, 0.03, 0.24),
          color,
          repairConfidence
        };
      });
    }
  };
}

export function createFoglineBroadcastWindowPulseKit(config = {}) {
  const color = config.color ?? "#ffe3a3";
  return {
    id: config.id ?? "fogline-broadcast-window-pulse-kit",
    describe({ game = {}, level = {} } = {}) {
      const gate = gateOf(game, level);
      const elapsed = Number(game.stats?.elapsed ?? 0);
      const budget = Number(game.stats?.timeBudget ?? 420);
      const timePressure = clamp(elapsed / Math.max(1, budget), 0, 1);
      const repairReadiness = clamp(scannedRatio(game, level) * 0.74 + clamp(gate.openProgress ?? 0, 0, 1) * 0.18 + (timePressure > 0.72 ? 0.08 : 0), 0.05, 1);
      return [
        {
          id: "broadcast-window-pulse-gate",
          sourceId: gate.id ?? "gate",
          archetype: "fogline.radio.broadcast.window.pulse",
          compatibleBucket: "gateSigils",
          compatibleArchetype: "fogline.gate.sigil",
          position: clonePoint(gate),
          radius: clamp(Number(gate.radius ?? 3) + 1.8 + repairReadiness * 5.8, 3, 11),
          opacity: clamp(0.045 + repairReadiness * 0.2, 0.035, 0.32),
          rotation: elapsed / 40,
          color,
          repairReadiness,
          broadcastReady: repairReadiness >= 0.92
        },
        {
          id: "broadcast-window-pulse-return",
          sourceId: "fogline-return-broadcast",
          archetype: "fogline.radio.broadcast.window.pulse",
          compatibleBucket: "objectiveNeedles",
          compatibleArchetype: "fogline.objective.needle",
          position: midpoint(playerOf(game, level), gate),
          radius: clamp(2.2 + repairReadiness * 5.2, 2, 8.4),
          opacity: clamp(0.035 + repairReadiness * 0.16, 0.03, 0.27),
          color: "#e0ffff",
          repairReadiness
        }
      ];
    }
  };
}

export function createFoglineRadioRepairRendererHandoffKit(config = {}) {
  const policy = config.policy ?? "renderer-consumes-descriptors-only";
  return {
    id: config.id ?? "fogline-radio-repair-renderer-handoff-kit",
    describe(domain = {}) {
      const descriptors = allDescriptorBuckets(domain);
      const counts = descriptors.reduce((acc, descriptor) => {
        acc[descriptor.archetype] = (acc[descriptor.archetype] ?? 0) + 1;
        acc[descriptor.compatibleBucket] = (acc[descriptor.compatibleBucket] ?? 0) + 1;
        return acc;
      }, {});
      return {
        id: "fogline-radio-repair-renderer-handoff",
        archetype: "fogline.radio.repair.renderer.handoff",
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

export function createFoglineRadioRepairReadinessDomainKit(config = {}) {
  const kits = config.kits ?? [
    createFoglineRepairPartCacheKit(),
    createFoglineSolderStationWarmthKit(),
    createFoglineAntennaAlignmentArcKit(),
    createFoglinePowerLoadBalancingKit(),
    createFoglineReturnSignalThreadKit(),
    createFoglineBroadcastWindowPulseKit()
  ];
  const handoffKit = config.handoffKit ?? createFoglineRadioRepairRendererHandoffKit();
  return {
    id: config.id ?? "fogline-radio-repair-readiness-domain-kit",
    tree: FOGLINE_RADIO_REPAIR_DOMAIN_TREE,
    describe(input = {}) {
      const [
        repairPartCaches,
        solderStationWarmths,
        antennaAlignmentArcs,
        powerLoadBalancers,
        returnSignalThreads,
        broadcastWindowPulses
      ] = kits.map((kit) => kit.describe(input));
      const domain = {
        version: VERSION,
        repairPartCaches,
        solderStationWarmths,
        antennaAlignmentArcs,
        powerLoadBalancers,
        returnSignalThreads,
        broadcastWindowPulses
      };
      domain.drawOrder = allDescriptorBuckets(domain);
      domain.rendererHandoff = handoffKit.describe(domain);
      return domain;
    }
  };
}

export function createFoglineRadioRepairReadinessDomain(input = {}) {
  return createFoglineRadioRepairReadinessDomainKit().describe(input);
}

export const FOGLINE_RADIO_REPAIR_KIT_NAMES = Object.freeze([
  "fogline-repair-part-cache-kit",
  "fogline-solder-station-warmth-kit",
  "fogline-antenna-alignment-arc-kit",
  "fogline-power-load-balancing-kit",
  "fogline-return-signal-thread-kit",
  "fogline-broadcast-window-pulse-kit",
  "fogline-radio-repair-renderer-handoff-kit",
  "fogline-radio-repair-readiness-domain-kit"
]);
