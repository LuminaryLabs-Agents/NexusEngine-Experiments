import assert from "node:assert/strict";
import {
  createSceneActionKit,
  createSceneInventoryKit,
  createSceneManifestKit,
  createSceneStateKit
} from "../experiments/_kits/peer-scene-transition/peer-scene-transition-kits.js";
import {
  createSceneAtmosphericHandoffKit,
  createSceneDepthFogBandKit,
  createSceneLightRayKit,
  createSceneMemoryEchoKit,
  createScenePathTensionKit,
  createSceneRelicFocusKit
} from "../experiments/_kits/peer-scene-transition/peer-scene-atmospheric-handoff-kits.js";

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

function makeState(sceneId = "camp") {
  return stateKit.normalize(null, sceneId);
}

function assertRendererNeutral(descriptor) {
  const text = JSON.stringify(descriptor).toLowerCase();
  assert.ok(!text.includes("document"), "descriptor must not own DOM/document");
  assert.ok(!text.includes("three"), "descriptor must not own Three.js");
  assert.ok(!text.includes("webgl"), "descriptor must not own WebGL");
  assert.ok(!text.includes("audio"), "descriptor must not own audio");
  assert.ok(!text.includes("material"), "descriptor must not own renderer material construction");
}

// Depth fog band kit: 10 smoke-test intake cases.
const depthFogBandKit = createSceneDepthFogBandKit({ manifestKit });
const fogState = makeState("forest");
let fogBands = depthFogBandKit.describe("forest", fogState);
assert.equal(depthFogBandKit.id, "n-peer-scene-depth-fog-band-kit");
assert.equal(depthFogBandKit.domain, "scene-depth-atmosphere/depth-fog-bands");
assert.equal(fogBands.length, 6);
assert.equal(fogBands[0].id, "forest-depth-fog-0");
assert.equal(fogBands[5].depth, 6);
assert.ok(fogBands.every((band) => Number.isFinite(band.x) && Number.isFinite(band.y)));
assert.ok(fogBands.every((band) => band.opacity >= 0.1 && band.opacity <= 0.62));
assert.ok(fogBands.every((band) => typeof band.color === "string"));
inventoryKit.give(fogState, "has-lantern", "Lantern");
assert.equal(depthFogBandKit.describe("forest", fogState)[0].completionBias, 20);
assert.deepEqual(depthFogBandKit.snapshot("forest", fogState), { sceneId: "forest", bands: 6, maxDepth: 6, phase: "opening" });
assertRendererNeutral(fogBands);

// Light ray kit: 10 smoke-test intake cases.
const lightRayKit = createSceneLightRayKit({ manifestKit });
const rayState = makeState("shrine");
let lightRays = lightRayKit.describe("shrine", rayState);
assert.equal(lightRayKit.id, "n-peer-scene-light-ray-kit");
assert.equal(lightRayKit.domain, "scene-depth-atmosphere/light-rays");
assert.equal(lightRays.length, 5);
assert.equal(lightRays[0].id, "shrine-light-ray-0");
assert.equal(typeof lightRays[0].landmark, "string");
assert.ok(Number.isFinite(lightRays[0].angle));
assert.ok(lightRays[0].length >= 120);
assert.ok(lightRays.every((ray) => ray.intensity >= 0.12 && ray.intensity <= 0.85));
inventoryKit.give(rayState, "shrine-open", "Shrine seal open");
assert.ok(lightRayKit.describe("shrine", rayState)[0].intensity > lightRays[0].intensity);
assert.equal(lightRayKit.snapshot("shrine", rayState).rays, 5);
assertRendererNeutral(lightRays);

// Relic focus kit: 10 smoke-test intake cases.
const relicFocusKit = createSceneRelicFocusKit({ actionKit });
const relicState = makeState("forest");
let relicFocus = relicFocusKit.describe("forest", relicState);
assert.equal(relicFocusKit.id, "n-peer-scene-relic-focus-kit");
assert.equal(relicFocusKit.domain, "scene-interaction-focus/relic-focus");
assert.equal(relicFocus.length, 3);
assert.equal(relicFocus[0].id, "forest-relic-focus-call-moths");
assert.equal(relicFocus.find((relic) => relic.actionId === "call-moths").state, "callable");
assert.equal(relicFocus.find((relic) => relic.actionId === "tune-lantern").state, "sealed");
assert.deepEqual(relicFocus.find((relic) => relic.actionId === "tune-lantern").missing, ["forestMoths"]);
inventoryKit.flag(relicState, "forestMoths");
assert.equal(relicFocusKit.describe("forest", relicState).find((relic) => relic.actionId === "tune-lantern").state, "callable");
assert.equal(relicFocusKit.snapshot("forest", relicState).relics, 3);
assert.equal(relicFocusKit.snapshot("forest", relicState).callable, 2);
assertRendererNeutral(relicFocus);

// Path tension kit: 10 smoke-test intake cases.
const pathTensionKit = createScenePathTensionKit({ manifestKit, inventoryKit });
const pathState = makeState("crossroads");
let pathTension = pathTensionKit.describe("crossroads", pathState);
assert.equal(pathTensionKit.id, "n-peer-scene-path-tension-kit");
assert.equal(pathTensionKit.domain, "scene-navigation-pressure/path-tension");
assert.equal(pathTension.length, 2);
assert.equal(pathTension[0].id, "crossroads-path-tension-forest");
assert.equal(pathTension[0].open, false);
assert.deepEqual(pathTension[0].missing, ["has-lantern"]);
assert.equal(pathTension[1].open, true);
inventoryKit.give(pathState, "has-lantern", "Lantern");
assert.equal(pathTensionKit.describe("crossroads", pathState)[0].open, true);
assert.deepEqual(pathTensionKit.snapshot("crossroads", pathState), { sceneId: "crossroads", paths: 2, open: 2, sealed: 0 });
assertRendererNeutral(pathTension);

// Memory echo kit: 10 smoke-test intake cases.
const memoryEchoKit = createSceneMemoryEchoKit();
const echoState = makeState("bridge");
let echoes = memoryEchoKit.describe("bridge", echoState);
assert.equal(memoryEchoKit.id, "n-peer-scene-memory-echo-kit");
assert.equal(memoryEchoKit.domain, "scene-ledger-memory/memory-echoes");
assert.equal(echoes.length, 1);
assert.equal(echoes[0].type, "log");
echoState.actionLedger.unshift({ sceneId: "bridge", actionId: "anchor-rope" });
echoState.transitionLedger.push({ from: "crossroads", to: "bridge", exitId: "bridge" });
echoState.blockedLedger.push({ reason: "requirements", label: "Shrine" });
echoes = memoryEchoKit.describe("bridge", echoState);
assert.equal(echoes.length, 4);
assert.equal(echoes[0].type, "blocked");
assert.equal(echoes[1].type, "action");
assert.ok(echoes.every((echo) => echo.weight >= 0.18 && echo.weight <= 0.95));
assert.equal(memoryEchoKit.snapshot("bridge", echoState).newestType, "blocked");
assertRendererNeutral(echoes);

// Composite atmospheric handoff kit: 10 smoke-test intake cases.
const atmosphericHandoffKit = createSceneAtmosphericHandoffKit({ manifestKit, actionKit, inventoryKit });
const compositeState = makeState("crossroads");
const atmospheric = atmosphericHandoffKit.describe("crossroads", compositeState, { id: "base-renderer-descriptor" });
assert.equal(atmosphericHandoffKit.id, "n-peer-scene-atmospheric-handoff-kit");
assert.equal(atmosphericHandoffKit.domain, "scene-atmospheric-renderer-handoff");
assert.equal(Object.keys(atmosphericHandoffKit.kits).length, 5);
assert.equal(atmospheric.sceneId, "crossroads");
assert.equal(atmospheric.baseDescriptorId, "base-renderer-descriptor");
assert.equal(atmospheric.counts.depthFogBands, 6);
assert.equal(atmospheric.counts.lightRays, 5);
assert.equal(atmospheric.counts.pathTension, 2);
assert.ok(atmospheric.rendererMustNotOwn.includes("descriptor generation"));
assert.deepEqual(atmosphericHandoffKit.snapshot("crossroads", compositeState), {
  sceneId: "crossroads",
  phase: "opening",
  completion: 0,
  kitCount: 5,
  depthFogBands: 6,
  lightRays: 5,
  relicFocus: 3,
  pathTension: 2,
  memoryEchoes: 1
});
assertRendererNeutral(atmospheric);

console.log("peer scene transition atmospheric handoff smoke passed: 60 intake cases");
