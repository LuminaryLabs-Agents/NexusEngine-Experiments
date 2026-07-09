import assert from "node:assert/strict";
import { createStonewakePressureLockPumpReadinessDomainKit, STONEWAKE_PRESSURE_LOCK_PUMP_KITS } from "../games/stonewake-depths/stonewake-pressure-lock-pump-kits.js";

const level = {
  bounds: { width: 3000, height: 820 },
  platforms: [
    { id: "p0", x: 80, y: 680, w: 260, h: 32, role: "start" },
    { id: "p1", x: 420, y: 610, w: 240, h: 30, role: "route" },
    { id: "p2", x: 760, y: 560, w: 260, h: 30, role: "route" },
    { id: "p3", x: 1120, y: 500, w: 250, h: 30, role: "route" },
    { id: "p4", x: 1480, y: 450, w: 250, h: 30, role: "route" },
    { id: "p5", x: 1840, y: 420, w: 250, h: 30, role: "route" },
    { id: "p6", x: 2220, y: 380, w: 250, h: 30, role: "route" },
    { id: "floor", x: 0, y: 760, w: 3000, h: 60, role: "floor" }
  ],
  objects: [
    { id: "player-start", type: "player", x: 130, y: 630, w: 24, h: 46 },
    { id: "block", type: "heavy-block", x: 320, y: 600, w: 58, h: 54 },
    { id: "plate", type: "weighted-trigger", x: 930, y: 548, w: 92, h: 12 },
    { id: "valve", type: "valve", x: 1240, y: 456, w: 48, h: 48 },
    { id: "chain-a", type: "chain", x: 510, y: 470, w: 16, h: 150 },
    { id: "chain-b", type: "chain", x: 1260, y: 340, w: 16, h: 180 },
    { id: "chain-c", type: "chain", x: 1960, y: 300, w: 16, h: 190 },
    { id: "gate", type: "finish-gate", x: 2640, y: 312, w: 40, h: 148 }
  ]
};

const states = Array.from({ length: 10 }, (_, index) => {
  const t = index / 9;
  return {
    time: index * 12,
    status: "playing",
    carry: index % 3 === 0,
    plate: t > 0.38,
    valve: t,
    door: Math.max(0, t - 0.2) / 0.8,
    camera: { x: Math.max(0, 2600 * t - 620), y: 0 },
    player: { x: 120 + 2450 * t, y: 626 - 260 * t, w: 24, h: 46 },
    water: { level: 750 - 210 * t, speed: 2.2 }
  };
});

const kit = createStonewakePressureLockPumpReadinessDomainKit();
assert.equal(kit.id, "stonewake-pressure-lock-pump-readiness-domain-kit");
assert.ok(kit.tree.includes("stonewake-pressure-lock-pump-readiness-domain"));
assert.ok(STONEWAKE_PRESSURE_LOCK_PUMP_KITS.includes("stonewake-lockmaster-ledger-kit"));

let previousReadiness = -1;
for (const [index, state] of states.entries()) {
  const result = kit.describe({ state, level, time: index });
  assert.equal(result.domain, "stonewake-pressure-lock-pump-readiness-domain");
  assert.ok(result.readiness >= 0 && result.readiness <= 1, `readiness bounded for case ${index}`);
  assert.ok(result.pressure >= 0 && result.pressure <= 1, `pressure bounded for case ${index}`);
  assert.ok(["lock-pump-staged", "pressure-critical", "air-pocket-route", "lockmaster-handoff-ready"].includes(result.missionState));
  assert.ok(result.pressureGateWheels.length >= 3);
  assert.ok(result.pumpChainTensions.length >= 1);
  assert.ok(result.bellowsAirPockets.length >= 1);
  assert.ok(result.chalkDepthMarkers.length >= 1);
  assert.ok(result.carbideLampRelays.length >= 1);
  assert.equal(result.lockmasterLedger.kind, "lockmaster-ledger");
  assert.equal(result.rendererHandoff.rendererConsumesDescriptorsOnly, true);
  assert.equal(result.rendererHandoff.counts.total, result.pressureGateWheels.length + result.pumpChainTensions.length + result.bellowsAirPockets.length + result.chalkDepthMarkers.length + result.carbideLampRelays.length + 1);
  assert.doesNotThrow(() => JSON.stringify(result));
  assert.ok(result.ownership.excludes.includes("renderer"));
  if (index > 4) assert.ok(result.readiness >= previousReadiness - 0.18, `late readiness should not collapse for case ${index}`);
  previousReadiness = result.readiness;
}

const early = kit.describe({ state: states[0], level });
const late = kit.describe({ state: states[9], level });
assert.ok(late.readiness > early.readiness, "completed pressure-lock route improves readiness");
assert.equal(late.missionState, "lockmaster-handoff-ready");

console.log("Stonewake pressure lock pump readiness kits smoke passed 10 intake cases.");
