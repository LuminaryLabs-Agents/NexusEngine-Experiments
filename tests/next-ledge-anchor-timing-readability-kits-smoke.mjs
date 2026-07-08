import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  NEXT_LEDGE_ANCHOR_TIMING_READABILITY_TREE,
  createAnchorReleaseTimingDialKit,
  createGrappleLineOfSightStripKit,
  createSwingEnergyPocketKit,
  createWallBounceWarningFieldKit,
  createRouteCommitmentStairKit,
  createFailFloorProximityWaveKit,
  createAnchorTimingRendererHandoffKit,
  createNextLedgeAnchorTimingReadabilityDomainKit
} from "../experiments/next-ledge/src/anchor-timing-readability-kits.js";

const source = readFileSync("experiments/next-ledge/src/anchor-timing-readability-kits.js", "utf8");
const forbiddenOwnership = /from\s+["'].*three|document\.|window\.|addEventListener\(|requestAnimationFrame|AudioContext|WebGLRenderer|new\s+THREE|createRenderer\(/;
assert.doesNotMatch(source, forbiddenOwnership, "anchor timing kits must stay renderer/browser/audio/frame-loop neutral");
assert.match(NEXT_LEDGE_ANCHOR_TIMING_READABILITY_TREE, /renderer consumes descriptors only/, "domain tree must document renderer-handoff boundary");

function makeSnapshot(index, patch = {}) {
  const mode = patch.mode ?? ["swinging", "falling", "launched", "retracting", "reeling"][index % 5];
  const sector = index + 3;
  const ledges = Array.from({ length: 10 + index }, (_, ledgeIndex) => ({
    id: `s${sector}-anchor-${ledgeIndex}`,
    label: ledgeIndex === 9 + index ? "Summit" : ledgeIndex % 4 === 2 ? `Rest ${ledgeIndex}` : `Anchor ${ledgeIndex}`,
    type: ledgeIndex === 9 + index ? "summit" : ledgeIndex % 4 === 2 ? "rest" : "normal",
    x: (ledgeIndex % 2 ? -1 : 1) * (44 + ledgeIndex * 12),
    y: ledgeIndex * 126 + index * 18,
    r: 8 + (ledgeIndex % 3)
  }));
  const currentIndex = Math.min(index + 1, ledges.length - 5);
  return {
    levelId: `next-ledge-sector-${sector}`,
    sector,
    frame: index * 37,
    mode,
    alive: true,
    completed: false,
    currentAnchorId: ledges[currentIndex].id,
    lastLedgeId: ledges[currentIndex].id,
    anchorLedge: ledges[currentIndex],
    aimAssistTargetId: ledges[currentIndex + 1].id,
    enabledTargetIds: ledges.slice(currentIndex + 1, currentIndex + 5).map((ledge) => ledge.id),
    stamina: Math.max(10, 115 - index * 8),
    maxHeight: ledges[currentIndex].y + 170,
    constants: { maxStamina: 115, maxCableLength: 176, scaffoldBoundary: 176, failFloorDistance: 520, gravity: 0.052 },
    tuning: { failFloorDistance: 520 },
    camera: { targetY: ledges[currentIndex].y + 95 },
    player: { x: index % 2 ? -82 - index * 7 : 82 + index * 7, y: ledges[currentIndex].y - 44, z: 1, vx: (index % 2 ? -1 : 1) * (5 + index), vy: mode === "falling" ? -12 - index : 4 + index, angle: -0.2 + index * 0.11 },
    route: { id: `route-${sector}`, label: `Route ${sector}`, ledges },
    recentEvents: []
  };
}

function makeCargoSnapshot(index) {
  return {
    pressure: {
      channels: [{ id: "fall-pressure", value: index * 7, status: index > 6 ? "warning" : "active" }],
      channelsById: { "fall-pressure": { id: "fall-pressure", value: index * 7, status: index > 6 ? "warning" : "active" } }
    }
  };
}

const kits = {
  release: createAnchorReleaseTimingDialKit(),
  los: createGrappleLineOfSightStripKit(),
  energy: createSwingEnergyPocketKit(),
  wall: createWallBounceWarningFieldKit(),
  commitment: createRouteCommitmentStairKit(),
  floor: createFailFloorProximityWaveKit(),
  handoff: createAnchorTimingRendererHandoffKit(),
  domain: createNextLedgeAnchorTimingReadabilityDomainKit()
};

for (let index = 0; index < 10; index += 1) {
  const snapshot = makeSnapshot(index);
  const cargoSnapshot = makeCargoSnapshot(index);
  const releaseTimingDials = kits.release.describe(snapshot, cargoSnapshot);
  const grappleLineOfSightStrips = kits.los.describe(snapshot, cargoSnapshot);
  const swingEnergyPockets = kits.energy.describe(snapshot, cargoSnapshot);
  const wallBounceWarningFields = kits.wall.describe(snapshot, cargoSnapshot);
  const routeCommitmentStairs = kits.commitment.describe(snapshot, cargoSnapshot);
  const failFloorProximityWaves = kits.floor.describe(snapshot, cargoSnapshot);
  const handoff = kits.handoff.describe({ releaseTimingDials, grappleLineOfSightStrips, swingEnergyPockets, wallBounceWarningFields, routeCommitmentStairs, failFloorProximityWaves });
  const domain = kits.domain.describe(snapshot, cargoSnapshot);

  assert.equal(releaseTimingDials.length, 1, `case ${index}: should emit one release timing dial`);
  assert.ok(releaseTimingDials[0].releaseScore >= 0 && releaseTimingDials[0].releaseScore <= 1, `case ${index}: release score should clamp`);
  assert.ok(grappleLineOfSightStrips.length >= 2, `case ${index}: should emit grapple line-of-sight strips`);
  assert.ok(grappleLineOfSightStrips.every((strip) => strip.start && strip.end), `case ${index}: line-of-sight strips should have endpoints`);
  assert.ok(swingEnergyPockets.length >= 3, `case ${index}: should emit energy pockets`);
  assert.equal(wallBounceWarningFields.length, 2, `case ${index}: should emit left/right wall warning fields`);
  assert.ok(routeCommitmentStairs.length >= 4, `case ${index}: should emit route commitment stairs`);
  assert.equal(failFloorProximityWaves.length, 1, `case ${index}: should emit one fail-floor wave`);
  assert.equal(handoff.descriptorCount, releaseTimingDials.length + grappleLineOfSightStrips.length + swingEnergyPockets.length + wallBounceWarningFields.length + routeCommitmentStairs.length + failFloorProximityWaves.length, `case ${index}: handoff count should match child descriptors`);
  assert.equal(domain.rendererHandoff.descriptorCount, handoff.descriptorCount, `case ${index}: composite handoff count should match`);
  assert.ok(domain.rendererHandoff.descriptors.every((descriptor) => descriptor.id && descriptor.kind), `case ${index}: descriptors must have stable id/kind`);
  assert.doesNotThrow(() => JSON.stringify(domain), `case ${index}: domain output must be serializable`);
}

console.log("Next Ledge anchor timing readability kits smoke passed.");
