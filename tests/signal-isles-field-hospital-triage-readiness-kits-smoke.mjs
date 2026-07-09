import assert from "node:assert/strict";
import { createSignalIslesFieldHospitalTriageReadinessDomainKit, SIGNAL_ISLES_FIELD_HOSPITAL_TRIAGE_KITS } from "../experiments/_kits/nexus-frontier-signal-isles/signal-isles-field-hospital-triage-readiness-domain-kits.js";

const level = {
  scanSites: [{ id: "scan-ruin-01", x: -7, z: -3 }, { id: "scan-ruin-02", x: 1.5, z: 5 }, { id: "scan-ruin-03", x: 7, z: -2.2 }],
  buildSites: [{ id: "build-site-01", structureId: "signal-mast-01", x: 0, z: 1 }],
  gates: [{ id: "gate-01", x: 5, z: 1 }],
  resourceNodes: [{ id: "resource-node-01", x: -3, z: 4 }, { id: "resource-node-02", x: 3, z: -4 }],
  cargo: [{ id: "cargo-01", x: 8, z: 3 }],
  sceneRecipe: { objects: [{ id: "final-beacon", transform: { x: 11, z: 0 } }] }
};

const cases = Array.from({ length: 10 }, (_, index) => {
  const t = index / 9;
  const completedFacts = [];
  if (t >= 0.2) completedFacts.push("scan.scan-ruin-01");
  if (t >= 0.3) completedFacts.push("scan.scan-ruin-02");
  if (t >= 0.45) completedFacts.push("build.signal-mast.01");
  if (t >= 0.62) completedFacts.push("lock.gate.01");
  if (t >= 0.8) completedFacts.push("cargo.delivered.01");
  return {
    level,
    elapsed: index * 11,
    session: {
      phase: t < 0.75 ? "pressure" : "resolved",
      elapsed: index * 11,
      completedFacts,
      harvestedNodeIds: t >= 0.35 ? ["resource-node-01", ...(t >= 0.58 ? ["resource-node-02"] : [])] : [],
      placedStructureIds: t >= 0.45 ? ["signal-mast-01"] : [],
      gateUnlocked: t >= 0.62,
      cargoCarriedId: t >= 0.68 && t < 0.8 ? "cargo-01" : null,
      player: { sporeLoad: Math.max(0, 0.72 - t * 0.52) }
    },
    sequence: { waitingFor: t >= 0.8 ? [] : ["scan", "build", "deliver"].slice(Math.floor(t * 2)) },
    kitStates: { scanSurvey: { completedTargetIds: completedFacts.filter((fact) => fact.startsWith("scan.")).map((fact) => fact.replace("scan.", "")) } }
  };
});

const kit = createSignalIslesFieldHospitalTriageReadinessDomainKit();
assert.equal(kit.id, "signal-isles-field-hospital-triage-readiness-domain-kit");
assert.equal(kit.domain, "signal-isles-field-hospital-triage-readiness-domain");
assert.equal(kit.tree.root, "signal-isles-field-hospital-triage-readiness-domain");
assert.ok(SIGNAL_ISLES_FIELD_HOSPITAL_TRIAGE_KITS.includes("signal-isles-dawn-care-ledger-kit"));

let previousLateReadiness = 0;
for (const [index, input] of cases.entries()) {
  const result = kit.describe(input);
  assert.equal(result.domain, "signal-isles-field-hospital-triage-readiness-domain");
  assert.ok(result.readiness >= 0 && result.readiness <= 1, `readiness bounded for case ${index}`);
  assert.ok(result.casualtyPressure >= 0 && result.casualtyPressure <= 1, `pressure bounded for case ${index}`);
  assert.ok(["clinic-unmapped", "medicine-scarce", "stretcher-route-staged", "field-hospital-ready"].includes(result.missionState));
  assert.ok(result.triageFlags.length >= 3, `triage flags present for case ${index}`);
  assert.ok(result.medicineCaches.length >= 3, `medicine caches present for case ${index}`);
  assert.ok(result.stretcherTrailThreads.length >= 3, `stretcher trails present for case ${index}`);
  assert.ok(result.lanternCarePosts.length >= 2, `lantern posts present for case ${index}`);
  assert.ok(result.evacSkiffMoorings.length >= 2, `skiff moorings present for case ${index}`);
  assert.equal(result.dawnCareLedgers.length, 1);
  assert.equal(result.rendererHandoff.rendererConsumesDescriptorsOnly, true);
  assert.equal(result.rendererHandoff.counts.total, result.triageFlags.length + result.medicineCaches.length + result.stretcherTrailThreads.length + result.lanternCarePosts.length + result.evacSkiffMoorings.length + result.dawnCareLedgers.length);
  assert.ok(result.ownership.excludes.includes("renderer"));
  assert.ok(result.ownership.excludes.includes("Three.js"));
  assert.doesNotThrow(() => JSON.stringify(result));
  if (index > 5) assert.ok(result.readiness >= previousLateReadiness - 0.16, `late readiness should not collapse for case ${index}`);
  if (index > 5) previousLateReadiness = result.readiness;
}

const early = kit.describe(cases[0]);
const late = kit.describe(cases[9]);
assert.ok(late.readiness > early.readiness, "completed care route improves readiness");
assert.equal(late.missionState, "field-hospital-ready");
assert.ok(late.casualtyPressure < early.casualtyPressure, "completed care route reduces casualty pressure");

console.log("Signal Isles field hospital triage readiness kits smoke passed 10 intake cases.");
