import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const living = readFileSync("experiments/living-agent-lab/index.html", "utf8");
const onnx = readFileSync("experiments/onnx-agent-lab/index.html", "utf8");

assert.match(living, /Living Agent Lab/);
assert.match(living, /Xenova\/mobilebert-uncased-mnli/);
assert.match(living, /zero-shot-classification/);
assert.match(living, /availableActions/);
assert.match(living, /visibleState/);
assert.match(living, /window\.GameHost/);
assert.match(living, /Dispose/);

assert.match(onnx, /ONNX Agent Workspace/);
assert.match(onnx, /onnx-community\/Qwen2\.5-0\.5B-Instruct/);
assert.match(onnx, /createOnnxWorkspaceKits/);
assert.match(onnx, /self-talk-loop-domain-kit/);
assert.match(onnx, /threeRenderAdapter/);
assert.match(onnx, /Load Qwen/);
assert.match(onnx, /Run self-talk/);
assert.match(onnx, /window\.GameHost/);

console.log("agent-labs-static-smoke.mjs passed");
