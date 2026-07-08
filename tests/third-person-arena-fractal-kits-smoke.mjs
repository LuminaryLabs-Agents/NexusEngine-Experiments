import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createThirdPersonArenaFractalDomainKit } from '../experiments/ThirdPersonFollowThrough/kits/third-person-arena-fractal-domain-kit.js';

const kit = createThirdPersonArenaFractalDomainKit();

const cases = [
  { label: 'idle neutral', targetPosition: [0, 0, 8], headWorld: [0, 1.6, 8], cameraPosition: [0, 3.2, 15], movementWishWorld: [0, 0, 0], movementBasisForwardWorld: [0, 0, -1], actorForwardWorld: [0, 0, -1], grounded: true, colliderCount: 6, rigBoneNames: ['root', 'pelvis', 'chest', 'head'], rigJointCount: 14, debugRayCount: 3 },
  { label: 'forward movement', targetPosition: [1.2, 0, 5.4], headWorld: [1.2, 1.62, 5.4], movementWishWorld: [0, 0, -1], movementBasisForwardWorld: [0, 0, -1], actorForwardWorld: [0, 0, -1], grounded: true, colliderCount: 6 },
  { label: 'strafe right', targetPosition: [4, 0, 4], headWorld: [4, 1.6, 4], movementWishWorld: [1, 0, 0], movementBasisForwardWorld: [0, 0, -1], actorForwardWorld: [0.4, 0, -0.91], grounded: true, colliderCount: 6 },
  { label: 'backpedal preserve facing', targetPosition: [-2, 0, 3], headWorld: [-2, 1.6, 3], movementWishWorld: [0, 0, 1], movementBasisForwardWorld: [0, 0, -1], actorForwardWorld: [0, 0, -1], grounded: true, colliderCount: 6 },
  { label: 'left orbit handoff', targetPosition: [0, 0, -2], headWorld: [0, 1.6, -2], orbitYawOffsetDeg: -73, handoffAlpha: 0.82, movementWishWorld: [-0.6, 0, -0.6], movementBasisForwardWorld: [-0.7, 0, -0.7], actorForwardWorld: [-0.3, 0, -0.95], colliderCount: 6 },
  { label: 'right orbit handoff', targetPosition: [2, 0, -3], headWorld: [2, 1.7, -3], orbitYawOffsetDeg: 68, handoffAlpha: 0.76, movementWishWorld: [0.6, 0, -0.4], movementBasisForwardWorld: [0.7, 0, -0.7], actorForwardWorld: [0.2, 0, -0.98], colliderCount: 6 },
  { label: 'jump arc', targetPosition: [3, 1.1, 1], headWorld: [3, 2.7, 1], movementWishWorld: [0.2, 0, -0.8], movementBasisForwardWorld: [0, 0, -1], actorForwardWorld: [0.1, 0, -0.99], grounded: false, colliderCount: 6 },
  { label: 'near obstacle', targetPosition: [13.3, 0, 8.6], headWorld: [13.3, 1.6, 8.6], movementWishWorld: [0, 0, -0.4], movementBasisForwardWorld: [0, 0, -1], actorForwardWorld: [0, 0, -1], colliderCount: 6 },
  { label: 'debug hidden', targetPosition: [-12.5, 0, 6.6], headWorld: [-12.5, 1.6, 6.6], movementWishWorld: [-0.2, 0, 0.7], movementBasisForwardWorld: [0, 0, 1], actorForwardWorld: [0, 0, 1], debugVisible: false, colliderCount: 6 },
  { label: 'sparse snapshot fallback', targetPosition: [0, 0, 0] }
];

for (const intake of cases) {
  const description = kit.describe(intake);
  assert.equal(description.route, 'ThirdPersonFollowThrough', intake.label);
  assert.equal(description.rendererHandoff.counts.surfaceBands, 6, intake.label);
  assert.equal(description.rendererHandoff.counts.movementTrails, 8, intake.label);
  assert.equal(description.rendererHandoff.counts.cameraHandoffArcs, 5, intake.label);
  assert.equal(description.rendererHandoff.counts.colliderHalos, 6, intake.label);
  assert.equal(description.rendererHandoff.counts.rigMetricSpine, 4, intake.label);
  assert.ok(description.rendererHandoff.counts.trainingCues >= 1, intake.label);
  assert.ok(description.rendererHandoff.rendererMustNotOwn.includes('browser input'), intake.label);
  assert.doesNotThrow(() => JSON.stringify(description), intake.label);
  const snapshot = kit.snapshot(intake);
  assert.ok(snapshot.totalDescriptors >= 30, intake.label);
}

const source = fs.readFileSync(new URL('../experiments/ThirdPersonFollowThrough/kits/third-person-arena-fractal-domain-kit.js', import.meta.url), 'utf8');
for (const forbidden of ['document.', 'window.', 'THREE.', 'WebGLRenderer', 'AudioContext', 'requestAnimationFrame']) {
  assert.equal(source.includes(forbidden), false, `renderer-neutral kit must not contain ${forbidden}`);
}

console.log('third-person-arena-fractal-kits-smoke: 10 intake cases passed');
