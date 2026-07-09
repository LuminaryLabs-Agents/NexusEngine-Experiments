import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  COZY_ISLAND_STORM_GARDEN_RECOVERY_DOMAIN_TREE,
  COZY_ISLAND_STORM_GARDEN_FORBIDDEN_OWNERSHIP,
  createCozyIslandRainCisternGridKit,
  createCozyIslandCoconutFilterBedKit,
  createCozyIslandMedicinalHerbNurseryKit,
  createCozyIslandDriftwoodSplintRackKit,
  createCozyIslandShellWindWarningKit,
  createCozyIslandDawnClinicLedgerKit,
  createCozyIslandStormGardenRecoveryReadinessDomainKit
} from "../experiments/cozy-island/cozy-island-storm-garden-recovery-kits.js";

const cases = [
  { name: "balanced dawn clinic", seed: "storm-01", stormDamage: 0.34, rainfall: 0.52, freshwater: 0.62, injuries: 2, herbCoverage: 0.66, coconutStock: 8, wind: { x: 0.18, z: 0.14 }, tide: 0.42 },
  { name: "freshwater collapse", seed: "storm-02", stormDamage: 0.48, rainfall: 0.74, freshwater: 0.12, injuries: 4, herbCoverage: 0.52, coconutStock: 5, wind: { x: 0.22, z: 0.18 }, tide: 0.5 },
  { name: "herb nursery shortage", seed: "storm-03", stormDamage: 0.4, rainfall: 0.48, freshwater: 0.48, injuries: 3, herbCoverage: 0.14, coconutStock: 7, wind: { x: 0.18, z: 0.2 }, tide: 0.46 },
  { name: "mass injury triage", seed: "storm-04", stormDamage: 0.58, rainfall: 0.5, freshwater: 0.44, injuries: 8, herbCoverage: 0.44, coconutStock: 6, wind: { x: 0.24, z: 0.22 }, tide: 0.44 },
  { name: "heavy storm damage", seed: "storm-05", stormDamage: 0.92, rainfall: 0.64, freshwater: 0.4, injuries: 5, herbCoverage: 0.5, coconutStock: 4, wind: { x: 0.36, z: 0.34 }, tide: 0.6 },
  { name: "low coconut stock", seed: "storm-06", stormDamage: 0.5, rainfall: 0.46, freshwater: 0.38, injuries: 4, herbCoverage: 0.48, coconutStock: 2, wind: { x: 0.18, z: 0.16 }, tide: 0.48 },
  { name: "gust shell alarm", seed: "storm-07", stormDamage: 0.62, rainfall: 0.34, freshwater: 0.56, injuries: 3, herbCoverage: 0.58, coconutStock: 7, wind: { x: 0.58, z: 0.42 }, tide: 0.36 },
  { name: "rain catchment surge", seed: "storm-08", stormDamage: 0.3, rainfall: 0.9, freshwater: 0.3, injuries: 2, herbCoverage: 0.6, coconutStock: 9, wind: { x: 0.12, z: 0.16 }, tide: 0.4 },
  { name: "high tide murk", seed: "storm-09", stormDamage: 0.52, rainfall: 0.42, freshwater: 0.36, injuries: 6, herbCoverage: 0.42, coconutStock: 5, wind: { x: 0.28, z: 0.24 }, tide: 0.92 },
  { name: "fallback defaults", seed: "storm-10" }
];

const source = readFileSync("experiments/cozy-island/cozy-island-storm-garden-recovery-kits.js", "utf8");
const implementationSource = source.replace(/export const COZY_ISLAND_STORM_GARDEN_FORBIDDEN_OWNERSHIP = \[[\s\S]*?\];/, "");
const domain = createCozyIslandStormGardenRecoveryReadinessDomainKit();

assert.ok(COZY_ISLAND_STORM_GARDEN_RECOVERY_DOMAIN_TREE.includes("freshwater-recovery-domain"), "domain tree keeps freshwater split");
assert.ok(COZY_ISLAND_STORM_GARDEN_RECOVERY_DOMAIN_TREE.includes("shelter-medicine-domain"), "domain tree keeps medicine split");
assert.ok(COZY_ISLAND_STORM_GARDEN_RECOVERY_DOMAIN_TREE.includes("renderer consumes descriptors only"), "domain tree declares handoff policy");
for (const marker of COZY_ISLAND_STORM_GARDEN_FORBIDDEN_OWNERSHIP) {
  assert.equal(implementationSource.includes(marker), false, `kit source must not own ${marker}`);
}

for (const input of cases) {
  const readiness = domain.evaluate(input);
  assert.equal(readiness.kind, "cozy-island.storm-garden-recovery.readiness", `${input.name}: readiness kind`);
  assert.ok(readiness.rainCisternGrids.length >= 4, `${input.name}: cistern descriptors`);
  assert.ok(readiness.coconutFilterBeds.length >= 3, `${input.name}: filter descriptors`);
  assert.ok(readiness.medicinalHerbNurseries.length >= 4, `${input.name}: herb descriptors`);
  assert.ok(readiness.driftwoodSplintRacks.length >= 3, `${input.name}: splint descriptors`);
  assert.ok(readiness.shellWindWarnings.length >= 3, `${input.name}: shell warning descriptors`);
  assert.equal(readiness.dawnClinicLedgers.length, 1, `${input.name}: dawn clinic ledger descriptor`);
  assert.equal(readiness.rendererHandoff.counts.total, readiness.rendererHandoff.descriptors.length, `${input.name}: handoff total mirrors descriptors`);
  assert.equal(readiness.rendererHandoff.descriptorPolicy, "renderer-consumes-descriptors-only", `${input.name}: handoff policy`);
  assert.ok(readiness.summary.recoveryNeed >= 0 && readiness.summary.recoveryNeed <= 1, `${input.name}: recovery need bounded`);
  assert.doesNotThrow(() => JSON.stringify(readiness), `${input.name}: serializable output`);
}

assert.equal(createCozyIslandRainCisternGridKit(cases[1]).length, 5, "freshwater collapse adds fifth cistern");
assert.equal(createCozyIslandCoconutFilterBedKit(cases[5]).length, 3, "low coconut stock reduces filter beds");
assert.equal(createCozyIslandMedicinalHerbNurseryKit(cases[3]).length, 5, "mass injury case adds fifth herb nursery");
assert.equal(createCozyIslandDriftwoodSplintRackKit(cases[3]).length, 4, "injury case adds fourth splint rack");
assert.equal(createCozyIslandShellWindWarningKit(cases[6]).length, 4, "gust case adds fourth shell warning");
assert.equal(createCozyIslandDawnClinicLedgerKit(cases[1])[0].state.nextAction, "seal rain cisterns", "freshwater collapse changes ledger action");

console.log(`cozy island storm garden recovery readiness kits smoke passed ${cases.length} intake cases`);
