const VERSION = "0.1.0";

export const FOGLINE_SIGNAL_CARTOGRAPHY_DOMAIN_TREE = `fogline-signal-cartography-domain
├─ signal-priority-domain
│  ├─ relay-priority-domain
│  │  └─ fogline-relay-priority-map-kit
│  └─ scan-window-domain
│     └─ fogline-scan-window-ladder-kit
├─ route-safety-domain
│  ├─ wraith-avoidance-domain
│  │  └─ fogline-wraith-avoidance-corridor-kit
│  └─ retreat-pocket-domain
│     └─ fogline-retreat-pocket-compass-kit
├─ completion-memory-domain
│  ├─ gate-charge-domain
│  │  └─ fogline-gate-charge-thread-kit
│  └─ triangulation-grid-domain
│     └─ fogline-signal-triangulation-grid-kit
└─ renderer-handoff
   └─ fogline-cartography-renderer-handoff-kit
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

function nextRelay(game = {}, level = {}) {
  return relaysOf(game, level).find((relay) => !relay.scanned) ?? null;
}

function nextTarget(game = {}, level = {}) {
  return nextRelay(game, level) ?? game.gate ?? level.gate ?? null;
}

function scannedRatio(game = {}, level = {}) {
  const relays = relaysOf(game, level);
  const scanned = Number(game.stats?.scanned ?? relays.filter((relay) => relay.scanned).length ?? 0);
  return clamp(scanned / Math.max(1, relays.length), 0, 1);
}

function allDescriptorBuckets(domain = {}) {
  return [
    domain.relayPriorityMarkers,
    domain.wraithAvoidanceCorridors,
    domain.scanWindowLadders,
    domain.gateChargeThreads,
    domain.retreatPocketCompasses,
    domain.signalTriangulationGrid
  ].flatMap((bucket) => bucket ?? []);
}

export function createFoglineRelayPriorityMapKit(config = {}) {
  const color = config.color ?? "#bafcff";
  return {
    id: config.id ?? "fogline-relay-priority-map-kit",
    describe({ game = {}, level = {} } = {}) {
      const player = game.player ?? level.spawn ?? {};
      return relaysOf(game, level).map((relay, index) => {
        const d = distance(player, relay);
        const progress = clamp(relay.scanProgress ?? 0, 0, 1);
        const scanned = Boolean(relay.scanned);
        const priority = clamp((scanned ? 0.18 : 0.78) + progress * 0.34 + clamp(1 - d / 28, 0, 1) * 0.36, 0.06, 1);
        return {
          id: `relay-priority-${relay.id ?? index}`,
          sourceId: relay.id ?? `relay-${index}`,
          archetype: "fogline.relay.priority.marker",
          compatibleBucket: "objectiveNeedles",
          compatibleArchetype: "fogline.objective.needle",
          position: clonePoint(relay),
          radius: 1.8 + priority * 1.4,
          height: 2.7 + priority * 3.2,
          opacity: clamp(0.08 + priority * 0.22, 0.06, 0.42),
          color: scanned ? "#e0ffff" : color,
          priority,
          distance: d,
          progress,
          scanned
        };
      });
    }
  };
}

export function createFoglineWraithAvoidanceCorridorKit(config = {}) {
  const color = config.color ?? "#ff5068";
  return {
    id: config.id ?? "fogline-wraith-avoidance-corridor-kit",
    describe({ game = {}, level = {} } = {}) {
      const player = game.player ?? level.spawn ?? {};
      return wraithsOf(game, level).map((wraith, index) => {
        const d = distance(player, wraith);
        const chase = wraith.mode === "chase";
        const danger = clamp((chase ? 0.54 : 0.2) + clamp(1 - d / 24, 0, 1) * 0.62, 0.08, 1);
        return {
          id: `wraith-avoidance-${wraith.id ?? index}`,
          sourceId: wraith.id ?? `wraith-${index}`,
          archetype: "fogline.wraith.avoidance.corridor",
          compatibleBucket: "routeThreads",
          compatibleArchetype: "fogline.route.thread",
          position: midpoint(player, wraith),
          yaw: yawBetween(player, wraith) + Math.PI / 2,
          length: clamp(8 + danger * 18, 7, 32),
          width: clamp(0.45 + danger * 1.7, 0.3, 3.2),
          opacity: clamp(0.05 + danger * 0.2, 0.04, 0.32),
          color,
          danger,
          distance: d,
          chase
        };
      });
    }
  };
}

export function createFoglineScanWindowLadderKit(config = {}) {
  const color = config.color ?? "#9deaff";
  return {
    id: config.id ?? "fogline-scan-window-ladder-kit",
    describe({ game = {}, level = {} } = {}) {
      const player = game.player ?? level.spawn ?? {};
      const candidates = relaysOf(game, level).filter((relay) => !relay.scanned);
      const targets = candidates.length ? candidates.slice(0, 3) : [game.gate ?? level.gate ?? player];
      return targets.map((target, index) => {
        const d = distance(player, target);
        const progress = clamp(target.scanProgress ?? target.openProgress ?? 0, 0, 1);
        return {
          id: `scan-window-${target.id ?? index}`,
          sourceId: target.id ?? `target-${index}`,
          archetype: "fogline.scan.window.ladder",
          compatibleBucket: "scanCones",
          compatibleArchetype: "fogline.scan.cone",
          position: midpoint(player, target),
          origin: clonePoint(player),
          yaw: yawBetween(player, target),
          radius: clamp(2.4 + progress * 2.2 + index * 0.42, 1.5, 6.5),
          length: clamp(d, 5.5, 22),
          angle: clamp(0.32 + index * 0.1, 0.24, 0.72),
          opacity: clamp(0.07 + progress * 0.18 + clamp(1 - d / 32, 0, 1) * 0.08, 0.05, 0.34),
          color,
          progress,
          distance: d,
          targetKind: target.id?.includes?.("gate") ? "gate" : "relay"
        };
      });
    }
  };
}

export function createFoglineGateChargeThreadKit(config = {}) {
  const color = config.color ?? "#e0ffff";
  return {
    id: config.id ?? "fogline-gate-charge-thread-kit",
    describe({ game = {}, level = {} } = {}) {
      const gate = game.gate ?? level.gate ?? {};
      const ratio = Math.max(scannedRatio(game, level), clamp(gate.openProgress ?? 0, 0, 1));
      return Array.from({ length: 3 }, (_, index) => ({
        id: `gate-charge-thread-${index}`,
        sourceId: gate.id ?? "gate",
        archetype: "fogline.gate.charge.thread",
        compatibleBucket: "gateSigils",
        compatibleArchetype: "fogline.gate.sigil",
        position: clonePoint(gate),
        radius: Number(gate.radius ?? 3.2) + 1.3 + index * 0.86 + ratio * 1.9,
        opacity: clamp(0.045 + ratio * 0.18 - index * 0.015, 0.035, 0.32),
        rotation: ratio * Math.PI * (index + 1) * 0.68,
        color,
        charge: ratio
      }));
    }
  };
}

export function createFoglineRetreatPocketCompassKit(config = {}) {
  const color = config.color ?? "#bafcff";
  return {
    id: config.id ?? "fogline-retreat-pocket-compass-kit",
    describe({ game = {}, level = {} } = {}) {
      const player = game.player ?? level.spawn ?? {};
      const safeSources = relaysOf(game, level).filter((relay) => relay.scanned || Number(relay.scanProgress ?? 0) > 0.65);
      const sources = safeSources.length ? safeSources : [level.spawn ?? player];
      return sources.map((source, index) => {
        const d = distance(player, source);
        return {
          id: `retreat-pocket-${source.id ?? index}`,
          sourceId: source.id ?? "spawn",
          archetype: "fogline.retreat.pocket.compass",
          compatibleBucket: "safePockets",
          compatibleArchetype: "fogline.safe.pocket",
          position: clonePoint(source),
          radius: clamp(2.4 + clamp(1 - d / 28, 0, 1) * 2.6 + index * 0.22, 2, 6.8),
          opacity: clamp(0.05 + clamp(1 - d / 36, 0, 1) * 0.14, 0.04, 0.24),
          color,
          distance: d,
          safe: Boolean(source.scanned)
        };
      });
    }
  };
}

export function createFoglineSignalTriangulationGridKit(config = {}) {
  const color = config.color ?? "#77f3ff";
  return {
    id: config.id ?? "fogline-signal-triangulation-grid-kit",
    describe({ game = {}, level = {}, route = [] } = {}) {
      const target = nextTarget(game, level) ?? level.spawn ?? {};
      const routePoints = (route.length ? route : level.route ?? []).slice(0, 6);
      const scanned = relaysOf(game, level).filter((relay) => relay.scanned || Number(relay.scanProgress ?? 0) > 0);
      const anchors = scanned.length ? scanned : routePoints;
      return anchors.slice(0, 8).map((anchor, index) => {
        const p = midpoint(anchor, target);
        const d = distance(anchor, target);
        return {
          id: `triangulation-grid-${index}`,
          sourceId: anchor.id ?? `route-${index}`,
          archetype: "fogline.signal.triangulation.grid",
          compatibleBucket: "groundMottles",
          compatibleArchetype: "fogline.ground.mottle",
          position: p,
          radius: clamp(0.75 + d * 0.045 + index * 0.08, 0.65, 3.6),
          opacity: clamp(0.035 + scannedRatio(game, level) * 0.09, 0.03, 0.16),
          color,
          rotation: yawBetween(anchor, target),
          distance: d
        };
      });
    }
  };
}

export function createFoglineCartographyRendererHandoffKit(config = {}) {
  const policy = config.policy ?? "renderer-consumes-descriptors-only";
  return {
    id: config.id ?? "fogline-cartography-renderer-handoff-kit",
    describe(domain = {}) {
      const descriptors = allDescriptorBuckets(domain);
      const counts = descriptors.reduce((acc, descriptor) => {
        acc[descriptor.archetype] = (acc[descriptor.archetype] ?? 0) + 1;
        return acc;
      }, {});
      return {
        id: "fogline-cartography-renderer-handoff",
        archetype: "fogline.cartography.renderer.handoff",
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

export function createFoglineSignalCartographyDomainKit(config = {}) {
  const kits = config.kits ?? [
    createFoglineRelayPriorityMapKit(),
    createFoglineWraithAvoidanceCorridorKit(),
    createFoglineScanWindowLadderKit(),
    createFoglineGateChargeThreadKit(),
    createFoglineRetreatPocketCompassKit(),
    createFoglineSignalTriangulationGridKit()
  ];
  const handoffKit = config.handoffKit ?? createFoglineCartographyRendererHandoffKit();
  return {
    id: config.id ?? "fogline-signal-cartography-domain-kit",
    tree: FOGLINE_SIGNAL_CARTOGRAPHY_DOMAIN_TREE,
    describe(input = {}) {
      const [
        relayPriorityMarkers,
        wraithAvoidanceCorridors,
        scanWindowLadders,
        gateChargeThreads,
        retreatPocketCompasses,
        signalTriangulationGrid
      ] = kits.map((kit) => kit.describe(input));
      const domain = {
        version: VERSION,
        relayPriorityMarkers,
        wraithAvoidanceCorridors,
        scanWindowLadders,
        gateChargeThreads,
        retreatPocketCompasses,
        signalTriangulationGrid
      };
      domain.drawOrder = allDescriptorBuckets(domain);
      domain.rendererHandoff = handoffKit.describe(domain);
      return domain;
    }
  };
}

export function createFoglineSignalCartographyDomain(input = {}) {
  return createFoglineSignalCartographyDomainKit().describe(input);
}

export const FOGLINE_SIGNAL_CARTOGRAPHY_KIT_NAMES = Object.freeze([
  "fogline-relay-priority-map-kit",
  "fogline-wraith-avoidance-corridor-kit",
  "fogline-scan-window-ladder-kit",
  "fogline-gate-charge-thread-kit",
  "fogline-retreat-pocket-compass-kit",
  "fogline-signal-triangulation-grid-kit",
  "fogline-cartography-renderer-handoff-kit",
  "fogline-signal-cartography-domain-kit"
]);
