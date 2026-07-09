import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createThirdPersonRooftopRopeRescueReadinessDomainKit } from '../experiments/ThirdPersonFollowThrough/kits/third-person-rooftop-rope-rescue-readiness-domain-kit.js';

const kitSource = readFileSync(new URL('../experiments/ThirdPersonFollowThrough/kits/third-person-rooftop-rope-rescue-readiness-domain-kit.js', import.meta.url), 'utf8');
const forbiddenImplementationTokens = ['document.', 'window.', 'requestAnimationFrame', 'WebGLRenderer', 'THREE.'];
for (const token of forbiddenImplementationTokens) {
  assert.equal(kitSource.includes(token), false, `reusable kit must not own ${token}`);
}

const kit = createThirdPersonRooftopRopeRescueReadinessDomainKit();
assert.equal(kit.id, 'third-person-rooftop-rope-rescue-readiness-domain-kit');
assert.match(kit.tree, /renderer consumes descriptors only/);
assert.ok(kit.ownershipExclusions.includes('DOM'));
assert.ok(kit.ownershipExclusions.includes('frame-loop ownership'));

const cases = [
  { name: 'cold start', input: {} },
  { name: 'moving north', input: { targetPosition: [0, 0, 10], movementWishWorld: [0, 0, -1], actorForwardWorld: [0, 0, -1], staminaRatio: 0.9, grounded: true, colliderCount: 6 } },
  { name: 'first anchor', input: { targetPosition: [-16, 0, 16], securedAnchors: 1, bridgedSpans: 0, triagedStretchers: 0, staminaRatio: 0.82, frame: 8 } },
  { name: 'bridge forming', input: { targetPosition: [-4, 0, 7], securedAnchors: 2, bridgedSpans: 1, triagedStretchers: 0, movementWishWorld: [1, 0, -0.5], staminaRatio: 0.74, frame: 16 } },
  { name: 'wind stress', input: { targetPosition: [8, 1, -4], securedAnchors: 2, bridgedSpans: 1, triagedStretchers: 1, yVel: -12, orbitYawOffset: 1.1, grounded: false, frame: 24 } },
  { name: 'tarp access', input: { targetPosition: [2, 0, -2], securedAnchors: 2, bridgedSpans: 2, triagedStretchers: 1, staminaRatio: 0.88, grounded: true, frame: 32 } },
  { name: 'almost secured', input: { targetPosition: [15, 0, -11], securedAnchors: 3, bridgedSpans: 2, triagedStretchers: 2, staminaRatio: 0.94, colliderCount: 8, frame: 40 } },
  { name: 'fully secured', input: { targetPosition: [20, 0, -17], securedAnchors: 4, bridgedSpans: 3, triagedStretchers: 3, staminaRatio: 1, colliderCount: 9, grounded: true, frame: 48 } },
  { name: 'bad numeric input', input: { targetPosition: ['bad', null, undefined], securedAnchors: '3', bridgedSpans: '2', triagedStretchers: '1', staminaRatio: '0.5', yVel: 'oops', frame: '64' } },
  { name: 'overspecified progress clamps', input: { targetPosition: [30, 0, -30], securedAnchors: 99, bridgedSpans: 99, triagedStretchers: 99, staminaRatio: 2, orbitYawOffset: 5, frame: 72 } }
];

let coldReadiness = 0;
let matureReadiness = 0;
for (const testCase of cases) {
  const description = kit.describe(testCase.input);
  const handoff = description.rendererHandoff;
  const summary = description.summary;
  assert.equal(handoff.policy, 'renderer-consumes-descriptors-only', testCase.name);
  assert.equal(handoff.counts.anchorBoltClusters, 4, testCase.name);
  assert.equal(handoff.counts.ropeBridgeSpans, 3, testCase.name);
  assert.ok(handoff.counts.stretcherRouteMarkers >= 5, testCase.name);
  assert.equal(handoff.counts.triageTarps, 3, testCase.name);
  assert.equal(handoff.counts.windSockHazards, 4, testCase.name);
  assert.equal(handoff.counts.duskEvacuationLedgers, 1, testCase.name);
  assert.ok(summary.readiness >= 0 && summary.readiness <= 1, testCase.name);
  assert.ok(summary.fallRisk >= 0 && summary.fallRisk <= 1, testCase.name);
  assert.ok(['rooftop-rescue-secured', 'rooftop-rescue-forming', 'rooftop-rescue-at-risk'].includes(summary.state), testCase.name);
  assert.doesNotThrow(() => JSON.stringify(handoff), testCase.name);
  if (testCase.name === 'cold start') coldReadiness = summary.readiness;
  if (testCase.name === 'fully secured') matureReadiness = summary.readiness;
}

assert.ok(matureReadiness > coldReadiness, 'fully secured route should improve readiness over cold start');
console.log(`Third Person rooftop rope rescue readiness kits smoke passed ${cases.length} intake cases.`);
