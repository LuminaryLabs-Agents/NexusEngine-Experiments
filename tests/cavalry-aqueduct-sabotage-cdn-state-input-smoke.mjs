import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createCavalryAqueductSabotageReadinessDomainKit } from "../experiments/The Cavalry of Rome/src/cavalry-aqueduct-sabotage-readiness-domain-kit.js";

const routeHtml = readFileSync(new URL("../apps/the-cavalry-of-rome/index.html", import.meta.url), "utf8");
const entrySource = readFileSync(new URL("../experiments/The Cavalry of Rome/src/cavalry-aqueduct-sabotage-readiness-pass.js", import.meta.url), "utf8");
const kitSource = readFileSync(new URL("../experiments/The Cavalry of Rome/src/cavalry-aqueduct-sabotage-readiness-domain-kit.js", import.meta.url), "utf8");

assert.match(routeHtml, /aqueduct-sabotage-readiness-renderer-handoff-pass/);
assert.match(routeHtml, /cavalry-aqueduct-sabotage-readiness-pass\.js\?v=campaign-039/);
assert.match(entrySource, /https:\/\/cdn\.jsdelivr\.net\/gh\/LuminaryLabs-Dev\/NexusEngine@main\/src\/index\.js/);
assert.doesNotMatch(entrySource, /LuminaryLabs-Dev\/NexusRealtime@main\/src\/index\.js/);
assert.match(entrySource, /getCavalryAqueductSabotageReadiness/);
assert.match(entrySource, /getRendererHandoff/);
assert.match(entrySource, /rendererConsumesDescriptorsOnly/);
assert.doesNotMatch(kitSource, /document\./);
assert.doesNotMatch(kitSource, /requestAnimationFrame/);
assert.doesNotMatch(kitSource, /THREE\./);
assert.doesNotMatch(kitSource, /WebGL/);

const kit = createCavalryAqueductSabotageReadinessDomainKit();
for (let index = 0; index < 10; index += 1) {
  const cells = Array.from({ length: 7 }, (_, cellIndex) => ({
    id: `play-${index}-${cellIndex}`,
    owner: cellIndex % 4 === 0 ? "enemy" : cellIndex % 2 === 0 ? "neutral" : "player",
    x: 80 + cellIndex * 96,
    y: 100 + ((cellIndex + index) % 3) * 70,
    troops: { l: 2 + index + cellIndex, m: cellIndex % 3, h: index % 2 },
    neighbors: [`play-${index}-${Math.max(0, cellIndex - 1)}`, `play-${index}-${Math.min(6, cellIndex + 1)}`]
  }));
  const simulatedInput = {
    turn: index,
    actions: index % 4,
    camera: { x: 320 + index * 3, y: 240, z: 0.62 + index * 0.02 },
    preset: { label: "cdn-state-input-smoke", worldW: 900, worldH: 640 },
    cells
  };
  const readiness = kit.describe(simulatedInput);
  assert.ok(readiness.rendererHandoff.counts.springIntakeWatchtowers > 0, `case ${index} watchtower handoff`);
  assert.ok(readiness.rendererHandoff.counts.aqueductArchStressMarks > 0, `case ${index} arch handoff`);
  assert.ok(readiness.rendererHandoff.counts.cisternRationTokens > 0, `case ${index} ration handoff`);
  assert.ok(Number.isFinite(readiness.readiness), `case ${index} readiness`);
  assert.ok(readiness.readiness >= 0 && readiness.readiness <= 1, `case ${index} bounded readiness`);
}

console.log("Cavalry aqueduct sabotage CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
