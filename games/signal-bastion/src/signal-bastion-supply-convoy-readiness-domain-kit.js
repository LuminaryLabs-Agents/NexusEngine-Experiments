const SIGNAL_BASTION_SUPPLY_CONVOY_TREE = `signal-bastion-supply-convoy-readiness-domain
├─ supply-intake-domain
│  ├─ ammo-cache-domain
│  │  └─ bastion-ammo-cache-pallet-kit
│  └─ ration-water-domain
│     └─ bastion-ration-water-crate-kit
├─ route-security-domain
│  ├─ convoy-lane-domain
│  │  └─ bastion-forward-convoy-lane-kit
│  └─ ambush-watch-domain
│     └─ bastion-ambush-watchtower-kit
├─ resupply-handoff-domain
│  ├─ repair-crew-domain
│  │  └─ bastion-repair-crew-route-kit
│  └─ night-quartermaster-ledger-domain
│     └─ bastion-night-quartermaster-ledger-kit
└─ renderer-handoff
   └─ bastion-supply-convoy-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

const SUPPLY_CONVOY_COLORS = Object.freeze({
  ammo: "#ffe36d",
  ration: "#6bf0b8",
  convoy: "#8bd3ff",
  ambush: "#ff7a5c",
  repair: "#f7a8ff",
  ledger: "#ffb86b"
});

const SIGNAL_BASTION_SUPPLY_CONVOY_HANDOFF_POLICY = Object.freeze({
  rendererConsumesDescriptorsOnly: true,
  noDomOwnership: true,
  noInputOwnership: true,
  noFrameLoopOwnership: true,
  noThreeOwnership: true,
  noWebglOwnership: true,
  noAudioOwnership: true,
  noAssetLoadingOwnership: true,
  noPhysicsOwnership: true
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
    { x: 245, y: 350, z: 0 },
    { x: 505, y: 280, z: 0 },
    { x: 760, y: 165, z: 0 }
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
    { id: "ammo-a", x: 220, y: 375, z: 0, occupied: false },
    { id: "ration-b", x: 445, y: 285, z: 0, occupied: false },
    { id: "repair-c", x: 675, y: 220, z: 0, occupied: true }
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

function getActivePressure(raw) {
  const agents = getAgents(raw);
  if (agents.length) return agents;
  const path = getPath(raw);
  return getWave(raw).queue.slice(0, 8).map((enemy, index) => ({
    id: `queued-${index}`,
    x: path[Math.min(index, path.length - 1)]?.x ?? 100,
    y: path[Math.min(index, path.length - 1)]?.y ?? 400,
    z: 0,
    health: String(enemy).includes("boss") ? 190 : 60 + index * 12,
    maxHealth: String(enemy).includes("boss") ? 190 : 90,
    speed: 0.9 + index * 0.09,
    boss: String(enemy).includes("boss")
  }));
}

function pressureNear(pointLike, agents, radius = 250) {
  return agents.reduce((total, agent) => {
    const closeness = 1 - clamp(distance(pointLike, agent) / radius);
    return total + closeness * (agent.boss ? 1.8 : 1) * number(agent.speed, 1);
  }, 0);
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

function getStagingPoint(raw) {
  const path = getPath(raw);
  const first = path[0] ?? { x: 80, y: 440, z: 0 };
  return { x: number(first.x) - 135, y: number(first.y) + 65, z: 0 };
}

function getConvoyReadiness(raw) {
  const credits = getCredits(raw);
  const lives = getLives(raw);
  const structures = getStructures(raw);
  const wave = getWave(raw);
  const pressure = clamp((getActivePressure(raw).length + wave.queue.length * 0.55) / 14 + (wave.active ? 0.12 : 0));
  const supply = clamp(credits / 420 + structures.length * 0.055 + clamp(lives / 20) * 0.22);
  const readiness = clamp(supply * 0.78 + (1 - pressure) * 0.22);
  return { credits, lives, pressure, supply, readiness, wave };
}

export function createBastionAmmoCachePalletKit() {
  return {
    id: "bastion-ammo-cache-pallet-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const agents = getActivePressure(raw);
      const { credits, readiness } = getConvoyReadiness(raw);
      const cells = getSlots(raw).slice(0, 10).map((slot, index) => {
        const pressure = clamp(pressureNear(slot, agents, 250) / 3);
        const ammo = clamp(0.18 + credits / 500 + readiness * 0.35 - pressure * 0.22 - (slot.occupied ? 0.08 : 0));
        return {
          id: makeId("ammo-cache-pallet", [slot.id ?? index]),
          kind: "tower-synergy-cell",
          semanticKind: "bastion-ammo-cache-pallet",
          center: point(slot),
          radius: 34 + ammo * 54,
          level: Math.max(1, Math.ceil(ammo * 5)),
          pressure,
          synergy: ammo,
          color: ammo > 0.56 ? SUPPLY_CONVOY_COLORS.ammo : SUPPLY_CONVOY_COLORS.ambush,
          label: ammo > 0.56 ? "ammo stocked" : "ammo thin"
        };
      });
      return {
        id: "bastion-ammo-cache-pallets",
        kind: "tower-synergy-cell-set",
        semanticKind: "bastion-ammo-cache-pallet-set",
        rendererNeutral: true,
        credits,
        cells
      };
    }
  };
}

export function createBastionRationWaterCrateKit() {
  return {
    id: "bastion-ration-water-crate-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const vital = getVital(raw);
      const { lives, pressure, readiness } = getConvoyReadiness(raw);
      const scarcity = clamp((1 - clamp(lives / 20)) * 0.55 + pressure * 0.28 + (1 - readiness) * 0.17);
      const rings = Array.from({ length: 4 }, (_, index) => ({
        id: makeId("ration-water-crate-ring", [index]),
        center: { ...vital, z: index * 4 },
        radius: 42 + index * 23 + scarcity * 30,
        color: scarcity > 0.55 ? SUPPLY_CONVOY_COLORS.ledger : SUPPLY_CONVOY_COLORS.ration,
        opacity: 0.11 + scarcity * 0.18 + index * 0.025
      }));
      return {
        id: "bastion-ration-water-crates",
        kind: "wave-readiness-glyph",
        semanticKind: "bastion-ration-water-crate-stockpile",
        rendererNeutral: true,
        urgency: scarcity,
        lives,
        rings
      };
    }
  };
}

export function createBastionForwardConvoyLaneKit() {
  return {
    id: "bastion-forward-convoy-lane-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const path = getPath(raw);
      const vital = getVital(raw);
      const staging = getStagingPoint(raw);
      const { readiness, pressure } = getConvoyReadiness(raw);
      const waypoints = [staging, ...path.slice(0, 3), vital];
      const ribbons = waypoints.slice(0, -1).map((from, index) => {
        const to = waypoints[index + 1];
        const intensity = clamp(readiness * 0.72 + index * 0.05 - pressure * 0.16);
        return {
          id: makeId("forward-convoy-lane", [index]),
          kind: "economy-flow-ribbon",
          semanticKind: "bastion-forward-convoy-lane",
          from: point(from),
          mid: midpoint(from, to),
          to: point(to),
          width: 5 + intensity * 18,
          intensity,
          pressure,
          color: intensity > 0.58 ? SUPPLY_CONVOY_COLORS.convoy : SUPPLY_CONVOY_COLORS.ambush,
          label: intensity > 0.58 ? "convoy lane lit" : "convoy lane exposed"
        };
      });
      return {
        id: "bastion-forward-convoy-lanes",
        kind: "economy-flow-ribbon-set",
        semanticKind: "bastion-forward-convoy-lane-set",
        rendererNeutral: true,
        ribbons
      };
    }
  };
}

export function createBastionAmbushWatchtowerKit() {
  return {
    id: "bastion-ambush-watchtower-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const path = getPath(raw);
      const agents = getActivePressure(raw);
      const wave = getWave(raw);
      const segments = path.slice(0, Math.max(1, path.length - 1)).map((node, index) => {
        const from = point(node);
        const to = point(path[index + 1] ?? getVital(raw));
        const mid = midpoint(from, to);
        const ambush = clamp(pressureNear(mid, agents, 320) / 3 + wave.queue.length / 30 + (wave.active ? 0.12 : 0));
        return {
          id: makeId("ambush-watchtower", [index]),
          kind: "path-threat-segment",
          semanticKind: "bastion-ambush-watchtower-watch-arc",
          from,
          mid,
          to,
          pressure: ambush,
          width: 8 + ambush * 34,
          color: ambush > 0.55 ? SUPPLY_CONVOY_COLORS.ambush : SUPPLY_CONVOY_COLORS.convoy,
          defendersNeeded: Math.ceil(ambush * 4)
        };
      });
      return {
        id: "bastion-ambush-watchtower-arcs",
        kind: "path-threat-gradient",
        semanticKind: "bastion-ambush-watchtower-arc-set",
        rendererNeutral: true,
        segments
      };
    }
  };
}

export function createBastionRepairCrewRouteKit() {
  return {
    id: "bastion-repair-crew-route-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const path = getPath(raw);
      const structures = getStructures(raw);
      const fallback = getSlots(raw).filter((slot) => slot.occupied);
      const anchors = (structures.length ? structures : fallback.length ? fallback : getSlots(raw)).slice(0, 8);
      const { pressure, readiness } = getConvoyReadiness(raw);
      const threads = anchors.map((node, index) => {
        const from = point(node);
        const to = index % 2 ? getVital(raw) : nearestPathPoint(node, path);
        const repairNeed = clamp(pressure * 0.38 + (1 - readiness) * 0.34 + number(node.level, 1) / 12);
        return {
          id: makeId("repair-crew-route", [node.id ?? index]),
          kind: "enemy-intent-thread",
          semanticKind: "bastion-repair-crew-route",
          from,
          mid: midpoint(from, to),
          to,
          danger: repairNeed,
          width: 1.5 + repairNeed * 5.5,
          color: repairNeed > 0.62 ? SUPPLY_CONVOY_COLORS.repair : SUPPLY_CONVOY_COLORS.ration,
          label: repairNeed > 0.62 ? "repair crew priority" : "repair crew standby"
        };
      });
      return {
        id: "bastion-repair-crew-routes",
        kind: "enemy-intent-thread-set",
        semanticKind: "bastion-repair-crew-route-set",
        rendererNeutral: true,
        threads
      };
    }
  };
}

export function createBastionNightQuartermasterLedgerKit() {
  return {
    id: "bastion-night-quartermaster-ledger-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const staging = getStagingPoint(raw);
      const { credits, lives, pressure, readiness, wave } = getConvoyReadiness(raw);
      const deficit = clamp(1 - readiness + pressure * 0.18);
      const rings = Array.from({ length: 5 }, (_, index) => ({
        id: makeId("night-quartermaster-ledger-ring", [index]),
        center: { ...staging, z: index * 5 },
        radius: 32 + index * 18 + deficit * 28,
        color: readiness > 0.62 ? SUPPLY_CONVOY_COLORS.ledger : SUPPLY_CONVOY_COLORS.ambush,
        opacity: 0.1 + readiness * 0.13 + index * 0.02
      }));
      return {
        id: "bastion-night-quartermaster-ledger",
        kind: "wave-readiness-glyph",
        semanticKind: "bastion-night-quartermaster-ledger",
        rendererNeutral: true,
        urgency: deficit,
        readiness,
        credits,
        lives,
        waveIndex: wave.waveIndex,
        fields: {
          credits,
          lives,
          queuedThreats: wave.queue.length,
          convoyReadiness: Number(readiness.toFixed(3))
        },
        rings
      };
    }
  };
}

export function createBastionSupplyConvoyRendererHandoffKit() {
  return {
    id: "bastion-supply-convoy-renderer-handoff-kit",
    kind: "renderer-handoff-kit",
    describe({ ammoCaches, rationWater, convoyLanes, ambushWatch, repairCrew, quartermasterLedger } = {}) {
      const descriptors = [
        ammoCaches,
        rationWater,
        convoyLanes,
        ambushWatch,
        repairCrew,
        quartermasterLedger
      ].filter(Boolean);
      return {
        id: "bastion-supply-convoy-renderer-handoff",
        kind: "renderer-handoff",
        semanticKind: "supply-convoy-renderer-handoff",
        rendererNeutral: true,
        policy: SIGNAL_BASTION_SUPPLY_CONVOY_HANDOFF_POLICY,
        descriptors,
        counts: {
          descriptors: descriptors.length,
          ammoCachePallets: ammoCaches?.cells?.length ?? 0,
          rationWaterCrateRings: rationWater?.rings?.length ?? 0,
          forwardConvoyLanes: convoyLanes?.ribbons?.length ?? 0,
          ambushWatchtowerArcs: ambushWatch?.segments?.length ?? 0,
          repairCrewRoutes: repairCrew?.threads?.length ?? 0,
          quartermasterLedgerRings: quartermasterLedger?.rings?.length ?? 0
        }
      };
    }
  };
}

export function createSignalBastionSupplyConvoyReadinessDomainKit() {
  const ammoCacheKit = createBastionAmmoCachePalletKit();
  const rationWaterKit = createBastionRationWaterCrateKit();
  const convoyLaneKit = createBastionForwardConvoyLaneKit();
  const ambushWatchKit = createBastionAmbushWatchtowerKit();
  const repairCrewKit = createBastionRepairCrewRouteKit();
  const quartermasterLedgerKit = createBastionNightQuartermasterLedgerKit();
  const rendererHandoffKit = createBastionSupplyConvoyRendererHandoffKit();

  return {
    id: "signal-bastion-supply-convoy-readiness-domain-kit",
    kind: "domain-kit",
    tree: SIGNAL_BASTION_SUPPLY_CONVOY_TREE,
    describe(input = {}) {
      const raw = getRaw(input);
      const convoy = getConvoyReadiness(raw);
      const ammoCaches = ammoCacheKit.describe(input);
      const rationWater = rationWaterKit.describe(input);
      const convoyLanes = convoyLaneKit.describe(input);
      const ambushWatch = ambushWatchKit.describe(input);
      const repairCrew = repairCrewKit.describe(input);
      const quartermasterLedger = quartermasterLedgerKit.describe(input);
      const rendererHandoff = rendererHandoffKit.describe({
        ammoCaches,
        rationWater,
        convoyLanes,
        ambushWatch,
        repairCrew,
        quartermasterLedger
      });
      const missionState = convoy.pressure > 0.68 && convoy.readiness < 0.48
        ? "critical"
        : convoy.readiness > 0.68
          ? "convoy-ready"
          : convoy.pressure > 0.5
            ? "contested"
            : "undersupplied";
      return {
        id: "signal-bastion-supply-convoy-readiness-domain",
        kind: "supply-convoy-readiness-domain",
        rendererNeutral: true,
        tree: SIGNAL_BASTION_SUPPLY_CONVOY_TREE,
        ammoCaches,
        rationWater,
        convoyLanes,
        ambushWatch,
        repairCrew,
        quartermasterLedger,
        summary: {
          readiness: Number(convoy.readiness.toFixed(3)),
          supply: Number(convoy.supply.toFixed(3)),
          pressure: Number(convoy.pressure.toFixed(3)),
          missionState,
          descriptorCount: rendererHandoff.counts.descriptors,
          forwardConvoyLanes: rendererHandoff.counts.forwardConvoyLanes,
          ammoCachePallets: rendererHandoff.counts.ammoCachePallets,
          repairCrewRoutes: rendererHandoff.counts.repairCrewRoutes
        },
        rendererHandoff
      };
    }
  };
}

export {
  SIGNAL_BASTION_SUPPLY_CONVOY_TREE,
  SIGNAL_BASTION_SUPPLY_CONVOY_HANDOFF_POLICY
};
