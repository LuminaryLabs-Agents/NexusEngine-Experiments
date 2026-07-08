import assert from "node:assert/strict";
import {
  ZOMBIE_ORCHARD_SAFEHOUSE_FORBIDDEN_OWNERSHIP,
  createZombieOrchardSafehouseEvacuationReadinessDomainKit,
  createZombieOrchardSafehouseBeaconKit,
  createZombieOrchardLaneClearanceKit,
  createZombieOrchardBarricadeReinforcementKit,
  createZombieOrchardAntidoteRunnerKit,
  createZombieOrchardDawnWagonRallyKit,
  createZombieOrchardRadioTowerSignalKit
} from "../experiments/zombie-orchard/src/safehouse-evacuation-readiness-kits.js";

assert.ok(ZOMBIE_ORCHARD_SAFEHOUSE_FORBIDDEN_OWNERSHIP.includes("document."));
assert.ok(ZOMBIE_ORCHARD_SAFEHOUSE_FORBIDDEN_OWNERSHIP.includes("requestAnimationFrame"));

const cases = [
  { label: "quiet first round", state: { appleCount: 1, health01: 1, stamina01: 1, horde: { pressure01: 0.08 }, round: { round: 1 }, monsters: [] } },
  { label: "low provisions", state: { appleCount: 0, health01: 0.88, stamina01: 0.72, horde: { pressure01: 0.24 }, round: { round: 2 }, monsters: [{ position: { x: 6, z: -4 } }] } },
  { label: "injured sprint", state: { appleCount: 2, health01: 0.34, stamina01: 0.18, horde: { pressure01: 0.58 }, round: { round: 4 }, monsters: [{ position: { x: 8, z: 8 } }, { position: { x: -7, z: 3 } }] } },
  { label: "high pressure", state: { appleCount: 5, health01: 0.62, stamina01: 0.44, horde: { pressure01: 0.86 }, round: { round: 7 }, monsters: Array.from({ length: 8 }, (_, i) => ({ position: { x: i * 3, z: -i } })) } },
  { label: "apple surplus", state: { appleCount: 9, health01: 0.92, stamina01: 0.8, horde: { pressure01: 0.32 }, round: { round: 5 }, orchard: { activeApples: [{ id: "green", position: { x: 5, z: 4 } }, { id: "gold", position: { x: -8, z: 6 } }] } } },
  { label: "lane data", state: { appleCount: 3, health01: 0.7, stamina01: 0.66, horde: { pressure01: 0.5 }, visualDomains: { lanes: [{ center: { x: -20, z: 0 } }, { center: { x: 0, z: 16 } }, { center: { x: 19, z: -8 } }] } } },
  { label: "tree barricades", state: { appleCount: 4, health01: 0.58, stamina01: 0.5, horde: { pressure01: 0.74 }, visualDomains: { trees: [{ position: { x: -14, z: 12 } }, { position: { x: 16, z: -11 } }, { position: { x: 22, z: 5 } }] } } },
  { label: "late round radio", state: { appleCount: 6, health01: 0.76, stamina01: 0.61, horde: { pressure01: 0.48 }, round: { round: 10 }, monsters: [] } },
  { label: "panic next round", state: { appleCount: 2, health01: 0.26, stamina01: 0.33, horde: { pressure01: 0.92 }, round: { round: 9 }, simulatedInput: { nextRound: true }, monsters: Array.from({ length: 10 }, (_, i) => ({ position: { x: -i, z: i * 2 } })) } },
  { label: "full extraction prep", state: { appleCount: 8, health01: 0.84, stamina01: 0.7, horde: { pressure01: 0.41 }, round: { round: 12 }, simulatedInput: { interact: true, useGear: true } } }
];

const domain = createZombieOrchardSafehouseEvacuationReadinessDomainKit({ seed: "safehouse-smoke" });

for (const [index, testCase] of cases.entries()) {
  const input = {
    player: { position: { x: index - 4, y: 0, z: 4 - index } },
    seed: `safehouse-smoke-${index}`,
    ...testCase.state
  };
  const readiness = domain.compose(input);
  assert.equal(readiness.rendererHandoff.policy, "renderer-consumes-descriptors-only", `${testCase.label} policy`);
  assert.equal(readiness.rendererHandoff.descriptorPolicy, "renderer-consumes-descriptors-only", `${testCase.label} descriptor policy`);
  assert.ok(readiness.safehouseBeacons.length >= 3, `${testCase.label} safehouse beacons`);
  assert.ok(readiness.laneClearances.length >= 3, `${testCase.label} lane clearances`);
  assert.ok(readiness.barricadeReinforcements.length >= 3, `${testCase.label} barricades`);
  assert.ok(readiness.antidoteRunners.length >= 2, `${testCase.label} antidote runners`);
  assert.equal(readiness.dawnWagonRallies.length, 2, `${testCase.label} dawn wagons`);
  assert.ok(readiness.radioTowerSignals.length >= 1, `${testCase.label} radio tower signals`);
  assert.ok(readiness.summary.descriptorCount >= 14, `${testCase.label} descriptor count`);
  assert.equal(readiness.rendererHandoff.counts.total, readiness.rendererHandoff.flatDescriptors.length, `${testCase.label} flat count`);
  assert.doesNotThrow(() => JSON.stringify(readiness), `${testCase.label} serializable`);
}

const atomicInput = { appleCount: 5, horde: { pressure01: 0.55 }, player: { position: { x: 1, z: 2 } } };
assert.ok(createZombieOrchardSafehouseBeaconKit(atomicInput).length >= 3);
assert.ok(createZombieOrchardLaneClearanceKit(atomicInput).length >= 3);
assert.ok(createZombieOrchardBarricadeReinforcementKit(atomicInput).length >= 3);
assert.ok(createZombieOrchardAntidoteRunnerKit(atomicInput).length >= 2);
assert.equal(createZombieOrchardDawnWagonRallyKit(atomicInput).length, 2);
assert.ok(createZombieOrchardRadioTowerSignalKit(atomicInput).length >= 1);

console.log("zombie orchard safehouse evacuation readiness kit smoke passed");
