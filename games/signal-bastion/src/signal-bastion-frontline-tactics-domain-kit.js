const SIGNAL_BASTION_FRONTLINE_TACTICS_TREE = `signal-bastion-frontline-tactics-readability-domain
├─ placement-intent-domain
│  ├─ build-slot-value-domain
│  │  └─ bastion-build-slot-value-field-kit
│  └─ tower-role-balance-domain
│     └─ bastion-tower-role-balance-ribbon-kit
├─ intercept-response-domain
│  ├─ intercept-zone-domain
│  │  └─ bastion-intercept-zone-bracket-kit
│  └─ boss-focus-domain
│     └─ bastion-boss-focus-lens-kit
├─ economy-timing-domain
│  ├─ overkill-dampening-domain
│  │  └─ bastion-overkill-dampening-chip-kit
│  └─ salvage-window-domain
│     └─ bastion-salvage-window-flag-kit
└─ renderer-handoff
   └─ bastion-frontline-tactics-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

const FRONTLINE_COLORS = Object.freeze({
  slot: "#6bf0b8",
  role: "#8bd3ff",
  intercept: "#ffb86b",
  boss: "#ff7a5c",
  overkill: "#f7a8ff",
  salvage: "#ffe36d"
});

const SIGNAL_BASTION_FRONTLINE_HANDOFF_POLICY = Object.freeze({
  rendererConsumesDescriptorsOnly: true,
  noDomOwnership: true,
  noInputOwnership: true,
  noFrameLoopOwnership: true,
  noThreeOwnership: true,
  noWebglOwnership: true,
  noAudioOwnership: true,
  noAssetLoadingOwnership: true
});

function number(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, number(value, min)));
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value);
  return [];
}

function makeId(prefix, parts = []) {
  return [prefix, ...parts]
    .map((part) => String(part).replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, ""))
    .filter(Boolean)
    .join(":");
}

function getPresentation(input = {}) {
  return input.presentation?.rawSnapshot ? input.presentation : input.rawSnapshot ? input : { rawSnapshot: input };
}

function getRaw(input = {}) {
  return getPresentation(input).rawSnapshot ?? {};
}

function point(value = {}) {
  return {
    x: number(value.x),
    y: number(value.y),
    z: number(value.z)
  };
}

function midpoint(a = {}, b = {}) {
  return {
    x: (number(a.x) + number(b.x)) * 0.5,
    y: (number(a.y) + number(b.y)) * 0.5,
    z: (number(a.z) + number(b.z)) * 0.5
  };
}

function lerpPoint(a = {}, b = {}, t = 0.5) {
  const amount = clamp(t);
  return {
    x: number(a.x) + (number(b.x) - number(a.x)) * amount,
    y: number(a.y) + (number(b.y) - number(a.y)) * amount,
    z: number(a.z) + (number(b.z) - number(a.z)) * amount
  };
}

function distance(a = {}, b = {}) {
  return Math.hypot(number(a.x) - number(b.x), number(a.y) - number(b.y));
}

function getMap(raw) {
  return raw.map ?? raw.level?.map ?? {};
}

function getPath(raw) {
  const path = asArray(getMap(raw).path).map(point);
  if (path.length >= 2) return path;
  return [
    { x: 80, y: 440, z: 0 },
    { x: 250, y: 330, z: 0 },
    { x: 520, y: 280, z: 0 },
    { x: 780, y: 160, z: 0 }
  ];
}

function getVital(raw) {
  return point(getMap(raw).vital ?? raw.vital ?? { x: 820, y: 135, z: 0 });
}

function getSlots(raw) {
  const slots = asArray(getMap(raw).slots).map((slot, index) => ({
    ...point(slot),
    id: slot.id ?? slot.key ?? `slot-${index}`,
    occupied: Boolean(slot.occupied ?? slot.structureId)
  }));
  if (slots.length) return slots;
  return [
    { id: "slot-a", x: 250, y: 320, z: 0 },
    { id: "slot-b", x: 480, y: 255, z: 0 },
    { id: "slot-c", x: 670, y: 198, z: 0 }
  ];
}

function getStructures(raw) {
  return asArray(raw.structures?.structures ?? raw.structures ?? raw.towers)
    .filter((item) => item && typeof item === "object")
    .map((structure, index) => ({
      ...structure,
      id: structure.id ?? `tower-${index}`,
      x: number(structure.x),
      y: number(structure.y),
      z: number(structure.z),
      level: number(structure.level, 1),
      range: number(structure.range, 135),
      damage: number(structure.damage ?? structure.dps, 8),
      towerType: structure.towerType ?? structure.type ?? "tower"
    }));
}

function getAgents(raw) {
  return asArray(raw.agents?.active ?? raw.agents ?? raw.enemies)
    .filter((item) => item && typeof item === "object")
    .map((agent, index) => ({
      ...agent,
      id: agent.id ?? `enemy-${index}`,
      x: number(agent.x),
      y: number(agent.y),
      z: number(agent.z),
      health: number(agent.health ?? agent.hp, 1),
      maxHealth: number(agent.maxHealth ?? agent.maxHp, 1),
      speed: number(agent.speed, 1),
      boss: Boolean(agent.boss)
    }));
}

function getCredits(raw) {
  return number(raw.economy?.wallet?.credits ?? raw.wallet?.credits ?? raw.economy?.credits);
}

function getLives(raw) {
  return number(raw.session?.lives ?? raw.lives ?? 20, 20);
}

function getWave(raw) {
  const waveIndex = number(raw.session?.waveIndex ?? raw.wave?.index ?? raw.waveIndex);
  const wave = raw.level?.waves?.[waveIndex] ?? raw.wave ?? {};
  const queue = asArray(wave.spawnQueue ?? wave.queue ?? wave.enemies);
  return {
    waveIndex,
    active: Boolean(raw.session?.waveActive ?? raw.wave?.active),
    queue
  };
}

function nearestPathPoint(source, path) {
  let best = path[0] ?? { x: 0, y: 0, z: 0 };
  let bestDistance = Infinity;
  for (const candidate of path) {
    const candidateDistance = distance(source, candidate);
    if (candidateDistance < bestDistance) {
      best = candidate;
      bestDistance = candidateDistance;
    }
  }
  return point(best);
}

function nearestStructureDistance(source, structures) {
  return structures.reduce((best, structure) => Math.min(best, distance(source, structure)), Infinity);
}

function getBlueprintCost(input = {}, fallback = 120) {
  const activeBlueprint = input.activeBlueprint;
  const catalog = asArray(input.buildCatalog ?? input.preset?.level?.buildOrder ?? input.preset?.buildOrder);
  const blueprint = catalog.find((item) => item?.id === activeBlueprint || item?.key === activeBlueprint || item?.towerType === activeBlueprint);
  return number(blueprint?.cost, fallback);
}

function getRoleLabel(structure = {}) {
  const type = String(structure.towerType ?? structure.type ?? "tower").toLowerCase();
  if (type.includes("drum") || type.includes("mortar") || type.includes("aoe")) return "area";
  if (type.includes("spire") || type.includes("needle") || type.includes("lance")) return "pierce";
  if (type.includes("slow") || type.includes("frost")) return "control";
  return "single";
}

export function createBastionBuildSlotValueFieldKit() {
  return {
    id: "bastion-build-slot-value-field-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const slots = getSlots(raw);
      const structures = getStructures(raw);
      const path = getPath(raw);
      const credits = getCredits(raw);
      const cost = getBlueprintCost(input);
      const affordable = credits >= cost;
      const cells = slots.slice(0, 14).map((slot, index) => {
        const nearestPath = nearestPathPoint(slot, path);
        const pathProximity = 1 - clamp(distance(slot, nearestPath) / 260);
        const nearestTower = nearestStructureDistance(slot, structures);
        const coverageNeed = clamp((nearestTower === Infinity ? 0.9 : nearestTower / 280) + (slot.occupied ? -0.45 : 0));
        const value = clamp(pathProximity * 0.54 + coverageNeed * 0.34 + (affordable ? 0.12 : -0.1), 0.05, 1);
        return {
          id: makeId("frontline-slot-value", [slot.id ?? index]),
          kind: "tower-synergy-cell",
          semanticKind: "build-slot-value-cell",
          center: point(slot),
          radius: 34 + value * 66,
          range: 120 + value * 100,
          level: slot.occupied ? 0 : Math.ceil(value * 4),
          neighbors: structures.filter((structure) => distance(slot, structure) <= 220).length,
          synergy: value,
          color: affordable ? FRONTLINE_COLORS.slot : FRONTLINE_COLORS.salvage,
          label: affordable ? "build value" : "save credits"
        };
      });
      return {
        id: "bastion-build-slot-value-field",
        kind: "tower-synergy-cell-set",
        semanticKind: "build-slot-value-field",
        rendererNeutral: true,
        affordable,
        credits,
        cost,
        cells
      };
    }
  };
}

export function createBastionTowerRoleBalanceRibbonKit() {
  return {
    id: "bastion-tower-role-balance-ribbon-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const structures = getStructures(raw);
      const path = getPath(raw);
      const slots = getSlots(raw);
      const roles = structures.reduce((acc, structure) => {
        const role = getRoleLabel(structure);
        acc[role] = (acc[role] ?? 0) + 1;
        return acc;
      }, {});
      const missingControl = !roles.control && structures.length >= 2;
      const missingArea = !roles.area && getWave(raw).queue.length >= 3;
      const targetSlots = slots.slice(0, 4);
      const ribbons = targetSlots.map((slot, index) => {
        const from = point(slot);
        const nearest = nearestPathPoint(slot, path);
        const pathIndex = path.findIndex((candidate) => distance(candidate, nearest) < 0.1);
        const to = lerpPoint(nearest, path[Math.min(path.length - 1, Math.max(0, pathIndex) + 1)] ?? nearest, 0.3);
        const priority = clamp(0.24 + (missingControl ? 0.18 : 0) + (missingArea ? 0.18 : 0) + index * 0.06);
        return {
          id: makeId("frontline-role-balance", [slot.id ?? index]),
          kind: "economy-flow-ribbon",
          semanticKind: "tower-role-balance-ribbon",
          from,
          mid: midpoint(from, to),
          to,
          width: 4 + priority * 12,
          intensity: priority,
          color: missingArea ? FRONTLINE_COLORS.intercept : FRONTLINE_COLORS.role,
          label: missingArea ? "add area" : missingControl ? "add control" : "balance ok"
        };
      });
      return {
        id: "bastion-tower-role-balance-ribbons",
        kind: "economy-flow-ribbon-set",
        semanticKind: "tower-role-balance-ribbon-set",
        rendererNeutral: true,
        roles,
        missingArea,
        missingControl,
        ribbons
      };
    }
  };
}

export function createBastionInterceptZoneBracketKit() {
  return {
    id: "bastion-intercept-zone-bracket-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const agents = getAgents(raw);
      const structures = getStructures(raw);
      const path = getPath(raw);
      const vital = getVital(raw);
      const pressure = agents.length ? agents : getWave(raw).queue.map((enemy, index) => ({ id: `queued-${index}`, x: path[0]?.x ?? 80, y: path[0]?.y ?? 440, z: 0, health: 1, maxHealth: 1, speed: 1 + index * 0.08, boss: String(enemy).includes("boss") }));
      const segments = pressure.slice(0, 12).map((agent, index) => {
        const source = point(agent);
        const nearest = nearestPathPoint(source, path);
        const defenders = structures.filter((structure) => distance(structure, nearest) <= number(structure.range, 145)).length;
        const distanceToVital = distance(nearest, vital);
        const pressureScore = clamp((agent.boss ? 0.32 : 0.12) + (1 - clamp(distanceToVital / 760)) * 0.48 + number(agent.speed, 1) * 0.07 - defenders * 0.06);
        return {
          id: makeId("frontline-intercept-zone", [agent.id ?? index]),
          kind: "path-threat-segment",
          semanticKind: "intercept-zone-bracket",
          from: lerpPoint(nearest, source, 0.2),
          mid: midpoint(nearest, vital),
          to: lerpPoint(nearest, vital, 0.36),
          pressure: pressureScore,
          width: 8 + pressureScore * 34,
          color: FRONTLINE_COLORS.intercept,
          defenders,
          pulse: pressureScore
        };
      });
      return {
        id: "bastion-intercept-zone-brackets",
        kind: "path-threat-gradient",
        semanticKind: "intercept-zone-bracket-set",
        rendererNeutral: true,
        segments
      };
    }
  };
}

export function createBastionBossFocusLensKit() {
  return {
    id: "bastion-boss-focus-lens-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const agents = getAgents(raw);
      const structures = getStructures(raw);
      const path = getPath(raw);
      const vital = getVital(raw);
      const targets = agents
        .filter((agent) => agent.boss || agent.health >= agent.maxHealth * 0.7 || agent.speed >= 1.35)
        .slice(0, 6);
      const fallbacks = targets.length ? targets : getWave(raw).queue.slice(0, 3).map((enemy, index) => ({
        id: `forecast-${index}`,
        x: path[Math.min(index, path.length - 1)]?.x ?? 100,
        y: path[Math.min(index, path.length - 1)]?.y ?? 400,
        z: 0,
        health: String(enemy).includes("boss") ? 160 : 60,
        maxHealth: String(enemy).includes("boss") ? 160 : 60,
        boss: String(enemy).includes("boss"),
        speed: 1 + index * 0.1
      }));
      const threads = fallbacks.map((agent, index) => {
        const source = point(agent);
        const bestTower = structures.reduce((best, tower) => {
          const d = distance(source, tower);
          return d < best.distance ? { tower, distance: d } : best;
        }, { tower: null, distance: Infinity }).tower;
        const to = bestTower ? point(bestTower) : vital;
        const danger = clamp((agent.boss ? 0.48 : 0.18) + number(agent.health, 1) / Math.max(1, number(agent.maxHealth, 1)) * 0.22 + (1 - clamp(distance(source, vital) / 740)) * 0.22);
        return {
          id: makeId("frontline-boss-focus", [agent.id ?? index]),
          kind: "enemy-intent-thread",
          semanticKind: "boss-focus-lens",
          from: source,
          mid: midpoint(source, to),
          to,
          danger,
          width: 1.5 + danger * 5,
          color: FRONTLINE_COLORS.boss,
          label: agent.boss ? "boss focus" : "elite focus"
        };
      });
      return {
        id: "bastion-boss-focus-lenses",
        kind: "enemy-intent-thread-set",
        semanticKind: "boss-focus-lens-set",
        rendererNeutral: true,
        threads
      };
    }
  };
}

export function createBastionOverkillDampeningChipKit() {
  return {
    id: "bastion-overkill-dampening-chip-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const structures = getStructures(raw);
      const agents = getAgents(raw);
      const path = getPath(raw);
      const vital = getVital(raw);
      const center = agents[0] ? nearestPathPoint(agents[0], path) : path[Math.floor(path.length * 0.5)] ?? vital;
      const totalDamage = structures.reduce((sum, tower) => sum + number(tower.damage, 8) * Math.max(1, number(tower.level, 1)), 0);
      const activeHealth = agents.reduce((sum, agent) => sum + number(agent.health, 1), 0);
      const overkill = clamp((totalDamage - activeHealth * 0.32) / Math.max(1, totalDamage + activeHealth));
      const rings = Array.from({ length: 4 }, (_, index) => ({
        id: makeId("frontline-overkill-ring", [index]),
        center: { ...point(center), z: index * 2 },
        radius: 34 + index * 18 + overkill * 30,
        color: FRONTLINE_COLORS.overkill,
        opacity: 0.12 + overkill * 0.16 + index * 0.025
      }));
      return {
        id: "bastion-overkill-dampening-chip",
        kind: "wave-readiness-glyph",
        semanticKind: "overkill-dampening-chip",
        rendererNeutral: true,
        urgency: overkill,
        totalDamage,
        activeHealth,
        rings
      };
    }
  };
}

export function createBastionSalvageWindowFlagKit() {
  return {
    id: "bastion-salvage-window-flag-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const structures = getStructures(raw);
      const path = getPath(raw);
      const lives = getLives(raw);
      const credits = getCredits(raw);
      const candidates = structures
        .map((tower, index) => {
          const nearest = nearestPathPoint(tower, path);
          const pathDistance = distance(tower, nearest);
          const salvage = clamp(pathDistance / 300 + (number(tower.level, 1) <= 1 ? 0.1 : -0.08) + (credits < 120 ? 0.24 : 0) - (lives < 8 ? 0.16 : 0));
          return { tower, index, nearest, salvage };
        })
        .sort((a, b) => b.salvage - a.salvage)
        .slice(0, 5);
      const ribbons = candidates.map(({ tower, index, nearest, salvage }) => ({
        id: makeId("frontline-salvage-window", [tower.id ?? index]),
        kind: "economy-flow-ribbon",
        semanticKind: "salvage-window-flag",
        from: point(tower),
        mid: midpoint(tower, nearest),
        to: nearest,
        width: 3 + salvage * 10,
        intensity: salvage,
        color: FRONTLINE_COLORS.salvage,
        label: salvage > 0.52 ? "salvage window" : "hold tower"
      }));
      return {
        id: "bastion-salvage-window-flags",
        kind: "economy-flow-ribbon-set",
        semanticKind: "salvage-window-flag-set",
        rendererNeutral: true,
        credits,
        lives,
        ribbons
      };
    }
  };
}

export function createBastionFrontlineTacticsRendererHandoffKit() {
  return {
    id: "bastion-frontline-tactics-renderer-handoff-kit",
    kind: "renderer-handoff-kit",
    describe({
      buildSlotValue,
      towerRoleBalance,
      interceptZones,
      bossFocus,
      overkillDampening,
      salvageWindows
    } = {}) {
      const descriptors = [
        buildSlotValue,
        towerRoleBalance,
        interceptZones,
        bossFocus,
        overkillDampening,
        salvageWindows
      ].filter(Boolean);
      return {
        id: "bastion-frontline-tactics-renderer-handoff",
        kind: "renderer-handoff",
        semanticKind: "frontline-tactics-renderer-handoff",
        rendererNeutral: true,
        policy: SIGNAL_BASTION_FRONTLINE_HANDOFF_POLICY,
        descriptors,
        counts: {
          descriptors: descriptors.length,
          buildSlotValueCells: buildSlotValue?.cells?.length ?? 0,
          towerRoleBalanceRibbons: towerRoleBalance?.ribbons?.length ?? 0,
          interceptZoneBrackets: interceptZones?.segments?.length ?? 0,
          bossFocusLenses: bossFocus?.threads?.length ?? 0,
          overkillDampeningRings: overkillDampening?.rings?.length ?? 0,
          salvageWindowFlags: salvageWindows?.ribbons?.length ?? 0
        }
      };
    }
  };
}

export function createSignalBastionFrontlineTacticsDomainKit() {
  const buildSlotValueKit = createBastionBuildSlotValueFieldKit();
  const towerRoleBalanceKit = createBastionTowerRoleBalanceRibbonKit();
  const interceptZoneKit = createBastionInterceptZoneBracketKit();
  const bossFocusKit = createBastionBossFocusLensKit();
  const overkillDampeningKit = createBastionOverkillDampeningChipKit();
  const salvageWindowKit = createBastionSalvageWindowFlagKit();
  const rendererHandoffKit = createBastionFrontlineTacticsRendererHandoffKit();

  return {
    id: "signal-bastion-frontline-tactics-domain-kit",
    kind: "domain-kit",
    tree: SIGNAL_BASTION_FRONTLINE_TACTICS_TREE,
    describe(input = {}) {
      const buildSlotValue = buildSlotValueKit.describe(input);
      const towerRoleBalance = towerRoleBalanceKit.describe(input);
      const interceptZones = interceptZoneKit.describe(input);
      const bossFocus = bossFocusKit.describe(input);
      const overkillDampening = overkillDampeningKit.describe(input);
      const salvageWindows = salvageWindowKit.describe(input);
      const rendererHandoff = rendererHandoffKit.describe({
        buildSlotValue,
        towerRoleBalance,
        interceptZones,
        bossFocus,
        overkillDampening,
        salvageWindows
      });
      return {
        id: "signal-bastion-frontline-tactics-readability-domain",
        kind: "frontline-tactics-readability-domain",
        rendererNeutral: true,
        tree: SIGNAL_BASTION_FRONTLINE_TACTICS_TREE,
        buildSlotValue,
        towerRoleBalance,
        interceptZones,
        bossFocus,
        overkillDampening,
        salvageWindows,
        rendererHandoff
      };
    }
  };
}

export { SIGNAL_BASTION_FRONTLINE_TACTICS_TREE, SIGNAL_BASTION_FRONTLINE_HANDOFF_POLICY };
