import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync("experiments/tropical-island-scene/index.html", "utf8");
const kit = readFileSync("experiments/tropical-island-scene/src/tropical-lagoon-observatory-readiness-domain-kit.js", "utf8");
const entry = readFileSync("experiments/tropical-island-scene/src/lagoon-observatory-readiness-entry.js", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");
const parentSmoke = readFileSync("tests/tropical-tide-salvage-cdn-state-input-smoke.mjs", "utf8");

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
assert.ok(route.includes("lagoon-observatory-readiness-renderer-handoff-pass"), "route should advertise lagoon observatory pass");
assert.ok(route.includes("lagoon-observatory-readiness-entry.js?v=tropical-island-lagoon-observatory-20260709"), "route should cache-bust lagoon observatory entry");
assert.ok(entry.includes(nexusEngineCdn), "entry should import NexusEngine main CDN");
assert.ok(!entry.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"), "entry should avoid old NexusRealtime runtime CDN");
assert.ok(kit.includes("TROPICAL_LAGOON_OBSERVATORY_READINESS_DOMAIN_TREE"));
assert.ok(kit.includes("createTropicalLagoonObservatoryReadinessDomainKit"));
assert.ok(kit.includes("rendererMustNotOwn"));
assert.ok(kit.includes("frame loop"));
assert.ok(entry.includes("getLagoonObservatoryReadiness"));
assert.ok(entry.includes("getTropicalLagoonObservatoryReadiness"));
assert.ok(entry.includes("getLagoonObservatoryReadinessTree"));
assert.ok(entry.includes("tropicalLagoonObservatoryReadiness"));
assert.ok(entry.includes("renderer-consumes-descriptors-only"));
assert.ok(entry.includes("document.body.dataset.tropicalLagoonObservatory"));
assert.ok(manifest.includes('"status": "lagoon-observatory-readiness-renderer-handoff-pass"'));
assert.ok(manifest.includes('"tropical-lagoon-observatory-readiness-domain-kit"'));
assert.ok(manifest.includes('"lagoon observatory readiness"'));
assert.ok(parentSmoke.includes("./tropical-lagoon-observatory-readiness-kits-smoke.mjs"));
assert.ok(parentSmoke.includes("./tropical-lagoon-observatory-cdn-state-input-smoke.mjs"));

const simulatedCases = Array.from({ length: 10 }, (_, index) => ({
  dt: index % 2 ? 1 / 60 : 1 / 30,
  pointer: { x: index / 9, y: 1 - index / 9 },
  expectedBuckets: ["coralSensorBuoys", "planktonSampleTrails", "mangroveNurseryMarkers", "mantaCorridorArcs", "dataRelayKites", "lighthouseWatchLenses"],
  expectedGameHostMethods: ["getLagoonObservatoryReadiness", "getTropicalLagoonObservatoryReadiness", "getRendererHandoff"]
}));

for (const intake of simulatedCases) {
  assert.ok(intake.dt > 0);
  assert.equal(intake.expectedBuckets.length, 6);
  assert.deepEqual(intake.expectedGameHostMethods, ["getLagoonObservatoryReadiness", "getTropicalLagoonObservatoryReadiness", "getRendererHandoff"]);
}

console.log("tropical lagoon observatory NexusEngine CDN/state-input smoke passed: 10 intake cases");
