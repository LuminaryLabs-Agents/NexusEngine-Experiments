import assert from "node:assert/strict";
import {
  createStonewakeSiltArchiveDrainageReadinessDomainKit,
  STONEWAKE_SILT_ARCHIVE_DRAINAGE_KITS,
  STONEWAKE_SILT_ARCHIVE_DRAINAGE_TREE
} from "../games/stonewake-depths/stonewake-silt-archive-drainage-kits.js";

const level = {
  bounds: { width: 3200, height: 720 },
  platforms: [
    { id: "floor", role: "floor", x: 0, y: 650, w: 3200, h: 70 },
    { id: "p1", x: 180, y: 560, w: 180, h: 22 },
    { id: "p2", x: 520, y: 500, w: 170, h: 22 },
    { id: "p3", x: 920, y: 445, w: 190, h: 22 },
    { id: "p4", x: 1380, y: 390, w: 190, h: 22 },
    { id: "p5", x: 1880, y: 340, w: 220, h: 22 },
    { id: "p6", x: 2420, y: 305, w: 220, h: 22 }
  ],
  objects: [
    { id: "valve", type: "valve", x: 460, y: 478, w: 34, h: 48 },
    { id: "plate", type: "weighted-trigger", x: 860, y: 610, w: 120, h: 22 },
    { id: "gate", type: "finish-gate", x: 2900, y: 310, w: 90, h: 170 }
  ]
};

const cases = [
  { player: { x: 90, y: 580, w: 34, h: 46 }, water: { level: 640 }, valve: 0, door: 0, plate: false, carry: true },
  { player: { x: 260, y: 545, w: 34, h: 46 }, water: { level: 630 }, valve: 0.12, door: 0, plate: false, carry: true },
  { player: { x: 530, y: 488, w: 34, h: 46 }, water: { level: 618 }, valve: 0.3, door: 0.05, plate: false, carry: false },
  { player: { x: 790, y: 580, w: 34, h: 46 }, water: { level: 608 }, valve: 0.48, door: 0.1, plate: true, carry: false },
  { player: { x: 1040, y: 433, w: 34, h: 46 }, water: { level: 600 }, valve: 0.62, door: 0.2, plate: true, carry: false },
  { player: { x: 1360, y: 378, w: 34, h: 46 }, water: { level: 590 }, valve: 0.72, door: 0.34, plate: true, carry: false },
  { player: { x: 1680, y: 378, w: 34, h: 46 }, water: { level: 584 }, valve: 0.82, door: 0.46, plate: true, carry: false },
  { player: { x: 2050, y: 328, w: 34, h: 46 }, water: { level: 570 }, valve: 0.92, door: 0.64, plate: true, carry: false },
  { player: { x: 2460, y: 293, w: 34, h: 46 }, water: { level: 560 }, valve: 1, door: 0.82, plate: true, carry: false },
  { player: { x: 2880, y: 300, w: 34, h: 46 }, water: { level: 548 }, valve: 1, door: 1, plate: true, carry: false }
];

const kit = createStonewakeSiltArchiveDrainageReadinessDomainKit();
assert.equal(kit.id, "stonewake-silt-archive-drainage-readiness-domain-kit");
assert.equal(STONEWAKE_SILT_ARCHIVE_DRAINAGE_KITS.length, 8);
assert.match(STONEWAKE_SILT_ARCHIVE_DRAINAGE_TREE, /renderer consumes descriptors only/);

const outputs = cases.map((state, index) => kit.describe({ state, level, time: index / 10 }));
const phases = new Set(["archive-handoff-ready", "silt-collapse-warning", "siphon-route-open", "archive-drainage-staged"]);

for (const [index, output] of outputs.entries()) {
  assert.ok(output.readiness >= 0 && output.readiness <= 1, `case ${index} readiness bounded`);
  assert.ok(output.siltPressure >= 0 && output.siltPressure <= 1, `case ${index} pressure bounded`);
  assert.ok(phases.has(output.missionState), `case ${index} phase enum`);
  assert.ok(output.siltDepthGauges.length >= 1, `case ${index} gauges`);
  assert.ok(output.fossilShelfArchives.length >= 1, `case ${index} shelves`);
  assert.ok(output.siphonHoseRoutes.length >= 1, `case ${index} hoses`);
  assert.ok(output.sumpCrankWheels.length === 3, `case ${index} crank wheels`);
  assert.ok(output.waxedMapCases.length >= 1, `case ${index} map cases`);
  assert.equal(output.dawnDrainageLedger.kind, "dawn-drainage-ledger");
  assert.equal(output.rendererHandoff.rendererConsumesDescriptorsOnly, true);
  assert.ok(output.rendererHandoff.counts.total >= 12, `case ${index} descriptor count`);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(output)));
}

assert.ok(outputs.at(-1).readiness > outputs[0].readiness, "prepared input improves readiness");
assert.ok(outputs[0].siltPressure >= outputs.at(-1).siltPressure, "prepared input reduces silt pressure");
assert.ok(kit.ownership.excludes.includes("renderer"));
assert.ok(kit.ownership.excludes.includes("frame-loop"));

console.log("Stonewake silt archive drainage readiness kits smoke passed 10 intake cases.");
