import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const living = readFileSync("experiments/living-agent-lab/index.html", "utf8");
const onnx = readFileSync("experiments/onnx-agent-lab/index.html", "utf8");
const tiny = readFileSync("experiments/tiny-diffusion-lab/index.html", "utf8");
const tinyMissionEntry = readFileSync("experiments/tiny-diffusion-lab/app/training-mission-readiness-entry.js", "utf8");

assert.match(living, /Living Agent Lab/);
assert.match(living, /Xenova\/mobilebert-uncased-mnli/);
assert.match(living, /zero-shot-classification/);
assert.match(living, /availableActions/);
assert.match(living, /visibleState/);
assert.match(living, /window\.GameHost/);
assert.match(living, /Dispose/);

assert.match(onnx, /ONNX Companion Workshop/);
assert.match(onnx, /onnx-community\/Qwen2\.5-0\.5B-Instruct/);
assert.match(onnx, /createOnnxWorkshopThreeJsKits/);
assert.match(onnx, /three\.module\.js/);
assert.match(onnx, /WASD to walk/);
assert.match(onnx, /Click objects for ONNX review/);
assert.match(onnx, /Click away to return/);
assert.match(onnx, /window\.GameHost/);

assert.match(tiny, /Tiny Diffusion Lab/);
assert.match(tiny, /trainingMissionReadiness/);
assert.match(tiny, /training-mission-readiness-entry\.js\?v=tiny-diffusion-training-mission-20260708/);
assert.match(tinyMissionEntry, /cdn\.jsdelivr\.net\/gh\/LuminaryLabs-Dev\/NexusEngine@main\/src\/index\.js/);
assert.match(tinyMissionEntry, /getTrainingMissionReadiness/);
assert.match(tinyMissionEntry, /getRendererHandoff/);

console.log("agent-labs-static-smoke.mjs passed");
