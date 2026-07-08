import assert from "node:assert/strict";
import {
  CAVALRY_FIELD_HOSPITAL_READINESS_DOMAIN_TREE,
  createCavalryFieldHospitalReadinessDomainKit,
  createCavalryWoundedCohortTriageKit,
  createCavalryMedicTentCapacityKit,
  createCavalryBandageCartRouteKit,
  createCavalrySanitationWellWatchKit,
  createCavalryStretcherRoadThreadKit,
  createCavalryDawnReliefStandardKit
} from "../experiments/The Cavalry of Rome/src/cavalry-field-hospital-readiness-domain-kit.js";

const makeCampaign = (turn, actions, cells) => ({
  turn,
  actions,
  sizeId: `case-${turn}`,
  preset: { label: "smoke", actions: 4, worldW: 900, worldH: 700 },
  camera: { x: 320, y: 260, z: 0.9 },
  cells
});

const baseCells = [
  { id: "rome-a", owner: "player", x: 180, y: 180, troops: { l: 3, m: 1, h: 0 }, neighbors: ["enemy-a", "rome-b"] },
  { id: "rome-b", owner: "player", x: 250, y: 220, troops: { l: 7, m: 2, h: 1 }, neighbors: ["rome-a", "neutral-a"] },
  { id: "rome-c", owner: "player", x: 330, y: 280, troops: { l: 2, m: 0, h: 0 }, neighbors: ["enemy-b", "neutral-a"] },
  { id: "enemy-a", owner: "gaul", x: 130, y: 150, troops: { l: 5, m: 2, h: 1 }, neighbors: ["rome-a"] },
  { id: "enemy-b", owner: "carthage", x: 380, y: 320, troops: { l: 4, m: 4, h: 1 }, neighbors: ["rome-c"] },
  { id: "neutral-a", owner: "neutral", x: 300, y: 210, troops: { l: 2, m: 0, h: 0 }, neighbors: ["rome-b", "rome-c"] }
];

const cases = Array.from({ length: 10 }, (_, index) => {
  const cells = baseCells.map((cell, cellIndex) => ({
    ...cell,
    x: cell.x + index * 7,
    y: cell.y + cellIndex * 4,
    troops: {
      l: Math.max(1, Number(cell.troops.l || 0) + ((index + cellIndex) % 3) - 1),
      m: Math.max(0, Number(cell.troops.m || 0) + (index % 2)),
      h: Math.max(0, Number(cell.troops.h || 0))
    }
  }));
  return makeCampaign(index + 1, index % 5, cells);
});

const domainKit = createCavalryFieldHospitalReadinessDomainKit();
assert.equal(domainKit.id, "cavalry-field-hospital-readiness-domain-kit");
assert.ok(CAVALRY_FIELD_HOSPITAL_READINESS_DOMAIN_TREE.includes("renderer consumes descriptors only"));
assert.ok(domainKit.kits.includes("cavalry-wounded-cohort-triage-kit"));
assert.ok(domainKit.kits.includes("cavalry-field-hospital-renderer-handoff-kit"));

for (const input of cases) {
  const wounded = createCavalryWoundedCohortTriageKit().describe(input);
  const tents = createCavalryMedicTentCapacityKit().describe(input);
  const carts = createCavalryBandageCartRouteKit().describe(input);
  const wells = createCavalrySanitationWellWatchKit().describe(input);
  const roads = createCavalryStretcherRoadThreadKit().describe(input);
  const relief = createCavalryDawnReliefStandardKit().describe(input);
  const domain = domainKit.describe(input);

  assert.ok(wounded.length >= 1, "wounded cohort kit should emit triage markers");
  assert.ok(tents.length >= 1, "medic tent kit should emit capacity markers");
  assert.ok(carts.length >= 1, "bandage cart kit should emit routes");
  assert.ok(wells.length >= 1, "sanitation well kit should emit risk markers");
  assert.ok(roads.length >= 1, "stretcher road kit should emit evacuation threads");
  assert.equal(relief.length, 2, "dawn relief kit should emit two standards");

  assert.ok(domain.woundedCohortTriages.every((entry) => entry.kind === "wounded-cohort-triage"));
  assert.ok(domain.medicTentCapacities.every((entry) => entry.kind === "medic-tent-capacity"));
  assert.ok(domain.bandageCartRoutes.every((entry) => entry.kind === "bandage-cart-route"));
  assert.ok(domain.sanitationWellWatches.every((entry) => entry.kind === "sanitation-well-watch"));
  assert.ok(domain.stretcherRoadThreads.every((entry) => entry.kind === "stretcher-road-thread"));
  assert.ok(domain.dawnReliefStandards.every((entry) => entry.kind === "dawn-relief-standard"));

  assert.equal(domain.rendererHandoff.rendererConsumesDescriptorsOnly, true);
  assert.equal(domain.rendererHandoff.counts.woundedCohortTriages, domain.woundedCohortTriages.length);
  assert.equal(domain.rendererHandoff.counts.medicTentCapacities, domain.medicTentCapacities.length);
  assert.equal(domain.rendererHandoff.counts.bandageCartRoutes, domain.bandageCartRoutes.length);
  assert.equal(domain.rendererHandoff.counts.sanitationWellWatches, domain.sanitationWellWatches.length);
  assert.equal(domain.rendererHandoff.counts.stretcherRoadThreads, domain.stretcherRoadThreads.length);
  assert.equal(domain.rendererHandoff.counts.dawnReliefStandards, domain.dawnReliefStandards.length);
  assert.doesNotThrow(() => JSON.stringify(domain.rendererHandoff));
  assert.deepEqual(domain.rendererHandoff.contract.forbiddenOwnership, ["renderer", "dom", "browser-input", "three", "webgl", "audio", "asset-loading", "frame-loop"]);
}

console.log("Cavalry field hospital readiness kit smoke passed.");
