const VERSION = "0.1.0";

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

export function createFoglineVisualFractalDomainKit(config = {}) {
  const kits = config.kits ?? [
    createFoglineRouteThreadKit(),
    createFoglineGroundMottleKit(),
    createFoglineRelayAuraKit(),
    createFoglineWraithEchoKit(),
    createFoglineGateSigilKit(),
    createFoglineCanopyShaftKit()
  ];
  return {
    id: config.id ?? "fogline-visual-fractal-domain-kit",
    describe(input = {}) {
      const [routeThreads, groundMottles, relayAuras, wraithEchoes, gateSigils, canopyShafts] = kits.map((kit) => kit.describe(input));
      return {
        version: VERSION,
        routeThreads,
        groundMottles,
        relayAuras,
        wraithEchoes,
        gateSigils,
        canopyShafts,
        drawOrder: [...groundMottles, ...routeThreads, ...canopyShafts, ...gateSigils, ...relayAuras, ...wraithEchoes]
      };
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
