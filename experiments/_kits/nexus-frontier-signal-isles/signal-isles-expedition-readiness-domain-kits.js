const clamp01 = (value) => Math.max(0, Math.min(1, Number(value ?? 0)));
const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const rounded = (value, digits = 3) => Number(number(value).toFixed(digits));
const point = (source = {}) => ({ x: rounded(source.x), z: rounded(source.z ?? source.y) });
const distance = (a = {}, b = {}) => Math.hypot(number(a.x) - number(b.x), number(a.z ?? a.y) - number(b.z ?? b.y));

export const SIGNAL_ISLES_EXPEDITION_READINESS_DOMAIN_TREE = Object.freeze({
  id: "signal-isles-expedition-readiness-domain",
  subdomains: [
    {
      id: "survey-routing-domain",
      subdomains: [
        { id: "scan-sweep-domain", kits: ["signal-isles-scan-sweep-sector-kit"] },
        { id: "shard-ferry-domain", kits: ["signal-isles-shard-ferry-line-kit"] }
      ]
    },
    {
      id: "defense-unlock-domain",
      subdomains: [
        { id: "mast-charge-domain", kits: ["signal-isles-mast-charge-window-kit"] },
        { id: "pressure-retreat-domain", kits: ["signal-isles-pressure-retreat-lane-kit"] }
      ]
    },
    {
      id: "beacon-return-domain",
      subdomains: [
        { id: "gate-timing-domain", kits: ["signal-isles-gate-timing-runway-kit"] },
        { id: "beacon-forecast-domain", kits: ["signal-isles-beacon-activation-forecast-kit"] }
      ]
    },
    { id: "renderer-handoff", kits: ["signal-isles-expedition-renderer-handoff-kit"] }
  ]
});

const FACT_FOR_SCAN = Object.freeze({
  "scan-ruin-01": "scan.ruin.01",
  "scan-ruin-02": "scan.ruin.02",
  "scan-ruin-03": "scan.ruin.03"
});

function completed(session = {}, fact) {
  return Array.isArray(session.completedFacts) && session.completedFacts.includes(fact);
}

function findSceneObject(level = {}, id) {
  const sceneObject = level.sceneRecipe?.objects?.find((entry) => entry.id === id);
  return sceneObject?.transform ? { id, ...sceneObject.transform } : null;
}

function beacon(level = {}) {
  return findSceneObject(level, "final-beacon") ?? { id: "final-beacon", x: 24, z: -14 };
}

function gateProgress(gate = {}, session = {}) {
  const requirements = gate.requires ?? [];
  const satisfied = requirements.filter((fact) => completed(session, fact)).length;
  return requirements.length ? satisfied / requirements.length : 0;
}

export function createSignalIslesScanSweepSectorKit() {
  return {
    id: "signal-isles-scan-sweep-sector-kit",
    describe({ level = {}, session = {}, elapsed = 0 } = {}) {
      const player = session.player ?? {};
      const sectors = (level.scanSites ?? []).map((site, index) => {
        const fact = FACT_FOR_SCAN[site.id] ?? site.id;
        const done = completed(session, fact);
        const progress = done ? 1 : clamp01(number(site.__progress) / Math.max(1, number(site.required, 1)));
        const d = distance(player, site);
        const eligible = d <= number(site.radius, 4) + 2;
        const sweep = clamp01((number(elapsed) * 0.09 + index * 0.23 + progress * 0.38) % 1);
        return {
          id: `scan-sweep-${site.id}`,
          kind: "signal-isles-scan-sweep-sector",
          scanSiteId: site.id,
          fact,
          ...point(site),
          radius: rounded(number(site.radius, 4) + 1.2 + sweep * 0.8),
          distance: rounded(d),
          progress: rounded(progress),
          eligible,
          complete: done,
          sweep,
          priority: rounded((done ? 0.12 : eligible ? 1 : 0.42) / Math.max(1, d * 0.08)),
          color: done ? "#8aff80" : eligible ? "#65f1ff" : "#486c78",
          label: done ? "scan locked" : eligible ? "hold scan" : "survey arc"
        };
      });
      return { kit: this.id, sectors };
    }
  };
}

export function createSignalIslesShardFerryLineKit() {
  return {
    id: "signal-isles-shard-ferry-line-kit",
    describe({ level = {}, session = {} } = {}) {
      const buildSite = (level.buildSites ?? [])[0] ?? { id: "build-site-01", x: 3, z: -8, cost: { "signal-shards": 3 } };
      const shards = number(session.resources?.["signal-shards"]);
      const harvested = new Set(session.harvestedNodeIds ?? []);
      const cost = number(buildSite.cost?.["signal-shards"], 3);
      const lines = (level.resourceNodes ?? []).map((node) => {
        const depleted = harvested.has(node.id);
        return {
          id: `shard-ferry-${node.id}-to-${buildSite.id}`,
          kind: "signal-isles-shard-ferry-line",
          from: point(node),
          to: point(buildSite),
          resourceId: node.resourceId ?? "signal-shards",
          amount: depleted ? 0 : number(node.amount),
          carried: shards,
          required: cost,
          depleted,
          strength: rounded(depleted ? 0.16 : clamp01(number(node.amount) / Math.max(1, cost))),
          color: depleted ? "#536066" : shards >= cost ? "#65f1ff" : "#ffd166",
          label: depleted ? "ferry spent" : "ferry shards"
        };
      });
      const gate = (level.gates ?? [])[0];
      if (gate) {
        lines.push({
          id: "mast-output-to-gate-ferry-line",
          kind: "signal-isles-shard-ferry-line",
          from: point(buildSite),
          to: point(gate),
          resourceId: "signal-charge",
          amount: shards,
          carried: shards,
          required: cost,
          depleted: false,
          strength: completed(session, "build.signal-mast.01") ? 0.9 : clamp01(shards / Math.max(1, cost)),
          color: completed(session, "build.signal-mast.01") ? "#8aff80" : shards >= cost ? "#65f1ff" : "#ff8c5a",
          label: completed(session, "build.signal-mast.01") ? "mast feeding gate" : "mast needs charge"
        });
      }
      return { kit: this.id, lines };
    }
  };
}

export function createSignalIslesMastChargeWindowKit() {
  return {
    id: "signal-isles-mast-charge-window-kit",
    describe({ level = {}, session = {}, elapsed = 0 } = {}) {
      const shards = number(session.resources?.["signal-shards"]);
      const windows = (level.buildSites ?? []).map((site) => {
        const cost = number(site.cost?.["signal-shards"], 3);
        const placed = (session.placedStructureIds ?? []).includes(site.structureId);
        const charge = placed ? 1 : clamp01(shards / Math.max(1, cost));
        return {
          id: `mast-charge-window-${site.id}`,
          kind: "signal-isles-mast-charge-window",
          buildSiteId: site.id,
          structureId: site.structureId,
          ...point(site),
          radius: rounded(2.1 + charge * 1.2),
          charge: rounded(charge),
          available: shards,
          required: cost,
          missing: Math.max(0, cost - shards),
          ready: charge >= 1,
          placed,
          pulse: rounded((number(elapsed) * 0.16 + charge * 0.4) % 1),
          color: placed ? "#8aff80" : charge >= 1 ? "#65f1ff" : "#ff8c5a",
          label: placed ? "mast online" : charge >= 1 ? "build window" : "charge mast"
        };
      });
      return { kit: this.id, windows };
    }
  };
}

export function createSignalIslesPressureRetreatLaneKit() {
  return {
    id: "signal-isles-pressure-retreat-lane-kit",
    describe({ level = {}, session = {}, kitStates = {} } = {}) {
      const player = session.player ?? level.playerStart ?? {};
      const agents = Object.values(kitStates.agentGroup?.agents ?? {});
      const hazards = level.hazards ?? [];
      const threats = agents.length ? agents : hazards;
      const pockets = [
        { id: "retreat-west-shore", x: -20, z: 8, radius: 4.6 },
        { id: "retreat-mast-pad", x: 4, z: -12, radius: 4.1 },
        { id: "retreat-beacon-ridge", x: 21, z: -16, radius: 4.3 }
      ];
      const lanes = pockets.map((pocket, index) => {
        const nearestThreat = Math.min(...threats.map((threat) => distance(pocket, threat)), 99);
        const playerDistance = distance(player, pocket);
        const pressureActive = session.phase === "pressure" || Boolean(session.waveStarted);
        const safety = clamp01((nearestThreat - 2) / 22);
        return {
          id: `pressure-retreat-lane-${pocket.id}`,
          kind: "signal-isles-pressure-retreat-lane",
          from: point(player),
          to: point(pocket),
          pocket: { ...point(pocket), radius: pocket.radius },
          pressureActive,
          safety: rounded(safety),
          distance: rounded(playerDistance),
          strength: rounded((pressureActive ? 0.72 : 0.36) + safety * 0.26),
          color: safety > 0.55 ? "#8aff80" : "#ffd166",
          label: pressureActive ? "retreat lane" : index === 1 ? "fallback pad" : "safe pocket"
        };
      });
      return { kit: this.id, lanes };
    }
  };
}

export function createSignalIslesGateTimingRunwayKit() {
  return {
    id: "signal-isles-gate-timing-runway-kit",
    describe({ level = {}, session = {}, elapsed = 0 } = {}) {
      const gate = (level.gates ?? [])[0];
      const checkpoint = level.route?.checkpoints?.[0] ?? null;
      const cargo = level.cargo?.[0] ?? null;
      const runways = [];
      if (gate) {
        const progress = session.gateUnlocked ? 1 : gateProgress(gate, session);
        runways.push({
          id: `gate-timing-${gate.id}`,
          kind: "signal-isles-gate-timing-runway",
          ...point(gate),
          radius: rounded(2.4 + progress * 1.5),
          progress: rounded(progress),
          unlocked: Boolean(session.gateUnlocked),
          missingFacts: (gate.requires ?? []).filter((fact) => !completed(session, fact)),
          phase: rounded((number(elapsed) * 0.07 + progress * 0.4) % 1),
          color: session.gateUnlocked ? "#8aff80" : progress > 0.5 ? "#65f1ff" : "#ff8c5a",
          label: session.gateUnlocked ? "gate open" : "gate timing"
        });
        if (checkpoint) runways.push({
          id: "gate-to-checkpoint-runway",
          kind: "signal-isles-gate-timing-runway",
          from: point(gate),
          to: point(checkpoint),
          progress: rounded(progress),
          unlocked: Boolean(session.gateUnlocked),
          strength: rounded(session.gateUnlocked ? 0.92 : 0.28 + progress * 0.34),
          color: session.gateUnlocked ? "#8aff80" : "#536066",
          label: "route runway"
        });
        if (cargo) runways.push({
          id: "checkpoint-to-cargo-runway",
          kind: "signal-isles-gate-timing-runway",
          from: point(checkpoint ?? gate),
          to: point(cargo),
          progress: rounded(session.gateUnlocked ? 0.82 : progress * 0.4),
          unlocked: Boolean(session.gateUnlocked),
          strength: rounded(session.gateUnlocked ? 0.74 : 0.2),
          color: session.gateUnlocked ? "#ffd166" : "#536066",
          label: session.gateUnlocked ? "cargo runway" : "cargo locked"
        });
      }
      return { kit: this.id, runways };
    }
  };
}

export function createSignalIslesBeaconActivationForecastKit() {
  return {
    id: "signal-isles-beacon-activation-forecast-kit",
    describe({ level = {}, session = {}, objective = {} } = {}) {
      const cargo = (level.cargo ?? [])[0] ?? null;
      const finalBeacon = beacon(level);
      const scanThree = (level.scanSites ?? []).find((site) => site.id === "scan-ruin-03") ?? finalBeacon;
      const facts = [
        { id: "forecast-scan-final", fact: "scan.ruin.03", target: scanThree, label: "final scan" },
        { id: "forecast-deliver-cargo", fact: "cargo.delivered.01", target: cargo ?? finalBeacon, label: "deliver charge" },
        { id: "forecast-activate-beacon", fact: "final.beacon.activated", target: finalBeacon, label: "activate beacon" }
      ];
      const nextIndex = facts.findIndex((candidate) => !completed(session, candidate.fact));
      const forecasts = facts.map((entry, index) => {
        const done = completed(session, entry.fact);
        const active = objective.current?.requires?.includes(entry.fact) || (!done && index === nextIndex);
        return {
          id: entry.id,
          kind: "signal-isles-beacon-activation-forecast",
          fact: entry.fact,
          ...point(entry.target),
          radius: rounded(1.45 + index * 0.32),
          complete: done,
          active,
          order: index,
          readiness: rounded(done ? 1 : active ? 0.72 : 0.32),
          color: done ? "#8aff80" : active ? "#65f1ff" : "#536066",
          label: entry.label
        };
      });
      if (cargo && finalBeacon) {
        forecasts.push({
          id: "forecast-cargo-to-beacon-thread",
          kind: "signal-isles-beacon-activation-forecast",
          from: point(session.cargoCarriedId ? session.player ?? cargo : cargo),
          to: point(finalBeacon),
          active: Boolean(session.gateUnlocked),
          complete: completed(session, "cargo.delivered.01"),
          readiness: completed(session, "cargo.delivered.01") ? 1 : session.gateUnlocked ? 0.76 : 0.18,
          strength: completed(session, "cargo.delivered.01") ? 0.9 : session.gateUnlocked ? 0.64 : 0.18,
          color: completed(session, "cargo.delivered.01") ? "#8aff80" : session.gateUnlocked ? "#ffd166" : "#536066",
          label: "beacon forecast"
        });
      }
      return { kit: this.id, forecasts };
    }
  };
}

export function createSignalIslesExpeditionRendererHandoffKit() {
  return {
    id: "signal-isles-expedition-renderer-handoff-kit",
    describe(parts = {}) {
      const descriptors = {
        scanSectors: parts.scanSweeps?.sectors ?? [],
        shardFerryLines: parts.shardFerries?.lines ?? [],
        mastWindows: parts.mastWindows?.windows ?? [],
        retreatLanes: parts.retreatLanes?.lanes ?? [],
        gateRunways: parts.gateRunways?.runways ?? [],
        beaconForecasts: parts.beaconForecasts?.forecasts ?? []
      };
      return {
        kit: this.id,
        contract: {
          rendererConsumesDescriptorsOnly: true,
          forbiddenOwnership: ["DOM", "browser-input", "Three.js", "WebGL", "audio", "asset-loading", "frame-loop"]
        },
        descriptors,
        counts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0]))
      };
    }
  };
}

export function createSignalIslesExpeditionReadinessDomainKit() {
  const scanSweeps = createSignalIslesScanSweepSectorKit();
  const shardFerries = createSignalIslesShardFerryLineKit();
  const mastWindows = createSignalIslesMastChargeWindowKit();
  const retreatLanes = createSignalIslesPressureRetreatLaneKit();
  const gateRunways = createSignalIslesGateTimingRunwayKit();
  const beaconForecasts = createSignalIslesBeaconActivationForecastKit();
  const rendererHandoff = createSignalIslesExpeditionRendererHandoffKit();
  return {
    id: "signal-isles-expedition-readiness-domain-kit",
    domainTree: SIGNAL_ISLES_EXPEDITION_READINESS_DOMAIN_TREE,
    describe(input = {}) {
      const parts = {
        scanSweeps: scanSweeps.describe(input),
        shardFerries: shardFerries.describe(input),
        mastWindows: mastWindows.describe(input),
        retreatLanes: retreatLanes.describe(input),
        gateRunways: gateRunways.describe(input),
        beaconForecasts: beaconForecasts.describe(input)
      };
      return { kit: this.id, domainTree: this.domainTree, ...parts, rendererHandoff: rendererHandoff.describe(parts) };
    }
  };
}

export default createSignalIslesExpeditionReadinessDomainKit;
