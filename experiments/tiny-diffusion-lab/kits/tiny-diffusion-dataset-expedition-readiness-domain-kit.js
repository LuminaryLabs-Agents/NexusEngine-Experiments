export const TINY_DIFFUSION_DATASET_EXPEDITION_READINESS_DOMAIN_TREE = Object.freeze({
  root: "tiny-diffusion-dataset-expedition-readiness-domain",
  subdomains: [
    {
      id: "seed-expedition-domain",
      subdomains: [
        { id: "seed-cartography-domain", kits: ["tiny-diffusion-seed-cartography-kit"] },
        { id: "class-balance-domain", kits: ["tiny-diffusion-class-balance-kit"] }
      ]
    },
    {
      id: "training-expedition-domain",
      subdomains: [
        {
          id: "curriculum-route-domain",
          subdomains: [
            { id: "epoch-milepost-domain", kits: ["tiny-diffusion-curriculum-route-kit"] },
            { id: "noise-weather-domain", kits: ["tiny-diffusion-noise-weather-kit"] }
          ]
        }
      ]
    },
    {
      id: "archive-expedition-domain",
      subdomains: [
        { id: "provenance-ticket-domain", kits: ["tiny-diffusion-provenance-ticket-kit"] },
        { id: "field-guide-ledger-domain", kits: ["tiny-diffusion-field-guide-ledger-kit"] }
      ]
    },
    {
      id: "renderer-handoff",
      kits: ["tiny-diffusion-dataset-expedition-renderer-handoff-kit"],
      contract: "renderer consumes descriptors only"
    }
  ],
  contract: "dataset expedition kits consume diffusion preview metrics and emit serializable descriptors only; no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, diffusion backend, storage, or frame-loop ownership"
});

export const TINY_DIFFUSION_DATASET_EXPEDITION_FORBIDDEN_OWNERSHIP = Object.freeze([
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

function labelsFromSamples(samples = []) {
  return safeList(samples).map((sample, index) => String(sample?.label ?? sample?.id ?? `seed-${index}`));
}

function pixelStats(sample = {}) {
  const pixels = safeList(sample?.pixels).map((value) => clamp01(value));
  if (!pixels.length) return { mean: 0, contrast: 0, density: 0 };
  const mean = pixels.reduce((sum, value) => sum + value, 0) / pixels.length;
  const contrast = Math.max(...pixels) - Math.min(...pixels);
  const density = pixels.filter((value) => value > 0.5).length / pixels.length;
  return { mean: round(mean), contrast: round(contrast), density: round(density) };
}

export function createTinyDiffusionSeedCartographyKit() {
  return Object.freeze({
    id: "tiny-diffusion-seed-cartography-kit",
    evaluate(input = {}) {
      const samples = safeList(input.datasetSamples ?? input.samples);
      const mapPoints = samples.slice(0, 12).map((sample, index) => {
        const stats = pixelStats(sample);
        return {
          id: String(sample?.id ?? `seed-${index}`),
          label: String(sample?.label ?? sample?.id ?? `seed ${index + 1}`),
          x: round((index % 4) / 3),
          y: round(Math.floor(index / 4) / 2),
          contrast: stats.contrast,
          density: stats.density,
          role: stats.mean >= 0.52 ? "bright-seed" : stats.mean <= 0.34 ? "shadow-seed" : "balanced-seed"
        };
      });
      const coverageScore = round(clamp01(mapPoints.length / 8));
      return makeDescriptor("seed-cartography-map", {
        mapPoints,
        sampleCount: samples.length,
        coverageScore,
        status: coverageScore >= 0.9 ? "mapped" : coverageScore >= 0.45 ? "thin-map" : "needs-seeds",
        cue: samples.length ? `${mapPoints.length} seeds mapped into expedition grid` : "prepare dataset before field cartography"
      });
    }
  });
}

export function createTinyDiffusionClassBalanceKit() {
  return Object.freeze({
    id: "tiny-diffusion-class-balance-kit",
    evaluate(input = {}) {
      const labels = labelsFromSamples(input.datasetSamples ?? input.samples);
      const buckets = labels.reduce((ledger, label) => {
        const key = label.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "unlabeled";
        ledger[key] = (ledger[key] ?? 0) + 1;
        return ledger;
      }, {});
      const counts = Object.values(buckets);
      const min = counts.length ? Math.min(...counts) : 0;
      const max = counts.length ? Math.max(...counts) : 0;
      const balanceScore = round(clamp01(counts.length / 6 * 0.5 + (max ? min / max : 0) * 0.5));
      return makeDescriptor("class-balance-ledger", {
        buckets,
        bucketCount: counts.length,
        balanceScore,
        status: balanceScore >= 0.72 ? "balanced" : balanceScore >= 0.36 ? "skew-watch" : "unbalanced",
        cue: counts.length ? `${counts.length} label buckets; smallest ${min}, largest ${max}` : "no label buckets available"
      });
    }
  });
}

export function createTinyDiffusionCurriculumRouteKit() {
  return Object.freeze({
    id: "tiny-diffusion-curriculum-route-kit",
    evaluate(input = {}) {
      const epochs = Math.max(0, Math.round(finite(input.epochs, 0)));
      const steps = Math.max(0, Math.round(finite(input.steps, 0)));
      const latestLoss = clamp01(finite(input.latestLoss, 1));
      const route = [
        { id: "prepare", done: safeList(input.datasetSamples ?? input.samples).length >= 6 },
        { id: "warmup", done: epochs >= 1 || steps >= 8 },
        { id: "stabilize", done: epochs >= 4 || steps >= 32 },
        { id: "sample", done: safeList(input.denoiseFrames ?? input.frames).length >= 4 || Boolean(input.finalReady) },
        { id: "archive", done: Boolean(input.saved) || Boolean(input.checkpointTouched) }
      ];
      const progress = round(route.filter((node) => node.done).length / route.length);
      const curriculumScore = round(clamp01(progress * 0.72 + (1 - latestLoss) * 0.28));
      return makeDescriptor("curriculum-route", {
        route,
        epochs,
        steps,
        latestLoss: round(latestLoss, 5),
        progress,
        curriculumScore,
        status: curriculumScore >= 0.72 ? "field-ready" : curriculumScore >= 0.38 ? "en-route" : "cold-start",
        cue: `${route.filter((node) => node.done).length}/${route.length} curriculum mileposts complete`
      });
    }
  });
}

export function createTinyDiffusionNoiseWeatherKit() {
  return Object.freeze({
    id: "tiny-diffusion-noise-weather-kit",
    evaluate(input = {}) {
      const steps = safeList(input.noiseSteps).map((step) => clamp01(step?.amount ?? step));
      const frames = Math.max(0, Math.round(finite(input.frames ?? safeList(input.denoiseFrames).length, 0)));
      const spread = steps.length ? Math.max(...steps) - Math.min(...steps) : 0;
      const cadence = steps.length ? steps.reduce((sum, value) => sum + value, 0) / steps.length : 0;
      const weatherScore = round(clamp01((steps.length / 8) * 0.44 + spread * 0.34 + Math.min(frames, 8) / 8 * 0.22));
      return makeDescriptor("noise-weather-chart", {
        stepCount: steps.length,
        spread: round(spread),
        cadence: round(cadence),
        frames,
        weatherScore,
        status: weatherScore >= 0.7 ? "forecast-clear" : weatherScore >= 0.34 ? "partial-forecast" : "fogged",
        cue: steps.length ? `${steps.length} noise steps with ${frames} denoise frames` : "noise schedule not prepared"
      });
    }
  });
}

export function createTinyDiffusionProvenanceTicketKit() {
  return Object.freeze({
    id: "tiny-diffusion-provenance-ticket-kit",
    evaluate(input = {}) {
      const seeds = labelsFromSamples(input.datasetSamples ?? input.samples).slice(0, 8);
      const saved = Boolean(input.saved) || Boolean(input.checkpointTouched);
      const finalReady = Boolean(input.finalReady) || safeList(input.finalPixels).length > 0;
      const ticketScore = round(clamp01((seeds.length / 8) * 0.32 + (saved ? 0.34 : 0) + (finalReady ? 0.34 : 0)));
      return makeDescriptor("provenance-ticket", {
        seeds,
        saved,
        finalReady,
        ticketScore,
        status: ticketScore >= 0.74 ? "ticket-complete" : ticketScore >= 0.38 ? "ticket-draft" : "missing-chain",
        cue: saved ? `checkpoint chain includes ${seeds.length} seed labels` : "save checkpoint to lock provenance"
      });
    }
  });
}

export function createTinyDiffusionFieldGuideLedgerKit() {
  return Object.freeze({
    id: "tiny-diffusion-field-guide-ledger-kit",
    evaluate(input = {}) {
      const sampleCount = safeList(input.datasetSamples ?? input.samples).length;
      const epochs = Math.max(0, Math.round(finite(input.epochs, 0)));
      const finalReady = Boolean(input.finalReady) || safeList(input.finalPixels).length > 0;
      const checkpoints = [
        sampleCount >= 6 ? "dataset-surveyed" : "collect-seeds",
        epochs >= 4 ? "route-trained" : "train-curriculum",
        finalReady ? "sample-generated" : "generate-specimen",
        Boolean(input.saved ?? input.checkpointTouched) ? "archive-ticketed" : "checkpoint-needed"
      ];
      const completed = checkpoints.filter((item) => !/collect|train|generate|needed/.test(item)).length;
      const guideScore = round(clamp01(completed / checkpoints.length));
      return makeDescriptor("field-guide-ledger", {
        checkpoints,
        completed,
        guideScore,
        nextAction: checkpoints.find((item) => /collect|train|generate|needed/.test(item)) ?? "publish field guide",
        status: guideScore >= 0.75 ? "guide-ready" : guideScore >= 0.35 ? "guide-in-progress" : "empty-guide",
        cue: `${completed}/${checkpoints.length} field guide entries complete`
      });
    }
  });
}

export function createTinyDiffusionDatasetExpeditionRendererHandoffKit() {
  return Object.freeze({
    id: "tiny-diffusion-dataset-expedition-renderer-handoff-kit",
    createHandoff(descriptorBuckets = {}) {
      const descriptors = Object.values(descriptorBuckets).flatMap((bucket) => Array.isArray(bucket) ? bucket : [bucket]).filter(Boolean);
      return makeDescriptor("renderer-handoff", {
        id: "tiny-diffusion-dataset-expedition-renderer-handoff",
        policy: "renderer-consumes-descriptors-only",
        descriptorCount: descriptors.length,
        descriptors,
        buckets: Object.keys(descriptorBuckets),
        forbiddenOwnership: TINY_DIFFUSION_DATASET_EXPEDITION_FORBIDDEN_OWNERSHIP
      });
    }
  });
}

export function createTinyDiffusionDatasetExpeditionReadinessDomainKit(options = {}) {
  const seedCartography = options.seedCartography ?? createTinyDiffusionSeedCartographyKit();
  const classBalance = options.classBalance ?? createTinyDiffusionClassBalanceKit();
  const curriculumRoute = options.curriculumRoute ?? createTinyDiffusionCurriculumRouteKit();
  const noiseWeather = options.noiseWeather ?? createTinyDiffusionNoiseWeatherKit();
  const provenanceTicket = options.provenanceTicket ?? createTinyDiffusionProvenanceTicketKit();
  const fieldGuideLedger = options.fieldGuideLedger ?? createTinyDiffusionFieldGuideLedgerKit();
  const rendererHandoff = options.rendererHandoff ?? createTinyDiffusionDatasetExpeditionRendererHandoffKit();

  function evaluate(input = {}) {
    const descriptors = Object.freeze({
      seedCartography: seedCartography.evaluate(input),
      classBalance: classBalance.evaluate(input),
      curriculumRoute: curriculumRoute.evaluate(input),
      noiseWeather: noiseWeather.evaluate(input),
      provenanceTicket: provenanceTicket.evaluate(input),
      fieldGuideLedger: fieldGuideLedger.evaluate(input)
    });
    const readinessScore = round(clamp01([
      descriptors.seedCartography.coverageScore,
      descriptors.classBalance.balanceScore,
      descriptors.curriculumRoute.curriculumScore,
      descriptors.noiseWeather.weatherScore,
      descriptors.provenanceTicket.ticketScore,
      descriptors.fieldGuideLedger.guideScore
    ].reduce((sum, value) => sum + finite(value), 0) / 6));
    return Object.freeze({
      id: "tiny-diffusion-dataset-expedition-readiness",
      domainTree: TINY_DIFFUSION_DATASET_EXPEDITION_READINESS_DOMAIN_TREE,
      forbiddenOwnership: TINY_DIFFUSION_DATASET_EXPEDITION_FORBIDDEN_OWNERSHIP,
      readinessScore,
      status: readinessScore >= 0.74 ? "expedition-ready" : readinessScore >= 0.42 ? "route-in-progress" : "waiting-for-seeds",
      descriptors,
      rendererHandoff: rendererHandoff.createHandoff(descriptors)
    });
  }

  return Object.freeze({
    id: "tiny-diffusion-dataset-expedition-readiness-domain-kit",
    tree: TINY_DIFFUSION_DATASET_EXPEDITION_READINESS_DOMAIN_TREE,
    forbiddenOwnership: TINY_DIFFUSION_DATASET_EXPEDITION_FORBIDDEN_OWNERSHIP,
    kits: Object.freeze([seedCartography, classBalance, curriculumRoute, noiseWeather, provenanceTicket, fieldGuideLedger, rendererHandoff]),
    evaluate
  });
}
