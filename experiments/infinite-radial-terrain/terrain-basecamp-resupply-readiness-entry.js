import { createTerrainBasecampResupplyReadinessDomainKit } from "../_kits/infinite-radial-terrain/terrain-basecamp-resupply-readiness-kits.js";

const NEXUS_ENGINE_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value, min)));
const round = (value, digits = 3) => Number(n(value).toFixed(digits));

let NexusEngine = null;
try {
  NexusEngine = await import(NEXUS_ENGINE_URL);
} catch (error) {
  console.warn("NexusEngine CDN unavailable; basecamp resupply descriptors remain local", error);
}

const basecampResupplyDomain = createTerrainBasecampResupplyReadinessDomainKit();
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
  const terrainLift = Math.sin(x * 0.0011 + index * 0.44) * 110 + Math.cos(z * 0.0012 - index * 0.31) * 92;
  const height = baseHeight + terrainLift + (tag.includes("ridge") ? 160 : tag.includes("valley") ? -120 : 0);
  const wetnessIndex = clamp(0.12 + Math.abs(Math.sin(x * 0.0014 + z * 0.0007 + index)) * 0.34 + (tag.includes("river") ? 0.28 : 0));
  const channelPotential = clamp(0.16 + wetnessIndex * 0.56 + (tag.includes("cache") ? 0.1 : 0));
  const ruggedness = clamp(tag.includes("ridge") ? 0.72 : tag.includes("landing") ? 0.18 : 0.26 + index * 0.036);
  return {
    tag,
    x: round(x),
    z: round(z),
    height: round(height, 1),
    slope: round(5 + ruggedness * 31, 2),
    climate: { rainfallMmYear: round(460 + wetnessIndex * 860), temperatureC: round(20 - height / 420), snowlineMeters: 1720, vegetationPotential: clamp(0.28 + wetnessIndex * 0.5) },
    hydrology: { flow: { wetnessIndex, channelPotential, flowDirection: { x: round(Math.sin(index * 0.6), 3), z: round(Math.cos(index * 0.6), 3) } }, stream: { streamOrder: Math.floor(channelPotential * 5), drainageDensityKmPerKm2: round(0.8 + channelPotential * 3.8, 2) } },
    landform: { landform: tag.includes("ridge") ? "ridge" : tag.includes("valley") ? "valley" : tag.includes("landing") ? "bench" : "saddle", confidence: round(0.44 + ruggedness * 0.5), terrainRuggedness: ruggedness },
    material: { materialWeights: { bedrock: clamp(0.18 + ruggedness * 0.55), soil: clamp(0.78 - ruggedness * 0.32), wetChannel: wetnessIndex, snow: height > 1720 ? 0.38 : 0.01 }, vegetationMask: clamp(0.24 + wetnessIndex * 0.5), albedoHint: "basecamp-resupply" }
  };
}

function buildResupplyInput(state = {}) {
  const camera = normalizeCamera(state.camera);
  const focus = state.terrainSample ?? state.descriptors?.focus ?? { x: camera.position.x, y: camera.position.y - 160, z: camera.position.z, height: camera.position.y - 160 };
  const focusSample = {
    ...focus,
    tag: "basecamp-focus",
    x: n(focus.x, camera.position.x),
    z: n(focus.z, camera.position.z),
    height: n(focus.height, focus.y ?? camera.position.y - 160),
    slope: n(focus.slope, 10),
    hydrology: focus.hydrology ?? { flow: { wetnessIndex: 0.2, channelPotential: 0.24 }, stream: { streamOrder: 1, drainageDensityKmPerKm2: 1.2 } },
    landform: focus.landform ?? { landform: "bench", confidence: 0.58, terrainRuggedness: 0.22 },
    material: focus.material ?? { materialWeights: { soil: 0.65, bedrock: 0.24, wetChannel: 0.18 }, vegetationMask: 0.36 }
  };
  const yaw = n(camera.yaw);
  const forward = { x: -Math.sin(yaw), z: -Math.cos(yaw) };
  const right = { x: Math.cos(yaw), z: -Math.sin(yaw) };
  const offsets = [
    ["cache-bench", forward.x * 520 - right.x * 160, forward.z * 520 - right.z * 160],
    ["landing-bench", forward.x * 920 + right.x * 360, forward.z * 920 + right.z * 360],
    ["river-cache", forward.x * 1180 - right.x * 520, forward.z * 1180 - right.z * 520],
    ["ridge-bivouac", forward.x * 1500 + right.x * 620, forward.z * 1500 + right.z * 620],
    ["valley-crate", forward.x * 860 - right.x * 960, forward.z * 860 - right.z * 960],
    ["return-landing", -forward.x * 720 + right.x * 180, -forward.z * 720 + right.z * 180],
    ["far-cache", forward.x * 2100, forward.z * 2100]
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
    surveyContract: state.surveyContractReadiness
  };
}

function makeOverlay() {
  const root = document.createElement("section");
  root.id = "terrain-basecamp-resupply-readiness";
  root.dataset.rendererConsumes = "descriptors-only";
  root.setAttribute("aria-label", "Terrain basecamp resupply readiness overlay");
  root.innerHTML = `
    <style>
      #terrain-basecamp-resupply-readiness{position:fixed;right:16px;top:86px;z-index:3;width:min(340px,calc(100vw - 32px));padding:12px 14px;border-radius:18px;background:rgba(4,18,20,.76);color:#effcff;font:12px/1.35 Inter,ui-sans-serif,system-ui,sans-serif;box-shadow:0 18px 70px rgba(0,0,0,.38),inset 0 0 0 1px rgba(125,242,255,.2);pointer-events:none;-webkit-backdrop-filter:blur(14px) saturate(1.24);backdrop-filter:blur(14px) saturate(1.24)}
      #terrain-basecamp-resupply-readiness .title{font-weight:900;color:#7df2ff;letter-spacing:.06em;text-transform:uppercase;margin-bottom:7px}
      #terrain-basecamp-resupply-readiness .meter{height:8px;border-radius:999px;background:rgba(255,255,255,.09);overflow:hidden;margin:6px 0 10px}
      #terrain-basecamp-resupply-readiness .meter i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,rgba(125,242,255,.96),rgba(185,255,207,.96),rgba(255,241,168,.96));width:0%}
      #terrain-basecamp-resupply-readiness .row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:4px 0;border-top:1px solid rgba(255,255,255,.08)}
      #terrain-basecamp-resupply-readiness .muted{color:rgba(239,252,255,.64)}
      #terrain-basecamp-resupply-readiness .danger{color:#ffb199}
    </style>
    <div class="title">Basecamp Resupply</div>
    <div class="meter"><i data-meter></i></div>
    <div data-rows></div>`;
  document.body.append(root);
  return root;
}

function renderOverlay(root, domain) {
  const rows = root.querySelector("[data-rows]");
  const meter = root.querySelector("[data-meter]");
  const handoff = domain?.rendererHandoff?.descriptors ?? {};
  const cache = handoff.basecampSupplyCaches?.[0];
  const zone = handoff.landingZoneCertifications?.[0];
  const weather = handoff.weatherWindowFlags?.[0];
  const fuel = handoff.returnFuelBeacons?.[0];
  const readiness = clamp(domain?.summary?.readiness ?? 0.12);
  meter.style.width = `${Math.round(readiness * 100)}%`;
  rows.innerHTML = [
    ["Cache", cache?.label ?? "searching", cache ? `${Math.round(cache.stock * 100)}%` : "--", cache?.stock < 0.42],
    ["Landing", zone?.status ?? "unknown", zone ? `${Math.round(zone.clearanceMeters)}m` : "--", zone?.status === "unsafe"],
    ["Weather", weather?.window ?? "watch", weather ? `${Math.round(weather.pulse * 100)}%` : "--", weather?.window === "closing"],
    ["Fuel", fuel?.status ?? "unknown", fuel ? `${Math.round(fuel.distanceMeters)}m` : "--", fuel?.status === "red"]
  ].map(([label, value, stat, danger]) => `<div class="row"><span><span class="muted">${label}</span> <span class="${danger ? "danger" : ""}">${value}</span></span><strong>${stat}</strong></div>`).join("");
}

function composeHandoff(base, resupply) {
  const descriptors = { ...(base?.descriptors ?? {}), ...(resupply?.rendererHandoff?.descriptors ?? {}) };
  const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : value ? 1 : 0]));
  counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return {
    id: "infinite-radial-terrain-basecamp-resupply-composed-handoff",
    descriptors,
    counts,
    baseHandoff: clone(base),
    basecampResupplyHandoff: clone(resupply?.rendererHandoff),
    runtime: runtimeDescriptor
  };
}

function patchHost(host, overlay) {
  if (host.__terrainBasecampResupplyPatched) return;
  const originalGetState = host.getState?.bind(host);
  const originalGetRendererHandoff = host.getRendererHandoff?.bind(host);
  let current = null;
  function update() {
    const state = originalGetState?.() ?? {};
    current = basecampResupplyDomain.describe(buildResupplyInput(state));
    renderOverlay(overlay, current);
    requestAnimationFrame(update);
  }
  host.basecampResupplyDomain = basecampResupplyDomain;
  host.getBasecampResupplyReadiness = () => clone(current);
  host.getInfiniteRadialTerrainBasecampResupplyReadiness = () => clone(current);
  host.getBasecampResupplyReadinessTree = () => clone(basecampResupplyDomain.domainTree);
  host.getRendererHandoff = () => composeHandoff(originalGetRendererHandoff?.(), current);
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    return {
      ...state,
      basecampResupplyReadiness: clone(current),
      domain: {
        ...(state.domain ?? {}),
        infiniteRadialTerrainBasecampResupply: clone(current)
      },
      rendererHandoff: composeHandoff(originalGetRendererHandoff?.(), current)
    };
  };
  host.__terrainBasecampResupplyPatched = true;
  document.body.dataset.terrainBasecampResupplyReadiness = "enabled";
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
