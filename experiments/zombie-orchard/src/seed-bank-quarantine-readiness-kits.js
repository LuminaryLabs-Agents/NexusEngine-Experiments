export const ZOMBIE_ORCHARD_SEED_BANK_QUARANTINE_DOMAIN_TREE = `
zombie-orchard-seed-bank-quarantine-readiness-domain
├─ seed-preservation-domain
│  ├─ heirloom-seed-cache-domain
│  │  └─ zombie-orchard-heirloom-seed-cache-kit
│  └─ graft-scion-rack-domain
│     └─ zombie-orchard-graft-scion-rack-kit
├─ quarantine-defense-domain
│  ├─ spore-fence-domain
│  │  └─ zombie-orchard-spore-fence-lantern-kit
│  └─ compost-pit-domain
│     └─ zombie-orchard-compost-burn-pit-kit
├─ recovery-handoff-domain
│  ├─ orchard-row-charter-domain
│  │  └─ zombie-orchard-row-replant-charter-kit
│  └─ dawn-seed-ledger-domain
│     └─ zombie-orchard-dawn-seed-ledger-kit
└─ renderer-handoff
   └─ zombie-orchard-seed-bank-quarantine-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;

export const ZOMBIE_ORCHARD_SEED_BANK_QUARANTINE_FORBIDDEN_OWNERSHIP = [
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
const arr = (value) => Array.isArray(value) ? value : [];
const vec = (value = {}, fallback = {}) => ({
  x: round(num(value.x, fallback.x ?? 0)),
  y: round(num(value.y, fallback.y ?? 0)),
  z: round(num(value.z, fallback.z ?? 0))
});

const hash01 = (seed = "zombie-seed-bank") => {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  h ^= h << 13;
  h ^= h >>> 17;
  h ^= h << 5;
  return (h >>> 0) / 4294967295;
};

const polarPoint = (origin, radius, angle, y = 0.12) => ({
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
  const seedPouches = Math.max(0, Math.round(num(input.seedPouches ?? inventory.seedPouches ?? inventory.seeds, Math.floor(appleCount / 2))));
  const health01 = clamp01(input.health01 ?? input.player?.health01 ?? input.health ?? 0.78);
  const stamina01 = clamp01(input.stamina01 ?? input.player?.stamina01 ?? input.stamina ?? 0.68);
  const pressure01 = clamp01(input.horde?.pressure01 ?? input.pressure01 ?? input.pressure ?? 0.36);
  const infection01 = clamp01(input.infection01 ?? input.contamination01 ?? pressure01 * 0.5 + (1 - health01) * 0.22);
  const roundNumber = Math.max(1, Math.round(num(input.round?.round ?? input.roundNumber ?? input.round, 1)));
  const monsters = arr(input.monsters).length ? arr(input.monsters) : arr(input.threats).length ? arr(input.threats) : arr(input.visualDomains?.threats);
  const trees = arr(input.visualDomains?.trees).length ? arr(input.visualDomains.trees) : arr(input.trees);
  const lanes = arr(input.visualDomains?.lanes).length ? arr(input.visualDomains.lanes) : arr(input.lanes);
  const activeApples = arr(input.orchard?.activeApples).length ? arr(input.orchard.activeApples) : arr(input.visualDomains?.apples);
  const simulatedInput = input.simulatedInput ?? {};
  const seedViability01 = clamp01(0.32 + seedPouches * 0.055 + appleCount * 0.026 + health01 * 0.22 - infection01 * 0.28);
  const quarantineNeed01 = clamp01(pressure01 * 0.42 + infection01 * 0.36 + Math.min(1, monsters.length / 12) * 0.16 + (simulatedInput.sprint ? 0.04 : 0));
  const replantReadiness01 = clamp01(seedViability01 * 0.46 + stamina01 * 0.18 + Math.min(1, appleCount / 14) * 0.16 + (1 - pressure01) * 0.2);
  const seed = input.seed ?? `zombie-seed-bank-${roundNumber}-${appleCount}-${seedPouches}`;
  return { seed, player, appleCount, seedPouches, health01, stamina01, pressure01, infection01, roundNumber, monsters, trees, lanes, activeApples, simulatedInput, seedViability01, quarantineNeed01, replantReadiness01 };
}

export function createZombieOrchardHeirloomSeedCacheKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:heirloom`);
  const count = s.seedPouches > 4 ? 4 : 3;
  return Array.from({ length: count }, (_, index) => {
    const apple = s.activeApples[index % Math.max(1, s.activeApples.length)];
    const position = apple ? vec(apple.position ?? apple, polarPoint(s.player, 12 + index * 5, base + index, 0.26)) : polarPoint(s.player, 12 + index * 6, base * Math.PI * 2 + index * 1.84, 0.26);
    return descriptor("zombie-orchard.heirloom-seed-cache", `heirloom-seed-cache-${index + 1}`, position, {
      viability: round(clamp01(s.seedViability01 - index * 0.035)),
      packets: Math.max(2, Math.round(3 + s.seedPouches * 0.45 + index)),
      moistureRisk: round(clamp01(s.infection01 * 0.28 + s.pressure01 * 0.18 + index * 0.04)),
      label: index === 0 ? "old orchard rootstock" : "sealed heirloom pouch"
    });
  });
}

export function createZombieOrchardGraftScionRackKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:scion`);
  const fallback = Array.from({ length: 3 }, (_, index) => ({ position: polarPoint(s.player, 16 + index * 8, base * Math.PI * 2 + index * 2.1, 0.44) }));
  const trees = (s.trees.length ? s.trees : fallback).slice(0, s.roundNumber > 6 ? 4 : 3);
  return trees.map((tree, index) => descriptor(
    "zombie-orchard.graft-scion-rack",
    `graft-scion-rack-${index + 1}`,
    vec(tree.position ?? tree.center ?? tree, polarPoint(s.player, 16 + index * 7, base + index, 0.44)),
    {
      graftReadiness: round(clamp01(s.replantReadiness01 + index * 0.035)),
      rotPressure: round(clamp01(s.infection01 * 0.48 + index * 0.04)),
      scionsBundled: Math.round(2 + s.appleCount * 0.2 + index * 2),
      cultivar: index % 2 ? "redstay" : "mooncrisp"
    }
  ));
}

export function createZombieOrchardSporeFenceLanternKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:fence`);
  const count = s.quarantineNeed01 > 0.64 ? 5 : 4;
  return Array.from({ length: count }, (_, index) => {
    const lane = s.lanes[index % Math.max(1, s.lanes.length)];
    const position = lane ? vec(lane.center ?? lane.position ?? lane, polarPoint(s.player, 20 + index * 5, base + index, 0.82)) : polarPoint(s.player, 20 + index * 5, base * Math.PI * 2 + index * 1.31, 0.82);
    return descriptor("zombie-orchard.spore-fence-lantern", `spore-fence-lantern-${index + 1}`, position, {
      lanternCharge: round(clamp01(0.9 - s.pressure01 * 0.34 + index * 0.025)),
      sporeLoad: round(clamp01(s.quarantineNeed01 + index * 0.025)),
      fenceStakes: Math.round(3 + index + s.roundNumber * 0.16),
      watchArc: Math.round(65 + index * 17)
    });
  });
}

export function createZombieOrchardCompostBurnPitKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:compost`);
  const count = s.infection01 > 0.55 ? 3 : 2;
  return Array.from({ length: count }, (_, index) => {
    const monster = s.monsters[index % Math.max(1, s.monsters.length)];
    return descriptor(
      "zombie-orchard.compost-burn-pit",
      `compost-burn-pit-${index + 1}`,
      monster ? vec(monster.position ?? monster, polarPoint(s.player, 18 + index * 6, base + index, 0.12)) : polarPoint(s.player, 18 + index * 6, base * Math.PI * 2 + index * 2.4, 0.12),
      {
        ashHeat: round(clamp01(0.34 + s.infection01 * 0.42 + index * 0.07)),
        smokeScreen: round(clamp01(s.pressure01 * 0.36 + s.stamina01 * 0.22)),
        rotNeutralized: Math.round(4 + s.roundNumber * 0.4 + index * 2),
        shovelCrew: Math.round(2 + index + Math.min(4, s.appleCount / 3))
      }
    );
  });
}

export function createZombieOrchardRowReplantCharterKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:row`);
  const count = s.replantReadiness01 > 0.62 ? 4 : 3;
  return Array.from({ length: count }, (_, index) => descriptor(
    "zombie-orchard.row-replant-charter",
    `row-replant-charter-${index + 1}`,
    polarPoint(s.player, 26 + index * 8, base * Math.PI * 2 + index * 1.72, 0.18),
    {
      rowsPromised: Math.round(1 + index + s.seedPouches * 0.18),
      soilSafety: round(clamp01(1 - s.infection01 * 0.44 - index * 0.025)),
      replantReadiness: round(clamp01(s.replantReadiness01 + index * 0.025)),
      patrolNeed: round(clamp01(s.pressure01 * 0.48 + index * 0.04))
    }
  ));
}

export function createZombieOrchardDawnSeedLedgerKit(input = {}) {
  const s = orchardSnapshot(input);
  const base = hash01(`${s.seed}:ledger`);
  return Array.from({ length: 2 }, (_, index) => descriptor(
    "zombie-orchard.dawn-seed-ledger",
    `dawn-seed-ledger-${index + 1}`,
    polarPoint(s.player, 36 + index * 12, base * Math.PI * 2 + index * 2.62, 0.2),
    {
      familiesCovered: Math.round(3 + s.seedPouches + index * 4 + (1 - s.pressure01) * 3),
      thawWindowMinutes: Math.round(6 + s.replantReadiness01 * 18 + index * 5),
      bankIntegrity: round(clamp01(s.seedViability01 * 0.62 + (1 - s.quarantineNeed01) * 0.32)),
      priority: index === 0 ? "seed vault and medics" : "watch families and row crews"
    }
  ));
}

export function createZombieOrchardSeedBankQuarantineRendererHandoffKit(readiness = {}) {
  const descriptors = {
    heirloomSeedCaches: readiness.heirloomSeedCaches ?? [],
    graftScionRacks: readiness.graftScionRacks ?? [],
    sporeFenceLanterns: readiness.sporeFenceLanterns ?? [],
    compostBurnPits: readiness.compostBurnPits ?? [],
    rowReplantCharters: readiness.rowReplantCharters ?? [],
    dawnSeedLedgers: readiness.dawnSeedLedgers ?? []
  };
  const flatDescriptors = Object.values(descriptors).flat();
  return {
    kind: "zombie-orchard.seed-bank-quarantine.renderer-handoff",
    policy: "renderer-consumes-descriptors-only",
    descriptorPolicy: "renderer-consumes-descriptors-only",
    descriptors,
    flatDescriptors,
    counts: {
      heirloomSeedCaches: descriptors.heirloomSeedCaches.length,
      graftScionRacks: descriptors.graftScionRacks.length,
      sporeFenceLanterns: descriptors.sporeFenceLanterns.length,
      compostBurnPits: descriptors.compostBurnPits.length,
      rowReplantCharters: descriptors.rowReplantCharters.length,
      dawnSeedLedgers: descriptors.dawnSeedLedgers.length,
      total: flatDescriptors.length
    }
  };
}

export function createZombieOrchardSeedBankQuarantineReadinessDomainKit(defaultInput = {}) {
  return {
    id: "zombie-orchard-seed-bank-quarantine-readiness-domain-kit",
    domainTree: ZOMBIE_ORCHARD_SEED_BANK_QUARANTINE_DOMAIN_TREE,
    ownership: "headless snapshot-to-descriptor domain kit",
    atomicKits: [
      "zombie-orchard-heirloom-seed-cache-kit",
      "zombie-orchard-graft-scion-rack-kit",
      "zombie-orchard-spore-fence-lantern-kit",
      "zombie-orchard-compost-burn-pit-kit",
      "zombie-orchard-row-replant-charter-kit",
      "zombie-orchard-dawn-seed-ledger-kit",
      "zombie-orchard-seed-bank-quarantine-renderer-handoff-kit"
    ],
    forbiddenOwnership: ZOMBIE_ORCHARD_SEED_BANK_QUARANTINE_FORBIDDEN_OWNERSHIP,
    compose(input = {}) {
      const merged = { ...defaultInput, ...input };
      const heirloomSeedCaches = createZombieOrchardHeirloomSeedCacheKit(merged);
      const graftScionRacks = createZombieOrchardGraftScionRackKit(merged);
      const sporeFenceLanterns = createZombieOrchardSporeFenceLanternKit(merged);
      const compostBurnPits = createZombieOrchardCompostBurnPitKit(merged);
      const rowReplantCharters = createZombieOrchardRowReplantCharterKit(merged);
      const dawnSeedLedgers = createZombieOrchardDawnSeedLedgerKit(merged);
      const snapshot = orchardSnapshot(merged);
      const readiness = {
        snapshot,
        heirloomSeedCaches,
        graftScionRacks,
        sporeFenceLanterns,
        compostBurnPits,
        rowReplantCharters,
        dawnSeedLedgers
      };
      const rendererHandoff = createZombieOrchardSeedBankQuarantineRendererHandoffKit(readiness);
      return {
        kind: "zombie-orchard.seed-bank-quarantine.readiness",
        missionState: snapshot.quarantineNeed01 > 0.68 ? "quarantine-redline" : snapshot.replantReadiness01 > 0.66 ? "ready-to-replant" : "banking-seeds",
        summary: {
          seedViability: round(snapshot.seedViability01),
          quarantineNeed: round(snapshot.quarantineNeed01),
          replantReadiness: round(snapshot.replantReadiness01),
          topPriority: snapshot.quarantineNeed01 > snapshot.replantReadiness01 ? "seal spores" : "bank heirlooms"
        },
        rendererHandoff,
        domainTree: ZOMBIE_ORCHARD_SEED_BANK_QUARANTINE_DOMAIN_TREE,
        forbiddenOwnership: ZOMBIE_ORCHARD_SEED_BANK_QUARANTINE_FORBIDDEN_OWNERSHIP
      };
    }
  };
}
