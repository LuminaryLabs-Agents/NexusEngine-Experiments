import assert from "node:assert/strict";
import { signalIslesLevel01 } from "../experiments/nexus-frontier-signal-isles/src/level-01.js";
import {
  SIGNAL_ISLES_HARBOR_RELIEF_READINESS_DOMAIN_TREE,
  createSignalIslesHarborReliefReadinessDomainKit
} from "../experiments/_kits/nexus-frontier-signal-isles/signal-isles-harbor-relief-readiness-domain-kits.js";

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
  { id: "idle-triage", session: makeSession(), elapsed: 0, expect: (out) => assert.ok(out.rendererHandoff.counts.woundedSettlements >= 3) },
  { id: "first-scan-known", session: makeSession({ completedFacts: ["scan.ruin.01"] }), elapsed: 3, expect: (out) => assert.equal(out.rendererHandoff.descriptors.woundedSettlements[0].known, true) },
  { id: "pressure-urgency", session: makeSession({ phase: "pressure", waveStarted: true }), elapsed: 8, expect: (out) => assert.ok(out.rendererHandoff.descriptors.woundedSettlements.some((settlement) => settlement.urgency > 0.6)) },
  { id: "crate-unsecured", session: makeSession(), elapsed: 4, expect: (out) => assert.ok(out.rendererHandoff.descriptors.medicineCrates.some((crate) => crate.active)) },
  { id: "crate-secured", session: makeSession({ harvestedNodeIds: ["resource-node-01"] }), elapsed: 5, expect: (out) => assert.ok(out.rendererHandoff.descriptors.medicineCrates.some((crate) => crate.secured)) },
  { id: "pier-gate-ready", session: makeSession({ gateUnlocked: true, completedFacts: ["lock.gate.01"] }), elapsed: 9, expect: (out) => assert.ok(out.rendererHandoff.descriptors.pierLandingWindows.some((pier) => pier.id === "pier-window-gate-approach" && pier.ready)) },
  { id: "cargo-skiff-active", session: makeSession({ gateUnlocked: true, cargoCarriedId: "cargo-01", completedFacts: ["lock.gate.01", "cargo.picked.01"] }), elapsed: 12, expect: (out) => assert.ok(out.rendererHandoff.descriptors.skiffChannelThreads.some((thread) => thread.id === "skiff-channel-cargo-beacon" && thread.active)) },
  { id: "horn-mast-active", session: makeSession({ placedStructureIds: ["signal-mast-01"], completedFacts: ["build.signal-mast.01"] }), elapsed: 16, expect: (out) => assert.ok(out.rendererHandoff.descriptors.reliefHornCalls.some((horn) => horn.active)) },
  { id: "manifest-complete", session: makeSession({ completed: true, completedFacts: ["scan.ruin.01", "scan.ruin.02", "build.signal-mast.01", "pressure.wave.01.survived", "lock.gate.01", "route.checkpoint.01", "cargo.delivered.01", "final.beacon.activated"] }), elapsed: 24, expect: (out) => assert.ok(out.rendererHandoff.descriptors.departureManifests.some((manifest) => manifest.readiness === 1)) },
  { id: "serializable-minimal", level: { ...signalIslesLevel01, scanSites: [], resourceNodes: [] }, session: makeSession({ phase: "pressure", waveStarted: true }), elapsed: 33, expect: (out) => assert.doesNotThrow(() => JSON.stringify(out)) }
];

const domain = createSignalIslesHarborReliefReadinessDomainKit();
assert.equal(domain.id, "signal-isles-harbor-relief-readiness-domain-kit");
assert.equal(SIGNAL_ISLES_HARBOR_RELIEF_READINESS_DOMAIN_TREE.id, "signal-isles-harbor-relief-readiness-domain");
assert.ok(JSON.stringify(SIGNAL_ISLES_HARBOR_RELIEF_READINESS_DOMAIN_TREE).includes("survivor-logistics-domain"));
assert.ok(JSON.stringify(SIGNAL_ISLES_HARBOR_RELIEF_READINESS_DOMAIN_TREE).includes("renderer-handoff"));

for (const entry of cases) {
  const output = domain.describe({
    level: entry.level ?? signalIslesLevel01,
    session: entry.session,
    elapsed: entry.elapsed,
    kitStates: entry.kitStates ?? { agentGroup: { agents: {} } },
    objective: { current: null }
  });
  assert.equal(output.kit, "signal-isles-harbor-relief-readiness-domain-kit", `${entry.id} should identify the composite kit`);
  assert.equal(output.rendererHandoff.contract.rendererConsumesDescriptorsOnly, true, `${entry.id} handoff should be descriptor-only`);
  assert.ok(output.rendererHandoff.contract.forbiddenOwnership.includes("Three.js"), `${entry.id} should forbid Three ownership`);
  assert.ok(output.rendererHandoff.contract.forbiddenOwnership.includes("frame-loop"), `${entry.id} should forbid frame-loop ownership`);
  assert.ok(output.rendererHandoff.counts.woundedSettlements >= 3, `${entry.id} should include triage settlements`);
  assert.ok(output.rendererHandoff.counts.medicineCrates >= 1, `${entry.id} should include medicine crates`);
  assert.ok(output.rendererHandoff.counts.pierLandingWindows >= 2, `${entry.id} should include pier windows`);
  assert.ok(output.rendererHandoff.counts.skiffChannelThreads >= 3, `${entry.id} should include skiff channels`);
  assert.ok(output.rendererHandoff.counts.reliefHornCalls >= 2, `${entry.id} should include relief horn calls`);
  assert.ok(output.rendererHandoff.counts.departureManifests >= 2, `${entry.id} should include departure manifests`);
  entry.expect(output);
}

console.log("Signal Isles harbor relief readiness kit smoke passed.");
