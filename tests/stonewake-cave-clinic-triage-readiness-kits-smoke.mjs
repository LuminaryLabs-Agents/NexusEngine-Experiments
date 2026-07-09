import assert from "node:assert/strict";
import { createStonewakeCaveClinicTriageReadinessDomainKit, STONEWAKE_CAVE_CLINIC_TRIAGE_KITS, STONEWAKE_CAVE_CLINIC_TRIAGE_TREE } from "../games/stonewake-depths/stonewake-cave-clinic-triage-kits.js";

const forbidden = ["renderer", "dom", "browser-input", "threejs", "webgl", "audio", "asset-loading", "frame-loop", "physics", "storage"];

function makeLevel(offset = 0) {
  return {
    bounds: { width: 3000, height: 820 },
    platforms: Array.from({ length: 12 }, (_, index) => ({
      id: `p-${index}`,
      role: index === 0 ? "start" : "route",
      x: 130 + index * 220,
      y: 660 - ((index + offset) % 5) * 70,
      w: 150 + (index % 3) * 22,
      h: 24,
      focusId: `focus-${Math.floor(index / 3)}`
    })),
    objects: [
      { id: "player-start", type: "player", x: 90, y: 610, w: 24, h: 46 },
      { id: "valve-a", type: "valve", x: 760, y: 498 },
      { id: "finish-gate-a", type: "finish-gate", x: 2760, y: 350 },
      { id: "plate-a", type: "weighted-trigger", x: 1540, y: 540 }
    ]
  };
}

function makeState(index) {
  const valve = Math.min(1, index / 9);
  const door = Math.max(0, (index - 2) / 7);
  const plate = index >= 3;
  return {
    time: index * 11,
    status: "playing",
    carry: index % 4 === 0,
    camera: { x: Math.max(0, index * 160 - 120), y: 0 },
    player: { x: 90 + index * 235, y: 610 - (index % 4) * 58, w: 24, h: 46 },
    water: { level: 760 - index * 34, speed: 2.2 },
    plate,
    valve,
    door
  };
}

const kit = createStonewakeCaveClinicTriageReadinessDomainKit();
assert.equal(kit.id, "stonewake-cave-clinic-triage-readiness-domain-kit");
assert.equal(kit.domain, "stonewake-cave-clinic-triage-readiness-domain");
assert.equal(kit.tree, STONEWAKE_CAVE_CLINIC_TRIAGE_TREE);
assert.deepEqual(kit.kits, STONEWAKE_CAVE_CLINIC_TRIAGE_KITS);
for (const item of forbidden) assert.ok(kit.ownership.excludes.includes(item), `domain kit must exclude ${item}`);

const cases = Array.from({ length: 10 }, (_, index) => ({ state: makeState(index), level: makeLevel(index) }));
const results = cases.map((input) => kit.describe(input));

for (const [index, result] of results.entries()) {
  assert.equal(result.domain, "stonewake-cave-clinic-triage-readiness-domain", `case ${index} domain`);
  assert.ok(result.readiness >= 0 && result.readiness <= 1, `case ${index} readiness bounded`);
  assert.ok(result.pressure >= 0 && result.pressure <= 1, `case ${index} pressure bounded`);
  assert.ok(["triage-marking", "clinic-staging", "hypothermia-critical", "stretcher-extraction-ready"].includes(result.missionState), `case ${index} mission state`);
  assert.ok(result.thermalBlanketCaches.length >= 1, `case ${index} blankets`);
  assert.ok(result.splintStretcherRoutes.length >= 1, `case ${index} stretcher routes`);
  assert.ok(result.glowwormLanternStrings.length >= 1, `case ${index} lanterns`);
  assert.equal(result.sumpPumpPrime.kind, "sump-pump-prime", `case ${index} pump`);
  assert.ok(result.medicTriageCards.length >= 1, `case ${index} triage cards`);
  assert.equal(result.evacuationStretcherLedger.kind, "evacuation-stretcher-ledger", `case ${index} ledger`);
  assert.equal(result.rendererHandoff.rendererConsumesDescriptorsOnly, true, `case ${index} descriptor-only`);
  assert.equal(result.rendererHandoff.counts.total,
    result.thermalBlanketCaches.length + result.splintStretcherRoutes.length + result.glowwormLanternStrings.length + 1 + result.medicTriageCards.length + 1,
    `case ${index} descriptor count`);
  for (const item of forbidden) assert.ok(result.ownership.excludes.includes(item), `case ${index} excludes ${item}`);
  assert.doesNotThrow(() => JSON.stringify(result), `case ${index} json safe`);
}

assert.ok(results.at(-1).readiness > results[0].readiness, "late route state should improve clinic readiness");
console.log("Stonewake cave clinic triage readiness kits smoke passed 10 intake cases.");
