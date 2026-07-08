const SIGNAL_BASTION_WAVE_CHOREOGRAPHY_TREE = `signal-bastion-wave-choreography-domain
├─ wave-forecast-domain
│  ├─ spawn-cadence-domain
│  │  └─ bastion-spawn-cadence-rail-kit
│  └─ leak-risk-domain
│     └─ bastion-leak-risk-funnel-kit
├─ defense-response-domain
│  ├─ coverage-gap-domain
│  │  └─ bastion-coverage-gap-cell-kit
│  └─ upgrade-priority-domain
│     └─ bastion-upgrade-priority-pin-kit
├─ combat-tempo-domain
│  ├─ reserve-meter-domain
│  │  └─ bastion-panic-reserve-meter-kit
│  └─ projectile-tempo-domain
│     └─ bastion-projectile-tempo-spark-kit
└─ renderer-handoff
   └─ bastion-wave-choreography-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

const COLORS = Object.freeze({
  cadence: "#f7a8ff",
  leak: "#ff7a5c",
  gap: "#ffe36d",
  upgrade: "#6bf0b8",
  reserve: "#8bd3ff",
  tempo: "#ffffff"
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

function makeId(prefix, parts = []) {
  return [prefix, ...parts]
    .map((part) => String(part).replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, ""))
    .filter(Boolean)
    .join(":");
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
  return asArray(getMap(raw).slots).map(point);
}

function getStructures(raw) {
  return asArray(raw.structures?.structures ?? raw.structures ?? raw.towers).filter((item) => item && typeof item === "object");
}

function getAgents(raw) {
  return asArray(raw.agents?.active ?? raw.agents ?? raw.enemies).filter((item) => item && typeof item === "object");
}

function getProjectiles(raw) {
  return asArray(raw.combat?.projectiles ?? raw.projectiles).filter((item) => item && typeof item === "object");
}

function getCredits(raw) {
  return number(raw.economy?.wallet?.credits ?? raw.wallet?.credits ?? raw.economy?.credits);
}

function getWave(raw) {
  const waveIndex = number(raw.session?.waveIndex ?? raw.wave?.index ?? raw.waveIndex);
  const wave = raw.level?.waves?.[waveIndex] ?? raw.wave ?? {};
  return {
    waveIndex,
    active: Boolean(raw.session?.waveActive ?? raw.wave?.active),
    queue: asArray(wave.spawnQueue ?? wave.queue ?? wave.enemies)
  };
}

function nearestPathPoint(source, path) {
  let best = path[0] ?? { x: 0, y: 0, z: 0 };
  let bestDistance = Infinity;
  for (const candidate of path) {
    const distance = Math.hypot(number(source.x) - number(candidate.x), number(source.y) - number(candidate.y));
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return point(best);
}

function countNearbyStructures(pointLike, structures, radius) {
  return structures.filter((structure) => Math.hypot(number(pointLike.x) - number(structure.x), number(pointLike.y) - number(structure.y)) <= radius).length;
}

export function createBastionSpawnCadenceRailKit() {
  return {
    id: "bastion-spawn-cadence-rail-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const path = getPath(raw);
      const { waveIndex, active, queue } = getWave(raw);
      const beats = path.slice(0, Math.max(2, Math.min(path.length, 8))).map((node, index) => {
        const next = path[Math.min(path.length - 1, index + 1)] ?? node;
        const intensity = clamp((active ? 0.34 : 0.14) + queue.length * 0.035 + index * 0.045);
        return {
          id: makeId("spawn-cadence", [waveIndex, index]),
          kind: "enemy-intent-thread",
          semanticKind: "spawn-cadence-beat",
          from: point(node),
          mid: lerpPoint(node, next, 0.42),
          to: point(next),
          danger: intensity,
          width: 1.2 + intensity * 4,
          color: COLORS.cadence,
          label: `${active ? "spawn" : "queued"}:${index + 1}`
        };
      });
      return {
        id: "bastion-spawn-cadence-rail",
        kind: "enemy-intent-thread-set",
        semanticKind: "spawn-cadence-rail",
        rendererNeutral: true,
        waveIndex,
        active,
        queueCount: queue.length,
        threads: beats
      };
    }
  };
}

export function createBastionLeakRiskFunnelKit() {
  return {
    id: "bastion-leak-risk-funnel-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const path = getPath(raw);
      const vital = getVital(raw);
      const agents = getAgents(raw).slice(0, 14);
      const segments = agents.map((agent, index) => {
        const source = point(agent);
        const nearest = nearestPathPoint(source, path);
        const hp = clamp(number(agent.health ?? agent.hp, 1) / Math.max(1, number(agent.maxHealth ?? agent.maxHp, 1)));
        const distanceToVital = Math.hypot(source.x - vital.x, source.y - vital.y);
        const pressure = clamp((agent.boss ? 0.36 : 0.12) + (1 - hp) * 0.12 + (1 - clamp(distanceToVital / 720)) * 0.58 + number(agent.speed, 1) * 0.06);
        return {
          id: makeId("leak-risk", [agent.id ?? index]),
          kind: "path-threat-segment",
          semanticKind: "leak-risk-funnel",
          from: nearest,
          mid: midpoint(source, vital),
          to: vital,
          pressure,
          width: 10 + pressure * 32,
          color: COLORS.leak,
          pulse: pressure
        };
      });
      return {
        id: "bastion-leak-risk-funnels",
        kind: "path-threat-gradient",
        semanticKind: "leak-risk-funnel-set",
        rendererNeutral: true,
        segments
      };
    }
  };
}

export function createBastionCoverageGapCellKit() {
  return {
    id: "bastion-coverage-gap-cell-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const slots = getSlots(raw);
      const structures = getStructures(raw);
      const cells = slots.slice(0, 12).map((slot, index) => {
        const nearby = countNearbyStructures(slot, structures, 180);
        const nearest = structures.reduce((best, structure) => Math.min(best, Math.hypot(number(slot.x) - number(structure.x), number(slot.y) - number(structure.y))), Infinity);
        const gap = clamp((nearest === Infinity ? 0.76 : nearest / 260) - nearby * 0.12, 0.08, 1);
        return {
          id: makeId("coverage-gap", [index]),
          kind: "tower-synergy-cell",
          semanticKind: "coverage-gap-cell",
          center: point(slot),
          radius: 36 + gap * 64,
          range: 120 + gap * 80,
          level: nearby,
          neighbors: nearby,
          synergy: gap,
          color: COLORS.gap
        };
      });
      return {
        id: "bastion-coverage-gap-cells",
        kind: "tower-synergy-cell-set",
        semanticKind: "coverage-gap-cell-set",
        rendererNeutral: true,
        cells
      };
    }
  };
}

export function createBastionUpgradePriorityPinKit() {
  return {
    id: "bastion-upgrade-priority-pin-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const structures = getStructures(raw);
      const agents = getAgents(raw);
      const vital = getVital(raw);
      const credits = getCredits(raw);
      const candidates = structures.length > 0 ? structures : getSlots(raw).slice(0, 4);
      const ribbons = candidates.slice(0, 8).map((candidate, index) => {
        const level = number(candidate.level, 0);
        const nearbyAgents = countNearbyStructures(candidate, agents, 240);
        const priority = clamp(0.2 + nearbyAgents * 0.12 + (1 / Math.max(1, level + 1)) * 0.24 + credits / 1600);
        return {
          id: makeId("upgrade-priority", [candidate.id ?? index]),
          kind: "economy-flow-ribbon",
          semanticKind: "upgrade-priority-pin",
          from: vital,
          mid: midpoint(vital, candidate),
          to: point(candidate),
          value: Math.round(priority * 100),
          intensity: priority,
          width: 3 + priority * 9,
          color: COLORS.upgrade,
          label: level > 0 ? `upgrade L${level + 1}` : "build here"
        };
      });
      return {
        id: "bastion-upgrade-priority-pins",
        kind: "economy-flow-ribbon-set",
        semanticKind: "upgrade-priority-pin-set",
        rendererNeutral: true,
        credits,
        ribbons
      };
    }
  };
}

export function createBastionPanicReserveMeterKit() {
  return {
    id: "bastion-panic-reserve-meter-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const center = getVital(raw);
      const agents = getAgents(raw).length;
      const credits = getCredits(raw);
      const lives = number(raw.session?.lives ?? raw.vital?.lives ?? raw.lives, 20);
      const reserve = clamp((credits / 900) * 0.45 + (lives / 30) * 0.35 - agents * 0.025 + 0.2);
      const urgency = clamp(1 - reserve);
      return {
        id: "bastion-panic-reserve-meter",
        kind: "wave-readiness-glyph",
        semanticKind: "panic-reserve-meter",
        rendererNeutral: true,
        center,
        waveIndex: number(raw.session?.waveIndex ?? raw.waveIndex),
        active: urgency > 0.5,
        queueCount: agents,
        label: urgency > 0.62 ? "RESERVE LOW" : "RESERVE STABLE",
        reserve,
        urgency,
        rings: [0, 1, 2, 3].map((ring) => ({
          id: makeId("reserve-ring", [ring]),
          kind: "wave-readiness-ring",
          semanticKind: "panic-reserve-ring",
          center,
          radius: 30 + ring * 18 + urgency * 26,
          opacity: 0.12 + urgency * 0.32 + ring * 0.03,
          color: urgency > 0.55 ? COLORS.leak : COLORS.reserve
        }))
      };
    }
  };
}

export function createBastionProjectileTempoSparkKit() {
  return {
    id: "bastion-projectile-tempo-spark-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const projectiles = getProjectiles(raw);
      const structures = getStructures(raw);
      const vital = getVital(raw);
      const sources = projectiles.length > 0 ? projectiles : structures.slice(0, 10);
      const ribbons = sources.slice(0, 12).map((source, index) => {
        const from = point(source);
        const to = source.target ? point(source.target) : lerpPoint(from, vital, 0.36);
        const intensity = clamp(0.16 + number(source.damage ?? source.level, 1) * 0.08 + projectiles.length * 0.025);
        return {
          id: makeId("projectile-tempo", [source.id ?? index]),
          kind: "economy-flow-ribbon",
          semanticKind: "projectile-tempo-spark",
          from,
          mid: midpoint(from, to),
          to,
          value: Math.round(intensity * 100),
          intensity,
          width: 1.4 + intensity * 5,
          color: source.color ?? COLORS.tempo
        };
      });
      return {
        id: "bastion-projectile-tempo-sparks",
        kind: "economy-flow-ribbon-set",
        semanticKind: "projectile-tempo-spark-set",
        rendererNeutral: true,
        projectileCount: projectiles.length,
        ribbons
      };
    }
  };
}

export function createBastionWaveChoreographyRendererHandoffKit() {
  return {
    id: "bastion-wave-choreography-renderer-handoff-kit",
    kind: "descriptor-kit",
    describe(parts = {}) {
      const descriptors = [
        parts.spawnCadence,
        parts.leakRisk,
        parts.coverageGaps,
        parts.upgradePriority,
        parts.panicReserve,
        parts.projectileTempo
      ].filter(Boolean);
      return {
        id: "bastion-wave-choreography-renderer-handoff",
        kind: "renderer-handoff",
        rendererNeutral: true,
        policy: {
          rendererConsumesDescriptorsOnly: true,
          noDomOwnership: true,
          noInputOwnership: true,
          noFrameLoopOwnership: true,
          noWebglOwnership: true,
          noAudioOwnership: true,
          noAssetLoadingOwnership: true
        },
        descriptors,
        counts: {
          descriptors: descriptors.length,
          spawnCadenceBeats: parts.spawnCadence?.threads?.length ?? 0,
          leakFunnels: parts.leakRisk?.segments?.length ?? 0,
          coverageGaps: parts.coverageGaps?.cells?.length ?? 0,
          upgradePins: parts.upgradePriority?.ribbons?.length ?? 0,
          reserveRings: parts.panicReserve?.rings?.length ?? 0,
          projectileSparks: parts.projectileTempo?.ribbons?.length ?? 0
        }
      };
    }
  };
}

export function createSignalBastionWaveChoreographyDomainKit() {
  const spawnCadenceKit = createBastionSpawnCadenceRailKit();
  const leakRiskKit = createBastionLeakRiskFunnelKit();
  const coverageGapKit = createBastionCoverageGapCellKit();
  const upgradePriorityKit = createBastionUpgradePriorityPinKit();
  const panicReserveKit = createBastionPanicReserveMeterKit();
  const projectileTempoKit = createBastionProjectileTempoSparkKit();
  const handoffKit = createBastionWaveChoreographyRendererHandoffKit();
  return {
    id: "signal-bastion-wave-choreography-domain-kit",
    kind: "composite-descriptor-kit",
    tree: SIGNAL_BASTION_WAVE_CHOREOGRAPHY_TREE,
    describe(input = {}) {
      const spawnCadence = spawnCadenceKit.describe(input);
      const leakRisk = leakRiskKit.describe(input);
      const coverageGaps = coverageGapKit.describe(input);
      const upgradePriority = upgradePriorityKit.describe(input);
      const panicReserve = panicReserveKit.describe(input);
      const projectileTempo = projectileTempoKit.describe(input);
      const rendererHandoff = handoffKit.describe({ spawnCadence, leakRisk, coverageGaps, upgradePriority, panicReserve, projectileTempo });
      return {
        id: "signal-bastion-wave-choreography-domain",
        kind: "wave-choreography-domain",
        rendererNeutral: true,
        tree: SIGNAL_BASTION_WAVE_CHOREOGRAPHY_TREE,
        spawnCadence,
        leakRisk,
        coverageGaps,
        upgradePriority,
        panicReserve,
        projectileTempo,
        rendererHandoff
      };
    }
  };
}
