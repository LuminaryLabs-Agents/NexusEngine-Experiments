export const ZOMBIE_ORCHARD_ANTISERUM_WELLHOUSE_DOMAIN_TREE = `
zombie-orchard-antiserum-wellhouse-readiness-domain
├─ serum-brewing-domain
│  ├─ herbal-mortar-domain
│  │  └─ zombie-orchard-herbal-antiserum-mortar-kit
│  └─ moonwater-still-domain
│     └─ zombie-orchard-moonwater-still-kit
├─ infection-triage-domain
│  ├─ bite-triage-cot-domain
│  │  └─ zombie-orchard-bite-triage-cot-kit
│  └─ blood-sample-flag-domain
│     └─ zombie-orchard-blood-sample-flag-kit
├─ cure-handoff-domain
│  ├─ raven-courier-vial-domain
│  │  └─ zombie-orchard-raven-courier-vial-kit
│  └─ dawn-antiserum-ledger-domain
│     └─ zombie-orchard-dawn-antiserum-ledger-kit
└─ renderer-handoff
   └─ zombie-orchard-antiserum-wellhouse-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;

export const ZOMBIE_ORCHARD_ANTISERUM_WELLHOUSE_FORBIDDEN_OWNERSHIP = [
  "renderer",
  "dom",
  "browser-input",
  "three",
  "webgl",
  "audio",
  "asset-loading",
  "frame-loop",
  "physics",
  "network"
];

const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(Number(value)) ? Number(value) : 0));
const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const round = (value, digits = 3) => Number(num(value).toFixed(digits));
const arr = (value) => Array.isArray(value) ? value : [];
const vec = (value = {}, fallback = {}) => ({
  x: round(num(value.x, fallback.x ?? 0)),
  y: round(num(value.y, fallback.y ?? 0)),
  z: round(num(value.z, fallback.z ?? 0))
});

const hash01 = (seed = "zombie-antiserum") => {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  h ^= h << 13;
  h ^= h >>> 17;
  h ^= h << 5;
  return (h >>> 0) / 4294967295;
};

const polarPoint = (origin, radius, angle, y = 0.18) => ({
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
  const player = vec(input.player?.position ?? input.player ?? input.avatar?.position ?? { x: 0, y: 0, z: 0 });
  const inventory = input.inventory ?? {};
  const appleCount = Math.max(0, Math.round(num(input.appleCount ?? input.apples ?? inventory.apples, 0)));
  const herbBundles = Math.max(0, Math.round(num(input.herbBundles ?? inventory.herbs ?? inventory.herbBundles, Math.floor(appleCount / 3))));
  const vialCount = Math.max(0, Math.round(num(input.vials ?? input.vialCount ?? inventory.vials, Math.floor(herbBundles / 2))));
  const waterUnits = Math.max(0, Math.round(num(input.waterUnits ?? inventory.water ?? inventory.cleanWater, 1)));
  const health01 = clamp01(input.health01 ?? input.player?.health01 ?? input.health ?? 0.76);
  const stamina01 = clamp01(input.stamina01 ?? input.player?.stamina01 ?? input.stamina ?? 0.64);
  const pressure01 = clamp01(input.horde?.pressure01 ?? input.pressure01 ?? input.pressure ?? 0.38);
  const infection01 = clamp01(input.infection01 ?? input.contamination01 ?? pressure01 * 0.54 + (1 - health01) * 0.24);
  const roundNumber = Math.max(1, Math.round(num(input.round?.round ?? input.roundNumber ?? input.round, 1)));
  const survivors = arr(input.survivors).length ? arr(input.survivors) : arr(input.visualDomains?.survivors);
  const monsters = arr(input.monsters).length ? arr(input.monsters) : arr(input.threats).length ? arr(input.threats) : arr(input.visualDomains?.threats);
  const trees = arr(input.visualDomains?.trees).length ? arr(input.visualDomains.trees) : arr(input.trees);
  const activeApples = arr(input.orchard?.activeApples).length ? arr(input.orchard.activeApples) : arr(input.visualDomains?.apples);
  const simulatedInput = input.simulatedInput ?? {};
  const serumYield01 = clamp01(0.16 + herbBundles * 0.075 + vialCount * 0.09 + waterUnits * 0.045 + stamina01 * 0.14 - infection01 * 0.16);
  const triageNeed01 = clamp01(infection01 * 0.48 + pressure01 * 0.26 + Math.min(1, survivors.length / 8) * 0.14 + (simulatedInput.dodge ? 0.03 : 0));
  const handoffReadiness01 = clamp01(serumYield01 * 0.46 + health01 * 0.18 + Math.min(1, vialCount / 8) * 0.17 + (1 - pressure01) * 0.19);
  const seed = input.seed ?? `zombie-antiserum-${roundNumber}-${herbBundles}-${vialCount}`;
  return { seed, player, appleCount, herbBundles, vialCount, waterUnits, health01, stamina01, pressure01, infection01, roundNumber, survivors, monsters, trees, activeApples, simulatedInput, serumYield01, triageNeed01, handoffReadiness01 };
}

export function createZombieOrchardHerbalAntiserumMortarKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:mortar`);
  const count = s.herbBundles > 6 ? 4 : 3;
  return Array.from({ length: count }, (_, index) => {
    const apple = s.activeApples[index % Math.max(1, s.activeApples.length)];
    return descriptor(
      "zombie-orchard.herbal-antiserum-mortar",
      `herbal-antiserum-mortar-${index + 1}`,
      apple ? vec(apple.position ?? apple, polarPoint(s.player, 10 + index * 5, base + index, 0.22)) : polarPoint(s.player, 10 + index * 6, base * Math.PI * 2 + index * 1.84, 0.22),
      {
        potency: round(clamp01(s.serumYield01 + index * 0.025)),
        herbBundles: Math.max(1, Math.round(s.herbBundles / Math.max(1, count) + index + 1)),
        rotSediment: round(clamp01(s.infection01 * 0.32 + index * 0.035)),
        label: index === 0 ? "feverfew and apple pectin" : "blackroot mash"
      }
    );
  });
}

export function createZombieOrchardMoonwaterStillKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:still`);
  const count = s.waterUnits > 4 ? 3 : 2;
  return Array.from({ length: count }, (_, index) => descriptor(
    "zombie-orchard.moonwater-still",
    `moonwater-still-${index + 1}`,
    polarPoint(s.player, 16 + index * 8, base * Math.PI * 2 + index * 2.18, 0.32),
    {
      distillatePurity: round(clamp01(0.42 + s.waterUnits * 0.07 + s.stamina01 * 0.16 - s.infection01 * 0.11 - index * 0.025)),
      copperCoils: Math.round(2 + index + Math.min(4, s.waterUnits / 2)),
      boilWindowSeconds: Math.round(18 + s.handoffReadiness01 * 32 + index * 6),
      fuelRisk: round(clamp01(s.pressure01 * 0.38 + index * 0.045))
    }
  ));
}

export function createZombieOrchardBiteTriageCotKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:triage`);
  const fallback = Array.from({ length: 3 }, (_, index) => ({ position: polarPoint(s.player, 18 + index * 6, base * Math.PI * 2 + index * 2.07, 0.18) }));
  const sourceSurvivors = s.survivors.length ? [...s.survivors, ...fallback] : fallback;
  const survivors = sourceSurvivors.slice(0, s.triageNeed01 > 0.62 ? 4 : 3);
  return survivors.map((survivor, index) => descriptor(
    "zombie-orchard.bite-triage-cot",
    `bite-triage-cot-${index + 1}`,
    vec(survivor.position ?? survivor, polarPoint(s.player, 18 + index * 7, base + index, 0.18)),
    {
      biteSeverity: round(clamp01(s.triageNeed01 + index * 0.035)),
      serumDoseNeeded: Math.round(1 + index + s.roundNumber * 0.08),
      feverMinutes: Math.round(7 + s.infection01 * 26 + index * 4),
      cotLabel: index === 0 ? "urgent orchard hand" : "watch overnight"
    }
  ));
}

export function createZombieOrchardBloodSampleFlagKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:sample`);
  const count = s.infection01 > 0.56 ? 5 : 4;
  return Array.from({ length: count }, (_, index) => {
    const monster = s.monsters[index % Math.max(1, s.monsters.length)];
    return descriptor(
      "zombie-orchard.blood-sample-flag",
      `blood-sample-flag-${index + 1}`,
      monster ? vec(monster.position ?? monster, polarPoint(s.player, 21 + index * 5, base + index, 0.46)) : polarPoint(s.player, 21 + index * 5, base * Math.PI * 2 + index * 1.31, 0.46),
      {
        sampleIntegrity: round(clamp01(0.74 - s.pressure01 * 0.22 - index * 0.035 + s.stamina01 * 0.08)),
        strainLoad: round(clamp01(s.infection01 + index * 0.025)),
        flagColor: index % 2 ? "amber" : "violet",
        labPriority: Math.round(2 + index + s.roundNumber * 0.18)
      }
    );
  });
}

export function createZombieOrchardRavenCourierVialKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:raven`);
  const count = s.handoffReadiness01 > 0.58 ? 4 : 3;
  return Array.from({ length: count }, (_, index) => descriptor(
    "zombie-orchard.raven-courier-vial",
    `raven-courier-vial-${index + 1}`,
    polarPoint(s.player, 27 + index * 7, base * Math.PI * 2 + index * 1.72, 1.05 + index * 0.05),
    {
      vialsLoaded: Math.max(1, Math.round(s.vialCount / Math.max(1, count) + index)),
      flightRisk: round(clamp01(s.pressure01 * 0.42 + s.infection01 * 0.18 + index * 0.035)),
      routeClarity: round(clamp01(s.handoffReadiness01 + (1 - s.pressure01) * 0.16 - index * 0.025)),
      destination: index % 2 ? "safehouse cellar" : "north wellhouse"
    }
  ));
}

export function createZombieOrchardDawnAntiserumLedgerKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:ledger`);
  return Array.from({ length: 2 }, (_, index) => descriptor(
    "zombie-orchard.dawn-antiserum-ledger",
    `dawn-antiserum-ledger-${index + 1}`,
    polarPoint(s.player, 36 + index * 12, base * Math.PI * 2 + index * 2.58, 0.2),
    {
      dosesPromised: Math.round(3 + s.vialCount + s.herbBundles * 0.45 + index * 5),
      familiesCovered: Math.round(2 + s.vialCount * 0.5 + index * 4 + (1 - s.pressure01) * 2),
      wellhouseIntegrity: round(clamp01(s.serumYield01 * 0.56 + s.handoffReadiness01 * 0.32 - s.triageNeed01 * 0.12)),
      nextAction: index === 0 ? "brew first antidote row" : "send courier vials before dawn"
    }
  ));
}

export function createZombieOrchardAntiserumWellhouseRendererHandoffKit(readiness = {}) {
  const descriptors = {
    herbalAntiserumMortars: readiness.herbalAntiserumMortars ?? [],
    moonwaterStills: readiness.moonwaterStills ?? [],
    biteTriageCots: readiness.biteTriageCots ?? [],
    bloodSampleFlags: readiness.bloodSampleFlags ?? [],
    ravenCourierVials: readiness.ravenCourierVials ?? [],
    dawnAntiserumLedgers: readiness.dawnAntiserumLedgers ?? []
  };
  const flatDescriptors = Object.values(descriptors).flat();
  return {
    kind: "zombie-orchard.antiserum-wellhouse.renderer-handoff",
    policy: "renderer-consumes-descriptors-only",
    descriptorPolicy: "renderer-consumes-descriptors-only",
    descriptors,
    flatDescriptors,
    counts: {
      herbalAntiserumMortars: descriptors.herbalAntiserumMortars.length,
      moonwaterStills: descriptors.moonwaterStills.length,
      biteTriageCots: descriptors.biteTriageCots.length,
      bloodSampleFlags: descriptors.bloodSampleFlags.length,
      ravenCourierVials: descriptors.ravenCourierVials.length,
      dawnAntiserumLedgers: descriptors.dawnAntiserumLedgers.length,
      total: flatDescriptors.length
    }
  };
}

export function createZombieOrchardAntiserumWellhouseReadinessDomainKit(options = {}) {
  const domainSeed = options.seed ?? "zombie-orchard-antiserum-wellhouse";
  const evaluate = (input = {}) => {
    const s = orchardSnapshot({ seed: domainSeed, ...input });
    const readiness = {
      herbalAntiserumMortars: createZombieOrchardHerbalAntiserumMortarKit(s),
      moonwaterStills: createZombieOrchardMoonwaterStillKit(s),
      biteTriageCots: createZombieOrchardBiteTriageCotKit(s),
      bloodSampleFlags: createZombieOrchardBloodSampleFlagKit(s),
      ravenCourierVials: createZombieOrchardRavenCourierVialKit(s),
      dawnAntiserumLedgers: createZombieOrchardDawnAntiserumLedgerKit(s)
    };
    const rendererHandoff = createZombieOrchardAntiserumWellhouseRendererHandoffKit(readiness);
    const readinessScore = round(clamp01(s.serumYield01 * 0.42 + s.handoffReadiness01 * 0.38 + (1 - s.triageNeed01) * 0.2));
    const missionState = readinessScore >= 0.78 ? "antiserum-distribution-ready" : readinessScore >= 0.55 ? "brew-and-triage" : s.triageNeed01 > 0.62 ? "stabilize-bites" : "gather-reagents";
    const topPriority = s.triageNeed01 > 0.66 ? "triage bites" : s.serumYield01 < 0.52 ? "brew serum" : s.handoffReadiness01 < 0.56 ? "load couriers" : "distribute dawn doses";
    return {
      kind: "zombie-orchard.antiserum-wellhouse.readiness",
      domain: "zombie-orchard-antiserum-wellhouse-readiness-domain",
      domainTree: ZOMBIE_ORCHARD_ANTISERUM_WELLHOUSE_DOMAIN_TREE,
      forbiddenOwnership: ZOMBIE_ORCHARD_ANTISERUM_WELLHOUSE_FORBIDDEN_OWNERSHIP,
      summary: {
        readinessScore,
        missionState,
        topPriority,
        serumYield: round(s.serumYield01),
        triageNeed: round(s.triageNeed01),
        handoffReadiness: round(s.handoffReadiness01),
        descriptorCount: rendererHandoff.counts.total
      },
      descriptors: readiness,
      rendererHandoff
    };
  };
  return {
    id: "zombie-orchard-antiserum-wellhouse-readiness-domain-kit",
    domainTree: ZOMBIE_ORCHARD_ANTISERUM_WELLHOUSE_DOMAIN_TREE,
    forbiddenOwnership: ZOMBIE_ORCHARD_ANTISERUM_WELLHOUSE_FORBIDDEN_OWNERSHIP,
    evaluate,
    compose: evaluate
  };
}
