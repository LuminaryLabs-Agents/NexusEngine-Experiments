import assert from "node:assert/strict";
import { createNextLedgeAvalancheBeaconRescueReadinessDomainKit } from "../experiments/next-ledge/src/avalanche-beacon-rescue-readiness-kits.js";

const domainKit = createNextLedgeAvalancheBeaconRescueReadinessDomainKit();

function makeLedges(count = 8) {
  return Array.from({ length: count }, (_, index) => ({
    id: `ledge-${index}`,
    x: -220 + index * 70,
    y: 80 + index * 86,
    z: 4,
    r: 22 + (index % 3) * 5,
    type: index === count - 1 ? "summit" : index % 4 === 0 ? "rest" : "span",
    safe: index % 5 === 0
  }));
}

const cases = [
  { name: "cold-start-low-route", snapshot: { levelId: "case-0", route: { ledges: makeLedges() }, player: { x: -210, y: 70, vx: 0, vy: 0 }, stamina: 112, constants: { maxStamina: 120 }, weather: { storm: 0.2 }, rescue: { victimsReported: 2, searchProgress: 0.08 } } },
  { name: "mid-route-search", snapshot: { levelId: "case-1", route: { ledges: makeLedges() }, currentAnchorId: "ledge-3", player: { x: -20, y: 330, vx: 42, vy: 4 }, stamina: 78, constants: { maxStamina: 120 }, weather: { storm: 0.38 }, rescue: { victimsReported: 3, searchProgress: 0.45 } } },
  { name: "summit-heavy-storm", snapshot: { levelId: "case-2", route: { ledges: makeLedges() }, currentAnchorId: "ledge-6", player: { x: 180, y: 650, vx: 110, vy: 20 }, stamina: 34, constants: { maxStamina: 120 }, mode: "falling", weather: { storm: 0.9 }, rescue: { victimsReported: 4, searchProgress: 0.62 } } },
  { name: "no-ledges", snapshot: { levelId: "case-3", player: { x: 0, y: 0 }, stamina: 55, constants: { maxStamina: 100 }, rescue: { victimsReported: 1 } } },
  { name: "enabled-target-filter", snapshot: { levelId: "case-4", route: { ledges: makeLedges() }, currentAnchorId: "ledge-2", enabledTargetIds: ["ledge-2", "ledge-4"], player: { x: -80, y: 250, vx: 12, vy: 0 }, stamina: 99, constants: { maxStamina: 120 }, weather: { storm: 0.15 }, rescue: { victimsReported: 2, searchProgress: 0.3 } } },
  { name: "visited-derived-progress", snapshot: { levelId: "case-5", route: { ledges: makeLedges(10) }, visitedLedgeIds: ["ledge-0", "ledge-1", "ledge-2", "ledge-3", "ledge-4"], player: { x: 40, y: 390, vx: 6, vy: -4 }, stamina: 90, constants: { maxStamina: 120 }, weather: { storm: 0.3 }, victimsReported: 3 } },
  { name: "rest-shelter-rich", snapshot: { levelId: "case-6", route: { ledges: makeLedges(12) }, currentAnchorId: "ledge-5", player: { x: 100, y: 470 }, stamina: 105, constants: { maxStamina: 120 }, weather: { storm: 0.22 }, rescue: { victimsReported: 2, searchProgress: 0.74 } } },
  { name: "unsafe-high-altitude", snapshot: { levelId: "case-7", route: { ledges: makeLedges(7) }, currentAnchorId: "ledge-5", player: { x: 130, y: 770, vx: 160, vy: 30 }, stamina: 12, constants: { maxStamina: 120 }, blizzardIntensity: 0.96, rescue: { victimsReported: 5, searchProgress: 0.5 } } },
  { name: "partial-numeric-inputs", snapshot: { levelId: "case-8", route: { ledges: [{ id: "a", x: "10", y: "90" }, { id: "b", x: "bad", y: 190, safe: true }, { id: "c", x: 120, y: 290, type: "summit" }] }, player: { x: "7", y: 80, vx: "9" }, stamina: "60", constants: { maxStamina: "120" }, rescue: { victimsReported: "2", searchProgress: "0.66" } } },
  { name: "complete-extraction", snapshot: { levelId: "case-9", route: { ledges: makeLedges(9) }, currentAnchorId: "ledge-7", player: { x: 260, y: 710, vx: 4, vy: 0 }, stamina: 118, constants: { maxStamina: 120 }, weather: { storm: 0.08 }, rescue: { victimsReported: 2, searchProgress: 1 } } }
];

assert.equal(domainKit.id, "next-ledge-avalanche-beacon-rescue-readiness-domain-kit");
assert.equal(domainKit.ownership.renderer, false);
assert.equal(domainKit.ownership.dom, false);
assert.equal(domainKit.ownership.browserInput, false);
assert.equal(domainKit.ownership.three, false);
assert.equal(domainKit.ownership.webgl, false);
assert.equal(domainKit.ownership.audio, false);
assert.equal(domainKit.ownership.assetLoading, false);
assert.equal(domainKit.ownership.frameLoop, false);
assert.equal(domainKit.ownership.physics, false);

for (const testCase of cases) {
  const readiness = domainKit.describe(testCase.snapshot);
  assert.equal(readiness.kind, "domain-readiness", testCase.name);
  assert.ok(readiness.tree.includes("next-ledge-avalanche-beacon-rescue-readiness-domain"), testCase.name);
  assert.ok(readiness.rendererContract.includes("renderer consumes descriptors only"), testCase.name);
  assert.ok(Array.isArray(readiness.beaconPingArcs), testCase.name);
  assert.ok(Array.isArray(readiness.probeGridFlags), testCase.name);
  assert.ok(Array.isArray(readiness.snowCaveMarkers), testCase.name);
  assert.ok(Array.isArray(readiness.ropeBelayAnchors), testCase.name);
  assert.ok(Array.isArray(readiness.searchTeamLanterns), testCase.name);
  assert.equal(readiness.avalancheVictimLedgers.length, 1, testCase.name);
  assert.ok(readiness.summary.readiness >= 0 && readiness.summary.readiness <= 1, testCase.name);
  assert.ok(readiness.summary.stormExposure >= 0 && readiness.summary.stormExposure <= 1, testCase.name);
  assert.ok(["extract-victims", "dig-confirmed-pings", "sweep-beacon-grid", "establish-shelter"].includes(readiness.summary.phase), testCase.name);
  assert.equal(readiness.rendererHandoff.descriptorCount, readiness.rendererHandoff.descriptors.length, testCase.name);
  assert.equal(readiness.rendererHandoff.counts.total, readiness.rendererHandoff.descriptorCount, testCase.name);
  JSON.stringify(readiness);
}

const early = domainKit.describe(cases[0].snapshot).summary.readiness;
const complete = domainKit.describe(cases[9].snapshot).summary.readiness;
assert.ok(complete > early, "complete rescue state should improve readiness over cold start");

console.log("Next Ledge avalanche beacon rescue readiness kits smoke passed 10 intake cases.");
