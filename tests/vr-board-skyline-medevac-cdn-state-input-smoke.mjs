import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createVrBoardSkylineMedevacReadinessDomainKit } from "../experiments/_kits/vr-platformer-board/vr-board-skyline-medevac-readiness-kits.js";

const routeHtml = readFileSync(new URL("../experiments/vr-platformer-board/skyline-medevac.html", import.meta.url), "utf8");
const entrySource = readFileSync(new URL("../experiments/vr-platformer-board/skyline-medevac-readiness-entry.js", import.meta.url), "utf8");
const kitSource = readFileSync(new URL("../experiments/_kits/vr-platformer-board/vr-board-skyline-medevac-readiness-kits.js", import.meta.url), "utf8");

assert.match(routeHtml, /vr-board-skyline-medevac-readiness-renderer-handoff-pass/);
assert.match(routeHtml, /skyline-medevac-readiness-entry\.js\?v=vr-board-skyline-medevac-readiness-1/);
assert.match(entrySource, /https:\/\/cdn\.jsdelivr\.net\/gh\/LuminaryLabs-Dev\/NexusEngine@main\/src\/index\.js/);
assert.doesNotMatch(entrySource, /NexusRealtime@main|LuminaryLabs-Dev\/NexusRealtime@main/);
assert.match(entrySource, /window\.GameHost/);
assert.match(entrySource, /getVrBoardSkylineMedevacReadiness/);
assert.match(entrySource, /getRendererHandoff/);
assert.doesNotMatch(kitSource, /document\.|window\.|requestAnimationFrame|AudioContext|getContext\(/);
assert.match(kitSource, /renderer consumes skyline medevac descriptors only/);

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

const domainKit = createVrBoardSkylineMedevacReadinessDomainKit();
for (let index = 0; index < 10; index += 1) {
  const input = {
    avatar: { position: { x: index * 1.5, y: 1.6 + index * 0.08 }, size: { x: 0.48, y: 0.78 }, velocity: { x: 0.4, y: -0.1 }, grounded: index % 2 === 0 },
    level,
    objects: { collectedIds: level.collectibles.slice(0, Math.min(index, level.collectibles.length)).map((coin) => coin.id), collectedValue: Math.min(index, level.collectibles.length) },
    board: { sizeMeters: { x: 1.8, y: 1.0 } },
    xrPose: { head: { position: { x: index > 7 ? 0.23 : 0.02, y: 1.6, z: 0 } } },
    input: { moveAxis: index % 3 - 1, jumpPressed: index % 2 === 0, restartPressed: false },
    time: index * 0.75
  };
  const state = domainKit.describe(input);
  assert.ok(state.rendererHandoff.counts.total >= 1, `case ${index} has renderer handoff descriptors`);
  assert.ok(state.evacManifest.remaining >= 0, `case ${index} has manifest accounting`);
}

console.log("VR board skyline medevac CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
