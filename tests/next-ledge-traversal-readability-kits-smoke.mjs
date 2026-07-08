import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  NEXT_LEDGE_TRAVERSAL_READABILITY_TREE,
  createSwingArcForecastKit,
  createAnchorConfidenceFieldKit,
  createStaminaRiskBandKit,
  createRecoveryVectorKit,
  createMomentumWindowKit,
  createSummitRouteBeatKit,
  createTraversalReadabilityRendererHandoffKit,
  createNextLedgeTraversalReadabilityDomainKit
} from "../experiments/next-ledge/src/traversal-readability-kits.js";

const source = readFileSync("experiments/next-ledge/src/traversal-readability-kits.js", "utf8");
const forbiddenOwnership = /from\s+["'].*three|document\.|window\.|addEventListener\(|requestAnimationFrame|AudioContext|WebGLRenderer|new\s+THREE|createRenderer\(/;
assert.doesNotMatch(source, forbiddenOwnership, "traversal readability kits must stay renderer/browser/audio/frame-loop neutral");
assert.match(NEXT_LEDGE_TRAVERSAL_READABILITY_TREE, /renderer consumes descriptors only/, "domain tree must document renderer-handoff boundary");

function makeSnapshot(index, patch = {}) {
  const mode = patch.mode ?? ["swinging", "falling", "launched", "retracting", "reeling"][index % 5];
  const sector = index + 2;
  const ledges = Array.from({ length: 8 + index }, (_, ledgeIndex) => ({
    id: `s${sector}-ledge-${ledgeIndex}`,
    label: ledgeIndex === 7 + index ? "Summit" : ledgeIndex % 4 === 2 ? `Rest ${ledgeIndex}` : `Anchor ${ledgeIndex}`,
    type: ledgeIndex === 7 + index ? "summit" : ledgeIndex % 4 === 2 ? "rest" : "normal",
    x: (ledgeIndex % 2 ? -1 : 1) * (50 + ledgeIndex * 13),
    y: ledgeIndex * 138 + index * 21,
    r: 8 + ledgeIndex % 4
  }));
  const currentIndex = Math.min(index + 1, ledges.length - 2);
  return {
    levelId: `next-ledge-sector-${sector}`,
    sector,
    frame: index * 29,
    mode,
    alive: true,
    completed: false,
    currentAnchorId: ledges[currentIndex].id,
    lastLedgeId: ledges[currentIndex].id,
    aimAssistTargetId: ledges[Math.min(currentIndex + 1, ledges.length - 1)].id,
    enabledTargetIds: ledges.slice(currentIndex + 1, currentIndex + 4).map((ledge) => ledge.id),
    stamina: Math.max(8, 115 - index * 10),
    constants: { maxStamina: 115, maxCableLength: 172, gravity: 0.052 },
    player: { x: 3 * index, y: 90 + index * 84, z: 1, vx: 2 + index, vy: mode === "falling" ? -11 - index : 4 + index, angle: -0.4 + index * 0.09 },
    trajectory: Array.from({ length: 20 }, (_, pointIndex) => ({ x: 3 * index + pointIndex * 9, y: 90 + index * 84 + pointIndex * (6 - index * 0.2), z: 3 })),
    route: { id: `route-${sector}`, label: `Route ${sector}`, ledges },
    recentEvents: []
  };
}

function makeCargoSnapshot(index) {
  return {
    pressure: {
      channels: [{ id: "fall-pressure", value: index * 8, status: index > 6 ? "warning" : "active" }],
      channelsById: { "fall-pressure": { id: "fall-pressure", value: index * 8, status: index > 6 ? "warning" : "active" } }
    }
  };
}

const kits = {
  arc: createSwingArcForecastKit(),
  anchor: createAnchorConfidenceFieldKit(),
  stamina: createStaminaRiskBandKit(),
  recovery: createRecoveryVectorKit(),
  momentum: createMomentumWindowKit(),
  summit: createSummitRouteBeatKit(),
  handoff: createTraversalReadabilityRendererHandoffKit(),
  domain: createNextLedgeTraversalReadabilityDomainKit()
};

for (let index = 0; index < 10; index += 1) {
  const snapshot = makeSnapshot(index);
  const cargoSnapshot = makeCargoSnapshot(index);
  const swingArcs = kits.arc.describe(snapshot);
  const anchorConfidenceFields = kits.anchor.describe(snapshot);
  const staminaRiskBands = kits.stamina.describe(snapshot, cargoSnapshot);
  const recoveryVectors = kits.recovery.describe(snapshot);
  const momentumWindows = kits.momentum.describe(snapshot);
  const summitRouteBeats = kits.summit.describe(snapshot);
  const handoff = kits.handoff.describe({ swingArcs, anchorConfidenceFields, staminaRiskBands, recoveryVectors, momentumWindows, summitRouteBeats });
  const domain = kits.domain.describe(snapshot, cargoSnapshot);

  assert.equal(swingArcs.length, 1, `case ${index}: should emit one swing arc forecast`);
  assert.ok(swingArcs[0].points.length >= 5, `case ${index}: swing arc should include useful forecast points`);
  assert.ok(anchorConfidenceFields.length >= 3, `case ${index}: should emit anchor confidence descriptors`);
  assert.equal(staminaRiskBands.length, 1, `case ${index}: should emit one stamina risk band`);
  assert.ok(recoveryVectors.length >= 1, `case ${index}: should emit at least one recovery vector`);
  assert.equal(momentumWindows.length, 2, `case ${index}: should emit two momentum windows`);
  assert.ok(summitRouteBeats.length >= 3, `case ${index}: should emit route beat descriptors`);
  assert.equal(handoff.descriptorCount, swingArcs.length + anchorConfidenceFields.length + staminaRiskBands.length + recoveryVectors.length + momentumWindows.length + summitRouteBeats.length, `case ${index}: handoff count should match child descriptors`);
  assert.equal(domain.rendererHandoff.descriptorCount, handoff.descriptorCount, `case ${index}: composite handoff count should match`);
  assert.ok(domain.rendererHandoff.descriptors.every((descriptor) => descriptor.id && descriptor.kind), `case ${index}: descriptors must have stable id/kind`);
  assert.doesNotThrow(() => JSON.stringify(domain), `case ${index}: domain output must be serializable`);
}

console.log("Next Ledge traversal readability kits smoke passed.");
