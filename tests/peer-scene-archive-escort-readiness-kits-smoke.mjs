import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  SCENE_ARCHIVE_ESCORT_READINESS_DOMAIN_TREE,
  createSceneArchiveDoorReadinessKit,
  createSceneArchiveEscortReadinessDomainKit,
  createSceneArchiveEscortRendererHandoffKit,
  createSceneArchivistBeaconKit,
  createSceneLanternSupplyCacheKit,
  createSceneMemoryMapThreadKit,
  createSceneOathSentinelPostKit,
  createSceneSafePassageTokenKit
} from "../experiments/_kits/peer-scene-transition/peer-scene-archive-escort-readiness-kits.js";

const scenes = {
  camp: { title: "Ash Road Camp", exits: { road: { to: "crossroads", label: "Walk" } } },
  crossroads: { title: "The Crossroads", exits: { forest: { to: "forest", label: "Forest", requires: ["has-lantern"] }, bridge: { to: "bridge", label: "Bridge" } } },
  forest: { title: "Lantern Forest", exits: { shrine: { to: "shrine", label: "Shrine", requires: ["forest-lit"] } } },
  bridge: { title: "Old Bridge", exits: { shrine: { to: "shrine", label: "Shrine", requires: ["bridge-repaired"] } } },
  shrine: { title: "Silent Shrine", exits: { ending: { to: "ending", label: "Finish", requires: ["shrine-open"] } } },
  ending: { title: "Dawn Ending", exits: { camp: { to: "camp", label: "Again" } } }
};

const cases = [
  { sceneId: "camp", state: { currentScene: "camp", inventory: [], visitedScenes: [], log: [] } },
  { sceneId: "camp", state: { currentScene: "camp", inventory: ["Lantern"], visitedScenes: ["camp"], log: ["took lantern"] } },
  { sceneId: "crossroads", state: { currentScene: "crossroads", inventory: ["has-lantern"], visitedScenes: ["camp", "crossroads"], log: [] } },
  { sceneId: "forest", state: { currentScene: "forest", inventory: ["has-lantern", "Forest sequence solved", "forest-lit"], visitedScenes: ["camp", "crossroads", "forest"], log: ["forest lit"] } },
  { sceneId: "bridge", state: { currentScene: "bridge", inventory: ["Bridge rope", "Bridge repaired", "bridge-repaired"], visitedScenes: ["camp", "crossroads", "bridge"], log: ["bridge repaired"] } },
  { sceneId: "shrine", state: { currentScene: "shrine", inventory: ["has-lantern", "forest-lit", "bridge-repaired"], visitedScenes: ["camp", "crossroads", "forest", "bridge", "shrine"], log: [] } },
  { sceneId: "ending", state: { currentScene: "ending", inventory: ["Lantern", "Bridge rope", "Forest sequence solved", "Bridge repaired", "Shrine opened", "shrine-open"], visitedScenes: Object.keys(scenes), log: ["done"] } },
  { sceneId: "crossroads", state: { currentScene: "crossroads", inventory: ["Map shard"], visitedScenes: ["camp"], pressureScore: 74, log: ["blocked", "blocked"] } },
  { sceneId: "forest", state: { currentScene: "forest", inventory: ["has-lantern", "Map shard", "Silver clue"], visitedScenes: ["camp", "crossroads"], pressureScore: 12, log: [] } },
  { sceneId: "camp", state: { currentScene: "camp", inventory: ["Lantern", "Bridge rope", "Forest sequence solved"], visitedScenes: ["camp", "crossroads", "forest"], pressureScore: 40, log: ["half ready"] } }
];

assert.ok(SCENE_ARCHIVE_ESCORT_READINESS_DOMAIN_TREE.includes("peer-scene-archive-escort-readiness-domain"));
assert.ok(SCENE_ARCHIVE_ESCORT_READINESS_DOMAIN_TREE.includes("renderer consumes descriptors only"));
assert.ok(SCENE_ARCHIVE_ESCORT_READINESS_DOMAIN_TREE.includes("scene-archive-door-readiness-kit"));

const beaconKit = createSceneArchivistBeaconKit();
const memoryKit = createSceneMemoryMapThreadKit();
const sentinelKit = createSceneOathSentinelPostKit();
const cacheKit = createSceneLanternSupplyCacheKit();
const tokenKit = createSceneSafePassageTokenKit();
const doorKit = createSceneArchiveDoorReadinessKit();
const handoffKit = createSceneArchiveEscortRendererHandoffKit();
const domainKit = createSceneArchiveEscortReadinessDomainKit();

for (const [index, intake] of cases.entries()) {
  const input = { ...intake, scenes };
  const beacons = beaconKit.describe(input);
  assert.equal(beacons.length, 6, `case ${index}: archivist beacons cover all scenes`);
  assert.ok(beacons.some((beacon) => beacon.current), `case ${index}: current beacon exists`);
  assert.ok(beacons.every((beacon) => beacon.urgency >= 0 && beacon.urgency <= 1), `case ${index}: urgency normalized`);

  const memory = memoryKit.describe(input);
  assert.ok(memory.length >= 5, `case ${index}: memory map covers route exits`);
  assert.ok(memory.every((thread) => Array.isArray(thread.missing)), `case ${index}: thread missing requirements arrays`);

  const sentinels = sentinelKit.describe(input);
  assert.equal(sentinels.length, 6, `case ${index}: sentinel posts cover scenes`);
  assert.ok(sentinels.every((post) => post.strength >= 0 && post.strength <= 1), `case ${index}: sentinel strength normalized`);

  const caches = cacheKit.describe(input);
  assert.ok(caches.length >= 6 && caches.length <= 8, `case ${index}: supply cache bounded`);
  assert.ok(caches.every((cache) => cache.reserve >= 0 && cache.reserve <= 1), `case ${index}: cache reserve normalized`);

  const tokens = tokenKit.describe(input);
  assert.equal(tokens.length, 6, `case ${index}: safe passage tokens cover route order`);
  assert.ok(tokens.every((token) => Array.isArray(token.missing)), `case ${index}: token missing arrays`);

  const doors = doorKit.describe(input);
  assert.equal(doors.length, 1, `case ${index}: one archive door`);
  assert.ok(doors[0].readiness >= 0 && doors[0].readiness <= 1, `case ${index}: door readiness normalized`);

  const handoff = handoffKit.describe({
    archivistBeacons: beacons,
    memoryMapThreads: memory,
    oathSentinelPosts: sentinels,
    lanternSupplyCaches: caches,
    safePassageTokens: tokens,
    archiveDoorReadiness: doors
  });
  assert.equal(handoff.policy, "renderer-consumes-descriptors-only", `case ${index}: renderer handoff policy`);
  assert.equal(handoff.counts.archivistBeacons, beacons.length, `case ${index}: handoff mirrors beacon count`);
  assert.doesNotThrow(() => JSON.stringify(handoff), `case ${index}: handoff serializes`);

  const domain = domainKit.describe(input);
  assert.equal(domain.kitCount, 8, `case ${index}: composite kit count`);
  assert.equal(domain.counts.archiveDoorReadiness, 1, `case ${index}: domain emits archive door`);
  assert.ok(domain.descriptorCount >= 30, `case ${index}: domain emits useful descriptor set`);
  assert.doesNotThrow(() => JSON.stringify(domain), `case ${index}: domain serializes`);
}

const source = await readFile("experiments/_kits/peer-scene-transition/peer-scene-archive-escort-readiness-kits.js", "utf8");
for (const forbidden of ["document", "window", "THREE", "WebGL", "AudioContext", "addEventListener", "requestAnimationFrame"]) {
  assert.ok(!source.includes(forbidden), `renderer-neutral kit avoids ${forbidden}`);
}

console.log("peer scene archive escort readiness kits smoke passed: 10 intake cases");
