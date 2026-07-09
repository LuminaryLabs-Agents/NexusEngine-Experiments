import assert from "node:assert/strict";
import { createZombieOrchardAntiserumWellhouseReadinessDomainKit } from "../experiments/zombie-orchard/src/antiserum-wellhouse-readiness-kits.js";

const cases = Array.from({ length: 10 }, (_, index) => ({
  seed: `antiserum-case-${index}`,
  player: { position: { x: index * 1.4, y: 0, z: -index * 0.8 } },
  appleCount: index + 2,
  herbBundles: index + 1,
  vials: Math.max(0, index - 1),
  waterUnits: 1 + Math.floor(index / 2),
  health01: Math.max(0.28, 0.9 - index * 0.045),
  stamina01: Math.min(1, 0.4 + index * 0.06),
  pressure01: Math.min(1, 0.18 + index * 0.055),
  infection01: Math.min(1, 0.12 + index * 0.06),
  roundNumber: index + 1,
  survivors: Array.from({ length: index % 5 }, (_, survivorIndex) => ({ position: { x: survivorIndex * 4, y: 0, z: index + survivorIndex * 3 } })),
  monsters: Array.from({ length: index + 1 }, (_, monsterIndex) => ({ position: { x: -monsterIndex * 3, y: 0, z: index * 2 + monsterIndex } })),
  orchard: { activeApples: Array.from({ length: 3 }, (_, appleIndex) => ({ position: { x: appleIndex * 5, y: 0.2, z: -appleIndex * 4 } })) },
  simulatedInput: { dodge: index % 2 === 0 }
}));

const domain = createZombieOrchardAntiserumWellhouseReadinessDomainKit({ seed: "antiserum-smoke" });
const readinessScores = [];
for (const [index, input] of cases.entries()) {
  const result = domain.evaluate(input);
  readinessScores.push(result.summary.readinessScore);
  assert.equal(result.rendererHandoff.policy, "renderer-consumes-descriptors-only", `descriptor policy for case ${index}`);
  assert.equal(result.rendererHandoff.counts.herbalAntiserumMortars >= 3, true, `mortars for case ${index}`);
  assert.equal(result.rendererHandoff.counts.moonwaterStills >= 2, true, `stills for case ${index}`);
  assert.equal(result.rendererHandoff.counts.biteTriageCots >= 3, true, `triage cots for case ${index}`);
  assert.equal(result.rendererHandoff.counts.bloodSampleFlags >= 4, true, `blood flags for case ${index}`);
  assert.equal(result.rendererHandoff.counts.ravenCourierVials >= 3, true, `courier vials for case ${index}`);
  assert.equal(result.rendererHandoff.counts.dawnAntiserumLedgers, 2, `ledger count for case ${index}`);
  assert.ok(result.rendererHandoff.counts.total >= 17, `descriptor total for case ${index}`);
  assert.ok(result.summary.readinessScore >= 0 && result.summary.readinessScore <= 1, `bounded readiness for case ${index}`);
  assert.ok(["antiserum-distribution-ready", "brew-and-triage", "stabilize-bites", "gather-reagents"].includes(result.summary.missionState), `state enum for case ${index}`);
  assert.doesNotThrow(() => JSON.stringify(result.rendererHandoff), `handoff serializable for case ${index}`);
}

assert.ok(readinessScores.at(-1) >= readinessScores[0], "later cases improve or preserve antiserum readiness");
console.log("Zombie Orchard antiserum wellhouse readiness kits smoke passed 10 intake cases.");
