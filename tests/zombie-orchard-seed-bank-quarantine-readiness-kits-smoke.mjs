import assert from "node:assert/strict";
import {
  createZombieOrchardSeedBankQuarantineReadinessDomainKit,
  createZombieOrchardHeirloomSeedCacheKit,
  createZombieOrchardGraftScionRackKit,
  createZombieOrchardSporeFenceLanternKit,
  createZombieOrchardCompostBurnPitKit,
  createZombieOrchardRowReplantCharterKit,
  createZombieOrchardDawnSeedLedgerKit,
  ZOMBIE_ORCHARD_SEED_BANK_QUARANTINE_FORBIDDEN_OWNERSHIP,
  ZOMBIE_ORCHARD_SEED_BANK_QUARANTINE_DOMAIN_TREE
} from "../experiments/zombie-orchard/src/seed-bank-quarantine-readiness-kits.js";

const cases = Array.from({ length: 10 }, (_, index) => ({
  seed: `seed-bank-case-${index}`,
  player: { position: { x: index * 1.5 - 6, y: 0, z: index % 2 ? 4 : -4 } },
  appleCount: index + 2,
  seedPouches: 1 + index,
  health01: Math.max(0.2, 0.95 - index * 0.06),
  stamina01: Math.max(0.18, 0.8 - index * 0.04),
  pressure01: Math.min(1, 0.12 + index * 0.08),
  infection01: Math.min(1, 0.08 + index * 0.07),
  roundNumber: index + 1,
  monsters: Array.from({ length: index % 5 }, (_, monster) => ({ position: { x: monster * 3, y: 0, z: -monster * 2 } })),
  visualDomains: {
    trees: Array.from({ length: 3 + (index % 3) }, (_, tree) => ({ position: { x: tree * 7 - 8, y: 0, z: tree * 4 - 5 } })),
    lanes: Array.from({ length: 2 + (index % 4) }, (_, lane) => ({ center: { x: lane * 9 - 6, y: 0, z: lane * -3 } })),
    apples: Array.from({ length: 2 + (index % 5) }, (_, apple) => ({ position: { x: apple * 5, y: 0, z: apple * 2 - 4 } }))
  },
  simulatedInput: {
    sprint: index % 2 === 0,
    useGear: index % 3 === 0
  }
}));

const domain = createZombieOrchardSeedBankQuarantineReadinessDomainKit();

for (const intake of cases) {
  const readiness = domain.compose(intake);
  assert.match(readiness.kind, /seed-bank-quarantine/);
  assert.ok(["quarantine-redline", "ready-to-replant", "banking-seeds"].includes(readiness.missionState));
  assert.ok(readiness.summary.seedViability >= 0 && readiness.summary.seedViability <= 1);
  assert.ok(readiness.summary.quarantineNeed >= 0 && readiness.summary.quarantineNeed <= 1);
  assert.ok(readiness.summary.replantReadiness >= 0 && readiness.summary.replantReadiness <= 1);
  assert.ok(readiness.rendererHandoff.counts.heirloomSeedCaches >= 3);
  assert.ok(readiness.rendererHandoff.counts.graftScionRacks >= 3);
  assert.ok(readiness.rendererHandoff.counts.sporeFenceLanterns >= 4);
  assert.ok(readiness.rendererHandoff.counts.compostBurnPits >= 2);
  assert.ok(readiness.rendererHandoff.counts.rowReplantCharters >= 3);
  assert.equal(readiness.rendererHandoff.counts.dawnSeedLedgers, 2);
  assert.equal(readiness.rendererHandoff.counts.total, readiness.rendererHandoff.flatDescriptors.length);
  assert.equal(readiness.rendererHandoff.policy, "renderer-consumes-descriptors-only");
  assert.doesNotThrow(() => JSON.stringify(readiness.rendererHandoff));
}

assert.ok(ZOMBIE_ORCHARD_SEED_BANK_QUARANTINE_DOMAIN_TREE.includes("seed-preservation-domain"));
assert.ok(ZOMBIE_ORCHARD_SEED_BANK_QUARANTINE_DOMAIN_TREE.includes("renderer consumes descriptors only"));
for (const forbidden of ["renderer", "dom", "browser-input", "three", "webgl", "audio", "asset-loading", "frame-loop", "physics"]) {
  assert.ok(ZOMBIE_ORCHARD_SEED_BANK_QUARANTINE_FORBIDDEN_OWNERSHIP.includes(forbidden));
}

const atomicCase = cases[6];
assert.ok(createZombieOrchardHeirloomSeedCacheKit(atomicCase).every((item) => item.kind === "zombie-orchard.heirloom-seed-cache"));
assert.ok(createZombieOrchardGraftScionRackKit(atomicCase).every((item) => item.kind === "zombie-orchard.graft-scion-rack"));
assert.ok(createZombieOrchardSporeFenceLanternKit(atomicCase).every((item) => item.kind === "zombie-orchard.spore-fence-lantern"));
assert.ok(createZombieOrchardCompostBurnPitKit(atomicCase).every((item) => item.kind === "zombie-orchard.compost-burn-pit"));
assert.ok(createZombieOrchardRowReplantCharterKit(atomicCase).every((item) => item.kind === "zombie-orchard.row-replant-charter"));
assert.ok(createZombieOrchardDawnSeedLedgerKit(atomicCase).every((item) => item.kind === "zombie-orchard.dawn-seed-ledger"));

const weak = domain.compose({ appleCount: 0, seedPouches: 0, health01: 0.25, pressure01: 0.95, infection01: 0.9 });
const strong = domain.compose({ appleCount: 14, seedPouches: 12, health01: 0.95, stamina01: 0.92, pressure01: 0.18, infection01: 0.08 });
assert.ok(strong.summary.seedViability > weak.summary.seedViability);
assert.ok(strong.summary.replantReadiness > weak.summary.replantReadiness);
assert.ok(strong.summary.quarantineNeed < weak.summary.quarantineNeed);

console.log("Zombie Orchard seed bank quarantine readiness kits smoke passed 10 intake cases.");
