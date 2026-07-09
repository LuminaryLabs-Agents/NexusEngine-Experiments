import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSignalIslesStormSurgeRelayReadinessDomainKit } from "../experiments/_kits/nexus-frontier-signal-isles/signal-isles-storm-surge-relay-readiness-domain-kits.js";

const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const route = readFileSync("experiments/nexus-frontier-signal-isles/index.html", "utf8");
const entry = readFileSync("experiments/nexus-frontier-signal-isles/src/storm-surge-relay-readiness-entry.js", "utf8");
const kitSource = readFileSync("experiments/_kits/nexus-frontier-signal-isles/signal-isles-storm-surge-relay-readiness-domain-kits.js", "utf8");

assert.ok(route.includes("storm-surge-relay-readiness-renderer-handoff-pass"), "route advertises storm surge pass");
assert.ok(route.includes("storm-surge-relay-readiness-entry.js?v=storm-surge-relay-readiness-1"), "route loads cache-busted overlay entry");
assert.ok(entry.includes(cdn), "entry imports NexusEngine main CDN");
assert.ok(!entry.includes("LuminaryLabs-Dev/NexusRealtime@main"), "changed entry avoids old NexusRealtime runtime CDN");
assert.ok(entry.includes("getSignalIslesStormSurgeRelayReadiness"), "GameHost exposes storm surge getter");
assert.ok(entry.includes("getRendererHandoff"), "entry composes renderer handoff");
assert.ok(entry.includes("stormSurgeRelayOverlay"), "entry owns overlay rendering outside reusable kit");
assert.ok(entry.includes("__stormSurgeRelayReadinessInput"), "entry avoids recursive patched GameHost reads");
for (const forbidden of ["document.", "window.", "requestAnimationFrame", "new THREE", "new Audio", "addEventListener("]) {
  assert.equal(kitSource.includes(forbidden), false, `kit source must not own ${forbidden}`);
}

function inputCase(index) {
  const completedFacts = ["scan.ruin.01", "scan.ruin.02", "scan.ruin.03", "build.signal-mast.01", "pressure.wave.01.survived", "lock.gate.01", "cargo.delivered.01"].slice(0, index);
  return {
    level: {
      scanSites: [{ id: "scan-ruin-01", x: -6, z: -2 }, { id: "scan-ruin-02", x: 0, z: 4 }, { id: "scan-ruin-03", x: 6, z: -1 }],
      buildSites: [{ id: "build-site-01", structureId: "signal-mast-01", x: 1, z: 1 }],
      gates: [{ id: "gate-01", x: 5, z: 1 }],
      resourceNodes: [{ id: "resource-node-01", x: -2, z: 3 }, { id: "resource-node-02", x: 2, z: -3 }],
      cargo: [{ id: "cargo-01", x: 8, z: 2 }],
      sceneRecipe: { objects: [{ id: "final-beacon", transform: { x: 10, z: 0 } }] }
    },
    session: {
      elapsed: index * 4,
      phase: index % 3 === 0 ? "pressure" : "playing",
      player: { sporeLoad: index * 0.03 },
      completedFacts,
      placedStructureIds: completedFacts.includes("build.signal-mast.01") ? ["signal-mast-01"] : [],
      harvestedNodeIds: completedFacts.includes("scan.ruin.02") ? ["resource-node-01"] : [],
      gateUnlocked: completedFacts.includes("lock.gate.01"),
      cargoCarriedId: completedFacts.includes("lock.gate.01") && !completedFacts.includes("cargo.delivered.01") ? "cargo-01" : null
    },
    sequence: { waitingFor: [] },
    kitStates: { scanSurvey: { completedTargetIds: [] } },
    elapsed: index * 4
  };
}

const kit = createSignalIslesStormSurgeRelayReadinessDomainKit();
for (let i = 0; i < 10; i += 1) {
  const state = kit.describe(inputCase(i));
  assert.ok(state.rendererHandoff.counts.tideGaugeBeacons >= 3, `case ${i} tide gauge count`);
  assert.ok(state.rendererHandoff.counts.evacuationRaftLanes >= 3, `case ${i} raft lane count`);
  assert.ok(state.rendererHandoff.descriptors.surgeManifestLedgers[0].phase, `case ${i} manifest phase`);
}
console.log("Signal Isles storm surge relay CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
