import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  THIRD_PERSON_LOCOMOTION_READABILITY_TREE,
  createThirdPersonRootYawAlignmentFanKit,
  createThirdPersonBackpedalGuardRailKit,
  createThirdPersonJumpApexBandKit,
  createThirdPersonLandingSafetyPatchKit,
  createThirdPersonCameraRecenterLeashKit,
  createThirdPersonInputCadenceBeatKit,
  createThirdPersonLocomotionRendererHandoffKit,
  createThirdPersonLocomotionReadabilityDomainKit
} from '../experiments/ThirdPersonFollowThrough/kits/third-person-locomotion-readability-domain-kit.js';

const cases = [
  { label: 'idle neutral', targetPosition: [0, 0, 8], headWorld: [0, 1.6, 8], movementWishWorld: [0, 0, 0], movementBasisForwardWorld: [0, 0, -1], actorForwardWorld: [0, 0, -1], grounded: true, keys: [] },
  { label: 'forward aligned', targetPosition: [0.6, 0, 6.5], headWorld: [0.6, 1.6, 6.5], movementWishWorld: [0, 0, -1], movementBasisForwardWorld: [0, 0, -1], actorForwardWorld: [0, 0, -1], grounded: true, keys: ['w'] },
  { label: 'strafe left', targetPosition: [-1.5, 0, 6], headWorld: [-1.5, 1.6, 6], movementWishWorld: [-1, 0, 0], movementBasisForwardWorld: [0, 0, -1], actorForwardWorld: [-0.4, 0, -0.92], grounded: true, keys: ['a'] },
  { label: 'strafe right', targetPosition: [2, 0, 5], headWorld: [2, 1.6, 5], movementWishWorld: [1, 0, 0], movementBasisForwardWorld: [0, 0, -1], actorForwardWorld: [0.35, 0, -0.94], grounded: true, keys: ['d'] },
  { label: 'backpedal guard', targetPosition: [0, 0, 9.2], headWorld: [0, 1.6, 9.2], movementWishWorld: [0, 0, 1], movementBasisForwardWorld: [0, 0, -1], actorForwardWorld: [0, 0, -1], grounded: true, keys: ['s'] },
  { label: 'jump rising', targetPosition: [1, 1.1, 7.5], headWorld: [1, 2.7, 7.5], movementWishWorld: [0.2, 0, -0.8], movementBasisForwardWorld: [0, 0, -1], actorForwardWorld: [0.1, 0, -0.99], grounded: false, yVel: 4.8, keys: ['space'] },
  { label: 'jump falling', targetPosition: [1.5, 1.7, 4], headWorld: [1.5, 3.3, 4], movementWishWorld: [0.4, 0, -0.7], movementBasisForwardWorld: [0, 0, -1], actorForwardWorld: [0.2, 0, -0.98], grounded: false, yVel: -5.2, keys: ['space'] },
  { label: 'left camera handoff', targetPosition: [-2, 0, 4], headWorld: [-2, 1.6, 4], movementWishWorld: [-0.5, 0, -0.6], movementBasisForwardWorld: [-0.7, 0, -0.7], actorForwardWorld: [-0.2, 0, -0.98], orbitYawOffsetDeg: -76, handoffAlpha: 0.8, grounded: true, keys: ['arrowleft'] },
  { label: 'right camera handoff', targetPosition: [3, 0, 3], headWorld: [3, 1.6, 3], movementWishWorld: [0.5, 0, -0.5], movementBasisForwardWorld: [0.7, 0, -0.7], actorForwardWorld: [0.2, 0, -0.98], orbitYawOffsetDeg: 72, handoffAlpha: 0.74, grounded: true, keys: ['arrowright'] },
  { label: 'near landing obstacle', targetPosition: [13.2, 0.4, 8.8], headWorld: [13.2, 2.0, 8.8], movementWishWorld: [0, 0, -0.4], movementBasisForwardWorld: [0, 0, -1], actorForwardWorld: [0, 0, -1], grounded: false, yVel: -3.4, keys: ['w'] }
];

assert.ok(THIRD_PERSON_LOCOMOTION_READABILITY_TREE.includes('renderer consumes descriptors only'));

const rootFanKit = createThirdPersonRootYawAlignmentFanKit();
const backpedalKit = createThirdPersonBackpedalGuardRailKit();
const jumpKit = createThirdPersonJumpApexBandKit();
const landingKit = createThirdPersonLandingSafetyPatchKit();
const leashKit = createThirdPersonCameraRecenterLeashKit();
const cadenceKit = createThirdPersonInputCadenceBeatKit();
const handoffKit = createThirdPersonLocomotionRendererHandoffKit();
const domainKit = createThirdPersonLocomotionReadabilityDomainKit();

for (const intake of cases) {
  assert.equal(rootFanKit.describe(intake).length, 5, intake.label);
  assert.equal(backpedalKit.describe(intake).length, 4, intake.label);
  assert.equal(jumpKit.describe(intake).length, 3, intake.label);
  assert.equal(landingKit.describe(intake).length, 6, intake.label);
  assert.equal(leashKit.describe(intake).length, 5, intake.label);
  assert.equal(cadenceKit.describe(intake).length, 6, intake.label);

  const description = domainKit.describe(intake);
  assert.equal(description.route, 'ThirdPersonFollowThrough', intake.label);
  assert.equal(description.counts.rootYawFans, 5, intake.label);
  assert.equal(description.counts.backpedalGuardRails, 4, intake.label);
  assert.equal(description.counts.jumpApexBands, 3, intake.label);
  assert.equal(description.counts.landingSafetyPatches, 6, intake.label);
  assert.equal(description.counts.cameraRecenterLeashes, 5, intake.label);
  assert.equal(description.counts.inputCadenceBeats, 6, intake.label);
  assert.equal(description.rendererHandoff.policy, 'renderer-consumes-descriptors-only', intake.label);
  assert.ok(description.rendererHandoff.rendererMustNotOwn.includes('browser input'), intake.label);
  assert.doesNotThrow(() => JSON.stringify(description), intake.label);

  const handoff = handoffKit.describe(description.descriptors);
  assert.equal(handoff.counts.rootYawFans, 5, intake.label);
  assert.ok(handoff.rendererConsumes.includes('landingSafetyPatches'), intake.label);
  assert.ok(domainKit.snapshot(intake).totalDescriptors >= 29, intake.label);
}

const backpedal = domainKit.describe(cases[4]);
assert.ok(backpedal.descriptors.backpedalGuardRails.some((rail) => rail.active), 'backpedal case should activate guard rail descriptors');

const obstacle = domainKit.describe(cases[9]);
assert.ok(obstacle.descriptors.landingSafetyPatches.some((patch) => patch.state !== 'clear'), 'near obstacle case should mark at least one risky landing patch');

const source = fs.readFileSync(new URL('../experiments/ThirdPersonFollowThrough/kits/third-person-locomotion-readability-domain-kit.js', import.meta.url), 'utf8');
for (const forbidden of ['document.', 'window.', 'THREE.', 'WebGLRenderer', 'AudioContext', 'requestAnimationFrame']) {
  assert.equal(source.includes(forbidden), false, `renderer-neutral kit must not contain ${forbidden}`);
}

console.log('third-person-locomotion-readability-kits-smoke: 10 intake cases passed');
