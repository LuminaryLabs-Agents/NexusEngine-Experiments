import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  NEXT_LEDGE_RAVINE_EVACUATION_READINESS_TREE,
  createRavineCallerBeaconKit,
  createCliffStretcherRouteKit,
  createPulleyAnchorArrayKit,
  createCrosswindGapWindowKit,
  createSignalSmokeColumnKit,
  createValleyPickupZoneKit,
  createRavineEvacuationRendererHandoffKit,
  createNextLedgeRavineEvacuationReadinessDomainKit
} from "../experiments/next-ledge/src/ravine-evacuation-readiness-kits.js";

const source = readFileSync("experiments/next-ledge/src/ravine-evacuation-readiness-kits.js", "utf8");
const forbiddenOwnership = /from\s+["'].*three|document\.|window\.|addEventListener\(|requestAnimationFrame|AudioContext|WebGLRenderer|new\s+THREE|createRenderer\(/;
assert.doesNotMatch(source, forbiddenOwnership, "ravine evacuation kits must stay renderer/browser/audio/frame-loop neutral");
assert.match(NEXT_LEDGE_RAVINE_EVACUATION_READINESS_TREE, /renderer consumes descriptors only/, "domain tree must document renderer handoff boundary");

function makeSnapshot(index, patch = {}) {
  const ledges = Array.from({ length: 14 + index }, (_, ledgeIndex) => ({
    id: `ravine-${index + 1}-ledge-${ledgeIndex}`,
    label: ledgeIndex === 13 + index ? "Summit" : ledgeIndex % 4 === 2 ? `Rescue shelf ${ledgeIndex}` : `Anchor ${ledgeIndex}`,
    type: ledgeIndex === 13 + index ? "summit" : ledgeIndex % 4 === 2 ? "rest" : "normal",
    x: (ledgeIndex % 2 ? -1 : 1) * (38 + ledgeIndex * 13),
    y: ledgeIndex * 104 + index * 17,
    r: 8 + ledgeIndex % 5
  }));
  const currentIndex = Math.min(index + 1, ledges.length - 6);
  const mode = patch.mode ?? ["swinging", "falling", "launched", "reeling", "retracting"][index % 5];
  return {
    levelId: `next-ledge-ravine-test-${index}`,
    frame: index * 53,
    sector: index + 1,
    mode,
    alive: true,
    completed: false,
    currentAnchorId: ledges[currentIndex].id,
    lastLedgeId: ledges[currentIndex].id,
    anchorLedge: ledges[currentIndex],
    enabledTargetIds: ledges.slice(currentIndex + 1, currentIndex + 5).filter((_, targetIndex) => targetIndex !== index % 4).map((ledge) => ledge.id),
    aimAssistTargetId: ledges[currentIndex + 1]?.id,
    stamina: Math.max(8, 115 - index * 9),
    constants: { maxStamina: 115, maxCableLength: 184, ropeLength: 52, scaffoldBoundary: 176, failFloorDistance: 520 },
    tuning: { failFloorDistance: 520 },
    camera: { y: ledges[currentIndex].y + 72, z: 232 },
    player: { x: index % 2 ? -66 - index * 7 : 66 + index * 6, y: ledges[currentIndex].y - 42 - index * 8, z: 2, vx: (index + 4) * (index % 2 ? -1 : 1), vy: mode === "falling" ? -18 - index : 7 + index },
    route: { id: `ravine-route-${index}`, label: `Ravine Route ${index}`, ledges },
    recentEvents: []
  };
}

function makeRescueLine(index) {
  return {
    rescueAnchorTriages: [
      { id: `ravine-triage-${index}-a`, reachable: true, rescueScore: 0.5 + index * 0.025, position: { x: 30 + index, y: 190 + index * 64, z: 4 } },
      { id: `ravine-triage-${index}-b`, reachable: false, rescueScore: 0.28, position: { x: -58, y: 240 + index * 58, z: 4 } }
    ],
    tetherStrainPulses: [{ id: `ravine-strain-${index}`, strain: Math.min(0.92, 0.15 + index * 0.07) }]
  };
}

function makeSummitBivouac(index) {
  return {
    stormExposureBands: [{ id: `exposure-${index}`, severity: Math.min(0.88, 0.18 + index * 0.06), position: { x: 0, y: 300 + index * 80, z: 8 } }],
    bivouacShelterPockets: [
      { shelterId: `shelter-${index}-a`, position: { x: 26, y: 260 + index * 70, z: 5 }, warmth: 0.52 + index * 0.03 },
      { shelterId: `shelter-${index}-b`, position: { x: -44, y: 330 + index * 78, z: 5 }, warmth: 0.44 }
    ]
  };
}

const kits = {
  caller: createRavineCallerBeaconKit(),
  stretcher: createCliffStretcherRouteKit(),
  pulley: createPulleyAnchorArrayKit(),
  wind: createCrosswindGapWindowKit(),
  smoke: createSignalSmokeColumnKit(),
  pickup: createValleyPickupZoneKit(),
  handoff: createRavineEvacuationRendererHandoffKit(),
  domain: createNextLedgeRavineEvacuationReadinessDomainKit()
};

for (let index = 0; index < 10; index += 1) {
  const snapshot = makeSnapshot(index);
  const rescueLine = makeRescueLine(index);
  const summitBivouac = makeSummitBivouac(index);
  const ravineCallerBeacons = kits.caller.describe(snapshot, rescueLine, summitBivouac);
  const cliffStretcherRoutes = kits.stretcher.describe(snapshot, rescueLine, summitBivouac);
  const pulleyAnchorArrays = kits.pulley.describe(snapshot, rescueLine, summitBivouac);
  const crosswindGapWindows = kits.wind.describe(snapshot, rescueLine, summitBivouac);
  const signalSmokeColumns = kits.smoke.describe(snapshot, rescueLine, summitBivouac);
  const valleyPickupZones = kits.pickup.describe(snapshot, rescueLine, summitBivouac);
  const handoff = kits.handoff.describe({ ravineCallerBeacons, cliffStretcherRoutes, pulleyAnchorArrays, crosswindGapWindows, signalSmokeColumns, valleyPickupZones });
  const domain = kits.domain.describe(snapshot, rescueLine, summitBivouac);

  assert.ok(ravineCallerBeacons.length >= 1, `case ${index}: caller beacons should exist`);
  assert.ok(ravineCallerBeacons.every((entry) => entry.kind === "next-ledge-ravine-caller-beacon"), `case ${index}: caller kind stable`);
  assert.ok(cliffStretcherRoutes.length >= 1, `case ${index}: stretcher routes should exist`);
  assert.ok(pulleyAnchorArrays.length >= 1, `case ${index}: pulley anchors should exist`);
  assert.ok(crosswindGapWindows.length >= 1, `case ${index}: crosswind windows should exist`);
  assert.ok(crosswindGapWindows.every((entry) => entry.timing >= 0 && entry.timing <= 1), `case ${index}: wind timing must clamp`);
  assert.ok(signalSmokeColumns.length >= 1, `case ${index}: smoke columns should exist`);
  assert.equal(valleyPickupZones.length, 1, `case ${index}: one pickup zone should exist`);
  assert.equal(handoff.descriptorCount, ravineCallerBeacons.length + cliffStretcherRoutes.length + pulleyAnchorArrays.length + crosswindGapWindows.length + signalSmokeColumns.length + valleyPickupZones.length, `case ${index}: handoff count equals child descriptors`);
  assert.equal(domain.rendererHandoff.descriptorCount, handoff.descriptorCount, `case ${index}: domain handoff count should match direct handoff`);
  assert.ok(domain.rendererHandoff.descriptors.every((descriptor) => descriptor.id && descriptor.kind && descriptor.rendererContract), `case ${index}: descriptors need id/kind/contract`);
  assert.doesNotThrow(() => JSON.stringify(domain), `case ${index}: domain output must serialize`);
}

console.log("Next Ledge ravine evacuation readiness kits smoke passed: 10 intake cases.");
