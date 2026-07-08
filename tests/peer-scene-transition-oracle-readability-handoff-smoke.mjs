import assert from "node:assert/strict";
import {
  PEER_SCENE_ORACLE_READABILITY_DOMAIN_TREE,
  createSceneOracleReadabilityDomainKit
} from "../experiments/_kits/peer-scene-transition/peer-scene-oracle-readability-handoff-kits.js";

const scenes = {
  camp: { id: "camp", title: "Ash Road Camp", exits: { road: { to: "crossroads", label: "Walk to the crossroads" } } },
  crossroads: { id: "crossroads", title: "The Crossroads", exits: { forest: { to: "forest", label: "Enter forest", requires: ["has-lantern"] }, bridge: { to: "bridge", label: "Take bridge" } } },
  forest: { id: "forest", title: "Lantern Forest", exits: { shrine: { to: "shrine", label: "Follow root path", requires: ["forest-lit"] }, back: { to: "crossroads", label: "Back" } } },
  bridge: { id: "bridge", title: "Old Bridge", exits: { shrine: { to: "shrine", label: "Cross", requires: ["bridge-repaired"] }, back: { to: "crossroads", label: "Back" } } },
  shrine: { id: "shrine", title: "Silent Shrine", exits: { ending: { to: "ending", label: "Finish", requires: ["shrine-open"] }, camp: { to: "camp", label: "Loop" } } },
  ending: { id: "ending", title: "Dawn Ending", exits: { camp: { to: "camp", label: "Restart" } } }
};

const manifestKit = {
  get(id) {
    return scenes[id] ?? null;
  },
  list() {
    return Object.values(scenes);
  }
};

const inventoryKit = {
  missing(state, required = []) {
    return required.filter((token) => !state.inventory?.includes(token) && !state.tokens?.includes(token) && !state.flags?.[token]);
  }
};

const domain = createSceneOracleReadabilityDomainKit({ manifestKit, inventoryKit });

const cases = [
  { sceneId: "camp", state: { inventory: [], tokens: [], flags: {}, visitedSceneIds: ["camp"], log: [], pressure: { score: 4 } } },
  { sceneId: "crossroads", state: { inventory: ["has-lantern"], tokens: [], flags: {}, visitedSceneIds: ["camp", "crossroads"], log: ["found lantern"], pressure: { score: 18 } } },
  { sceneId: "forest", state: { inventory: ["has-lantern"], tokens: ["forest-lit"], flags: {}, visitedSceneIds: ["camp", "crossroads", "forest"], log: ["forest-lit"], pressure: { score: 24 } } },
  { sceneId: "bridge", state: { inventory: ["has-rope"], tokens: [], flags: { "bridge-repaired": true }, visitedSceneIds: ["camp", "crossroads", "bridge"], log: ["bridge repaired"], pressure: { score: 32 } } },
  { sceneId: "shrine", state: { inventory: ["has-lantern", "has-rope"], tokens: ["forest-lit", "bridge-repaired"], flags: {}, visitedSceneIds: ["camp", "crossroads", "forest", "bridge", "shrine"], log: ["at shrine"], pressure: { score: 46 } } },
  { sceneId: "shrine", state: { inventory: ["has-lantern", "has-rope"], tokens: ["forest-lit", "bridge-repaired", "shrine-open"], flags: {}, visitedSceneIds: ["camp", "crossroads", "forest", "bridge", "shrine"], log: ["shrine-open"], pressure: { score: 12 } } },
  { sceneId: "ending", state: { inventory: ["has-lantern", "has-rope"], tokens: ["forest-lit", "bridge-repaired", "shrine-open"], flags: {}, visitedSceneIds: ["camp", "crossroads", "forest", "bridge", "shrine", "ending"], log: ["ending"], pressure: { score: 0 } } },
  { sceneId: "crossroads", state: { inventory: [], tokens: [], flags: {}, visitedSceneIds: ["camp", "crossroads"], log: ["blocked forest"], blockedLedger: ["forest"], actionLedger: ["look"], transitionLedger: ["camp-crossroads"] } },
  { sceneId: "forest", state: { inventory: ["has-lantern"], tokens: [], flags: {}, visitedSceneIds: ["camp", "crossroads", "forest"], log: ["need forest-lit"], blockedLedger: ["shrine"], pressure: { score: 74 } } },
  { sceneId: "bridge", state: { inventory: ["has-rope"], tokens: [], flags: {}, visitedSceneIds: ["camp", "crossroads", "bridge"], log: ["need bridge-repaired"], blockedLedger: ["shrine"], pressure: { score: 88 } } }
];

for (const [index, testCase] of cases.entries()) {
  const handoff = domain.describe(testCase.sceneId, testCase.state);
  assert.equal(handoff.domainTree.root, PEER_SCENE_ORACLE_READABILITY_DOMAIN_TREE.root, `case ${index} should expose tree root`);
  assert.equal(handoff.descriptors.objectiveForecastThreads.length, handoff.counts.objectiveForecastThreads, `case ${index} should count objective forecasts`);
  assert.equal(handoff.descriptors.pressureClockRings.length, 4, `case ${index} should emit four pressure rings`);
  assert.ok(handoff.descriptors.resourceRouteMaps.length >= 1, `case ${index} should emit resource route maps`);
  assert.ok(handoff.descriptors.memoryBranchEchoes.length >= 1, `case ${index} should emit memory branch echoes`);
  assert.ok(handoff.descriptors.puzzleDebtStacks.length >= 1, `case ${index} should emit puzzle debt stacks`);
  assert.equal(handoff.descriptors.endingReadinessCrowns.length, 1, `case ${index} should emit one ending crown`);
  assert.ok(handoff.descriptors.objectiveForecastThreads.every((thread) => thread.rendererBoundary.rendererMustNotOwn.includes("future forecasting")), `case ${index} should keep forecasting out of renderer`);
  assert.doesNotThrow(() => JSON.stringify(handoff), `case ${index} should be serializable`);
}

const snapshot = domain.snapshot("shrine", cases[5].state);
assert.equal(snapshot.kitCount, 7, "domain should contain six atomic kits plus handoff kit");
assert.equal(snapshot.ending.complete, true, "complete route should crown the ending");
assert.ok(snapshot.pressureClock.rings === 4, "snapshot should expose pressure clocks");

console.log("peer scene oracle readability kit smoke passed");
