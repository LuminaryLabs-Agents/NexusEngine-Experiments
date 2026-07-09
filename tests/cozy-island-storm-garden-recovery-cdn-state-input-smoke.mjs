import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createCozyIslandStormGardenRecoveryReadinessDomainKit } from "../experiments/cozy-island/cozy-island-storm-garden-recovery-kits.js";

const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const route = readFileSync("experiments/cozy-island/index.html", "utf8");
const entry = readFileSync("experiments/cozy-island/cozy-island-storm-garden-recovery-entry.js", "utf8");
const kitSource = readFileSync("experiments/cozy-island/cozy-island-storm-garden-recovery-kits.js", "utf8");
const implementationSource = kitSource.replace(/COZY_ISLAND_STORM_GARDEN_FORBIDDEN_OWNERSHIP = \[[\s\S]*?\];/, "");

assert.ok(route.includes("storm-garden-recovery-readiness-renderer-handoff-pass"), "route declares storm garden recovery pass marker");
assert.ok(route.includes("cozy-island-storm-garden-recovery-entry.js"), "route loads storm garden recovery entry");
assert.ok(entry.includes(NEXUS_ENGINE_MAIN_CDN), "entry imports NexusEngine main CDN");
assert.equal(entry.includes("NexusRealtime"), false, "changed entry avoids old NexusRealtime import");
assert.ok(entry.includes("getCozyIslandStormGardenRecoveryReadiness"), "entry exposes GameHost readiness accessor");
assert.ok(entry.includes("stormGardenRecoveryReadiness"), "entry composes renderer handoff key");
assert.equal(implementationSource.includes("document."), false, "kit source avoids DOM ownership");
assert.equal(implementationSource.includes("window."), false, "kit source avoids browser global ownership");
assert.equal(implementationSource.includes("requestAnimationFrame"), false, "kit source avoids frame loop ownership");

const domain = createCozyIslandStormGardenRecoveryReadinessDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => ({
  seed: `cdn-storm-${index + 1}`,
  stormDamage: index / 9,
  rainfall: (10 - index) / 10,
  freshwater: (index % 5) / 4,
  injuries: index,
  herbCoverage: 1 - index / 12,
  coconutStock: 2 + index,
  tide: 0.22 + index * 0.06,
  wind: { x: index * 0.06, z: 0.32 - index * 0.02 }
}));

for (const [index, input] of cases.entries()) {
  const readiness = domain.evaluate(input);
  assert.equal(readiness.rendererHandoff.descriptorPolicy, "renderer-consumes-descriptors-only", `case ${index + 1}: descriptor policy`);
  assert.ok(readiness.rendererHandoff.counts.total >= 18, `case ${index + 1}: descriptor count`);
  assert.ok(readiness.dawnClinicLedgers[0].state.cleanWaterHours >= 2, `case ${index + 1}: clean water hours bounded`);
  assert.doesNotThrow(() => JSON.stringify(readiness.rendererHandoff), `case ${index + 1}: handoff serializable`);
}

console.log(`cozy island storm garden recovery CDN/state/input smoke passed ${cases.length} simulated cases against NexusEngine main CDN wiring`);
