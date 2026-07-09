import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createCavalryGrainConvoyReadinessDomainKit } from "../experiments/The Cavalry of Rome/src/cavalry-grain-convoy-readiness-domain-kit.js";

const CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const pass = readFileSync("experiments/The Cavalry of Rome/src/cavalry-grain-convoy-readiness-pass.js", "utf8");
const kit = readFileSync("experiments/The Cavalry of Rome/src/cavalry-grain-convoy-readiness-domain-kit.js", "utf8");
const endpoint = readFileSync("apps/the-cavalry-of-rome/index.html", "utf8");
const experimentEntry = readFileSync("experiments/The Cavalry of Rome/index.html", "utf8");
const routedSmoke = readFileSync("tests/cavalry-campaign-fractal-cdn-state-input-smoke.mjs", "utf8");
const manifest = JSON.parse(readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8"));

assert.ok(pass.includes(CDN), "grain convoy pass should import NexusEngine main CDN");
assert.equal(pass.includes("LuminaryLabs-Dev/NexusRealtime@main"), false, "grain convoy pass should not import old NexusRealtime runtime CDN");
assert.ok(kit.includes("renderer consumes descriptors only"), "grain convoy kit should declare descriptor-only renderer handoff");
assert.ok(kit.includes("forbiddenOwnership"), "grain convoy kit should declare ownership boundary");
assert.ok(endpoint.includes("cavalry-grain-convoy-readiness-pass.js?v=campaign-038"), "live endpoint should load grain convoy pass with cache marker");
assert.ok(experimentEntry.includes("cavalry-grain-convoy-readiness-pass.js?v=campaign-038"), "experiment route should load grain convoy pass with cache marker");
assert.ok(routedSmoke.includes("./cavalry-grain-convoy-readiness-kits-smoke.mjs"), "Cavalry routed smoke should import grain convoy kit validation");
assert.ok(routedSmoke.includes("./cavalry-grain-convoy-cdn-state-input-smoke.mjs"), "Cavalry routed smoke should import grain convoy CDN/state validation");

const route = manifest.canonicalRoutes.find((entry) => entry.id === "the-cavalry-of-rome");
assert.ok(route, "manifest should include Cavalry route");
assert.equal(route.status, "grain-convoy-readiness-renderer-handoff-pass");
assert.ok(route.domainCutover.includes("cavalry-grain-convoy-readiness-domain-kit"), "manifest should register grain convoy domain kit");
assert.ok(route.featureParity.includes("grain convoy readiness"), "manifest should record grain convoy feature parity");

const domainKit = createCavalryGrainConvoyReadinessDomainKit();
const stateCases = Array.from({ length: 10 }, (_, index) => ({
  turn: index + 3,
  actions: (index + 2) % 5,
  sizeId: `grain-state-${index}`,
  preset: { label: "grain-convoy-state-smoke", actions: 5, worldW: 1024, worldH: 768 },
  camera: { x: 260 + index * 4, y: 220 + index * 3, z: 1 + index * 0.018 },
  cells: [
    { id: `rome-granary-${index}`, owner: "player", x: 180 + index * 6, y: 170, troops: { l: 7 + (index % 3), m: 2, h: 1 }, neighbors: [`market-${index}`, `road-${index}`] },
    { id: `road-${index}`, owner: "player", x: 260, y: 225 + index * 4, troops: { l: 3 + (index % 4), m: 1, h: 0 }, neighbors: [`rome-granary-${index}`, `enemy-${index}`, `bridge-${index}`] },
    { id: `market-${index}`, owner: "neutral", x: 140, y: 250 + index * 5, troops: { l: 1, m: 0, h: 0 }, neighbors: [`rome-granary-${index}`, `raider-${index}`] },
    { id: `bridge-${index}`, owner: "neutral", x: 315, y: 330, troops: { l: 0, m: 0, h: 0 }, neighbors: [`road-${index}`] },
    { id: `enemy-${index}`, owner: index % 2 ? "gaul" : "carthage", x: 400, y: 250, troops: { l: 4, m: 2, h: 1 }, neighbors: [`road-${index}`] },
    { id: `raider-${index}`, owner: "samnite", x: 92, y: 300, troops: { l: 3, m: 1, h: 0 }, neighbors: [`market-${index}`] }
  ],
  input: { selected: index % 2 ? "granary" : "market", pointer: { x: index * 13, y: index * 8 } }
}));

for (const input of stateCases) {
  const state = domainKit.describe(input);
  const handoff = state.rendererHandoff;
  assert.equal(state.source.route, "the-cavalry-of-rome");
  assert.equal(handoff.rendererConsumesDescriptorsOnly, true);
  assert.ok(handoff.counts.granaryStockpilePressures >= 1, "state input should produce granary descriptors");
  assert.ok(handoff.counts.muleCartRoutes >= 1, "state input should produce mule cart descriptors");
  assert.ok(handoff.counts.roadAmbushRisks >= 1, "state input should produce ambush descriptors");
  assert.ok(handoff.counts.bridgeRepairCrews >= 1, "state input should produce bridge repair descriptors");
  assert.ok(handoff.counts.legionRationPriorities >= 1, "state input should produce ration descriptors");
  assert.ok(handoff.counts.civilianMarketReliefs >= 1, "state input should produce market relief descriptors");
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(state)));
}

console.log("Cavalry grain convoy CDN/state-input smoke passed.");
