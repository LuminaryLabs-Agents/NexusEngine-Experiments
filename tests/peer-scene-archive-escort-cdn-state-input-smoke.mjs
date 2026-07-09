import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createSceneArchiveEscortReadinessDomainKit } from "../experiments/_kits/peer-scene-transition/peer-scene-archive-escort-readiness-kits.js";

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const entry = await readFile("experiments/peer-scene-transition/shared/scene-archive-escort-readiness-entry.js", "utf8");
const kitSource = await readFile("experiments/_kits/peer-scene-transition/peer-scene-archive-escort-readiness-kits.js", "utf8");
const campHtml = await readFile("experiments/peer-scene-transition/camp.html", "utf8");
const crossroadsHtml = await readFile("experiments/peer-scene-transition/crossroads.html", "utf8");
const forestHtml = await readFile("experiments/peer-scene-transition/forest.html", "utf8");
const bridgeHtml = await readFile("experiments/peer-scene-transition/bridge.html", "utf8");
const manifest = await readFile("experiments/domain-kit-cutover-manifest.json", "utf8");
const playwrightSmoke = await readFile("tests/peer-scene-transition-playwright-smoke.mjs", "utf8");

assert.ok(entry.includes(nexusEngineCdn), "archive escort entry imports NexusEngine main CDN");
assert.ok(entry.includes("createSceneArchiveEscortReadinessDomainKit"), "entry wires archive escort domain kit");
assert.ok(!entry.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"), "entry avoids old NexusRealtime runtime CDN");
assert.ok(!kitSource.includes("NexusRealtime"), "renderer-neutral kit avoids old NexusRealtime import");
assert.ok(campHtml.includes("scene-archive-escort-readiness-entry.js?v=archive-escort-readiness-1"), "camp route cache-busts archive escort entry");
assert.ok(crossroadsHtml.includes("scene-archive-escort-readiness-entry.js?v=archive-escort-readiness-1"), "crossroads route cache-busts archive escort entry");
assert.ok(forestHtml.includes("scene-archive-escort-readiness-entry.js?v=archive-escort-readiness-1"), "forest route cache-busts archive escort entry");
assert.ok(bridgeHtml.includes("scene-archive-escort-readiness-entry.js?v=archive-escort-readiness-1"), "bridge route cache-busts archive escort entry");
assert.ok(manifest.includes("peer-scene-archive-escort-readiness-domain-kit"), "manifest registers archive escort domain kit");
assert.ok(playwrightSmoke.includes("peer-scene-archive-escort-readiness-kits-smoke.mjs"), "playwright smoke routes kit smoke");
assert.ok(playwrightSmoke.includes("getArchiveEscortReadinessDomain"), "playwright smoke validates GameHost archive escort accessor");

const scenes = {
  camp: { title: "Ash Road Camp", exits: { road: { to: "crossroads", label: "Walk" } } },
  crossroads: { title: "The Crossroads", exits: { forest: { to: "forest", label: "Forest", requires: ["has-lantern"] }, bridge: { to: "bridge", label: "Bridge" } } },
  forest: { title: "Lantern Forest", exits: { shrine: { to: "shrine", label: "Shrine", requires: ["forest-lit"] } } },
  bridge: { title: "Old Bridge", exits: { shrine: { to: "shrine", label: "Shrine", requires: ["bridge-repaired"] } } },
  shrine: { title: "Silent Shrine", exits: { ending: { to: "ending", label: "Finish", requires: ["shrine-open"] } } },
  ending: { title: "Dawn Ending", exits: { camp: { to: "camp", label: "Again" } } }
};
const cases = [
  ["camp", []],
  ["camp", ["Lantern"]],
  ["crossroads", ["has-lantern"]],
  ["forest", ["has-lantern", "forest-lit"]],
  ["bridge", ["Bridge rope", "bridge-repaired"]],
  ["shrine", ["has-lantern", "forest-lit", "bridge-repaired"]],
  ["ending", ["Lantern", "Bridge rope", "Forest sequence solved", "Bridge repaired", "Shrine opened", "shrine-open"]],
  ["crossroads", ["Map shard"]],
  ["forest", ["has-lantern", "Silver clue"]],
  ["camp", ["Lantern", "Bridge rope", "Forest sequence solved"]]
];

const domain = createSceneArchiveEscortReadinessDomainKit();
for (const [index, [sceneId, inventory]] of cases.entries()) {
  const state = {
    currentScene: sceneId,
    inventory,
    visitedScenes: cases.slice(0, index + 1).map(([id]) => id),
    pressureScore: index * 8,
    log: index % 2 ? ["route tested"] : []
  };
  const description = domain.describe({ sceneId, state, scenes });
  assert.equal(description.policy, "renderer-consumes-descriptors-only", `case ${index}: descriptor handoff policy`);
  assert.equal(description.counts.archivistBeacons, 6, `case ${index}: beacon count`);
  assert.ok(description.counts.memoryMapThreads >= 5, `case ${index}: memory map count`);
  assert.equal(description.counts.oathSentinelPosts, 6, `case ${index}: sentinel count`);
  assert.equal(description.counts.safePassageTokens, 6, `case ${index}: token count`);
  assert.equal(description.counts.archiveDoorReadiness, 1, `case ${index}: archive door count`);
  assert.ok(description.descriptors.archiveDoorReadiness[0].readiness >= 0, `case ${index}: archive door readiness exists`);
}

console.log("peer scene archive escort CDN/state-input smoke passed: 10 intake cases");
