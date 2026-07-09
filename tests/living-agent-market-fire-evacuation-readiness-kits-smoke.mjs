import assert from 'node:assert/strict';
import {
  LIVING_AGENT_MARKET_FIRE_EVACUATION_DOMAIN_TREE,
  LIVING_AGENT_MARKET_FIRE_EVACUATION_KITS,
  createLivingAgentMarketStallLayoutKit,
  createLivingAgentEmberLanternSensorKit,
  createLivingAgentSmokeCorridorMapKit,
  createLivingAgentBucketRelayRouteKit,
  createLivingAgentStallFirebreakMarkerKit,
  createLivingAgentMerchantMusterTokenKit,
  createLivingAgentFireResponsePolicyKit,
  createLivingAgentDawnFireSafetyLedgerKit,
  createLivingAgentMarketFireEvacuationRendererHandoffKit,
  createLivingAgentMarketFireEvacuationReadinessDomainKit
} from '../experiments/living-agent-lab/market-fire-evacuation-readiness-kits.js';

const intakeCases = [
  { seed: 1 },
  { seed: 2, inspectedLanterns: 1, tick: 18 },
  { seed: 3, inspectedLanterns: 4, clearedAisles: 1, tick: 54 },
  { seed: 5, inspectedLanterns: 4, clearedAisles: 3, bucketRelays: 1, tick: 90 },
  { seed: 8, inspectedLanterns: 4, clearedAisles: 3, bucketRelays: 3, firebreaksPlaced: 1, tick: 126 },
  { seed: 13, inspectedLanterns: 4, clearedAisles: 3, bucketRelays: 3, firebreaksPlaced: 4, musteredMerchants: 2, tick: 162 },
  { seed: 21, inspectedLanterns: 4, clearedAisles: 3, bucketRelays: 3, firebreaksPlaced: 4, musteredMerchants: 5, tick: 198 },
  { seed: -99, inspectedLanterns: 99, clearedAisles: 99, bucketRelays: 99, firebreaksPlaced: 99, musteredMerchants: 99, tick: 9999999 },
  { seed: '34', inspectedLanterns: '2', clearedAisles: null, bucketRelays: undefined, firebreaksPlaced: 2.8, musteredMerchants: 4.9 },
  { seed: 55, inspectedLanterns: 4, clearedAisles: 2, bucketRelays: 2, firebreaksPlaced: 3, musteredMerchants: 4, agentCalls: 3, tick: 324 }
];

const atomicKits = [
  createLivingAgentMarketStallLayoutKit(),
  createLivingAgentEmberLanternSensorKit(),
  createLivingAgentSmokeCorridorMapKit(),
  createLivingAgentBucketRelayRouteKit(),
  createLivingAgentStallFirebreakMarkerKit(),
  createLivingAgentMerchantMusterTokenKit(),
  createLivingAgentFireResponsePolicyKit(),
  createLivingAgentDawnFireSafetyLedgerKit()
];
const handoffKit = createLivingAgentMarketFireEvacuationRendererHandoffKit();
const domainKit = createLivingAgentMarketFireEvacuationReadinessDomainKit();

assert.ok(LIVING_AGENT_MARKET_FIRE_EVACUATION_DOMAIN_TREE.includes('renderer consumes descriptors only'));
assert.equal(LIVING_AGENT_MARKET_FIRE_EVACUATION_KITS.length, 10);
assert.equal(domainKit.domain, 'living-agent-market-fire-evacuation-readiness-domain');
assert.equal(domainKit.forbiddenOwnership.includes('renderer'), true);
assert.equal(domainKit.forbiddenOwnership.includes('frame-loop'), true);
assert.equal(domainKit.forbiddenOwnership.includes('dom'), true);

for (const [caseIndex, input] of intakeCases.entries()) {
  for (const atomicKit of atomicKits) {
    const output = atomicKit.describe(input);
    assert.ok(Array.isArray(output), `${atomicKit.id} case ${caseIndex + 1} returns descriptor array`);
    assert.ok(output.length > 0, `${atomicKit.id} case ${caseIndex + 1} emits descriptors`);
    assert.doesNotThrow(() => JSON.stringify(output), `${atomicKit.id} case ${caseIndex + 1} is JSON safe`);
  }
  const policy = createLivingAgentFireResponsePolicyKit().choose(input);
  assert.ok(['inspect-lantern', 'clear-aisle', 'stage-bucket-relay', 'place-firebreak', 'muster-merchant', 'hold-fire-line'].includes(policy.action));
  assert.ok(policy.confidence >= 0 && policy.confidence <= 1);
  const handoff = handoffKit.describe(input);
  assert.equal(handoff.passId, 'market-fire-evacuation-readiness-renderer-handoff-pass');
  assert.equal(handoff.policy, 'renderer-consumes-descriptors-only');
  assert.equal(handoff.counts.marketStallLayouts, 10);
  assert.equal(handoff.counts.emberLanternSensors, 4);
  assert.equal(handoff.counts.smokeCorridorMaps, 3);
  assert.equal(handoff.counts.bucketRelayRoutes, 3);
  assert.equal(handoff.counts.stallFirebreakMarkers, 4);
  assert.equal(handoff.counts.merchantMusterTokens, 5);
  assert.equal(handoff.counts.fireResponsePolicies, 1);
  assert.equal(handoff.counts.dawnFireSafetyLedgers, 1);
  assert.equal(handoff.counts.total, 31);
  const summary = domainKit.describe(input);
  assert.ok(summary.readiness >= 0 && summary.readiness <= 1, `case ${caseIndex + 1} readiness bounded`);
  assert.ok(summary.firePressure >= 0 && summary.firePressure <= 1, `case ${caseIndex + 1} pressure bounded`);
  assert.ok(['alarm', 'triaging', 'containing', 'evacuating', 'secured'].includes(summary.phase));
  assert.equal(summary.rendererHandoff.counts.total, 31);
  assert.doesNotThrow(() => JSON.stringify(summary));
}

const cold = domainKit.snapshot(intakeCases[0]);
const ready = domainKit.snapshot(intakeCases[6]);
assert.ok(ready.readiness > cold.readiness, 'prepared state improves readiness');
assert.ok(ready.firePressure < cold.firePressure, 'prepared state reduces fire pressure');
assert.equal(ready.phase, 'secured');
assert.equal(ready.recommendedAction, 'hold-fire-line');
console.log(`Living Agent market fire evacuation readiness kits smoke passed ${intakeCases.length} intake cases across ${atomicKits.length + 2} kits.`);
