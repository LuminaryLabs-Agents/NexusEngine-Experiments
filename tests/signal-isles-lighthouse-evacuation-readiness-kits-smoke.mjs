import assert from "node:assert/strict";
import { signalIslesLevel01 } from "../experiments/nexus-frontier-signal-isles/src/level-01.js";
import {
  SIGNAL_ISLES_LIGHTHOUSE_EVACUATION_READINESS_DOMAIN_TREE,
  createSignalIslesLighthouseEvacuationReadinessDomainKit
} from "../experiments/_kits/nexus-frontier-signal-isles/signal-isles-lighthouse-evacuation-readiness-domain-kits.js";

function makeSession(overrides = {}) {
  return {
    phase: "playing",
    player: { ...signalIslesLevel01.playerStart },
    resources: { "signal-shards": 0 },
    completedFacts: [],
    placedStructureIds: [],
    harvestedNodeIds: [],
    cargoCarriedId: null,
    gateUnlocked: false,
    waveStarted: false,
    completed: false,
    ...overrides,
    resources: { "signal-shards": 0, ...(overrides.resources ?? {}) },
    completedFacts: [...(overrides.completedFacts ?? [])],
    placedStructureIds: [...(overrides.placedStructureIds ?? [])],
    harvestedNodeIds: [...(overrides.harvestedNodeIds ?? [])]
  };
}

const cases = [
  { id: "idle-keepers", session: makeSession(), elapsed: 0, expect: (out) => assert.ok(out.rendererHandoff.counts.strandedKeepers >= 3) },
  { id: "first-keeper-found", session: makeSession({ completedFacts: ["scan.ruin.01"] }), elapsed: 3, expect: (out) => assert.equal(out.rendererHandoff.descriptors.strandedKeepers[0].found, true) },
  { id: "pressure-urgent-keeper", session: makeSession({ phase: "pressure", waveStarted: true }), elapsed: 8, expect: (out) => assert.ok(out.rendererHandoff.descriptors.strandedKeepers.some((keeper) => keeper.urgency > 0.66)) },
  { id: "lantern-unpacked", session: makeSession(), elapsed: 4, expect: (out) => assert.ok(out.rendererHandoff.descriptors.lanternFuelCaches.some((cache) => cache.active)) },
  { id: "lantern-packed", session: makeSession({ harvestedNodeIds: ["resource-node-01"], resources: { "signal-shards": 2 } }), elapsed: 5, expect: (out) => assert.ok(out.rendererHandoff.descriptors.lanternFuelCaches.some((cache) => cache.packed)) },
  { id: "reef-gate-ready", session: makeSession({ gateUnlocked: true, completedFacts: ["lock.gate.01"] }), elapsed: 9, expect: (out) => assert.ok(out.rendererHandoff.descriptors.reefGapWindows.some((window) => window.id === "reef-gap-gate" && window.ready)) },
  { id: "rescue-channel-active", session: makeSession({ gateUnlocked: true, cargoCarriedId: "cargo-01", completedFacts: ["lock.gate.01", "cargo.picked.01"] }), elapsed: 12, expect: (out) => assert.ok(out.rendererHandoff.descriptors.rescueBoatChannels.some((channel) => channel.id === "rescue-boat-cargo-beacon" && channel.active)) },
  { id: "foghorn-mast-active", session: makeSession({ placedStructureIds: ["signal-mast-01"], completedFacts: ["build.signal-mast.01"] }), elapsed: 16, expect: (out) => assert.ok(out.rendererHandoff.descriptors.foghornSignals.some((signal) => signal.active)) },
  { id: "roster-complete", session: makeSession({ completed: true, completedFacts: ["scan.ruin.01", "scan.ruin.02", "build.signal-mast.01", "pressure.wave.01.survived", "lock.gate.01", "route.checkpoint.01", "cargo.delivered.01", "final.beacon.activated"] }), elapsed: 24, expect: (out) => assert.ok(out.rendererHandoff.descriptors.evacuationRosters.some((roster) => roster.readiness === 1)) },
  { id: "serializable-minimal", level: { ...signalIslesLevel01, scanSites: [], resourceNodes: [] }, session: makeSession({ phase: "pressure", waveStarted: true }), elapsed: 33, expect: (out) => assert.doesNotThrow(() => JSON.stringify(out)) }
];

const domain = createSignalIslesLighthouseEvacuationReadinessDomainKit();
assert.equal(domain.id, "signal-isles-lighthouse-evacuation-readiness-domain-kit");
assert.equal(SIGNAL_ISLES_LIGHTHOUSE_EVACUATION_READINESS_DOMAIN_TREE.id, "signal-isles-lighthouse-evacuation-readiness-domain");
assert.ok(JSON.stringify(SIGNAL_ISLES_LIGHTHOUSE_EVACUATION_READINESS_DOMAIN_TREE).includes("keeper-safety-domain"));
assert.ok(JSON.stringify(SIGNAL_ISLES_LIGHTHOUSE_EVACUATION_READINESS_DOMAIN_TREE).includes("renderer-handoff"));

for (const entry of cases) {
  const output = domain.describe({
    level: entry.level ?? signalIslesLevel01,
    session: entry.session,
    elapsed: entry.elapsed,
    kitStates: entry.kitStates ?? { agentGroup: { agents: {} } },
    objective: { current: null }
  });
  assert.equal(output.kit, "signal-isles-lighthouse-evacuation-readiness-domain-kit", `${entry.id} should identify the composite kit`);
  assert.equal(output.rendererHandoff.contract.rendererConsumesDescriptorsOnly, true, `${entry.id} handoff should be descriptor-only`);
  assert.ok(output.rendererHandoff.contract.forbiddenOwnership.includes("Three.js"), `${entry.id} should forbid Three ownership`);
  assert.ok(output.rendererHandoff.contract.forbiddenOwnership.includes("frame-loop"), `${entry.id} should forbid frame-loop ownership`);
  assert.ok(output.rendererHandoff.counts.strandedKeepers >= 3, `${entry.id} should include stranded keepers`);
  assert.ok(output.rendererHandoff.counts.lanternFuelCaches >= 1, `${entry.id} should include lantern fuel caches`);
  assert.ok(output.rendererHandoff.counts.reefGapWindows >= 3, `${entry.id} should include reef gap windows`);
  assert.ok(output.rendererHandoff.counts.rescueBoatChannels >= 3, `${entry.id} should include rescue boat channels`);
  assert.ok(output.rendererHandoff.counts.foghornSignals >= 2, `${entry.id} should include foghorn signals`);
  assert.ok(output.rendererHandoff.counts.evacuationRosters >= 2, `${entry.id} should include evacuation rosters`);
  entry.expect(output);
}

console.log("Signal Isles lighthouse evacuation readiness kit smoke passed.");
