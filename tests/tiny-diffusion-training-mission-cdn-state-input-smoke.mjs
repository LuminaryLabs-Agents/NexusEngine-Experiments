import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTinyDiffusionTrainingMissionReadinessDomainKit } from "../experiments/tiny-diffusion-lab/kits/tiny-diffusion-training-mission-readiness-domain-kit.js";

const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const html = readFileSync("experiments/tiny-diffusion-lab/index.html", "utf8");
const main = readFileSync("experiments/tiny-diffusion-lab/main.js", "utf8");
const entry = readFileSync("experiments/tiny-diffusion-lab/app/training-mission-readiness-entry.js", "utf8");
const agentSmoke = readFileSync("tests/agent-labs-static-smoke.mjs", "utf8");
const gallery = readFileSync("experiments/_shared/nexus-gallery-data.js", "utf8");

assert.match(main, new RegExp(cdn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
assert.match(entry, new RegExp(cdn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
assert.doesNotMatch(entry, /NexusRealtime@main|NexusRealtime\/src|nexusrealtime\.js/);
assert.match(html, /trainingMissionReadiness/);
assert.match(html, /training-mission-readiness-entry\.js\?v=tiny-diffusion-training-mission-20260708/);
assert.match(entry, /getTrainingMissionReadiness/);
assert.match(entry, /getTinyDiffusionTrainingMissionReadiness/);
assert.match(entry, /getRendererHandoff/);
assert.match(agentSmoke, /trainingMissionReadiness/);
assert.match(gallery, /id: "tiny-diffusion-lab"/);

const cases = Array.from({ length: 10 }, (_, index) => ({
  prepared: index > 0,
  sampleCount: index + 2,
  classSpread: Math.min(1, 0.2 + index * 0.09),
  seeds: ["ring", "bar", "spiral", "dot"].slice(0, Math.max(1, Math.min(4, index % 5))),
  timesteps: 8,
  previewedSteps: Math.min(8, index),
  epochs: index,
  steps: index * 8,
  latestLoss: Math.max(0.1, 1 - index * 0.08),
  frames: Math.min(8, index + 1),
  finalReady: index >= 3,
  clarity: Math.min(1, index * 0.1),
  saved: index >= 6,
  checkpointAge: Math.max(0, 18 - index * 2)
}));

const domain = createTinyDiffusionTrainingMissionReadinessDomainKit();
for (const snapshot of cases) {
  const result = domain.evaluate(snapshot);
  assert.equal(result.rendererHandoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(result.rendererHandoff.descriptorCount, 6);
  assert.ok(["cold-start", "needs-more-training", "mission-ready"].includes(result.status));
}

console.log("tiny-diffusion-training-mission-cdn-state-input-smoke.mjs passed");
