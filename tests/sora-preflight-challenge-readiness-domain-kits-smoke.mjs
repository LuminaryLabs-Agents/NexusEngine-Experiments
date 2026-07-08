import assert from "node:assert/strict";
import {
  createSoraGustSyncRingKit,
  createSoraVelocityTetherBeadKit,
  createSoraAltitudeContractBandKit,
  createSoraCloudCorridorLockKit,
  createSoraRouteTempoScoreKit,
  createSoraLandingOathSealKit,
  createSoraPreflightChallengeReadinessDomainKit,
  SORA_PREFLIGHT_CHALLENGE_READINESS_DOMAIN_TREE
} from "../experiments/_kits/sora-the-infinite/sora-preflight-challenge-readiness-domain-kits.js";

const routePreview = {
  readiness: 0.68,
  continuityGate: { open: true },
  rendererHandoff: { descriptorCounts: { waypoints: 5 } }
};

const launchRehearsal = {
  summary: { readySteps: 4 },
  thermalSlots: { slots: [{ lift: 0.55 }, { lift: 0.72 }] }
};

const flightplanReadability = {
  summary: {
    activeVectors: 5,
    clearCloudSlits: 4,
    launchWindowValue: 0.68,
    linkedReturnAnchors: 3
  }
};

const skyNegotiationReadiness = {
  summary: {
    usableJetstreams: 4,
    activeStormShelves: 1,
    chosenThermalRungs: 3,
    openGlidePockets: 4,
    readyConfidenceRails: 4,
    sealedReturnVows: 3
  }
};

const cases = [
  { tick: 0, readiness: 0.2, input: { thrust: 0, bank: 0, climb: 0 }, query: "", hash: "" },
  { tick: 12, readiness: 0.32, input: { thrust: 0.2, bank: -0.25, climb: 0.1 }, query: "?seed=1", hash: "" },
  { tick: 24, readiness: 0.44, input: { thrust: 0.5, bank: 0.25, climb: 0.25 }, query: "", hash: "#memory" },
  { tick: 36, readiness: 0.55, input: { thrust: 0.75, bank: -0.8, climb: 0.45 }, query: "?crosswind=1", hash: "" },
  { tick: 48, readiness: 0.62, input: { thrust: 1, bank: 0.8, climb: -0.25 }, query: "?sink=1", hash: "" },
  { tick: 60, readiness: 0.7, input: { thrust: 0.95, bank: 0.05, climb: 0.65 }, query: "?lift=1", hash: "#oath" },
  { tick: 72, readiness: 0.76, input: { thrust: 0.8, bank: 0.34, climb: 0.44, pointerActive: true, pointerX: 0.67, pointerY: 0.28 }, query: "?pointer=1", hash: "" },
  { tick: 84, readiness: 0.84, input: { thrust: 1, bank: 0.2, climb: 0.4, launch: true }, query: "?launch=1", hash: "#ready" },
  { tick: 96, readiness: 0.92, input: { thrust: 1, bank: 1, climb: 0.2 }, query: "?drift=1", hash: "" },
  { tick: 108, readiness: 1, input: { thrust: 1, bank: 0, climb: 1, launch: true }, query: "?ready=1", hash: "#open" }
];

assert.ok(SORA_PREFLIGHT_CHALLENGE_READINESS_DOMAIN_TREE.includes("sora-preflight-challenge-readiness-domain"), "domain tree should name the parent domain");
assert.ok(SORA_PREFLIGHT_CHALLENGE_READINESS_DOMAIN_TREE.includes("renderer consumes descriptors only"), "domain tree should end in descriptor handoff");

const gustKit = createSoraGustSyncRingKit();
const tetherKit = createSoraVelocityTetherBeadKit();
const altitudeKit = createSoraAltitudeContractBandKit();
const cloudKit = createSoraCloudCorridorLockKit();
const tempoKit = createSoraRouteTempoScoreKit();
const oathKit = createSoraLandingOathSealKit();
const domain = createSoraPreflightChallengeReadinessDomainKit();

for (const input of cases) {
  const shared = { ...input, routePreview, launchRehearsal, flightplanReadability, skyNegotiationReadiness };
  const gust = gustKit.describe(shared);
  const tether = tetherKit.describe(shared);
  const altitude = altitudeKit.describe(shared);
  const cloud = cloudKit.describe(shared);
  const tempo = tempoKit.describe(shared);
  const oath = oathKit.describe(shared);
  const described = domain.describe(shared);

  assert.equal(gust.kind, "gust-sync-rings", "gust kit output kind");
  assert.ok(gust.rings.length >= 3, "gust kit should emit multiple rings");
  assert.equal(tether.kind, "velocity-tether-beads", "velocity kit output kind");
  assert.ok(tether.beads.every((bead) => bead.tension >= 0 && bead.tension <= 1), "tether tensions should be clamped");
  assert.equal(altitude.kind, "altitude-contract-bands", "altitude kit output kind");
  assert.ok(altitude.bands.length >= 3, "altitude kit should emit contract bands");
  assert.equal(cloud.kind, "cloud-corridor-locks", "cloud kit output kind");
  assert.ok(cloud.locks.length >= 3, "cloud kit should emit locks");
  assert.equal(tempo.kind, "route-tempo-scores", "tempo kit output kind");
  assert.equal(tempo.scores.length, 3, "tempo kit should emit three scores");
  assert.equal(oath.kind, "landing-oath-seals", "oath kit output kind");
  assert.ok(oath.seals.length >= 3, "oath kit should emit seals");
  assert.equal(described.kind, "sora-preflight-challenge-readiness-domain", "composite domain kind");
  assert.equal(described.rendererHandoff.contract, "renderer consumes descriptors only", "renderer handoff contract");
  assert.ok(described.rendererHandoff.forbiddenOwnership.includes("frame-loop ownership"), "frame-loop ownership should be forbidden");
  assert.ok(described.summary.descriptorCount >= 25, "composite handoff should expose enough descriptors");
  assert.equal(JSON.parse(JSON.stringify(described.rendererHandoff.descriptors)).routeTempoScores.kind, "route-tempo-scores", "descriptors should be JSON serializable");
}

const low = domain.describe({ ...cases[0], routePreview, launchRehearsal, flightplanReadability, skyNegotiationReadiness });
const high = domain.describe({ ...cases[9], routePreview: { ...routePreview, readiness: 1 }, launchRehearsal, flightplanReadability, skyNegotiationReadiness });
assert.ok(high.summary.openGustSyncRings >= low.summary.openGustSyncRings, "more readiness should not reduce gust ring openings in the high case");
assert.ok(high.summary.sealedLandingOaths >= low.summary.sealedLandingOaths, "more readiness should improve landing oath seals");

console.log("sora preflight challenge readiness domain kit smoke passed", { cases: cases.length });
