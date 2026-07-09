const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const CONFIG = Object.freeze({ imageSize: 16, channels: 1, timesteps: 8 });

const ui = {
  backend: document.getElementById("backend"),
  epochs: document.getElementById("epochs"),
  steps: document.getElementById("steps"),
  loss: document.getElementById("loss"),
  dataset: document.getElementById("dataset"),
  noise: document.getElementById("noise"),
  frames: document.getElementById("frames"),
  final: document.getElementById("final"),
  log: document.getElementById("log"),
  buttons: Array.from(document.querySelectorAll("button"))
};

let engine = null;
let preview = null;
let lastError = null;
let busy = false;

function setBusy(nextBusy) {
  busy = nextBusy;
  for (const button of ui.buttons) button.disabled = busy;
}

function log(message, tone = "") {
  ui.log.innerHTML = `<span class="${tone}">${String(message).replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</span>`;
}

function formatLoss(value) {
  return Number.isFinite(value) ? value.toFixed(5) : "—";
}

function deterministicNoise(index, salt = 0) {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function drawPixels(canvas, pixels = [], width = CONFIG.imageSize, height = CONFIG.imageSize) {
  const context = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  const image = context.createImageData(width, height);
  for (let index = 0; index < width * height; index += 1) {
    const value = Math.max(0, Math.min(1, Number(pixels[index]) || 0));
    const shade = Math.round(value * 255);
    image.data[index * 4 + 0] = shade;
    image.data[index * 4 + 1] = shade;
    image.data[index * 4 + 2] = shade;
    image.data[index * 4 + 3] = 255;
  }
  context.putImageData(image, 0, 0);
}

function createFrameCanvas(label, pixels, width = CONFIG.imageSize, height = CONFIG.imageSize) {
  const wrapper = document.createElement("div");
  wrapper.className = "frame";
  const canvas = document.createElement("canvas");
  canvas.className = "pixel";
  canvas.width = width;
  canvas.height = height;
  drawPixels(canvas, pixels, width, height);
  const caption = document.createElement("span");
  caption.textContent = label;
  wrapper.append(canvas, caption);
  return wrapper;
}

function renderDataset(samples = []) {
  ui.dataset.replaceChildren(...samples.slice(0, 6).map((sample) => createFrameCanvas(sample.label ?? sample.id, sample.pixels, sample.width, sample.height)));
}

function renderNoise(previewState) {
  const base = previewState.datasetSamples?.[0];
  if (!base) {
    ui.noise.replaceChildren();
    return;
  }
  const nodes = previewState.noiseSteps.map((step) => {
    const pixels = base.pixels.map((pixel, index) => pixel * (1 - step.amount) + deterministicNoise(index, step.timestep) * step.amount);
    return createFrameCanvas(`t=${step.timestep}`, pixels, base.width, base.height);
  });
  ui.noise.replaceChildren(...nodes);
}

function renderFrames(frames = []) {
  ui.frames.replaceChildren(...frames.slice(-8).map((frame) => createFrameCanvas(`t=${frame.timestep}`, frame.pixels, CONFIG.imageSize, CONFIG.imageSize)));
}

function renderPreview() {
  if (!engine) return;
  preview = engine.n.diffusion.getPreviewState();
  const status = engine.n.diffusion.getStatus();
  ui.backend.textContent = preview.backend.selected;
  ui.epochs.textContent = String(preview.metrics.epochs ?? 0);
  ui.steps.textContent = String(preview.metrics.steps ?? 0);
  ui.loss.textContent = formatLoss(preview.metrics.latestLoss);
  renderDataset(preview.datasetSamples);
  renderNoise(preview);
  renderFrames(preview.denoiseFrames);
  if (preview.finalImage?.pixels) drawPixels(ui.final, preview.finalImage.pixels, preview.finalImage.width, preview.finalImage.height);
  globalThis.TinyDiffusionLabState = { engine, preview, status, lastError };
}

async function withBusy(label, task) {
  try {
    setBusy(true);
    log(label);
    const result = await task();
    renderPreview();
    return result;
  } catch (error) {
    lastError = error;
    console.error(error);
    log(error?.stack ?? error?.message ?? String(error), "danger");
    throw error;
  } finally {
    setBusy(false);
  }
}

async function prepare() {
  return withBusy("Preparing diffusion domain…", async () => {
    const prepared = engine.n.diffusion.prepare();
    log(`Prepared ${prepared.datasetDescriptor.sampleCount} samples with ${prepared.backend} backend.`, "ok");
    return prepared;
  });
}

async function train(epochs) {
  return withBusy(`Training ${epochs} epoch${epochs === 1 ? "" : "s"}…`, async () => {
    const result = engine.n.diffusion.train({ epochs, batchSize: 8, learningRate: 0.02, seed: 100 + (engine.n.diffusion.getStatus().metrics.steps ?? 0) });
    log(`Trained ${epochs} epoch${epochs === 1 ? "" : "s"}; latest loss ${formatLoss(result.metrics.latestLoss)}.`, "ok");
    return result;
  });
}

async function generate() {
  return withBusy("Sampling from noise…", async () => {
    const result = engine.n.diffusion.sample({ seed: Date.now() % 100000, steps: 8 });
    log(`Generated ${result.frames.length} denoising frames from seeded noise.`, "ok");
    return result;
  });
}

async function checkpointRoundTrip() {
  return withBusy("Saving and restoring memory checkpoint…", async () => {
    const saved = engine.n.diffusion.saveCheckpoint("tiny-diffusion-lab");
    const loaded = engine.n.diffusion.loadCheckpoint("tiny-diffusion-lab");
    log(`Checkpoint ${saved.descriptor.id} restored at ${loaded.descriptor.steps} training steps.`, "ok");
    return loaded;
  });
}

async function reset() {
  return withBusy("Resetting tiny diffusion lab…", async () => {
    engine.n.diffusion.reset();
    engine.n.diffusion.prepare();
    drawPixels(ui.final, [], CONFIG.imageSize, CONFIG.imageSize);
    log("Reset and prepared a fresh tiny denoiser.", "ok");
  });
}

async function boot() {
  try {
    setBusy(true);
    const NexusEngine = await import(NEXUS_ENGINE_CDN);
    const createRuntimeEngine = NexusEngine.createRealtimeGame ?? NexusEngine.createRealtimeEngine ?? NexusEngine.createEngine;
    if (typeof createRuntimeEngine !== "function") throw new TypeError("Nexus Engine runtime factory was not found.");
    if (typeof NexusEngine.createNexusDiffusionKits !== "function") throw new TypeError("createNexusDiffusionKits was not exported by Nexus Engine.");
    engine = createRuntimeEngine({ kits: NexusEngine.createNexusDiffusionKits(CONFIG) });
    globalThis.TinyDiffusionLab = { prepare, train, generate, reset, checkpointRoundTrip, getState: () => globalThis.TinyDiffusionLabState };
    await prepare();
  } catch (error) {
    lastError = error;
    console.error(error);
    log(`Failed to load Tiny Diffusion Lab: ${error?.message ?? error}`, "danger");
  } finally {
    setBusy(false);
  }
}

document.getElementById("prepare").addEventListener("click", () => prepare());
document.getElementById("trainOne").addEventListener("click", () => train(1));
document.getElementById("trainTen").addEventListener("click", () => train(10));
document.getElementById("generate").addEventListener("click", () => generate());
document.getElementById("checkpoint").addEventListener("click", () => checkpointRoundTrip());
document.getElementById("reset").addEventListener("click", () => reset());

boot();
