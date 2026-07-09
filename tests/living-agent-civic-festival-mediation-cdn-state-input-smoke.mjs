import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createLivingAgentCivicFestivalMediationReadinessDomainKit } from "../experiments/living-agent-lab/civic-festival-mediation-readiness-kits.js";

const indexHtml = readFileSync("experiments/living-agent-lab/index.html", "utf8");
const entry = readFileSync("experiments/living-agent-lab/civic-festival-mediation-entry.js", "utf8");
const kits = readFileSync("experiments/living-agent-lab/civic-festival-mediation-readiness-kits.js", "utf8");

assert.ok(indexHtml.includes("civic-festival-mediation-readiness-renderer-handoff-pass"), "route advertises civic festival pass");
assert.ok(indexHtml.includes("civic-festival-mediation-entry.js?v=living-agent-civic-festival-20260709"), "route loads civic festival entry");
assert.ok(entry.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "entry imports NexusEngine main CDN");
assert.ok(!entry.includes("NexusRealtime@"), "entry does not import old NexusRealtime CDN");
assert.ok(entry.includes("getLivingAgentCivicFestivalMediationReadiness"), "entry exposes GameHost readiness accessor");
assert.ok(entry.includes("applyCivicFestivalInput"), "entry exposes Playwright-style state/input hook");
assert.ok(entry.includes("getRendererHandoff"), "entry composes renderer handoff");
assert.ok(kits.includes("renderer consumes descriptors only"), "kit declares descriptor-only renderer handoff");
for (const forbidden of ["document.", "window.", "THREE", "WebGL", "AudioContext", "requestAnimationFrame", "addEventListener"]) {
  assert.ok(!kits.includes(forbidden), `reusable kit avoids ${forbidden}`);
}

const kit = createLivingAgentCivicFestivalMediationReadinessDomainKit();
const world = {
  player: { x: 170, y: 300 },
  guard: { x: 480, y: 250, mood: "calm" },
  merchant: { x: 300, y: 230, mood: "neutral" },
  apple: { x: 310, y: 330, stolen: false },
  gate: { x: 650, y: 290, locked: true },
  facts: ["market is quiet"]
};
const festival = { permitFiled: false, vendorLaneCleared: false, lanternsLit: 1, stewardPosts: 1, mediatorBriefings: 0, routeSeed: 7 };
const inputs = [
  "file-permit",
  "clear-vendor-lane",
  "light-lantern",
  "light-lantern",
  "light-lantern",
  "assign-steward",
  "assign-steward",
  "brief-mediators",
  "new-route-seed",
  "open-gate"
];

const readinessByStep = inputs.map((action) => {
  if (action === "file-permit") festival.permitFiled = true;
  if (action === "clear-vendor-lane") festival.vendorLaneCleared = true;
  if (action === "light-lantern") festival.lanternsLit += 1;
  if (action === "assign-steward") festival.stewardPosts += 1;
  if (action === "brief-mediators") festival.mediatorBriefings += 1;
  if (action === "new-route-seed") festival.routeSeed += 13;
  if (action === "open-gate") {
    world.gate.locked = false;
    world.facts.unshift("player returned apple", "guard questioned merchant");
  }
  return kit.describe({ world, festival, runtimeSurface: { imported: true } });
});

for (const output of readinessByStep) {
  assert.ok(output.festivalReadiness >= 0 && output.festivalReadiness <= 1, "simulated readiness bounded");
  assert.equal(output.rendererHandoff.counts.total, 14, "simulated descriptor count stable");
}
assert.ok(readinessByStep.at(-1).festivalReadiness > readinessByStep[0].festivalReadiness, "simulated input improves readiness");
assert.ok(["staging", "open"].includes(readinessByStep.at(-1).phase), "final simulated phase advances");

console.log(`Living Agent civic festival mediation CDN/state/input smoke passed ${inputs.length} simulated cases against NexusEngine main CDN wiring.`);
