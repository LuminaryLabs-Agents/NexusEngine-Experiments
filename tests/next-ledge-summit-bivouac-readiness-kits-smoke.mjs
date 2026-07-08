import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  NEXT_LEDGE_SUMMIT_BIVOUAC_READINESS_TREE,
  createStormExposureBandKit,
  createBivouacShelterPocketKit,
  createPartnerBelayEchoKit,
  createMedCacheStationKit,
  createRouteFlagThreadKit,
  createEvacuationFlareWindowKit,
  createSummitBivouacRendererHandoffKit,
  createNextLedgeSummitBivouacReadinessDomainKit
} from "../experiments/next-ledge/src/summit-bivouac-readiness-kits.js";

const source = readFileSync("experiments/next-ledge/src/summit-bivouac-readiness-kits.js", "utf8");
const forbiddenOwnership = /from\s+["'].*three|document\.|window\.|addEventListener\(|requestAnimationFrame|AudioContext|WebGLRenderer|new\s+THREE|createRenderer\(/;
assert.doesNotMatch(source, forbiddenOwnership, "summit bivouac kits must stay renderer/browser/audio/frame-loop neutral");
assert.match(NEXT_LEDGE_SUMMIT_BIVOUAC_READINESS_TREE, /renderer consumes descriptors only/, "domain tree must document descriptor handoff boundary");

function makeSnapshot(index, patch = {}) {
  const ledges = Array.from({ length: 12 + index }, (_, ledgeIndex) => ({
    id: `biv-${index + 1}-ledge-${ledgeIndex}`,
    label: ledgeIndex === 11 + index ? "Summit" : ledgeIndex % 3 === 1 ? `Rest shelter ${ledgeIndex}` : `Anchor ${ledgeIndex}`,
    type: ledgeIndex === 11 + index ? "summit" : ledgeIndex % 3 === 1 ? "rest" : "normal",
    x: (ledgeIndex % 2 ? -1 : 1) * (42 + ledgeIndex * 12),
    y: ledgeIndex * 112 + index * 19,
    r: 8 + ledgeIndex % 4
  }));
  const currentIndex = Math.min(index + 1, ledges.length - 5);
  const mode = patch.mode ?? ["swinging", "falling", "launched", "retracting", "reeling"][index % 5];
  return {
    levelId: `next-ledge-bivouac-test-${index}`,
    frame: index * 47,
    sector: index + 1,
    mode,
    alive: true,
    completed: false,
    currentAnchorId: ledges[currentIndex].id,
    lastLedgeId: ledges[currentIndex].id,
    anchorLedge: ledges[currentIndex],
    enabledTargetIds: ledges.slice(currentIndex + 1, currentIndex + 5).map((ledge) => ledge.id),
    aimAssistTargetId: ledges[currentIndex + 1]?.id,
    stamina: Math.max(6, 115 - index * 10),
    constants: { maxStamina: 115, maxCableLength: 184, ropeLength: 52, scaffoldBoundary: 176, failFloorDistance: 520 },
    tuning: { failFloorDistance: 520 },
    camera: { y: ledges[currentIndex].y + 72, z: 232 },
    player: { x: index % 2 ? -68 - index * 9 : 68 + index * 8, y: ledges[currentIndex].y - 36 - index * 6, z: 2, vx: (index + 3) * (index % 2 ? -1 : 1), vy: mode === "falling" ? -15 - index : 6 + index },
    route: { id: `bivouac-route-${index}`, label: `Bivouac Route ${index}`, ledges },
    recentEvents: []
  };
}

function makeRescueReadiness(index) {
  return {
    rescueAnchorTriages: [
      { id: `triage-${index}-a`, reachable: true, rescueScore: 0.52 + index * 0.02, position: { x: 34 + index, y: 180 + index * 66, z: 4 } },
      { id: `triage-${index}-b`, reachable: false, rescueScore: 0.3, position: { x: -54, y: 220 + index * 55, z: 4 } }
    ],
    tetherStrainPulses: [{ id: `strain-${index}`, strain: Math.min(0.9, 0.12 + index * 0.08) }]
  };
}

const kits = {
  storm: createStormExposureBandKit(),
  shelter: createBivouacShelterPocketKit(),
  belay: createPartnerBelayEchoKit(),
  med: createMedCacheStationKit(),
  flags: createRouteFlagThreadKit(),
  flare: createEvacuationFlareWindowKit(),
  handoff: createSummitBivouacRendererHandoffKit(),
  domain: createNextLedgeSummitBivouacReadinessDomainKit()
};

for (let index = 0; index < 10; index += 1) {
  const snapshot = makeSnapshot(index);
  const rescueReadiness = makeRescueReadiness(index);
  const stormExposureBands = kits.storm.describe(snapshot, rescueReadiness);
  const bivouacShelterPockets = kits.shelter.describe(snapshot, rescueReadiness);
  const partnerBelayEchoes = kits.belay.describe(snapshot, rescueReadiness);
  const medCacheStations = kits.med.describe(snapshot, rescueReadiness);
  const routeFlagThreads = kits.flags.describe(snapshot, rescueReadiness);
  const evacuationFlareWindows = kits.flare.describe(snapshot, rescueReadiness);
  const handoff = kits.handoff.describe({ stormExposureBands, bivouacShelterPockets, partnerBelayEchoes, medCacheStations, routeFlagThreads, evacuationFlareWindows });
  const domain = kits.domain.describe(snapshot, rescueReadiness);

  assert.equal(stormExposureBands.length, 1, `case ${index}: storm exposure should emit one descriptor`);
  assert.ok(bivouacShelterPockets.length >= 1, `case ${index}: shelter pockets should expose rest ledges`);
  assert.equal(partnerBelayEchoes.length, 1, `case ${index}: partner belay should emit one descriptor`);
  assert.ok(medCacheStations.length >= 1, `case ${index}: med cache should expose support ledges`);
  assert.ok(routeFlagThreads.length >= 1, `case ${index}: route flags should expose next ledges`);
  assert.equal(evacuationFlareWindows.length, 1, `case ${index}: evacuation flare should emit one descriptor`);
  assert.equal(handoff.descriptorCount, stormExposureBands.length + bivouacShelterPockets.length + partnerBelayEchoes.length + medCacheStations.length + routeFlagThreads.length + evacuationFlareWindows.length, `case ${index}: handoff count should equal child descriptors`);
  assert.equal(domain.rendererHandoff.descriptorCount, handoff.descriptorCount, `case ${index}: domain handoff count should match direct handoff`);
  assert.ok(domain.rendererHandoff.descriptors.every((descriptor) => descriptor.id && descriptor.kind), `case ${index}: descriptors need stable id/kind`);
  assert.doesNotThrow(() => JSON.stringify(domain), `case ${index}: domain output must serialize`);
}

console.log("Next Ledge summit bivouac readiness kits smoke passed.");
