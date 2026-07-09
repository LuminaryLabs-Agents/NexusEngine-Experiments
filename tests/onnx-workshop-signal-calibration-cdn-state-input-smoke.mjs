import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createOnnxWorkshopSignalCalibrationRendererHandoff } from "../experiments/_kits/onnx-agent-lab/onnx-workshop-signal-calibration-kits.js";

const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const entry = readFileSync(new URL("../experiments/onnx-agent-lab/signal-calibration-entry.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../experiments/onnx-agent-lab/signal-calibration.html", import.meta.url), "utf8");
const kit = readFileSync(new URL("../experiments/_kits/onnx-agent-lab/onnx-workshop-signal-calibration-kits.js", import.meta.url), "utf8");

assert.ok(entry.includes(cdn), "entry must import NexusEngine main CDN");
assert.ok(!entry.includes("NexusRealtime"), "changed entry must not import the old NexusRealtime runtime");
assert.ok(html.includes("onnx-workshop-signal-calibration-renderer-handoff-pass"));
assert.ok(html.includes("signal-calibration-entry.js"));
assert.ok(entry.includes("globalThis.GameHost"));
assert.ok(entry.includes("getRendererHandoff"));
assert.ok(kit.includes("renderer consumes descriptors only"));
for (const forbidden of ["new WebGLRenderer", "new Audio", "requestAnimationFrame(", "document.querySelector"] ) {
  assert.ok(!kit.includes(forbidden), `kit should not own ${forbidden}`);
}

const cases = Array.from({ length: 10 }, (_, index) => ({
  seed: index + 31,
  loaded: index >= 2,
  sceneOpen: index >= 5,
  fallbackActive: index % 3 === 0,
  memoryTurns: index * 2,
  focusedTools: Math.min(6, index),
  promptClarity: Math.min(1, 0.18 + index * 0.08),
  backendConfidence: Math.min(1, 0.12 + index * 0.09),
  userMomentum: Math.min(1, 0.2 + index * 0.06),
  hazardNoise: Math.max(0, 0.84 - index * 0.07),
  toolCount: 6,
  quickActions: 3 + (index % 4)
}));

for (const input of cases) {
  const handoff = createOnnxWorkshopSignalCalibrationRendererHandoff(input);
  assert.equal(handoff.readiness.state.seed, input.seed);
  assert.equal(handoff.rendererConsumesDescriptorsOnly, true);
  assert.ok(handoff.readiness.readiness >= 0 && handoff.readiness.readiness <= 1);
  assert.ok(Object.values(handoff.descriptorBuckets).every((bucket) => Array.isArray(bucket) && bucket.length === 1));
}

console.log("ONNX workshop signal calibration CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
