import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createCavalryLogisticsReadinessDomainKit } from "../experiments/The Cavalry of Rome/src/cavalry-logistics-readiness-domain-kit.js";

const pass = readFileSync("experiments/The Cavalry of Rome/src/cavalry-logistics-readiness-pass.js", "utf8");
const kit = readFileSync("experiments/The Cavalry of Rome/src/cavalry-logistics-readiness-domain-kit.js", "utf8");
const experimentEntry = readFileSync("experiments/The Cavalry of Rome/index.html", "utf8");
const liveEntry = readFileSync("apps/the-cavalry-of-rome/index.html", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");
const routedDomainSmoke = readFileSync("tests/cavalry-battlefield-orders-domain-kits-smoke.mjs", "utf8");
const routedCdnSmoke = readFileSync("tests/cavalry-battlefield-orders-cdn-state-input-smoke.mjs", "utf8");
const checks = readFileSync("scripts/run-checks.mjs", "utf8");

assert.ok(pass.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "logistics pass should import NexusEngine main CDN");
assert.ok(!pass.includes("LuminaryLabs-Dev/NexusRealtime@main"), "logistics pass should not import old NexusRealtime runtime CDN");
assert.ok(pass.includes("createCavalryLogisticsReadinessDomainKit"), "logistics pass should import the domain kit");
assert.ok(pass.includes("getCavalryLogisticsReadiness"), "GameHost should expose logistics readiness state");
assert.ok(pass.includes("getRendererHandoff"), "GameHost should compose renderer handoff");
assert.ok(pass.includes("supplyDepotRadii"), "renderer should consume supply depot descriptors");
assert.ok(pass.includes("forageCorridors"), "renderer should consume forage corridor descriptors");
assert.ok(pass.includes("roadStrainThreads"), "renderer should consume road strain descriptors");
assert.ok(pass.includes("siegeReadinessSignals"), "renderer should consume siege readiness descriptors");
assert.ok(pass.includes("courierOrderPulses"), "renderer should consume courier pulse descriptors");
assert.ok(pass.includes("winterAttritionWarnings"), "renderer should consume winter warning descriptors");
assert.ok(pass.includes("rendererConsumes = \"descriptors-only\""), "presentation pass should mark descriptor-only consumption");
assert.ok(kit.includes("renderer consumes descriptors only"), "kit tree should document descriptor-only renderer handoff");
assert.ok(kit.includes("forbiddenOwnership"), "kit should document ownership boundaries");
assert.ok(experimentEntry.includes("cavalry-logistics-readiness-pass.js?v=campaign-035"), "experiment route should load cache-busted logistics pass");
assert.ok(liveEntry.includes("cavalry-logistics-readiness-pass.js?v=campaign-035"), "live route should load cache-busted logistics pass");
assert.ok(liveEntry.includes("campaign-041-standard-bearer-morale"), "live route should expose the current build stamp");
assert.ok(manifest.includes("cavalry-logistics-readiness-domain-kit"), "manifest should list the logistics readiness domain kit");
assert.ok(routedDomainSmoke.includes("./cavalry-logistics-readiness-domain-kits-smoke.mjs"), "existing wired domain smoke should import logistics kit smoke");
assert.ok(routedCdnSmoke.includes("./cavalry-logistics-readiness-cdn-state-input-smoke.mjs"), "existing wired CDN smoke should import logistics CDN/state smoke");
assert.ok(checks.includes("tests/cavalry-battlefield-orders-domain-kits-smoke.mjs"), "full/deploy checks should still route Cavalry domain smoke");
assert.ok(checks.includes("tests/cavalry-battlefield-orders-cdn-state-input-smoke.mjs"), "full/deploy checks should still route Cavalry CDN smoke");

const inputCases = Array.from({ length: 10 }, (_, i) => ({
  sizeId: "logistics-cdn-smoke",
  preset: { label: "Logistics CDN Smoke", rivals: 2, worldW: 760, worldH: 480, actions: 4 },
  turn: i + 1,
  actions: i % 4,
  from: "rome-a",
  to: i % 2 ? "enemy-a" : "frontier-a",
  draft: { l: 2 + i, m: i % 3, h: i % 4 === 0 ? 1 : 0 },
  camera: { x: 230, y: 160, z: 1 + i * 0.05 },
  cells: [
    { id: "rome-a", x: 125 + i, y: 164, owner: "player", t: { l: 4 + i, m: 2, h: 1 }, n: ["rome-b", "frontier-a", "enemy-a"] },
    { id: "rome-b", x: 215, y: 214 + i, owner: "player", t: { l: 3, m: 1 + i % 2, h: 1 }, n: ["rome-a", "frontier-a", "enemy-a"] },
    { id: "frontier-a", x: 306, y: 190, owner: null, t: { l: 0, m: 0, h: 0 }, n: ["rome-a", "rome-b", "enemy-a"] },
    { id: "enemy-a", x: 394, y: 238, owner: "ai1", t: { l: 2, m: 2, h: i % 2 }, n: ["rome-a", "rome-b", "frontier-a"] }
  ]
}));

const domainKit = createCavalryLogisticsReadinessDomainKit();
for (const input of inputCases) {
  const described = domainKit.describe(input);
  assert.equal(described.source.route, "the-cavalry-of-rome", "logistics domain source should identify the route");
  assert.ok(described.rendererHandoff.rendererConsumesDescriptorsOnly, "logistics handoff should remain descriptor-only");
  assert.ok(described.rendererHandoff.counts.supplyDepotRadii >= 1, "state should expose supply depot readability");
  assert.ok(described.rendererHandoff.counts.forageCorridors >= 1, "state should expose forage corridor readability");
  assert.ok(described.rendererHandoff.counts.roadStrainThreads >= 1, "state should expose road strain readability");
  assert.ok(described.rendererHandoff.counts.siegeReadinessSignals >= 1, "state should expose siege readiness readability");
  assert.equal(described.rendererHandoff.counts.courierOrderPulses, 2, "state should expose two courier pulses");
  assert.ok(described.rendererHandoff.counts.winterAttritionWarnings >= 1, "state should expose winter warning readability");
  assert.doesNotThrow(() => JSON.stringify(described), "state/input descriptors should be serializable");
}

console.log("Cavalry logistics readiness CDN/state/input smoke passed.");
