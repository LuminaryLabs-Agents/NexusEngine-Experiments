import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createLivingAgentMarketTrustRestorationReadinessDomainKit } from "../experiments/living-agent-lab/market-trust-restoration-readiness-kits.js";

const route = readFileSync("experiments/living-agent-lab/index.html", "utf8");
const entry = readFileSync("experiments/living-agent-lab/market-trust-restoration-readiness-entry.js", "utf8");
const kits = readFileSync("experiments/living-agent-lab/market-trust-restoration-readiness-kits.js", "utf8");
const agentLabsSmoke = readFileSync("tests/agent-labs-static-smoke.mjs", "utf8");

assert.match(route, /market-trust-restoration-readiness-entry\.js\?v=living-agent-market-trust-20260709/);
assert.match(route, /data-experiment="living-agent-lab"/);
assert.match(entry, /cdn\.jsdelivr\.net\/gh\/LuminaryLabs-Dev\/NexusEngine@main\/src\/index\.js/);
assert.doesNotMatch(entry, /NexusRealtime@main/);
assert.match(entry, /getLivingAgentMarketTrustRestorationReadiness/);
assert.match(entry, /getRendererHandoff/);
assert.match(entry, /marketTrustRestorationDescriptors/);
assert.match(kits, /renderer consumes descriptors only/);
assert.match(agentLabsSmoke, /market-trust-restoration-readiness-entry/);

for (const forbidden of ["document", "window", "requestAnimationFrame", "THREE", "WebGL", "AudioContext", "getContext("]) {
  assert.equal(kits.includes(forbidden), false, `Reusable kit source must not own ${forbidden}`);
}

const domain = createLivingAgentMarketTrustRestorationReadinessDomainKit();
const inputs = [
  { apple: { stolen: false }, guard: { mood: "calm" }, merchant: { mood: "neutral" }, gate: { locked: true }, facts: [] },
  { apple: { stolen: true }, guard: { mood: "alert" }, merchant: { mood: "neutral" }, gate: { locked: true }, facts: ["player stole apple"] },
  { apple: { stolen: true }, guard: { mood: "suspicious" }, merchant: { mood: "nervous" }, gate: { locked: true }, facts: ["guard accused player"] },
  { apple: { stolen: false }, guard: { mood: "calm" }, merchant: { mood: "neutral" }, gate: { locked: true }, facts: ["player returned apple"] },
  { apple: { stolen: false }, guard: { mood: "calm" }, merchant: { mood: "neutral" }, gate: { locked: false }, facts: ["player returned apple", "guard unlocked gate"] },
  { apple: { stolen: false }, guard: { mood: "alert" }, merchant: { mood: "nervous" }, gate: { locked: true }, facts: ["guard warned player"] },
  { apple: { stolen: true }, guard: { mood: "calm" }, merchant: { mood: "neutral" }, gate: { locked: true }, facts: ["market is quiet"] },
  { apple: { stolen: false }, guard: { mood: "calm" }, merchant: { mood: "nervous" }, gate: { locked: false }, facts: ["guard questioned merchant"] },
  { apple: { stolen: false }, guard: { mood: "suspicious" }, merchant: { mood: "neutral" }, gate: { locked: true }, facts: ["guard patrolled market"] },
  { apple: { stolen: false }, guard: { mood: "calm" }, merchant: { mood: "neutral" }, gate: { locked: false }, facts: ["player returned apple", "guard questioned merchant", "guard unlocked gate"] }
];

const outputs = inputs.map((world) => domain.describe({ world, input: { askAgent: true } }));
for (const output of outputs) {
  assert.ok(["ready", "recovering", "at-risk"].includes(output.missionState));
  assert.ok(output.trustScore >= 0 && output.trustScore <= 1);
  assert.equal(output.rendererHandoff.counts.total, 9);
  assert.equal(output.rendererHandoff.rendererConsumesDescriptorsOnly, true);
}

assert.ok(outputs[4].trustScore > outputs[1].trustScore);
assert.ok(outputs[9].rendererHandoff.descriptors.guardPermits.some((permit) => permit.issued === true));

console.log("Living Agent market trust restoration CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
