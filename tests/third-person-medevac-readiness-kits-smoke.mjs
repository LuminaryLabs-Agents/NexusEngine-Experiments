import assert from 'node:assert/strict';
import { createThirdPersonMedevacReadinessDomainKit, THIRD_PERSON_MEDEVAC_READINESS_TREE } from '../experiments/ThirdPersonFollowThrough/kits/third-person-medevac-readiness-domain-kit.js';

const cases = [
  { targetPosition: [0, 0, 8], cameraPosition: [0, 3.2, 15], movementWishWorld: [0, 0, 0], grounded: true, colliderCount: 6, staminaRatio: 1, frame: 0 },
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
assert.equal(domain.id, 'third-person-medevac-readiness-domain-kit');
assert.ok(THIRD_PERSON_MEDEVAC_READINESS_TREE.includes('third-person-casualty-beacon-kit'));
assert.ok(THIRD_PERSON_MEDEVAC_READINESS_TREE.includes('renderer consumes descriptors only'));

for (const [index, snapshot] of cases.entries()) {
  const description = domain.describe(snapshot);
  assert.equal(description.domainId, 'third-person-medevac-readiness-domain', `case ${index} domain id`);
  assert.equal(description.rendererHandoff.policy, 'renderer-consumes-descriptors-only', `case ${index} policy`);
  assert.equal(description.counts.casualtyBeacons, 4, `case ${index} casualty count`);
  assert.equal(description.counts.vitalSignRibbons, 4, `case ${index} vital count`);
  assert.equal(description.counts.coverCorridors, 3, `case ${index} corridor count`);
  assert.equal(description.counts.signalFlares, 3, `case ${index} flare count`);
  assert.equal(description.counts.stretcherPickups, 3, `case ${index} pickup count`);
  assert.equal(description.counts.evacuationTimers, 1, `case ${index} timer count`);
  assert.equal(description.rendererHandoff.descriptorCount, 18, `case ${index} descriptor total`);
  assert.ok(['go', 'hold', 'delay'].includes(description.summary.timerState), `case ${index} timer state`);
  assert.doesNotThrow(() => JSON.stringify(description), `case ${index} serializable`);
  assert.ok(description.rendererHandoff.descriptors.casualtyBeacons.every((beacon) => Number.isFinite(beacon.position.x) && Number.isFinite(beacon.urgency)), `case ${index} casualty shape`);
  assert.ok(description.rendererHandoff.descriptors.stretcherPickups.every((pickup) => Number.isFinite(pickup.readiness)), `case ${index} pickup shape`);
}

const nearCritical = domain.describe(cases[1]).rendererHandoff.descriptors.casualtyBeacons.find((beacon) => beacon.casualtyId === 'north-stair-caller');
assert.equal(nearCritical.state, 'critical', 'near north stair caller should become critical rescue beacon');
const exhausted = domain.describe(cases[8]).summary;
assert.ok(exhausted.evacuationReadiness < 0.58, 'exhausted airborne run should reduce evacuation readiness');

console.log('third-person medevac readiness kits smoke passed', cases.length, 'cases');
