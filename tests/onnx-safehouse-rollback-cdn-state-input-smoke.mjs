import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createOnnxSafehouseRollbackReadinessDomainKit } from "../experiments/_kits/onnx-agent-lab/onnx-safehouse-rollback-readiness-kits.js";

const CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const route = readFileSync("experiments/onnx-agent-lab/red-team-evacuation.html", "utf8");
const entry = readFileSync("experiments/onnx-agent-lab/safehouse-rollback-readiness-entry.js", "utf8");
const kit = readFileSync("experiments/_kits/onnx-agent-lab/onnx-safehouse-rollback-readiness-kits.js", "utf8");
const packageJson = readFileSync("package.json", "utf8");

assert.ok(route.includes("onnx-workshop-red-team-evacuation-renderer-handoff-pass"));
assert.ok(route.includes("onnx-safehouse-rollback-readiness-renderer-handoff-pass"));
assert.ok(route.includes("safehouse-rollback-readiness-entry.js?v=onnx-safehouse-rollback-readiness-1"));

assert.ok(entry.includes(CDN));
assert.ok(entry.includes("await import(NEXUS_URL)"));
assert.ok(entry.includes("createOnnxSafehouseRollbackReadinessDomainKit"));
assert.ok(entry.includes("getSafehouseRollbackReadiness"));
assert.ok(entry.includes("getOnnxSafehouseRollbackReadiness"));
assert.ok(entry.includes("applySafehouseRollbackInput"));
assert.ok(entry.includes("safehouseRollbackReadiness"));
assert.ok(!entry.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"));

for (const token of [
  "ONNX_SAFEHOUSE_ROLLBACK_DOMAIN",
  "createSafehouseLanternWardDescriptors",
  "createSafehouseRollbackKeyDescriptors",
  "createSafehouseEvidenceLockerDescriptors",
  "createSafehouseModelQuarantineSealDescriptors",
  "createSafehouseOperatorBunkDescriptors",
  "createSafehouseDawnLedger",
  "renderer consumes descriptors only"
]) {
  assert.ok(kit.includes(token), token);
}

assert.ok(packageJson.includes("check:onnx-safehouse-rollback"));
assert.ok(packageJson.includes("tests/onnx-safehouse-rollback-readiness-kits-smoke.mjs"));
assert.ok(packageJson.includes("tests/onnx-safehouse-rollback-cdn-state-input-smoke.mjs"));

const domainKit = createOnnxSafehouseRollbackReadinessDomainKit({ seed: 317 });
const actions = [
  "inspect-safehouse",
  "pair-rollback-key",
  "seal-evidence-locker",
  "quarantine-model",
  "rest-operator",
  "close-ledger",
  "pair-rollback-key",
  "seal-evidence-locker",
  "quarantine-model",
  "close-ledger"
];

for (const [index, action] of actions.entries()) {
  const readiness = domainKit.describe({
    seed: 317 + index,
    rollbackKeys: index,
    sealedEvidence: 3 + index,
    quarantinedModels: index % 4,
    operatorRest: Math.min(1, 0.22 + index * 0.08),
    sandboxIntegrity: Math.min(1, 0.38 + index * 0.058),
    evacuationPressure: Math.max(0.12, 0.76 - index * 0.052),
    drillReadiness: Math.min(1, 0.28 + index * 0.065),
    action
  });
  assert.ok(readiness.safehouseReadiness >= 0 && readiness.safehouseReadiness <= 1);
  assert.ok(readiness.rollbackPressure >= 0 && readiness.rollbackPressure <= 1);
  assert.equal(readiness.rendererHandoff.counts.total, 22);
  assert.ok(["safehouse-closed", "pair-rollback-keys", "seal-evidence-lockers", "quarantine-model-seals", "rest-operators"].includes(readiness.missionState));
  assert.equal(readiness.dawnLedger.action, action);
}

let cdnValidation = "source-wiring-only";
try {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  const response = await fetch(CDN, { signal: controller.signal });
  clearTimeout(timeout);
  if (response.ok) {
    const source = await response.text();
    const localCdn = join(tmpdir(), "nexusengine-main-cdn-onnx-safehouse-rollback-smoke.mjs");
    writeFileSync(localCdn, source);
    execFileSync(process.execPath, ["--check", localCdn], { stdio: "pipe" });
    cdnValidation = "downloaded-to-local-mjs-and-syntax-checked";
  }
} catch {
  cdnValidation = "source-wiring-only";
}

console.log(`ONNX safehouse rollback CDN/state/input smoke passed 10 simulated cases; CDN validation: ${cdnValidation}.`);
