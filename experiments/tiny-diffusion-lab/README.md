# Tiny Diffusion Lab

Tiny Diffusion Lab is a browser-host validation route for the Nexus Engine diffusion module.

It imports `createNexusDiffusionKits()` from the Nexus Engine `main` CDN entrypoint, installs the composed diffusion domain into a realtime engine, and renders only descriptor/output state:

- procedural dataset samples;
- forward noise schedule preview;
- CPU/WebGPU backend status;
- training epochs, steps, and latest loss;
- DDPM-like denoising frames;
- final generated pixels;
- memory checkpoint save/load proof.

## Boundary

Reusable diffusion behavior belongs in `LuminaryLabs-Dev/NexusEngine` under `src/modules/nexus-diffusion/`.

This experiment owns only browser presentation and button intent. It should not grow its own tensor math, dataset training logic, sampler implementation, checkpoint implementation, or model weights outside the Nexus Engine domain API.

## Manual smoke

1. Open `experiments/tiny-diffusion-lab/`.
2. Confirm the page prepares with the CPU backend.
3. Click **Train 1 epoch** and verify the step count/loss update.
4. Click **Generate sample** and verify denoising frames and a final pixel image appear.
5. Click **Save/load checkpoint** and verify the log reports a restored checkpoint.
