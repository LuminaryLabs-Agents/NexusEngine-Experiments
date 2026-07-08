import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createSceneCluePressureReadinessDomainKit } from "../experiments/_kits/peer-scene-transition/peer-scene-clue-pressure-handoff-kits.js";

const root = process.cwd();
const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const entryPath = join(root, "experiments/peer-scene-transition/shared/scene-clue-pressure-readiness-entry.js");
const kitPath = join(root, "experiments/_kits/peer-scene-transition/peer-scene-clue-pressure-handoff-kits.js");
const entry = await readFile(entryPath, "utf8");
const kitSource = await readFile(kitPath, "utf8");
const routes = await Promise.all(["index", "camp", "crossroads", "forest", "bridge"].map(async (route) => [route, await readFile(join(root, `experiments/peer-scene-transition/${route}.html`), "utf8")]));

assert.ok(entry.includes(nexusEngineCdn), "case 1: clue pressure entry imports NexusEngine main CDN");
assert.ok(entry.includes("createSceneCluePressureReadinessDomainKit"), "case 2: clue pressure entry wires domain kit");
assert.ok(!entry.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"), "case 3: clue pressure entry avoids old NexusRealtime runtime CDN");
assert.ok(kitSource.includes("rendererMustNotOwn"), "case 4: kit declares renderer ownership boundary");
assert.ok(!kitSource.includes("document.") && !kitSource.includes("window."), "case 5: reusable kit does not own DOM or browser input");
assert.ok(!kitSource.includes("THREE") && !kitSource.includes("WebGL"), "case 6: reusable kit does not import renderer systems");
for (const [route, html] of routes) {
  assert.ok(html.includes("scene-clue-pressure-readiness-entry.js?v=clue-pressure-readiness-1"), `case 7: ${route} route loads clue pressure overlay`);
}

const scenes = JSON.parse(await readFile(join(root, "experiments/peer-scene-transition/scenes.json"), "utf8"));
const manifestKit = {
  get(id) {
    return scenes[id] ? { id, ...scenes[id] } : null;
  },
  list() {
    return Object.entries(scenes).map(([id, scene]) => ({ id, ...scene }));
  }
};
const inventoryKit = {
  missing(state, required = []) {
    const tokens = new Set([...(state?.tokens ?? []), ...(state?.inventory ?? [])]);
    const flags = state?.flags ?? {};
    return required.filter((token) => !tokens.has(token) && !flags[token]);
  }
};
const domain = createSceneCluePressureReadinessDomainKit({ manifestKit, inventoryKit });
const cases = [
  ["camp", { visitedSceneIds: ["camp"], tokens: [] }],
  ["crossroads", { visitedSceneIds: ["camp", "crossroads"], tokens: [] }],
  ["crossroads", { visitedSceneIds: ["camp", "crossroads"], tokens: ["has-lantern"] }],
  ["forest", { visitedSceneIds: ["camp", "crossroads", "forest"], tokens: ["has-lantern"] }],
  ["forest", { visitedSceneIds: ["camp", "crossroads", "forest"], tokens: ["has-lantern", "forest-lit"] }],
  ["bridge", { visitedSceneIds: ["camp", "crossroads", "bridge"], tokens: ["has-rope"] }],
  ["bridge", { visitedSceneIds: ["camp", "crossroads", "bridge"], tokens: ["has-rope", "bridge-repaired"] }],
  ["shrine", { visitedSceneIds: ["camp", "crossroads", "forest", "shrine"], tokens: ["has-lantern", "forest-lit"] }],
  ["shrine", { visitedSceneIds: ["camp", "crossroads", "bridge", "shrine"], tokens: ["has-rope", "bridge-repaired", "shrine-open"] }],
  ["ending", { visitedSceneIds: ["camp", "crossroads", "forest", "shrine", "ending"], tokens: ["has-lantern", "has-rope", "forest-lit", "bridge-repaired", "shrine-open"] }]
];

cases.forEach(([sceneId, state], index) => {
  const described = domain.describe(sceneId, { ...state, blockedLedger: index % 2 ? [{ exitId: "forest" }] : [], actionLedger: ["inspect"], transitionLedger: state.visitedSceneIds ?? [] });
  assert.equal(described.sceneId, sceneId, `case ${index + 8}: scene id round-trips`);
  assert.ok(described.counts.clueVisibilityLanterns >= 5, `case ${index + 8}: clue lanterns exist`);
  assert.ok(described.counts.suspectThreadTraces >= 1, `case ${index + 8}: suspect traces exist`);
  assert.ok(described.rendererHandoff.consumes === "descriptors-only", `case ${index + 8}: handoff is descriptor-only`);
  assert.doesNotThrow(() => JSON.stringify(described), `case ${index + 8}: described state serializes`);
});

const complete = domain.snapshot("ending", cases.at(-1)[1]);
assert.equal(complete.kitCount, 7, "case 18: snapshot exposes seven-kit domain");
assert.ok(complete.summary.clueVisibility > 0.5, "case 19: complete route has high clue visibility");
assert.ok(entry.includes("getCluePressureReadinessDomain"), "case 20: GameHost accessor is exposed for Playwright validation");

console.log("peer scene clue pressure CDN/state-input smoke passed: 20 intake cases");
