import assert from "node:assert/strict";
import { createCavalryStandardBearerMoraleReadinessDomainKit } from "../experiments/The Cavalry of Rome/src/cavalry-standard-bearer-morale-readiness-domain-kit.js";

const kit = createCavalryStandardBearerMoraleReadinessDomainKit();
const baseCells = Array.from({ length: 10 }, (_, index) => ({
  id: `cell-${index}`,
  owner: index % 5 === 0 ? "player" : index % 3 === 0 ? "enemy" : "neutral",
  x: 100 + index * 72,
  y: 140 + (index % 4) * 68,
  troops: { l: 3 + index, m: index % 3, h: index % 2 },
  neighbors: [`cell-${Math.max(0, index - 1)}`, `cell-${Math.min(9, index + 1)}`].filter((id, slot, list) => list.indexOf(id) === slot)
}));

const cases = [
  { label: "empty fallback", input: { turn: 0, actions: 0, cells: [] } },
  { label: "balanced standard line", input: { turn: 1, actions: 1, cells: baseCells } },
  { label: "player morale heavy", input: { turn: 2, actions: 2, cells: baseCells.map((cell, index) => ({ ...cell, owner: index < 6 ? "player" : cell.owner })) } },
  { label: "hostile encirclement", input: { turn: 3, actions: 4, cells: baseCells.map((cell, index) => ({ ...cell, owner: index > 2 ? "enemy" : cell.owner })) } },
  { label: "neutral rally roads", input: { turn: 4, actions: 1, cells: baseCells.map((cell, index) => ({ ...cell, owner: index % 2 ? "neutral" : cell.owner })) } },
  { label: "large field", input: { turn: 5, actions: 7, cells: Array.from({ length: 18 }, (_, index) => ({ id: `large-${index}`, owner: index % 6 === 0 ? "player" : index % 4 === 0 ? "enemy" : "neutral", x: 80 + index * 54, y: 120 + (index % 5) * 62, troops: { l: 4, m: index % 3, h: index % 2 }, neighbors: [`large-${Math.max(0, index - 1)}`] })) } },
  { label: "missing troops", input: { turn: 6, actions: 0, cells: baseCells.map((cell) => ({ id: cell.id, owner: cell.owner, x: cell.x, y: cell.y, neighbors: cell.neighbors })) } },
  { label: "alternate troop key", input: { turn: 7, actions: 9, cells: baseCells.map((cell, index) => ({ ...cell, troops: undefined, t: { l: index + 1, m: 1, h: 1 } })) } },
  { label: "bad input", input: { turn: Number.NaN, actions: "none", cells: "not cells" } },
  { label: "late campaign", input: { turn: 21, actions: 13, cells: baseCells } }
];

const requiredGroups = [
  "aquilaStandards",
  "vexillumRallyRoutes",
  "cohortMoraleDrums",
  "standardGuardRings",
  "woundedStandardLitters",
  "duskHonorLedgers"
];

for (const testCase of cases) {
  const readiness = kit.describe(testCase.input);
  assert.equal(readiness.kind, "cavalry-standard-bearer-morale-readiness", testCase.label);
  assert.ok(readiness.tree.includes("cavalry-standard-bearer-morale-readiness-domain"), testCase.label);
  assert.ok(readiness.readiness >= 0 && readiness.readiness <= 1, testCase.label);
  assert.ok(readiness.moraleRisk >= 0 && readiness.moraleRisk <= 1, testCase.label);
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

const weak = kit.describe({ turn: 2, cells: baseCells.map((cell) => ({ ...cell, owner: "enemy", troops: { l: 1, m: 0, h: 0 } })) });
const strong = kit.describe({ turn: 2, cells: baseCells.map((cell, index) => ({ ...cell, owner: index < 8 ? "player" : "neutral", troops: { l: 8, m: 3, h: 2 } })) });
assert.ok(strong.readiness >= weak.readiness, "stronger Roman standard line should not reduce readiness");

console.log("Cavalry standard bearer morale readiness kits smoke passed 10 intake cases.");
