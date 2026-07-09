import assert from "node:assert/strict";
import {
  SIGNAL_ISLES_STORM_SURGE_RELAY_READINESS_DOMAIN_TREE,
  createSignalIslesStormSurgeRelayReadinessDomainKit
} from "../experiments/_kits/nexus-frontier-signal-isles/signal-isles-storm-surge-relay-readiness-domain-kits.js";

function makeLevel() {
  return {
    seed: "test-signal-isles",
    scanSites: [
      { id: "scan-ruin-01", x: -7, z: -3, radius: 3, required: 1 },
      { id: "scan-ruin-02", x: 1.5, z: 5, radius: 3, required: 1 },
      { id: "scan-ruin-03", x: 7, z: -2.2, radius: 3, required: 1 }
    ],
    buildSites: [{ id: "build-site-01", structureId: "signal-mast-01", x: 0, z: 1, cost: { "signal-shards": 2 } }],
    gates: [{ id: "gate-01", x: 5, z: 1 }],
    resourceNodes: [
      { id: "resource-node-01", x: -3, z: 4, resourceId: "signal-shards", amount: 1 },
      { id: "resource-node-02", x: 3, z: -4, resourceId: "signal-shards", amount: 1 }
    ],
    cargo: [{ id: "cargo-01", x: 8, z: 3 }],
    sceneRecipe: { terrain: { radius: 20 }, objects: [{ id: "final-beacon", transform: { x: 11, z: 0 } }] }
  };
}

function makeCase(index) {
  const allFacts = ["scan.ruin.01", "scan.ruin.02", "scan.ruin.03", "build.signal-mast.01", "pressure.wave.01.survived", "lock.gate.01", "cargo.delivered.01"];
  const completedFacts = allFacts.slice(0, Math.min(allFacts.length, index));
  const placedStructureIds = completedFacts.includes("build.signal-mast.01") ? ["signal-mast-01"] : [];
  const harvestedNodeIds = completedFacts.includes("scan.ruin.02") ? ["resource-node-01"] : [];
  return {
    level: makeLevel(),
    preset: { tuning: { maxDelta: 0.05 } },
    session: {
      elapsed: index * 8.5,
      phase: completedFacts.includes("build.signal-mast.01") && !completedFacts.includes("pressure.wave.01.survived") ? "pressure" : "playing",
      player: { x: index, z: -index * 0.35, sporeLoad: index / 12 },
      completedFacts,
      placedStructureIds,
      harvestedNodeIds,
      cargoCarriedId: completedFacts.includes("lock.gate.01") && !completedFacts.includes("cargo.delivered.01") ? "cargo-01" : null,
      gateUnlocked: completedFacts.includes("lock.gate.01"),
      resources: { "signal-shards": Math.max(0, index - 2) }
    },
    sequence: { waitingFor: allFacts.filter((fact) => !completedFacts.includes(fact)) },
    kitStates: { scanSurvey: { completedTargetIds: completedFacts.filter((fact) => fact.startsWith("scan.")).map((fact) => fact.replace("scan.ruin.", "scan-ruin-0")) } },
    elapsed: index * 8.5
  };
}

const kit = createSignalIslesStormSurgeRelayReadinessDomainKit();
assert.equal(SIGNAL_ISLES_STORM_SURGE_RELAY_READINESS_DOMAIN_TREE.root, "signal-isles-storm-surge-relay-readiness-domain");
assert.equal(kit.tree.contract.includes("renderer consumes"), true);

const results = Array.from({ length: 10 }, (_, index) => kit.describe(makeCase(index)));
for (const [index, state] of results.entries()) {
  assert.equal(state.domain, "signal-isles-storm-surge-relay-readiness-domain", `case ${index} domain`);
  assert.ok(state.tideGaugeBeacons.length >= 3, `case ${index} tide gauges`);
  assert.ok(state.breakwaterBraceNodes.length >= 2, `case ${index} brace nodes`);
  assert.ok(state.skiffAnchorBuoys.length >= 3, `case ${index} skiff anchors`);
  assert.equal(state.flareMastPings.length, 2, `case ${index} flare pings`);
  assert.ok(state.evacuationRaftLanes.length >= 3, `case ${index} raft lanes`);
  assert.equal(state.surgeManifestLedgers.length, 1, `case ${index} manifest`);
  assert.ok(state.readiness >= 0 && state.readiness <= 1, `case ${index} readiness bounded`);
  assert.ok(state.pressure >= 0 && state.pressure <= 1, `case ${index} pressure bounded`);
  assert.ok(["stage", "hold", "launch"].includes(state.missionState), `case ${index} mission state`);
  assert.equal(state.rendererHandoff.contract.rendererMustOwn.includes("DOM"), true, `case ${index} renderer owns DOM`);
  assert.equal(state.rendererHandoff.counts.total, state.tideGaugeBeacons.length + state.breakwaterBraceNodes.length + state.skiffAnchorBuoys.length + state.flareMastPings.length + state.evacuationRaftLanes.length + state.surgeManifestLedgers.length, `case ${index} count total`);
  assert.doesNotThrow(() => JSON.stringify(state), `case ${index} JSON serializable`);
}
assert.ok(results.at(-1).readiness >= results[0].readiness, "readiness should not regress across completed objectives");
console.log("Signal Isles storm surge relay readiness kits smoke passed 10 intake cases.");
