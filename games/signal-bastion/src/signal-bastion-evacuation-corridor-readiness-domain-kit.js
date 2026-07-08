const SIGNAL_BASTION_EVACUATION_CORRIDOR_TREE = `signal-bastion-evacuation-corridor-readiness-domain
├─ civilian-route-domain
│  ├─ evacuation-lane-domain
│  │  └─ bastion-civilian-evacuation-lane-kit
│  └─ casualty-cache-domain
│     └─ bastion-casualty-cache-triage-kit
├─ infrastructure-pressure-domain
│  ├─ gate-integrity-domain
│  │  └─ bastion-gate-integrity-shield-kit
│  └─ power-relay-domain
│     └─ bastion-power-relay-load-kit
├─ command-commitment-domain
│  ├─ reserve-convoy-domain
│  │  └─ bastion-reserve-convoy-thread-kit
│  └─ final-siren-domain
│     └─ bastion-final-siren-countdown-kit
└─ renderer-handoff
   └─ bastion-evacuation-corridor-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

const EVACUATION_COLORS = Object.freeze({
  lane: "#6bf0b8",
  casualty: "#ffe36d",
  gate: "#ff7a5c",
  power: "#8bd3ff",
  convoy: "#f7a8ff",
  siren: "#ffb86b"
});

const SIGNAL_BASTION_EVACUATION_HANDOFF_POLICY = Object.freeze({
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
    { id: "triage-a", x: 235, y: 360, z: 0 },
    { id: "relay-b", x: 455, y: 270, z: 0 },
    { id: "gate-c", x: 675, y: 210, z: 0 }
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

function getEvacuationExit(raw) {
  const path = getPath(raw);
  const vital = getVital(raw);
  const final = path[path.length - 1] ?? vital;
  return {
    x: number(final.x) + 88,
    y: number(final.y) - 54,
    z: 0
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
    health: String(enemy).includes("boss") ? 180 : 55 + index * 10,
    maxHealth: String(enemy).includes("boss") ? 180 : 80,
    speed: 0.9 + index * 0.08,
    boss: String(enemy).includes("boss")
  }));
}

function pressureNear(pointLike, agents, radius = 220) {
  return agents.reduce((total, agent) => {
    const closeness = 1 - clamp(distance(pointLike, agent) / radius);
    return total + closeness * (agent.boss ? 1.8 : 1) * number(agent.speed, 1);
  }, 0);
}

export function createBastionCivilianEvacuationLaneKit() {
  return {
    id: "bastion-civilian-evacuation-lane-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const path = getPath(raw);
      const vital = getVital(raw);
      const exit = getEvacuationExit(raw);
      const agents = getActivePressure(raw);
      const lives = getLives(raw);
      const lanes = path.slice(0, Math.max(2, path.length - 1)).map((node, index) => {
        const from = point(node);
        const to = index === path.length - 1 ? exit : lerpPoint(from, path[Math.min(path.length - 1, index + 1)] ?? exit, 0.72);
        const pressure = clamp(pressureNear(from, agents, 260) / 3);
        const priority = clamp((1 - pressure) * 0.52 + (1 - clamp(lives / 20)) * 0.28 + index * 0.05);
        return {
          id: makeId("evacuation-lane", [index]),
          kind: "economy-flow-ribbon",
          semanticKind: "civilian-evacuation-lane",
          from,
          mid: midpoint(from, to),
          to,
          width: 5 + priority * 16,
          intensity: priority,
          pressure,
          color: pressure > 0.5 ? EVACUATION_COLORS.gate : EVACUATION_COLORS.lane,
          label: pressure > 0.5 ? "lane contested" : "lane open"
        };
      });
      lanes.push({
        id: "evacuation-lane-final-exit",
        kind: "economy-flow-ribbon",
        semanticKind: "civilian-evacuation-lane",
        from: vital,
        mid: midpoint(vital, exit),
        to: exit,
        width: 10 + clamp(lives / 20) * 10,
        intensity: clamp(lives / 20),
        pressure: pressureNear(vital, agents, 260),
        color: EVACUATION_COLORS.lane,
        label: "evacuation gate"
      });
      return {
        id: "bastion-civilian-evacuation-lanes",
        kind: "economy-flow-ribbon-set",
        semanticKind: "civilian-evacuation-lane-set",
        rendererNeutral: true,
        lives,
        ribbons: lanes
      };
    }
  };
}

export function createBastionCasualtyCacheTriageKit() {
  return {
    id: "bastion-casualty-cache-triage-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const slots = getSlots(raw);
      const agents = getActivePressure(raw);
      const credits = getCredits(raw);
      const cells = slots.slice(0, 10).map((slot, index) => {
        const pressure = clamp(pressureNear(slot, agents, 240) / 2.5);
        const ready = clamp(0.28 + (credits >= 140 ? 0.28 : 0.06) + pressure * 0.42 - (slot.occupied ? 0.16 : 0));
        return {
          id: makeId("casualty-cache", [slot.id ?? index]),
          kind: "tower-synergy-cell",
          semanticKind: "casualty-cache-triage-cell",
          center: point(slot),
          radius: 30 + ready * 58,
          level: Math.ceil(ready * 4),
          pressure,
          synergy: ready,
          color: ready > 0.55 ? EVACUATION_COLORS.casualty : EVACUATION_COLORS.power,
          label: ready > 0.55 ? "triage ready" : "needs supplies"
        };
      });
      return {
        id: "bastion-casualty-cache-triage",
        kind: "tower-synergy-cell-set",
        semanticKind: "casualty-cache-triage-set",
        rendererNeutral: true,
        credits,
        cells
      };
    }
  };
}

export function createBastionGateIntegrityShieldKit() {
  return {
    id: "bastion-gate-integrity-shield-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const path = getPath(raw);
      const vital = getVital(raw);
      const agents = getActivePressure(raw);
      const lives = getLives(raw);
      const segments = path.slice(0, Math.max(1, path.length - 1)).map((node, index) => {
        const from = point(node);
        const to = path[index + 1] ? point(path[index + 1]) : vital;
        const pressure = clamp(pressureNear(midpoint(from, to), agents, 280) / 3 + (1 - clamp(lives / 20)) * 0.24);
        return {
          id: makeId("gate-integrity", [index]),
          kind: "path-threat-segment",
          semanticKind: "gate-integrity-shield",
          from,
          mid: midpoint(from, to),
          to,
          pressure,
          width: 8 + pressure * 36,
          color: pressure > 0.58 ? EVACUATION_COLORS.gate : EVACUATION_COLORS.power,
          defendersNeeded: Math.ceil(pressure * 4)
        };
      });
      return {
        id: "bastion-gate-integrity-shields",
        kind: "path-threat-gradient",
        semanticKind: "gate-integrity-shield-set",
        rendererNeutral: true,
        segments
      };
    }
  };
}

export function createBastionPowerRelayLoadKit() {
  return {
    id: "bastion-power-relay-load-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const structures = getStructures(raw);
      const vital = getVital(raw);
      const path = getPath(raw);
      const threads = (structures.length ? structures : getSlots(raw)).slice(0, 8).map((node, index) => {
        const from = point(node);
        const to = index % 2 ? vital : nearestPathPoint(node, path);
        const load = clamp((number(node.level, 1) * number(node.damage, 8)) / 48 + pressureNear(node, getActivePressure(raw), 260) / 4);
        return {
          id: makeId("power-relay-load", [node.id ?? index]),
          kind: "enemy-intent-thread",
          semanticKind: "power-relay-load-thread",
          from,
          mid: midpoint(from, to),
          to,
          danger: load,
          width: 1.5 + load * 5,
          color: load > 0.65 ? EVACUATION_COLORS.siren : EVACUATION_COLORS.power,
          label: load > 0.65 ? "relay hot" : "relay stable"
        };
      });
      return {
        id: "bastion-power-relay-load",
        kind: "enemy-intent-thread-set",
        semanticKind: "power-relay-load-set",
        rendererNeutral: true,
        threads
      };
    }
  };
}

export function createBastionReserveConvoyThreadKit() {
  return {
    id: "bastion-reserve-convoy-thread-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const path = getPath(raw);
      const vital = getVital(raw);
      const credits = getCredits(raw);
      const wave = getWave(raw);
      const convoyCount = Math.max(2, Math.min(5, Math.ceil((credits + wave.queue.length * 40) / 180)));
      const threads = Array.from({ length: convoyCount }, (_, index) => {
        const from = path[Math.min(path.length - 1, index)] ?? path[0] ?? vital;
        const to = lerpPoint(from, vital, 0.42 + index * 0.08);
        const readiness = clamp(credits / 360 + index * 0.08 - (wave.active ? 0.08 : 0.02));
        return {
          id: makeId("reserve-convoy", [index]),
          kind: "enemy-intent-thread",
          semanticKind: "reserve-convoy-thread",
          from: point(from),
          mid: midpoint(from, to),
          to,
          danger: readiness,
          width: 2 + readiness * 5,
          color: EVACUATION_COLORS.convoy,
          label: readiness > 0.55 ? "convoy ready" : "hold reserve"
        };
      });
      return {
        id: "bastion-reserve-convoy-threads",
        kind: "enemy-intent-thread-set",
        semanticKind: "reserve-convoy-thread-set",
        rendererNeutral: true,
        credits,
        threads
      };
    }
  };
}

export function createBastionFinalSirenCountdownKit() {
  return {
    id: "bastion-final-siren-countdown-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const vital = getVital(raw);
      const wave = getWave(raw);
      const lives = getLives(raw);
      const pressure = clamp((getActivePressure(raw).length + wave.queue.length) / 14 + (1 - clamp(lives / 20)) * 0.36 + (wave.active ? 0.14 : 0));
      const rings = Array.from({ length: 5 }, (_, index) => ({
        id: makeId("final-siren-ring", [index]),
        center: { ...vital, z: index * 3 },
        radius: 36 + index * 20 + pressure * 38,
        color: pressure > 0.64 ? EVACUATION_COLORS.gate : EVACUATION_COLORS.siren,
        opacity: 0.1 + pressure * 0.18 + index * 0.02
      }));
      return {
        id: "bastion-final-siren-countdown",
        kind: "wave-readiness-glyph",
        semanticKind: "final-siren-countdown",
        rendererNeutral: true,
        urgency: pressure,
        lives,
        waveIndex: wave.waveIndex,
        rings
      };
    }
  };
}

export function createBastionEvacuationCorridorRendererHandoffKit() {
  return {
    id: "bastion-evacuation-corridor-renderer-handoff-kit",
    kind: "renderer-handoff-kit",
    describe({ evacuationLanes, casualtyCaches, gateIntegrity, powerRelayLoad, reserveConvoys, finalSiren } = {}) {
      const descriptors = [
        evacuationLanes,
        casualtyCaches,
        gateIntegrity,
        powerRelayLoad,
        reserveConvoys,
        finalSiren
      ].filter(Boolean);
      return {
        id: "bastion-evacuation-corridor-renderer-handoff",
        kind: "renderer-handoff",
        semanticKind: "evacuation-corridor-renderer-handoff",
        rendererNeutral: true,
        policy: SIGNAL_BASTION_EVACUATION_HANDOFF_POLICY,
        descriptors,
        counts: {
          descriptors: descriptors.length,
          civilianEvacuationLanes: evacuationLanes?.ribbons?.length ?? 0,
          casualtyCacheTriageCells: casualtyCaches?.cells?.length ?? 0,
          gateIntegrityShields: gateIntegrity?.segments?.length ?? 0,
          powerRelayLoadThreads: powerRelayLoad?.threads?.length ?? 0,
          reserveConvoyThreads: reserveConvoys?.threads?.length ?? 0,
          finalSirenRings: finalSiren?.rings?.length ?? 0
        }
      };
    }
  };
}

export function createSignalBastionEvacuationCorridorReadinessDomainKit() {
  const evacuationLaneKit = createBastionCivilianEvacuationLaneKit();
  const casualtyCacheKit = createBastionCasualtyCacheTriageKit();
  const gateIntegrityKit = createBastionGateIntegrityShieldKit();
  const powerRelayKit = createBastionPowerRelayLoadKit();
  const reserveConvoyKit = createBastionReserveConvoyThreadKit();
  const finalSirenKit = createBastionFinalSirenCountdownKit();
  const rendererHandoffKit = createBastionEvacuationCorridorRendererHandoffKit();

  return {
    id: "signal-bastion-evacuation-corridor-readiness-domain-kit",
    kind: "domain-kit",
    tree: SIGNAL_BASTION_EVACUATION_CORRIDOR_TREE,
    describe(input = {}) {
      const evacuationLanes = evacuationLaneKit.describe(input);
      const casualtyCaches = casualtyCacheKit.describe(input);
      const gateIntegrity = gateIntegrityKit.describe(input);
      const powerRelayLoad = powerRelayKit.describe(input);
      const reserveConvoys = reserveConvoyKit.describe(input);
      const finalSiren = finalSirenKit.describe(input);
      const rendererHandoff = rendererHandoffKit.describe({
        evacuationLanes,
        casualtyCaches,
        gateIntegrity,
        powerRelayLoad,
        reserveConvoys,
        finalSiren
      });
      return {
        id: "signal-bastion-evacuation-corridor-readiness-domain",
        kind: "evacuation-corridor-readiness-domain",
        rendererNeutral: true,
        tree: SIGNAL_BASTION_EVACUATION_CORRIDOR_TREE,
        evacuationLanes,
        casualtyCaches,
        gateIntegrity,
        powerRelayLoad,
        reserveConvoys,
        finalSiren,
        summary: {
          corridorOpen: rendererHandoff.counts.gateIntegrityShields > 0,
          evacuationDescriptorCount: rendererHandoff.counts.descriptors,
          civilianEvacuationLanes: rendererHandoff.counts.civilianEvacuationLanes,
          finalSirenRings: rendererHandoff.counts.finalSirenRings
        },
        rendererHandoff
      };
    }
  };
}

export { SIGNAL_BASTION_EVACUATION_CORRIDOR_TREE, SIGNAL_BASTION_EVACUATION_HANDOFF_POLICY };