import assert from "node:assert/strict";
import { createSignalIslesSolarDesalinationReadinessDomainKit } from "../experiments/_kits/nexus-frontier-signal-isles/signal-isles-solar-desalination-readiness-domain-kits.js";

const domain = createSignalIslesSolarDesalinationReadinessDomainKit();

const level = {
  scanSites: [{ id: "salt-pan-north", x: -7, z: -4 }, { id: "salt-pan-south", x: 6, z: 3 }, { id: "reef-brine-shelf", x: 0, z: 6 }],
  buildSites: [{ id: "still-pad-01", structureId: "solar-still-01", x: -2, z: 1 }, { id: "still-pad-02", structureId: "solar-still-02", x: 4, z: -2 }],
  gates: [{ id: "relief-skiff-gate", x: 5, z: 1 }],
  resourceNodes: [{ id: "mangrove-charcoal-01", x: -3, z: 4 }, { id: "mangrove-charcoal-02", x: 3, z: -4 }],
  cargo: [{ id: "clay-cistern-cargo", x: 8, z: 3 }],
  sceneRecipe: { objects: [{ id: "final-beacon", transform: { x: 11, z: 0 } }] }
};

const cases = [
  { name: "cold start", input: { level, session: { elapsed: 0, completedFacts: [] } } },
  { name: "brine scan", input: { level, session: { elapsed: 10, completedFacts: ["scan.desalination.site"] }, kitStates: { scanSurvey: { completedTargetIds: ["salt-pan-north"] } } } },
  { name: "first harvest", input: { level, session: { elapsed: 20, harvestedNodeIds: ["mangrove-charcoal-01"], completedFacts: ["scan.desalination.site"] } } },
  { name: "still frame built", input: { level, session: { elapsed: 30, placedStructureIds: ["solar-still-01"], completedFacts: ["scan.desalination.site", "build.solar-still.01"] } } },
  { name: "cistern carried", input: { level, session: { elapsed: 40, cargoCarriedId: "clay-cistern-cargo", placedStructureIds: ["solar-still-01"], completedFacts: ["scan.desalination.site", "build.solar-still.01"] } } },
  { name: "cistern purified", input: { level, session: { elapsed: 50, cargoCarriedId: "clay-cistern-cargo", harvestedNodeIds: ["mangrove-charcoal-01"], placedStructureIds: ["solar-still-01"], completedFacts: ["scan.desalination.site", "build.solar-still.01", "purify.cistern.01"] } } },
  { name: "storm pressure", input: { level, session: { elapsed: 60, stormPressure: 0.8, tidePressure: 0.7, completedFacts: ["scan.desalination.site"] } } },
  { name: "cargo delivered", input: { level, session: { elapsed: 70, harvestedNodeIds: ["mangrove-charcoal-01", "mangrove-charcoal-02"], placedStructureIds: ["solar-still-01"], completedFacts: ["scan.desalination.site", "build.solar-still.01", "cargo.delivered.01"] } } },
  { name: "gate unlocked", input: { level, session: { elapsed: 80, gateUnlocked: true, harvestedNodeIds: ["mangrove-charcoal-01"], placedStructureIds: ["solar-still-01", "solar-still-02"], completedFacts: ["scan.desalination.site", "build.solar-still.01", "purify.cistern.01", "cargo.delivered.01"] } } },
  { name: "handoff ready", input: { level, session: { elapsed: 90, gateUnlocked: true, harvestedNodeIds: ["mangrove-charcoal-01", "mangrove-charcoal-02"], placedStructureIds: ["solar-still-01", "solar-still-02"], completedFacts: ["scan.desalination.site", "build.solar-still.01", "purify.cistern.01", "cargo.delivered.01"], tidePressure: 0.15, stormPressure: 0.1 }, environment: { sunBonus: 0.12 } } }
];

assert.equal(domain.id, "signal-isles-solar-desalination-readiness-domain-kit");
assert.equal(domain.tree.root, "signal-isles-solar-desalination-readiness-domain");
assert.ok(domain.kits.includes("signal-isles-solar-still-frame-kit"));
assert.ok(domain.kits.includes("signal-isles-solar-desalination-renderer-handoff-kit"));

for (const item of cases) {
  const output = domain.describe(item.input);
  assert.ok(output.readiness >= 0 && output.readiness <= 1, `${item.name} readiness bounded`);
  assert.ok(output.saltPressure >= 0 && output.saltPressure <= 1, `${item.name} salt pressure bounded`);
  assert.ok(["staging", "brine-risk", "handoff"].includes(output.missionState), `${item.name} mission state enum`);
  assert.equal(output.drawOrder.length, output.rendererHandoff.counts.total, `${item.name} draw order count matches handoff`);
  assert.ok(output.rendererHandoff.counts.solarStillFrames >= 1, `${item.name} solar still descriptors`);
  assert.ok(output.rendererHandoff.counts.saltPanGauges >= 1, `${item.name} salt pan descriptors`);
  assert.ok(output.rendererHandoff.counts.cisternJars >= 1, `${item.name} cistern descriptors`);
  assert.ok(output.rendererHandoff.counts.mangroveCharcoalFilters >= 1, `${item.name} charcoal filter descriptors`);
  assert.ok(output.rendererHandoff.counts.rationBuoys >= 1, `${item.name} ration buoy descriptors`);
  assert.equal(output.rendererHandoff.counts.dawnWaterLedgers, 1, `${item.name} dawn ledger descriptor`);
  assert.ok(output.rendererHandoff.ownership.rendererConsumesDescriptorsOnly, `${item.name} renderer consumes descriptors only`);
  assert.ok(output.ownership.excludes.includes("Three.js"), `${item.name} kit excludes Three.js`);
  assert.doesNotThrow(() => JSON.stringify(output), `${item.name} output is serializable`);
}

const early = domain.describe(cases[0].input);
const late = domain.describe(cases.at(-1).input);
assert.ok(late.readiness > early.readiness, "handoff state improves over cold start");
assert.ok(late.saltPressure < domain.describe(cases[6].input).saltPressure, "prepared handoff lowers salt pressure against storm pressure case");
console.log("Signal Isles solar desalination readiness kits smoke passed 10 intake cases.");
