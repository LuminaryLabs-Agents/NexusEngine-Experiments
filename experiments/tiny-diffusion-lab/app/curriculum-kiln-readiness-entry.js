import "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  createTinyDiffusionCurriculumKilnReadiness,
  createTinyDiffusionCurriculumKilnRendererHandoff,
  getTinyDiffusionCurriculumKilnTree
} from "./curriculum-kiln-readiness-kits.js";

const PANEL_ID = "curriculumKilnReadiness";

function stateFromLab() {
  const state = globalThis.TinyDiffusionLabState ?? {};
  const preview = state.preview ?? {};
  const metrics = preview.metrics ?? {};
  return {
    preview,
    metrics,
    epochs: metrics.epochs ?? 0,
    steps: metrics.steps ?? 0,
    latestLoss: metrics.latestLoss ?? null,
    datasetCount: preview.datasetSamples?.length ?? 0,
    generatedFrames: preview.denoiseFrames?.length ?? 0,
    sampleCount: preview.finalImage?.pixels ? 1 : 0,
    checkpointCount: globalThis.TinyDiffusionCurriculumKilnCheckpointCount ?? 0
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function metric(label, value) {
  return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function descriptorList(items, labelKey = "id") {
  return `<div class="mission-list">${items.map((item) => `<p><b>${escapeHtml(item[labelKey] ?? item.id)}</b><br><span>${escapeHtml(item.status ?? item.label ?? item.type ?? item.phase ?? item.next ?? "")}</span></p>`).join("")}</div>`;
}

function renderCurriculumKilnPanel() {
  const panel = document.getElementById(PANEL_ID);
  if (!panel) return;
  const readiness = createTinyDiffusionCurriculumKilnReadiness(stateFromLab());
  const ledger = readiness.descriptors.curriculumLedgers[0];
  const sentinel = readiness.descriptors.overfitSentinels[0];
  panel.innerHTML = [
    metric("Curriculum readiness", `${Math.round(readiness.readiness * 100)}%`),
    metric("Phase", readiness.phase),
    metric("Overfit risk", `${Math.round(readiness.overfitRisk * 100)}%`),
    metric("Next", ledger.next),
    descriptorList(readiness.descriptors.seedTiles.slice(0, 6), "id"),
    descriptorList(readiness.descriptors.noiseRamps.slice(0, 6), "id"),
    descriptorList([sentinel], "id")
  ].join("");
  panel.dataset.phase = readiness.phase;
  panel.dataset.overfitRisk = String(readiness.overfitRisk);
  panel.dataset.readiness = String(readiness.readiness);
}

function installCurriculumKilnPass() {
  const lab = globalThis.TinyDiffusionLab ?? {};
  const originalCheckpoint = lab.checkpointRoundTrip;
  if (typeof originalCheckpoint === "function" && !lab.__curriculumKilnCheckpointWrapped) {
    lab.checkpointRoundTrip = async (...args) => {
      const result = await originalCheckpoint(...args);
      globalThis.TinyDiffusionCurriculumKilnCheckpointCount = (globalThis.TinyDiffusionCurriculumKilnCheckpointCount ?? 0) + 1;
      renderCurriculumKilnPanel();
      return result;
    };
    lab.__curriculumKilnCheckpointWrapped = true;
  }

  const getReadiness = () => createTinyDiffusionCurriculumKilnReadiness(stateFromLab());
  const getRendererHandoff = () => createTinyDiffusionCurriculumKilnRendererHandoff(stateFromLab());

  globalThis.TinyDiffusionCurriculumKiln = {
    getReadiness,
    getRendererHandoff,
    getTree: getTinyDiffusionCurriculumKilnTree,
    render: renderCurriculumKilnPanel
  };

  if (globalThis.TinyDiffusionLab) {
    Object.assign(globalThis.TinyDiffusionLab, {
      getCurriculumKilnReadiness: getReadiness,
      getTinyDiffusionCurriculumKilnReadiness: getReadiness,
      getCurriculumKilnRendererHandoff: getRendererHandoff,
      getRendererHandoff() {
        const existing = typeof lab.getRendererHandoff === "function" ? lab.getRendererHandoff() : {};
        return {
          ...existing,
          curriculumKiln: getRendererHandoff()
        };
      }
    });
  }

  renderCurriculumKilnPanel();
}

function scheduleInstall(attempt = 0) {
  if (globalThis.TinyDiffusionLabState || attempt > 80) {
    installCurriculumKilnPass();
    return;
  }
  window.setTimeout(() => scheduleInstall(attempt + 1), 100);
}

scheduleInstall();
window.setInterval(renderCurriculumKilnPanel, 1000);
