export const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
export const LATENT_GARDEN_POLLINATION_PASS_ID = "latent-garden-pollination-readiness-renderer-handoff-pass";
export const LATENT_GARDEN_POLLINATION_DOMAIN_TREE = `tiny-diffusion-latent-garden-pollination-readiness-domain
├─ prompt-germination-domain
│  ├─ seed-packet-domain
│  │  └─ tiny-diffusion-prompt-seed-packet-kit
│  └─ color-soil-domain
│     └─ tiny-diffusion-color-soil-bed-kit
├─ denoise-pollination-domain
│  ├─ gradient-trellis-domain
│  │  └─ tiny-diffusion-gradient-trellis-kit
│  └─ pollen-bee-domain
│     └─ variance-bloom-subdomain
│        └─ tiny-diffusion-pollen-bee-swarm-kit
├─ export-orchard-domain
│  ├─ checkpoint-hive-domain
│  │  └─ tiny-diffusion-checkpoint-hive-kit
│  └─ dawn-pollen-ledger-domain
│     └─ tiny-diffusion-dawn-pollen-ledger-kit
└─ renderer-handoff
   └─ tiny-diffusion-latent-garden-pollination-renderer-handoff-kit
      └─ renderer consumes descriptors only`;
export const LATENT_GARDEN_KIT_IDS = Object.freeze([
  "tiny-diffusion-prompt-seed-packet-kit",
  "tiny-diffusion-color-soil-bed-kit",
  "tiny-diffusion-gradient-trellis-kit",
  "tiny-diffusion-pollen-bee-swarm-kit",
  "tiny-diffusion-checkpoint-hive-kit",
  "tiny-diffusion-dawn-pollen-ledger-kit",
  "tiny-diffusion-latent-garden-pollination-renderer-handoff-kit",
  "tiny-diffusion-latent-garden-pollination-readiness-domain-kit"
]);
export const LATENT_GARDEN_OWNERSHIP_EXCLUSIONS = Object.freeze([
  "renderer", "dom", "browser-input", "threejs", "webgl", "audio", "asset-loading",
  "frame-loop", "model-training", "model-inference", "storage", "network"
]);
const clamp01 = (v) => Math.max(0, Math.min(1, Number.isFinite(Number(v)) ? Number(v) : 0));
const clampInt = (v, min, max) => Math.max(min, Math.min(max, Math.round(Number.isFinite(Number(v)) ? Number(v) : min)));
const hash = (s) => [...String(s ?? "latent-garden")].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
const unit = (seed, i) => {
  let x = (hash(seed) + Math.imul(i + 1, 2654435761)) >>> 0;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  return ((x >>> 0) % 10000) / 10000;
};
const rows = (n, make) => Array.from({ length: n }, (_, i) => make(i));
export function normalizeLatentGardenState(input = {}) {
  const seed = String(input.seed ?? input.prompt ?? "latent-garden");
  const epochs = clampInt(input.epochs ?? input.epoch ?? 0, 0, 200);
  const samples = clampInt(input.samples ?? input.sampleCount ?? 0, 0, 256);
  return {
    seed,
    selectedPrompt: String(input.selectedPrompt ?? input.prompt ?? `seed-${seed.slice(0, 12)}`),
    epochs,
    samples,
    loss: clamp01(input.loss ?? 0.92),
    paletteDiversity: clamp01(input.paletteDiversity ?? input.palette ?? (0.18 + unit(seed, 1) * 0.58)),
    denoiseSteps: clampInt(input.denoiseSteps ?? input.steps ?? 0, 0, 120),
    checkpointAge: clampInt(input.checkpointAge ?? input.checkpointMinutes ?? 18, 0, 999),
    artifactRate: clamp01(input.artifactRate ?? input.artifacts ?? 0.45),
    interaction: String(input.interaction ?? "observe"),
    prepared: Boolean(input.prepared ?? (epochs > 0 || samples > 0))
  };
}
export function createPromptSeedPacketKit(input = {}) {
  const s = normalizeLatentGardenState(input), n = Math.max(3, Math.min(10, 3 + Math.floor(s.samples / 8) + Math.floor(s.epochs / 24)));
  return { kitId: LATENT_GARDEN_KIT_IDS[0], family: "promptSeeds", readiness: clamp01(0.16 + s.epochs / 90 + s.samples / 130), descriptors: rows(n, (i) => ({ id: `prompt-seed-${i + 1}`, type: "seed-packet", label: `${s.selectedPrompt} packet ${i + 1}`, x: +(.04 + unit(s.seed, i) * .92).toFixed(3), y: +(.18 + unit(s.seed, i + 20) * .22).toFixed(3), potency: clamp01(.2 + s.epochs / 120 + s.paletteDiversity * .35) })) };
}
export function createColorSoilBedKit(input = {}) {
  const s = normalizeLatentGardenState(input), hues = ["cyan", "gold", "violet", "moss", "coral"], n = Math.max(4, Math.min(9, 4 + Math.floor(s.paletteDiversity * 5)));
  return { kitId: LATENT_GARDEN_KIT_IDS[1], family: "colorSoilBeds", readiness: clamp01(.18 + s.paletteDiversity * .62 + s.samples / 180), descriptors: rows(n, (i) => ({ id: `color-soil-bed-${i + 1}`, type: "soil-bed", hueBand: hues[i % hues.length], moisture: clamp01(.28 + s.paletteDiversity * .55 - s.artifactRate * .12 + unit(s.seed, i + 40) * .18), row: i })) };
}
export function createGradientTrellisKit(input = {}) {
  const s = normalizeLatentGardenState(input), n = Math.max(3, Math.min(8, 3 + Math.floor(s.denoiseSteps / 18)));
  return { kitId: LATENT_GARDEN_KIT_IDS[2], family: "gradientTrellises", readiness: clamp01(.14 + s.denoiseSteps / 90 + (1 - s.loss) * .32), descriptors: rows(n, (i) => ({ id: `gradient-trellis-${i + 1}`, type: "trellis", rung: i + 1, tension: clamp01(.22 + s.denoiseSteps / 110 + (1 - s.loss) * .24), bend: +(unit(s.seed, i + 80) * 2 - 1).toFixed(3) })) };
}
export function createPollenBeeSwarmKit(input = {}) {
  const s = normalizeLatentGardenState(input), n = Math.max(5, Math.min(14, 5 + Math.floor((1 - s.artifactRate) * 5) + Math.floor(s.samples / 20)));
  return { kitId: LATENT_GARDEN_KIT_IDS[3], family: "pollenBees", artifactPressure: clamp01(.18 + s.artifactRate * .74 - s.samples / 240), readiness: clamp01(.2 + (1 - s.artifactRate) * .38 + s.samples / 160), descriptors: rows(n, (i) => ({ id: `pollen-bee-${i + 1}`, type: "pollen-bee", targetBloom: `color-soil-bed-${i % 5 + 1}`, variance: clamp01(s.artifactRate * .45 + unit(s.seed, i + 120) * .35), trailAlpha: clamp01(.22 + s.paletteDiversity * .55) })) };
}
export function createCheckpointHiveKit(input = {}) {
  const s = normalizeLatentGardenState(input), freshness = clamp01(1 - s.checkpointAge / 80), n = Math.max(2, Math.min(7, 2 + Math.floor(s.epochs / 32)));
  return { kitId: LATENT_GARDEN_KIT_IDS[4], family: "checkpointHives", readiness: clamp01(.12 + freshness * .48 + s.epochs / 160), descriptors: rows(n, (i) => ({ id: `checkpoint-hive-${i + 1}`, type: "checkpoint-hive", waxSeal: i ? "backup" : "primary", freshness: +freshness.toFixed(3), stable: freshness > .28 && s.epochs > 0 })) };
}
export function createDawnPollenLedgerKit(input = {}) {
  const s = normalizeLatentGardenState(input), readiness = clamp01(.1 + s.epochs / 120 + s.samples / 140 + (1 - s.artifactRate) * .24 + s.paletteDiversity * .18);
  const missionState = readiness >= .82 ? "pollinated" : readiness >= .58 ? "cross-pollinating" : readiness >= .34 ? "germinating" : "dormant";
  return { kitId: LATENT_GARDEN_KIT_IDS[5], family: "dawnPollenLedger", readiness, missionState, descriptors: [{ id: "dawn-pollen-ledger", type: "ledger", missionState, readiness: +readiness.toFixed(3), note: `${s.selectedPrompt} garden is ${missionState}` }] };
}
export function createLatentGardenPollinationRendererHandoff(input = {}) {
  const descriptors = Array.isArray(input.descriptors) ? input.descriptors : [];
  return { kitId: LATENT_GARDEN_KIT_IDS[6], rendererConsumesDescriptorsOnly: true, ownershipExclusions: [...LATENT_GARDEN_OWNERSHIP_EXCLUSIONS], passId: LATENT_GARDEN_POLLINATION_PASS_ID, readiness: clamp01(input.readiness), artifactPressure: clamp01(input.artifactPressure), missionState: String(input.missionState ?? "dormant"), descriptors: descriptors.map((d) => ({ ...d })) };
}
export function createLatentGardenPollinationReadiness(input = {}) {
  const state = normalizeLatentGardenState(input);
  const groups = { promptSeeds: createPromptSeedPacketKit(state), colorSoilBeds: createColorSoilBedKit(state), gradientTrellises: createGradientTrellisKit(state), pollenBees: createPollenBeeSwarmKit(state), checkpointHives: createCheckpointHiveKit(state), dawnPollenLedger: createDawnPollenLedgerKit(state) };
  const descriptors = Object.values(groups).flatMap((g) => g.descriptors);
  const readiness = clamp01(Object.values(groups).reduce((sum, g) => sum + g.readiness, 0) / 6);
  const artifactPressure = clamp01((groups.pollenBees.artifactPressure + state.artifactRate + state.loss * .35) / 2.35);
  const missionState = readiness >= .82 ? "pollinated" : readiness >= .58 ? "cross-pollinating" : readiness >= .34 ? "germinating" : "dormant";
  const rendererHandoff = createLatentGardenPollinationRendererHandoff({ readiness, artifactPressure, missionState, descriptors });
  return { kitId: LATENT_GARDEN_KIT_IDS[7], passId: LATENT_GARDEN_POLLINATION_PASS_ID, tree: LATENT_GARDEN_POLLINATION_DOMAIN_TREE, state, readiness, artifactPressure, missionState, descriptorCount: descriptors.length, groups, rendererHandoff };
}
export default { NEXUS_ENGINE_MAIN_CDN, LATENT_GARDEN_POLLINATION_PASS_ID, LATENT_GARDEN_POLLINATION_DOMAIN_TREE, LATENT_GARDEN_KIT_IDS, LATENT_GARDEN_OWNERSHIP_EXCLUSIONS, normalizeLatentGardenState, createPromptSeedPacketKit, createColorSoilBedKit, createGradientTrellisKit, createPollenBeeSwarmKit, createCheckpointHiveKit, createDawnPollenLedgerKit, createLatentGardenPollinationReadiness, createLatentGardenPollinationRendererHandoff };
