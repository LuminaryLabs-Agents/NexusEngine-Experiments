import "./tropical-storm-clinic-readiness-kits-smoke.mjs";
import "./tropical-storm-clinic-cdn-state-input-smoke.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTropicalTideSalvageReadinessDomainKit } from "../experiments/tropical-island-scene/src/tropical-tide-salvage-readiness-domain-kit.js";

const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const route = readFileSync("experiments/tropical-island-scene/index.html", "utf8");
const entry = readFileSync("experiments/tropical-island-scene/src/tide-salvage-readiness-entry.js", "utf8");
const kitSource = readFileSync("experiments/tropical-island-scene/src/tropical-tide-salvage-readiness-domain-kit.js", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");
const runChecks = readFileSync("scripts/run-checks.mjs", "utf8");

assert.ok(entry.includes(cdn), "tide salvage entry should import NexusEngine main CDN");
assert.ok(route.includes("tropical-island-tide-salvage-20260708"), "route should cache-bust tide salvage overlay");
assert.ok(route.includes("tide salvage"), "route should advertise tide salvage handoff");
assert.ok(route.includes("storm clinic"), "route should advertise storm clinic handoff");
assert.ok(!entry.includes("NexusRealtime-ProtoKits"), "changed tide salvage entry should not import old NexusRealtime ProtoKits");
assert.ok(!kitSource.includes("NexusRealtime"), "new tide salvage kit should remain runtime-neutral");
assert.ok(manifest.includes("tropical-tide-salvage-readiness-domain-kit"), "manifest should register tide salvage domain kit");
assert.ok(runChecks.includes("tests/tropical-tide-salvage-readiness-kits-smoke.mjs"), "full validation should include tide salvage kit smoke");
assert.ok(runChecks.includes("tests/tropical-tide-salvage-cdn-state-input-smoke.mjs"), "full validation should include tide salvage CDN smoke");

const domain = createTropicalTideSalvageReadinessDomainKit({ engine: "NexusEngine main CDN" });
const cases = Array.from({ length: 10 }, (_, index) => ({
  time: index * 10.25,
  orbit: index * 0.29,
  camera: { angle: index * 0.13 },
  input: { pointerDown: index % 2 === 0, dragX: index * 4 },
  floatProps: [{ id: `cargo-${index}`, x: -10 + index * 2, y: 0.8, z: 14 - index }],
  weatherShelterReadability: { rendererHandoff: { counts: { stormFronts: index % 4 } } },
  reefRescueReadiness: { rendererHandoff: { counts: { ripCurrentHazards: 2 + index % 3 } } }
}));

for (const state of cases) {
  const readiness = domain.describe(state);
  const handoff = readiness.rendererHandoff;
  assert.equal(handoff.contract, "renderer-consumes-descriptors-only");
  assert.ok(handoff.descriptors.shipwreckCargoBeacons.length > 0, "state should produce salvage cargo beacons");
  assert.ok(handoff.descriptors.pearlCacheGlimmers.length > 0, "state should produce pearl cache glimmers");
  assert.ok(handoff.descriptors.tideSurgeWindows.length > 0, "state should produce tide surge windows");
  assert.ok(handoff.descriptors.reefCutHazards.length > 0, "state should produce reef cut hazards");
  assert.ok(handoff.descriptors.outriggerRouteThreads.length > 0, "state should produce outrigger route threads");
  assert.ok(handoff.descriptors.sunsetMarketDeliveries.length > 0, "state should produce sunset market deliveries");
  assert.equal(handoff.counts.total, Object.entries(handoff.counts).filter(([key]) => key !== "total").reduce((sum, [, value]) => sum + value, 0));
}

console.log("tropical tide salvage CDN/state-input smoke passed: NexusEngine CDN + 10 intake cases validated with storm clinic routed");
