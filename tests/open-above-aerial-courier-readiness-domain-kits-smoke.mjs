import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createOpenAboveAerialCourierReadinessDomainKit,
  createOpenAboveCourierPouchTargetKit,
  createOpenAboveRibbonCheckpointKit,
  createOpenAboveComfortStabilityMeterKit,
  createOpenAboveStormShearWarningKit,
  createOpenAboveMeadowDropZoneKit,
  createOpenAboveReturnDockBeaconKit
} from "../experiments/the-open-above/open-above-aerial-courier-readiness-kits.js";

const kitSource = readFileSync("experiments/the-open-above/open-above-aerial-courier-readiness-kits.js", "utf8");
const forbiddenRuntimeOwners = ["document.", "window.", "HTMLElement", "WebGL", "THREE", "Audio", "requestAnimationFrame", "addEventListener"];
for (const forbidden of forbiddenRuntimeOwners) {
  assert.ok(!kitSource.includes(forbidden), `aerial courier reusable kit does not own ${forbidden}`);
}

const cases = Array.from({ length: 10 }, (_, index) => ({
  frame: index * 77,
  elapsed: index * 0.5,
  input: {
    pitchDown: index % 3 === 0,
    boost: index % 4 === 1,
    bankLeft: index % 2 === 0,
    bankRight: index % 2 === 1
  },
  body: {
    speed: 45 + index * 12,
    altitude: 160 + index * 25,
    clearance: 58 + index * 28,
    position: { x: index * 115 - 420, y: 160 + index * 25, z: 520 - index * 90 },
    rotation: { yaw: -1.1 + index * 0.24, pitch: 0.02 + index * 0.015, roll: -0.45 + index * 0.1 },
    velocity: { x: 12 + index * 2, y: index % 4 === 0 ? -8 : 5, z: -62 - index * 3 },
    carve: { turnStrength: index / 9 },
    stability: { sinkRate: index < 4 ? -35 + index * 6 : -4 }
  },
  flock: { agents: Array.from({ length: index % 5 }, (_, flockIndex) => ({ id: `flock-${index}-${flockIndex}` })) }
}));

const domain = createOpenAboveAerialCourierReadinessDomainKit();
const pouchKit = createOpenAboveCourierPouchTargetKit();
const ribbonKit = createOpenAboveRibbonCheckpointKit();
const comfortKit = createOpenAboveComfortStabilityMeterKit();
const shearKit = createOpenAboveStormShearWarningKit();
const dropKit = createOpenAboveMeadowDropZoneKit();
const dockKit = createOpenAboveReturnDockBeaconKit();

for (const [index, state] of cases.entries()) {
  const pouches = pouchKit.describe(state);
  const ribbons = ribbonKit.describe(state);
  const comfort = comfortKit.describe(state);
  const shears = shearKit.describe(state);
  const drops = dropKit.describe(state);
  const dock = dockKit.describe(state);
  const result = domain.compose(state);

  assert.ok(pouches.length >= 3, `case ${index} emits courier pouch targets`);
  assert.ok(ribbons.length >= 4, `case ${index} emits route ribbon checkpoints`);
  assert.equal(comfort.length, 1, `case ${index} emits one comfort stability meter`);
  assert.ok(shears.length >= 3, `case ${index} emits storm shear warnings`);
  assert.ok(drops.length >= 2, `case ${index} emits meadow drop zones`);
  assert.ok(dock.length >= 4, `case ${index} emits return dock beacons`);

  assert.equal(result.rendererHandoff.contract, "renderer-consumes-descriptors-only", `case ${index} uses descriptor-only handoff`);
  assert.equal(result.rendererHandoff.counts.courierPouchTargets, result.groups.courierPouchTargets.length, `case ${index} mirrors pouch count`);
  assert.equal(result.summary.descriptorCount, result.rendererHandoff.counts.total, `case ${index} mirrors total descriptor count`);
  assert.ok(result.rendererHandoff.counts.total >= 24, `case ${index} has a dense enough descriptor surface`);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(result)), `case ${index} is JSON serializable`);
}

console.log("Open Above aerial courier readiness domain kits smoke passed.");
