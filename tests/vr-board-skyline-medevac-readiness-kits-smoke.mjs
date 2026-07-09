import assert from "node:assert/strict";
import {
  VR_BOARD_SKYLINE_MEDEVAC_READINESS_DOMAIN_TREE,
  createVrBoardSkylineMedevacReadinessDomainKit
} from "../experiments/_kits/vr-platformer-board/vr-board-skyline-medevac-readiness-kits.js";

const level = {
  start: { x: 0, y: 1.1 },
  exit: { id: "skyhook-exit", x: 15.3, y: 4.75, w: 0.78, h: 1.25 },
  platforms: [
    { id: "triage-deck", x: -0.6, y: 1.1, w: 3.1, h: 0.28 },
    { id: "pylon-low", x: 3.1, y: 2.1, w: 1.85, h: 0.26 },
    { id: "wind-gap", x: 5.9, y: 2.9, w: 2.25, h: 0.26 },
    { id: "oxygen-cache", x: 8.9, y: 2.25, w: 1.8, h: 0.26 },
    { id: "relay-summit", x: 11.7, y: 3.65, w: 2.35, h: 0.28 },
    { id: "skyhook-pad", x: 14.7, y: 4.55, w: 1.6, h: 0.3 }
  ],
  collectibles: [
    { id: "oxygen-launch", x: 2.25, y: 2.2, value: 1 },
    { id: "oxygen-wind-gap", x: 6.85, y: 3.88, value: 1 },
    { id: "oxygen-cache", x: 9.65, y: 3.15, value: 1 },
    { id: "oxygen-summit", x: 12.72, y: 4.62, value: 1 }
  ],
  hazards: [
    { id: "wind-shear-gap", x: 4.98, y: 1.05, w: 0.82, h: 0.36 },
    { id: "loose-cable", x: 7.48, y: 2.72, w: 0.74, h: 0.36 },
    { id: "open-drop", x: 10.82, y: 1.1, w: 0.84, h: 0.36 }
  ]
};

const cases = Array.from({ length: 10 }, (_, index) => ({
  avatar: { position: { x: index * 1.55, y: 1.75 + (index % 3) * 0.32 }, velocity: { x: 0.5, y: -0.1 }, size: { x: 0.48, y: 0.78 }, grounded: index % 2 === 0, mode: "alive" },
  level,
  objects: { collectedIds: level.collectibles.slice(0, Math.min(index, level.collectibles.length)).map((coin) => coin.id), collectedValue: Math.min(index, level.collectibles.length) },
  board: { sizeMeters: { x: 1.8, y: 1.0 } },
  xrPose: { head: { position: { x: index > 6 ? 0.22 : 0.04, y: 1.6, z: 0 } } },
  input: { moveAxis: index % 3 - 1, jumpPressed: index % 2 === 0, restartPressed: false },
  time: index * 0.67
}));

const domainKit = createVrBoardSkylineMedevacReadinessDomainKit();
assert.equal(VR_BOARD_SKYLINE_MEDEVAC_READINESS_DOMAIN_TREE.root, "vr-board-skyline-medevac-readiness-domain");

for (const [index, input] of cases.entries()) {
  const state = domainKit.describe(input);
  assert.equal(state.domain, "vr-board-skyline-medevac-readiness-domain");
  assert.equal(state.anchorPylons.length, level.platforms.length, `case ${index} anchor count`);
  assert.equal(state.harnessThreads.length, level.platforms.length - 1, `case ${index} thread count`);
  assert.equal(state.crosswindRibbons.length, level.hazards.length, `case ${index} wind count`);
  assert.equal(state.oxygenCanisters.length, level.collectibles.length, `case ${index} oxygen count`);
  assert.equal(state.medevacPods.length, 1, `case ${index} medevac pod count`);
  assert.ok(state.evacManifest.remaining >= 0, `case ${index} manifest accounting`);
  assert.ok(state.medevacReadiness >= 0 && state.medevacReadiness <= 1, `case ${index} readiness bounds`);
  assert.ok(["extract", "wind-hold", "evacuate", "marshal", "recover"].includes(state.riskState), `case ${index} state enum`);
  assert.equal(state.rendererHandoff.counts.total, level.platforms.length + (level.platforms.length - 1) + level.hazards.length + level.collectibles.length + 2);
  assert.equal(state.rendererContract.rendererMustNotOwn.includes("Three.js"), true);
  JSON.stringify(state);
}

const early = domainKit.describe(cases[0]);
const late = domainKit.describe(cases[9]);
assert.ok(late.evacManifest.secured >= early.evacManifest.secured);
assert.ok(late.medevacReadiness >= early.medevacReadiness || late.evacManifest.phase !== "recover");

console.log("VR board skyline medevac readiness kits smoke passed 10 intake cases.");
