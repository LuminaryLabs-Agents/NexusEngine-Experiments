import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  NEXT_LEDGE_RESCUE_LINE_READINESS_TREE,
  createFallRecoveryNetKit,
  createTetherStrainPulseKit,
  createRescueAnchorTriageKit,
  createStaminaCacheHopKit,
  createCargoRetentionWarningKit,
  createSummitExtractionBeaconKit,
  createRescueLineRendererHandoffKit,
  createNextLedgeRescueLineReadinessDomainKit
} from "../experiments/next-ledge/src/rescue-line-readiness-kits.js";

const source = readFileSync("experiments/next-ledge/src/rescue-line-readiness-kits.js", "utf8");
const forbiddenOwnership = /from\s+["'].*three|document\.|window\.|addEventListener\(|requestAnimationFrame|AudioContext|WebGLRenderer|new\s+THREE|createRenderer\(/;
assert.doesNotMatch(source, forbiddenOwnership, "rescue line kits must stay renderer/browser/audio/frame-loop neutral");
assert.match(NEXT_LEDGE_RESCUE_LINE_READINESS_TREE, /renderer consumes descriptors only/, "domain tree must document descriptor handoff boundary");

function makeSnapshot(index, patch = {}) {
  const ledges = Array.from({ length: 11 + index }, (_, ledgeIndex) => ({
    id: `s${index + 1}-ledge-${ledgeIndex}`,
    label: ledgeIndex === 10 + index ? "Summit" : ledgeIndex % 4 === 2 ? `Rest ${ledgeIndex}` : `Anchor ${ledgeIndex}`,
    type: ledgeIndex === 10 + index ? "summit" : ledgeIndex % 4 === 2 ? "rest" : "normal",
    x: (ledgeIndex % 2 ? -1 : 1) * (44 + ledgeIndex * 11),
    y: ledgeIndex * 118 + index * 21,
    r: 8 + ledgeIndex % 4
  }));
  const currentIndex = Math.min(index + 1, ledges.length - 4);
  const mode = patch.mode ?? ["swinging", "falling", "launched", "retracting", "reeling"][index % 5];
  return {
    levelId: `next-ledge-test-${index}`,
    frame: index * 41,
    sector: index + 1,
    mode,
    alive: true,
    completed: false,
    currentAnchorId: ledges[currentIndex].id,
    lastLedgeId: ledges[currentIndex].id,
    anchorLedge: ledges[currentIndex],
    enabledTargetIds: ledges.slice(currentIndex + 1, currentIndex + 5).map((ledge) => ledge.id),
    aimAssistTargetId: ledges[currentIndex + 1]?.id,
    stamina: Math.max(8, 115 - index * 9),
    constants: { maxStamina: 115, maxCableLength: 184, ropeLength: 52, scaffoldBoundary: 176, failFloorDistance: 520 },
    tuning: { failFloorDistance: 520 },
    camera: { y: ledges[currentIndex].y + 70 },
    player: { x: index % 2 ? -72 - index * 9 : 72 + index * 8, y: ledges[currentIndex].y - 48 - index * 8, z: 2, vx: (index + 3) * (index % 2 ? -1 : 1), vy: mode === "falling" ? -14 - index : 6 + index },
    route: { id: `route-${index}`, label: `Route ${index}`, ledges },
    recentEvents: []
  };
}

function makeCargoSnapshot(index) {
  const value = Math.min(100, index * 11);
  return {
    pressure: {
      channels: [{ id: "fall-pressure", value, status: value > 65 ? "warning" : "active" }],
      channelsById: { "fall-pressure": { id: "fall-pressure", value, status: value > 65 ? "warning" : "active" } }
    }
  };
}

const kits = {
  fall: createFallRecoveryNetKit(),
  strain: createTetherStrainPulseKit(),
  anchor: createRescueAnchorTriageKit(),
  stamina: createStaminaCacheHopKit(),
  cargo: createCargoRetentionWarningKit(),
  summit: createSummitExtractionBeaconKit(),
  handoff: createRescueLineRendererHandoffKit(),
  domain: createNextLedgeRescueLineReadinessDomainKit()
};

for (let index = 0; index < 10; index += 1) {
  const snapshot = makeSnapshot(index);
  const cargoSnapshot = makeCargoSnapshot(index);
  const fallRecoveryNets = kits.fall.describe(snapshot, cargoSnapshot);
  const tetherStrainPulses = kits.strain.describe(snapshot, cargoSnapshot);
  const rescueAnchorTriages = kits.anchor.describe(snapshot, cargoSnapshot);
  const staminaCacheHops = kits.stamina.describe(snapshot, cargoSnapshot);
  const cargoRetentionWarnings = kits.cargo.describe(snapshot, cargoSnapshot);
  const summitExtractionBeacons = kits.summit.describe(snapshot, cargoSnapshot);
  const handoff = kits.handoff.describe({ fallRecoveryNets, tetherStrainPulses, rescueAnchorTriages, staminaCacheHops, cargoRetentionWarnings, summitExtractionBeacons });
  const domain = kits.domain.describe(snapshot, cargoSnapshot);

  assert.equal(fallRecoveryNets.length, 1, `case ${index}: fall recovery net should emit one descriptor`);
  assert.equal(tetherStrainPulses.length, 1, `case ${index}: tether strain should emit one descriptor`);
  assert.ok(rescueAnchorTriages.length >= 1, `case ${index}: rescue anchor triage should expose viable anchors`);
  assert.ok(staminaCacheHops.length >= 1, `case ${index}: stamina cache hops should expose rest anchors`);
  assert.equal(cargoRetentionWarnings.length, 1, `case ${index}: cargo warning should emit one descriptor`);
  assert.equal(summitExtractionBeacons.length, 1, `case ${index}: summit extraction beacon should emit one descriptor`);
  assert.equal(handoff.descriptorCount, fallRecoveryNets.length + tetherStrainPulses.length + rescueAnchorTriages.length + staminaCacheHops.length + cargoRetentionWarnings.length + summitExtractionBeacons.length, `case ${index}: handoff count should equal child descriptors`);
  assert.equal(domain.rendererHandoff.descriptorCount, handoff.descriptorCount, `case ${index}: domain handoff count should match direct handoff`);
  assert.ok(domain.rendererHandoff.descriptors.every((descriptor) => descriptor.id && descriptor.kind), `case ${index}: descriptors need stable id/kind`);
  assert.doesNotThrow(() => JSON.stringify(domain), `case ${index}: domain output must serialize`);
}

console.log("Next Ledge rescue line readiness kits smoke passed.");
