import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMeadowSoilMyceliumRestorationDomainKit } from "../experiments/high-fidelity-meadow/src/meadow-soil-mycelium-restoration-kits.js";

const index = readFileSync(new URL("../experiments/high-fidelity-meadow/index.html", import.meta.url), "utf8");
const entry = readFileSync(new URL("../experiments/high-fidelity-meadow/src/meadow-soil-mycelium-restoration-entry.js", import.meta.url), "utf8");
const kitSource = readFileSync(new URL("../experiments/high-fidelity-meadow/src/meadow-soil-mycelium-restoration-kits.js", import.meta.url), "utf8");

assert.ok(index.includes("soil-mycelium-restoration-readiness-renderer-handoff-pass"), "route advertises soil mycelium marker");
assert.ok(index.includes("meadow-soil-mycelium-restoration-entry.js?v=20260709-soil-mycelium-restoration-1"), "route loads soil mycelium entry");
assert.ok(entry.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "entry imports NexusEngine main CDN");
assert.ok(!entry.includes("NexusRealtime@"), "entry does not import old NexusRealtime runtime CDN");
assert.ok(entry.includes("getMeadowSoilMyceliumRestoration"), "GameHost exposes meadow soil mycelium readiness");
assert.ok(entry.includes("getRendererHandoff"), "GameHost renderer handoff is patched by composition");
assert.ok(kitSource.includes("rendererMustNotOwn"), "kit documents ownership boundary");
assert.ok(!/document\.|window\.|requestAnimationFrame|new Audio|THREE\./.test(kitSource), "reusable kit stays outside DOM/render/input/frame ownership");

const kit = createMeadowSoilMyceliumRestorationDomainKit();
const simulatedInputs = Array.from({ length: 10 }, (_, index) => ({
  seed: `cdn-soil-${index}`,
  width: 196,
  depth: 196,
  dayAmount: 0.25 + index * 0.05,
  windSeed: index * 0.11,
  flowers: Array.from({ length: 10 + index * 3 }, (_, flowerIndex) => ({
    x: -40 + flowerIndex * 5.2,
    z: Math.cos(flowerIndex * 0.52 + index) * 24
  })),
  sheep: Array.from({ length: 3 + (index % 6) }, (_, sheepIndex) => ({ id: `sheep-${sheepIndex}` })),
  creekIrrigationReadiness: { rendererHandoff: { counts: { total: 20 + index, creekRibbons: 5 + (index % 4) } } },
  pollinatorRescueReadiness: { rendererHandoff: { counts: { total: 18 + index, beeSafeLanes: 2 + (index % 5) } } },
  harvestFestivalReadiness: { rendererHandoff: { counts: { total: 12 + index, lanternRows: index % 4 } } },
  nightWatchReadiness: { rendererHandoff: { counts: { total: 16 + index, watchLanterns: 1 + (index % 5) } } },
  flockSafetyReadiness: { rendererHandoff: { counts: { total: 14 + index, shelterRings: 2 + (index % 4) } } }
}));

for (const [index, input] of simulatedInputs.entries()) {
  const readiness = kit.describe(input);
  assert.equal(readiness.rendererHandoff.kind, "renderer-handoff", `case ${index} handoff kind`);
  assert.equal(readiness.rendererHandoff.counts.total, 27, `case ${index} descriptor count`);
  assert.ok(readiness.rendererHandoff.descriptors.myceliumThreads.every((thread) => Number.isFinite(thread.vitality)), `case ${index} vitality numeric`);
  assert.ok(readiness.rendererHandoff.descriptors.hedgerowWindbreaks.every((windbreak) => windbreak.rendererContract.rendererMustOwn.includes("palette")), `case ${index} renderer contract`);
}

console.log("meadow soil mycelium restoration CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring");
