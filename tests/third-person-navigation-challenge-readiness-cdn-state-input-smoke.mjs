import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createThirdPersonNavigationChallengeReadinessDomainKit } from '../experiments/ThirdPersonFollowThrough/kits/third-person-navigation-challenge-readiness-domain-kit.js';

const indexHtml = fs.readFileSync(new URL('../experiments/ThirdPersonFollowThrough/index.html', import.meta.url), 'utf8');
const routeIndex = fs.readFileSync(new URL('../experiments/ThirdPersonFollowThrough/app/index.js', import.meta.url), 'utf8');
const entry = fs.readFileSync(new URL('../experiments/ThirdPersonFollowThrough/app/navigation-challenge-readiness-entry.js', import.meta.url), 'utf8');
const domain = fs.readFileSync(new URL('../experiments/ThirdPersonFollowThrough/domain/third-person-follow-through-domain.js', import.meta.url), 'utf8');
const kitSource = fs.readFileSync(new URL('../experiments/ThirdPersonFollowThrough/kits/third-person-navigation-challenge-readiness-domain-kit.js', import.meta.url), 'utf8');
const manifest = fs.readFileSync(new URL('../experiments/domain-kit-cutover-manifest.json', import.meta.url), 'utf8');

const cdn = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
assert.ok(indexHtml.includes('navigation-challenge-readiness-v1'), 'route shell should cache-bust navigation challenge readiness entry');
assert.ok(indexHtml.includes('Navigation Challenge: ON'), 'route shell should expose navigation challenge status');
assert.ok(routeIndex.includes('navigation-challenge-readiness-entry.js'), 'route index should load navigation challenge entry');
assert.ok(entry.includes(cdn), 'changed overlay should import NexusEngine main CDN');
assert.equal(entry.includes('LuminaryLabs-Dev/NexusRealtime'), false, 'changed overlay should not import old NexusRealtime runtime');
assert.ok(entry.includes('getNavigationChallengeReadiness'), 'entry should expose navigation challenge GameHost accessor');
assert.ok(entry.includes('getThirdPersonNavigationChallengeReadiness'), 'entry should expose route-specific GameHost accessor');
assert.ok(entry.includes('checkpointThreads'), 'entry renderer should consume checkpoint thread descriptors');
assert.ok(entry.includes('turnCommitmentWedges'), 'entry renderer should consume turn commitment descriptors');
assert.ok(entry.includes('vaultWindowArcs'), 'entry renderer should consume vault window descriptors');
assert.ok(entry.includes('recoveryPockets'), 'entry renderer should consume recovery pocket descriptors');
assert.ok(entry.includes('cameraActorSyncMeters'), 'entry renderer should consume camera actor sync descriptors');
assert.ok(entry.includes('finishCommitmentBeacons'), 'entry renderer should consume finish beacon descriptors');
assert.ok(domain.includes('third-person-navigation-challenge-readiness-domain-kit'), 'domain file should record navigation challenge kit');
assert.ok(manifest.includes('navigation-challenge-readiness-renderer-handoff-pass'), 'manifest should record navigation challenge pass');
assert.ok(manifest.includes('third-person-navigation-challenge-readiness-domain-kit'), 'manifest should include navigation challenge domain kit');
assert.equal(kitSource.includes('LuminaryLabs-Dev/NexusRealtime'), false, 'new kit should not import old runtime');
for (const forbidden of ['document.', 'window.', 'THREE.', 'WebGLRenderer', 'AudioContext', 'requestAnimationFrame']) {
  assert.equal(kitSource.includes(forbidden), false, `renderer-neutral kit should not contain ${forbidden}`);
}

const kit = createThirdPersonNavigationChallengeReadinessDomainKit();
const stateInputCases = [
  { keys: [], targetPosition: [0, 0, 8], movementWishWorld: [0, 0, 0], actorForwardWorld: [0, 0, -1], cameraForwardWorld: [0, 0, -1], grounded: true, rootYawDeg: 0, cameraYawDeg: 0, movementYawDeg: 0, handoffAlpha: 0 },
  { keys: ['w'], targetPosition: [0, 0, 6.8], movementWishWorld: [0, 0, -1], actorForwardWorld: [0, 0, -1], cameraForwardWorld: [0, 0, -1], grounded: true, rootYawDeg: 0, cameraYawDeg: 0, movementYawDeg: 0, handoffAlpha: 0.05 },
  { keys: ['a'], targetPosition: [-4, 0, 6], movementWishWorld: [-1, 0, 0], actorForwardWorld: [-1, 0, 0], cameraForwardWorld: [0, 0, -1], grounded: true, rootYawDeg: -90, cameraYawDeg: 0, movementYawDeg: -90, orbitYawOffsetDeg: -45, handoffAlpha: 0.45 },
  { keys: ['d'], targetPosition: [8, 0, 5], movementWishWorld: [1, 0, -0.4], actorForwardWorld: [1, 0, 0], cameraForwardWorld: [-0.2, 0, -1], grounded: true, rootYawDeg: 90, cameraYawDeg: -12, movementYawDeg: 68, orbitYawOffsetDeg: 56, handoffAlpha: 0.56 },
  { keys: ['s'], targetPosition: [0, 0, 10], movementWishWorld: [0, 0, 1], actorForwardWorld: [0, 0, -1], cameraForwardWorld: [0, 0, -1], grounded: true, rootYawDeg: 0, cameraYawDeg: 0, movementYawDeg: 180, handoffAlpha: 0.1 },
  { keys: ['space'], targetPosition: [-13, 1.2, 7], movementWishWorld: [0.2, 0, -0.7], actorForwardWorld: [0, 0, -1], cameraForwardWorld: [0, 0, -1], grounded: false, yVel: 5.2, rootYawDeg: 0, cameraYawDeg: 0, movementYawDeg: 12, handoffAlpha: 0.12 },
  { keys: ['space', 'fall'], targetPosition: [7, 1.8, -8], movementWishWorld: [0.2, 0, -0.5], actorForwardWorld: [0, 0, -1], cameraForwardWorld: [0, 0, -1], grounded: false, yVel: -6, rootYawDeg: 0, cameraYawDeg: 0, movementYawDeg: 18, handoffAlpha: 0.16 },
  { keys: ['arrowleft'], targetPosition: [-9, 0, -8], movementWishWorld: [-0.4, 0, -0.7], actorForwardWorld: [-0.7, 0, -0.7], cameraForwardWorld: [0.7, 0, -0.7], grounded: true, rootYawDeg: -45, cameraYawDeg: 45, movementYawDeg: -30, orbitYawOffsetDeg: -78, handoffAlpha: 0.82 },
  { keys: ['arrowright'], targetPosition: [13, 0, 4], movementWishWorld: [0.6, 0, -0.5], actorForwardWorld: [0.7, 0, -0.7], cameraForwardWorld: [-0.7, 0, -0.7], grounded: true, rootYawDeg: 45, cameraYawDeg: -45, movementYawDeg: 40, orbitYawOffsetDeg: 78, handoffAlpha: 0.82 },
  { keys: ['w', 'finish'], targetPosition: [0, 0, -16.5], movementWishWorld: [0, 0, -1], actorForwardWorld: [0, 0, -1], cameraForwardWorld: [0, 0, -1], grounded: true, rootYawDeg: 0, cameraYawDeg: 0, movementYawDeg: 0, handoffAlpha: 0 }
];

for (const state of stateInputCases) {
  const description = kit.describe({
    ...state,
    headWorld: [state.targetPosition[0], state.targetPosition[1] + 1.6, state.targetPosition[2]],
    cameraPivotWorld: [state.targetPosition[0], state.targetPosition[1] + 1.45, state.targetPosition[2]],
    lookAheadWorld: [state.targetPosition[0] + state.movementWishWorld[0] * 2.2, state.targetPosition[1] + 1.6, state.targetPosition[2] - 2.4 + state.movementWishWorld[2]],
    cameraPosition: [state.targetPosition[0] + (state.orbitYawOffsetDeg ?? 0) / 22, state.targetPosition[1] + 3.2, state.targetPosition[2] + 7],
    movementBasisForwardWorld: [0, 0, -1],
    movementBasisRightWorld: [1, 0, 0],
    colliderCount: 6
  });
  assert.equal(description.counts.checkpointThreads, 5, state.keys.join('+'));
  assert.ok(description.counts.turnCommitmentWedges >= 1, state.keys.join('+'));
  assert.equal(description.counts.vaultWindowArcs, 3, state.keys.join('+'));
  assert.equal(description.counts.recoveryPockets, 5, state.keys.join('+'));
  assert.equal(description.counts.cameraActorSyncMeters, 5, state.keys.join('+'));
  assert.equal(description.counts.finishCommitmentBeacons, 1, state.keys.join('+'));
  assert.ok(description.rendererHandoff.rendererConsumes.includes('checkpointThreads'), state.keys.join('+'));
  assert.ok(description.ownership.rendererMustNotOwn.includes('browser input'), state.keys.join('+'));
}

console.log('third-person-navigation-challenge-readiness-cdn-state-input-smoke: CDN plus 10 state/input cases passed');
