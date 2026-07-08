import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createThirdPersonCameraCompositionReadabilityDomainKit } from '../experiments/ThirdPersonFollowThrough/kits/third-person-camera-composition-readability-domain-kit.js';

const indexHtml = fs.readFileSync(new URL('../experiments/ThirdPersonFollowThrough/index.html', import.meta.url), 'utf8');
const entry = fs.readFileSync(new URL('../experiments/ThirdPersonFollowThrough/app/arena-fractal-entry.js', import.meta.url), 'utf8');
const routeIndex = fs.readFileSync(new URL('../experiments/ThirdPersonFollowThrough/app/index.js', import.meta.url), 'utf8');
const domain = fs.readFileSync(new URL('../experiments/ThirdPersonFollowThrough/domain/third-person-follow-through-domain.js', import.meta.url), 'utf8');
const kitSource = fs.readFileSync(new URL('../experiments/ThirdPersonFollowThrough/kits/third-person-camera-composition-readability-domain-kit.js', import.meta.url), 'utf8');

const cdn = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
assert.ok(indexHtml.includes('camera-composition-readability-v1'), 'route shell should cache-bust camera composition readability entry');
assert.ok(indexHtml.includes('Camera Composition: ON'), 'route shell should expose camera composition readability status');
assert.ok(routeIndex.includes('camera-composition-readability-v1'), 'route index should import cache-busted wrapper');
assert.ok(entry.includes(cdn), 'changed wrapper should import NexusEngine main CDN');
assert.equal(entry.includes('LuminaryLabs-Dev/NexusRealtime'), false, 'changed wrapper should not import old NexusRealtime runtime');
assert.ok(entry.includes('third-person-camera-composition-readability-domain-kit'), 'entry should import camera composition readability domain kit');
assert.ok(entry.includes('getCameraCompositionReadability'), 'entry should expose camera composition readability handoff');
assert.ok(entry.includes('getRendererHandoff'), 'entry should expose composed renderer handoff');
assert.ok(entry.includes('focusTargetRibbons'), 'entry renderer should consume focus target descriptors');
assert.ok(entry.includes('shoulderClearanceWedges'), 'entry renderer should consume shoulder clearance descriptors');
assert.ok(entry.includes('occlusionRiskVeils'), 'entry renderer should consume occlusion risk descriptors');
assert.ok(entry.includes('cameraComfortMeters'), 'entry renderer should consume camera comfort descriptors');
assert.ok(domain.includes('third-person-camera-composition-readability-domain-kit'), 'domain file should record the new kit');
assert.equal(kitSource.includes('LuminaryLabs-Dev/NexusRealtime'), false, 'new kit should not import old runtime');
assert.equal(kitSource.includes('document.'), false, 'new kit should not touch DOM');

const kit = createThirdPersonCameraCompositionReadabilityDomainKit();
const stateInputCases = [
  { keys: [], targetPosition: [0, 0, 8], movementWishWorld: [0, 0, 0], orbitYawOffsetDeg: 0, handoffAlpha: 0, cameraPitch: 0.28 },
  { keys: ['w'], targetPosition: [0, 0, 7], movementWishWorld: [0, 0, -1], orbitYawOffsetDeg: 0, handoffAlpha: 0.06, cameraPitch: 0.28 },
  { keys: ['a'], targetPosition: [-1, 0, 7], movementWishWorld: [-1, 0, 0], orbitYawOffsetDeg: -32, handoffAlpha: 0.24, cameraPitch: 0.32 },
  { keys: ['d'], targetPosition: [1, 0, 7], movementWishWorld: [1, 0, 0], orbitYawOffsetDeg: 34, handoffAlpha: 0.26, cameraPitch: 0.32 },
  { keys: ['s'], targetPosition: [0, 0, 9], movementWishWorld: [0, 0, 1], orbitYawOffsetDeg: 0, handoffAlpha: 0.12, cameraPitch: 0.22 },
  { keys: ['space'], targetPosition: [0, 1.2, 8], movementWishWorld: [0, 0, -0.2], orbitYawOffsetDeg: 0, handoffAlpha: 0.1, grounded: false, yVel: 5, cameraPitch: 0.58 },
  { keys: ['arrowleft'], targetPosition: [-8, 0, -8], movementWishWorld: [-0.4, 0, -0.6], orbitYawOffsetDeg: -70, handoffAlpha: 0.74, cameraPitch: 0.34 },
  { keys: ['arrowright'], targetPosition: [13, 0, 4], movementWishWorld: [0.4, 0, -0.6], orbitYawOffsetDeg: 70, handoffAlpha: 0.74, cameraPitch: 0.34 },
  { keys: ['w', 'd'], targetPosition: [4, 0, 3], movementWishWorld: [0.7, 0, -0.7], orbitYawOffsetDeg: 28, handoffAlpha: 0.3, cameraPitch: 0.4 },
  { keys: ['v'], targetPosition: [13, 0.3, 9], movementWishWorld: [0, 0, -1], orbitYawOffsetDeg: 0, handoffAlpha: 0.2, grounded: false, yVel: -3, cameraPitch: 0.1 }
];

for (const state of stateInputCases) {
  const snapshot = {
    ...state,
    headWorld: [state.targetPosition[0], state.targetPosition[1] + 1.6, state.targetPosition[2]],
    cameraPivotWorld: [state.targetPosition[0], state.targetPosition[1] + 1.45, state.targetPosition[2]],
    lookAheadWorld: [state.targetPosition[0] + state.movementWishWorld[0] * 2.2, state.targetPosition[1] + 1.6, state.targetPosition[2] - 2.4 + state.movementWishWorld[2]],
    cameraPosition: [state.targetPosition[0] + state.orbitYawOffsetDeg / 22, state.targetPosition[1] + 3.2, state.targetPosition[2] + 7],
    cameraForwardWorld: [-state.orbitYawOffsetDeg / 120, -0.16, -1],
    movementBasisForwardWorld: [0, 0, -1],
    actorForwardWorld: [0, 0, -1],
    colliderCount: 6
  };
  const description = kit.describe(snapshot);
  assert.equal(description.counts.focusTargetRibbons, 4, state.keys.join('+'));
  assert.equal(description.counts.shoulderClearanceWedges, 4, state.keys.join('+'));
  assert.equal(description.counts.nearClipCushions, 5, state.keys.join('+'));
  assert.equal(description.counts.orbitIntentRails, 6, state.keys.join('+'));
  assert.equal(description.counts.occlusionRiskVeils, 6, state.keys.join('+'));
  assert.equal(description.counts.cameraComfortMeters, 5, state.keys.join('+'));
  assert.ok(description.rendererHandoff.rendererConsumes.includes('occlusionRiskVeils'), state.keys.join('+'));
  assert.ok(description.ownership.rendererMustNotOwn.includes('camera follow math'), state.keys.join('+'));
}

console.log('third-person-camera-composition-readability-cdn-state-input-smoke: CDN plus 10 state/input cases passed');
