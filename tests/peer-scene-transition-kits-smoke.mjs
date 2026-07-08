import assert from "node:assert/strict";
import {
  createSceneActionKit,
  createSceneInventoryKit,
  createSceneManifestKit,
  createScenePressureKit,
  createSceneStateKit,
  createSceneTransitionKit,
  createSceneVisualDescriptorKit,
  logSceneMessage
} from "../experiments/_kits/peer-scene-transition/peer-scene-transition-kits.js";

const manifest = {
  camp: { title: "Camp", copy: "Start", entry: "./camp.html", exits: { road: { to: "crossroads", label: "Road" } } },
  crossroads: { title: "Crossroads", copy: "Split", entry: "./crossroads.html", exits: { forest: { to: "forest", label: "Forest", requires: ["has-lantern"] }, bridge: { to: "bridge", label: "Bridge" } } },
  forest: { title: "Forest", copy: "Light", entry: "./forest.html", exits: { shrine: { to: "shrine", label: "Shrine", requires: ["forest-lit"] } } },
  bridge: { title: "Bridge", copy: "Repair", entry: "./bridge.html", exits: { shrine: { to: "shrine", label: "Shrine", requires: ["bridge-repaired"] } } },
  shrine: { title: "Shrine", copy: "Seal", entry: "./shrine.html", exits: { ending: { to: "ending", label: "Finish", requires: ["shrine-open"] } } },
  ending: { title: "Ending", copy: "Done", entry: "./ending.html", exits: {} }
};

const manifestKit = createSceneManifestKit(manifest);
const stateKit = createSceneStateKit({ initialSceneId: "camp" });
const inventoryKit = createSceneInventoryKit();
const actionKit = createSceneActionKit({ inventoryKit });
const transitionKit = createSceneTransitionKit({ inventoryKit, manifestKit });
const visualKit = createSceneVisualDescriptorKit({ manifestKit });
const pressureKit = createScenePressureKit();

function makeState(sceneId = "camp") {
  return stateKit.normalize(null, sceneId);
}

function assertAction(sceneId, state, actionId, expected) {
  const action = actionKit.list(sceneId, state).find((entry) => entry.id === actionId);
  assert.ok(action, `${actionId} exists`);
  for (const [key, value] of Object.entries(expected)) assert.deepEqual(action[key], value, `${actionId}.${key}`);
  return action;
}

// Scene manifest kit: 10 intake checks.
assert.equal(manifestKit.id, "n-peer-scene-manifest-kit");
assert.equal(manifestKit.domain, "scene-manifest");
assert.equal(manifestKit.list().length, 6);
assert.deepEqual(manifestKit.ids(), ["camp", "crossroads", "forest", "bridge", "shrine", "ending"]);
assert.equal(manifestKit.get("camp").title, "Camp");
assert.equal(manifestKit.get("missing"), null);
assert.equal(manifestKit.get("camp").kind, "web-html-scene");
assert.equal(manifestKit.get("forest").mood, "blue-lantern");
assert.equal(manifestKit.get("bridge").palette.length, 3);
assert.deepEqual(manifestKit.snapshot(), { sceneCount: 6, sceneIds: ["camp", "crossroads", "forest", "bridge", "shrine", "ending"] });

// Scene state kit: 10 intake checks.
const state = makeState();
assert.equal(state.currentSceneId, "camp");
assert.equal(state.previousSceneId, null);
assert.deepEqual(state.visitedSceneIds, ["camp"]);
assert.deepEqual(state.inventory, []);
assert.deepEqual(state.tokens, []);
assert.deepEqual(state.flags, {});
assert.deepEqual(state.transitionLedger, []);
assert.deepEqual(state.blockedLedger, []);
assert.deepEqual(state.actionLedger, []);
assert.equal(stateKit.snapshot(state).currentScene, "camp");

// Inventory kit: 10 intake checks.
assert.equal(inventoryKit.has(state, "has-lantern"), false);
assert.deepEqual(inventoryKit.missing(state, ["has-lantern", "has-rope"]), ["has-lantern", "has-rope"]);
inventoryKit.give(state, "has-lantern", "Lantern");
assert.equal(inventoryKit.has(state, "has-lantern"), true);
assert.deepEqual(inventoryKit.missing(state, ["has-lantern", "has-rope"]), ["has-rope"]);
inventoryKit.give(state, "has-lantern", "Lantern");
assert.deepEqual(state.tokens, ["has-lantern"]);
assert.deepEqual(state.inventory, ["Lantern"]);
inventoryKit.flag(state, "forestMoths");
assert.equal(inventoryKit.has(state, "forestMoths"), true);
assert.deepEqual(inventoryKit.snapshot(state).flags, { forestMoths: true });
assert.deepEqual(inventoryKit.snapshot(state).inventory, ["Lantern"]);

// Action kit: 10 intake checks.
const campActions = actionKit.list("camp", state);
assert.equal(campActions.length, 3);
assertAction("camp", state, "take-lantern", { done: true, blocked: false, missing: [] });
assertAction("camp", state, "pack-rope", { done: false, blocked: false, missing: [] });
const ropeAction = assertAction("camp", state, "pack-rope", { done: false });
assert.equal(actionKit.apply(state, ropeAction).changed, true);
assert.equal(inventoryKit.has(state, "has-rope"), true);
const forestState = stateKit.normalize({ ...state, currentSceneId: "forest" }, "forest");
assertAction("forest", forestState, "tune-lantern", { blocked: false, missing: [] });
const rootActionBefore = assertAction("forest", makeState("forest"), "open-root-arch", { blocked: true, missing: ["lanternTuned"] });
assert.equal(actionKit.apply(makeState("forest"), rootActionBefore).reason, "blocked");
assert.equal(actionKit.snapshot("camp", state).actions.length, 3);

// Transition kit: 10 intake checks.
const transitionState = makeState("crossroads");
assert.deepEqual(transitionKit.resolve(transitionState, "forest").missing, ["has-lantern"]);
assert.equal(transitionKit.resolve(transitionState, "forest").accepted, false);
assert.equal(transitionKit.resolve(transitionState, "missing").reason, "missing-exit");
inventoryKit.give(transitionState, "has-lantern", "Lantern");
const accepted = transitionKit.resolve(transitionState, "forest");
assert.equal(accepted.accepted, true);
assert.equal(accepted.from, "crossroads");
assert.equal(accepted.to, "forest");
transitionKit.apply(transitionState, accepted);
assert.equal(transitionState.currentSceneId, "forest");
assert.deepEqual(transitionState.visitedSceneIds, ["crossroads", "forest"]);
assert.equal(transitionKit.targetEntry("ending"), "./final.html");
assert.deepEqual(transitionKit.snapshot(transitionState), { currentSceneId: "forest", accepted: 1, blocked: 0 });

// Visual descriptor kit: 10 intake checks.
const visualState = makeState("camp");
const campDescriptor = visualKit.describe("camp", visualState);
assert.equal(campDescriptor.sceneId, "camp");
assert.equal(campDescriptor.title, "Camp");
assert.equal(campDescriptor.mood, "warm-campfire");
assert.equal(campDescriptor.palette.length, 3);
assert.equal(campDescriptor.landmarks.length, 3);
assert.equal(campDescriptor.stageLayers.length, 3);
assert.equal(campDescriptor.completion, 0);
inventoryKit.give(visualState, "has-lantern", "Lantern");
assert.equal(visualKit.describe("camp", visualState).completion, 20);
assert.equal(visualKit.snapshot("camp", visualState).layers, 3);
assert.equal(visualKit.describe("unknown", visualState).landmarks.length, 1);

// Pressure kit and log helper: 10 intake checks.
const pressureState = makeState("shrine");
assert.deepEqual(pressureKit.evaluate(pressureState), { score: 6, routeComplexity: 0, solvedScenes: 0 });
inventoryKit.give(pressureState, "forest-lit", "Forest path lit");
assert.equal(pressureKit.evaluate(pressureState).solvedScenes, 1);
inventoryKit.give(pressureState, "bridge-repaired", "Bridge repaired");
assert.equal(pressureKit.evaluate(pressureState).solvedScenes, 2);
inventoryKit.give(pressureState, "shrine-open", "Shrine seal open");
assert.equal(pressureKit.evaluate(pressureState).solvedScenes, 3);
pressureState.transitionLedger.push({ from: "camp", to: "crossroads" });
assert.equal(pressureKit.evaluate(pressureState).routeComplexity, 1);
pressureState.blockedLedger.push({ reason: "requirements" });
assert.equal(pressureKit.evaluate(pressureState).routeComplexity, 2);
pressureState.actionLedger.push({ actionId: "align-seal" });
assert.equal(pressureKit.evaluate(pressureState).routeComplexity, 3);
assert.ok(pressureKit.evaluate(pressureState).score <= 100);
logSceneMessage(pressureState, "validation log");
assert.equal(pressureState.log[0], "validation log");

console.log("peer scene transition kit smoke passed");
