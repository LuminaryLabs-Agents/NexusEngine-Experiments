const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.max(0, Math.min(1, n(value)));
const distance = (a = {}, b = {}) => Math.hypot(n(a.x) - n(b.x), n(a.z ?? a.y) - n(b.z ?? b.y));
const pos = (point = {}) => ({ x: n(point.x), z: n(point.z ?? point.y) });

const OWNERSHIP_BOUNDARY = Object.freeze({
  rendererOwns: "presentation-only",
  kitsOwn: "serializable-survival-readability-descriptors",
  forbiddenOwners: ["renderer", "dom", "browser-input", "three", "webgl", "audio", "asset-loading", "frame-loop"]
});

function descriptor(kind, id, fields = {}) {
  return { kind, id: String(id ?? kind), ...fields };
}

export function createOrchardThreatGradientKit(options = {}) {
  const maxMonsters = Math.max(1, Math.floor(n(options.maxMonsters, 8)));
  return {
    id: "orchard-threat-gradient-kit",
    domain: "survival.threat.gradient",
    describe(snapshot = {}) {
      const playerPosition = pos(snapshot.player?.position);
      const pressure = clamp01(snapshot.horde?.pressure01 ?? snapshot.horde?.pressure ?? 0);
      return (snapshot.monsters ?? []).slice(0, maxMonsters).map((monster, index) => {
        const monsterPosition = pos(monster.position);
        const range = distance(playerPosition, monsterPosition);
        const threat = Math.max(0.25, n(monster.threat?.threat, monster.boss ? 5 : monster.elite ? 2 : 1));
        const urgency = clamp01((18 - Math.min(range, 18)) / 18 * 0.7 + pressure * 0.25 + (monster.boss ? 0.25 : 0));
        return descriptor("threat-gradient", monster.entity ?? monster.id ?? index, {
          position: monsterPosition,
          range,
          threat,
          urgency,
          radius: 2.2 + threat * 1.45 + urgency * 2.2,
          color: monster.boss ? "#ff365f" : monster.elite ? "#f0d27b" : "#b6d66f",
          opacity: 0.14 + urgency * 0.44
        });
      });
    }
  };
}

export function createOrchardResourceRouteKit(options = {}) {
  const maxRoutes = Math.max(1, Math.floor(n(options.maxRoutes, 4)));
  return {
    id: "orchard-resource-route-kit",
    domain: "survival.resource.route",
    describe(snapshot = {}) {
      const playerPosition = pos(snapshot.player?.position);
      const appleRoutes = (snapshot.orchard?.activeApples ?? []).map((apple) => ({
        id: apple.id,
        targetType: "apple",
        position: pos(apple.position),
        priority: apple.id === snapshot.nearestApple?.id ? 1 : 0.42,
        label: apple.label ?? apple.typeId ?? "apple"
      }));
      const weaponRoutes = (snapshot.weapons?.pickups ?? []).filter((pickup) => pickup.active !== false).map((pickup) => ({
        id: pickup.id,
        targetType: "gear",
        position: pos(pickup.position),
        priority: pickup.id === snapshot.nearestWeapon?.id ? 0.92 : 0.36,
        label: String(pickup.weaponId ?? "gear").replaceAll("-", " ")
      }));
      return [...appleRoutes, ...weaponRoutes]
        .map((route) => ({ ...route, distance: distance(playerPosition, route.position) }))
        .sort((a, b) => b.priority - a.priority || a.distance - b.distance)
        .slice(0, maxRoutes)
        .map((route, index) => descriptor("resource-route", route.id ?? index, {
          from: playerPosition,
          to: route.position,
          targetType: route.targetType,
          label: route.label,
          distance: route.distance,
          priority: route.priority,
          width: 0.9 + route.priority * 1.8,
          opacity: 0.16 + route.priority * 0.48,
          color: route.targetType === "apple" ? "#ffd168" : "#a7d8ff"
        }));
    }
  };
}

export function createOrchardStaminaBreathKit(options = {}) {
  return {
    id: "orchard-stamina-breath-kit",
    domain: "survival.player.stamina-breath",
    describe(snapshot = {}) {
      const stamina = clamp01(snapshot.stamina01 ?? 1);
      const health = clamp01(snapshot.health01 ?? 1);
      const danger = snapshot.danger ? 0.22 : 0;
      const stress = clamp01((1 - stamina) * 0.42 + (1 - health) * 0.48 + danger);
      return descriptor("stamina-breath", "player-breath", {
        position: pos(snapshot.player?.position),
        stamina,
        health,
        stress,
        radius: 2.6 + stress * 5.2,
        pulseSpeed: 0.32 + stress * 1.35,
        opacity: 0.12 + stress * 0.42,
        color: stress > 0.72 ? "#ff6b4a" : stamina < 0.34 ? "#f0d27b" : "#fff0b8"
      });
    }
  };
}

export function createOrchardRoundPressureBandKit(options = {}) {
  return {
    id: "orchard-round-pressure-band-kit",
    domain: "survival.round.pressure-band",
    describe(snapshot = {}) {
      const round = snapshot.round ?? {};
      const pressure = clamp01(snapshot.horde?.pressure01 ?? snapshot.horde?.pressure ?? 0);
      const roundNumber = Math.max(1, Math.floor(n(round.round ?? round.nextRound, 1)));
      return descriptor("round-pressure-band", `round-${roundNumber}`, {
        round: roundNumber,
        status: round.status ?? "idle",
        bossWave: Boolean(round.bossWave),
        pressure,
        center: { x: 0, z: 0 },
        radius: 24 + roundNumber * 1.6 + pressure * 9,
        thickness: 1.2 + pressure * 3.4,
        opacity: 0.08 + pressure * 0.28,
        color: round.bossWave ? "#ff365f" : pressure > 0.64 ? "#ff8a4a" : "#8061ff"
      });
    }
  };
}

export function createOrchardEscapeLaneKit(options = {}) {
  const maxLanes = Math.max(1, Math.floor(n(options.maxLanes, 5)));
  return {
    id: "orchard-escape-lane-kit",
    domain: "survival.navigation.escape-lane",
    describe(snapshot = {}) {
      const playerPosition = pos(snapshot.player?.position);
      const rows = snapshot.orchard?.treeRows ?? [];
      const pressure = clamp01(snapshot.horde?.pressure01 ?? snapshot.horde?.pressure ?? 0);
      return rows.slice(0, maxLanes).map((row, index) => {
        const z = n(row.z ?? row.centerZ ?? row.position?.z, index * 8);
        const clearance = clamp01(1 - Math.min(Math.abs(playerPosition.z - z) / 42, 1) * 0.58 - pressure * 0.18);
        return descriptor("escape-lane", row.id ?? index, {
          center: { x: 0, z },
          width: 2.2 + clearance * 2.1,
          length: n(snapshot.orchard?.width, 76) * 0.92,
          clearance,
          opacity: 0.08 + clearance * 0.24,
          color: clearance > 0.56 ? "#8fd56b" : "#d0a25b"
        });
      });
    }
  };
}

export function createOrchardMeleeWindowKit(options = {}) {
  return {
    id: "orchard-melee-window-kit",
    domain: "survival.combat.melee-window",
    describe(snapshot = {}) {
      const cue = snapshot.visualDomains?.combatCue ?? snapshot.combatCue ?? {};
      const target = cue.targetLock ?? snapshot.targetMonster;
      const armed = String(snapshot.weaponLabel ?? "empty hands") !== "empty hands";
      const distanceToTarget = n(target?.range, target?.position ? distance(snapshot.player?.position, target.position) : 0);
      const ready = Boolean(target) && armed && distanceToTarget <= 7.5;
      return descriptor("melee-window", "active-weapon-window", {
        position: target?.position ? pos(target.position) : pos(snapshot.player?.position),
        ready,
        armed,
        distance: distanceToTarget,
        radius: ready ? 4.8 : armed ? 3.4 : 2.4,
        opacity: ready ? 0.5 : 0.14,
        color: ready ? "#fff0b8" : armed ? "#b9a070" : "#6a604d"
      });
    }
  };
}

export function createOrchardSurvivalRendererHandoffKit(options = {}) {
  return {
    id: "orchard-survival-renderer-handoff-kit",
    domain: "survival.renderer-handoff",
    describe(readability = {}) {
      const descriptors = {
        threatGradients: readability.threatGradients ?? [],
        resourceRoutes: readability.resourceRoutes ?? [],
        staminaBreath: readability.staminaBreath ? [readability.staminaBreath] : [],
        roundPressureBands: readability.roundPressureBand ? [readability.roundPressureBand] : [],
        escapeLanes: readability.escapeLanes ?? [],
        meleeWindows: readability.meleeWindow ? [readability.meleeWindow] : []
      };
      return {
        id: "orchard-survival-renderer-handoff",
        policy: "renderer-consumes-descriptors-only",
        ownership: OWNERSHIP_BOUNDARY,
        descriptors,
        descriptorCounts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]))
      };
    }
  };
}

export function createZombieOrchardSurvivalReadabilityDomainKit(options = {}) {
  const threats = options.threats ?? createOrchardThreatGradientKit(options.threatGradient);
  const resources = options.resources ?? createOrchardResourceRouteKit(options.resourceRoute);
  const breath = options.breath ?? createOrchardStaminaBreathKit(options.staminaBreath);
  const pressure = options.pressure ?? createOrchardRoundPressureBandKit(options.roundPressureBand);
  const lanes = options.lanes ?? createOrchardEscapeLaneKit(options.escapeLane);
  const melee = options.melee ?? createOrchardMeleeWindowKit(options.meleeWindow);
  const handoff = options.handoff ?? createOrchardSurvivalRendererHandoffKit(options.rendererHandoff);
  return {
    id: "zombie-orchard-survival-readability-domain-kit",
    domain: "zombie-orchard.survival-readability",
    compose(snapshot = {}, visualDomains = {}) {
      const enriched = { ...snapshot, visualDomains };
      const readability = {
        threatGradients: threats.describe(enriched),
        resourceRoutes: resources.describe(enriched),
        staminaBreath: breath.describe(enriched),
        roundPressureBand: pressure.describe(enriched),
        escapeLanes: lanes.describe(enriched),
        meleeWindow: melee.describe(enriched)
      };
      return {
        ...readability,
        rendererHandoff: handoff.describe(readability)
      };
    }
  };
}

export const ZOMBIE_ORCHARD_SURVIVAL_READABILITY_TREE = `zombie-orchard-survival-readability-domain
├─ threat-readability
│  └─ orchard-threat-gradient-kit
├─ resource-routing
│  └─ orchard-resource-route-kit
├─ player-state-readability
│  └─ orchard-stamina-breath-kit
├─ wave-pressure-readability
│  └─ orchard-round-pressure-band-kit
├─ navigation-readability
│  └─ orchard-escape-lane-kit
├─ combat-readability
│  └─ orchard-melee-window-kit
└─ renderer-handoff
   └─ orchard-survival-renderer-handoff-kit
      └─ renderer consumes descriptors only`;
