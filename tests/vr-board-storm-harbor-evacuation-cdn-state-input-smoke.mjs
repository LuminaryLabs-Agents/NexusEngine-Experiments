import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createVrBoardStormHarborEvacuationReadinessDomainKit } from "../experiments/_kits/vr-platformer-board/vr-board-storm-harbor-evacuation-readiness-kits.js";

const routeHtml = readFileSync(new URL("../experiments/vr-platformer-board/storm-harbor.html", import.meta.url), "utf8");
const entrySource = readFileSync(new URL("../experiments/vr-platformer-board/storm-harbor-evacuation-entry.js", import.meta.url), "utf8");
const kitSource = readFileSync(new URL("../experiments/_kits/vr-platformer-board/vr-board-storm-harbor-evacuation-readiness-kits.js", import.meta.url), "utf8");

assert.match(routeHtml, /vr-board-storm-harbor-evacuation-readiness-renderer-handoff-pass/);
assert.match(routeHtml, /storm-harbor-evacuation-entry\.js\?v=vr-board-storm-harbor-evacuation-2/);
assert.match(entrySource, /https:\/\/cdn\.jsdelivr\.net\/gh\/LuminaryLabs-Dev\/NexusEngine@main\/src\/index\.js/);
assert.doesNotMatch(entrySource, /NexusRealtime@main|LuminaryLabs-Dev\/NexusRealtime@main/);
assert.match(entrySource, /window\.GameHost/);
assert.match(entrySource, /applyStormHarborInput/);
assert.match(entrySource, /getVrBoardStormHarborEvacuationReadiness/);
assert.match(entrySource, /getRendererHandoff/);
assert.doesNotMatch(kitSource, /document\.|window\.|requestAnimationFrame|AudioContext|getContext\(/);
assert.match(kitSource, /renderer consumes descriptors only/);

const level = {
  start: { x: 0, y: 1.08 },
  exit: { id: "skiff-launch-gate", x: 15.4, y: 4.62, w: 0.82, h: 1.2 },
  platforms: [
    { id: "storm-pier", x: -0.7, y: 1.08, w: 3.24, h: 0.28 },
    { id: "crane-footing", x: 3.05, y: 2.0, w: 1.82, h: 0.26 },
    { id: "flooded-dock", x: 5.78, y: 2.78, w: 2.2, h: 0.24 },
    { id: "cargo-net-cache", x: 8.82, y: 2.28, w: 1.92, h: 0.26 },
    { id: "skiff-berth", x: 11.72, y: 3.58, w: 2.42, h: 0.28 },
    { id: "launch-ramp", x: 14.65, y: 4.46, w: 1.72, h: 0.3 }
  ],
  collectibles: [
    { id: "flare-storm-pier", x: 2.18, y: 2.07, value: 1 },
    { id: "dry-net-crane", x: 4.18, y: 2.92, value: 1 },
    { id: "flare-flooded-dock", x: 6.83, y: 3.62, value: 1 },
    { id: "blanket-cache", x: 9.64, y: 3.12, value: 1 },
    { id: "skiff-rope", x: 12.92, y: 4.46, value: 1 }
  ],
  hazards: [
    { id: "surge-low-water", x: 4.8, y: 1.0, w: 0.88, h: 0.36 },
    { id: "swinging-crane-hook", x: 7.36, y: 2.58, w: 0.78, h: 0.4 },
    { id: "broken-dock-drop", x: 10.86, y: 1.05, w: 0.86, h: 0.36 }
  ]
};

const domainKit = createVrBoardStormHarborEvacuationReadinessDomainKit();
for (let index = 0; index < 10; index += 1) {
  const collectedIds = level.collectibles.slice(0, Math.min(index, level.collectibles.length)).map((coin) => coin.id);
  const input = {
    avatar: { position: { x: index * 1.5, y: 1.25 + index * 0.09 }, size: { x: 0.48, y: 0.78 }, velocity: { x: 0.4, y: -0.1 }, grounded: index % 2 === 0 },
    level,
    objects: { collectedIds, collectedValue: collectedIds.length },
    board: { sizeMeters: { x: 1.8, y: 1.0 }, mode: "storm-harbor-evacuation" },
    weather: { tideLevel: 0.33 + index * 0.045, wind: 0.18 + index * 0.03, rain: 0.42 },
    xrPose: { head: { position: { x: index > 7 ? 0.23 : 0.02, y: 1.6, z: 0 } } },
    input: { moveAxis: index % 3 - 1, jumpPressed: index % 2 === 0, restartPressed: false },
    time: index * 0.75
  };
  const state = domainKit.describe(input);
  assert.ok(state.rendererHandoff.counts.total >= 22, `case ${index} has renderer handoff descriptors`);
  assert.ok(state.dawnHarborLedger.required >= state.dawnHarborLedger.collected, `case ${index} has ledger accounting`);
  assert.ok(state.dawnHarborLedger.nextInstruction.length > 0, `case ${index} has next instruction`);
  assert.ok(state.rendererHandoff.descriptors.tideGauges.length >= 4, `case ${index} has tide gauges`);
}

console.log("VR board storm harbor evacuation CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
