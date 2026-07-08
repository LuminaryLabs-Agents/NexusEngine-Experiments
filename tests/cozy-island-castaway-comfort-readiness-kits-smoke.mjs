import "./cozy-island-tidepool-conservatory-readiness-kits-smoke.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  COZY_ISLAND_CASTAWAY_COMFORT_DOMAIN_TREE,
  COZY_ISLAND_CASTAWAY_FORBIDDEN_OWNERSHIP,
  createCozyIslandFreshWaterSpringKit,
  createCozyIslandForageCacheRingKit,
  createCozyIslandShadeShelterCanopyKit,
  createCozyIslandSignalFireReadinessKit,
  createCozyIslandStormCoverPocketKit,
  createCozyIslandCanoeLaunchWindowKit,
  createCozyIslandCastawayComfortReadinessDomainKit
} from "../experiments/cozy-island/cozy-island-castaway-comfort-kits.js";

const cases = [
  { name: "balanced noon", seed: "case-01", tide: 0.38, hunger: 0.35, thirst: 0.42, stormRisk: 0.18, timeOfDay: 0.5, smokeStrength: 0.72 },
  { name: "thirst emergency", seed: "case-02", tide: 0.22, hunger: 0.2, thirst: 0.92, stormRisk: 0.12, timeOfDay: 0.62, smokeStrength: 0.7 },
  { name: "food shortage", seed: "case-03", tide: 0.46, hunger: 0.91, thirst: 0.3, stormRisk: 0.24, timeOfDay: 0.36, smokeStrength: 0.55 },
  { name: "storm front", seed: "case-04", tide: 0.64, hunger: 0.34, thirst: 0.36, stormRisk: 0.88, timeOfDay: 0.44, smokeStrength: 0.48 },
  { name: "high tide launch blocked", seed: "case-05", tide: 0.9, hunger: 0.42, thirst: 0.38, stormRisk: 0.45, timeOfDay: 0.72, smokeStrength: 0.64 },
  { name: "low tide launch pass", seed: "case-06", tide: 0.36, hunger: 0.4, thirst: 0.4, stormRisk: 0.08, timeOfDay: 0.22, smokeStrength: 0.82 },
  { name: "smoke failure", seed: "case-07", tide: 0.4, hunger: 0.28, thirst: 0.47, stormRisk: 0.36, timeOfDay: 0.58, smokeStrength: 0.12 },
  { name: "midday heat", seed: "case-08", tide: 0.51, hunger: 0.5, thirst: 0.5, stormRisk: 0.22, timeOfDay: 0.5, smokeStrength: 0.68 },
  { name: "night return", seed: "case-09", tide: 0.44, hunger: 0.62, thirst: 0.72, stormRisk: 0.28, timeOfDay: 0.02, smokeStrength: 0.58 },
  { name: "minimal fallback", seed: "case-10" }
];

const source = readFileSync("experiments/cozy-island/cozy-island-castaway-comfort-kits.js", "utf8");
const implementationSource = source.replace(/export const COZY_ISLAND_CASTAWAY_FORBIDDEN_OWNERSHIP = \[[\s\S]*?\];/, "");
const domain = createCozyIslandCastawayComfortReadinessDomainKit();

assert.ok(COZY_ISLAND_CASTAWAY_COMFORT_DOMAIN_TREE.includes("survival-resource-domain"), "domain tree keeps survival resource split");
assert.ok(COZY_ISLAND_CASTAWAY_COMFORT_DOMAIN_TREE.includes("renderer consumes descriptors only"), "domain tree declares handoff policy");
for (const marker of COZY_ISLAND_CASTAWAY_FORBIDDEN_OWNERSHIP) {
  assert.equal(implementationSource.includes(marker), false, `kit source must not own ${marker}`);
}

for (const input of cases) {
  const readiness = domain.evaluate(input);
  assert.equal(readiness.kind, "cozy-island.castaway-comfort.readiness", `${input.name}: readiness kind`);
  assert.ok(readiness.freshWaterSprings.length >= 2, `${input.name}: water descriptors`);
  assert.ok(readiness.forageCacheRings.length >= 3, `${input.name}: forage descriptors`);
  assert.equal(readiness.shadeShelterCanopies.length, 3, `${input.name}: shade descriptors`);
  assert.equal(readiness.signalFireReadiness.length, 1, `${input.name}: signal descriptor`);
  assert.ok(readiness.stormCoverPockets.length >= 2, `${input.name}: storm cover descriptors`);
  assert.equal(readiness.canoeLaunchWindows.length, 2, `${input.name}: canoe descriptors`);
  assert.equal(readiness.rendererHandoff.counts.total, readiness.rendererHandoff.descriptors.length, `${input.name}: handoff total mirrors descriptors`);
  assert.equal(readiness.rendererHandoff.descriptorPolicy, "renderer-consumes-descriptors-only", `${input.name}: handoff policy`);
  assert.doesNotThrow(() => JSON.stringify(readiness), `${input.name}: serializable output`);
}

assert.equal(createCozyIslandFreshWaterSpringKit(cases[1]).length, 3, "high thirst adds third water spring");
assert.equal(createCozyIslandForageCacheRingKit(cases[2]).length, 4, "high hunger adds fourth forage cache");
assert.equal(createCozyIslandShadeShelterCanopyKit(cases[7]).length, 3, "shade kit is stable and atomic");
assert.equal(createCozyIslandSignalFireReadinessKit(cases[6])[0].state.relightUrgency > 0.7, true, "low smoke raises relight urgency");
assert.equal(createCozyIslandStormCoverPocketKit(cases[3]).length, 3, "storm risk adds third cover pocket");
assert.equal(createCozyIslandCanoeLaunchWindowKit(cases[5]).some((item) => item.state.launchReadiness > 0.6), true, "safe tide creates launch window");

console.log(`cozy island castaway comfort readiness kits smoke passed ${cases.length} intake cases`);
