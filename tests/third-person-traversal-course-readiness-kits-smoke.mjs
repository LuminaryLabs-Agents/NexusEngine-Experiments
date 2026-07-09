import assert from 'node:assert/strict';
import {
  THIRD_PERSON_TRAVERSAL_COURSE_OWNERSHIP_EXCLUSIONS,
  createThirdPersonTraversalCourseReadinessDomainKit
} from '../experiments/ThirdPersonFollowThrough/kits/third-person-traversal-course-readiness-domain-kit.js';

const domainKit = createThirdPersonTraversalCourseReadinessDomainKit();

const cases = [
  { name: 'idle start', snapshot: { targetPosition: [0, 0, 8], cameraPosition: [0, 3.2, 15], movementWishWorld: [0, 0, 0], grounded: true, staminaRatio: 1, frame: 0 } },
  { name: 'running to first gate', snapshot: { targetPosition: [-14, 0, 12], cameraPosition: [-14, 3, 19], movementWishWorld: [0.6, 0, -0.4], grounded: true, staminaRatio: 0.92, frame: 12 } },
  { name: 'balance plank approach', snapshot: { targetPosition: [-7, 0, 5], cameraPosition: [-6, 3.1, 13], movementWishWorld: [0.3, 0, -0.8], grounded: true, staminaRatio: 0.78, orbitYawOffset: 0.5, frame: 24 } },
  { name: 'airborne vault', snapshot: { targetPosition: [5, 1.2, -2], cameraPosition: [4, 4.2, 8], movementWishWorld: [0.7, 0, -0.6], grounded: false, yVel: 4.8, staminaRatio: 0.64, jumpCount: 2, orbitYawOffset: 0.2, frame: 36 } },
  { name: 'stamina low', snapshot: { targetPosition: [0, 0, -16], cameraPosition: [0, 3.1, -8], movementWishWorld: [0.2, 0, -0.2], grounded: true, staminaRatio: 0.21, jumpCount: 5, frame: 48 } },
  { name: 'yaw stress', snapshot: { targetPosition: [13, 0, 1], cameraPosition: [8, 3.2, 12], movementWishWorld: [0.4, 0, 0.4], grounded: true, staminaRatio: 0.7, orbitYawOffset: 2.4, frame: 60 } },
  { name: 'east landing mat', snapshot: { targetPosition: [15, 0, -13], cameraPosition: [12, 2.8, -5], movementWishWorld: [0.1, 0, -0.7], grounded: true, staminaRatio: 0.55, frame: 72 } },
  { name: 'bad numeric input', snapshot: { targetPosition: ['bad', null, Infinity], cameraPosition: undefined, movementWishWorld: [NaN, 0, 0.9], grounded: true, staminaRatio: 'bad', frame: 'bad' } },
  { name: 'missing input', snapshot: {} },
  { name: 'custom actor object', snapshot: { actor: { position: [18, 0, -4], yVel: -2 }, camera: { position: [18, 4, 4] }, movementWishWorld: [-0.2, 0, -0.4], grounded: true, stamina: 0.44, jumps: 1, frame: 88 } }
];

for (const testCase of cases) {
  const result = domainKit.describe(testCase.snapshot);
  assert.equal(result.domain, 'third-person-traversal-course-readiness-domain', testCase.name);
  assert.equal(result.rendererHandoff.policy, 'renderer-consumes-descriptors-only', testCase.name);
  assert.equal(result.rendererHandoff.descriptors.checkpointGates.length, 4, testCase.name);
  assert.equal(result.rendererHandoff.descriptors.ghostFootstepRibbons.length, 3, testCase.name);
  assert.equal(result.rendererHandoff.descriptors.balanceBeamWobbles.length, 3, testCase.name);
  assert.equal(result.rendererHandoff.descriptors.vaultTargetArcs.length, 2, testCase.name);
  assert.equal(result.rendererHandoff.descriptors.breathRecoveryPads.length, 3, testCase.name);
  assert.equal(result.rendererHandoff.descriptors.coachLedgers.length, 1, testCase.name);
  assert.equal(result.rendererHandoff.descriptorCount, 16, testCase.name);
  assert.ok(result.summary.courseReadiness >= 0 && result.summary.courseReadiness <= 1, testCase.name);
  assert.ok(result.summary.balanceRisk >= 0 && result.summary.balanceRisk <= 1, testCase.name);
  assert.ok(['course-clear', 'coach-ready', 'needs-routing'].includes(result.summary.missionState), testCase.name);
  assert.doesNotThrow(() => JSON.stringify(result), testCase.name);
}

for (const forbidden of ['renderer', 'DOM', 'browser input', 'Three.js', 'WebGL', 'audio', 'asset loading', 'frame-loop ownership']) {
  assert.ok(THIRD_PERSON_TRAVERSAL_COURSE_OWNERSHIP_EXCLUSIONS.includes(forbidden), forbidden);
}

const idle = domainKit.describe(cases[0].snapshot).summary.courseReadiness;
const routed = domainKit.describe(cases[6].snapshot).summary.courseReadiness;
assert.ok(routed >= idle - 0.25, 'routed state should not collapse below idle by more than tolerance');

console.log('Third Person traversal course readiness kits smoke passed 10 intake cases.');
