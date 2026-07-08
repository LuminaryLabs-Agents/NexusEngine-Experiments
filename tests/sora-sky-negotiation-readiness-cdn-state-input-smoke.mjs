import assert from "node:assert/strict";
import fs from "node:fs";
import { createSoraLaunchRehearsalDomainKit } from "../experiments/_kits/sora-the-infinite/sora-launch-rehearsal-domain-kits.js";
import { createSoraFlightplanReadabilityDomainKit } from "../experiments/_kits/sora-the-infinite/sora-flightplan-readability-domain-kits.js";
import { createSoraSkyNegotiationReadinessDomainKit } from "../experiments/_kits/sora-the-infinite/sora-sky-negotiation-readiness-domain-kits.js";

const indexHtml = fs.readFileSync(new URL("../experiments/sora-the-infinite/index.html", import.meta.url), "utf8");
const gateway = fs.readFileSync(new URL("../experiments/sora-the-infinite/sora-compatibility-gateway.js", import.meta.url), "utf8");
const style = fs.readFileSync(new URL("../experiments/sora-the-infinite/sora-sky-negotiation-style.css", import.meta.url), "utf8");
const kitSource = fs.readFileSync(new URL("../experiments/_kits/sora-the-infinite/sora-sky-negotiation-readiness-domain-kits.js", import.meta.url), "utf8");
const runChecks = fs.readFileSync(new URL("../scripts/run-checks.mjs", import.meta.url), "utf8");
const existingFlightplanSmoke = fs.readFileSync(new URL("./sora-flightplan-readability-cdn-state-input-smoke.mjs", import.meta.url), "utf8");

const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
assert.ok(gateway.includes(cdn), "changed Sora gateway should import NexusEngine main CDN");
assert.equal(gateway.includes("LuminaryLabs-Dev/NexusRealtime"), false, "changed gateway should not import old NexusRealtime runtime");
assert.ok(indexHtml.includes("sky-negotiation-readiness-v1"), "route shell should cache-bust sky negotiation readiness entry");
assert.ok(indexHtml.includes("sky-negotiation-list"), "route shell should expose sky negotiation telemetry");
assert.ok(gateway.includes("createSoraSkyNegotiationReadinessDomainKit"), "gateway should import sky negotiation domain kit");
assert.ok(gateway.includes("getSkyNegotiationReadiness"), "GameHost should expose sky negotiation readiness state");
assert.ok(gateway.includes("skyNegotiationReadiness"), "gateway should compose sky negotiation descriptors into renderer handoff");
assert.ok(style.includes("jetstream-braid") && style.includes("storm-shelf") && style.includes("return-vow-thread"), "style should render sky negotiation descriptor buckets");
assert.ok(kitSource.includes("sora-sky-negotiation-readiness-domain"), "kit source should include domain tree");
assert.ok(kitSource.includes("renderer consumes descriptors only"), "kit source should include renderer handoff contract");
assert.ok(runChecks.includes("sora-flightplan-readability-cdn-state-input-smoke.mjs"), "full/deploy checks should include the existing Sora CDN smoke route");
assert.ok(existingFlightplanSmoke.includes("sora-sky-negotiation-readiness-domain-kits-smoke.mjs"), "existing Sora CDN smoke should import sky negotiation kit smoke");
assert.ok(existingFlightplanSmoke.includes("sora-sky-negotiation-readiness-cdn-state-input-smoke.mjs"), "existing Sora CDN smoke should import sky negotiation CDN smoke");

const routePreview = {
  readiness: 0.72,
  continuityGate: { open: true },
  windShearForecast: {
    cells: [
      { drift: -0.22 },
      { drift: 0.15 },
      { drift: 0.36 }
    ]
  },
  rendererHandoff: {
    descriptorCounts: {
      waypoints: 5,
      windShearCells: 3,
      handoffPackets: 5,
      altitudeBands: 6
    }
  }
};

const cases = [
  { tick: 0, readiness: 0.2, input: { thrust: 0, bank: 0, climb: 0 }, query: "", hash: "" },
  { tick: 16, readiness: 0.32, input: { thrust: 0.15, bank: 0, climb: 0 }, query: "?q=1", hash: "" },
  { tick: 32, readiness: 0.45, input: { thrust: 1, bank: 0, climb: 0.2 }, query: "", hash: "#a" },
  { tick: 48, readiness: 0.55, input: { thrust: 0.7, bank: -1, climb: 0.3 }, query: "?bank=left", hash: "" },
  { tick: 64, readiness: 0.63, input: { thrust: 0.7, bank: 1, climb: 0.3 }, query: "?bank=right", hash: "" },
  { tick: 80, readiness: 0.7, input: { thrust: 0.8, bank: 0.1, climb: 1 }, query: "?climb=1", hash: "" },
  { tick: 96, readiness: 0.76, input: { thrust: 0.55, bank: 0.34, climb: 0.44, pointerActive: true, pointerX: 0.67, pointerY: 0.28 }, query: "?pointer=1", hash: "" },
  { tick: 112, readiness: 0.84, input: { thrust: 1, bank: 0.2, climb: 0.4, launch: true }, query: "?launch=1", hash: "#ready" },
  { tick: 128, readiness: 0.9, input: { thrust: 1, bank: 1, climb: 0.2 }, query: "?drift=1", hash: "" },
  { tick: 144, readiness: 1, input: { thrust: 1, bank: 0, climb: 1, launch: true }, query: "?ready=1", hash: "#open" }
];

const rehearsalKit = createSoraLaunchRehearsalDomainKit();
const flightplanKit = createSoraFlightplanReadabilityDomainKit();
const skyNegotiationKit = createSoraSkyNegotiationReadinessDomainKit();
for (const input of cases) {
  const launchRehearsal = rehearsalKit.describe({ ...input, routePreview });
  const flightplanReadability = flightplanKit.describe({ ...input, routePreview, launchRehearsal });
  const domain = skyNegotiationKit.describe({ ...input, routePreview, launchRehearsal, flightplanReadability });
  assert.equal(domain.kind, "sora-sky-negotiation-readiness-domain", "domain kind");
  assert.equal(domain.rendererHandoff.contract, "renderer consumes descriptors only", "handoff contract");
  assert.ok(domain.rendererHandoff.forbiddenOwnership.includes("frame-loop ownership"), "frame-loop ownership remains forbidden");
  assert.ok(domain.rendererHandoff.descriptorCounts.jetstreamBraids >= 4, "jetstream descriptors");
  assert.ok(domain.rendererHandoff.descriptorCounts.stormShelves >= 3, "storm shelf descriptors");
  assert.ok(domain.rendererHandoff.descriptorCounts.thermalRungs >= 4, "thermal ladder descriptors");
  assert.ok(domain.rendererHandoff.descriptorCounts.glidePockets >= 3, "glide pocket descriptors");
  assert.equal(domain.rendererHandoff.descriptorCounts.confidenceRails, 5, "confidence rail descriptors");
  assert.ok(domain.rendererHandoff.descriptorCounts.returnVowThreads >= 3, "return vow descriptors");
  assert.deepEqual(JSON.parse(JSON.stringify(domain.rendererHandoff.descriptors)).handoffConfidenceRails.kind, "handoff-confidence-rails", "serializable renderer descriptors");
}

console.log("sora sky negotiation readiness CDN/state/input smoke passed", { cases: cases.length });
