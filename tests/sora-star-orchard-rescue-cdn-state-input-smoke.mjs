import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createSoraStarOrchardRescueReadinessDomainKit
} from "../experiments/sora-the-infinite/sora-star-orchard-rescue-readiness-kits.js";

const indexHtml = readFileSync("experiments/sora-the-infinite/index.html", "utf8");
const entry = readFileSync("experiments/sora-the-infinite/sora-star-orchard-rescue-entry.js", "utf8");
const kits = readFileSync("experiments/sora-the-infinite/sora-star-orchard-rescue-readiness-kits.js", "utf8");

assert.match(indexHtml, /star-orchard-rescue-readiness-renderer-handoff-pass/);
assert.match(indexHtml, /sora-star-orchard-rescue-entry\.js\?v=star-orchard-rescue-readiness-v1/);
assert.match(entry, /https:\/\/cdn\.jsdelivr\.net\/gh\/LuminaryLabs-Dev\/NexusEngine@main\/src\/index\.js/);
assert.doesNotMatch(entry, /LuminaryLabs-Dev\/NexusRealtime@main\/src\/index\.js/);
assert.match(entry, /getSoraStarOrchardRescueReadiness/);
assert.match(entry, /getRendererHandoff/);
assert.doesNotMatch(kits, /document\.|querySelector|requestAnimationFrame|THREE|AudioContext|addEventListener/);
assert.match(kits, /renderer consumes descriptors only/);

const kit = createSoraStarOrchardRescueReadinessDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => ({
  tick: 20 + index * 11,
  readiness: 0.12 + index * 0.08,
  input: {
    thrust: index % 4 === 0 ? 1 : 0.35,
    bank: Math.sin(index) * 0.4,
    climb: index % 2 ? 0.15 : 0.9,
    pointerActive: index % 3 === 0,
    pointerX: index / 9,
    pointerY: 1 - index / 9
  },
  routePreview: { handoffPackets: { packets: Array.from({ length: 2 + index % 3 }) } },
  skyRescueReadiness: { rendererHandoff: { counts: { total: 10 + index } } },
  skyLighthouseReadiness: { rendererHandoff: { counts: { total: 7 + index } } },
  skyRookeryMigrationReadiness: { rendererHandoff: { counts: { total: 12 + index } } }
}));

for (const [index, state] of cases.entries()) {
  const result = kit.describe(state);
  assert.equal(result.rendererHandoff.contract, "renderer-consumes-descriptors-only", `case ${index} descriptor-only handoff`);
  assert.equal(result.rendererHandoff.counts.total, 22, `case ${index} count`);
  assert.ok(result.dawnOrchardLedger.mealsReady >= 5, `case ${index} meals ready`);
  assert.ok(result.dawnOrchardLedger.medicineReady >= 3, `case ${index} medicine ready`);
  assert.ok(result.rendererHandoff.ownership.rendererMustNotOwn.includes("frame loop"), `case ${index} no frame loop`);
}

console.log("Sora star orchard rescue CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
