import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createThirdPersonMedevacReadinessDomainKit } from '../experiments/ThirdPersonFollowThrough/kits/third-person-medevac-readiness-domain-kit.js';

const cdn = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
const oldRuntime = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js';
const entry = readFileSync('experiments/ThirdPersonFollowThrough/app/medevac-readiness-entry.js', 'utf8');
const kit = readFileSync('experiments/ThirdPersonFollowThrough/kits/third-person-medevac-readiness-domain-kit.js', 'utf8');
const appIndex = readFileSync('experiments/ThirdPersonFollowThrough/app/index.js', 'utf8');
const routeHtml = readFileSync('experiments/ThirdPersonFollowThrough/index.html', 'utf8');

assert.ok(entry.includes(cdn), 'medevac entry imports NexusEngine main CDN');
assert.ok(!entry.includes(oldRuntime), 'medevac entry avoids old NexusRealtime runtime CDN');
assert.ok(!kit.includes(oldRuntime), 'medevac kit avoids old NexusRealtime runtime CDN');
assert.ok(appIndex.includes("./medevac-readiness-entry.js?v=medevac-readiness-v1"), 'app index imports medevac readiness entry');
assert.ok(routeHtml.includes('Medevac: ON'), 'route HUD advertises medevac readiness');
assert.ok(routeHtml.includes('medevac-readiness-renderer-handoff-pass'), 'route marks medevac pass');
assert.ok(entry.includes('getMedevacReadiness'), 'entry exposes medevac GameHost accessor');
assert.ok(entry.includes('getThirdPersonMedevacReadiness'), 'entry exposes third person medevac alias');
assert.ok(entry.includes('getMedevacReadinessTree'), 'entry exposes medevac tree accessor');
assert.ok(entry.includes('getRendererHandoff'), 'entry composes renderer handoff');

const cases = [
  { targetPosition: [0, 0, 8], movementWishWorld: [0, 0, 0], grounded: true, colliderCount: 6, staminaRatio: 1, frame: 0 },
  { targetPosition: [-12, 0, -12], movementWishWorld: [0.2, 0, 0.1], grounded: true, colliderCount: 6, staminaRatio: 0.92, frame: 8 },
  { targetPosition: [4, 0, 2], movementWishWorld: [0.8, 0, 0.2], grounded: true, colliderCount: 4, staminaRatio: 0.7, frame: 16 },
  { targetPosition: [15, 0, -8], movementWishWorld: [1, 0, 0.1], grounded: false, yVel: -7, colliderCount: 5, staminaRatio: 0.54, frame: 32 },
  { targetPosition: [-4, 0, 16], movementWishWorld: [0.1, 0, 1], grounded: true, colliderCount: 7, staminaRatio: 0.82, frame: 48 },
  { targetPosition: [-18, 0, -16], movementWishWorld: [0.3, 0, 0.3], grounded: true, colliderCount: 8, staminaRatio: 0.9, frame: 64 },
  { targetPosition: [0, 0, -20], movementWishWorld: [0, 0, -0.6], grounded: true, colliderCount: 6, staminaRatio: 0.74, frame: 80 },
  { targetPosition: [18, 0, -14], movementWishWorld: [0.6, 0, -0.6], grounded: true, colliderCount: 3, staminaRatio: 0.44, frame: 96 },
  { targetPosition: [30, 0, 30], movementWishWorld: [1, 0, 1], grounded: false, yVel: 9, colliderCount: 2, staminaRatio: 0.2, frame: 112 },
  { actor: { position: [-8, 0, 6] }, camera: { position: [-8, 4, 13] }, movementWishWorld: [0.4, 0, -0.3], grounded: true, colliderCount: 6, stamina: 0.65, frame: 128 }
];

const domain = createThirdPersonMedevacReadinessDomainKit();
for (const [index, snapshot] of cases.entries()) {
  const state = domain.snapshot(snapshot);
  assert.equal(state.rendererHandoff.policy, 'renderer-consumes-descriptors-only', `case ${index} descriptor policy`);
  assert.equal(state.rendererHandoff.descriptorCount, 18, `case ${index} descriptor count`);
  assert.equal(state.counts.casualtyBeacons, 4, `case ${index} casualty count`);
  assert.ok(Number.isFinite(state.summary.evacuationReadiness), `case ${index} finite evacuation readiness`);
}

console.log('third-person medevac CDN/state-input smoke passed', cases.length, 'cases');
