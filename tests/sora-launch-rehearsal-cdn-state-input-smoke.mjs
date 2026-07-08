import assert from "node:assert/strict";
import fs from "node:fs";
import { createSoraLaunchRehearsalDomainKit } from "../experiments/_kits/sora-the-infinite/sora-launch-rehearsal-domain-kits.js";

const indexHtml = fs.readFileSync(new URL("../experiments/sora-the-infinite/index.html", import.meta.url), "utf8");
const gateway = fs.readFileSync(new URL("../experiments/sora-the-infinite/sora-compatibility-gateway.js", import.meta.url), "utf8");
const style = fs.readFileSync(new URL("../experiments/sora-the-infinite/sora-compatibility-style.css", import.meta.url), "utf8");
const kitSource = fs.readFileSync(new URL("../experiments/_kits/sora-the-infinite/sora-launch-rehearsal-domain-kits.js", import.meta.url), "utf8");

const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
assert.ok(gateway.includes(cdn), "changed Sora gateway should import NexusEngine main CDN");
assert.equal(gateway.includes("LuminaryLabs-Dev/NexusRealtime"), false, "changed gateway should not import old NexusRealtime runtime");
assert.ok(indexHtml.includes("launch-rehearsal-v1"), "route shell should cache-bust launch rehearsal entry");
assert.ok(indexHtml.includes("rehearsal-list"), "route shell should expose launch rehearsal telemetry");
assert.ok(gateway.includes("createSoraLaunchRehearsalDomainKit"), "gateway should import launch rehearsal domain kit");
assert.ok(gateway.includes("getLaunchRehearsal"), "GameHost should expose launch rehearsal state");
assert.ok(gateway.includes("sora-composed-renderer-handoff"), "gateway should compose route preview and launch rehearsal handoffs");
assert.ok(style.includes("thermal-slot") && style.includes("countdown-ring"), "style should render launch rehearsal descriptor buckets");
assert.ok(kitSource.includes("sora-launch-rehearsal-domain"), "kit source should include domain tree");
assert.ok(kitSource.includes("renderer consumes descriptors only"), "kit source should include renderer handoff contract");

const routePreview = {
  readiness: 0.7,
  windShearForecast: {
    cells: [
      { drift: -0.3 },
      { drift: 0.2 },
      { drift: 0.4 }
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
  { tick: 16, readiness: 0.3, input: { thrust: 0.2, bank: 0, climb: 0 }, query: "?q=1", hash: "" },
  { tick: 32, readiness: 0.45, input: { thrust: 1, bank: 0, climb: 0.2 }, query: "", hash: "#a" },
  { tick: 48, readiness: 0.55, input: { thrust: 0.7, bank: -1, climb: 0.3 }, query: "?bank=left", hash: "" },
  { tick: 64, readiness: 0.63, input: { thrust: 0.7, bank: 1, climb: 0.3 }, query: "?bank=right", hash: "" },
  { tick: 80, readiness: 0.7, input: { thrust: 0.8, bank: 0.1, climb: 1 }, query: "?climb=1", hash: "" },
  { tick: 96, readiness: 0.76, input: { thrust: 0.55, bank: 0.34, climb: 0.44, pointerActive: true, pointerX: 0.67, pointerY: 0.28 }, query: "?pointer=1", hash: "" },
  { tick: 112, readiness: 0.84, input: { thrust: 1, bank: 0.2, climb: 0.4, launch: true }, query: "?launch=1", hash: "#ready" },
  { tick: 128, readiness: 0.9, input: { thrust: 1, bank: 1, climb: 0.2 }, query: "?drift=1", hash: "" },
  { tick: 144, readiness: 1, input: { thrust: 1, bank: 0, climb: 1, launch: true }, query: "?ready=1", hash: "#open" }
];

const domainKit = createSoraLaunchRehearsalDomainKit();
for (const input of cases) {
  const domain = domainKit.describe({ ...input, routePreview });
  assert.equal(domain.kind, "sora-launch-rehearsal-domain", "domain kind");
  assert.equal(domain.rendererHandoff.contract, "renderer consumes descriptors only", "handoff contract");
  assert.ok(domain.rendererHandoff.forbiddenOwnership.includes("frame-loop ownership"), "frame-loop ownership remains forbidden");
  assert.equal(domain.rendererHandoff.descriptorCounts.checklistSteps, 6, "checklist descriptors");
  assert.ok(domain.rendererHandoff.descriptorCounts.thermalSlots >= 4, "thermal descriptors");
  assert.ok(domain.rendererHandoff.descriptorCounts.targetGhosts >= 3, "target ghosts descriptors");
  assert.deepEqual(JSON.parse(JSON.stringify(domain.rendererHandoff.descriptors)).entryCountdown.kind, "entry-countdown", "serializable renderer descriptors");
}

console.log("sora launch rehearsal CDN/state/input smoke passed", { cases: cases.length });
