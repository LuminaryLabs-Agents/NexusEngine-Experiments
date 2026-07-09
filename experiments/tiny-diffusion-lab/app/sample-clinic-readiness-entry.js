import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createTinyDiffusionSampleClinicReadinessDomainKit } from "../kits/tiny-diffusion-sample-clinic-readiness-domain-kit.js";

const domain = createTinyDiffusionSampleClinicReadinessDomainKit();
let lastReadiness = null;
let checkpointAge = 999;

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
  const finalImage = preview.finalImage ?? {};
  const pixels = safeList(finalImage.pixels);
  const mean = pixels.length ? pixels.reduce((sum, value) => sum + finite(value), 0) / pixels.length : 0;
  const clarity = pixels.length ? pixels.reduce((sum, value) => sum + Math.abs(finite(value) - mean), 0) / pixels.length * 3.2 : 0;
  checkpointAge = Math.max(0, checkpointAge + 1);
  if ((metrics.steps ?? 0) > 0 && globalThis.__TinyDiffusionSampleClinicCheckpointTouched) checkpointAge = 0;
  return {
    sampleCount: safeList(preview.datasetSamples).length,
    seeds: safeList(preview.datasetSamples).map((sample) => sample.label ?? sample.id).filter(Boolean),
    epochs: finite(metrics.epochs, 0),
    steps: finite(metrics.steps, 0),
    latestLoss: finite(metrics.latestLoss, 1),
    frames: safeList(preview.denoiseFrames).length,
    finalReady: pixels.length > 0,
    finalPixels: pixels,
    width: finite(finalImage.width, 16),
    height: finite(finalImage.height, 16),
    clarity,
    saved: Boolean(globalThis.__TinyDiffusionSampleClinicCheckpointTouched),
    checkpointAge
  };
}

function row(label, value, cue) {
  return `<p><b>${label}</b> · ${value}<br><span>${cue}</span></p>`;
}

function renderClinicPanel(readiness) {
  const panel = document.getElementById("sampleClinicReadiness");
  if (!panel) return;
  const descriptors = readiness.descriptors;
  panel.innerHTML = `
    <div class="metric"><span>Clinic readiness</span><strong>${Math.round(readiness.readinessScore * 100)}%</strong></div>
    <div class="metric"><span>Status</span><strong>${readiness.status}</strong></div>
    <div class="mission-list">
      ${row("Artifact scan", descriptors.artifactScanMap.status, descriptors.artifactScanMap.cue)}
      ${row("Anomaly mask", descriptors.anomalyMask.status, descriptors.anomalyMask.cue)}
      ${row("Loss triage", descriptors.lossTriageBand.status, descriptors.lossTriageBand.cue)}
      ${row("Retry path", descriptors.retryPrescription.status, descriptors.retryPrescription.cue)}
      ${row("Curator label", descriptors.curatorLabelCard.status, descriptors.curatorLabelCard.cue)}
      ${row("Archive handoff", descriptors.archiveHandoffLedger.status, descriptors.archiveHandoffLedger.cue)}
    </div>
  `;
}

function evaluateClinic() {
  lastReadiness = domain.evaluate(summarizePreview());
  globalThis.TinyDiffusionSampleClinicReadiness = lastReadiness;
  renderClinicPanel(lastReadiness);
  return lastReadiness;
}

function composeRendererHandoff(previousHandoff, clinicReadiness) {
  const clinicHandoff = clinicReadiness.rendererHandoff;
  const previousCount = Number(previousHandoff?.descriptorCount ?? previousHandoff?.counts?.total ?? 0) || 0;
  return {
    id: "tiny-diffusion-composed-renderer-handoff",
    kind: "renderer-handoff",
    policy: "renderer-consumes-descriptors-only",
    descriptors: {
      previous: previousHandoff ?? null,
      sampleClinic: clinicHandoff
    },
    counts: {
      previous: previousCount,
      sampleClinic: clinicHandoff.descriptorCount,
      total: previousCount + clinicHandoff.descriptorCount
    }
  };
}

function patchTinyDiffusionHost() {
  const host = globalThis.TinyDiffusionLab ?? {};
  if (host.__sampleClinicPatched) return;
  const previousGetRendererHandoff = typeof host.getRendererHandoff === "function" ? host.getRendererHandoff.bind(host) : null;
  const originalCheckpoint = host.checkpointRoundTrip;
  if (typeof originalCheckpoint === "function") {
    host.checkpointRoundTrip = async (...args) => {
      const result = await originalCheckpoint(...args);
      globalThis.__TinyDiffusionSampleClinicCheckpointTouched = true;
      checkpointAge = 0;
      evaluateClinic();
      return result;
    };
  }
  Object.assign(host, {
    __sampleClinicPatched: true,
    getSampleClinicReadinessDomain: () => domain,
    getSampleClinicReadiness: () => evaluateClinic(),
    getTinyDiffusionSampleClinicReadiness: () => evaluateClinic(),
    getSampleClinicReadinessTree: () => domain.tree,
    getRendererHandoff: () => composeRendererHandoff(previousGetRendererHandoff ? previousGetRendererHandoff() : null, lastReadiness ?? evaluateClinic())
  });
  globalThis.TinyDiffusionLab = host;
}

function tick() {
  void NexusEngine;
  patchTinyDiffusionHost();
  evaluateClinic();
  globalThis.setTimeout(tick, 1100);
}

tick();
