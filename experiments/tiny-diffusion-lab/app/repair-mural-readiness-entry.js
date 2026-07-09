import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createTinyDiffusionRepairMuralReadinessDomainKit } from "../kits/tiny-diffusion-repair-mural-readiness-domain-kit.js";

const domain = createTinyDiffusionRepairMuralReadinessDomainKit();
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
  const finalPixels = safeList(finalImage.pixels);
  checkpointAge = Math.max(0, checkpointAge + 1);
  if ((metrics.steps ?? 0) > 0 && globalThis.__TinyDiffusionRepairMuralCheckpointTouched) checkpointAge = 0;
  return {
    datasetSamples: safeList(preview.datasetSamples),
    sampleCount: safeList(preview.datasetSamples).length,
    noiseSteps: safeList(preview.noiseSteps),
    denoiseFrames: safeList(preview.denoiseFrames),
    frames: safeList(preview.denoiseFrames).length,
    finalReady: finalPixels.length > 0,
    finalPixels,
    width: finite(finalImage.width, 16),
    height: finite(finalImage.height, 16),
    epochs: finite(metrics.epochs, 0),
    steps: finite(metrics.steps, 0),
    latestLoss: finite(metrics.latestLoss, 1),
    saved: Boolean(globalThis.__TinyDiffusionRepairMuralCheckpointTouched || globalThis.__TinyDiffusionLatentMuseumCheckpointTouched || globalThis.__TinyDiffusionSampleClinicCheckpointTouched),
    checkpointAge
  };
}

function row(label, value, cue) {
  return `<p><b>${label}</b> · ${value}<br><span>${cue}</span></p>`;
}

function renderRepairMuralPanel(readiness) {
  const panel = document.getElementById("repairMuralReadiness");
  if (!panel) return;
  const descriptors = readiness.descriptors;
  panel.innerHTML = `
    <div class="metric"><span>Mural readiness</span><strong>${Math.round(readiness.readinessScore * 100)}%</strong></div>
    <div class="metric"><span>Status</span><strong>${readiness.status}</strong></div>
    <div class="mission-list">
      ${row("Seed brush", descriptors.seedBrush.status, descriptors.seedBrush.cue)}
      ${row("Palette well", descriptors.paletteWell.status, descriptors.paletteWell.cue)}
      ${row("Noise mask", descriptors.noiseMaskGrid.status, descriptors.noiseMaskGrid.cue)}
      ${row("Critic ribbon", descriptors.criticRibbon.status, descriptors.criticRibbon.cue)}
      ${row("Repair order", descriptors.repairOrder.status, descriptors.repairOrder.cue)}
      ${row("Dawn ledger", descriptors.dawnMuralLedger.status, descriptors.dawnMuralLedger.cue)}
    </div>
  `;
}

function evaluateRepairMural() {
  lastReadiness = domain.evaluate(summarizePreview());
  globalThis.TinyDiffusionRepairMuralReadiness = lastReadiness;
  renderRepairMuralPanel(lastReadiness);
  return lastReadiness;
}

function composeRendererHandoff(previousHandoff, repairReadiness) {
  const repairHandoff = repairReadiness.rendererHandoff;
  const previousCount = Number(previousHandoff?.descriptorCount ?? previousHandoff?.counts?.total ?? 0) || 0;
  return {
    id: "tiny-diffusion-repair-mural-composed-renderer-handoff",
    kind: "renderer-handoff",
    policy: "renderer-consumes-descriptors-only",
    descriptors: {
      previous: previousHandoff ?? null,
      repairMural: repairHandoff
    },
    counts: {
      previous: previousCount,
      repairMural: repairHandoff.descriptorCount,
      total: previousCount + repairHandoff.descriptorCount
    }
  };
}

function patchTinyDiffusionHost() {
  const host = globalThis.TinyDiffusionLab ?? {};
  if (host.__repairMuralPatched) return;
  const previousGetRendererHandoff = typeof host.getRendererHandoff === "function" ? host.getRendererHandoff.bind(host) : null;
  const originalCheckpoint = host.checkpointRoundTrip;
  if (typeof originalCheckpoint === "function") {
    host.checkpointRoundTrip = async (...args) => {
      const result = await originalCheckpoint(...args);
      globalThis.__TinyDiffusionRepairMuralCheckpointTouched = true;
      checkpointAge = 0;
      evaluateRepairMural();
      return result;
    };
  }
  host.applyRepairMuralInput = async (input = {}) => {
    const action = String(input.action ?? "evaluate");
    if (action === "prepare" && typeof host.prepare === "function") await host.prepare();
    if (action === "train-one" && typeof host.train === "function") await host.train(1);
    if (action === "train-ten" && typeof host.train === "function") await host.train(10);
    if (action === "generate" && typeof host.generate === "function") await host.generate();
    if (action === "checkpoint" && typeof host.checkpointRoundTrip === "function") await host.checkpointRoundTrip();
    return evaluateRepairMural();
  };
  Object.assign(host, {
    __repairMuralPatched: true,
    getRepairMuralReadinessDomain: () => domain,
    getRepairMuralReadiness: () => evaluateRepairMural(),
    getTinyDiffusionRepairMuralReadiness: () => evaluateRepairMural(),
    getRepairMuralReadinessTree: () => domain.tree,
    getRendererHandoff: () => composeRendererHandoff(previousGetRendererHandoff ? previousGetRendererHandoff() : null, lastReadiness ?? evaluateRepairMural())
  });
  globalThis.TinyDiffusionLab = host;
}

function tick() {
  void NexusEngine;
  patchTinyDiffusionHost();
  evaluateRepairMural();
  globalThis.setTimeout(tick, 1200);
}

tick();
