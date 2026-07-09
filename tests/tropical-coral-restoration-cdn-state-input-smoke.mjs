import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTropicalCoralRestorationReadinessDomainKit } from "../experiments/tropical-island-scene/src/tropical-coral-restoration-readiness-domain-kit.js";

const index = readFileSync(new URL("../experiments/tropical-island-scene/index.html", import.meta.url), "utf8");
const entry = readFileSync(new URL("../experiments/tropical-island-scene/src/coral-restoration-readiness-entry.js", import.meta.url), "utf8");
const kitSource = readFileSync(new URL("../experiments/tropical-island-scene/src/tropical-coral-restoration-readiness-domain-kit.js", import.meta.url), "utf8");

assert.ok(index.includes("coral-restoration-readiness-renderer-handoff-pass"), "route advertises coral restoration marker");
assert.ok(index.includes("coral-restoration-readiness-entry.js?v=tropical-island-coral-restoration-20260709"), "route loads coral restoration entry");
assert.ok(entry.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "entry imports NexusEngine main CDN");
assert.ok(!entry.includes("NexusRealtime@"), "entry does not import old NexusRealtime runtime CDN");
assert.ok(entry.includes("getTropicalCoralRestorationReadiness"), "GameHost exposes tropical coral restoration readiness");
assert.ok(entry.includes("getRendererHandoff"), "GameHost renderer handoff is patched by composition");
assert.ok(kitSource.includes("rendererMustNotOwn"), "kit documents ownership boundary");
assert.ok(!/document\.|window\.|requestAnimationFrame|new Audio|THREE\./.test(kitSource), "reusable kit stays outside DOM/render/input/frame ownership");

const kit = createTropicalCoralRestorationReadinessDomainKit();
const simulatedInputs = Array.from({ length: 10 }, (_, index) => ({
  time: index * 5.5,
  orbit: index * 0.27,
  fish: Array.from({ length: index + 1 }, (_, fishIndex) => ({ id: `fish-${fishIndex}` })),
  tideSalvageReadiness: { rendererHandoff: { counts: { total: 12 + index, tideSurgeWindows: index % 4 } } },
  stormClinicReadiness: { rendererHandoff: { counts: { total: 16 + index, raftStretcherLanes: 1 + (index % 5) } } },
  reefRescueReadiness: { rendererHandoff: { counts: { total: 14 + index, snorkelSearchLanes: 2 + (index % 4) } } },
  rainwaterPurificationReadiness: { rendererHandoff: { counts: { total: 20 + index, dawnHydrationStations: 2 + (index % 3) } } },
  mangroveNurseryReadiness: { rendererHandoff: { counts: { total: 22 + index, brackishChannelRibbons: 3 + (index % 3), dawnRangerTagLedgers: 2 + (index % 4) } } }
}));

for (const [index, input] of simulatedInputs.entries()) {
  const readiness = kit.describe(input);
  assert.equal(readiness.rendererHandoff.kind, "renderer-handoff", `case ${index} handoff kind`);
  assert.equal(readiness.rendererHandoff.counts.total, 28, `case ${index} descriptor count`);
  assert.ok(readiness.rendererHandoff.descriptors.bleachingScans.every((scan) => scan.rendererContract.renderer === "presentation-only"), `case ${index} renderer contract`);
  assert.ok(readiness.rendererHandoff.descriptors.diverTransectRoutes.every((route) => Number.isFinite(route.visibilityScore)), `case ${index} diver visibility numeric`);
}

console.log("tropical coral restoration CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring");
