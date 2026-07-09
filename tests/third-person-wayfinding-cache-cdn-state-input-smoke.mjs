import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createThirdPersonWayfindingCacheReadinessDomainKit } from '../experiments/ThirdPersonFollowThrough/kits/third-person-wayfinding-cache-readiness-domain-kit.js';

const html = readFileSync(new URL('../experiments/ThirdPersonFollowThrough/index.html', import.meta.url), 'utf8');
const appIndex = readFileSync(new URL('../experiments/ThirdPersonFollowThrough/app/index.js', import.meta.url), 'utf8');
const entry = readFileSync(new URL('../experiments/ThirdPersonFollowThrough/app/wayfinding-cache-readiness-entry.js', import.meta.url), 'utf8');
const kitSource = readFileSync(new URL('../experiments/ThirdPersonFollowThrough/kits/third-person-wayfinding-cache-readiness-domain-kit.js', import.meta.url), 'utf8');
const nexusCdn = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';

assert.ok(html.includes('wayfinding-cache-readiness-renderer-handoff-pass'));
assert.ok(html.includes('Wayfinding Cache: ON'));
assert.ok(html.includes('app/index.js?v=wayfinding-cache-readiness-v1'));
assert.ok(appIndex.includes("./wayfinding-cache-readiness-entry.js?v=wayfinding-cache-readiness-v1"));
assert.ok(entry.includes(nexusCdn));
assert.equal(entry.includes('NexusRealtime@main'), false);
assert.equal(entry.includes('LuminaryLabs-Dev/NexusRealtime@main'), false);
for (const marker of [
  'getWayfindingCacheReadiness',
  'getThirdPersonWayfindingCacheReadiness',
  'getWayfindingCacheReadinessTree',
  'applyWayfindingCacheInput',
  'getRendererHandoff',
  'third-person-wayfinding-cache-readiness-domain'
]) {
  assert.ok(entry.includes(marker), marker);
}
for (const forbidden of ['document.', 'window.', 'requestAnimationFrame', 'new Audio', 'THREE.', 'canvas.getContext']) {
  assert.equal(kitSource.includes(forbidden), false, `reusable kit must not own ${forbidden}`);
}

const kit = createThirdPersonWayfindingCacheReadinessDomainKit();
let state = {
  targetPosition: [0, 0, 8],
  cameraPosition: [0, 3.2, 15],
  actorForwardWorld: [0, 0, -1],
  movementWishWorld: [0, 0, -1],
  colliderCount: 6,
  grounded: true,
  staminaRatio: 1,
  frame: 0,
  discoveredCaches: 0,
  carriedMedkits: 0
};
const inputs = [
  { action: 'move', dx: -2, dz: -1 },
  { action: 'discover-cache' },
  { action: 'move', dx: -4, dz: -2 },
  { action: 'collect-medkit' },
  { action: 'jump', yVel: 4.5 },
  { action: 'land' },
  { action: 'discover-cache' },
  { action: 'move', dx: 7, dz: -7 },
  { action: 'discover-cache' },
  { action: 'collect-medkit' }
];
const readiness = [];
for (const [index, input] of inputs.entries()) {
  if (input.action === 'move') {
    state = { ...state, targetPosition: [state.targetPosition[0] + input.dx, 0, state.targetPosition[2] + input.dz], movementWishWorld: [Math.sign(input.dx), 0, Math.sign(input.dz)], frame: state.frame + 12 };
  }
  if (input.action === 'discover-cache') state = { ...state, discoveredCaches: Math.min(4, state.discoveredCaches + 1), frame: state.frame + 8 };
  if (input.action === 'collect-medkit') state = { ...state, carriedMedkits: Math.min(4, state.carriedMedkits + 1), frame: state.frame + 8 };
  if (input.action === 'jump') state = { ...state, grounded: false, yVel: input.yVel, frame: state.frame + 5 };
  if (input.action === 'land') state = { ...state, grounded: true, yVel: 0, frame: state.frame + 6 };
  const description = kit.describe(state);
  readiness.push(description.summary.readiness);
  assert.equal(description.rendererHandoff.policy, 'renderer-consumes-descriptors-only', `case ${index}`);
  assert.ok(description.rendererHandoff.descriptors.chalkArrowMarks.length >= 4, `case ${index}`);
  assert.ok(description.rendererHandoff.descriptors.safeStepTiles.length >= 5, `case ${index}`);
  assert.doesNotThrow(() => JSON.stringify(description), `case ${index}`);
}
assert.ok(readiness.at(-1) > readiness[0], `final readiness ${readiness.at(-1)} should exceed first ${readiness[0]}`);

console.log('Third Person wayfinding cache CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.');
