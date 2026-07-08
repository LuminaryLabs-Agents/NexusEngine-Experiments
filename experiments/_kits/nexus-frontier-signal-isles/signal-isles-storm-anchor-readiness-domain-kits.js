const clamp01 = (value) => Math.max(0, Math.min(1, Number(value ?? 0)));
const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const rounded = (value, digits = 3) => Number(number(value).toFixed(digits));
const point = (source = {}) => ({ x: rounded(source.x), z: rounded(source.z ?? source.y) });
const distance = (a = {}, b = {}) => Math.hypot(number(a.x) - number(b.x), number(a.z ?? a.y) - number(b.z ?? b.y));

export const SIGNAL_ISLES_STORM_ANCHOR_READINESS_DOMAIN_TREE = Object.freeze({
  id: "signal-isles-storm-anchor-readiness-domain",
  subdomains: [
    {
      id: "storm-front-domain",
      subdomains: [
        { id: "storm-cell-forecast-domain", kits: ["signal-isles-storm-cell-forecast-kit"] },
        { id: "lightning-grounding-domain", kits: ["signal-isles-lightning-grounding-kit"] }
      ]
    },
    {
      id: "anchor-shelter-domain",
      subdomains: [
        { id: "shelter-pocket-domain", kits: ["signal-isles-shelter-pocket-kit"] },
        { id: "anchor-cable-tension-domain", kits: ["signal-isles-anchor-cable-tension-kit"] }
      ]
    },
    {
      id: "beacon-return-domain",
      subdomains: [
        { id: "beacon-resonance-domain", kits: ["signal-isles-beacon-resonance-kit"] },
        { id: "evacuation-tide-domain", kits: ["signal-isles-evacuation-tide-route-kit"] }
      ]
    },
    { id: "renderer-handoff", kits: ["signal-isles-storm-anchor-renderer-handoff-kit"] }
  ]
});

function completed(session = {}, fact) {
  return Array.isArray(session.completedFacts) && session.completedFacts.includes(fact);
}

function sceneObject(level = {}, id, fallback = {}) {
  const entry = level.sceneRecipe?.objects?.find((candidate) => candidate.id === id);
  return entry?.transform ? { id, ...entry.transform } : { id, ...fallback };
}

function finalBeacon(level = {}) {
  return sceneObject(level, "final-beacon", { x: 24, z: -14 });
}

function buildSite(level = {}) {
  return (level.buildSites ?? [])[0] ?? { id: "build-site-01", structureId: "signal-mast-01", x: 3, z: -8, cost: { "signal-shards": 3 } };
}

function gate(level = {}) {
  return (level.gates ?? [])[0] ?? { id: "gate-01", x: 15, z: -1, requires: ["scan.ruin.01", "scan.ruin.02", "build.signal-mast.01", "pressure.wave.01.survived"] };
}

function activePressure(session = {}) {
  return session.phase === "pressure" || Boolean(session.waveStarted);
}

function shardCount(session = {}) {
  return number(session.resources?.["signal-shards"]);
}

function nearestThreatDistance(target, threats = []) {
  return threats.length ? Math.min(...threats.map((threat) => distance(target, threat))) : 99;
}

export function createSignalIslesStormCellForecastKit() {
  return {
    id: "signal-isles-storm-cell-forecast-kit",
    describe({ level = {}, session = {}, elapsed = 0, kitStates = {} } = {}) {
      const pressureActive = activePressure(session);
      const hazards = level.hazards ?? [];
      const agents = Object.values(kitStates.agentGroup?.agents ?? {});
      const cells = [
        ...hazards.map((hazard, index) => {
          const drift = (number(elapsed) * 0.05 + index * 0.27) % 1;
          return {
            id: `storm-cell-${hazard.id}`,
            kind: "signal-isles-storm-cell-forecast",
            sourceId: hazard.id,
            ...point(hazard),
            radius: rounded(number(hazard.radius, 5) + 1.2 + drift * 1.1),
            pressure: rounded(clamp01(number(hazard.amount, 0.12) * 3.6 + (pressureActive ? 0.28 : 0))),
            active: pressureActive || number(hazard.amount) > 0.1,
            phase: rounded(drift),
            color: pressureActive ? "#ff8c5a" : "#536066",
            label: pressureActive ? "storm cell rising" : "storm cell quiet"
          };
        }),
        ...agents.map((agent, index) => {
          const surge = (number(elapsed) * 0.08 + index * 0.19) % 1;
          return {
            id: `storm-cell-agent-${agent.id}`,
            kind: "signal-isles-storm-cell-forecast",
            sourceId: agent.id,
            ...point(agent),
            radius: rounded(2.1 + surge * 0.9),
            pressure: rounded(0.72 + surge * 0.2),
            active: true,
            phase: rounded(surge),
            color: "#ff6a5c",
            label: "wisp storm cell"
          };
        })
      ];
      return { kit: this.id, cells };
    }
  };
}

export function createSignalIslesLightningGroundingKit() {
  return {
    id: "signal-isles-lightning-grounding-kit",
    describe({ level = {}, session = {}, elapsed = 0 } = {}) {
      const site = buildSite(level);
      const gateEntry = gate(level);
      const placed = (session.placedStructureIds ?? []).includes(site.structureId);
      const shards = shardCount(session);
      const cost = number(site.cost?.["signal-shards"], 3);
      const charge = placed ? 1 : clamp01(shards / Math.max(1, cost));
      const rods = [
        {
          id: `grounding-rod-${site.structureId}`,
          kind: "signal-isles-lightning-grounding-rod",
          targetId: site.structureId,
          ...point(site),
          radius: rounded(1.4 + charge * 1.4),
          grounded: placed,
          charge: rounded(charge),
          pulse: rounded((number(elapsed) * 0.11 + charge * 0.42) % 1),
          color: placed ? "#8aff80" : charge >= 1 ? "#65f1ff" : "#ffd166",
          label: placed ? "mast grounded" : "ground mast"
        },
        {
          id: `grounding-rod-${gateEntry.id}`,
          kind: "signal-isles-lightning-grounding-rod",
          targetId: gateEntry.id,
          ...point(gateEntry),
          radius: rounded(1.8 + (session.gateUnlocked ? 1.2 : 0.4)),
          grounded: Boolean(session.gateUnlocked),
          charge: rounded(session.gateUnlocked ? 1 : charge * 0.45),
          pulse: rounded((number(elapsed) * 0.07 + 0.24) % 1),
          color: session.gateUnlocked ? "#8aff80" : "#536066",
          label: session.gateUnlocked ? "gate grounded" : "gate exposed"
        }
      ];
      return { kit: this.id, rods };
    }
  };
}

export function createSignalIslesShelterPocketKit() {
  return {
    id: "signal-isles-shelter-pocket-kit",
    describe({ level = {}, session = {}, kitStates = {} } = {}) {
      const player = session.player ?? level.playerStart ?? {};
      const threats = [...(level.hazards ?? []), ...Object.values(kitStates.agentGroup?.agents ?? {})];
      const pockets = [
        { id: "shelter-start-ridge", x: -16, z: 12, radius: 4.4, baseSafety: 0.72 },
        { id: "shelter-mast-pad", ...point(buildSite(level)), radius: 4.2, baseSafety: 0.58 },
        { id: "shelter-beacon-lee", x: 22, z: -17, radius: 4.6, baseSafety: 0.64 }
      ];
      const shelterPockets = pockets.map((pocket) => {
        const threatDistance = nearestThreatDistance(pocket, threats);
        const safety = clamp01(number(pocket.baseSafety) + (threatDistance - 8) / 34 - (activePressure(session) ? 0.14 : 0));
        return {
          id: `storm-shelter-${pocket.id}`,
          kind: "signal-isles-shelter-pocket",
          ...point(pocket),
          radius: rounded(pocket.radius + safety * 0.8),
          distance: rounded(distance(player, pocket)),
          threatDistance: rounded(threatDistance),
          safety: rounded(safety),
          active: safety > 0.38,
          color: safety > 0.6 ? "#8aff80" : "#ffd166",
          label: safety > 0.6 ? "safe lee" : "thin shelter"
        };
      });
      return { kit: this.id, shelterPockets };
    }
  };
}

export function createSignalIslesAnchorCableTensionKit() {
  return {
    id: "signal-isles-anchor-cable-tension-kit",
    describe({ level = {}, session = {}, elapsed = 0 } = {}) {
      const site = buildSite(level);
      const gateEntry = gate(level);
      const beacon = finalBeacon(level);
      const mastPlaced = (session.placedStructureIds ?? []).includes(site.structureId);
      const gateOpen = Boolean(session.gateUnlocked);
      const cables = [
        {
          id: "anchor-cable-start-to-mast",
          kind: "signal-isles-anchor-cable-tension",
          from: point(level.playerStart ?? { x: -16, z: 12 }),
          to: point(site),
          tension: rounded(mastPlaced ? 0.36 : 0.74),
          strength: rounded(mastPlaced ? 0.42 : 0.72),
          active: !mastPlaced,
          color: mastPlaced ? "#536066" : "#ffd166",
          label: mastPlaced ? "start cable slack" : "anchor the mast"
        },
        {
          id: "anchor-cable-mast-to-gate",
          kind: "signal-isles-anchor-cable-tension",
          from: point(site),
          to: point(gateEntry),
          tension: rounded(gateOpen ? 0.34 : mastPlaced ? 0.82 : 0.44),
          strength: rounded(gateOpen ? 0.38 : mastPlaced ? 0.86 : 0.34),
          active: mastPlaced && !gateOpen,
          color: gateOpen ? "#8aff80" : mastPlaced ? "#65f1ff" : "#536066",
          label: gateOpen ? "gate cable stable" : "gate cable tension"
        },
        {
          id: "anchor-cable-gate-to-beacon",
          kind: "signal-isles-anchor-cable-tension",
          from: point(gateEntry),
          to: point(beacon),
          tension: rounded(completed(session, "cargo.delivered.01") ? 0.32 : gateOpen ? 0.78 : 0.2),
          strength: rounded(completed(session, "cargo.delivered.01") ? 0.42 : gateOpen ? 0.76 : 0.18),
          active: gateOpen,
          phase: rounded((number(elapsed) * 0.06) % 1),
          color: completed(session, "cargo.delivered.01") ? "#8aff80" : gateOpen ? "#ffd166" : "#536066",
          label: gateOpen ? "beacon cable" : "beacon cable locked"
        }
      ];
      return { kit: this.id, cables };
    }
  };
}

export function createSignalIslesBeaconResonanceKit() {
  return {
    id: "signal-isles-beacon-resonance-kit",
    describe({ level = {}, session = {}, elapsed = 0 } = {}) {
      const beacon = finalBeacon(level);
      const completedFacts = session.completedFacts ?? [];
      const resonance = clamp01(completedFacts.filter((fact) => ["scan.ruin.03", "cargo.delivered.01", "final.beacon.activated"].includes(fact)).length / 3);
      const rings = [
        {
          id: "beacon-resonance-core",
          kind: "signal-isles-beacon-resonance-ring",
          ...point(beacon),
          radius: rounded(1.8 + resonance * 2.4),
          resonance: rounded(resonance),
          active: resonance > 0 || session.gateUnlocked,
          pulse: rounded((number(elapsed) * 0.09 + resonance * 0.31) % 1),
          color: completed(session, "final.beacon.activated") ? "#8aff80" : resonance > 0.4 ? "#65f1ff" : "#ffd166",
          label: completed(session, "final.beacon.activated") ? "beacon harmonized" : "beacon resonance"
        },
        ...(level.scanSites ?? []).map((site) => {
          const fact = site.id === "scan-ruin-01" ? "scan.ruin.01" : site.id === "scan-ruin-02" ? "scan.ruin.02" : "scan.ruin.03";
          const done = completed(session, fact);
          return {
            id: `beacon-resonance-${site.id}`,
            kind: "signal-isles-beacon-resonance-ring",
            scanSiteId: site.id,
            ...point(site),
            radius: rounded(number(site.radius, 4) * (done ? 0.48 : 0.32)),
            resonance: done ? 1 : 0.18,
            active: done,
            color: done ? "#8aff80" : "#536066",
            label: done ? "ruin in chorus" : "silent ruin"
          };
        })
      ];
      return { kit: this.id, rings };
    }
  };
}

export function createSignalIslesEvacuationTideRouteKit() {
  return {
    id: "signal-isles-evacuation-tide-route-kit",
    describe({ level = {}, session = {} } = {}) {
      const player = session.player ?? level.playerStart ?? {};
      const gateEntry = gate(level);
      const cargo = (level.cargo ?? [])[0] ?? null;
      const beacon = finalBeacon(level);
      const routes = [
        {
          id: "evacuation-player-to-gate",
          kind: "signal-isles-evacuation-tide-route",
          from: point(player),
          to: point(gateEntry),
          unlocked: Boolean(session.gateUnlocked),
          active: !session.gateUnlocked,
          strength: rounded(session.gateUnlocked ? 0.34 : 0.7),
          color: session.gateUnlocked ? "#536066" : "#65f1ff",
          label: session.gateUnlocked ? "gate passed" : "move to gate"
        }
      ];
      if (cargo) {
        routes.push({
          id: "evacuation-cargo-to-beacon",
          kind: "signal-isles-evacuation-tide-route",
          from: point(session.cargoCarriedId ? player : cargo),
          to: point(beacon),
          unlocked: Boolean(session.gateUnlocked),
          active: Boolean(session.gateUnlocked) && !completed(session, "cargo.delivered.01"),
          strength: rounded(completed(session, "cargo.delivered.01") ? 0.3 : session.gateUnlocked ? 0.82 : 0.18),
          color: completed(session, "cargo.delivered.01") ? "#8aff80" : session.gateUnlocked ? "#ffd166" : "#536066",
          label: completed(session, "cargo.delivered.01") ? "cargo delivered" : "carry charge"
        });
      }
      routes.push({
        id: "evacuation-beacon-to-start",
        kind: "signal-isles-evacuation-tide-route",
        from: point(beacon),
        to: point(level.playerStart ?? { x: -16, z: 12 }),
        unlocked: completed(session, "final.beacon.activated"),
        active: completed(session, "final.beacon.activated"),
        strength: completed(session, "final.beacon.activated") ? 0.92 : 0.16,
        color: completed(session, "final.beacon.activated") ? "#8aff80" : "#536066",
        label: completed(session, "final.beacon.activated") ? "evacuate on tide" : "return locked"
      });
      return { kit: this.id, routes };
    }
  };
}

export function createSignalIslesStormAnchorRendererHandoffKit() {
  return {
    id: "signal-isles-storm-anchor-renderer-handoff-kit",
    describe(parts = {}) {
      const descriptors = {
        stormCells: parts.stormCells?.cells ?? [],
        groundingRods: parts.groundingRods?.rods ?? [],
        shelterPockets: parts.shelterPockets?.shelterPockets ?? [],
        anchorCables: parts.anchorCables?.cables ?? [],
        beaconResonanceRings: parts.beaconResonance?.rings ?? [],
        evacuationTideRoutes: parts.evacuationTides?.routes ?? []
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

export function createSignalIslesStormAnchorReadinessDomainKit() {
  const stormCells = createSignalIslesStormCellForecastKit();
  const groundingRods = createSignalIslesLightningGroundingKit();
  const shelterPockets = createSignalIslesShelterPocketKit();
  const anchorCables = createSignalIslesAnchorCableTensionKit();
  const beaconResonance = createSignalIslesBeaconResonanceKit();
  const evacuationTides = createSignalIslesEvacuationTideRouteKit();
  const rendererHandoff = createSignalIslesStormAnchorRendererHandoffKit();
  return {
    id: "signal-isles-storm-anchor-readiness-domain-kit",
    domainTree: SIGNAL_ISLES_STORM_ANCHOR_READINESS_DOMAIN_TREE,
    describe(input = {}) {
      const parts = {
        stormCells: stormCells.describe(input),
        groundingRods: groundingRods.describe(input),
        shelterPockets: shelterPockets.describe(input),
        anchorCables: anchorCables.describe(input),
        beaconResonance: beaconResonance.describe(input),
        evacuationTides: evacuationTides.describe(input)
      };
      return { kit: this.id, domainTree: this.domainTree, ...parts, rendererHandoff: rendererHandoff.describe(parts) };
    }
  };
}

export default createSignalIslesStormAnchorReadinessDomainKit;
