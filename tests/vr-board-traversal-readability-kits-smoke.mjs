import assert from "node:assert/strict";
import {
  VR_BOARD_TRAVERSAL_READABILITY_DOMAIN_TREE,
  createVrBoardJumpArcForecastKit,
  createVrBoardLandingZoneHeatKit,
  createVrBoardCheckpointThreadKit,
  createVrBoardFailRecoveryBeaconKit,
  createVrBoardTempoPulseBandKit,
  createVrBoardControlCoachingStripKit,
  createVrBoardTraversalRendererHandoffKit,
  createVrBoardTraversalReadabilityDomainKit
} from "../experiments/_kits/vr-platformer-board/vr-board-traversal-readability-kits.js";

function makeInput(index) {
  return {
    level: {
      start: { x: 0, y: 1.15 },
      exit: { x: 14 + index * 0.1, y: 4.2 },
      platforms: [
        { id: "launch", x: -0.5, y: 1.15, w: 3, h: 0.28 },
        { id: "middle", x: 3 + index * 0.08, y: 2.1, w: 2.2, h: 0.28 },
        { id: "bridge", x: 6.3, y: 2.9, w: 1.8, h: 0.25 },
        { id: "summit", x: 10.5, y: 3.7, w: 2.5, h: 0.28 }
      ],
      collectibles: [
        { id: "coin-a", x: 2.2, y: 2.3, value: 1 },
        { id: "coin-b", x: 6.6 + index * 0.04, y: 3.7, value: 1 },
        { id: "coin-c", x: 11.3, y: 4.5, value: 1 }
      ],
      hazards: index % 3 === 0 ? [] : [
        { id: "spike-a", x: 4.9, y: 1.05, w: 0.7, h: 0.35 },
        { id: "spike-b", x: 7.6 + index * 0.03, y: 2.8, w: 0.7, h: 0.35 }
      ]
    },
    avatar: {
      position: { x: index * 1.15, y: index === 8 ? -1.2 : 2.0 + index * 0.12 },
      velocity: { x: index % 2 ? 1.8 : -0.7, y: index % 3 === 0 ? 0.4 : -0.2 },
      size: { x: 0.48, y: 0.78 },
      grounded: index % 2 === 0,
      mode: index === 8 ? "fallen" : "alive",
      moveAxis: index % 3 === 0 ? -1 : index % 3 === 1 ? 0 : 1
    },
    objects: { collectedValue: index % 4, collectedIds: index > 5 ? ["coin-a"] : [] },
    input: { moveAxis: index % 3 === 0 ? -1 : index % 3 === 1 ? 0 : 1, jumpPressed: index === 2 || index === 6, restartPressed: index === 9 },
    camera: { position: { x: index * 0.7, y: 1.2 } },
    board: { sizeMeters: { x: 1.6, y: 0.9 } },
    comfort: { warnings: index === 7 ? ["head-drift"] : [] },
    sequence: { hint: index > 7 ? "Enter exit" : "Collect coins" },
    xrPose: { head: { position: { x: index === 7 ? 0.21 : 0.02 * index, y: 1.55 + index * 0.02, z: 0 } } },
    collisions: { hazardHits: index === 4 ? ["spike-b"] : [] },
    time: index * 0.25
  };
}

const intakes = Array.from({ length: 10 }, (_, index) => makeInput(index));
const jumpArcKit = createVrBoardJumpArcForecastKit({ sampleCount: 8 });
const landingZoneKit = createVrBoardLandingZoneHeatKit();
const checkpointThreadKit = createVrBoardCheckpointThreadKit();
const failRecoveryKit = createVrBoardFailRecoveryBeaconKit();
const tempoBandKit = createVrBoardTempoPulseBandKit({ bandCount: 5 });
const coachingStripKit = createVrBoardControlCoachingStripKit();
const rendererHandoffKit = createVrBoardTraversalRendererHandoffKit({ jumpArcForecastKit: jumpArcKit, landingZoneHeatKit: landingZoneKit, checkpointThreadKit, failRecoveryBeaconKit: failRecoveryKit, tempoPulseBandKit: tempoBandKit, controlCoachingStripKit: coachingStripKit });
const domainKit = createVrBoardTraversalReadabilityDomainKit({ rendererHandoffKit });

assert.equal(VR_BOARD_TRAVERSAL_READABILITY_DOMAIN_TREE.root, "vr-board-traversal-readability-domain");
assert.ok(VR_BOARD_TRAVERSAL_READABILITY_DOMAIN_TREE.contract.includes("renderer consumes traversal descriptors only"));

for (const input of intakes) {
  const jumpArc = jumpArcKit.describe(input);
  assert.equal(jumpArcKit.id, "n-vr-board-jump-arc-forecast-kit");
  assert.equal(jumpArcKit.domain, "vr-board-traversal-readability/jump-arc-forecast");
  assert.equal(jumpArc.points.length, 8);
  assert.ok(["launchable", "airborne"].includes(jumpArc.phase));
  assert.ok(jumpArc.rendererContract.rendererMustNotOwn.includes("platformer physics"));

  const landingZones = landingZoneKit.describe(input);
  assert.equal(landingZoneKit.id, "n-vr-board-landing-zone-heat-kit");
  assert.equal(landingZoneKit.domain, "vr-board-traversal-readability/landing-zone-heat");
  assert.equal(landingZones.length, input.level.platforms.length);
  assert.ok(landingZones.every((zone) => zone.quality >= 0 && zone.quality <= 1));
  assert.ok(landingZones.every((zone) => zone.rendererContract.owner === "vr-board-landing-zone-heat-kit"));

  const checkpointThread = checkpointThreadKit.describe(input);
  assert.equal(checkpointThreadKit.id, "n-vr-board-checkpoint-thread-kit");
  assert.equal(checkpointThreadKit.domain, "vr-board-traversal-readability/checkpoint-thread");
  assert.ok(checkpointThread.nodes.length >= 2);
  assert.equal(checkpointThread.links.length, checkpointThread.nodes.length - 1);
  assert.ok(checkpointThread.rendererContract.rendererMustNotOwn.includes("objective sequence"));

  const recovery = failRecoveryKit.describe(input);
  assert.equal(failRecoveryKit.id, "n-vr-board-fail-recovery-beacon-kit");
  assert.equal(failRecoveryKit.domain, "vr-board-traversal-readability/fail-recovery-beacon");
  assert.ok(recovery.recoveryAnchor.x >= -1);
  assert.ok(recovery.beacons.every((beacon) => beacon.urgency >= 0 && beacon.urgency <= 1));

  const tempoBands = tempoBandKit.describe(input);
  assert.equal(tempoBandKit.id, "n-vr-board-tempo-pulse-band-kit");
  assert.equal(tempoBandKit.domain, "vr-board-traversal-readability/tempo-pulse-band");
  assert.equal(tempoBands.length, 5);
  assert.ok(tempoBands.every((band) => band.pulse >= 0 && band.pulse <= 1));

  const coaching = coachingStripKit.describe(input);
  assert.equal(coachingStripKit.id, "n-vr-board-control-coaching-strip-kit");
  assert.equal(coachingStripKit.domain, "vr-board-traversal-readability/control-coaching-strip");
  assert.equal(coaching.chips.length, 4);
  assert.ok(["training", "warning", "success"].includes(coaching.tone));

  const handoff = rendererHandoffKit.describe(input);
  const domain = domainKit.describe(input);
  assert.equal(rendererHandoffKit.id, "n-vr-board-traversal-renderer-handoff-kit");
  assert.equal(rendererHandoffKit.domain, "vr-board-traversal-readability/renderer-handoff");
  assert.equal(handoff.policy, "renderer-consumes-descriptors-only");
  assert.ok(handoff.counts.total >= 20);
  assert.equal(domain.rendererHandoff.counts.total, handoff.counts.total);
  assert.deepEqual(JSON.parse(JSON.stringify(domain.rendererHandoff.counts)), domain.rendererHandoff.counts);
}

console.log("vr board traversal readability kit smoke passed: 8 changed/new kit surfaces x 10 intake cases");
