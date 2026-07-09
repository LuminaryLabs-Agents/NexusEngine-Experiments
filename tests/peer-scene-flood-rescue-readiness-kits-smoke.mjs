import assert from "node:assert/strict";
import {
  SCENE_FLOOD_RESCUE_READINESS_TREE,
  createSceneFloodRescueReadinessDomainKit,
  createSceneEvacueeTraceKit,
  createSceneFloodGaugeBandKit,
  createSceneCanoeMooringKit,
  createSceneRopeBridgeSpanKit,
  createSceneWarmBlanketCacheKit,
  createSceneDawnRosterLedgerKit
} from "../experiments/peer-scene-transition/shared/scene-flood-rescue-readiness-kits.js";

const cases = [
  { sceneId: "camp", inventory: [], visited: ["camp"], pressure: 0.1 },
  { sceneId: "crossroads", inventory: ["has-lantern"], visited: ["camp", "crossroads"], pressure: 0.28 },
  { sceneId: "forest", inventory: ["has-lantern", "forest-lit"], visited: ["camp", "crossroads", "forest"], pressure: 0.4 },
  { sceneId: "bridge", inventory: ["bridge-repaired"], visited: ["camp", "crossroads", "bridge"], pressure: 0.55 },
  { sceneId: "shrine", inventory: ["has-lantern", "forest-lit", "bridge-repaired"], visited: ["camp", "crossroads", "forest", "bridge", "shrine"], pressure: 0.66 },
  { sceneId: "ending", inventory: ["has-lantern", "forest-lit", "bridge-repaired", "shrine-open"], visited: ["camp", "crossroads", "forest", "bridge", "shrine", "ending"], pressure: 0.2 },
  { sceneId: "camp", inventory: ["shrine-open"], visited: ["camp", "ending"], pressure: 0.82, log: ["Flood surge at camp"] },
  { sceneId: "bridge", inventory: [], visited: ["bridge"], pressure: 0.9, progress: 0.12 },
  { sceneId: "forest", inventory: ["has-lantern"], visited: ["forest", "crossroads"], pressureScore: 0.48, actions: [{ label: "Tune lantern" }] },
  { sceneId: "crossroads", inventory: ["has-lantern", "bridge-repaired", "shrine-open"], visited: ["camp", "crossroads", "bridge", "shrine"], score: 0.35 }
];

const domain = createSceneFloodRescueReadinessDomainKit();
assert.equal(domain.id, "scene-flood-rescue-readiness-domain-kit");
assert.equal(SCENE_FLOOD_RESCUE_READINESS_TREE.tree["renderer-handoff"][0], "scene-flood-rescue-renderer-handoff-kit");
assert.ok(SCENE_FLOOD_RESCUE_READINESS_TREE.excludes.includes("renderer"));
assert.ok(SCENE_FLOOD_RESCUE_READINESS_TREE.excludes.includes("Three.js"));

const atomicKits = [
  createSceneEvacueeTraceKit(),
  createSceneFloodGaugeBandKit(),
  createSceneCanoeMooringKit(),
  createSceneRopeBridgeSpanKit(),
  createSceneWarmBlanketCacheKit(),
  createSceneDawnRosterLedgerKit()
];

for (const [index, input] of cases.entries()) {
  const described = domain.describe(input.sceneId, input);
  assert.equal(described.sceneId, input.sceneId, `case ${index} scene id`);
  assert.ok(described.summary.readiness >= 0 && described.summary.readiness <= 1, `case ${index} readiness bounded`);
  assert.ok(described.rendererHandoff.rendererConsumesDescriptorsOnly, `case ${index} descriptor-only handoff`);
  assert.equal(described.rendererHandoff.contract, "renderer-consumes-descriptors-only", `case ${index} contract`);
  assert.equal(described.rendererHandoff.counts.evacueeTraces, described.rendererHandoff.descriptors.evacueeTraces.length, `case ${index} trace count`);
  assert.equal(described.rendererHandoff.counts.floodGaugeBands, 3, `case ${index} gauge count`);
  assert.equal(described.rendererHandoff.counts.canoeMoorings, 2, `case ${index} canoe count`);
  assert.equal(described.rendererHandoff.counts.ropeBridgeSpans, 3, `case ${index} rope count`);
  assert.equal(described.rendererHandoff.counts.warmBlanketCaches, 2, `case ${index} cache count`);
  assert.equal(described.rendererHandoff.counts.dawnRosterLedgers, 4, `case ${index} roster count`);
  assert.ok(described.rendererHandoff.counts.total >= 17, `case ${index} descriptor total`);
  assert.doesNotThrow(() => JSON.stringify(described), `case ${index} serializable`);
  for (const kit of atomicKits) {
    const output = kit.describe(input);
    assert.ok(Array.isArray(output), `${kit.id} output array in case ${index}`);
    assert.ok(output.length > 0, `${kit.id} non-empty in case ${index}`);
    assert.ok(output.every((item) => item.kind && item.id), `${kit.id} ids/kinds in case ${index}`);
  }
}

const cold = domain.describe("camp", cases[0]).summary.readiness;
const ready = domain.describe("ending", cases[5]).summary.readiness;
assert.ok(ready > cold, "completed rescue route should have higher readiness than cold camp");

console.log(`peer scene flood rescue readiness kit smoke passed ${cases.length} cases`);
