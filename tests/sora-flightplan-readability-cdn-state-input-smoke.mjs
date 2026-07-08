import assert from "node:assert/strict";
import fs from "node:fs";
import { createSoraLaunchRehearsalDomainKit } from "../experiments/_kits/sora-the-infinite/sora-launch-rehearsal-domain-kits.js";
import { createSoraFlightplanReadabilityDomainKit } from "../experiments/_kits/sora-the-infinite/sora-flightplan-readability-domain-kits.js";

const indexHtml = fs.readFileSync(new URL("../experiments/sora-the-infinite/index.html", import.meta.url), "utf8");
const gateway = fs.readFileSync(new URL("../experiments/sora-the-infinite/sora-compatibility-gateway.js", import.meta.url), "utf8");
const style = fs.readFileSync(new URL("../experiments/sora-the-infinite/sora-compatibility-style.css", import.meta.url), "utf8");
const kitSource = fs.readFileSync(new URL("../experiments/_kits/sora-the-infinite/sora-flightplan-readability-domain-kits.js", import.meta.url), "utf8");

const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
assert.ok(gateway.includes(cdn), "changed Sora gateway should import NexusEngine main CDN");
assert.equal(gateway.includes("LuminaryLabs-Dev/NexusRealtime"), false, "changed gateway should not import old NexusRealtime runtime");
assert.ok(indexHtml.includes("flightplan-readability-v1"), "route shell should cache-bust flightplan readability entry");
assert.ok(indexHtml.includes("flightplan-list"), "route shell should expose flightplan telemetry");
assert.ok(gateway.includes("createSoraFlightplanReadabilityDomainKit"), "gateway should import flightplan readability domain kit");
assert.ok(gateway.includes("getFlightplanReadability"), "GameHost should expose flightplan readability state");
assert.ok(gateway.includes("flightplanReadability"), "gateway should compose flightplan descriptors into renderer handoff");
assert.ok(style.includes("runway-vector") && style.includes("cloud-cover-slit") && style.includes("risk-card"), "style should render flightplan descriptor buckets");
assert.ok(kitSource.includes("sora-flightplan-readability-domain"), "kit source should include domain tree");
assert.ok(kitSource.includes("renderer consumes descriptors only"), "kit source should include renderer handoff contract");

const routePreview = {
  readiness: 0.72,
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
const domainKit = createSoraFlightplanReadabilityDomainKit();
for (const input of cases) {
  const launchRehearsal = rehearsalKit.describe({ ...input, routePreview });
  const domain = domainKit.describe({ ...input, routePreview, launchRehearsal });
  assert.equal(domain.kind, "sora-flightplan-readability-domain", "domain kind");
  assert.equal(domain.rendererHandoff.contract, "renderer consumes descriptors only", "handoff contract");
  assert.ok(domain.rendererHandoff.forbiddenOwnership.includes("frame-loop ownership"), "frame-loop ownership remains forbidden");
  assert.ok(domain.rendererHandoff.descriptorCounts.runwayVectors >= 5, "runway vector descriptors");
  assert.equal(domain.rendererHandoff.descriptorCounts.energySegments, 5, "energy descriptors");
  assert.ok(domain.rendererHandoff.descriptorCounts.cloudSlits >= 4, "cloud slit descriptors");
  assert.ok(domain.rendererHandoff.descriptorCounts.launchLanes >= 3, "launch lane descriptors");
  assert.equal(domain.rendererHandoff.descriptorCounts.riskRewardCards, 3, "risk card descriptors");
  assert.ok(domain.rendererHandoff.descriptorCounts.returnAnchors >= 3, "return anchor descriptors");
  assert.deepEqual(JSON.parse(JSON.stringify(domain.rendererHandoff.descriptors)).riskRewardCards.kind, "risk-reward-cards", "serializable renderer descriptors");
}

console.log("sora flightplan readability CDN/state/input smoke passed", { cases: cases.length });
