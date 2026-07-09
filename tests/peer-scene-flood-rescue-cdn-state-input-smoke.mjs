import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSceneFloodRescueReadinessDomainKit } from "../experiments/peer-scene-transition/shared/scene-flood-rescue-readiness-kits.js";

const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const oldRuntimeCdn = "LuminaryLabs-Dev/NexusRealtime@main";
const entry = readFileSync("experiments/peer-scene-transition/shared/scene-flood-rescue-readiness-entry.js", "utf8");
const camp = readFileSync("experiments/peer-scene-transition/camp.html", "utf8");
const index = readFileSync("experiments/peer-scene-transition/index.html", "utf8");

assert.ok(entry.includes(cdn), "changed entry imports NexusEngine main CDN");
assert.ok(!entry.includes(oldRuntimeCdn), "changed entry does not import old NexusRealtime runtime CDN");
assert.ok(camp.includes("scene-flood-rescue-readiness-entry.js"), "camp route loads flood rescue entry");
assert.ok(index.includes("scene-flood-rescue-readiness-entry.js"), "index route loads flood rescue entry");
assert.ok(entry.includes("getSceneFloodRescueReadiness"), "entry exposes GameHost readiness accessor");
assert.ok(entry.includes("getSceneFloodRescueReadinessTree"), "entry exposes domain tree accessor");
assert.ok(entry.includes("renderer-consumes-descriptors-only"), "entry preserves descriptor-only contract marker");

const inputs = [
  { sceneId: "camp", input: { inventory: [], visited: ["camp"], pressure: 0.1 } },
  { sceneId: "crossroads", input: { inventory: ["has-lantern"], visited: ["camp", "crossroads"], pressure: 0.32 } },
  { sceneId: "forest", input: { inventory: ["has-lantern", "forest-lit"], visited: ["camp", "crossroads", "forest"], pressure: 0.52 } },
  { sceneId: "bridge", input: { inventory: ["bridge-repaired"], visited: ["camp", "bridge"], pressure: 0.62 } },
  { sceneId: "shrine", input: { inventory: ["has-lantern", "forest-lit", "bridge-repaired"], visited: ["camp", "crossroads", "forest", "bridge", "shrine"], pressure: 0.42 } },
  { sceneId: "ending", input: { inventory: ["has-lantern", "forest-lit", "bridge-repaired", "shrine-open"], visited: ["camp", "crossroads", "forest", "bridge", "shrine", "ending"], pressure: 0.18 } },
  { sceneId: "camp", input: { inventory: ["shrine-open"], visited: ["ending", "camp"], pressure: 0.76, log: ["Dawn roster copied"] } },
  { sceneId: "bridge", input: { inventory: [], visited: ["bridge"], progress: 0.05, pressure: 0.92 } },
  { sceneId: "forest", input: { inventory: ["has-lantern"], visited: ["forest", "crossroads"], pressureScore: 0.44 } },
  { sceneId: "crossroads", input: { inventory: ["has-lantern", "bridge-repaired", "forest-lit"], visited: ["camp", "crossroads", "forest", "bridge"], score: 0.24 } }
];

const domain = createSceneFloodRescueReadinessDomainKit();
for (const [index, item] of inputs.entries()) {
  const state = domain.describe(item.sceneId, item.input);
  assert.equal(state.rendererHandoff.contract, "renderer-consumes-descriptors-only", `case ${index} handoff contract`);
  assert.ok(state.rendererHandoff.counts.total >= 17, `case ${index} descriptors generated`);
  assert.ok(state.rendererHandoff.descriptors.evacueeTraces.every((trace) => trace.sceneId === item.sceneId), `case ${index} scene scoped traces`);
  assert.ok(["survivor-location", "crossing-stabilizing", "dawn-relief-ready"].includes(state.summary.phase), `case ${index} phase enum`);
  assert.doesNotThrow(() => JSON.stringify(state.rendererHandoff), `case ${index} serializable handoff`);
}

console.log(`peer scene flood rescue CDN/state/input smoke passed ${inputs.length} cases`);
