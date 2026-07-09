import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createTinyDiffusionLatentMuseumCuratorReadinessDomainKit } from "../kits/tiny-diffusion-latent-museum-curator-readiness-domain-kit.js";

const domain = createTinyDiffusionLatentMuseumCuratorReadinessDomainKit();
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
  const mean = finalPixels.length ? finalPixels.reduce((sum, value) => sum + finite(value), 0) / finalPixels.length : 0;
  const clarity = finalPixels.length ? finalPixels.reduce((sum, value) => sum + Math.abs(finite(value) - mean), 0) / finalPixels.length * 3.4 : 0;
  checkpointAge = Math.max(0, checkpointAge + 1);
  if ((metrics.steps ?? 0) > 0 && globalThis.__TinyDiffusionLatentMuseumCheckpointTouched) checkpointAge = 0;
  return {
    datasetSamples: safeList(preview.datasetSamples),
    sampleCount: safeList(preview.datasetSamples).length,
    seeds: safeList(preview.datasetSamples).map((sample) => sample.label ?? sample.id).filter(Boolean),
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
    clarity,
    saved: Boolean(globalThis.__TinyDiffusionLatentMuseumCheckpointTouched || globalThis.__TinyDiffusionSampleClinicCheckpointTouched),
    checkpointAge
  };
}

function row(label, value, cue) {
  return `<p><b>${label}</b> · ${value}<br><span>${cue}</span></p>`;
}

function renderLatentMuseumPanel(readiness) {
  const panel = document.getElementById("latentMuseumReadiness");
  if (!panel) return;
  const descriptors = readiness.descriptors;
  panel.innerHTML = `
    <div class="metric"><span>Exhibition readiness</span><strong>${Math.round(readiness.readinessScore * 100)}%</strong></div>
    <div class="metric"><span>Status</span><strong>${readiness.status}</strong></div>
    <div class="mission-list">
      ${row("Seed vitrine", descriptors.seedVitrine.status, descriptors.seedVitrine.cue)}
      ${row("Noise tunnel", descriptors.noiseTunnelMap.status, descriptors.noiseTunnelMap.cue)}
      ${row("Witness frames", descriptors.denoiseWitnessFrame.status, descriptors.denoiseWitnessFrame.cue)}
      ${row("Provenance", descriptors.provenancePlaque.status, descriptors.provenancePlaque.cue)}
      ${row("Export crate", descriptors.exportCrate.status, descriptors.exportCrate.cue)}
      ${row("Exhibition ledger", descriptors.exhibitionLedger.status, descriptors.exhibitionLedger.cue)}
    </div>
  `;
}

function evaluateLatentMuseum() {
  lastReadiness = domain.evaluate(summarizePreview());
  globalThis.TinyDiffusionLatentMuseumCuratorReadiness = lastReadiness;
  renderLatentMuseumPanel(lastReadiness);
  return lastReadiness;
}

function composeRendererHandoff(previousHandoff, museumReadiness) {
  const museumHandoff = museumReadiness.rendererHandoff;
  const previousCount = Number(previousHandoff?.descriptorCount ?? previousHandoff?.counts?.total ?? 0) || 0;
  return {
    id: "tiny-diffusion-latent-museum-composed-renderer-handoff",
    kind: "renderer-handoff",
    policy: "renderer-consumes-descriptors-only",
    descriptors: {
      previous: previousHandoff ?? null,
      latentMuseum: museumHandoff
    },
    counts: {
      previous: previousCount,
      latentMuseum: museumHandoff.descriptorCount,
      total: previousCount + museumHandoff.descriptorCount
    }
  };
}

function patchTinyDiffusionHost() {
  const host = globalThis.TinyDiffusionLab ?? {};
  if (host.__latentMuseumCuratorPatched) return;
  const previousGetRendererHandoff = typeof host.getRendererHandoff === "function" ? host.getRendererHandoff.bind(host) : null;
  const originalCheckpoint = host.checkpointRoundTrip;
  if (typeof originalCheckpoint === "function") {
    host.checkpointRoundTrip = async (...args) => {
      const result = await originalCheckpoint(...args);
      globalThis.__TinyDiffusionLatentMuseumCheckpointTouched = true;
      checkpointAge = 0;
      evaluateLatentMuseum();
      return result;
    };
  }
  Object.assign(host, {
    __latentMuseumCuratorPatched: true,
    getLatentMuseumCuratorReadinessDomain: () => domain,
    getLatentMuseumCuratorReadiness: () => evaluateLatentMuseum(),
    getTinyDiffusionLatentMuseumCuratorReadiness: () => evaluateLatentMuseum(),
    getLatentMuseumCuratorReadinessTree: () => domain.tree,
    getRendererHandoff: () => composeRendererHandoff(previousGetRendererHandoff ? previousGetRendererHandoff() : null, lastReadiness ?? evaluateLatentMuseum())
  });
  globalThis.TinyDiffusionLab = host;
}

function tick() {
  void NexusEngine;
  patchTinyDiffusionHost();
  evaluateLatentMuseum();
  globalThis.setTimeout(tick, 1200);
}

tick();
