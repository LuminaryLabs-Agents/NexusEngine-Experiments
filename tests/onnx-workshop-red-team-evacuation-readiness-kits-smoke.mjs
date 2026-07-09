import assert from "node:assert/strict";
import {
  ONNX_WORKSHOP_RED_TEAM_EVACUATION_DOMAIN,
  createOnnxWorkshopRedTeamEvacuationDomainKit,
  createOnnxWorkshopRedTeamEvacuationReadiness
} from "../experiments/_kits/onnx-agent-lab/onnx-workshop-red-team-evacuation-kits.js";

const domain = createOnnxWorkshopRedTeamEvacuationDomainKit({ seed: 119 });
const cases = [
  { name: "cold containment", input: { canaryCount: 8, passedCanaries: 0, sandboxIntegrity: 0.12, evidenceCoverage: 0.08, rollbackCoverage: 0.1, operatorFatigue: 0.88, blockedPrompts: 9 } },
  { name: "canary progress", input: { canaryCount: 8, passedCanaries: 4, sandboxIntegrity: 0.42, evidenceCoverage: 0.35, rollbackCoverage: 0.31, operatorFatigue: 0.61, blockedPrompts: 4 } },
  { name: "sandbox locked", input: { canaryCount: 6, passedCanaries: 3, sandboxIntegrity: 0.88, evidenceCoverage: 0.42, rollbackCoverage: 0.4, operatorFatigue: 0.5, drillArmed: true } },
  { name: "evidence rich", input: { canaryCount: 7, passedCanaries: 5, sandboxIntegrity: 0.64, evidenceCoverage: 0.9, rollbackCoverage: 0.5, operatorFatigue: 0.42, modelLoaded: true } },
  { name: "rollback rehearsed", input: { canaryCount: 9, passedCanaries: 7, sandboxIntegrity: 0.72, evidenceCoverage: 0.68, rollbackCoverage: 0.91, operatorFatigue: 0.37, routedIncidents: 5, drillArmed: true } },
  { name: "operator fatigue", input: { canaryCount: 6, passedCanaries: 3, sandboxIntegrity: 0.55, evidenceCoverage: 0.57, rollbackCoverage: 0.48, operatorFatigue: 0.93, blockedPrompts: 7 } },
  { name: "loaded model", input: { canaryCount: 5, passedCanaries: 4, sandboxIntegrity: 0.7, evidenceCoverage: 0.7, rollbackCoverage: 0.68, operatorFatigue: 0.32, modelLoaded: true } },
  { name: "armed drill", input: { canaryCount: 8, passedCanaries: 6, sandboxIntegrity: 0.77, evidenceCoverage: 0.73, rollbackCoverage: 0.75, operatorFatigue: 0.26, drillArmed: true } },
  { name: "overflow clamped", input: { canaryCount: 999, passedCanaries: 999, sandboxIntegrity: 5, evidenceCoverage: 3, rollbackCoverage: 2, operatorFatigue: -2, blockedPrompts: 999, routedIncidents: 999 } },
  { name: "ready postmortem", input: { canaryCount: 10, passedCanaries: 10, sandboxIntegrity: 0.96, evidenceCoverage: 0.94, rollbackCoverage: 0.95, operatorFatigue: 0.08, modelLoaded: true, drillArmed: true, routedIncidents: 8 } }
];

for (const item of cases) {
  const readiness = domain.compose(item.input);
  assert.equal(readiness.domainId, ONNX_WORKSHOP_RED_TEAM_EVACUATION_DOMAIN.id, item.name);
  assert.equal(readiness.rendererHandoff.passId, "onnx-workshop-red-team-evacuation-renderer-handoff-pass", item.name);
  assert.equal(readiness.rendererHandoff.descriptorOnly, true, item.name);
  assert.ok(readiness.rendererHandoff.counts.canaryPromptStrips >= 4, item.name);
  assert.equal(readiness.rendererHandoff.counts.sandboxGateLocks, 5, item.name);
  assert.ok(readiness.rendererHandoff.counts.evidenceChainTags >= 3, item.name);
  assert.equal(readiness.rendererHandoff.counts.rollbackBranchRoutes, 6, item.name);
  assert.ok(readiness.rendererHandoff.counts.operatorEvacuationCards >= 3, item.name);
  assert.equal(readiness.rendererHandoff.counts.drillLedgers, 1, item.name);
  assert.equal(readiness.rendererHandoff.flatDescriptors.length, readiness.rendererHandoff.counts.total, item.name);
  assert.ok(readiness.summary.readinessScore >= 0 && readiness.summary.readinessScore <= 1, item.name);
  assert.ok(readiness.summary.pressure >= 0 && readiness.summary.pressure <= 1, item.name);
  assert.ok(["postmortem-ready", "containment-surge", "drill-stable", "collect-red-team-evidence"].includes(readiness.summary.missionState), item.name);
  assert.ok(readiness.ownershipExclusions.includes("renderer"), item.name);
  assert.ok(readiness.ownershipExclusions.includes("DOM"), item.name);
  assert.doesNotThrow(() => JSON.stringify(readiness.rendererHandoff), item.name);
}

const cold = createOnnxWorkshopRedTeamEvacuationReadiness(cases[0].input).summary.readinessScore;
const ready = createOnnxWorkshopRedTeamEvacuationReadiness(cases[9].input).summary.readinessScore;
assert.ok(ready > cold, "ready drill should score above cold containment");
console.log("ONNX workshop red-team evacuation readiness kits smoke passed 10 intake cases.");
