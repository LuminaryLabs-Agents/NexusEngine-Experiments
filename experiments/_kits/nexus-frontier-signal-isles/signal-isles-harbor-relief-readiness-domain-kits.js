const clamp01 = (value) => Math.max(0, Math.min(1, Number(value ?? 0)));
const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const rounded = (value, digits = 3) => Number(number(value).toFixed(digits));
const point = (source = {}) => ({ x: rounded(source.x), z: rounded(source.z ?? source.y) });
const distance = (a = {}, b = {}) => Math.hypot(number(a.x) - number(b.x), number(a.z ?? a.y) - number(b.z ?? b.y));

export const SIGNAL_ISLES_HARBOR_RELIEF_READINESS_DOMAIN_TREE = Object.freeze({
  id: "signal-isles-harbor-relief-readiness-domain",
  subdomains: [
    {
      id: "survivor-logistics-domain",
      subdomains: [
        { id: "wounded-settlement-domain", kits: ["signal-isles-wounded-settlement-triage-kit"] },
        { id: "medicine-crate-domain", kits: ["signal-isles-medicine-crate-cache-kit"] }
      ]
    },
    {
      id: "harbor-route-domain",
      subdomains: [
        { id: "pier-landing-domain", kits: ["signal-isles-pier-landing-window-kit"] },
        { id: "skiff-channel-domain", kits: ["signal-isles-skiff-channel-thread-kit"] }
      ]
    },
    {
      id: "beacon-handoff-domain",
      subdomains: [
        { id: "relief-horn-domain", kits: ["signal-isles-relief-horn-call-kit"] },
        { id: "departure-manifest-domain", kits: ["signal-isles-departure-manifest-kit"] }
      ]
    },
    { id: "renderer-handoff", kits: ["signal-isles-harbor-relief-renderer-handoff-kit"] }
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
  return (level.cargo ?? [])[0] ?? { id: "cargo-01", x: 19, z: -8 };
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

export function createSignalIslesWoundedSettlementTriageKit() {
  return {
    id: "signal-isles-wounded-settlement-triage-kit",
    describe({ level = {}, session = {}, elapsed = 0 } = {}) {
      const sites = (level.scanSites?.length ? level.scanSites : [
        { id: "scan-ruin-01", x: -6, z: 7, radius: 4 },
        { id: "scan-ruin-02", x: 10, z: 8, radius: 4 },
        { id: "scan-ruin-03", x: 22, z: -12, radius: 4 }
      ]).slice(0, 3);
      const woundedSettlements = sites.map((site, index) => {
        const fact = scanFact(site, index);
        const known = completed(session, fact);
        const urgency = clamp01(0.32 + index * 0.16 + (pressureActive(session) ? 0.26 : 0) - (known ? 0.22 : 0));
        return {
          id: `triage-${site.id}`,
          kind: "signal-isles-wounded-settlement-triage",
          sourceId: site.id,
          ...point(site),
          radius: rounded(number(site.radius, 3.8) * (known ? 0.62 : 0.9) + urgency),
          known,
          urgency: rounded(urgency),
          active: !known || pressureActive(session),
          phase: rounded((number(elapsed) * 0.08 + index * 0.23) % 1),
          color: known ? "#8aff80" : urgency > 0.62 ? "#ff8c5a" : "#ffd166",
          label: known ? "settlement logged" : "triage settlement"
        };
      });
      return { kit: this.id, woundedSettlements };
    }
  };
}

export function createSignalIslesMedicineCrateCacheKit() {
  return {
    id: "signal-isles-medicine-crate-cache-kit",
    describe({ level = {}, session = {}, elapsed = 0 } = {}) {
      const nodes = level.resourceNodes?.length ? level.resourceNodes : [
        { id: "resource-node-01", x: -11, z: -5, amount: 2 },
        { id: "resource-node-02", x: 6, z: 12, amount: 2 }
      ];
      const harvested = new Set(session.harvestedNodeIds ?? []);
      const medicineCrates = nodes.map((node, index) => {
        const secured = harvested.has(node.id);
        const supply = clamp01((secured ? 1 : 0.24) + shardCount(session) * 0.08);
        return {
          id: `medicine-crate-${node.id}`,
          kind: "signal-isles-medicine-crate-cache",
          sourceId: node.id,
          ...point(node),
          radius: rounded(1.1 + supply * 0.9),
          secured,
          supply: rounded(supply),
          active: !secured,
          phase: rounded((number(elapsed) * 0.07 + index * 0.31) % 1),
          color: secured ? "#8aff80" : "#65f1ff",
          label: secured ? "medicine packed" : "secure medicine"
        };
      });
      return { kit: this.id, medicineCrates };
    }
  };
}

export function createSignalIslesPierLandingWindowKit() {
  return {
    id: "signal-isles-pier-landing-window-kit",
    describe({ level = {}, session = {}, elapsed = 0 } = {}) {
      const gateEntry = gate(level);
      const beacon = finalBeacon(level);
      const windows = [
        {
          id: "pier-window-gate-approach",
          targetId: gateEntry.id,
          ...point(gateEntry),
          ready: Boolean(session.gateUnlocked),
          progress: clamp01(requiredFacts(session).filter((entry) => entry.complete).length / 5),
          baseRadius: 2.2
        },
        {
          id: "pier-window-beacon-handoff",
          targetId: beacon.id,
          ...point(beacon),
          ready: completed(session, "cargo.delivered.01") || completed(session, "final.beacon.activated"),
          progress: clamp01(requiredFacts(session).filter((entry) => entry.complete).length / 8),
          baseRadius: 2.8
        }
      ];
      const pierLandingWindows = windows.map((entry, index) => ({
        id: entry.id,
        kind: "signal-isles-pier-landing-window",
        targetId: entry.targetId,
        x: entry.x,
        z: entry.z,
        radius: rounded(entry.baseRadius + entry.progress * 1.4),
        ready: entry.ready,
        progress: rounded(entry.progress),
        active: entry.ready || entry.progress > 0.2,
        phase: rounded((number(elapsed) * 0.09 + index * 0.36) % 1),
        color: entry.ready ? "#8aff80" : entry.progress > 0.55 ? "#ffd166" : "#536066",
        label: entry.ready ? "pier window open" : "prepare landing"
      }));
      return { kit: this.id, pierLandingWindows };
    }
  };
}

export function createSignalIslesSkiffChannelThreadKit() {
  return {
    id: "signal-isles-skiff-channel-thread-kit",
    describe({ level = {}, session = {} } = {}) {
      const start = level.playerStart ?? { x: -16, z: 12 };
      const gateEntry = gate(level);
      const cargoEntry = cargo(level);
      const beacon = finalBeacon(level);
      const player = session.player ?? start;
      const skiffChannelThreads = [
        {
          id: "skiff-channel-start-gate",
          kind: "signal-isles-skiff-channel-thread",
          from: point(start),
          to: point(gateEntry),
          active: !session.gateUnlocked,
          strength: rounded(session.gateUnlocked ? 0.22 : 0.7),
          color: session.gateUnlocked ? "#536066" : "#65f1ff",
          label: session.gateUnlocked ? "gate channel clear" : "open gate channel"
        },
        {
          id: "skiff-channel-cargo-beacon",
          kind: "signal-isles-skiff-channel-thread",
          from: point(session.cargoCarriedId ? player : cargoEntry),
          to: point(beacon),
          active: Boolean(session.gateUnlocked) && !completed(session, "cargo.delivered.01"),
          strength: rounded(completed(session, "cargo.delivered.01") ? 0.28 : session.gateUnlocked ? 0.84 : 0.2),
          color: completed(session, "cargo.delivered.01") ? "#8aff80" : session.gateUnlocked ? "#ffd166" : "#536066",
          label: completed(session, "cargo.delivered.01") ? "cargo ferried" : "ferry cargo"
        },
        {
          id: "skiff-channel-beacon-return",
          kind: "signal-isles-skiff-channel-thread",
          from: point(beacon),
          to: point(start),
          active: completed(session, "final.beacon.activated"),
          strength: rounded(completed(session, "final.beacon.activated") ? 0.92 : 0.18),
          color: completed(session, "final.beacon.activated") ? "#8aff80" : "#536066",
          label: completed(session, "final.beacon.activated") ? "return skiff ready" : "return channel locked"
        }
      ];
      return { kit: this.id, skiffChannelThreads };
    }
  };
}

export function createSignalIslesReliefHornCallKit() {
  return {
    id: "signal-isles-relief-horn-call-kit",
    describe({ level = {}, session = {}, elapsed = 0 } = {}) {
      const site = buildSite(level);
      const beacon = finalBeacon(level);
      const mastPlaced = (session.placedStructureIds ?? []).includes(site.structureId);
      const hornCharge = clamp01((mastPlaced ? 0.48 : 0) + (session.gateUnlocked ? 0.22 : 0) + (completed(session, "cargo.delivered.01") ? 0.18 : 0) + (completed(session, "final.beacon.activated") ? 0.12 : 0));
      const reliefHornCalls = [
        {
          id: "relief-horn-mast-call",
          kind: "signal-isles-relief-horn-call",
          targetId: site.structureId,
          ...point(site),
          radius: rounded(1.5 + hornCharge * 2.5),
          charge: rounded(hornCharge),
          active: mastPlaced,
          phase: rounded((number(elapsed) * 0.1 + hornCharge * 0.2) % 1),
          color: mastPlaced ? "#65f1ff" : "#536066",
          label: mastPlaced ? "horn calling" : "build horn mast"
        },
        {
          id: "relief-horn-beacon-answer",
          kind: "signal-isles-relief-horn-call",
          targetId: beacon.id,
          ...point(beacon),
          radius: rounded(1.8 + hornCharge * 3.0),
          charge: rounded(completed(session, "final.beacon.activated") ? 1 : hornCharge * 0.7),
          active: session.gateUnlocked || completed(session, "final.beacon.activated"),
          phase: rounded((number(elapsed) * 0.06 + 0.42) % 1),
          color: completed(session, "final.beacon.activated") ? "#8aff80" : "#ffd166",
          label: completed(session, "final.beacon.activated") ? "relief answered" : "awaiting beacon answer"
        }
      ];
      return { kit: this.id, reliefHornCalls };
    }
  };
}

export function createSignalIslesDepartureManifestKit() {
  return {
    id: "signal-isles-departure-manifest-kit",
    describe({ level = {}, session = {}, elapsed = 0 } = {}) {
      const facts = requiredFacts(session);
      const completeCount = facts.filter((entry) => entry.complete).length;
      const readiness = clamp01(completeCount / facts.length);
      const departureManifests = [
        {
          id: "departure-manifest-start-roster",
          kind: "signal-isles-departure-manifest",
          ...point(level.playerStart ?? { x: -16, z: 12 }),
          radius: rounded(1.6 + readiness * 1.1),
          readiness: rounded(readiness),
          completeCount,
          totalCount: facts.length,
          active: readiness < 1,
          phase: rounded((number(elapsed) * 0.05 + readiness * 0.33) % 1),
          color: readiness > 0.7 ? "#ffd166" : "#65f1ff",
          label: "departure roster"
        },
        {
          id: "departure-manifest-final-handoff",
          kind: "signal-isles-departure-manifest",
          ...point(finalBeacon(level)),
          radius: rounded(2.0 + readiness * 1.6),
          readiness: rounded(readiness),
          completeCount,
          totalCount: facts.length,
          active: readiness >= 0.5,
          phase: rounded((number(elapsed) * 0.07 + 0.22) % 1),
          color: readiness >= 1 ? "#8aff80" : "#ffd166",
          label: readiness >= 1 ? "manifest complete" : "manifest pending"
        }
      ];
      return { kit: this.id, departureManifests };
    }
  };
}

export function createSignalIslesHarborReliefRendererHandoffKit() {
  return {
    id: "signal-isles-harbor-relief-renderer-handoff-kit",
    describe(parts = {}) {
      const descriptors = {
        woundedSettlements: parts.woundedSettlements?.woundedSettlements ?? [],
        medicineCrates: parts.medicineCrates?.medicineCrates ?? [],
        pierLandingWindows: parts.pierLandingWindows?.pierLandingWindows ?? [],
        skiffChannelThreads: parts.skiffChannelThreads?.skiffChannelThreads ?? [],
        reliefHornCalls: parts.reliefHornCalls?.reliefHornCalls ?? [],
        departureManifests: parts.departureManifests?.departureManifests ?? []
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

export function createSignalIslesHarborReliefReadinessDomainKit() {
  const woundedSettlements = createSignalIslesWoundedSettlementTriageKit();
  const medicineCrates = createSignalIslesMedicineCrateCacheKit();
  const pierLandingWindows = createSignalIslesPierLandingWindowKit();
  const skiffChannelThreads = createSignalIslesSkiffChannelThreadKit();
  const reliefHornCalls = createSignalIslesReliefHornCallKit();
  const departureManifests = createSignalIslesDepartureManifestKit();
  const rendererHandoff = createSignalIslesHarborReliefRendererHandoffKit();
  return {
    id: "signal-isles-harbor-relief-readiness-domain-kit",
    domainTree: SIGNAL_ISLES_HARBOR_RELIEF_READINESS_DOMAIN_TREE,
    describe(input = {}) {
      const parts = {
        woundedSettlements: woundedSettlements.describe(input),
        medicineCrates: medicineCrates.describe(input),
        pierLandingWindows: pierLandingWindows.describe(input),
        skiffChannelThreads: skiffChannelThreads.describe(input),
        reliefHornCalls: reliefHornCalls.describe(input),
        departureManifests: departureManifests.describe(input)
      };
      return { kit: this.id, domainTree: this.domainTree, ...parts, rendererHandoff: rendererHandoff.describe(parts) };
    }
  };
}

export default createSignalIslesHarborReliefReadinessDomainKit;
