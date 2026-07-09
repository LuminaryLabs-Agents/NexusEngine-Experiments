import assert from "node:assert/strict";
import {
  ZOMBIE_ORCHARD_WELL_RESTORATION_DOMAIN_TREE,
  ZOMBIE_ORCHARD_WELL_RESTORATION_FORBIDDEN_OWNERSHIP,
  createZombieOrchardWellPumpRepairKit,
  createZombieOrchardBucketBrigadeRouteKit,
  createZombieOrchardDisinfectantStillKit,
  createZombieOrchardWellBarricadeLanternKit,
  createZombieOrchardSprinklerMistGridKit,
  createZombieOrchardDawnWaterRationLedgerKit,
  createZombieOrchardWellRestorationReadinessDomainKit
} from "../experiments/zombie-orchard/src/well-restoration-readiness-kits.js";

const cases = Array.from({ length: 10 }, (_, index) => ({
  seed: `well-restoration-case-${index + 1}`,
  roundNumber: index + 1,
  appleCount: index % 2 ? 7 + index : 2 + index,
  health01: Math.max(0.22, 0.94 - index * 0.06),
  stamina01: Math.max(0.18, 0.86 - index * 0.05),
  pressure01: Math.min(0.95, 0.18 + index * 0.08),
  player: { position: { x: index * 1.7, y: 0, z: -index * 1.2 } },
  visualDomains: {
    lanes: Array.from({ length: 3 + (index % 3) }, (_, laneIndex) => ({ center: { x: laneIndex * 4, y: 0, z: index + laneIndex * 5 } })),
    trees: Array.from({ length: 4 + (index % 4) }, (_, treeIndex) => ({ position: { x: treeIndex * 3, y: 0, z: treeIndex * -4 } })),
    apples: Array.from({ length: 2 + (index % 5) }, (_, appleIndex) => ({ position: { x: appleIndex * -2, y: 0.2, z: appleIndex * 3 } })),
    threats: Array.from({ length: index % 6 }, (_, threatIndex) => ({ id: `threat-${threatIndex}` }))
  },
  simulatedInput: {
    sprint: index % 2 === 0,
    useGear: index % 3 === 0,
    interact: index % 4 === 0
  }
}));

const domain = createZombieOrchardWellRestorationReadinessDomainKit({ seed: "well-restoration-smoke" });

assert.ok(ZOMBIE_ORCHARD_WELL_RESTORATION_DOMAIN_TREE.includes("zombie-orchard-well-restoration-readiness-domain"));
assert.ok(ZOMBIE_ORCHARD_WELL_RESTORATION_DOMAIN_TREE.includes("renderer consumes descriptors only"));
assert.ok(domain.atomicKits.includes("zombie-orchard-well-pump-repair-kit"));
assert.ok(domain.atomicKits.includes("zombie-orchard-dawn-water-ration-ledger-kit"));

for (const [index, input] of cases.entries()) {
  const readiness = domain.compose(input);
  const handoff = readiness.rendererHandoff;

  assert.equal(readiness.kind, "zombie-orchard.well-restoration.readiness");
  assert.equal(handoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(handoff.descriptorPolicy, "renderer-consumes-descriptors-only");
  assert.ok(handoff.counts.total >= 15, `case ${index + 1} should have enough descriptors`);
  assert.ok(readiness.summary.restorationNeed >= 0 && readiness.summary.restorationNeed <= 1);
  assert.ok(readiness.summary.contamination01 >= 0 && readiness.summary.contamination01 <= 1);
  assert.ok(readiness.summary.drought01 >= 0 && readiness.summary.drought01 <= 1);

  assert.ok(createZombieOrchardWellPumpRepairKit(input).every((item) => item.kind === "zombie-orchard.well-pump-repair"));
  assert.ok(createZombieOrchardBucketBrigadeRouteKit(input).every((item) => item.kind === "zombie-orchard.bucket-brigade-route"));
  assert.ok(createZombieOrchardDisinfectantStillKit(input).every((item) => item.kind === "zombie-orchard.disinfectant-still"));
  assert.ok(createZombieOrchardWellBarricadeLanternKit(input).every((item) => item.kind === "zombie-orchard.well-barricade-lantern"));
  assert.ok(createZombieOrchardSprinklerMistGridKit(input).every((item) => item.kind === "zombie-orchard.sprinkler-mist-grid"));
  assert.ok(createZombieOrchardDawnWaterRationLedgerKit(input).every((item) => item.kind === "zombie-orchard.dawn-water-ration-ledger"));

  assert.equal(handoff.counts.wellPumpRepairs, readiness.wellPumpRepairs.length);
  assert.equal(handoff.counts.bucketBrigadeRoutes, readiness.bucketBrigadeRoutes.length);
  assert.equal(handoff.counts.disinfectantStills, readiness.disinfectantStills.length);
  assert.equal(handoff.counts.wellBarricadeLanterns, readiness.wellBarricadeLanterns.length);
  assert.equal(handoff.counts.sprinklerMistGrids, readiness.sprinklerMistGrids.length);
  assert.equal(handoff.counts.dawnWaterRationLedgers, readiness.dawnWaterRationLedgers.length);
  assert.doesNotThrow(() => JSON.stringify(readiness));
}

for (const token of ZOMBIE_ORCHARD_WELL_RESTORATION_FORBIDDEN_OWNERSHIP) {
  assert.ok(!["document.", "window.", "HTMLElement", "THREE.", "WebGLRenderer", "AudioContext", "requestAnimationFrame", "addEventListener"].includes(token));
}

const calm = domain.compose({ seed: "calm-well", pressure01: 0.12, health01: 0.95, stamina01: 0.92, roundNumber: 1, appleCount: 2 });
const crisis = domain.compose({ seed: "crisis-well", pressure01: 0.92, health01: 0.25, stamina01: 0.2, roundNumber: 12, appleCount: 12, visualDomains: { threats: Array.from({ length: 10 }, (_, id) => ({ id })) } });

assert.ok(crisis.summary.restorationNeed > calm.summary.restorationNeed);
assert.ok(crisis.rendererHandoff.counts.total >= calm.rendererHandoff.counts.total);

console.log("zombie orchard well restoration readiness kits smoke passed");
