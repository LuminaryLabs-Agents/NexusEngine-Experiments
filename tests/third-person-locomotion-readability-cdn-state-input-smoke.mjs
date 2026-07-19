import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createThirdPersonLocomotionReadabilityDomainKit } from '../experiments/ThirdPersonFollowThrough/kits/third-person-locomotion-readability-domain-kit.js';

const indexHtml = fs.readFileSync(new URL('../experiments/ThirdPersonFollowThrough/index.html', import.meta.url), 'utf8');
const entry = fs.readFileSync(new URL('../experiments/ThirdPersonFollowThrough/app/arena-fractal-entry.js', import.meta.url), 'utf8');
const routeIndex = fs.readFileSync(new URL('../experiments/ThirdPersonFollowThrough/app/index.js', import.meta.url), 'utf8');
const domain = fs.readFileSync(new URL('../experiments/ThirdPersonFollowThrough/domain/third-person-follow-through-domain.js', import.meta.url), 'utf8');
const kitSource = fs.readFileSync(new URL('../experiments/ThirdPersonFollowThrough/kits/third-person-locomotion-readability-domain-kit.js', import.meta.url), 'utf8');

const cdn = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
assert.ok(indexHtml.includes('rooftop-rope-rescue-readiness-v1'), 'route shell should cache-bust through the latest composed readiness entry');
assert.ok(indexHtml.includes('Locomotion Readability: ON'), 'route shell should expose locomotion readability status');
assert.ok(routeIndex.includes('rooftop-rope-rescue-readiness-v1'), 'route index should import the current cache-busted wrappers');
assert.ok(entry.includes(cdn), 'changed wrapper should import NexusEngine main CDN');
assert.equal(entry.includes('LuminaryLabs-Dev/NexusRealtime'), false, 'changed wrapper should not import old NexusRealtime runtime');
assert.ok(entry.includes('third-person-locomotion-readability-domain-kit'), 'entry should import locomotion readability domain kit');
assert.ok(entry.includes('getLocomotionReadability'), 'entry should expose locomotion readability handoff');
assert.ok(entry.includes('getRendererHandoff'), 'entry should expose composed renderer handoff');
assert.ok(entry.includes('landingSafetyPatches'), 'entry renderer should consume landing safety descriptors');
assert.ok(entry.includes('cameraRecenterLeashes'), 'entry renderer should consume recenter leash descriptors');
assert.ok(domain.includes('third-person-locomotion-readability-domain-kit'), 'domain file should record the locomotion kit');
assert.equal(kitSource.includes('LuminaryLabs-Dev/NexusRealtime'), false, 'locomotion kit should not import old runtime');

const kit = createThirdPersonLocomotionReadabilityDomainKit();
const stateInputCases = [
  { keys: [], targetPosition: [0, 0, 8], movementWishWorld: [0, 0, 0], orbitYawOffsetDeg: 0, grounded: true },
  { keys: ['w'], targetPosition: [0, 0, 7], movementWishWorld: [0, 0, -1], orbitYawOffsetDeg: 0, grounded: true },
  { keys: ['a'], targetPosition: [-1, 0, 7], movementWishWorld: [-1, 0, 0], orbitYawOffsetDeg: -12, grounded: true },
  { keys: ['d'], targetPosition: [1, 0, 7], movementWishWorld: [1, 0, 0], orbitYawOffsetDeg: 12, grounded: true },
  { keys: ['s'], targetPosition: [0, 0, 9], movementWishWorld: [0, 0, 1], orbitYawOffsetDeg: 0, grounded: true },
  { keys: ['space'], targetPosition: [0, 1.2, 8], movementWishWorld: [0, 0, -0.2], orbitYawOffsetDeg: 0, grounded: false, yVel: 5 },
  { keys: ['arrowleft'], targetPosition: [0, 0, 8], movementWishWorld: [0, 0, 0], orbitYawOffsetDeg: -70, handoffAlpha: 0.74, grounded: true },
  { keys: ['arrowright'], targetPosition: [0, 0, 8], movementWishWorld: [0, 0, 0], orbitYawOffsetDeg: 70, handoffAlpha: 0.74, grounded: true },
  { keys: ['w', 'd'], targetPosition: [4, 0, 3], movementWishWorld: [0.7, 0, -0.7], orbitYawOffsetDeg: 28, grounded: true },
  { keys: ['v'], targetPosition: [13, 0.3, 9], movementWishWorld: [0, 0, -1], orbitYawOffsetDeg: 0, grounded: false, yVel: -3 }
];

for (const state of stateInputCases) {
  const snapshot = {
    ...state,
    headWorld: [state.targetPosition[0], state.targetPosition[1] + 1.6, state.targetPosition[2]],
    cameraPosition: [state.targetPosition[0], 3.2, state.targetPosition[2] + 7],
    movementBasisForwardWorld: [0, 0, -1],
    actorForwardWorld: [0, 0, -1],
    rigBoneNames: ['root', 'pelvis', 'chest', 'head'],
    rigJointCount: 14,
    debugRayCount: 3,
    colliderCount: 6
  };
  const description = kit.describe(snapshot);
  assert.equal(description.counts.rootYawFans, 5, state.keys.join('+'));
  assert.equal(description.counts.landingSafetyPatches, 6, state.keys.join('+'));
  assert.equal(description.counts.inputCadenceBeats, 6, state.keys.join('+'));
  assert.ok(description.rendererHandoff.rendererConsumes.includes('cameraRecenterLeashes'), state.keys.join('+'));
  assert.ok(description.ownership.rendererMustNotOwn.includes('controller math'), state.keys.join('+'));
}

console.log('third-person-locomotion-readability-cdn-state-input-smoke: CDN plus 10 state/input cases passed');
