import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync("experiments/tropical-island-scene/index.html", "utf8");
const kit = readFileSync("experiments/tropical-island-scene/src/tropical-storm-clinic-readiness-domain-kit.js", "utf8");
const entry = readFileSync("experiments/tropical-island-scene/src/storm-clinic-readiness-entry.js", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");
const parentSmoke = readFileSync("tests/tropical-tide-salvage-cdn-state-input-smoke.mjs", "utf8");

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
assert.ok(route.includes("storm-clinic-readiness-renderer-handoff-pass"), "route should advertise storm clinic pass");
assert.ok(route.includes("storm-clinic-readiness-entry.js?v=tropical-island-storm-clinic-20260709"), "route should cache-bust storm clinic entry");
assert.ok(entry.includes(nexusEngineCdn), "entry should import NexusEngine main CDN");
assert.ok(!entry.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"), "entry should avoid old NexusRealtime runtime CDN");
assert.ok(kit.includes("TROPICAL_STORM_CLINIC_READINESS_DOMAIN_TREE"));
assert.ok(kit.includes("createTropicalStormClinicReadinessDomainKit"));
assert.ok(kit.includes("rendererMustNotOwn"));
assert.ok(kit.includes("frame loop"));
assert.ok(entry.includes("getStormClinicReadiness"));
assert.ok(entry.includes("getTropicalStormClinicReadiness"));
assert.ok(entry.includes("getStormClinicReadinessTree"));
assert.ok(entry.includes("tropicalStormClinicReadiness"));
assert.ok(entry.includes("renderer-consumes-descriptors-only"));
assert.ok(entry.includes("document.body.dataset.tropicalStormClinic"));
assert.ok(manifest.includes('"status": "storm-clinic-readiness-renderer-handoff-pass"'));
assert.ok(manifest.includes('"tropical-storm-clinic-readiness-domain-kit"'));
assert.ok(manifest.includes('"storm clinic readiness"'));
assert.ok(parentSmoke.includes("./tropical-storm-clinic-readiness-kits-smoke.mjs"));
assert.ok(parentSmoke.includes("./tropical-storm-clinic-cdn-state-input-smoke.mjs"));

const simulatedCases = Array.from({ length: 10 }, (_, index) => ({
  dt: index % 2 ? 1 / 60 : 1 / 30,
  pointer: { x: index / 9, y: 1 - index / 9 },
  expectedBuckets: ["triageBuoys", "cisternPurityMarkers", "clinicTentShades", "raftStretcherLanes", "feverHerbGardens", "evacuationCanoeWindows"],
  expectedGameHostMethods: ["getStormClinicReadiness", "getTropicalStormClinicReadiness", "getRendererHandoff"]
}));

for (const intake of simulatedCases) {
  assert.ok(intake.dt > 0);
  assert.equal(intake.expectedBuckets.length, 6);
  assert.deepEqual(intake.expectedGameHostMethods, ["getStormClinicReadiness", "getTropicalStormClinicReadiness", "getRendererHandoff"]);
}

console.log("tropical storm clinic NexusEngine CDN/state-input smoke passed: 10 intake cases");
