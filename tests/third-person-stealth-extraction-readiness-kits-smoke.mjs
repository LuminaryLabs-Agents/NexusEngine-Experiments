import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createThirdPersonPatrolSightConeKit,
  createThirdPersonNoiseTracePulseKit,
  createThirdPersonCoverIslandShadowKit,
  createThirdPersonExtractionBreadcrumbKit,
  createThirdPersonStaminaDebtMeterKit,
  createThirdPersonExtractionCommitBadgeKit,
  createThirdPersonStealthExtractionReadinessDomainKit,
  THIRD_PERSON_STEALTH_EXTRACTION_READINESS_TREE
} from "../experiments/ThirdPersonFollowThrough/kits/third-person-stealth-extraction-readiness-domain-kit.js";

const kitSource = readFileSync("experiments/ThirdPersonFollowThrough/kits/third-person-stealth-extraction-readiness-domain-kit.js", "utf8");

assert.match(THIRD_PERSON_STEALTH_EXTRACTION_READINESS_TREE, /third-person-stealth-extraction-readiness-domain/, "tree should name the stealth extraction domain");
assert.match(THIRD_PERSON_STEALTH_EXTRACTION_READINESS_TREE, /renderer consumes descriptors only/, "tree should keep renderer handoff descriptor-only");

const patrolKit = createThirdPersonPatrolSightConeKit();
const noiseKit = createThirdPersonNoiseTracePulseKit();
const coverKit = createThirdPersonCoverIslandShadowKit();
const breadcrumbKit = createThirdPersonExtractionBreadcrumbKit();
const staminaKit = createThirdPersonStaminaDebtMeterKit();
const badgeKit = createThirdPersonExtractionCommitBadgeKit();
const domain = createThirdPersonStealthExtractionReadinessDomainKit();

function makeSnapshot(index) {
  return {
    frame: index * 19,
    targetPosition: [Math.sin(index * 0.7) * 14, index % 3 === 0 ? 0.4 : 0, 12 - index * 3.2],
    cameraPosition: [Math.sin(index * 0.4) * 7, 3.1, 18 - index],
    actorForwardWorld: [index % 2 ? 0.45 : -0.3, 0, -1],
    movementWishWorld: [index % 2 ? 0.82 : -0.64, 0, index % 3 === 0 ? -0.2 : -0.78],
    rootYawDeg: -45 + index * 14,
    colliderCount: 6 - (index % 3),
    grounded: index % 4 !== 2,
    yVel: index % 4 === 2 ? -3.4 - index : 0.2,
    staminaRatio: Math.max(0.16, 1 - index * 0.075)
  };
}

for (let index = 0; index < 10; index += 1) {
  const snapshot = makeSnapshot(index);
  const patrols = patrolKit.describe(snapshot);
  const noise = noiseKit.describe(snapshot);
  const covers = coverKit.describe(snapshot);
  const breadcrumbs = breadcrumbKit.describe(snapshot);
  const stamina = staminaKit.describe(snapshot);
  const badges = badgeKit.describe(snapshot);
  const output = domain.describe(snapshot);

  assert.equal(patrols.length, 3, `case ${index}: patrol sight cones should be stable`);
  assert.ok(noise.length >= 1 && noise.length <= 3, `case ${index}: noise pulses should stay bounded`);
  assert.equal(covers.length, 4, `case ${index}: cover shadows should be stable`);
  assert.equal(breadcrumbs.length, 4, `case ${index}: extraction breadcrumbs should be stable`);
  assert.equal(stamina.length, 5, `case ${index}: stamina debt meters should be stable`);
  assert.equal(badges.length, 1, `case ${index}: extraction badge should be singular`);
  assert.equal(output.rendererHandoff.policy, "renderer-consumes-descriptors-only", `case ${index}: handoff policy should be descriptor-only`);
  assert.equal(output.summary.descriptorCount, output.rendererHandoff.descriptorCount, `case ${index}: summary count should mirror handoff count`);
  assert.ok(output.summary.nextBreadcrumb, `case ${index}: next breadcrumb should be named`);
  assert.ok(output.rendererHandoff.descriptors.patrolSightCones.every((cone) => cone.kind === "patrol-sight-cone"), `case ${index}: patrol descriptors should be typed`);
  assert.doesNotThrow(() => JSON.stringify(output), `case ${index}: output should be JSON serializable`);
}

for (const required of [
  "third-person-patrol-sight-cone-kit",
  "third-person-noise-trace-pulse-kit",
  "third-person-cover-island-shadow-kit",
  "third-person-extraction-breadcrumb-kit",
  "third-person-stamina-debt-meter-kit",
  "third-person-extraction-commit-badge-kit",
  "third-person-stealth-extraction-renderer-handoff-kit",
  "third-person-stealth-extraction-readiness-domain-kit"
]) {
  assert.ok(kitSource.includes(required), `kit source should include ${required}`);
}

const forbiddenKitOwnership = /from\s+["'].*three|document\.|window\.|addEventListener\(|requestAnimationFrame|AudioContext|WebGLRenderer|new\s+THREE|createRenderer\(/;
assert.doesNotMatch(kitSource, forbiddenKitOwnership, "stealth extraction kits must stay renderer-neutral");

console.log("Third person stealth extraction readiness kit smoke passed.");
