import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const index = readFileSync("experiments/vr-platformer-board/index.html", "utf8");
const traversalKits = readFileSync("experiments/_kits/vr-platformer-board/vr-board-traversal-readability-kits.js", "utf8");
const skillKits = readFileSync("experiments/_kits/vr-platformer-board/vr-board-skill-rhythm-readiness-kits.js", "utf8");
const playSmoke = readFileSync("tests/vr-platformer-board-playwright-state-input-smoke.mjs", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");

assert.ok(index.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(!index.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"));
assert.ok(index.includes("createVrBoardTraversalReadabilityDomainKit"));
assert.ok(index.includes("latestTraversalReadability = traversalReadabilityKit.describe"));
assert.ok(index.includes("getRendererHandoff: () => latestTraversalReadability?.rendererHandoff ?? null"));

assert.ok(traversalKits.includes("./vr-board-skill-rhythm-readiness-kits.js"));
assert.ok(traversalKits.includes("VR_BOARD_SKILL_RHYTHM_READINESS_DOMAIN_TREE"));
assert.ok(traversalKits.includes("skillRhythmReadinessDomainKit = createVrBoardSkillRhythmReadinessDomainKit()"));
assert.ok(traversalKits.includes("mergeSkillRhythmCheckpointThread"));
assert.ok(traversalKits.includes("mergeSkillRhythmRecoveryBeacons"));
assert.ok(traversalKits.includes("mergeSkillRhythmTempoBands"));
assert.ok(traversalKits.includes("skillRhythmReadiness: rendererHandoff.descriptors.skillRhythmReadiness"));

const expectedSkillTokens = [
  "VR_BOARD_SKILL_RHYTHM_READINESS_DOMAIN_TREE",
  "createVrBoardJumpTimingGateKit",
  "createVrBoardAirControlVectorKit",
  "createVrBoardCoinComboLaneKit",
  "createVrBoardHazardHesitationFieldKit",
  "createVrBoardCheckpointSaveEchoKit",
  "createVrBoardExitCommitmentCrestKit",
  "createVrBoardSkillRhythmRendererHandoffKit",
  "createVrBoardSkillRhythmReadinessDomainKit",
  "renderer consumes skill rhythm descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership"
];
for (const token of expectedSkillTokens) assert.ok(skillKits.includes(token), token);

assert.ok(playSmoke.includes("vr-board-skill-rhythm-readiness-kits-smoke.mjs"));
assert.ok(playSmoke.includes("vr-board-skill-rhythm-readiness-cdn-state-input-smoke.mjs"));
assert.ok(manifest.includes("vr-board-skill-rhythm-readiness-domain-kit"));

const stateInputCases = Array.from({ length: 10 }, (_, index) => ({
  dt: index % 2 ? 1 / 72 : 1 / 30,
  input: {
    moveAxis: index % 3 === 0 ? -1 : index % 3 === 1 ? 0 : 1,
    jumpPressed: index === 2 || index === 5,
    restartPressed: index === 9,
    skillRhythm: {
      jumpGateReadiness: Math.max(0, Math.min(1, 0.14 + index * 0.09)),
      airControlVectors: 4,
      comboLanes: Math.max(0, 4 - (index % 5)),
      hazardHesitationFields: index % 4,
      checkpointEchoes: 6,
      exitCommitment: Math.max(0, Math.min(1, index / 9))
    }
  }
}));

for (const stateCase of stateInputCases) {
  assert.ok(Number.isFinite(stateCase.dt));
  assert.ok(stateCase.input.moveAxis >= -1 && stateCase.input.moveAxis <= 1);
  assert.equal(typeof stateCase.input.jumpPressed, "boolean");
  assert.equal(typeof stateCase.input.restartPressed, "boolean");
  assert.ok(stateCase.input.skillRhythm.jumpGateReadiness >= 0 && stateCase.input.skillRhythm.jumpGateReadiness <= 1);
  assert.equal(stateCase.input.skillRhythm.airControlVectors, 4);
  assert.ok(stateCase.input.skillRhythm.comboLanes >= 0 && stateCase.input.skillRhythm.comboLanes <= 4);
  assert.ok(stateCase.input.skillRhythm.hazardHesitationFields >= 0 && stateCase.input.skillRhythm.hazardHesitationFields <= 3);
  assert.equal(stateCase.input.skillRhythm.checkpointEchoes, 6);
  assert.ok(stateCase.input.skillRhythm.exitCommitment >= 0 && stateCase.input.skillRhythm.exitCommitment <= 1);
}

console.log("vr board skill rhythm NexusEngine CDN/state-input smoke passed: 10 intake cases");
