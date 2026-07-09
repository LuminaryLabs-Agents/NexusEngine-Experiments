import assert from "node:assert/strict";
import fs from "node:fs";
import { createSignalIslesSolarDesalinationReadinessDomainKit } from "../experiments/_kits/nexus-frontier-signal-isles/signal-isles-solar-desalination-readiness-domain-kits.js";

const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const html = fs.readFileSync("experiments/nexus-frontier-signal-isles/index.html", "utf8");
const entry = fs.readFileSync("experiments/nexus-frontier-signal-isles/src/solar-desalination-readiness-entry.js", "utf8");
const kits = fs.readFileSync("experiments/_kits/nexus-frontier-signal-isles/signal-isles-solar-desalination-readiness-domain-kits.js", "utf8");

assert.ok(html.includes("solar-desalination-readiness-renderer-handoff-pass"), "route advertises solar desalination pass");
assert.ok(html.includes("solar-desalination-readiness-entry.js"), "route loads solar desalination entry");
assert.ok(entry.includes(NEXUS_ENGINE_MAIN_CDN), "entry imports NexusEngine main CDN");
assert.ok(!entry.includes("NexusRealtime@"), "changed entry does not import old NexusRealtime CDN runtime");
assert.ok(entry.includes("getSignalIslesSolarDesalinationReadiness"), "entry exposes signal-isles readiness accessor");
assert.ok(entry.includes("getSolarDesalinationReadinessTree"), "entry exposes tree accessor");
assert.ok(entry.includes("getRendererHandoff"), "entry composes renderer handoff");
assert.ok(kits.includes("rendererConsumes: \"serializable solar desalination readiness descriptors only\""), "kit declares descriptor-only renderer handoff");
for (const forbidden of ["document.", "window.", "requestAnimationFrame", "THREE.", "Audio(", "fetch("]) {
  assert.ok(!kits.includes(forbidden), `reusable kits avoid ${forbidden}`);
}

const level = {
  scanSites: [{ id: "salt-pan-north", x: -7, z: -4 }, { id: "salt-pan-south", x: 6, z: 3 }, { id: "reef-brine-shelf", x: 0, z: 6 }],
  buildSites: [{ id: "still-pad-01", structureId: "solar-still-01", x: -2, z: 1 }, { id: "still-pad-02", structureId: "solar-still-02", x: 4, z: -2 }],
  gates: [{ id: "relief-skiff-gate", x: 5, z: 1 }],
  resourceNodes: [{ id: "mangrove-charcoal-01", x: -3, z: 4 }, { id: "mangrove-charcoal-02", x: 3, z: -4 }],
  cargo: [{ id: "clay-cistern-cargo", x: 8, z: 3 }],
  sceneRecipe: { objects: [{ id: "final-beacon", transform: { x: 11, z: 0 } }] }
};
const domain = createSignalIslesSolarDesalinationReadinessDomainKit();
const states = [
  { action: "start", input: { level, session: { elapsed: 0, completedFacts: [] } } },
  { action: "scan", input: { level, session: { elapsed: 5, completedFacts: ["scan.desalination.site"] } } },
  { action: "charcoal", input: { level, session: { elapsed: 10, completedFacts: ["scan.desalination.site"], harvestedNodeIds: ["mangrove-charcoal-01"] } } },
  { action: "build", input: { level, session: { elapsed: 15, completedFacts: ["scan.desalination.site", "build.solar-still.01"], placedStructureIds: ["solar-still-01"] } } },
  { action: "storm", input: { level, session: { elapsed: 20, stormPressure: 0.8, tidePressure: 0.8, completedFacts: ["scan.desalination.site"] } } },
  { action: "cistern", input: { level, session: { elapsed: 25, cargoCarriedId: "clay-cistern-cargo", completedFacts: ["scan.desalination.site", "build.solar-still.01"], placedStructureIds: ["solar-still-01"] } } },
  { action: "purify", input: { level, session: { elapsed: 30, harvestedNodeIds: ["mangrove-charcoal-01"], completedFacts: ["scan.desalination.site", "build.solar-still.01", "purify.cistern.01"], placedStructureIds: ["solar-still-01"] } } },
  { action: "deliver", input: { level, session: { elapsed: 35, harvestedNodeIds: ["mangrove-charcoal-01"], completedFacts: ["scan.desalination.site", "build.solar-still.01", "purify.cistern.01", "cargo.delivered.01"], placedStructureIds: ["solar-still-01"] } } },
  { action: "gate", input: { level, session: { elapsed: 40, gateUnlocked: true, harvestedNodeIds: ["mangrove-charcoal-01", "mangrove-charcoal-02"], completedFacts: ["scan.desalination.site", "build.solar-still.01", "purify.cistern.01", "cargo.delivered.01"], placedStructureIds: ["solar-still-01", "solar-still-02"] } } },
  { action: "handoff", input: { level, session: { elapsed: 45, gateUnlocked: true, harvestedNodeIds: ["mangrove-charcoal-01", "mangrove-charcoal-02"], completedFacts: ["scan.desalination.site", "build.solar-still.01", "purify.cistern.01", "cargo.delivered.01"], placedStructureIds: ["solar-still-01", "solar-still-02"], stormPressure: 0.08, tidePressure: 0.1 }, environment: { sunBonus: 0.1 } } }
];

for (const state of states) {
  const output = domain.describe(state.input);
  assert.ok(output.drawOrder.length === output.rendererHandoff.counts.total, `${state.action} descriptor count lines up`);
  assert.ok(output.rendererHandoff.counts.total >= 10, `${state.action} total descriptors`);
  assert.ok(output.readiness >= 0 && output.readiness <= 1, `${state.action} readiness bounded`);
  assert.ok(["staging", "brine-risk", "handoff"].includes(output.missionState), `${state.action} mission enum`);
  assert.ok(output.rendererHandoff.ownership.rendererMustNotOwn.includes("freshwater scoring"), `${state.action} renderer-neutral ownership`);
}

const early = domain.describe(states[0].input);
const late = domain.describe(states.at(-1).input);
assert.ok(late.readiness > early.readiness, "handoff state improves over start state");
console.log("Signal Isles solar desalination CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
