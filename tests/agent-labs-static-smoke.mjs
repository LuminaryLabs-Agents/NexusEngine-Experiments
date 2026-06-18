import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const living = readFileSync("experiments/living-agent-lab/index.html", "utf8");
const onnx = readFileSync("experiments/onnx-agent-lab/index.html", "utf8");

assert.match(living, /Living Agent Lab/);
assert.match(living, /fakeHarness/);
assert.match(living, /window\.GameHost/);
assert.match(living, /player\.stole\.apple/);

assert.match(onnx, /ONNX Agent Lab/);
assert.match(onnx, /tone-ranker/);
assert.match(onnx, /onnx-loader:run-complete/);
assert.match(onnx, /window\.GameHost/);

console.log("agent-labs-static-smoke.mjs passed");
