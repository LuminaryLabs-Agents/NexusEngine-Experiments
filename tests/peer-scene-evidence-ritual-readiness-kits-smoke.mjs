import assert from "node:assert/strict";
import {
  SCENE_EVIDENCE_RITUAL_READINESS_DOMAIN_TREE,
  createSceneContradictionThreadKit,
  createSceneDoubtPressureDialKit,
  createSceneEvidenceBoardPinKit,
  createSceneEvidenceRitualReadinessDomainKit,
  createSceneEvidenceRitualRendererHandoffKit,
  createSceneRitualSequenceRuneKit,
  createSceneVerdictDoorReadinessKit,
  createSceneWitnessStatementWebKit
} from "../experiments/_kits/peer-scene-transition/peer-scene-evidence-ritual-readiness-kits.js";

const scenes = {
  camp: { title: "Ash Road Camp", exits: { road: { to: "crossroads", label: "Walk" } } },
  crossroads: { title: "The Crossroads", exits: { forest: { to: "forest", label: "Forest", requires: ["has-lantern"] }, bridge: { to: "bridge", label: "Bridge" } } },
  forest: { title: "Lantern Forest", exits: { shrine: { to: "shrine", label: "Shrine", requires: ["forest-lit"] } } },
  bridge: { title: "Old Bridge", exits: { shrine: { to: "shrine", label: "Shrine", requires: ["bridge-repaired"] } } },
  shrine: { title: "Silent Shrine", exits: { ending: { to: "ending", label: "Finish", requires: ["shrine-open"] } } },
  ending: { title: "Dawn Ending", exits: { camp: { to: "camp", label: "Again" } } }
};

const cases = [
  { sceneId: "camp", state: { currentScene: "camp", inventory: [], visitedScenes: [], log: [] } },
  { sceneId: "camp", state: { currentScene: "camp", inventory: ["Lantern"], visitedScenes: ["camp"], log: ["took lantern"] } },
  { sceneId: "crossroads", state: { currentScene: "crossroads", inventory: ["has-lantern"], visitedScenes: ["camp", "crossroads"], log: [] } },
  { sceneId: "forest", state: { currentScene: "forest", inventory: ["has-lantern", "Forest sequence solved", "forest-lit"], visitedScenes: ["camp", "crossroads", "forest"], log: ["forest lit"] } },
  { sceneId: "bridge", state: { currentScene: "bridge", inventory: ["Bridge rope", "Bridge repaired", "bridge-repaired"], visitedScenes: ["camp", "crossroads", "bridge"], log: ["bridge repaired"] } },
  { sceneId: "shrine", state: { currentScene: "shrine", inventory: ["has-lantern", "forest-lit", "bridge-repaired"], visitedScenes: ["camp", "crossroads", "forest", "bridge", "shrine"], log: [] } },
  { sceneId: "ending", state: { currentScene: "ending", inventory: ["Lantern", "Bridge rope", "Forest sequence solved", "Bridge repaired", "Shrine opened", "shrine-open"], visitedScenes: Object.keys(scenes), log: ["done"] } },
  { sceneId: "crossroads", state: { currentScene: "crossroads", inventory: ["Map shard"], visitedScenes: ["camp"], pressureScore: 74, log: ["blocked", "blocked"] } },
  { sceneId: "forest", state: { currentScene: "forest", inventory: ["has-lantern", "Map shard", "Silver clue"], visitedScenes: ["camp", "crossroads"], pressureScore: 12, log: [] } },
  { sceneId: "camp", state: { currentScene: "camp", inventory: ["Lantern", "Bridge rope", "Forest sequence solved"], visitedScenes: ["camp", "crossroads", "forest"], pressureScore: 40, log: ["half ready"] } }
];

assert.ok(SCENE_EVIDENCE_RITUAL_READINESS_DOMAIN_TREE.includes("peer-scene-evidence-ritual-readiness-domain"));
assert.ok(SCENE_EVIDENCE_RITUAL_READINESS_DOMAIN_TREE.includes("renderer consumes descriptors only"));

const witnessKit = createSceneWitnessStatementWebKit();
const contradictionKit = createSceneContradictionThreadKit();
const evidenceKit = createSceneEvidenceBoardPinKit();
const ritualKit = createSceneRitualSequenceRuneKit();
const doubtKit = createSceneDoubtPressureDialKit();
const verdictKit = createSceneVerdictDoorReadinessKit();
const handoffKit = createSceneEvidenceRitualRendererHandoffKit();
const domainKit = createSceneEvidenceRitualReadinessDomainKit();

for (const [index, intake] of cases.entries()) {
  const input = { ...intake, scenes };
  const witness = witnessKit.describe(input);
  assert.equal(witness.length, 6, `case ${index}: witness web covers all scenes`);
  assert.ok(witness.some((web) => web.current), `case ${index}: current witness exists`);

  const contradictions = contradictionKit.describe(input);
  assert.ok(contradictions.length >= 5, `case ${index}: contradiction threads cover route exits`);
  assert.ok(contradictions.every((thread) => Array.isArray(thread.missing)), `case ${index}: missing requirements are arrays`);

  const pins = evidenceKit.describe(input);
  assert.ok(Array.isArray(pins), `case ${index}: evidence pins array`);
  assert.ok(pins.length <= 10, `case ${index}: evidence board is capped`);

  const runes = ritualKit.describe(input);
  assert.equal(runes.length, 6, `case ${index}: ritual runes cover route order`);
  assert.ok(runes.every((rune) => rune.completion >= 0 && rune.completion <= 1), `case ${index}: rune completion normalized`);

  const dials = doubtKit.describe(input);
  assert.equal(dials.length, 4, `case ${index}: doubt dials count`);
  assert.ok(dials.every((dial) => dial.value >= 0 && dial.value <= 1), `case ${index}: dial values normalized`);

  const verdict = verdictKit.describe(input);
  assert.equal(verdict.length, 1, `case ${index}: one verdict door`);
  assert.ok(verdict[0].readiness >= 0 && verdict[0].readiness <= 1, `case ${index}: verdict readiness normalized`);

  const handoff = handoffKit.describe({
    witnessStatementWebs: witness,
    contradictionThreads: contradictions,
    evidenceBoardPins: pins,
    ritualSequenceRunes: runes,
    doubtPressureDials: dials,
    verdictDoorReadiness: verdict
  });
  assert.equal(handoff.policy, "renderer-consumes-descriptors-only", `case ${index}: renderer handoff policy`);
  assert.equal(handoff.counts.witnessStatementWebs, witness.length, `case ${index}: handoff mirrors witness count`);
  assert.doesNotThrow(() => JSON.stringify(handoff), `case ${index}: handoff serializes`);

  const domain = domainKit.describe(input);
  assert.equal(domain.kitCount, 8, `case ${index}: composite kit count`);
  assert.equal(domain.counts.ritualSequenceRunes, 6, `case ${index}: domain emits rune descriptors`);
  assert.ok(domain.descriptorCount >= 17, `case ${index}: domain emits useful descriptor set`);
  assert.doesNotThrow(() => JSON.stringify(domain), `case ${index}: domain serializes`);
}

const source = await import("node:fs/promises").then((fs) => fs.readFile("experiments/_kits/peer-scene-transition/peer-scene-evidence-ritual-readiness-kits.js", "utf8"));
for (const forbidden of ["document", "window", "THREE", "WebGL", "AudioContext", "addEventListener", "requestAnimationFrame"]) {
  assert.ok(!source.includes(forbidden), `renderer-neutral kit avoids ${forbidden}`);
}

console.log("peer scene evidence ritual readiness kits smoke passed: 10 intake cases");
