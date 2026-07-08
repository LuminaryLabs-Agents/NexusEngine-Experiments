import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createCavalryFieldHospitalReadinessDomainKit } from "../experiments/The Cavalry of Rome/src/cavalry-field-hospital-readiness-domain-kit.js";

const CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const pass = readFileSync("experiments/The Cavalry of Rome/src/cavalry-field-hospital-readiness-pass.js", "utf8");
const kit = readFileSync("experiments/The Cavalry of Rome/src/cavalry-field-hospital-readiness-domain-kit.js", "utf8");
const endpoint = readFileSync("apps/the-cavalry-of-rome/index.html", "utf8");
const experimentEntry = readFileSync("experiments/The Cavalry of Rome/index.html", "utf8");
const routedSmoke = readFileSync("tests/cavalry-campaign-fractal-cdn-state-input-smoke.mjs", "utf8");
const manifest = JSON.parse(readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8"));

assert.ok(pass.includes(CDN), "field hospital pass should import NexusEngine main CDN");
assert.ok(!pass.includes("LuminaryLabs-Dev/NexusRealtime@main"), "field hospital pass should not import old NexusRealtime runtime CDN");
assert.ok(kit.includes("renderer consumes descriptors only"), "field hospital kit should declare descriptor-only renderer handoff");
assert.ok(kit.includes("forbiddenOwnership"), "field hospital kit should declare ownership boundary");
assert.ok(endpoint.includes("cavalry-field-hospital-readiness-pass.js?v=campaign-037"), "live endpoint should load field hospital pass with cache marker");
assert.ok(experimentEntry.includes("cavalry-field-hospital-readiness-pass.js?v=campaign-037"), "experiment route should load field hospital pass with cache marker");
assert.ok(routedSmoke.includes("./cavalry-field-hospital-readiness-kits-smoke.mjs"), "Cavalry routed smoke should import kit validation");
assert.ok(routedSmoke.includes("./cavalry-field-hospital-cdn-state-input-smoke.mjs"), "Cavalry routed smoke should import CDN/state validation");

const route = manifest.canonicalRoutes.find((entry) => entry.id === "the-cavalry-of-rome");
assert.ok(route, "manifest should include Cavalry route");
assert.equal(route.status, "field-hospital-readiness-renderer-handoff-pass");
assert.ok(route.domainCutover.includes("cavalry-field-hospital-readiness-domain-kit"), "manifest should register field hospital domain kit");
assert.ok(route.featureParity.includes("field hospital readiness"), "manifest should record field hospital feature parity");

const domainKit = createCavalryFieldHospitalReadinessDomainKit();
const stateCases = Array.from({ length: 10 }, (_, index) => ({
  turn: index + 2,
  actions: (index + 1) % 5,
  sizeId: `state-input-${index}`,
  preset: { label: "field-hospital-smoke", actions: 4, worldW: 1024, worldH: 768 },
  camera: { x: 250 + index * 3, y: 210 + index * 2, z: 1 + index * 0.02 },
  cells: [
    { id: `rome-front-${index}`, owner: "player", x: 170 + index * 9, y: 170, troops: { l: 2 + (index % 4), m: 1, h: 0 }, neighbors: [`enemy-front-${index}`, `rome-rear-${index}`] },
    { id: `rome-rear-${index}`, owner: "player", x: 240 + index * 7, y: 230, troops: { l: 7, m: 2 + (index % 2), h: 1 }, neighbors: [`rome-front-${index}`, `neutral-${index}`] },
    { id: `enemy-front-${index}`, owner: index % 2 ? "gaul" : "carthage", x: 120, y: 150 + index * 6, troops: { l: 4, m: 2, h: 1 }, neighbors: [`rome-front-${index}`] },
    { id: `neutral-${index}`, owner: "neutral", x: 300, y: 250 + index, troops: { l: 2, m: 0, h: 0 }, neighbors: [`rome-rear-${index}`] }
  ],
  input: { selected: index % 2 ? "front" : "rear", pointer: { x: index * 11, y: index * 7 } }
}));

for (const input of stateCases) {
  const state = domainKit.describe(input);
  const handoff = state.rendererHandoff;
  assert.equal(state.source.route, "the-cavalry-of-rome");
  assert.equal(handoff.rendererConsumesDescriptorsOnly, true);
  assert.ok(handoff.counts.woundedCohortTriages >= 1, "state input should produce triage descriptors");
  assert.ok(handoff.counts.medicTentCapacities >= 1, "state input should produce medic tent descriptors");
  assert.ok(handoff.counts.bandageCartRoutes >= 1, "state input should produce bandage cart descriptors");
  assert.ok(handoff.counts.sanitationWellWatches >= 1, "state input should produce sanitation descriptors");
  assert.ok(handoff.counts.stretcherRoadThreads >= 1, "state input should produce stretcher road descriptors");
  assert.equal(handoff.counts.dawnReliefStandards, 2, "state input should produce relief standards");
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(state)));
}

console.log("Cavalry field hospital CDN/state-input smoke passed.");
