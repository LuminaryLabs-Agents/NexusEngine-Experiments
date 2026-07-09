import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createFoglineSearchDogRescueReadinessDomainKit } from "../experiments/fogline-relay/src/fogline-search-dog-rescue-readiness-kits.js";

const routeHtml = readFileSync(new URL("../experiments/fogline-relay/index.html", import.meta.url), "utf8");
const entrySource = readFileSync(new URL("../experiments/fogline-relay/src/fogline-search-dog-rescue-readiness-entry.js", import.meta.url), "utf8");
const kitSource = readFileSync(new URL("../experiments/fogline-relay/src/fogline-search-dog-rescue-readiness-kits.js", import.meta.url), "utf8");

assert.match(routeHtml, /search-dog-rescue-readiness-renderer-handoff-pass/);
assert.match(routeHtml, /fogline-search-dog-rescue-readiness-entry\.js/);
assert.match(entrySource, /https:\/\/cdn\.jsdelivr\.net\/gh\/LuminaryLabs-Dev\/NexusEngine@main\/src\/index\.js/);
assert.doesNotMatch(entrySource, /NexusRealtime@/);
assert.match(entrySource, /getSearchDogRescueReadiness/);
assert.match(entrySource, /getFoglineSearchDogRescueReadiness/);
assert.match(entrySource, /getSearchDogRescueReadinessTree/);
assert.match(entrySource, /getRendererHandoff/);
for (const forbidden of ["document.", "window.", "requestAnimationFrame", "THREE.", "Audio(", "fetch(", "localStorage"]) {
  assert.doesNotMatch(kitSource, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}
assert.match(kitSource, /WebGL runtime/);

const kit = createFoglineSearchDogRescueReadinessDomainKit();
const simulatedInputs = Array.from({ length: 10 }, (_, index) => ({
  level: {
    bounds: { minX: -18, maxX: 18, minZ: -8, maxZ: 62 },
    route: [
      { id: "kennel", x: -15, z: -6 },
      { id: "marsh", x: -12 + index * 0.1, z: 5 },
      { id: "cedar", x: -5, z: 17 + index * 0.4 },
      { id: "ridge", x: 2, z: 31 },
      { id: "copse", x: 8, z: 43 },
      { id: "safehouse", x: 3, z: 59 }
    ]
  },
  game: {
    player: { position: { z: -8 + index * 7.8 }, scan: index % 2 === 0 },
    scans: index,
    scentMarks: Math.floor(index / 2),
    blanketCaches: Math.floor(index / 3),
    survivorsEscorted: Math.floor(index / 4),
    fogPressure: Math.max(0.2, 0.75 - index * 0.045),
    focus: index > 5 ? "handler" : "scan"
  },
  time: index * 11
}));

let lastReadiness = 0;
for (const input of simulatedInputs) {
  const result = kit.describe(input);
  assert.equal(result.rendererHandoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(result.rendererHandoff.descriptorCount, 19);
  assert.ok(result.readiness >= 0 && result.readiness <= 1);
  assert.ok(result.pressure >= 0 && result.pressure <= 1);
  assert.ok(result.drawOrder.every((descriptor) => descriptor.rendererContract.rendererMustNotOwn.includes("timing loop")));
  lastReadiness = result.readiness;
}
assert.ok(lastReadiness > simulatedInputs[0].game.fogPressure * 0.2, "late route should produce useful readiness");
console.log("Fogline search dog rescue CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
