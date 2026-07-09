import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createOnnxWorkshopIncidentRouterReadiness } from '../experiments/_kits/onnx-agent-lab/onnx-workshop-incident-router-kits.js';

const route = readFileSync('experiments/onnx-agent-lab/incident-router.html', 'utf8');
const entry = readFileSync('experiments/onnx-agent-lab/incident-router-entry.js', 'utf8');
const kit = readFileSync('experiments/_kits/onnx-agent-lab/onnx-workshop-incident-router-kits.js', 'utf8');
const cdn = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';

assert.ok(route.includes('onnx-workshop-incident-router-renderer-handoff-pass'));
assert.ok(route.includes('incident-router-entry.js?v=onnx-workshop-incident-router-20260709'));
assert.ok(entry.includes(cdn));
assert.ok(entry.includes('globalThis.GameHost'));
assert.ok(entry.includes('applyIncidentRouterInput'));
assert.ok(entry.includes('getRendererHandoff'));
assert.ok(!entry.includes('NexusRealtime@'));
assert.ok(!kit.includes('document.querySelector'));
assert.ok(!kit.includes('addEventListener('));
assert.ok(!kit.includes('requestAnimationFrame'));
assert.ok(kit.includes('renderer consumes descriptors only'));
assert.ok(kit.includes('frame-loop ownership'));

let state = { alertCount: 7, unresolved: 5, ackedIncidents: 1, escalatedIncidents: 0, traceQuality: 0.36, classifierConfidence: 0.31, fallbackCoverage: 0.46, operatorLoad: 0.68, seed: 83 };
const actions = ['sample-traces', 'ack-alert', 'route-fallback', 'load-model', 'sample-traces', 'escalate', 'ack-alert', 'route-fallback', 'open-scene', 'ack-alert'];
let previousReadiness = createOnnxWorkshopIncidentRouterReadiness(state);
const firstScore = previousReadiness.summary.readinessScore;
for (const action of actions) {
  if (action === 'sample-traces') {
    state = { ...state, traceQuality: Math.min(1, state.traceQuality + 0.13), classifierConfidence: Math.min(1, state.classifierConfidence + 0.055), selectedAction: action };
  } else if (action === 'ack-alert') {
    state = { ...state, ackedIncidents: Math.min(state.alertCount, state.ackedIncidents + 1), unresolved: Math.max(0, state.unresolved - 1), operatorLoad: Math.max(0, state.operatorLoad - 0.06), selectedAction: action };
  } else if (action === 'route-fallback') {
    state = { ...state, fallbackCoverage: Math.min(1, state.fallbackCoverage + 0.12), operatorLoad: Math.max(0, state.operatorLoad - 0.035), selectedAction: action };
  } else if (action === 'load-model') {
    state = { ...state, modelLoaded: true, classifierConfidence: Math.min(1, state.classifierConfidence + 0.18), traceQuality: Math.min(1, state.traceQuality + 0.06), selectedAction: action };
  } else if (action === 'escalate') {
    state = { ...state, escalatedIncidents: Math.min(state.alertCount, state.escalatedIncidents + 1), unresolved: Math.max(0, state.unresolved - 1), operatorLoad: Math.min(1, state.operatorLoad + 0.025), selectedAction: action };
  } else if (action === 'open-scene') {
    state = { ...state, sceneOpen: true, fallbackCoverage: Math.min(1, state.fallbackCoverage + 0.07), operatorLoad: Math.max(0, state.operatorLoad - 0.04), selectedAction: action };
  }
  const readiness = createOnnxWorkshopIncidentRouterReadiness(state);
  assert.ok(readiness.summary.readinessScore >= 0 && readiness.summary.readinessScore <= 1, action);
  assert.ok(readiness.summary.pressure >= 0 && readiness.summary.pressure <= 1, action);
  assert.ok(readiness.rendererHandoff.counts.total >= 19, action);
  assert.equal(readiness.rendererHandoff.descriptorOnly, true, action);
  assert.doesNotThrow(() => JSON.stringify(readiness), action);
  previousReadiness = readiness;
}
assert.ok(previousReadiness.summary.readinessScore > firstScore, 'simulated incident inputs should improve readiness');
assert.ok(['postmortem-ready', 'routing-stable', 'collect-evidence', 'triage-surge'].includes(previousReadiness.summary.missionState));

console.log('ONNX workshop incident router CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.');
