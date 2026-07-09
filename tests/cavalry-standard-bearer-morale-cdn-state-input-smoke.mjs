import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createCavalryStandardBearerMoraleReadinessDomainKit } from "../experiments/The Cavalry of Rome/src/cavalry-standard-bearer-morale-readiness-domain-kit.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const indexHtml = readFileSync(new URL("../apps/the-cavalry-of-rome/index.html", import.meta.url), "utf8");
const entry = readFileSync(new URL("../experiments/The Cavalry of Rome/src/cavalry-standard-bearer-morale-readiness-pass.js", import.meta.url), "utf8");
const kitSource = readFileSync(new URL("../experiments/The Cavalry of Rome/src/cavalry-standard-bearer-morale-readiness-domain-kit.js", import.meta.url), "utf8");

assert.ok(indexHtml.includes("standard-bearer-morale-readiness-renderer-handoff-pass"), "route marker should advertise new pass");
assert.ok(indexHtml.includes("campaign-041-standard-bearer-morale"), "route build stamp should update");
assert.ok(indexHtml.includes("cavalry-standard-bearer-morale-readiness-pass.js?v=campaign-041"), "route should load new pass");
assert.ok(entry.includes(NEXUS_ENGINE_CDN), "entry should import NexusEngine main CDN");
assert.ok(!entry.includes("NexusRealtime@"), "changed entry must not import old NexusRealtime");
assert.ok(kitSource.includes("forbiddenOwnership"), "kit should declare renderer ownership boundaries");
assert.ok(!kitSource.includes("document."), "kit must not own DOM");
assert.ok(!kitSource.includes("requestAnimationFrame"), "kit must not own frame loop");
assert.ok(!kitSource.includes("new Audio"), "kit must not own audio");

const kit = createCavalryStandardBearerMoraleReadinessDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => ({
  turn: index * 3,
  actions: index,
  cells: Array.from({ length: 12 }, (_, cellIndex) => ({
    id: `sim-${index}-${cellIndex}`,
    owner: cellIndex % 5 === 0 ? "player" : cellIndex % 3 === 0 ? "enemy" : "neutral",
    x: 110 + cellIndex * 66,
    y: 130 + (cellIndex % 4) * 60,
    troops: { l: 3 + index, m: cellIndex % 3, h: index % 2 },
    neighbors: [`sim-${index}-${Math.max(0, cellIndex - 1)}`, `sim-${index}-${Math.min(11, cellIndex + 1)}`]
  }))
}));

for (const state of cases) {
  const readiness = kit.describe(state);
  assert.equal(readiness.rendererHandoff.kind, "renderer-handoff");
  assert.ok(readiness.rendererHandoff.counts.total >= 16, "descriptor total should be substantial");
  assert.ok(readiness.readiness >= 0 && readiness.readiness <= 1, "readiness bounded");
  assert.ok(readiness.moraleRisk >= 0 && readiness.moraleRisk <= 1, "morale risk bounded");
  assert.ok(["ready", "staging", "fragmented"].includes(readiness.missionState), "mission enum");
}

console.log("Cavalry standard bearer morale CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
