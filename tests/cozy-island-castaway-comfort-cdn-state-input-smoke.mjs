import "./cozy-island-tidepool-conservatory-cdn-state-input-smoke.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createCozyIslandCastawayComfortReadinessDomainKit } from "../experiments/cozy-island/cozy-island-castaway-comfort-kits.js";

const route = readFileSync("experiments/cozy-island/index.html", "utf8");
const entry = readFileSync("experiments/cozy-island/cozy-island-castaway-comfort-entry.js", "utf8");
const kitSource = readFileSync("experiments/cozy-island/cozy-island-castaway-comfort-kits.js", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");
const checks = readFileSync("scripts/run-checks.mjs", "utf8");

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const cases = [
  { seed: "state-01", tide: 0.38, hunger: 0.35, thirst: 0.42, stormRisk: 0.18, smokeStrength: 0.72 },
  { seed: "state-02", tide: 0.22, hunger: 0.2, thirst: 0.92, stormRisk: 0.12, smokeStrength: 0.7 },
  { seed: "state-03", tide: 0.46, hunger: 0.91, thirst: 0.3, stormRisk: 0.24, smokeStrength: 0.55 },
  { seed: "state-04", tide: 0.64, hunger: 0.34, thirst: 0.36, stormRisk: 0.88, smokeStrength: 0.48 },
  { seed: "state-05", tide: 0.9, hunger: 0.42, thirst: 0.38, stormRisk: 0.45, smokeStrength: 0.64 },
  { seed: "state-06", tide: 0.36, hunger: 0.4, thirst: 0.4, stormRisk: 0.08, smokeStrength: 0.82 },
  { seed: "state-07", tide: 0.4, hunger: 0.28, thirst: 0.47, stormRisk: 0.36, smokeStrength: 0.12 },
  { seed: "state-08", tide: 0.51, hunger: 0.5, thirst: 0.5, stormRisk: 0.22, smokeStrength: 0.68 },
  { seed: "state-09", tide: 0.44, hunger: 0.62, thirst: 0.72, stormRisk: 0.28, smokeStrength: 0.58 },
  { seed: "state-10", tide: 0.56, hunger: 0.7, thirst: 0.8, stormRisk: 0.72, smokeStrength: 0.36 }
];

assert.ok(route.includes("castaway-comfort-readiness-renderer-handoff-pass"), "route declares castaway comfort pass marker");
assert.ok(route.includes("cozy-island-castaway-comfort-entry.js?v=castaway-comfort-readiness-1"), "route loads cache-busted castaway comfort entry");
assert.ok(entry.includes(nexusEngineCdn), "changed entry imports NexusEngine main CDN");
assert.equal(entry.includes("LuminaryLabs-Dev/NexusRealtime@main"), false, "changed entry does not import old NexusRealtime runtime CDN");
assert.equal(kitSource.includes("LuminaryLabs-Dev/NexusRealtime@main"), false, "kit does not import old NexusRealtime runtime CDN");
assert.ok(entry.includes("getCozyIslandCastawayComfortReadiness"), "GameHost exposes cozy castaway comfort accessor");
assert.ok(entry.includes("getCastawayComfortReadiness"), "GameHost exposes generic castaway comfort accessor");
assert.ok(entry.includes("getRendererHandoff"), "entry composes renderer handoff");
assert.ok(manifest.includes("cozy-island-castaway-comfort-readiness-domain-kit"), "manifest registers new cozy island domain kit");
assert.ok(checks.includes("tests/cozy-island-castaway-comfort-readiness-kits-smoke.mjs"), "full/deploy checks route kit smoke");
assert.ok(checks.includes("tests/cozy-island-castaway-comfort-cdn-state-input-smoke.mjs"), "full/deploy checks route CDN/state smoke");

const domain = createCozyIslandCastawayComfortReadinessDomainKit();
for (const input of cases) {
  const readiness = domain.evaluate(input);
  assert.ok(readiness.rendererHandoff.counts.total >= 13, `${input.seed}: enough descriptors for overlay variability`);
  assert.ok(readiness.freshWaterSprings.every((item) => item.kind === "cozy-island.fresh-water-spring"), `${input.seed}: water kinds stable`);
  assert.ok(readiness.forageCacheRings.every((item) => item.kind === "cozy-island.forage-cache-ring"), `${input.seed}: forage kinds stable`);
  assert.ok(readiness.shadeShelterCanopies.every((item) => item.kind === "cozy-island.shade-shelter-canopy"), `${input.seed}: shade kinds stable`);
  assert.ok(readiness.signalFireReadiness.every((item) => item.kind === "cozy-island.signal-fire-readiness"), `${input.seed}: signal kinds stable`);
  assert.ok(readiness.stormCoverPockets.every((item) => item.kind === "cozy-island.storm-cover-pocket"), `${input.seed}: cover kinds stable`);
  assert.ok(readiness.canoeLaunchWindows.every((item) => item.kind === "cozy-island.canoe-launch-window"), `${input.seed}: canoe kinds stable`);
}

console.log(`cozy island castaway comfort CDN/state-input smoke passed ${cases.length} intake cases`);
