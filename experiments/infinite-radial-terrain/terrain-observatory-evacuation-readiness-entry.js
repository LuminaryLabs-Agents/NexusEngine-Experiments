import { createTerrainObservatoryEvacuationReadinessDomainKit } from "../_kits/infinite-radial-terrain/terrain-observatory-evacuation-readiness-kits.js";

const NEXUS_ENGINE_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value, min)));
const round = (value, digits = 3) => Number(n(value).toFixed(digits));

let NexusEngine = null;
try {
  NexusEngine = await import(NEXUS_ENGINE_URL);
} catch (error) {
  console.warn("NexusEngine CDN unavailable; observatory evacuation descriptors remain local", error);
}

const observatoryEvacuationDomain = createTerrainObservatoryEvacuationReadinessDomainKit();
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
  const baseHeight = n(focus.height, focus.y ?? 980);
  const ridgeLift = Math.sin(x * 0.0011 + index * 0.37) * 210 + Math.cos(z * 0.0012 - index * 0.19) * 160;
  const height = baseHeight + ridgeLift + (tag.includes("tower") || tag.includes("observatory") ? 460 : tag.includes("switchback") ? 80 : 140);
  const wet = clamp(0.12 + Math.abs(Math.sin(x * 0.0015 + z * 0.0009 + index)) * 0.32 + (tag.includes("drop") ? -0.08 : 0));
  const snow = clamp(0.16 + Math.max(0, height - 950) / 2600 + (tag.includes("summit") ? 0.18 : 0));
  const ruggedness = clamp(tag.includes("switchback") ? 0.36 : tag.includes("tower") ? 0.72 : 0.28 + index * 0.045);
  return {
    tag,
    x: round(x),
    z: round(z),
    height: round(height, 1),
    slope: round(tag.includes("drop") ? 9 + index : tag.includes("switchback") ? 16 + index : 20 + ruggedness * 25, 2),
    climate: { rainfallMmYear: round(420 + wet * 540), temperatureC: round(7 - height / 380), snowlineMeters: 980, vegetationPotential: clamp(0.42 - snow * 0.22 + wet * 0.14) },
    hydrology: { flow: { wetnessIndex: wet, channelPotential: clamp(wet * 0.86), flowDirection: { x: round(Math.sin(index * 0.6), 3), z: round(Math.cos(index * 0.6), 3) } }, stream: { streamOrder: Math.floor(wet * 5), drainageDensityKmPerKm2: round(0.7 + wet * 3.0, 2) } },
    landform: { landform: tag.includes("tower") || tag.includes("summit") ? "ridge" : tag.includes("drop") ? "bench" : "saddle", confidence: round(0.5 + ruggedness * 0.38), terrainRuggedness: ruggedness },
    material: { materialWeights: { bedrock: clamp(0.24 + ruggedness * 0.46), soil: clamp(0.56 - ruggedness * 0.16), wetChannel: wet, snow }, vegetationMask: clamp(0.26 + wet * 0.22 - snow * 0.1), albedoHint: "observatory-evacuation" }
  };
}

function buildObservatoryInput(state = {}) {
  const camera = normalizeCamera(state.camera);
  const focus = state.terrainSample ?? state.descriptors?.focus ?? { x: camera.position.x, y: camera.position.y - 180, z: camera.position.z, height: camera.position.y - 180 };
  const focusSample = {
    ...focus,
    tag: "observatory-focus",
    x: n(focus.x, camera.position.x),
    z: n(focus.z, camera.position.z),
    height: n(focus.height, focus.y ?? camera.position.y - 180),
    slope: n(focus.slope, 18),
    climate: focus.climate ?? { temperatureC: 1, snowlineMeters: 980, vegetationPotential: 0.26 },
    hydrology: focus.hydrology ?? { flow: { wetnessIndex: 0.26, channelPotential: 0.18 }, stream: { streamOrder: 1, drainageDensityKmPerKm2: 1.2 } },
    landform: focus.landform ?? { landform: "ridge", confidence: 0.64, terrainRuggedness: 0.48 },
    material: focus.material ?? { materialWeights: { soil: 0.4, bedrock: 0.38, wetChannel: 0.18, snow: 0.34 }, vegetationMask: 0.22 }
  };
  const yaw = n(camera.yaw);
  const forward = { x: -Math.sin(yaw), z: -Math.cos(yaw) };
  const right = { x: Math.cos(yaw), z: -Math.sin(yaw) };
  const offsets = [
    ["observatory-crew", forward.x * 700 - right.x * 240, forward.z * 700 - right.z * 240],
    ["weather-tower", forward.x * 1120 + right.x * 340, forward.z * 1120 + right.z * 340],
    ["ridge-switchback", forward.x * 1420 - right.x * 520, forward.z * 1420 - right.z * 520],
    ["supply-drop-bench", forward.x * 980 + right.x * 820, forward.z * 980 + right.z * 820],
    ["summit-radio", forward.x * 1840, forward.z * 1840],
    ["heli-saddle", -forward.x * 820 + right.x * 280, -forward.z * 820 + right.z * 280],
    ["storm-shadow-ridge", forward.x * 2360 - right.x * 900, forward.z * 2360 - right.z * 900]
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
    surveyContract: state.surveyContractReadiness,
    basecampResupply: state.basecampResupplyReadiness,
    avalancheRescue: state.avalancheRescueReadiness
  };
}

function makeOverlay() {
  const root = document.createElement("section");
  root.id = "terrain-observatory-evacuation-readiness";
  root.dataset.rendererConsumes = "descriptors-only";
  root.setAttribute("aria-label", "Terrain observatory evacuation readiness overlay");
  root.innerHTML = `
    <style>
      #terrain-observatory-evacuation-readiness{position:fixed;right:16px;top:398px;z-index:3;width:min(340px,calc(100vw - 32px));padding:12px 14px;border-radius:18px;background:rgba(10,10,24,.78);color:#f8fbff;font:12px/1.35 Inter,ui-sans-serif,system-ui,sans-serif;box-shadow:0 18px 70px rgba(0,0,0,.38),inset 0 0 0 1px rgba(216,230,255,.22);pointer-events:none;-webkit-backdrop-filter:blur(14px) saturate(1.2);backdrop-filter:blur(14px) saturate(1.2)}
      #terrain-observatory-evacuation-readiness .title{font-weight:900;color:#dfe7ff;letter-spacing:.06em;text-transform:uppercase;margin-bottom:7px}
      #terrain-observatory-evacuation-readiness .meter{height:8px;border-radius:999px;background:rgba(255,255,255,.1);overflow:hidden;margin:6px 0 10px}
      #terrain-observatory-evacuation-readiness .meter i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,rgba(154,205,255,.96),rgba(255,239,176,.96),rgba(187,255,207,.96));width:0%}
      #terrain-observatory-evacuation-readiness .row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:4px 0;border-top:1px solid rgba(255,255,255,.08)}
      #terrain-observatory-evacuation-readiness .muted{color:rgba(248,251,255,.62)}
      #terrain-observatory-evacuation-readiness .danger{color:#ffb0a0}
    </style>
    <div class="title">Observatory Evac</div>
    <div class="meter"><i data-meter></i></div>
    <div data-rows></div>`;
  document.body.append(root);
  return root;
}

function renderOverlay(root, domain) {
  const rows = root.querySelector("[data-rows]");
  const meter = root.querySelector("[data-meter]");
  const handoff = domain?.rendererHandoff?.descriptors ?? {};
  const beacon = handoff.observatoryDistressBeacons?.[0];
  const tower = handoff.weatherTowerStabilities?.[0];
  const route = handoff.ridgeSwitchbackRoutes?.[0];
  const heli = handoff.evacHeliWindows?.[0];
  const readiness = clamp(domain?.summary?.readiness ?? 0.08);
  meter.style.width = `${Math.round(readiness * 100)}%`;
  rows.innerHTML = [
    ["Crew", beacon?.status ?? "searching", beacon ? `${Math.round(beacon.urgency * 100)}%` : "--", beacon?.status === "priority-evac"],
    ["Tower", tower?.status ?? "unknown", tower ? `${Math.round(tower.anchorIntegrity * 100)}%` : "--", tower?.status === "evacuate"],
    ["Route", route?.status ?? "unknown", route ? `${Math.round(route.switchbackSafety * 100)}%` : "--", route?.status === "hold-position"],
    ["Heli", heli?.window ?? "watch", heli ? `${Math.round(heli.flightConfidence * 100)}%` : "--", heli?.window === "grounded"]
  ].map(([label, value, stat, danger]) => `<div class="row"><span><span class="muted">${label}</span> <span class="${danger ? "danger" : ""}">${value}</span></span><strong>${stat}</strong></div>`).join("");
}

function composeHandoff(base, observatory) {
  const descriptors = { ...(base?.descriptors ?? {}), ...(observatory?.rendererHandoff?.descriptors ?? {}) };
  const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : value ? 1 : 0]));
  counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return {
    id: "infinite-radial-terrain-observatory-evacuation-composed-handoff",
    descriptors,
    counts,
    baseHandoff: clone(base),
    observatoryEvacuationHandoff: clone(observatory?.rendererHandoff),
    observatoryEvacuationReadiness: clone(observatory),
    runtime: runtimeDescriptor
  };
}

function patchHost(host, overlay) {
  if (host.__terrainObservatoryEvacuationPatched) return;
  const originalGetState = host.getState?.bind(host);
  const originalGetRendererHandoff = host.getRendererHandoff?.bind(host);
  let current = null;
  function update() {
    const state = originalGetState?.() ?? {};
    current = observatoryEvacuationDomain.describe(buildObservatoryInput(state));
    renderOverlay(overlay, current);
    requestAnimationFrame(update);
  }
  host.observatoryEvacuationDomain = observatoryEvacuationDomain;
  host.getObservatoryEvacuationReadiness = () => clone(current);
  host.getInfiniteRadialTerrainObservatoryEvacuationReadiness = () => clone(current);
  host.getObservatoryEvacuationReadinessTree = () => clone(observatoryEvacuationDomain.domainTree);
  host.getRendererHandoff = () => composeHandoff(originalGetRendererHandoff?.(), current);
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    return {
      ...state,
      observatoryEvacuationReadiness: clone(current),
      domain: {
        ...(state.domain ?? {}),
        infiniteRadialTerrainObservatoryEvacuation: clone(current)
      },
      rendererHandoff: composeHandoff(originalGetRendererHandoff?.(), current)
    };
  };
  host.__terrainObservatoryEvacuationPatched = true;
  document.body.dataset.terrainObservatoryEvacuationReadiness = "enabled";
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
