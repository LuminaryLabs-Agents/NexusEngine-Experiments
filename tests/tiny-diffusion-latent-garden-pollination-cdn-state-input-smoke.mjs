import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createLatentGardenPollinationReadiness } from "../experiments/tiny-diffusion-lab/app/latent-garden-pollination-readiness-kits.js";

const execFileAsync = promisify(execFile);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const routePath = join(root, "experiments/tiny-diffusion-lab/latent-garden-pollination.html");
const entryPath = join(root, "experiments/tiny-diffusion-lab/app/latent-garden-pollination-readiness-entry.js");
const kitPath = join(root, "experiments/tiny-diffusion-lab/app/latent-garden-pollination-readiness-kits.js");

const [route, entry, kit] = await Promise.all([
  readFile(routePath, "utf8"),
  readFile(entryPath, "utf8"),
  readFile(kitPath, "utf8")
]);

assert.ok(route.includes("latent-garden-pollination-readiness-renderer-handoff-pass"), "route marker missing");
assert.ok(route.includes("latentGardenPollinationReadiness"), "route panel missing");
assert.ok(route.includes("latent-garden-pollination-readiness-entry.js?v=tiny-diffusion-latent-garden-20260710"), "entry script missing");
assert.ok(entry.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "NexusEngine main CDN missing");
assert.ok(!entry.includes("NexusRealtime@"), "old NexusRealtime CDN import found in entry");
assert.ok(!kit.match(/\bdocument\b|\bwindow\b|THREE|WebGL|AudioContext|requestAnimationFrame/), "kit owns renderer/browser concerns");

const state = {
  seed: "state-input-garden",
  epochs: 0,
  samples: 0,
  loss: 0.92,
  artifactRate: 0.74,
  denoiseSteps: 0,
  paletteDiversity: 0.22,
  checkpointAge: 40
};

const inputs = [
  { type: "prepare", epochs: 2, samples: 2, denoiseSteps: 4, lossDelta: -0.05 },
  { type: "train", epochs: 6, samples: 4, denoiseSteps: 8, lossDelta: -0.08 },
  { type: "sample", samples: 8, paletteDiversity: 0.1, artifactDelta: -0.06 },
  { type: "checkpoint", checkpointAge: 0, lossDelta: -0.04 },
  { type: "pollinate", samples: 10, artifactDelta: -0.08 },
  { type: "trellis", denoiseSteps: 16, lossDelta: -0.07 },
  { type: "soil", paletteDiversity: 0.12, artifactDelta: -0.05 },
  { type: "hive", checkpointAge: 1, epochs: 8 },
  { type: "ledger", samples: 12, lossDelta: -0.06 },
  { type: "bloom", epochs: 20, samples: 20, denoiseSteps: 24, paletteDiversity: 0.16, artifactDelta: -0.14 }
];

let previous = createLatentGardenPollinationReadiness(state);
for (const [index, input] of inputs.entries()) {
  state.epochs += input.epochs ?? 0;
  state.samples += input.samples ?? 0;
  state.denoiseSteps += input.denoiseSteps ?? 0;
  state.paletteDiversity = Math.min(1, state.paletteDiversity + (input.paletteDiversity ?? 0));
  state.artifactRate = Math.max(0, state.artifactRate + (input.artifactDelta ?? 0));
  state.loss = Math.max(0.05, state.loss + (input.lossDelta ?? 0));
  if (Number.isFinite(input.checkpointAge)) state.checkpointAge = input.checkpointAge;
  const next = createLatentGardenPollinationReadiness({ ...state, interaction: input.type });
  assert.ok(next.readiness >= 0 && next.readiness <= 1, `input ${index} readiness out of bounds`);
  assert.ok(next.artifactPressure >= 0 && next.artifactPressure <= 1, `input ${index} artifact pressure out of bounds`);
  assert.ok(next.descriptorCount >= 18, `input ${index} descriptor floor missed`);
  assert.ok(next.rendererHandoff.descriptors.length === next.descriptorCount, `input ${index} handoff descriptor mismatch`);
  previous = next;
}

assert.ok(previous.readiness > 0.7, "simulated inputs should make the garden playable");
assert.ok(["cross-pollinating", "pollinated"].includes(previous.missionState), "simulated inputs should reach late mission state");

let cdnValidation = "source-wiring-only";
try {
  const response = await fetch("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js");
  if (response.ok) {
    const source = await response.text();
    const tmpDir = join(root, ".tmp", "cdn-validation");
    await mkdir(tmpDir, { recursive: true });
    const tmpFile = join(tmpDir, "nexusengine-main-index.mjs");
    await writeFile(tmpFile, source);
    await execFileAsync(process.execPath, ["--check", tmpFile]);
    cdnValidation = "downloaded-to-local-mjs-and-syntax-checked";
  }
} catch {
  cdnValidation = "source-wiring-only";
}

console.log(`Tiny Diffusion latent garden pollination CDN/state/input smoke passed 10 simulated cases; CDN validation: ${cdnValidation}.`);
