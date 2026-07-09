import assert from 'node:assert/strict';
import {
  ONNX_WORKSHOP_INCIDENT_ROUTER_DOMAIN,
  ONNX_WORKSHOP_INCIDENT_ROUTER_KITS,
  createOnnxWorkshopIncidentRouterReadiness,
  createOnnxWorkshopIncidentRouterDomainKit
} from '../experiments/_kits/onnx-agent-lab/onnx-workshop-incident-router-kits.js';

const cases = [
  { name: 'cold surge', alertCount: 8, unresolved: 7, traceQuality: 0.12, classifierConfidence: 0.18, fallbackCoverage: 0.2, operatorLoad: 0.88, seed: 1 },
  { name: 'trace heavy', alertCount: 5, unresolved: 3, traceQuality: 0.82, classifierConfidence: 0.45, fallbackCoverage: 0.48, operatorLoad: 0.6, seed: 2 },
  { name: 'model loaded', alertCount: 6, unresolved: 3, traceQuality: 0.66, classifierConfidence: 0.76, fallbackCoverage: 0.54, operatorLoad: 0.42, modelLoaded: true, seed: 3 },
  { name: 'fallback rich', alertCount: 9, unresolved: 5, traceQuality: 0.52, classifierConfidence: 0.38, fallbackCoverage: 0.9, operatorLoad: 0.58, seed: 4 },
  { name: 'operator calm', alertCount: 4, unresolved: 1, ackedIncidents: 3, traceQuality: 0.7, classifierConfidence: 0.68, fallbackCoverage: 0.72, operatorLoad: 0.18, seed: 5 },
  { name: 'scene open', alertCount: 7, unresolved: 2, ackedIncidents: 4, traceQuality: 0.76, classifierConfidence: 0.72, fallbackCoverage: 0.74, operatorLoad: 0.32, sceneOpen: true, seed: 6 },
  { name: 'audit ready', alertCount: 10, unresolved: 0, ackedIncidents: 8, escalatedIncidents: 2, traceQuality: 0.91, classifierConfidence: 0.88, fallbackCoverage: 0.86, operatorLoad: 0.2, modelLoaded: true, sceneOpen: true, seed: 7 },
  { name: 'missing numbers', seed: 8 },
  { name: 'overflow clamped', alertCount: 999, unresolved: 999, traceQuality: 7, classifierConfidence: -2, fallbackCoverage: 1.5, operatorLoad: 2, seed: 9 },
  { name: 'manual escalation', alertCount: 12, unresolved: 6, ackedIncidents: 2, escalatedIncidents: 3, traceQuality: 0.42, classifierConfidence: 0.28, fallbackCoverage: 0.65, operatorLoad: 0.79, selectedAction: 'escalate', seed: 10 }
];

const states = new Set(['postmortem-ready', 'triage-surge', 'routing-stable', 'collect-evidence']);
const domainKit = createOnnxWorkshopIncidentRouterDomainKit({ seed: 77 });
assert.equal(domainKit.id, ONNX_WORKSHOP_INCIDENT_ROUTER_DOMAIN.id);
assert.ok(ONNX_WORKSHOP_INCIDENT_ROUTER_DOMAIN.tree.includes('fallback-playbook-domain'));
assert.ok(ONNX_WORKSHOP_INCIDENT_ROUTER_KITS.includes('onnx-incident-router-renderer-handoff-kit'));

for (const intake of cases) {
  const readiness = createOnnxWorkshopIncidentRouterReadiness(intake);
  assert.equal(readiness.domainId, ONNX_WORKSHOP_INCIDENT_ROUTER_DOMAIN.id, intake.name);
  assert.ok(readiness.domainTree.includes('renderer consumes descriptors only'), intake.name);
  assert.ok(readiness.kits.length >= 7, intake.name);
  assert.ok(readiness.ownershipExclusions.includes('DOM'), intake.name);
  assert.ok(readiness.ownershipExclusions.includes('frame-loop ownership'), intake.name);
  assert.ok(readiness.summary.readinessScore >= 0 && readiness.summary.readinessScore <= 1, intake.name);
  assert.ok(readiness.summary.pressure >= 0 && readiness.summary.pressure <= 1, intake.name);
  assert.ok(states.has(readiness.summary.missionState), intake.name);
  assert.equal(readiness.rendererHandoff.descriptorOnly, true, intake.name);
  assert.equal(readiness.rendererHandoff.passId, 'onnx-workshop-incident-router-renderer-handoff-pass', intake.name);
  assert.ok(readiness.rendererHandoff.counts.alertBeacons >= 3, intake.name);
  assert.ok(readiness.rendererHandoff.counts.traceSamplers >= 3, intake.name);
  assert.equal(readiness.rendererHandoff.counts.classifierLanes, 6, intake.name);
  assert.ok(readiness.rendererHandoff.counts.fallbackBriefs >= 3, intake.name);
  assert.ok(readiness.rendererHandoff.counts.operatorShifts >= 3, intake.name);
  assert.equal(readiness.rendererHandoff.counts.auditLedgers, 1, intake.name);
  assert.equal(readiness.rendererHandoff.counts.total, readiness.rendererHandoff.flatDescriptors.length, intake.name);
  assert.doesNotThrow(() => JSON.stringify(readiness), intake.name);
  const viaDomain = domainKit.describe(intake);
  assert.equal(viaDomain.rendererHandoff.counts.total, readiness.rendererHandoff.counts.total, intake.name);
}

const cold = createOnnxWorkshopIncidentRouterReadiness(cases[0]);
const mature = createOnnxWorkshopIncidentRouterReadiness(cases[6]);
assert.ok(mature.summary.readinessScore > cold.summary.readinessScore, 'mature route should be more ready than cold surge');

console.log('ONNX workshop incident router readiness kits smoke passed 10 intake cases.');
