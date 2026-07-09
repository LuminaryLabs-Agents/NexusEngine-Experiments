import assert from "node:assert/strict";
import { createNextLedgeDroneRelayRescueReadinessDomainKit } from "../experiments/next-ledge/src/drone-relay-rescue-readiness-kits.js";

const domain = createNextLedgeDroneRelayRescueReadinessDomainKit();

function makeCase(index) {
  const ledges = Array.from({ length: 8 }, (_, ledgeIndex) => ({
    id: `ledge-${ledgeIndex}`,
    x: ledgeIndex * 84 - 240,
    y: 70 + ledgeIndex * 58 + (index % 3) * 9,
    z: 8 + ledgeIndex,
    type: ledgeIndex === 7 ? "summit" : ledgeIndex % 3 === 0 ? "rest" : "normal",
    safe: ledgeIndex % 3 === 0 || ledgeIndex === 7
  }));
  return {
    levelId: `next-ledge-drone-relay-case-${index}`,
    route: { id: "test-route", ledges },
    player: { x: -240 + index * 42, y: 80 + index * 36, z: 10 },
    camera: { x: -180 + index * 16, y: 140 + index * 22, z: 260 },
    currentAnchorId: ledges[Math.min(7, Math.floor(index / 2))].id,
    lastLedgeId: ledges[Math.min(7, Math.floor(index / 2))].id,
    visitedLedgeIds: ledges.slice(0, Math.min(8, index + 1)).map((ledge) => ledge.id),
    stamina: 28 + index * 8,
    constants: { maxStamina: 120 },
    weather: { wind: 0.18 + index * 0.055, snow: 0.12 + index * 0.05, storm: 0.14 + index * 0.04 },
    droneRelay: { rescueProgress: index / 9 },
    mode: index === 9 ? "summit" : index === 0 ? "climbing" : "active"
  };
}

const cases = Array.from({ length: 10 }, (_, index) => makeCase(index));
const results = cases.map((item) => domain.describe(item));

assert.equal(domain.id, "next-ledge-drone-relay-rescue-readiness-domain-kit");
assert.ok(domain.tree.includes("next-ledge-drone-relay-rescue-readiness-domain"));
assert.equal(domain.ownership.renderer, false);
assert.equal(domain.ownership.dom, false);
assert.equal(domain.ownership.browserInput, false);
assert.equal(domain.ownership.three, false);
assert.equal(domain.ownership.webgl, false);
assert.equal(domain.ownership.audio, false);
assert.equal(domain.ownership.assetLoading, false);
assert.equal(domain.ownership.frameLoop, false);
assert.equal(domain.ownership.physics, false);
assert.equal(domain.ownership.storage, false);

for (const [index, result] of results.entries()) {
  assert.equal(result.kind, "domain-readiness");
  assert.ok(result.rendererContract.includes("renderer consumes descriptors only"), `case ${index} contract`);
  assert.ok(result.phosphorAnchors.length >= 1, `case ${index} phosphor anchors`);
  assert.ok(result.snowFlagBreadcrumbs.length >= 1, `case ${index} snow flags`);
  assert.ok(result.dronePerches.length >= 1, `case ${index} drone perches`);
  assert.ok(result.rescueCableSpools.length >= 1, `case ${index} cable spools`);
  assert.ok(result.heatBeaconFlares.length >= 1, `case ${index} heat beacons`);
  assert.equal(result.extractionLedgers.length, 1, `case ${index} extraction ledger`);
  assert.ok(result.summary.readiness >= 0 && result.summary.readiness <= 1, `case ${index} readiness bounds`);
  assert.ok(result.summary.stormPressure >= 0 && result.summary.stormPressure <= 1, `case ${index} storm bounds`);
  assert.ok(["launch-drone-extraction", "clear-cable-spools", "mark-whiteout-route", "find-survivor-ledge"].includes(result.summary.phase), `case ${index} phase enum`);
  assert.equal(result.rendererHandoff.descriptorCount, result.rendererHandoff.descriptors.length, `case ${index} descriptor count`);
  assert.equal(result.rendererHandoff.counts.total, result.rendererHandoff.descriptorCount, `case ${index} total count`);
  assert.doesNotThrow(() => JSON.stringify(result), `case ${index} JSON safe`);
}

assert.ok(results.at(-1).summary.readiness >= results[0].summary.readiness, "mature rescue state should not regress below cold start");
console.log("Next Ledge drone relay rescue readiness kits smoke passed 10 intake cases.");
