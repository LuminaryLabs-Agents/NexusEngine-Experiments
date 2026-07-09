import assert from "node:assert/strict";
import {
  createStonewakeFloodRescueReadinessDomainKit,
  createStonewakeSurvivorEchoPingKit,
  createStonewakeChalkRouteMarkKit,
  createStonewakeFloodlinePressureBandKit,
  createStonewakeAirPocketCacheKit,
  createStonewakeRopeLiftAnchorKit,
  createStonewakeRescueBellHandoffKit,
  STONEWAKE_RESCUE_READINESS_TREE
} from "../games/stonewake-depths/stonewake-rescue-readiness-kits.js";

function makeLevel(seed = 0) {
  const xOffset = seed * 23;
  return {
    bounds: { width: 3000, height: 820 },
    platforms: [
      { id: "left-wall", x: 0, y: 0, w: 42, h: 820, role: "boundary" },
      { id: "floor", x: 42, y: 780, w: 2916, h: 48, role: "floor" },
      { id: "route-a", x: 160 + xOffset, y: 540, w: 180, h: 30, role: "start", focusId: "start" },
      { id: "route-b", x: 560 + xOffset, y: 460, w: 160, h: 30, role: "physical-puzzle", focusId: "focus-1" },
      { id: "route-c", x: 1040 + xOffset, y: 380, w: 190, h: 30, role: "machine-interaction", focusId: "focus-2" },
      { id: "route-d", x: 1520 + xOffset, y: 430, w: 170, h: 30, role: "water-crossing", focusId: "focus-3" },
      { id: "route-e", x: 2200 + xOffset, y: 350, w: 210, h: 30, role: "finish", focusId: "finish" }
    ],
    objects: [
      { id: "player", type: "player", x: 180 + xOffset, y: 494 },
      { id: "chain-1", type: "chain", x: 710 + xOffset, y: 230, h: 250 },
      { id: "chain-2", type: "chain", x: 1380 + xOffset, y: 200, h: 280 },
      { id: "finish-gate-1", type: "finish-gate", x: 2460 + xOffset, y: 280 },
      { id: "weighted-trigger-1", type: "weighted-trigger", x: 690 + xOffset, y: 450 },
      { id: "valve-1", type: "valve", x: 1160 + xOffset, y: 280 }
    ]
  };
}

function makeState(index) {
  return {
    time: index * 4,
    status: "playing",
    carry: index % 3 === 0,
    player: { x: 150 + index * 95, y: 500 - index * 11, w: 24, h: 46 },
    water: { level: 760 - index * 34, speed: 2.2 },
    camera: { x: index * 90, y: 0 },
    plate: index >= 4,
    valve: Math.min(1, index / 8),
    door: Math.min(1, index / 9)
  };
}

const cases = Array.from({ length: 10 }, (_, index) => ({ state: makeState(index), level: makeLevel(index) }));
const domainKit = createStonewakeFloodRescueReadinessDomainKit();
assert.match(STONEWAKE_RESCUE_READINESS_TREE, /renderer consumes descriptors only/);

for (const [index, input] of cases.entries()) {
  const result = domainKit.describe(input);
  assert.equal(result.domain, "stonewake-flood-rescue-readiness-domain", `case ${index} domain`);
  assert.ok(["route-marking", "active-rescue", "flood-critical", "ready-for-extract"].includes(result.missionState), `case ${index} mission state`);
  assert.ok(result.pressure >= 0 && result.pressure <= 1, `case ${index} pressure bounded`);
  assert.ok(result.rendererHandoff.rendererConsumesDescriptorsOnly, `case ${index} renderer-only handoff`);
  assert.ok(result.rendererHandoff.counts.total >= 10, `case ${index} descriptor count`);
  assert.ok(result.survivorEchoPings.every((item) => item.kind === "survivor-echo-ping"), `case ${index} echo kind`);
  assert.ok(result.chalkRouteMarks.every((item) => item.kind === "chalk-route-mark"), `case ${index} chalk kind`);
  assert.equal(result.floodlinePressureBands.length, 3, `case ${index} flood bands`);
  assert.ok(result.airPocketCaches.length >= 1, `case ${index} air pockets`);
  assert.ok(result.ropeLiftAnchors.length >= 2, `case ${index} ropes`);
  assert.ok(result.rescueBellHandoff.kind === "rescue-bell-handoff", `case ${index} bell kind`);
  assert.doesNotThrow(() => JSON.stringify(result), `case ${index} serializable`);
}

const one = cases[5];
assert.ok(createStonewakeSurvivorEchoPingKit().describe(one).length > 0);
assert.ok(createStonewakeChalkRouteMarkKit().describe(one).length > 0);
assert.equal(createStonewakeFloodlinePressureBandKit().describe(one).length, 3);
assert.ok(createStonewakeAirPocketCacheKit().describe(one).length > 0);
assert.ok(createStonewakeRopeLiftAnchorKit().describe(one).length > 0);
assert.equal(createStonewakeRescueBellHandoffKit().describe(one).kind, "rescue-bell-handoff");

const early = domainKit.describe(cases[0]);
const late = domainKit.describe({ ...cases[9], state: { ...cases[9].state, plate: true, valve: 1, door: 1 } });
assert.ok(late.rescueBellHandoff.readiness >= early.rescueBellHandoff.readiness, "bell readiness improves when puzzle completes");
console.log("stonewake flood rescue readiness kit smoke passed 10 cases");
