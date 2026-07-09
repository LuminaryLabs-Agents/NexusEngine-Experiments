import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createOpenAboveThermalCourierRescueReadinessDomainKit } from "../experiments/the-open-above/open-above-thermal-courier-readiness-kits.js";

const root = process.cwd();
const routeRoot = join(root, "experiments", "the-open-above");
const html = readFileSync(join(routeRoot, "index.html"), "utf8");
const entry = readFileSync(join(routeRoot, "open-above-thermal-courier-entry.js"), "utf8");
const kit = readFileSync(join(routeRoot, "open-above-thermal-courier-readiness-kits.js"), "utf8");

assert.match(html, /thermal-courier-rescue-readiness-renderer-handoff-pass/, "route should advertise thermal courier readiness pass");
assert.match(html, /open-above-thermal-courier-entry\.js\?v=thermal-courier-rescue-readiness-20260709/, "route should load cache-busted thermal courier entry");
assert.match(entry, /https:\/\/cdn\.jsdelivr\.net\/gh\/LuminaryLabs-Dev\/NexusEngine@main\/src\/index\.js/, "entry should import NexusEngine main CDN");
assert.doesNotMatch(entry, /LuminaryLabs-Dev\/NexusRealtime@main/, "entry should not import old NexusRealtime CDN");
assert.doesNotMatch(html, /nexus-realtime-page-loader/, "changed route shell should not keep the old NexusRealtime page loader");
assert.match(entry, /getOpenAboveThermalCourierReadiness/, "entry should expose GameHost readiness accessor");
assert.match(entry, /getThermalCourierReadinessTree/, "entry should expose domain tree accessor");
assert.match(entry, /getRendererHandoff/, "entry should compose renderer handoff");
assert.doesNotMatch(kit, /\b(document|window|globalThis|requestAnimationFrame|setTimeout|setInterval|fetch|THREE|WebGL|AudioContext|localStorage|sessionStorage)\b/, "reusable kit should stay out of renderer, browser, assets, frame-loop, and storage ownership");

const domain = createOpenAboveThermalCourierRescueReadinessDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => ({
  frame: index * 47,
  elapsed: index * 1.3,
  input: {
    bankLeft: index % 3 === 0,
    bankRight: index % 3 === 1,
    pitchUp: index % 4 === 0,
    pitchDown: index % 4 === 2,
    boost: index === 1 || index === 8
  },
  body: {
    position: { x: (index - 4) * 120, y: 145 + index * 22, z: (5 - index) * 96 },
    speed: 52 + index * 10,
    altitude: 145 + index * 22,
    clearance: 58 + index * 24,
    rotation: { pitch: (index - 5) * 0.018, yaw: index * 0.31, roll: (index % 5 - 2) * 0.08 },
    velocity: { y: index % 2 === 0 ? -6 + index : 4 - index * 0.25 },
    stability: { sinkRate: index % 2 === 0 ? -6 + index : 4 - index * 0.25 }
  }
}));

for (const state of cases) {
  const result = domain.compose(state);
  assert.equal(result.rendererHandoff.contract, "renderer-consumes-descriptors-only");
  assert.ok(result.rendererHandoff.counts.total >= 27);
  assert.ok(result.summary.readiness >= 0 && result.summary.readiness <= 1);
  assert.ok(result.summary.risk >= 0 && result.summary.risk <= 1);
}

console.log("Open Above thermal courier CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
