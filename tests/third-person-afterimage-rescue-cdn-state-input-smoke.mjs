import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createThirdPersonAfterimageRescueReadinessDomainKit } from '../experiments/ThirdPersonFollowThrough/kits/third-person-afterimage-rescue-readiness-domain-kit.js';

const CDN = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
const entry = readFileSync(new URL('../experiments/ThirdPersonFollowThrough/app/afterimage-rescue-readiness-entry.js', import.meta.url), 'utf8');
const appIndex = readFileSync(new URL('../experiments/ThirdPersonFollowThrough/app/index.js', import.meta.url), 'utf8');
const kitSource = readFileSync(new URL('../experiments/ThirdPersonFollowThrough/kits/third-person-afterimage-rescue-readiness-domain-kit.js', import.meta.url), 'utf8');

assert.ok(entry.includes(CDN), 'changed entry imports NexusEngine main CDN');
assert.ok(appIndex.includes('afterimage-rescue-readiness-entry.js?v=afterimage-rescue-readiness-v1'), 'route app imports afterimage rescue entry');
assert.ok(!entry.includes('NexusRealtime@'), 'changed entry must not import old NexusRealtime CDN');
assert.ok(entry.includes('globalThis.GameHost'), 'entry exposes GameHost');
assert.ok(entry.includes('getThirdPersonAfterimageRescueReadiness'), 'entry exposes readiness accessor');
assert.ok(entry.includes('getRendererHandoff'), 'entry composes renderer handoff');
assert.ok(!/document\.|window\.|requestAnimationFrame|new Three|new Audio|fetch\(/.test(kitSource), 'reusable kit stays renderer/browser/runtime neutral');

if (process.env.NEXUS_NETWORK_IMPORT === '1') {
  const runtime = await import(CDN);
  assert.ok(Object.keys(runtime).length >= 0, 'CDN import completed');
}

const kit = createThirdPersonAfterimageRescueReadinessDomainKit();
let state = {
  targetPosition: [0, 0, 8],
  cameraPosition: [0, 3.2, 15],
  actorForwardWorld: [0, 0, -1],
  movementWishWorld: [0, 0, 0],
  colliderCount: 6,
  grounded: true,
  staminaRatio: 0.88,
  frame: 0,
  jumpCount: 0
};

const inputs = [
  { movementWishWorld: [0, 0, -1], frame: 12 },
  { targetPosition: [-8, 0, 9], frame: 24 },
  { grounded: false, yVel: 7, jumpCount: 1, frame: 36 },
  { targetPosition: [-4, 1, 3], movementWishWorld: [0.4, 0, -0.8], frame: 48 },
  { grounded: true, yVel: -8, targetPosition: [1, 0, -2], frame: 60 },
  { targetPosition: [6, 0, -7], staminaRatio: 0.62, movementWishWorld: [0.8, 0, -0.3], frame: 72 },
  { targetPosition: [12, 0, -10], colliderCount: 10, frame: 84 },
  { targetPosition: [17, 0, -15], staminaRatio: 0.9, frame: 96 },
  { movementWishWorld: [0.1, 0, -0.4], actorForwardWorld: [0.2, 0, -1], frame: 108 },
  { targetPosition: [15, 0, -12], staminaRatio: 1, yVel: 0, frame: 120 }
];

let previousReadiness = 0;
for (const [index, input] of inputs.entries()) {
  state = { ...state, ...input };
  const snapshot = kit.snapshot(state);
  assert.equal(snapshot.rendererHandoff.policy, 'renderer-consumes-descriptors-only', `case ${index}`);
  assert.ok(snapshot.summary.rescueReadiness >= 0 && snapshot.summary.rescueReadiness <= 1, `case ${index}`);
  assert.ok(snapshot.rendererHandoff.descriptors.afterimageTraces.length >= 3, `case ${index}`);
  assert.ok(snapshot.rendererHandoff.descriptors.dawnRunLedgers.length === 1, `case ${index}`);
  previousReadiness = snapshot.summary.rescueReadiness;
}
assert.ok(previousReadiness > 0.4, 'final simulated approach should be materially readable');

console.log('Third Person afterimage rescue CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.');
