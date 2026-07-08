import assert from "node:assert/strict";
import {
  SORA_SKY_LIGHTHOUSE_READINESS_DOMAIN_TREE,
  createSoraCloudLensFocusKit,
  createSoraStarPrismAlignmentKit,
  createSoraWindBuoyChainKit,
  createSoraStormLanternWarningKit,
  createSoraRefugeRunwayMarkKit,
  createSoraDawnKeeperLogKit,
  createSoraSkyLighthouseRendererHandoffKit,
  createSoraSkyLighthouseReadinessDomainKit
} from "../experiments/_kits/sora-the-infinite/sora-sky-lighthouse-readiness-domain-kits.js";

const cases = [
  { tick: 1, readiness: 0.18, input: { thrust: 0, bank: 0, climb: 0 } },
  { tick: 2, readiness: 0.27, input: { thrust: 1, bank: -0.45, climb: 0.1 }, skyRescueReadiness: { summary: { heardRescueBeacons: 1, openGustCorridors: 1, avoidableShadowSqualls: 1, readyDawnConvoys: 0 } } },
  { tick: 3, readiness: 0.36, input: { thrust: 1, bank: 0.45, climb: 0.55 }, skyNegotiationReadiness: { summary: { usableJetstreams: 2, sealedReturnVows: 1, activeStormShelves: 1 } } },
  { tick: 4, readiness: 0.45, input: { thrust: 0.4, bank: -1, climb: -0.7 }, skyNegotiationReadiness: { summary: { activeStormShelves: 4, usableJetstreams: 0 } } },
  { tick: 5, readiness: 0.55, input: { pointerActive: true, pointerX: 0.2, pointerY: 0.4 }, flightplanReadability: { summary: { linkedReturnAnchors: 1 } } },
  { tick: 6, readiness: 0.64, input: { pointerActive: true, pointerX: 0.8, pointerY: 0.2 }, skyNegotiationReadiness: { summary: { usableJetstreams: 4, sealedReturnVows: 2, activeStormShelves: 1 } } },
  { tick: 7, readiness: 0.73, input: { forward: 1, x: -0.35, y: 0.45 }, flightplanReadability: { summary: { linkedReturnAnchors: 2 } }, skyRescueReadiness: { summary: { heardRescueBeacons: 2, openGustCorridors: 2, avoidableShadowSqualls: 3, readyDawnConvoys: 1 } } },
  { tick: 8, readiness: 0.82, input: { thrust: 1, bank: 0.35, climb: 0.5 }, microflightTrialReadiness: { summary: { openLandingRunways: 1 } }, skyNegotiationReadiness: { summary: { usableJetstreams: 5, sealedReturnVows: 3, activeStormShelves: 1 } } },
  { tick: 9, readiness: 0.91, input: { thrust: 1, bank: 0, climb: 1, launch: true }, flightplanReadability: { summary: { linkedReturnAnchors: 3 } }, microflightTrialReadiness: { summary: { openLandingRunways: 2 } }, skyRescueReadiness: { summary: { heardRescueBeacons: 3, openGustCorridors: 3, avoidableShadowSqualls: 4, readyDawnConvoys: 2 } } },
  { tick: 10, readiness: 1, input: { thrust: 1, bank: -0.35, climb: 1, launch: true }, skyNegotiationReadiness: { summary: { usableJetstreams: 6, sealedReturnVows: 4, activeStormShelves: 0 } }, flightplanReadability: { summary: { linkedReturnAnchors: 4 } }, microflightTrialReadiness: { summary: { openLandingRunways: 3 } }, skyRescueReadiness: { summary: { heardRescueBeacons: 4, openGustCorridors: 4, avoidableShadowSqualls: 4, readyDawnConvoys: 3 } } }
];

const lensKit = createSoraCloudLensFocusKit();
const prismKit = createSoraStarPrismAlignmentKit();
const buoyKit = createSoraWindBuoyChainKit();
const lanternKit = createSoraStormLanternWarningKit();
const runwayKit = createSoraRefugeRunwayMarkKit();
const logKit = createSoraDawnKeeperLogKit();
const handoffKit = createSoraSkyLighthouseRendererHandoffKit();
const domainKit = createSoraSkyLighthouseReadinessDomainKit();

assert.ok(SORA_SKY_LIGHTHOUSE_READINESS_DOMAIN_TREE.includes("sora-sky-lighthouse-readiness-domain"), "domain tree names the parent domain");
assert.ok(SORA_SKY_LIGHTHOUSE_READINESS_DOMAIN_TREE.includes("renderer consumes descriptors only"), "domain tree declares descriptor handoff");
assert.ok(domainKit.kits.includes("sora-cloud-lens-focus-kit"), "domain lists cloud lens kit");
assert.ok(domainKit.kits.includes("sora-sky-lighthouse-renderer-handoff-kit"), "domain lists renderer handoff kit");

for (const [index, input] of cases.entries()) {
  const cloudLensFocuses = lensKit.describe(input);
  const starPrismAlignments = prismKit.describe(input);
  const windBuoyChains = buoyKit.describe(input);
  const stormLanternWarnings = lanternKit.describe(input);
  const refugeRunwayMarks = runwayKit.describe({ ...input, cloudLensFocuses, windBuoyChains });
  const dawnKeeperLogs = logKit.describe({ ...input, starPrismAlignments, refugeRunwayMarks });
  const handoff = handoffKit.describe({ cloudLensFocuses, starPrismAlignments, windBuoyChains, stormLanternWarnings, refugeRunwayMarks, dawnKeeperLogs });
  const described = domainKit.describe(input);

  assert.equal(cloudLensFocuses.lenses.length, 4, `case ${index} cloud lens count`);
  assert.equal(starPrismAlignments.prisms.length, 4, `case ${index} star prism count`);
  assert.equal(windBuoyChains.buoys.length, 5, `case ${index} wind buoy count`);
  assert.equal(stormLanternWarnings.lanterns.length, 4, `case ${index} storm lantern count`);
  assert.equal(refugeRunwayMarks.marks.length, 3, `case ${index} refuge runway count`);
  assert.equal(dawnKeeperLogs.logs.length, 3, `case ${index} dawn keeper log count`);
  assert.equal(handoff.contract, "renderer consumes descriptors only", `case ${index} handoff contract`);
  assert.equal(handoff.descriptorCounts.windBuoys, 5, `case ${index} handoff buoy count`);
  assert.equal(described.rendererHandoff.descriptorCounts.dawnKeeperLogs, 3, `case ${index} domain log count`);
  assert.equal(described.summary.descriptorCount, 23, `case ${index} total descriptor count`);
  assert.ok(described.rendererHandoff.forbiddenOwnership.includes("WebGL ownership"), `case ${index} renderer-neutral WebGL boundary`);
  assert.doesNotThrow(() => JSON.stringify(described), `case ${index} domain output serializable`);
}

console.log(`Sora sky lighthouse readiness kit smoke passed ${cases.length} intake cases.`);
