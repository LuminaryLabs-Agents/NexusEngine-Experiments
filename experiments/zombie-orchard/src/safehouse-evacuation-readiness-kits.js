export const ZOMBIE_ORCHARD_SAFEHOUSE_EVACUATION_DOMAIN_TREE = `
zombie-orchard-safehouse-evacuation-readiness-domain
├─ survivor-route-domain
│  ├─ safehouse-beacon-domain
│  │  └─ zombie-orchard-safehouse-beacon-kit
│  └─ orchard-lane-clearance-domain
│     └─ zombie-orchard-lane-clearance-kit
├─ infection-containment-domain
│  ├─ barricade-reinforcement-domain
│  │  └─ zombie-orchard-barricade-reinforcement-kit
│  └─ antidote-runner-domain
│     └─ zombie-orchard-antidote-runner-kit
├─ dawn-extraction-domain
│  ├─ wagon-rally-domain
│  │  └─ zombie-orchard-dawn-wagon-rally-kit
│  └─ radio-tower-signal-domain
│     └─ zombie-orchard-radio-tower-signal-kit
└─ renderer-handoff
   └─ zombie-orchard-safehouse-evacuation-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;

export const ZOMBIE_ORCHARD_SAFEHOUSE_FORBIDDEN_OWNERSHIP = [
  "NexusRealtime@main/src/index.js",
  "document.",
  "window.",
  "HTMLElement",
  "THREE.",
  "WebGL",
  "AudioContext",
  "requestAnimationFrame",
  "addEventListener"
];

const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(Number(value)) ? Number(value) : 0));
const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const round = (value, digits = 3) => Number(num(value).toFixed(digits));
const vec = (value = {}, fallback = {}) => ({
  x: round(num(value.x, fallback.x ?? 0)),
  y: round(num(value.y, fallback.y ?? 0)),
  z: round(num(value.z, fallback.z ?? 0))
});

const hash01 = (seed = "zombie-safehouse") => {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  h ^= h << 13;
  h ^= h >>> 17;
  h ^= h << 5;
  return (h >>> 0) / 4294967295;
};

const polarPoint = (origin, radius, angle, y = 0.08) => ({
  x: round(origin.x + Math.cos(angle) * radius),
  y: round(y),
  z: round(origin.z + Math.sin(angle) * radius)
});

const descriptor = (kind, id, position, state = {}) => ({ kind, id, position: vec(position), state });

function orchardSnapshot(input = {}) {
  const player = vec(input.player?.position ?? input.player ?? { x: 0, y: 0, z: 0 });
  const appleCount = Math.max(0, Math.round(num(input.appleCount ?? input.apples ?? input.inventory?.apples, 0)));
  const health01 = clamp01(input.health01 ?? input.player?.health01 ?? input.health ?? 0.82);
  const stamina01 = clamp01(input.stamina01 ?? input.player?.stamina01 ?? 0.72);
  const pressure01 = clamp01(input.horde?.pressure01 ?? input.pressure01 ?? input.pressure ?? 0.34);
  const roundNumber = Math.max(1, Math.round(num(input.round?.round ?? input.roundNumber ?? input.round, 1)));
  const monsters = Array.isArray(input.monsters) ? input.monsters : Array.isArray(input.threats) ? input.threats : Array.isArray(input.visualDomains?.threats) ? input.visualDomains.threats : [];
  const lanes = Array.isArray(input.visualDomains?.lanes) ? input.visualDomains.lanes : [];
  const trees = Array.isArray(input.visualDomains?.trees) ? input.visualDomains.trees : [];
  const activeApples = Array.isArray(input.orchard?.activeApples) ? input.orchard.activeApples : Array.isArray(input.visualDomains?.apples) ? input.visualDomains.apples : [];
  const simulatedInput = input.simulatedInput ?? {};
  const danger01 = clamp01(pressure01 * 0.46 + (1 - health01) * 0.22 + Math.min(1, monsters.length / 10) * 0.2 + Math.min(1, roundNumber / 18) * 0.12);
  const provision01 = clamp01(appleCount / 8);
  const evacuationNeed = clamp01(danger01 * 0.58 + (1 - provision01) * 0.16 + (1 - stamina01) * 0.12 + (simulatedInput.nextRound ? 0.14 : 0));
  const seed = input.seed ?? `zombie-safehouse-${roundNumber}-${appleCount}`;
  return { seed, player, appleCount, health01, stamina01, pressure01, roundNumber, monsters, lanes, trees, activeApples, simulatedInput, danger01, provision01, evacuationNeed };
}

export function createZombieOrchardSafehouseBeaconKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:safehouse-beacon`);
  const count = s.evacuationNeed > 0.62 ? 4 : 3;
  return Array.from({ length: count }, (_, index) => {
    const angle = base * Math.PI * 2 + index * 1.68;
    const position = polarPoint(s.player, 18 + index * 9, angle, 0.7);
    return descriptor("zombie-orchard.safehouse-beacon", `safehouse-beacon-${index + 1}`, position, {
      urgency: round(clamp01(s.evacuationNeed + index * 0.04)),
      survivorCapacity: Math.round(4 + (1 - s.pressure01) * 7 + index * 2),
      lanternFuelNeed: round(clamp01(s.pressure01 * 0.5 + (1 - s.stamina01) * 0.32 + index * 0.03)),
      label: index === 0 ? "nearest barn safehouse" : "orchard shelter marker"
    });
  });
}

export function createZombieOrchardLaneClearanceKit(input = {}) {
  const s = orchardSnapshot(input);
  const fallback = Array.from({ length: 4 }, (_, index) => ({ center: polarPoint(s.player, 12 + index * 7, index * 1.4, 0.04) }));
  const lanes = (s.lanes.length ? s.lanes : fallback).slice(0, s.pressure01 > 0.72 ? 5 : 4);
  return lanes.map((lane, index) => descriptor("zombie-orchard.lane-clearance", `lane-clearance-${index + 1}`, vec(lane.center ?? lane.position ?? lane, polarPoint(s.player, 14 + index * 6, index)), {
    blockage: round(clamp01(s.pressure01 * 0.58 + Math.min(1, s.monsters.length / 9) * 0.26 + index * 0.04)),
    appleCartAccess: round(clamp01(s.provision01 - index * 0.05 + 0.18)),
    sprintSafety: round(clamp01(s.stamina01 * 0.54 + (1 - s.danger01) * 0.34 - index * 0.03))
  }));
}

export function createZombieOrchardBarricadeReinforcementKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:barricade`);
  const count = s.pressure01 > 0.65 ? 4 : 3;
  return Array.from({ length: count }, (_, index) => {
    const tree = s.trees[index % Math.max(1, s.trees.length)];
    const position = tree ? vec(tree.position ?? tree, polarPoint(s.player, 20 + index * 5, base + index)) : polarPoint(s.player, 22 + index * 4, base * 6.28 + index * 1.91, 0.12);
    return descriptor("zombie-orchard.barricade-reinforcement", `barricade-reinforcement-${index + 1}`, position, {
      reinforcementNeed: round(clamp01(s.pressure01 * 0.6 + s.danger01 * 0.28 + index * 0.04)),
      plankDemand: Math.round(3 + s.roundNumber * 0.4 + index * 2),
      breachRisk: round(clamp01(s.danger01 + index * 0.05))
    });
  });
}

export function createZombieOrchardAntidoteRunnerKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:antidote-runner`);
  const count = s.appleCount >= 5 ? 3 : 2;
  return Array.from({ length: count }, (_, index) => {
    const apple = s.activeApples[index % Math.max(1, s.activeApples.length)];
    const position = apple ? vec(apple.position ?? apple, polarPoint(s.player, 10 + index * 7, base + index)) : polarPoint(s.player, 10 + index * 8, base * Math.PI * 2 + index * 2.17, 0.22);
    return descriptor("zombie-orchard.antidote-runner", `antidote-runner-${index + 1}`, position, {
      serumLoad: Math.round(Math.max(1, s.appleCount - index * 2)),
      routeExposure: round(clamp01(s.pressure01 * 0.5 + Math.min(1, s.monsters.length / 8) * 0.32 + index * 0.04)),
      deliveryReadiness: round(clamp01(s.provision01 * 0.52 + s.health01 * 0.28 + s.stamina01 * 0.2 - index * 0.04))
    });
  });
}

export function createZombieOrchardDawnWagonRallyKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:dawn-wagon`);
  return Array.from({ length: 2 }, (_, index) => descriptor("zombie-orchard.dawn-wagon-rally", `dawn-wagon-rally-${index + 1}`, polarPoint(s.player, 34 + index * 11, base * Math.PI * 2 + index * 2.6, 0.2), {
    harnessReadiness: round(clamp01((1 - s.pressure01) * 0.36 + s.provision01 * 0.28 + s.health01 * 0.22 + index * 0.08)),
    evacSeats: Math.round(6 + s.appleCount + index * 4),
    departWindow: Math.round(4 + (1 - s.danger01) * 12 + index * 3)
  }));
}

export function createZombieOrchardRadioTowerSignalKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:radio-tower`);
  const count = s.roundNumber > 6 || s.pressure01 > 0.7 ? 2 : 1;
  return Array.from({ length: count }, (_, index) => descriptor("zombie-orchard.radio-tower-signal", `radio-tower-signal-${index + 1}`, polarPoint(s.player, 42 + index * 16, base * Math.PI * 2 + index * 3.1, 2.1), {
    signalStrength: round(clamp01((1 - s.pressure01) * 0.36 + s.stamina01 * 0.22 + s.provision01 * 0.18 + index * 0.12)),
    batteryDemand: round(clamp01(s.evacuationNeed * 0.62 + index * 0.16)),
    callSign: index === 0 ? "DAWN-ORCHARD" : "BARN-RELAY"
  }));
}

export function createZombieOrchardSafehouseEvacuationRendererHandoffKit(readiness = {}) {
  const descriptors = {
    safehouseBeacons: readiness.safehouseBeacons ?? [],
    laneClearances: readiness.laneClearances ?? [],
    barricadeReinforcements: readiness.barricadeReinforcements ?? [],
    antidoteRunners: readiness.antidoteRunners ?? [],
    dawnWagonRallies: readiness.dawnWagonRallies ?? [],
    radioTowerSignals: readiness.radioTowerSignals ?? []
  };
  const flatDescriptors = Object.values(descriptors).flat();
  return {
    kind: "zombie-orchard.safehouse-evacuation.renderer-handoff",
    policy: "renderer-consumes-descriptors-only",
    descriptorPolicy: "renderer-consumes-descriptors-only",
    descriptors,
    flatDescriptors,
    counts: {
      safehouseBeacons: descriptors.safehouseBeacons.length,
      laneClearances: descriptors.laneClearances.length,
      barricadeReinforcements: descriptors.barricadeReinforcements.length,
      antidoteRunners: descriptors.antidoteRunners.length,
      dawnWagonRallies: descriptors.dawnWagonRallies.length,
      radioTowerSignals: descriptors.radioTowerSignals.length,
      total: flatDescriptors.length
    }
  };
}

export function createZombieOrchardSafehouseEvacuationReadinessDomainKit(defaultInput = {}) {
  return {
    id: "zombie-orchard-safehouse-evacuation-readiness-domain-kit",
    domainTree: ZOMBIE_ORCHARD_SAFEHOUSE_EVACUATION_DOMAIN_TREE,
    ownership: "headless snapshot-to-descriptor domain kit",
    atomicKits: [
      "zombie-orchard-safehouse-beacon-kit",
      "zombie-orchard-lane-clearance-kit",
      "zombie-orchard-barricade-reinforcement-kit",
      "zombie-orchard-antidote-runner-kit",
      "zombie-orchard-dawn-wagon-rally-kit",
      "zombie-orchard-radio-tower-signal-kit",
      "zombie-orchard-safehouse-evacuation-renderer-handoff-kit"
    ],
    compose(input = {}) {
      const snapshot = orchardSnapshot({ ...defaultInput, ...input });
      const readiness = {
        kind: "zombie-orchard.safehouse-evacuation.readiness",
        snapshot,
        safehouseBeacons: createZombieOrchardSafehouseBeaconKit(snapshot),
        laneClearances: createZombieOrchardLaneClearanceKit(snapshot),
        barricadeReinforcements: createZombieOrchardBarricadeReinforcementKit(snapshot),
        antidoteRunners: createZombieOrchardAntidoteRunnerKit(snapshot),
        dawnWagonRallies: createZombieOrchardDawnWagonRallyKit(snapshot),
        radioTowerSignals: createZombieOrchardRadioTowerSignalKit(snapshot)
      };
      readiness.rendererHandoff = createZombieOrchardSafehouseEvacuationRendererHandoffKit(readiness);
      readiness.summary = {
        evacuationNeed: round(snapshot.evacuationNeed),
        danger: round(snapshot.danger01),
        descriptorCount: readiness.rendererHandoff.counts.total,
        topPriority: snapshot.pressure01 > 0.72 ? "seal the orchard lanes" : snapshot.appleCount < 4 ? "stock safehouse provisions" : snapshot.health01 < 0.45 ? "move wounded survivors" : "prepare dawn wagons"
      };
      return readiness;
    }
  };
}
