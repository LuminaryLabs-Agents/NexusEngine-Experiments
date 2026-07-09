import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSignalIslesMangroveBridgeEvacuationReadinessDomainKit } from "../experiments/_kits/nexus-frontier-signal-isles/signal-isles-mangrove-bridge-evacuation-readiness-domain-kits.js";

const routeShell = readFileSync(new URL("../experiments/nexus-frontier-signal-isles/index.html", import.meta.url), "utf8");
const entry = readFileSync(new URL("../experiments/nexus-frontier-signal-isles/src/mangrove-bridge-evacuation-readiness-entry.js", import.meta.url), "utf8");
const kitSource = readFileSync(new URL("../experiments/_kits/nexus-frontier-signal-isles/signal-isles-mangrove-bridge-evacuation-readiness-domain-kits.js", import.meta.url), "utf8");

assert.ok(routeShell.includes("mangrove-bridge-evacuation-readiness-renderer-handoff-pass"), "route advertises mangrove bridge pass");
assert.ok(routeShell.includes("mangrove-bridge-evacuation-readiness-entry.js?v=mangrove-bridge-evacuation-readiness-1"), "route loads cache-busted entry");
assert.ok(entry.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "changed entry imports NexusEngine main CDN");
assert.equal(entry.includes("NexusRealtime@"), false, "changed entry avoids old NexusRealtime CDN");
assert.ok(entry.includes("window.GameHost"), "entry patches GameHost");
assert.ok(entry.includes("getSignalIslesMangroveBridgeEvacuationReadiness"), "entry exposes Signal Isles accessor");
assert.ok(entry.includes("getMangroveBridgeEvacuationReadinessTree"), "entry exposes domain tree accessor");
assert.ok(entry.includes("getRendererHandoff"), "entry composes renderer handoff");
for (const banned of ["document.", "window.", "requestAnimationFrame", "THREE.", "new WebGL", "getContext(\"webgl", "AudioContext", "localStorage", "fetch("]) {
  assert.equal(kitSource.includes(banned), false, `reusable kit must not own browser/runtime surface: ${banned}`);
}

const kit = createSignalIslesMangroveBridgeEvacuationReadinessDomainKit();
const level = {
  scanSites: [{ id: "tide-pole-east", x: -7.2, z: 0.8 }, { id: "tide-pole-west", x: 6.4, z: -1.2 }, { id: "mudflat-depth", x: 0.8, z: 6.3 }],
  buildSites: [{ id: "root-bridge-north", structureId: "root-bridge-01", x: -5.5, z: 3.4 }, { id: "root-bridge-south", structureId: "root-bridge-02", x: 4.8, z: -2.8 }],
  gates: [{ id: "safe-skiff-channel", x: 7.5, z: 2.1 }],
  resourceNodes: [{ id: "driftwood-cache-a", x: -6.2, z: -3.5 }, { id: "driftwood-cache-b", x: 5.2, z: 3.6 }],
  cargo: [{ id: "flag-bundle", x: -2.5, z: -6.1 }],
  sceneRecipe: { objects: [{ id: "final-beacon", transform: { x: 11, z: 0 } }] }
};
const states = Array.from({ length: 10 }, (_, index) => ({
  level,
  session: {
    completedFacts: index > 3 ? ["scan.mangrove.bridge"] : [],
    harvestedNodeIds: index > 4 ? ["driftwood-cache-a"] : [],
    placedStructureIds: index > 5 ? ["root-bridge-01"] : [],
    tidePressure: Math.min(0.86, 0.2 + index * 0.06),
    stormPressure: Math.min(0.62, 0.16 + index * 0.04),
    gateUnlocked: index > 8,
    elapsed: index * 31
  },
  kitStates: { scanSurvey: { completedTargetIds: index > 2 ? ["tide-pole-east", "mudflat-depth"] : [] } },
  objective: { tidePressure: Math.min(0.86, 0.2 + index * 0.06), stormPressure: Math.min(0.62, 0.16 + index * 0.04) },
  environment: { visibilityBonus: index > 6 ? 0.08 : 0 },
  elapsed: index * 31
}));
for (const [index, state] of states.entries()) {
  const result = kit.describe(state);
  assert.ok(result.readiness >= 0 && result.readiness <= 1, `case ${index} readiness bounded`);
  assert.ok(result.tideRisk >= 0 && result.tideRisk <= 1, `case ${index} tide risk bounded`);
  assert.ok(result.rendererHandoff.counts.total >= 10, `case ${index} has rich descriptor output`);
  assert.equal(result.rendererHandoff.ownership.rendererConsumesDescriptorsOnly, true, `case ${index} renderer-only handoff`);
  assert.ok(result.rendererHandoff.descriptors.mangroveRootBridges.length > 0, `case ${index} root bridges`);
  assert.ok(result.rendererHandoff.descriptors.tidePoleGauges.length > 0, `case ${index} tide gauges`);
}
assert.equal(states.length, 10, "10 simulated state/input cases executed");
console.log("Signal Isles mangrove bridge evacuation CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
