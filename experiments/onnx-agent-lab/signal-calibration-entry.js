import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  ONNX_WORKSHOP_SIGNAL_CALIBRATION_DOMAIN,
  createOnnxWorkshopSignalCalibrationReadiness,
  createOnnxWorkshopSignalCalibrationRendererHandoff
} from "../_kits/onnx-agent-lab/onnx-workshop-signal-calibration-kits.js";

const TOOL_LIBRARY = Object.freeze([
  { id: "token-lathe", label: "Token Lathe", role: "prompt shaping", x: 12, y: 22 },
  { id: "intent-loom", label: "Intent Loom", role: "intent routing", x: 35, y: 31 },
  { id: "memory-anvil", label: "Memory Anvil", role: "turn memory", x: 59, y: 25 },
  { id: "fallback-lamp", label: "Fallback Lamp", role: "offline guidance", x: 79, y: 35 },
  { id: "scene-gate", label: "Scene Gate", role: "scene opening", x: 29, y: 68 },
  { id: "safety-rail", label: "Safety Rail", role: "failure handling", x: 68, y: 71 }
]);

const runtimeName = typeof NexusEngine?.createNexusRuntime === "function" ? "createNexusRuntime" : "NexusEngine main CDN";
const root = document.querySelector("#calibrationApp");
const state = {
  loaded: false,
  sceneOpen: false,
  fallbackActive: true,
  memoryTurns: 0,
  focusedTools: 0,
  promptClarity: 0.28,
  backendConfidence: 0.12,
  userMomentum: 0.25,
  hazardNoise: 0.58,
  toolCount: TOOL_LIBRARY.length,
  quickActions: 3,
  seed: 215,
  selectedToolId: null,
  transcript: []
};

function uniqueFocusCount() {
  return new Set(state.transcript.filter((entry) => entry.type === "inspect").map((entry) => entry.toolId)).size;
}

function currentInput() {
  return {
    loaded: state.loaded,
    sceneOpen: state.sceneOpen,
    fallbackActive: state.fallbackActive,
    memoryTurns: state.memoryTurns,
    focusedTools: uniqueFocusCount(),
    promptClarity: state.promptClarity,
    backendConfidence: state.backendConfidence,
    userMomentum: state.userMomentum,
    hazardNoise: state.hazardNoise,
    toolCount: TOOL_LIBRARY.length,
    quickActions: state.quickActions,
    seed: state.seed
  };
}

function pushTranscript(type, text, extra = {}) {
  state.transcript.push({ type, text, tick: state.transcript.length + 1, ...extra });
  if (state.transcript.length > 8) state.transcript.shift();
}

function applyInput(action) {
  if (action === "load") {
    state.loaded = true;
    state.fallbackActive = false;
    state.backendConfidence = Math.min(1, state.backendConfidence + 0.56);
    state.promptClarity = Math.min(1, state.promptClarity + 0.08);
    pushTranscript("system", "Model handshake completed through NexusEngine CDN overlay.");
  }
  if (action === "fallback") {
    state.fallbackActive = true;
    state.backendConfidence = Math.max(0.18, state.backendConfidence - 0.18);
    state.hazardNoise = Math.min(1, state.hazardNoise + 0.1);
    pushTranscript("system", "Fallback rail armed; deterministic workshop guide remains available.");
  }
  if (action === "open") {
    state.sceneOpen = true;
    state.userMomentum = Math.min(1, state.userMomentum + 0.28);
    pushTranscript("system", "Scene gate opened for inspectable workshop tools.");
  }
  if (action === "ask") {
    state.memoryTurns += 1;
    state.promptClarity = Math.min(1, state.promptClarity + 0.12);
    state.hazardNoise = Math.max(0, state.hazardNoise - 0.06);
    pushTranscript("prompt", "Prompt thread tightened around the selected tool.");
  }
  render();
}

function inspectTool(toolId) {
  const tool = TOOL_LIBRARY.find((item) => item.id === toolId) ?? TOOL_LIBRARY[0];
  state.selectedToolId = tool.id;
  state.focusedTools = uniqueFocusCount() + 1;
  state.promptClarity = Math.min(1, state.promptClarity + 0.07);
  state.userMomentum = Math.min(1, state.userMomentum + 0.08);
  pushTranscript("inspect", `Focused ${tool.label}: ${tool.role}.`, { toolId: tool.id });
  render();
}

function descriptorRows(handoff) {
  const buckets = handoff.descriptorBuckets;
  const descriptors = [
    ...buckets.modelHandshakeBeacons,
    ...buckets.fallbackSafetyRails,
    ...buckets.toolBenchCues,
    ...buckets.promptIntentThreads,
    ...buckets.memoryTraceCards,
    ...buckets.sceneOpenGates
  ];
  return descriptors.map((descriptor) => `
    <article class="descriptor-card">
      <strong>${descriptor.descriptorKind}</strong>
      <span>${descriptor.label}</span>
      <small>${descriptor.suggestedAction ?? descriptor.guardText ?? descriptor.nextCue ?? descriptor.nextPrompt ?? descriptor.retentionHint ?? descriptor.openCondition}</small>
    </article>
  `).join("");
}

function render() {
  const handoff = createOnnxWorkshopSignalCalibrationRendererHandoff(currentInput());
  const readiness = handoff.readiness;
  const selectedTool = TOOL_LIBRARY.find((item) => item.id === state.selectedToolId);
  root.innerHTML = `
    <section class="hero card">
      <p class="eyebrow">ONNX Agent Lab · Signal Calibration</p>
      <h1>Calibrate the workshop before opening the scene.</h1>
      <p class="summary">Load or fall back, inspect tools, tighten prompt intent, and open the workshop gate when the descriptor handoff reaches a safe state.</p>
      <div class="meter"><span style="width:${Math.round(readiness.readiness * 100)}%"></span></div>
      <p class="readout">${readiness.missionState} · ${Math.round(readiness.readiness * 100)}% ready · ${runtimeName}</p>
      <div class="actions">
        <button data-action="load">Load model handshake</button>
        <button data-action="fallback">Arm fallback rail</button>
        <button data-action="ask">Ask focused question</button>
        <button data-action="open">Open scene gate</button>
      </div>
    </section>
    <section class="bench card" aria-label="Inspectable workshop tools">
      ${TOOL_LIBRARY.map((tool) => `<button class="tool ${tool.id === state.selectedToolId ? "active" : ""}" data-tool="${tool.id}" style="--x:${tool.x}%;--y:${tool.y}%"><b>${tool.label}</b><span>${tool.role}</span></button>`).join("")}
      <div class="selected">${selectedTool ? `Focused: ${selectedTool.label}` : "Focus a tool to build the prompt thread."}</div>
    </section>
    <section class="grid">
      <section class="card descriptors"><h2>Descriptor handoff</h2>${descriptorRows(handoff)}</section>
      <section class="card ledger"><h2>Turn ledger</h2>${state.transcript.map((entry) => `<p><b>${entry.type}</b> ${entry.text}</p>`).join("") || "<p><b>system</b> Waiting for calibration input.</p>"}</section>
    </section>
  `;
  root.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => applyInput(button.dataset.action)));
  root.querySelectorAll("[data-tool]").forEach((button) => button.addEventListener("click", () => inspectTool(button.dataset.tool)));
}

const GameHost = {
  domain: ONNX_WORKSHOP_SIGNAL_CALIBRATION_DOMAIN,
  getState: () => ({ ...currentInput(), selectedToolId: state.selectedToolId, transcript: [...state.transcript] }),
  applyInput,
  tick: (delta = 1 / 60) => {
    state.hazardNoise = Math.max(0, state.hazardNoise - Math.min(0.02, delta * 0.1));
    return GameHost.getState();
  },
  restart: () => {
    Object.assign(state, {
      loaded: false,
      sceneOpen: false,
      fallbackActive: true,
      memoryTurns: 0,
      focusedTools: 0,
      promptClarity: 0.28,
      backendConfidence: 0.12,
      userMomentum: 0.25,
      hazardNoise: 0.58,
      selectedToolId: null,
      transcript: []
    });
    render();
  },
  getOnnxWorkshopSignalCalibrationReadiness: () => createOnnxWorkshopSignalCalibrationReadiness(currentInput()),
  getRendererHandoff: () => createOnnxWorkshopSignalCalibrationRendererHandoff(currentInput())
};

globalThis.GameHost = GameHost;
render();
