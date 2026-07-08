const VERSION = "0.2.0";

function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function clonePoint(point = {}) {
  return { x: Number(point.x ?? 0), z: Number(point.z ?? point.y ?? 0) };
}

function stableHash(value = "fogline") {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededUnit(seed, index = 0) {
  let value = (stableHash(seed) + Math.imul(index + 1, 0x9e3779b1)) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 2246822507) >>> 0;
  value ^= value >>> 13;
  value = Math.imul(value, 3266489909) >>> 0;
  value ^= value >>> 16;
  return (value >>> 0) / 4294967295;
}

function routeSegments(route = []) {
  const segments = [];
  for (let index = 0; index < route.length - 1; index += 1) {
    const a = clonePoint(route[index]);
    const b = clonePoint(route[index + 1]);
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const length = Math.hypot(dx, dz);
    if (length <= 0.0001) continue;
    segments.push({ index, a, b, dx, dz, length });
  }
  return segments;
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 };
}

function distance(a = {}, b = {}) {
  return Math.hypot(Number(a.x ?? 0) - Number(b.x ?? 0), Number(a.z ?? a.y ?? 0) - Number(b.z ?? b.y ?? 0));
}

function yawForward(yaw = 0) {
  const angle = Number(yaw);
  return { x: Math.sin(Number.isFinite(angle) ? angle : 0), z: Math.cos(Number.isFinite(angle) ? angle : 0) };
}

function nearestUnscannedRelay(game = {}, level = {}) {
  return (game.relays ?? level.relays ?? []).find((relay) => !relay.scanned) ?? null;
}

function nextObjectiveTarget(game = {}, level = {}) {
  const relay = nearestUnscannedRelay(game, level);
  if (relay) return { ...relay, targetKind: "relay", label: relay.label ?? "Relay" };
  const gate = game.gate ?? level.gate ?? null;
  if (gate && !gate.entered) return { ...gate, targetKind: "gate", label: gate.label ?? "Exit gate" };
  return null;
}

function allDescriptorBuckets(domain = {}) {
  return [
    domain.groundMottles,
    domain.memoryBreadcrumbs,
    domain.routeThreads,
    domain.safePockets,
    domain.canopyShafts,
    domain.scanCones,
    domain.objectiveNeedles,
    domain.gateSigils,
    domain.relayAuras,
    domain.pressureVignettes,
    domain.wraithEchoes
  ].flatMap((bucket) => bucket ?? []);
}

export function createFoglineRouteThreadKit(config = {}) {
  const width = clamp(config.width ?? 1.2, 0.2, 6);
  const pulse = clamp(config.pulse ?? 0, 0, 1);
  const color = config.color ?? "#77f3ff";
  return {
    id: config.id ?? "fogline-route-thread-kit",
    describe({ route = [], game = {} } = {}) {
      const scanned = Number(game.stats?.scanned ?? 0);
      return routeSegments(route).map((segment) => {
        const active = segment.index <= scanned;
        return {
          id: `route-thread-${segment.index}`,
          archetype: "fogline.route.thread",
          position: midpoint(segment.a, segment.b),
          start: segment.a,
          end: segment.b,
          yaw: Math.atan2(segment.dx, segment.dz),
          length: segment.length,
          width: width * (active ? 1.24 : 0.72),
          opacity: clamp((active ? 0.26 : 0.1) + pulse * 0.08, 0.04, 0.48),
          color,
          active
        };
      });
    }
  };
}

export function createFoglineGroundMottleKit(config = {}) {
  const count = Math.max(1, Math.floor(config.count ?? 18));
  const color = config.color ?? "#9deaff";
  return {
    id: config.id ?? "fogline-ground-mottle-kit",
    describe({ level = {}, game = {} } = {}) {
      const bounds = level.bounds ?? { minX: -18, maxX: 18, minZ: -8, maxZ: 48 };
      const route = level.route ?? [];
      const player = game.player ?? level.spawn ?? { x: 0, z: 0 };
      const spanX = Number(bounds.maxX ?? 18) - Number(bounds.minX ?? -18);
      const spanZ = Number(bounds.maxZ ?? 48) - Number(bounds.minZ ?? -8);
      return Array.from({ length: count }, (_, index) => {
        const anchor = route[index % Math.max(1, route.length)] ?? player;
        const u = seededUnit(`${level.id ?? "fogline"}-mottle-x`, index);
        const v = seededUnit(`${level.id ?? "fogline"}-mottle-z`, index);
        const drift = seededUnit(`${Math.round(player.x ?? 0)}:${Math.round(player.z ?? 0)}:mottle`, index) - 0.5;
        const x = clamp(Number(anchor.x ?? 0) + (u - 0.5) * spanX * 0.55 + drift * 1.4, bounds.minX ?? -18, bounds.maxX ?? 18);
        const z = clamp(Number(anchor.z ?? 0) + (v - 0.5) * spanZ * 0.36 - drift * 1.7, bounds.minZ ?? -8, bounds.maxZ ?? 48);
        return {
          id: `ground-mottle-${index}`,
          archetype: "fogline.ground.mottle",
          position: { x, z },
          radius: 0.8 + seededUnit("mottle-radius", index) * 2.4,
          opacity: 0.045 + seededUnit("mottle-opacity", index) * 0.08,
          color,
          rotation: seededUnit("mottle-rot", index) * Math.PI * 2
        };
      });
    }
  };
}

export function createFoglineRelayAuraKit(config = {}) {
  const baseColor = config.baseColor ?? "#77f3ff";
  const scannedColor = config.scannedColor ?? "#bafcff";
  return {
    id: config.id ?? "fogline-relay-aura-kit",
    describe({ game = {}, level = {} } = {}) {
      const relays = game.relays ?? level.relays ?? [];
      const player = game.player ?? {};
      return relays.map((relay, index) => {
        const progress = clamp(relay.scanProgress ?? 0, 0, 1);
        const scanned = Boolean(relay.scanned);
        const d = distance(player, relay);
        return {
          id: `relay-aura-${relay.id ?? index}`,
          sourceId: relay.id ?? `relay-${index}`,
          archetype: "fogline.relay.aura",
          position: clonePoint(relay),
          radius: scanned ? 2.8 : 1.45 + progress * 1.9,
          beamHeight: scanned ? 18 : 8 + progress * 10,
          opacity: clamp((scanned ? 0.34 : 0.12 + progress * 0.34) + clamp(1 - d / 14, 0, 1) * 0.08, 0.08, 0.62),
          color: scanned ? scannedColor : baseColor,
          progress,
          scanned
        };
      });
    }
  };
}

export function createFoglineWraithEchoKit(config = {}) {
  const color = config.color ?? "#ff5068";
  return {
    id: config.id ?? "fogline-wraith-echo-kit",
    describe({ game = {}, level = {} } = {}) {
      const player = game.player ?? level.spawn ?? {};
      const wraiths = game.wraiths ?? level.wraiths ?? [];
      return wraiths.map((wraith, index) => {
        const d = distance(player, wraith);
        const chase = wraith.mode === "chase";
        const threat = clamp(chase ? 1 : 1 - d / 18, 0.18, 1);
        return {
          id: `wraith-echo-${wraith.id ?? index}`,
          sourceId: wraith.id ?? `wraith-${index}`,
          archetype: "fogline.wraith.echo",
          position: clonePoint(wraith),
          radius: 1.6 + threat * 2.6,
          height: 2.1 + threat * 2.2,
          opacity: 0.08 + threat * 0.24,
          color,
          threat,
          chase
        };
      });
    }
  };
}

export function createFoglineGateSigilKit(config = {}) {
  const color = config.color ?? "#bafcff";
  return {
    id: config.id ?? "fogline-gate-sigil-kit",
    describe({ game = {}, level = {} } = {}) {
      const gate = game.gate ?? level.gate ?? {};
      const openProgress = clamp(gate.openProgress ?? 0, 0, 1);
      const scanned = Number(game.stats?.scanned ?? 0);
      return Array.from({ length: 3 }, (_, index) => ({
        id: `gate-sigil-${index}`,
        sourceId: gate.id ?? "gate",
        archetype: "fogline.gate.sigil",
        position: clonePoint(gate),
        radius: Number(gate.radius ?? 3.2) + 0.9 + index * 0.72 + openProgress * 1.1,
        opacity: clamp(0.05 + openProgress * 0.24 + scanned * 0.025 - index * 0.018, 0.035, 0.42),
        color,
        rotation: openProgress * Math.PI * (index + 1) * 0.45,
        openProgress
      }));
    }
  };
}

export function createFoglineCanopyShaftKit(config = {}) {
  const color = config.color ?? "#9deaff";
  return {
    id: config.id ?? "fogline-canopy-shaft-kit",
    describe({ game = {}, level = {} } = {}) {
      const relays = game.relays ?? level.relays ?? [];
      const gate = game.gate ?? level.gate;
      const sources = [...relays, ...(gate ? [gate] : [])];
      return sources.map((source, index) => {
        const progress = clamp(source.scanProgress ?? source.openProgress ?? 0, 0, 1);
        const active = Boolean(source.scanned || source.open || progress > 0);
        return {
          id: `canopy-shaft-${source.id ?? index}`,
          sourceId: source.id ?? `source-${index}`,
          archetype: "fogline.canopy.shaft",
          position: clonePoint(source),
          height: 9 + progress * 11 + (active ? 4 : 0),
          radius: 2.2 + progress * 3.6,
          opacity: clamp((active ? 0.12 : 0.045) + progress * 0.16, 0.035, 0.36),
          color: source.open || source.id === gate?.id ? "#bafcff" : color,
          active
        };
      });
    }
  };
}

export function createFoglineScanConeKit(config = {}) {
  const color = config.color ?? "#bafcff";
  return {
    id: config.id ?? "fogline-scan-cone-kit",
    describe({ game = {}, level = {} } = {}) {
      const player = game.player ?? level.spawn ?? {};
      const forward = yawForward(player.yaw ?? 0);
      const scanned = clamp(Number(game.stats?.scanned ?? 0) / Math.max(1, (game.relays ?? level.relays ?? []).length), 0, 1);
      const scanActive = Boolean(game.input?.scan ?? game.scanActive ?? game.stats?.scanActive);
      const distanceAhead = 4.8 + scanned * 2.6;
      return [{
        id: "scan-cone-player",
        archetype: "fogline.scan.cone",
        position: {
          x: Number(player.x ?? 0) + forward.x * distanceAhead,
          z: Number(player.z ?? 0) + forward.z * distanceAhead
        },
        origin: clonePoint(player),
        yaw: Number(player.yaw ?? 0),
        radius: 3.4 + scanned * 2.4,
        length: 7 + scanned * 4,
        angle: 0.72,
        opacity: clamp((scanActive ? 0.24 : 0.08) + scanned * 0.08, 0.055, 0.42),
        color,
        scanActive,
        scannedRatio: scanned
      }];
    }
  };
}

export function createFoglineObjectiveNeedleKit(config = {}) {
  const relayColor = config.relayColor ?? "#77f3ff";
  const gateColor = config.gateColor ?? "#bafcff";
  return {
    id: config.id ?? "fogline-objective-needle-kit",
    describe({ game = {}, level = {} } = {}) {
      const player = game.player ?? level.spawn ?? {};
      const target = nextObjectiveTarget(game, level);
      if (!target) return [];
      const d = distance(player, target);
      const gate = target.targetKind === "gate";
      return [{
        id: `objective-needle-${target.id ?? target.targetKind}`,
        sourceId: target.id ?? target.targetKind,
        archetype: "fogline.objective.needle",
        targetKind: target.targetKind,
        label: target.label,
        position: clonePoint(target),
        distance: d,
        radius: gate ? 4.8 : 2.7,
        height: gate ? 5.6 : 3.4,
        opacity: clamp(0.12 + clamp(d / 40, 0, 1) * 0.18 + (gate ? 0.08 : 0), 0.1, 0.42),
        color: gate ? gateColor : relayColor,
        urgency: clamp(1 - d / 28, 0.08, 1)
      }];
    }
  };
}

export function createFoglineMemoryBreadcrumbKit(config = {}) {
  const count = Math.max(1, Math.floor(config.count ?? 8));
  const color = config.color ?? "#9deaff";
  return {
    id: config.id ?? "fogline-memory-breadcrumb-kit",
    describe({ route = [], game = {}, level = {} } = {}) {
      const points = route.length ? route : level.route ?? [];
      if (!points.length) return [];
      const player = game.player ?? level.spawn ?? {};
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      points.forEach((point, index) => {
        const d = distance(player, point);
        if (d < nearestDistance) {
          nearestDistance = d;
          nearestIndex = index;
        }
      });
      return Array.from({ length: count }, (_, index) => {
        const routeIndex = clamp(nearestIndex - count + index + 1, 0, Math.max(0, points.length - 1));
        const point = clonePoint(points[routeIndex]);
        const age = count - index;
        return {
          id: `memory-breadcrumb-${index}`,
          sourceIndex: routeIndex,
          archetype: "fogline.memory.breadcrumb",
          position: point,
          radius: 0.34 + index * 0.055,
          opacity: clamp(0.035 + index * 0.018 - age * 0.001, 0.025, 0.18),
          color,
          age,
          active: routeIndex <= nearestIndex
        };
      });
    }
  };
}

export function createFoglinePressureVignetteKit(config = {}) {
  const color = config.color ?? "#ff5068";
  return {
    id: config.id ?? "fogline-pressure-vignette-kit",
    describe({ game = {}, level = {} } = {}) {
      const player = game.player ?? level.spawn ?? {};
      const wraiths = game.wraiths ?? level.wraiths ?? [];
      const nearestThreat = wraiths.reduce((best, wraith) => {
        const d = distance(player, wraith);
        const chaseBoost = wraith.mode === "chase" ? 0.45 : 0;
        const threat = clamp(1 - d / 26 + chaseBoost, 0, 1);
        return threat > best.threat ? { threat, distance: d, wraith } : best;
      }, { threat: 0, distance: Infinity, wraith: null });
      const modeFailed = game.mode === "failed";
      return [{
        id: "pressure-vignette-player",
        sourceId: nearestThreat.wraith?.id ?? "ambient-pressure",
        archetype: "fogline.pressure.vignette",
        position: clonePoint(player),
        radius: 7 + nearestThreat.threat * 8,
        opacity: clamp(0.045 + nearestThreat.threat * 0.24 + (modeFailed ? 0.18 : 0), 0.035, 0.54),
        color,
        threat: nearestThreat.threat,
        distance: Number.isFinite(nearestThreat.distance) ? nearestThreat.distance : null,
        failed: modeFailed
      }];
    }
  };
}

export function createFoglineSafePocketKit(config = {}) {
  const color = config.color ?? "#bafcff";
  return {
    id: config.id ?? "fogline-safe-pocket-kit",
    describe({ game = {}, level = {} } = {}) {
      const relays = game.relays ?? level.relays ?? [];
      const gate = game.gate ?? level.gate;
      const pockets = relays
        .filter((relay) => relay.scanned || Number(relay.scanProgress ?? 0) > 0.68)
        .map((relay, index) => ({
          id: `safe-pocket-${relay.id ?? index}`,
          sourceId: relay.id ?? `relay-${index}`,
          archetype: "fogline.safe.pocket",
          position: clonePoint(relay),
          radius: 3.2 + clamp(relay.scanProgress ?? 0, 0, 1) * 1.4,
          opacity: relay.scanned ? 0.12 : 0.07,
          color,
          scanned: Boolean(relay.scanned)
        }));
      if (gate?.open || Number(gate?.openProgress ?? 0) > 0.55) {
        pockets.push({
          id: `safe-pocket-${gate.id ?? "gate"}`,
          sourceId: gate.id ?? "gate",
          archetype: "fogline.safe.pocket",
          position: clonePoint(gate),
          radius: 5.6 + clamp(gate.openProgress ?? 0, 0, 1) * 2,
          opacity: 0.09 + clamp(gate.openProgress ?? 0, 0, 1) * 0.07,
          color: "#e0ffff",
          scanned: Boolean(gate.open)
        });
      }
      return pockets.length ? pockets : [{
        id: "safe-pocket-spawn",
        sourceId: "spawn",
        archetype: "fogline.safe.pocket",
        position: clonePoint(level.spawn ?? game.player ?? {}),
        radius: 2.2,
        opacity: 0.045,
        color,
        scanned: false
      }];
    }
  };
}

export function createFoglineRendererHandoffKit(config = {}) {
  const policy = config.policy ?? "renderer-consumes-descriptors-only";
  return {
    id: config.id ?? "fogline-renderer-handoff-kit",
    describe(domain = {}) {
      const descriptors = allDescriptorBuckets(domain);
      const counts = descriptors.reduce((acc, descriptor) => {
        acc[descriptor.archetype] = (acc[descriptor.archetype] ?? 0) + 1;
        return acc;
      }, {});
      return {
        id: "fogline-renderer-handoff",
        archetype: "fogline.renderer.handoff",
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

export function createFoglineVisualFractalDomainKit(config = {}) {
  const kits = config.kits ?? [
    createFoglineRouteThreadKit(),
    createFoglineGroundMottleKit(),
    createFoglineRelayAuraKit(),
    createFoglineWraithEchoKit(),
    createFoglineGateSigilKit(),
    createFoglineCanopyShaftKit(),
    createFoglineScanConeKit(),
    createFoglineObjectiveNeedleKit(),
    createFoglineMemoryBreadcrumbKit(),
    createFoglinePressureVignetteKit(),
    createFoglineSafePocketKit()
  ];
  const handoffKit = config.handoffKit ?? createFoglineRendererHandoffKit();
  return {
    id: config.id ?? "fogline-visual-fractal-domain-kit",
    describe(input = {}) {
      const [
        routeThreads,
        groundMottles,
        relayAuras,
        wraithEchoes,
        gateSigils,
        canopyShafts,
        scanCones,
        objectiveNeedles,
        memoryBreadcrumbs,
        pressureVignettes,
        safePockets
      ] = kits.map((kit) => kit.describe(input));
      const domain = {
        version: VERSION,
        routeThreads,
        groundMottles,
        relayAuras,
        wraithEchoes,
        gateSigils,
        canopyShafts,
        scanCones,
        objectiveNeedles,
        memoryBreadcrumbs,
        pressureVignettes,
        safePockets
      };
      domain.drawOrder = allDescriptorBuckets(domain);
      domain.rendererHandoff = handoffKit.describe(domain);
      return domain;
    }
  };
}

export function createFoglineVisualFractalDomain(input = {}) {
  return createFoglineVisualFractalDomainKit().describe(input);
}

export const FOGLINE_VISUAL_FRACTAL_KIT_NAMES = Object.freeze([
  "fogline-visual-fractal-domain-kit",
  "fogline-route-thread-kit",
  "fogline-ground-mottle-kit",
  "fogline-relay-aura-kit",
  "fogline-wraith-echo-kit",
  "fogline-gate-sigil-kit",
  "fogline-canopy-shaft-kit"
]);

export const FOGLINE_ROUTE_READABILITY_KIT_NAMES = Object.freeze([
  "fogline-scan-cone-kit",
  "fogline-objective-needle-kit",
  "fogline-memory-breadcrumb-kit",
  "fogline-pressure-vignette-kit",
  "fogline-safe-pocket-kit",
  "fogline-renderer-handoff-kit"
]);
