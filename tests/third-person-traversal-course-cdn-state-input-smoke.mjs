import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createThirdPersonTraversalCourseReadinessDomainKit } from '../experiments/ThirdPersonFollowThrough/kits/third-person-traversal-course-readiness-domain-kit.js';

const CDN = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
const html = readFileSync(new URL('../experiments/ThirdPersonFollowThrough/index.html', import.meta.url), 'utf8');
const appIndex = readFileSync(new URL('../experiments/ThirdPersonFollowThrough/app/index.js', import.meta.url), 'utf8');
const entry = readFileSync(new URL('../experiments/ThirdPersonFollowThrough/app/traversal-course-readiness-entry.js', import.meta.url), 'utf8');
const kitSource = readFileSync(new URL('../experiments/ThirdPersonFollowThrough/kits/third-person-traversal-course-readiness-domain-kit.js', import.meta.url), 'utf8');

assert.ok(html.includes('traversal-course-readiness-renderer-handoff-pass'), 'route marker missing');
assert.ok(appIndex.includes("./traversal-course-readiness-entry.js?v=rooftop-rope-rescue-readiness-v1"), 'entry import missing from the current cache-keyed composition');
assert.ok(entry.includes(CDN), 'NexusEngine main CDN import missing');
assert.ok(!entry.includes('NexusRealtime@'), 'changed entry must not import old NexusRealtime runtime');
assert.ok(entry.includes('globalThis.GameHost'), 'GameHost surface missing');
assert.ok(entry.includes('getRendererHandoff'), 'renderer handoff accessor missing');
assert.ok(!/document\.|window\.|requestAnimationFrame|THREE\.|new Audio|fetch\(/.test(kitSource), 'reusable kit owns browser or renderer work');

const domainKit = createThirdPersonTraversalCourseReadinessDomainKit();
const inputSteps = [
  { targetPosition: [-16, 0, 14], movementWishWorld: [0.2, 0, -0.4], grounded: true, staminaRatio: 1, frame: 1 },
  { targetPosition: [-12, 0, 10], movementWishWorld: [0.4, 0, -0.5], grounded: true, staminaRatio: 0.94, frame: 2 },
  { targetPosition: [-7, 0, 4], movementWishWorld: [0.5, 0, -0.5], grounded: true, staminaRatio: 0.82, orbitYawOffset: 0.4, frame: 3 },
  { targetPosition: [-1, 0, 0], movementWishWorld: [0.7, 0, -0.5], grounded: true, staminaRatio: 0.76, frame: 4 },
  { targetPosition: [5, 1, -3], movementWishWorld: [0.8, 0, -0.4], grounded: false, yVel: 4.2, staminaRatio: 0.64, jumpCount: 1, frame: 5 },
  { targetPosition: [8, 0, -5], movementWishWorld: [0.5, 0, -0.5], grounded: true, staminaRatio: 0.58, frame: 6 },
  { targetPosition: [12, 0, -8], movementWishWorld: [0.3, 0, -0.6], grounded: true, staminaRatio: 0.52, frame: 7 },
  { targetPosition: [15, 0, -13], movementWishWorld: [0.1, 0, -0.2], grounded: true, staminaRatio: 0.45, frame: 8 },
  { targetPosition: [18, 0, -4], movementWishWorld: [-0.4, 0, 0.2], grounded: true, staminaRatio: 0.62, frame: 9 },
  { targetPosition: [0, 0, -18], movementWishWorld: [0, 0, 0], grounded: true, staminaRatio: 0.31, jumpCount: 4, frame: 10 }
];

for (const [index, step] of inputSteps.entries()) {
  const result = domainKit.describe(step);
  assert.equal(result.rendererHandoff.domain, 'third-person-traversal-course-readiness-domain', `case ${index}`);
  assert.ok(result.rendererHandoff.descriptorCount >= 10, `case ${index}`);
  assert.ok(result.summary.courseReadiness >= 0 && result.summary.courseReadiness <= 1, `case ${index}`);
}

const composed = {
  id: 'playwright-style-local-simulation',
  inputCases: inputSteps.length,
  nexusEngineCdn: CDN,
  rendererConsumes: 'descriptors-only',
  final: domainKit.describe(inputSteps.at(-1)).summary
};

assert.equal(composed.inputCases, 10);
assert.ok(composed.final.courseReadiness >= 0 && composed.final.courseReadiness <= 1);

console.log('Third Person traversal course CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.');
