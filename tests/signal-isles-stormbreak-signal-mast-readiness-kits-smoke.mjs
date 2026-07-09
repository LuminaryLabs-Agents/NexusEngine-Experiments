import assert from "node:assert/strict";
import { createSignalIslesStormbreakSignalMastReadinessDomainKit } from "../experiments/_kits/nexus-frontier-signal-isles/signal-isles-stormbreak-signal-mast-readiness-domain-kits.js";

function caseInput(index) {
  const completedFacts = [
    index >= 1 ? "scan.signal.mast" : null,
    index >= 3 ? "build.signal-mast.01" : null,
    index >= 5 ? "ground.lightning.01" : null,
    index >= 7 ? "relay.mirror.chain" : null,
    index >= 8 ? "cargo.delivered.01" : null
  ].filter(Boolean);
  return {
    elapsed: index * 18,
    level: {
      scanSites: [{ id: "wind-notch-east", x: -7, z: -2 }, { id: "wind-notch-west", x: 7, z: 3 }],
      buildSites: [{ id: "mast-pad-north", structureId: "signal-mast-01", x: -4, z: 2 }, { id: "mast-pad-south", structureId: "signal-mast-02", x: 5, z: -3 }],
      resourceNodes: [{ id: "basalt-anchor-a", x: -6, z: 4 }, { id: "basalt-anchor-b", x: 6, z: -4 }, { id: "copper-spool-cache", x: -2, z: -5 }],
      cargo: [{ id: "copper-rod-cargo", x: 8, z: 3 }],
      gates: [{ id: "stormbreak-relay-gate", x: 5, z: 1 }],
      sceneRecipe: { objects: [{ id: "final-beacon", transform: { x: 11, z: 0 } }] }
    },
    session: {
      completedFacts,
      completedTargetIds: [],
      placedStructureIds: index >= 4 ? ["signal-mast-01"] : [],
      harvestedNodeIds: index >= 4 ? ["basalt-anchor-a", "copper-spool-cache"] : index >= 2 ? ["basalt-anchor-a"] : [],
      cargoCarriedId: index >= 6 ? "copper-rod-cargo" : null,
      gateUnlocked: index >= 8,
      stormPressure: Math.max(0.05, 0.72 - index * 0.055),
      tidePressure: Math.max(0.08, 0.5 - index * 0.035)
    },
    objective: { stormPressure: Math.max(0.08, 0.7 - index * 0.05) },
    environment: { visibilityBonus: index >= 6 ? 0.08 : 0 },
    kitStates: { scanSurvey: { completedTargetIds: index >= 2 ? ["wind-notch-east", "wind-notch-west"] : [] } }
  };
}

const domain = createSignalIslesStormbreakSignalMastReadinessDomainKit();
assert.equal(domain.id, "signal-isles-stormbreak-signal-mast-readiness-domain-kit");
assert.equal(domain.tree.root, "signal-isles-stormbreak-signal-mast-readiness-domain");
assert.equal(domain.kits.length, 8);
assert.ok(domain.forbiddenOwnership.includes("renderer"));
assert.ok(domain.forbiddenOwnership.includes("DOM"));
assert.ok(domain.forbiddenOwnership.includes("frame loop"));

const expectedKeys = [
  "lightningMasts",
  "guywireAnchors",
  "windsockRibbons",
  "copperGroundRods",
  "relayMirrorChains",
  "dawnSignalLedgers"
];

const cases = Array.from({ length: 10 }, (_, index) => caseInput(index));
let priorReadiness = -1;
for (const [index, input] of cases.entries()) {
  const result = domain.describe(input);
  assert.equal(result.id, "signal-isles-stormbreak-signal-mast-readiness");
  assert.ok(result.readiness >= 0 && result.readiness <= 1, `case ${index} readiness bounded`);
  assert.ok(result.stormPressure >= 0 && result.stormPressure <= 1, `case ${index} storm pressure bounded`);
  assert.ok(["rigging", "stormbreak-risk", "broadcast"].includes(result.missionState), `case ${index} mission state enum`);
  assert.deepEqual(Object.keys(result.descriptors), expectedKeys);
  assert.equal(result.rendererHandoff.id, "signal-isles-stormbreak-signal-mast-renderer-handoff");
  assert.equal(result.rendererHandoff.counts.total, Object.values(result.descriptors).flat().length);
  assert.ok(result.descriptors.lightningMasts.every((item) => item.kind === "signal-isles-lightning-mast"));
  assert.ok(result.descriptors.guywireAnchors.every((item) => item.kind === "signal-isles-guywire-anchor"));
  assert.ok(result.descriptors.windsockRibbons.every((item) => item.kind === "signal-isles-windsock-ribbon"));
  assert.ok(result.descriptors.copperGroundRods.every((item) => item.kind === "signal-isles-copper-ground-rod"));
  assert.ok(result.descriptors.relayMirrorChains.every((item) => item.kind === "signal-isles-relay-mirror-chain"));
  assert.equal(result.descriptors.dawnSignalLedgers[0].kind, "signal-isles-dawn-signal-ledger");
  assert.ok(result.ownership.rendererConsumesDescriptorsOnly);
  assert.ok(!JSON.stringify(result).includes("WebGLRenderingContext"));
  JSON.stringify(result);
  if (index > 3) assert.ok(result.readiness >= priorReadiness - 0.22, `case ${index} readiness should not collapse`);
  priorReadiness = result.readiness;
}

const cold = domain.describe(cases[0]);
const prepared = domain.describe(cases[9]);
assert.ok(prepared.readiness > cold.readiness, "prepared signal mast should improve readiness");
assert.equal(prepared.missionState, "broadcast");
assert.equal(prepared.descriptors.dawnSignalLedgers[0].blockerCount, 0);

console.log("Signal Isles stormbreak signal mast readiness kits smoke passed 10 intake cases.");
