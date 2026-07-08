import assert from "node:assert/strict";
import { signalIslesLevel01 } from "../experiments/nexus-frontier-signal-isles/src/level-01.js";
import {
  SIGNAL_ISLES_STORM_ANCHOR_READINESS_DOMAIN_TREE,
  createSignalIslesStormAnchorReadinessDomainKit
} from "../experiments/_kits/nexus-frontier-signal-isles/signal-isles-storm-anchor-readiness-domain-kits.js";

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
  { id: "idle-storm-map", session: makeSession(), elapsed: 0, expect: (out) => assert.ok(out.rendererHandoff.counts.stormCells >= 1) },
  { id: "charged-but-unbuilt", session: makeSession({ resources: { "signal-shards": 3 } }), elapsed: 4, expect: (out) => assert.ok(out.rendererHandoff.descriptors.groundingRods.some((rod) => rod.charge >= 1 && !rod.grounded)) },
  { id: "mast-grounded", session: makeSession({ placedStructureIds: ["signal-mast-01"], completedFacts: ["build.signal-mast.01"] }), elapsed: 7, expect: (out) => assert.equal(out.rendererHandoff.descriptors.groundingRods[0].grounded, true) },
  { id: "pressure-wave-agents", session: makeSession({ phase: "pressure", waveStarted: true, placedStructureIds: ["signal-mast-01"], completedFacts: ["build.signal-mast.01"] }), kitStates: { agentGroup: { agents: { "wisp-01": { id: "wisp-01", x: 26, z: 17 } } } }, elapsed: 12, expect: (out) => assert.ok(out.rendererHandoff.counts.stormCells >= 2) },
  { id: "gate-open-anchor", session: makeSession({ gateUnlocked: true, completedFacts: ["lock.gate.01", "pressure.wave.01.survived", "build.signal-mast.01"], placedStructureIds: ["signal-mast-01"] }), elapsed: 16, expect: (out) => assert.ok(out.rendererHandoff.descriptors.anchorCables.some((cable) => cable.id === "anchor-cable-gate-to-beacon" && cable.active)) },
  { id: "cargo-carried-tide", session: makeSession({ gateUnlocked: true, cargoCarriedId: "cargo-01", completedFacts: ["lock.gate.01", "cargo.picked.01"] }), elapsed: 20, expect: (out) => assert.ok(out.rendererHandoff.descriptors.evacuationTideRoutes.some((route) => route.id === "evacuation-cargo-to-beacon" && route.active)) },
  { id: "final-scan-resonance", session: makeSession({ gateUnlocked: true, completedFacts: ["scan.ruin.03"] }), elapsed: 22, expect: (out) => assert.ok(out.rendererHandoff.descriptors.beaconResonanceRings.some((ring) => ring.id === "beacon-resonance-core" && ring.resonance > 0)) },
  { id: "beacon-complete-return", session: makeSession({ completed: true, completedFacts: ["scan.ruin.03", "cargo.delivered.01", "final.beacon.activated"] }), elapsed: 31, expect: (out) => assert.ok(out.rendererHandoff.descriptors.evacuationTideRoutes.some((route) => route.id === "evacuation-beacon-to-start" && route.active)) },
  { id: "minimal-level-safe", level: { ...signalIslesLevel01, hazards: [], agents: [], resourceNodes: [], scanSites: [] }, session: makeSession(), elapsed: 5, expect: (out) => assert.ok(out.rendererHandoff.counts.shelterPockets >= 3) },
  { id: "serializable-boundary", session: makeSession({ phase: "pressure", waveStarted: true }), elapsed: 9, expect: (out) => assert.doesNotThrow(() => JSON.stringify(out)) }
];

const domain = createSignalIslesStormAnchorReadinessDomainKit();
assert.equal(domain.id, "signal-isles-storm-anchor-readiness-domain-kit");
assert.equal(SIGNAL_ISLES_STORM_ANCHOR_READINESS_DOMAIN_TREE.id, "signal-isles-storm-anchor-readiness-domain");
assert.ok(JSON.stringify(SIGNAL_ISLES_STORM_ANCHOR_READINESS_DOMAIN_TREE).includes("storm-front-domain"));
assert.ok(JSON.stringify(SIGNAL_ISLES_STORM_ANCHOR_READINESS_DOMAIN_TREE).includes("renderer-handoff"));

for (const entry of cases) {
  const output = domain.describe({
    level: entry.level ?? signalIslesLevel01,
    session: entry.session,
    elapsed: entry.elapsed,
    kitStates: entry.kitStates ?? { agentGroup: { agents: {} } },
    objective: { current: null }
  });
  assert.equal(output.kit, "signal-isles-storm-anchor-readiness-domain-kit", `${entry.id} should identify the composite kit`);
  assert.equal(output.rendererHandoff.contract.rendererConsumesDescriptorsOnly, true, `${entry.id} handoff should be descriptor-only`);
  assert.ok(output.rendererHandoff.contract.forbiddenOwnership.includes("Three.js"), `${entry.id} should forbid Three ownership`);
  assert.ok(output.rendererHandoff.contract.forbiddenOwnership.includes("frame-loop"), `${entry.id} should forbid frame-loop ownership`);
  assert.ok(output.rendererHandoff.counts.groundingRods >= 2, `${entry.id} should include grounding rods`);
  assert.ok(output.rendererHandoff.counts.anchorCables >= 3, `${entry.id} should include anchor cables`);
  assert.ok(output.rendererHandoff.counts.beaconResonanceRings >= 1, `${entry.id} should include beacon resonance`);
  assert.ok(output.rendererHandoff.counts.evacuationTideRoutes >= 2, `${entry.id} should include evacuation tide routes`);
  entry.expect(output);
}

console.log("Signal Isles storm anchor readiness kit smoke passed.");
