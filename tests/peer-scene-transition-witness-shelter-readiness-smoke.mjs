import assert from "node:assert/strict";
import {
  PEER_SCENE_WITNESS_SHELTER_READINESS_DOMAIN_TREE,
  createSceneBridgeEscortRopeKit,
  createSceneDawnTestimonyQueueKit,
  createSceneEvidenceBundleSealKit,
  createSceneForestWatchLanternKit,
  createSceneLostWitnessTrailKit,
  createSceneShelterHearthReadinessKit,
  createSceneWitnessShelterReadinessDomainKit,
  createSceneWitnessShelterRendererHandoffKit
} from "../experiments/_kits/peer-scene-transition/peer-scene-witness-shelter-readiness-kits.js";

const scenes = {
  camp: { title: "Camp", landmarks: ["fire", "pack", "trail"], exits: { road: { to: "crossroads", label: "Road" } } },
  crossroads: { title: "Crossroads", landmarks: ["stones", "sign", "ruts"], exits: { forest: { to: "forest", label: "Forest", requires: ["has-lantern"] }, bridge: { to: "bridge", label: "Bridge", requires: ["has-rope"] } } },
  forest: { title: "Forest", landmarks: ["moss", "lantern", "root"], exits: { shrine: { to: "shrine", label: "Shrine", requires: ["forest-lit"] } } },
  bridge: { title: "Bridge", landmarks: ["river", "planks", "rope"], exits: { shrine: { to: "shrine", label: "Shrine", requires: ["bridge-repaired"] } } },
  shrine: { title: "Shrine", landmarks: ["seal", "door", "dawn"], exits: { ending: { to: "ending", label: "Finish", requires: ["shrine-open"] } } }
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
      { id: "check-witness", label: "Check witness", done: tokens.has("camp-witness-safe"), blocked: false, missing: [] },
      { id: "light-forest", label: "Light forest", done: tokens.has("forest-lit"), blocked: !tokens.has("has-lantern"), missing: ["has-lantern"] },
      { id: "escort-bridge", label: "Escort bridge", done: tokens.has("bridge-repaired"), blocked: !tokens.has("has-rope"), missing: ["has-rope"] }
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
    tokens,
    inventory: tokens.filter((token) => token.startsWith("has-")),
    flags: index > 8 ? { "shrine-open": true } : {},
    pressure: { score: Math.min(100, index * 11) },
    visitedSceneIds: index % 2 ? ["camp", "crossroads", "forest"] : ["camp"],
    actionLedger: Array.from({ length: Math.min(5, index + 1) }, (_, item) => ({ id: `action-${item}`, label: `action-${item}` })),
    transitionLedger: index > 4 ? [{ from: "camp", to: "forest" }] : [],
    blockedLedger: Array.from({ length: index % 4 }, (_, item) => ({ reason: `missing-${item}` }))
  };
}

const intakes = Array.from({ length: 10 }, (_, index) => ({ sceneId: ["camp", "crossroads", "forest", "bridge", "shrine"][index % 5], state: makeState(index) }));

const lostWitnessTrailKit = createSceneLostWitnessTrailKit({ manifestKit });
const shelterHearthReadinessKit = createSceneShelterHearthReadinessKit({ actionKit });
const bridgeEscortRopeKit = createSceneBridgeEscortRopeKit({ manifestKit, inventoryKit });
const forestWatchLanternKit = createSceneForestWatchLanternKit({ manifestKit });
const evidenceBundleSealKit = createSceneEvidenceBundleSealKit();
const dawnTestimonyQueueKit = createSceneDawnTestimonyQueueKit({ manifestKit });
const rendererHandoffKit = createSceneWitnessShelterRendererHandoffKit();
const domainKit = createSceneWitnessShelterReadinessDomainKit({ manifestKit, inventoryKit, actionKit });

assert.equal(PEER_SCENE_WITNESS_SHELTER_READINESS_DOMAIN_TREE.root, "peer-scene-witness-shelter-readiness-domain");
assert.ok(PEER_SCENE_WITNESS_SHELTER_READINESS_DOMAIN_TREE.contract.includes("no renderer"));
assert.ok(PEER_SCENE_WITNESS_SHELTER_READINESS_DOMAIN_TREE.subdomains.at(-1).contract.includes("renderer consumes descriptors only"));

for (const { sceneId, state } of intakes) {
  const lostWitnessTrails = lostWitnessTrailKit.describe(sceneId, state);
  assert.equal(lostWitnessTrails.length, 5);
  assert.ok(lostWitnessTrails.every((trail) => trail.urgency >= 0 && trail.urgency <= 1));
  assert.ok(lostWitnessTrails.every((trail) => trail.rendererBoundary.rendererMustNotOwn.includes("witness safety truth")));

  const shelterHearths = shelterHearthReadinessKit.describe(sceneId, state);
  assert.equal(shelterHearths.length, 4);
  assert.ok(shelterHearths.every((hearth) => ["warm", "watch", "cold"].includes(hearth.status)));

  const bridgeEscortRopes = bridgeEscortRopeKit.describe(sceneId, state);
  assert.ok(bridgeEscortRopes.length >= 1);
  assert.ok(bridgeEscortRopes.every((rope) => rope.ropeTension >= 0 && rope.ropeTension <= 1));

  const forestWatchLanterns = forestWatchLanternKit.describe(sceneId, state);
  assert.ok(forestWatchLanterns.length >= 3);
  assert.ok(forestWatchLanterns.every((lantern) => ["clear", "dim", "blind"].includes(lantern.state)));

  const evidenceBundleSeals = evidenceBundleSealKit.describe(sceneId, state);
  assert.ok(evidenceBundleSeals.length >= 1);
  assert.ok(evidenceBundleSeals.every((seal) => ["sealed", "loose"].includes(seal.state)));

  const dawnTestimonyQueue = dawnTestimonyQueueKit.describe(sceneId, state);
  assert.ok(dawnTestimonyQueue.length >= 1);
  assert.ok(dawnTestimonyQueue.every((entry) => entry.readiness >= 0 && entry.readiness <= 1));

  const handoff = rendererHandoffKit.describe({ sceneId, lostWitnessTrails, shelterHearths, bridgeEscortRopes, forestWatchLanterns, evidenceBundleSeals, dawnTestimonyQueue, baseDescriptorId: "base" });
  assert.equal(handoff.handoff, "renderer-consumes-descriptors-only");
  assert.equal(handoff.counts.lostWitnessTrails, lostWitnessTrails.length);
  assert.ok(JSON.stringify(handoff).includes("browser input"));

  const domain = domainKit.describe(sceneId, state, { baseHandoff: { id: "base-handoff" } });
  assert.equal(domain.descriptorCount, Object.values(domain.counts).reduce((sum, count) => sum + count, 0));
  assert.ok(JSON.stringify(domain).includes("renderer consumes descriptors only"));
}

console.log("peer scene witness shelter readiness kit smoke passed: 8 kit surfaces x 10 intake cases");
