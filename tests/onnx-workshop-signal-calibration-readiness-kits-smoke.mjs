import assert from "node:assert/strict";
import {
  ONNX_WORKSHOP_SIGNAL_CALIBRATION_DOMAIN,
  ONNX_WORKSHOP_SIGNAL_CALIBRATION_KITS,
  createOnnxWorkshopSignalCalibrationReadiness,
  createOnnxWorkshopSignalCalibrationRendererHandoff
} from "../experiments/_kits/onnx-agent-lab/onnx-workshop-signal-calibration-kits.js";

const cases = [
  { seed: 1, loaded: false, sceneOpen: false, fallbackActive: true, memoryTurns: 0, focusedTools: 0, promptClarity: 0.1, backendConfidence: 0.1, hazardNoise: 0.9 },
  { seed: 2, loaded: true, sceneOpen: false, fallbackActive: false, memoryTurns: 1, focusedTools: 1, promptClarity: 0.42, backendConfidence: 0.62 },
  { seed: 3, loaded: true, sceneOpen: true, fallbackActive: false, memoryTurns: 3, focusedTools: 2, promptClarity: 0.58, backendConfidence: 0.71 },
  { seed: 4, loaded: false, sceneOpen: true, fallbackActive: true, memoryTurns: 2, focusedTools: 3, promptClarity: 0.48, backendConfidence: 0.24 },
  { seed: 5, loaded: true, sceneOpen: true, fallbackActive: false, memoryTurns: 7, focusedTools: 5, promptClarity: 0.76, backendConfidence: 0.82 },
  { seed: 6, loaded: true, sceneOpen: false, fallbackActive: true, memoryTurns: 5, focusedTools: 4, promptClarity: 0.64, backendConfidence: 0.5, hazardNoise: 0.62 },
  { seed: 7, loaded: false, sceneOpen: false, fallbackActive: true, memoryTurns: 11, focusedTools: 6, promptClarity: 0.72, backendConfidence: 0.2 },
  { seed: 8, loaded: true, sceneOpen: true, fallbackActive: false, memoryTurns: 16, focusedTools: 6, promptClarity: 0.9, backendConfidence: 0.96 },
  { seed: 9, loaded: true, sceneOpen: true, fallbackActive: true, memoryTurns: 9, focusedTools: 1, promptClarity: 0.31, backendConfidence: 0.36, hazardNoise: 0.74 },
  { seed: 10, loaded: true, sceneOpen: false, fallbackActive: false, memoryTurns: 4, focusedTools: 2, promptClarity: 0.69, backendConfidence: 0.7, quickActions: 6 }
];

assert.equal(ONNX_WORKSHOP_SIGNAL_CALIBRATION_DOMAIN.id, "onnx-workshop-signal-calibration-readiness-domain");
assert.ok(ONNX_WORKSHOP_SIGNAL_CALIBRATION_DOMAIN.tree.includes("renderer consumes descriptors only"));
assert.ok(ONNX_WORKSHOP_SIGNAL_CALIBRATION_DOMAIN.ownershipExclusions.includes("DOM"));
assert.ok(ONNX_WORKSHOP_SIGNAL_CALIBRATION_KITS.length >= 7);

for (const item of cases) {
  const readiness = createOnnxWorkshopSignalCalibrationReadiness(item);
  assert.ok(readiness.readiness >= 0 && readiness.readiness <= 1, "readiness must be bounded");
  assert.ok(["cold-start", "calibrating", "workshop-ready", "intervention-needed"].includes(readiness.missionState));
  assert.equal(readiness.modelHandshakeBeacons.length, 1);
  assert.equal(readiness.fallbackSafetyRails.length, 1);
  assert.equal(readiness.toolBenchCues.length, 1);
  assert.equal(readiness.promptIntentThreads.length, 1);
  assert.equal(readiness.memoryTraceCards.length, 1);
  assert.equal(readiness.sceneOpenGates.length, 1);
  assert.deepEqual(readiness.descriptorCounts, {
    modelHandshakeBeacons: 1,
    fallbackSafetyRails: 1,
    toolBenchCues: 1,
    promptIntentThreads: 1,
    memoryTraceCards: 1,
    sceneOpenGates: 1
  });
  const handoff = createOnnxWorkshopSignalCalibrationRendererHandoff(item);
  assert.equal(handoff.rendererConsumesDescriptorsOnly, true);
  assert.equal(handoff.descriptorBuckets.modelHandshakeBeacons.length, 1);
  assert.doesNotThrow(() => JSON.stringify(handoff));
}

const early = createOnnxWorkshopSignalCalibrationReadiness(cases[0]);
const mature = createOnnxWorkshopSignalCalibrationReadiness(cases[7]);
assert.ok(mature.readiness > early.readiness, "mature calibration should improve readiness");

console.log("ONNX workshop signal calibration readiness kits smoke passed 10 intake cases.");
