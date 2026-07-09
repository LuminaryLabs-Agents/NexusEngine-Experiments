import assert from "node:assert/strict";
import { createNextLedgeSummitWeatherStationReadinessDomainKit, NEXT_LEDGE_SUMMIT_WEATHER_STATION_TREE } from "../experiments/next-ledge/src/summit-weather-station-readiness-kits.js";

const kit = createNextLedgeSummitWeatherStationReadinessDomainKit();
function makeSnapshot(overrides = {}) {
  const ledges = [
    { id: "start", x: -120, y: 50, type: "normal" },
    { id: "ice-1", x: -80, y: 150, type: "normal" },
    { id: "rest-1", x: -24, y: 250, type: "rest", safe: true },
    { id: "wind-gap", x: 62, y: 360, type: "normal" },
    { id: "rest-2", x: 108, y: 480, type: "rest", safe: true },
    { id: "summit", x: 12, y: 660, type: "summit", safe: true }
  ];
  return { levelId: "next-ledge-test", mode: "climbing", player: { x: -90, y: 160, z: 8, vx: 24, vy: 12 }, camera: { x: 0, y: 220, z: 300 }, route: { id: "test-route", ledges }, currentAnchorId: "ice-1", visitedLedgeIds: ["start", "ice-1"], stamina: 86, constants: { maxStamina: 115 }, weather: { wind: 0.36, storm: 0.42 }, ...overrides };
}
const cases = [
  makeSnapshot(),
  makeSnapshot({ currentAnchorId: "rest-1", visitedLedgeIds: ["start", "ice-1", "rest-1"], stamina: 101 }),
  makeSnapshot({ weather: { wind: 0.78, storm: 0.85 }, stamina: 35 }),
  makeSnapshot({ mode: "falling", player: { x: 60, y: 420, z: 8, vx: 70, vy: -110 }, currentAnchorId: "wind-gap" }),
  makeSnapshot({ weatherStation: { repairProgress: 0.1 }, visitedLedgeIds: ["start"] }),
  makeSnapshot({ weatherStation: { repairProgress: 0.92 }, visitedLedgeIds: ["start", "ice-1", "rest-1", "wind-gap", "rest-2", "summit"], currentAnchorId: "summit", stamina: 115, weather: { wind: 0.12, storm: 0.08 } }),
  makeSnapshot({ route: { id: "single", ledges: [{ id: "solo", x: 0, y: 80, type: "summit", safe: true }] }, currentAnchorId: "solo" }),
  makeSnapshot({ route: { id: "empty", ledges: [] }, currentAnchorId: undefined, player: { x: 0, y: 0, z: 8 } }),
  makeSnapshot({ blizzardIntensity: 1, weather: undefined, stationRepairProgress: 0.55 }),
  makeSnapshot({ player: { x: 240, y: 780, z: 8, vx: 0, vy: 0 }, currentAnchorId: "summit", visitedLedgeIds: ["start", "ice-1", "rest-1", "wind-gap", "rest-2", "summit"] })
];
assert.equal(kit.id, "next-ledge-summit-weather-station-readiness-domain-kit");
assert.ok(NEXT_LEDGE_SUMMIT_WEATHER_STATION_TREE.includes("renderer consumes descriptors only"));
for (const key of ["renderer", "dom", "browserInput", "three", "webgl", "audio", "assetLoading", "frameLoop", "physics"]) assert.equal(kit.ownership[key], false, key);
let weakReadiness = 0;
let strongReadiness = 0;
cases.forEach((snapshot, index) => {
  const result = kit.describe(snapshot);
  assert.equal(result.kind, "domain-readiness", `case ${index} domain kind`);
  assert.ok(Array.isArray(result.anemometerMasts), `case ${index} masts`);
  assert.ok(Array.isArray(result.solarBatteryCaches), `case ${index} batteries`);
  assert.ok(Array.isArray(result.barometerStakes), `case ${index} stakes`);
  assert.ok(Array.isArray(result.windCorridorRibbons), `case ${index} ribbons`);
  assert.ok(Array.isArray(result.radioRepeaters), `case ${index} repeaters`);
  assert.equal(result.dawnForecastLedgers.length, 1, `case ${index} ledger`);
  assert.equal(result.rendererHandoff.kind, "renderer-handoff", `case ${index} handoff`);
  assert.equal(result.rendererHandoff.descriptorCount, result.rendererHandoff.descriptors.length, `case ${index} count`);
  assert.ok(result.summary.readiness >= 0 && result.summary.readiness <= 1, `case ${index} readiness bounds`);
  assert.ok(result.summary.stormPressure >= 0 && result.summary.stormPressure <= 1, `case ${index} pressure bounds`);
  assert.ok(["broadcast-dawn-window", "tune-repeaters", "repair-station-chain", "haul-weather-kit"].includes(result.summary.phase), `case ${index} phase`);
  assert.doesNotThrow(() => JSON.stringify(result), `case ${index} json`);
  if (index === 4) weakReadiness = result.summary.readiness;
  if (index === 5) strongReadiness = result.summary.readiness;
});
assert.ok(strongReadiness > weakReadiness, "mature station input should improve readiness");
console.log("Next Ledge summit weather station readiness kits smoke passed 10 intake cases.");
