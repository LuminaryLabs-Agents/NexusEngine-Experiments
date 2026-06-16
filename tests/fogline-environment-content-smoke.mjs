import assert from "node:assert/strict";
import { foglineEnvironmentPreset } from "../experiments/fogline-relay/src/fogline-environment-preset.js";
import { createFoglineEnvironmentContent } from "../experiments/fogline-relay/src/fogline-content-adapter.js";
import { createFoglineRelayLevel } from "../experiments/fogline-relay/src/level.js";

const level = createFoglineRelayLevel();
const content = createFoglineEnvironmentContent(level);

assert.equal(foglineEnvironmentPreset.id, "fogline-dense-forest-v1");
assert.ok(foglineEnvironmentPreset.biomes.length >= 5, "Fogline preset should define multiple biomes");
assert.ok(foglineEnvironmentPreset.species.length >= 5, "Fogline preset should define multiple vegetation species");
assert.ok(foglineEnvironmentPreset.placement.targetInstances >= 2000, "Fogline preset should target thousands of trees");
assert.ok(content.vegetation.length >= 1000, "environment content should generate dense vegetation instances");
assert.ok(content.vegetation.some((item) => item.scale > 2.5), "environment content should include huge trees");
assert.ok(content.vegetation.some((item) => item.scale < 1.3), "environment content should include small trees");
assert.ok(content.vegetation.every((item) => Number.isFinite(item.position.y)), "all vegetation should be seated on terrain");
assert.ok(typeof content.terrain.heightAt === "function", "environment should expose terrain height service");
assert.ok(typeof content.terrain.normalAt === "function", "environment should expose terrain normal service");

console.log("Fogline environment content smoke passed.");
