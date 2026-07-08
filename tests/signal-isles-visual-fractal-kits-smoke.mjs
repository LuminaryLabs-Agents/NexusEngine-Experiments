import assert from "node:assert/strict";
import { signalIslesLevel01 } from "../experiments/nexus-frontier-signal-isles/src/level-01.js";
import { signalIslesPreset } from "../experiments/nexus-frontier-signal-isles/src/signal-isles-preset.js";
import {
  createSignalIslesIslandReliefCellKit,
  createSignalIslesSignalFlowThreadKit,
  createSignalIslesHazardPressureFrontKit,
  createSignalIslesResourceShardClusterKit,
  createSignalIslesBuildGhostReadoutKit,
  createSignalIslesObjectiveBeaconCompassKit,
  createSignalIslesRendererHandoffKit,
  createSignalIslesVisualFractalDomainKit
} from "../experiments/_kits/nexus-frontier-signal-isles/signal-isles-visual-fractal-domain-kits.js";

const objective = { current: signalIslesLevel01.objectives[0], completedFacts: [], completedObjectives: [], completed: false };
const basePlayer = { ...signalIslesLevel01.playerStart };
const baseSession = {
  elapsed: 0,
  frame: 0,
  phase: "playing",
  player: basePlayer,
  resources: { "signal-shards": 0 },
  harvestedNodeIds: [],
  placedStructureIds: [],
  completedFacts: [],
  completedObjectives: [],
  waveStarted: false,
  cargoCarriedId: null,
  gateUnlocked: false,
  completed: false
};

const cases = [
  { id: "spawn", session: baseSession },
  { id: "scan-one", session: { ...baseSession, elapsed: 2, completedFacts: ["scan.ruin.01"], completedObjectives: ["scan-ruin-01"] } },
  { id: "scan-two", session: { ...baseSession, elapsed: 4, completedFacts: ["scan.ruin.01", "scan.ruin.02"], completedObjectives: ["scan-ruin-01", "scan-ruin-02"] } },
  { id: "resource-one", session: { ...baseSession, elapsed: 6, resources: { "signal-shards": 2 }, harvestedNodeIds: ["resource-node-01"], completedFacts: ["resource.node.01"] } },
  { id: "build-ready", session: { ...baseSession, elapsed: 8, resources: { "signal-shards": 3 }, completedFacts: ["resource.node.01", "resource.node.02"] } },
  { id: "mast-built", session: { ...baseSession, elapsed: 10, resources: { "signal-shards": 0 }, placedStructureIds: ["signal-mast-01"], completedFacts: ["build.signal-mast.01"] } },
  { id: "pressure", session: { ...baseSession, elapsed: 18, phase: "pressure", waveStarted: true, placedStructureIds: ["signal-mast-01"], completedFacts: ["build.signal-mast.01"] }, kitStates: { agentGroup: { agents: { agent01: { x: -4, z: 4 }, agent02: { x: 7, y: -6 } } } } },
  { id: "gate-open", session: { ...baseSession, elapsed: 26, gateUnlocked: true, completedFacts: ["scan.ruin.01", "scan.ruin.02", "build.signal-mast.01", "pressure.wave.01.survived", "lock.gate.01"] } },
  { id: "cargo-carried", session: { ...baseSession, elapsed: 32, gateUnlocked: true, cargoCarriedId: "cargo-01", completedFacts: ["cargo.picked.01"] } },
  { id: "complete", session: { ...baseSession, elapsed: 44, completed: true, gateUnlocked: true, completedFacts: ["scan.ruin.01", "scan.ruin.02", "scan.ruin.03", "resource.node.01", "resource.node.02", "build.signal-mast.01", "pressure.wave.01.survived", "lock.gate.01", "route.checkpoint.01", "cargo.picked.01", "cargo.delivered.01", "final.beacon.activated"], completedObjectives: signalIslesLevel01.objectives.map((entry) => entry.id) } }
];

const kitFactories = [
  createSignalIslesIslandReliefCellKit,
  createSignalIslesSignalFlowThreadKit,
  createSignalIslesHazardPressureFrontKit,
  createSignalIslesResourceShardClusterKit,
  createSignalIslesBuildGhostReadoutKit,
  createSignalIslesObjectiveBeaconCompassKit,
  createSignalIslesRendererHandoffKit,
  createSignalIslesVisualFractalDomainKit
];

for (const factory of kitFactories) {
  const kit = factory();
  assert.equal(typeof kit.describe, "function", `${kit.id} should expose describe()`);
}

const domain = createSignalIslesVisualFractalDomainKit();
assert.equal(domain.domainTree.id, "signal-isles-visual-fractal-domain");
assert.ok(domain.domainTree.subdomains.length >= 5, "domain should split into small subdomains");

for (const entry of cases) {
  const state = domain.describe({
    level: signalIslesLevel01,
    preset: signalIslesPreset,
    session: entry.session,
    objective,
    sequence: { activeSequenceId: "intro-sequence" },
    kitStates: entry.kitStates ?? { agentGroup: { agents: {} } }
  });
  assert.ok(state.islandRelief.cells.length >= 4, `${entry.id} should describe relief cells`);
  assert.ok(state.signalFlow.threads.length >= 5, `${entry.id} should describe signal flow threads`);
  assert.ok(state.hazardPressure.rings.length >= 1, `${entry.id} should describe pressure fronts`);
  assert.ok(state.resourceShards.shards.length >= 15, `${entry.id} should describe resource and cargo sparks`);
  assert.equal(state.buildGhosts.ghosts.length, signalIslesLevel01.buildSites.length, `${entry.id} should describe build ghost readout`);
  assert.equal(state.beaconCompass.compass.kind, "objective-beacon-compass", `${entry.id} should describe objective compass`);
  assert.equal(state.rendererHandoff.contract.rendererConsumesDescriptorsOnly, true, `${entry.id} should preserve renderer handoff contract`);
  assert.ok(state.rendererHandoff.counts.signalThreads >= 5, `${entry.id} should count signal threads`);
  const serialized = JSON.stringify(state.rendererHandoff.descriptors);
  assert.ok(serialized.length > 256, `${entry.id} descriptors should serialize with useful payload`);
  for (const forbidden of ["document", "querySelector", "addEventListener", "AudioContext", "WebGLRenderer", "requestAnimationFrame"]) {
    assert.equal(serialized.includes(forbidden), false, `${entry.id} descriptors should not own ${forbidden}`);
  }
}

console.log("Signal Isles visual fractal kit smoke passed.");
