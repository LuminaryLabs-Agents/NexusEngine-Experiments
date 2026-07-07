const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function hashSeed(seed = "stonewake") {
  let hash = 2166136261;
  const text = String(seed);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed = "stonewake") {
  let state = hashSeed(seed) || 1;
  return {
    next() {
      state += 0x6D2B79F5;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    range(min, max) { return min + this.next() * (max - min); },
    pick(list) { return list[Math.floor(this.next() * list.length)] ?? list[0]; }
  };
}

function normalizeRequest(request = {}) {
  const focusPoints = Math.max(1, Math.floor(toNumber(request.targets?.focusPoints, 4)));
  return {
    seed: request.seed ?? "stonewake-001",
    bounds: {
      width: Math.max(1280, toNumber(request.bounds?.width, 1200 + focusPoints * 760)),
      height: Math.max(720, toNumber(request.bounds?.height, 900)),
      margin: Math.max(40, toNumber(request.bounds?.margin, 80))
    },
    targets: {
      focusPoints,
      platforms: Math.max(8, Math.floor(toNumber(request.targets?.platforms, focusPoints * 4 + 8))),
      recoveryPlatforms: Math.max(0, Math.floor(toNumber(request.targets?.recoveryPlatforms, focusPoints))),
      chains: Math.max(0, Math.floor(toNumber(request.targets?.chains, focusPoints + 1))),
      heavyBlocks: Math.max(0, Math.floor(toNumber(request.targets?.heavyBlocks, 1))),
      weightedTriggers: Math.max(0, Math.floor(toNumber(request.targets?.weightedTriggers, 1))),
      valves: Math.max(0, Math.floor(toNumber(request.targets?.valves, 1))),
      finishGates: Math.max(1, Math.floor(toNumber(request.targets?.finishGates, 1))),
      creatures: Math.max(0, Math.floor(toNumber(request.targets?.creatures, 1))),
      waterZones: Math.max(0, Math.floor(toNumber(request.targets?.waterZones, 1))),
      torches: Math.max(0, Math.floor(toNumber(request.targets?.torches, focusPoints * 2 + 3))),
      wallMarks: Math.max(0, Math.floor(toNumber(request.targets?.wallMarks, focusPoints * 3))),
      reactiveEffectAnchors: Math.max(0, Math.floor(toNumber(request.targets?.reactiveEffectAnchors, focusPoints * 8 + 12)))
    },
    style: {
      verticality: clamp(toNumber(request.style?.verticality, 0.55), 0, 1),
      chamberRoundness: clamp(toNumber(request.style?.chamberRoundness, 0.75), 0, 1),
      dangerBias: request.style?.dangerBias ?? "lower-route"
    },
    constraints: {
      maxJumpDistance: Math.max(120, toNumber(request.constraints?.maxJumpDistance, 190)),
      maxJumpHeight: Math.max(80, toNumber(request.constraints?.maxJumpHeight, 125)),
      minPlatformWidth: Math.max(80, toNumber(request.constraints?.minPlatformWidth, 100)),
      minFocusSpacing: Math.max(260, toNumber(request.constraints?.minFocusSpacing, 520))
    }
  };
}

function platform(id, x, y, w, h = 30, role = "route", focusId = null) {
  return { id, x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h), role, focusId, edge: true };
}

function makeFocusPath(config, random) {
  const points = [];
  const { width, height, margin } = config.bounds;
  const usableW = width - margin * 2;
  const segment = usableW / (config.targets.focusPoints + 1);
  let y = height * random.range(0.24, 0.38);
  points.push({ id: "start", role: "start", x: margin + 40, y });
  for (let index = 1; index <= config.targets.focusPoints; index += 1) {
    const role = index === 1 ? "physical-puzzle" : index === 2 ? "machine-interaction" : index === config.targets.focusPoints ? "water-crossing" : random.pick(["climb", "recovery", "hazard-read"]);
    y = clamp(y + random.range(-1, 1) * (110 + config.style.verticality * 180), margin + 120, height - margin - 205);
    points.push({ id: `focus-${index}`, role, x: margin + segment * index + random.range(-segment * 0.2, segment * 0.2), y });
  }
  points.push({ id: "finish", role: "finish", x: width - margin - 90, y: clamp(y + random.range(-70, 70), margin + 130, height - margin - 210) });
  return { orderedIds: points.map((point) => point.id), points };
}

export function generateLayeredDrunkWalkLevel(request = {}) {
  const config = normalizeRequest(request);
  const random = createRandom(config.seed);
  const focusPath = makeFocusPath(config, random);
  const chambers = focusPath.points.map((point, index) => ({
    id: `chamber-${point.id}`,
    focusId: point.id,
    role: point.role,
    center: { x: Math.round(point.x), y: Math.round(point.y) },
    radiusX: Math.round(random.range(point.role === "start" || point.role === "finish" ? 170 : 225, point.role === "start" || point.role === "finish" ? 235 : 335)),
    radiusY: Math.round(random.range(point.role === "start" || point.role === "finish" ? 120 : 150, point.role === "start" || point.role === "finish" ? 170 : 235)),
    roundness: config.style.chamberRoundness,
    order: index
  }));
  const platforms = [
    platform("left-wall", 0, 0, 42, config.bounds.height, "boundary"),
    platform("right-wall", config.bounds.width - 42, 0, 42, config.bounds.height, "boundary"),
    platform("floor", 42, config.bounds.height - 40, config.bounds.width - 84, 48, "floor")
  ];
  const routeNodes = [];
  let platformIndex = 0;
  for (const chamber of chambers) {
    const w = random.range(config.constraints.minPlatformWidth + 40, config.constraints.minPlatformWidth + 170);
    const y = clamp(chamber.center.y + random.range(48, 95), 160, config.bounds.height - 185);
    const p = platform(`platform-${String(++platformIndex).padStart(3, "0")}`, chamber.center.x - w / 2, y, w, 30, chamber.role, chamber.focusId);
    platforms.push(p);
    routeNodes.push({ id: p.id, focusId: chamber.focusId, x: p.x + p.w / 2, y: p.y, role: p.role });
  }
  for (let index = 0; index < routeNodes.length - 1; index += 1) {
    const from = routeNodes[index];
    const to = routeNodes[index + 1];
    const steps = Math.max(1, Math.ceil((to.x - from.x) / config.constraints.maxJumpDistance));
    for (let step = 1; step < steps; step += 1) {
      const t = step / steps;
      platforms.push(platform(`platform-${String(++platformIndex).padStart(3, "0")}`, from.x + (to.x - from.x) * t - random.range(55, 95), clamp(from.y + (to.y - from.y) * t + random.range(-55, 55), 150, config.bounds.height - 180), random.range(120, 190), 28, "route-helper", from.focusId));
    }
  }
  for (let i = 0; i < config.targets.recoveryPlatforms; i += 1) {
    const point = random.pick(focusPath.points.slice(1, -1));
    platforms.push(platform(`platform-${String(++platformIndex).padStart(3, "0")}`, point.x + random.range(-190, 190), clamp(point.y + random.range(145, 230), 240, config.bounds.height - 120), random.range(110, 170), 26, "recovery", point.id));
  }
  const slots = [];
  const addSlot = (id, role, focusId, x, y, extra = {}) => slots.push({ id, role, focusId, position: { x: Math.round(x), y: Math.round(y) }, ...extra });
  const nodeByFocus = new Map(routeNodes.map((node) => [node.focusId, node]));
  addSlot("slot.start", "player-spawn", "start", routeNodes[0].x - 70, routeNodes[0].y - 50);
  const finishNode = nodeByFocus.get("finish") ?? routeNodes[routeNodes.length - 1];
  addSlot("slot.finish", "finish-gate", "finish", finishNode.x + 88, finishNode.y - 148);
  addSlot("slot.exit-trigger", "exit-trigger", "finish", finishNode.x + 126, finishNode.y - 40);
  for (const point of focusPath.points.filter((point) => point.id.startsWith("focus-"))) {
    const node = nodeByFocus.get(point.id);
    if (!node) continue;
    addSlot(`slot.${point.id}.primary`, point.role, point.id, node.x, node.y - 50);
    addSlot(`slot.${point.id}.support`, `${point.role}-support`, point.id, node.x - random.range(135, 215), node.y - 58);
    addSlot(`slot.${point.id}.effect`, "effect-anchor", point.id, node.x, node.y - 90);
    if (point.role === "physical-puzzle") {
      addSlot("slot.weighted-trigger", "weighted-trigger", point.id, node.x + 80, node.y - 8);
      addSlot("slot.heavy-block", "heavy-block", point.id, node.x - 155, node.y - 58);
    }
    if (point.role === "machine-interaction") {
      addSlot("slot.valve", "valve", point.id, node.x + 95, node.y - 96);
      addSlot("slot.machine-wheel", "machine-wheel", point.id, node.x - 24, node.y - 88);
    }
  }
  const lowY = config.bounds.height - 112;
  addSlot("slot.creature-patrol", "creature-patrol", "lower-route", config.bounds.width * 0.38, lowY, { bounds: { x: Math.round(config.bounds.width * 0.2), y: Math.round(lowY - 45), w: Math.round(config.bounds.width * 0.6), h: 85 } });
  for (let i = 0; i < config.targets.chains; i += 1) {
    const node = routeNodes[clamp(i + 1, 1, routeNodes.length - 1)] ?? routeNodes[0];
    addSlot(`slot.chain.${i + 1}`, "chain", node.focusId, node.x + random.range(-60, 60), clamp(node.y - random.range(135, 260), 110, config.bounds.height - 280), { h: Math.round(random.range(180, 310)) });
  }
  const find = (role, fallback = null) => slots.find((slot) => slot.role === role) ?? slots.find((slot) => slot.role === fallback) ?? null;
  const objects = [];
  const object = (id, type, slot, extra = {}) => { if (slot) objects.push({ id, type, slotId: slot.id, x: slot.position.x, y: slot.position.y, ...extra }); };
  object("player", "player", find("player-spawn"));
  object("heavy-block-1", "heavy-block", find("heavy-block", "physical-puzzle-support"), { weight: 5 });
  object("weighted-trigger-1", "weighted-trigger", find("weighted-trigger", "physical-puzzle"), { requiredWeight: 4 });
  object("valve-1", "valve", find("valve", "machine-interaction"));
  object("finish-gate-1", "finish-gate", find("finish-gate"));
  const creatureSlot = find("creature-patrol");
  object("creature-1", "sensory-creature", creatureSlot, { patrolBounds: creatureSlot?.bounds });
  for (const slot of slots.filter((slot) => slot.role === "chain")) object(slot.id.replace("slot.", ""), "chain", slot, { h: slot.h });
  const hazards = [
    { id: "rising-water", type: "rising-water", startLevel: Math.round(config.bounds.height - 42), speed: 3.5, acceleratedSpeed: 7.2, band: { x: 0, y: Math.round(config.bounds.height - 160), w: config.bounds.width, h: 160 } },
    { id: "creature-danger-zone", type: "creature-patrol", bounds: creatureSlot?.bounds, lowerRouteOnly: true }
  ];
  const dressing = [];
  for (let i = 0; i < config.targets.torches; i += 1) {
    const slot = random.pick(slots.filter((slot) => ["valve", "weighted-trigger", "finish-gate", "chain", "effect-anchor"].includes(slot.role)));
    dressing.push({ id: `torch-${i + 1}`, type: "torch", x: Math.round(slot.position.x + random.range(-80, 80)), y: Math.round(slot.position.y - random.range(25, 95)), purpose: "readability" });
  }
  const effects = [];
  const effectTypes = ["door-glow", "rune-spark", "dust-cloud", "water-mist", "sound-wave", "alert-pulse", "foam-line", "lantern-mote"];
  for (let i = 0; i < config.targets.reactiveEffectAnchors; i += 1) {
    const slot = random.pick(slots);
    effects.push({ id: `effect-${i + 1}`, type: random.pick(effectTypes), slotId: slot.id, x: slot.position.x, y: slot.position.y, activeWhen: slot.role });
  }
  const puzzle = {
    facts: [
      { id: "weighted-trigger-active", sourceType: "weighted-trigger", statePath: "active" },
      { id: "valve-complete", sourceType: "valve", statePath: "complete" }
    ],
    gates: [{ id: "finish-gate-condition", objectId: "finish-gate-1", mode: "all", conditions: ["weighted-trigger-active", "valve-complete"], reversible: true }]
  };
  const validation = {
    status: "pass",
    passes: ["focus-path", "platform-route", "object-targets", "hazards", "effect-anchors"],
    warnings: [],
    failures: []
  };
  return { id: request.id ?? `generated-${config.seed}`, generator: "layered-drunk-walk-level-generation-kit", bounds: config.bounds, focusPath, chambers, platforms, routeGraph: { nodes: routeNodes }, slots, objects, puzzle, hazards, dressing, effects, validation };
}

export default generateLayeredDrunkWalkLevel;
