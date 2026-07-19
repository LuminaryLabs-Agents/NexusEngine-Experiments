import "./cavalry-field-hospital-readiness-kits-smoke.mjs";
import "./cavalry-field-hospital-cdn-state-input-smoke.mjs";
import "./cavalry-grain-convoy-readiness-kits-smoke.mjs";
import "./cavalry-grain-convoy-cdn-state-input-smoke.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createCavalryCampaignFractalDomainKit } from "../experiments/The Cavalry of Rome/src/cavalry-campaign-fractal-domain-kit.js";

const pass = readFileSync("experiments/The Cavalry of Rome/src/cavalry-campaign-fractal-handoff-pass.js", "utf8");
const kit = readFileSync("experiments/The Cavalry of Rome/src/cavalry-campaign-fractal-domain-kit.js", "utf8");
const ordersKit = readFileSync("experiments/The Cavalry of Rome/src/cavalry-battlefield-orders-domain-kit.js", "utf8");
const experimentEntry = readFileSync("experiments/The Cavalry of Rome/index.html", "utf8");
const liveEntry = readFileSync("apps/the-cavalry-of-rome/index.html", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");

assert.ok(pass.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "Cavalry fractal handoff should import NexusEngine main CDN");
assert.ok(!pass.includes("LuminaryLabs-Dev/NexusRealtime@main"), "changed Cavalry handoff should not import old NexusRealtime runtime CDN");
assert.ok(pass.includes("CavalryCampaignFractal"), "handoff should expose CavalryCampaignFractal state");
assert.ok(pass.includes("getCavalryBattlefieldOrders"), "handoff should expose Cavalry battlefield orders state");
assert.ok(pass.includes("getRendererHandoff"), "handoff should expose renderer handoff access");
assert.ok(pass.includes("rendererConsumes = \"descriptors-only\""), "presentation pass should mark descriptor-only consumption");
assert.ok(kit.includes("renderer consumes descriptors only"), "kit tree should document descriptor-only renderer handoff");
assert.ok(kit.includes("forbiddenOwnership"), "kit should document forbidden ownership boundaries");
assert.ok(ordersKit.includes("cavalry-battlefield-orders-domain"), "orders kit should document battlefield orders domain");
assert.ok(experimentEntry.includes("cavalry-campaign-fractal-handoff-pass.js?v=campaign-035"), "experiment entry should load the Cavalry fractal handoff pass");
assert.ok(liveEntry.includes("cavalry-campaign-fractal-handoff-pass.js?v=campaign-035"), "live entry should load the Cavalry fractal handoff pass");
assert.ok(liveEntry.includes("cavalry-field-hospital-readiness-pass.js?v=campaign-037"), "live entry should load field hospital readiness pass");
assert.ok(experimentEntry.includes("cavalry-field-hospital-readiness-pass.js?v=campaign-037"), "experiment entry should load field hospital readiness pass");
assert.ok(liveEntry.includes("cavalry-grain-convoy-readiness-pass.js?v=campaign-038"), "live entry should load grain convoy readiness pass");
assert.ok(experimentEntry.includes("cavalry-grain-convoy-readiness-pass.js?v=campaign-038"), "experiment entry should load grain convoy readiness pass");
assert.ok(liveEntry.includes("campaign-041-standard-bearer-morale"), "live route should expose the current build stamp");
assert.ok(manifest.includes("the-cavalry-of-rome"), "manifest should include The Cavalry of Rome canonical entry");
assert.ok(manifest.includes("cavalry-campaign-fractal-domain-kit"), "manifest should list the Cavalry fractal domain kit");
assert.ok(manifest.includes("cavalry-battlefield-orders-domain-kit"), "manifest should list the Cavalry battlefield orders domain kit");
assert.ok(manifest.includes("cavalry-field-hospital-readiness-domain-kit"), "manifest should list the Cavalry field hospital domain kit");
assert.ok(manifest.includes("cavalry-grain-convoy-readiness-domain-kit"), "manifest should list the Cavalry grain convoy domain kit");

const inputCases = Array.from({ length: 10 }, (_, i) => ({
  sizeId: "smoke",
  preset: { label: "Smoke", rivals: 2, worldW: 640, worldH: 420 },
  turn: i + 1,
  actions: i % 2,
  from: i % 2 ? "rome-a" : "rome-b",
  to: i % 3 ? "frontier-a" : null,
  draft: { l: 1 + i, m: i % 3, h: i % 4 === 0 ? 1 : 0 },
  camera: { x: 240, y: 160, z: 1 + i * 0.05 },
  cells: [
    { id: "rome-a", x: 130 + i, y: 160, owner: "player", t: { l: 4 + i, m: 2, h: 1 }, n: ["frontier-a", "rome-b"] },
    { id: "rome-b", x: 210, y: 210 + i, owner: "player", t: { l: 3, m: 1 + i % 2, h: 1 }, n: ["rome-a", "enemy-a"] },
    { id: "frontier-a", x: 300, y: 185, owner: null, t: { l: 0, m: 0, h: 0 }, n: ["rome-a", "enemy-a"] },
    { id: "enemy-a", x: 390, y: 235, owner: "ai1", t: { l: 2, m: 2, h: i % 2 }, n: ["frontier-a", "rome-b"] }
  ]
}));

const domainKit = createCavalryCampaignFractalDomainKit();
for (const input of inputCases) {
  const described = domainKit.describe(input);
  assert.equal(described.source.route, "the-cavalry-of-rome", "domain source should identify the route");
  assert.ok(described.rendererHandoff.rendererConsumesDescriptorsOnly, "handoff should remain descriptor-only");
  assert.ok(described.rendererHandoff.counts.supplyLines >= 1, "input should expose supply line readability");
  assert.ok(described.rendererHandoff.counts.cohesionFields >= 3, "input should expose unit cohesion fields");
  assert.equal(described.rendererHandoff.counts.maneuverChoices, 4, "input should expose command choice bands");
  assert.doesNotThrow(() => JSON.stringify(described), "state/input smoke descriptors should be serializable");
}

console.log("Cavalry campaign fractal CDN/state/input smoke passed.");
