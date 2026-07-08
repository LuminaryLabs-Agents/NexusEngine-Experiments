import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createSceneEvidenceRitualReadinessDomainKit } from "../experiments/_kits/peer-scene-transition/peer-scene-evidence-ritual-readiness-kits.js";

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const entry = await readFile("experiments/peer-scene-transition/shared/scene-evidence-ritual-readiness-entry.js", "utf8");
const kitSource = await readFile("experiments/_kits/peer-scene-transition/peer-scene-evidence-ritual-readiness-kits.js", "utf8");
const campHtml = await readFile("experiments/peer-scene-transition/camp.html", "utf8");
const crossroadsHtml = await readFile("experiments/peer-scene-transition/crossroads.html", "utf8");
const forestHtml = await readFile("experiments/peer-scene-transition/forest.html", "utf8");
const bridgeHtml = await readFile("experiments/peer-scene-transition/bridge.html", "utf8");
const manifest = await readFile("experiments/domain-kit-cutover-manifest.json", "utf8");
const playwrightSmoke = await readFile("tests/peer-scene-transition-playwright-smoke.mjs", "utf8");

assert.ok(entry.includes(nexusEngineCdn), "evidence ritual entry imports NexusEngine main CDN");
assert.ok(entry.includes("createSceneEvidenceRitualReadinessDomainKit"), "entry wires evidence ritual domain kit");
assert.ok(!entry.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"), "entry avoids old NexusRealtime runtime CDN");
assert.ok(!kitSource.includes("NexusRealtime"), "renderer-neutral kit avoids old NexusRealtime import");
assert.ok(campHtml.includes("scene-evidence-ritual-readiness-entry.js?v=evidence-ritual-readiness-1"), "camp route cache-busts evidence ritual entry");
assert.ok(crossroadsHtml.includes("scene-evidence-ritual-readiness-entry.js?v=evidence-ritual-readiness-1"), "crossroads route cache-busts evidence ritual entry");
assert.ok(forestHtml.includes("scene-evidence-ritual-readiness-entry.js?v=evidence-ritual-readiness-1"), "forest route cache-busts evidence ritual entry");
assert.ok(bridgeHtml.includes("scene-evidence-ritual-readiness-entry.js?v=evidence-ritual-readiness-1"), "bridge route cache-busts evidence ritual entry");
assert.ok(manifest.includes("peer-scene-evidence-ritual-readiness-domain-kit"), "manifest registers evidence ritual domain kit");
assert.ok(playwrightSmoke.includes("peer-scene-evidence-ritual-readiness-kits-smoke.mjs"), "playwright smoke routes kit smoke");
assert.ok(playwrightSmoke.includes("getEvidenceRitualReadinessDomain"), "playwright smoke validates GameHost evidence ritual accessor");

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

const domain = createSceneEvidenceRitualReadinessDomainKit();
for (const [index, [sceneId, inventory]] of cases.entries()) {
  const state = {
    currentScene: sceneId,
    inventory,
    visitedScenes: cases.slice(0, index + 1).map(([id]) => id),
    pressureScore: index * 9,
    log: index % 2 ? ["route tested"] : []
  };
  const description = domain.describe({ sceneId, state, scenes });
  assert.equal(description.policy, "renderer-consumes-descriptors-only", `case ${index}: descriptor handoff policy`);
  assert.equal(description.counts.witnessStatementWebs, 6, `case ${index}: witness count`);
  assert.equal(description.counts.ritualSequenceRunes, 6, `case ${index}: ritual rune count`);
  assert.equal(description.counts.doubtPressureDials, 4, `case ${index}: doubt dial count`);
  assert.equal(description.counts.verdictDoorReadiness, 1, `case ${index}: verdict door count`);
  assert.ok(description.descriptors.verdictDoorReadiness[0].readiness >= 0, `case ${index}: verdict readiness exists`);
}

console.log("peer scene evidence ritual CDN/state-input smoke passed: 10 intake cases");
