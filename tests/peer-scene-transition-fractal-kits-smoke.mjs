import assert from "node:assert/strict";
import {
  createPeerSceneDomainKit,
  createSceneActionKit,
  createSceneAmbientVariationKit,
  createSceneCompletionConstellationKit,
  createSceneGatePreviewKit,
  createSceneInventoryKit,
  createSceneManifestKit,
  createScenePuzzleHintKit,
  createSceneRendererHandoffKit,
  createSceneRouteGraphKit,
  createSceneStateKit,
  createSceneVisualDescriptorKit
} from "../experiments/_kits/peer-scene-transition/peer-scene-transition-kits.js";

const manifest = {
  camp: { title: "Camp", copy: "Start", entry: "./camp.html", exits: { road: { to: "crossroads", label: "Road" } } },
  crossroads: { title: "Crossroads", copy: "Split", entry: "./crossroads.html", exits: { forest: { to: "forest", label: "Forest", requires: ["has-lantern"] }, bridge: { to: "bridge", label: "Bridge" } } },
  forest: { title: "Forest", copy: "Light", entry: "./forest.html", exits: { shrine: { to: "shrine", label: "Shrine", requires: ["forest-lit"] } } },
  bridge: { title: "Bridge", copy: "Repair", entry: "./bridge.html", exits: { shrine: { to: "shrine", label: "Shrine", requires: ["bridge-repaired"] } } },
  shrine: { title: "Shrine", copy: "Seal", entry: "./shrine.html", exits: { ending: { to: "ending", label: "Finish", requires: ["shrine-open"] } } },
  ending: { title: "Ending", copy: "Done", entry: "./ending.html", exits: {} }
};

const manifestKit = createSceneManifestKit(manifest);
const stateKit = createSceneStateKit({ initialSceneId: "camp" });
const inventoryKit = createSceneInventoryKit();
const actionKit = createSceneActionKit({ inventoryKit });
const visualKit = createSceneVisualDescriptorKit({ manifestKit });

function makeState(sceneId = "camp") {
  return stateKit.normalize(null, sceneId);
}

// Route graph kit: 10 intake checks.
const routeGraphKit = createSceneRouteGraphKit({ manifestKit });
const graphState = makeState("crossroads");
let graph = routeGraphKit.describe(graphState);
assert.equal(routeGraphKit.id, "n-peer-scene-route-graph-kit");
assert.equal(routeGraphKit.domain, "scene-route-graph");
assert.equal(graph.nodes.length, 6);
assert.equal(graph.edges.length, 6);
assert.equal(graph.nodes.find((node) => node.id === "crossroads").current, true);
assert.equal(graph.nodes.find((node) => node.id === "camp").visited, false);
assert.equal(graph.edges.find((edge) => edge.from === "crossroads" && edge.to === "forest").gated, true);
inventoryKit.give(graphState, "has-lantern", "Lantern");
assert.equal(routeGraphKit.describe(graphState).edges.find((edge) => edge.to === "forest").gated, false);
assert.equal(routeGraphKit.snapshot(graphState).nodes, 6);
assert.equal(routeGraphKit.snapshot(graphState).edges, 6);

// Gate preview kit: 10 intake checks.
const gatePreviewKit = createSceneGatePreviewKit({ manifestKit, inventoryKit });
const gateState = makeState("crossroads");
let gates = gatePreviewKit.describe("crossroads", gateState);
assert.equal(gatePreviewKit.id, "n-peer-scene-gate-preview-kit");
assert.equal(gatePreviewKit.domain, "scene-gate-preview");
assert.equal(gates.length, 2);
assert.equal(gates[0].id, "crossroads-forest-gate");
assert.equal(gates[0].open, false);
assert.deepEqual(gates[0].missing, ["has-lantern"]);
assert.equal(gates[0].glyph, "sealed");
assert.equal(gates[1].open, true);
inventoryKit.give(gateState, "has-lantern", "Lantern");
assert.equal(gatePreviewKit.describe("crossroads", gateState)[0].open, true);
assert.deepEqual(gatePreviewKit.snapshot("crossroads", gateState), { sceneId: "crossroads", gates: 2, open: 2, sealed: 0 });

// Puzzle hint kit: 10 intake checks.
const puzzleHintKit = createScenePuzzleHintKit({ actionKit, inventoryKit });
const hintState = makeState("forest");
let hints = puzzleHintKit.describe("forest", hintState);
assert.equal(puzzleHintKit.id, "n-peer-scene-puzzle-hint-kit");
assert.equal(puzzleHintKit.domain, "scene-puzzle-hints");
assert.equal(hints.length, 3);
assert.equal(hints.find((hint) => hint.actionId === "call-moths").state, "ready");
assert.equal(hints.find((hint) => hint.actionId === "tune-lantern").state, "blocked");
assert.deepEqual(hints.find((hint) => hint.actionId === "tune-lantern").missing, ["forestMoths"]);
assert.equal(puzzleHintKit.next("forest", hintState).actionId, "call-moths");
inventoryKit.flag(hintState, "forestMoths");
assert.equal(puzzleHintKit.describe("forest", hintState).find((hint) => hint.actionId === "tune-lantern").state, "ready");
assert.equal(puzzleHintKit.snapshot("forest", hintState).hints, 3);
assert.equal(puzzleHintKit.snapshot("forest", hintState).ready, 1);

// Ambient variation kit: 10 intake checks.
const ambientVariationKit = createSceneAmbientVariationKit();
const ambientState = makeState("camp");
const ambient = ambientVariationKit.describe("camp", ambientState);
assert.equal(ambientVariationKit.id, "n-peer-scene-ambient-variation-kit");
assert.equal(ambientVariationKit.domain, "scene-ambient-variation");
assert.equal(ambient.length, 9);
assert.equal(ambient[0].id, "camp-ambient-0");
assert.equal(typeof ambient[0].x, "number");
assert.equal(typeof ambient[0].y, "number");
assert.ok(ambient[0].scale >= 0.45);
assert.ok(ambient[0].drift >= 0.18);
assert.equal(ambient[0].active, true);
assert.equal(ambientVariationKit.snapshot("camp", ambientState).particles, 9);
assert.ok(ambientVariationKit.snapshot("camp", ambientState).active >= 4);

// Completion constellation kit: 10 intake checks.
const completionConstellationKit = createSceneCompletionConstellationKit();
const constellationState = makeState("camp");
let constellation = completionConstellationKit.describe(constellationState);
assert.equal(completionConstellationKit.id, "n-peer-scene-completion-constellation-kit");
assert.equal(completionConstellationKit.domain, "scene-completion-constellation");
assert.equal(constellation.stars.length, 5);
assert.equal(constellation.links.length, 4);
assert.equal(constellation.completion, 0);
assert.equal(constellation.stars[0].lit, false);
inventoryKit.give(constellationState, "has-lantern", "Lantern");
assert.equal(completionConstellationKit.describe(constellationState).stars[0].lit, true);
assert.equal(completionConstellationKit.describe(constellationState).completion, 20);
assert.equal(completionConstellationKit.snapshot(constellationState).stars, 5);
assert.equal(completionConstellationKit.snapshot(constellationState).lit, 1);
assert.equal(completionConstellationKit.snapshot(constellationState).completion, 20);

// Renderer handoff kit: 10 intake checks.
const rendererHandoffKit = createSceneRendererHandoffKit();
const handoffState = makeState("camp");
const handoff = rendererHandoffKit.describe({
  sceneDescriptor: visualKit.describe("camp", handoffState),
  routeGraph: routeGraphKit.describe(handoffState),
  gatePreview: gatePreviewKit.describe("camp", handoffState),
  puzzleHints: puzzleHintKit.describe("camp", handoffState),
  ambientVariation: ambientVariationKit.describe("camp", handoffState),
  completionConstellation: completionConstellationKit.describe(handoffState)
});
assert.equal(rendererHandoffKit.id, "n-peer-scene-renderer-handoff-kit");
assert.equal(rendererHandoffKit.domain, "scene-renderer-handoff");
assert.equal(handoff.sceneId, "camp");
assert.ok(handoff.rendererOwns.includes("DOM insertion"));
assert.ok(handoff.rendererMustNotOwn.includes("scene state"));
assert.equal(handoff.descriptorCounts.routeNodes, 6);
assert.equal(handoff.descriptorCounts.gates, 1);
assert.equal(handoff.descriptorCounts.hints, 3);
assert.equal(handoff.descriptorCounts.ambientParticles, 9);
assert.equal(rendererHandoffKit.snapshot(handoff).constellationStars, 5);

// Composite peer scene domain kit: 10 intake checks.
const peerSceneDomainKit = createPeerSceneDomainKit({ manifestKit, inventoryKit, actionKit, visualKit });
const domainState = makeState("camp");
const domainHandoff = peerSceneDomainKit.describe("camp", domainState);
assert.equal(peerSceneDomainKit.id, "n-peer-scene-domain-kit");
assert.equal(peerSceneDomainKit.domain, "peer-scene-domain");
assert.equal(Object.keys(peerSceneDomainKit.kits).length, 6);
assert.equal(domainHandoff.descriptors.scene.sceneId, "camp");
assert.equal(domainHandoff.descriptors.routeGraph.nodes.length, 6);
assert.equal(domainHandoff.descriptors.gatePreview.length, 1);
assert.equal(domainHandoff.descriptors.puzzleHints.length, 3);
assert.equal(domainHandoff.descriptors.ambientVariation.length, 9);
assert.equal(domainHandoff.descriptors.completionConstellation.stars.length, 5);
assert.equal(peerSceneDomainKit.snapshot("camp", domainState).kitCount, 6);
assert.equal(peerSceneDomainKit.snapshot("camp", domainState).handoff.ambientParticles, 9);

console.log("peer scene transition fractal kits smoke passed: 70 intake cases");
