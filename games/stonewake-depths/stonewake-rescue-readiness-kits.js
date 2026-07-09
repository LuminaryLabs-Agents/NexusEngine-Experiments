const FORBIDDEN_OWNERSHIP = Object.freeze([
  "renderer",
  "dom",
  "browser-input",
  "threejs",
  "webgl",
  "audio",
  "asset-loading",
  "frame-loop"
]);

export const STONEWAKE_RESCUE_READINESS_TREE = `stonewake-flood-rescue-readiness-domain
├─ survivor-location-domain
│  ├─ echo-ping-domain
│  │  └─ stonewake-survivor-echo-ping-kit
│  └─ chalk-mark-domain
│     └─ stonewake-chalk-route-mark-kit
├─ water-pressure-domain
│  ├─ floodline-domain
│  │  └─ stonewake-floodline-pressure-band-kit
│  └─ air-pocket-domain
│     └─ stonewake-air-pocket-cache-kit
├─ escape-handoff-domain
│  ├─ rope-lift-domain
│  │  └─ stonewake-rope-lift-anchor-kit
│  └─ rescue-bell-domain
│     └─ stonewake-rescue-bell-handoff-kit
└─ renderer-handoff
   └─ stonewake-flood-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export const STONEWAKE_RESCUE_READINESS_KITS = Object.freeze([
  "stonewake-survivor-echo-ping-kit",
  "stonewake-chalk-route-mark-kit",
  "stonewake-floodline-pressure-band-kit",
  "stonewake-air-pocket-cache-kit",
  "stonewake-rope-lift-anchor-kit",
  "stonewake-rescue-bell-handoff-kit",
  "stonewake-flood-rescue-renderer-handoff-kit",
  "stonewake-flood-rescue-readiness-domain-kit"
]);

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const round = (value, digits = 3) => {
  const power = 10 ** digits;
  return Math.round(finite(value) * power) / power;
};
const center = (thing = {}) => ({ x: finite(thing.x) + finite(thing.w) * 0.5, y: finite(thing.y) + finite(thing.h) * 0.5 });
const distance = (a, b) => Math.hypot(finite(a?.x) - finite(b?.x), finite(a?.y) - finite(b?.y));

function objectByType(level = {}, type) {
  return (level.objects ?? []).find((object) => object.type === type) ?? null;
}

function platformCenter(platform = {}) {
  return { x: finite(platform.x) + finite(platform.w) * 0.5, y: finite(platform.y) };
}

function collectRoutePlatforms(level = {}) {
  return (level.platforms ?? [])
    .filter((platform) => !["boundary", "floor"].includes(platform.role))
    .sort((a, b) => finite(a.x) - finite(b.x));
}

function rescuePressure({ state = {}, level = {} } = {}) {
  const water = finite(state.water?.level, level.bounds?.height ?? 720);
  const playerBottom = finite(state.player?.y) + finite(state.player?.h, 46);
  const waterSpan = Math.max(180, finite(level.bounds?.height, 720));
  const waterThreat = clamp(1 - (water - playerBottom) / waterSpan, 0, 1);
  const doorLag = 1 - clamp(state.door, 0, 1);
  const valveLag = 1 - clamp(state.valve, 0, 1);
  const plateLag = state.plate ? 0 : 1;
  return clamp(waterThreat * 0.42 + doorLag * 0.22 + valveLag * 0.18 + plateLag * 0.18, 0, 1);
}

export function createStonewakeSurvivorEchoPingKit() {
  return {
    id: "stonewake-survivor-echo-ping-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {}, count = 3 } = {}) {
      const platforms = collectRoutePlatforms(level);
      const player = center(state.player ?? objectByType(level, "player") ?? {});
      const pressure = rescuePressure({ state, level });
      const selected = platforms.filter((platform) => finite(platform.x) > finite(state.player?.x, 0) + 120).slice(0, Math.max(1, count));
      return selected.map((platform, index) => {
        const p = platformCenter(platform);
        return {
          kind: "survivor-echo-ping",
          id: `survivor-echo-${platform.id ?? index}`,
          x: round(p.x),
          y: round(p.y - 42 - index * 6),
          radius: round(26 + pressure * 28 + index * 3),
          urgency: round(clamp(pressure + index * 0.11, 0, 1)),
          distanceFromPlayer: round(distance(player, p), 2),
          focusId: platform.focusId ?? null
        };
      });
    }
  };
}

export function createStonewakeChalkRouteMarkKit() {
  return {
    id: "stonewake-chalk-route-mark-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ level = {}, maxMarks = 7 } = {}) {
      return collectRoutePlatforms(level).slice(0, maxMarks).map((platform, index) => {
        const p = platformCenter(platform);
        return {
          kind: "chalk-route-mark",
          id: `chalk-route-${platform.id ?? index}`,
          x: round(p.x),
          y: round(p.y - 8),
          direction: index === 0 ? "start" : index % 2 === 0 ? "rise" : "cross",
          legibility: round(clamp(0.92 - index * 0.055, 0.45, 1)),
          focusId: platform.focusId ?? null
        };
      });
    }
  };
}

export function createStonewakeFloodlinePressureBandKit() {
  return {
    id: "stonewake-floodline-pressure-band-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {} } = {}) {
      const width = finite(level.bounds?.width, 1280);
      const water = finite(state.water?.level, level.bounds?.height ?? 720);
      const pressure = rescuePressure({ state, level });
      return [0, 1, 2].map((index) => ({
        kind: "floodline-pressure-band",
        id: `floodline-band-${index + 1}`,
        x: 0,
        y: round(water - index * (22 + pressure * 16)),
        w: round(width),
        h: round(8 + pressure * 13 - index * 1.5),
        pressure: round(clamp(pressure - index * 0.13, 0.05, 1)),
        phase: pressure > 0.76 ? "critical" : pressure > 0.42 ? "rising" : "watch"
      }));
    }
  };
}

export function createStonewakeAirPocketCacheKit() {
  return {
    id: "stonewake-air-pocket-cache-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {}, count = 4 } = {}) {
      const water = finite(state.water?.level, level.bounds?.height ?? 720);
      const pressure = rescuePressure({ state, level });
      return collectRoutePlatforms(level)
        .filter((platform) => finite(platform.y) < water - 72)
        .slice(-Math.max(1, count))
        .map((platform, index) => {
          const p = platformCenter(platform);
          return {
            kind: "air-pocket-cache",
            id: `air-pocket-${platform.id ?? index}`,
            x: round(p.x),
            y: round(p.y - 72),
            capacity: Math.max(1, 4 - index),
            stability: round(clamp(1 - pressure * 0.62 - index * 0.07, 0.18, 1)),
            focusId: platform.focusId ?? null
          };
        });
    }
  };
}

export function createStonewakeRopeLiftAnchorKit() {
  return {
    id: "stonewake-rope-lift-anchor-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {} } = {}) {
      const chains = (level.objects ?? []).filter((object) => object.type === "chain");
      const player = center(state.player ?? objectByType(level, "player") ?? {});
      return chains.map((chain, index) => ({
        kind: "rope-lift-anchor",
        id: `rope-lift-${chain.id ?? index}`,
        x: round(finite(chain.x)),
        y: round(finite(chain.y)),
        h: round(finite(chain.h, 180)),
        tension: round(clamp(1 - distance(player, { x: finite(chain.x), y: finite(chain.y) }) / 760, 0.18, 1)),
        clearance: round(clamp((finite(state.water?.level, 720) - finite(chain.y)) / Math.max(1, finite(chain.h, 180)), 0, 1))
      }));
    }
  };
}

export function createStonewakeRescueBellHandoffKit() {
  return {
    id: "stonewake-rescue-bell-handoff-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {} } = {}) {
      const gate = objectByType(level, "finish-gate") ?? { x: finite(level.bounds?.width, 1280) - 120, y: 240 };
      const pressure = rescuePressure({ state, level });
      const readiness = clamp((clamp(state.door, 0, 1) + clamp(state.valve, 0, 1) + (state.plate ? 1 : 0)) / 3, 0, 1);
      return {
        kind: "rescue-bell-handoff",
        id: "stonewake-rescue-bell-handoff",
        x: round(finite(gate.x) + 28),
        y: round(finite(gate.y) - 38),
        readiness: round(readiness),
        pressure: round(pressure),
        phase: readiness >= 0.94 ? "ring" : pressure > 0.7 ? "urgent" : "prepare",
        message: readiness >= 0.94 ? "Bell path open" : "Wake plate and valve before flood crest"
      };
    }
  };
}

export function createStonewakeFloodRescueRendererHandoffKit(kits = {}) {
  return {
    id: "stonewake-flood-rescue-renderer-handoff-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe(input = {}) {
      const descriptors = {
        survivorEchoPings: (kits.survivorEchoPingKit ?? createStonewakeSurvivorEchoPingKit()).describe(input),
        chalkRouteMarks: (kits.chalkRouteMarkKit ?? createStonewakeChalkRouteMarkKit()).describe(input),
        floodlinePressureBands: (kits.floodlinePressureBandKit ?? createStonewakeFloodlinePressureBandKit()).describe(input),
        airPocketCaches: (kits.airPocketCacheKit ?? createStonewakeAirPocketCacheKit()).describe(input),
        ropeLiftAnchors: (kits.ropeLiftAnchorKit ?? createStonewakeRopeLiftAnchorKit()).describe(input),
        rescueBellHandoff: (kits.rescueBellHandoffKit ?? createStonewakeRescueBellHandoffKit()).describe(input)
      };
      const total = Object.values(descriptors).reduce((sum, value) => sum + (Array.isArray(value) ? value.length : value ? 1 : 0), 0);
      return {
        id: "stonewake-flood-rescue-renderer-handoff",
        domain: "stonewake-flood-rescue-readiness-domain",
        rendererConsumesDescriptorsOnly: true,
        descriptors,
        counts: {
          survivorEchoPings: descriptors.survivorEchoPings.length,
          chalkRouteMarks: descriptors.chalkRouteMarks.length,
          floodlinePressureBands: descriptors.floodlinePressureBands.length,
          airPocketCaches: descriptors.airPocketCaches.length,
          ropeLiftAnchors: descriptors.ropeLiftAnchors.length,
          rescueBellHandoff: descriptors.rescueBellHandoff ? 1 : 0,
          total
        },
        ownership: { excludes: FORBIDDEN_OWNERSHIP }
      };
    }
  };
}

export function createStonewakeFloodRescueReadinessDomainKit() {
  const survivorEchoPingKit = createStonewakeSurvivorEchoPingKit();
  const chalkRouteMarkKit = createStonewakeChalkRouteMarkKit();
  const floodlinePressureBandKit = createStonewakeFloodlinePressureBandKit();
  const airPocketCacheKit = createStonewakeAirPocketCacheKit();
  const ropeLiftAnchorKit = createStonewakeRopeLiftAnchorKit();
  const rescueBellHandoffKit = createStonewakeRescueBellHandoffKit();
  const rendererHandoffKit = createStonewakeFloodRescueRendererHandoffKit({ survivorEchoPingKit, chalkRouteMarkKit, floodlinePressureBandKit, airPocketCacheKit, ropeLiftAnchorKit, rescueBellHandoffKit });
  return {
    id: "stonewake-flood-rescue-readiness-domain-kit",
    domain: "stonewake-flood-rescue-readiness-domain",
    tree: STONEWAKE_RESCUE_READINESS_TREE,
    kits: STONEWAKE_RESCUE_READINESS_KITS,
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe(input = {}) {
      const pressure = rescuePressure(input);
      const rendererHandoff = rendererHandoffKit.describe(input);
      const bell = rendererHandoff.descriptors.rescueBellHandoff;
      return {
        id: "stonewake-flood-rescue-readiness",
        domain: "stonewake-flood-rescue-readiness-domain",
        tree: STONEWAKE_RESCUE_READINESS_TREE,
        pressure: round(pressure),
        missionState: bell.phase === "ring" ? "ready-for-extract" : pressure > 0.76 ? "flood-critical" : pressure > 0.42 ? "active-rescue" : "route-marking",
        survivorEchoPings: rendererHandoff.descriptors.survivorEchoPings,
        chalkRouteMarks: rendererHandoff.descriptors.chalkRouteMarks,
        floodlinePressureBands: rendererHandoff.descriptors.floodlinePressureBands,
        airPocketCaches: rendererHandoff.descriptors.airPocketCaches,
        ropeLiftAnchors: rendererHandoff.descriptors.ropeLiftAnchors,
        rescueBellHandoff: bell,
        rendererHandoff,
        ownership: { excludes: FORBIDDEN_OWNERSHIP }
      };
    }
  };
}
