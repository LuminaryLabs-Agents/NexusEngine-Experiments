import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTinyDiffusionLatentMuseumCuratorReadinessDomainKit } from "../experiments/tiny-diffusion-lab/kits/tiny-diffusion-latent-museum-curator-readiness-domain-kit.js";

const entrySource = readFileSync(new URL("../experiments/tiny-diffusion-lab/app/latent-museum-curator-readiness-entry.js", import.meta.url), "utf8");
const routeSource = readFileSync(new URL("../experiments/tiny-diffusion-lab/index.html", import.meta.url), "utf8");
const kitSource = readFileSync(new URL("../experiments/tiny-diffusion-lab/kits/tiny-diffusion-latent-museum-curator-readiness-domain-kit.js", import.meta.url), "utf8");

assert.ok(entrySource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "entry imports NexusEngine main CDN");
assert.ok(!entrySource.includes("NexusRealtime@"), "changed entry does not import old NexusRealtime CDN");
assert.ok(routeSource.includes("latent-museum-curator-readiness-renderer-handoff-pass"), "route advertises latent museum pass");
assert.ok(routeSource.includes("latent-museum-curator-readiness-entry.js"), "route loads latent museum entry");
assert.ok(entrySource.includes("getTinyDiffusionLatentMuseumCuratorReadiness"), "GameHost-style accessor exposed");
assert.ok(entrySource.includes("getRendererHandoff"), "renderer handoff composed");
for (const forbidden of ["document.", "addEventListener", "requestAnimationFrame", "new THREE", "THREE.", "getContext(\"webgl", "new Audio", "fetch(", "localStorage"]) {
  assert.ok(!kitSource.includes(forbidden), `kit source excludes ${forbidden}`);
}

const domain = createTinyDiffusionLatentMuseumCuratorReadinessDomainKit();
let host = {
  preview: {
    datasetSamples: [],
    noiseSteps: [],
    denoiseFrames: [],
    finalImage: { pixels: [] },
    metrics: { epochs: 0, steps: 0, latestLoss: 1 }
  },
  saved: false,
  checkpointAge: 999
};

const actions = ["prepare", "prepare", "noise", "train", "generate", "train", "generate", "checkpoint", "train", "curate"];

function px(seed) {
  return Array.from({ length: 256 }, (_, index) => {
    const value = Math.sin((index + 1) * 7.17 + seed * 33.1) * 10000;
    return value - Math.floor(value);
  });
}

for (const [index, action] of actions.entries()) {
  if (action === "prepare") {
    host.preview.datasetSamples.push({ id: `sample-${index}`, label: `glyph-${index}` });
    host.preview.noiseSteps = Array.from({ length: Math.min(8, host.preview.datasetSamples.length + 3) }, (_, step) => ({ timestep: step, amount: step / 7 }));
  }
  if (action === "noise") {
    host.preview.noiseSteps = Array.from({ length: 8 }, (_, step) => ({ timestep: step, amount: step / 7 }));
  }
  if (action === "train") {
    host.preview.metrics.epochs += 3;
    host.preview.metrics.steps += 24;
    host.preview.metrics.latestLoss = Math.max(0.08, host.preview.metrics.latestLoss - 0.2);
  }
  if (action === "generate") {
    host.preview.denoiseFrames = Array.from({ length: 8 }, (_, frame) => ({ timestep: frame, pixels: px(frame + index) }));
    host.preview.finalImage = { width: 16, height: 16, pixels: px(index) };
  }
  if (action === "checkpoint") {
    host.saved = true;
    host.checkpointAge = 0;
  } else {
    host.checkpointAge += 1;
  }

  const readiness = domain.evaluate({
    datasetSamples: host.preview.datasetSamples,
    sampleCount: host.preview.datasetSamples.length,
    seeds: host.preview.datasetSamples.map((sample) => sample.label),
    noiseSteps: host.preview.noiseSteps,
    denoiseFrames: host.preview.denoiseFrames,
    frames: host.preview.denoiseFrames.length,
    finalReady: host.preview.finalImage.pixels.length > 0,
    finalPixels: host.preview.finalImage.pixels,
    width: host.preview.finalImage.width ?? 16,
    height: host.preview.finalImage.height ?? 16,
    epochs: host.preview.metrics.epochs,
    steps: host.preview.metrics.steps,
    latestLoss: host.preview.metrics.latestLoss,
    saved: host.saved,
    checkpointAge: host.checkpointAge
  });
  assert.ok(readiness.readinessScore >= 0 && readiness.readinessScore <= 1, `step ${index} bounded`);
  assert.equal(readiness.rendererHandoff.descriptorCount, 6, `step ${index} descriptor count`);
  if (index === actions.length - 1) {
    assert.ok(readiness.readinessScore > 0.72, "final simulated route is exhibition ready enough");
    assert.ok(["curator-review", "exhibition-ready"].includes(readiness.status));
  }
}

console.log("Tiny diffusion latent museum curator CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
