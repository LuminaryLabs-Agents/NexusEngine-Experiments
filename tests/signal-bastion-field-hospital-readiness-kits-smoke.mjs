import assert from "node:assert/strict";

import {
  createBastionAmbulanceGateBandKit,
  createBastionCasualtyLedgerBandKit,
  createBastionFieldHospitalRendererHandoffKit,
  createBastionHealingWardGlyphKit,
  createBastionMedSupplyCacheKit,
  createBastionStretcherRelayThreadKit,
  createBastionTriageLanternQueueKit,
  createSignalBastionFieldHospitalReadinessDomainKit
} from "../games/signal-bastion/src/signal-bastion-field-hospital-readiness-domain-kit.js";

function makeCase(index) {
  const activeCount = index % 6;
  return {
    rawSnapshot: {
      map: {
        path: [
          { x: 80, y: 440, z: 0 },
          { x: 250 + index * 2, y: 330 - index, z: 0 },
          { x: 520, y: 280 + index, z: 0 },
          { x: 780, y: 160, z: 0 }
        ],
        vital: { x: 820, y: 135, z: 0 },
        slots: {
          a: { id: "a", x: 230, y: 360, z: 0, occupied: index % 2 === 0 },
          b: { id: "b", x: 450, y: 270, z: 0, occupied: index % 3 === 0 },
          c: { id: "c", x: 670, y: 210, z: 0 },
          d: { id: "d", x: 700, y: 290, z: 0 }
        }
      },
      structures: {
        structures: [
          { id: `bolt-${index}`, x: 235, y: 340, z: 0, range: 130, level: 1 + index % 3, damage: 9, towerType: "bolt" },
          { id: `ward-${index}`, x: 610, y: 235, z: 0, range: 160, level: 2, damage: 5, towerType: "ward" }
        ]
      },
      agents: {
        active: Object.fromEntries(Array.from({ length: activeCount }, (_, enemy) => [`enemy-${enemy}`, {
          id: `enemy-${enemy}`,
          x: 110 + enemy * 115,
          y: 425 - enemy * 48,
          z: 4,
          health: 35 + enemy * 20,
          maxHealth: 90,
          speed: 0.9 + enemy * 0.13,
          boss: enemy === 4
        }]))
      },
      session: { lives: 20 - index, waveIndex: index % 2, waveActive: index % 3 !== 0 },
      economy: { wallet: { credits: 70 + index * 65 } },
      level: {
        waves: [{ spawnQueue: ["grunt", "runner"] }, { spawnQueue: ["grunt", "brute", "boss"] }],
        buildOrder: [{ id: "bolt", cost: 95 }, { id: "ward", cost: 180 }]
      }
    },
    activeBlueprint: index % 2 ? "ward" : "bolt"
  };
}

const cases = Array.from({ length: 10 }, (_, index) => makeCase(index));
const atomicFactories = [
  createBastionTriageLanternQueueKit,
  createBastionMedSupplyCacheKit,
  createBastionStretcherRelayThreadKit,
  createBastionHealingWardGlyphKit,
  createBastionAmbulanceGateBandKit,
  createBastionCasualtyLedgerBandKit
];

for (const factory of atomicFactories) {
  const kit = factory();
  assert.equal(typeof kit.describe, "function", `${kit.id} should expose describe`);
  for (const [index, input] of cases.entries()) {
    const result = kit.describe(input);
    assert.ok(result.id, `${kit.id} case ${index} should have id`);
    assert.ok(result.kind, `${kit.id} case ${index} should have kind`);
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(result)), `${kit.id} case ${index} should be serializable`);
  }
}

const domain = createSignalBastionFieldHospitalReadinessDomainKit();
const handoffKit = createBastionFieldHospitalRendererHandoffKit();
assert.ok(domain.tree.includes("stretcher-transfer-domain"), "domain tree should include stretcher-transfer-domain");
assert.ok(domain.kits.includes("bastion-casualty-ledger-band-kit"), "domain should list casualty ledger atomic kit");
assert.equal(domain.policy.rendererConsumesDescriptorsOnly, true, "domain should enforce descriptor-only handoff");
assert.equal(domain.policy.noFrameLoopOwnership, true, "domain should not own frame loop");

for (const [index, input] of cases.entries()) {
  const result = domain.describe(input);
  assert.equal(result.rendererNeutral, true, `case ${index} should remain renderer neutral`);
  assert.equal(result.rendererHandoff.policy.rendererConsumesDescriptorsOnly, true, `case ${index} should keep handoff policy`);
  assert.equal(result.rendererHandoff.counts.descriptors, 6, `case ${index} should emit six descriptor groups`);
  assert.ok(result.triageLanternQueues.ribbons.length >= 2, `case ${index} should have triage ribbons`);
  assert.ok(result.medSupplyCaches.cells.length >= 3, `case ${index} should have supply cells`);
  assert.ok(result.stretcherRelayThreads.threads.length >= 1, `case ${index} should have stretcher threads`);
  assert.equal(result.healingWardGlyph.rings.length, 5, `case ${index} should have healing ward rings`);
  assert.ok(result.ambulanceGateBands.segments.length >= 3, `case ${index} should have ambulance path bands`);
  assert.equal(result.casualtyLedgerBand.options.length, 4, `case ${index} should have four ledger options`);
  assert.ok(["ward-ready", "ward-critical", "ward-forming"].includes(result.healingWardGlyph.missionState), `case ${index} should use known mission state`);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(result)), `case ${index} should be JSON-serializable`);
}

const one = domain.describe(cases[2]);
const composed = handoffKit.describe({
  triageLanternQueues: one.triageLanternQueues,
  medSupplyCaches: one.medSupplyCaches,
  stretcherRelayThreads: one.stretcherRelayThreads,
  healingWardGlyph: one.healingWardGlyph,
  ambulanceGateBands: one.ambulanceGateBands,
  casualtyLedgerBand: one.casualtyLedgerBand
});
assert.equal(composed.counts.descriptors, 6, "handoff kit should compose six descriptor groups");
assert.ok(composed.descriptors.every((descriptor) => descriptor.kind), "handoff descriptors should have kinds");

console.log("signal-bastion field hospital readiness kit smoke passed");
