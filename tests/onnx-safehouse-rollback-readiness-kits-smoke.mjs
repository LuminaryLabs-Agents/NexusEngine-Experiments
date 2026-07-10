import assert from "node:assert/strict";
import {
  ONNX_SAFEHOUSE_ROLLBACK_DOMAIN,
  createOnnxSafehouseRollbackReadiness,
  createOnnxSafehouseRollbackReadinessDomainKit,
  createSafehouseDawnLedger,
  createSafehouseEvidenceLockerDescriptors,
  createSafehouseLanternWardDescriptors,
  createSafehouseModelQuarantineSealDescriptors,
  createSafehouseOperatorBunkDescriptors,
  createSafehouseRollbackKeyDescriptors
} from "../experiments/_kits/onnx-agent-lab/onnx-safehouse-rollback-readiness-kits.js";

const missionStates = ["safehouse-closed", "pair-rollback-keys", "seal-evidence-lockers", "quarantine-model-seals", "rest-operators"];

function intake(index) {
  return {
    seed: 317 + index,
    rollbackKeys: index,
    sealedEvidence: 2 + index,
    quarantinedModels: index % 5,
    operatorRest: Math.min(1, 0.18 + index * 0.085),
    sandboxIntegrity: Math.min(1, 0.3 + index * 0.07),
    evacuationPressure: Math.max(0.08, 0.82 - index * 0.065),
    drillReadiness: Math.min(1, 0.22 + index * 0.075),
    action: ["inspect-safehouse", "pair-key", "seal-locker", "quarantine-model", "rest-operator"][index % 5]
  };
}

const domainKit = createOnnxSafehouseRollbackReadinessDomainKit({ seed: 317 });
assert.equal(ONNX_SAFEHOUSE_ROLLBACK_DOMAIN.id, "onnx-safehouse-rollback-readiness-domain");
assert.ok(ONNX_SAFEHOUSE_ROLLBACK_DOMAIN.tree.includes("renderer consumes descriptors only"));
assert.ok(ONNX_SAFEHOUSE_ROLLBACK_DOMAIN.ownershipExclusions.includes("model inference"));

for (const input of Array.from({ length: 10 }, (_, index) => intake(index))) {
  const lanterns = createSafehouseLanternWardDescriptors(input);
  assert.equal(lanterns.length, 5);
  assert.ok(lanterns.every((item) => item.kit === "onnx-safehouse-lantern-ward-kit"));
  assert.ok(lanterns.every((item) => item.glow >= 0 && item.glow <= 1));

  const keys = createSafehouseRollbackKeyDescriptors(input);
  assert.equal(keys.length, 4);
  assert.ok(keys.every((item) => ["verified", "paired", "loose"].includes(item.routeState)));

  const lockers = createSafehouseEvidenceLockerDescriptors(input);
  assert.equal(lockers.length, 5);
  assert.ok(lockers.every((item) => item.coverage >= 0 && item.coverage <= 1));

  const seals = createSafehouseModelQuarantineSealDescriptors(input);
  assert.equal(seals.length, 3);
  assert.ok(seals.every((item) => ["sealed", "watched", "leaking"].includes(item.sealState)));

  const bunks = createSafehouseOperatorBunkDescriptors(input);
  assert.equal(bunks.length, 4);
  assert.ok(bunks.every((item) => item.recovery >= 0 && item.recovery <= 1));

  const ledger = createSafehouseDawnLedger(input, {
    brightLanterns: lanterns.filter((item) => item.wardState === "bright").length,
    lanterns: lanterns.length,
    verifiedKeys: keys.filter((item) => item.routeState === "verified").length,
    keys: keys.length,
    sealedLockers: lockers.filter((item) => item.sealed).length,
    lockers: lockers.length,
    strongSeals: seals.filter((item) => item.sealState === "sealed").length,
    seals: seals.length,
    readyBunks: bunks.filter((item) => item.ready).length,
    bunks: bunks.length
  });
  assert.ok(ledger.readiness >= 0 && ledger.readiness <= 1);
  assert.ok(ledger.pressure >= 0 && ledger.pressure <= 1);
  assert.ok(missionStates.includes(ledger.missionState));

  const readiness = createOnnxSafehouseRollbackReadiness(input);
  assert.equal(readiness.rendererHandoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(readiness.rendererHandoff.counts.lanternWards, 5);
  assert.equal(readiness.rendererHandoff.counts.rollbackKeys, 4);
  assert.equal(readiness.rendererHandoff.counts.evidenceLockers, 5);
  assert.equal(readiness.rendererHandoff.counts.modelQuarantineSeals, 3);
  assert.equal(readiness.rendererHandoff.counts.operatorBunks, 4);
  assert.equal(readiness.rendererHandoff.counts.total, 22);
  assert.ok(readiness.ownershipExclusions.includes("browser input"));
  assert.deepEqual(JSON.parse(JSON.stringify(readiness.rendererHandoff.counts)), readiness.rendererHandoff.counts);

  const composed = domainKit.describe(input);
  assert.equal(composed.domainId, "onnx-safehouse-rollback-readiness-domain");
  assert.ok(composed.kits.includes("onnx-safehouse-dawn-ledger-kit"));
}

const cold = domainKit.describe(intake(0));
const ready = domainKit.describe(intake(9));
assert.ok(ready.safehouseReadiness >= cold.safehouseReadiness);
assert.ok(ready.rollbackPressure <= cold.rollbackPressure);

console.log("ONNX safehouse rollback readiness kits smoke passed 10 intake cases.");
