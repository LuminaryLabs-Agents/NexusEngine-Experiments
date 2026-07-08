import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createZombieOrchardSafehouseEvacuationReadinessDomainKit } from "../experiments/zombie-orchard/src/safehouse-evacuation-readiness-kits.js";

const root = process.cwd();
const entrySource = await readFile(join(root, "experiments/zombie-orchard/src/safehouse-evacuation-readiness-entry.js"), "utf8");
const kitSource = await readFile(join(root, "experiments/zombie-orchard/src/safehouse-evacuation-readiness-kits.js"), "utf8");
const routeSource = await readFile(join(root, "experiments/zombie-orchard/index.html"), "utf8");
const manifestSource = await readFile(join(root, "experiments/domain-kit-cutover-manifest.json"), "utf8");
const playwrightSource = await readFile(join(root, "tests/zombie-orchard-playwright-state-input-smoke.mjs"), "utf8");
const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

assert.ok(entrySource.includes(cdn));
assert.ok(entrySource.includes("createZombieOrchardSafehouseEvacuationReadinessDomainKit"));
assert.ok(entrySource.includes("getZombieOrchardSafehouseEvacuationReadiness"));
assert.ok(entrySource.includes("safehouseEvacuationDescriptorCount"));
assert.ok(!entrySource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js"));
assert.ok(kitSource.includes("ZOMBIE_ORCHARD_SAFEHOUSE_FORBIDDEN_OWNERSHIP"));
assert.ok(kitSource.includes("headless snapshot-to-descriptor domain kit"));
assert.ok(routeSource.includes("safehouse-evacuation-readiness-renderer-handoff-pass"));
assert.ok(routeSource.includes("safehouse-evacuation-readiness-entry.js?v=zombie-orchard-safehouse-evacuation-20260708"));
assert.ok(manifestSource.includes("zombie-orchard-safehouse-evacuation-readiness-domain-kit"));
assert.ok(playwrightSource.includes("zombie-orchard-safehouse-evacuation-readiness-kits-smoke.mjs"));
assert.ok(playwrightSource.includes("getZombieOrchardSafehouseEvacuationReadiness"));

const domain = createZombieOrchardSafehouseEvacuationReadinessDomainKit({ seed: "safehouse-cdn-smoke" });
const simulatedStateInputs = [
  { input: { interact: true }, state: { appleCount: 0, health01: 0.9, stamina01: 0.8, horde: { pressure01: 0.12 }, monsters: [] } },
  { input: { sprint: true }, state: { appleCount: 2, health01: 0.5, stamina01: 0.3, horde: { pressure01: 0.62 }, monsters: [{ position: { x: 8, z: 9 } }] } },
  { input: { useGear: true }, state: { appleCount: 6, health01: 0.3, stamina01: 0.55, danger: true, horde: { pressure01: 0.88 }, monsters: [{ position: { x: -8, z: -8 } }, { position: { x: 10, z: 4 } }] } },
  { input: { nextRound: true }, state: { appleCount: 4, health01: 0.8, stamina01: 0.78, round: { round: 5 }, horde: { pressure01: 0.35 }, clears: 8 } },
  { input: { swapSlot: 1 }, state: { appleCount: 1, health01: 1, stamina01: 1, orchard: { activeApples: [{ id: "green", typeId: "green", position: { x: 3, z: 4 } }] } } },
  { input: { dash: true }, state: { appleCount: 3, stamina01: 0.2, health01: 0.4, horde: { pressure01: 0.58 }, visualDomains: { trees: [{ id: "oak", position: { x: 6, z: -7 } }] } } },
  { input: { moveX: -1 }, state: { appleCount: 7, health01: 0.75, stamina01: 0.64, visualDomains: { lanes: [{ id: "left", center: { x: -20, z: 2 } }] } } },
  { input: { moveZ: 1 }, state: { appleCount: 5, health01: 0.66, stamina01: 0.72, horde: { pressure01: 0.12 }, clears: 18, round: { round: 10 } } },
  { input: { pause: true }, state: { appleCount: 2, health01: 0.2, stamina01: 0.28, horde: { pressure01: 0.96, mode: "panic" }, danger: true } },
  { input: { interact: true, useGear: true, nextRound: true }, state: { appleCount: 9, health01: 0.88, stamina01: 0.82, horde: { pressure01: 0.42 }, orchard: { activeApples: [{ id: "gold", typeId: "golden", position: { x: -6, z: 2 } }] }, monsters: [] } }
];

for (const [index, { input, state }] of simulatedStateInputs.entries()) {
  const readiness = domain.compose({
    player: { position: { x: index - 4, z: 4 - index } },
    ...state,
    simulatedInput: input
  });
  assert.ok(readiness.summary.descriptorCount >= 14, `case ${index} descriptor count`);
  assert.ok(readiness.rendererHandoff.descriptors.safehouseBeacons.length >= 3, `case ${index} safehouse beacons`);
  assert.ok(readiness.rendererHandoff.descriptors.laneClearances.length >= 3, `case ${index} lane clearances`);
  assert.ok(readiness.rendererHandoff.descriptors.barricadeReinforcements.length >= 3, `case ${index} barricades`);
  assert.ok(readiness.rendererHandoff.descriptors.dawnWagonRallies[0].state.evacSeats >= 6, `case ${index} wagon seats`);
  assert.equal(readiness.rendererHandoff.policy, "renderer-consumes-descriptors-only", `case ${index} handoff policy`);
}

console.log("zombie orchard safehouse evacuation CDN state input smoke passed");
