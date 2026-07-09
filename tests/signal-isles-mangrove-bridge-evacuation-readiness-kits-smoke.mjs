import assert from "node:assert/strict";
import { createSignalIslesMangroveBridgeEvacuationReadinessDomainKit } from "../experiments/_kits/nexus-frontier-signal-isles/signal-isles-mangrove-bridge-evacuation-readiness-domain-kits.js";

const kit = createSignalIslesMangroveBridgeEvacuationReadinessDomainKit();
const baseLevel = Object.freeze({
  scanSites: [{ id: "tide-pole-east", x: -7.2, z: 0.8 }, { id: "tide-pole-west", x: 6.4, z: -1.2 }, { id: "mudflat-depth", x: 0.8, z: 6.3 }],
  buildSites: [{ id: "root-bridge-north", structureId: "root-bridge-01", x: -5.5, z: 3.4 }, { id: "root-bridge-south", structureId: "root-bridge-02", x: 4.8, z: -2.8 }],
  gates: [{ id: "safe-skiff-channel", x: 7.5, z: 2.1 }],
  resourceNodes: [{ id: "driftwood-cache-a", x: -6.2, z: -3.5 }, { id: "driftwood-cache-b", x: 5.2, z: 3.6 }, { id: "lantern-crab-c", x: 1.2, z: -5.2 }],
  cargo: [{ id: "flag-bundle", x: -2.5, z: -6.1 }],
  sceneRecipe: { objects: [{ id: "final-beacon", transform: { x: 11, z: 0 } }] }
});
function intake(overrides = {}) {
  return {
    level: baseLevel,
    session: { completedFacts: [], harvestedNodeIds: [], placedStructureIds: [], tidePressure: 0.34, stormPressure: 0.22, elapsed: 12, ...overrides.session },
    kitStates: { scanSurvey: { completedTargetIds: [], ...overrides.kitStates?.scanSurvey } },
    objective: { tidePressure: 0.34, stormPressure: 0.22, ...overrides.objective },
    environment: { visibilityBonus: 0, ...overrides.environment },
    elapsed: overrides.elapsed ?? 12
  };
}
const cases = [
  intake(),
  intake({ kitStates: { scanSurvey: { completedTargetIds: ["tide-pole-east"] } } }),
  intake({ session: { harvestedNodeIds: ["driftwood-cache-a"] } }),
  intake({ session: { placedStructureIds: ["root-bridge-01"] } }),
  intake({ session: { completedFacts: ["scan.mangrove.bridge", "tie.plank.causeway"] } }),
  intake({ session: { completedFacts: ["mark.safe.channel", "cargo.delivered.01"], cargoCarriedId: "flag-bundle" } }),
  intake({ session: { tidePressure: 0.82, stormPressure: 0.58 }, objective: { tidePressure: 0.82, stormPressure: 0.58 }, elapsed: 240 }),
  intake({ session: { completedFacts: ["scan.mangrove.bridge", "build.root.bridge.01", "tie.plank.causeway", "mark.safe.channel", "cargo.delivered.01"], harvestedNodeIds: ["driftwood-cache-a", "driftwood-cache-b"], placedStructureIds: ["root-bridge-01", "root-bridge-02"], gateUnlocked: true }, environment: { visibilityBonus: 0.12 } }),
  { level: {}, session: {}, kitStates: {}, objective: {}, environment: {}, elapsed: 0 },
  { level: { scanSites: null, buildSites: "bad", resourceNodes: undefined }, session: { completedFacts: "bad", tidePressure: "0.5" }, kitStates: { scanSurvey: { completedTargetIds: "bad" } }, elapsed: "33" }
];
const families = ["mangroveRootBridges", "plankCauseways", "tidePoleGauges", "rescueSkiffFlags", "crabLanternGuides", "duskBridgeLedgers"];
const states = new Set(["evacuation-open", "tide-risk", "bridge-lashing"]);
const outputs = cases.map((sample) => kit.describe(sample));
outputs.forEach((result, index) => {
  assert.equal(result.domain, "signal-isles-mangrove-bridge-evacuation-readiness-domain", `case ${index} domain`);
  assert.equal(result.tree.root, "signal-isles-mangrove-bridge-evacuation-readiness-domain", `case ${index} tree root`);
  assert.equal(result.kits.includes("signal-isles-mangrove-bridge-evacuation-renderer-handoff-kit"), true, `case ${index} kit list`);
  assert.equal(states.has(result.missionState), true, `case ${index} mission state ${result.missionState}`);
  assert.ok(result.readiness >= 0 && result.readiness <= 1, `case ${index} readiness bounds`);
  assert.ok(result.tideRisk >= 0 && result.tideRisk <= 1, `case ${index} tide risk bounds`);
  for (const family of families) {
    assert.ok(Array.isArray(result.descriptors[family]), `case ${index} descriptors ${family}`);
    assert.ok(result.rendererHandoff.counts[family] === result.descriptors[family].length, `case ${index} count ${family}`);
  }
  assert.ok(result.rendererHandoff.counts.total >= families.length, `case ${index} total descriptors`);
  assert.equal(result.rendererHandoff.ownership.rendererConsumesDescriptorsOnly, true, `case ${index} renderer handoff contract`);
  assert.ok(result.ownership.excludes.includes("DOM"), `case ${index} DOM exclusion`);
  assert.ok(result.ownership.excludes.includes("frame loop"), `case ${index} frame-loop exclusion`);
  assert.doesNotThrow(() => JSON.stringify(result), `case ${index} serializable`);
});
assert.ok(outputs[7].readiness > outputs[0].readiness, "prepared case improves readiness");
assert.ok(outputs[6].tideRisk >= outputs[0].tideRisk, "high tide case increases or preserves tide risk");
assert.equal(outputs.length, 10, "10 intake cases executed");
console.log("Signal Isles mangrove bridge evacuation readiness kits smoke passed 10 intake cases.");
