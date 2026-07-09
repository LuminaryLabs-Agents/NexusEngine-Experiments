import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createLivingAgentCrowdCalmKit,
  createLivingAgentEvidenceStallKit,
  createLivingAgentGuardPermitKit,
  createLivingAgentMarketTrustRestorationReadinessDomainKit,
  createLivingAgentMediatorOathKit,
  createLivingAgentRestitutionRouteKit,
  createLivingAgentWitnessTrailKit
} from "../experiments/living-agent-lab/market-trust-restoration-readiness-kits.js";

const source = readFileSync("experiments/living-agent-lab/market-trust-restoration-readiness-kits.js", "utf8");
for (const forbidden of ["document", "window", "requestAnimationFrame", "THREE", "WebGL", "AudioContext", "getContext("]) {
  assert.equal(source.includes(forbidden), false, `Reusable kit source must not own ${forbidden}`);
}

const cases = [
  { name: "quiet market", world: { tick: 0, player: { x: 170, y: 300 }, guard: { x: 480, y: 250, mood: "calm" }, merchant: { x: 300, y: 230, mood: "neutral" }, apple: { x: 310, y: 330, stolen: false }, gate: { x: 650, y: 290, locked: true }, facts: ["market is quiet"] } },
  { name: "apple stolen", world: { apple: { stolen: true }, guard: { mood: "alert" }, merchant: { mood: "neutral" }, gate: { locked: true }, facts: ["player stole apple"] } },
  { name: "accusation", world: { apple: { stolen: true }, guard: { mood: "suspicious" }, merchant: { mood: "nervous" }, gate: { locked: true }, facts: ["guard accused player"], lastChoice: { label: "accuse player", score: 0.91 } } },
  { name: "merchant questioned", world: { apple: { stolen: true }, guard: { mood: "alert" }, merchant: { mood: "nervous" }, gate: { locked: true }, facts: ["guard questioned merchant"] } },
  { name: "apple returned", world: { apple: { stolen: false }, guard: { mood: "calm" }, merchant: { mood: "neutral" }, gate: { locked: true }, facts: ["player returned apple"] } },
  { name: "gate unlocked", world: { apple: { stolen: false }, guard: { mood: "calm" }, merchant: { mood: "neutral" }, gate: { locked: false }, facts: ["player returned apple", "guard unlocked gate"] } },
  { name: "fallback sparse", world: {} },
  { name: "high fact density", world: { apple: { stolen: false }, guard: { mood: "calm" }, merchant: { mood: "neutral" }, gate: { locked: true }, facts: ["guard patrolled market", "guard warned player", "guard questioned merchant", "player returned apple"] } },
  { name: "nervous merchant", world: { apple: { stolen: false }, guard: { mood: "calm" }, merchant: { mood: "nervous" }, gate: { locked: true }, facts: ["merchant is nervous"] } },
  { name: "ready threshold", world: { apple: { stolen: false }, guard: { mood: "calm" }, merchant: { mood: "neutral" }, gate: { locked: false }, facts: ["player returned apple", "guard questioned merchant"] } }
];

const domain = createLivingAgentMarketTrustRestorationReadinessDomainKit();
const atomicKits = [
  createLivingAgentWitnessTrailKit(),
  createLivingAgentEvidenceStallKit(),
  createLivingAgentRestitutionRouteKit(),
  createLivingAgentGuardPermitKit(),
  createLivingAgentCrowdCalmKit(),
  createLivingAgentMediatorOathKit()
];

for (const entry of cases) {
  const result = domain.describe({ world: entry.world, input: { askAgent: true } });
  assert.equal(result.id, "living-agent-market-trust-restoration-readiness", entry.name);
  assert.ok(result.trustScore >= 0 && result.trustScore <= 1, entry.name);
  assert.match(result.missionState, /^(ready|recovering|at-risk)$/);
  assert.equal(result.rendererHandoff.rendererConsumesDescriptorsOnly, true);
  assert.equal(result.rendererHandoff.counts.total, 9);
  assert.doesNotThrow(() => JSON.stringify(result));

  for (const kit of atomicKits) {
    const descriptors = kit.describe({ world: entry.world });
    assert.ok(Array.isArray(descriptors), `${entry.name} ${kit.id}`);
    assert.ok(descriptors.length >= 1, `${entry.name} ${kit.id}`);
    assert.ok(descriptors.every((descriptor) => descriptor.id && descriptor.kind), `${entry.name} ${kit.id}`);
  }
}

const stolen = domain.describe({ world: cases[1].world });
const restored = domain.describe({ world: cases[5].world });
assert.equal(stolen.phase, "breach");
assert.equal(restored.phase, "restored");
assert.ok(restored.trustScore > stolen.trustScore);

console.log("Living Agent market trust restoration readiness kits smoke passed 10 intake cases.");
