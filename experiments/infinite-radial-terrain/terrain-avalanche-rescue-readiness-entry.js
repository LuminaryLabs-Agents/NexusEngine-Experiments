import { createTerrainAvalancheRescueReadinessDomainKit } from "../_kits/infinite-radial-terrain/terrain-avalanche-rescue-readiness-kits.js";

const NEXUS_ENGINE_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value, min)));
const round = (value, digits = 3) => Number(n(value).toFixed(digits));

let NexusEngine = null;
try {
  NexusEngine = await import(NEXUS_ENGINE_URL);
} catch (error) {
  console.warn("NexusEngine CDN unavailable; avalanche rescue descriptors remain local", error);
}

const avalancheRescueDomain = createTerrainAvalancheRescueReadinessDomainKit();
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
  const baseHeight = n(focus.height, focus.y ?? 820);
  const ridgeLift = Math.sin(x * 0.001 + index * 0.41) * 180 + Math.cos(z * 0.0011 - index * 0.22) * 140;
  const height = baseHeight + ridgeLift + (tag.includes("crown") || tag.includes("ridge") ? 340 : tag.includes("valley") ? -110 : 80);
  const snow = clamp(0.22 + Math.max(0, height - 900) / 2600 + (tag.includes("snow") || tag.includes("crown") ? 0.28 : 0));
  const channelPotential = clamp(0.1 + Math.abs(Math.sin(x * 0.0013 + z * 0.0008 + index)) * 0.28 + (tag.includes("valley") ? 0.22 : 0));
  const ruggedness = clamp(tag.includes("crown") ? 0.86 : tag.includes("shelter") ? 0.38 : 0.32 + index * 0.043);
  return {
    tag,
    x: round(x),
    z: round(z),
    height: round(height, 1),
    slope: round(tag.includes("crown") ? 34 + index : tag.includes("sled") ? 14 + index : 18 + ruggedness * 24, 2),
    climate: { rainfallMmYear: round(360 + channelPotential * 520), temperatureC: round(6 - height / 360), snowlineMeters: 980, vegetationPotential: clamp(0.44 - snow * 0.28 + channelPotential * 0.18) },
    hydrology: { flow: { wetnessIndex: clamp(channelPotential * 0.68), channelPotential, flowDirection: { x: round(Math.sin(index * 0.7), 3), z: round(Math.cos(index * 0.7), 3) } }, stream: { streamOrder: Math.floor(channelPotential * 5), drainageDensityKmPerKm2: round(0.6 + channelPotential * 3.2, 2) } },
    landform: { landform: tag.includes("crown") ? "ridge" : tag.includes("valley") ? "valley" : tag.includes("shelter") ? "saddle" : "bench", confidence: round(0.48 + ruggedness * 0.44), terrainRuggedness: ruggedness },
    material: { materialWeights: { bedrock: clamp(0.2 + ruggedness * 0.44), soil: clamp(0.58 - ruggedness * 0.2), wetChannel: clamp(channelPotential * 0.72), snow }, vegetationMask: clamp(0.24 + channelPotential * 0.28 - snow * 0.12), albedoHint: "avalanche-rescue" }
  };
}

function buildAvalancheInput(state = {}) {
  const camera = normalizeCamera(state.camera);
  const focus = state.terrainSample ?? state.descriptors?.focus ?? { x: camera.position.x, y: camera.position.y - 180, z: camera.position.z, height: camera.position.y - 180 };
  const focusSample = {
    ...focus,
    tag: "rescue-focus",
    x: n(focus.x, camera.position.x),
    z: n(focus.z, camera.position.z),
    height: n(focus.height, focus.y ?? camera.position.y - 180),
    slope: n(focus.slope, 22),
    climate: focus.climate ?? { temperatureC: -4, snowlineMeters: 980, vegetationPotential: 0.22 },
    hydrology: focus.hydrology ?? { flow: { wetnessIndex: 0.18, channelPotential: 0.22 }, stream: { streamOrder: 1, drainageDensityKmPerKm2: 1.1 } },
    landform: focus.landform ?? { landform: "ridge", confidence: 0.62, terrainRuggedness: 0.44 },
    material: focus.material ?? { materialWeights: { soil: 0.42, bedrock: 0.34, wetChannel: 0.16, snow: 0.42 }, vegetationMask: 0.24 }
  };
  const yaw = n(camera.yaw);
  const forward = { x: -Math.sin(yaw), z: -Math.cos(yaw) };
  const right = { x: Math.cos(yaw), z: -Math.sin(yaw) };
  const offsets = [
    ["buried-camp", forward.x * 620 - right.x * 220, forward.z * 620 - right.z * 220],
    ["snowfield-probe", forward.x * 960 + right.x * 300, forward.z * 960 + right.z * 300],
    ["avalanche-crown", forward.x * 1300 - right.x * 480, forward.z * 1300 - right.z * 480],
    ["ridge-shelter", forward.x * 1480 + right.x * 660, forward.z * 1480 + right.z * 660],
    ["sled-valley", forward.x * 880 - right.x * 920, forward.z * 880 - right.z * 920],
    ["medevac-bench", -forward.x * 720 + right.x * 260, -forward.z * 720 + right.z * 260],
    ["far-crown", forward.x * 2200, forward.z * 2200]
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
    wayfinding: state.wayfindingDescriptors,
    surveyContract: state.surveyContractReadiness,
    basecampResupply: state.basecampResupplyReadiness
  };
}

function makeOverlay() {
  const root = document.createElement("section");
  root.id = "terrain-avalanche-rescue-readiness";
  root.dataset.rendererConsumes = "descriptors-only";
  root.setAttribute("aria-label", "Terrain avalanche rescue readiness overlay");
  root.innerHTML = `
    <style>
      #terrain-avalanche-rescue-readiness{position:fixed;right:16px;top:252px;z-index:3;width:min(340px,calc(100vw - 32px));padding:12px 14px;border-radius:18px;background:rgba(8,14,30,.78);color:#f4fbff;font:12px/1.35 Inter,ui-sans-serif,system-ui,sans-serif;box-shadow:0 18px 70px rgba(0,0,0,.38),inset 0 0 0 1px rgba(190,225,255,.22);pointer-events:none;-webkit-backdrop-filter:blur(14px) saturate(1.22);backdrop-filter:blur(14px) saturate(1.22)}
      #terrain-avalanche-rescue-readiness .title{font-weight:900;color:#bee1ff;letter-spacing:.06em;text-transform:uppercase;margin-bottom:7px}
      #terrain-avalanche-rescue-readiness .meter{height:8px;border-radius:999px;background:rgba(255,255,255,.1);overflow:hidden;margin:6px 0 10px}
      #terrain-avalanche-rescue-readiness .meter i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,rgba(190,225,255,.96),rgba(255,244,197,.96),rgba(255,176,160,.96));width:0%}
      #terrain-avalanche-rescue-readiness .row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:4px 0;border-top:1px solid rgba(255,255,255,.08)}
      #terrain-avalanche-rescue-readiness .muted{color:rgba(244,251,255,.64)}
      #terrain-avalanche-rescue-readiness .danger{color:#ffb0a0}
    </style>
    <div class="title">Avalanche Rescue</div>
    <div class="meter"><i data-meter></i></div>
    <div data-rows></div>`;
  document.body.append(root);
  return root;
}

function renderOverlay(root, domain) {
  const rows = root.querySelector("[data-rows]");
  const meter = root.querySelector("[data-meter]");
  const handoff = domain?.rendererHandoff?.descriptors ?? {};
  const camp = handoff.buriedCampTransponders?.[0];
  const crown = handoff.avalancheCrownHazards?.[0];
  const sled = handoff.rescueSledCorridors?.[0];
  const medevac = handoff.medevacBeaconWindows?.[0];
  const readiness = clamp(domain?.summary?.readiness ?? 0.08);
  meter.style.width = `${Math.round(readiness * 100)}%`;
  rows.innerHTML = [
    ["Camp", camp?.label ?? "searching", camp ? `${Math.round(camp.priority * 100)}%` : "--", camp?.priority > 0.68],
    ["Crown", crown?.status ?? "unknown", crown ? `${Math.round(crown.releaseRisk * 100)}%` : "--", crown?.status === "closed"],
    ["Sled", sled?.status ?? "unknown", sled ? `${Math.round(sled.clearance * 100)}%` : "--", sled?.status === "carry-out"],
    ["Medevac", medevac?.window ?? "watch", medevac ? `${Math.round(medevac.weatherConfidence * 100)}%` : "--", medevac?.window === "grounded"]
  ].map(([label, value, stat, danger]) => `<div class="row"><span><span class="muted">${label}</span> <span class="${danger ? "danger" : ""}">${value}</span></span><strong>${stat}</strong></div>`).join("");
}

function composeHandoff(base, rescue) {
  const descriptors = { ...(base?.descriptors ?? {}), ...(rescue?.rendererHandoff?.descriptors ?? {}) };
  const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : value ? 1 : 0]));
  counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return {
    id: "infinite-radial-terrain-avalanche-rescue-composed-handoff",
    descriptors,
    counts,
    baseHandoff: clone(base),
    avalancheRescueHandoff: clone(rescue?.rendererHandoff),
    runtime: runtimeDescriptor
  };
}

function patchHost(host, overlay) {
  if (host.__terrainAvalancheRescuePatched) return;
  const originalGetState = host.getState?.bind(host);
  const originalGetRendererHandoff = host.getRendererHandoff?.bind(host);
  let current = null;
  function update() {
    const state = originalGetState?.() ?? {};
    current = avalancheRescueDomain.describe(buildAvalancheInput(state));
    renderOverlay(overlay, current);
    requestAnimationFrame(update);
  }
  host.avalancheRescueDomain = avalancheRescueDomain;
  host.getAvalancheRescueReadiness = () => clone(current);
  host.getInfiniteRadialTerrainAvalancheRescueReadiness = () => clone(current);
  host.getAvalancheRescueReadinessTree = () => clone(avalancheRescueDomain.domainTree);
  host.getRendererHandoff = () => composeHandoff(originalGetRendererHandoff?.(), current);
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    return {
      ...state,
      avalancheRescueReadiness: clone(current),
      domain: {
        ...(state.domain ?? {}),
        infiniteRadialTerrainAvalancheRescue: clone(current)
      },
      rendererHandoff: composeHandoff(originalGetRendererHandoff?.(), current)
    };
  };
  host.__terrainAvalancheRescuePatched = true;
  document.body.dataset.terrainAvalancheRescueReadiness = "enabled";
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
