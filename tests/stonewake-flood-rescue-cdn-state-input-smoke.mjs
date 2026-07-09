import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createStonewakeFloodRescueReadinessDomainKit } from "../games/stonewake-depths/stonewake-rescue-readiness-kits.js";

const route = readFileSync(new URL("../games/stonewake-depths/index.html", import.meta.url), "utf8");
const entry = readFileSync(new URL("../games/stonewake-depths/stonewake-rescue-readiness-entry.js", import.meta.url), "utf8");
const kitSource = readFileSync(new URL("../games/stonewake-depths/stonewake-rescue-readiness-kits.js", import.meta.url), "utf8");

assert.match(route, /stonewake-flood-rescue-readiness-renderer-handoff-pass/);
assert.match(route, /var mouse = \{ x: 0, y: 0 \}/);
assert.match(route, /stonewake-rescue-readiness-entry\.js\?v=stonewake-flood-rescue-readiness-1/);
assert.match(entry, /https:\/\/cdn\.jsdelivr\.net\/gh\/LuminaryLabs-Dev\/NexusEngine@main\/src\/index\.js/);
assert.doesNotMatch(entry, /NexusRealtime@main/);
assert.match(entry, /getStonewakeFloodRescueReadiness/);
assert.match(entry, /getRendererHandoff/);
assert.match(entry, /rendererConsumesDescriptorsOnly/);
assert.doesNotMatch(kitSource, /document\.|querySelector|requestAnimationFrame|canvas|getContext|THREE|WebGL|AudioContext/);

const kit = createStonewakeFloodRescueReadinessDomainKit();
for (let index = 0; index < 10; index += 1) {
  const level = {
    bounds: { width: 2600 + index * 50, height: 820 },
    platforms: [
      { id: "floor", x: 42, y: 780, w: 2500, h: 48, role: "floor" },
      { id: "p1", x: 120, y: 550 - index * 4, w: 190, h: 30, role: "start", focusId: "start" },
      { id: "p2", x: 620, y: 470, w: 170, h: 30, role: "physical-puzzle", focusId: "focus-1" },
      { id: "p3", x: 1180, y: 390, w: 180, h: 30, role: "machine-interaction", focusId: "focus-2" },
      { id: "p4", x: 1880, y: 350, w: 220, h: 30, role: "finish", focusId: "finish" }
    ],
    objects: [
      { id: "player", type: "player", x: 140, y: 504 },
      { id: "chain-1", type: "chain", x: 720, y: 230, h: 240 },
      { id: "finish-gate-1", type: "finish-gate", x: 2140, y: 270 }
    ]
  };
  const state = {
    player: { x: 160 + index * 110, y: 510 - index * 7, w: 24, h: 46 },
    water: { level: 770 - index * 45 },
    camera: { x: index * 90, y: 0 },
    plate: index > 3,
    valve: Math.min(1, index / 7),
    door: Math.min(1, index / 9)
  };
  const readiness = kit.describe({ state, level });
  assert.ok(readiness.rendererHandoff.counts.total >= 8);
  assert.ok(readiness.rescueBellHandoff.readiness >= 0 && readiness.rescueBellHandoff.readiness <= 1);
}

console.log("stonewake flood rescue CDN/state/input smoke passed 10 cases");
