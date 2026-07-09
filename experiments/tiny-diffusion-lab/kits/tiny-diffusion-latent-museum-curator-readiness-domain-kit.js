export const TINY_DIFFUSION_LATENT_MUSEUM_CURATOR_READINESS_DOMAIN_TREE = Object.freeze({
  root: "tiny-diffusion-latent-museum-curator-readiness-domain",
  subdomains: [
    { id: "collection-intake-domain", subdomains: [
      { id: "seed-vitrine-domain", kits: ["tiny-diffusion-seed-vitrine-kit"] },
      { id: "noise-tunnel-domain", kits: ["tiny-diffusion-noise-tunnel-map-kit"] }
    ] },
    { id: "artifact-interpretation-domain", subdomains: [
      { id: "denoise-witness-domain", subdomains: [
        { id: "frame-witness-domain", kits: ["tiny-diffusion-denoise-witness-frame-kit"] },
        { id: "provenance-plaque-domain", kits: ["tiny-diffusion-provenance-plaque-kit"] }
      ] }
    ] },
    { id: "exhibition-handoff-domain", subdomains: [
      { id: "export-crate-domain", kits: ["tiny-diffusion-export-crate-kit"] },
      { id: "exhibition-ledger-domain", kits: ["tiny-diffusion-exhibition-ledger-kit"] }
    ] },
    { id: "renderer-handoff", kits: ["tiny-diffusion-latent-museum-renderer-handoff-kit"], contract: "renderer consumes descriptors only" }
  ],
  contract: "emit serializable latent museum descriptors only; no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, diffusion backend, storage, or frame-loop ownership"
});

export const TINY_DIFFUSION_LATENT_MUSEUM_FORBIDDEN_OWNERSHIP = Object.freeze([
  "renderer", "dom", "browser-input", "three-js", "webgl", "audio", "asset-loading", "diffusion-backend", "checkpoint-storage", "network", "frame-loop"
]);

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, finite(value, min)));
const clamp01 = (value) => clamp(value, 0, 1);
const round = (value, places = 3) => Math.round(finite(value) * 10 ** places) / 10 ** places;
const list = (value) => Array.isArray(value) ? value : [];
const descriptor = (kind, fields = {}) => Object.freeze({ kind, ...fields });
const pixels = (input = {}) => list(input.finalPixels ?? input.pixels ?? input.finalImage?.pixels);

function pixelStats(input = {}) {
  const values = pixels(input).map(clamp01);
  if (!values.length) return { count: 0, mean: 0, contrast: 0, variance: 0 };
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + Math.abs(value - mean), 0) / values.length;
  return { count: values.length, mean: round(mean), contrast: round(Math.max(...values) - Math.min(...values)), variance: round(variance) };
}

function sampleCount(input = {}) {
  return Math.max(0, Math.round(finite(input.sampleCount ?? list(input.datasetSamples).length, 0)));
}

function seedLabels(input = {}) {
  const explicit = list(input.seeds);
  const source = explicit.length ? explicit : list(input.datasetSamples).map((sample, index) => sample?.label ?? sample?.id ?? `seed-${index + 1}`);
  return source.map(String).filter(Boolean).slice(0, 8);
}

export function createTinyDiffusionSeedVitrineKit() {
  return Object.freeze({ id: "tiny-diffusion-seed-vitrine-kit", evaluate(input = {}) {
    const count = sampleCount(input);
    const labels = seedLabels(input);
    const diversityScore = round(clamp01(count / 8 * 0.72 + Math.min(new Set(labels).size, 8) / 8 * 0.28));
    return descriptor("seed-vitrine", { sampleCount: count, labels, diversityScore, ready: count >= 6, status: count >= 8 ? "full-vitrine" : count >= 4 ? "partial-vitrine" : "under-collected", cue: count >= 6 ? `${count} dataset seeds mounted for comparison` : "prepare dataset before museum curation" });
  } });
}

export function createTinyDiffusionNoiseTunnelMapKit() {
  return Object.freeze({ id: "tiny-diffusion-noise-tunnel-map-kit", evaluate(input = {}) {
    const rawSteps = list(input.noiseSteps);
    const count = rawSteps.length || Math.max(0, Math.round(finite(input.timesteps, 0)));
    const schedule = (rawSteps.length ? rawSteps : Array.from({ length: count }, (_, timestep) => ({ timestep, amount: timestep / Math.max(1, count - 1) }))).slice(0, 10).map((step, index) => ({ id: `noise-step-${index + 1}`, timestep: Math.round(finite(step?.timestep, index)), amount: round(clamp01(step?.amount ?? index / Math.max(1, count - 1))) }));
    const tunnelScore = round(clamp01(count / 8));
    return descriptor("noise-tunnel-map", { stepCount: count, schedule, tunnelScore, status: count >= 8 ? "mapped" : count >= 4 ? "partial" : "missing", cue: count >= 8 ? "noise corridor has enough witness points" : "prepare preview noise schedule" });
  } });
}

export function createTinyDiffusionDenoiseWitnessFrameKit() {
  return Object.freeze({ id: "tiny-diffusion-denoise-witness-frame-kit", evaluate(input = {}) {
    const rawFrames = list(input.denoiseFrames ?? input.framesList);
    const count = Math.max(0, Math.round(finite(input.frames, rawFrames.length)));
    const frameTrail = rawFrames.slice(-8).map((frame, index) => ({ id: `witness-frame-${index + 1}`, timestep: Math.round(finite(frame?.timestep, index)), pixelCount: list(frame?.pixels).length }));
    const witnessScore = round(clamp01(count / 8));
    return descriptor("denoise-witness-frame", { frameCount: count, frameTrail, witnessScore, status: count >= 8 ? "complete-trail" : count >= 3 ? "thin-trail" : "no-trail", cue: count >= 8 ? "full denoise trail ready for wall label" : "generate a sample to create witness frames" });
  } });
}

export function createTinyDiffusionProvenancePlaqueKit() {
  return Object.freeze({ id: "tiny-diffusion-provenance-plaque-kit", evaluate(input = {}) {
    const epochs = Math.max(0, Math.round(finite(input.epochs, 0)));
    const steps = Math.max(0, Math.round(finite(input.steps, 0)));
    const latestLoss = Math.max(0, finite(input.latestLoss, 1));
    const clarity = clamp01(input.clarity ?? pixelStats(input).variance * 3.1);
    const trainingScore = round(clamp01(epochs / 12 * 0.42 + steps / 96 * 0.36 + (1 - latestLoss) * 0.22));
    return descriptor("provenance-plaque", { epochs, steps, latestLoss: round(latestLoss, 5), clarity: round(clarity), trainingScore, status: trainingScore >= 0.72 ? "well-documented" : trainingScore >= 0.36 ? "needs-context" : "thin-provenance", cue: epochs > 0 ? `${epochs} epochs · ${steps} steps · loss ${round(latestLoss, 5)}` : "train before writing provenance" });
  } });
}

export function createTinyDiffusionExportCrateKit() {
  return Object.freeze({ id: "tiny-diffusion-export-crate-kit", evaluate(input = {}) {
    const stats = pixelStats(input);
    const saved = Boolean(input.saved);
    const finalReady = Boolean(input.finalReady) || stats.count > 0;
    const checkpointAge = Math.max(0, Math.round(finite(input.checkpointAge, saved ? 0 : 999)));
    const crateScore = round(clamp01((finalReady ? 0.42 : 0) + (saved ? 0.34 : 0) + (checkpointAge <= 16 ? 0.12 : 0) + stats.contrast * 0.12));
    return descriptor("export-crate", { saved, finalReady, checkpointAge, pixelCount: stats.count, contrast: stats.contrast, crateScore, status: crateScore >= 0.78 ? "sealed" : crateScore >= 0.44 ? "packing" : "empty-crate", cue: saved ? "checkpoint receipt attached to crate" : "save/load checkpoint before export" });
  } });
}

export function createTinyDiffusionExhibitionLedgerKit() {
  return Object.freeze({ id: "tiny-diffusion-exhibition-ledger-kit", evaluate(input = {}, descriptors = {}) {
    const scores = [descriptors.seedVitrine?.diversityScore, descriptors.noiseTunnelMap?.tunnelScore, descriptors.denoiseWitnessFrame?.witnessScore, descriptors.provenancePlaque?.trainingScore, descriptors.exportCrate?.crateScore].map(clamp01);
    const readinessScore = round(clamp01(scores.reduce((sum, value) => sum + value, 0) / Math.max(1, scores.length)));
    const blockers = [];
    if ((descriptors.seedVitrine?.sampleCount ?? 0) < 6) blockers.push("dataset-seeds");
    if ((descriptors.denoiseWitnessFrame?.frameCount ?? 0) < 4) blockers.push("sample-trail");
    if ((descriptors.provenancePlaque?.epochs ?? 0) < 2) blockers.push("training-provenance");
    if (!descriptors.exportCrate?.saved) blockers.push("checkpoint-receipt");
    return descriptor("exhibition-ledger", { readinessScore, blockerCount: blockers.length, blockers, status: readinessScore >= 0.76 && blockers.length === 0 ? "exhibition-ready" : readinessScore >= 0.48 ? "curator-review" : "collection-open", cue: blockers.length ? `next: ${blockers[0]}` : "latent artifact exhibition can open" });
  } });
}

export function createTinyDiffusionLatentMuseumRendererHandoffKit() {
  return Object.freeze({ id: "tiny-diffusion-latent-museum-renderer-handoff-kit", createHandoff(descriptorBuckets = {}) {
    const descriptors = Object.values(descriptorBuckets).flatMap((bucket) => Array.isArray(bucket) ? bucket : [bucket]).filter(Boolean);
    return descriptor("renderer-handoff", { id: "tiny-diffusion-latent-museum-renderer-handoff", policy: "renderer-consumes-descriptors-only", descriptorCount: descriptors.length, descriptors, buckets: Object.keys(descriptorBuckets), forbiddenOwnership: TINY_DIFFUSION_LATENT_MUSEUM_FORBIDDEN_OWNERSHIP });
  } });
}

export function createTinyDiffusionLatentMuseumCuratorReadinessDomainKit(options = {}) {
  const seedVitrine = options.seedVitrine ?? createTinyDiffusionSeedVitrineKit();
  const noiseTunnelMap = options.noiseTunnelMap ?? createTinyDiffusionNoiseTunnelMapKit();
  const denoiseWitnessFrame = options.denoiseWitnessFrame ?? createTinyDiffusionDenoiseWitnessFrameKit();
  const provenancePlaque = options.provenancePlaque ?? createTinyDiffusionProvenancePlaqueKit();
  const exportCrate = options.exportCrate ?? createTinyDiffusionExportCrateKit();
  const exhibitionLedger = options.exhibitionLedger ?? createTinyDiffusionExhibitionLedgerKit();
  const rendererHandoff = options.rendererHandoff ?? createTinyDiffusionLatentMuseumRendererHandoffKit();
  function evaluate(input = {}) {
    const descriptors = { seedVitrine: seedVitrine.evaluate(input), noiseTunnelMap: noiseTunnelMap.evaluate(input), denoiseWitnessFrame: denoiseWitnessFrame.evaluate(input), provenancePlaque: provenancePlaque.evaluate(input), exportCrate: exportCrate.evaluate(input) };
    descriptors.exhibitionLedger = exhibitionLedger.evaluate(input, descriptors);
    const frozenDescriptors = Object.freeze(descriptors);
    return Object.freeze({ id: "tiny-diffusion-latent-museum-curator-readiness", domainTree: TINY_DIFFUSION_LATENT_MUSEUM_CURATOR_READINESS_DOMAIN_TREE, forbiddenOwnership: TINY_DIFFUSION_LATENT_MUSEUM_FORBIDDEN_OWNERSHIP, readinessScore: frozenDescriptors.exhibitionLedger.readinessScore, status: frozenDescriptors.exhibitionLedger.status, descriptors: frozenDescriptors, rendererHandoff: rendererHandoff.createHandoff(frozenDescriptors) });
  }
  return Object.freeze({ id: "tiny-diffusion-latent-museum-curator-readiness-domain-kit", tree: TINY_DIFFUSION_LATENT_MUSEUM_CURATOR_READINESS_DOMAIN_TREE, forbiddenOwnership: TINY_DIFFUSION_LATENT_MUSEUM_FORBIDDEN_OWNERSHIP, kits: Object.freeze([seedVitrine, noiseTunnelMap, denoiseWitnessFrame, provenancePlaque, exportCrate, exhibitionLedger, rendererHandoff]), evaluate });
}
