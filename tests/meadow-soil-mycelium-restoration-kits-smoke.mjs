import assert from "node:assert/strict";
import {
  createMeadowSoilMyceliumRestorationDomainKit,
  MEADOW_SOIL_MYCELIUM_RESTORATION_DOMAIN_TREE
} from "../experiments/high-fidelity-meadow/src/meadow-soil-mycelium-restoration-kits.js";

const kit = createMeadowSoilMyceliumRestorationDomainKit();
const basePrior = {
  creekIrrigationReadiness: { rendererHandoff: { counts: { total: 24, creekRibbons: 9 } } },
  pollinatorRescueReadiness: { rendererHandoff: { counts: { total: 22, beeSafeLanes: 5 } } },
  harvestFestivalReadiness: { rendererHandoff: { counts: { total: 18, lanternRows: 4 } } },
  nightWatchReadiness: { rendererHandoff: { counts: { total: 20, watchLanterns: 4 } } },
  flockSafetyReadiness: { rendererHandoff: { counts: { total: 24, shelterRings: 4 } } }
};

const cases = Array.from({ length: 10 }, (_, index) => ({
  seed: `soil-case-${index}`,
  width: 196 + index,
  depth: 196,
  dayAmount: 0.34 + index * 0.04,
  windSeed: index * 0.17,
  flowers: Array.from({ length: 20 + index }, (_, flowerIndex) => ({
    x: -42 + flowerIndex * 4.1,
    z: Math.sin(flowerIndex * 0.7 + index) * 22
  })),
  sheep: Array.from({ length: 4 + (index % 8) }, (_, sheepIndex) => ({ id: `sheep-${index}-${sheepIndex}` })),
  ...basePrior,
  creekIrrigationReadiness: { rendererHandoff: { counts: { total: 18 + index, creekRibbons: 4 + (index % 6) } } },
  pollinatorRescueReadiness: { rendererHandoff: { counts: { total: 16 + index, beeSafeLanes: 3 + (index % 4) } } }
}));

assert.ok(JSON.stringify(MEADOW_SOIL_MYCELIUM_RESTORATION_DOMAIN_TREE).includes("mycelium-thread-domain"), "domain tree names mycelium subdomain");
assert.ok(JSON.stringify(MEADOW_SOIL_MYCELIUM_RESTORATION_DOMAIN_TREE).includes("renderer consumes descriptors only"), "domain tree documents renderer handoff");

for (const [index, input] of cases.entries()) {
  const readiness = kit.describe(input);
  assert.equal(readiness.kind, "meadow-soil-mycelium-restoration-readiness", `case ${index} readiness kind`);
  assert.ok(readiness.soilHealth >= 0 && readiness.soilHealth <= 1, `case ${index} soil health bounded`);
  assert.ok(["restored", "stabilizing", "repair-needed"].includes(readiness.missionState), `case ${index} mission state enum`);
  assert.equal(readiness.descriptors.soilSporeMonitors.length, 5, `case ${index} spore monitor count`);
  assert.equal(readiness.descriptors.myceliumThreads.length, 8, `case ${index} mycelium thread count`);
  assert.equal(readiness.descriptors.mushroomRings.length, 4, `case ${index} mushroom ring count`);
  assert.equal(readiness.descriptors.beetleLanes.length, 5, `case ${index} beetle lane count`);
  assert.equal(readiness.descriptors.hedgerowWindbreaks.length, 4, `case ${index} windbreak count`);
  assert.equal(readiness.descriptors.dawnSoilLedger.length, 1, `case ${index} ledger count`);
  assert.equal(readiness.rendererHandoff.counts.total, 27, `case ${index} renderer total count`);
  assert.equal(readiness.rendererHandoff.contract, "renderer-consumes-descriptors-only", `case ${index} handoff contract`);
  assert.ok(readiness.rendererHandoff.descriptors.soilSporeMonitors.every((monitor) => monitor.rendererContract.rendererMustNotOwn.includes("webgl")), `case ${index} ownership boundary`);
  assert.ok(JSON.stringify(readiness).includes("rendererMustNotOwn"), `case ${index} ownership included`);
  assert.ok(!JSON.stringify(readiness).includes("[object Object]"), `case ${index} JSON clean`);
}

const weak = kit.describe({ seed: "weak", flowers: [], sheep: Array.from({ length: 18 }, (_, index) => ({ id: index })) });
const supported = kit.describe({ seed: "supported", flowers: Array.from({ length: 70 }, (_, index) => ({ x: index - 35, z: Math.sin(index) * 20 })), sheep: [], ...basePrior });
assert.ok(supported.soilHealth >= weak.soilHealth - 0.08, "prior water/pollinator/hedgerow support should not collapse soil health");

console.log("meadow soil mycelium restoration kits smoke passed 10 intake cases");
