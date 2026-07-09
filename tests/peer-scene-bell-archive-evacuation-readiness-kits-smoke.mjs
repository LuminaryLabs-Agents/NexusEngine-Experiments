import assert from "node:assert/strict";
import { createSceneBellArchiveEvacuationReadinessDomainKit, SCENE_BELL_ARCHIVE_EVACUATION_DOMAIN } from "../experiments/_kits/peer-scene-transition/peer-scene-bell-archive-evacuation-kits.js";

const kit = createSceneBellArchiveEvacuationReadinessDomainKit();
const cases = [
  { sceneId: "camp", visited: ["camp"], inventory: [], pressure: 12 },
  { sceneId: "crossroads", visited: ["camp", "crossroads"], inventory: ["map clue"], pressure: 18 },
  { sceneId: "forest", visited: ["camp", "crossroads", "forest"], inventory: ["rope", "witness note"], pressure: 38 },
  { sceneId: "bridge", visited: ["camp", "crossroads", "forest", "bridge"], inventory: ["rope", "evidence map", "oracle seal"], pressure: 22 },
  { activeScene: "forest", visitedScenes: ["forest"], items: ["bridge plank"], pressureScore: 74 },
  { currentScene: "bridge", scenesVisited: ["camp", "bridge"], completedActions: ["witness roster signed"], floodPressure: 61 },
  { sceneId: "crossroads", visited: ["camp", "crossroads"], inventory: ["family guide token", "evidence"], pressure: 91 },
  { sceneId: "camp", visited: ["camp", "forest"], log: ["keeper found a clue"], pressure: 0 },
  { sceneId: "unknown", visited: [], inventory: ["rope", "map", "witness"], pressure: -10 },
  { sceneId: "bridge", visited: ["camp", "crossroads", "forest", "bridge"], inventory: ["rope", "map clue", "witness", "oracle", "plank"], pressure: 4 }
];

let previousReadiness = -1;
for (const [index, input] of cases.entries()) {
  const output = kit.describe(input);
  assert.equal(output.domainId, SCENE_BELL_ARCHIVE_EVACUATION_DOMAIN.id, `case ${index} domain id`);
  assert.ok(output.tree.includes("renderer consumes descriptors only"), `case ${index} tree handoff`);
  assert.ok(output.readiness >= 0 && output.readiness <= 100, `case ${index} readiness bounds`);
  assert.ok(output.floodPressure >= 0 && output.floodPressure <= 100, `case ${index} flood pressure bounds`);
  assert.ok(["unprepared", "archive-warning-open", "evacuation-chain-staged", "ready-for-dawn-handoff"].includes(output.phase), `case ${index} phase enum`);
  assert.equal(output.descriptors.bellTowerAnchors.length, 4, `case ${index} bell anchors`);
  assert.equal(output.descriptors.signalCordThreads.length, 3, `case ${index} signal cords`);
  assert.equal(output.descriptors.archiveCrates.length, 4, `case ${index} archive crates`);
  assert.equal(output.descriptors.floodPlankCrossings.length, 3, `case ${index} plank crossings`);
  assert.equal(output.descriptors.witnessRosterSeals.length, 4, `case ${index} witness rosters`);
  assert.equal(output.descriptors.dawnEvidenceLedgers.length, 1, `case ${index} dawn ledger`);
  assert.equal(output.rendererHandoff.policy, "renderer-consumes-descriptors-only", `case ${index} handoff policy`);
  assert.deepEqual(output.rendererHandoff.ownership.exclusions, SCENE_BELL_ARCHIVE_EVACUATION_DOMAIN.excludes, `case ${index} ownership exclusions`);
  assert.doesNotThrow(() => JSON.stringify(output), `case ${index} JSON safe`);
  if (index === cases.length - 1) assert.ok(output.readiness >= previousReadiness, "prepared case should not regress from previous case");
  previousReadiness = output.readiness;
}

const cold = kit.describe(cases[0]);
const prepared = kit.describe(cases.at(-1));
assert.ok(prepared.readiness > cold.readiness, "prepared state improves readiness");
assert.ok(prepared.floodPressure <= cold.floodPressure || prepared.readiness >= 80, "prepared state reduces pressure or reaches handoff readiness");

console.log("Peer scene bell archive evacuation readiness kits smoke passed 10 intake cases.");
