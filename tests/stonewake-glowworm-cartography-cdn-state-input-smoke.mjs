import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createStonewakeGlowwormCartographyReadinessDomainKit } from "../games/stonewake-depths/stonewake-glowworm-cartography-kits.js";

const root = process.cwd();
const routeRoot = join(root, "games", "stonewake-depths");
const html = readFileSync(join(routeRoot, "index.html"), "utf8");
const entry = readFileSync(join(routeRoot, "stonewake-glowworm-cartography-entry.js"), "utf8");
const kit = readFileSync(join(routeRoot, "stonewake-glowworm-cartography-kits.js"), "utf8");

assert.match(html, /glowworm-cartography-readiness-renderer-handoff-pass/, "route should advertise glowworm cartography readiness pass");
assert.match(html, /stonewake-glowworm-cartography-entry\.js\?v=stonewake-glowworm-cartography-readiness-20260709/, "route should load cache-busted glowworm cartography entry");
assert.match(entry, /https:\/\/cdn\.jsdelivr\.net\/gh\/LuminaryLabs-Dev\/NexusEngine@main\/src\/index\.js/, "entry should import NexusEngine main CDN");
assert.doesNotMatch(entry, /LuminaryLabs-Dev\/NexusRealtime@main|NexusRealtime@/, "changed entry should not import old NexusRealtime CDN");
assert.match(entry, /getStonewakeGlowwormCartographyReadiness/, "entry should expose Stonewake readiness accessor");
assert.match(entry, /getStonewakeGlowwormCartographyTree/, "entry should expose domain tree accessor");
assert.match(entry, /getRendererHandoff/, "entry should compose renderer handoff");
assert.doesNotMatch(kit, /\b(document|window|globalThis|requestAnimationFrame|setTimeout|setInterval|fetch|THREE|WebGL|AudioContext|localStorage|sessionStorage)\b/, "reusable kit should stay out of renderer, browser, assets, frame-loop, and storage ownership");

const domain = createStonewakeGlowwormCartographyReadinessDomainKit();
const level = {
  bounds: { width: 3200, height: 820 },
  platforms: Array.from({ length: 15 }, (_, index) => ({ id: `p-${index}`, x: 100 + index * 190, y: 620 - (index % 5) * 50, w: 140 + (index % 3) * 20, h: 20, role: "route" })),
  objects: [
    { type: "weighted-trigger", x: 770, y: 580 },
    { type: "valve", x: 1080, y: 470 },
    { type: "finish-gate", x: 2920, y: 360 },
    { type: "chain", x: 440, y: 310, h: 260 }
  ],
  hazards: [{ type: "rising-water", startLevel: 790 }]
};

const cases = Array.from({ length: 10 }, (_, index) => ({
  level,
  state: {
    time: index * 4,
    carry: index % 2 === 0,
    plate: index >= 5,
    valve: Math.min(1, index / 7),
    door: Math.min(1, Math.max(0, (index - 4) / 5)),
    camera: { x: index * 160, y: index * 10 },
    player: { x: 95 + index * 245, y: 545 - (index % 4) * 38, w: 24, h: 46, vx: 70, vy: index % 2 ? -35 : 18 },
    water: { level: 790 - index * 22, speed: 2.2 }
  }
}));

for (const intake of cases) {
  const result = domain.describe(intake);
  assert.equal(result.rendererHandoff.contract, "renderer-consumes-descriptors-only");
  assert.ok(result.rendererHandoff.counts.total >= 31);
  assert.ok(result.readiness >= 0 && result.readiness <= 1);
  assert.ok(result.darknessRisk >= 0 && result.darknessRisk <= 1);
}

console.log("Stonewake glowworm cartography CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
