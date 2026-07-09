import assert from "node:assert/strict";
import {
  CAVALRY_GRAIN_CONVOY_READINESS_DOMAIN_TREE,
  createCavalryGrainConvoyReadinessDomainKit,
  createCavalryGranaryStockpilePressureKit,
  createCavalryMuleCartRouteKit,
  createCavalryRoadAmbushRiskKit,
  createCavalryBridgeRepairCrewKit,
  createCavalryLegionRationPriorityKit,
  createCavalryCivilianMarketReliefKit
} from "../experiments/The Cavalry of Rome/src/cavalry-grain-convoy-readiness-domain-kit.js";

const makeCampaign = (turn, actions, cells) => ({ turn, actions, sizeId: `grain-case-${turn}`, preset: { label: "grain-convoy-smoke", actions: 5, worldW: 960, worldH: 720 }, camera: { x: 320, y: 260, z: 0.95 }, cells });
const baseCells = [
  { id: "rome-granary", owner: "player", x: 180, y: 190, troops: { l: 9, m: 2, h: 1 }, neighbors: ["market-a", "rome-road"] },
  { id: "rome-road", owner: "player", x: 260, y: 240, troops: { l: 4, m: 1, h: 0 }, neighbors: ["rome-granary", "enemy-pass", "bridge-a"] },
  { id: "rome-front", owner: "player", x: 360, y: 280, troops: { l: 2, m: 0, h: 0 }, neighbors: ["enemy-pass", "bridge-a"] },
  { id: "market-a", owner: "neutral", x: 145, y: 270, troops: { l: 1, m: 0, h: 0 }, neighbors: ["rome-granary", "enemy-raider"] },
  { id: "bridge-a", owner: "neutral", x: 310, y: 335, troops: { l: 0, m: 0, h: 0 }, neighbors: ["rome-road", "rome-front"] },
  { id: "enemy-pass", owner: "gaul", x: 410, y: 260, troops: { l: 5, m: 2, h: 1 }, neighbors: ["rome-road", "rome-front"] },
  { id: "enemy-raider", owner: "carthage", x: 90, y: 305, troops: { l: 3, m: 1, h: 0 }, neighbors: ["market-a"] }
];
const cases = Array.from({ length: 10 }, (_, index) => makeCampaign(index + 1, index % 5, baseCells.map((cell, cellIndex) => ({ ...cell, x: cell.x + index * 6, y: cell.y + cellIndex * 5, troops: { l: Math.max(0, Number(cell.troops.l || 0) + ((index + cellIndex) % 4) - 1), m: Math.max(0, Number(cell.troops.m || 0) + (index % 2)), h: Math.max(0, Number(cell.troops.h || 0)) } }))));

const domainKit = createCavalryGrainConvoyReadinessDomainKit();
assert.equal(domainKit.id, "cavalry-grain-convoy-readiness-domain-kit");
assert.ok(CAVALRY_GRAIN_CONVOY_READINESS_DOMAIN_TREE.includes("renderer consumes descriptors only"));
assert.ok(domainKit.kits.includes("cavalry-granary-stockpile-pressure-kit"));
assert.ok(domainKit.kits.includes("cavalry-grain-convoy-renderer-handoff-kit"));

for (const input of cases) {
  const granaries = createCavalryGranaryStockpilePressureKit().describe(input);
  const carts = createCavalryMuleCartRouteKit().describe(input);
  const ambushes = createCavalryRoadAmbushRiskKit().describe(input);
  const bridges = createCavalryBridgeRepairCrewKit().describe(input);
  const rations = createCavalryLegionRationPriorityKit().describe(input);
  const markets = createCavalryCivilianMarketReliefKit().describe(input);
  const domain = domainKit.describe(input);
  assert.ok(granaries.length >= 1, "granary kit should emit stockpile pressure descriptors");
  assert.ok(carts.length >= 1, "mule cart kit should emit convoy routes");
  assert.ok(ambushes.length >= 1, "ambush kit should emit road risk markers");
  assert.ok(bridges.length >= 1, "bridge kit should emit repair crews");
  assert.ok(rations.length >= 1, "ration kit should emit legion ration priorities");
  assert.ok(markets.length >= 1, "market kit should emit civilian relief descriptors");
  assert.ok(domain.granaryStockpilePressures.every((entry) => entry.kind === "granary-stockpile-pressure"));
  assert.ok(domain.muleCartRoutes.every((entry) => entry.kind === "mule-cart-route"));
  assert.ok(domain.roadAmbushRisks.every((entry) => entry.kind === "road-ambush-risk"));
  assert.ok(domain.bridgeRepairCrews.every((entry) => entry.kind === "bridge-repair-crew"));
  assert.ok(domain.legionRationPriorities.every((entry) => entry.kind === "legion-ration-priority"));
  assert.ok(domain.civilianMarketReliefs.every((entry) => entry.kind === "civilian-market-relief"));
  assert.equal(domain.rendererHandoff.rendererConsumesDescriptorsOnly, true);
  assert.equal(domain.rendererHandoff.counts.granaryStockpilePressures, domain.granaryStockpilePressures.length);
  assert.equal(domain.rendererHandoff.counts.muleCartRoutes, domain.muleCartRoutes.length);
  assert.equal(domain.rendererHandoff.counts.roadAmbushRisks, domain.roadAmbushRisks.length);
  assert.equal(domain.rendererHandoff.counts.bridgeRepairCrews, domain.bridgeRepairCrews.length);
  assert.equal(domain.rendererHandoff.counts.legionRationPriorities, domain.legionRationPriorities.length);
  assert.equal(domain.rendererHandoff.counts.civilianMarketReliefs, domain.civilianMarketReliefs.length);
  assert.doesNotThrow(() => JSON.stringify(domain.rendererHandoff));
  assert.deepEqual(domain.rendererHandoff.contract.forbiddenOwnership, ["renderer", "dom", "browser-input", "three", "webgl", "audio", "asset-loading", "frame-loop", "physics"]);
}

console.log("Cavalry grain convoy readiness kit smoke passed.");
