import assert from "node:assert/strict";
import fs from "node:fs";
import { createSoraPreflightChallengeReadinessDomainKit } from "../experiments/_kits/sora-the-infinite/sora-preflight-challenge-readiness-domain-kits.js";

const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const indexHtml = fs.readFileSync(new URL("../experiments/sora-the-infinite/index.html", import.meta.url), "utf8");
const entry = fs.readFileSync(new URL("../experiments/sora-the-infinite/sora-preflight-challenge-entry.js", import.meta.url), "utf8");
const style = fs.readFileSync(new URL("../experiments/sora-the-infinite/sora-preflight-challenge-style.css", import.meta.url), "utf8");
const kitSource = fs.readFileSync(new URL("../experiments/_kits/sora-the-infinite/sora-preflight-challenge-readiness-domain-kits.js", import.meta.url), "utf8");
const parentSmoke = fs.readFileSync(new URL("./sora-flightplan-readability-cdn-state-input-smoke.mjs", import.meta.url), "utf8");

assert.ok(entry.includes(cdn), "preflight challenge entry should import NexusEngine main CDN");
assert.equal(entry.includes("LuminaryLabs-Dev/NexusRealtime"), false, "preflight challenge entry should not import old NexusRealtime runtime");
assert.ok(indexHtml.includes("sky-rescue-readiness-v1"), "route shell should cache bust current Sora readiness pass");
assert.ok(indexHtml.includes("sora-preflight-challenge-entry.js"), "route shell should load preflight challenge entry");
assert.ok(indexHtml.includes("sora-preflight-challenge-style.css"), "route shell should load preflight challenge style");
assert.ok(indexHtml.includes("sky rescue") && indexHtml.includes("readiness gateway"), "route shell should describe the latest gateway role");
assert.ok(entry.includes("getPreflightChallengeReadiness"), "GameHost should expose preflight challenge state");
assert.ok(entry.includes("getSoraPreflightChallengeReadiness"), "GameHost should expose namespaced preflight challenge state");
assert.ok(entry.includes("preflightChallengeReadiness"), "entry should compose challenge descriptors into renderer handoff");
assert.ok(entry.includes("rendererConsumes = \"descriptors-only\""), "entry should mark overlay renderer as descriptor-only");
assert.ok(style.includes("preflight-gust-ring") && style.includes("preflight-cloud-lock") && style.includes("preflight-oath-seal"), "style should render preflight descriptor buckets");
assert.ok(kitSource.includes("sora-preflight-challenge-readiness-domain"), "kit source should include domain tree");
assert.ok(kitSource.includes("forbiddenOwnership") && kitSource.includes("frame-loop ownership"), "kit source should include ownership boundary");
assert.ok(parentSmoke.includes("sora-preflight-challenge-readiness-domain-kits-smoke.mjs"), "existing Sora smoke should route the new kit smoke");
assert.ok(parentSmoke.includes("sora-preflight-challenge-readiness-cdn-state-input-smoke.mjs"), "existing Sora smoke should route the new CDN smoke");

const routePreview = {
  readiness: 0.72,
  continuityGate: { open: true },
  rendererHandoff: { descriptorCounts: { waypoints: 5, windShearCells: 3 } }
};
const launchRehearsal = { summary: { readySteps: 4 } };
const flightplanReadability = { summary: { activeVectors: 5, clearCloudSlits: 4, launchWindowValue: 0.74, linkedReturnAnchors: 3 } };
const skyNegotiationReadiness = { summary: { usableJetstreams: 4, activeStormShelves: 1, chosenThermalRungs: 4, openGlidePockets: 4, readyConfidenceRails: 4, sealedReturnVows: 3 } };

const cases = [
  { tick: 0, readiness: 0.2, input: { thrust: 0, bank: 0, climb: 0 }, query: "", hash: "" },
  { tick: 14, readiness: 0.34, input: { thrust: 0.15, bank: 0, climb: 0 }, query: "?start=1", hash: "" },
  { tick: 28, readiness: 0.44, input: { thrust: 0.45, bank: -0.2, climb: 0.2 }, query: "", hash: "#memory" },
  { tick: 42, readiness: 0.56, input: { thrust: 0.7, bank: -0.7, climb: 0.4 }, query: "?left=1", hash: "" },
  { tick: 56, readiness: 0.62, input: { thrust: 0.7, bank: 0.7, climb: 0.2 }, query: "?right=1", hash: "" },
  { tick: 70, readiness: 0.7, input: { thrust: 0.85, bank: 0.1, climb: 0.8 }, query: "?climb=1", hash: "" },
  { tick: 84, readiness: 0.76, input: { thrust: 0.55, bank: 0.34, climb: 0.44, pointerActive: true, pointerX: 0.67, pointerY: 0.28 }, query: "?pointer=1", hash: "" },
  { tick: 98, readiness: 0.84, input: { thrust: 1, bank: 0.2, climb: 0.4, launch: true }, query: "?launch=1", hash: "#ready" },
  { tick: 112, readiness: 0.9, input: { thrust: 1, bank: 1, climb: 0.2 }, query: "?drift=1", hash: "" },
  { tick: 126, readiness: 1, input: { thrust: 1, bank: 0, climb: 1, launch: true }, query: "?ready=1", hash: "#open" }
];

const domain = createSoraPreflightChallengeReadinessDomainKit();
for (const input of cases) {
  const described = domain.describe({ ...input, routePreview, launchRehearsal, flightplanReadability, skyNegotiationReadiness });
  assert.equal(described.rendererHandoff.contract, "renderer consumes descriptors only", "handoff contract");
  assert.equal(described.rendererHandoff.descriptorCounts.routeTempoScores, 3, "route tempo descriptor count");
  assert.ok(described.rendererHandoff.descriptorCounts.gustSyncRings >= 3, "gust rings available");
  assert.ok(described.rendererHandoff.descriptorCounts.velocityTetherBeads >= 4, "velocity beads available");
  assert.ok(described.rendererHandoff.descriptorCounts.cloudCorridorLocks >= 3, "cloud corridor locks available");
  assert.ok(described.summary.descriptorCount >= 25, "enough descriptors for overlay");
  assert.deepEqual(JSON.parse(JSON.stringify(described.rendererHandoff.descriptors)).landingOathSeals.kind, "landing-oath-seals", "renderer descriptors serialize cleanly");
}

console.log("sora preflight challenge CDN/state/input smoke passed", { cases: cases.length });
