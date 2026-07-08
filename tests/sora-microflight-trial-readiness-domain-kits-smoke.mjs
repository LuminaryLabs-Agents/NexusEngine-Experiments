import assert from "node:assert/strict";
import {
  SORA_MICROFLIGHT_TRIAL_READINESS_DOMAIN_TREE,
  createSoraThermalTokenClusterKit,
  createSoraGlideStaminaRibbonKit,
  createSoraCrosswindGateWeaveKit,
  createSoraStormBurstAvoidanceKit,
  createSoraSkyMedalScoreKit,
  createSoraLandingRunwayCommitKit,
  createSoraMicroflightTrialRendererHandoffKit,
  createSoraMicroflightTrialReadinessDomainKit
} from "../experiments/_kits/sora-the-infinite/sora-microflight-trial-readiness-domain-kits.js";

const cases = [
  { tick: 1, readiness: 0.2, input: { thrust: 0, bank: 0, climb: 0 } },
  { tick: 2, readiness: 0.32, input: { thrust: 1, bank: -0.45, climb: 0.2 } },
  { tick: 3, readiness: 0.44, input: { thrust: 1, bank: 0.45, climb: 0.7 }, skyNegotiationReadiness: { summary: { usableJetstreams: 4, activeStormShelves: 0, chosenThermalRungs: 4, openGlidePockets: 3 } } },
  { tick: 4, readiness: 0.56, input: { thrust: 0.7, bank: -0.9, climb: -0.3 }, skyNegotiationReadiness: { summary: { activeStormShelves: 3, openGlidePockets: 1 } } },
  { tick: 5, readiness: 0.68, input: { pointerActive: true, pointerX: 0, pointerY: 1 }, flightplanReadability: { summary: { clearCloudSlits: 2, linkedReturnAnchors: 1 } } },
  { tick: 6, readiness: 0.74, input: { pointerActive: true, pointerX: 1, pointerY: 0 }, preflightChallengeReadiness: { summary: { linkedVelocityTethers: 5, sealedLandingOaths: 2 } } },
  { tick: 7, readiness: 0.82, input: { forward: 1, x: -0.5, y: 0.5 }, flightplanReadability: { summary: { clearCloudSlits: 5, linkedReturnAnchors: 3 } }, skyNegotiationReadiness: { summary: { chosenThermalRungs: 5, usableJetstreams: 5, openGlidePockets: 4 } } },
  { tick: 8, readiness: 0.9, input: { thrust: -1, bank: 0.5, climb: -0.5 } },
  { tick: 9, readiness: 0.96, input: { thrust: 1, bank: 0.5, climb: 0.5, launch: true }, preflightChallengeReadiness: { summary: { linkedVelocityTethers: 7, sealedLandingOaths: 4 } }, flightplanReadability: { summary: { clearCloudSlits: 6, linkedReturnAnchors: 4 } } },
  { tick: 10, readiness: 1, input: { thrust: 1, bank: 0, climb: 1 }, skyNegotiationReadiness: { summary: { chosenThermalRungs: 6, usableJetstreams: 6, activeStormShelves: 0, openGlidePockets: 5 } }, flightplanReadability: { summary: { clearCloudSlits: 6, linkedReturnAnchors: 4 } }, preflightChallengeReadiness: { summary: { linkedVelocityTethers: 7, sealedLandingOaths: 4 } } }
];

const thermalKit = createSoraThermalTokenClusterKit();
const staminaKit = createSoraGlideStaminaRibbonKit();
const gateKit = createSoraCrosswindGateWeaveKit();
const burstKit = createSoraStormBurstAvoidanceKit();
const medalKit = createSoraSkyMedalScoreKit();
const runwayKit = createSoraLandingRunwayCommitKit();
const handoffKit = createSoraMicroflightTrialRendererHandoffKit();
const domainKit = createSoraMicroflightTrialReadinessDomainKit();

assert.ok(SORA_MICROFLIGHT_TRIAL_READINESS_DOMAIN_TREE.includes("sora-microflight-trial-readiness-domain"), "domain tree names the parent domain");
assert.ok(SORA_MICROFLIGHT_TRIAL_READINESS_DOMAIN_TREE.includes("renderer consumes descriptors only"), "domain tree declares descriptor handoff");
assert.ok(domainKit.kits.includes("sora-thermal-token-cluster-kit"), "domain lists thermal token kit");
assert.ok(domainKit.kits.includes("sora-microflight-trial-renderer-handoff-kit"), "domain lists renderer handoff kit");

for (const [index, input] of cases.entries()) {
  const thermalTokenClusters = thermalKit.describe(input);
  const glideStaminaRibbons = staminaKit.describe(input);
  const crosswindGateWeaves = gateKit.describe(input);
  const stormBurstAvoidance = burstKit.describe(input);
  const skyMedalScores = medalKit.describe({ ...input, thermalTokenClusters, glideStaminaRibbons, crosswindGateWeaves, stormBurstAvoidance });
  const landingRunwayCommitments = runwayKit.describe({ ...input, skyMedalScores });
  const handoff = handoffKit.describe({ thermalTokenClusters, glideStaminaRibbons, crosswindGateWeaves, stormBurstAvoidance, skyMedalScores, landingRunwayCommitments });
  const described = domainKit.describe(input);

  assert.equal(thermalTokenClusters.tokens.length, 7, `case ${index} thermal token count`);
  assert.equal(glideStaminaRibbons.segments.length, 6, `case ${index} stamina segment count`);
  assert.equal(crosswindGateWeaves.gates.length, 5, `case ${index} crosswind gate count`);
  assert.equal(stormBurstAvoidance.bursts.length, 4, `case ${index} storm burst count`);
  assert.equal(skyMedalScores.medals.length, 4, `case ${index} medal count`);
  assert.equal(landingRunwayCommitments.runways.length, 3, `case ${index} runway count`);
  assert.equal(handoff.contract, "renderer consumes descriptors only", `case ${index} handoff contract`);
  assert.equal(handoff.descriptorCounts.thermalTokens, 7, `case ${index} handoff thermal count`);
  assert.equal(described.rendererHandoff.descriptorCounts.crosswindGates, 5, `case ${index} domain handoff crosswind count`);
  assert.equal(described.summary.descriptorCount, 29, `case ${index} total descriptor count`);
  assert.ok(described.rendererHandoff.forbiddenOwnership.includes("Three.js ownership"), `case ${index} renderer-neutral Three.js boundary`);
  assert.doesNotThrow(() => JSON.stringify(described), `case ${index} domain output serializable`);
}

console.log(`Sora microflight trial readiness kit smoke passed ${cases.length} intake cases.`);
