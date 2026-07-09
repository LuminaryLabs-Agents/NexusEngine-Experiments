import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSignalIslesFieldHospitalTriageReadinessDomainKit } from "../experiments/_kits/nexus-frontier-signal-isles/signal-isles-field-hospital-triage-readiness-domain-kits.js";

const REQUIRED_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const entry = readFileSync(new URL("../experiments/nexus-frontier-signal-isles/src/field-hospital-triage-readiness-entry.js", import.meta.url), "utf8");
const route = readFileSync(new URL("../experiments/nexus-frontier-signal-isles/index.html", import.meta.url), "utf8");
const kitSource = readFileSync(new URL("../experiments/_kits/nexus-frontier-signal-isles/signal-isles-field-hospital-triage-readiness-domain-kits.js", import.meta.url), "utf8");

assert.ok(entry.includes(REQUIRED_CDN), "changed entry imports NexusEngine main CDN");
assert.ok(!entry.includes("NexusRealtime@"), "changed entry does not import old NexusRealtime CDN runtime");
assert.ok(route.includes("field-hospital-triage-readiness-renderer-handoff-pass"), "route advertises field hospital triage pass");
assert.ok(route.includes("field-hospital-triage-readiness-entry.js"), "route loads field hospital triage entry");
assert.ok(entry.includes("getFieldHospitalTriageReadiness"), "GameHost readiness accessor is exposed");
assert.ok(entry.includes("getRendererHandoff"), "GameHost renderer handoff is composed");
for (const forbidden of ["document.querySelector", "requestAnimationFrame", "THREE.", "AudioContext", "localStorage", "addEventListener"]) {
  assert.ok(!kitSource.includes(forbidden), `reusable kit source does not own ${forbidden}`);
}

const kit = createSignalIslesFieldHospitalTriageReadinessDomainKit();
const level = {
  scanSites: [{ id: "scan-ruin-01", x: -7, z: -3 }, { id: "scan-ruin-02", x: 1.5, z: 5 }, { id: "scan-ruin-03", x: 7, z: -2.2 }],
  buildSites: [{ id: "build-site-01", structureId: "signal-mast-01", x: 0, z: 1 }],
  gates: [{ id: "gate-01", x: 5, z: 1 }],
  resourceNodes: [{ id: "resource-node-01", x: -3, z: 4 }, { id: "resource-node-02", x: 3, z: -4 }],
  cargo: [{ id: "cargo-01", x: 8, z: 3 }],
  sceneRecipe: { objects: [{ id: "final-beacon", transform: { x: 11, z: 0 } }] }
};

const actions = ["scan", "scan", "harvest", "build", "harvest", "unlock", "carry", "deliver", "stabilize", "handoff"];
const state = { level, session: { phase: "pressure", completedFacts: [], harvestedNodeIds: [], placedStructureIds: [], gateUnlocked: false, player: { sporeLoad: 0.7 } }, sequence: { waitingFor: ["scan", "build", "deliver"] }, kitStates: { scanSurvey: { completedTargetIds: [] } } };
const readinessValues = [];

for (const [index, action] of actions.entries()) {
  state.session.elapsed = index * 13;
  if (action === "scan") {
    const scanId = index === 0 ? "scan-ruin-01" : "scan-ruin-02";
    if (!state.session.completedFacts.includes(`scan.${scanId}`)) state.session.completedFacts.push(`scan.${scanId}`);
    state.kitStates.scanSurvey.completedTargetIds.push(scanId);
  }
  if (action === "harvest") state.session.harvestedNodeIds.push(index < 4 ? "resource-node-01" : "resource-node-02");
  if (action === "build") {
    state.session.placedStructureIds.push("signal-mast-01");
    state.session.completedFacts.push("build.signal-mast.01");
  }
  if (action === "unlock") {
    state.session.gateUnlocked = true;
    state.session.completedFacts.push("lock.gate.01");
  }
  if (action === "carry") state.session.cargoCarriedId = "cargo-01";
  if (action === "deliver") {
    state.session.completedFacts.push("cargo.delivered.01");
    state.session.cargoCarriedId = null;
  }
  if (action === "stabilize") state.session.player.sporeLoad = 0.18;
  if (action === "handoff") {
    state.session.phase = "resolved";
    state.sequence.waitingFor = [];
  }
  const result = kit.describe(state);
  assert.ok(result.rendererHandoff.counts.total >= 14, `renderer handoff remains populated at step ${index}`);
  assert.doesNotThrow(() => JSON.stringify(result));
  readinessValues.push(result.readiness);
}

assert.ok(readinessValues.at(-1) > readinessValues[0], "simulated input sequence improves field hospital readiness");
assert.equal(kit.describe(state).missionState, "field-hospital-ready");

console.log("Signal Isles field hospital triage CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
