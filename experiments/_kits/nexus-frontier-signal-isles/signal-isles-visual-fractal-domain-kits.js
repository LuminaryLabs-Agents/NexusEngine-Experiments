const clamp01 = (value) => Math.max(0, Math.min(1, Number(value ?? 0)));
const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const rounded = (value, digits = 3) => Number(number(value).toFixed(digits));
const point = (source = {}) => ({ x: rounded(source.x), z: rounded(source.z ?? source.y) });
const distance = (a = {}, b = {}) => Math.hypot(number(a.x) - number(b.x), number(a.z ?? a.y) - number(b.z ?? b.y));

function findObject(level = {}, id) {
  return level.sceneRecipe?.objects?.find((entry) => entry.id === id) ?? null;
}

function objectPoint(entry = {}) {
  return point(entry.transform ?? entry);
}

function completed(session = {}, fact) {
  return Array.isArray(session.completedFacts) && session.completedFacts.includes(fact);
}

function makeSeeded01(seed) {
  let h = 2166136261;
  for (const c of String(seed)) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  h += 0x6D2B79F5;
  h = Math.imul(h ^ (h >>> 15), h | 1);
  h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
  return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
}

export function createSignalIslesIslandReliefCellKit() {
  return {
    id: "signal-isles-island-relief-cell-kit",
    describe({ level = {}, session = {} } = {}) {
      const radius = number(level.sceneRecipe?.terrain?.radius, 38);
      const zones = level.biomeDescriptors?.zones ?? [];
      const cells = [
        {
          id: "island-core-breath",
          kind: "terrain-relief-cell",
          x: 0,
          z: 0,
          radius: rounded(radius * 0.72),
          pulse: rounded(0.35 + Math.sin(number(session.elapsed) * 0.42) * 0.08),
          color: level.biomeDescriptors?.fallbackBiome?.color ?? "#284533",
          label: "moss-rock core"
        },
        ...zones.map((zone, index) => ({
          id: `biome-relief-${zone.id}`,
          kind: "terrain-relief-cell",
          x: rounded(zone.x),
          z: rounded(zone.z),
          radius: rounded(zone.radius),
          pulse: rounded(0.26 + index * 0.05 + Math.sin(number(session.elapsed) * 0.33 + index) * 0.05),
          color: level.biomeDescriptors?.biomes?.find((biome) => biome.id === zone.biomeId)?.color ?? "#2d4b57",
          label: zone.biomeId
        })),
        {
          id: "shoreline-falloff",
          kind: "terrain-relief-cell",
          x: 0,
          z: 0,
          radius: rounded(radius * 1.02),
          pulse: rounded(0.18 + Math.sin(number(session.elapsed) * 0.21) * 0.04),
          color: "#143545",
          label: "shoreline falloff"
        }
      ];
      return { kit: this.id, cells };
    }
  };
}

export function createSignalIslesSignalFlowThreadKit() {
  return {
    id: "signal-isles-signal-flow-thread-kit",
    describe({ level = {}, session = {} } = {}) {
      const build = findObject(level, "build-site-01");
      const gate = findObject(level, "gate-01");
      const beacon = findObject(level, "final-beacon");
      const scanSites = level.scanSites ?? [];
      const threads = scanSites.map((site, index) => {
        const fact = site.id === "scan-ruin-01" ? "scan.ruin.01" : site.id === "scan-ruin-02" ? "scan.ruin.02" : "scan.ruin.03";
        const target = index < 2 ? build : beacon;
        return {
          id: `thread-${site.id}`,
          kind: "signal-flow-thread",
          from: point(site),
          to: objectPoint(target),
          strength: completed(session, fact) ? 1 : 0.28,
          pulse: rounded((number(session.elapsed) * 0.21 + index * 0.17) % 1),
          color: completed(session, fact) ? "#65f1ff" : "#486c78",
          label: `${site.id} to ${target?.id ?? "unknown"}`
        };
      });
      if (build && gate) {
        threads.push({
          id: "thread-mast-to-gate",
          kind: "signal-flow-thread",
          from: objectPoint(build),
          to: objectPoint(gate),
          strength: completed(session, "build.signal-mast.01") ? 0.86 : 0.16,
          pulse: rounded((number(session.elapsed) * 0.18) % 1),
          color: completed(session, "build.signal-mast.01") ? "#ffd166" : "#536066",
          label: "mast to gate"
        });
      }
      if (gate && beacon) {
        threads.push({
          id: "thread-gate-to-beacon",
          kind: "signal-flow-thread",
          from: objectPoint(gate),
          to: objectPoint(beacon),
          strength: session.gateUnlocked ? 1 : 0.18,
          pulse: rounded((number(session.elapsed) * 0.24) % 1),
          color: session.gateUnlocked ? "#65f1ff" : "#4f5961",
          label: "gate to beacon"
        });
      }
      return { kit: this.id, threads };
    }
  };
}

export function createSignalIslesHazardPressureFrontKit() {
  return {
    id: "signal-isles-hazard-pressure-front-kit",
    describe({ level = {}, session = {}, kitStates = {} } = {}) {
      const radius = number(level.sceneRecipe?.terrain?.radius, 38);
      const agents = Object.entries(kitStates.agentGroup?.agents ?? {});
      const rings = [
        {
          id: "island-pressure-front",
          kind: "hazard-pressure-front",
          x: 0,
          z: 0,
          radius: rounded(radius * (session.waveStarted ? 0.88 : 1.08)),
          intensity: session.phase === "pressure" ? 0.85 : 0.24,
          color: session.phase === "pressure" ? "#ff6a5c" : "#294456",
          label: session.phase === "pressure" ? "pressure wave active" : "pressure dormant"
        }
      ];
      for (const [id, agent] of agents) {
        rings.push({
          id: `agent-pressure-${id}`,
          kind: "hazard-pressure-front",
          x: rounded(agent.x),
          z: rounded(agent.z ?? agent.y),
          radius: 2.6,
          intensity: 0.7,
          color: "#ff6a5c",
          label: "agent threat halo"
        });
      }
      return { kit: this.id, rings };
    }
  };
}

export function createSignalIslesResourceShardClusterKit() {
  return {
    id: "signal-isles-resource-shard-cluster-kit",
    describe({ level = {}, session = {} } = {}) {
      const harvested = new Set(session.harvestedNodeIds ?? []);
      const shardSources = [
        ...(level.resourceNodes ?? []).map((node) => ({ ...node, sourceKind: "resource-node", active: !harvested.has(node.id) })),
        ...(level.cargo ?? []).map((node) => ({ ...node, sourceKind: "cargo", active: session.gateUnlocked && session.cargoCarriedId !== node.id }))
      ];
      const shards = [];
      for (const source of shardSources) {
        const base = point(source);
        for (let i = 0; i < 5; i += 1) {
          const seed = makeSeeded01(`${source.id}:${i}`);
          const angle = seed * Math.PI * 2 + number(session.elapsed) * 0.16;
          const radius = 0.45 + seed * 0.62;
          shards.push({
            id: `${source.id}-shard-${i}`,
            kind: "resource-shard-spark",
            x: rounded(base.x + Math.cos(angle) * radius),
            z: rounded(base.z + Math.sin(angle) * radius),
            size: rounded(0.08 + seed * 0.08),
            active: Boolean(source.active),
            phase: rounded((number(session.elapsed) * 0.19 + seed) % 1),
            color: source.sourceKind === "cargo" ? "#ffd166" : "#65f1ff",
            label: source.sourceKind
          });
        }
      }
      return { kit: this.id, shards };
    }
  };
}

export function createSignalIslesBuildGhostReadoutKit() {
  return {
    id: "signal-isles-build-ghost-readout-kit",
    describe({ level = {}, session = {} } = {}) {
      const shards = number(session.resources?.["signal-shards"]);
      const ghosts = (level.buildSites ?? []).map((site) => {
        const cost = number(site.cost?.["signal-shards"], 0);
        const placed = session.placedStructureIds?.includes(site.structureId) ?? false;
        return {
          id: `build-ghost-${site.id}`,
          kind: "build-ghost-readout",
          ...point(site),
          radius: 1.42,
          ready: shards >= cost,
          placed,
          required: cost,
          available: shards,
          color: placed ? "#65f1ff" : shards >= cost ? "#ffd166" : "#ff8c5a",
          label: placed ? "mast placed" : shards >= cost ? "ready to build" : "needs shards"
        };
      });
      return { kit: this.id, ghosts };
    }
  };
}

export function createSignalIslesObjectiveBeaconCompassKit() {
  return {
    id: "signal-isles-objective-beacon-compass-kit",
    describe({ level = {}, session = {}, objective = {} } = {}) {
      const targetId = objective.current?.targetId ?? "final-beacon";
      const target = findObject(level, targetId) ?? findObject(level, "final-beacon");
      const player = point(session.player ?? {});
      const targetPoint = objectPoint(target);
      const completeCount = Array.isArray(session.completedFacts) ? session.completedFacts.length : 0;
      const total = Math.max(1, level.objectives?.length ?? 1);
      const progress = clamp01((session.completedObjectives?.length ?? 0) / total);
      return {
        kit: this.id,
        compass: {
          id: "active-objective-compass",
          kind: "objective-beacon-compass",
          from: player,
          to: targetPoint,
          distance: rounded(distance(player, targetPoint)),
          progress: rounded(progress),
          completedFacts: completeCount,
          color: session.completed ? "#8aff80" : "#65f1ff",
          label: objective.current?.label ?? "Beacon restored"
        }
      };
    }
  };
}

export function createSignalIslesRendererHandoffKit() {
  return {
    id: "signal-isles-renderer-handoff-kit",
    describe(parts = {}) {
      const descriptors = {
        reliefCells: parts.islandRelief?.cells ?? [],
        signalThreads: parts.signalFlow?.threads ?? [],
        pressureFronts: parts.hazardPressure?.rings ?? [],
        resourceShards: parts.resourceShards?.shards ?? [],
        buildGhosts: parts.buildGhosts?.ghosts ?? [],
        compass: parts.beaconCompass?.compass ? [parts.beaconCompass.compass] : []
      };
      return {
        kit: this.id,
        contract: {
          rendererConsumesDescriptorsOnly: true,
          forbiddenOwnership: ["DOM", "browser-input", "Three.js", "WebGL", "audio", "asset-loading", "frame-loop"]
        },
        descriptors,
        counts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]))
      };
    }
  };
}

export function createSignalIslesVisualFractalDomainKit() {
  const islandRelief = createSignalIslesIslandReliefCellKit();
  const signalFlow = createSignalIslesSignalFlowThreadKit();
  const hazardPressure = createSignalIslesHazardPressureFrontKit();
  const resourceShards = createSignalIslesResourceShardClusterKit();
  const buildGhosts = createSignalIslesBuildGhostReadoutKit();
  const beaconCompass = createSignalIslesObjectiveBeaconCompassKit();
  const rendererHandoff = createSignalIslesRendererHandoffKit();

  return {
    id: "signal-isles-visual-fractal-domain-kit",
    domainTree: {
      id: "signal-isles-visual-fractal-domain",
      subdomains: [
        { id: "island-surface-domain", kits: [islandRelief.id] },
        { id: "signal-route-domain", kits: [signalFlow.id, beaconCompass.id] },
        { id: "pressure-ecology-domain", kits: [hazardPressure.id, resourceShards.id] },
        { id: "build-readiness-domain", kits: [buildGhosts.id] },
        { id: "renderer-handoff", kits: [rendererHandoff.id] }
      ]
    },
    describe(input = {}) {
      const parts = {
        islandRelief: islandRelief.describe(input),
        signalFlow: signalFlow.describe(input),
        hazardPressure: hazardPressure.describe(input),
        resourceShards: resourceShards.describe(input),
        buildGhosts: buildGhosts.describe(input),
        beaconCompass: beaconCompass.describe(input)
      };
      return {
        kit: this.id,
        domainTree: this.domainTree,
        ...parts,
        rendererHandoff: rendererHandoff.describe(parts)
      };
    }
  };
}

export default createSignalIslesVisualFractalDomainKit;
