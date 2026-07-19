import "./cavalry-logistics-readiness-cdn-state-input-smoke.mjs";
import "./cavalry-diplomatic-command-readiness-cdn-state-input-smoke.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createCavalryBattlefieldOrdersDomainKit } from "../experiments/The Cavalry of Rome/src/cavalry-battlefield-orders-domain-kit.js";

const pass = readFileSync("experiments/The Cavalry of Rome/src/cavalry-campaign-fractal-handoff-pass.js", "utf8");
const ordersKit = readFileSync("experiments/The Cavalry of Rome/src/cavalry-battlefield-orders-domain-kit.js", "utf8");
const experimentEntry = readFileSync("experiments/The Cavalry of Rome/index.html", "utf8");
const liveEntry = readFileSync("apps/the-cavalry-of-rome/index.html", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");
const checks = readFileSync("scripts/run-checks.mjs", "utf8");

assert.ok(pass.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "Cavalry handoff should import NexusEngine main CDN");
assert.ok(!pass.includes("LuminaryLabs-Dev/NexusRealtime@main"), "changed Cavalry handoff should not import old NexusRealtime runtime CDN");
assert.ok(pass.includes("createCavalryBattlefieldOrdersDomainKit"), "handoff should import the battlefield orders domain kit");
assert.ok(pass.includes("getCavalryBattlefieldOrders"), "GameHost should expose battlefield orders state");
assert.ok(pass.includes("cavalryBattlefieldOrders"), "snapshot domain should include battlefield orders descriptors");
assert.ok(pass.includes("scoutingVectors"), "renderer should consume scouting vector descriptors");
assert.ok(pass.includes("flankRiskArcs"), "renderer should consume flank risk descriptors");
assert.ok(pass.includes("rendererConsumes = \"descriptors-only\""), "presentation pass should mark descriptor-only consumption");
assert.ok(ordersKit.includes("renderer consumes descriptors only"), "orders kit tree should document descriptor-only renderer handoff");
assert.ok(ordersKit.includes("forbiddenOwnership"), "orders kit should document forbidden ownership boundaries");
assert.ok(experimentEntry.includes("cavalry-campaign-fractal-handoff-pass.js?v=campaign-035"), "experiment entry should load cache-busted handoff pass");
assert.ok(liveEntry.includes("cavalry-campaign-fractal-handoff-pass.js?v=campaign-035"), "live entry should load cache-busted handoff pass");
assert.ok(liveEntry.includes("campaign-041-standard-bearer-morale"), "live route should expose the current build stamp");
assert.ok(manifest.includes("cavalry-battlefield-orders-domain-kit"), "manifest should list the battlefield orders domain kit");
assert.ok(checks.includes("tests/cavalry-battlefield-orders-domain-kits-smoke.mjs"), "full/deploy checks should include kit smoke");
assert.ok(checks.includes("tests/cavalry-battlefield-orders-cdn-state-input-smoke.mjs"), "full/deploy checks should include CDN/state smoke");

const inputCases = Array.from({ length: 10 }, (_, i) => ({
  sizeId: "orders-smoke",
  preset: { label: "Orders Smoke", rivals: 2, worldW: 720, worldH: 460, actions: 4 },
  turn: i + 1,
  actions: i % 4,
  from: i % 2 ? "rome-a" : "rome-b",
  to: i % 3 ? "frontier-a" : "enemy-a",
  draft: { l: 1 + i, m: i % 3, h: i % 4 === 0 ? 1 : 0 },
  camera: { x: 240, y: 160, z: 1 + i * 0.05 },
  cells: [
    { id: "rome-a", x: 130 + i, y: 160, owner: "player", t: { l: 4 + i, m: 2, h: 1 }, n: ["frontier-a", "rome-b", "enemy-a"] },
    { id: "rome-b", x: 210, y: 210 + i, owner: "player", t: { l: 3, m: 1 + i % 2, h: 1 }, n: ["rome-a", "enemy-a", "frontier-a"] },
    { id: "frontier-a", x: 300, y: 185, owner: null, t: { l: 0, m: 0, h: 0 }, n: ["rome-a", "enemy-a"] },
    { id: "enemy-a", x: 390, y: 235, owner: "ai1", t: { l: 2, m: 2, h: i % 2 }, n: ["frontier-a", "rome-b", "rome-a"] }
  ]
}));

const domainKit = createCavalryBattlefieldOrdersDomainKit();
for (const input of inputCases) {
  const described = domainKit.describe(input);
  assert.equal(described.source.route, "the-cavalry-of-rome", "orders domain source should identify the route");
  assert.ok(described.rendererHandoff.rendererConsumesDescriptorsOnly, "orders handoff should remain descriptor-only");
  assert.ok(described.rendererHandoff.counts.scoutingVectors >= 1, "input should expose scouting vector readability");
  assert.ok(described.rendererHandoff.counts.flankRiskArcs >= 1, "input should expose flank risk readability");
  assert.ok(described.rendererHandoff.counts.reinforcementCallouts >= 1, "input should expose reinforcement readability");
  assert.ok(described.rendererHandoff.counts.attritionForecastChips >= 1, "input should expose attrition forecast readability");
  assert.equal(described.rendererHandoff.counts.turnTempoStandards, 2, "input should expose two turn tempo standards");
  assert.equal(described.rendererHandoff.counts.objectivePressureBanners, 1, "input should expose one objective pressure banner");
  assert.doesNotThrow(() => JSON.stringify(described), "state/input smoke descriptors should be serializable");
}

console.log("Cavalry battlefield orders CDN/state/input smoke passed.");
