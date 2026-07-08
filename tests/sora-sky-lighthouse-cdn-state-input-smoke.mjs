import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSoraSkyLighthouseReadinessDomainKit } from "../experiments/_kits/sora-the-infinite/sora-sky-lighthouse-readiness-domain-kits.js";

const routeHtml = readFileSync("experiments/sora-the-infinite/index.html", "utf8");
const entrySource = readFileSync("experiments/sora-the-infinite/sora-sky-lighthouse-entry.js", "utf8");
const kitSource = readFileSync("experiments/_kits/sora-the-infinite/sora-sky-lighthouse-readiness-domain-kits.js", "utf8");
const manifestSource = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");
const parentSmoke = readFileSync("tests/sora-compatibility-cdn-state-input-smoke.mjs", "utf8");

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const oldRuntimeCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime";

assert.ok(routeHtml.includes("sora-sky-lighthouse-entry.js?v=sky-lighthouse-readiness-v1"), "route loads sky lighthouse readiness overlay");
assert.ok(routeHtml.includes("sky-lighthouse-readiness"), "route advertises sky lighthouse readiness copy/cache marker");
assert.ok(entrySource.includes(nexusEngineCdn), "sky lighthouse entry imports NexusEngine main CDN");
assert.ok(!entrySource.includes(oldRuntimeCdn), "sky lighthouse entry does not import old NexusRealtime runtime CDN");
assert.ok(entrySource.includes("getSkyLighthouseReadiness"), "GameHost exposes sky lighthouse readiness accessor");
assert.ok(entrySource.includes("getRendererHandoff"), "GameHost composes sky lighthouse renderer handoff");
assert.ok(kitSource.includes("renderer consumes descriptors only"), "kit preserves descriptor-only renderer handoff contract");
assert.ok(!kitSource.includes("document."), "kit does not own DOM access");
assert.ok(!kitSource.includes("THREE"), "kit does not own Three.js rendering");
assert.ok(manifestSource.includes("sora-sky-lighthouse-readiness-domain-kit"), "manifest registers sky lighthouse domain kit");
assert.ok(parentSmoke.includes("sora-sky-lighthouse-readiness-kits-smoke.mjs"), "parent Sora smoke routes kit smoke");
assert.ok(parentSmoke.includes("sora-sky-lighthouse-cdn-state-input-smoke.mjs"), "parent Sora smoke routes CDN smoke");

const kit = createSoraSkyLighthouseReadinessDomainKit();
const stateInputCases = [
  { tick: 1, readiness: 0.2, input: { thrust: 0, bank: 0, climb: 0 } },
  { tick: 2, readiness: 0.28, input: { thrust: 1, bank: -0.7, climb: 0.1 }, skyRescueReadiness: { summary: { heardRescueBeacons: 1 } } },
  { tick: 3, readiness: 0.36, input: { thrust: 1, bank: 0.7, climb: 0.4 }, skyNegotiationReadiness: { summary: { usableJetstreams: 2, activeStormShelves: 2 } } },
  { tick: 4, readiness: 0.44, input: { thrust: 0.2, bank: -1, climb: -1 }, skyNegotiationReadiness: { summary: { activeStormShelves: 4 } } },
  { tick: 5, readiness: 0.52, input: { pointerActive: true, pointerX: 0.25, pointerY: 0.75 }, flightplanReadability: { summary: { linkedReturnAnchors: 1 } } },
  { tick: 6, readiness: 0.62, input: { pointerActive: true, pointerX: 0.75, pointerY: 0.25 }, skyRescueReadiness: { summary: { openGustCorridors: 2, avoidableShadowSqualls: 2 } } },
  { tick: 7, readiness: 0.72, input: { forward: 1, x: -0.35, y: 0.45 }, microflightTrialReadiness: { summary: { openLandingRunways: 1 } } },
  { tick: 8, readiness: 0.82, input: { thrust: 1, bank: 0.35, climb: 0.7 }, skyNegotiationReadiness: { summary: { sealedReturnVows: 3, usableJetstreams: 4 } } },
  { tick: 9, readiness: 0.92, input: { thrust: 1, bank: 0, climb: 1, launch: true }, skyRescueReadiness: { summary: { readyDawnConvoys: 2, heardRescueBeacons: 3, openGustCorridors: 3 } } },
  { tick: 10, readiness: 1, input: { thrust: 1, bank: -0.2, climb: 1, launch: true }, skyRescueReadiness: { summary: { readyDawnConvoys: 3, heardRescueBeacons: 4, openGustCorridors: 4, avoidableShadowSqualls: 4 } }, skyNegotiationReadiness: { summary: { sealedReturnVows: 4, usableJetstreams: 6, activeStormShelves: 0 } }, flightplanReadability: { summary: { linkedReturnAnchors: 4 } }, microflightTrialReadiness: { summary: { openLandingRunways: 3 } } }
];

for (const [index, input] of stateInputCases.entries()) {
  const described = kit.describe(input);
  assert.equal(described.kind, "sora-sky-lighthouse-readiness-domain", `case ${index} domain kind`);
  assert.equal(described.rendererHandoff.kind, "sora-sky-lighthouse-renderer-handoff", `case ${index} handoff kind`);
  assert.equal(described.summary.descriptorCount, 23, `case ${index} descriptor count`);
  assert.ok(described.rendererHandoff.descriptorCounts.cloudLenses >= 3, `case ${index} cloud lens count`);
  assert.ok(described.rendererHandoff.forbiddenOwnership.includes("frame-loop ownership"), `case ${index} frame-loop boundary`);
}

console.log(`Sora sky lighthouse CDN/state/input smoke passed ${stateInputCases.length} intake cases.`);
