import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSignalIslesStormbreakSignalMastReadinessDomainKit } from "../experiments/_kits/nexus-frontier-signal-isles/signal-isles-stormbreak-signal-mast-readiness-domain-kits.js";

const route = readFileSync(new URL("../experiments/nexus-frontier-signal-isles/index.html", import.meta.url), "utf8");
const entry = readFileSync(new URL("../experiments/nexus-frontier-signal-isles/src/stormbreak-signal-mast-readiness-entry.js", import.meta.url), "utf8");
const kitSource = readFileSync(new URL("../experiments/_kits/nexus-frontier-signal-isles/signal-isles-stormbreak-signal-mast-readiness-domain-kits.js", import.meta.url), "utf8");

const CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

assert.ok(route.includes("stormbreak-signal-mast-readiness-renderer-handoff-pass"));
assert.ok(route.includes("stormbreak-signal-mast-readiness-entry.js?v=stormbreak-signal-mast-readiness-1"));
assert.ok(entry.includes(CDN));
assert.ok(entry.includes("import * as NexusEngine"));
assert.ok(!entry.includes("NexusRealtime@"));
assert.ok(entry.includes("getSignalIslesStormbreakSignalMastReadiness"));
assert.ok(entry.includes("getStormbreakSignalMastReadinessTree"));
assert.ok(entry.includes("getRendererHandoff"));
assert.ok(kitSource.includes("rendererConsumesDescriptorsOnly"));
assert.ok(kitSource.includes("renderer consumes stormbreak signal mast descriptors only"));
for (const banned of ["document.createElement", "requestAnimationFrame", "canvas.getContext", "new Audio", "new WebGL", "THREE."]) {
  assert.ok(!kitSource.includes(banned), `kit source must not own ${banned}`);
}
assert.ok(kitSource.includes("WebGL"));

function stateCase(index) {
  return {
    elapsed: index * 21,
    level: {
      scanSites: [{ id: "wind-notch-east", x: -7, z: -2 }, { id: "wind-notch-west", x: 7, z: 3 }],
      buildSites: [{ id: "mast-pad-north", structureId: "signal-mast-01", x: -4, z: 2 }],
      resourceNodes: [{ id: "basalt-anchor-a", x: -6, z: 4 }, { id: "copper-spool-cache", x: -2, z: -5 }],
      cargo: [{ id: "copper-rod-cargo", x: 8, z: 3 }],
      gates: [{ id: "stormbreak-relay-gate", x: 5, z: 1 }],
      sceneRecipe: { objects: [{ id: "final-beacon", transform: { x: 11, z: 0 } }] }
    },
    session: {
      completedFacts: [
        index >= 1 ? "scan.signal.mast" : null,
        index >= 3 ? "build.signal-mast.01" : null,
        index >= 5 ? "ground.lightning.01" : null,
        index >= 7 ? "relay.mirror.chain" : null
      ].filter(Boolean),
      placedStructureIds: index >= 3 ? ["signal-mast-01"] : [],
      harvestedNodeIds: index >= 2 ? ["basalt-anchor-a", "copper-spool-cache"] : [],
      cargoCarriedId: index >= 5 ? "copper-rod-cargo" : null,
      gateUnlocked: index >= 8,
      stormPressure: Math.max(0.05, 0.76 - index * 0.06),
      tidePressure: Math.max(0.08, 0.48 - index * 0.04)
    },
    kitStates: { scanSurvey: { completedTargetIds: index >= 2 ? ["wind-notch-east"] : [] } },
    environment: { visibilityBonus: index >= 6 ? 0.08 : 0 }
  };
}

const domain = createSignalIslesStormbreakSignalMastReadinessDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => stateCase(index));
const outcomes = cases.map((input) => domain.describe(input));

for (const [index, outcome] of outcomes.entries()) {
  assert.equal(outcome.rendererHandoff.ownership.rendererConsumesDescriptorsOnly, true, `case ${index} descriptor-only handoff`);
  assert.ok(outcome.rendererHandoff.counts.total >= 6, `case ${index} descriptor count`);
  assert.ok(outcome.drawOrder.length === outcome.rendererHandoff.counts.total, `case ${index} draw order mirrors descriptors`);
  assert.ok(outcome.readiness >= 0 && outcome.readiness <= 1, `case ${index} readiness bounded`);
}

assert.ok(outcomes[9].readiness > outcomes[0].readiness, "10-case state/input simulation should improve stormbreak signal readiness");
assert.equal(outcomes[9].missionState, "broadcast");

console.log("Signal Isles stormbreak signal mast CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
