const TAU = Math.PI * 2;

const NEXUS_RENDERER_HANDOFF_POLICY = Object.freeze({
  rendererConsumesDescriptorsOnly: true,
  forbiddenOwnership: ["renderer", "DOM", "browser-input", "Three.js", "WebGL", "audio", "asset-loading", "frame-loop", "physics"]
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
  return clamp((safeArray(state.enemies).length / 22) + (safeArray(state.wave?.queue).length / 12) + (state.wave?.active ? 0.22 : 0), 0, 1);
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

function structureAnchors(state = {}) {
  const structures = safeArray(state.structures);
  if (structures.length) return structures;
  const core = corePoint(state);
  return [
    { kind: "core-forge", ...core, hp: state.core?.hp ?? 1, maxHp: state.core?.maxHp ?? 1, color: "#38bdf8" },
    { kind: "west-bellows", x: core.x - 126, y: core.y + 74, hp: 1, maxHp: 1, color: "#f97316" },
    { kind: "east-crucible", x: core.x + 126, y: core.y + 74, hp: 1, maxHp: 1, color: "#a855f7" }
  ];
}

export function createHellscapeEmberBellowsPressureKit() {
  return {
    id: "hellscape-ember-bellows-pressure-kit",
    describe(state = {}) {
      const player = playerPoint(state);
      const pressure = wavePressure(state);
      const enemies = safeArray(state.enemies);
      const bellows = nearest(structureAnchors(state), player, 4).map(({ item, index, distance }) => {
        const center = point(item);
        const enemyHeat = enemies.filter(enemy => dist(enemy, center) < 260).length;
        const stability = clamp(healthRatio(item, 1) * 0.5 + (1 - pressure) * 0.25 + (1 - Math.min(distance / 760, 1)) * 0.25 - enemyHeat * 0.04, 0.03, 1);
        return {
          id: `ember-bellows-${index}-${idSafe(item.kind)}`,
          kind: "ember-bellows-pressure",
          label: String(item.kind ?? "BELLOWS").toUpperCase(),
          center,
          from: player,
          pressure: round(clamp(1 - stability + pressure * 0.2, 0, 1)),
          stability: round(stability),
          enemyHeat,
          radius: round(24 + (1 - stability) * 58),
          color: stability > 0.58 ? "#facc15" : "#ef4444"
        };
      });
      return {
        id: "hellscape-ember-bellows-pressures",
        kit: "hellscape-ember-bellows-pressure-kit",
        kind: "ember-bellows-pressure-set",
        bellows
      };
    }
  };
}

export function createHellscapeCrucibleCoolingLoopKit() {
  return {
    id: "hellscape-crucible-cooling-loop-kit",
    describe(state = {}) {
      const player = playerPoint(state);
      const core = corePoint(state);
      const pressure = wavePressure(state);
      const sources = safeArray(state.resources).length ? safeArray(state.resources) : [
        { x: -210, y: 70, kind: "waterglass", item: "crystal", color: "#38bdf8", hp: 1, maxHp: 1 },
        { x: 210, y: 80, kind: "salt-ash", item: "obsidian", color: "#94a3b8", hp: 1, maxHp: 1 },
        { x: 0, y: -250, kind: "ether-reed", item: "energy", color: "#a855f7", hp: 1, maxHp: 1 }
      ];
      const loops = nearest(sources, core, 5).map(({ item, index, distance }) => {
        const start = point(item);
        const midpoint = {
          x: round((start.x + core.x) / 2 + Math.sin(index + pressure) * 26),
          y: round((start.y + core.y) / 2 + Math.cos(index + pressure) * 26)
        };
        const coolant = clamp(healthRatio(item, 1) * 0.46 + (1 - Math.min(distance / 780, 1)) * 0.28 + (1 - pressure) * 0.26, 0.04, 1);
        return {
          id: `crucible-cooling-loop-${index}-${idSafe(item.item ?? item.kind)}`,
          kind: "crucible-cooling-loop",
          label: String(item.item ?? item.kind ?? "COOLANT").toUpperCase(),
          from: start,
          via: midpoint,
          to: core,
          escort: player,
          coolant: round(coolant),
          distance: round(distance),
          blocked: pressure > 0.72 && distance > 520,
          radius: round(12 + coolant * 24),
          color: item.color ?? "#38bdf8"
        };
      });
      return {
        id: "hellscape-crucible-cooling-loops",
        kit: "hellscape-crucible-cooling-loop-kit",
        kind: "crucible-cooling-loop-set",
        loops
      };
    }
  };
}

export function createHellscapeRelicMoldPriorityKit() {
  return {
    id: "hellscape-relic-mold-priority-kit",
    describe(state = {}) {
      const core = corePoint(state);
      const items = inventoryItems(state);
      const pressure = wavePressure(state);
      const catalog = safeArray(state.buildCatalog).length ? safeArray(state.buildCatalog) : [
        { id: "ward-mold", name: "WARD MOLD", cost: { wood: 4, crystal: 3 }, color: "#38bdf8" },
        { id: "pike-mold", name: "PIKE MOLD", cost: { wood: 6, obsidian: 2 }, color: "#f97316" },
        { id: "pylon-mold", name: "PYLON MOLD", cost: { spore: 4, sulfur: 2, energy: 2 }, color: "#10b981" }
      ];
      const molds = catalog.slice(0, 5).map((build, index) => {
        const cost = build.cost ?? {};
        const need = Object.entries(cost).reduce((sum, [, amount]) => sum + Number(amount || 0), 0) || 1;
        const have = Object.entries(cost).reduce((sum, [item, amount]) => sum + Math.min(Number(items[item]) || 0, Number(amount) || 0), 0);
        const readiness = clamp(have / need - pressure * 0.08, 0, 1);
        const anchor = radialPoint(core, index, Math.max(3, catalog.length), 98 + readiness * 36, -Math.PI / 2);
        return {
          id: `relic-mold-priority-${index}-${idSafe(build.id ?? build.name)}`,
          kind: "relic-mold-priority",
          label: String(build.name ?? build.id ?? "MOLD").toUpperCase(),
          anchor,
          readiness: round(readiness),
          missing: round(Math.max(0, need - have)),
          priority: round(clamp((1 - readiness) * 0.58 + pressure * 0.42, 0, 1)),
          selected: index === Number(state.build?.selected ?? -1),
          radius: round(18 + readiness * 30),
          color: build.color ?? "#facc15"
        };
      });
      return {
        id: "hellscape-relic-mold-priorities",
        kit: "hellscape-relic-mold-priority-kit",
        kind: "relic-mold-priority-set",
        molds
      };
    }
  };
}

export function createHellscapeWardRuneCircleKit() {
  return {
    id: "hellscape-ward-rune-circle-kit",
    describe(state = {}) {
      const core = corePoint(state);
      const pressure = wavePressure(state);
      const enemies = safeArray(state.enemies);
      const circles = portalList(state).map((portal, index) => {
        const center = point(portal);
        const enemyCount = enemies.filter(enemy => dist(enemy, center) < 300).length;
        const ward = clamp(healthRatio(state.core, 1) * 0.34 + (1 - pressure) * 0.34 + (1 - Math.min(dist(center, core) / 800, 1)) * 0.22 - enemyCount * 0.05, 0.02, 1);
        return {
          id: `ward-rune-circle-${index}-${idSafe(portal.id ?? portal.label)}`,
          kind: "ward-rune-circle",
          label: `${portal.label ?? "GATE"} WARD`,
          center,
          target: core,
          ward: round(ward),
          enemyCount,
          radius: round(34 + ward * 82),
          breached: ward < 0.35,
          pulse: round((Number(state.time ?? state.clock?.elapsed ?? 0) + index) % TAU),
          color: portal.color ?? "#facc15"
        };
      });
      return {
        id: "hellscape-ward-rune-circles",
        kit: "hellscape-ward-rune-circle-kit",
        kind: "ward-rune-circle-set",
        circles
      };
    }
  };
}

export function createHellscapeSanctuaryLaneThreadKit() {
  return {
    id: "hellscape-sanctuary-lane-thread-kit",
    describe(state = {}) {
      const player = playerPoint(state);
      const core = corePoint(state);
      const pressure = wavePressure(state);
      const lanes = portalList(state).map((portal, index) => {
        const from = point(portal);
        const via = radialPoint(core, index, portalList(state).length, 150 + index * 22, -Math.PI / 2);
        const laneThreat = safeArray(state.enemies).filter(enemy => Math.min(dist(enemy, from), dist(enemy, via), dist(enemy, core)) < 240).length;
        const safety = clamp((1 - pressure) * 0.44 + healthRatio(state.player, 1) * 0.22 + (1 - Math.min(dist(player, via) / 780, 1)) * 0.22 - laneThreat * 0.04, 0.02, 1);
        return {
          id: `sanctuary-lane-thread-${index}-${idSafe(portal.id ?? portal.label)}`,
          kind: "sanctuary-lane-thread",
          label: `${portal.label ?? "GATE"} SANCTUARY LANE`,
          from,
          via,
          to: core,
          escort: player,
          safety: round(safety),
          laneThreat,
          civilians: Math.max(1, Math.round(2 + safety * 8 - laneThreat * 0.4)),
          blocked: safety < 0.28,
          angle: round(angleBetween(from, core)),
          color: portal.color ?? "#10b981"
        };
      });
      return {
        id: "hellscape-sanctuary-lane-threads",
        kit: "hellscape-sanctuary-lane-thread-kit",
        kind: "sanctuary-lane-thread-set",
        lanes
      };
    }
  };
}

export function createHellscapeForgeGateCommitKit() {
  return {
    id: "hellscape-forge-gate-commit-kit",
    describe(state = {}) {
      const player = playerPoint(state);
      const core = corePoint(state);
      const items = inventoryItems(state);
      const pressure = wavePressure(state);
      const requirements = [
        { id: "core-heat", label: "CORE HEAT", have: healthRatio(state.core, 1), need: 0.62, color: "#38bdf8" },
        { id: "relic-metal", label: "RELIC METAL", have: clamp(((Number(items.obsidian) || 0) + (Number(items.crystal) || 0)) / 14, 0, 1), need: 0.55, color: "#a855f7" },
        { id: "ember-fuel", label: "EMBER FUEL", have: clamp(((Number(items.wood) || 0) + (Number(items.energy) || 0)) / 18, 0, 1), need: 0.58, color: "#facc15" }
      ];
      const commits = requirements.map((requirement, index) => {
        const readiness = clamp(requirement.have / requirement.need - pressure * 0.1, 0, 1);
        const anchor = radialPoint(core, index, requirements.length, 184 + readiness * 42, Math.PI / 2);
        return {
          id: `forge-gate-commit-${index}-${requirement.id}`,
          kind: "forge-gate-commit",
          label: requirement.label,
          from: player,
          anchor,
          readiness: round(readiness),
          open: readiness >= 0.82,
          radius: round(22 + readiness * 44),
          pressure: round(pressure),
          color: requirement.color
        };
      });
      return {
        id: "hellscape-forge-gate-commits",
        kit: "hellscape-forge-gate-commit-kit",
        kind: "forge-gate-commit-set",
        commits
      };
    }
  };
}

export function createHellscapeSanctuaryForgeRendererHandoffKit() {
  return {
    id: "hellscape-sanctuary-forge-renderer-handoff-kit",
    describe(buckets = {}) {
      const descriptors = {
        emberBellowsPressures: buckets.emberBellowsPressures?.bellows ?? [],
        crucibleCoolingLoops: buckets.crucibleCoolingLoops?.loops ?? [],
        relicMoldPriorities: buckets.relicMoldPriorities?.molds ?? [],
        wardRuneCircles: buckets.wardRuneCircles?.circles ?? [],
        sanctuaryLaneThreads: buckets.sanctuaryLaneThreads?.lanes ?? [],
        forgeGateCommits: buckets.forgeGateCommits?.commits ?? []
      };
      return {
        id: "hellscape-sanctuary-forge-renderer-handoff",
        kit: "hellscape-sanctuary-forge-renderer-handoff-kit",
        kind: "renderer-handoff",
        policy: NEXUS_RENDERER_HANDOFF_POLICY,
        descriptors,
        counts: {
          emberBellowsPressures: descriptors.emberBellowsPressures.length,
          crucibleCoolingLoops: descriptors.crucibleCoolingLoops.length,
          relicMoldPriorities: descriptors.relicMoldPriorities.length,
          wardRuneCircles: descriptors.wardRuneCircles.length,
          sanctuaryLaneThreads: descriptors.sanctuaryLaneThreads.length,
          forgeGateCommits: descriptors.forgeGateCommits.length
        }
      };
    }
  };
}

export function createHellscapeSanctuaryForgeReadinessDomainKit() {
  const emberBellowsPressures = createHellscapeEmberBellowsPressureKit();
  const crucibleCoolingLoops = createHellscapeCrucibleCoolingLoopKit();
  const relicMoldPriorities = createHellscapeRelicMoldPriorityKit();
  const wardRuneCircles = createHellscapeWardRuneCircleKit();
  const sanctuaryLaneThreads = createHellscapeSanctuaryLaneThreadKit();
  const forgeGateCommits = createHellscapeForgeGateCommitKit();
  const rendererHandoff = createHellscapeSanctuaryForgeRendererHandoffKit();

  return {
    id: "hellscape-sanctuary-forge-readiness-domain-kit",
    tree: "hellscape-sanctuary-forge-readiness-domain\n├─ forge-stabilization-domain\n│  ├─ ember-bellows-domain\n│  │  └─ hellscape-ember-bellows-pressure-kit\n│  └─ crucible-cooling-domain\n│     └─ hellscape-crucible-cooling-loop-kit\n├─ ward-crafting-domain\n│  ├─ relic-mold-domain\n│  │  └─ hellscape-relic-mold-priority-kit\n│  └─ ward-rune-domain\n│     └─ hellscape-ward-rune-circle-kit\n├─ civilian-sanctuary-domain\n│  ├─ sanctuary-lane-domain\n│  │  └─ hellscape-sanctuary-lane-thread-kit\n│  └─ forge-gate-domain\n│     └─ hellscape-forge-gate-commit-kit\n└─ renderer-handoff\n   └─ hellscape-sanctuary-forge-renderer-handoff-kit\n      └─ renderer consumes descriptors only",
    describe(state = {}) {
      const buckets = {
        emberBellowsPressures: emberBellowsPressures.describe(state),
        crucibleCoolingLoops: crucibleCoolingLoops.describe(state),
        relicMoldPriorities: relicMoldPriorities.describe(state),
        wardRuneCircles: wardRuneCircles.describe(state),
        sanctuaryLaneThreads: sanctuaryLaneThreads.describe(state),
        forgeGateCommits: forgeGateCommits.describe(state)
      };
      return {
        id: "hellscape-sanctuary-forge-readiness-domain",
        kit: "hellscape-sanctuary-forge-readiness-domain-kit",
        kind: "sanctuary-forge-readiness-domain",
        rendererNeutral: true,
        tree: this.tree,
        ...buckets,
        rendererHandoff: rendererHandoff.describe(buckets)
      };
    }
  };
}
