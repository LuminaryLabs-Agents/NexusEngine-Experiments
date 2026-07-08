import assert from "node:assert/strict";
import {
  VR_BOARD_SKILL_RHYTHM_READINESS_DOMAIN_TREE,
  createVrBoardJumpTimingGateKit,
  createVrBoardAirControlVectorKit,
  createVrBoardCoinComboLaneKit,
  createVrBoardHazardHesitationFieldKit,
  createVrBoardCheckpointSaveEchoKit,
  createVrBoardExitCommitmentCrestKit,
  createVrBoardSkillRhythmRendererHandoffKit,
  createVrBoardSkillRhythmReadinessDomainKit
} from "../experiments/_kits/vr-platformer-board/vr-board-skill-rhythm-readiness-kits.js";
import {
  createVrBoardTraversalReadabilityDomainKit
} from "../experiments/_kits/vr-platformer-board/vr-board-traversal-readability-kits.js";

function makeInput(index) {
  return {
    level: {
      start: { x: 0, y: 1.15 },
      exit: { x: 14.4 + index * 0.08, y: 4.5, w: 0.7, h: 1.2 },
      platforms: [
        { id: "launch", x: -0.6, y: 1.15, w: 3.1, h: 0.28 },
        { id: "low-hop", x: 3 + index * 0.04, y: 2.0, w: 1.9, h: 0.26 },
        { id: "hazard-bridge", x: 5.9, y: 2.85, w: 2.2, h: 0.26 },
        { id: "recovery", x: 8.8, y: 2.2 + index * 0.02, w: 1.8, h: 0.26 },
        { id: "summit", x: 11.6, y: 3.55, w: 2.4, h: 0.28 },
        { id: "exit-pad", x: 14.0, y: 4.4, w: 1.5, h: 0.3 }
      ],
      collectibles: [
        { id: "coin-launch", x: 2.2, y: 2.2, value: 1 },
        { id: "coin-bridge", x: 6.8 + index * 0.04, y: 3.82, value: 1 },
        { id: "coin-recovery", x: 9.6, y: 3.1, value: 1 },
        { id: "coin-summit", x: 12.6, y: 4.5, value: 1 }
      ],
      hazards: index % 4 === 0 ? [] : [
        { id: "spike-gap", x: 4.95, y: 1.08, w: 0.8, h: 0.36 },
        { id: "spike-bridge", x: 7.45 + index * 0.03, y: 2.76, w: 0.7, h: 0.36 },
        { id: "drop-warning", x: 10.82, y: 1.12, w: 0.82, h: 0.36 }
      ]
    },
    avatar: {
      position: { x: 0.4 + index * 1.08, y: index === 8 ? -1.1 : 2.0 + index * 0.1 },
      velocity: { x: index % 2 ? 2.2 : -0.4, y: index % 3 === 0 ? 0.5 : -0.25 },
      size: { x: 0.48, y: 0.78 },
      grounded: index % 2 === 0,
      mode: index === 8 ? "fallen" : "alive",
      moveAxis: index % 3 === 0 ? -1 : index % 3 === 1 ? 0 : 1
    },
    objects: { collectedValue: index % 4, collectedIds: index > 5 ? ["coin-launch"] : [] },
    input: { moveAxis: index % 3 === 0 ? -1 : index % 3 === 1 ? 0 : 1, jumpPressed: index === 3, restartPressed: index === 9 },
    camera: { position: { x: index * 0.6, y: 1.2 } },
    board: { sizeMeters: { x: 1.6, y: 0.9 } },
    comfort: { warnings: index === 7 ? ["head-drift"] : [] },
    sequence: { hint: index > 7 ? "Enter exit" : "Collect coins" },
    xrPose: { head: { position: { x: index === 7 ? 0.22 : -0.1 + index * 0.025, y: 1.48 + index * 0.03, z: 0 } } },
    collisions: { hazardHits: index === 4 ? ["spike-bridge"] : [] },
    time: index * 0.31
  };
}

const intakes = Array.from({ length: 10 }, (_, index) => makeInput(index));
const jumpTimingGateKit = createVrBoardJumpTimingGateKit();
const airControlVectorKit = createVrBoardAirControlVectorKit({ vectorCount: 4 });
const coinComboLaneKit = createVrBoardCoinComboLaneKit();
const hazardHesitationFieldKit = createVrBoardHazardHesitationFieldKit();
const checkpointSaveEchoKit = createVrBoardCheckpointSaveEchoKit();
const exitCommitmentCrestKit = createVrBoardExitCommitmentCrestKit({ requiredCollectibles: 3 });
const rendererHandoffKit = createVrBoardSkillRhythmRendererHandoffKit({ jumpTimingGateKit, airControlVectorKit, coinComboLaneKit, hazardHesitationFieldKit, checkpointSaveEchoKit, exitCommitmentCrestKit });
const domainKit = createVrBoardSkillRhythmReadinessDomainKit({ rendererHandoffKit });
const integratedTraversalKit = createVrBoardTraversalReadabilityDomainKit();

assert.equal(VR_BOARD_SKILL_RHYTHM_READINESS_DOMAIN_TREE.root, "vr-board-skill-rhythm-readiness-domain");
assert.ok(VR_BOARD_SKILL_RHYTHM_READINESS_DOMAIN_TREE.contract.includes("renderer consumes skill rhythm descriptors only"));

for (const input of intakes) {
  const gate = jumpTimingGateKit.describe(input);
  assert.equal(jumpTimingGateKit.id, "n-vr-board-jump-timing-gate-kit");
  assert.equal(jumpTimingGateKit.domain, "vr-board-skill-rhythm-readiness/jump-timing-gate");
  assert.ok(gate.readiness >= 0 && gate.readiness <= 1);
  assert.ok(["launch-window", "prepare", "airborne"].includes(gate.phase));
  assert.ok(gate.rendererContract.rendererMustNotOwn.includes("browser input"));

  const vectors = airControlVectorKit.describe(input);
  assert.equal(airControlVectorKit.id, "n-vr-board-air-control-vector-kit");
  assert.equal(vectors.length, 4);
  assert.ok(vectors.every((vector) => vector.strength >= 0 && vector.strength <= 1));
  assert.ok(vectors.every((vector) => ["left", "right", "neutral"].includes(vector.direction)));

  const comboLanes = coinComboLaneKit.describe(input);
  assert.equal(coinComboLaneKit.domain, "vr-board-skill-rhythm-readiness/coin-combo-lane");
  assert.ok(comboLanes.length <= input.level.collectibles.length);
  assert.ok(comboLanes.every((lane) => lane.comboValue >= 0 && lane.comboValue <= 1));

  const fields = hazardHesitationFieldKit.describe(input);
  assert.equal(hazardHesitationFieldKit.id, "n-vr-board-hazard-hesitation-field-kit");
  assert.equal(fields.length, input.level.hazards.length);
  assert.ok(fields.every((field) => field.hesitation >= 0 && field.hesitation <= 1));

  const echoes = checkpointSaveEchoKit.describe(input);
  assert.equal(checkpointSaveEchoKit.domain, "vr-board-skill-rhythm-readiness/checkpoint-save-echo");
  assert.equal(echoes.length, input.level.platforms.length);
  assert.ok(echoes.every((echo) => echo.confidence >= 0 && echo.confidence <= 1));

  const crest = exitCommitmentCrestKit.describe(input);
  assert.equal(exitCommitmentCrestKit.id, "n-vr-board-exit-commitment-crest-kit");
  assert.ok(crest.readiness >= 0 && crest.readiness <= 1);
  assert.ok(["collect", "prepare", "commit"].includes(crest.phase));

  const handoff = rendererHandoffKit.describe(input);
  const domain = domainKit.describe(input);
  assert.equal(rendererHandoffKit.id, "n-vr-board-skill-rhythm-renderer-handoff-kit");
  assert.equal(handoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(domain.rendererHandoff.counts.total, handoff.counts.total);
  assert.deepEqual(JSON.parse(JSON.stringify(domain.rendererHandoff.counts)), domain.rendererHandoff.counts);

  const traversal = integratedTraversalKit.describe(input);
  assert.ok(traversal.skillRhythmReadiness.rendererHandoff.counts.total >= handoff.counts.total);
  assert.ok(traversal.rendererHandoff.counts.skillAirVectors >= 4);
  assert.ok(traversal.tempoPulseBands.length >= input.level.platforms.length);
}

console.log("vr board skill rhythm readiness kit smoke passed: 8 new/integrated kit surfaces x 10 intake cases");
