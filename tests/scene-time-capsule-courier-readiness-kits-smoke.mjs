import assert from "node:assert/strict";
import {
  SCENE_TIME_CAPSULE_COURIER_READINESS_TREE,
  createSceneArchiveSatchelKit,
  createSceneGateSealKit,
  createSceneKeepsakeTagKit,
  createSceneLanternCourierThreadKit,
  createSceneOathLedgerKit,
  createSceneTimeCapsuleCourierReadinessDomainKit,
  createSceneTimeCapsuleThresholdKit
} from "../experiments/peer-scene-transition/shared/scene-time-capsule-courier-readiness-kits.js";

const cases = [
  { sceneId: "camp", inventory: [], visited: ["camp"], log: [], progress: 0.05, pressure: 0.12 },
  { sceneId: "camp", inventory: ["has-lantern"], visited: ["camp"], log: ["lit fire"], progress: 0.18, pressure: 0.28 },
  { sceneId: "crossroads", inventory: ["has-lantern", "camp-photo"], visited: ["camp", "crossroads"], log: ["opened trail"], progress: 0.32, pressure: 0.38 },
  { sceneId: "forest", inventory: ["has-lantern", "camp-photo", "map-scrap"], visited: ["camp", "crossroads", "forest"], log: ["heard witness", "marked tree"], progress: 0.47, pressure: 0.44 },
  { sceneId: "bridge", inventory: ["has-lantern", "camp-photo", "map-scrap", "river-note"], visited: ["camp", "crossroads", "forest", "bridge"], log: ["tied rope"], progress: 0.58, pressure: 0.62 },
  { sceneId: "shrine", inventory: ["has-lantern", "camp-photo", "map-scrap", "river-note", "shrine-key"], visited: ["camp", "crossroads", "forest", "bridge", "shrine"], log: ["sealed oath"], progress: 0.74, pressure: 0.26 },
  { sceneId: "ending", inventory: ["has-lantern", "camp-photo", "map-scrap", "river-note", "shrine-key", "archive-seal"], visited: ["camp", "crossroads", "forest", "bridge", "shrine", "ending"], log: ["sealed capsule"], progress: 0.94, pressure: 0.14 },
  { sceneId: "forest", inventory: [], visited: ["forest"], log: Array.from({ length: 8 }, (_, i) => `panic-${i}`), progress: 0.2, pressure: 0.9 },
  { sceneId: "bridge", inventory: ["river-note"], visited: ["camp", "bridge"], actions: [{ id: "cross" }], progress: 0.41, pressure: 0.72 },
  { sceneId: "crossroads", inventory: ["has-lantern", "archive-seal", "witness-oath"], visited: ["camp", "crossroads", "forest"], log: ["witness trusted", "satchel packed"], progress: 0.66, pressure: 0.2 }
];

assert.equal(SCENE_TIME_CAPSULE_COURIER_READINESS_TREE.id, "scene-time-capsule-courier-readiness-domain");
const domain = createSceneTimeCapsuleCourierReadinessDomainKit();
const atomicKits = [
  createSceneKeepsakeTagKit(),
  createSceneArchiveSatchelKit(),
  createSceneLanternCourierThreadKit(),
  createSceneGateSealKit(),
  createSceneOathLedgerKit(),
  createSceneTimeCapsuleThresholdKit()
];

let lowReadiness = null;
let highReadiness = null;
for (const [index, input] of cases.entries()) {
  for (const kit of atomicKits) {
    const output = kit.describe(input);
    assert.ok(Array.isArray(output), `${kit.id} case ${index} returns array`);
    assert.ok(output.length > 0, `${kit.id} case ${index} emits descriptors`);
    assert.doesNotThrow(() => JSON.stringify(output), `${kit.id} case ${index} serializes`);
    assert.ok(output.every((item) => item.rendererContract?.kitMustNotOwn?.includes("DOM")), `${kit.id} case ${index} keeps DOM out of kit`);
  }
  const described = domain.describe(input.sceneId, input);
  assert.equal(described.rendererHandoff.rendererConsumesDescriptorsOnly, true);
  assert.equal(described.rendererHandoff.sourceBoundary, "scene-time-capsule-courier-readiness-domain");
  assert.ok(described.rendererHandoff.counts.total >= 20, `case ${index} descriptor total`);
  assert.ok(described.summary.readiness >= 0 && described.summary.readiness <= 1, `case ${index} readiness bounded`);
  assert.ok(["memory-gathering", "courier-threading", "seal-ready"].includes(described.summary.phase), `case ${index} phase enum`);
  assert.doesNotThrow(() => JSON.stringify(described), `case ${index} full output serializes`);
  if (index === 0) lowReadiness = described.summary.readiness;
  if (index === 6) highReadiness = described.summary.readiness;
}

assert.ok(highReadiness > lowReadiness, "complete story state improves courier readiness");
console.log("Peer Scene Transition time capsule courier readiness kits smoke passed 10 intake cases.");
