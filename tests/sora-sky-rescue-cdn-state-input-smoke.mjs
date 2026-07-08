import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSoraSkyRescueReadinessDomainKit } from "../experiments/_kits/sora-the-infinite/sora-sky-rescue-readiness-domain-kits.js";

const routeHtml = readFileSync("experiments/sora-the-infinite/index.html", "utf8");
const entrySource = readFileSync("experiments/sora-the-infinite/sora-sky-rescue-entry.js", "utf8");
const kitSource = readFileSync("experiments/_kits/sora-the-infinite/sora-sky-rescue-readiness-domain-kits.js", "utf8");
const manifestSource = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");
const compatibilitySmoke = readFileSync("tests/sora-compatibility-cdn-state-input-smoke.mjs", "utf8");

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const oldRuntimeCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime";

assert.ok(routeHtml.includes("sora-sky-rescue-style.css?v=sky-rescue-readiness-v1"), "route loads sky rescue styles with cache busting");
assert.ok(routeHtml.includes("sora-sky-rescue-entry.js?v=sky-rescue-readiness-v1"), "route loads sky rescue entry with cache busting");
assert.ok(entrySource.includes(nexusEngineCdn), "sky rescue entry imports NexusEngine main CDN");
assert.ok(!entrySource.includes(oldRuntimeCdn), "sky rescue entry does not import old NexusRealtime CDN");
assert.ok(!kitSource.includes(oldRuntimeCdn), "sky rescue kit does not import old NexusRealtime CDN");
assert.ok(entrySource.includes("getSkyRescueReadiness"), "GameHost exposes sky rescue readiness");
assert.ok(entrySource.includes("getSoraSkyRescueReadiness"), "GameHost exposes Sora sky rescue alias");
assert.ok(entrySource.includes("getRendererHandoff"), "sky rescue composes renderer handoff");
assert.ok(entrySource.includes("rendererConsumes = \"descriptors-only\""), "overlay marks descriptor-only renderer consumption");
assert.ok(manifestSource.includes("sora-sky-rescue-readiness-domain-kit"), "manifest registers sky rescue domain kit");
assert.ok(compatibilitySmoke.includes("sora-sky-rescue-cdn-state-input-smoke.mjs"), "compatibility smoke routes sky rescue CDN smoke");
assert.ok(compatibilitySmoke.includes("sora-sky-rescue-readiness-domain-kits-smoke.mjs"), "compatibility smoke routes sky rescue kit smoke");

const kit = createSoraSkyRescueReadinessDomainKit();
const cases = [
  { tick: 1, readiness: 0.18, input: { thrust: 0, bank: 0, climb: 0 } },
  { tick: 2, readiness: 0.27, input: { thrust: 1, bank: -0.45, climb: 0.1 }, microflightTrialReadiness: { summary: { earnedSkyMedals: 1, collectedThermalTokens: 2, avoidableStormBursts: 1, openLandingRunways: 0 } } },
  { tick: 3, readiness: 0.36, input: { thrust: 1, bank: 0.45, climb: 0.6 }, flightplanReadability: { summary: { linkedReturnAnchors: 1 } } },
  { tick: 4, readiness: 0.45, input: { thrust: 0.2, bank: -1, climb: -0.6 }, skyNegotiationReadiness: { summary: { activeStormShelves: 4, openGlidePockets: 0 } } },
  { tick: 5, readiness: 0.55, input: { pointerActive: true, pointerX: 0.2, pointerY: 0.4 }, preflightChallengeReadiness: { summary: { linkedVelocityTethers: 2 } } },
  { tick: 6, readiness: 0.63, input: { pointerActive: true, pointerX: 0.8, pointerY: 0.2 }, skyNegotiationReadiness: { summary: { chosenThermalRungs: 4, openGlidePockets: 3 } } },
  { tick: 7, readiness: 0.72, input: { forward: 1, x: -0.35, y: 0.5 }, flightplanReadability: { summary: { linkedReturnAnchors: 2 } } },
  { tick: 8, readiness: 0.81, input: { thrust: 1, bank: 0.35, climb: 0.5 }, preflightChallengeReadiness: { summary: { linkedVelocityTethers: 5 } } },
  { tick: 9, readiness: 0.9, input: { thrust: 1, bank: 0, climb: 1, launch: true }, skyNegotiationReadiness: { summary: { chosenThermalRungs: 5, usableJetstreams: 5, activeStormShelves: 1, openGlidePockets: 4 } }, flightplanReadability: { summary: { linkedReturnAnchors: 3 } } },
  { tick: 10, readiness: 1, input: { thrust: 1, bank: -0.35, climb: 1, launch: true }, skyNegotiationReadiness: { summary: { chosenThermalRungs: 6, usableJetstreams: 6, activeStormShelves: 0, openGlidePockets: 5, sealedReturnVows: 4 } }, flightplanReadability: { summary: { linkedReturnAnchors: 4 } }, preflightChallengeReadiness: { summary: { linkedVelocityTethers: 7 } }, microflightTrialReadiness: { summary: { earnedSkyMedals: 4, collectedThermalTokens: 7, avoidableStormBursts: 4, openLandingRunways: 3 } } }
];

for (const [index, input] of cases.entries()) {
  const described = kit.describe(input);
  assert.equal(described.kind, "sora-sky-rescue-readiness-domain", `case ${index} domain kind`);
  assert.equal(described.rendererHandoff.contract, "renderer consumes descriptors only", `case ${index} renderer contract`);
  assert.equal(described.rendererHandoff.descriptorCounts.rescueBeacons, 4, `case ${index} rescue beacon count`);
  assert.equal(described.rendererHandoff.descriptorCounts.strandedIslands, 5, `case ${index} stranded island count`);
  assert.equal(described.rendererHandoff.descriptorCounts.gustCorridors, 4, `case ${index} gust corridor count`);
  assert.equal(described.rendererHandoff.descriptorCounts.shadowSqualls, 4, `case ${index} shadow squall count`);
  assert.equal(described.rendererHandoff.descriptorCounts.rescueTethers, 4, `case ${index} rescue tether count`);
  assert.equal(described.rendererHandoff.descriptorCounts.dawnConvoys, 3, `case ${index} dawn convoy count`);
  assert.ok(described.summary.descriptorCount >= 24, `case ${index} descriptor total`);
  assert.doesNotThrow(() => JSON.stringify(described.rendererHandoff), `case ${index} handoff serializable`);
}

console.log(`Sora sky rescue CDN/state/input smoke passed ${cases.length} intake cases.`);
