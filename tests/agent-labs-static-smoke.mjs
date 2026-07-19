import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const living = readFileSync("experiments/living-agent-lab/index.html", "utf8");
const livingMarketTrustEntry = readFileSync("experiments/living-agent-lab/market-trust-restoration-readiness-entry.js", "utf8");
const livingMarketTrustKits = readFileSync("experiments/living-agent-lab/market-trust-restoration-readiness-kits.js", "utf8");
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
assert.match(living, /data-experiment="living-agent-lab"/);
assert.match(living, /market-trust-restoration-readiness-entry\.js\?v=living-agent-market-trust-20260709/);
assert.match(livingMarketTrustEntry, /cdn\.jsdelivr\.net\/gh\/LuminaryLabs-Dev\/NexusEngine@main\/src\/index\.js/);
assert.match(livingMarketTrustEntry, /getLivingAgentMarketTrustRestorationReadiness/);
assert.match(livingMarketTrustEntry, /getRendererHandoff/);
assert.match(livingMarketTrustKits, /living-agent-market-trust-restoration-domain/);
assert.match(livingMarketTrustKits, /renderer consumes descriptors only/);

assert.match(onnx, /Workshop ONNX Agent/);
assert.match(onnx, /Load Qwen ONNX Agent/);
assert.match(onnx, /createBuildingInteriorKit/);
assert.match(onnx, /createWorkshopObjectKit/);
assert.match(onnx, /createObjectFocusKit/);
assert.match(onnx, /createOnnxLocalModelKit/);
assert.match(onnx, /three\.module\.js/);
assert.match(onnx, /WASD move/);
assert.match(onnx, /window\.GameHost/);

assert.match(tiny, /Tiny Diffusion Lab/);
assert.match(tiny, /trainingMissionReadiness/);
assert.match(tiny, /training-mission-readiness-entry\.js\?v=tiny-diffusion-training-mission-20260708/);
assert.match(tinyMissionEntry, /cdn\.jsdelivr\.net\/gh\/LuminaryLabs-Dev\/NexusEngine@main\/src\/index\.js/);
assert.match(tinyMissionEntry, /getTrainingMissionReadiness/);
assert.match(tinyMissionEntry, /getRendererHandoff/);

console.log("agent-labs-static-smoke.mjs passed");
