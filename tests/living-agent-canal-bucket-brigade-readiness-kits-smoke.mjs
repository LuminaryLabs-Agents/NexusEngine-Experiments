import assert from "node:assert/strict";
import {
  LIVING_AGENT_CANAL_BUCKET_BRIGADE_DOMAIN_TREE,
  createCanalCisternIntakeKit,
  createPumpWheelPrimerKit,
  createBucketChainHandoffKit,
  createWetBurlapScreenKit,
  createChildMusterRibbonKit,
  createDawnBrigadeLedgerKit,
  createLivingAgentCanalBucketBrigadeReadinessDomainKit
} from "../experiments/living-agent-lab/canal-bucket-brigade-readiness-kits.js";

function makeState(index) {
  return {
    seed: 41 + index * 17,
    inspectedLanterns: Math.min(4, index),
    clearedAisles: Math.min(3, Math.floor(index / 2)),
    bucketRelays: Math.min(3, Math.floor((index + 1) / 3)),
    firebreaksPlaced: Math.min(4, Math.floor(index / 2)),
    musteredMerchants: Math.min(5, Math.floor((index + 1) / 2)),
    agentCalls: index % 4,
    tick: index * 18,
    lastAction: index % 2 ? "stage-bucket-relay" : "clear-aisle"
  };
}

const intakes = Array.from({ length: 10 }, (_, index) => makeState(index));
const canalCisternIntakeKit = createCanalCisternIntakeKit();
const pumpWheelPrimerKit = createPumpWheelPrimerKit();
const bucketChainHandoffKit = createBucketChainHandoffKit();
const wetBurlapScreenKit = createWetBurlapScreenKit();
const childMusterRibbonKit = createChildMusterRibbonKit();
const dawnBrigadeLedgerKit = createDawnBrigadeLedgerKit();
const domainKit = createLivingAgentCanalBucketBrigadeReadinessDomainKit();

assert.equal(LIVING_AGENT_CANAL_BUCKET_BRIGADE_DOMAIN_TREE.root, "living-agent-canal-bucket-brigade-readiness-domain");
assert.ok(LIVING_AGENT_CANAL_BUCKET_BRIGADE_DOMAIN_TREE.contract.includes("renderer consumes descriptors only"));

for (const state of intakes) {
  const cisterns = canalCisternIntakeKit.describe(state);
  assert.equal(canalCisternIntakeKit.id, "living-agent-canal-cistern-intake-kit");
  assert.equal(canalCisternIntakeKit.domain, "living-agent-canal-bucket-brigade/water-source/canal-cistern");
  assert.equal(cisterns.length, 3);
  assert.ok(cisterns.every((item) => item.flow >= 0 && item.flow <= 1));
  assert.ok(cisterns.every((item) => item.siltRisk >= 0 && item.siltRisk <= 1));

  const wheels = pumpWheelPrimerKit.describe(state);
  assert.equal(pumpWheelPrimerKit.id, "living-agent-pump-wheel-primer-kit");
  assert.equal(wheels.length, 2);
  assert.ok(wheels.every((item) => item.spin >= 0 && item.spin <= 1));

  const handoffs = bucketChainHandoffKit.describe(state);
  assert.equal(bucketChainHandoffKit.id, "living-agent-bucket-chain-handoff-kit");
  assert.equal(handoffs.length, 6);
  assert.ok(handoffs.every((item) => item.spacing >= 0 && item.spacing <= 1));
  assert.ok(handoffs.every((item) => item.flow >= 0 && item.flow <= 1));

  const screens = wetBurlapScreenKit.describe(state);
  assert.equal(wetBurlapScreenKit.id, "living-agent-wet-burlap-screen-kit");
  assert.equal(screens.length, 4);
  assert.ok(screens.every((item) => item.heatBlock >= 0 && item.heatBlock <= 1));
  assert.ok(screens.every((item) => item.smokeLeak >= 0 && item.smokeLeak <= 1));

  const ribbons = childMusterRibbonKit.describe(state);
  assert.equal(childMusterRibbonKit.id, "living-agent-child-muster-ribbon-kit");
  assert.equal(ribbons.length, 5);
  assert.ok(ribbons.every((item) => item.visibility >= 0 && item.visibility <= 1));
  assert.ok(ribbons.every((item) => item.escortRisk >= 0 && item.escortRisk <= 1));

  const ledger = dawnBrigadeLedgerKit.describe(state, { waterFlow: 0.5, screenCoverage: 0.6, childSafety: 0.7 });
  assert.equal(dawnBrigadeLedgerKit.id, "living-agent-dawn-brigade-ledger-kit");
  assert.ok(ledger.readiness >= 0 && ledger.readiness <= 1);
  assert.ok(ledger.smokeRisk >= 0 && ledger.smokeRisk <= 1);
  assert.ok(["prime-canal", "pass-buckets", "muster-children", "seal-firebreaks", "market-secured"].includes(ledger.missionState));

  const domain = domainKit.describe(state);
  assert.equal(domainKit.id, "living-agent-canal-bucket-brigade-readiness-domain-kit");
  assert.equal(domain.rendererHandoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(domain.rendererHandoff.counts.canalCisternIntakes, 3);
  assert.equal(domain.rendererHandoff.counts.pumpWheelPrimers, 2);
  assert.equal(domain.rendererHandoff.counts.bucketChainHandoffs, 6);
  assert.equal(domain.rendererHandoff.counts.wetBurlapScreens, 4);
  assert.equal(domain.rendererHandoff.counts.childMusterRibbons, 5);
  assert.ok(domain.rendererHandoff.counts.total >= 21);
  assert.ok(domain.ownershipBoundary.includes("no-dom"));
  assert.ok(domain.ownershipBoundary.includes("no-browser-input"));
  assert.ok(domain.ownershipBoundary.includes("no-agent-policy-ownership"));
  assert.deepEqual(JSON.parse(JSON.stringify(domain.rendererHandoff.counts)), domain.rendererHandoff.counts);
}

const cold = domainKit.describe(makeState(0));
const ready = domainKit.describe(makeState(9));
assert.ok(ready.readiness >= cold.readiness);
assert.ok(ready.smokeRisk <= cold.smokeRisk);

console.log("Living Agent canal bucket brigade readiness kits smoke passed 10 intake cases.");
