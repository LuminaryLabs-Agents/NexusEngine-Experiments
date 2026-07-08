import assert from "node:assert/strict";
import {
  VR_PLATFORMER_BOARD_VISUAL_DOMAIN_TREE,
  createVrBoardAtmosphericDomeKit,
  createVrBoardCollectibleConstellationKit,
  createVrBoardComfortFocusKit,
  createVrBoardHazardTelemetryKit,
  createVrBoardMotionTrailKit,
  createVrBoardPlatformReliefKit,
  createVrBoardRendererHandoffKit,
  createVrBoardCompositionKit,
  createVrBoardWorldSeedKit,
  createVrBoardChallengeDirectorKit,
  createVrBoardDepthLaneKit,
  createVrBoardHudDescriptorKit
} from "../experiments/_kits/vr-platformer-board/vr-platformer-board-kits.js";

function makeInput(index) {
  const exitX = 12 + index * 0.2;
  return {
    level: {
      start: { x: 0, y: 2 },
      exit: { x: exitX, y: 3 },
      platforms: [
        { id: "start", x: 0, y: 1, w: 3, h: 0.3 },
        { id: "mid", x: 4 + index * 0.1, y: 2, w: 2, h: 0.3 },
        { id: "exit", x: 8 + index * 0.2, y: 3, w: 2, h: 0.3 }
      ],
      collectibles: [
        { id: "coin-a", x: 2 + index * 0.08, y: 2.5 },
        { id: "coin-b", x: 6, y: 3.5 }
      ],
      hazards: index % 3 === 0 ? [] : [{ id: "spike-a", x: 5 + index * 0.05, y: 1, w: 1, h: 0.4 }]
    },
    avatar: {
      position: { x: index * 1.1, y: 2.4 + index * 0.1 },
      size: { x: 0.5, y: 0.8 },
      velocity: { x: index * 0.16, y: index % 2 ? 0.08 : -0.06 }
    },
    camera: { position: { x: index * 0.35, y: 1 } },
    board: { sizeMeters: { x: 1.6, y: 0.9 } },
    objects: { collectedValue: index % 4 },
    comfort: { warnings: index === 7 ? ["head-drift"] : [] },
    sequence: { hint: index > 7 ? "Reach the exit" : "Collect coins" },
    xrPose: { head: { position: { x: index === 7 ? 0.2 : 0.02 * index, y: 1.6, z: 0 } } },
    time: index * 0.33
  };
}

const intakes = Array.from({ length: 10 }, (_, index) => makeInput(index));

const atmosphericDomeKit = createVrBoardAtmosphericDomeKit({ bandCount: 6, moteCount: 12 });
const platformReliefKit = createVrBoardPlatformReliefKit();
const hazardTelemetryKit = createVrBoardHazardTelemetryKit();
const collectibleConstellationKit = createVrBoardCollectibleConstellationKit();
const comfortFocusKit = createVrBoardComfortFocusKit();
const motionTrailKit = createVrBoardMotionTrailKit({ ghostCount: 7 });
const rendererHandoffKit = createVrBoardRendererHandoffKit({ atmosphericDomeKit, platformReliefKit, hazardTelemetryKit, collectibleConstellationKit, comfortFocusKit, motionTrailKit });
const compositionKit = createVrBoardCompositionKit({
  worldSeedKit: createVrBoardWorldSeedKit(),
  challengeDirectorKit: createVrBoardChallengeDirectorKit(),
  depthLaneKit: createVrBoardDepthLaneKit({ laneCount: 7 }),
  atmosphericDomeKit,
  platformReliefKit,
  hazardTelemetryKit,
  collectibleConstellationKit,
  comfortFocusKit,
  motionTrailKit,
  rendererHandoffKit,
  hudDescriptorKit: createVrBoardHudDescriptorKit()
});

assert.equal(VR_PLATFORMER_BOARD_VISUAL_DOMAIN_TREE.root, "vr-platformer-board-domain");
assert.ok(VR_PLATFORMER_BOARD_VISUAL_DOMAIN_TREE.contract.includes("renderer consumes descriptors only"));

for (const input of intakes) {
  const challenge = createVrBoardChallengeDirectorKit().describe(input);

  // Atmospheric dome kit: 10 intake cases.
  const dome = atmosphericDomeKit.describe({ ...input, challenge });
  assert.equal(atmosphericDomeKit.id, "n-vr-board-atmospheric-dome-kit");
  assert.equal(atmosphericDomeKit.domain, "vr-board-world-readability/atmospheric-dome");
  assert.equal(dome.skyBands.length, 6);
  assert.equal(dome.motes.length, 12);
  assert.ok(dome.pressure >= 0 && dome.pressure <= 1);
  assert.ok(dome.rendererContract.rendererMustNotOwn.includes("platformer physics"));

  // Platform relief kit: 10 intake cases.
  const relief = platformReliefKit.describe(input);
  assert.equal(platformReliefKit.id, "n-vr-board-platform-relief-kit");
  assert.equal(platformReliefKit.domain, "vr-board-platformer-readability/platform-relief");
  assert.equal(relief.length, input.level.platforms.length);
  assert.ok(relief.every((entry) => entry.supportColumns >= 2));
  assert.ok(relief.every((entry) => entry.rendererContract.owner === "vr-board-platform-relief-kit"));

  // Hazard telemetry kit: 10 intake cases.
  const hazards = hazardTelemetryKit.describe({ ...input, challenge });
  assert.equal(hazardTelemetryKit.id, "n-vr-board-hazard-telemetry-kit");
  assert.equal(hazardTelemetryKit.domain, "vr-board-platformer-readability/hazard-telemetry");
  assert.equal(hazards.length, input.level.hazards.length);
  assert.ok(hazards.every((entry) => entry.pulse >= 0.1 && entry.pulse <= 0.95));
  assert.ok(hazards.every((entry) => ["ahead", "behind"].includes(entry.glyph)));

  // Collectible constellation kit: 10 intake cases.
  const constellation = collectibleConstellationKit.describe({ ...input, challenge });
  assert.equal(collectibleConstellationKit.id, "n-vr-board-collectible-constellation-kit");
  assert.equal(collectibleConstellationKit.domain, "vr-board-platformer-readability/collectible-constellation");
  assert.equal(constellation.nodes.length, input.level.collectibles.length);
  assert.equal(constellation.links.length, Math.max(0, input.level.collectibles.length - 1));
  assert.ok(constellation.rendererContract.rendererMustNotOwn.includes("objective sequence"));

  // Comfort focus kit: 10 intake cases.
  const focus = comfortFocusKit.describe(input);
  assert.equal(comfortFocusKit.id, "n-vr-board-comfort-focus-kit");
  assert.equal(comfortFocusKit.domain, "vr-board-comfort-and-handoff/comfort-focus");
  assert.ok(focus.vignette >= 0.12 && focus.vignette <= 0.72);
  assert.ok(focus.stableWindow.xMin < focus.stableWindow.xMax);
  assert.ok(["comfortable", "warning"].includes(focus.tone));

  // Motion trail kit: 10 intake cases.
  const trail = motionTrailKit.describe(input);
  assert.equal(motionTrailKit.id, "n-vr-board-motion-trail-kit");
  assert.equal(motionTrailKit.domain, "vr-board-platformer-readability/avatar-motion-trail");
  assert.equal(trail.ghosts.length, 7);
  assert.ok(trail.ghosts.every((ghost) => ghost.alpha >= 0.04 && ghost.alpha <= 0.44));
  assert.ok(trail.rendererContract.rendererConsumes.includes("serializable descriptors"));

  // Renderer handoff and composition: 10 intake cases.
  const handoff = rendererHandoffKit.describe(input);
  const composed = compositionKit.describe(input);
  assert.equal(rendererHandoffKit.id, "n-vr-board-renderer-handoff-kit");
  assert.equal(rendererHandoffKit.domain, "vr-board-comfort-and-handoff/renderer-handoff");
  assert.ok(handoff.counts.total >= 25);
  assert.equal(composed.visual.rendererHandoff.counts.total, handoff.counts.total);
  assert.ok(composed.hud.controls.includes("visual descriptors"));
}

console.log("vr platformer board visual fractal kit smoke passed: 7 changed/new kit surfaces x 10 intake cases");
