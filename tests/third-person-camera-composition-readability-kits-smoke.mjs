import './third-person-navigation-challenge-readiness-kits-smoke.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  THIRD_PERSON_CAMERA_COMPOSITION_READABILITY_TREE,
  createThirdPersonFocusTargetRibbonKit,
  createThirdPersonShoulderClearanceWedgeKit,
  createThirdPersonNearClipCushionKit,
  createThirdPersonOrbitIntentRailKit,
  createThirdPersonOcclusionRiskVeilKit,
  createThirdPersonCameraComfortMeterKit,
  createThirdPersonCameraCompositionRendererHandoffKit,
  createThirdPersonCameraCompositionReadabilityDomainKit
} from '../experiments/ThirdPersonFollowThrough/kits/third-person-camera-composition-readability-domain-kit.js';

const cases = [
  { label: 'idle neutral framing', targetPosition: [0, 0, 8], headWorld: [0, 1.6, 8], cameraPosition: [0, 3.2, 15], cameraPivotWorld: [0, 1.45, 8], lookAheadWorld: [0, 1.6, 5.6], cameraForwardWorld: [0, 0, -1], movementWishWorld: [0, 0, 0], orbitYawOffsetDeg: 0, handoffAlpha: 0, grounded: true },
  { label: 'forward focus run', targetPosition: [0.6, 0, 6.5], headWorld: [0.6, 1.6, 6.5], cameraPosition: [0.4, 3.2, 13.1], cameraPivotWorld: [0.6, 1.45, 6.5], lookAheadWorld: [0.6, 1.6, 3.9], cameraForwardWorld: [0, -0.18, -1], movementWishWorld: [0, 0, -1], orbitYawOffsetDeg: 0, handoffAlpha: 0.08, grounded: true },
  { label: 'left shoulder orbit', targetPosition: [-1.5, 0, 6], headWorld: [-1.5, 1.6, 6], cameraPosition: [-5.2, 3.2, 11.8], cameraPivotWorld: [-1.5, 1.45, 6], lookAheadWorld: [-2.9, 1.6, 4], cameraForwardWorld: [0.62, -0.16, -0.78], movementWishWorld: [-1, 0, 0], orbitYawOffsetDeg: -58, handoffAlpha: 0.42, grounded: true },
  { label: 'right shoulder orbit', targetPosition: [2, 0, 5], headWorld: [2, 1.6, 5], cameraPosition: [5.9, 3.2, 10.7], cameraPivotWorld: [2, 1.45, 5], lookAheadWorld: [3.6, 1.6, 3.2], cameraForwardWorld: [-0.62, -0.16, -0.78], movementWishWorld: [1, 0, 0], orbitYawOffsetDeg: 62, handoffAlpha: 0.48, grounded: true },
  { label: 'backpedal close frame', targetPosition: [0, 0, 9.2], headWorld: [0, 1.6, 9.2], cameraPosition: [0, 2.9, 13.1], cameraPivotWorld: [0, 1.45, 9.2], lookAheadWorld: [0, 1.6, 7.2], cameraForwardWorld: [0, -0.12, -1], movementWishWorld: [0, 0, 1], orbitYawOffsetDeg: 0, handoffAlpha: 0.14, grounded: true },
  { label: 'jump rising high pitch', targetPosition: [1, 1.1, 7.5], headWorld: [1, 2.7, 7.5], cameraPosition: [1, 3.9, 13.4], cameraPivotWorld: [1, 2.45, 7.5], lookAheadWorld: [1.4, 2.6, 5.1], cameraForwardWorld: [0.07, -0.32, -0.94], movementWishWorld: [0.2, 0, -0.8], orbitYawOffsetDeg: 8, handoffAlpha: 0.12, grounded: false, yVel: 4.8, cameraPitch: 0.62 },
  { label: 'jump falling occluder', targetPosition: [7, 1.5, -8.8], headWorld: [7, 3.1, -8.8], cameraPosition: [7.2, 4.1, -2.9], cameraPivotWorld: [7, 2.5, -8.8], lookAheadWorld: [7.4, 2.7, -11.2], cameraForwardWorld: [0.05, -0.26, -0.96], movementWishWorld: [0.4, 0, -0.7], orbitYawOffsetDeg: 20, handoffAlpha: 0.24, grounded: false, yVel: -5.2, cameraPitch: 0.54 },
  { label: 'left handoff occluded', targetPosition: [-8.4, 0, -7.8], headWorld: [-8.4, 1.6, -7.8], cameraPosition: [-13.4, 3.2, -2.2], cameraPivotWorld: [-8.4, 1.45, -7.8], lookAheadWorld: [-10.2, 1.6, -9.4], cameraForwardWorld: [0.68, -0.18, -0.72], movementWishWorld: [-0.5, 0, -0.6], orbitYawOffsetDeg: -76, handoffAlpha: 0.8, grounded: true },
  { label: 'right handoff near pillar', targetPosition: [13.4, 0, 4.2], headWorld: [13.4, 1.6, 4.2], cameraPosition: [17.8, 3.2, 9.4], cameraPivotWorld: [13.4, 1.45, 4.2], lookAheadWorld: [15, 1.6, 2.1], cameraForwardWorld: [-0.65, -0.16, -0.76], movementWishWorld: [0.5, 0, -0.5], orbitYawOffsetDeg: 72, handoffAlpha: 0.74, grounded: true },
  { label: 'very close collision camera', targetPosition: [13.2, 0.4, 8.8], headWorld: [13.2, 2.0, 8.8], cameraPosition: [13.4, 2.3, 11.6], cameraPivotWorld: [13.2, 1.75, 8.8], lookAheadWorld: [13.2, 1.9, 6.2], cameraForwardWorld: [0, -0.12, -1], movementWishWorld: [0, 0, -0.4], orbitYawOffsetDeg: 0, handoffAlpha: 0.2, grounded: false, yVel: -3.4, cameraPitch: 0.12 }
];

assert.ok(THIRD_PERSON_CAMERA_COMPOSITION_READABILITY_TREE.includes('renderer consumes descriptors only'));

const focusKit = createThirdPersonFocusTargetRibbonKit();
const shoulderKit = createThirdPersonShoulderClearanceWedgeKit();
const cushionKit = createThirdPersonNearClipCushionKit();
const orbitKit = createThirdPersonOrbitIntentRailKit();
const occlusionKit = createThirdPersonOcclusionRiskVeilKit();
const comfortKit = createThirdPersonCameraComfortMeterKit();
const handoffKit = createThirdPersonCameraCompositionRendererHandoffKit();
const domainKit = createThirdPersonCameraCompositionReadabilityDomainKit();

for (const intake of cases) {
  assert.equal(focusKit.describe(intake).length, 4, intake.label);
  assert.equal(shoulderKit.describe(intake).length, 4, intake.label);
  assert.equal(cushionKit.describe(intake).length, 5, intake.label);
  assert.equal(orbitKit.describe(intake).length, 6, intake.label);
  assert.equal(occlusionKit.describe(intake).length, 6, intake.label);
  assert.equal(comfortKit.describe(intake).length, 5, intake.label);

  const description = domainKit.describe(intake);
  assert.equal(description.route, 'ThirdPersonFollowThrough', intake.label);
  assert.equal(description.counts.focusTargetRibbons, 4, intake.label);
  assert.equal(description.counts.shoulderClearanceWedges, 4, intake.label);
  assert.equal(description.counts.nearClipCushions, 5, intake.label);
  assert.equal(description.counts.orbitIntentRails, 6, intake.label);
  assert.equal(description.counts.occlusionRiskVeils, 6, intake.label);
  assert.equal(description.counts.cameraComfortMeters, 5, intake.label);
  assert.equal(description.rendererHandoff.policy, 'renderer-consumes-descriptors-only', intake.label);
  assert.ok(description.rendererHandoff.rendererMustNotOwn.includes('browser input'), intake.label);
  assert.doesNotThrow(() => JSON.stringify(description), intake.label);

  const handoff = handoffKit.describe(description.descriptors);
  assert.equal(handoff.counts.occlusionRiskVeils, 6, intake.label);
  assert.ok(handoff.rendererConsumes.includes('cameraComfortMeters'), intake.label);
  assert.ok(domainKit.snapshot(intake).totalDescriptors >= 30, intake.label);
}

const closeCamera = domainKit.describe(cases[9]);
assert.ok(closeCamera.descriptors.nearClipCushions.some((cushion) => cushion.state !== 'clear'), 'close camera case should activate near-clip cushions');

const hardOrbit = domainKit.describe(cases[7]);
assert.ok(hardOrbit.descriptors.orbitIntentRails.some((rail) => rail.orbitLoad > 0.7), 'large orbit case should activate orbit rails');

const source = fs.readFileSync(new URL('../experiments/ThirdPersonFollowThrough/kits/third-person-camera-composition-readability-domain-kit.js', import.meta.url), 'utf8');
for (const forbidden of ['document.', 'window.', 'THREE.', 'WebGLRenderer', 'AudioContext', 'requestAnimationFrame']) {
  assert.equal(source.includes(forbidden), false, `renderer-neutral kit must not contain ${forbidden}`);
}

console.log('third-person-camera-composition-readability-kits-smoke: 10 intake cases passed');
