export const ZOMBIE_ORCHARD_WELL_RESTORATION_DOMAIN_TREE = `
zombie-orchard-well-restoration-readiness-domain
├─ water-source-domain
│  ├─ well-pump-repair-domain
│  │  └─ zombie-orchard-well-pump-repair-kit
│  └─ bucket-brigade-domain
│     └─ zombie-orchard-bucket-brigade-route-kit
├─ purification-defense-domain
│  ├─ disinfectant-still-domain
│  │  └─ zombie-orchard-disinfectant-still-kit
│  └─ well-barricade-domain
│     └─ zombie-orchard-well-barricade-lantern-kit
├─ orchard-rehydration-domain
│  ├─ sprinkler-mist-domain
│  │  └─ zombie-orchard-sprinkler-mist-grid-kit
│  └─ ration-ledger-domain
│     └─ zombie-orchard-dawn-water-ration-ledger-kit
└─ renderer-handoff
   └─ zombie-orchard-well-restoration-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;

export const ZOMBIE_ORCHARD_WELL_RESTORATION_FORBIDDEN_OWNERSHIP = [
  "renderer",
  "dom",
  "browser-input",
  "three",
  "webgl",
  "audio",
  "asset-loading",
  "frame-loop",
  "physics"
];

const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(Number(value)) ? Number(value) : 0));
const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const round = (value, digits = 3) => Number(num(value).toFixed(digits));
const vec = (value = {}, fallback = {}) => ({
  x: round(num(value.x, fallback.x ?? 0)),
  y: round(num(value.y, fallback.y ?? 0)),
  z: round(num(value.z, fallback.z ?? 0))
});

const hash01 = (seed = "zombie-well") => {
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

const descriptor = (kind, id, position, state = {}) => ({
  kind,
  id,
  position: vec(position),
  state
});

function orchardSnapshot(input = {}) {
  const player = vec(input.player?.position ?? input.player ?? { x: 0, y: 0, z: 0 });
  const appleCount = Math.max(0, Math.round(num(input.appleCount ?? input.apples ?? input.inventory?.apples, 0)));
  const health01 = clamp01(input.health01 ?? input.player?.health01 ?? input.health ?? 0.8);
  const stamina01 = clamp01(input.stamina01 ?? input.player?.stamina01 ?? 0.7);
  const pressure01 = clamp01(input.horde?.pressure01 ?? input.pressure01 ?? input.pressure ?? 0.35);
  const roundNumber = Math.max(1, Math.round(num(input.round?.round ?? input.roundNumber ?? input.round, 1)));
  const monsters = Array.isArray(input.monsters) ? input.monsters : Array.isArray(input.threats) ? input.threats : Array.isArray(input.visualDomains?.threats) ? input.visualDomains.threats : [];
  const trees = Array.isArray(input.visualDomains?.trees) ? input.visualDomains.trees : Array.isArray(input.trees) ? input.trees : [];
  const lanes = Array.isArray(input.visualDomains?.lanes) ? input.visualDomains.lanes : Array.isArray(input.lanes) ? input.lanes : [];
  const activeApples = Array.isArray(input.orchard?.activeApples) ? input.orchard.activeApples : Array.isArray(input.visualDomains?.apples) ? input.visualDomains.apples : [];
  const simulatedInput = input.simulatedInput ?? {};
  const drought01 = clamp01((1 - stamina01) * 0.3 + Math.min(1, appleCount / 10) * 0.14 + Math.min(1, roundNumber / 20) * 0.2 + pressure01 * 0.22 + (simulatedInput.sprint ? 0.08 : 0));
  const contamination01 = clamp01(pressure01 * 0.48 + Math.min(1, monsters.length / 12) * 0.28 + (1 - health01) * 0.18 + (simulatedInput.useGear ? -0.06 : 0));
  const restorationNeed = clamp01(drought01 * 0.5 + contamination01 * 0.34 + Math.min(1, roundNumber / 18) * 0.16);
  const seed = input.seed ?? `zombie-well-${roundNumber}-${appleCount}`;
  return { seed, player, appleCount, health01, stamina01, pressure01, roundNumber, monsters, trees, lanes, activeApples, simulatedInput, drought01, contamination01, restorationNeed };
}

export function createZombieOrchardWellPumpRepairKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:pump`);
  const count = s.restorationNeed > 0.68 ? 3 : 2;
  return Array.from({ length: count }, (_, index) => descriptor(
    "zombie-orchard.well-pump-repair",
    `well-pump-repair-${index + 1}`,
    polarPoint(s.player, 10 + index * 8, base * Math.PI * 2 + index * 2.14, 0.42),
    {
      repairUrgency: round(clamp01(s.restorationNeed + index * 0.05)),
      crankIntegrity: round(clamp01(1 - s.contamination01 * 0.38 - index * 0.07)),
      partsNeeded: Math.round(2 + s.roundNumber * 0.25 + index * 2),
      label: index === 0 ? "old stone well pump" : "auxiliary orchard spigot"
    }
  ));
}

export function createZombieOrchardBucketBrigadeRouteKit(input = {}) {
  const s = orchardSnapshot(input);
  const fallback = Array.from({ length: 4 }, (_, index) => ({ center: polarPoint(s.player, 13 + index * 6, index * 1.27, 0.1) }));
  const lanes = (s.lanes.length ? s.lanes : fallback).slice(0, s.pressure01 > 0.7 ? 5 : 4);
  return lanes.map((lane, index) => descriptor(
    "zombie-orchard.bucket-brigade-route",
    `bucket-brigade-route-${index + 1}`,
    vec(lane.center ?? lane.position ?? lane, polarPoint(s.player, 12 + index * 7, index * 1.5, 0.12)),
    {
      routeHeat: round(clamp01(s.pressure01 * 0.5 + s.drought01 * 0.28 + index * 0.04)),
      carryCapacity: Math.round(4 + s.appleCount * 0.35 + (1 - s.contamination01) * 6),
      spillRisk: round(clamp01((1 - s.stamina01) * 0.42 + Math.min(1, s.monsters.length / 10) * 0.3 + index * 0.03))
    }
  ));
}

export function createZombieOrchardDisinfectantStillKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:still`);
  const count = s.contamination01 > 0.58 ? 3 : 2;
  return Array.from({ length: count }, (_, index) => {
    const apple = s.activeApples[index % Math.max(1, s.activeApples.length)];
    const position = apple ? vec(apple.position ?? apple, polarPoint(s.player, 9 + index * 8, base + index, 0.28)) : polarPoint(s.player, 16 + index * 7, base * Math.PI * 2 + index * 1.9, 0.28);
    return descriptor("zombie-orchard.disinfectant-still", `disinfectant-still-${index + 1}`, position, {
      boilReadiness: round(clamp01(s.health01 * 0.34 + s.stamina01 * 0.26 + s.appleCount / 12 - index * 0.04)),
      contaminationLoad: round(clamp01(s.contamination01 + index * 0.05)),
      fuelDemand: Math.round(2 + s.roundNumber * 0.2 + index),
      appleMashRequired: Math.max(1, Math.round(3 - Math.min(2, s.appleCount / 4) + index))
    });
  });
}

export function createZombieOrchardWellBarricadeLanternKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:lantern`);
  const count = s.pressure01 > 0.62 ? 4 : 3;
  return Array.from({ length: count }, (_, index) => {
    const tree = s.trees[index % Math.max(1, s.trees.length)];
    const position = tree ? vec(tree.position ?? tree, polarPoint(s.player, 20 + index * 4, base + index, 0.8)) : polarPoint(s.player, 18 + index * 5, base * Math.PI * 2 + index * 1.56, 0.8);
    return descriptor("zombie-orchard.well-barricade-lantern", `well-barricade-lantern-${index + 1}`, position, {
      lanternCharge: round(clamp01(1 - s.pressure01 * 0.34 + index * 0.03)),
      breachPressure: round(clamp01(s.pressure01 * 0.62 + Math.min(1, s.monsters.length / 9) * 0.24 + index * 0.03)),
      stakeCount: Math.round(3 + index + s.roundNumber * 0.18),
      watchArc: Math.round(70 + index * 18)
    });
  });
}

export function createZombieOrchardSprinklerMistGridKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:mist`);
  const count = s.drought01 > 0.56 ? 4 : 3;
  return Array.from({ length: count }, (_, index) => descriptor(
    "zombie-orchard.sprinkler-mist-grid",
    `sprinkler-mist-grid-${index + 1}`,
    polarPoint(s.player, 24 + index * 8, base * Math.PI * 2 + index * 2.05, 0.22),
    {
      mistCoverage: round(clamp01((1 - s.drought01) * 0.22 + s.restorationNeed * 0.48 + index * 0.04)),
      orchardRowsProtected: Math.round(2 + index + Math.min(5, s.appleCount)),
      noiseLureRisk: round(clamp01(s.pressure01 * 0.36 + index * 0.05)),
      valveTiming: round(clamp01(s.stamina01 * 0.5 + (1 - s.contamination01) * 0.28))
    }
  ));
}

export function createZombieOrchardDawnWaterRationLedgerKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:ration`);
  return Array.from({ length: 2 }, (_, index) => descriptor(
    "zombie-orchard.dawn-water-ration-ledger",
    `dawn-water-ration-ledger-${index + 1}`,
    polarPoint(s.player, 34 + index * 12, base * Math.PI * 2 + index * 2.8, 0.18),
    {
      rationReadiness: round(clamp01((1 - s.contamination01) * 0.36 + (1 - s.drought01) * 0.24 + s.health01 * 0.22 + index * 0.08)),
      survivorQuarts: Math.round(8 + s.appleCount + (1 - s.pressure01) * 8 + index * 5),
      dawnWindowMinutes: Math.round(5 + (1 - s.restorationNeed) * 16 + index * 4),
      priority: index === 0 ? "children and medics" : "watch crew and runners"
    }
  ));
}

export function createZombieOrchardWellRestorationRendererHandoffKit(readiness = {}) {
  const descriptors = {
    wellPumpRepairs: readiness.wellPumpRepairs ?? [],
    bucketBrigadeRoutes: readiness.bucketBrigadeRoutes ?? [],
    disinfectantStills: readiness.disinfectantStills ?? [],
    wellBarricadeLanterns: readiness.wellBarricadeLanterns ?? [],
    sprinklerMistGrids: readiness.sprinklerMistGrids ?? [],
    dawnWaterRationLedgers: readiness.dawnWaterRationLedgers ?? []
  };
  const flatDescriptors = Object.values(descriptors).flat();
  return {
    kind: "zombie-orchard.well-restoration.renderer-handoff",
    policy: "renderer-consumes-descriptors-only",
    descriptorPolicy: "renderer-consumes-descriptors-only",
    descriptors,
    flatDescriptors,
    counts: {
      wellPumpRepairs: descriptors.wellPumpRepairs.length,
      bucketBrigadeRoutes: descriptors.bucketBrigadeRoutes.length,
      disinfectantStills: descriptors.disinfectantStills.length,
      wellBarricadeLanterns: descriptors.wellBarricadeLanterns.length,
      sprinklerMistGrids: descriptors.sprinklerMistGrids.length,
      dawnWaterRationLedgers: descriptors.dawnWaterRationLedgers.length,
      total: flatDescriptors.length
    }
  };
}

export function createZombieOrchardWellRestorationReadinessDomainKit(defaultInput = {}) {
  return {
    id: "zombie-orchard-well-restoration-readiness-domain-kit",
    domainTree: ZOMBIE_ORCHARD_WELL_RESTORATION_DOMAIN_TREE,
    ownership: "headless snapshot-to-descriptor domain kit",
    atomicKits: [
      "zombie-orchard-well-pump-repair-kit",
      "zombie-orchard-bucket-brigade-route-kit",
      "zombie-orchard-disinfectant-still-kit",
      "zombie-orchard-well-barricade-lantern-kit",
      "zombie-orchard-sprinkler-mist-grid-kit",
      "zombie-orchard-dawn-water-ration-ledger-kit",
      "zombie-orchard-well-restoration-renderer-handoff-kit"
    ],
    compose(input = {}) {
      const snapshot = orchardSnapshot({ ...defaultInput, ...input });
      const readiness = {
        kind: "zombie-orchard.well-restoration.readiness",
        snapshot,
        wellPumpRepairs: createZombieOrchardWellPumpRepairKit(snapshot),
        bucketBrigadeRoutes: createZombieOrchardBucketBrigadeRouteKit(snapshot),
        disinfectantStills: createZombieOrchardDisinfectantStillKit(snapshot),
        wellBarricadeLanterns: createZombieOrchardWellBarricadeLanternKit(snapshot),
        sprinklerMistGrids: createZombieOrchardSprinklerMistGridKit(snapshot),
        dawnWaterRationLedgers: createZombieOrchardDawnWaterRationLedgerKit(snapshot)
      };
      const rendererHandoff = createZombieOrchardWellRestorationRendererHandoffKit(readiness);
      return {
        ...readiness,
        rendererHandoff,
        summary: {
          topPriority: snapshot.contamination01 > snapshot.drought01 ? "purify well" : "restart pump",
          restorationNeed: round(snapshot.restorationNeed),
          contamination01: round(snapshot.contamination01),
          drought01: round(snapshot.drought01),
          descriptorCount: rendererHandoff.counts.total
        },
        forbiddenOwnership: ZOMBIE_ORCHARD_WELL_RESTORATION_FORBIDDEN_OWNERSHIP
      };
    }
  };
}
