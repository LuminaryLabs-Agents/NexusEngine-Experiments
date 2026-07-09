import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  createOnnxWorkshopIncidentRouterDomainKit
} from "../_kits/onnx-agent-lab/onnx-workshop-incident-router-kits.js";

const root = document.querySelector("#incidentRouterApp");
const domain = createOnnxWorkshopIncidentRouterDomainKit({ seed: 83 });
const runtimeName = typeof NexusEngine?.createNexusRuntime === "function" ? "createNexusRuntime" : "NexusEngine main CDN";
const state = {
  alertCount: 7,
  unresolved: 5,
  ackedIncidents: 1,
  escalatedIncidents: 0,
  traceQuality: 0.36,
  classifierConfidence: 0.31,
  fallbackCoverage: 0.46,
  operatorLoad: 0.68,
  modelLoaded: false,
  sceneOpen: false,
  selectedAction: "observe",
  seed: 83,
  log: ["Incident desk opened: collect traces before routing model decisions."]
};

const clamp01 = (value) => Math.max(0, Math.min(1, Number(value) || 0));

function getIncidentRouterReadiness() {
  return domain.compose(state);
}

function applyIncidentRouterInput(action = "sample-traces") {
  state.selectedAction = action;
  if (action === "ack-alert") {
    state.ackedIncidents = Math.min(state.alertCount, state.ackedIncidents + 1);
    state.unresolved = Math.max(0, state.unresolved - 1);
    state.operatorLoad = clamp01(state.operatorLoad - 0.06);
    state.log.unshift("Acknowledged one incident and reduced desk pressure.");
  } else if (action === "sample-traces") {
    state.traceQuality = clamp01(state.traceQuality + 0.13);
    state.classifierConfidence = clamp01(state.classifierConfidence + 0.055);
    state.log.unshift("Sampled trace packets and improved classifier context.");
  } else if (action === "route-fallback") {
    state.fallbackCoverage = clamp01(state.fallbackCoverage + 0.12);
    state.operatorLoad = clamp01(state.operatorLoad - 0.035);
    state.log.unshift("Expanded fallback playbook coverage for uncertain routes.");
  } else if (action === "load-model") {
    state.modelLoaded = true;
    state.classifierConfidence = clamp01(state.classifierConfidence + 0.18);
    state.traceQuality = clamp01(state.traceQuality + 0.06);
    state.log.unshift("Loaded model handshake and opened runtime confidence lane.");
  } else if (action === "escalate") {
    state.escalatedIncidents = Math.min(state.alertCount, state.escalatedIncidents + 1);
    state.unresolved = Math.max(0, state.unresolved - 1);
    state.operatorLoad = clamp01(state.operatorLoad + 0.025);
    state.log.unshift("Escalated one unresolved incident into an operator lane.");
  } else if (action === "open-scene") {
    state.sceneOpen = true;
    state.fallbackCoverage = clamp01(state.fallbackCoverage + 0.07);
    state.operatorLoad = clamp01(state.operatorLoad - 0.04);
    state.log.unshift("Opened the scene handoff and improved audit context.");
  }
  if (state.log.length > 5) state.log.length = 5;
  render();
  return getIncidentRouterReadiness();
}

function tick(delta = 1 / 60) {
  state.operatorLoad = clamp01(state.operatorLoad + Math.max(0, Number(delta) || 0) * 0.004);
  return getIncidentRouterReadiness();
}

function restart() {
  Object.assign(state, {
    alertCount: 7,
    unresolved: 5,
    ackedIncidents: 1,
    escalatedIncidents: 0,
    traceQuality: 0.36,
    classifierConfidence: 0.31,
    fallbackCoverage: 0.46,
    operatorLoad: 0.68,
    modelLoaded: false,
    sceneOpen: false,
    selectedAction: "observe",
    seed: 83,
    log: ["Incident desk reset: collect traces before routing model decisions."]
  });
  render();
  return getIncidentRouterReadiness();
}

function patchGameHost() {
  const previous = globalThis.GameHost ?? {};
  if (previous.__onnxIncidentRouterPatched) return;
  const previousHandoff = typeof previous.getRendererHandoff === "function" ? previous.getRendererHandoff.bind(previous) : () => ({});
  globalThis.GameHost = {
    ...previous,
    __onnxIncidentRouterPatched: true,
    nexusEngineCdn: "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js",
    nexusEngineRuntime: runtimeName,
    getState: () => ({ ...state, readiness: getIncidentRouterReadiness().summary }),
    applyIncidentRouterInput,
    tick,
    restart,
    getOnnxIncidentRouterReadinessDomain: () => domain,
    getIncidentRouterReadiness,
    getOnnxIncidentRouterReadiness: getIncidentRouterReadiness,
    getIncidentRouterReadinessTree: () => domain.domainTree,
    getRendererHandoff: () => {
      const base = previousHandoff() ?? {};
      const readiness = getIncidentRouterReadiness();
      return {
        ...base,
        incidentRouterReadiness: readiness.rendererHandoff,
        onnxIncidentRouterDescriptorCount: readiness.rendererHandoff.counts.total
      };
    }
  };
}

function render() {
  if (!root) return;
  const readiness = getIncidentRouterReadiness();
  const h = readiness.rendererHandoff;
  const s = readiness.summary;
  root.innerHTML = `
    <section class="card hero">
      <p class="eyebrow">ONNX workshop incident router</p>
      <h1>Route model failures like a live operations desk.</h1>
      <p class="summary">This preserved ONNX Agent Lab route turns the workshop into a small incident-triage experience: sample traces, route uncertain classifier lanes, prepare fallback briefs, balance operator load, and close an audit ledger through renderer-neutral descriptors.</p>
      <div class="meter"><span style="width:${Math.round(s.readinessScore * 100)}%"></span></div>
      <p class="readout">${Math.round(s.readinessScore * 100)}% · ${s.missionState} · ${s.topPriority}</p>
      <div class="actions">
        ${[["sample-traces", "Sample traces"], ["ack-alert", "Ack alert"], ["route-fallback", "Route fallback"], ["load-model", "Load model"], ["escalate", "Escalate"], ["open-scene", "Open scene"]].map(([action, label]) => `<button type="button" data-action="${action}">${label}</button>`).join("")}
      </div>
    </section>
    <section class="card desk" aria-label="Incident descriptor desk">
      <div class="radar-rings"></div>
      ${h.descriptors.alertBeacons.map((item) => `<b class="beacon ${item.acknowledged ? "acked" : "open"}" style="--x:${item.x}%;--y:${item.y}%;--u:${item.urgency}" title="${item.label}">${item.channel}</b>`).join("")}
      ${h.descriptors.traceSamplers.map((item) => `<i class="trace ${item.spanColor}" style="--x:${item.x}%;--y:${item.y}%;--q:${item.completeness}" title="${item.label}"></i>`).join("")}
      ${h.descriptors.classifierLanes.map((item) => `<span class="lane ${item.routeState}" style="--x1:${item.x1}%;--x2:${item.x2}%;--y:${item.y}%;--c:${item.confidence}" title="${item.label}">${item.lane}</span>`).join("")}
      ${h.descriptors.fallbackBriefs.map((item) => `<em class="brief ${item.required ? "required" : "ready"}" style="--x:${item.x}%;--y:${item.y}%;--c:${item.coverage}" title="${item.label}">${item.playbookStep}</em>`).join("")}
      ${h.descriptors.operatorShifts.map((item) => `<strong class="operator ${item.handoffReady ? "ready" : "loaded"}" style="--x:${item.x}%;--y:${item.y}%;--l:${item.loadShare}" title="${item.label}">${item.escalationLane ? "esc" : "op"}</strong>`).join("")}
    </section>
    <section class="grid">
      <article class="card descriptors"><h2>Descriptor families</h2>${Object.entries(h.counts).filter(([key]) => key !== "total").map(([key, value]) => `<div class="descriptor-card"><strong>${key}</strong><span>${value}</span><small>renderer consumes this as descriptor data only</small></div>`).join("")}</article>
      <article class="card ledger"><h2>Audit ledger</h2><p><b>${h.descriptors.auditLedger.signoffState}</b></p><p>Open: ${h.descriptors.auditLedger.open} · routed: ${h.descriptors.auditLedger.routed} · pressure: ${Math.round(s.pressure * 100)}%</p><p>Nexus runtime: ${runtimeName}</p>${state.log.map((line) => `<p>${line}</p>`).join("")}</article>
    </section>`;
  root.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => applyIncidentRouterInput(button.dataset.action)));
  document.body.dataset.onnxIncidentRouterMission = s.missionState;
}

patchGameHost();
render();
