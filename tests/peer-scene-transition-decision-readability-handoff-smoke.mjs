import assert from "node:assert/strict";
import {
  PEER_SCENE_DECISION_READABILITY_DOMAIN_TREE,
  createSceneActionLikelihoodRadarKit,
  createSceneDecisionReadabilityDomainKit,
  createSceneDecisionReadabilityRendererHandoffKit,
  createSceneExitChoiceScorecardKit,
  createSceneGateRequirementLadderKit,
  createSceneInventoryUseEchoKit,
  createSceneNarrativeThreadPinKit,
  createScenePressureReleaseWindowKit
} from "../experiments/_kits/peer-scene-transition/peer-scene-decision-readability-handoff-kits.js";

const scenes = {
  camp: {
    title: "Camp",
    mood: "ember",
    palette: ["#172033", "#f2c36b", "#eaf6ff"],
    landmarks: ["fire", "pack", "trail"],
    exits: {
      forest: { to: "forest", label: "Enter forest", requires: ["has-lantern"] },
      bridge: { to: "bridge", label: "Take bridge path", requires: ["has-rope"] }
    }
  },
  forest: {
    title: "Forest",
    mood: "mist",
    palette: ["#10251d", "#8ee6b2", "#d9fff1"],
    landmarks: ["moss", "lantern", "tracks"],
    exits: {
      shrine: { to: "shrine", label: "Find shrine", requires: ["forest-lit"] },
      camp: { to: "camp", label: "Return to camp" }
    }
  },
  shrine: {
    title: "Shrine",
    mood: "quiet",
    palette: ["#1d1631", "#d9b8ff", "#fff7d6"],
    landmarks: ["seal", "door", "dawn"],
    exits: {
      ending: { to: "ending", label: "Finish", requires: ["shrine-open"] }
    }
  }
};

const manifestKit = {
  get: (id) => scenes[id] ?? scenes.camp,
  list: () => Object.entries(scenes).map(([id, scene]) => ({ id, ...scene }))
};
const inventoryKit = {
  missing(state, requirements = []) {
    const tokens = new Set([...(state.tokens ?? []), ...(state.inventory ?? []), ...Object.keys(state.flags ?? {})]);
    return requirements.filter((requirement) => !tokens.has(requirement));
  }
};
const actionKit = {
  list(sceneId, state) {
    const tokens = new Set([...(state.tokens ?? []), ...(state.inventory ?? []), ...Object.keys(state.flags ?? {})]);
    return [
      { id: "take-lantern", label: "Take lantern", done: tokens.has("has-lantern"), blocked: false, missing: [] },
      { id: "repair-bridge", label: "Repair bridge", done: tokens.has("bridge-repaired"), blocked: !tokens.has("has-rope"), missing: ["has-rope"] },
      { id: "open-shrine", label: "Open shrine", done: tokens.has("shrine-open"), blocked: sceneId !== "shrine", missing: ["shrine"] }
    ];
  }
};

function makeState(index) {
  const tokens = [];
  if (index > 1) tokens.push("has-lantern");
  if (index > 3) tokens.push("has-rope");
  if (index > 5) tokens.push("forest-lit");
  if (index > 7) tokens.push("bridge-repaired");
  return {
    inventory: tokens.filter((token) => token.startsWith("has-")),
    tokens,
    flags: index > 8 ? { "shrine-open": true } : {},
    pressure: { score: Math.min(100, index * 12) },
    visitedSceneIds: index % 2 ? ["camp", "forest"] : ["camp"],
    actionLedger: Array.from({ length: Math.min(4, index + 1) }, (_, item) => ({ type: "action", label: `action-${item}` })),
    transitionLedger: index > 4 ? [{ from: "camp", to: "forest" }] : [],
    blockedLedger: Array.from({ length: index % 4 }, (_, item) => ({ type: "blocked", reason: `missing-${item}` }))
  };
}

const intakes = Array.from({ length: 10 }, (_, index) => ({ sceneId: index % 3 === 0 ? "shrine" : index % 2 ? "forest" : "camp", state: makeState(index) }));

const actionLikelihoodRadarKit = createSceneActionLikelihoodRadarKit({ actionKit });
const gateRequirementLadderKit = createSceneGateRequirementLadderKit({ manifestKit, inventoryKit });
const inventoryUseEchoKit = createSceneInventoryUseEchoKit({ manifestKit });
const pressureReleaseWindowKit = createScenePressureReleaseWindowKit({ actionKit });
const narrativeThreadPinKit = createSceneNarrativeThreadPinKit({ manifestKit });
const exitChoiceScorecardKit = createSceneExitChoiceScorecardKit({ manifestKit, inventoryKit });
const rendererHandoffKit = createSceneDecisionReadabilityRendererHandoffKit();
const decisionReadabilityDomainKit = createSceneDecisionReadabilityDomainKit({ manifestKit, inventoryKit, actionKit });

assert.equal(PEER_SCENE_DECISION_READABILITY_DOMAIN_TREE.root, "peer-scene-decision-readability-domain");
assert.ok(PEER_SCENE_DECISION_READABILITY_DOMAIN_TREE.contract.includes("no renderer"));
assert.ok(PEER_SCENE_DECISION_READABILITY_DOMAIN_TREE.subdomains.at(-1).contract.includes("renderer consumes descriptors only"));

for (const { sceneId, state } of intakes) {
  const actionLikelihood = actionLikelihoodRadarKit.describe(sceneId, state);
  assert.equal(actionLikelihoodRadarKit.id, "n-peer-scene-action-likelihood-radar-kit");
  assert.equal(actionLikelihood.length, 3);
  assert.ok(actionLikelihood.every((action) => action.likelihood >= 0 && action.likelihood <= 1));
  assert.ok(actionLikelihood.every((action) => action.rendererBoundary.rendererMustNotOwn.includes("decision ranking")));

  const gateRequirements = gateRequirementLadderKit.describe(sceneId, state);
  assert.ok(gateRequirements.length >= 1);
  assert.ok(gateRequirements.every((gate) => gate.height >= 0 && gate.height <= 1));
  assert.ok(gateRequirements.some((gate) => typeof gate.open === "boolean"));

  const inventoryUseEchoes = inventoryUseEchoKit.describe(sceneId, state);
  assert.ok(inventoryUseEchoes.length >= 1);
  assert.ok(inventoryUseEchoes.every((echo) => ["route-key", "context", "missing"].includes(echo.relevance)));

  const pressureReleaseWindows = pressureReleaseWindowKit.describe(sceneId, state);
  assert.ok(pressureReleaseWindows.length >= 1);
  assert.ok(pressureReleaseWindows.every((window) => window.relief >= 0 && window.relief <= 1));

  const narrativeThreadPins = narrativeThreadPinKit.describe(sceneId, state);
  assert.equal(narrativeThreadPins.length, 3);
  assert.ok(narrativeThreadPins.some((pin) => pin.current));

  const exitChoiceScorecards = exitChoiceScorecardKit.describe(sceneId, state);
  assert.ok(exitChoiceScorecards.length >= 1);
  assert.ok(exitChoiceScorecards.every((choice) => choice.score >= 0 && choice.score <= 1));

  const handoff = rendererHandoffKit.describe({ sceneId, actionLikelihood, gateRequirements, inventoryUseEchoes, pressureReleaseWindows, narrativeThreadPins, exitChoiceScorecards, baseDescriptorId: "base" });
  assert.equal(handoff.rendererBoundary.owner, "scene-decision-readability-renderer-handoff-kit");
  assert.equal(handoff.counts.actionLikelihood, actionLikelihood.length);
  assert.equal(handoff.counts.gateRequirements, gateRequirements.length);
  assert.ok(JSON.stringify(handoff).includes("browser input"));

  const domain = decisionReadabilityDomainKit.describe(sceneId, state, { baseHandoff: { id: "base-handoff" } });
  assert.equal(domain.counts.narrativeThreadPins, 3);
  assert.equal(domain.counts.exitChoiceScorecards, exitChoiceScorecards.length);
  assert.ok(JSON.stringify(domain).includes("renderer consumes descriptors only"));
}

console.log("peer scene decision readability handoff smoke passed: 8 kit surfaces x 10 intake cases");
