const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.max(0, Math.min(1, n(value)));
const clamp = (value, min, max) => Math.max(min, Math.min(max, n(value, min)));
const pos = (point = {}) => ({ x: n(point.x), z: n(point.z ?? point.y) });
const distance = (a = {}, b = {}) => Math.hypot(n(a.x) - n(b.x), n(a.z ?? a.y) - n(b.z ?? b.y));

const OWNERSHIP_BOUNDARY = Object.freeze({
  rendererOwns: "presentation-only",
  kitsOwn: "serializable-foraging-readability-descriptors",
  forbiddenOwners: ["renderer", "dom", "browser-input", "three", "webgl", "audio", "asset-loading", "frame-loop"]
});

const RARITY_VALUE = Object.freeze({
  common: 0.34,
  uncommon: 0.48,
  rare: 0.72,
  legendary: 1,
  cursed: 0.84,
  red: 0.38,
  golden: 0.76,
  moon: 0.88
});

function descriptor(kind, id, fields = {}) {
  return { kind, id: String(id ?? kind), ...fields };
}

function rarityValue(apple = {}) {
  const key = String(apple.rarity ?? apple.typeId ?? "common").toLowerCase();
  if (RARITY_VALUE[key] != null) return RARITY_VALUE[key];
  if (key.includes("legend")) return 1;
  if (key.includes("rare")) return 0.72;
  if (key.includes("curse")) return 0.84;
  if (key.includes("moon")) return 0.88;
  if (key.includes("gold")) return 0.76;
  return 0.42;
}

function pressureNear(snapshot = {}, point = {}, radius = 18) {
  let pressure = 0;
  for (const monster of snapshot.monsters ?? []) {
    const d = distance(point, pos(monster.position));
    if (d > radius) continue;
    const threat = Math.max(0.35, n(monster.threat?.threat, monster.boss ? 5 : monster.elite ? 2 : 1));
    pressure += (1 - d / radius) * threat * (monster.boss ? 1.5 : monster.elite ? 1.18 : 1);
  }
  return pressure;
}

function facing(snapshot = {}) {
  const f = snapshot.player?.facing ?? { x: 0, z: -1 };
  const len = Math.hypot(n(f.x), n(f.z)) || 1;
  return { x: n(f.x) / len, z: n(f.z) / len };
}

export function createOrchardAppleRarityHeatKit(options = {}) {
  const maxApples = Math.max(1, Math.floor(n(options.maxApples, 8)));
  return {
    id: "orchard-apple-rarity-heat-kit",
    domain: "foraging.apple.rarity-heat",
    describe(snapshot = {}) {
      const playerPosition = pos(snapshot.player?.position);
      return (snapshot.orchard?.activeApples ?? [])
        .map((apple) => {
          const p = pos(apple.position);
          const value = rarityValue(apple);
          const d = distance(playerPosition, p);
          const nearestBoost = apple.id === snapshot.nearestApple?.id ? 0.24 : 0;
          const dangerPenalty = clamp01(pressureNear(snapshot, p, 15) / 5) * 0.22;
          const priority = clamp01(value * 0.68 + nearestBoost + Math.max(0, 1 - d / 50) * 0.18 - dangerPenalty);
          return { apple, p, d, value, priority };
        })
        .sort((a, b) => b.priority - a.priority || a.d - b.d)
        .slice(0, maxApples)
        .map(({ apple, p, value, priority, d }) => descriptor("apple-rarity-heat", apple.id, {
          position: p,
          label: apple.label ?? apple.typeId ?? "apple",
          rarityValue: value,
          priority,
          distance: d,
          radius: 1.8 + value * 3.8 + priority * 2.6,
          ringScale: 0.92 + priority * 0.88,
          pulse: 0.28 + priority * 0.62,
          opacity: 0.12 + priority * 0.44,
          color: value > 0.9 ? "#d36bff" : value > 0.7 ? "#ffe06b" : apple.typeId?.includes("curse") ? "#ad57ff" : "#df3f38"
        }));
    }
  };
}

export function createOrchardGearChoiceArcKit(options = {}) {
  const maxGear = Math.max(1, Math.floor(n(options.maxGear, 4)));
  return {
    id: "orchard-gear-choice-arc-kit",
    domain: "foraging.gear.choice-arc",
    describe(snapshot = {}) {
      const playerPosition = pos(snapshot.player?.position);
      const pressure = clamp01(snapshot.horde?.pressure01 ?? snapshot.horde?.pressure ?? 0);
      const bossWave = Boolean(snapshot.round?.bossWave) || (snapshot.monsters ?? []).some((monster) => monster.boss);
      return (snapshot.weapons?.pickups ?? [])
        .filter((pickup) => pickup.active !== false)
        .map((pickup) => {
          const weaponId = String(pickup.weaponId ?? "gear");
          const p = pos(pickup.position);
          const d = distance(playerPosition, p);
          const ranged = /bow|rifle|gun|sling|cross/i.test(weaponId);
          const crowd = /pitchfork|rake|scythe|axe/i.test(weaponId);
          const fit = clamp01((ranged && bossWave ? 0.44 : 0) + (crowd && pressure > 0.42 ? 0.34 : 0) + (pickup.id === snapshot.nearestWeapon?.id ? 0.24 : 0) + Math.max(0, 1 - d / 42) * 0.28 + 0.18);
          return descriptor("gear-choice-arc", pickup.id, {
            from: playerPosition,
            to: p,
            position: p,
            label: weaponId.replaceAll("-", " "),
            fit,
            distance: d,
            role: ranged ? "range" : crowd ? "crowd" : "utility",
            width: 0.8 + fit * 2.2,
            opacity: 0.1 + fit * 0.44,
            color: ranged ? "#a7d8ff" : crowd ? "#ffd168" : "#b6d66f"
          });
        })
        .sort((a, b) => b.fit - a.fit || a.distance - b.distance)
        .slice(0, maxGear);
    }
  };
}

export function createOrchardHarvestStreakTrailKit(options = {}) {
  const steps = Math.max(2, Math.floor(n(options.steps, 5)));
  return {
    id: "orchard-harvest-streak-trail-kit",
    domain: "foraging.harvest.streak-trail",
    describe(snapshot = {}) {
      const playerPosition = pos(snapshot.player?.position);
      const f = facing(snapshot);
      const recent = clamp01(n(snapshot.recentApples) / 5 + Math.max(0, n(snapshot.scoreMomentum)) * 0.42);
      return Array.from({ length: steps }, (_, index) => {
        const t = (index + 1) / steps;
        return descriptor("harvest-streak-trail", `trail-${index}`, {
          position: {
            x: playerPosition.x - f.x * (2.2 + index * 1.55),
            z: playerPosition.z - f.z * (2.2 + index * 1.55)
          },
          intensity: recent,
          radius: 0.55 + (1 - t) * 1.25 + recent * 1.4,
          opacity: 0.04 + recent * (0.24 * (1 - t * 0.55)),
          color: recent > 0.54 ? "#ffe06b" : "#b6d66f"
        });
      });
    }
  };
}

export function createOrchardSafeHarvestPocketKit(options = {}) {
  const maxPockets = Math.max(1, Math.floor(n(options.maxPockets, 4)));
  return {
    id: "orchard-safe-harvest-pocket-kit",
    domain: "foraging.harvest.safe-pocket",
    describe(snapshot = {}) {
      const health = clamp01(snapshot.health01 ?? 1);
      const stamina = clamp01(snapshot.stamina01 ?? 1);
      const playerPosition = pos(snapshot.player?.position);
      return (snapshot.orchard?.activeApples ?? [])
        .map((apple) => {
          const p = pos(apple.position);
          const monsterPressure = pressureNear(snapshot, p, 16);
          const d = distance(playerPosition, p);
          const safety = clamp01(0.95 - monsterPressure * 0.18 + health * 0.08 + stamina * 0.06 - Math.max(0, d - 26) / 120);
          return { apple, p, d, safety };
        })
        .sort((a, b) => b.safety - a.safety || a.d - b.d)
        .slice(0, maxPockets)
        .map(({ apple, p, safety, d }, index) => descriptor("safe-harvest-pocket", apple.id ?? index, {
          center: p,
          position: p,
          label: apple.label ?? "apple pocket",
          safety,
          distance: d,
          width: 4.2 + safety * 4.8,
          length: 3.2 + safety * 4.2,
          rotation: (index % 2 ? -0.32 : 0.22) + n(apple.position?.x) * 0.01,
          opacity: 0.07 + safety * 0.18,
          color: safety > 0.62 ? "#8fd56b" : "#d0a25b"
        }));
    }
  };
}

export function createOrchardRowMemoryBreadcrumbKit(options = {}) {
  const maxRows = Math.max(1, Math.floor(n(options.maxRows, 5)));
  return {
    id: "orchard-row-memory-breadcrumb-kit",
    domain: "foraging.navigation.row-memory",
    describe(snapshot = {}) {
      const playerPosition = pos(snapshot.player?.position);
      const pressure = clamp01(snapshot.horde?.pressure01 ?? snapshot.horde?.pressure ?? 0);
      const width = n(snapshot.orchard?.width, 76) * 0.78;
      return (snapshot.orchard?.treeRows ?? [])
        .map((row, index) => {
          const z = n(row.z ?? row.centerZ ?? row.position?.z, index * 8);
          const memory = clamp01(1 - Math.min(Math.abs(playerPosition.z - z) / 60, 1) * 0.68 - pressure * 0.16);
          return { row, index, z, memory };
        })
        .sort((a, b) => b.memory - a.memory)
        .slice(0, maxRows)
        .map(({ row, index, z, memory }) => descriptor("row-memory-breadcrumb", row.id ?? `row-${index}`, {
          center: { x: 0, z },
          rowIndex: index,
          memory,
          width,
          length: 0.42 + memory * 0.68,
          opacity: 0.04 + memory * 0.18,
          color: "#b98a45"
        }));
    }
  };
}

export function createOrchardBossOmenBranchKit(options = {}) {
  const maxOmens = Math.max(1, Math.floor(n(options.maxOmens, 4)));
  return {
    id: "orchard-boss-omen-branch-kit",
    domain: "foraging.boss.omen-branch",
    describe(snapshot = {}) {
      const pressure = clamp01(snapshot.horde?.pressure01 ?? snapshot.horde?.pressure ?? 0);
      const bossMonsters = (snapshot.monsters ?? []).filter((monster) => monster.boss);
      const hauntedZones = snapshot.orchard?.hauntedZones ?? [];
      const bossWave = Boolean(snapshot.round?.bossWave) || bossMonsters.length > 0 || pressure > 0.82;
      if (!bossWave) return [];
      const seeds = bossMonsters.length
        ? bossMonsters.map((monster) => ({ id: monster.entity ?? monster.id, position: pos(monster.position), label: monster.label ?? "Orchard Keeper" }))
        : hauntedZones.length
          ? hauntedZones.map((zone) => ({ id: zone.id, position: pos(zone.position), label: "haunted row" }))
          : [{ id: "center-omen", position: { x: 0, z: 0 }, label: "keeper omen" }];
      return seeds.slice(0, maxOmens).map((seed, index) => descriptor("boss-omen-branch", seed.id ?? index, {
        position: seed.position,
        label: seed.label,
        omen: clamp01(0.62 + pressure * 0.28 + (bossMonsters.length ? 0.18 : 0)),
        radius: 5.8 + pressure * 8 + index * 1.1,
        ringScale: 1.2 + pressure * 1.1,
        pulse: 0.52 + pressure * 0.46,
        opacity: 0.18 + pressure * 0.38,
        color: "#ff365f"
      }));
    }
  };
}

export function createOrchardForagingRendererHandoffKit(options = {}) {
  return {
    id: "orchard-foraging-renderer-handoff-kit",
    domain: "foraging.renderer-handoff",
    describe(readability = {}) {
      const descriptors = {
        appleRarityHeat: readability.appleRarityHeat ?? [],
        gearChoiceArcs: readability.gearChoiceArcs ?? [],
        harvestStreakTrails: readability.harvestStreakTrails ?? [],
        safeHarvestPockets: readability.safeHarvestPockets ?? [],
        rowMemoryBreadcrumbs: readability.rowMemoryBreadcrumbs ?? [],
        bossOmenBranches: readability.bossOmenBranches ?? []
      };
      return {
        id: "orchard-foraging-renderer-handoff",
        policy: "renderer-consumes-descriptors-only",
        ownership: OWNERSHIP_BOUNDARY,
        descriptors,
        descriptorCounts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]))
      };
    }
  };
}

export function createZombieOrchardForagingReadabilityDomainKit(options = {}) {
  const appleHeat = options.appleHeat ?? createOrchardAppleRarityHeatKit(options.appleRarityHeat);
  const gearArcs = options.gearArcs ?? createOrchardGearChoiceArcKit(options.gearChoiceArc);
  const harvestTrail = options.harvestTrail ?? createOrchardHarvestStreakTrailKit(options.harvestStreakTrail);
  const safePockets = options.safePockets ?? createOrchardSafeHarvestPocketKit(options.safeHarvestPocket);
  const rowMemory = options.rowMemory ?? createOrchardRowMemoryBreadcrumbKit(options.rowMemoryBreadcrumb);
  const bossOmens = options.bossOmens ?? createOrchardBossOmenBranchKit(options.bossOmenBranch);
  const handoff = options.handoff ?? createOrchardForagingRendererHandoffKit(options.rendererHandoff);
  return {
    id: "zombie-orchard-foraging-readability-domain-kit",
    domain: "zombie-orchard.foraging-readability",
    compose(snapshot = {}, survivalReadability = {}) {
      const enriched = { ...snapshot, survivalReadability };
      const readability = {
        appleRarityHeat: appleHeat.describe(enriched),
        gearChoiceArcs: gearArcs.describe(enriched),
        harvestStreakTrails: harvestTrail.describe(enriched),
        safeHarvestPockets: safePockets.describe(enriched),
        rowMemoryBreadcrumbs: rowMemory.describe(enriched),
        bossOmenBranches: bossOmens.describe(enriched)
      };
      return {
        ...readability,
        rendererHandoff: handoff.describe(readability)
      };
    }
  };
}

export const ZOMBIE_ORCHARD_FORAGING_READABILITY_TREE = `zombie-orchard-foraging-readability-domain
├─ forage-targeting-domain
│  ├─ apple-rarity-domain
│  │  └─ orchard-apple-rarity-heat-kit
│  └─ gear-choice-domain
│     └─ orchard-gear-choice-arc-kit
├─ harvest-routing-domain
│  ├─ streak-memory-domain
│  │  └─ orchard-harvest-streak-trail-kit
│  └─ safe-pocket-domain
│     └─ orchard-safe-harvest-pocket-kit
├─ orchard-memory-domain
│  ├─ row-breadcrumb-domain
│  │  └─ orchard-row-memory-breadcrumb-kit
│  └─ boss-omen-domain
│     └─ orchard-boss-omen-branch-kit
└─ renderer-handoff
   └─ orchard-foraging-renderer-handoff-kit
      └─ renderer consumes descriptors only`;