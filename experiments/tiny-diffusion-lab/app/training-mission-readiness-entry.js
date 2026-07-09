import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createTinyDiffusionTrainingMissionReadinessDomainKit } from "../kits/tiny-diffusion-training-mission-readiness-domain-kit.js";

const domain = createTinyDiffusionTrainingMissionReadinessDomainKit();
let lastReadiness = null;
let checkpointAge = 999;

function summarizePreview() {
  const labState = globalThis.TinyDiffusionLabState ?? {};
  const preview = labState.preview ?? {};
  const metrics = preview.metrics ?? {};
  const finalImage = preview.finalImage ?? {};
  const samples = Array.isArray(preview.datasetSamples) ? preview.datasetSamples : [];
  const noiseSteps = Array.isArray(preview.noiseSteps) ? preview.noiseSteps : [];
  const frames = Array.isArray(preview.denoiseFrames) ? preview.denoiseFrames : [];
  const latestLoss = Number.isFinite(metrics.latestLoss) ? metrics.latestLoss : 1;
  const finalPixels = Array.isArray(finalImage.pixels) ? finalImage.pixels : [];
  const meanPixel = finalPixels.length > 0 ? finalPixels.reduce((sum, value) => sum + Number(value || 0), 0) / finalPixels.length : 0;
  const variance = finalPixels.length > 0 ? finalPixels.reduce((sum, value) => sum + Math.abs(Number(value || 0) - meanPixel), 0) / finalPixels.length : 0;
  checkpointAge = Math.max(0, checkpointAge + 1);
  if ((metrics.steps ?? 0) > 0 && globalThis.__TinyDiffusionMissionCheckpointTouched) checkpointAge = 0;
  return {
    prepared: samples.length > 0,
    sampleCount: samples.length,
    classSpread: Math.min(1, samples.length / 6),
    seeds: samples.map((sample) => sample.label ?? sample.id).filter(Boolean),
    timesteps: Math.max(1, Number(preview.config?.timesteps ?? 8)),
    previewedSteps: noiseSteps.length,
    epochs: Number(metrics.epochs ?? 0),
    steps: Number(metrics.steps ?? 0),
    latestLoss,
    frames: frames.length,
    finalReady: finalPixels.length > 0,
    clarity: Math.min(1, Math.max(0, variance * 3.2 + (latestLoss < 0.8 ? 0.16 : 0))),
    saved: Boolean(globalThis.__TinyDiffusionMissionCheckpointTouched),
    checkpointAge
  };
}

function renderMissionPanel(readiness) {
  const panel = document.getElementById("trainingMissionReadiness");
  if (!panel) return;
  const descriptors = readiness.descriptors;
  const rows = [
    ["Dataset", descriptors.datasetCuration.status, descriptors.datasetCuration.cue],
    ["Seeds", `${descriptors.promptSeedBank.count} staged`, descriptors.promptSeedBank.cue],
    ["Noise", descriptors.noiseCurriculum.stage, descriptors.noiseCurriculum.cue],
    ["Training", descriptors.trainingSentry.status, descriptors.trainingSentry.cue],
    ["Sample", descriptors.sampleTriage.status, descriptors.sampleTriage.cue],
    ["Checkpoint", descriptors.checkpointAudit.status, descriptors.checkpointAudit.cue]
  ];
  panel.innerHTML = `
    <div class="metric"><span>Readiness</span><strong>${Math.round(readiness.readinessScore * 100)}%</strong></div>
    <div class="metric"><span>Status</span><strong>${readiness.status}</strong></div>
    <div class="mission-list">${rows.map(([name, status, cue]) => `<p><b>${name}</b> · ${status}<br><span>${cue}</span></p>`).join("")}</div>
  `;
}

function evaluateMission() {
  lastReadiness = domain.evaluate(summarizePreview());
  globalThis.TinyDiffusionTrainingMissionReadiness = lastReadiness;
  renderMissionPanel(lastReadiness);
  return lastReadiness;
}

function patchTinyDiffusionHost() {
  const host = globalThis.TinyDiffusionLab ?? {};
  if (!host.__trainingMissionPatched) {
    const originalCheckpoint = host.checkpointRoundTrip;
    if (typeof originalCheckpoint === "function") {
      host.checkpointRoundTrip = async (...args) => {
        const result = await originalCheckpoint(...args);
        globalThis.__TinyDiffusionMissionCheckpointTouched = true;
        checkpointAge = 0;
        evaluateMission();
        return result;
      };
    }
    Object.assign(host, {
      __trainingMissionPatched: true,
      getTrainingMissionReadinessDomain: () => domain,
      getTrainingMissionReadiness: () => evaluateMission(),
      getTinyDiffusionTrainingMissionReadiness: () => evaluateMission(),
      getTrainingMissionReadinessTree: () => domain.tree,
      getRendererHandoff: () => (lastReadiness ?? evaluateMission()).rendererHandoff
    });
    globalThis.TinyDiffusionLab = host;
  }
}

function tick() {
  void NexusEngine;
  patchTinyDiffusionHost();
  evaluateMission();
  globalThis.setTimeout(tick, 900);
}

tick();
