import assert from "node:assert/strict";
import { foglineEnvironmentPreset } from "../experiments/fogline-relay/src/fogline-environment-preset.js";
import { createFoglineEnvironmentContent } from "../experiments/fogline-relay/src/fogline-content-adapter.js";
import { createFoglineRelayLevel } from "../experiments/fogline-relay/src/level.js";

const level = createFoglineRelayLevel();
const content = createFoglineEnvironmentContent(level);
const tiltLimit = foglineEnvironmentPreset.placement.tiltDegrees * Math.PI / 180;

assert.equal(foglineEnvironmentPreset.id, "fogline-dense-forest-v2");
assert.ok(foglineEnvironmentPreset.biomes.length >= 5, "Fogline preset should define multiple biomes");
assert.ok(foglineEnvironmentPreset.species.length >= 5, "Fogline preset should define multiple vegetation species");
assert.ok(foglineEnvironmentPreset.placement.targetInstances >= 2000, "Fogline preset should target thousands of trees");
assert.ok(content.vegetation.length >= 1000, "environment content should generate dense vegetation instances");
assert.ok(content.vegetation.some((item) => item.scale >= 8), "environment content should include 30m+ class giant trees");
assert.ok(content.vegetation.some((item) => item.scale < 3), "environment content should include small trees and saplings");
assert.ok(content.vegetation.every((item) => Number.isFinite(item.position.y)), "all vegetation should be seated on terrain");
assert.ok(content.vegetation.some((item) => item.inset > 0.2), "some vegetation should be visibly seated into the ground");
assert.ok(content.vegetation.every((item) => Math.abs(item.tiltX) <= tiltLimit + 0.0001), "tiltX should stay within configured tilt bounds");
assert.ok(content.vegetation.every((item) => Math.abs(item.tiltZ) <= tiltLimit + 0.0001), "tiltZ should stay within configured tilt bounds");
assert.ok(content.vegetation.some((item) => Math.abs(item.tiltX) > 0.01 || Math.abs(item.tiltZ) > 0.01), "vegetation should have varied tilt");
assert.ok(content.vegetation.some((item) => item.rotation > Math.PI), "vegetation should use full yaw rotation range");
assert.ok(typeof content.terrain.heightAt === "function", "environment should expose terrain height service");
assert.ok(typeof content.terrain.normalAt === "function", "environment should expose terrain normal service");

console.log("Fogline environment content smoke passed.");
