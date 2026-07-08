import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createZombieOrchardCureCraftingReadinessDomainKit } from "../experiments/zombie-orchard/src/cure-crafting-readiness-kits.js";

const root = process.cwd();
const entrySource = await readFile(join(root, "experiments/zombie-orchard/src/cure-crafting-readiness-entry.js"), "utf8");
const kitSource = await readFile(join(root, "experiments/zombie-orchard/src/cure-crafting-readiness-kits.js"), "utf8");
const routeSource = await readFile(join(root, "experiments/zombie-orchard/index.html"), "utf8");
const manifestSource = await readFile(join(root, "experiments/domain-kit-cutover-manifest.json"), "utf8");
const playwrightSource = await readFile(join(root, "tests/zombie-orchard-playwright-state-input-smoke.mjs"), "utf8");
const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

assert.ok(entrySource.includes(cdn));
assert.ok(entrySource.includes("createZombieOrchardCureCraftingReadinessDomainKit"));
assert.ok(entrySource.includes("getZombieOrchardCureCraftingReadiness"));
assert.ok(entrySource.includes("renderer-consumes-descriptors-only"));
assert.ok(!entrySource.includes("NexusRealtime@main/src/index.js"));
assert.ok(!kitSource.includes("NexusRealtime@main/src/index.js"));
assert.ok(!kitSource.includes("document."));
assert.ok(!kitSource.includes("requestAnimationFrame"));
assert.ok(routeSource.includes("cure-crafting-readiness-renderer-handoff-pass"));
assert.ok(routeSource.includes("cure-crafting-readiness-entry.js?v=zombie-orchard-cure-crafting-20260708"));
assert.ok(manifestSource.includes("zombie-orchard-cure-crafting-readiness-domain-kit"));
assert.ok(playwrightSource.includes("zombie-orchard-cure-crafting-readiness-kits-smoke.mjs"));

const domain = createZombieOrchardCureCraftingReadinessDomainKit();
const simulatedStateInputs = [
  { input: { interact: true }, state: { appleCount: 0, health01: 0.9, horde: { pressure01: 0.1 }, monsters: [] } },
  { input: { interact: true, sprint: true }, state: { appleCount: 2, health01: 0.5, horde: { pressure01: 0.55 }, monsters: [{ position: { x: 8, z: 9 } }] } },
  { input: { useGear: true }, state: { appleCount: 6, health01: 0.3, danger: true, horde: { pressure01: 0.88 }, monsters: [{ position: { x: -8, z: -8 } }, { position: { x: 10, z: 4 } }] } },
  { input: { nextRound: true }, state: { appleCount: 4, health01: 0.8, round: { round: 5 }, horde: { pressure01: 0.35 }, clears: 8 } },
  { input: { swapSlot: 1 }, state: { appleCount: 1, health01: 1, orchard: { activeApples: [{ id: "green", typeId: "green", position: { x: 3, z: 4 } }] } } },
  { input: { dash: true }, state: { appleCount: 3, stamina01: 0.2, health01: 0.4, visualDomains: { trees: [{ id: "oak", position: { x: 6, z: -7 } }] } } },
  { input: { moveX: -1 }, state: { appleCount: 7, health01: 0.75, visualDomains: { lanes: [{ id: "left", center: { x: -20, z: 2 } }] } } },
  { input: { moveZ: 1 }, state: { appleCount: 5, health01: 0.66, horde: { pressure01: 0.12 }, clears: 18, round: { round: 10 } } },
  { input: { pause: true }, state: { appleCount: 2, health01: 0.2, horde: { pressure01: 0.96, mode: "panic" }, danger: true } },
  { input: { interact: true, useGear: true, nextRound: true }, state: { appleCount: 9, health01: 0.88, horde: { pressure01: 0.42 }, orchard: { activeApples: [{ id: "gold", typeId: "golden", position: { x: -6, z: 2 } }] }, monsters: [] } }
];

for (const [index, { input, state }] of simulatedStateInputs.entries()) {
  const readiness = domain.compose({
    player: { position: { x: index - 4, z: 4 - index } },
    ...state,
    simulatedInput: input
  });
  assert.ok(readiness.summary.descriptorCount > 0, `case ${index} descriptor count`);
  assert.ok(readiness.rendererHandoff.descriptors.infectedRootSamples.length >= 1, `case ${index} root samples`);
  assert.ok(readiness.rendererHandoff.descriptors.antidotePressQueues.length >= 1, `case ${index} antidote queues`);
  assert.ok(readiness.rendererHandoff.descriptors.dawnCureRitualWindows[0].readiness >= 0, `case ${index} ritual readiness`);
  assert.equal(readiness.rendererHandoff.policy, "renderer-consumes-descriptors-only", `case ${index} handoff policy`);
}

console.log("zombie orchard cure crafting CDN state input smoke passed");
