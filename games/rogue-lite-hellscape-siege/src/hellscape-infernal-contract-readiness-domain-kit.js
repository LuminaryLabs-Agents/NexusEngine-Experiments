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

function inventoryTotal(items = {}) {
  return Object.values(items).reduce((sum, value) => sum + (Number(value) || 0), 0);
}

function nearest(list, origin, limit = 6) {
  return safeArray(list)
    .map((item, index) => ({ item, index, distance: dist(origin, item) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
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

export function createHellscapePortalSealPriorityKit() {
  return {
    id: "hellscape-portal-seal-priority-kit",
    describe(state = {}) {
      const player = playerPoint(state);
      const core = corePoint(state);
      const pressure = wavePressure(state);
      const seals = portalList(state).map((portal, index) => {
        const p = point(portal);
        const enemyNearPortal = safeArray(state.enemies).filter(enemy => dist(enemy, p) < 260).length;
        const enemyNearCore = safeArray(state.enemies).filter(enemy => dist(enemy, core) < 280).length;
        const distance = dist(player, p);
        const priority = clamp(0.2 + pressure * 0.3 + enemyNearPortal * 0.12 + enemyNearCore * 0.04 - distance / 2600, 0.05, 1);
        return {
          id: `portal-seal-${index}-${idSafe(portal.id ?? portal.label)}`,
          kind: "portal-seal-priority",
          label: portal.label ?? String(portal.id ?? "PORTAL").toUpperCase(),
          center: p,
          from: player,
          radius: round(32 + priority * 46),
          priority: round(priority),
          enemyNearPortal,
          angle: round(angleBetween(player, p)),
          color: portal.color ?? (priority > 0.7 ? "#ff3300" : "#00f5ff")
        };
      });
      return {
        id: "hellscape-portal-seal-priorities",
        kit: "hellscape-portal-seal-priority-kit",
        kind: "portal-seal-priority-set",
        pressure: round(pressure),
        seals
      };
    }
  };
}

export function createHellscapeCurseDebtLedgerKit() {
  return {
    id: "hellscape-curse-debt-ledger-kit",
    describe(state = {}) {
      const items = inventoryItems(state);
      const pressure = wavePressure(state);
      const debts = [
        { id: "blood", label: "BLOOD", value: 1 - healthRatio(state.player, 1), color: "#ef4444" },
        { id: "stone", label: "STONE", value: 1 - clamp((Number(items.obsidian) || 0) / 8, 0, 1), color: "#94a3b8" },
        { id: "spark", label: "SPARK", value: 1 - clamp((Number(items.energy) || 0) / 8, 0, 1), color: "#38bdf8" },
        { id: "core", label: "CORE", value: 1 - healthRatio(state.core, 1), color: "#f97316" }
      ].map((debt, index) => {
        const severity = clamp(debt.value * 0.72 + pressure * 0.28, 0, 1);
        return {
          id: `curse-debt-${index}-${debt.id}`,
          kind: "curse-debt-ledger-card",
          label: debt.label,
          severity: round(severity),
          anchor: { x: round((state.player?.x ?? 0) - 112 + index * 74), y: round((state.player?.y ?? 0) - 138) },
          radius: round(14 + severity * 26),
          paid: severity < 0.34,
          color: debt.color
        };
      });
      return {
        id: "hellscape-curse-debt-ledgers",
        kit: "hellscape-curse-debt-ledger-kit",
        kind: "curse-debt-ledger-set",
        inventoryTotal: round(inventoryTotal(items)),
        debts
      };
    }
  };
}

export function createHellscapeRelicRouteThreadKit() {
  return {
    id: "hellscape-relic-route-thread-kit",
    describe(state = {}) {
      const player = playerPoint(state);
      const resources = safeArray(state.resources).map(resource => ({ ...resource, routeKind: "resource" }));
      const drops = safeArray(state.drops).map(drop => ({ ...drop, routeKind: "drop", hp: 1, maxHp: 1 }));
      const fallback = portalList(state).map(portal => ({ ...portal, routeKind: "portal" }));
      const candidates = [...resources, ...drops];
      const routeCandidates = candidates.length ? candidates : fallback;
      const threads = nearest(routeCandidates, player, 5).map(({ item, index, distance }) => {
        const value = item.routeKind === "drop" ? 0.86 : item.routeKind === "portal" ? 0.62 : clamp(healthRatio(item, 1) + 0.22, 0, 1);
        const urgency = clamp(value * 0.48 + (1 - Math.min(distance / 900, 1)) * 0.38 + wavePressure(state) * 0.14, 0.05, 1);
        return {
          id: `relic-route-${index}-${idSafe(item.item ?? item.kind ?? item.id ?? item.label)}`,
          kind: "relic-route-thread",
          routeKind: item.routeKind,
          label: item.item ?? item.kind ?? item.label ?? "RELIC",
          from: player,
          to: point(item),
          distance: round(distance),
          urgency: round(urgency),
          pulse: round(((state.time ?? state.clock?.elapsed ?? 0) * (0.6 + urgency)) % TAU),
          color: item.color ?? (item.routeKind === "drop" ? "#e9d5ff" : "#facc15")
        };
      });
      return {
        id: "hellscape-relic-route-threads",
        kit: "hellscape-relic-route-thread-kit",
        kind: "relic-route-thread-set",
        threads
      };
    }
  };
}

export function createHellscapeSacrificeRiskAuraKit() {
  return {
    id: "hellscape-sacrifice-risk-aura-kit",
    describe(state = {}) {
      const player = playerPoint(state);
      const core = corePoint(state);
      const pressure = wavePressure(state);
      const structures = safeArray(state.structures);
      const anchors = [
        { id: "player", label: "VESSEL", center: player, health: healthRatio(state.player, 1), base: 0.28, color: "#00f5ff" },
        { id: "core", label: "CORE", center: core, health: healthRatio(state.core, 1), base: 0.42, color: "#ff3300" },
        ...nearest(structures, core, 3).map(({ item, index }) => ({
          id: `structure-${index}-${idSafe(item.kind)}`,
          label: String(item.kind ?? "WARD").toUpperCase(),
          center: point(item),
          health: healthRatio(item, 1),
          base: 0.18,
          color: item.color ?? "#94a3b8"
        }))
      ];
      const auras = anchors.map((anchor, index) => {
        const risk = clamp(anchor.base + (1 - anchor.health) * 0.48 + pressure * 0.28, 0.03, 1);
        return {
          id: `sacrifice-risk-${index}-${anchor.id}`,
          kind: "sacrifice-risk-aura",
          label: anchor.label,
          center: anchor.center,
          radius: round(38 + risk * 92),
          risk: round(risk),
          color: anchor.color
        };
      });
      return {
        id: "hellscape-sacrifice-risk-auras",
        kit: "hellscape-sacrifice-risk-aura-kit",
        kind: "sacrifice-risk-aura-set",
        auras
      };
    }
  };
}

export function createHellscapeDemonChampionWakeKit() {
  return {
    id: "hellscape-demon-champion-wake-kit",
    describe(state = {}) {
      const core = corePoint(state);
      const enemies = safeArray(state.enemies);
      const champions = enemies.filter(enemy => enemy.type === "brute" || (Number(enemy.maxHp) || 0) >= 100);
      const fallback = champions.length ? champions : enemies.slice(0, Math.min(2, enemies.length));
      const wakeSource = fallback.length ? fallback : [{ type: "quiet", x: core.x, y: core.y - 180, hp: 1, maxHp: 1, size: 18 }];
      const wakes = wakeSource.map((enemy, index) => {
        const d = dist(enemy, core);
        const threat = clamp((enemy.type === "brute" ? 0.36 : 0.16) + wavePressure(state) * 0.4 + (1 - Math.min(d / 900, 1)) * 0.34, 0.04, 1);
        return {
          id: `demon-champion-wake-${index}-${idSafe(enemy.type)}`,
          kind: "demon-champion-wake",
          enemyType: enemy.type ?? "unknown",
          center: point(enemy),
          target: core,
          radius: round((enemy.size || 18) * 2.2 + threat * 58),
          threat: round(threat),
          color: enemy.type === "quiet" ? "#38bdf8" : enemy.type === "brute" ? "#f97316" : "#ef4444"
        };
      });
      return {
        id: "hellscape-demon-champion-wakes",
        kit: "hellscape-demon-champion-wake-kit",
        kind: "demon-champion-wake-set",
        wakes
      };
    }
  };
}

export function createHellscapeFinalPactWindowKit() {
  return {
    id: "hellscape-final-pact-window-kit",
    describe(state = {}) {
      const player = playerPoint(state);
      const core = corePoint(state);
      const items = inventoryItems(state);
      const pressure = wavePressure(state);
      const offerings = [
        { id: "obsidian", label: "OBSIDIAN SEAL", have: Number(items.obsidian) || 0, need: 6, color: "#94a3b8" },
        { id: "crystal", label: "CRYSTAL OATH", have: Number(items.crystal) || 0, need: 8, color: "#a855f7" },
        { id: "energy", label: "ENERGY BLOOD", have: Number(items.energy) || 0, need: 7, color: "#38bdf8" }
      ];
      const windows = offerings.map((offering, index) => {
        const readiness = clamp(offering.have / offering.need - pressure * 0.14 + healthRatio(state.core, 1) * 0.12, 0, 1);
        const angle = -Math.PI / 2 + index * TAU / offerings.length;
        const anchor = {
          x: round(core.x + Math.cos(angle) * (110 + readiness * 32)),
          y: round(core.y + Math.sin(angle) * (110 + readiness * 32))
        };
        return {
          id: `final-pact-window-${index}-${offering.id}`,
          kind: "final-pact-window",
          label: offering.label,
          anchor,
          from: player,
          readiness: round(readiness),
          missing: Math.max(0, offering.need - offering.have),
          open: readiness >= 0.72,
          radius: round(22 + readiness * 30),
          color: offering.color
        };
      });
      return {
        id: "hellscape-final-pact-windows",
        kit: "hellscape-final-pact-window-kit",
        kind: "final-pact-window-set",
        windows
      };
    }
  };
}

export function createHellscapeInfernalContractRendererHandoffKit() {
  return {
    id: "hellscape-infernal-contract-renderer-handoff-kit",
    describe(buckets = {}) {
      const descriptors = {
        portalSealPriorities: buckets.portalSealPriorities?.seals ?? [],
        curseDebtLedgers: buckets.curseDebtLedgers?.debts ?? [],
        relicRouteThreads: buckets.relicRouteThreads?.threads ?? [],
        sacrificeRiskAuras: buckets.sacrificeRiskAuras?.auras ?? [],
        demonChampionWakes: buckets.demonChampionWakes?.wakes ?? [],
        finalPactWindows: buckets.finalPactWindows?.windows ?? []
      };
      return {
        id: "hellscape-infernal-contract-renderer-handoff",
        kit: "hellscape-infernal-contract-renderer-handoff-kit",
        kind: "renderer-handoff",
        policy: NEXUS_RENDERER_HANDOFF_POLICY,
        descriptors,
        counts: {
          portalSealPriorities: descriptors.portalSealPriorities.length,
          curseDebtLedgers: descriptors.curseDebtLedgers.length,
          relicRouteThreads: descriptors.relicRouteThreads.length,
          sacrificeRiskAuras: descriptors.sacrificeRiskAuras.length,
          demonChampionWakes: descriptors.demonChampionWakes.length,
          finalPactWindows: descriptors.finalPactWindows.length
        }
      };
    }
  };
}

export function createHellscapeInfernalContractReadinessDomainKit() {
  const portalSealPriorities = createHellscapePortalSealPriorityKit();
  const curseDebtLedgers = createHellscapeCurseDebtLedgerKit();
  const relicRouteThreads = createHellscapeRelicRouteThreadKit();
  const sacrificeRiskAuras = createHellscapeSacrificeRiskAuraKit();
  const demonChampionWakes = createHellscapeDemonChampionWakeKit();
  const finalPactWindows = createHellscapeFinalPactWindowKit();
  const rendererHandoff = createHellscapeInfernalContractRendererHandoffKit();

  return {
    id: "hellscape-infernal-contract-readiness-domain-kit",
    tree: "hellscape-infernal-contract-readiness-domain\n├─ portal-oath-domain\n│  ├─ portal-seal-domain\n│  │  └─ hellscape-portal-seal-priority-kit\n│  └─ curse-debt-domain\n│     └─ hellscape-curse-debt-ledger-kit\n├─ relic-sacrifice-domain\n│  ├─ relic-route-domain\n│  │  └─ hellscape-relic-route-thread-kit\n│  └─ sacrifice-risk-domain\n│     └─ hellscape-sacrifice-risk-aura-kit\n├─ champion-pact-domain\n│  ├─ demon-champion-domain\n│  │  └─ hellscape-demon-champion-wake-kit\n│  └─ final-pact-domain\n│     └─ hellscape-final-pact-window-kit\n└─ renderer-handoff\n   └─ hellscape-infernal-contract-renderer-handoff-kit\n      └─ renderer consumes descriptors only",
    describe(state = {}) {
      const buckets = {
        portalSealPriorities: portalSealPriorities.describe(state),
        curseDebtLedgers: curseDebtLedgers.describe(state),
        relicRouteThreads: relicRouteThreads.describe(state),
        sacrificeRiskAuras: sacrificeRiskAuras.describe(state),
        demonChampionWakes: demonChampionWakes.describe(state),
        finalPactWindows: finalPactWindows.describe(state)
      };
      return {
        id: "hellscape-infernal-contract-readiness-domain",
        kit: "hellscape-infernal-contract-readiness-domain-kit",
        kind: "infernal-contract-readiness-domain",
        rendererNeutral: true,
        tree: this.tree,
        ...buckets,
        rendererHandoff: rendererHandoff.describe(buckets)
      };
    }
  };
}
