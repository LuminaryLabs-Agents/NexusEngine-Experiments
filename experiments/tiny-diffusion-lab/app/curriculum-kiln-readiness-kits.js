const DOMAIN_ID = "tiny-diffusion-curriculum-kiln-readiness-domain";

const DOMAIN_TREE = Object.freeze({
  id: DOMAIN_ID,
  owns: "renderer-neutral curriculum descriptors for tiny diffusion training progression",
  excludes: Object.freeze([
    "renderer",
    "dom",
    "browser-input",
    "three-js",
    "webgl",
    "audio",
    "asset-loading",
    "frame-loop",
    "model-training",
    "model-inference",
    "storage",
    "network"
  ]),
  children: Object.freeze([
    {
      id: "curriculum-forge-domain",
      children: Object.freeze([
        { id: "seed-tile-domain", kit: "tiny-diffusion-seed-tile-sampler-kit" },
        { id: "noise-ramp-domain", kit: "tiny-diffusion-noise-ramp-ladder-kit" }
      ])
    },
    {
      id: "quality-gate-domain",
      children: Object.freeze([
        { id: "overfit-sentinel-domain", kit: "tiny-diffusion-overfit-sentinel-kit" },
        { id: "artifact-triage-domain", kit: "tiny-diffusion-artifact-triage-tray-kit" }
      ])
    },
    {
      id: "export-handoff-domain",
      children: Object.freeze([
        { id: "checkpoint-sigil-domain", kit: "tiny-diffusion-checkpoint-sigil-kit" },
        { id: "curriculum-ledger-domain", kit: "tiny-diffusion-curriculum-ledger-kit" }
      ])
    },
    {
      id: "renderer-handoff",
      kit: "tiny-diffusion-curriculum-kiln-renderer-handoff-kit",
      rule: "renderer consumes descriptors only"
    }
  ])
});

const KIT_NAMES = Object.freeze([
  "tiny-diffusion-seed-tile-sampler-kit",
  "tiny-diffusion-noise-ramp-ladder-kit",
  "tiny-diffusion-overfit-sentinel-kit",
  "tiny-diffusion-artifact-triage-tray-kit",
  "tiny-diffusion-checkpoint-sigil-kit",
  "tiny-diffusion-curriculum-ledger-kit",
  "tiny-diffusion-curriculum-kiln-renderer-handoff-kit"
]);

function clamp01(value) {
  if (!Number.isFinite(Number(value))) return 0;
  return Math.max(0, Math.min(1, Number(value)));
}

function clampInt(value, min = 0, max = 999999) {
  if (!Number.isFinite(Number(value))) return min;
  return Math.max(min, Math.min(max, Math.round(Number(value))));
}

function labelForIndex(prefix, index) {
  return `${prefix}-${String(index + 1).padStart(2, "0")}`;
}

function normalizedInput(input = {}) {
  const metrics = input.metrics ?? input.preview?.metrics ?? {};
  const epochs = clampInt(input.epochs ?? metrics.epochs, 0, 9999);
  const steps = clampInt(input.steps ?? metrics.steps, 0, 999999);
  const latestLoss = Number.isFinite(Number(input.latestLoss ?? metrics.latestLoss)) ? Number(input.latestLoss ?? metrics.latestLoss) : null;
  const datasetCount = clampInt(input.datasetCount ?? input.preview?.datasetSamples?.length ?? input.datasetSamples?.length, 0, 999);
  const generatedFrames = clampInt(input.generatedFrames ?? input.preview?.denoiseFrames?.length ?? input.denoiseFrames?.length, 0, 999);
  const checkpointCount = clampInt(input.checkpointCount ?? input.checkpoints ?? input.savedCheckpoints, 0, 999);
  const sampleCount = clampInt(input.sampleCount ?? input.samples ?? input.finalImages, 0, 999);
  const seed = clampInt(input.seed ?? epochs * 17 + steps * 3 + datasetCount * 29 + generatedFrames * 7, 0, 999999);
  return { epochs, steps, latestLoss, datasetCount, generatedFrames, checkpointCount, sampleCount, seed };
}

function createSeedTileSamplerKit(input = {}) {
  const state = normalizedInput(input);
  const count = Math.max(4, Math.min(12, state.datasetCount || 6));
  const tiles = Array.from({ length: count }, (_, index) => {
    const phase = ((state.seed + index * 37) % 100) / 100;
    return {
      id: labelForIndex("seed-tile", index),
      curriculumBand: index < 4 ? "foundational" : index < 8 ? "variant" : "stretch",
      x: Number((((index % 4) - 1.5) * 1.2).toFixed(2)),
      y: Number((Math.floor(index / 4) * 0.82).toFixed(2)),
      seedWeight: Number((0.42 + phase * 0.46).toFixed(3)),
      ready: state.datasetCount >= 4
    };
  });
  return { kit: "tiny-diffusion-seed-tile-sampler-kit", descriptors: tiles };
}

function createNoiseRampLadderKit(input = {}) {
  const state = normalizedInput(input);
  const maxStage = Math.max(4, Math.min(8, Math.ceil((state.steps + 1) / 4)));
  const ladders = Array.from({ length: maxStage }, (_, index) => {
    const amount = (index + 1) / maxStage;
    return {
      id: labelForIndex("noise-ramp", index),
      timestep: index + 1,
      amount: Number(amount.toFixed(3)),
      label: amount < 0.34 ? "gentle" : amount < 0.67 ? "mixed" : "hard",
      unlocked: state.epochs > index || state.steps > index * 3
    };
  });
  return { kit: "tiny-diffusion-noise-ramp-ladder-kit", descriptors: ladders };
}

function createOverfitSentinelKit(input = {}) {
  const state = normalizedInput(input);
  const hasLoss = state.latestLoss !== null;
  const lowLoss = hasLoss ? clamp01((0.24 - state.latestLoss) / 0.24) : 0;
  const smallDatasetRisk = clamp01((6 - state.datasetCount) / 6);
  const tooManyEpochsRisk = clamp01((state.epochs - 18) / 36);
  const risk = clamp01(lowLoss * 0.36 + smallDatasetRisk * 0.34 + tooManyEpochsRisk * 0.30);
  return {
    kit: "tiny-diffusion-overfit-sentinel-kit",
    descriptors: [
      {
        id: "overfit-sentinel-primary",
        risk: Number(risk.toFixed(3)),
        status: risk > 0.68 ? "intervene" : risk > 0.38 ? "watch" : "clear",
        recommendedAction: risk > 0.68 ? "add seed variants before more training" : risk > 0.38 ? "alternate train and sample" : "continue curriculum",
        loss: hasLoss ? Number(state.latestLoss.toFixed(5)) : null
      }
    ]
  };
}

function createArtifactTriageTrayKit(input = {}) {
  const state = normalizedInput(input);
  const framePressure = clamp01(state.generatedFrames / 8);
  const samplePressure = clamp01(state.sampleCount / 5);
  const defectBudget = clamp01(1 - (framePressure * 0.45 + samplePressure * 0.25 + clamp01(state.epochs / 10) * 0.30));
  const trays = ["edge-noise", "mode-collapse", "contrast-band"].map((type, index) => ({
    id: `artifact-tray-${type}`,
    type,
    severity: Number(clamp01(defectBudget + index * 0.08).toFixed(3)),
    inspected: state.generatedFrames > index * 2
  }));
  return { kit: "tiny-diffusion-artifact-triage-tray-kit", descriptors: trays };
}

function createCheckpointSigilKit(input = {}) {
  const state = normalizedInput(input);
  const sigils = Array.from({ length: Math.max(1, Math.min(4, state.checkpointCount + (state.steps > 0 ? 1 : 0))) }, (_, index) => ({
    id: labelForIndex("checkpoint-sigil", index),
    stepsCaptured: Math.max(0, state.steps - index * 4),
    stable: state.steps > 0 && state.latestLoss !== null && state.latestLoss < 0.32,
    exportable: state.steps >= 3 && state.generatedFrames >= 4
  }));
  return { kit: "tiny-diffusion-checkpoint-sigil-kit", descriptors: sigils };
}

function createCurriculumLedgerKit(input = {}) {
  const state = normalizedInput(input);
  const datasetScore = clamp01(state.datasetCount / 6);
  const trainingScore = clamp01(state.epochs / 10);
  const sampleScore = clamp01(state.generatedFrames / 8);
  const checkpointScore = clamp01((state.checkpointCount + (state.steps > 0 ? 1 : 0)) / 2);
  const readiness = clamp01(datasetScore * 0.25 + trainingScore * 0.28 + sampleScore * 0.25 + checkpointScore * 0.22);
  const phase = readiness >= 0.82 ? "export-ready" : readiness >= 0.55 ? "curating" : readiness >= 0.28 ? "training" : "booting";
  return {
    kit: "tiny-diffusion-curriculum-ledger-kit",
    descriptors: [
      {
        id: "curriculum-ledger-primary",
        readiness: Number(readiness.toFixed(3)),
        phase,
        datasetScore: Number(datasetScore.toFixed(3)),
        trainingScore: Number(trainingScore.toFixed(3)),
        sampleScore: Number(sampleScore.toFixed(3)),
        checkpointScore: Number(checkpointScore.toFixed(3)),
        next: phase === "booting" ? "prepare dataset and run one epoch" : phase === "training" ? "generate samples for triage" : phase === "curating" ? "checkpoint before export" : "package handoff"
      }
    ]
  };
}

export function createTinyDiffusionCurriculumKilnReadiness(input = {}) {
  const seedTiles = createSeedTileSamplerKit(input);
  const noiseRamps = createNoiseRampLadderKit(input);
  const overfitSentinel = createOverfitSentinelKit(input);
  const artifactTriage = createArtifactTriageTrayKit(input);
  const checkpointSigils = createCheckpointSigilKit(input);
  const curriculumLedger = createCurriculumLedgerKit(input);
  const ledger = curriculumLedger.descriptors[0];
  const risk = overfitSentinel.descriptors[0].risk;
  return {
    id: DOMAIN_ID,
    tree: DOMAIN_TREE,
    kits: KIT_NAMES,
    readiness: ledger.readiness,
    phase: ledger.phase,
    overfitRisk: risk,
    descriptors: {
      seedTiles: seedTiles.descriptors,
      noiseRamps: noiseRamps.descriptors,
      overfitSentinels: overfitSentinel.descriptors,
      artifactTriageTrays: artifactTriage.descriptors,
      checkpointSigils: checkpointSigils.descriptors,
      curriculumLedgers: curriculumLedger.descriptors
    }
  };
}

export function createTinyDiffusionCurriculumKilnRendererHandoff(input = {}) {
  const readiness = createTinyDiffusionCurriculumKilnReadiness(input);
  return {
    id: "tiny-diffusion-curriculum-kiln-renderer-handoff-kit",
    domain: DOMAIN_ID,
    consumes: "descriptors-only",
    readiness: readiness.readiness,
    phase: readiness.phase,
    overfitRisk: readiness.overfitRisk,
    descriptorGroups: readiness.descriptors
  };
}

export function getTinyDiffusionCurriculumKilnTree() {
  return DOMAIN_TREE;
}

export function getTinyDiffusionCurriculumKilnKitNames() {
  return KIT_NAMES.slice();
}

export const tinyDiffusionCurriculumKilnReadinessDomain = Object.freeze({
  id: DOMAIN_ID,
  tree: DOMAIN_TREE,
  kits: KIT_NAMES,
  createReadiness: createTinyDiffusionCurriculumKilnReadiness,
  createRendererHandoff: createTinyDiffusionCurriculumKilnRendererHandoff
});
