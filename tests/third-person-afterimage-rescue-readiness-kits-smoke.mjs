import assert from 'node:assert/strict';
import { createThirdPersonAfterimageRescueReadinessDomainKit, THIRD_PERSON_AFTERIMAGE_RESCUE_OWNERSHIP_EXCLUSIONS } from '../experiments/ThirdPersonFollowThrough/kits/third-person-afterimage-rescue-readiness-domain-kit.js';

const kit = createThirdPersonAfterimageRescueReadinessDomainKit();
const cases = [
  { name: 'idle start', snapshot: { targetPosition: [0, 0, 8], movementWishWorld: [0, 0, 0], actorForwardWorld: [0, 0, -1], grounded: true, staminaRatio: 1, frame: 0 } },
  { name: 'north sprint', snapshot: { targetPosition: [-10, 0, 8], movementWishWorld: [0, 0, -1], actorForwardWorld: [0, 0, -1], grounded: true, staminaRatio: 0.92, frame: 10 } },
  { name: 'airborne jump', snapshot: { targetPosition: [-5, 1.2, 2], movementWishWorld: [0.4, 0, -0.9], actorForwardWorld: [0.2, 0, -1], grounded: false, yVel: 8, staminaRatio: 0.82, jumpCount: 1, frame: 30 } },
  { name: 'hard landing', snapshot: { targetPosition: [1, 0, -2], movementWishWorld: [0.7, 0, -0.3], actorForwardWorld: [0.5, 0, -0.6], grounded: true, yVel: -11, staminaRatio: 0.7, jumpCount: 2, frame: 55 } },
  { name: 'fatigued yaw stress', snapshot: { targetPosition: [8, 0, -7], movementWishWorld: [1, 0, 0], actorForwardWorld: [1, 0, -0.2], grounded: true, orbitYawOffset: 2.1, staminaRatio: 0.32, frame: 70 } },
  { name: 'east extraction', snapshot: { targetPosition: [17, 0, -15], movementWishWorld: [0.8, 0, -0.5], actorForwardWorld: [0.7, 0, -0.4], grounded: true, staminaRatio: 0.88, colliderCount: 10, frame: 90 } },
  { name: 'invalid values sanitize', snapshot: { targetPosition: ['bad', null, Infinity], movementWishWorld: ['x'], actorForwardWorld: null, grounded: true, staminaRatio: 3, frame: NaN } },
  { name: 'low stamina route', snapshot: { targetPosition: [-14, 0, -4], movementWishWorld: [0.2, 0, -0.9], actorForwardWorld: [0, 0, -1], grounded: true, staminaRatio: 0.15, yVel: -2, frame: 120 } },
  { name: 'fast strafe', snapshot: { targetPosition: [3, 0, 7], movementWishWorld: [1, 0, 0.1], actorForwardWorld: [0.4, 0, -0.4], grounded: true, staminaRatio: 0.76, colliderCount: 8, frame: 150 } },
  { name: 'prepared rescue approach', snapshot: { targetPosition: [14, 0, -10], movementWishWorld: [0.6, 0, -0.7], actorForwardWorld: [0.4, 0, -0.8], grounded: true, staminaRatio: 1, colliderCount: 12, frame: 210 } }
];

assert.equal(kit.domain, 'third-person-afterimage-rescue-readiness-domain');
assert.match(kit.tree, /afterimage-trace-domain/);
assert.match(kit.tree, /renderer consumes descriptors only/);
assert.ok(THIRD_PERSON_AFTERIMAGE_RESCUE_OWNERSHIP_EXCLUSIONS.includes('renderer'));
assert.ok(THIRD_PERSON_AFTERIMAGE_RESCUE_OWNERSHIP_EXCLUSIONS.includes('frame-loop ownership'));

for (const item of cases) {
  const description = kit.describe(item.snapshot);
  assert.equal(description.rendererHandoff.policy, 'renderer-consumes-descriptors-only', item.name);
  assert.equal(description.counts.afterimageTraces, 6, item.name);
  assert.equal(description.counts.landingDustPuffs, 4, item.name);
  assert.equal(description.counts.rescueFlareWaypoints, 4, item.name);
  assert.equal(description.counts.ropeSwingArcs, 3, item.name);
  assert.equal(description.counts.signalDrones, 3, item.name);
  assert.equal(description.counts.dawnRunLedgers, 1, item.name);
  assert.ok(description.summary.rescueReadiness >= 0 && description.summary.rescueReadiness <= 1, item.name);
  assert.ok(description.summary.fatigueRisk >= 0 && description.summary.fatigueRisk <= 1, item.name);
  assert.ok(['extraction-ready', 'route-forming', 'needs-readable-motion'].includes(description.summary.state), item.name);
  assert.doesNotThrow(() => JSON.stringify(description.rendererHandoff), item.name);
}

const cold = kit.describe(cases[0].snapshot).summary;
const prepared = kit.describe(cases[9].snapshot).summary;
assert.ok(prepared.rescueReadiness >= cold.rescueReadiness, 'prepared rescue approach should not be less ready than idle start');

console.log('Third Person afterimage rescue readiness kits smoke passed 10 intake cases.');
