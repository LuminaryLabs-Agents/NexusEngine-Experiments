const TAU = Math.PI * 2;

const NEXUS_RENDERER_HANDOFF_POLICY = Object.freeze({
  rendererConsumesDescriptorsOnly: true,
  forbiddenOwnership: ["renderer", "DOM", "browser-input", "Three.js", "WebGL", "audio", "asset-loading", "frame-loop"]
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const round = (value, places = 3) => Number((Number(value) || 0).toFixed(places));
const safeArray = value => Array.isArray(value) ? value : [];
const point = value => ({ x: round(value?.x ?? 0), y: round(value?.y ?? 0) });
const dist = (a, b) => Math.hypot((a?.x ?? 0) - (b?.x ?? 0), (a?.y ?? 0) - (b?.y ?? 0));
const idSafe = value => String(value ?? "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";
const angleBetween = (a, b) => Math.atan2((b?.y ?? 0) - (a?.y ?? 0), (b?.x ?? 0) - (a?.x ?? 0));

function healthRatio(entity = {}, fallback = 1) {
  return clamp((entity.hp ?? entity.maxHp ?? fallback) / (entity.maxHp || entity.hp || fallback || 1), 0, 1);
}

function wavePressure(state = {}) {
  return clamp((safeArray(state.enemies).length / 18) + (safeArray(state.wave?.queue).length / 10) + (state.wave?.active ? 0.24 : 0), 0, 1);
}

function playerPoint(state = {}) {
  return point(state.player ?? { x: 0, y: 0 });
}

function corePoint(state = {}) {
  return point(state.core ?? { x: 0, y: -60 });
}

function inventoryItems(state = {}) {
  return state.inventory?.items ?? {};
}

function portalList(state = {}) {
  const portals = safeArray(state.portals);
  if (portals.length) return portals;
  return [
    { id: "grove", label: "GROVE", x: -350, y: -150, color: "#10b981" },
    { id: "crystal", label: "CRYSTAL", x: 0, y: -320, color: "#a855f7" },
    { id: "ashes", label: "ASHES", x: 350, y: -150, color: "#f97316" }
  ];
}

function radialPoint(center, index, total, radius, phase = 0) {
  const angle = phase + index * TAU / Math.max(1, total);
  return {
    x: round((center?.x ?? 0) + Math.cos(angle) * radius),
    y: round((center?.y ?? 0) + Math.sin(angle) * radius)
  };
}

function nearest(list, origin, limit = 6) {
  return safeArray(list)
    .map((item, index) => ({ item, index, distance: dist(origin, item) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

export function createHellscapeSurvivorCaravanColumnKit() {
  return {
    id: "hellscape-survivor-caravan-column-kit",
    describe(state = {}) {
      const player = playerPoint(state);
      const core = corePoint(state);
      const pressure = wavePressure(state);
      const portals = portalList(state);
      const columns = portals.map((portal, index) => {
        const start = point(portal);
        const midpoint = radialPoint(core, index, portals.length, 150 + index * 24, -Math.PI / 2);
        const enemyNearRoute = safeArray(state.enemies).filter(enemy => Math.min(dist(enemy, start), dist(enemy, midpoint), dist(enemy, core)) < 230).length;
        const panic = clamp(pressure * 0.42 + enemyNearRoute * 0.1 + (1 - healthRatio(state.core, 1)) * 0.22, 0.03, 1);
        const capacity = Math.max(1, 7 - Math.round(panic * 4));
        return {
          id: `survivor-caravan-${index}-${idSafe(portal.id ?? portal.label)}`,
          kind: "survivor-caravan-column",
          label: `${portal.label ?? "GATE"} CARAVAN`,
          from: start,
          via: midpoint,
          to: core,
          escort: player,
          survivors: capacity,
          panic: round(panic),
          radius: round(18 + panic * 42),
          blocked: enemyNearRoute >= 4,
          angle: round(angleBetween(start, core)),
          color: portal.color ?? "#facc15"
        };
      });
      return {
        id: "hellscape-survivor-caravan-columns",
        kit: "hellscape-survivor-caravan-column-kit",
        kind: "survivor-caravan-column-set",
        pressure: round(pressure),
        columns
      };
    }
  };
}

export function createHellscapeSoulLanternChainKit() {
  return {
    id: "hellscape-soul-lantern-chain-kit",
    describe(state = {}) {
      const player = playerPoint(state);
      const core = corePoint(state);
      const pressure = wavePressure(state);
      const time = Number(state.time ?? state.clock?.elapsed ?? 0) || 0;
      const anchors = [player, ...portalList(state).map(point), core];
      const chains = anchors.slice(0, 4).map((anchor, index) => {
        const target = index === 0 ? core : player;
        const strength = clamp(1 - Math.min(dist(anchor, target) / 1000, 1) * 0.48 - pressure * 0.22 + healthRatio(state.player, 1) * 0.18, 0.05, 1);
        const lanterns = Array.from({ length: 4 }, (_, step) => {
          const t = (step + 1) / 5;
          return {
            x: round(anchor.x + (target.x - anchor.x) * t + Math.sin(time + step + index) * 7),
            y: round(anchor.y + (target.y - anchor.y) * t + Math.cos(time * 0.8 + step) * 7)
          };
        });
        return {
          id: `soul-lantern-chain-${index}`,
          kind: "soul-lantern-chain",
          from: anchor,
          to: target,
          lanterns,
          strength: round(strength),
          pulse: round((time * (0.55 + strength)) % TAU),
          color: strength > 0.6 ? "#facc15" : "#f97316"
        };
      });
      return {
        id: "hellscape-soul-lantern-chains",
        kit: "hellscape-soul-lantern-chain-kit",
        kind: "soul-lantern-chain-set",
        chains
      };
    }
  };
}

export function createHellscapeHellgateBreachMapKit() {
  return {
    id: "hellscape-hellgate-breach-map-kit",
    describe(state = {}) {
      const core = corePoint(state);
      const pressure = wavePressure(state);
      const enemies = safeArray(state.enemies);
      const breaches = portalList(state).map((portal, index) => {
        const center = point(portal);
        const enemyCount = enemies.filter(enemy => dist(enemy, center) < 280).length;
        const severity = clamp(pressure * 0.36 + enemyCount * 0.12 + (1 - Math.min(dist(center, core) / 700, 1)) * 0.18, 0.04, 1);
        return {
          id: `hellgate-breach-${index}-${idSafe(portal.id ?? portal.label)}`,
          kind: "hellgate-breach",
          center,
          target: core,
          severity: round(severity),
          enemyCount,
          radius: round(44 + severity * 88),
          sealCost: Math.max(1, Math.ceil(severity * 6)),
          color: severity > 0.68 ? "#ef4444" : portal.color ?? "#f97316"
        };
      });
      return {
        id: "hellscape-hellgate-breaches",
        kit: "hellscape-hellgate-breach-map-kit",
        kind: "hellgate-breach-set",
        breaches
      };
    }
  };
}

export function createHellscapeAshShelterPocketKit() {
  return {
    id: "hellscape-ash-shelter-pocket-kit",
    describe(state = {}) {
      const core = corePoint(state);
      const player = playerPoint(state);
      const pressure = wavePressure(state);
      const structures = safeArray(state.structures);
      const anchors = structures.length
        ? structures.slice(0, 5)
        : [
          { kind: "core", ...core, hp: state.core?.hp ?? 1, maxHp: state.core?.maxHp ?? 1, color: "#38bdf8" },
          { kind: "north", x: core.x, y: core.y - 150, hp: 1, maxHp: 1, color: "#10b981" },
          { kind: "east", x: core.x + 170, y: core.y + 30, hp: 1, maxHp: 1, color: "#facc15" }
        ];
      const pockets = anchors.map((anchor, index) => {
        const center = point(anchor);
        const shelter = clamp(healthRatio(anchor, 1) * 0.48 + (1 - pressure) * 0.28 + (1 - Math.min(dist(center, player) / 720, 1)) * 0.24, 0.04, 1);
        return {
          id: `ash-shelter-pocket-${index}-${idSafe(anchor.kind)}`,
          kind: "ash-shelter-pocket",
          label: String(anchor.kind ?? "SHELTER").toUpperCase(),
          center,
          radius: round(52 + shelter * 80),
          shelter: round(shelter),
          capacity: Math.max(1, Math.round(2 + shelter * 8)),
          compromised: shelter < 0.34,
          color: anchor.color ?? (shelter > 0.55 ? "#10b981" : "#f97316")
        };
      });
      return {
        id: "hellscape-ash-shelter-pockets",
        kit: "hellscape-ash-shelter-pocket-kit",
        kind: "ash-shelter-pocket-set",
        pockets
      };
    }
  };
}

export function createHellscapeBrimstoneRationCacheKit() {
  return {
    id: "hellscape-brimstone-ration-cache-kit",
    describe(state = {}) {
      const player = playerPoint(state);
      const items = inventoryItems(state);
      const sources = [
        ...safeArray(state.resources).map(resource => ({ ...resource, rationKind: resource.item ?? resource.kind ?? "resource" })),
        ...safeArray(state.drops).map(drop => ({ ...drop, rationKind: drop.item ?? "drop", hp: 1, maxHp: 1 }))
      ];
      const fallback = [
        { x: -180, y: 110, rationKind: "wood", color: "#22543d", hp: Number(items.wood) || 1, maxHp: 8 },
        { x: 180, y: 90, rationKind: "crystal", color: "#a855f7", hp: Number(items.crystal) || 1, maxHp: 8 },
        { x: 0, y: -210, rationKind: "energy", color: "#38bdf8", hp: Number(items.energy) || 1, maxHp: 8 }
      ];
      const candidates = sources.length ? sources : fallback;
      const caches = nearest(candidates, player, 5).map(({ item, index, distance }) => {
        const value = clamp(healthRatio(item, 1) * 0.4 + (1 - Math.min(distance / 850, 1)) * 0.34 + (Number(items[item.rationKind]) || 0) / 20, 0.05, 1);
        return {
          id: `brimstone-ration-cache-${index}-${idSafe(item.rationKind)}`,
          kind: "brimstone-ration-cache",
          label: String(item.rationKind ?? "RATION").toUpperCase(),
          center: point(item),
          from: player,
          value: round(value),
          distance: round(distance),
          radius: round(14 + value * 28),
          urgent: value > 0.62,
          color: item.color ?? "#facc15"
        };
      });
      return {
        id: "hellscape-brimstone-ration-caches",
        kit: "hellscape-brimstone-ration-cache-kit",
        kind: "brimstone-ration-cache-set",
        caches
      };
    }
  };
}

export function createHellscapeDawnExtractionCircleKit() {
  return {
    id: "hellscape-dawn-extraction-circle-kit",
    describe(state = {}) {
      const player = playerPoint(state);
      const core = corePoint(state);
      const items = inventoryItems(state);
      const pressure = wavePressure(state);
      const requirements = [
        { id: "ward", label: "WARD CIRCLE", have: healthRatio(state.core, 1), need: 0.72, color: "#38bdf8" },
        { id: "ration", label: "RATION CIRCLE", have: clamp(((Number(items.wood) || 0) + (Number(items.energy) || 0)) / 16, 0, 1), need: 0.58, color: "#facc15" },
        { id: "escort", label: "ESCORT CIRCLE", have: clamp(1 - pressure, 0, 1), need: 0.5, color: "#10b981" }
      ];
      const circles = requirements.map((requirement, index) => {
        const readiness = clamp(requirement.have / requirement.need - pressure * 0.08, 0, 1);
        const anchor = radialPoint(core, index, requirements.length, 126 + readiness * 34, -Math.PI / 2);
        return {
          id: `dawn-extraction-circle-${index}-${requirement.id}`,
          kind: "dawn-extraction-circle",
          label: requirement.label,
          anchor,
          from: player,
          readiness: round(readiness),
          open: readiness >= 0.8,
          radius: round(24 + readiness * 38),
          color: requirement.color
        };
      });
      return {
        id: "hellscape-dawn-extraction-circles",
        kit: "hellscape-dawn-extraction-circle-kit",
        kind: "dawn-extraction-circle-set",
        circles
      };
    }
  };
}

export function createHellscapeAshCaravanRendererHandoffKit() {
  return {
    id: "hellscape-ash-caravan-renderer-handoff-kit",
    describe(buckets = {}) {
      const descriptors = {
        survivorCaravanColumns: buckets.survivorCaravanColumns?.columns ?? [],
        soulLanternChains: buckets.soulLanternChains?.chains ?? [],
        hellgateBreaches: buckets.hellgateBreaches?.breaches ?? [],
        ashShelterPockets: buckets.ashShelterPockets?.pockets ?? [],
        brimstoneRationCaches: buckets.brimstoneRationCaches?.caches ?? [],
        dawnExtractionCircles: buckets.dawnExtractionCircles?.circles ?? []
      };
      return {
        id: "hellscape-ash-caravan-renderer-handoff",
        kit: "hellscape-ash-caravan-renderer-handoff-kit",
        kind: "renderer-handoff",
        policy: NEXUS_RENDERER_HANDOFF_POLICY,
        descriptors,
        counts: {
          survivorCaravanColumns: descriptors.survivorCaravanColumns.length,
          soulLanternChains: descriptors.soulLanternChains.length,
          hellgateBreaches: descriptors.hellgateBreaches.length,
          ashShelterPockets: descriptors.ashShelterPockets.length,
          brimstoneRationCaches: descriptors.brimstoneRationCaches.length,
          dawnExtractionCircles: descriptors.dawnExtractionCircles.length
        }
      };
    }
  };
}

export function createHellscapeAshCaravanReadinessDomainKit() {
  const survivorCaravanColumns = createHellscapeSurvivorCaravanColumnKit();
  const soulLanternChains = createHellscapeSoulLanternChainKit();
  const hellgateBreaches = createHellscapeHellgateBreachMapKit();
  const ashShelterPockets = createHellscapeAshShelterPocketKit();
  const brimstoneRationCaches = createHellscapeBrimstoneRationCacheKit();
  const dawnExtractionCircles = createHellscapeDawnExtractionCircleKit();
  const rendererHandoff = createHellscapeAshCaravanRendererHandoffKit();

  return {
    id: "hellscape-ash-caravan-readiness-domain-kit",
    tree: "hellscape-ash-caravan-readiness-domain\n├─ survivor-route-domain\n│  ├─ survivor-caravan-domain\n│  │  └─ hellscape-survivor-caravan-column-kit\n│  └─ soul-lantern-domain\n│     └─ hellscape-soul-lantern-chain-kit\n├─ hazard-relief-domain\n│  ├─ hellgate-breach-domain\n│  │  └─ hellscape-hellgate-breach-map-kit\n│  └─ ash-shelter-domain\n│     └─ hellscape-ash-shelter-pocket-kit\n├─ extraction-provision-domain\n│  ├─ brimstone-ration-domain\n│  │  └─ hellscape-brimstone-ration-cache-kit\n│  └─ dawn-extraction-domain\n│     └─ hellscape-dawn-extraction-circle-kit\n└─ renderer-handoff\n   └─ hellscape-ash-caravan-renderer-handoff-kit\n      └─ renderer consumes descriptors only",
    describe(state = {}) {
      const buckets = {
        survivorCaravanColumns: survivorCaravanColumns.describe(state),
        soulLanternChains: soulLanternChains.describe(state),
        hellgateBreaches: hellgateBreaches.describe(state),
        ashShelterPockets: ashShelterPockets.describe(state),
        brimstoneRationCaches: brimstoneRationCaches.describe(state),
        dawnExtractionCircles: dawnExtractionCircles.describe(state)
      };
      return {
        id: "hellscape-ash-caravan-readiness-domain",
        kit: "hellscape-ash-caravan-readiness-domain-kit",
        kind: "ash-caravan-readiness-domain",
        rendererNeutral: true,
        tree: this.tree,
        ...buckets,
        rendererHandoff: rendererHandoff.describe(buckets)
      };
    }
  };
}
