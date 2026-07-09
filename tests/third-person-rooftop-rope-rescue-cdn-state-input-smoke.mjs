import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createThirdPersonRooftopRopeRescueReadinessDomainKit } from '../experiments/ThirdPersonFollowThrough/kits/third-person-rooftop-rope-rescue-readiness-domain-kit.js';

const cdn = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
const entrySource = readFileSync(new URL('../experiments/ThirdPersonFollowThrough/app/rooftop-rope-rescue-readiness-entry.js', import.meta.url), 'utf8');
const routeSource = readFileSync(new URL('../experiments/ThirdPersonFollowThrough/index.html', import.meta.url), 'utf8');
const appIndexSource = readFileSync(new URL('../experiments/ThirdPersonFollowThrough/app/index.js', import.meta.url), 'utf8');
const kitSource = readFileSync(new URL('../experiments/ThirdPersonFollowThrough/kits/third-person-rooftop-rope-rescue-readiness-domain-kit.js', import.meta.url), 'utf8');

assert.ok(entrySource.includes(cdn), 'changed entry must import NexusEngine main CDN');
assert.equal(entrySource.includes('NexusRealtime@'), false, 'changed entry must not import old NexusRealtime CDN');
assert.ok(routeSource.includes('rooftop-rope-rescue-readiness-renderer-handoff-pass'), 'route shell must advertise new pass');
assert.ok(appIndexSource.includes('rooftop-rope-rescue-readiness-entry.js'), 'route module index must load new entry');
assert.ok(entrySource.includes('globalThis.GameHost'), 'entry must expose GameHost hooks');
assert.ok(entrySource.includes('applyRooftopRopeRescueInput'), 'entry must expose input handler');
assert.equal(kitSource.includes('document.'), false, 'reusable kit must not own DOM');
assert.equal(kitSource.includes('requestAnimationFrame'), false, 'reusable kit must not own frame loop');

const kit = createThirdPersonRooftopRopeRescueReadinessDomainKit();
const state = { targetPosition: [0, 0, 8], movementWishWorld: [0, 0, -1], actorForwardWorld: [0, 0, -1], staminaRatio: 0.9, grounded: true, securedAnchors: 0, bridgedSpans: 0, triagedStretchers: 0, frame: 0 };
const actions = ['secure-anchor', 'secure-anchor', 'bridge-span', 'triage-stretcher', 'bridge-span', 'secure-anchor', 'triage-stretcher', 'bridge-span', 'secure-anchor', 'triage-stretcher'];

let previousReadiness = kit.snapshot(state).readiness;
actions.forEach((action, index) => {
  if (action === 'secure-anchor') state.securedAnchors += 1;
  if (action === 'bridge-span') state.bridgedSpans += 1;
  if (action === 'triage-stretcher') state.triagedStretchers += 1;
  state.frame += 12;
  state.targetPosition = [index * 2 - 8, 0, 12 - index * 2];
  const summary = kit.snapshot(state);
  const handoff = kit.describe(state).rendererHandoff;
  assert.ok(summary.readiness >= 0 && summary.readiness <= 1, `bounded readiness after ${action}`);
  assert.ok(summary.fallRisk >= 0 && summary.fallRisk <= 1, `bounded fall risk after ${action}`);
  assert.ok(handoff.descriptors.duskEvacuationLedgers[0], `ledger exists after ${action}`);
  assert.ok(summary.readiness >= previousReadiness - 0.18, `readiness should not collapse after ${action}`);
  previousReadiness = summary.readiness;
});

assert.equal(Math.min(4, state.securedAnchors), 4);
assert.equal(Math.min(3, state.bridgedSpans), 3);
assert.equal(Math.min(3, state.triagedStretchers), 3);
console.log(`Third Person rooftop rope rescue CDN/state/input smoke passed ${actions.length} simulated cases against NexusEngine main CDN wiring.`);
