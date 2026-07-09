import "./zombie-orchard-well-restoration-readiness-kits-smoke.mjs";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createZombieOrchardWellRestorationReadinessDomainKit } from "../experiments/zombie-orchard/src/well-restoration-readiness-kits.js";

const root = process.cwd();
const entrySource = await readFile(join(root, "experiments/zombie-orchard/src/well-restoration-readiness-entry.js"), "utf8");
const indexSource = await readFile(join(root, "experiments/zombie-orchard/index.html"), "utf8");
const parentSmokeSource = await readFile(join(root, "tests/zombie-orchard-playwright-state-input-smoke.mjs"), "utf8");

assert.ok(entrySource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(!entrySource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js"));
assert.ok(entrySource.includes("createZombieOrchardWellRestorationReadinessDomainKit"));
assert.ok(entrySource.includes("getZombieOrchardWellRestorationReadiness"));
assert.ok(entrySource.includes("wellRestorationReadiness"));
assert.ok(indexSource.includes("well-restoration-readiness-renderer-handoff-pass"));
assert.ok(indexSource.includes("well-restoration-readiness-entry.js"));
assert.ok(parentSmokeSource.includes("zombie-orchard-well-restoration-readiness-kits-smoke.mjs"));
assert.ok(parentSmokeSource.includes("zombie-orchard-well-restoration-cdn-state-input-smoke.mjs"));
assert.ok(parentSmokeSource.includes("getZombieOrchardWellRestorationReadiness"));

const domain = createZombieOrchardWellRestorationReadinessDomainKit({ seed: "cdn-state-input" });
const cases = Array.from({ length: 10 }, (_, index) => ({
  seed: `cdn-well-${index}`,
  roundNumber: index + 2,
  appleCount: 1 + index,
  health01: Math.max(0.2, 0.9 - index * 0.055),
  stamina01: Math.max(0.18, 0.82 - index * 0.045),
  pressure01: Math.min(0.94, 0.12 + index * 0.09),
  player: { position: { x: index * 2, y: 0, z: -index } },
  visualDomains: {
    lanes: Array.from({ length: 4 }, (_, laneIndex) => ({ center: { x: laneIndex * 5, y: 0, z: laneIndex * 4 - index } })),
    trees: Array.from({ length: 5 }, (_, treeIndex) => ({ position: { x: treeIndex * 2, y: 0, z: treeIndex * -3 } })),
    apples: Array.from({ length: 3 }, (_, appleIndex) => ({ position: { x: appleIndex * -3, y: 0.2, z: appleIndex * 4 } })),
    threats: Array.from({ length: index % 8 }, (_, threatIndex) => ({ id: `threat-${threatIndex}` }))
  },
  simulatedInput: {
    moveX: index % 2 ? 1 : -1,
    moveZ: index % 3 ? -1 : 0.5,
    sprint: index % 2 === 0,
    interact: index % 3 === 0,
    useGear: index % 4 === 0
  }
}));

for (const [index, input] of cases.entries()) {
  const readiness = domain.compose(input);
  assert.ok(readiness.rendererHandoff.counts.total >= 15, `case ${index + 1} descriptor count`);
  assert.ok(Array.isArray(readiness.rendererHandoff.descriptors.wellPumpRepairs));
  assert.ok(Array.isArray(readiness.rendererHandoff.descriptors.bucketBrigadeRoutes));
  assert.ok(Array.isArray(readiness.rendererHandoff.descriptors.disinfectantStills));
  assert.ok(Array.isArray(readiness.rendererHandoff.descriptors.wellBarricadeLanterns));
  assert.ok(Array.isArray(readiness.rendererHandoff.descriptors.sprinklerMistGrids));
  assert.ok(Array.isArray(readiness.rendererHandoff.descriptors.dawnWaterRationLedgers));
  assert.ok(readiness.summary.restorationNeed >= 0 && readiness.summary.restorationNeed <= 1);
}

console.log("zombie orchard well restoration CDN/state-input smoke passed");
