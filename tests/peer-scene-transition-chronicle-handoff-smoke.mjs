import assert from "node:assert/strict";
import {
  createSceneActionKit,
  createSceneInventoryKit,
  createSceneManifestKit,
  createScenePressureKit,
  createSceneStateKit
} from "../experiments/_kits/peer-scene-transition/peer-scene-transition-kits.js";
import {
  createSceneChronicleDomainKit,
  createSceneChronicleRendererHandoffKit,
  createSceneChoiceReadabilityKit,
  createSceneClueThreadKit,
  createSceneContinuitySpliceKit,
  createSceneInventoryConstellationKit,
  createSceneObjectiveBeatKit,
  createScenePressureWeatherKit
} from "../experiments/_kits/peer-scene-transition/peer-scene-chronicle-handoff-kits.js";

const manifest = {
  camp: { title: "Camp", copy: "Start", entry: "./camp.html", exits: { road: { to: "crossroads", label: "Road" } }, palette: ["#28170d", "#f3a75d", "#ffe0aa"], landmarks: ["ember", "crates", "road"] },
  crossroads: { title: "Crossroads", copy: "Split", entry: "./crossroads.html", exits: { forest: { to: "forest", label: "Forest", requires: ["has-lantern"] }, bridge: { to: "bridge", label: "Bridge" } }, palette: ["#151a25", "#8f9db8", "#f4d490"], landmarks: ["stones", "path", "sign"] },
  forest: { title: "Forest", copy: "Light", entry: "./forest.html", exits: { shrine: { to: "shrine", label: "Shrine", requires: ["forest-lit"] } }, palette: ["#06141b", "#42d6ff", "#8cffd2"], landmarks: ["moths", "root", "glass"] },
  bridge: { title: "Bridge", copy: "Repair", entry: "./bridge.html", exits: { shrine: { to: "shrine", label: "Shrine", requires: ["bridge-repaired"] } }, palette: ["#111827", "#7fb0d8", "#d5b37a"], landmarks: ["river", "plank", "post"] },
  shrine: { title: "Shrine", copy: "Seal", entry: "./shrine.html", exits: { ending: { to: "ending", label: "Finish", requires: ["shrine-open"] } }, palette: ["#170f24", "#e9c76f", "#fff0b7"], landmarks: ["altar", "ledger", "door"] },
  ending: { title: "Ending", copy: "Done", entry: "./ending.html", exits: {}, palette: ["#0f1c28", "#ffcf8a", "#f8fbff"], landmarks: ["dawn", "stars", "road"] }
};

const manifestKit = createSceneManifestKit(manifest);
const stateKit = createSceneStateKit({ initialSceneId: "camp" });
const inventoryKit = createSceneInventoryKit();
const actionKit = createSceneActionKit({ inventoryKit });
const pressureKit = createScenePressureKit();

function makeState(sceneId = "camp", mutate = () => {}) {
  const state = stateKit.normalize(null, sceneId);
  mutate(state);
  pressureKit.evaluate(state);
  return state;
}

const intakeCases = [
  ["camp", (state) => state.log.unshift("fresh camp")],
  ["camp", (state) => inventoryKit.give(state, "has-lantern", "Lantern")],
  ["crossroads", (state) => state.blockedLedger.push({ from: "crossroads", to: "forest", label: "Forest", missing: ["has-lantern"] })],
  ["crossroads", (state) => inventoryKit.give(state, "has-lantern", "Lantern")],
  ["forest", (state) => { inventoryKit.give(state, "has-lantern", "Lantern"); inventoryKit.flag(state, "forestMoths"); }],
  ["forest", (state) => { inventoryKit.give(state, "forest-lit", "Forest path lit"); state.transitionLedger.push({ from: "crossroads", to: "forest", exitId: "forest" }); }],
  ["bridge", (state) => { inventoryKit.give(state, "has-rope", "Bridge rope"); inventoryKit.flag(state, "bridgeRopeAnchored"); }],
  ["bridge", (state) => { inventoryKit.give(state, "bridge-repaired", "Bridge repaired"); state.transitionLedger.push({ from: "crossroads", to: "bridge", exitId: "bridge" }); }],
  ["shrine", (state) => { inventoryKit.give(state, "has-lantern", "Lantern"); inventoryKit.give(state, "forest-lit", "Forest path lit"); inventoryKit.give(state, "bridge-repaired", "Bridge repaired"); }],
  ["ending", (state) => { inventoryKit.give(state, "shrine-open", "Shrine seal open"); state.visitedSceneIds.push("camp", "crossroads", "forest", "bridge", "shrine", "ending"); }]
];

function assertRendererNeutral(value) {
  const text = JSON.stringify(value).toLowerCase();
  assert.ok(!text.includes("document"), "descriptor must not own document");
  assert.ok(!text.includes("three"), "descriptor must not own Three.js");
  assert.ok(!text.includes("webgl"), "descriptor must not own WebGL");
  assert.ok(!text.includes("audio"), "descriptor must not own audio");
  assert.ok(!text.includes("requestanimationframe"), "descriptor must not own frame timing");
}

const objectiveBeatKit = createSceneObjectiveBeatKit({ manifestKit });
assert.equal(objectiveBeatKit.id, "n-peer-scene-objective-beat-kit");
for (const [sceneId, mutate] of intakeCases) {
  const beats = objectiveBeatKit.describe(sceneId, makeState(sceneId, mutate));
  assert.equal(beats.length, 5);
  assert.ok(beats.every((beat) => typeof beat.token === "string" && Number.isFinite(beat.readiness)));
  assert.ok(beats.every((beat) => beat.readiness >= 0 && beat.readiness <= 1));
  assertRendererNeutral(beats);
}
assert.equal(objectiveBeatKit.snapshot("camp", makeState("camp")).beats, 5);

const clueThreadKit = createSceneClueThreadKit({ manifestKit, inventoryKit });
assert.equal(clueThreadKit.id, "n-peer-scene-clue-thread-kit");
for (const [sceneId, mutate] of intakeCases) {
  const threads = clueThreadKit.describe(sceneId, makeState(sceneId, mutate));
  assert.ok(threads.length >= 1);
  assert.ok(threads.every((thread) => typeof thread.label === "string" && Number.isFinite(thread.pressure)));
  assert.ok(threads.every((thread) => thread.pressure >= 0.12 && thread.pressure <= 0.94));
  assertRendererNeutral(threads);
}
assert.equal(clueThreadKit.snapshot("crossroads", makeState("crossroads")).sealed, 1);

const inventoryConstellationKit = createSceneInventoryConstellationKit();
assert.equal(inventoryConstellationKit.id, "n-peer-scene-inventory-constellation-kit");
for (const [sceneId, mutate] of intakeCases) {
  const constellation = inventoryConstellationKit.describe(sceneId, makeState(sceneId, mutate));
  assert.ok(constellation.stars.length >= 1);
  assert.ok(constellation.stars.every((star) => Number.isFinite(star.x) && Number.isFinite(star.y)));
  assertRendererNeutral(constellation);
}
assert.equal(inventoryConstellationKit.snapshot("camp", makeState("camp")).stars, 1);

const pressureWeatherKit = createScenePressureWeatherKit();
assert.equal(pressureWeatherKit.id, "n-peer-scene-pressure-weather-kit");
for (const [sceneId, mutate] of intakeCases) {
  const weather = pressureWeatherKit.describe(sceneId, makeState(sceneId, mutate));
  assert.equal(weather.length, 5);
  assert.ok(weather.every((front) => ["clear", "charged", "storm"].includes(front.severity)));
  assert.ok(weather.every((front) => front.opacity >= 0.12 && front.opacity <= 0.78));
  assertRendererNeutral(weather);
}
assert.equal(pressureWeatherKit.snapshot("camp", makeState("camp")).fronts, 5);

const continuitySpliceKit = createSceneContinuitySpliceKit();
assert.equal(continuitySpliceKit.id, "n-peer-scene-continuity-splice-kit");
for (const [sceneId, mutate] of intakeCases) {
  const splices = continuitySpliceKit.describe(sceneId, makeState(sceneId, mutate));
  assert.ok(splices.length >= 1);
  assert.ok(splices.every((splice) => typeof splice.visitedSceneId === "string"));
  assert.ok(splices.some((splice) => splice.current));
  assertRendererNeutral(splices);
}
assert.equal(continuitySpliceKit.snapshot("forest", makeState("forest")).current, 1);

const choiceReadabilityKit = createSceneChoiceReadabilityKit({ actionKit });
assert.equal(choiceReadabilityKit.id, "n-peer-scene-choice-readability-kit");
for (const [sceneId, mutate] of intakeCases) {
  const choices = choiceReadabilityKit.describe(sceneId, makeState(sceneId, mutate));
  assert.ok(choices.length >= 1);
  assert.ok(choices.every((choice) => ["resolved", "locked", "available"].includes(choice.state)));
  assert.ok(choices.every((choice) => Number.isFinite(choice.pulse)));
  assertRendererNeutral(choices);
}
assert.equal(choiceReadabilityKit.snapshot("camp", makeState("camp")).choices, 3);

const rendererHandoffKit = createSceneChronicleRendererHandoffKit();
assert.equal(rendererHandoffKit.id, "n-peer-scene-chronicle-renderer-handoff-kit");
for (const [sceneId, mutate] of intakeCases) {
  const state = makeState(sceneId, mutate);
  const handoff = rendererHandoffKit.describe({
    sceneId,
    objectiveBeats: objectiveBeatKit.describe(sceneId, state),
    clueThreads: clueThreadKit.describe(sceneId, state),
    inventoryConstellation: inventoryConstellationKit.describe(sceneId, state),
    pressureWeather: pressureWeatherKit.describe(sceneId, state),
    continuitySplices: continuitySpliceKit.describe(sceneId, state),
    choiceReadability: choiceReadabilityKit.describe(sceneId, state),
    baseDescriptorId: "base"
  });
  assert.equal(handoff.sceneId, sceneId);
  assert.equal(handoff.baseDescriptorId, "base");
  assert.ok(handoff.rendererMustNotOwn.includes("descriptor synthesis"));
  assert.ok(handoff.counts.objectiveBeats >= 5);
  assertRendererNeutral(handoff);
}

const chronicleDomainKit = createSceneChronicleDomainKit({ manifestKit, inventoryKit, actionKit });
assert.equal(chronicleDomainKit.id, "n-peer-scene-chronicle-domain-kit");
for (const [sceneId, mutate] of intakeCases) {
  const state = makeState(sceneId, mutate);
  const chronicle = chronicleDomainKit.describe(sceneId, state, { baseHandoff: { id: "base-renderer-descriptor" } });
  assert.equal(chronicle.sceneId, sceneId);
  assert.equal(Object.keys(chronicleDomainKit.kits).length, 7);
  assert.equal(chronicle.counts.objectiveBeats, 5);
  assert.ok(chronicle.counts.clueThreads >= 1);
  assert.ok(chronicle.counts.inventoryStars >= 1);
  assert.equal(chronicle.counts.pressureWeather, 5);
  assert.ok(chronicle.counts.continuitySplices >= 1);
  assert.ok(chronicle.counts.choiceReadability >= 1);
  assertRendererNeutral(chronicle);
}
assert.equal(chronicleDomainKit.snapshot("camp", makeState("camp")).kitCount, 7);

console.log("peer scene transition chronicle handoff smoke passed: 80 intake cases");
