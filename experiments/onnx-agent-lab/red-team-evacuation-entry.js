import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createOnnxWorkshopRedTeamEvacuationDomainKit } from "../_kits/onnx-agent-lab/onnx-workshop-red-team-evacuation-kits.js";

const root = document.querySelector("#redTeamEvacuationApp");
const domain = createOnnxWorkshopRedTeamEvacuationDomainKit({ seed: 119 });
const runtimeName = typeof NexusEngine?.createNexusRuntime === "function" ? "createNexusRuntime" : "NexusEngine main CDN";
const state = {
  canaryCount: 8,
  passedCanaries: 2,
  blockedPrompts: 6,
  routedIncidents: 1,
  sandboxIntegrity: 0.43,
  evidenceCoverage: 0.34,
  rollbackCoverage: 0.36,
  operatorFatigue: 0.66,
  modelLoaded: false,
  drillArmed: false,
  selectedAction: "observe",
  seed: 119,
  log: ["Red-team drill opened: lock sandbox gates before routing failures."]
};

const clamp01 = (value) => Math.max(0, Math.min(1, Number(value) || 0));

function getRedTeamEvacuationReadiness() {
  return domain.compose(state);
}

function applyRedTeamEvacuationInput(action = "run-canary") {
  state.selectedAction = action;
  if (action === "run-canary") {
    state.passedCanaries = Math.min(state.canaryCount, state.passedCanaries + 1);
    state.blockedPrompts = Math.max(0, state.blockedPrompts - 1);
    state.evidenceCoverage = clamp01(state.evidenceCoverage + 0.055);
    state.log.unshift("Ran a canary prompt strip and captured the failure evidence.");
  } else if (action === "lock-sandbox") {
    state.sandboxIntegrity = clamp01(state.sandboxIntegrity + 0.13);
    state.operatorFatigue = clamp01(state.operatorFatigue - 0.035);
    state.log.unshift("Locked a sandbox gate and reduced containment pressure.");
  } else if (action === "tag-evidence") {
    state.evidenceCoverage = clamp01(state.evidenceCoverage + 0.14);
    state.rollbackCoverage = clamp01(state.rollbackCoverage + 0.045);
    state.log.unshift("Tagged evidence chain spans for postmortem replay.");
  } else if (action === "rehearse-rollback") {
    state.rollbackCoverage = clamp01(state.rollbackCoverage + 0.14);
    state.routedIncidents = Math.min(state.canaryCount, state.routedIncidents + 1);
    state.log.unshift("Rehearsed rollback branch and routed one incident lane.");
  } else if (action === "rotate-operator") {
    state.operatorFatigue = clamp01(state.operatorFatigue - 0.11);
    state.drillArmed = true;
    state.log.unshift("Rotated the operator evacuation card and armed the drill.");
  } else if (action === "load-model") {
    state.modelLoaded = true;
    state.sandboxIntegrity = clamp01(state.sandboxIntegrity + 0.06);
    state.evidenceCoverage = clamp01(state.evidenceCoverage + 0.06);
    state.log.unshift("Loaded model runtime metadata for the drill board.");
  } else if (action === "close-drill") {
    state.drillArmed = true;
    state.rollbackCoverage = clamp01(state.rollbackCoverage + 0.08);
    state.operatorFatigue = clamp01(state.operatorFatigue - 0.04);
    state.log.unshift("Closed the dawn drill ledger for review.");
  }
  if (state.log.length > 5) state.log.length = 5;
  render();
  return getRedTeamEvacuationReadiness();
}

function tick(delta = 1 / 60) {
  state.operatorFatigue = clamp01(state.operatorFatigue + Math.max(0, Number(delta) || 0) * 0.003);
  return getRedTeamEvacuationReadiness();
}

function restart() {
  Object.assign(state, {
    canaryCount: 8,
    passedCanaries: 2,
    blockedPrompts: 6,
    routedIncidents: 1,
    sandboxIntegrity: 0.43,
    evidenceCoverage: 0.34,
    rollbackCoverage: 0.36,
    operatorFatigue: 0.66,
    modelLoaded: false,
    drillArmed: false,
    selectedAction: "observe",
    seed: 119,
    log: ["Red-team drill reset: lock sandbox gates before routing failures."]
  });
  render();
  return getRedTeamEvacuationReadiness();
}

function patchGameHost() {
  const previous = globalThis.GameHost ?? {};
  if (previous.__onnxRedTeamEvacuationPatched) return;
  const previousHandoff = typeof previous.getRendererHandoff === "function" ? previous.getRendererHandoff.bind(previous) : () => ({});
  globalThis.GameHost = {
    ...previous,
    __onnxRedTeamEvacuationPatched: true,
    nexusEngineCdn: "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js",
    nexusEngineRuntime: runtimeName,
    getState: () => ({ ...state, readiness: getRedTeamEvacuationReadiness().summary }),
    applyRedTeamEvacuationInput,
    tick,
    restart,
    getOnnxRedTeamEvacuationDomain: () => domain,
    getRedTeamEvacuationReadiness,
    getOnnxRedTeamEvacuationReadiness: getRedTeamEvacuationReadiness,
    getRedTeamEvacuationReadinessTree: () => domain.domainTree,
    getRendererHandoff: () => {
      const base = previousHandoff() ?? {};
      const readiness = getRedTeamEvacuationReadiness();
      return {
        ...base,
        redTeamEvacuationReadiness: readiness.rendererHandoff,
        onnxRedTeamEvacuationDescriptorCount: readiness.rendererHandoff.counts.total
      };
    }
  };
}

function render() {
  if (!root) return;
  const readiness = getRedTeamEvacuationReadiness();
  const h = readiness.rendererHandoff;
  const s = readiness.summary;
  root.innerHTML = `
    <section class="card hero">
      <p class="eyebrow">ONNX workshop red-team evacuation</p>
      <h1>Drill model failure containment before the route goes live.</h1>
      <p class="summary">This preserved ONNX Agent Lab route turns safety and reliability review into a small operations drill: run canary prompt strips, lock sandbox gates, tag evidence chains, rehearse rollback branches, rotate operator handoffs, and close a dawn drill ledger through renderer-neutral descriptors.</p>
      <div class="meter"><span style="width:${Math.round(s.readinessScore * 100)}%"></span></div>
      <p class="readout">${Math.round(s.readinessScore * 100)}% · ${s.missionState} · ${s.topPriority}</p>
      <div class="actions">
        ${[["run-canary", "Run canary"], ["lock-sandbox", "Lock sandbox"], ["tag-evidence", "Tag evidence"], ["rehearse-rollback", "Rehearse rollback"], ["rotate-operator", "Rotate operator"], ["load-model", "Load model"], ["close-drill", "Close drill"]].map(([action, label]) => `<button type="button" data-action="${action}">${label}</button>`).join("")}
      </div>
    </section>
    <section class="card board" aria-label="Red-team descriptor board">
      <div class="board-rings"></div>
      ${h.descriptors.canaryPromptStrips.map((item) => `<b class="canary ${item.passed ? "passed" : "open"}" style="--x:${item.x}%;--y:${item.y}%;--v:${item.volatility}" title="${item.label}">${item.lane}</b>`).join("")}
      ${h.descriptors.sandboxGateLocks.map((item) => `<i class="gate ${item.riskState}" style="--x:${item.x}%;--y:${item.y}%;--i:${item.integrity}" title="${item.label}">${item.riskState}</i>`).join("")}
      ${h.descriptors.evidenceChainTags.map((item) => `<span class="evidence ${item.sealed ? "sealed" : "thin"}" style="--x:${item.x}%;--y:${item.y}%;--c:${item.coverage}" title="${item.label}"></span>`).join("")}
      ${h.descriptors.rollbackBranchRoutes.map((item) => `<em class="rollback ${item.routeState}" style="--x1:${item.x1}%;--x2:${item.x2}%;--y:${item.y}%;--c:${item.coverage}" title="${item.label}">${item.routeState}</em>`).join("")}
      ${h.descriptors.operatorEvacuationCards.map((item) => `<strong class="operator ${item.handoffReady ? "ready" : "loaded"}" style="--x:${item.x}%;--y:${item.y}%;--f:${item.fatigueShare}" title="${item.label}">${item.routedIncidentLane ? "route" : "op"}</strong>`).join("")}
    </section>
    <section class="grid">
      <article class="card descriptors"><h2>Descriptor families</h2>${Object.entries(h.counts).filter(([key]) => key !== "total").map(([key, value]) => `<div class="descriptor-card"><strong>${key}</strong><span>${value}</span><small>renderer consumes this as descriptor data only</small></div>`).join("")}</article>
      <article class="card ledger"><h2>Dawn drill ledger</h2><p><b>${h.descriptors.drillLedger.signoffState}</b></p><p>Canaries: ${h.descriptors.drillLedger.passedCanaries}/${state.canaryCount} · blocked: ${h.descriptors.drillLedger.blockedPrompts} · pressure: ${Math.round(s.pressure * 100)}%</p><p>Nexus runtime: ${runtimeName}</p>${state.log.map((line) => `<p>${line}</p>`).join("")}</article>
    </section>`;
  root.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => applyRedTeamEvacuationInput(button.dataset.action)));
  document.body.dataset.onnxRedTeamEvacuationMission = s.missionState;
}

patchGameHost();
render();
