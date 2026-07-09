export const TINY_DIFFUSION_SAMPLE_CLINIC_READINESS_DOMAIN_TREE = Object.freeze({
  root: "tiny-diffusion-sample-clinic-readiness-domain",
  subdomains: [
    {
      id: "sample-observation-domain",
      subdomains: [
        { id: "artifact-scan-domain", kits: ["tiny-diffusion-artifact-scan-map-kit"] },
        { id: "anomaly-mask-domain", kits: ["tiny-diffusion-anomaly-mask-kit"] }
      ]
    },
    {
      id: "training-health-domain",
      subdomains: [
        {
          id: "loss-triage-domain",
          subdomains: [
            { id: "loss-band-domain", kits: ["tiny-diffusion-loss-triage-band-kit"] },
            { id: "retry-prescription-domain", kits: ["tiny-diffusion-retry-prescription-kit"] }
          ]
        }
      ]
    },
    {
      id: "curation-handoff-domain",
      subdomains: [
        { id: "curator-label-domain", kits: ["tiny-diffusion-curator-label-card-kit"] },
        { id: "archive-ledger-domain", kits: ["tiny-diffusion-archive-handoff-ledger-kit"] }
      ]
    },
    {
      id: "renderer-handoff",
      kits: ["tiny-diffusion-sample-clinic-renderer-handoff-kit"],
      contract: "renderer consumes descriptors only"
    }
  ],
  contract: "sample clinic kits consume diffusion preview metrics and emit serializable descriptors only; no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, diffusion backend, or frame-loop ownership"
});

export const TINY_DIFFUSION_SAMPLE_CLINIC_FORBIDDEN_OWNERSHIP = Object.freeze([
  "renderer",
  "dom",
  "browser-input",
  "three-js",
  "webgl",
  "audio",
  "asset-loading",
  "diffusion-backend",
  "checkpoint-storage",
  "frame-loop"
]);

function finite(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, finite(value, min)));
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function round(value, places = 3) {
  const scale = 10 ** places;
  return Math.round(finite(value) * scale) / scale;
}

function safeList(value) {
  return Array.isArray(value) ? value : [];
}

function makeDescriptor(kind, fields = {}) {
  return Object.freeze({ kind, ...fields });
}

function pixelStats(pixels = []) {
  const list = safeList(pixels).map((value) => clamp01(value));
  if (!list.length) {
    return { count: 0, mean: 0, variance: 0, contrast: 0, hotPixels: 0, coldPixels: 0 };
  }
  const mean = list.reduce((sum, value) => sum + value, 0) / list.length;
  const variance = list.reduce((sum, value) => sum + Math.abs(value - mean), 0) / list.length;
  const hotPixels = list.filter((value) => value >= 0.74).length;
  const coldPixels = list.filter((value) => value <= 0.18).length;
  const contrast = Math.max(...list) - Math.min(...list);
  return {
    count: list.length,
    mean: round(mean),
    variance: round(variance),
    contrast: round(contrast),
    hotPixels,
    coldPixels
  };
}

function samplePixels(input = {}) {
  return safeList(input.finalPixels ?? input.pixels ?? input.finalImage?.pixels);
}

export function createTinyDiffusionArtifactScanMapKit() {
  return Object.freeze({
    id: "tiny-diffusion-artifact-scan-map-kit",
    evaluate(input = {}) {
      const pixels = samplePixels(input);
      const stats = pixelStats(pixels);
      const width = Math.max(1, Math.round(finite(input.width ?? input.finalImage?.width, 16)));
      const stride = Math.max(1, Math.floor(stats.count / 12));
      const scanPoints = pixels
        .map((value, index) => ({ value: clamp01(value), index }))
        .filter((_, index) => index % stride === 0)
        .slice(0, 12)
        .map(({ value, index }) => ({
          x: index % width,
          y: Math.floor(index / width),
          intensity: round(value),
          role: value > stats.mean ? "signal" : "background"
        }));
      const artifactRisk = round(clamp01((1 - stats.contrast) * 0.34 + Math.abs(stats.mean - 0.5) * 0.52 + (stats.count ? 0 : 0.72)));
      return makeDescriptor("artifact-scan-map", {
        ready: stats.count > 0,
        samplePixels: stats.count,
        mean: stats.mean,
        contrast: stats.contrast,
        artifactRisk,
        scanPoints,
        status: stats.count === 0 ? "no-sample" : artifactRisk > 0.58 ? "artifact-prone" : "scan-clean",
        cue: stats.count === 0 ? "generate sample before artifact scan" : `${scanPoints.length} scan points mapped across ${stats.count} pixels`
      });
    }
  });
}

export function createTinyDiffusionAnomalyMaskKit() {
  return Object.freeze({
    id: "tiny-diffusion-anomaly-mask-kit",
    evaluate(input = {}) {
      const pixels = samplePixels(input);
      const stats = pixelStats(pixels);
      const width = Math.max(1, Math.round(finite(input.width ?? input.finalImage?.width, 16)));
      const anomalies = pixels
        .map((value, index) => ({ value: clamp01(value), index }))
        .filter(({ value }) => Math.abs(value - stats.mean) > Math.max(0.22, stats.variance * 1.35))
        .slice(0, 16)
        .map(({ value, index }) => ({
          id: `anomaly-${index}`,
          x: index % width,
          y: Math.floor(index / width),
          severity: round(Math.abs(value - stats.mean)),
          type: value > stats.mean ? "hot" : "cold"
        }));
      const anomalyScore = round(clamp01(1 - anomalies.length / 18));
      return makeDescriptor("anomaly-mask", {
        anomalies,
        anomalyCount: anomalies.length,
        anomalyScore,
        status: anomalies.length > 10 ? "noisy" : anomalies.length > 0 ? "inspect" : "clear",
        cue: anomalies.length > 0 ? `${anomalies.length} pixel anomalies need review` : "no severe anomalies found"
      });
    }
  });
}

export function createTinyDiffusionLossTriageBandKit() {
  return Object.freeze({
    id: "tiny-diffusion-loss-triage-band-kit",
    evaluate(input = {}) {
      const latestLoss = finite(input.latestLoss, 1);
      const epochs = Math.max(0, Math.round(finite(input.epochs, 0)));
      const steps = Math.max(0, Math.round(finite(input.steps, 0)));
      const frames = Math.max(0, Math.round(finite(input.frames, 0)));
      const lossHealth = round(clamp01(1 - latestLoss));
      const exposure = round(clamp01(epochs / 12 * 0.48 + steps / 96 * 0.32 + frames / 8 * 0.2));
      const triageScore = round(clamp01(lossHealth * 0.62 + exposure * 0.38));
      return makeDescriptor("loss-triage-band", {
        latestLoss: round(latestLoss, 5),
        epochs,
        steps,
        frames,
        lossHealth,
        exposure,
        triageScore,
        status: triageScore > 0.72 ? "healthy" : triageScore > 0.38 ? "watch" : "unstable",
        cue: epochs > 0 ? `loss ${round(latestLoss, 5)} after ${epochs} epochs` : "train before loss triage"
      });
    }
  });
}

export function createTinyDiffusionRetryPrescriptionKit() {
  return Object.freeze({
    id: "tiny-diffusion-retry-prescription-kit",
    evaluate(input = {}) {
      const latestLoss = finite(input.latestLoss, 1);
      const frames = Math.max(0, Math.round(finite(input.frames, 0)));
      const sampleReady = Boolean(input.finalReady) || samplePixels(input).length > 0;
      const sampleCount = Math.max(0, Math.round(finite(input.sampleCount, 0)));
      const actions = [];
      if (sampleCount < 6) actions.push("prepare-more-seeds");
      if (latestLoss > 0.62) actions.push("train-ten-epochs");
      if (frames < 4 || !sampleReady) actions.push("generate-sample");
      if (actions.length === 0) actions.push("archive-current-sample");
      const urgency = round(clamp01((latestLoss > 0.62 ? 0.42 : 0.12) + (sampleReady ? 0 : 0.34) + (sampleCount < 6 ? 0.18 : 0)));
      return makeDescriptor("retry-prescription", {
        actions,
        actionCount: actions.length,
        urgency,
        status: actions.includes("archive-current-sample") ? "archive" : urgency > 0.58 ? "retry-now" : "continue",
        cue: actions.join(" → ")
      });
    }
  });
}

export function createTinyDiffusionCuratorLabelCardKit() {
  return Object.freeze({
    id: "tiny-diffusion-curator-label-card-kit",
    evaluate(input = {}) {
      const stats = pixelStats(samplePixels(input));
      const latestLoss = finite(input.latestLoss, 1);
      const clarity = clamp01(input.clarity ?? (stats.variance * 3.1 + (latestLoss < 0.7 ? 0.12 : 0)));
      const family = stats.count === 0 ? "unseen" : stats.mean > 0.58 ? "bright glyph" : stats.mean < 0.36 ? "shadow glyph" : "balanced glyph";
      const labelScore = round(clamp01(clarity * 0.56 + stats.contrast * 0.28 + (1 - latestLoss) * 0.16));
      return makeDescriptor("curator-label-card", {
        family,
        labelScore,
        clarity: round(clarity),
        mean: stats.mean,
        contrast: stats.contrast,
        status: labelScore > 0.68 ? "publishable-study" : labelScore > 0.36 ? "needs-caption" : "hold",
        cue: stats.count === 0 ? "waiting for generated sample" : `${family} · ${Math.round(labelScore * 100)}% label confidence`
      });
    }
  });
}

export function createTinyDiffusionArchiveHandoffLedgerKit() {
  return Object.freeze({
    id: "tiny-diffusion-archive-handoff-ledger-kit",
    evaluate(input = {}) {
      const saved = Boolean(input.saved);
      const steps = Math.max(0, Math.round(finite(input.steps, 0)));
      const finalReady = Boolean(input.finalReady) || samplePixels(input).length > 0;
      const checkpointAge = Math.max(0, Math.round(finite(input.checkpointAge, saved ? 0 : 999)));
      const handoffScore = round(clamp01((saved ? 0.38 : 0.05) + (finalReady ? 0.32 : 0) + Math.min(steps, 80) / 240 + (checkpointAge <= 16 ? 0.12 : 0)));
      return makeDescriptor("archive-handoff-ledger", {
        saved,
        steps,
        finalReady,
        checkpointAge,
        handoffScore,
        status: handoffScore >= 0.74 ? "handoff-ready" : handoffScore >= 0.42 ? "nearly-ready" : "not-ready",
        cue: saved ? `checkpoint linked at ${steps} steps` : "save/load checkpoint before archive"
      });
    }
  });
}

export function createTinyDiffusionSampleClinicRendererHandoffKit() {
  return Object.freeze({
    id: "tiny-diffusion-sample-clinic-renderer-handoff-kit",
    createHandoff(descriptorBuckets = {}) {
      const descriptors = Object.values(descriptorBuckets).flatMap((bucket) => Array.isArray(bucket) ? bucket : [bucket]).filter(Boolean);
      return makeDescriptor("renderer-handoff", {
        id: "tiny-diffusion-sample-clinic-renderer-handoff",
        policy: "renderer-consumes-descriptors-only",
        descriptorCount: descriptors.length,
        descriptors,
        buckets: Object.keys(descriptorBuckets),
        forbiddenOwnership: TINY_DIFFUSION_SAMPLE_CLINIC_FORBIDDEN_OWNERSHIP
      });
    }
  });
}

export function createTinyDiffusionSampleClinicReadinessDomainKit(options = {}) {
  const artifactScanMap = options.artifactScanMap ?? createTinyDiffusionArtifactScanMapKit();
  const anomalyMask = options.anomalyMask ?? createTinyDiffusionAnomalyMaskKit();
  const lossTriageBand = options.lossTriageBand ?? createTinyDiffusionLossTriageBandKit();
  const retryPrescription = options.retryPrescription ?? createTinyDiffusionRetryPrescriptionKit();
  const curatorLabelCard = options.curatorLabelCard ?? createTinyDiffusionCuratorLabelCardKit();
  const archiveHandoffLedger = options.archiveHandoffLedger ?? createTinyDiffusionArchiveHandoffLedgerKit();
  const rendererHandoff = options.rendererHandoff ?? createTinyDiffusionSampleClinicRendererHandoffKit();

  function evaluate(input = {}) {
    const descriptors = Object.freeze({
      artifactScanMap: artifactScanMap.evaluate(input),
      anomalyMask: anomalyMask.evaluate(input),
      lossTriageBand: lossTriageBand.evaluate(input),
      retryPrescription: retryPrescription.evaluate(input),
      curatorLabelCard: curatorLabelCard.evaluate(input),
      archiveHandoffLedger: archiveHandoffLedger.evaluate(input)
    });
    const readinessScore = round(clamp01([
      1 - descriptors.artifactScanMap.artifactRisk,
      descriptors.anomalyMask.anomalyScore,
      descriptors.lossTriageBand.triageScore,
      descriptors.curatorLabelCard.labelScore,
      descriptors.archiveHandoffLedger.handoffScore
    ].reduce((sum, value) => sum + finite(value), 0) / 5));
    return Object.freeze({
      id: "tiny-diffusion-sample-clinic-readiness",
      domainTree: TINY_DIFFUSION_SAMPLE_CLINIC_READINESS_DOMAIN_TREE,
      forbiddenOwnership: TINY_DIFFUSION_SAMPLE_CLINIC_FORBIDDEN_OWNERSHIP,
      readinessScore,
      status: readinessScore >= 0.74 ? "clinic-ready" : readinessScore >= 0.42 ? "needs-review" : "waiting-for-sample",
      descriptors,
      rendererHandoff: rendererHandoff.createHandoff(descriptors)
    });
  }

  return Object.freeze({
    id: "tiny-diffusion-sample-clinic-readiness-domain-kit",
    tree: TINY_DIFFUSION_SAMPLE_CLINIC_READINESS_DOMAIN_TREE,
    forbiddenOwnership: TINY_DIFFUSION_SAMPLE_CLINIC_FORBIDDEN_OWNERSHIP,
    kits: Object.freeze([artifactScanMap, anomalyMask, lossTriageBand, retryPrescription, curatorLabelCard, archiveHandoffLedger, rendererHandoff]),
    evaluate
  });
}
