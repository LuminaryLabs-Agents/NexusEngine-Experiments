import { createTerrainSurveyContractReadinessDomainKit } from "../_kits/infinite-radial-terrain/terrain-survey-contract-readiness-kits.js";

const NEXUS_ENGINE_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value, min)));
const round = (value, digits = 3) => Number(n(value).toFixed(digits));

let NexusEngine = null;
try {
  NexusEngine = await import(NEXUS_ENGINE_URL);
} catch (error) {
  console.warn("NexusEngine CDN unavailable; survey contract descriptors remain local", error);
}

const surveyContractDomain = createTerrainSurveyContractReadinessDomainKit();
const runtimeDescriptor = {
  source: NEXUS_ENGINE_URL,
  ok: Boolean(NexusEngine),
  exports: NexusEngine ? Object.keys(NexusEngine).slice(0, 24) : []
};

function normalizeCamera(camera = {}) {
  const position = Array.isArray(camera.position)
    ? { x: n(camera.position[0]), y: n(camera.position[1]), z: n(camera.position[2]) }
    : { x: n(camera.position?.x), y: n(camera.position?.y), z: n(camera.position?.z) };
  return { position, yaw: n(camera.yaw), pitch: n(camera.pitch, -0.32) };
}

function makeSyntheticSample(tag, x, z, focus = {}, index = 0) {
  const baseHeight = n(focus.height, focus.y ?? 600);
  const height = baseHeight + Math.sin(x * 0.0014 - z * 0.0011 + index * 0.44) * 150 + index * 18;
  const wetnessIndex = clamp(0.16 + Math.cos(x * 0.0012 + index) * 0.16 + (tag.includes("valley") ? 0.32 : 0));
  const channelPotential = clamp(0.12 + Math.abs(Math.sin(z * 0.0013 + index * 0.3)) * 0.58);
  const ruggedness = clamp(tag.includes("ridge") ? 0.68 : tag.includes("return") ? 0.18 : 0.28 + index * 0.045);
  return {
    tag,
    x: round(x),
    z: round(z),
    height: round(height, 1),
    slope: round(7 + ruggedness * 30, 2),
    climate: { rainfallMmYear: round(520 + wetnessIndex * 780), temperatureC: round(19 - height / 380), snowlineMeters: 1650, vegetationPotential: clamp(0.22 + wetnessIndex * 0.52) },
    hydrology: { flow: { wetnessIndex, channelPotential, flowDirection: { x: round(Math.sin(index), 3), z: round(Math.cos(index), 3) } }, stream: { streamOrder: Math.floor(channelPotential * 5), drainageDensityKmPerKm2: round(0.9 + channelPotential * 3.4, 2) } },
    landform: { landform: tag.includes("ridge") ? "ridge" : tag.includes("valley") ? "valley" : tag.includes("return") ? "bench" : "saddle", confidence: round(0.42 + ruggedness * 0.54), terrainRuggedness: ruggedness },
    material: { materialWeights: { bedrock: clamp(0.22 + ruggedness * 0.52), soil: clamp(0.78 - ruggedness * 0.34), wetChannel: wetnessIndex, snow: height > 1650 ? 0.42 : 0.02 }, vegetationMask: clamp(0.2 + wetnessIndex * 0.5), albedoHint: "survey-contract" }
  };
}

function buildSurveyInput(state = {}) {
  const camera = normalizeCamera(state.camera);
  const focus = state.terrainSample ?? state.descriptors?.focus ?? { x: camera.position.x, y: camera.position.y - 160, z: camera.position.z, height: camera.position.y - 160 };
  const focusSample = {
    ...focus,
    tag: "focus",
    x: n(focus.x, camera.position.x),
    z: n(focus.z, camera.position.z),
    height: n(focus.height, focus.y ?? camera.position.y - 160),
    slope: n(focus.slope, 11),
    hydrology: focus.hydrology ?? { flow: { wetnessIndex: 0.18, channelPotential: 0.2 }, stream: { streamOrder: 1, drainageDensityKmPerKm2: 1.1 } },
    landform: focus.landform ?? { landform: "bench", confidence: 0.56, terrainRuggedness: 0.24 },
    material: focus.material ?? { materialWeights: { soil: 0.62, bedrock: 0.26, wetChannel: 0.16 }, vegetationMask: 0.34 }
  };
  const yaw = n(camera.yaw);
  const forward = { x: -Math.sin(yaw), z: -Math.cos(yaw) };
  const right = { x: Math.cos(yaw), z: -Math.sin(yaw) };
  const offsets = [
    ["ahead-contract", forward.x * 620, forward.z * 620],
    ["ridge-risk", forward.x * 1020 + right.x * 420, forward.z * 1020 + right.z * 420],
    ["valley-payoff", forward.x * 1180 - right.x * 360, forward.z * 1180 - right.z * 360],
    ["left-fork", forward.x * 720 - right.x * 860, forward.z * 720 - right.z * 860],
    ["right-fork", forward.x * 720 + right.x * 860, forward.z * 720 + right.z * 860],
    ["return-bench", -forward.x * 520, -forward.z * 520],
    ["far-survey", forward.x * 1900, forward.z * 1900]
  ];
  const samples = [focusSample, ...offsets.map(([tag, dx, dz], index) => makeSyntheticSample(tag, camera.position.x + dx, camera.position.z + dz, focusSample, index + 1))];
  return {
    time: n(state.frame) / 60,
    camera,
    terrain: state.descriptors ?? { origin: { x: 0, z: 0 }, focus: { x: focusSample.x, y: focusSample.height, z: focusSample.z }, bands: [] },
    terrainSample: focusSample,
    samples,
    visual: state.visualDescriptors,
    expedition: state.expeditionDescriptors,
    wayfinding: state.wayfindingDescriptors
  };
}

function makeOverlay() {
  const root = document.createElement("section");
  root.id = "terrain-survey-contract-readiness";
  root.dataset.rendererConsumes = "descriptors-only";
  root.setAttribute("aria-label", "Terrain survey contract readiness overlay");
  root.innerHTML = `
    <style>
      #terrain-survey-contract-readiness{position:fixed;left:16px;top:86px;z-index:3;width:min(330px,calc(100vw - 32px));padding:12px 14px;border-radius:18px;background:rgba(7,13,20,.74);color:#effcff;font:12px/1.35 Inter,ui-sans-serif,system-ui,sans-serif;box-shadow:0 18px 70px rgba(0,0,0,.38),inset 0 0 0 1px rgba(255,241,168,.2);pointer-events:none;-webkit-backdrop-filter:blur(14px) saturate(1.24);backdrop-filter:blur(14px) saturate(1.24)}
      #terrain-survey-contract-readiness .title{font-weight:900;color:#fff1a8;letter-spacing:.06em;text-transform:uppercase;margin-bottom:7px}
      #terrain-survey-contract-readiness .meter{height:8px;border-radius:999px;background:rgba(255,255,255,.09);overflow:hidden;margin:6px 0 10px}
      #terrain-survey-contract-readiness .meter i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,rgba(125,242,255,.95),rgba(255,241,168,.95));width:0%}
      #terrain-survey-contract-readiness .row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:4px 0;border-top:1px solid rgba(255,255,255,.08)}
      #terrain-survey-contract-readiness .muted{color:rgba(239,252,255,.64)}
      #terrain-survey-contract-readiness .danger{color:#ffb199}
    </style>
    <div class="title">Survey Contract</div>
    <div class="meter"><i data-meter></i></div>
    <div data-rows></div>`;
  document.body.append(root);
  return root;
}

function renderOverlay(root, domain) {
  const rows = root.querySelector("[data-rows]");
  const meter = root.querySelector("[data-meter]");
  const handoff = domain?.rendererHandoff?.descriptors ?? {};
  const activeStep = handoff.surveyContractSteps?.[0];
  const fork = handoff.riskRewardForks?.[0];
  const pledge = handoff.altitudePledgeBands?.[0];
  const compass = handoff.returnConfidenceCompass;
  const completion = clamp((activeStep?.completion ?? 0.1) * 0.62 + (compass?.confidence ?? 0.4) * 0.38);
  meter.style.width = `${Math.round(completion * 100)}%`;
  rows.innerHTML = [
    ["Next", activeStep?.label ?? "survey-step", activeStep ? `${Math.round(activeStep.value * 100)}%` : "--", activeStep?.risk > 0.58],
    ["Fork", fork?.label ?? "hold-course", fork ? `${Math.round(fork.routeBias * 100)}%` : "--", fork?.risk > 0.58],
    ["Altitude", pledge?.status ?? "unknown", pledge ? `${Math.round(pledge.clearanceMeters)}m` : "--", pledge?.status === "broken"],
    ["Return", compass?.status ?? "unknown", compass ? `${Math.round(compass.distanceMeters)}m` : "--", compass?.status === "lost-thread"]
  ].map(([label, value, stat, danger]) => `<div class="row"><span><span class="muted">${label}</span> <span class="${danger ? "danger" : ""}">${value}</span></span><strong>${stat}</strong></div>`).join("");
}

function composeHandoff(base, surveyContract) {
  const descriptors = { ...(base?.descriptors ?? {}), ...(surveyContract?.rendererHandoff?.descriptors ?? {}) };
  const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : value ? 1 : 0]));
  counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return {
    id: "infinite-radial-terrain-survey-contract-composed-handoff",
    descriptors,
    counts,
    baseHandoff: clone(base),
    surveyContractHandoff: clone(surveyContract?.rendererHandoff),
    runtime: runtimeDescriptor
  };
}

function patchHost(host, overlay) {
  if (host.__terrainSurveyContractPatched) return;
  const originalGetState = host.getState?.bind(host);
  const originalGetRendererHandoff = host.getRendererHandoff?.bind(host);
  let current = null;
  function update() {
    const state = originalGetState?.() ?? {};
    current = surveyContractDomain.describe(buildSurveyInput(state));
    renderOverlay(overlay, current);
    requestAnimationFrame(update);
  }
  host.surveyContractDomain = surveyContractDomain;
  host.getSurveyContractReadiness = () => clone(current);
  host.getInfiniteRadialTerrainSurveyContractReadiness = () => clone(current);
  host.getRendererHandoff = () => composeHandoff(originalGetRendererHandoff?.(), current);
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    return {
      ...state,
      surveyContractReadiness: clone(current),
      domain: {
        ...(state.domain ?? {}),
        infiniteRadialTerrainSurveyContract: clone(current)
      },
      rendererHandoff: composeHandoff(originalGetRendererHandoff?.(), current)
    };
  };
  host.__terrainSurveyContractPatched = true;
  update();
}

function waitForHost() {
  const overlay = makeOverlay();
  const tick = () => {
    if (globalThis.GameHost?.getState) {
      patchHost(globalThis.GameHost, overlay);
      return;
    }
    requestAnimationFrame(tick);
  };
  tick();
}

waitForHost();
