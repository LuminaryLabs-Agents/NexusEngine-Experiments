import assert from "node:assert/strict";
import {
  SIGNAL_BASTION_BEACON_TOWER_EVACUATION_POLICY,
  SIGNAL_BASTION_BEACON_TOWER_EVACUATION_TREE,
  createBastionBeaconPrismLensKit,
  createBastionBeaconTowerEvacuationRendererHandoffKit,
  createBastionDawnBeaconLedgerKit,
  createBastionEvacuationStairLaneKit,
  createBastionSafehouseTokenKit,
  createBastionSignalFlareBurstKit,
  createBastionTowerShadowWatchKit,
  createSignalBastionBeaconTowerEvacuationReadinessDomainKit
} from "../games/signal-bastion/src/signal-bastion-beacon-tower-evacuation-readiness-domain-kit.js";

function makeCase(index) {
  const path = [
    { x: 80, y: 440, z: 0 },
    { x: 250 + index * 3, y: 332 - index * 2, z: 0 },
    { x: 512 + index * 4, y: 280, z: 0 },
    { x: 780, y: 160 + index, z: 0 }
  ];
  const slots = Array.from({ length: 5 }, (_, slotIndex) => ({
    id: `case-${index}-slot-${slotIndex}`,
    x: 190 + slotIndex * 112,
    y: 380 - slotIndex * 44,
    z: slotIndex * 2,
    occupied: slotIndex <= index % 4
  }));
  return {
    rawSnapshot: {
      map: { path, slots, vital: { x: 820, y: 135, z: 0 } },
      economy: { wallet: { credits: 80 + index * 55 } },
      session: { lives: 20 - index, waveIndex: index % 3, waveActive: index % 2 === 0 },
      structures: {
        structures: slots.slice(0, 4).map((slot, structureIndex) => ({
          id: `tower-${index}-${structureIndex}`,
          x: slot.x,
          y: slot.y,
          z: slot.z,
          level: 1 + ((index + structureIndex) % 3),
          range: 120 + structureIndex * 18
        }))
      },
      agents: {
        active: Array.from({ length: index % 6 }, (_, agentIndex) => ({
          id: `enemy-${index}-${agentIndex}`,
          x: path[Math.min(agentIndex, path.length - 1)].x + agentIndex * 16,
          y: path[Math.min(agentIndex, path.length - 1)].y - agentIndex * 13,
          speed: 0.8 + agentIndex * 0.13,
          boss: agentIndex === 4
        }))
      },
      level: {
        waves: [
          { spawnQueue: ["runner", "runner", "brute"] },
          { spawnQueue: ["runner", "shielder", "runner", "boss"] },
          { spawnQueue: ["brute", "brute", "runner", "runner", "boss"] }
        ]
      }
    }
  };
}

const domain = createSignalBastionBeaconTowerEvacuationReadinessDomainKit();
const atomicKits = [
  createBastionBeaconPrismLensKit(),
  createBastionSignalFlareBurstKit(),
  createBastionEvacuationStairLaneKit(),
  createBastionTowerShadowWatchKit(),
  createBastionSafehouseTokenKit(),
  createBastionDawnBeaconLedgerKit(),
  createBastionBeaconTowerEvacuationRendererHandoffKit()
];

assert.equal(domain.id, "signal-bastion-beacon-tower-evacuation-readiness-domain-kit");
assert.ok(SIGNAL_BASTION_BEACON_TOWER_EVACUATION_TREE.includes("signal-bastion-beacon-tower-evacuation-readiness-domain"));
assert.equal(domain.tree, SIGNAL_BASTION_BEACON_TOWER_EVACUATION_TREE);
assert.equal(domain.policy, SIGNAL_BASTION_BEACON_TOWER_EVACUATION_POLICY);
assert.equal(domain.kits.length, 7);
for (const kit of atomicKits) assert.ok(kit.id.endsWith("kit"), `${kit.id} is an atomic or handoff kit`);

const cases = Array.from({ length: 10 }, (_, index) => makeCase(index));
const results = cases.map((item) => domain.describe(item));

for (const [index, result] of results.entries()) {
  assert.equal(result.kind, "domain-readiness", `case ${index} readiness kind`);
  assert.equal(result.prismLenses.lenses.length, 4, `case ${index} prism count`);
  assert.equal(result.flareBursts.flares.length, 6, `case ${index} flare count`);
  assert.equal(result.stairLanes.lanes.length, 5, `case ${index} stair count`);
  assert.equal(result.shadowWatches.shadows.length, 5, `case ${index} shadow count`);
  assert.equal(result.safehouseTokens.tokens.length, 4, `case ${index} safehouse token count`);
  assert.equal(result.dawnBeaconLedger.options.length, 4, `case ${index} ledger option count`);
  assert.equal(result.rendererHandoff.counts.descriptors, 6, `case ${index} handoff group count`);
  assert.equal(result.summary.totalNestedDescriptors, 28, `case ${index} nested descriptor total`);
  assert.ok(result.summary.readiness >= 0 && result.summary.readiness <= 1, `case ${index} readiness bounds`);
  assert.ok(result.summary.evacuationPressure >= 0 && result.summary.evacuationPressure <= 1, `case ${index} pressure bounds`);
  assert.ok(["hold-beacon-evacuation", "shadow-breach-watch", "route-civilians-to-beacon", "tune-beacon-prisms"].includes(result.summary.phase), `case ${index} phase enum`);
  assert.equal(result.rendererHandoff.descriptors.length, result.rendererHandoff.counts.descriptors, `case ${index} descriptor parity`);
  assert.doesNotThrow(() => JSON.stringify(result), `case ${index} JSON safe`);
}

const cold = domain.describe(makeCase(0));
const prepared = domain.describe(makeCase(9));
assert.ok(prepared.summary.readiness >= cold.summary.readiness, "prepared beacon route should improve readiness");
assert.equal(domain.policy.noRendererOwnership, true, "kit does not own renderer");
assert.equal(domain.policy.noDomOwnership, true, "kit does not own DOM");
assert.equal(domain.policy.noBrowserInputOwnership, true, "kit does not own browser input");
assert.equal(domain.policy.noFrameLoopOwnership, true, "kit does not own frame loop");
assert.equal(domain.policy.noThreeOwnership, true, "kit does not own Three.js");
assert.equal(domain.policy.noWebglOwnership, true, "kit does not own WebGL");
assert.equal(domain.policy.noAudioOwnership, true, "kit does not own audio");
assert.equal(domain.policy.noAssetLoadingOwnership, true, "kit does not own asset loading");

console.log("Signal Bastion beacon tower evacuation readiness kits smoke passed 10 intake cases.");
