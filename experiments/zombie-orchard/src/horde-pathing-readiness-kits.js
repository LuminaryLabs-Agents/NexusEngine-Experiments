const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.max(0, Math.min(1, n(value)));
const clamp = (value, min, max) => Math.max(min, Math.min(max, n(value, min)));
const pos = (point = {}) => ({ x: n(point.x), z: n(point.z ?? point.y) });
const distance = (a = {}, b = {}) => Math.hypot(n(a.x) - n(b.x), n(a.z ?? a.y) - n(b.z ?? b.y));

const OWNERSHIP_BOUNDARY = Object.freeze({
  rendererOwns: "presentation-only",
  kitsOwn: "serializable-horde-pathing-readiness-descriptors",
  forbiddenOwners: ["renderer", "dom", "browser-input", "three", "webgl", "audio", "asset-loading", "frame-loop"]
});

function descriptor(kind, id, fields = {}) {
  return { kind, id: String(id ?? kind), ...fields };
}

function playerPosition(snapshot = {}) {
  return pos(snapshot.player?.position ?? snapshot.position ?? {});
}

function facing(snapshot = {}) {
  const raw = snapshot.player?.facing ?? snapshot.facing ?? { x: 0, z: -1 };
  const length = Math.hypot(n(raw.x), n(raw.z ?? raw.y)) || 1;
  return { x: n(raw.x) / length, z: n(raw.z ?? raw.y) / length };
}

function monsterThreat(monster = {}) {
  return Math.max(0.35, n(monster.threat?.threat, monster.boss ? 5 : monster.elite ? 2 : 1));
}

function pressureNear(snapshot = {}, point = {}, radius = 18) {
  let pressure = 0;
  for (const monster of snapshot.monsters ?? []) {
    const d = distance(point, pos(monster.position));
    if (d > radius) continue;
    pressure += (1 - d / radius) * monsterThreat(monster) * (monster.boss ? 1.55 : monster.elite ? 1.18 : 1);
  }
  return pressure;
}

function orchardBounds(snapshot = {}) {
  const width = n(snapshot.orchard?.width, 76);
  const depth = n(snapshot.orchard?.depth, 104);
  return { width, depth, halfWidth: width / 2, halfDepth: depth / 2 };
}

function activeWeapon(snapshot = {}) {
  const state = snapshot.weapons ?? {};
  return (state.inventory ?? []).find((weapon) => weapon.instanceId === state.equippedId) ?? state.equipped ?? null;
}

export function createOrchardSpawnLaneForecastKit(options = {}) {
  const maxLanes = Math.max(1, Math.floor(n(options.maxLanes, 6)));
  return {
    id: "orchard-spawn-lane-forecast-kit",
    domain: "horde-pathing.spawn-lane.forecast",
    describe(snapshot = {}) {
      const player = playerPosition(snapshot);
      const fallbackSeeds = (snapshot.orchard?.hauntedZones ?? []).map((zone, index) => ({
        id: zone.id ?? `haunt-${index}`,
        position: pos(zone.position),
        pressure: zone.active ? 1 : 0.55,
        label: zone.label ?? "haunted row"
      }));
      const seeds = (snapshot.monsters ?? []).length
        ? (snapshot.monsters ?? []).map((monster) => ({
          id: monster.entity ?? monster.id ?? monster.archetypeId,
          position: pos(monster.position),
          pressure: monsterThreat(monster) * (monster.boss ? 1.6 : monster.elite ? 1.25 : 1),
          label: monster.label ?? monster.archetypeId ?? "horde"
        }))
        : fallbackSeeds;
      return seeds
        .map((seed, index) => {
          const d = distance(seed.position, player);
          const urgency = clamp01(seed.pressure / 6 + Math.max(0, 1 - d / 72) * 0.54 + clamp01(snapshot.horde?.pressure01 ?? 0) * 0.24);
          return descriptor("spawn-lane-forecast", seed.id ?? index, {
            from: seed.position,
            to: player,
            position: seed.position,
            label: seed.label,
            urgency,
            distance: d,
            width: 0.9 + urgency * 3.6,
            opacity: 0.1 + urgency * 0.44,
            color: urgency > 0.72 ? "#ff365f" : urgency > 0.44 ? "#ffd168" : "#b6d66f"
          });
        })
        .sort((a, b) => b.urgency - a.urgency || a.distance - b.distance)
        .slice(0, maxLanes);
    }
  };
}

export function createOrchardChokeRowPriorityKit(options = {}) {
  const maxRows = Math.max(1, Math.floor(n(options.maxRows, 5)));
  return {
    id: "orchard-choke-row-priority-kit",
    domain: "horde-pathing.choke-row.priority",
    describe(snapshot = {}) {
      const player = playerPosition(snapshot);
      const { width } = orchardBounds(snapshot);
      return (snapshot.orchard?.treeRows ?? [])
        .map((row, index) => {
          const z = n(row.z ?? row.centerZ ?? row.position?.z, index * 8);
          const center = { x: 0, z };
          const rowPressure = pressureNear(snapshot, center, 24);
          const playerNear = Math.max(0, 1 - Math.abs(player.z - z) / 58);
          const priority = clamp01(rowPressure / 6 + playerNear * 0.32 + clamp01(snapshot.horde?.pressure01 ?? 0) * 0.25);
          return { row, index, center, priority };
        })
        .sort((a, b) => b.priority - a.priority)
        .slice(0, maxRows)
        .map(({ row, index, center, priority }) => descriptor("choke-row-priority", row.id ?? `row-${index}`, {
          center,
          position: center,
          rowIndex: index,
          priority,
          width: width * (0.55 + priority * 0.28),
          length: 0.72 + priority * 1.7,
          rotation: 0,
          opacity: 0.05 + priority * 0.22,
          color: priority > 0.68 ? "#ff365f" : "#d0a25b"
        }));
    }
  };
}

export function createOrchardNoiseLureConeKit(options = {}) {
  const cones = Math.max(1, Math.floor(n(options.cones, 3)));
  return {
    id: "orchard-noise-lure-cone-kit",
    domain: "horde-pathing.noise-lure.cone",
    describe(snapshot = {}) {
      const player = playerPosition(snapshot);
      const f = facing(snapshot);
      const recentAction = clamp01(n(snapshot.recentClears) / 4 + n(snapshot.recentApples) / 8 + Math.max(0, n(snapshot.scoreMomentum)) * 0.34);
      const pressure = clamp01(snapshot.horde?.pressure01 ?? snapshot.horde?.pressure ?? 0);
      return Array.from({ length: cones }, (_, index) => {
        const t = index + 1;
        const reach = 4 + t * 3.8 + pressure * 3.5;
        const center = { x: player.x + f.x * reach, z: player.z + f.z * reach };
        const intensity = clamp01(0.18 + pressure * 0.42 + recentAction * 0.34 - index * 0.08);
        return descriptor("noise-lure-cone", `cone-${index}`, {
          center,
          position: center,
          intensity,
          width: 3.2 + t * 1.4 + intensity * 2.4,
          length: 3.4 + t * 1.9 + intensity * 3.6,
          rotation: Math.atan2(f.z, f.x) - Math.PI / 2,
          opacity: 0.04 + intensity * 0.18,
          color: intensity > 0.62 ? "#ffd168" : "#b98a45"
        });
      });
    }
  };
}

export function createOrchardPanicRetreatThreadKit(options = {}) {
  const maxThreads = Math.max(1, Math.floor(n(options.maxThreads, 3)));
  return {
    id: "orchard-panic-retreat-thread-kit",
    domain: "horde-pathing.panic-retreat.thread",
    describe(snapshot = {}) {
      const player = playerPosition(snapshot);
      const monsters = snapshot.monsters ?? [];
      const pressure = clamp01(snapshot.horde?.pressure01 ?? snapshot.horde?.pressure ?? 0);
      const average = monsters.length
        ? monsters.reduce((sum, monster) => ({ x: sum.x + pos(monster.position).x, z: sum.z + pos(monster.position).z }), { x: 0, z: 0 })
        : { x: player.x - facing(snapshot).x, z: player.z - facing(snapshot).z };
      const center = monsters.length ? { x: average.x / monsters.length, z: average.z / monsters.length } : average;
      const away = { x: player.x - center.x, z: player.z - center.z };
      const length = Math.hypot(away.x, away.z) || 1;
      const dir = { x: away.x / length, z: away.z / length };
      const { halfWidth, halfDepth } = orchardBounds(snapshot);
      return Array.from({ length: maxThreads }, (_, index) => {
        const spread = (index - (maxThreads - 1) / 2) * 0.42;
        const dx = dir.x * Math.cos(spread) - dir.z * Math.sin(spread);
        const dz = dir.x * Math.sin(spread) + dir.z * Math.cos(spread);
        const urgency = clamp01(pressure + (1 - clamp01(snapshot.health01 ?? 1)) * 0.45 + monsters.length * 0.035 - index * 0.1);
        const to = {
          x: clamp(player.x + dx * (12 + urgency * 24), -halfWidth + 4, halfWidth - 4),
          z: clamp(player.z + dz * (12 + urgency * 24), -halfDepth + 4, halfDepth - 4)
        };
        return descriptor("panic-retreat-thread", `retreat-${index}`, {
          from: player,
          to,
          position: to,
          urgency,
          width: 1 + urgency * 3,
          opacity: 0.1 + urgency * 0.36,
          color: urgency > 0.66 ? "#ff365f" : "#8fd56b"
        });
      });
    }
  };
}

export function createOrchardWeaponUptimeRingKit(options = {}) {
  return {
    id: "orchard-weapon-uptime-ring-kit",
    domain: "horde-pathing.weapon.uptime-ring",
    describe(snapshot = {}) {
      const weapon = activeWeapon(snapshot);
      const player = playerPosition(snapshot);
      const ammo = weapon?.ammo == null ? 1 : clamp01(n(weapon.ammo) / Math.max(1, n(weapon.maxAmmo, weapon.ammo)));
      const durability = weapon?.durability == null ? 1 : clamp01(n(weapon.durability) / Math.max(1, n(weapon.maxDurability, weapon.durability)));
      const uptime = weapon ? clamp01((ammo + durability) / 2) : 0.18;
      const targetPressure = snapshot.targetMonster ? clamp01(monsterThreat(snapshot.targetMonster) / 5) : 0;
      return [descriptor("weapon-uptime-ring", weapon?.instanceId ?? "empty-hands", {
        position: player,
        label: weapon?.label ?? snapshot.weaponLabel ?? "empty hands",
        uptime,
        targetPressure,
        radius: 2.4 + uptime * 3.2 + targetPressure * 1.4,
        thickness: 1.3 + uptime * 2.2,
        opacity: 0.1 + uptime * 0.28 + targetPressure * 0.12,
        color: uptime < 0.3 ? "#ff365f" : uptime < 0.62 ? "#ffd168" : "#b6d66f"
      })];
    }
  };
}

export function createOrchardRoundSurgeCountdownKit(options = {}) {
  return {
    id: "orchard-round-surge-countdown-kit",
    domain: "horde-pathing.round.surge-countdown",
    describe(snapshot = {}) {
      const round = snapshot.round ?? {};
      const pressure = clamp01(snapshot.horde?.pressure01 ?? snapshot.horde?.pressure ?? 0);
      const active = round.status === "active" || pressure > 0.2 || (snapshot.monsters ?? []).length > 0;
      const boss = Boolean(round.bossWave) || (snapshot.monsters ?? []).some((monster) => monster.boss);
      const surge = clamp01(pressure * 0.72 + (active ? 0.18 : 0) + (boss ? 0.28 : 0) + n(snapshot.recentHits) / 10);
      return [descriptor("round-surge-countdown", round.round ?? "breathing-room", {
        position: playerPosition(snapshot),
        round: round.round ?? round.nextRound ?? 1,
        active,
        boss,
        surge,
        radius: 7 + surge * 12,
        thickness: 1.4 + surge * 3.2,
        opacity: 0.08 + surge * 0.3,
        color: boss ? "#ff365f" : surge > 0.58 ? "#ffd168" : "#8061ff"
      })];
    }
  };
}

export function createOrchardHordePathingRendererHandoffKit(options = {}) {
  return {
    id: "orchard-horde-pathing-renderer-handoff-kit",
    domain: "horde-pathing.renderer-handoff",
    describe(readiness = {}) {
      const descriptors = {
        spawnLaneForecasts: readiness.spawnLaneForecasts ?? [],
        chokeRowPriorities: readiness.chokeRowPriorities ?? [],
        noiseLureCones: readiness.noiseLureCones ?? [],
        panicRetreatThreads: readiness.panicRetreatThreads ?? [],
        weaponUptimeRings: readiness.weaponUptimeRings ?? [],
        roundSurgeCountdowns: readiness.roundSurgeCountdowns ?? []
      };
      return {
        id: "orchard-horde-pathing-renderer-handoff",
        policy: "renderer-consumes-descriptors-only",
        ownership: OWNERSHIP_BOUNDARY,
        descriptors,
        descriptorCounts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]))
      };
    }
  };
}

export function createZombieOrchardHordePathingReadinessDomainKit(options = {}) {
  const spawnForecast = options.spawnForecast ?? createOrchardSpawnLaneForecastKit(options.spawnLaneForecast);
  const chokeRows = options.chokeRows ?? createOrchardChokeRowPriorityKit(options.chokeRowPriority);
  const noiseCones = options.noiseCones ?? createOrchardNoiseLureConeKit(options.noiseLureCone);
  const retreatThreads = options.retreatThreads ?? createOrchardPanicRetreatThreadKit(options.panicRetreatThread);
  const uptimeRings = options.uptimeRings ?? createOrchardWeaponUptimeRingKit(options.weaponUptimeRing);
  const surgeCountdowns = options.surgeCountdowns ?? createOrchardRoundSurgeCountdownKit(options.roundSurgeCountdown);
  const handoff = options.handoff ?? createOrchardHordePathingRendererHandoffKit(options.rendererHandoff);
  return {
    id: "zombie-orchard-horde-pathing-readiness-domain-kit",
    domain: "zombie-orchard.horde-pathing-readiness",
    compose(snapshot = {}, survivalReadability = {}, foragingReadability = {}) {
      const enriched = { ...snapshot, survivalReadability, foragingReadability };
      const readiness = {
        spawnLaneForecasts: spawnForecast.describe(enriched),
        chokeRowPriorities: chokeRows.describe(enriched),
        noiseLureCones: noiseCones.describe(enriched),
        panicRetreatThreads: retreatThreads.describe(enriched),
        weaponUptimeRings: uptimeRings.describe(enriched),
        roundSurgeCountdowns: surgeCountdowns.describe(enriched)
      };
      return {
        ...readiness,
        summary: {
          descriptorCount: Object.values(readiness).reduce((sum, list) => sum + list.length, 0),
          pressure01: clamp01(snapshot.horde?.pressure01 ?? snapshot.horde?.pressure ?? 0),
          activeMonsters: (snapshot.monsters ?? []).length,
          rendererHandoffPolicy: "renderer-consumes-descriptors-only"
        },
        rendererHandoff: handoff.describe(readiness)
      };
    }
  };
}

export const ZOMBIE_ORCHARD_HORDE_PATHING_READINESS_TREE = `zombie-orchard-horde-pathing-readiness-domain
├─ horde-approach-domain
│  ├─ spawn-lane-domain
│  │  └─ orchard-spawn-lane-forecast-kit
│  └─ choke-row-domain
│     └─ orchard-choke-row-priority-kit
├─ noise-and-retreat-domain
│  ├─ noise-lure-domain
│  │  └─ orchard-noise-lure-cone-kit
│  └─ panic-retreat-domain
│     └─ orchard-panic-retreat-thread-kit
├─ combat-tempo-domain
│  ├─ weapon-uptime-domain
│  │  └─ orchard-weapon-uptime-ring-kit
│  └─ round-surge-domain
│     └─ orchard-round-surge-countdown-kit
└─ renderer-handoff
   └─ orchard-horde-pathing-renderer-handoff-kit
      └─ renderer consumes descriptors only`;
