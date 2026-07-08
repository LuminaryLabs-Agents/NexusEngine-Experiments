import assert from "node:assert/strict";
import {
  PEER_SCENE_CONSEQUENCE_DOMAIN_TREE,
  createSceneAllyPresenceKit,
  createSceneCauseLensKit,
  createSceneConsequenceDomainKit,
  createSceneConsequenceRendererHandoffKit,
  createSceneRewardPreviewKit,
  createSceneRiskDeltaKit,
  createSceneRouteConsequenceKit
} from "../experiments/_kits/peer-scene-transition/peer-scene-consequence-handoff-kits.js";

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
      shrine: { to: "shrine", label: "Find shrine", requires: ["forest-lit"] }
    }
  }
};

const manifestKit = { get: (id) => scenes[id] ?? scenes.camp };
const inventoryKit = {
  missing(state, requirements = []) {
    const tokens = new Set([...(state.tokens ?? []), ...(state.inventory ?? []), ...Object.keys(state.flags ?? {})]);
    return requirements.filter((requirement) => !tokens.has(requirement));
  }
};
const actionKit = {
  list(sceneId, state) {
    const hasLantern = state.tokens?.includes("has-lantern") || state.inventory?.includes("has-lantern");
    return [
      { id: "take-lantern", label: "Take lantern", done: hasLantern, blocked: false, missing: [] },
      { id: "repair-bridge", label: "Repair bridge", done: state.tokens?.includes("bridge-repaired"), blocked: !state.inventory?.includes("has-rope"), missing: ["has-rope"] },
      { id: "open-shrine", label: "Open shrine", done: state.tokens?.includes("shrine-open"), blocked: sceneId !== "shrine", missing: ["shrine"] }
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
    pressure: { score: Math.min(100, index * 11) },
    visitedSceneIds: index % 2 ? ["camp", "forest"] : ["camp"],
    actionLedger: Array.from({ length: Math.min(3, index + 1) }, (_, item) => ({ type: "action", label: `action-${item}` })),
    transitionLedger: index > 4 ? [{ from: "camp", to: "forest" }] : [],
    blockedLedger: Array.from({ length: index % 3 }, (_, item) => ({ type: "blocked", reason: `missing-${item}` }))
  };
}

const intakes = Array.from({ length: 10 }, (_, index) => ({ sceneId: index % 2 ? "forest" : "camp", state: makeState(index) }));

const causeLensKit = createSceneCauseLensKit({ manifestKit });
const riskDeltaKit = createSceneRiskDeltaKit({ manifestKit, inventoryKit });
const allyPresenceKit = createSceneAllyPresenceKit();
const routeConsequenceKit = createSceneRouteConsequenceKit({ manifestKit, inventoryKit });
const rewardPreviewKit = createSceneRewardPreviewKit({ actionKit });
const rendererHandoffKit = createSceneConsequenceRendererHandoffKit();
const consequenceDomainKit = createSceneConsequenceDomainKit({ manifestKit, inventoryKit, actionKit });

assert.equal(PEER_SCENE_CONSEQUENCE_DOMAIN_TREE.root, "peer-scene-consequence-domain");
assert.ok(PEER_SCENE_CONSEQUENCE_DOMAIN_TREE.contract.includes("no DOM"));

for (const { sceneId, state } of intakes) {
  const causeLens = causeLensKit.describe(sceneId, state);
  assert.equal(causeLensKit.id, "n-peer-scene-cause-lens-kit");
  assert.ok(causeLens.length >= 1);
  assert.ok(causeLens.every((lens) => lens.rendererBoundary.rendererMustNotOwn.includes("consequence synthesis")));

  const riskDelta = riskDeltaKit.describe(sceneId, state);
  assert.equal(riskDeltaKit.domain, "peer-scene-consequence/risk-delta");
  assert.ok(riskDelta.length >= 1);
  assert.ok(riskDelta.every((risk) => risk.severity >= 0 && risk.severity <= 1));

  const allyPresence = allyPresenceKit.describe(sceneId, state);
  assert.equal(allyPresence.length, 5);
  assert.ok(allyPresence.some((ally) => typeof ally.present === "boolean"));

  const routeConsequences = routeConsequenceKit.describe(sceneId, state);
  assert.ok(routeConsequences.length >= 1);
  assert.ok(routeConsequences.every((route) => route.weight >= 0 && route.weight <= 1));

  const rewardPreview = rewardPreviewKit.describe(sceneId, state);
  assert.equal(rewardPreview.length, 3);
  assert.ok(rewardPreview.every((reward) => ["claimed", "withheld", "available"].includes(reward.state)));

  const handoff = rendererHandoffKit.describe({ sceneId, causeLens, riskDelta, allyPresence, routeConsequences, rewardPreview, baseDescriptorId: "base" });
  assert.equal(handoff.rendererBoundary.owner, "scene-consequence-renderer-handoff-kit");
  assert.equal(handoff.counts.causeLens, causeLens.length);
  assert.ok(JSON.stringify(handoff).includes("renderer consumes descriptors only") || handoff.domainTree.subdomains.at(-1).contract.includes("renderer consumes descriptors only"));

  const domain = consequenceDomainKit.describe(sceneId, state, { baseHandoff: { id: "base-handoff" } });
  assert.equal(domain.counts.allyPresence, 5);
  assert.equal(domain.counts.rewardPreview, rewardPreview.length);
  assert.ok(JSON.stringify(domain).includes("browser input"));
}

console.log("peer scene consequence handoff smoke passed: 7 kit surfaces x 10 intake cases");
