import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createSoraSkyRadioBeaconReadinessDomainKit } from "../experiments/sora-the-infinite/sora-sky-radio-beacon-readiness-kits.js";

const root = process.cwd();
const routeRoot = join(root, "experiments", "sora-the-infinite");
const html = readFileSync(join(routeRoot, "index.html"), "utf8");
const entry = readFileSync(join(routeRoot, "sora-sky-radio-beacon-entry.js"), "utf8");
const kit = readFileSync(join(routeRoot, "sora-sky-radio-beacon-readiness-kits.js"), "utf8");

assert.match(html, /sky-radio-beacon-rescue-readiness-renderer-handoff-pass/, "route should advertise sky radio beacon rescue readiness pass");
assert.match(html, /sora-sky-radio-beacon-entry\.js\?v=sky-radio-beacon-rescue-readiness-v1/, "route should load cache-busted sky radio beacon entry");
assert.match(entry, /https:\/\/cdn\.jsdelivr\.net\/gh\/LuminaryLabs-Dev\/NexusEngine@main\/src\/index\.js/, "entry should import NexusEngine main CDN");
assert.doesNotMatch(entry, /LuminaryLabs-Dev\/NexusRealtime@main|NexusRealtime@/, "changed entry should not import old NexusRealtime CDN");
assert.match(entry, /getSkyRadioBeaconRescueReadiness/, "entry should expose sky radio beacon readiness accessor");
assert.match(entry, /getSkyRadioBeaconRescueReadinessTree/, "entry should expose domain tree accessor");
assert.match(entry, /getRendererHandoff/, "entry should compose renderer handoff");
assert.doesNotMatch(kit, /\b(document|window|globalThis|requestAnimationFrame|setTimeout|setInterval|fetch|THREE|WebGL|AudioContext|localStorage|sessionStorage)\b/, "reusable kit should stay out of renderer, browser, assets, frame-loop, and storage ownership");

const domain = createSoraSkyRadioBeaconReadinessDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => ({
  tick: index * 13,
  readiness: Math.min(1, 0.24 + index * 0.071),
  input: {
    thrust: Math.min(1, index / 6),
    bank: Math.sin(index) * 0.7,
    climb: index % 2 ? 0.55 : -0.15,
    pointerActive: index >= 3,
    pointerX: index / 9,
    pointerY: 0.2 + index / 16
  },
  skyRescueReadiness: { rendererHandoff: { counts: { total: 15 + index } } },
  skyLighthouseReadiness: { rendererHandoff: { counts: { total: 12 + index } } },
  skyRookeryMigrationReadiness: { rendererHandoff: { counts: { total: 9 + index } } },
  starOrchardRescueReadiness: { rendererHandoff: { counts: { total: 20 + index } } }
}));

for (const intake of cases) {
  const result = domain.describe(intake);
  assert.equal(result.rendererHandoff.contract, "renderer-consumes-descriptors-only");
  assert.equal(result.rendererHandoff.counts.total, 26);
  assert.ok(result.readinessScore >= 0 && result.readinessScore <= 1);
  assert.ok(result.stormRisk >= 0 && result.stormRisk <= 1);
}

console.log("Sora sky radio beacon rescue CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
