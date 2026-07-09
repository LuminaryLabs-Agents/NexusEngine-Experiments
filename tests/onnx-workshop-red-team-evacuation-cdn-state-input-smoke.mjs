import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createOnnxWorkshopRedTeamEvacuationDomainKit } from "../experiments/_kits/onnx-agent-lab/onnx-workshop-red-team-evacuation-kits.js";

const route = readFileSync(new URL("../experiments/onnx-agent-lab/red-team-evacuation.html", import.meta.url), "utf8");
const entry = readFileSync(new URL("../experiments/onnx-agent-lab/red-team-evacuation-entry.js", import.meta.url), "utf8");
const kitSource = readFileSync(new URL("../experiments/_kits/onnx-agent-lab/onnx-workshop-red-team-evacuation-kits.js", import.meta.url), "utf8");
const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

assert.ok(route.includes("onnx-workshop-red-team-evacuation-renderer-handoff-pass"));
assert.ok(route.includes("red-team-evacuation-entry.js?v=onnx-workshop-red-team-evacuation-20260709"));
assert.ok(entry.includes(cdn));
assert.ok(!entry.includes("NexusRealtime@"));
assert.ok(entry.includes("globalThis.GameHost"));
assert.ok(entry.includes("applyRedTeamEvacuationInput"));
assert.ok(entry.includes("getRendererHandoff"));
for (const forbidden of ["document.querySelector", "requestAnimationFrame", "new Audio", "localStorage", "new WebGL", "THREE."]) {
  assert.ok(!kitSource.includes(forbidden), `kit source must not own ${forbidden}`);
}

const domain = createOnnxWorkshopRedTeamEvacuationDomainKit({ seed: 119 });
const state = {
  canaryCount: 8,
  passedCanaries: 2,
  blockedPrompts: 6,
  routedIncidents: 1,
  sandboxIntegrity: 0.43,
  evidenceCoverage: 0.34,
  rollbackCoverage: 0.36,
  operatorFatigue: 0.66,
  modelLoaded: false,
  drillArmed: false,
  selectedAction: "observe",
  seed: 119
};
const actions = ["run-canary", "lock-sandbox", "tag-evidence", "rehearse-rollback", "rotate-operator", "load-model", "run-canary", "lock-sandbox", "rehearse-rollback", "close-drill"];
const scores = [];
for (const action of actions) {
  state.selectedAction = action;
  if (action === "run-canary") {
    state.passedCanaries = Math.min(state.canaryCount, state.passedCanaries + 1);
    state.blockedPrompts = Math.max(0, state.blockedPrompts - 1);
    state.evidenceCoverage = Math.min(1, state.evidenceCoverage + 0.055);
  } else if (action === "lock-sandbox") {
    state.sandboxIntegrity = Math.min(1, state.sandboxIntegrity + 0.13);
    state.operatorFatigue = Math.max(0, state.operatorFatigue - 0.035);
  } else if (action === "tag-evidence") {
    state.evidenceCoverage = Math.min(1, state.evidenceCoverage + 0.14);
    state.rollbackCoverage = Math.min(1, state.rollbackCoverage + 0.045);
  } else if (action === "rehearse-rollback") {
    state.rollbackCoverage = Math.min(1, state.rollbackCoverage + 0.14);
    state.routedIncidents = Math.min(state.canaryCount, state.routedIncidents + 1);
  } else if (action === "rotate-operator") {
    state.operatorFatigue = Math.max(0, state.operatorFatigue - 0.11);
    state.drillArmed = true;
  } else if (action === "load-model") {
    state.modelLoaded = true;
    state.sandboxIntegrity = Math.min(1, state.sandboxIntegrity + 0.06);
    state.evidenceCoverage = Math.min(1, state.evidenceCoverage + 0.06);
  } else if (action === "close-drill") {
    state.drillArmed = true;
    state.rollbackCoverage = Math.min(1, state.rollbackCoverage + 0.08);
    state.operatorFatigue = Math.max(0, state.operatorFatigue - 0.04);
  }
  const readiness = domain.compose(state);
  assert.equal(readiness.rendererHandoff.descriptorOnly, true);
  assert.ok(readiness.rendererHandoff.counts.total >= 23);
  assert.ok(readiness.summary.readinessScore >= 0 && readiness.summary.readinessScore <= 1);
  assert.ok(readiness.summary.pressure >= 0 && readiness.summary.pressure <= 1);
  scores.push(readiness.summary.readinessScore);
}

assert.ok(scores.at(-1) > scores[0], "state/input drill should improve readiness over 10 steps");
console.log("ONNX workshop red-team evacuation CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
