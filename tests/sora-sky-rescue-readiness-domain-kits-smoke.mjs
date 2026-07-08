import assert from "node:assert/strict";
import {
  SORA_SKY_RESCUE_READINESS_DOMAIN_TREE,
  createSoraRescueBeaconCallKit,
  createSoraStrandedSkyIslandKit,
  createSoraGustCorridorMapKit,
  createSoraShadowSquallWarningKit,
  createSoraRescueTetherSpoolKit,
  createSoraDawnHandoffConvoyKit,
  createSoraSkyRescueRendererHandoffKit,
  createSoraSkyRescueReadinessDomainKit
} from "../experiments/_kits/sora-the-infinite/sora-sky-rescue-readiness-domain-kits.js";

const cases = [
  { tick: 1, readiness: 0.18, input: { thrust: 0, bank: 0, climb: 0 } },
  { tick: 2, readiness: 0.27, input: { thrust: 1, bank: -0.45, climb: 0.1 }, microflightTrialReadiness: { summary: { earnedSkyMedals: 1, collectedThermalTokens: 2, avoidableStormBursts: 1, openLandingRunways: 0 } } },
  { tick: 3, readiness: 0.36, input: { thrust: 1, bank: 0.45, climb: 0.55 }, skyNegotiationReadiness: { summary: { usableJetstreams: 2, chosenThermalRungs: 2, activeStormShelves: 1, openGlidePockets: 1 } } },
  { tick: 4, readiness: 0.45, input: { thrust: 0.4, bank: -1, climb: -0.7 }, skyNegotiationReadiness: { summary: { activeStormShelves: 4, openGlidePockets: 0 } } },
  { tick: 5, readiness: 0.55, input: { pointerActive: true, pointerX: 0.2, pointerY: 0.4 }, preflightChallengeReadiness: { summary: { linkedVelocityTethers: 2 } } },
  { tick: 6, readiness: 0.64, input: { pointerActive: true, pointerX: 0.8, pointerY: 0.2 }, skyNegotiationReadiness: { summary: { chosenThermalRungs: 4, usableJetstreams: 4, openGlidePockets: 2, sealedReturnVows: 1 } } },
  { tick: 7, readiness: 0.73, input: { forward: 1, x: -0.35, y: 0.45 }, flightplanReadability: { summary: { linkedReturnAnchors: 2 } }, microflightTrialReadiness: { summary: { earnedSkyMedals: 2, collectedThermalTokens: 4, avoidableStormBursts: 3, openLandingRunways: 1 } } },
  { tick: 8, readiness: 0.82, input: { thrust: 1, bank: 0.35, climb: 0.5 }, preflightChallengeReadiness: { summary: { linkedVelocityTethers: 5 } }, skyNegotiationReadiness: { summary: { usableJetstreams: 5, openGlidePockets: 4, activeStormShelves: 1 } } },
  { tick: 9, readiness: 0.91, input: { thrust: 1, bank: 0, climb: 1, launch: true }, flightplanReadability: { summary: { linkedReturnAnchors: 3 } }, microflightTrialReadiness: { summary: { earnedSkyMedals: 3, collectedThermalTokens: 6, avoidableStormBursts: 4, openLandingRunways: 2 } } },
  { tick: 10, readiness: 1, input: { thrust: 1, bank: -0.35, climb: 1, launch: true }, skyNegotiationReadiness: { summary: { chosenThermalRungs: 6, usableJetstreams: 6, activeStormShelves: 0, openGlidePockets: 5, sealedReturnVows: 4 } }, flightplanReadability: { summary: { linkedReturnAnchors: 4 } }, preflightChallengeReadiness: { summary: { linkedVelocityTethers: 7 } }, microflightTrialReadiness: { summary: { earnedSkyMedals: 4, collectedThermalTokens: 7, avoidableStormBursts: 4, openLandingRunways: 3 } } }
];

const beaconKit = createSoraRescueBeaconCallKit();
const islandKit = createSoraStrandedSkyIslandKit();
const corridorKit = createSoraGustCorridorMapKit();
const squallKit = createSoraShadowSquallWarningKit();
const tetherKit = createSoraRescueTetherSpoolKit();
const convoyKit = createSoraDawnHandoffConvoyKit();
const handoffKit = createSoraSkyRescueRendererHandoffKit();
const domainKit = createSoraSkyRescueReadinessDomainKit();

assert.ok(SORA_SKY_RESCUE_READINESS_DOMAIN_TREE.includes("sora-sky-rescue-readiness-domain"), "domain tree names the parent domain");
assert.ok(SORA_SKY_RESCUE_READINESS_DOMAIN_TREE.includes("renderer consumes descriptors only"), "domain tree declares descriptor handoff");
assert.ok(domainKit.kits.includes("sora-rescue-beacon-call-kit"), "domain lists rescue beacon kit");
assert.ok(domainKit.kits.includes("sora-sky-rescue-renderer-handoff-kit"), "domain lists renderer handoff kit");

for (const [index, input] of cases.entries()) {
  const rescueBeaconCalls = beaconKit.describe(input);
  const strandedSkyIslands = islandKit.describe(input);
  const gustCorridorMap = corridorKit.describe(input);
  const shadowSquallWarnings = squallKit.describe(input);
  const rescueTetherSpools = tetherKit.describe({ ...input, rescueBeaconCalls, strandedSkyIslands });
  const dawnHandoffConvoys = convoyKit.describe({ ...input, rescueTetherSpools });
  const handoff = handoffKit.describe({ rescueBeaconCalls, strandedSkyIslands, gustCorridorMap, shadowSquallWarnings, rescueTetherSpools, dawnHandoffConvoys });
  const described = domainKit.describe(input);

  assert.equal(rescueBeaconCalls.beacons.length, 4, `case ${index} beacon count`);
  assert.equal(strandedSkyIslands.islands.length, 5, `case ${index} island count`);
  assert.equal(gustCorridorMap.corridors.length, 4, `case ${index} gust corridor count`);
  assert.equal(shadowSquallWarnings.squalls.length, 4, `case ${index} shadow squall count`);
  assert.equal(rescueTetherSpools.spools.length, 4, `case ${index} rescue tether count`);
  assert.equal(dawnHandoffConvoys.convoys.length, 3, `case ${index} dawn convoy count`);
  assert.equal(handoff.contract, "renderer consumes descriptors only", `case ${index} handoff contract`);
  assert.equal(handoff.descriptorCounts.rescueBeacons, 4, `case ${index} handoff beacon count`);
  assert.equal(described.rendererHandoff.descriptorCounts.dawnConvoys, 3, `case ${index} domain handoff convoy count`);
  assert.equal(described.summary.descriptorCount, 24, `case ${index} total descriptor count`);
  assert.ok(described.rendererHandoff.forbiddenOwnership.includes("Three.js ownership"), `case ${index} renderer-neutral Three.js boundary`);
  assert.doesNotThrow(() => JSON.stringify(described), `case ${index} domain output serializable`);
}

console.log(`Sora sky rescue readiness kit smoke passed ${cases.length} intake cases.`);
