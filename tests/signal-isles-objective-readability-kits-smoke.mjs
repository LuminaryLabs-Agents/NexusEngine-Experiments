import assert from "node:assert/strict";
import { signalIslesLevel01 } from "../experiments/nexus-frontier-signal-isles/src/level-01.js";
import { signalIslesPreset } from "../experiments/nexus-frontier-signal-isles/src/signal-isles-preset.js";
import {
  createSignalIslesObjectiveStepQueueKit,
  createSignalIslesProximityActionCueKit,
  createSignalIslesGateDependencyThreadKit,
  createSignalIslesCargoRouteRibbonKit,
  createSignalIslesPressureSafePocketKit,
  createSignalIslesResourceBuildDeltaKit,
  createSignalIslesObjectiveRendererHandoffKit,
  createSignalIslesObjectiveReadabilityDomainKit
} from "../experiments/_kits/nexus-frontier-signal-isles/signal-isles-objective-readability-domain-kits.js";

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
  { id: "spawn", session: baseSession, objectiveIndex: 0 },
  { id: "near-scan", session: { ...baseSession, elapsed: 1, player: { ...basePlayer, x: -8, z: -6 } }, objectiveIndex: 0 },
  { id: "scan-one", session: { ...baseSession, elapsed: 2, completedFacts: ["scan.ruin.01"] }, objectiveIndex: 0 },
  { id: "scan-two", session: { ...baseSession, elapsed: 4, completedFacts: ["scan.ruin.01", "scan.ruin.02"], completedObjectives: ["scan-two-ruins"] }, objectiveIndex: 1 },
  { id: "resource-one", session: { ...baseSession, elapsed: 6, resources: { "signal-shards": 2 }, harvestedNodeIds: ["resource-node-01"], completedFacts: ["resource.node.01"] }, objectiveIndex: 1 },
  { id: "build-ready", session: { ...baseSession, elapsed: 8, resources: { "signal-shards": 3 }, completedFacts: ["resource.node.01", "resource.node.02"] }, objectiveIndex: 1 },
  { id: "mast-built", session: { ...baseSession, elapsed: 10, resources: { "signal-shards": 0 }, placedStructureIds: ["signal-mast-01"], completedFacts: ["build.signal-mast.01"] }, objectiveIndex: 2 },
  { id: "pressure", session: { ...baseSession, elapsed: 18, phase: "pressure", waveStarted: true, placedStructureIds: ["signal-mast-01"], completedFacts: ["build.signal-mast.01"] }, objectiveIndex: 2, kitStates: { agentGroup: { agents: { wisp01: { x: -4, z: 4 }, wisp02: { x: 7, y: -6 } } } } },
  { id: "gate-open", session: { ...baseSession, elapsed: 26, gateUnlocked: true, completedFacts: ["scan.ruin.01", "scan.ruin.02", "build.signal-mast.01", "pressure.wave.01.survived", "lock.gate.01"] }, objectiveIndex: 3 },
  { id: "cargo-carried", session: { ...baseSession, elapsed: 32, gateUnlocked: true, cargoCarriedId: "cargo-01", completedFacts: ["cargo.picked.01"] }, objectiveIndex: 4 }
];

const kitFactories = [
  createSignalIslesObjectiveStepQueueKit,
  createSignalIslesProximityActionCueKit,
  createSignalIslesGateDependencyThreadKit,
  createSignalIslesCargoRouteRibbonKit,
  createSignalIslesPressureSafePocketKit,
  createSignalIslesResourceBuildDeltaKit,
  createSignalIslesObjectiveRendererHandoffKit,
  createSignalIslesObjectiveReadabilityDomainKit
];

for (const factory of kitFactories) {
  const kit = factory();
  assert.equal(typeof kit.describe, "function", `${kit.id} should expose describe()`);
}

const domain = createSignalIslesObjectiveReadabilityDomainKit();
assert.equal(domain.domainTree.id, "signal-isles-objective-readability-domain");
assert.ok(domain.domainTree.subdomains.length >= 4, "domain should split objective readability into subdomains");

for (const entry of cases) {
  const objective = {
    current: signalIslesLevel01.objectives[entry.objectiveIndex] ?? null,
    completedFacts: entry.session.completedFacts,
    completedObjectives: entry.session.completedObjectives,
    completed: false
  };
  const state = domain.describe({
    level: signalIslesLevel01,
    preset: signalIslesPreset,
    session: entry.session,
    objective,
    sequence: { activeSequenceId: "intro-sequence" },
    kitStates: entry.kitStates ?? { agentGroup: { agents: {} } }
  });

  assert.equal(state.objectiveSteps.beats.length, signalIslesLevel01.objectives.length, `${entry.id} should describe every objective beat`);
  assert.ok(state.proximityActions.cues.length >= 1, `${entry.id} should describe proximity action cues`);
  assert.ok(state.gateDependencies.threads.length >= 4, `${entry.id} should describe gate dependency threads`);
  assert.ok(state.cargoRoutes.ribbons.length >= 1, `${entry.id} should describe cargo route ribbons`);
  assert.equal(state.safePockets.pockets.length, 3, `${entry.id} should describe safe pockets`);
  assert.ok(state.resourceDeltas.deltas.length >= 3, `${entry.id} should describe resource/build deltas`);
  assert.equal(state.rendererHandoff.contract.rendererConsumesDescriptorsOnly, true, `${entry.id} handoff should be descriptor-only`);
  assert.ok(state.rendererHandoff.counts.objectiveBeats >= 6, `${entry.id} should count objective beats`);
  assert.ok(state.rendererHandoff.counts.dependencyThreads >= 4, `${entry.id} should count dependency threads`);
  const serialized = JSON.stringify(state.rendererHandoff.descriptors);
  assert.ok(serialized.length > 256, `${entry.id} descriptors should serialize useful payload`);
  for (const forbidden of ["document", "querySelector", "addEventListener", "AudioContext", "WebGLRenderer", "requestAnimationFrame"]) {
    assert.equal(serialized.includes(forbidden), false, `${entry.id} descriptors should not own ${forbidden}`);
  }
}

console.log("Signal Isles objective readability kit smoke passed.");
