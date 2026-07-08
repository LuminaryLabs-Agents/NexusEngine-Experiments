import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createCozyIslandSeaTurtleHatcheryReadinessDomainKit } from "../experiments/cozy-island/cozy-island-sea-turtle-hatchery-kits.js";

const route = readFileSync("experiments/cozy-island/index.html", "utf8");
const entry = readFileSync("experiments/cozy-island/cozy-island-sea-turtle-hatchery-entry.js", "utf8");
const kitSource = readFileSync("experiments/cozy-island/cozy-island-sea-turtle-hatchery-kits.js", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");
const routedCastawayKitSmoke = readFileSync("tests/cozy-island-castaway-comfort-readiness-kits-smoke.mjs", "utf8");
const routedCastawayCdnSmoke = readFileSync("tests/cozy-island-castaway-comfort-cdn-state-input-smoke.mjs", "utf8");

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const cases = [
  { seed: "state-01", tide: 0.36, stormRisk: 0.12, sandHeat: 0.52, moonPhase: 0.84, predatorPressure: 0.24, visitorPressure: 0.18, surfCalm: 0.86, volunteerCoverage: 0.72 },
  { seed: "state-02", tide: 0.42, stormRisk: 0.2, sandHeat: 0.9, moonPhase: 0.66, predatorPressure: 0.28, visitorPressure: 0.32, surfCalm: 0.7, volunteerCoverage: 0.6 },
  { seed: "state-03", tide: 0.7, stormRisk: 0.82, sandHeat: 0.18, moonPhase: 0.52, predatorPressure: 0.46, visitorPressure: 0.4, surfCalm: 0.32, volunteerCoverage: 0.44 },
  { seed: "state-04", tide: 0.5, stormRisk: 0.18, sandHeat: 0.55, moonPhase: 0.74, predatorPressure: 0.92, visitorPressure: 0.35, surfCalm: 0.68, volunteerCoverage: 0.66 },
  { seed: "state-05", tide: 0.44, stormRisk: 0.22, sandHeat: 0.5, moonPhase: 0.78, predatorPressure: 0.38, visitorPressure: 0.92, surfCalm: 0.62, volunteerCoverage: 0.22 },
  { seed: "state-06", tide: 0.88, stormRisk: 0.54, sandHeat: 0.54, moonPhase: 0.36, predatorPressure: 0.4, visitorPressure: 0.24, surfCalm: 0.18, volunteerCoverage: 0.58 },
  { seed: "state-07", tide: 0.28, stormRisk: 0.06, sandHeat: 0.49, moonPhase: 0.98, predatorPressure: 0.2, visitorPressure: 0.2, surfCalm: 0.9, volunteerCoverage: 0.82 },
  { seed: "state-08", tide: 0.31, stormRisk: 0.16, sandHeat: 0.57, moonPhase: 0.08, predatorPressure: 0.28, visitorPressure: 0.74, surfCalm: 0.76, volunteerCoverage: 0.48 },
  { seed: "state-09", tide: 0.58, stormRisk: 0.44, sandHeat: 0.62, moonPhase: 0.62, predatorPressure: 0.6, visitorPressure: 0.56, surfCalm: 0.5, volunteerCoverage: 0.18 },
  { seed: "state-10", tide: 0.46, stormRisk: 0.2, sandHeat: 0.52, moonPhase: 0.5, predatorPressure: 0.34, visitorPressure: 0.32, surfCalm: 0.62, volunteerCoverage: 0.5 }
];

assert.ok(route.includes("sea-turtle-hatchery-readiness-renderer-handoff-pass"), "route declares sea turtle hatchery pass marker");
assert.ok(route.includes("cozy-island-sea-turtle-hatchery-entry.js?v=sea-turtle-hatchery-readiness-1"), "route loads cache-busted sea turtle hatchery entry");
assert.ok(entry.includes(nexusEngineCdn), "changed entry imports NexusEngine main CDN");
assert.equal(entry.includes("LuminaryLabs-Dev/NexusRealtime@main"), false, "changed entry does not import old NexusRealtime runtime CDN");
assert.equal(kitSource.includes("LuminaryLabs-Dev/NexusRealtime@main"), false, "kit does not import old NexusRealtime runtime CDN");
assert.ok(entry.includes("getCozyIslandSeaTurtleHatcheryReadiness"), "GameHost exposes namespaced turtle accessor");
assert.ok(entry.includes("getSeaTurtleHatcheryReadiness"), "GameHost exposes generic turtle accessor");
assert.ok(entry.includes("seaTurtleHatcheryReadiness"), "entry composes renderer handoff");
assert.ok(manifest.includes("cozy-island-tidepool-conservatory-readiness-domain-kit"), "manifest preserves tidepool conservatory domain kit");
assert.ok(manifest.includes("cozy-island-sea-turtle-hatchery-readiness-domain-kit"), "manifest registers sea turtle hatchery domain kit");
assert.ok(routedCastawayKitSmoke.includes("cozy-island-sea-turtle-hatchery-readiness-kits-smoke.mjs"), "existing routed kit smoke imports sea turtle kit smoke");
assert.ok(routedCastawayCdnSmoke.includes("cozy-island-sea-turtle-hatchery-cdn-state-input-smoke.mjs"), "existing routed CDN smoke imports sea turtle CDN smoke");

const domain = createCozyIslandSeaTurtleHatcheryReadinessDomainKit();
for (const input of cases) {
  const readiness = domain.evaluate(input);
  assert.ok(readiness.rendererHandoff.counts.total >= 17, `${input.seed}: enough hatchery descriptors for overlay variability`);
  assert.ok(readiness.nestTemperatureBands.every((item) => item.kind === "cozy-island.nest-temperature-band"), `${input.seed}: nest kinds stable`);
  assert.ok(readiness.predatorTrackBuffers.every((item) => item.kind === "cozy-island.predator-track-buffer"), `${input.seed}: predator kinds stable`);
  assert.ok(readiness.moonlitHatchlingLanes.every((item) => item.kind === "cozy-island.moonlit-hatchling-lane"), `${input.seed}: moon lane kinds stable`);
  assert.ok(readiness.surfWindowTimings.every((item) => item.kind === "cozy-island.surf-window-timing"), `${input.seed}: surf kinds stable`);
  assert.ok(readiness.volunteerRopeLines.every((item) => item.kind === "cozy-island.volunteer-rope-line"), `${input.seed}: rope kinds stable`);
  assert.ok(readiness.releaseLedgerStamps.every((item) => item.kind === "cozy-island.release-ledger-stamp"), `${input.seed}: ledger kinds stable`);
}

console.log(`cozy island sea turtle hatchery CDN/state-input smoke passed ${cases.length} intake cases`);
