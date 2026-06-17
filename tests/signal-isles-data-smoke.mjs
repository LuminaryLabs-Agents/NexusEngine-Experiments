import assert from "node:assert/strict";
import { signalIslesLevel01 } from "../experiments/nexus-frontier-signal-isles/src/level-01.js";
import { signalIslesPreset } from "../experiments/nexus-frontier-signal-isles/src/signal-isles-preset.js";
import { signalIslesSequences } from "../experiments/nexus-frontier-signal-isles/src/sequences.js";

function assertNoFunctions(value, path = "root") {
  assert.notEqual(typeof value, "function", `${path} should be declarative, not a function`);
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) assertNoFunctions(child, `${path}.${key}`);
}

assertNoFunctions(signalIslesLevel01, "level");
assertNoFunctions(signalIslesPreset, "preset");
assertNoFunctions(signalIslesSequences, "sequences");
assert.equal(signalIslesLevel01.id, "nexus-frontier-signal-isles");
assert.equal(signalIslesLevel01.scanSites.length, 3);
assert.equal(signalIslesLevel01.resourceNodes.length, 2);
assert.equal(signalIslesLevel01.buildSites.length, 1);
assert.equal(signalIslesLevel01.gates.length, 1);
assert.equal(signalIslesLevel01.route.checkpoints.length, 1);
assert.equal(signalIslesLevel01.cargo.length, 1);
assert.equal(signalIslesSequences.length, 10);
assert.ok(signalIslesLevel01.kitUtilization.length >= 30, "showcase should use a broad kit stack");
assert.equal(new Set(signalIslesLevel01.kitUtilization.map((kit) => kit.name)).size, signalIslesLevel01.kitUtilization.length);

console.log("Signal Isles data smoke passed.");
