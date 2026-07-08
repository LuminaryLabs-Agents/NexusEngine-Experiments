import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createCozyIslandTidepoolConservatoryReadinessDomainKit } from "../experiments/cozy-island/cozy-island-tidepool-conservatory-kits.js";

const route = readFileSync("experiments/cozy-island/index.html", "utf8");
const entry = readFileSync("experiments/cozy-island/cozy-island-tidepool-conservatory-entry.js", "utf8");
const kitSource = readFileSync("experiments/cozy-island/cozy-island-tidepool-conservatory-kits.js", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");
const routedCastawayKitSmoke = readFileSync("tests/cozy-island-castaway-comfort-readiness-kits-smoke.mjs", "utf8");
const routedCastawayCdnSmoke = readFileSync("tests/cozy-island-castaway-comfort-cdn-state-input-smoke.mjs", "utf8");

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const cases = [
  { seed: "state-01", tide: 0.38, stormRisk: 0.12, waterClarity: 0.86, coralHealth: 0.66, crabActivity: 0.48, shellSupply: 0.62, moonPhase: 0.42, visitorPressure: 0.24 },
  { seed: "state-02", tide: 0.32, stormRisk: 0.28, waterClarity: 0.52, coralHealth: 0.22, crabActivity: 0.42, shellSupply: 0.44, moonPhase: 0.58, visitorPressure: 0.35 },
  { seed: "state-03", tide: 0.74, stormRisk: 0.84, waterClarity: 0.24, coralHealth: 0.44, crabActivity: 0.52, shellSupply: 0.3, moonPhase: 0.76, visitorPressure: 0.66 },
  { seed: "state-04", tide: 0.46, stormRisk: 0.2, waterClarity: 0.68, coralHealth: 0.58, crabActivity: 0.92, shellSupply: 0.5, moonPhase: 0.34, visitorPressure: 0.72 },
  { seed: "state-05", tide: 0.4, stormRisk: 0.34, waterClarity: 0.64, coralHealth: 0.54, crabActivity: 0.38, shellSupply: 0.12, moonPhase: 0.51, visitorPressure: 0.44 },
  { seed: "state-06", tide: 0.28, stormRisk: 0.06, waterClarity: 0.82, coralHealth: 0.74, crabActivity: 0.54, shellSupply: 0.7, moonPhase: 0.98, visitorPressure: 0.2 },
  { seed: "state-07", tide: 0.48, stormRisk: 0.16, waterClarity: 0.58, coralHealth: 0.62, crabActivity: 0.62, shellSupply: 0.42, moonPhase: 0.48, visitorPressure: 0.9 },
  { seed: "state-08", tide: 0.34, stormRisk: 0.1, waterClarity: 0.88, coralHealth: 0.9, crabActivity: 0.44, shellSupply: 0.75, moonPhase: 0.22, visitorPressure: 0.18 },
  { seed: "state-09", tide: 0.55, stormRisk: 0.52, waterClarity: 0.72, coralHealth: 0.55, crabActivity: 0.7, shellSupply: 0.5, moonPhase: 0.63, visitorPressure: 0.5 },
  { seed: "state-10", tide: 0.51, stormRisk: 0.4, waterClarity: 0.5, coralHealth: 0.5, crabActivity: 0.5, shellSupply: 0.5, moonPhase: 0.5, visitorPressure: 0.5 }
];

assert.ok(route.includes("tidepool-conservatory-readiness-renderer-handoff-pass"), "route declares tidepool conservatory pass marker");
assert.ok(route.includes("cozy-island-tidepool-conservatory-entry.js?v=tidepool-conservatory-readiness-1"), "route loads cache-busted tidepool conservatory entry");
assert.ok(entry.includes(nexusEngineCdn), "changed entry imports NexusEngine main CDN");
assert.equal(entry.includes("LuminaryLabs-Dev/NexusRealtime@main"), false, "changed entry does not import old NexusRealtime runtime CDN");
assert.equal(kitSource.includes("LuminaryLabs-Dev/NexusRealtime@main"), false, "kit does not import old NexusRealtime runtime CDN");
assert.ok(entry.includes("getCozyIslandTidepoolConservatoryReadiness"), "GameHost exposes namespaced tidepool accessor");
assert.ok(entry.includes("getTidepoolConservatoryReadiness"), "GameHost exposes generic tidepool accessor");
assert.ok(entry.includes("tidepoolConservatoryReadiness"), "entry composes renderer handoff");
assert.ok(manifest.includes("cozy-island-tidepool-conservatory-readiness-domain-kit"), "manifest registers tidepool conservatory domain kit");
assert.ok(routedCastawayKitSmoke.includes("cozy-island-tidepool-conservatory-readiness-kits-smoke.mjs"), "existing routed kit smoke imports tidepool kit smoke");
assert.ok(routedCastawayCdnSmoke.includes("cozy-island-tidepool-conservatory-cdn-state-input-smoke.mjs"), "existing routed CDN smoke imports tidepool CDN smoke");

const domain = createCozyIslandTidepoolConservatoryReadinessDomainKit();
for (const input of cases) {
  const readiness = domain.evaluate(input);
  assert.ok(readiness.rendererHandoff.counts.total >= 16, `${input.seed}: enough tidepool descriptors for overlay variability`);
  assert.ok(readiness.coralNurseryBeds.every((item) => item.kind === "cozy-island.coral-nursery-bed"), `${input.seed}: coral kinds stable`);
  assert.ok(readiness.tidepoolSpecimenTrails.every((item) => item.kind === "cozy-island.tidepool-specimen-trail"), `${input.seed}: specimen kinds stable`);
  assert.ok(readiness.hermitCrabCrossings.every((item) => item.kind === "cozy-island.hermit-crab-crossing"), `${input.seed}: crab kinds stable`);
  assert.ok(readiness.shellMarkerMosaics.every((item) => item.kind === "cozy-island.shell-marker-mosaic"), `${input.seed}: shell kinds stable`);
  assert.ok(readiness.moonTideSurveys.every((item) => item.kind === "cozy-island.moon-tide-survey"), `${input.seed}: moon tide kinds stable`);
  assert.ok(readiness.conservationLedgers.every((item) => item.kind === "cozy-island.conservation-ledger"), `${input.seed}: ledger kinds stable`);
}

console.log(`cozy island tidepool conservatory CDN/state-input smoke passed ${cases.length} intake cases`);
