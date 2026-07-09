const clamp01 = (value) => Math.max(0, Math.min(1, Number(value ?? 0)));
const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const rounded = (value, digits = 3) => Number(number(value).toFixed(digits));
const point = (source = {}) => ({ x: rounded(source.x), z: rounded(source.z ?? source.y) });

export const SIGNAL_ISLES_LIGHTHOUSE_EVACUATION_READINESS_DOMAIN_TREE = Object.freeze({
  id: "signal-isles-lighthouse-evacuation-readiness-domain",
  subdomains: [
    {
      id: "keeper-safety-domain",
      subdomains: [
        { id: "stranded-keeper-domain", kits: ["signal-isles-stranded-keeper-beacon-kit"] },
        { id: "lantern-fuel-domain", kits: ["signal-isles-lantern-fuel-cache-kit"] }
      ]
    },
    {
      id: "tide-route-domain",
      subdomains: [
        { id: "reef-gap-domain", kits: ["signal-isles-reef-gap-window-kit"] },
        { id: "rescue-boat-domain", kits: ["signal-isles-rescue-boat-channel-kit"] }
      ]
    },
    {
      id: "night-handoff-domain",
      subdomains: [
        { id: "foghorn-signal-domain", kits: ["signal-isles-foghorn-signal-kit"] },
        { id: "evacuation-roster-domain", kits: ["signal-isles-evacuation-roster-kit"] }
      ]
    },
    { id: "renderer-handoff", kits: ["signal-isles-lighthouse-evacuation-renderer-handoff-kit"] }
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
  return (level.gates ?? [])[0] ?? { id: "gate-01", x: 15, z: -1 };
}

function cargo(level = {}) {
  return (level.cargo ?? [])[0] ?? { id: "cargo-01", x: 18, z: -8 };
}

function checkpoint(level = {}) {
  return level.route?.checkpoints?.[0] ?? { id: "checkpoint-01", x: 17, z: -4 };
}

function scanFact(site = {}, index = 0) {
  if (site.id === "scan-ruin-01") return "scan.ruin.01";
  if (site.id === "scan-ruin-02") return "scan.ruin.02";
  if (site.id === "scan-ruin-03") return "scan.ruin.03";
  return `scan.ruin.${index + 1}`;
}

function pressureActive(session = {}) {
  return session.phase === "pressure" || Boolean(session.waveStarted);
}

function shardCount(session = {}) {
  return number(session.resources?.["signal-shards"]);
}

function requiredFacts(session = {}) {
  const facts = session.completedFacts ?? [];
  return [
    "scan.ruin.01",
    "scan.ruin.02",
    "build.signal-mast.01",
    "pressure.wave.01.survived",
    "lock.gate.01",
    "route.checkpoint.01",
    "cargo.delivered.01",
    "final.beacon.activated"
  ].map((fact) => ({ fact, complete: facts.includes(fact) }));
}

function readiness(session = {}) {
  const facts = requiredFacts(session);
  return clamp01(facts.filter((entry) => entry.complete).length / facts.length);
}

export function createSignalIslesStrandedKeeperBeaconKit() {
  return {
    id: "signal-isles-stranded-keeper-beacon-kit",
    describe({ level = {}, session = {}, elapsed = 0 } = {}) {
      const sites = (level.scanSites?.length ? level.scanSites : [
        { id: "scan-ruin-01", x: -8, z: -6, radius: 5 },
        { id: "scan-ruin-02", x: 10, z: 3, radius: 5 },
        { id: "scan-ruin-03", x: 21, z: -12, radius: 5.5 }
      ]).slice(0, 3);
      const strandedKeepers = sites.map((site, index) => {
        const fact = scanFact(site, index);
        const found = completed(session, fact);
        const urgency = clamp01(0.38 + index * 0.14 + (pressureActive(session) ? 0.28 : 0) - (found ? 0.24 : 0));
        return {
          id: `keeper-beacon-${site.id}`,
          kind: "signal-isles-stranded-keeper-beacon",
          sourceId: site.id,
          ...point(site),
          radius: rounded(number(site.radius, 4.5) * (found ? 0.62 : 0.88) + urgency),
          found,
          urgency: rounded(urgency),
          active: !found || pressureActive(session),
          phase: rounded((number(elapsed) * 0.09 + index * 0.21) % 1),
          color: found ? "#8aff80" : urgency > 0.66 ? "#ff8c5a" : "#ffd166",
          label: found ? "keeper found" : "stranded keeper"
        };
      });
      return { kit: this.id, strandedKeepers };
    }
  };
}

export function createSignalIslesLanternFuelCacheKit() {
  return {
    id: "signal-isles-lantern-fuel-cache-kit",
    describe({ level = {}, session = {}, elapsed = 0 } = {}) {
      const nodes = level.resourceNodes?.length ? level.resourceNodes : [
        { id: "resource-node-01", x: -15, z: -14, amount: 2 },
        { id: "resource-node-02", x: 3, z: 16, amount: 3 }
      ];
      const harvested = new Set(session.harvestedNodeIds ?? []);
      const lanternFuelCaches = nodes.map((node, index) => {
        const packed = harvested.has(node.id);
        const fuel = clamp01((packed ? 0.82 : 0.22) + shardCount(session) * 0.07 + (pressureActive(session) ? 0.08 : 0));
        return {
          id: `lantern-fuel-${node.id}`,
          kind: "signal-isles-lantern-fuel-cache",
          sourceId: node.id,
          ...point(node),
          radius: rounded(0.95 + fuel * 1.15),
          packed,
          fuel: rounded(fuel),
          active: !packed || pressureActive(session),
          phase: rounded((number(elapsed) * 0.08 + index * 0.37) % 1),
          color: packed ? "#8aff80" : "#65f1ff",
          label: packed ? "fuel packed" : "pack lantern fuel"
        };
      });
      return { kit: this.id, lanternFuelCaches };
    }
  };
}

export function createSignalIslesReefGapWindowKit() {
  return {
    id: "signal-isles-reef-gap-window-kit",
    describe({ level = {}, session = {}, elapsed = 0 } = {}) {
      const routeGate = gate(level);
      const routeCheckpoint = checkpoint(level);
      const beacon = finalBeacon(level);
      const progress = readiness(session);
      const reefGapWindows = [
        {
          id: "reef-gap-gate",
          kind: "signal-isles-reef-gap-window",
          targetId: routeGate.id,
          ...point(routeGate),
          radius: rounded(1.8 + progress * 1.6),
          progress: rounded(progress),
          ready: Boolean(session.gateUnlocked),
          active: progress > 0.18 || Boolean(session.gateUnlocked),
          phase: rounded((number(elapsed) * 0.07 + 0.12) % 1),
          color: session.gateUnlocked ? "#8aff80" : "#ffd166",
          label: session.gateUnlocked ? "reef gap open" : "open reef gap"
        },
        {
          id: "reef-gap-checkpoint",
          kind: "signal-isles-reef-gap-window",
          targetId: routeCheckpoint.id,
          ...point(routeCheckpoint),
          radius: rounded(1.6 + progress * 1.2),
          progress: rounded(progress),
          ready: completed(session, "route.checkpoint.01"),
          active: Boolean(session.gateUnlocked),
          phase: rounded((number(elapsed) * 0.08 + 0.44) % 1),
          color: completed(session, "route.checkpoint.01") ? "#8aff80" : "#65f1ff",
          label: completed(session, "route.checkpoint.01") ? "checkpoint cleared" : "mark reef checkpoint"
        },
        {
          id: "reef-gap-final-beacon",
          kind: "signal-isles-reef-gap-window",
          targetId: beacon.id,
          ...point(beacon),
          radius: rounded(2.1 + progress * 1.8),
          progress: rounded(progress),
          ready: completed(session, "cargo.delivered.01") || completed(session, "final.beacon.activated"),
          active: progress >= 0.5,
          phase: rounded((number(elapsed) * 0.06 + 0.71) % 1),
          color: completed(session, "final.beacon.activated") ? "#8aff80" : "#ffd166",
          label: completed(session, "final.beacon.activated") ? "beacon evacuation clear" : "prepare beacon reef gap"
        }
      ];
      return { kit: this.id, reefGapWindows };
    }
  };
}

export function createSignalIslesRescueBoatChannelKit() {
  return {
    id: "signal-isles-rescue-boat-channel-kit",
    describe({ level = {}, session = {} } = {}) {
      const start = level.playerStart ?? { x: -16, z: 12 };
      const routeGate = gate(level);
      const cargoEntry = cargo(level);
      const beacon = finalBeacon(level);
      const player = session.player ?? start;
      const rescueBoatChannels = [
        {
          id: "rescue-boat-start-gate",
          kind: "signal-isles-rescue-boat-channel",
          from: point(start),
          to: point(routeGate),
          active: !session.gateUnlocked,
          strength: rounded(session.gateUnlocked ? 0.24 : 0.74),
          color: session.gateUnlocked ? "#536066" : "#65f1ff",
          label: session.gateUnlocked ? "gate route cleared" : "guide boat to gate"
        },
        {
          id: "rescue-boat-cargo-beacon",
          kind: "signal-isles-rescue-boat-channel",
          from: point(session.cargoCarriedId ? player : cargoEntry),
          to: point(beacon),
          active: Boolean(session.gateUnlocked) && !completed(session, "cargo.delivered.01"),
          strength: rounded(completed(session, "cargo.delivered.01") ? 0.28 : session.gateUnlocked ? 0.88 : 0.2),
          color: completed(session, "cargo.delivered.01") ? "#8aff80" : session.gateUnlocked ? "#ffd166" : "#536066",
          label: completed(session, "cargo.delivered.01") ? "cargo evacuation delivered" : "escort charge to lighthouse"
        },
        {
          id: "rescue-boat-beacon-return",
          kind: "signal-isles-rescue-boat-channel",
          from: point(beacon),
          to: point(start),
          active: completed(session, "final.beacon.activated"),
          strength: rounded(completed(session, "final.beacon.activated") ? 0.94 : 0.18),
          color: completed(session, "final.beacon.activated") ? "#8aff80" : "#536066",
          label: completed(session, "final.beacon.activated") ? "return boat ready" : "return boat locked"
        }
      ];
      return { kit: this.id, rescueBoatChannels };
    }
  };
}

export function createSignalIslesFoghornSignalKit() {
  return {
    id: "signal-isles-foghorn-signal-kit",
    describe({ level = {}, session = {}, elapsed = 0 } = {}) {
      const site = buildSite(level);
      const beacon = finalBeacon(level);
      const mastPlaced = (session.placedStructureIds ?? []).includes(site.structureId);
      const charge = clamp01((mastPlaced ? 0.46 : 0) + (session.gateUnlocked ? 0.22 : 0) + (completed(session, "cargo.delivered.01") ? 0.2 : 0) + (completed(session, "final.beacon.activated") ? 0.12 : 0));
      const foghornSignals = [
        {
          id: "foghorn-signal-mast",
          kind: "signal-isles-foghorn-signal",
          targetId: site.structureId,
          ...point(site),
          radius: rounded(1.4 + charge * 2.6),
          charge: rounded(charge),
          active: mastPlaced,
          phase: rounded((number(elapsed) * 0.11 + charge * 0.2) % 1),
          color: mastPlaced ? "#65f1ff" : "#536066",
          label: mastPlaced ? "foghorn charging" : "build foghorn mast"
        },
        {
          id: "foghorn-signal-beacon",
          kind: "signal-isles-foghorn-signal",
          targetId: beacon.id,
          ...point(beacon),
          radius: rounded(1.9 + charge * 3.1),
          charge: rounded(completed(session, "final.beacon.activated") ? 1 : charge * 0.72),
          active: session.gateUnlocked || completed(session, "final.beacon.activated"),
          phase: rounded((number(elapsed) * 0.07 + 0.49) % 1),
          color: completed(session, "final.beacon.activated") ? "#8aff80" : "#ffd166",
          label: completed(session, "final.beacon.activated") ? "foghorn answered" : "awaiting beacon foghorn"
        }
      ];
      return { kit: this.id, foghornSignals };
    }
  };
}

export function createSignalIslesEvacuationRosterKit() {
  return {
    id: "signal-isles-evacuation-roster-kit",
    describe({ level = {}, session = {}, elapsed = 0 } = {}) {
      const evacuationReadiness = readiness(session);
      const facts = requiredFacts(session);
      const completeCount = facts.filter((entry) => entry.complete).length;
      const evacuationRosters = [
        {
          id: "evacuation-roster-camp",
          kind: "signal-isles-evacuation-roster",
          ...point(level.playerStart ?? { x: -16, z: 12 }),
          radius: rounded(1.5 + evacuationReadiness * 1.1),
          readiness: rounded(evacuationReadiness),
          completeCount,
          totalCount: facts.length,
          active: evacuationReadiness < 1,
          phase: rounded((number(elapsed) * 0.05 + evacuationReadiness * 0.35) % 1),
          color: evacuationReadiness > 0.7 ? "#ffd166" : "#65f1ff",
          label: "evacuation roster"
        },
        {
          id: "evacuation-roster-lighthouse",
          kind: "signal-isles-evacuation-roster",
          ...point(finalBeacon(level)),
          radius: rounded(2 + evacuationReadiness * 1.65),
          readiness: rounded(evacuationReadiness),
          completeCount,
          totalCount: facts.length,
          active: evacuationReadiness >= 0.5,
          phase: rounded((number(elapsed) * 0.07 + 0.29) % 1),
          color: evacuationReadiness >= 1 ? "#8aff80" : "#ffd166",
          label: evacuationReadiness >= 1 ? "evacuation complete" : "lighthouse roster pending"
        }
      ];
      return { kit: this.id, evacuationRosters };
    }
  };
}

export function createSignalIslesLighthouseEvacuationRendererHandoffKit() {
  return {
    id: "signal-isles-lighthouse-evacuation-renderer-handoff-kit",
    describe(parts = {}) {
      const descriptors = {
        strandedKeepers: parts.strandedKeepers?.strandedKeepers ?? [],
        lanternFuelCaches: parts.lanternFuelCaches?.lanternFuelCaches ?? [],
        reefGapWindows: parts.reefGapWindows?.reefGapWindows ?? [],
        rescueBoatChannels: parts.rescueBoatChannels?.rescueBoatChannels ?? [],
        foghornSignals: parts.foghornSignals?.foghornSignals ?? [],
        evacuationRosters: parts.evacuationRosters?.evacuationRosters ?? []
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

export function createSignalIslesLighthouseEvacuationReadinessDomainKit() {
  const strandedKeepers = createSignalIslesStrandedKeeperBeaconKit();
  const lanternFuelCaches = createSignalIslesLanternFuelCacheKit();
  const reefGapWindows = createSignalIslesReefGapWindowKit();
  const rescueBoatChannels = createSignalIslesRescueBoatChannelKit();
  const foghornSignals = createSignalIslesFoghornSignalKit();
  const evacuationRosters = createSignalIslesEvacuationRosterKit();
  const rendererHandoff = createSignalIslesLighthouseEvacuationRendererHandoffKit();
  return {
    id: "signal-isles-lighthouse-evacuation-readiness-domain-kit",
    domainTree: SIGNAL_ISLES_LIGHTHOUSE_EVACUATION_READINESS_DOMAIN_TREE,
    describe(input = {}) {
      const parts = {
        strandedKeepers: strandedKeepers.describe(input),
        lanternFuelCaches: lanternFuelCaches.describe(input),
        reefGapWindows: reefGapWindows.describe(input),
        rescueBoatChannels: rescueBoatChannels.describe(input),
        foghornSignals: foghornSignals.describe(input),
        evacuationRosters: evacuationRosters.describe(input)
      };
      return { kit: this.id, domainTree: this.domainTree, ...parts, rendererHandoff: rendererHandoff.describe(parts) };
    }
  };
}

export default createSignalIslesLighthouseEvacuationReadinessDomainKit;
