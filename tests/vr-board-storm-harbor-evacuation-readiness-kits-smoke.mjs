import assert from "node:assert/strict";
import { createVrBoardStormHarborEvacuationReadinessDomainKit } from "../experiments/_kits/vr-platformer-board/vr-board-storm-harbor-evacuation-readiness-kits.js";

const kit = createVrBoardStormHarborEvacuationReadinessDomainKit();

const cases = Array.from({ length: 10 }, (_, index) => {
  const collectedCount = Math.min(5, Math.floor(index / 2));
  return {
    name: `storm-harbor-case-${index}`,
    input: {
      avatar: { position: { x: index * 1.72, y: 1.2 + index * 0.28 }, size: { x: 0.48, y: 0.78 }, velocity: { x: index % 2 ? 1.2 : -0.4 }, grounded: index % 3 === 0 },
      level: {
        start: { x: 0, y: 1.08 },
        exit: { id: "skiff-launch-gate", x: 15.4, y: 4.62, w: 0.82, h: 1.2 },
        platforms: [
          { id: "storm-pier", x: -0.7, y: 1.08, w: 3.24, h: 0.28 },
          { id: "crane-footing", x: 3.05, y: 2.0, w: 1.82, h: 0.26 },
          { id: "flooded-dock", x: 5.78, y: 2.78, w: 2.2, h: 0.24 },
          { id: "cargo-net-cache", x: 8.82, y: 2.28, w: 1.92, h: 0.26 },
          { id: "skiff-berth", x: 11.72, y: 3.58, w: 2.42, h: 0.28 },
          { id: "launch-ramp", x: 14.65, y: 4.46, w: 1.72, h: 0.3 }
        ],
        collectibles: [
          { id: "flare-storm-pier", x: 2.18, y: 2.07, value: 1 },
          { id: "dry-net-crane", x: 4.18, y: 2.92, value: 1 },
          { id: "flare-flooded-dock", x: 6.83, y: 3.62, value: 1 },
          { id: "blanket-cache", x: 9.64, y: 3.12, value: 1 },
          { id: "skiff-rope", x: 12.92, y: 4.46, value: 1 }
        ],
        hazards: [
          { id: "surge-low-water", x: 4.8, y: 1.0, w: 0.88, h: 0.36 },
          { id: "swinging-crane-hook", x: 7.36, y: 2.58, w: 0.78, h: 0.4 },
          { id: "broken-dock-drop", x: 10.86, y: 1.05, w: 0.86, h: 0.36 }
        ]
      },
      objects: { collectedIds: ["flare-storm-pier", "dry-net-crane", "flare-flooded-dock", "blanket-cache", "skiff-rope"].slice(0, collectedCount), collectedValue: collectedCount },
      weather: { tideLevel: 0.3 + index * 0.045, wind: 0.18 + index * 0.03, rain: 0.42 },
      board: { sizeMeters: { x: 1.8, y: 1.0 }, mode: "storm-harbor-evacuation" },
      input: { moveAxis: index % 2 ? 1 : -1, jumpPressed: index % 3 === 0 },
      time: index * 0.5
    }
  };
});

let previousReadiness = -1;
for (const testCase of cases) {
  const output = kit.describe(testCase.input);
  assert.equal(output.kind, "storm-harbor-evacuation-readiness", testCase.name);
  assert.ok(output.tree.includes("vr-board-storm-harbor-evacuation-readiness-domain"), testCase.name);
  assert.equal(output.tideGauges.length, 4, testCase.name);
  assert.equal(output.flareBuoys.length, 5, testCase.name);
  assert.equal(output.craneCables.length, 5, testCase.name);
  assert.equal(output.supplyNets.length, 5, testCase.name);
  assert.equal(output.rescueSkiffs.length, 2, testCase.name);
  assert.equal(output.rendererHandoff.counts.total, 22, testCase.name);
  assert.ok(output.evacuationReadiness >= 0 && output.evacuationReadiness <= 1, testCase.name);
  assert.ok(output.tideRisk >= 0 && output.tideRisk <= 1, testCase.name);
  assert.ok(["survey-harbor", "cross-flooded-dock", "secure-final-cargo", "launch-skiff"].includes(output.missionState), testCase.name);
  assert.equal(output.rendererHandoff.policy, "renderer-consumes-descriptors-only", testCase.name);
  for (const forbidden of ["no-renderer", "no-dom", "no-browser-input", "no-frame-loop"]) assert.ok(output.ownershipBoundary.includes(forbidden), testCase.name);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(output)), testCase.name);
  if (previousReadiness >= 0 && testCase.input.objects.collectedIds.length >= 4) assert.ok(output.evacuationReadiness >= previousReadiness - 0.35, testCase.name);
  previousReadiness = output.evacuationReadiness;
}

const cold = kit.describe(cases[0].input);
const prepared = kit.describe(cases.at(-1).input);
assert.ok(prepared.evacuationReadiness > cold.evacuationReadiness, "prepared harbor route should be more ready than cold start");

console.log("VR board storm harbor evacuation readiness kits smoke passed 10 intake cases.");
