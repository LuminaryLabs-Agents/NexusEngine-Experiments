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
const angleTo = (a, b) => Math.atan2((b?.y ?? 0) - (a?.y ?? 0), (b?.x ?? 0) - (a?.x ?? 0));
const idSafe = value => String(value ?? "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";

const DEFAULT_BUILD_CATALOG = [
  { id: "wall", name: "SPIKE WALL", cost: { wood: 5, obsidian: 3 }, hp: 180, range: 0, color: "#94a3b8" },
  { id: "turret", name: "SENTRY", cost: { wood: 2, crystal: 5, energy: 3 }, hp: 100, range: 310, color: "#38bdf8" },
  { id: "pylon", name: "REGEN", cost: { spore: 6, sulfur: 3, energy: 2 }, hp: 100, range: 160, color: "#10b981" }
];

function inventoryCanAfford(items = {}, cost = {}) {
  return Object.entries(cost).every(([key, needed]) => (items[key] || 0) >= needed);
}

function nearest(list, origin, limit = 6) {
  return safeArray(list)
    .map((item, index) => ({ item, index, distance: dist(origin, item) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

export function createHellscapeRealmPressureGradientKit() {
  return {
    id: "hellscape-realm-pressure-gradient-kit",
    describe(state = {}) {
      const realmId = state.realm?.id ?? "lobby";
      const enemies = safeArray(state.enemies);
      const wave = state.wave ?? {};
      const core = state.core ?? { hp: 300, maxHp: 300 };
      const player = point(state.player ?? { x: 0, y: 0 });
      const coreHealth = clamp((core.hp ?? core.maxHp ?? 1) / (core.maxHp || 1), 0, 1);
      const pressure = clamp((enemies.length / 18) + (wave.active ? 0.35 : 0) + (1 - coreHealth) * 0.45, 0, 1);
      const realmColor = realmId === "grove" ? "#10b981" : realmId === "crystal" ? "#a855f7" : realmId === "ashes" ? "#f97316" : "#ff3300";
      return {
        id: `hellscape-realm-pressure-${idSafe(realmId)}`,
        kit: "hellscape-realm-pressure-gradient-kit",
        kind: "realm-pressure-gradient",
        realmId,
        center: realmId === "lobby" ? point(core) : player,
        pressure: round(pressure),
        coreHealth: round(coreHealth),
        color: realmColor,
        rings: [0, 1, 2, 3].map(index => ({
          id: `pressure-ring-${index}`,
          radius: round(180 + index * 190 + pressure * 90),
          alpha: round(0.08 + pressure * 0.16 - index * 0.012),
          pulse: round((state.time ?? state.clock?.elapsed ?? 0) * (0.35 + index * 0.08) + index)
        }))
      };
    }
  };
}

export function createHellscapeResourceRouteWebKit() {
  return {
    id: "hellscape-resource-route-web-kit",
    describe(state = {}) {
      const player = point(state.player ?? { x: 0, y: 0 });
      const resources = nearest(state.resources, player, 6).map(({ item, index, distance }) => ({
        id: `resource-thread-${idSafe(item.kind ?? item.item)}-${index}`,
        kind: "resource-route-thread",
        item: item.item ?? item.kind ?? "material",
        resourceKind: item.kind ?? "node",
        color: item.color ?? "#ffffff",
        from: player,
        to: point(item),
        distance: round(distance),
        priority: round(1 / Math.max(1, distance)),
        harvestHealth: round((item.hp ?? item.maxHp ?? 1) / (item.maxHp || item.hp || 1))
      }));
      const drops = nearest(state.drops, player, 5).map(({ item, index, distance }) => ({
        id: `drop-thread-${idSafe(item.item)}-${index}`,
        kind: "drop-route-thread",
        item: item.item ?? "drop",
        color: item.color ?? "#ffffff",
        from: player,
        to: point(item),
        distance: round(distance),
        priority: round(2 / Math.max(1, distance))
      }));
      return {
        id: "hellscape-resource-route-web",
        kit: "hellscape-resource-route-web-kit",
        kind: "resource-route-web",
        origin: player,
        routes: [...drops, ...resources]
      };
    }
  };
}

export function createHellscapeCoreDefenseRadiusKit() {
  return {
    id: "hellscape-core-defense-radius-kit",
    describe(state = {}) {
      const core = state.core ?? { x: 0, y: -60, hp: 300, maxHp: 300 };
      const structures = safeArray(state.structures);
      const coreHealth = clamp((core.hp ?? core.maxHp ?? 1) / (core.maxHp || 1), 0, 1);
      return {
        id: "hellscape-core-defense-radius",
        kit: "hellscape-core-defense-radius-kit",
        kind: "core-defense-radius",
        core: point(core),
        coreHealth: round(coreHealth),
        coreRings: [
          { id: "core-critical-shell", radius: 92, color: coreHealth < 0.35 ? "#ff3300" : "#38bdf8", alpha: coreHealth < 0.35 ? 0.34 : 0.18 },
          { id: "core-build-shell", radius: 184, color: "#e9d5ff", alpha: 0.12 },
          { id: "core-defense-shell", radius: 310, color: "#38bdf8", alpha: 0.08 }
        ],
        coverage: structures.map((structure, index) => ({
          id: `structure-coverage-${index}-${idSafe(structure.kind)}`,
          kind: structure.kind ?? "structure",
          center: point(structure),
          radius: round(structure.range || (structure.kind === "wall" ? 54 : 120)),
          hp: round((structure.hp ?? structure.maxHp ?? 1) / (structure.maxHp || structure.hp || 1)),
          color: structure.color ?? "#94a3b8",
          alpha: structure.kind === "turret" ? 0.16 : structure.kind === "pylon" ? 0.14 : 0.1
        }))
      };
    }
  };
}

export function createHellscapePortalRiskBeaconKit() {
  return {
    id: "hellscape-portal-risk-beacon-kit",
    describe(state = {}) {
      const player = state.player ?? { x: 0, y: 0 };
      const realmId = state.realm?.id ?? "lobby";
      const portals = realmId === "lobby"
        ? safeArray(state.portals).map((portal, index) => ({
            id: `portal-beacon-${idSafe(portal.id)}-${index}`,
            kind: "portal-risk-beacon",
            realmId: portal.id,
            label: portal.label ?? String(portal.id ?? "PORTAL").toUpperCase(),
            center: point(portal),
            distance: round(dist(player, portal)),
            color: portal.color ?? "#ffffff",
            interactionRadius: 54,
            risk: portal.id === "ashes" ? 0.72 : portal.id === "crystal" ? 0.54 : 0.38
          }))
        : [{
            id: `portal-return-${idSafe(realmId)}`,
            kind: "base-return-beacon",
            realmId,
            label: "BASE",
            center: { x: 0, y: -350 },
            distance: round(dist(player, { x: 0, y: -350 })),
            color: "#00f5ff",
            interactionRadius: 68,
            risk: 0.1
          }];
      return { id: "hellscape-portal-risk-beacons", kit: "hellscape-portal-risk-beacon-kit", kind: "portal-risk-beacon-set", beacons: portals };
    }
  };
}

export function createHellscapeBuildAffordanceBandKit() {
  return {
    id: "hellscape-build-affordance-band-kit",
    describe(state = {}) {
      const buildCatalog = safeArray(state.buildCatalog).length ? state.buildCatalog : DEFAULT_BUILD_CATALOG;
      const items = state.inventory?.items ?? {};
      const selected = clamp(state.build?.selected ?? 0, 0, Math.max(0, buildCatalog.length - 1));
      const player = point(state.player ?? { x: 0, y: 0 });
      return {
        id: "hellscape-build-affordance-band",
        kit: "hellscape-build-affordance-band-kit",
        kind: "build-affordance-band",
        anchor: { x: player.x, y: player.y + 58 },
        selected,
        options: buildCatalog.map((option, index) => ({
          id: `build-affordance-${idSafe(option.id)}-${index}`,
          kind: "build-option-affordance",
          buildId: option.id,
          label: option.name ?? option.id,
          selected: index === selected,
          canAfford: inventoryCanAfford(items, option.cost),
          missing: Object.fromEntries(Object.entries(option.cost ?? {}).map(([key, needed]) => [key, Math.max(0, needed - (items[key] || 0))]).filter(([, value]) => value > 0)),
          radius: round(option.range || 54),
          color: option.color ?? "#ffffff",
          alpha: index === selected ? 0.28 : 0.12
        }))
      };
    }
  };
}

export function createHellscapeWaveThreatLaneKit() {
  return {
    id: "hellscape-wave-threat-lane-kit",
    describe(state = {}) {
      const core = state.core ?? { x: 0, y: -60 };
      const player = state.player ?? { x: 0, y: 0 };
      const structures = safeArray(state.structures);
      const targets = [core, player, ...structures];
      const lanes = nearest(state.enemies, core, 10).map(({ item: enemy, index, distance }) => {
        let target = targets[0];
        let best = Number.POSITIVE_INFINITY;
        for (const candidate of targets) {
          const d = dist(enemy, candidate);
          if (d < best) { best = d; target = candidate; }
        }
        return {
          id: `threat-lane-${index}-${idSafe(enemy.type)}`,
          kind: "wave-threat-lane",
          enemyType: enemy.type ?? "crawler",
          from: point(enemy),
          to: point(target),
          distanceToCore: round(distance),
          targetDistance: round(best),
          angle: round(angleTo(enemy, target)),
          pressure: round(clamp((enemy.hp ?? 1) / (enemy.maxHp || enemy.hp || 1), 0, 1)),
          color: enemy.type === "brute" ? "#f97316" : "#ef4444"
        };
      });
      return {
        id: "hellscape-wave-threat-lanes",
        kit: "hellscape-wave-threat-lane-kit",
        kind: "wave-threat-lane-set",
        waveActive: Boolean(state.wave?.active),
        queued: safeArray(state.wave?.queue).length,
        spawnRing: { center: { x: 0, y: 0 }, radius: 730, alpha: state.wave?.active ? 0.22 : 0.06, color: "#ff3300" },
        lanes
      };
    }
  };
}

export function createHellscapeRendererHandoffKit() {
  return {
    id: "hellscape-renderer-handoff-kit",
    describe(buckets = {}) {
      const descriptors = {
        realmPressure: buckets.realmPressure ?? null,
        resourceRoutes: buckets.resourceRoutes?.routes ?? [],
        coreDefense: buckets.coreDefense ?? null,
        portalBeacons: buckets.portalBeacons?.beacons ?? [],
        buildAffordances: buckets.buildAffordances ?? null,
        threatLanes: buckets.threatLanes ?? null
      };
      return {
        id: "hellscape-renderer-handoff",
        kit: "hellscape-renderer-handoff-kit",
        kind: "renderer-handoff",
        policy: NEXUS_RENDERER_HANDOFF_POLICY,
        descriptors,
        counts: {
          realmPressure: descriptors.realmPressure ? 1 : 0,
          resourceRoutes: descriptors.resourceRoutes.length,
          coreRings: descriptors.coreDefense?.coreRings?.length ?? 0,
          structureCoverage: descriptors.coreDefense?.coverage?.length ?? 0,
          portalBeacons: descriptors.portalBeacons.length,
          buildOptions: descriptors.buildAffordances?.options?.length ?? 0,
          threatLanes: descriptors.threatLanes?.lanes?.length ?? 0
        }
      };
    }
  };
}

export function createHellscapeSiegeFractalDomainKit() {
  const realmPressure = createHellscapeRealmPressureGradientKit();
  const resourceRoutes = createHellscapeResourceRouteWebKit();
  const coreDefense = createHellscapeCoreDefenseRadiusKit();
  const portalBeacons = createHellscapePortalRiskBeaconKit();
  const buildAffordances = createHellscapeBuildAffordanceBandKit();
  const threatLanes = createHellscapeWaveThreatLaneKit();
  const rendererHandoff = createHellscapeRendererHandoffKit();

  return {
    id: "hellscape-siege-fractal-domain-kit",
    tree: "hellscape-siege-fractal-domain\n├─ realm-pressure\n│  └─ hellscape-realm-pressure-gradient-kit\n├─ material-routing\n│  ├─ resource-route-web\n│  │  └─ hellscape-resource-route-web-kit\n│  └─ portal-risk-beacons\n│     └─ hellscape-portal-risk-beacon-kit\n├─ base-defense-readability\n│  ├─ core-defense-radius\n│  │  └─ hellscape-core-defense-radius-kit\n│  ├─ build-affordance-band\n│  │  └─ hellscape-build-affordance-band-kit\n│  └─ wave-threat-lanes\n│     └─ hellscape-wave-threat-lane-kit\n└─ renderer-handoff\n   └─ hellscape-renderer-handoff-kit\n      └─ renderer consumes descriptors only",
    describe(state = {}) {
      const buckets = {
        realmPressure: realmPressure.describe(state),
        resourceRoutes: resourceRoutes.describe(state),
        coreDefense: coreDefense.describe(state),
        portalBeacons: portalBeacons.describe(state),
        buildAffordances: buildAffordances.describe(state),
        threatLanes: threatLanes.describe(state)
      };
      return {
        id: "hellscape-siege-fractal-domain",
        kit: "hellscape-siege-fractal-domain-kit",
        kind: "visual-fractal-domain",
        rendererNeutral: true,
        tree: this.tree,
        ...buckets,
        rendererHandoff: rendererHandoff.describe(buckets)
      };
    }
  };
}
