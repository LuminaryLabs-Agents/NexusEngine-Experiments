import assert from "node:assert/strict";
import { createCavalryFrontierBeaconChainReadinessDomainKit } from "../experiments/The Cavalry of Rome/src/cavalry-frontier-beacon-chain-readiness-domain-kit.js";

const kit = createCavalryFrontierBeaconChainReadinessDomainKit();
const baseCells = Array.from({ length: 9 }, (_, index) => ({
  id: `cell-${index}`,
  owner: index % 4 === 0 ? "player" : index % 4 === 1 ? "neutral" : "enemy",
  x: 120 + index * 80,
  y: 160 + (index % 3) * 85,
  troops: { l: 2 + index, m: index % 3, h: index % 2 },
  neighbors: [`cell-${Math.max(0, index - 1)}`, `cell-${Math.min(8, index + 1)}`].filter((id, slot, list) => list.indexOf(id) === slot)
}));
const cases = [
  { label: "empty fallback", input: { turn: 0, actions: 0, cells: [] } },
  { label: "balanced front", input: { turn: 1, actions: 1, cells: baseCells } },
  { label: "player heavy", input: { turn: 2, actions: 2, cells: baseCells.map((cell, index) => ({ ...cell, owner: index < 5 ? "player" : cell.owner })) } },
  { label: "hostile heavy", input: { turn: 3, actions: 3, cells: baseCells.map((cell, index) => ({ ...cell, owner: index > 2 ? "enemy" : cell.owner })) } },
  { label: "neutral roads", input: { turn: 4, actions: 4, cells: baseCells.map((cell, index) => ({ ...cell, owner: index % 2 ? "neutral" : cell.owner })) } },
  { label: "large campaign", input: { turn: 5, actions: 8, cells: Array.from({ length: 16 }, (_, index) => ({ id: `large-${index}`, owner: index % 5 === 0 ? "player" : index % 3 === 0 ? "enemy" : "neutral", x: 80 + index * 52, y: 100 + (index % 4) * 70, troops: { l: 4, m: 2, h: index % 2 }, neighbors: [`large-${Math.max(0, index - 1)}`] })) } },
  { label: "missing troops", input: { turn: 6, actions: 0, cells: baseCells.map((cell) => ({ id: cell.id, owner: cell.owner, x: cell.x, y: cell.y, neighbors: cell.neighbors })) } },
  { label: "alternate troop key", input: { turn: 7, actions: 9, cells: baseCells.map((cell, index) => ({ ...cell, troops: undefined, t: { l: index + 1, m: 1, h: 1 } })) } },
  { label: "bad input", input: { turn: Number.NaN, actions: "nope", cells: "not cells" } },
  { label: "late campaign", input: { turn: 18, actions: 14, cells: baseCells } }
];

const requiredGroups = [
  "frontierBeaconTowers",
  "smokePlumeRelays",
  "roadMileposts",
  "dispatchRiderRoutes",
  "nightWatchCohorts",
  "senateDispatchLedgers"
];

for (const testCase of cases) {
  const readiness = kit.describe(testCase.input);
  assert.equal(readiness.kind, "cavalry-frontier-beacon-chain-readiness", testCase.label);
  assert.ok(readiness.tree.includes("cavalry-frontier-beacon-chain-readiness-domain"), testCase.label);
  assert.ok(readiness.readiness >= 0 && readiness.readiness <= 1, testCase.label);
  assert.ok(readiness.delayRisk >= 0 && readiness.delayRisk <= 1, testCase.label);
  assert.ok(["ready", "staging", "fragmented"].includes(readiness.missionState), testCase.label);
  assert.equal(readiness.rendererHandoff.kind, "renderer-handoff", testCase.label);
  assert.equal(readiness.rendererHandoff.rendererConsumesDescriptorsOnly, true, testCase.label);

  for (const group of requiredGroups) {
    assert.ok(Array.isArray(readiness.rendererHandoff.descriptors[group]), `${testCase.label} ${group}`);
    assert.ok(readiness.rendererHandoff.descriptors[group].length > 0, `${testCase.label} ${group} count`);
  }

  const total = requiredGroups.reduce((sum, group) => sum + readiness.rendererHandoff.descriptors[group].length, 0);
  assert.equal(readiness.rendererHandoff.counts.total, total, testCase.label);
  assert.doesNotThrow(() => JSON.stringify(readiness), testCase.label);
  assert.ok(readiness.ownershipBoundary.forbiddenOwnership.includes("dom"), testCase.label);
  assert.ok(readiness.ownershipBoundary.forbiddenOwnership.includes("webgl"), testCase.label);
  assert.ok(readiness.ownershipBoundary.forbiddenOwnership.includes("frame-loop"), testCase.label);
}

console.log("Cavalry frontier beacon chain readiness kits smoke passed 10 intake cases.");
