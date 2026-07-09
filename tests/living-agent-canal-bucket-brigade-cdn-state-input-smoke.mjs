import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createLivingAgentCanalBucketBrigadeReadinessDomainKit } from "../experiments/living-agent-lab/canal-bucket-brigade-readiness-kits.js";

const route = readFileSync("experiments/living-agent-lab/market-fire-evacuation.html", "utf8");
const entry = readFileSync("experiments/living-agent-lab/canal-bucket-brigade-readiness-entry.js", "utf8");
const kit = readFileSync("experiments/living-agent-lab/canal-bucket-brigade-readiness-kits.js", "utf8");
const packageJson = readFileSync("package.json", "utf8");

assert.ok(route.includes("canal-bucket-brigade-readiness-renderer-handoff-pass"));
assert.ok(route.includes("canal-bucket-brigade-readiness-entry.js?v=living-agent-canal-bucket-brigade-20260709"));
assert.ok(route.includes("Canal Bucket Brigade"));

assert.ok(entry.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(entry.includes("createLivingAgentCanalBucketBrigadeReadinessDomainKit"));
assert.ok(entry.includes("getCanalBucketBrigadeReadiness"));
assert.ok(entry.includes("getLivingAgentCanalBucketBrigadeReadiness"));
assert.ok(entry.includes("getCanalBucketBrigadeReadinessTree"));
assert.ok(entry.includes("applyCanalBucketBrigadeInput"));
assert.ok(entry.includes("getRendererHandoff"));
assert.ok(entry.includes("canalBucketBrigade"));
assert.ok(!entry.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"));

for (const token of [
  "LIVING_AGENT_CANAL_BUCKET_BRIGADE_DOMAIN_TREE",
  "createCanalCisternIntakeKit",
  "createPumpWheelPrimerKit",
  "createBucketChainHandoffKit",
  "createWetBurlapScreenKit",
  "createChildMusterRibbonKit",
  "createDawnBrigadeLedgerKit",
  "renderer consumes descriptors only; no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame-loop, agent policy, physics, storage, or network ownership"
]) {
  assert.ok(kit.includes(token), token);
}

assert.ok(packageJson.includes("check:living-agent-canal-brigade"));
assert.ok(packageJson.includes("tests/living-agent-canal-bucket-brigade-readiness-kits-smoke.mjs"));
assert.ok(packageJson.includes("tests/living-agent-canal-bucket-brigade-cdn-state-input-smoke.mjs"));

const domainKit = createLivingAgentCanalBucketBrigadeReadinessDomainKit();
const stateInputCases = Array.from({ length: 10 }, (_, index) => ({
  dt: index % 2 ? 1 / 72 : 1 / 30,
  state: {
    seed: 41 + index * 19,
    inspectedLanterns: Math.min(4, index),
    clearedAisles: Math.min(3, Math.floor(index / 2)),
    bucketRelays: Math.min(3, Math.floor((index + 2) / 3)),
    firebreaksPlaced: Math.min(4, Math.floor(index / 2)),
    musteredMerchants: Math.min(5, Math.floor((index + 1) / 2)),
    agentCalls: index % 5,
    tick: index * 18,
    lastAction: index % 3 === 0 ? "ask-agent" : index % 3 === 1 ? "stage-bucket-relay" : "muster-merchant"
  },
  input: {
    action: index % 3 === 0 ? "ask-agent" : index % 3 === 1 ? "stage-bucket-relay" : "muster-merchant",
    source: index % 3 === 0 ? "agent" : "operator"
  }
}));

for (const stateCase of stateInputCases) {
  assert.ok(Number.isFinite(stateCase.dt));
  assert.ok(["ask-agent", "stage-bucket-relay", "muster-merchant"].includes(stateCase.input.action));
  assert.ok(["agent", "operator"].includes(stateCase.input.source));
  const readiness = domainKit.describe(stateCase.state);
  assert.ok(readiness.readiness >= 0 && readiness.readiness <= 1);
  assert.ok(readiness.smokeRisk >= 0 && readiness.smokeRisk <= 1);
  assert.ok(readiness.rendererHandoff.counts.total >= 21);
  assert.ok(["prime-canal", "pass-buckets", "muster-children", "seal-firebreaks", "market-secured"].includes(readiness.missionState));
}

console.log("Living Agent canal bucket brigade CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
