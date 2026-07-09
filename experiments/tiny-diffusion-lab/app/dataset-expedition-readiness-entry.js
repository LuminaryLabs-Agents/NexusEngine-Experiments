import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createTinyDiffusionDatasetExpeditionReadinessDomainKit } from "../kits/tiny-diffusion-dataset-expedition-readiness-domain-kit.js";

const domain = createTinyDiffusionDatasetExpeditionReadinessDomainKit();
let lastReadiness = null;
let checkpointTouched = false;

function safeList(value) {
  return Array.isArray(value) ? value : [];
}

function finite(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function summarizePreview() {
  const labState = globalThis.TinyDiffusionLabState ?? {};
  const preview = labState.preview ?? {};
  const metrics = preview.metrics ?? {};
  return {
    datasetSamples: safeList(preview.datasetSamples),
    noiseSteps: safeList(preview.noiseSteps),
    denoiseFrames: safeList(preview.denoiseFrames),
    frames: safeList(preview.denoiseFrames).length,
    finalReady: Boolean(preview.finalImage?.pixels?.length),
    finalPixels: safeList(preview.finalImage?.pixels),
    epochs: finite(metrics.epochs, 0),
    steps: finite(metrics.steps, 0),
    latestLoss: finite(metrics.latestLoss, 1),
    saved: checkpointTouched || Boolean(globalThis.__TinyDiffusionDatasetExpeditionCheckpointTouched)
  };
}

function row(label, value, cue) {
  return `<p><b>${label}</b> · ${value}<br><span>${cue}</span></p>`;
}

function renderExpeditionPanel(readiness) {
  const panel = document.getElementById("datasetExpeditionReadiness");
  if (!panel) return;
  const descriptors = readiness.descriptors;
  panel.innerHTML = `
    <div class="metric"><span>Expedition readiness</span><strong>${Math.round(readiness.readinessScore * 100)}%</strong></div>
    <div class="metric"><span>Status</span><strong>${readiness.status}</strong></div>
    <div class="mission-list">
      ${row("Seed map", descriptors.seedCartography.status, descriptors.seedCartography.cue)}
      ${row("Class balance", descriptors.classBalance.status, descriptors.classBalance.cue)}
      ${row("Curriculum route", descriptors.curriculumRoute.status, descriptors.curriculumRoute.cue)}
      ${row("Noise weather", descriptors.noiseWeather.status, descriptors.noiseWeather.cue)}
      ${row("Provenance", descriptors.provenanceTicket.status, descriptors.provenanceTicket.cue)}
      ${row("Field guide", descriptors.fieldGuideLedger.status, descriptors.fieldGuideLedger.cue)}
    </div>
  `;
}

function evaluateExpedition() {
  lastReadiness = domain.evaluate(summarizePreview());
  globalThis.TinyDiffusionDatasetExpeditionReadiness = lastReadiness;
  renderExpeditionPanel(lastReadiness);
  return lastReadiness;
}

function composeRendererHandoff(previousHandoff, expeditionReadiness) {
  const expeditionHandoff = expeditionReadiness.rendererHandoff;
  const previousCount = Number(previousHandoff?.descriptorCount ?? previousHandoff?.counts?.total ?? 0) || 0;
  return {
    id: "tiny-diffusion-dataset-expedition-composed-renderer-handoff",
    kind: "renderer-handoff",
    policy: "renderer-consumes-descriptors-only",
    descriptors: {
      previous: previousHandoff ?? null,
      datasetExpedition: expeditionHandoff
    },
    counts: {
      previous: previousCount,
      datasetExpedition: expeditionHandoff.descriptorCount,
      total: previousCount + expeditionHandoff.descriptorCount
    }
  };
}

function patchTinyDiffusionHost() {
  const host = globalThis.TinyDiffusionLab ?? {};
  if (host.__datasetExpeditionPatched) return;
  const previousGetRendererHandoff = typeof host.getRendererHandoff === "function" ? host.getRendererHandoff.bind(host) : null;
  const originalCheckpoint = host.checkpointRoundTrip;
  if (typeof originalCheckpoint === "function") {
    host.checkpointRoundTrip = async (...args) => {
      const result = await originalCheckpoint(...args);
      checkpointTouched = true;
      globalThis.__TinyDiffusionDatasetExpeditionCheckpointTouched = true;
      evaluateExpedition();
      return result;
    };
  }
  Object.assign(host, {
    __datasetExpeditionPatched: true,
    getDatasetExpeditionReadinessDomain: () => domain,
    getDatasetExpeditionReadiness: () => evaluateExpedition(),
    getTinyDiffusionDatasetExpeditionReadiness: () => evaluateExpedition(),
    getDatasetExpeditionReadinessTree: () => domain.tree,
    getRendererHandoff: () => composeRendererHandoff(previousGetRendererHandoff ? previousGetRendererHandoff() : null, lastReadiness ?? evaluateExpedition())
  });
  globalThis.TinyDiffusionLab = host;
}

function tick() {
  void NexusEngine;
  patchTinyDiffusionHost();
  evaluateExpedition();
  globalThis.setTimeout(tick, 900);
}

tick();
