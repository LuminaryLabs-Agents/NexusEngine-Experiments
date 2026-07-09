export const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

export const ONNX_WORKSHOP_SIGNAL_CALIBRATION_DOMAIN = Object.freeze({
  id: "onnx-workshop-signal-calibration-readiness-domain",
  tree: `onnx-workshop-signal-calibration-readiness-domain
├─ model-handshake-domain
│  ├─ runtime-beacon-domain
│  │  └─ onnx-workshop-model-handshake-beacon-kit
│  └─ fallback-rail-domain
│     └─ onnx-workshop-fallback-safety-rail-kit
├─ tool-understanding-domain
│  ├─ tool-bench-cue-domain
│  │  └─ onnx-workshop-tool-bench-cue-kit
│  └─ prompt-intent-domain
│     └─ onnx-workshop-prompt-intent-thread-kit
├─ memory-handoff-domain
│  ├─ memory-trace-domain
│  │  └─ onnx-workshop-memory-trace-card-kit
│  └─ scene-open-gate-domain
│     └─ onnx-workshop-scene-open-gate-kit
└─ renderer-handoff
   └─ onnx-workshop-signal-calibration-renderer-handoff-kit
      └─ renderer consumes descriptors only`,
  ownershipExclusions: Object.freeze([
    "renderer",
    "DOM",
    "browser input",
    "Three.js",
    "WebGL",
    "audio",
    "asset loading",
    "ONNX runtime loading",
    "model inference",
    "storage",
    "navigation",
    "frame-loop ownership"
  ])
});

export const ONNX_WORKSHOP_SIGNAL_CALIBRATION_KITS = Object.freeze([
  "onnx-workshop-model-handshake-beacon-kit",
  "onnx-workshop-fallback-safety-rail-kit",
  "onnx-workshop-tool-bench-cue-kit",
  "onnx-workshop-prompt-intent-thread-kit",
  "onnx-workshop-memory-trace-card-kit",
  "onnx-workshop-scene-open-gate-kit",
  "onnx-workshop-signal-calibration-renderer-handoff-kit"
]);

const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(Number(value)) ? Number(value) : 0));
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const round = (value, digits = 3) => Number(clamp(value, -999999, 999999).toFixed(digits));

export function normalizeWorkshopSignalInput(input = {}) {
  const loaded = Boolean(input.loaded ?? input.modelLoaded ?? false);
  const sceneOpen = Boolean(input.sceneOpen ?? input.open ?? false);
  const fallbackActive = Boolean(input.fallbackActive ?? input.fallback ?? !loaded);
  const memoryTurns = clamp(input.memoryTurns ?? input.turns ?? input.memoryCount ?? 0, 0, 99);
  const focusedTools = clamp(input.focusedTools ?? input.toolsFocused ?? input.inspections ?? 0, 0, 24);
  const promptClarity = clamp01(input.promptClarity ?? input.intentClarity ?? 0.35);
  const backendConfidence = clamp01(input.backendConfidence ?? input.runtimeConfidence ?? (loaded ? 0.72 : 0.18));
  const userMomentum = clamp01(input.userMomentum ?? input.movement ?? (sceneOpen ? 0.58 : 0.25));
  const hazardNoise = clamp01(input.hazardNoise ?? input.confusion ?? (fallbackActive ? 0.6 : 0.25));
  const toolCount = clamp(input.toolCount ?? input.visibleTools ?? 6, 1, 18);
  const quickActions = clamp(input.quickActions ?? input.quickActionCount ?? 3, 0, 12);
  const seed = Math.abs(Math.trunc(Number(input.seed ?? 17))) % 997;
  return { loaded, sceneOpen, fallbackActive, memoryTurns, focusedTools, promptClarity, backendConfidence, userMomentum, hazardNoise, toolCount, quickActions, seed };
}

export function createModelHandshakeBeacon(input = {}) {
  const state = normalizeWorkshopSignalInput(input);
  const readiness = clamp01((state.loaded ? 0.52 : 0.08) + state.backendConfidence * 0.34 + (state.sceneOpen ? 0.14 : 0));
  return {
    id: `model-handshake-${state.seed}`,
    kit: "onnx-workshop-model-handshake-beacon-kit",
    descriptorKind: "model-handshake-beacon",
    label: state.loaded ? "Model handshake stable" : "Model handshake pending",
    readiness: round(readiness),
    beaconCount: Math.max(2, Math.ceil(2 + readiness * 5)),
    pulseRate: round(0.35 + state.backendConfidence * 1.4),
    suggestedAction: state.loaded ? "route prompts into focused tool context" : "offer local fallback and keep the scene inspectable"
  };
}

export function createFallbackSafetyRail(input = {}) {
  const state = normalizeWorkshopSignalInput(input);
  const risk = clamp01((state.fallbackActive ? 0.55 : 0.1) + state.hazardNoise * 0.36 - state.backendConfidence * 0.18);
  return {
    id: `fallback-rail-${state.seed}`,
    kit: "onnx-workshop-fallback-safety-rail-kit",
    descriptorKind: "fallback-safety-rail",
    label: risk > 0.62 ? "Fallback rail visible" : "Fallback rail standby",
    risk: round(risk),
    railSegments: Math.max(1, Math.ceil(1 + risk * 6)),
    guardText: state.fallbackActive ? "answer as deterministic workshop guide until ONNX is ready" : "keep fallback copy available for model loss"
  };
}

export function createToolBenchCue(input = {}) {
  const state = normalizeWorkshopSignalInput(input);
  const inspectedRatio = clamp01(state.focusedTools / Math.max(1, state.toolCount));
  const cueStrength = clamp01(0.22 + inspectedRatio * 0.54 + state.userMomentum * 0.24);
  return {
    id: `tool-bench-cue-${state.seed}`,
    kit: "onnx-workshop-tool-bench-cue-kit",
    descriptorKind: "tool-bench-cue",
    label: "Inspectable tool cues",
    cueStrength: round(cueStrength),
    activeCues: Math.max(2, Math.ceil(state.toolCount * (0.35 + cueStrength * 0.45))),
    nextCue: inspectedRatio < 0.45 ? "highlight uninspected tools" : "ask a deeper limitation question"
  };
}

export function createPromptIntentThread(input = {}) {
  const state = normalizeWorkshopSignalInput(input);
  const threadQuality = clamp01(0.16 + state.promptClarity * 0.56 + Math.min(state.quickActions, 6) * 0.035 + (state.sceneOpen ? 0.07 : 0));
  return {
    id: `prompt-thread-${state.seed}`,
    kit: "onnx-workshop-prompt-intent-thread-kit",
    descriptorKind: "prompt-intent-thread",
    label: threadQuality > 0.67 ? "Intent thread clean" : "Intent thread needs anchoring",
    threadQuality: round(threadQuality),
    promptBands: Math.max(1, Math.ceil(1 + threadQuality * 5)),
    nextPrompt: threadQuality > 0.67 ? "compare tool strengths and failure modes" : "ask what the selected object is for"
  };
}

export function createMemoryTraceCard(input = {}) {
  const state = normalizeWorkshopSignalInput(input);
  const traceDepth = clamp01(Math.log2(1 + state.memoryTurns) / 5 + (state.focusedTools > 0 ? 0.1 : 0));
  return {
    id: `memory-trace-${state.seed}`,
    kit: "onnx-workshop-memory-trace-card-kit",
    descriptorKind: "memory-trace-card",
    label: "Conversation memory trace",
    traceDepth: round(traceDepth),
    memoryCards: Math.max(1, Math.ceil(1 + traceDepth * 5)),
    retentionHint: state.memoryTurns < 2 ? "start a small turn ledger" : "summarize repeated tool questions"
  };
}

export function createSceneOpenGate(input = {}) {
  const state = normalizeWorkshopSignalInput(input);
  const gateReadiness = clamp01((state.sceneOpen ? 0.55 : 0.12) + state.loaded * 0.14 + state.userMomentum * 0.2 + state.promptClarity * 0.11);
  return {
    id: `scene-gate-${state.seed}`,
    kit: "onnx-workshop-scene-open-gate-kit",
    descriptorKind: "scene-open-gate",
    label: state.sceneOpen ? "Workshop scene open" : "Workshop scene gated",
    gateReadiness: round(gateReadiness),
    gateRings: Math.max(1, Math.ceil(1 + gateReadiness * 4)),
    openCondition: state.sceneOpen ? "continue inspection loop" : "load model or accept fallback scene mode"
  };
}

export function createOnnxWorkshopSignalCalibrationReadiness(input = {}) {
  const state = normalizeWorkshopSignalInput(input);
  const modelHandshakeBeacons = [createModelHandshakeBeacon(state)];
  const fallbackSafetyRails = [createFallbackSafetyRail(state)];
  const toolBenchCues = [createToolBenchCue(state)];
  const promptIntentThreads = [createPromptIntentThread(state)];
  const memoryTraceCards = [createMemoryTraceCard(state)];
  const sceneOpenGates = [createSceneOpenGate(state)];
  const readiness = clamp01(
    modelHandshakeBeacons[0].readiness * 0.22 +
    (1 - fallbackSafetyRails[0].risk) * 0.12 +
    toolBenchCues[0].cueStrength * 0.18 +
    promptIntentThreads[0].threadQuality * 0.18 +
    memoryTraceCards[0].traceDepth * 0.12 +
    sceneOpenGates[0].gateReadiness * 0.18
  );
  const missionState = readiness >= 0.72 ? "workshop-ready" : readiness >= 0.46 ? "calibrating" : state.fallbackActive ? "intervention-needed" : "cold-start";
  return {
    id: "onnx-workshop-signal-calibration-readiness",
    domainId: ONNX_WORKSHOP_SIGNAL_CALIBRATION_DOMAIN.id,
    missionState,
    readiness: round(readiness),
    state,
    modelHandshakeBeacons,
    fallbackSafetyRails,
    toolBenchCues,
    promptIntentThreads,
    memoryTraceCards,
    sceneOpenGates,
    descriptorCounts: { modelHandshakeBeacons: 1, fallbackSafetyRails: 1, toolBenchCues: 1, promptIntentThreads: 1, memoryTraceCards: 1, sceneOpenGates: 1 }
  };
}

export function createOnnxWorkshopSignalCalibrationRendererHandoff(input = {}) {
  const readiness = createOnnxWorkshopSignalCalibrationReadiness(input);
  return {
    id: "onnx-workshop-signal-calibration-renderer-handoff",
    kit: "onnx-workshop-signal-calibration-renderer-handoff-kit",
    rendererConsumesDescriptorsOnly: true,
    domainTree: ONNX_WORKSHOP_SIGNAL_CALIBRATION_DOMAIN.tree,
    ownershipExclusions: [...ONNX_WORKSHOP_SIGNAL_CALIBRATION_DOMAIN.ownershipExclusions],
    readiness,
    descriptorBuckets: {
      modelHandshakeBeacons: readiness.modelHandshakeBeacons,
      fallbackSafetyRails: readiness.fallbackSafetyRails,
      toolBenchCues: readiness.toolBenchCues,
      promptIntentThreads: readiness.promptIntentThreads,
      memoryTraceCards: readiness.memoryTraceCards,
      sceneOpenGates: readiness.sceneOpenGates
    }
  };
}
