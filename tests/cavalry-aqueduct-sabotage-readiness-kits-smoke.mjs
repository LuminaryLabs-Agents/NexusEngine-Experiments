import assert from "node:assert/strict";
import {
  createCavalryAqueductSabotageReadinessDomainKit,
  createCavalrySpringIntakeWatchtowerKit,
  createCavalryAqueductArchStressMarkKit,
  createCavalryCisternRationTokenKit,
  createCavalrySaboteurTrailSignalKit,
  createCavalryEngineerRepairColumnKit,
  createCavalryDawnWaterLedgerKit
} from "../experiments/The Cavalry of Rome/src/cavalry-aqueduct-sabotage-readiness-domain-kit.js";

function makeCampaign(seed = 0) {
  const owners = ["player", "neutral", "enemy", "player", "neutral", "enemy", "player", "neutral"];
  const cells = owners.map((owner, index) => ({
    id: `cell-${seed}-${index}`,
    owner,
    x: 90 + index * 84 + seed * 9,
    y: 130 + (index % 3) * 72 + seed * 5,
    troops: { l: 3 + ((index + seed) % 6), m: (index + seed) % 3, h: index % 2 },
    neighbors: [`cell-${seed}-${Math.max(0, index - 1)}`, `cell-${seed}-${Math.min(owners.length - 1, index + 1)}`]
  }));
  return {
    cells,
    turn: seed,
    actions: seed % 5,
    sizeId: seed % 2 ? "frontier" : "province",
    preset: { label: "smoke-province", worldW: 900, worldH: 600 }
  };
}

const cases = Array.from({ length: 10 }, (_, index) => makeCampaign(index));
const domainKit = createCavalryAqueductSabotageReadinessDomainKit();
const atomicKits = [
  createCavalrySpringIntakeWatchtowerKit(),
  createCavalryAqueductArchStressMarkKit(),
  createCavalryCisternRationTokenKit(),
  createCavalrySaboteurTrailSignalKit(),
  createCavalryEngineerRepairColumnKit(),
  createCavalryDawnWaterLedgerKit()
];

for (const [index, input] of cases.entries()) {
  const output = domainKit.describe(input);
  assert.equal(output.kind, "aqueduct-sabotage-readiness-domain");
  assert.match(output.tree, /renderer consumes descriptors only/);
  assert.ok(Number.isFinite(output.readiness), `case ${index} readiness numeric`);
  assert.ok(output.readiness >= 0 && output.readiness <= 1, `case ${index} readiness bounded`);
  assert.ok(["water-secured", "repair-underway", "sabotage-critical"].includes(output.missionState), `case ${index} mission state enum`);
  assert.ok(output.springIntakeWatchtowers.length > 0, `case ${index} spring intakes`);
  assert.ok(output.aqueductArchStressMarks.length > 0, `case ${index} arch stress marks`);
  assert.ok(output.cisternRationTokens.length > 0, `case ${index} cistern tokens`);
  assert.ok(output.saboteurTrailSignals.length > 0, `case ${index} saboteur trails`);
  assert.ok(output.engineerRepairColumns.length > 0, `case ${index} engineer columns`);
  assert.equal(output.dawnWaterLedgers.length, 1, `case ${index} dawn ledger`);
  assert.equal(output.rendererHandoff.rendererConsumesDescriptorsOnly, true, `case ${index} descriptor-only`);
  assert.equal(output.rendererHandoff.counts.springIntakeWatchtowers, output.springIntakeWatchtowers.length);
  assert.doesNotThrow(() => JSON.stringify(output), `case ${index} serializable`);
  for (const kit of atomicKits) {
    const described = kit.describe(input);
    assert.ok(Array.isArray(described), `case ${index} ${kit.id} returns array`);
    assert.ok(described.length > 0, `case ${index} ${kit.id} returns descriptors`);
  }
}

const weak = domainKit.describe(makeCampaign(2));
const stronger = domainKit.describe({
  ...makeCampaign(2),
  cells: makeCampaign(2).cells.map((cell) => ({ ...cell, owner: cell.owner === "enemy" ? "neutral" : "player", troops: { l: 8, m: 2, h: 1 } })),
  turn: 7
});
assert.ok(stronger.readiness >= weak.readiness || stronger.missionState !== "sabotage-critical", "stronger friendly control should not worsen the readiness phase");

console.log("Cavalry aqueduct sabotage readiness kits smoke passed 10 intake cases.");
