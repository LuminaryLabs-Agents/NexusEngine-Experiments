import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createOpenAboveStormShelterReadinessDomainKit,
  createOpenAboveRidgeShelterBeaconKit,
  createOpenAboveThermalLiftCorridorKit,
  createOpenAboveBlanketCacheWarmthKit,
  createOpenAboveLightningGapWindowKit,
  createOpenAboveMedicineSlingDropKit,
  createOpenAboveValleyLandingFlareKit
} from "../experiments/the-open-above/open-above-storm-shelter-readiness-kits.js";

const kitSource = readFileSync("experiments/the-open-above/open-above-storm-shelter-readiness-kits.js", "utf8");
const forbiddenRuntimeOwners = ["document.", "window.", "HTMLElement", "WebGL", "THREE", "Audio", "requestAnimationFrame", "addEventListener"];
for (const forbidden of forbiddenRuntimeOwners) {
  assert.ok(!kitSource.includes(forbidden), `storm shelter reusable kit does not own ${forbidden}`);
}

const cases = Array.from({ length: 10 }, (_, index) => ({
  frame: index * 83,
  elapsed: index * 0.42,
  input: {
    pitchDown: index % 3 === 0,
    boost: index === 1 || index === 6,
    bankLeft: index % 2 === 0,
    bankRight: index % 2 === 1
  },
  body: {
    speed: 42 + index * 13,
    altitude: 140 + index * 28,
    clearance: 48 + index * 30,
    position: { x: index * 132 - 520, y: 140 + index * 28, z: 640 - index * 104 },
    rotation: { yaw: -1.25 + index * 0.25, pitch: 0.02 + index * 0.014, roll: -0.48 + index * 0.105 },
    velocity: { x: 10 + index * 2.2, y: index % 4 === 0 ? -13 : 4 + index, z: -68 - index * 4 },
    carve: { turnStrength: Math.min(1, index / 8) },
    stability: { sinkRate: index < 4 ? -48 + index * 7 : -6 }
  },
  flock: { agents: Array.from({ length: index % 4 }, (_, flockIndex) => ({ id: `flock-${index}-${flockIndex}` })) }
}));

const domain = createOpenAboveStormShelterReadinessDomainKit();
const shelterKit = createOpenAboveRidgeShelterBeaconKit();
const thermalKit = createOpenAboveThermalLiftCorridorKit();
const blanketKit = createOpenAboveBlanketCacheWarmthKit();
const lightningKit = createOpenAboveLightningGapWindowKit();
const slingKit = createOpenAboveMedicineSlingDropKit();
const flareKit = createOpenAboveValleyLandingFlareKit();

for (const [index, state] of cases.entries()) {
  const shelters = shelterKit.describe(state);
  const thermals = thermalKit.describe(state);
  const blankets = blanketKit.describe(state);
  const lightning = lightningKit.describe(state);
  const slings = slingKit.describe(state);
  const flares = flareKit.describe(state);
  const result = domain.compose(state);

  assert.ok(shelters.length >= 3, `case ${index} emits ridge shelter beacons`);
  assert.ok(thermals.length >= 4, `case ${index} emits thermal lift corridors`);
  assert.ok(blankets.length >= 2, `case ${index} emits blanket cache warmth markers`);
  assert.ok(lightning.length >= 4, `case ${index} emits lightning gap windows`);
  assert.ok(slings.length >= 3, `case ${index} emits medicine sling drops`);
  assert.ok(flares.length >= 4, `case ${index} emits valley landing flares`);

  assert.equal(result.rendererHandoff.contract, "renderer-consumes-descriptors-only", `case ${index} uses descriptor-only handoff`);
  assert.equal(result.rendererHandoff.counts.ridgeShelterBeacons, result.groups.ridgeShelterBeacons.length, `case ${index} mirrors shelter count`);
  assert.equal(result.rendererHandoff.counts.thermalLiftCorridors, result.groups.thermalLiftCorridors.length, `case ${index} mirrors thermal count`);
  assert.equal(result.summary.descriptorCount, result.rendererHandoff.counts.total, `case ${index} mirrors total descriptor count`);
  assert.ok(result.rendererHandoff.counts.total >= 25, `case ${index} has a dense enough descriptor surface`);
  assert.ok(result.tree.includes("open-above-storm-shelter-readiness-domain"), `case ${index} exposes domain tree`);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(result)), `case ${index} is JSON serializable`);
}

console.log("Open Above storm shelter readiness domain kits smoke passed.");
