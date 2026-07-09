export const TINY_DIFFUSION_REPAIR_MURAL_READINESS_DOMAIN_TREE = Object.freeze({
  root: "tiny-diffusion-repair-mural-readiness-domain",
  subdomains: [
    { id: "artifact-source-domain", subdomains: [
      { id: "seed-brush-domain", kits: ["tiny-diffusion-seed-brush-kit"] },
      { id: "palette-well-domain", kits: ["tiny-diffusion-palette-well-kit"] }
    ] },
    { id: "restoration-planning-domain", subdomains: [
      { id: "noise-mask-domain", subdomains: [
        { id: "mask-grid-domain", kits: ["tiny-diffusion-noise-mask-grid-kit"] },
        { id: "critic-ribbon-domain", kits: ["tiny-diffusion-critic-ribbon-kit"] }
      ] }
    ] },
    { id: "gallery-handoff-domain", subdomains: [
      { id: "repair-order-domain", kits: ["tiny-diffusion-repair-order-kit"] },
      { id: "dawn-mural-ledger-domain", kits: ["tiny-diffusion-dawn-mural-ledger-kit"] }
    ] },
    { id: "renderer-handoff", kits: ["tiny-diffusion-repair-mural-renderer-handoff-kit"], contract: "renderer consumes descriptors only" }
  ],
  contract: "emit serializable repair mural descriptors only; no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, diffusion backend, storage, network, or frame-loop ownership"
});

export const TINY_DIFFUSION_REPAIR_MURAL_FORBIDDEN_OWNERSHIP = Object.freeze([
  "renderer", "dom", "browser-input", "three-js", "webgl", "audio", "asset-loading", "diffusion-backend", "checkpoint-storage", "network", "frame-loop"
]);

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, finite(value, min)));
const clamp01 = (value) => clamp(value, 0, 1);
const round = (value, places = 3) => Math.round(finite(value) * 10 ** places) / 10 ** places;
const list = (value) => Array.isArray(value) ? value : [];
const descriptor = (kind, fields = {}) => Object.freeze({ kind, ...fields });
const pixelValues = (input = {}) => list(input.finalPixels ?? input.pixels ?? input.finalImage?.pixels).map(clamp01);

function pixelStats(input = {}) {
  const values = pixelValues(input);
  if (!values.length) return { count: 0, mean: 0, contrast: 0, variance: 0, darkRatio: 0, brightRatio: 0, midRatio: 0 };
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const contrast = Math.max(...values) - Math.min(...values);
  const variance = values.reduce((sum, value) => sum + Math.abs(value - mean), 0) / values.length;
  const darkRatio = values.filter((value) => value < 0.28).length / values.length;
  const brightRatio = values.filter((value) => value > 0.72).length / values.length;
  const midRatio = values.filter((value) => value >= 0.28 && value <= 0.72).length / values.length;
  return { count: values.length, mean: round(mean), contrast: round(contrast), variance: round(variance), darkRatio: round(darkRatio), brightRatio: round(brightRatio), midRatio: round(midRatio) };
}

function datasetSamples(input = {}) {
  return list(input.datasetSamples).slice(0, 10).map((sample, index) => ({
    id: String(sample?.id ?? sample?.label ?? `dataset-sample-${index + 1}`),
    label: String(sample?.label ?? sample?.id ?? `sample-${index + 1}`),
    pixelCount: list(sample?.pixels).length,
    width: Math.max(1, Math.round(finite(sample?.width, 16))),
    height: Math.max(1, Math.round(finite(sample?.height, 16)))
  }));
}

export function createTinyDiffusionSeedBrushKit() {
  return Object.freeze({ id: "tiny-diffusion-seed-brush-kit", evaluate(input = {}) {
    const samples = datasetSamples(input);
    const explicitCount = Math.max(0, Math.round(finite(input.sampleCount, samples.length)));
    const sampleCount = Math.max(explicitCount, samples.length);
    const uniqueLabels = new Set(samples.map((sample) => sample.label)).size;
    const brushScore = round(clamp01(sampleCount / 8 * 0.68 + uniqueLabels / 8 * 0.32));
    return descriptor("seed-brush", { sampleCount, uniqueLabels, samples, brushScore, ready: sampleCount >= 6, status: sampleCount >= 8 ? "brush-rack-full" : sampleCount >= 4 ? "brush-rack-started" : "brushes-missing", cue: sampleCount >= 6 ? `${sampleCount} seed brushes can repaint missing mural texture` : "prepare dataset samples to fill the brush rack" });
  } });
}

export function createTinyDiffusionPaletteWellKit() {
  return Object.freeze({ id: "tiny-diffusion-palette-well-kit", evaluate(input = {}) {
    const stats = pixelStats(input);
    const paletteBands = [stats.darkRatio, stats.midRatio, stats.brightRatio];
    const balance = 1 - Math.max(...paletteBands) + Math.min(...paletteBands);
    const paletteScore = round(clamp01((stats.count ? 0.36 : 0) + stats.contrast * 0.34 + balance * 0.3));
    return descriptor("palette-well", { pixelCount: stats.count, mean: stats.mean, contrast: stats.contrast, darkRatio: stats.darkRatio, midRatio: stats.midRatio, brightRatio: stats.brightRatio, paletteScore, status: paletteScore >= 0.72 ? "balanced-palette" : paletteScore >= 0.38 ? "usable-palette" : "dry-palette", cue: stats.count ? `contrast ${stats.contrast} · mid ${stats.midRatio}` : "generate a final image before filling palette wells" });
  } });
}

export function createTinyDiffusionNoiseMaskGridKit() {
  return Object.freeze({ id: "tiny-diffusion-noise-mask-grid-kit", evaluate(input = {}) {
    const rawNoise = list(input.noiseSteps);
    const rawFrames = list(input.denoiseFrames ?? input.framesList);
    const noiseCount = rawNoise.length || Math.max(0, Math.round(finite(input.timesteps, 0)));
    const frameCount = Math.max(rawFrames.length, Math.round(finite(input.frames, rawFrames.length)));
    const cells = Array.from({ length: Math.min(12, Math.max(noiseCount, frameCount, 0)) }, (_, index) => ({
      id: `mask-cell-${index + 1}`,
      timestep: Math.round(finite(rawNoise[index]?.timestep ?? rawFrames[index]?.timestep, index)),
      noiseAmount: round(clamp01(rawNoise[index]?.amount ?? index / Math.max(1, noiseCount - 1)))
    }));
    const maskScore = round(clamp01(noiseCount / 8 * 0.45 + frameCount / 8 * 0.55));
    return descriptor("noise-mask-grid", { noiseCount, frameCount, cells, maskScore, status: maskScore >= 0.78 ? "mask-grid-registered" : maskScore >= 0.42 ? "mask-grid-partial" : "mask-grid-blank", cue: frameCount >= 6 ? "enough denoise frames to mark restoration masks" : "generate sample frames to register the mask grid" });
  } });
}

export function createTinyDiffusionCriticRibbonKit() {
  return Object.freeze({ id: "tiny-diffusion-critic-ribbon-kit", evaluate(input = {}) {
    const epochs = Math.max(0, Math.round(finite(input.epochs, 0)));
    const steps = Math.max(0, Math.round(finite(input.steps, 0)));
    const latestLoss = Math.max(0, finite(input.latestLoss, 1));
    const stats = pixelStats(input);
    const critiqueScore = round(clamp01(epochs / 12 * 0.28 + steps / 96 * 0.26 + (1 - latestLoss) * 0.24 + stats.variance * 2.2 * 0.22));
    const warnings = [];
    if (epochs < 2) warnings.push("train-more");
    if (stats.count === 0) warnings.push("missing-final-image");
    if (latestLoss > 0.72) warnings.push("loss-high");
    if (stats.contrast < 0.18 && stats.count) warnings.push("low-contrast");
    return descriptor("critic-ribbon", { epochs, steps, latestLoss: round(latestLoss, 5), variance: stats.variance, warnings, critiqueScore, status: critiqueScore >= 0.72 && warnings.length <= 1 ? "approved-ribbon" : critiqueScore >= 0.42 ? "review-ribbon" : "redline-ribbon", cue: warnings.length ? `critic next: ${warnings[0]}` : "critic ribbon approves mural restoration" });
  } });
}

export function createTinyDiffusionRepairOrderKit() {
  return Object.freeze({ id: "tiny-diffusion-repair-order-kit", evaluate(input = {}, descriptors = {}) {
    const saved = Boolean(input.saved ?? input.checkpointSaved);
    const finalReady = Boolean(input.finalReady) || pixelStats(input).count > 0;
    const patchCount = Math.max(0, Math.round(finite(input.patchCount, (descriptors.noiseMaskGrid?.frameCount ?? 0) + (descriptors.seedBrush?.sampleCount ?? 0))));
    const orderScore = round(clamp01((saved ? 0.24 : 0) + (finalReady ? 0.24 : 0) + Math.min(patchCount, 16) / 16 * 0.26 + (descriptors.criticRibbon?.critiqueScore ?? 0) * 0.26));
    const blockers = [];
    if (!saved) blockers.push("checkpoint-receipt");
    if (!finalReady) blockers.push("final-image");
    if ((descriptors.noiseMaskGrid?.frameCount ?? 0) < 4) blockers.push("mask-frames");
    return descriptor("repair-order", { saved, finalReady, patchCount, blockers, orderScore, status: orderScore >= 0.76 && blockers.length === 0 ? "order-sealed" : orderScore >= 0.46 ? "order-drafting" : "order-waiting", cue: blockers.length ? `repair order waits on ${blockers[0]}` : "repair order sealed for gallery handoff" });
  } });
}

export function createTinyDiffusionDawnMuralLedgerKit() {
  return Object.freeze({ id: "tiny-diffusion-dawn-mural-ledger-kit", evaluate(input = {}, descriptors = {}) {
    const scores = [descriptors.seedBrush?.brushScore, descriptors.paletteWell?.paletteScore, descriptors.noiseMaskGrid?.maskScore, descriptors.criticRibbon?.critiqueScore, descriptors.repairOrder?.orderScore].map(clamp01);
    const readinessScore = round(clamp01(scores.reduce((sum, value) => sum + value, 0) / Math.max(1, scores.length)));
    const blockers = [];
    if ((descriptors.seedBrush?.sampleCount ?? 0) < 6) blockers.push("seed-brushes");
    if ((descriptors.paletteWell?.pixelCount ?? 0) === 0) blockers.push("palette-image");
    if ((descriptors.noiseMaskGrid?.frameCount ?? 0) < 4) blockers.push("mask-grid");
    if ((descriptors.criticRibbon?.epochs ?? 0) < 2) blockers.push("critic-training");
    if (!descriptors.repairOrder?.saved) blockers.push("checkpoint");
    const missionState = readinessScore >= 0.76 && blockers.length === 0 ? "mural-restored" : readinessScore >= 0.52 ? "restoration-underway" : "atelier-open";
    return descriptor("dawn-mural-ledger", { readinessScore, blockers, blockerCount: blockers.length, missionState, status: missionState, cue: blockers.length ? `next safe ledge: ${blockers[0]}` : "dawn mural can open with provenance" });
  } });
}

export function createTinyDiffusionRepairMuralRendererHandoffKit() {
  return Object.freeze({ id: "tiny-diffusion-repair-mural-renderer-handoff-kit", createHandoff(descriptorBuckets = {}) {
    const descriptors = Object.values(descriptorBuckets).flatMap((bucket) => Array.isArray(bucket) ? bucket : [bucket]).filter(Boolean);
    return descriptor("renderer-handoff", { id: "tiny-diffusion-repair-mural-renderer-handoff", policy: "renderer-consumes-descriptors-only", descriptorCount: descriptors.length, descriptors, buckets: Object.keys(descriptorBuckets), forbiddenOwnership: TINY_DIFFUSION_REPAIR_MURAL_FORBIDDEN_OWNERSHIP });
  } });
}

export function createTinyDiffusionRepairMuralReadinessDomainKit(options = {}) {
  const seedBrush = options.seedBrush ?? createTinyDiffusionSeedBrushKit();
  const paletteWell = options.paletteWell ?? createTinyDiffusionPaletteWellKit();
  const noiseMaskGrid = options.noiseMaskGrid ?? createTinyDiffusionNoiseMaskGridKit();
  const criticRibbon = options.criticRibbon ?? createTinyDiffusionCriticRibbonKit();
  const repairOrder = options.repairOrder ?? createTinyDiffusionRepairOrderKit();
  const dawnMuralLedger = options.dawnMuralLedger ?? createTinyDiffusionDawnMuralLedgerKit();
  const rendererHandoff = options.rendererHandoff ?? createTinyDiffusionRepairMuralRendererHandoffKit();
  function evaluate(input = {}) {
    const descriptors = {
      seedBrush: seedBrush.evaluate(input),
      paletteWell: paletteWell.evaluate(input),
      noiseMaskGrid: noiseMaskGrid.evaluate(input),
      criticRibbon: criticRibbon.evaluate(input)
    };
    descriptors.repairOrder = repairOrder.evaluate(input, descriptors);
    descriptors.dawnMuralLedger = dawnMuralLedger.evaluate(input, descriptors);
    const frozenDescriptors = Object.freeze(descriptors);
    return Object.freeze({
      id: "tiny-diffusion-repair-mural-readiness",
      domainTree: TINY_DIFFUSION_REPAIR_MURAL_READINESS_DOMAIN_TREE,
      forbiddenOwnership: TINY_DIFFUSION_REPAIR_MURAL_FORBIDDEN_OWNERSHIP,
      readinessScore: frozenDescriptors.dawnMuralLedger.readinessScore,
      status: frozenDescriptors.dawnMuralLedger.status,
      missionState: frozenDescriptors.dawnMuralLedger.missionState,
      descriptors: frozenDescriptors,
      rendererHandoff: rendererHandoff.createHandoff(frozenDescriptors)
    });
  }
  return Object.freeze({ id: "tiny-diffusion-repair-mural-readiness-domain-kit", tree: TINY_DIFFUSION_REPAIR_MURAL_READINESS_DOMAIN_TREE, forbiddenOwnership: TINY_DIFFUSION_REPAIR_MURAL_FORBIDDEN_OWNERSHIP, kits: Object.freeze([seedBrush, paletteWell, noiseMaskGrid, criticRibbon, repairOrder, dawnMuralLedger, rendererHandoff]), evaluate });
}
