import assert from "node:assert/strict";
import { signalIslesLevel01 } from "../experiments/nexus-frontier-signal-isles/src/level-01.js";
import { signalIslesPreset } from "../experiments/nexus-frontier-signal-isles/src/signal-isles-preset.js";
import {
  createSignalIslesScanSweepSectorKit,
  createSignalIslesShardFerryLineKit,
  createSignalIslesMastChargeWindowKit,
  createSignalIslesPressureRetreatLaneKit,
  createSignalIslesGateTimingRunwayKit,
  createSignalIslesBeaconActivationForecastKit,
  createSignalIslesExpeditionRendererHandoffKit,
  createSignalIslesExpeditionReadinessDomainKit
} from "../experiments/_kits/nexus-frontier-signal-isles/signal-isles-expedition-readiness-domain-kits.js";

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
  { id: "near-scan-one", session: { ...baseSession, elapsed: 1, player: { ...basePlayer, x: -8, z: -6 } }, objectiveIndex: 0 },
  { id: "scan-one-complete", session: { ...baseSession, elapsed: 3, completedFacts: ["scan.ruin.01"] }, objectiveIndex: 0 },
  { id: "resource-one-carried", session: { ...baseSession, elapsed: 5, resources: { "signal-shards": 2 }, harvestedNodeIds: ["resource-node-01"], completedFacts: ["resource.node.01"] }, objectiveIndex: 1 },
  { id: "build-ready", session: { ...baseSession, elapsed: 7, resources: { "signal-shards": 3 }, completedFacts: ["resource.node.01", "resource.node.02"] }, objectiveIndex: 1 },
  { id: "mast-built", session: { ...baseSession, elapsed: 10, resources: { "signal-shards": 0 }, placedStructureIds: ["signal-mast-01"], completedFacts: ["build.signal-mast.01"] }, objectiveIndex: 2 },
  { id: "pressure-wave", session: { ...baseSession, elapsed: 18, phase: "pressure", waveStarted: true, placedStructureIds: ["signal-mast-01"], completedFacts: ["build.signal-mast.01"] }, objectiveIndex: 2, kitStates: { agentGroup: { agents: { wisp01: { x: -4, z: 4 }, wisp02: { x: 7, y: -6 } } } } },
  { id: "gate-progress", session: { ...baseSession, elapsed: 26, completedFacts: ["scan.ruin.01", "scan.ruin.02", "build.signal-mast.01"] }, objectiveIndex: 3 },
  { id: "gate-open", session: { ...baseSession, elapsed: 32, gateUnlocked: true, completedFacts: ["scan.ruin.01", "scan.ruin.02", "build.signal-mast.01", "pressure.wave.01.survived", "lock.gate.01"] }, objectiveIndex: 3 },
  { id: "cargo-carried", session: { ...baseSession, elapsed: 40, gateUnlocked: true, cargoCarriedId: "cargo-01", completedFacts: ["scan.ruin.01", "scan.ruin.02", "build.signal-mast.01", "pressure.wave.01.survived", "lock.gate.01", "route.checkpoint.01", "cargo.picked.01"] }, objectiveIndex: 4 }
];

const kitFactories = [
  createSignalIslesScanSweepSectorKit,
  createSignalIslesShardFerryLineKit,
  createSignalIslesMastChargeWindowKit,
  createSignalIslesPressureRetreatLaneKit,
  createSignalIslesGateTimingRunwayKit,
  createSignalIslesBeaconActivationForecastKit,
  createSignalIslesExpeditionRendererHandoffKit,
  createSignalIslesExpeditionReadinessDomainKit
];

for (const factory of kitFactories) {
  const kit = factory();
  assert.equal(typeof kit.describe, "function", `${kit.id} should expose describe()`);
}

const domain = createSignalIslesExpeditionReadinessDomainKit();
assert.equal(domain.domainTree.id, "signal-isles-expedition-readiness-domain");
assert.ok(domain.domainTree.subdomains.length >= 4, "domain should split expedition readiness into nested subdomains");

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
    kitStates: entry.kitStates ?? { agentGroup: { agents: {} } },
    elapsed: entry.session.elapsed
  });

  assert.equal(state.scanSweeps.sectors.length, signalIslesLevel01.scanSites.length, `${entry.id} should describe all scan sweep sectors`);
  assert.ok(state.shardFerries.lines.length >= 3, `${entry.id} should describe resource ferry and mast-output lines`);
  assert.equal(state.mastWindows.windows.length, signalIslesLevel01.buildSites.length, `${entry.id} should describe mast charge windows`);
  assert.equal(state.retreatLanes.lanes.length, 3, `${entry.id} should describe three pressure retreat lanes`);
  assert.ok(state.gateRunways.runways.length >= 3, `${entry.id} should describe gate timing runways`);
  assert.ok(state.beaconForecasts.forecasts.length >= 4, `${entry.id} should describe beacon activation forecasts`);
  assert.equal(state.rendererHandoff.contract.rendererConsumesDescriptorsOnly, true, `${entry.id} handoff should be descriptor-only`);
  assert.equal(state.rendererHandoff.counts.scanSectors, 3, `${entry.id} should count scan sectors`);
  assert.equal(state.rendererHandoff.counts.retreatLanes, 3, `${entry.id} should count retreat lanes`);
  assert.ok(state.rendererHandoff.counts.beaconForecasts >= 4, `${entry.id} should count beacon forecasts`);
  const serialized = JSON.stringify(state.rendererHandoff.descriptors);
  assert.ok(serialized.length > 512, `${entry.id} descriptors should serialize a useful payload`);
  for (const forbidden of ["document", "querySelector", "addEventListener", "AudioContext", "WebGLRenderer", "requestAnimationFrame"]) {
    assert.equal(serialized.includes(forbidden), false, `${entry.id} descriptors should not own ${forbidden}`);
  }
}

console.log("Signal Isles expedition readiness kit smoke passed.");
