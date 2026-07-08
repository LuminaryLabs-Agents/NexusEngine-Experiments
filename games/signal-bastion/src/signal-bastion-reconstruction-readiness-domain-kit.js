const SIGNAL_BASTION_RECONSTRUCTION_TREE = `signal-bastion-reconstruction-readiness-domain
├─ structural-repair-domain
│  ├─ wall-breach-domain
│  │  └─ bastion-wall-breach-seal-kit
│  └─ tower-foundation-domain
│     └─ bastion-tower-foundation-repair-kit
├─ logistics-recovery-domain
│  ├─ supply-route-domain
│  │  └─ bastion-supply-route-restoration-kit
│  └─ worker-crew-domain
│     └─ bastion-worker-crew-rally-kit
├─ civic-return-domain
│  ├─ market-reopen-domain
│  │  └─ bastion-market-reopen-window-kit
│  └─ memorial-beacon-domain
│     └─ bastion-memorial-beacon-kit
└─ renderer-handoff
   └─ bastion-reconstruction-readiness-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

const RECONSTRUCTION_COLORS = Object.freeze({
  breach: "#ff7a5c",
  foundation: "#ffe36d",
  supply: "#6bf0b8",
  crew: "#8bd3ff",
  market: "#f7a8ff",
  memorial: "#ffb86b"
});

const SIGNAL_BASTION_RECONSTRUCTION_HANDOFF_POLICY = Object.freeze({
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
  return { x: number(value.x), y: number(value.y), z: number(value.z) };
}

function midpoint(a = {}, b = {}) {
  return {
    x: (number(a.x) + number(b.x)) * 0.5,
    y: (number(a.y) + number(b.y)) * 0.5,
    z: (number(a.z) + number(b.z)) * 0.5
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
    { id: "repair-yard", x: 230, y: 360, z: 0 },
    { id: "market-stone", x: 455, y: 270, z: 0 },
    { id: "harbor-gate", x: 680, y: 210, z: 0 }
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
  return { waveIndex, active: Boolean(raw.session?.waveActive ?? raw.wave?.active), queue };
}

function pressureNear(pointLike, agents, radius = 220) {
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

function getReconstructionDepot(raw) {
  const first = getPath(raw)[0] ?? { x: 80, y: 440, z: 0 };
  return { x: number(first.x) - 86, y: number(first.y) + 44, z: 0 };
}

export function createBastionWallBreachSealKit() {
  return {
    id: "bastion-wall-breach-seal-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const path = getPath(raw);
      const agents = getAgents(raw);
      const lives = getLives(raw);
      const wave = getWave(raw);
      const segments = path.slice(0, Math.max(1, path.length - 1)).map((node, index) => {
        const from = point(node);
        const to = point(path[index + 1] ?? getVital(raw));
        const center = midpoint(from, to);
        const breach = clamp(pressureNear(center, agents, 280) / 3 + (1 - clamp(lives / 20)) * 0.32 + (wave.active ? 0.12 : 0.02));
        return {
          id: makeId("wall-breach-seal", [index]),
          kind: "path-threat-segment",
          semanticKind: "wall-breach-seal",
          from,
          mid: center,
          to,
          pressure: breach,
          width: 10 + breach * 42,
          color: breach > 0.58 ? RECONSTRUCTION_COLORS.breach : RECONSTRUCTION_COLORS.foundation,
          crewsNeeded: Math.max(1, Math.ceil(breach * 5)),
          label: breach > 0.58 ? "seal breach now" : "wall seam stable"
        };
      });
      return {
        id: "bastion-wall-breach-seals",
        kind: "path-threat-gradient",
        semanticKind: "wall-breach-seal-set",
        rendererNeutral: true,
        segments
      };
    }
  };
}

export function createBastionTowerFoundationRepairKit() {
  return {
    id: "bastion-tower-foundation-repair-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const structures = getStructures(raw);
      const targets = (structures.length ? structures : getSlots(raw)).slice(0, 10);
      const agents = getAgents(raw);
      const credits = getCredits(raw);
      const cells = targets.map((target, index) => {
        const pressure = clamp(pressureNear(target, agents, 240) / 2.4);
        const repairNeed = clamp((3 - number(target.level, 1)) / 3 * 0.28 + pressure * 0.42 + (credits >= 160 ? 0.24 : 0.08) + (target.occupied ? 0.08 : 0.16));
        return {
          id: makeId("tower-foundation-repair", [target.id ?? index]),
          kind: "tower-synergy-cell",
          semanticKind: "tower-foundation-repair-cell",
          center: point(target),
          radius: 28 + repairNeed * 62,
          level: Math.ceil(repairNeed * 4),
          pressure,
          synergy: repairNeed,
          color: repairNeed > 0.62 ? RECONSTRUCTION_COLORS.foundation : RECONSTRUCTION_COLORS.crew,
          label: repairNeed > 0.62 ? "foundation crew ready" : "survey foundation"
        };
      });
      return {
        id: "bastion-tower-foundation-repairs",
        kind: "tower-synergy-cell-set",
        semanticKind: "tower-foundation-repair-set",
        rendererNeutral: true,
        credits,
        cells
      };
    }
  };
}

export function createBastionSupplyRouteRestorationKit() {
  return {
    id: "bastion-supply-route-restoration-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const depot = getReconstructionDepot(raw);
      const slots = getSlots(raw);
      const agents = getAgents(raw);
      const credits = getCredits(raw);
      const ribbons = slots.slice(0, 6).map((slot, index) => {
        const pressure = clamp(pressureNear(slot, agents, 260) / 2.8);
        const readiness = clamp(credits / 420 + index * 0.06 - pressure * 0.24);
        return {
          id: makeId("supply-route-restoration", [slot.id ?? index]),
          kind: "economy-flow-ribbon",
          semanticKind: "supply-route-restoration-ribbon",
          from: depot,
          mid: midpoint(depot, slot),
          to: point(slot),
          width: 4 + readiness * 18,
          intensity: readiness,
          pressure,
          color: pressure > 0.58 ? RECONSTRUCTION_COLORS.breach : RECONSTRUCTION_COLORS.supply,
          label: readiness > 0.55 ? "supplies moving" : "route needs escort"
        };
      });
      return {
        id: "bastion-supply-route-restoration",
        kind: "economy-flow-ribbon-set",
        semanticKind: "supply-route-restoration-set",
        rendererNeutral: true,
        credits,
        ribbons
      };
    }
  };
}

export function createBastionWorkerCrewRallyKit() {
  return {
    id: "bastion-worker-crew-rally-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const path = getPath(raw);
      const vital = getVital(raw);
      const targets = (getStructures(raw).length ? getStructures(raw) : getSlots(raw)).slice(0, 8);
      const agents = getAgents(raw);
      const lives = getLives(raw);
      const threads = targets.map((target, index) => {
        const from = index % 2 ? vital : getReconstructionDepot(raw);
        const to = point(target);
        const pressure = clamp(pressureNear(target, agents, 250) / 3 + (1 - clamp(lives / 20)) * 0.24);
        const routeAnchor = nearestPathPoint(target, path);
        return {
          id: makeId("worker-crew-rally", [target.id ?? index]),
          kind: "enemy-intent-thread",
          semanticKind: "worker-crew-rally-thread",
          from,
          mid: midpoint(routeAnchor, to),
          to,
          danger: pressure,
          width: 1.5 + pressure * 6,
          color: pressure > 0.62 ? RECONSTRUCTION_COLORS.breach : RECONSTRUCTION_COLORS.crew,
          label: pressure > 0.62 ? "crew under fire" : "crew rally path"
        };
      });
      return {
        id: "bastion-worker-crew-rally",
        kind: "enemy-intent-thread-set",
        semanticKind: "worker-crew-rally-set",
        rendererNeutral: true,
        threads
      };
    }
  };
}

export function createBastionMarketReopenWindowKit() {
  return {
    id: "bastion-market-reopen-window-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const credits = getCredits(raw);
      const lives = getLives(raw);
      const wave = getWave(raw);
      const activeBlueprint = input.activeBlueprint ?? getPresentation(input).activeBlueprint ?? "bolt";
      const labels = ["Masons", "Medics", "Caravans", "Night watch"];
      const options = labels.map((label, index) => {
        const readiness = clamp(credits / (180 + index * 95) + clamp(lives / 20) * 0.24 - (wave.active ? 0.12 : 0) + index * 0.025);
        return {
          id: makeId("market-reopen", [label]),
          label,
          index,
          selected: index === Math.abs(String(activeBlueprint).length + wave.waveIndex) % labels.length,
          affordable: credits >= 90 + index * 70,
          readiness,
          color: readiness > 0.6 ? RECONSTRUCTION_COLORS.market : RECONSTRUCTION_COLORS.memorial
        };
      });
      return {
        id: "bastion-market-reopen-window",
        kind: "command-choice-band",
        semanticKind: "market-reopen-window",
        rendererNeutral: true,
        credits,
        options
      };
    }
  };
}

export function createBastionMemorialBeaconKit() {
  return {
    id: "bastion-memorial-beacon-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const vital = getVital(raw);
      const structures = getStructures(raw);
      const lives = getLives(raw);
      const wave = getWave(raw);
      const urgency = clamp((wave.waveIndex + 1) / 30 + structures.length / 12 + (1 - clamp(lives / 20)) * 0.34 + (wave.active ? 0.08 : 0));
      const rings = Array.from({ length: 6 }, (_, index) => ({
        id: makeId("memorial-beacon-ring", [index]),
        center: { ...vital, z: index * 4 },
        radius: 34 + index * 18 + urgency * 44,
        color: urgency > 0.62 ? RECONSTRUCTION_COLORS.foundation : RECONSTRUCTION_COLORS.memorial,
        opacity: 0.08 + urgency * 0.16 + index * 0.018
      }));
      return {
        id: "bastion-memorial-beacon",
        kind: "wave-readiness-glyph",
        semanticKind: "memorial-beacon-readiness",
        rendererNeutral: true,
        urgency,
        lives,
        waveIndex: wave.waveIndex,
        rings
      };
    }
  };
}

export function createBastionReconstructionReadinessRendererHandoffKit() {
  return {
    id: "bastion-reconstruction-readiness-renderer-handoff-kit",
    kind: "renderer-handoff-kit",
    describe({ wallBreachSeals, towerFoundationRepairs, supplyRouteRestoration, workerCrewRally, marketReopenWindow, memorialBeacon } = {}) {
      const descriptors = [
        wallBreachSeals,
        towerFoundationRepairs,
        supplyRouteRestoration,
        workerCrewRally,
        marketReopenWindow,
        memorialBeacon
      ].filter(Boolean);
      return {
        id: "bastion-reconstruction-readiness-renderer-handoff",
        kind: "renderer-handoff",
        semanticKind: "reconstruction-readiness-renderer-handoff",
        rendererNeutral: true,
        policy: SIGNAL_BASTION_RECONSTRUCTION_HANDOFF_POLICY,
        descriptors,
        counts: {
          descriptors: descriptors.length,
          wallBreachSeals: wallBreachSeals?.segments?.length ?? 0,
          towerFoundationRepairs: towerFoundationRepairs?.cells?.length ?? 0,
          supplyRouteRestorationRibbons: supplyRouteRestoration?.ribbons?.length ?? 0,
          workerCrewRallyThreads: workerCrewRally?.threads?.length ?? 0,
          marketReopenOptions: marketReopenWindow?.options?.length ?? 0,
          memorialBeaconRings: memorialBeacon?.rings?.length ?? 0
        }
      };
    }
  };
}

export function createSignalBastionReconstructionReadinessDomainKit() {
  const wallBreachKit = createBastionWallBreachSealKit();
  const towerFoundationKit = createBastionTowerFoundationRepairKit();
  const supplyRouteKit = createBastionSupplyRouteRestorationKit();
  const workerCrewKit = createBastionWorkerCrewRallyKit();
  const marketReopenKit = createBastionMarketReopenWindowKit();
  const memorialBeaconKit = createBastionMemorialBeaconKit();
  const rendererHandoffKit = createBastionReconstructionReadinessRendererHandoffKit();

  return {
    id: "signal-bastion-reconstruction-readiness-domain-kit",
    kind: "domain-kit",
    tree: SIGNAL_BASTION_RECONSTRUCTION_TREE,
    describe(input = {}) {
      const wallBreachSeals = wallBreachKit.describe(input);
      const towerFoundationRepairs = towerFoundationKit.describe(input);
      const supplyRouteRestoration = supplyRouteKit.describe(input);
      const workerCrewRally = workerCrewKit.describe(input);
      const marketReopenWindow = marketReopenKit.describe(input);
      const memorialBeacon = memorialBeaconKit.describe(input);
      const rendererHandoff = rendererHandoffKit.describe({
        wallBreachSeals,
        towerFoundationRepairs,
        supplyRouteRestoration,
        workerCrewRally,
        marketReopenWindow,
        memorialBeacon
      });
      return {
        id: "signal-bastion-reconstruction-readiness-domain",
        kind: "reconstruction-readiness-domain",
        rendererNeutral: true,
        tree: SIGNAL_BASTION_RECONSTRUCTION_TREE,
        wallBreachSeals,
        towerFoundationRepairs,
        supplyRouteRestoration,
        workerCrewRally,
        marketReopenWindow,
        memorialBeacon,
        summary: {
          reconstructionDescriptorCount: rendererHandoff.counts.descriptors,
          wallBreachSeals: rendererHandoff.counts.wallBreachSeals,
          towerFoundationRepairs: rendererHandoff.counts.towerFoundationRepairs,
          memorialBeaconRings: rendererHandoff.counts.memorialBeaconRings,
          reconstructionReady: rendererHandoff.counts.supplyRouteRestorationRibbons > 0 && rendererHandoff.counts.workerCrewRallyThreads > 0
        },
        rendererHandoff
      };
    }
  };
}

export { SIGNAL_BASTION_RECONSTRUCTION_TREE, SIGNAL_BASTION_RECONSTRUCTION_HANDOFF_POLICY };
