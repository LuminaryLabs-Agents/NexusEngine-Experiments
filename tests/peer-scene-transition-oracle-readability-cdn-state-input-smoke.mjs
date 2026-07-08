import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSceneOracleReadabilityDomainKit } from "../experiments/_kits/peer-scene-transition/peer-scene-oracle-readability-handoff-kits.js";

const entryPath = "experiments/peer-scene-transition/shared/scene-oracle-readability-entry.js";
const kitPath = "experiments/_kits/peer-scene-transition/peer-scene-oracle-readability-handoff-kits.js";
const checksPath = "scripts/run-checks.mjs";
const htmlPaths = [
  "experiments/peer-scene-transition/index.html",
  "experiments/peer-scene-transition/camp.html",
  "experiments/peer-scene-transition/crossroads.html",
  "experiments/peer-scene-transition/forest.html",
  "experiments/peer-scene-transition/bridge.html"
];

const entry = readFileSync(entryPath, "utf8");
const kitSource = readFileSync(kitPath, "utf8");
const checks = readFileSync(checksPath, "utf8");

assert.ok(entry.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "oracle entry should import NexusEngine main CDN");
assert.ok(!entry.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"), "oracle entry should not import old NexusRealtime runtime CDN");
assert.ok(entry.includes("createSceneOracleReadabilityDomainKit"), "entry should instantiate oracle readability domain");
assert.ok(entry.includes("getOracleReadabilityDomain"), "GameHost should expose oracle domain snapshot");
assert.ok(entry.includes("getRendererHandoff"), "entry should compose renderer handoff counts");
assert.ok(entry.includes("rendererHandoff") || entry.includes("oracleReadability"), "entry should expose renderer handoff descriptors");
assert.ok(kitSource.includes("rendererMustNotOwn"), "kit should declare renderer ownership boundary");
assert.ok(!kitSource.includes("document.") && !kitSource.includes("window.") && !kitSource.includes("THREE"), "kit should stay renderer and DOM neutral");
assert.ok(checks.includes("tests/peer-scene-transition-oracle-readability-handoff-smoke.mjs"), "full/deploy checks should include oracle kit smoke");
assert.ok(checks.includes("tests/peer-scene-transition-oracle-readability-cdn-state-input-smoke.mjs"), "full/deploy checks should include oracle CDN state smoke");

for (const path of htmlPaths) {
  const html = readFileSync(path, "utf8");
  assert.ok(html.includes("scene-oracle-readability-entry.js?v=oracle-readability-1"), `${path} should load oracle readability entry with cache bust`);
}

const scenes = {
  camp: { id: "camp", title: "Camp", exits: { road: { to: "crossroads" } } },
  crossroads: { id: "crossroads", title: "Crossroads", exits: { forest: { to: "forest", requires: ["has-lantern"] }, bridge: { to: "bridge" } } },
  forest: { id: "forest", title: "Forest", exits: { shrine: { to: "shrine", requires: ["forest-lit"] } } },
  bridge: { id: "bridge", title: "Bridge", exits: { shrine: { to: "shrine", requires: ["bridge-repaired"] } } },
  shrine: { id: "shrine", title: "Shrine", exits: { ending: { to: "ending", requires: ["shrine-open"] } } },
  ending: { id: "ending", title: "Ending", exits: { camp: { to: "camp" } } }
};

const manifestKit = { get: (id) => scenes[id], list: () => Object.values(scenes) };
const inventoryKit = { missing: (state, required = []) => required.filter((token) => !state.inventory?.includes(token) && !state.tokens?.includes(token) && !state.flags?.[token]) };
const domain = createSceneOracleReadabilityDomainKit({ manifestKit, inventoryKit });

const states = [
  ["camp", { inventory: [], tokens: [], flags: {}, visitedSceneIds: ["camp"], pressure: { score: 0 } }],
  ["crossroads", { inventory: ["has-lantern"], tokens: [], flags: {}, visitedSceneIds: ["camp", "crossroads"], pressure: { score: 10 } }],
  ["forest", { inventory: ["has-lantern"], tokens: ["forest-lit"], flags: {}, visitedSceneIds: ["camp", "crossroads", "forest"], pressure: { score: 20 } }],
  ["bridge", { inventory: ["has-rope"], tokens: [], flags: { "bridge-repaired": true }, visitedSceneIds: ["camp", "crossroads", "bridge"], pressure: { score: 30 } }],
  ["shrine", { inventory: ["has-lantern"], tokens: ["forest-lit", "bridge-repaired"], flags: {}, visitedSceneIds: ["camp", "crossroads", "forest", "bridge", "shrine"], pressure: { score: 40 } }],
  ["shrine", { inventory: ["has-lantern"], tokens: ["forest-lit", "bridge-repaired", "shrine-open"], flags: {}, visitedSceneIds: ["camp", "crossroads", "forest", "bridge", "shrine"], pressure: { score: 50 } }],
  ["ending", { inventory: ["has-lantern", "has-rope"], tokens: ["forest-lit", "bridge-repaired", "shrine-open"], flags: {}, visitedSceneIds: Object.keys(scenes), pressure: { score: 1 } }],
  ["crossroads", { inventory: [], tokens: [], flags: {}, visitedSceneIds: ["camp", "crossroads"], blockedLedger: ["forest"], actionLedger: ["look"] }],
  ["forest", { inventory: ["has-lantern"], tokens: [], flags: {}, visitedSceneIds: ["camp", "crossroads", "forest"], blockedLedger: ["shrine"], pressure: { score: 80 } }],
  ["bridge", { inventory: ["has-rope"], tokens: [], flags: {}, visitedSceneIds: ["camp", "crossroads", "bridge"], blockedLedger: ["shrine"], pressure: { score: 90 } }]
];

for (const [index, [sceneId, state]] of states.entries()) {
  const handoff = domain.describe(sceneId, state);
  assert.ok(handoff.counts.objectiveForecastThreads >= 1, `state case ${index} should forecast route threads`);
  assert.equal(handoff.counts.pressureClockRings, 4, `state case ${index} should keep pressure clock stable`);
  assert.ok(handoff.counts.resourceRouteMaps >= 1, `state case ${index} should map route resources`);
  assert.ok(handoff.counts.puzzleDebtStacks >= 1, `state case ${index} should expose puzzle debt`);
  assert.equal(handoff.counts.endingReadinessCrowns, 1, `state case ${index} should expose ending crown`);
}

console.log("peer scene oracle readability CDN state input smoke passed");
