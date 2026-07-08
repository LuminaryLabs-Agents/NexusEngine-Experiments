const TAU = Math.PI * 2;

const NEXUS_RENDERER_HANDOFF_POLICY = Object.freeze({
  rendererConsumesDescriptorsOnly: true,
  forbiddenOwnership: ["renderer", "DOM", "browser-input", "Three.js", "WebGL", "audio", "asset-loading", "frame-loop"]
});

const DEFAULT_BUILD_CATALOG = [
  { id: "wall", name: "SPIKE WALL", cost: { wood: 5, obsidian: 3 }, hp: 180, range: 0, color: "#94a3b8" },
  { id: "turret", name: "SENTRY", cost: { wood: 2, crystal: 5, energy: 3 }, hp: 100, range: 310, color: "#38bdf8" },
  { id: "pylon", name: "REGEN", cost: { spore: 6, sulfur: 3, energy: 2 }, hp: 100, range: 160, color: "#10b981" }
];

const BUILD_ROLE_SCORE = Object.freeze({ wall: 0.82, turret: 0.96, pylon: 0.72 });

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const round = (value, places = 3) => Number((Number(value) || 0).toFixed(places));
const safeArray = value => Array.isArray(value) ? value : [];
const point = value => ({ x: round(value?.x ?? 0), y: round(value?.y ?? 0) });
const dist = (a, b) => Math.hypot((a?.x ?? 0) - (b?.x ?? 0), (a?.y ?? 0) - (b?.y ?? 0));
const angleTo = (a, b) => Math.atan2((b?.y ?? 0) - (a?.y ?? 0), (b?.x ?? 0) - (a?.x ?? 0));
const idSafe = value => String(value ?? "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";

function catalog(state = {}) {
  return safeArray(state.buildCatalog).length ? safeArray(state.buildCatalog) : DEFAULT_BUILD_CATALOG;
}

function nearest(list, origin, limit = 6) {
  return safeArray(list)
    .map((item, index) => ({ item, index, distance: dist(origin, item) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

function inventoryItems(state = {}) {
  return state.inventory?.items ?? {};
}

function canAfford(items = {}, cost = {}) {
  return Object.entries(cost).every(([key, needed]) => (Number(items[key]) || 0) >= Number(needed));
}

function missingCost(items = {}, cost = {}) {
  return Object.fromEntries(
    Object.entries(cost)
      .map(([key, needed]) => [key, Math.max(0, Number(needed) - (Number(items[key]) || 0))])
      .filter(([, value]) => value > 0)
  );
}

function costTotal(cost = {}) {
  return Object.values(cost).reduce((sum, value) => sum + (Number(value) || 0), 0);
}

function healthRatio(entity = {}, fallback = 1) {
  return clamp((entity.hp ?? entity.maxHp ?? fallback) / (entity.maxHp || entity.hp || fallback || 1), 0, 1);
}

function wavePressure(state = {}) {
  return clamp((safeArray(state.enemies).length / 16) + (safeArray(state.wave?.queue).length / 12) + (state.wave?.active ? 0.32 : 0), 0, 1);
}

function corePoint(state = {}) {
  return point(state.core ?? { x: 0, y: -60 });
}

function realmTarget(state = {}) {
  if ((state.realm?.id ?? "lobby") === "lobby") {
    const portal = nearest(state.portals, state.player ?? { x: 0, y: 0 }, 1)[0]?.item;
    return portal ?? state.core ?? { x: 0, y: -60, id: "core", label: "CORE", color: "#38bdf8" };
  }
  return { x: 0, y: -350, id: "base", label: "BASE", color: "#00f5ff" };
}

export function createHellscapeBarricadeFootprintGridKit() {
  return {
    id: "hellscape-barricade-footprint-grid-kit",
    describe(state = {}) {
      const core = corePoint(state);
      const player = point(state.player ?? core);
      const items = inventoryItems(state);
      const wall = catalog(state).find(option => option.id === "wall") ?? DEFAULT_BUILD_CATALOG[0];
      const pressure = wavePressure(state);
      const enemies = safeArray(state.enemies);
      const center = (state.realm?.id ?? "lobby") === "lobby" ? core : player;
      const cells = Array.from({ length: 8 }, (_, index) => {
        const angle = -Math.PI / 2 + index * TAU / 8;
        const radius = 130 + (index % 2) * 54 + pressure * 36;
        const cell = { x: round(center.x + Math.cos(angle) * radius), y: round(center.y + Math.sin(angle) * radius) };
        const nearbyEnemies = enemies.filter(enemy => dist(enemy, cell) < 230).length;
        const existingCover = safeArray(state.structures).filter(structure => dist(structure, cell) < 120).length;
        const affordable = canAfford(items, wall.cost);
        const score = clamp(0.24 + pressure * 0.35 + nearbyEnemies * 0.11 - existingCover * 0.1 + (affordable ? 0.18 : -0.08), 0.05, 1);
        return {
          id: `barricade-footprint-${index}`,
          kind: "barricade-footprint-cell",
          buildId: wall.id,
          center: cell,
          radius: round(34 + score * 30),
          angle: round(angle),
          score: round(score),
          viable: affordable && existingCover < 2,
          nearbyEnemies,
          existingCover,
          color: affordable ? "#94a3b8" : "#64748b"
        };
      });
      return {
        id: "hellscape-barricade-footprint-grid",
        kit: "hellscape-barricade-footprint-grid-kit",
        kind: "barricade-footprint-grid",
        anchor: center,
        affordable: canAfford(items, wall.cost),
        cells
      };
    }
  };
}

export function createHellscapeTurretCrossfireLatticeKit() {
  return {
    id: "hellscape-turret-crossfire-lattice-kit",
    describe(state = {}) {
      const core = corePoint(state);
      const structures = safeArray(state.structures);
      const enemies = safeArray(state.enemies);
      const turrets = structures.filter(structure => structure.kind === "turret" || Number(structure.range) > 220);
      const fallback = turrets.length ? [] : [{ x: core.x - 120, y: core.y + 50, kind: "ghost-turret", range: 270, color: "#38bdf8" }];
      const lattice = [...turrets, ...fallback].flatMap((turret, turretIndex) => {
        const range = Number(turret.range) || 270;
        const targets = nearest(enemies.length ? enemies : [{ ...core, type: "hold" }], turret, Math.min(3, Math.max(1, enemies.length || 1)));
        return targets.map(({ item: enemy, index, distance }) => {
          const coverage = clamp(1 - distance / Math.max(1, range), 0, 1);
          return {
            id: `turret-crossfire-${turretIndex}-${index}-${idSafe(enemy.type)}`,
            kind: "turret-crossfire-lattice-line",
            turretKind: turret.kind ?? "turret",
            targetType: enemy.type ?? "hold",
            from: point(turret),
            to: point(enemy),
            range: round(range),
            distance: round(distance),
            coverage: round(coverage),
            hot: coverage > 0.28,
            color: turret.color ?? "#38bdf8"
          };
        });
      });
      return {
        id: "hellscape-turret-crossfire-lattice",
        kit: "hellscape-turret-crossfire-lattice-kit",
        kind: "turret-crossfire-lattice",
        turretCount: turrets.length,
        lattice
      };
    }
  };
}

export function createHellscapeResourceBurnForecastKit() {
  return {
    id: "hellscape-resource-burn-forecast-kit",
    describe(state = {}) {
      const items = inventoryItems(state);
      const pressure = wavePressure(state);
      const selected = clamp(state.build?.selected ?? 0, 0, Math.max(0, catalog(state).length - 1));
      const forecasts = catalog(state).map((option, index) => {
        const missing = missingCost(items, option.cost);
        const total = Math.max(1, costTotal(option.cost));
        const missingTotal = costTotal(missing);
        const burn = clamp((total - missingTotal) / total - pressure * 0.18 + (index === selected ? 0.16 : 0), 0, 1);
        return {
          id: `resource-burn-${index}-${idSafe(option.id)}`,
          kind: "resource-burn-forecast",
          buildId: option.id,
          label: option.name ?? String(option.id ?? "BUILD").toUpperCase(),
          selected: index === selected,
          canAfford: missingTotal === 0,
          missing,
          burn: round(burn),
          pressure: round(pressure),
          anchor: { x: round((state.player?.x ?? 0) - 82 + index * 82), y: round((state.player?.y ?? 0) + 118) },
          radius: round(16 + burn * 24),
          color: option.color ?? "#ffffff"
        };
      });
      return {
        id: "hellscape-resource-burn-forecast",
        kit: "hellscape-resource-burn-forecast-kit",
        kind: "resource-burn-forecast-set",
        forecasts
      };
    }
  };
}

export function createHellscapeBuildPriorityQueueKit() {
  return {
    id: "hellscape-build-priority-queue-kit",
    describe(state = {}) {
      const items = inventoryItems(state);
      const pressure = wavePressure(state);
      const structures = safeArray(state.structures);
      const enemies = safeArray(state.enemies);
      const pylonCount = structures.filter(structure => structure.kind === "pylon").length;
      const wallCount = structures.filter(structure => structure.kind === "wall").length;
      const queue = catalog(state).map((option, index) => {
        const missing = missingCost(items, option.cost);
        const affordable = canAfford(items, option.cost);
        const role = BUILD_ROLE_SCORE[option.id] ?? 0.6;
        const scarcityPenalty = costTotal(missing) * 0.045;
        const need = option.id === "wall" ? clamp(enemies.length / 12 - wallCount * 0.08, 0, 1)
          : option.id === "pylon" ? clamp((1 - healthRatio(state.player, 1)) + (pylonCount ? 0.12 : 0.36), 0, 1)
          : clamp(pressure + enemies.length / 18, 0, 1);
        const priority = clamp(role * 0.32 + need * 0.46 + (affordable ? 0.18 : -scarcityPenalty), 0.04, 1);
        return {
          id: `build-priority-${index}-${idSafe(option.id)}`,
          kind: "build-priority-card",
          rank: 0,
          buildId: option.id,
          label: option.name ?? String(option.id ?? "BUILD").toUpperCase(),
          affordable,
          missing,
          priority: round(priority),
          anchor: { x: round((state.player?.x ?? 0) + 104), y: round((state.player?.y ?? 0) - 88 + index * 42) },
          radius: round(12 + priority * 22),
          color: option.color ?? "#ffffff"
        };
      }).sort((a, b) => b.priority - a.priority).map((item, index) => ({ ...item, rank: index + 1 }));
      return {
        id: "hellscape-build-priority-queue",
        kit: "hellscape-build-priority-queue-kit",
        kind: "build-priority-queue",
        pressure: round(pressure),
        queue
      };
    }
  };
}

export function createHellscapeCoreBreachCountdownKit() {
  return {
    id: "hellscape-core-breach-countdown-kit",
    describe(state = {}) {
      const core = state.core ?? { x: 0, y: -60, hp: 300, maxHp: 300 };
      const coreHealth = healthRatio(core, 1);
      const enemies = nearest(state.enemies, core, 5);
      const countdowns = enemies.length ? enemies.map(({ item: enemy, index, distance }) => {
        const speed = enemy.type === "brute" ? 44 : 72;
        const seconds = clamp(distance / speed, 0, 99);
        const severity = clamp(1 - seconds / 14 + (1 - coreHealth) * 0.42 + (enemy.type === "brute" ? 0.18 : 0), 0.05, 1);
        return {
          id: `core-breach-countdown-${index}-${idSafe(enemy.type)}`,
          kind: "core-breach-countdown",
          from: point(enemy),
          to: point(core),
          seconds: round(seconds, 2),
          severity: round(severity),
          enemyType: enemy.type ?? "crawler",
          coreHealth: round(coreHealth),
          color: severity > 0.72 ? "#ff3300" : enemy.type === "brute" ? "#f97316" : "#ef4444"
        };
      }) : [{
        id: "core-breach-countdown-quiet",
        kind: "core-breach-countdown",
        from: point(core),
        to: point(core),
        seconds: 99,
        severity: round((1 - coreHealth) * 0.35),
        enemyType: "none",
        coreHealth: round(coreHealth),
        color: "#38bdf8"
      }];
      return {
        id: "hellscape-core-breach-countdowns",
        kit: "hellscape-core-breach-countdown-kit",
        kind: "core-breach-countdown-set",
        core: point(core),
        countdowns
      };
    }
  };
}

export function createHellscapeExtractionRiskRibbonKit() {
  return {
    id: "hellscape-extraction-risk-ribbon-kit",
    describe(state = {}) {
      const player = point(state.player ?? { x: 0, y: 0 });
      const pressure = wavePressure(state);
      const destination = realmTarget(state);
      const portals = (state.realm?.id ?? "lobby") === "lobby" ? safeArray(state.portals) : [destination];
      const ribbons = nearest(portals.length ? portals : [destination], player, 4).map(({ item, index, distance }) => {
        const enemyNearRoute = safeArray(state.enemies).filter(enemy => dist(enemy, item) < 260 || dist(enemy, player) < 220).length;
        const risk = clamp(distance / 900 + pressure * 0.34 + enemyNearRoute * 0.07, 0.05, 1);
        return {
          id: `extraction-risk-ribbon-${index}-${idSafe(item.id ?? item.label)}`,
          kind: "extraction-risk-ribbon",
          label: item.label ?? String(item.id ?? "EXIT").toUpperCase(),
          from: player,
          to: point(item),
          distance: round(distance),
          risk: round(risk),
          enemyNearRoute,
          pulse: round(((state.time ?? state.clock?.elapsed ?? 0) * (0.45 + risk * 0.9)) % TAU),
          color: risk > 0.68 ? "#ff3300" : item.color ?? "#00f5ff"
        };
      });
      return {
        id: "hellscape-extraction-risk-ribbons",
        kit: "hellscape-extraction-risk-ribbon-kit",
        kind: "extraction-risk-ribbon-set",
        pressure: round(pressure),
        ribbons
      };
    }
  };
}

export function createHellscapeSiegecraftRendererHandoffKit() {
  return {
    id: "hellscape-siegecraft-renderer-handoff-kit",
    describe(buckets = {}) {
      const descriptors = {
        barricadeFootprints: buckets.barricadeFootprints?.cells ?? [],
        turretCrossfire: buckets.turretCrossfire?.lattice ?? [],
        resourceBurnForecasts: buckets.resourceBurnForecasts?.forecasts ?? [],
        buildPriorityQueue: buckets.buildPriorityQueue?.queue ?? [],
        coreBreachCountdowns: buckets.coreBreachCountdowns?.countdowns ?? [],
        extractionRiskRibbons: buckets.extractionRiskRibbons?.ribbons ?? []
      };
      return {
        id: "hellscape-siegecraft-renderer-handoff",
        kit: "hellscape-siegecraft-renderer-handoff-kit",
        kind: "renderer-handoff",
        policy: NEXUS_RENDERER_HANDOFF_POLICY,
        descriptors,
        counts: {
          barricadeFootprints: descriptors.barricadeFootprints.length,
          turretCrossfire: descriptors.turretCrossfire.length,
          resourceBurnForecasts: descriptors.resourceBurnForecasts.length,
          buildPriorityQueue: descriptors.buildPriorityQueue.length,
          coreBreachCountdowns: descriptors.coreBreachCountdowns.length,
          extractionRiskRibbons: descriptors.extractionRiskRibbons.length
        }
      };
    }
  };
}

export function createHellscapeSiegecraftReadinessDomainKit() {
  const barricadeFootprints = createHellscapeBarricadeFootprintGridKit();
  const turretCrossfire = createHellscapeTurretCrossfireLatticeKit();
  const resourceBurnForecasts = createHellscapeResourceBurnForecastKit();
  const buildPriorityQueue = createHellscapeBuildPriorityQueueKit();
  const coreBreachCountdowns = createHellscapeCoreBreachCountdownKit();
  const extractionRiskRibbons = createHellscapeExtractionRiskRibbonKit();
  const rendererHandoff = createHellscapeSiegecraftRendererHandoffKit();

  return {
    id: "hellscape-siegecraft-readiness-domain-kit",
    tree: "hellscape-siegecraft-readiness-domain\n├─ build-footprint-domain\n│  ├─ barricade-footprint-domain\n│  │  └─ hellscape-barricade-footprint-grid-kit\n│  └─ build-priority-domain\n│     └─ hellscape-build-priority-queue-kit\n├─ defensive-coverage-domain\n│  ├─ turret-crossfire-domain\n│  │  └─ hellscape-turret-crossfire-lattice-kit\n│  └─ core-breach-domain\n│     └─ hellscape-core-breach-countdown-kit\n├─ economy-exit-domain\n│  ├─ resource-burn-domain\n│  │  └─ hellscape-resource-burn-forecast-kit\n│  └─ extraction-risk-domain\n│     └─ hellscape-extraction-risk-ribbon-kit\n└─ renderer-handoff\n   └─ hellscape-siegecraft-renderer-handoff-kit\n      └─ renderer consumes descriptors only",
    describe(state = {}) {
      const buckets = {
        barricadeFootprints: barricadeFootprints.describe(state),
        turretCrossfire: turretCrossfire.describe(state),
        resourceBurnForecasts: resourceBurnForecasts.describe(state),
        buildPriorityQueue: buildPriorityQueue.describe(state),
        coreBreachCountdowns: coreBreachCountdowns.describe(state),
        extractionRiskRibbons: extractionRiskRibbons.describe(state)
      };
      return {
        id: "hellscape-siegecraft-readiness-domain",
        kit: "hellscape-siegecraft-readiness-domain-kit",
        kind: "siegecraft-readiness-domain",
        rendererNeutral: true,
        tree: this.tree,
        ...buckets,
        rendererHandoff: rendererHandoff.describe(buckets)
      };
    }
  };
}
