import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  SORA_STORMGLASS_COURIER_DOMAIN_TREE,
  SORA_STORMGLASS_COURIER_KITS,
  createSoraStormglassThermalLaneKit,
  createSoraStormglassStormCellFieldKit,
  createSoraStormglassCourierFlightKit,
  createSoraStormglassCargoStabilityKit,
  createSoraStormglassSignalBuoyKit,
  createSoraStormglassSanctuaryApproachKit,
  createSoraStormglassCourierObjectiveKit,
  createSoraStormglassDawnCourierLedgerKit,
  createSoraStormglassCourierRendererHandoffKit,
  createSoraStormglassCourierReadinessDomainKit
} from "../experiments/_kits/sora-the-infinite/sora-stormglass-courier-domain-kits.js";

const cases = [
  {},
  { seed: 1, x: 0.08, y: 0.62 },
  { seed: 42, x: 0.22, y: 0.18, vx: 0.2, vy: -0.2 },
  { seed: 741, x: 0.5, y: 0.5, collectedBuoyIds: ["signal-buoy-1"] },
  { seed: 999, x: 0.9, y: 0.68, cargoIntegrity: 0.5, collectedBuoyIds: ["signal-buoy-1", "signal-buoy-2", "signal-buoy-3"] },
  { seed: -10, x: -20, y: 40, vx: Infinity, vy: NaN, cargoIntegrity: -4 },
  { seed: 10000000, tick: 9999999999, elapsed: 999999, score: 999999999 },
  { seed: "bad", x: "bad", y: null, cargoIntegrity: "bad", collectedBuoyIds: [1, 1, 2] },
  { state: { seed: 808, x: 0.71, y: 0.33, cargoIntegrity: 0.82, phase: "routing" } },
  { stormglassCourier: { seed: 2026, x: 0.93, y: 0.68, delivery: true, cargoIntegrity: 0.91, collectedBuoyIds: ["signal-buoy-1", "signal-buoy-2", "signal-buoy-3"] } }
];

const thermalKit = createSoraStormglassThermalLaneKit();
const stormKit = createSoraStormglassStormCellFieldKit();
const flightKit = createSoraStormglassCourierFlightKit();
const cargoKit = createSoraStormglassCargoStabilityKit();
const buoyKit = createSoraStormglassSignalBuoyKit();
const approachKit = createSoraStormglassSanctuaryApproachKit();
const objectiveKit = createSoraStormglassCourierObjectiveKit();
const ledgerKit = createSoraStormglassDawnCourierLedgerKit();
const handoffKit = createSoraStormglassCourierRendererHandoffKit();
const domain = createSoraStormglassCourierReadinessDomainKit();

assert.match(SORA_STORMGLASS_COURIER_DOMAIN_TREE, /renderer consumes descriptors only/);
assert.equal(SORA_STORMGLASS_COURIER_KITS.length, 10);
assert.equal(domain.kits.length, 9);

for (const [index, intake] of cases.entries()) {
  const described = domain.describe(intake);
  const state = described.state;
  const thermalLanes = thermalKit.describe(state);
  const stormCells = stormKit.describe(state);
  const signalBuoys = buoyKit.describe(state);
  const landing = approachKit.describe(state);
  const moved = flightKit.step({ state, input: { pitch: index % 3 - 1, bank: index % 2 ? 1 : -1, boost: index % 4 === 0 }, dt: 1 / 60, thermalLanes });
  const stable = cargoKit.resolve({ state: moved, stormCells, dt: 1 / 60 });
  const objective = objectiveKit.resolve({ state: stable, buoys: signalBuoys, landing });
  const cargoDescriptors = cargoKit.describe(objective);
  const objectiveDescriptors = objectiveKit.describe({ ...objective, targetCount: signalBuoys.length });
  const ledger = ledgerKit.describe({ ...objective, targetCount: signalBuoys.length });
  const handoff = handoffKit.describe({ descriptors: { thermalLanes, stormCells, signalBuoys, landing, cargoDescriptors, objectiveDescriptors, ledger } });

  assert.equal(thermalLanes.length, 5, `case ${index}: thermal lane count`);
  assert.equal(stormCells.length, 6, `case ${index}: storm cell count`);
  assert.equal(signalBuoys.length, 3, `case ${index}: signal buoy count`);
  assert.equal(landing.length, 1, `case ${index}: landing count`);
  assert.equal(cargoDescriptors.length, 1, `case ${index}: cargo descriptor count`);
  assert.equal(objectiveDescriptors.length, 1, `case ${index}: objective descriptor count`);
  assert.equal(ledger.length, 1, `case ${index}: ledger count`);
  assert.ok(objective.x >= 0.02 && objective.x <= 0.98, `case ${index}: x bounded`);
  assert.ok(objective.y >= 0.03 && objective.y <= 0.97, `case ${index}: y bounded`);
  assert.ok(objective.cargoIntegrity >= 0 && objective.cargoIntegrity <= 1, `case ${index}: integrity bounded`);
  assert.ok(objectiveDescriptors[0].readiness >= 0 && objectiveDescriptors[0].readiness <= 1, `case ${index}: readiness bounded`);
  assert.ok(["launching", "routing", "approach", "delivered", "lost"].includes(objective.phase), `case ${index}: phase enum`);
  assert.equal(handoff.contract, "renderer consumes descriptors only");
  assert.ok(handoff.forbiddenOwnership.includes("dom"));
  assert.ok(handoff.forbiddenOwnership.includes("frame-loop"));
  assert.doesNotThrow(() => JSON.stringify(described), `case ${index}: domain JSON safe`);
  assert.doesNotThrow(() => JSON.stringify(handoff), `case ${index}: handoff JSON safe`);
}

const source = await readFile(new URL("../experiments/_kits/sora-the-infinite/sora-stormglass-courier-domain-kits.js", import.meta.url), "utf8");
for (const forbiddenToken of ["document.", "window.", "requestAnimationFrame", "THREE.", "AudioContext", "canvas.getContext"]) {
  assert.equal(source.includes(forbiddenToken), false, `reusable kit must not own ${forbiddenToken}`);
}

console.log("Sora stormglass courier domain kits smoke passed 10 intake cases.");
