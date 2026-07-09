export const TINY_DIFFUSION_TRAINING_MISSION_READINESS_DOMAIN_TREE = Object.freeze({
  id: "tiny-diffusion-training-mission-readiness-domain",
  split: {
    datasetPreparation: {
      sampleBalance: ["tiny-diffusion-dataset-curation-kit"],
      promptSeed: ["tiny-diffusion-prompt-seed-bank-kit"]
    },
    denoiseCurriculum: {
      noiseSchedule: ["tiny-diffusion-noise-curriculum-kit"],
      trainingSentry: ["tiny-diffusion-training-sentry-kit"]
    },
    outputStewardship: {
      sampleTriage: ["tiny-diffusion-sample-triage-kit"],
      checkpointAudit: ["tiny-diffusion-checkpoint-audit-kit"]
    },
    rendererHandoff: ["tiny-diffusion-training-mission-renderer-handoff-kit"]
  }
});

export const TINY_DIFFUSION_TRAINING_MISSION_FORBIDDEN_OWNERSHIP = Object.freeze([
  "renderer",
  "dom",
  "browser-input",
  "three-js",
  "webgl",
  "audio",
  "asset-loading",
  "frame-loop",
  "diffusion-backend"
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

function makeDescriptor(kind, fields) {
  return Object.freeze({ kind, ...fields });
}

export function createTinyDiffusionDatasetCurationKit() {
  return Object.freeze({
    id: "tiny-diffusion-dataset-curation-kit",
    evaluate(input = {}) {
      const sampleCount = Math.max(0, Math.round(finite(input.sampleCount, 0)));
      const classSpread = clamp01(input.classSpread ?? sampleCount / 24);
      const prepared = Boolean(input.prepared) || sampleCount > 0;
      const balanceScore = round(clamp01((sampleCount / 24) * 0.58 + classSpread * 0.42));
      return makeDescriptor("dataset-curation", {
        prepared,
        sampleCount,
        classSpread: round(classSpread),
        balanceScore,
        status: prepared ? (balanceScore >= 0.72 ? "balanced" : "thin") : "empty",
        cue: prepared ? `${sampleCount} samples staged for denoise rehearsal` : "prepare dataset before training"
      });
    }
  });
}

export function createTinyDiffusionPromptSeedBankKit() {
  return Object.freeze({
    id: "tiny-diffusion-prompt-seed-bank-kit",
    evaluate(input = {}) {
      const seeds = safeList(input.seeds).map((seed, index) => ({
        id: `seed-${index + 1}`,
        value: String(seed),
        priority: round(1 - index * 0.08)
      }));
      const fallbackSeeds = ["ring", "spiral", "bar", "dot"].slice(0, Math.max(1, Math.min(4, Math.round(finite(input.sampleCount, 4) / 6))));
      const seedDescriptors = seeds.length > 0 ? seeds : fallbackSeeds.map((value, index) => ({ id: `seed-${index + 1}`, value, priority: round(0.9 - index * 0.1) }));
      return makeDescriptor("prompt-seed-bank", {
        seeds: seedDescriptors,
        count: seedDescriptors.length,
        cue: seedDescriptors.length >= 4 ? "seed bank has enough variation" : "add more procedural seeds"
      });
    }
  });
}

export function createTinyDiffusionNoiseCurriculumKit() {
  return Object.freeze({
    id: "tiny-diffusion-noise-curriculum-kit",
    evaluate(input = {}) {
      const timesteps = Math.max(1, Math.round(finite(input.timesteps, 8)));
      const previewedSteps = Math.max(0, Math.round(finite(input.previewedSteps, 0)));
      const coverage = round(clamp01(previewedSteps / timesteps));
      const stage = coverage >= 0.75 ? "full-ladder" : coverage >= 0.35 ? "partial-ladder" : "unproven-ladder";
      return makeDescriptor("noise-curriculum", {
        timesteps,
        previewedSteps,
        coverage,
        stage,
        cue: `noise ladder ${Math.round(coverage * 100)}% previewed`
      });
    }
  });
}

export function createTinyDiffusionTrainingSentryKit() {
  return Object.freeze({
    id: "tiny-diffusion-training-sentry-kit",
    evaluate(input = {}) {
      const epochs = Math.max(0, Math.round(finite(input.epochs, 0)));
      const steps = Math.max(0, Math.round(finite(input.steps, 0)));
      const latestLoss = finite(input.latestLoss, 1);
      const lossScore = round(clamp01(1 - latestLoss));
      const trainingScore = round(clamp01(epochs / 12 * 0.48 + steps / 96 * 0.32 + lossScore * 0.2));
      return makeDescriptor("training-sentry", {
        epochs,
        steps,
        latestLoss: round(latestLoss, 5),
        trainingScore,
        status: trainingScore >= 0.75 ? "stable" : trainingScore >= 0.35 ? "warming" : "cold-start",
        cue: epochs > 0 ? `${epochs} epochs watched; loss ${round(latestLoss, 5)}` : "train at least one epoch"
      });
    }
  });
}

export function createTinyDiffusionSampleTriageKit() {
  return Object.freeze({
    id: "tiny-diffusion-sample-triage-kit",
    evaluate(input = {}) {
      const frames = Math.max(0, Math.round(finite(input.frames, 0)));
      const finalReady = Boolean(input.finalReady);
      const clarity = clamp01(input.clarity ?? (finalReady ? 0.62 : 0.18));
      const reviewScore = round(clamp01(frames / 8 * 0.5 + clarity * 0.5));
      return makeDescriptor("sample-triage", {
        frames,
        finalReady,
        clarity: round(clarity),
        reviewScore,
        status: finalReady && reviewScore >= 0.58 ? "reviewable" : "needs-sample",
        cue: finalReady ? `${frames} denoise frames ready for visual review` : "generate a sample before triage"
      });
    }
  });
}

export function createTinyDiffusionCheckpointAuditKit() {
  return Object.freeze({
    id: "tiny-diffusion-checkpoint-audit-kit",
    evaluate(input = {}) {
      const checkpointAge = Math.max(0, Math.round(finite(input.checkpointAge, 999)));
      const steps = Math.max(0, Math.round(finite(input.steps, 0)));
      const saved = Boolean(input.saved) || checkpointAge <= Math.max(16, steps);
      const auditScore = round(clamp01((saved ? 0.66 : 0.12) + Math.min(steps, 80) / 240));
      return makeDescriptor("checkpoint-audit", {
        saved,
        checkpointAge,
        auditScore,
        status: saved ? (checkpointAge <= 16 ? "fresh" : "stale") : "missing",
        cue: saved ? `checkpoint age ${checkpointAge} steps` : "save/load checkpoint before handoff"
      });
    }
  });
}

export function createTinyDiffusionTrainingMissionRendererHandoffKit() {
  return Object.freeze({
    id: "tiny-diffusion-training-mission-renderer-handoff-kit",
    createHandoff(descriptorBuckets = {}) {
      const descriptors = Object.values(descriptorBuckets).flatMap((bucket) => Array.isArray(bucket) ? bucket : [bucket]).filter(Boolean);
      return makeDescriptor("renderer-handoff", {
        policy: "renderer-consumes-descriptors-only",
        descriptorCount: descriptors.length,
        descriptors,
        buckets: Object.keys(descriptorBuckets)
      });
    }
  });
}

export function createTinyDiffusionTrainingMissionReadinessDomainKit(options = {}) {
  const datasetCuration = options.datasetCuration ?? createTinyDiffusionDatasetCurationKit();
  const promptSeedBank = options.promptSeedBank ?? createTinyDiffusionPromptSeedBankKit();
  const noiseCurriculum = options.noiseCurriculum ?? createTinyDiffusionNoiseCurriculumKit();
  const trainingSentry = options.trainingSentry ?? createTinyDiffusionTrainingSentryKit();
  const sampleTriage = options.sampleTriage ?? createTinyDiffusionSampleTriageKit();
  const checkpointAudit = options.checkpointAudit ?? createTinyDiffusionCheckpointAuditKit();
  const rendererHandoff = options.rendererHandoff ?? createTinyDiffusionTrainingMissionRendererHandoffKit();

  function evaluate(input = {}) {
    const descriptors = Object.freeze({
      datasetCuration: datasetCuration.evaluate(input),
      promptSeedBank: promptSeedBank.evaluate(input),
      noiseCurriculum: noiseCurriculum.evaluate(input),
      trainingSentry: trainingSentry.evaluate(input),
      sampleTriage: sampleTriage.evaluate(input),
      checkpointAudit: checkpointAudit.evaluate(input)
    });
    const readinessScore = round(clamp01([
      descriptors.datasetCuration.balanceScore,
      descriptors.noiseCurriculum.coverage,
      descriptors.trainingSentry.trainingScore,
      descriptors.sampleTriage.reviewScore,
      descriptors.checkpointAudit.auditScore
    ].reduce((sum, value) => sum + finite(value), 0) / 5));
    const handoff = rendererHandoff.createHandoff(descriptors);
    return Object.freeze({
      id: "tiny-diffusion-training-mission-readiness",
      domainTree: TINY_DIFFUSION_TRAINING_MISSION_READINESS_DOMAIN_TREE,
      forbiddenOwnership: TINY_DIFFUSION_TRAINING_MISSION_FORBIDDEN_OWNERSHIP,
      readinessScore,
      status: readinessScore >= 0.75 ? "mission-ready" : readinessScore >= 0.42 ? "needs-more-training" : "cold-start",
      descriptors,
      rendererHandoff: handoff
    });
  }

  return Object.freeze({
    id: "tiny-diffusion-training-mission-readiness-domain-kit",
    tree: TINY_DIFFUSION_TRAINING_MISSION_READINESS_DOMAIN_TREE,
    forbiddenOwnership: TINY_DIFFUSION_TRAINING_MISSION_FORBIDDEN_OWNERSHIP,
    kits: Object.freeze([datasetCuration, promptSeedBank, noiseCurriculum, trainingSentry, sampleTriage, checkpointAudit, rendererHandoff]),
    evaluate
  });
}
