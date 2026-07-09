import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createStonewakeSiltArchiveDrainageReadinessDomainKit } from "../games/stonewake-depths/stonewake-silt-archive-drainage-kits.js";

const route = readFileSync("games/stonewake-depths/index.html", "utf8");
const entry = readFileSync("games/stonewake-depths/stonewake-silt-archive-drainage-entry.js", "utf8");
const kitSource = readFileSync("games/stonewake-depths/stonewake-silt-archive-drainage-kits.js", "utf8");

assert.match(route, /silt-archive-drainage-readiness-renderer-handoff-pass/);
assert.match(route, /stonewake-silt-archive-drainage-entry\.js\?v=stonewake-silt-archive-drainage-readiness-20260709/);
assert.match(entry, /https:\/\/cdn\.jsdelivr\.net\/gh\/LuminaryLabs-Dev\/NexusEngine@main\/src\/index\.js/);
assert.doesNotMatch(entry, /NexusRealtime@/);
assert.match(entry, /getStonewakeSiltArchiveDrainageReadiness/);
assert.match(entry, /getRendererHandoff/);
assert.doesNotMatch(kitSource, /\bdocument\b|\bwindow\b|requestAnimationFrame|getContext|querySelector|createElement|addEventListener|\bTHREE\b|AudioContext|WebGL/);
assert.match(kitSource, /renderer consumes descriptors only/);

const level = {
  bounds: { width: 3200, height: 720 },
  platforms: [
    { id: "floor", role: "floor", x: 0, y: 650, w: 3200, h: 70 },
    { id: "ledge-a", x: 200, y: 560, w: 200, h: 22 },
    { id: "ledge-b", x: 650, y: 500, w: 190, h: 22 },
    { id: "ledge-c", x: 1100, y: 440, w: 190, h: 22 },
    { id: "ledge-d", x: 1700, y: 375, w: 210, h: 22 },
    { id: "ledge-e", x: 2350, y: 320, w: 230, h: 22 }
  ],
  objects: [
    { id: "valve", type: "valve", x: 460, y: 478, w: 34, h: 48 },
    { id: "plate", type: "weighted-trigger", x: 860, y: 610, w: 120, h: 22 },
    { id: "gate", type: "finish-gate", x: 2900, y: 310, w: 90, h: 170 }
  ]
};

const inputCases = Array.from({ length: 10 }, (_, index) => ({
  player: { x: 100 + index * 300, y: 580 - index * 28, w: 34, h: 46 },
  camera: { x: Math.max(0, index * 210 - 160), y: 0 },
  water: { level: 640 - index * 9 },
  valve: Math.min(1, index / 8),
  door: Math.min(1, Math.max(0, (index - 2) / 7)),
  plate: index >= 3,
  carry: index < 3
}));

const kit = createStonewakeSiltArchiveDrainageReadinessDomainKit();
for (const [index, state] of inputCases.entries()) {
  const output = kit.describe({ state, level, time: index * 0.25 });
  assert.equal(output.rendererHandoff.rendererConsumesDescriptorsOnly, true);
  assert.ok(output.rendererHandoff.counts.total > 0);
  assert.ok(output.rendererHandoff.descriptors.siltDepthGauges.length > 0);
  assert.ok(output.rendererHandoff.descriptors.siphonHoseRoutes.length > 0);
  assert.ok(Number.isFinite(output.readiness));
  assert.ok(Number.isFinite(output.siltPressure));
}

console.log("Stonewake silt archive drainage CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
