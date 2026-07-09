import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createThirdPersonWayfindingCacheReadinessDomainKit } from '../experiments/ThirdPersonFollowThrough/kits/third-person-wayfinding-cache-readiness-domain-kit.js';

const kitSource = readFileSync(new URL('../experiments/ThirdPersonFollowThrough/kits/third-person-wayfinding-cache-readiness-domain-kit.js', import.meta.url), 'utf8');
const kit = createThirdPersonWayfindingCacheReadinessDomainKit();
const allowedStates = new Set(['cache-route-at-risk', 'cache-route-forming', 'cache-route-secured']);
const forbiddenOwnership = ['document.', 'window.', 'globalThis.document', 'requestAnimationFrame', 'new Audio', 'THREE.', 'canvas.getContext'];

assert.equal(kit.id, 'third-person-wayfinding-cache-readiness-domain-kit');
assert.match(kit.tree, /safe-step-domain/);
assert.match(kit.tree, /renderer consumes descriptors only/);
assert.ok(kit.ownershipExclusions.includes('renderer'));
for (const forbidden of forbiddenOwnership) {
  assert.equal(kitSource.includes(forbidden), false, `kit source must not own ${forbidden}`);
}

const cases = [
  { name: 'cold spawn', targetPosition: [0, 0, 8], movementWishWorld: [0, 0, 0], actorForwardWorld: [0, 0, -1], frame: 0, staminaRatio: 1, colliderCount: 5, grounded: true },
  { name: 'moving north', targetPosition: [-3, 0, 6], movementWishWorld: [0.2, 0, -0.9], actorForwardWorld: [0, 0, -1], frame: 15, staminaRatio: 0.9, colliderCount: 7, grounded: true, discoveredCaches: 1 },
  { name: 'jumping over rubble', targetPosition: [2, 0.9, 1], movementWishWorld: [0.6, 0, -0.6], actorForwardWorld: [0.5, 0, -0.5], frame: 31, yVel: 5.4, staminaRatio: 0.7, colliderCount: 8, grounded: false, discoveredCaches: 1 },
  { name: 'nearest fountain collapse', targetPosition: [1, 0, 2], movementWishWorld: [0.8, 0, -0.2], actorForwardWorld: [1, 0, 0], frame: 48, staminaRatio: 0.62, colliderCount: 9, grounded: true, discoveredCaches: 2, carriedMedkits: 1 },
  { name: 'low stamina route', targetPosition: [5, 0, -3], movementWishWorld: [0.1, 0, -0.3], actorForwardWorld: [0, 0, -1], frame: 66, staminaRatio: 0.24, colliderCount: 4, grounded: true, yawOffset: 1.2 },
  { name: 'east cache approach', targetPosition: [11, 0, -8], movementWishWorld: [0.7, 0, -0.7], actorForwardWorld: [0.8, 0, -0.5], frame: 82, staminaRatio: 0.8, colliderCount: 9, grounded: true, discoveredCaches: 3, carriedMedkits: 2 },
  { name: 'full cache sweep', targetPosition: [16, 0, -14], movementWishWorld: [0.2, 0, -0.4], actorForwardWorld: [0, 0, -1], frame: 105, staminaRatio: 0.96, colliderCount: 10, grounded: true, discoveredCaches: 4, carriedMedkits: 4 },
  { name: 'bad numeric input', targetPosition: ['x', null, undefined], movementWishWorld: ['nope'], actorForwardWorld: [], frame: 'nan', staminaRatio: 2, colliderCount: -4, grounded: true },
  { name: 'camera stress', targetPosition: [-12, 0, 9], movementWishWorld: [-0.6, 0, 0.2], actorForwardWorld: [-1, 0, 0], frame: 120, staminaRatio: 0.55, colliderCount: 2, grounded: false, yVel: -7.5, orbitYawOffset: 2.7 },
  { name: 'late evacuation', targetPosition: [18, 0, -16], movementWishWorld: [0, 0, -1], actorForwardWorld: [0, 0, -1], frame: 150, staminaRatio: 1, colliderCount: 12, grounded: true, discoveredCaches: 4, carriedMedkits: 3 }
];

for (const testCase of cases) {
  const description = kit.describe(testCase);
  const handoff = description.rendererHandoff;
  assert.equal(description.domain, 'third-person-wayfinding-cache-readiness-domain', testCase.name);
  assert.equal(handoff.policy, 'renderer-consumes-descriptors-only', testCase.name);
  assert.equal(handoff.counts.chalkArrowMarks, 7, testCase.name);
  assert.equal(handoff.counts.rescueRibbonLines, 4, testCase.name);
  assert.equal(handoff.counts.rubbleSilhouettes, 3, testCase.name);
  assert.equal(handoff.counts.safeStepTiles, 9, testCase.name);
  assert.equal(handoff.counts.medkitCacheCrates, 4, testCase.name);
  assert.equal(handoff.counts.dawnWayfindingLedgers, 1, testCase.name);
  assert.ok(description.summary.readiness >= 0 && description.summary.readiness <= 1, testCase.name);
  assert.ok(description.summary.routePressure >= 0 && description.summary.routePressure <= 1, testCase.name);
  assert.ok(description.summary.cacheCoverage >= 0 && description.summary.cacheCoverage <= 1, testCase.name);
  assert.ok(allowedStates.has(description.summary.missionState), testCase.name);
  assert.doesNotThrow(() => JSON.stringify(description), testCase.name);
}

const cold = kit.describe(cases[0]).summary.readiness;
const late = kit.describe(cases.at(-1)).summary.readiness;
assert.ok(late > cold, `late evacuation readiness ${late} should exceed cold start ${cold}`);

console.log('Third Person wayfinding cache readiness kits smoke passed 10 intake cases.');
