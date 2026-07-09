import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  PEER_SCENE_MOON_GATE_REPAIR_DOMAIN,
  PEER_SCENE_MOON_GATE_REPAIR_KITS,
  createPeerSceneMoonGateRepairDomainKit,
  createPeerSceneMoonGateRepairReadiness
} from "../experiments/_kits/peer-scene-transition/peer-scene-moon-gate-repair-kits.js";

const cases = [
  { sceneId: "camp", visited: ["camp"], inventory: [], pressure: 0 },
  { sceneId: "crossroads", visited: ["camp", "crossroads"], inventory: ["map"], tokens: ["clue"], pressure: 12 },
  { sceneId: "forest", visited: ["camp", "crossroads", "forest"], inventory: ["lantern"], tokens: ["forest-lit"], pressure: 20 },
  { sceneId: "bridge", visited: ["camp", "crossroads", "forest", "bridge"], inventory: ["rope", "map"], actions: ["bridge-plank"], pressure: 30 },
  { sceneId: "shrine", visited: ["camp", "crossroads", "forest", "bridge", "shrine"], inventory: ["lantern", "seal", "rope"], actions: ["ritual-oath"], pressure: 10 },
  { sceneId: "ending", visited: ["camp", "crossroads", "forest", "bridge", "shrine", "ending"], inventory: ["lantern", "seal", "rope", "map"], tokens: ["moon-rune", "witness-echo"], pressure: 0 },
  { currentScene: "unknown", visitedScenes: ["camp"], items: ["torch"], pressureScore: 72 },
  { currentSceneId: "bridge", visitedSceneIds: ["camp", "forest"], routeTokens: ["oath-ribbon"], hazardPressure: 47 },
  { sceneId: "forest", flags: { witness: true, moon: true, empty: false }, messages: ["oracle echo answered"], pressure: { score: 18 } },
  { sceneId: "shrine", visited: ["camp", "crossroads", "forest", "bridge", "shrine"], inventory: ["lantern", "seal", "rope", "map", "key"], actions: ["ritual-oath", "moon-gate-open"], pressure: 4 }
];

const domainKit = createPeerSceneMoonGateRepairDomainKit();
assert.equal(PEER_SCENE_MOON_GATE_REPAIR_DOMAIN.id, "peer-scene-moon-gate-repair-readiness-domain");
assert.equal(PEER_SCENE_MOON_GATE_REPAIR_KITS.length, 7);
assert.ok(PEER_SCENE_MOON_GATE_REPAIR_DOMAIN.tree.includes("memory-voice-domain"));
assert.ok(PEER_SCENE_MOON_GATE_REPAIR_DOMAIN.tree.includes("renderer consumes descriptors only"));

let previousReadiness = -1;
cases.forEach((input, index) => {
  const result = domainKit.describe(input);
  assert.equal(result.domainId, PEER_SCENE_MOON_GATE_REPAIR_DOMAIN.id);
  assert.ok(result.kits.includes("peer-scene-moon-gate-repair-renderer-handoff-kit"));
  assert.ok(Number.isInteger(result.readiness));
  assert.ok(result.readiness >= 0 && result.readiness <= 100);
  assert.ok(Number.isInteger(result.fractureRisk));
  assert.ok(result.fractureRisk >= 0 && result.fractureRisk <= 100);
  assert.ok(["threshold-fractured", "witness-chorus-forming", "threshold-lanterns-aligned", "moon-gate-open"].includes(result.phase));
  assert.equal(result.rendererHandoff.descriptorOnly, true);
  assert.equal(result.rendererHandoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(result.rendererHandoff.counts.moonGateRunes, 5);
  assert.equal(result.rendererHandoff.counts.hingeCounterweights, 5);
  assert.equal(result.rendererHandoff.counts.echoChoirs, 5);
  assert.equal(result.rendererHandoff.counts.oathRibbons, 5);
  assert.equal(result.rendererHandoff.counts.thresholdLanterns, 5);
  assert.equal(result.rendererHandoff.counts.dawnMoonGateLedgers, 1);
  assert.equal(result.rendererHandoff.flatDescriptors.length, 26);
  assert.doesNotThrow(() => JSON.stringify(result));
  if (index === 0 || index === cases.length - 1) {
    assert.ok(result.readiness >= previousReadiness);
    previousReadiness = result.readiness;
  }
});

const cold = createPeerSceneMoonGateRepairReadiness(cases[0]);
const ready = createPeerSceneMoonGateRepairReadiness(cases[cases.length - 1]);
assert.ok(ready.readiness > cold.readiness);
assert.ok(ready.fractureRisk < cold.fractureRisk);

const source = readFileSync(new URL("../experiments/_kits/peer-scene-transition/peer-scene-moon-gate-repair-kits.js", import.meta.url), "utf8");
for (const forbidden of ["document.", "window.", "requestAnimationFrame", "THREE", "WebGL", "Audio(", "fetch("]) {
  assert.equal(source.includes(forbidden), false, `reusable kit source must not include ${forbidden}`);
}

console.log("Peer Scene moon gate repair readiness kits smoke passed 10 intake cases.");
