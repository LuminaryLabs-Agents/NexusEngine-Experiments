import "./third-person-stealth-extraction-readiness-kits-smoke.mjs";
import "./third-person-medevac-readiness-kits-smoke.mjs";
import "./third-person-medevac-cdn-state-input-smoke.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createThirdPersonStealthExtractionReadinessDomainKit } from "../experiments/ThirdPersonFollowThrough/kits/third-person-stealth-extraction-readiness-domain-kit.js";

const routeShell = readFileSync("experiments/ThirdPersonFollowThrough/index.html", "utf8");
const appEntry = readFileSync("experiments/ThirdPersonFollowThrough/app/index.js", "utf8");
const entrySource = readFileSync("experiments/ThirdPersonFollowThrough/app/stealth-extraction-readiness-entry.js", "utf8");
const kitSource = readFileSync("experiments/ThirdPersonFollowThrough/kits/third-person-stealth-extraction-readiness-domain-kit.js", "utf8");
const checksSource = readFileSync("scripts/run-checks.mjs", "utf8");
const manifestSource = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const oldRuntimeCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";

assert.ok(entrySource.includes(nexusEngineCdn), "stealth extraction entry should import NexusEngine main through the CDN");
assert.doesNotMatch(entrySource, new RegExp(oldRuntimeCdn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "changed stealth extraction entry must not import old NexusRealtime runtime CDN");
assert.match(routeShell, /stealth-extraction-readiness-renderer-handoff-pass/, "route shell should identify the stealth extraction readiness pass");
assert.match(routeShell, /app\/index\.js\?v=rooftop-rope-rescue-readiness-v1/, "route shell should use the current cache key");
assert.match(appEntry, /stealth-extraction-readiness-entry\.js\?v=rooftop-rope-rescue-readiness-v1/, "app entry should load the stealth extraction overlay through the current cache key");
assert.match(entrySource, /getStealthExtractionReadiness/, "GameHost should expose stealth extraction state");
assert.match(entrySource, /getThirdPersonStealthExtractionReadiness/, "GameHost should expose route-scoped stealth extraction accessor");
assert.match(entrySource, /stealthExtraction.*rendererHandoff/s, "composed renderer handoff should include stealth extraction descriptors");
assert.match(entrySource, /dataset\.thirdPersonStealthExtraction/, "entry should expose a runtime marker for Playwright-style checks");
assert.match(manifestSource, /third-person-stealth-extraction-readiness-domain-kit/, "manifest should register the stealth extraction domain kit");
assert.match(checksSource, /third-person-stealth-extraction-readiness-kits-smoke\.mjs/, "full/deploy checks should include stealth extraction kit smoke");
assert.match(checksSource, /third-person-stealth-extraction-cdn-state-input-smoke\.mjs/, "full/deploy checks should include stealth extraction CDN smoke");

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
  assert.ok(kitSource.includes(required), `stealth extraction surface should include ${required}`);
}

function makeSnapshot(index) {
  return {
    frame: index * 23,
    targetPosition: [Math.cos(index * 0.45) * 16, index % 5 === 0 ? 0.7 : 0, 15 - index * 3.8],
    cameraPosition: [2 + index, 3.4, 18 - index * 0.6],
    actorForwardWorld: [Math.sin(index * 0.3), 0, -1],
    movementWishWorld: [index % 2 ? 0.75 : -0.55, 0, index % 3 === 1 ? -0.1 : -0.86],
    rootYawDeg: index * 21 - 60,
    colliderCount: 5 + (index % 2),
    grounded: index % 4 !== 1,
    yVel: index % 4 === 1 ? -5.4 : 0,
    staminaRatio: Math.max(0.18, 0.92 - index * 0.07)
  };
}

const domain = createThirdPersonStealthExtractionReadinessDomainKit();
for (let index = 0; index < 10; index += 1) {
  const output = domain.describe(makeSnapshot(index));
  assert.equal(output.patrolSightCones.length, 3, `case ${index}: patrol cones should exist`);
  assert.ok(output.noiseTracePulses.length >= 1, `case ${index}: noise pulse should exist`);
  assert.equal(output.coverIslandShadows.length, 4, `case ${index}: cover shadows should exist`);
  assert.equal(output.extractionBreadcrumbs.length, 4, `case ${index}: breadcrumbs should exist`);
  assert.equal(output.staminaDebtMeters.length, 5, `case ${index}: stamina meters should exist`);
  assert.equal(output.extractionCommitBadges.length, 1, `case ${index}: extraction badge should exist`);
  assert.equal(output.summary.descriptorCount, output.rendererHandoff.descriptorCount, `case ${index}: summary and handoff counts should match`);
}

const forbiddenKitOwnership = /from\s+["'].*three|document\.|window\.|addEventListener\(|requestAnimationFrame|AudioContext|WebGLRenderer|new\s+THREE|createRenderer\(/;
assert.doesNotMatch(kitSource, forbiddenKitOwnership, "stealth extraction kits must remain renderer-neutral");

console.log("Third person stealth extraction CDN/state/input smoke passed.");
