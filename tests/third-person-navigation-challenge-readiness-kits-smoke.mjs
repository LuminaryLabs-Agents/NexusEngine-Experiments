import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  THIRD_PERSON_NAVIGATION_CHALLENGE_READINESS_TREE,
  createThirdPersonCheckpointThreadKit,
  createThirdPersonTurnCommitmentWedgeKit,
  createThirdPersonVaultWindowArcKit,
  createThirdPersonRecoveryPocketKit,
  createThirdPersonCameraActorSyncMeterKit,
  createThirdPersonFinishCommitmentBeaconKit,
  createThirdPersonNavigationChallengeRendererHandoffKit,
  createThirdPersonNavigationChallengeReadinessDomainKit
} from '../experiments/ThirdPersonFollowThrough/kits/third-person-navigation-challenge-readiness-domain-kit.js';

const cases = [
  { label: 'idle at warmup lane', targetPosition: [0, 0, 8], movementWishWorld: [0, 0, 0], actorForwardWorld: [0, 0, -1], cameraForwardWorld: [0, 0, -1], grounded: true, rootYawDeg: 0, cameraYawDeg: 0, movementYawDeg: 0, handoffAlpha: 0 },
  { label: 'forward checkpoint push', targetPosition: [1.2, 0, 6.4], movementWishWorld: [0.1, 0, -1], actorForwardWorld: [0, 0, -1], cameraForwardWorld: [0, 0, -1], grounded: true, rootYawDeg: 0, cameraYawDeg: 0, movementYawDeg: 4, handoffAlpha: 0.04 },
  { label: 'pillar cut approach', targetPosition: [10.2, 0, 4.1], movementWishWorld: [0.8, 0, -0.3], actorForwardWorld: [1, 0, 0], cameraForwardWorld: [0.2, 0, -0.9], grounded: true, rootYawDeg: 82, cameraYawDeg: 18, movementYawDeg: 72, orbitYawOffsetDeg: -58, handoffAlpha: 0.58 },
  { label: 'round platform hop', targetPosition: [13, 0, 9], movementWishWorld: [0.4, 0, -0.8], actorForwardWorld: [0, 0, -1], cameraForwardWorld: [-0.3, 0, -0.8], grounded: true, rootYawDeg: 0, cameraYawDeg: -22, movementYawDeg: 26, handoffAlpha: 0.18 },
  { label: 'ramp vault near', targetPosition: [-12, 0, 7.2], movementWishWorld: [-0.6, 0, -0.3], actorForwardWorld: [-1, 0, 0], cameraForwardWorld: [0.4, 0, -0.8], grounded: true, rootYawDeg: -86, cameraYawDeg: 28, movementYawDeg: -65, handoffAlpha: 0.7 },
  { label: 'jump rise at ramp', targetPosition: [-13, 1.1, 7], movementWishWorld: [0.2, 0, -0.7], actorForwardWorld: [0, 0, -1], cameraForwardWorld: [0.1, -0.2, -1], grounded: false, yVel: 5.6, rootYawDeg: 0, cameraYawDeg: 8, movementYawDeg: 12, handoffAlpha: 0.12 },
  { label: 'falling recovery search', targetPosition: [6, 2.0, -8], movementWishWorld: [0.2, 0, -0.4], actorForwardWorld: [0, 0, -1], cameraForwardWorld: [0.1, -0.2, -1], grounded: false, yVel: -6.2, rootYawDeg: 4, cameraYawDeg: 8, movementYawDeg: 20, handoffAlpha: 0.16 },
  { label: 'backpedal camera split', targetPosition: [0, 0, 10], movementWishWorld: [0, 0, 1], actorForwardWorld: [0, 0, -1], cameraForwardWorld: [0, 0, -1], grounded: true, rootYawDeg: 0, cameraYawDeg: 0, movementYawDeg: 180, handoffAlpha: 0.1 },
  { label: 'hard left camera orbit', targetPosition: [-8, 0, -8], movementWishWorld: [-0.5, 0, -0.6], actorForwardWorld: [-0.7, 0, -0.7], cameraForwardWorld: [0.7, 0, -0.7], grounded: true, rootYawDeg: -45, cameraYawDeg: 45, movementYawDeg: -38, orbitYawOffsetDeg: -78, handoffAlpha: 0.86 },
  { label: 'finish approach', targetPosition: [0, 0, -16.5], movementWishWorld: [0, 0, -1], actorForwardWorld: [0, 0, -1], cameraForwardWorld: [0, 0, -1], grounded: true, rootYawDeg: 0, cameraYawDeg: 0, movementYawDeg: 0, handoffAlpha: 0 }
];

assert.ok(THIRD_PERSON_NAVIGATION_CHALLENGE_READINESS_TREE.includes('renderer consumes descriptors only'));
assert.ok(THIRD_PERSON_NAVIGATION_CHALLENGE_READINESS_TREE.includes('third-person-checkpoint-thread-kit'));

const checkpointKit = createThirdPersonCheckpointThreadKit();
const turnKit = createThirdPersonTurnCommitmentWedgeKit();
const vaultKit = createThirdPersonVaultWindowArcKit();
const recoveryKit = createThirdPersonRecoveryPocketKit();
const syncKit = createThirdPersonCameraActorSyncMeterKit();
const finishKit = createThirdPersonFinishCommitmentBeaconKit();
const handoffKit = createThirdPersonNavigationChallengeRendererHandoffKit();
const domainKit = createThirdPersonNavigationChallengeReadinessDomainKit();

for (const intake of cases) {
  assert.equal(checkpointKit.describe(intake).length, 5, intake.label);
  assert.ok(turnKit.describe(intake).length >= 1, intake.label);
  assert.ok(turnKit.describe(intake).length <= 4, intake.label);
  assert.equal(vaultKit.describe(intake).length, 3, intake.label);
  assert.equal(recoveryKit.describe(intake).length, 5, intake.label);
  assert.equal(syncKit.describe(intake).length, 5, intake.label);
  assert.equal(finishKit.describe(intake).length, 1, intake.label);

  const description = domainKit.describe(intake);
  assert.equal(description.route, 'ThirdPersonFollowThrough', intake.label);
  assert.equal(description.counts.checkpointThreads, 5, intake.label);
  assert.ok(description.counts.turnCommitmentWedges >= 1, intake.label);
  assert.equal(description.counts.vaultWindowArcs, 3, intake.label);
  assert.equal(description.counts.recoveryPockets, 5, intake.label);
  assert.equal(description.counts.cameraActorSyncMeters, 5, intake.label);
  assert.equal(description.counts.finishCommitmentBeacons, 1, intake.label);
  assert.equal(description.rendererHandoff.policy, 'renderer-consumes-descriptors-only', intake.label);
  assert.ok(description.rendererHandoff.rendererMustNotOwn.includes('browser input'), intake.label);
  assert.ok(description.ownership.rendererMustNotOwn.includes('frame loop'), intake.label);
  assert.doesNotThrow(() => JSON.stringify(description), intake.label);

  const handoff = handoffKit.describe(description.descriptors);
  assert.equal(handoff.counts.checkpointThreads, 5, intake.label);
  assert.ok(handoff.rendererConsumes.includes('finishCommitmentBeacons'), intake.label);
  assert.ok(domainKit.snapshot(intake).totalDescriptors >= 20, intake.label);
}

const airborne = domainKit.describe(cases[5]);
assert.ok(airborne.descriptors.vaultWindowArcs.some((arc) => arc.state === 'airborne-rise'), 'airborne rise should mark vault arcs');

const finish = domainKit.describe(cases[9]);
assert.ok(finish.descriptors.finishCommitmentBeacons[0].readiness > 0.4, 'finish approach should raise finish readiness');

const split = domainKit.describe(cases[7]);
assert.ok(split.descriptors.cameraActorSyncMeters.some((meter) => meter.state !== 'synced'), 'backpedal split should expose sync recovery state');

const source = fs.readFileSync(new URL('../experiments/ThirdPersonFollowThrough/kits/third-person-navigation-challenge-readiness-domain-kit.js', import.meta.url), 'utf8');
for (const forbidden of ['document.', 'window.', 'THREE.', 'WebGLRenderer', 'AudioContext', 'requestAnimationFrame', 'addEventListener']) {
  assert.equal(source.includes(forbidden), false, `renderer-neutral kit must not contain ${forbidden}`);
}

console.log('third-person-navigation-challenge-readiness-kits-smoke: 10 intake cases passed');
