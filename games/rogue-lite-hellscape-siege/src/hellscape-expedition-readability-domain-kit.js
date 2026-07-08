const TAU = Math.PI * 2;

const NEXUS_RENDERER_HANDOFF_POLICY = Object.freeze({
  rendererConsumesDescriptorsOnly: true,
  forbiddenOwnership: ["renderer", "DOM", "browser-input", "Three.js", "WebGL", "audio", "asset-loading", "frame-loop"]
});

const DEFAULT_BUILD_CATALOG = [
  { id: "wall", name: "SPIKE WALL", cost: { wood: 5, obsidian: 3 }, range: 0, color: "#94a3b8" },
  { id: "turret", name: "SENTRY", cost: { wood: 2, crystal: 5, energy: 3 }, range: 310, color: "#38bdf8" },
  { id: "pylon", name: "REGEN", cost: { spore: 6, sulfur: 3, energy: 2 }, range: 160, color: "#10b981" }
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const round = (value, places = 3) => Number((Number(value) || 0).toFixed(places));
const safeArray = value => Array.isArray(value) ? value : [];
const point = value => ({ x: round(value?.x ?? 0), y: round(value?.y ?? 0) });
const dist = (a, b) => Math.hypot((a?.x ?? 0) - (b?.x ?? 0), (a?.y ?? 0) - (b?.y ?? 0));
const angleTo = (a, b) => Math.atan2((b?.y ?? 0) - (a?.y ?? 0), (b?.x ?? 0) - (a?.x ?? 0));
const idSafe = value => String(value ?? "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";

function inventoryCanAfford(items = {}, cost = {}) {
  return Object.entries(cost).every(([key, needed]) => (items[key] || 0) >= needed);
}

function missingCost(items = {}, cost = {}) {
  return Object.fromEntries(
    Object.entries(cost)
      .map(([key, needed]) => [key, Math.max(0, Number(needed) - (Number(items[key]) || 0))])
      .filter(([, value]) => value > 0)
  );
}

function nearest(list, origin, limit = 6) {
  return safeArray(list)
    .map((item, index) => ({ item, index, distance: dist(origin, item) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

function healthRatio(entity = {}, fallback = 1) {
  return clamp((entity.hp ?? entity.maxHp ?? fallback) / (entity.maxHp || entity.hp || fallback || 1), 0, 1);
}

function targetForRealm(state = {}) {
  const realmId = state.realm?.id ?? "lobby";
  if (realmId === "lobby") {
    const portal = nearest(state.portals, state.player ?? { x: 0, y: 0 }, 1)[0]?.item;
    return portal ?? state.core ?? { x: 0, y: -60, id: "core", label: "CORE", color: "#38bdf8" };
  }
  return { x: 0, y: -350, id: "base", label: "BASE", color: "#00f5ff" };
}

export function createHellscapeExtractionRouteKit() {
  return {
    id: "hellscape-extraction-route-kit",
    describe(state = {}) {
      const player = point(state.player ?? { x: 0, y: 0 });
      const realmId = state.realm?.id ?? "lobby";
      const destinationPool = realmId === "lobby"
        ? safeArray(state.portals).map(portal => ({ ...portal, action: `enter-${portal.id ?? "realm"}`, label: portal.label ?? String(portal.id ?? "REALM").toUpperCase() }))
        : [{ x: 0, y: -350, id: "base", action: "return-base", label: "BASE", color: "#00f5ff" }];
      const drops = nearest(state.drops, player, 2).map(({ item, index }) => ({
        ...item,
        id: `drop-${index}-${idSafe(item.item)}`,
        action: `collect-${item.item ?? "drop"}`,
        label: String(item.item ?? "DROP").toUpperCase(),
        color: item.color ?? "#ffffff"
      }));
      const routes = nearest([...drops, ...destinationPool], player, 5).map(({ item, index, distance }) => ({
        id: `extraction-route-${index}-${idSafe(item.id ?? item.action ?? item.label)}`,
        kind: "expedition-extraction-route",
        action: item.action ?? "move",
        label: item.label ?? String(item.id ?? "ROUTE").toUpperCase(),
        from: player,
        to: point(item),
        distance: round(distance),
        angle: round(angleTo(player, item)),
        priority: round(clamp(1 - distance / 950, 0.08, 1)),
        color: item.color ?? (item.action?.startsWith("collect") ? "#e9d5ff" : "#00f5ff")
      }));
      return {
        id: `hellscape-extraction-routes-${idSafe(realmId)}`,
        kit: "hellscape-extraction-route-kit",
        kind: "expedition-extraction-route-set",
        realmId,
        origin: player,
        routes
      };
    }
  };
}

export function createHellscapeSafeZoneBeaconKit() {
  return {
    id: "hellscape-safe-zone-beacon-kit",
    describe(state = {}) {
      const realmId = state.realm?.id ?? "lobby";
      const core = state.core ?? { x: 0, y: -60, hp: 300, maxHp: 300, color: "#38bdf8" };
      const structures = safeArray(state.structures);
      const pylonZones = structures
        .filter(structure => structure.kind === "pylon")
        .map((structure, index) => ({
          id: `safe-zone-pylon-${index}`,
          kind: "safe-zone-beacon",
          label: "REGEN",
          center: point(structure),
          radius: round(structure.range || 160),
          safety: round(0.44 + healthRatio(structure) * 0.46),
          color: structure.color ?? "#10b981"
        }));
      const baseZone = realmId === "lobby"
        ? {
            id: "safe-zone-core",
            kind: "safe-zone-beacon",
            label: "CORE",
            center: point(core),
            radius: 210,
            safety: round(0.25 + healthRatio(core) * 0.65),
            color: healthRatio(core) < 0.35 ? "#ff3300" : "#38bdf8"
          }
        : {
            id: "safe-zone-return-gate",
            kind: "safe-zone-beacon",
            label: "RETURN",
            center: { x: 0, y: -350 },
            radius: 180,
            safety: 0.72,
            color: "#00f5ff"
          };
      return {
        id: `hellscape-safe-zones-${idSafe(realmId)}`,
        kit: "hellscape-safe-zone-beacon-kit",
        kind: "safe-zone-beacon-set",
        realmId,
        zones: [baseZone, ...pylonZones].slice(0, 5)
      };
    }
  };
}

export function createHellscapeSurvivalVectorKit() {
  return {
    id: "hellscape-survival-vector-kit",
    describe(state = {}) {
      const player = point(state.player ?? { x: 0, y: 0 });
      const core = point(state.core ?? { x: 0, y: -60 });
      const enemies = nearest(state.enemies, player, 6);
      const vectors = enemies.length
        ? enemies.map(({ item: enemy, index, distance }) => {
            const awayAngle = angleTo(enemy, player);
            const strength = clamp(1 - distance / 520, 0.12, 1);
            const length = 72 + strength * 90;
            const to = { x: round(player.x + Math.cos(awayAngle) * length), y: round(player.y + Math.sin(awayAngle) * length) };
            return {
              id: `survival-vector-${index}-${idSafe(enemy.type)}`,
              kind: "survival-vector",
              enemyType: enemy.type ?? "crawler",
              from: player,
              to,
              distance: round(distance),
              strength: round(strength),
              color: enemy.type === "brute" ? "#f97316" : "#ef4444"
            };
          })
        : [{
            id: "survival-vector-core-hold",
            kind: "survival-vector",
            enemyType: "none",
            from: player,
            to: core,
            distance: round(dist(player, core)),
            strength: 0.18,
            color: "#38bdf8"
          }];
      return {
        id: "hellscape-survival-vectors",
        kit: "hellscape-survival-vector-kit",
        kind: "survival-vector-set",
        vectors
      };
    }
  };
}

export function createHellscapeCraftingWindowKit() {
  return {
    id: "hellscape-crafting-window-kit",
    describe(state = {}) {
      const player = point(state.player ?? { x: 0, y: 0 });
      const buildCatalog = safeArray(state.buildCatalog).length ? state.buildCatalog : DEFAULT_BUILD_CATALOG;
      const items = state.inventory?.items ?? {};
      const selected = clamp(state.build?.selected ?? 0, 0, Math.max(0, buildCatalog.length - 1));
      const wavePressure = clamp((safeArray(state.enemies).length / 12) + (state.wave?.active ? 0.35 : 0), 0, 1);
      const windows = buildCatalog.map((option, index) => {
        const canAfford = inventoryCanAfford(items, option.cost);
        const selectedBoost = index === selected ? 0.22 : 0;
        const urgency = clamp((canAfford ? 0.28 : 0.08) + wavePressure * 0.46 + selectedBoost, 0, 1);
        return {
          id: `crafting-window-${index}-${idSafe(option.id)}`,
          kind: "crafting-window",
          buildId: option.id,
          label: option.name ?? String(option.id ?? "BUILD").toUpperCase(),
          selected: index === selected,
          canAfford,
          missing: missingCost(items, option.cost),
          anchor: { x: round(player.x + (index - 1) * 48), y: round(player.y + 88 + index * 8) },
          radius: round(18 + (option.range || 54) * 0.035),
          urgency: round(urgency),
          color: option.color ?? "#ffffff"
        };
      });
      return {
        id: "hellscape-crafting-windows",
        kit: "hellscape-crafting-window-kit",
        kind: "crafting-window-set",
        selected,
        wavePressure: round(wavePressure),
        windows
      };
    }
  };
}

export function createHellscapeBossWakeSignatureKit() {
  return {
    id: "hellscape-boss-wake-signature-kit",
    describe(state = {}) {
      const core = point(state.core ?? { x: 0, y: -60 });
      const brutes = safeArray(state.enemies).filter(enemy => enemy.type === "brute");
      const queued = safeArray(state.wave?.queue).filter(type => type === "brute").length;
      const signatures = brutes.length
        ? nearest(brutes, core, 4).map(({ item: enemy, index, distance }) => ({
            id: `boss-wake-${index}`,
            kind: "boss-wake-signature",
            center: point(enemy),
            target: core,
            radius: round((enemy.size || 28) * 3.2),
            distanceToCore: round(distance),
            severity: round(clamp(1 - distance / 760 + healthRatio(enemy) * 0.32, 0.18, 1)),
            color: "#f97316"
          }))
        : [{
            id: "boss-wake-queued",
            kind: "boss-wake-signature",
            center: core,
            target: core,
            radius: round(120 + queued * 32),
            distanceToCore: 0,
            severity: round(clamp((state.wave?.active ? 0.22 : 0.08) + queued * 0.18, 0.08, 0.78)),
            color: queued ? "#f97316" : "#38bdf8"
          }];
      return {
        id: "hellscape-boss-wake-signatures",
        kit: "hellscape-boss-wake-signature-kit",
        kind: "boss-wake-signature-set",
        queuedBrutes: queued,
        signatures
      };
    }
  };
}

export function createHellscapeRealmExitCompassKit() {
  return {
    id: "hellscape-realm-exit-compass-kit",
    describe(state = {}) {
      const realmId = state.realm?.id ?? "lobby";
      const player = point(state.player ?? { x: 0, y: 0 });
      const target = targetForRealm(state);
      const destination = point(target);
      return {
        id: `hellscape-realm-exit-compass-${idSafe(realmId)}`,
        kit: "hellscape-realm-exit-compass-kit",
        kind: "realm-exit-compass",
        realmId,
        from: player,
        to: destination,
        label: target.label ?? (realmId === "lobby" ? "PORTAL" : "BASE"),
        distance: round(dist(player, target)),
        angle: round(angleTo(player, target)),
        pulse: round(((state.time ?? state.clock?.elapsed ?? 0) * 0.7) % TAU),
        color: target.color ?? (realmId === "lobby" ? "#e9d5ff" : "#00f5ff")
      };
    }
  };
}

export function createHellscapeExpeditionRendererHandoffKit() {
  return {
    id: "hellscape-expedition-renderer-handoff-kit",
    describe(buckets = {}) {
      const descriptors = {
        extractionRoutes: buckets.extractionRoutes?.routes ?? [],
        safeZones: buckets.safeZones?.zones ?? [],
        survivalVectors: buckets.survivalVectors?.vectors ?? [],
        craftingWindows: buckets.craftingWindows?.windows ?? [],
        bossWake: buckets.bossWake?.signatures ?? [],
        exitCompass: buckets.exitCompass ?? null
      };
      return {
        id: "hellscape-expedition-renderer-handoff",
        kit: "hellscape-expedition-renderer-handoff-kit",
        kind: "renderer-handoff",
        policy: NEXUS_RENDERER_HANDOFF_POLICY,
        descriptors,
        counts: {
          extractionRoutes: descriptors.extractionRoutes.length,
          safeZones: descriptors.safeZones.length,
          survivalVectors: descriptors.survivalVectors.length,
          craftingWindows: descriptors.craftingWindows.length,
          bossWake: descriptors.bossWake.length,
          exitCompass: descriptors.exitCompass ? 1 : 0
        }
      };
    }
  };
}

export function createHellscapeExpeditionReadabilityDomainKit() {
  const extractionRoutes = createHellscapeExtractionRouteKit();
  const safeZones = createHellscapeSafeZoneBeaconKit();
  const survivalVectors = createHellscapeSurvivalVectorKit();
  const craftingWindows = createHellscapeCraftingWindowKit();
  const bossWake = createHellscapeBossWakeSignatureKit();
  const exitCompass = createHellscapeRealmExitCompassKit();
  const rendererHandoff = createHellscapeExpeditionRendererHandoffKit();

  return {
    id: "hellscape-expedition-readability-domain-kit",
    tree: "hellscape-expedition-readability-domain\n├─ route-intent-domain\n│  ├─ extraction-route-domain\n│  │  └─ hellscape-extraction-route-kit\n│  └─ realm-exit-domain\n│     └─ hellscape-realm-exit-compass-kit\n├─ survival-response-domain\n│  ├─ safe-zone-domain\n│  │  └─ hellscape-safe-zone-beacon-kit\n│  └─ survival-vector-domain\n│     └─ hellscape-survival-vector-kit\n├─ escalation-planning-domain\n│  ├─ crafting-window-domain\n│  │  └─ hellscape-crafting-window-kit\n│  └─ boss-wake-domain\n│     └─ hellscape-boss-wake-signature-kit\n└─ renderer-handoff\n   └─ hellscape-expedition-renderer-handoff-kit\n      └─ renderer consumes descriptors only",
    describe(state = {}) {
      const buckets = {
        extractionRoutes: extractionRoutes.describe(state),
        safeZones: safeZones.describe(state),
        survivalVectors: survivalVectors.describe(state),
        craftingWindows: craftingWindows.describe(state),
        bossWake: bossWake.describe(state),
        exitCompass: exitCompass.describe(state)
      };
      return {
        id: "hellscape-expedition-readability-domain",
        kit: "hellscape-expedition-readability-domain-kit",
        kind: "expedition-readability-domain",
        rendererNeutral: true,
        tree: this.tree,
        ...buckets,
        rendererHandoff: rendererHandoff.describe(buckets)
      };
    }
  };
}
