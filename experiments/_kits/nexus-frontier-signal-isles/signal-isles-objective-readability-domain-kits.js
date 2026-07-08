const clamp01 = (value) => Math.max(0, Math.min(1, Number(value ?? 0)));
const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const rounded = (value, digits = 3) => Number(number(value).toFixed(digits));
const point = (source = {}) => ({ x: rounded(source.x), z: rounded(source.z ?? source.y) });
const distance = (a = {}, b = {}) => Math.hypot(number(a.x) - number(b.x), number(a.z ?? a.y) - number(b.z ?? b.y));

export const SIGNAL_ISLES_OBJECTIVE_READABILITY_DOMAIN_TREE = Object.freeze({
  id: "signal-isles-objective-readability-domain",
  subdomains: [
    { id: "objective-intent-domain", subdomains: [{ id: "objective-step-domain", kits: ["signal-isles-objective-step-queue-kit"] }, { id: "proximity-action-domain", kits: ["signal-isles-proximity-action-cue-kit"] }] },
    { id: "route-consequence-domain", subdomains: [{ id: "gate-dependency-domain", kits: ["signal-isles-gate-dependency-thread-kit"] }, { id: "cargo-route-domain", kits: ["signal-isles-cargo-route-ribbon-kit"] }] },
    { id: "survival-economy-domain", subdomains: [{ id: "safe-pocket-domain", kits: ["signal-isles-pressure-safe-pocket-kit"] }, { id: "resource-build-domain", kits: ["signal-isles-resource-build-delta-kit"] }] },
    { id: "renderer-handoff", kits: ["signal-isles-objective-renderer-handoff-kit"] }
  ]
});

const FACT_TARGETS = Object.freeze({
  "scan.ruin.01": "scan-ruin-01", "scan.ruin.02": "scan-ruin-02", "scan.ruin.03": "scan-ruin-03",
  "resource.node.01": "resource-node-01", "resource.node.02": "resource-node-02", "build.signal-mast.01": "build-site-01",
  "pressure.wave.01.survived": "pressure-spores", "lock.gate.01": "gate-01", "route.checkpoint.01": "checkpoint-01",
  "cargo.picked.01": "cargo-01", "cargo.delivered.01": "final-beacon", "final.beacon.activated": "final-beacon"
});

function completed(session = {}, fact) { return Array.isArray(session.completedFacts) && session.completedFacts.includes(fact); }
function allObjects(level = {}) {
  return [
    ...(level.scanSites ?? []).map((entry) => ({ ...entry, kit: "scan", action: "scan" })),
    ...(level.resourceNodes ?? []).map((entry) => ({ ...entry, kit: "resource", action: "harvest" })),
    ...(level.buildSites ?? []).map((entry) => ({ ...entry, kit: "build", action: "build" })),
    ...(level.gates ?? []).map((entry) => ({ ...entry, kit: "gate", action: "unlock" })),
    ...(level.route?.checkpoints ?? []).map((entry) => ({ ...entry, kit: "checkpoint", action: "route" })),
    ...(level.cargo ?? []).map((entry) => ({ ...entry, kit: "cargo", action: "carry" })),
    ...(level.hazards ?? []).map((entry) => ({ ...entry, kit: "hazard", action: "avoid" })),
    ...(level.sceneRecipe?.objects ?? []).map((entry) => ({ ...entry.transform, id: entry.id, kit: entry.kit, action: entry.kit }))
  ];
}
function findTarget(level = {}, id) { return id ? allObjects(level).find((entry) => entry.id === id) ?? null : null; }
function targetForFact(level = {}, fact) { return findTarget(level, FACT_TARGETS[fact] ?? fact); }
function activeObjective(level = {}, objective = {}, session = {}) { return objective.current ?? level.objectives?.find((entry) => !entry.requires.every((fact) => completed(session, fact))) ?? null; }

export function createSignalIslesObjectiveStepQueueKit() {
  return {
    id: "signal-isles-objective-step-queue-kit",
    describe({ level = {}, session = {}, objective = {} } = {}) {
      const current = activeObjective(level, objective, session);
      const objectiveIndex = Math.max(0, level.objectives?.findIndex((entry) => entry.id === current?.id) ?? 0);
      const beats = (level.objectives ?? []).map((entry, index) => {
        const missing = entry.requires.filter((fact) => !completed(session, fact));
        const focusFact = missing[0] ?? entry.requires.at(-1);
        const target = targetForFact(level, focusFact) ?? targetForFact(level, entry.requires[0]) ?? session.player;
        return { id: `objective-beat-${entry.id}`, kind: "objective-step-beat", order: index, active: entry.id === current?.id, complete: missing.length === 0, missingFacts: missing, progress: rounded((entry.requires.length - missing.length) / Math.max(1, entry.requires.length)), x: rounded(target?.x), z: rounded(target?.z ?? target?.y), radius: rounded(1.15 + index * 0.22), color: missing.length === 0 ? "#8aff80" : entry.id === current?.id ? "#65f1ff" : "#536066", label: entry.label };
      });
      return { kit: this.id, beats, activeObjectiveId: current?.id ?? null, objectiveIndex };
    }
  };
}

export function createSignalIslesProximityActionCueKit() {
  return {
    id: "signal-isles-proximity-action-cue-kit",
    describe({ level = {}, session = {}, preset = {} } = {}) {
      const player = session.player ?? {}, interactRadius = number(preset.tuning?.interactRadius, 4), scanRadiusPad = 2;
      const harvested = new Set(session.harvestedNodeIds ?? []), placed = new Set(session.placedStructureIds ?? []), cues = [];
      for (const site of level.scanSites ?? []) {
        const fact = site.id === "scan-ruin-01" ? "scan.ruin.01" : site.id === "scan-ruin-02" ? "scan.ruin.02" : "scan.ruin.03";
        const d = distance(player, site), radius = number(site.radius, 4) + scanRadiusPad;
        if (!completed(session, fact)) cues.push({ id: `action-scan-${site.id}`, kind: "proximity-action-cue", action: "scan", ...point(site), radius: rounded(radius), distance: rounded(d), eligible: d <= radius, priority: rounded(1 / Math.max(1, d)), color: d <= radius ? "#65f1ff" : "#486c78", label: "scan ruin" });
      }
      for (const node of level.resourceNodes ?? []) {
        if (harvested.has(node.id)) continue;
        const d = distance(player, node);
        cues.push({ id: `action-harvest-${node.id}`, kind: "proximity-action-cue", action: "harvest", ...point(node), radius: interactRadius, distance: rounded(d), eligible: d <= interactRadius, priority: rounded(1 / Math.max(1, d)), color: d <= interactRadius ? "#ffd166" : "#6d5c2a", label: "harvest shards" });
      }
      for (const site of level.buildSites ?? []) {
        if (placed.has(site.structureId)) continue;
        const d = distance(player, site), cost = number(site.cost?.["signal-shards"]), shards = number(session.resources?.["signal-shards"]), radius = number(preset.tuning?.buildInteractRadius, interactRadius);
        cues.push({ id: `action-build-${site.id}`, kind: "proximity-action-cue", action: "build", ...point(site), radius, distance: rounded(d), eligible: d <= radius && shards >= cost, blockedBy: shards >= cost ? [] : ["missing-signal-shards"], priority: rounded((shards >= cost ? 1 : 0.35) / Math.max(1, d)), color: shards >= cost ? "#65f1ff" : "#ff8c5a", label: shards >= cost ? "build mast" : "needs shards" });
      }
      const gate = (level.gates ?? [])[0];
      if (gate && !session.gateUnlocked) cues.push({ id: `action-gate-${gate.id}`, kind: "proximity-action-cue", action: "unlock", ...point(gate), radius: number(gate.radius, 4.5), distance: rounded(distance(player, gate)), eligible: false, blockedBy: gate.requires?.filter((fact) => !completed(session, fact)) ?? [], priority: 0.25, color: "#ff8c5a", label: "gate locked" });
      return { kit: this.id, cues: cues.sort((a, b) => b.priority - a.priority).slice(0, 8) };
    }
  };
}

export function createSignalIslesGateDependencyThreadKit() {
  return {
    id: "signal-isles-gate-dependency-thread-kit",
    describe({ level = {}, session = {} } = {}) {
      const gate = level.gates?.[0] ?? null, finalBeacon = findTarget(level, "final-beacon"), checkpoint = level.route?.checkpoints?.[0] ?? null, cargo = level.cargo?.[0] ?? null;
      const threads = [];
      if (gate) for (const fact of gate.requires ?? []) { const target = targetForFact(level, fact); if (target) threads.push({ id: `gate-dependency-${fact}`, kind: "gate-dependency-thread", from: point(target), to: point(gate), satisfied: completed(session, fact), strength: completed(session, fact) ? 0.92 : 0.24, color: completed(session, fact) ? "#65f1ff" : "#ff8c5a", label: fact }); }
      if (gate && checkpoint) threads.push({ id: "route-gate-to-checkpoint", kind: "gate-dependency-thread", from: point(gate), to: point(checkpoint), satisfied: Boolean(session.gateUnlocked), strength: session.gateUnlocked ? 0.9 : 0.2, color: session.gateUnlocked ? "#8aff80" : "#536066", label: "gate to route marker" });
      if (cargo && finalBeacon) threads.push({ id: "route-cargo-to-final-beacon", kind: "gate-dependency-thread", from: point(cargo), to: point(finalBeacon), satisfied: completed(session, "cargo.delivered.01"), strength: session.cargoCarriedId ? 1 : session.gateUnlocked ? 0.72 : 0.18, color: completed(session, "cargo.delivered.01") ? "#8aff80" : session.gateUnlocked ? "#ffd166" : "#536066", label: "cargo delivery chain" });
      return { kit: this.id, threads };
    }
  };
}

export function createSignalIslesCargoRouteRibbonKit() {
  return {
    id: "signal-isles-cargo-route-ribbon-kit",
    describe({ level = {}, session = {} } = {}) {
      const player = point(session.player ?? {}), cargo = level.cargo?.[0] ?? null, beacon = findTarget(level, "final-beacon"), checkpoint = level.route?.checkpoints?.[0] ?? null, ribbons = [];
      if (cargo && beacon && session.cargoCarriedId === cargo.id) ribbons.push({ id: "cargo-carried-to-beacon", kind: "cargo-route-ribbon", from: player, to: point(beacon), strength: 1, carrying: true, color: "#ffd166", label: "deliver carried charge" });
      else if (cargo && beacon) {
        ribbons.push({ id: "cargo-approach-ribbon", kind: "cargo-route-ribbon", from: session.gateUnlocked ? player : point(checkpoint ?? cargo), to: point(cargo), strength: session.gateUnlocked ? 0.82 : 0.28, carrying: false, color: session.gateUnlocked ? "#65f1ff" : "#536066", label: session.gateUnlocked ? "retrieve charge" : "cargo behind locked route" });
        ribbons.push({ id: "cargo-target-ribbon", kind: "cargo-route-ribbon", from: point(cargo), to: point(beacon), strength: session.gateUnlocked ? 0.58 : 0.18, carrying: false, color: session.gateUnlocked ? "#ffd166" : "#536066", label: "charge target" });
      }
      return { kit: this.id, ribbons };
    }
  };
}

export function createSignalIslesPressureSafePocketKit() {
  return {
    id: "signal-isles-pressure-safe-pocket-kit",
    describe({ level = {}, session = {}, kitStates = {} } = {}) {
      const hazards = level.hazards ?? [], agents = Object.values(kitStates.agentGroup?.agents ?? {});
      const pockets = [{ id: "safe-pocket-west-shore", x: -18, z: 4, radius: 4.4 }, { id: "safe-pocket-build-pad", x: 5, z: -12, radius: 3.8 }, { id: "safe-pocket-beacon-ridge", x: 18, z: -16, radius: 3.9 }].map((entry, index) => {
        const nearestHazard = Math.min(...hazards.map((hazard) => distance(entry, hazard) - number(hazard.radius)), 99), nearestAgent = Math.min(...agents.map((agent) => distance(entry, agent)), 99), safety = clamp01((Math.min(nearestHazard, nearestAgent) + 8) / 18);
        return { id: entry.id, kind: "pressure-safe-pocket", ...point(entry), radius: rounded(entry.radius), safety: rounded(safety), active: session.phase === "pressure" || session.waveStarted, pulse: rounded((number(session.elapsed) * 0.11 + index * 0.21) % 1), color: safety > 0.55 ? "#8aff80" : "#ffd166", label: safety > 0.55 ? "safe pocket" : "contested pocket" };
      });
      return { kit: this.id, pockets };
    }
  };
}

export function createSignalIslesResourceBuildDeltaKit() {
  return {
    id: "signal-isles-resource-build-delta-kit",
    describe({ level = {}, session = {} } = {}) {
      const shards = number(session.resources?.["signal-shards"]), harvested = new Set(session.harvestedNodeIds ?? []), deltas = [];
      for (const site of level.buildSites ?? []) { const cost = number(site.cost?.["signal-shards"]), placed = session.placedStructureIds?.includes(site.structureId) ?? false; deltas.push({ id: `resource-build-delta-${site.id}`, kind: "resource-build-delta", ...point(site), radius: 1.9, available: shards, required: cost, missing: Math.max(0, cost - shards), ready: shards >= cost, placed, color: placed ? "#8aff80" : shards >= cost ? "#65f1ff" : "#ff8c5a", label: placed ? "mast online" : shards >= cost ? "build ready" : "needs shards" }); }
      for (const node of level.resourceNodes ?? []) deltas.push({ id: `resource-source-delta-${node.id}`, kind: "resource-build-delta", ...point(node), radius: number(node.radius, 4.5), available: harvested.has(node.id) ? 0 : number(node.amount), required: 0, missing: 0, ready: !harvested.has(node.id), placed: false, color: harvested.has(node.id) ? "#536066" : "#ffd166", label: harvested.has(node.id) ? "source depleted" : "shard source" });
      return { kit: this.id, deltas };
    }
  };
}

export function createSignalIslesObjectiveRendererHandoffKit() {
  return {
    id: "signal-isles-objective-renderer-handoff-kit",
    describe(parts = {}) {
      const descriptors = { objectiveBeats: parts.objectiveSteps?.beats ?? [], actionCues: parts.proximityActions?.cues ?? [], dependencyThreads: parts.gateDependencies?.threads ?? [], cargoRibbons: parts.cargoRoutes?.ribbons ?? [], safePockets: parts.safePockets?.pockets ?? [], resourceDeltas: parts.resourceDeltas?.deltas ?? [] };
      return { kit: this.id, contract: { rendererConsumesDescriptorsOnly: true, forbiddenOwnership: ["DOM", "browser-input", "Three.js", "WebGL", "audio", "asset-loading", "frame-loop"] }, descriptors, counts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length])) };
    }
  };
}

export function createSignalIslesObjectiveReadabilityDomainKit() {
  const objectiveSteps = createSignalIslesObjectiveStepQueueKit();
  const proximityActions = createSignalIslesProximityActionCueKit();
  const gateDependencies = createSignalIslesGateDependencyThreadKit();
  const cargoRoutes = createSignalIslesCargoRouteRibbonKit();
  const safePockets = createSignalIslesPressureSafePocketKit();
  const resourceDeltas = createSignalIslesResourceBuildDeltaKit();
  const rendererHandoff = createSignalIslesObjectiveRendererHandoffKit();
  return {
    id: "signal-isles-objective-readability-domain-kit",
    domainTree: SIGNAL_ISLES_OBJECTIVE_READABILITY_DOMAIN_TREE,
    describe(input = {}) {
      const parts = { objectiveSteps: objectiveSteps.describe(input), proximityActions: proximityActions.describe(input), gateDependencies: gateDependencies.describe(input), cargoRoutes: cargoRoutes.describe(input), safePockets: safePockets.describe(input), resourceDeltas: resourceDeltas.describe(input) };
      return { kit: this.id, domainTree: this.domainTree, ...parts, rendererHandoff: rendererHandoff.describe(parts) };
    }
  };
}

export default createSignalIslesObjectiveReadabilityDomainKit;
