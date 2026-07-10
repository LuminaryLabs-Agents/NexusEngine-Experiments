import { createNexusEngine } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  LATENT_GARDEN_POLLINATION_DOMAIN_TREE,
  LATENT_GARDEN_POLLINATION_PASS_ID,
  createLatentGardenPollinationReadiness
} from "./latent-garden-pollination-readiness-kits.js";

const engine = createNexusEngine?.({
  name: "tiny-diffusion-latent-garden-pollination",
  version: "0.0.1",
  source: "NexusEngine main CDN"
});

const root = document.querySelector("#latentGardenPollinationReadiness");
const app = document.querySelector("#app");

const readLabState = () => {
  const lab = globalThis.TinyDiffusionLab ?? globalThis.GameHost ?? {};
  const state = typeof lab.getState === "function" ? lab.getState() : {};
  return {
    seed: state.seed ?? state.prompt ?? document.querySelector("#log")?.textContent ?? "tiny-diffusion-lab",
    prompt: state.prompt ?? state.selectedPrompt ?? "lantern moths in a tiny latent garden",
    selectedPrompt: state.selectedPrompt ?? state.prompt ?? "latent garden",
    epochs: state.epochs ?? state.epoch ?? Number(document.querySelector("#epochs")?.textContent ?? 0),
    steps: state.steps ?? Number(document.querySelector("#steps")?.textContent ?? 0),
    samples: state.samples?.length ?? state.sampleCount ?? 4,
    denoiseSteps: state.denoiseSteps ?? state.steps ?? 12,
    loss: Number(state.loss ?? document.querySelector("#loss")?.textContent ?? 0.8),
    checkpointAge: state.checkpointAge ?? 12,
    paletteDiversity: state.paletteDiversity ?? 0.52,
    artifactRate: state.artifactRate ?? (Number(state.loss ?? 0.75) > 0.65 ? 0.48 : 0.28),
    prepared: state.prepared ?? true
  };
};

const getReadiness = () => createLatentGardenPollinationReadiness(readLabState());

const render = () => {
  if (!root) return;
  const readiness = getReadiness();
  const pct = Math.round(readiness.readiness * 100);
  const pressure = Math.round(readiness.artifactPressure * 100);
  const groups = readiness.rendererHandoff.descriptors.reduce((acc, descriptor) => {
    acc[descriptor.type] = (acc[descriptor.type] ?? 0) + 1;
    return acc;
  }, {});
  root.innerHTML = `
    <div class="metric"><span>Garden readiness</span><strong>${pct}%</strong></div>
    <div class="metric"><span>Artifact pressure</span><strong>${pressure}%</strong></div>
    <div class="metric"><span>Mission state</span><strong>${readiness.missionState}</strong></div>
    <div class="metric"><span>Descriptors</span><strong>${readiness.descriptorCount}</strong></div>
    <div class="mission-list">
      ${Object.entries(groups).map(([type, count]) => `<p><b>${type}</b><br><span>${count} descriptor${count === 1 ? "" : "s"}</span></p>`).join("")}
    </div>
  `;
};

const installHostPatch = () => {
  const host = globalThis.TinyDiffusionLab ?? globalThis.GameHost ?? (globalThis.GameHost = {});
  const priorHandoff = typeof host.getRendererHandoff === "function" ? host.getRendererHandoff.bind(host) : null;
  host.getLatentGardenPollinationReadiness = getReadiness;
  host.getTinyDiffusionLatentGardenPollinationReadiness = getReadiness;
  host.getLatentGardenPollinationTree = () => LATENT_GARDEN_POLLINATION_DOMAIN_TREE;
  host.getRendererHandoff = () => {
    const previous = priorHandoff?.() ?? {};
    const readiness = getReadiness();
    return {
      ...previous,
      engine,
      passes: [...(Array.isArray(previous.passes) ? previous.passes : []), LATENT_GARDEN_POLLINATION_PASS_ID],
      latentGardenPollination: readiness.rendererHandoff,
      descriptors: [
        ...(Array.isArray(previous.descriptors) ? previous.descriptors : []),
        ...readiness.rendererHandoff.descriptors
      ]
    };
  };
};

installHostPatch();
render();
globalThis.addEventListener?.("tiny-diffusion-state-change", render);
setInterval(render, 1800);

if (app) {
  const upgrades = new Set(String(app.dataset.upgrade ?? "").split(/\s+/).filter(Boolean));
  upgrades.add(LATENT_GARDEN_POLLINATION_PASS_ID);
  app.dataset.upgrade = [...upgrades].join(" ");
}

console.info(`${LATENT_GARDEN_POLLINATION_PASS_ID} ready`);
